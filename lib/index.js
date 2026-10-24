// 本项目由 AI 辅助优化完成（提示词内核、测试与文档），发布前经人工审阅。
// dsh-prompt-generator —— 节点侧（server half）。
// 配置持久化：server half 直接读写 `~/.dsh/prompt-generator-config.json`，
// client 经 webServer HTTP JSON API（get/set）读写。
// 为什么不用 settingsScope/settings 注册：client 侧 settingsScope（loopback host 面）需要
// namespace 事先注册进桌面应用 host 的 settings 注册表（官方插件由 host 内置注册，第三方走
// 市场安装流程注册）；手工装配进 profile 的插件没有该注册，describe 返回 unavailable，
// settingsScope.set 静默失效（实测 status:"unavailable", mode:"host"）。
// 客户端功能全部在 dist/client.js（exports["./client"]）。

// 「会话默认模型」流式通道（零配置）采用 dsh-elf 已验证的宿主服务面：
//   agentDefaultModel.currentSelection() → 当前会话/agent 默认模型（免配置取模型）
//   llm.stream({ provider, model, messages, system }) → 服务端真流式（text-delta/finish）
// 不碰 session.create/fork/prompt：渲染进程无法让后台会话执行生成（fork 子会话不在前台
// 不触发模型），自编 sessionId 会被静默拒绝（实测「永远正在优化」的根因）。

import { readFile, writeFile, mkdir, appendFile, stat, rename } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';

// HTTP JSON API（dsh-elf 方式）：渲染进程用相对路径 fetch 直达宿主 webServer，
// 完全绕开 connection.rpc.call —— desktop 的 rpc.call 在同一流程第二次调用会挂死
// （实测 sessionModel 成功、optimize.start 永不达 server）。
const HTTP_PREFIX = '/dsh-prompt-generator/api';
const MAX_BODY_BYTES = 1 << 20;

const CONFIG_PATH = join(homedir(), '.dsh', 'prompt-generator-config.json');
// 改名迁移：0.3.x 及更早写在 prompt-optimize-config.json，新路径缺失时读旧文件，
// 首次写入后即落到新路径（用户不用重新配置）。
const LEGACY_CONFIG_PATHS = [
  join(homedir(), '.dsh', 'prompt-optimize-config.json'),
  join(homedir(), '.dsh', 'prompt-architect-config.json'),
  join(homedir(), '.dsh', 'prompt-optimizer-config.json'),
];
// 调试日志（诊断宿主流式通道）：只记长度/计数，不落正文。
// 默认开启；超过 2MB 自动轮转一份 .1（旧版无上限，长驻进程会无限增长）；
// 设 DSH_PO_DEBUG=0 可完全关闭。
const DEBUG_LOG = join(homedir(), '.dsh', 'prompt-generator-debug.log');
const DEBUG_LOG_MAX_BYTES = 2 * 1024 * 1024;
const debugEnabled = process.env.DSH_PO_DEBUG !== '0';
let dbgWrites = 0;
async function dbg(...args) {
  if (!debugEnabled) return;
  try {
    dbgWrites += 1;
    if (dbgWrites % 250 === 1) {
      const st = await stat(DEBUG_LOG).catch(() => null);
      if (st && st.size > DEBUG_LOG_MAX_BYTES) {
        await rename(DEBUG_LOG, `${DEBUG_LOG}.1`).catch(() => {});
      }
    }
    await appendFile(DEBUG_LOG, `[${new Date().toISOString()}] ${args.map(String).join(' ')}\n`);
  } catch {
    // 日志失败不影响主流程
  }
}

async function readConfig() {
  for (const path of [CONFIG_PATH, ...LEGACY_CONFIG_PATHS]) {
    try {
      return JSON.parse(await readFile(path, 'utf8'));
    } catch {
      // 继续尝试下一处（新路径不存在 → 旧路径迁移）
    }
  }
  return {};
}

async function writeConfig(config) {
  await mkdir(dirname(CONFIG_PATH), { recursive: true });
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
}

function ok(value) {
  return { ok: true, value };
}

function err(code, details) {
  return { ok: false, error: { code, details } };
}

// ── start+poll 降级协议共用的任务管理 ─────────────────────────────
// 条目在「done 且被 poll 取走」后立即删除；长期无人 poll 的僵尸条目由 sweep 兜底。
// 旧版只增不减，长驻桌面进程下 Map 与全量文本无限累积（内存泄漏）。
const tasks = new Map();
let taskSeq = 0;

function sweepTasks() {
  if (tasks.size <= 64) return;
  for (const [id, entry] of tasks) {
    if (entry.done) tasks.delete(id);
    if (tasks.size <= 64) break;
  }
}

/** 从 llm.stream 的 finish 帧提取错误信息；截断（kind 'length'）单独标注。 */
function finishError(reason) {
  if (!reason || typeof reason !== 'object') return null;
  if (reason.kind === 'error' || reason.kind === 'aborted') {
    return { kind: reason.kind, message: (reason.failure && reason.failure.message) || reason.kind };
  }
  if (reason.kind === 'length') {
    return { kind: 'length', message: 'output truncated by max_tokens' };
  }
  return null;
}

function buildLlmOptions(payload) {
  const options = {
    provider: payload.provider,
    model: payload.model,
    messages: [{ role: 'user', content: [{ type: 'text', text: payload.text }] }],
    system: typeof payload.system === 'string' && payload.system ? payload.system : undefined,
  };
  if (typeof payload.reasoningEffort === 'string' && payload.reasoningEffort) {
    options.reasoningEffort = payload.reasoningEffort;
  }
  return options;
}

/** 参数校验：'no-text' | 'no-model' | null（合法）。RPC 与 HTTP 两个面共用。 */
function validateOptimizeArgs(args) {
  if (typeof args.text !== 'string' || !args.text.trim()) return 'no-text';
  if (typeof args.provider !== 'string' || !args.provider || typeof args.model !== 'string' || !args.model) {
    return 'no-model';
  }
  return null;
}

/** 创建后台流式任务，立即返回 taskId；结果由 optimize.poll 分批取走。 */
function createTask(llm, args) {
  sweepTasks();
  const taskId = `po-${Date.now()}-${taskSeq++}`;
  const entry = { text: '', done: false, error: null, abort: false, pollCount: 0 };
  tasks.set(taskId, entry);
  const options = buildLlmOptions(args);
  (async () => {
    let deltaCount = 0;
    try {
      for await (const chunk of llm.stream(options)) {
        if (entry.abort) break;
        if (chunk.type === 'text-delta') {
          entry.text += chunk.text;
          deltaCount += 1;
        } else if (chunk.type === 'finish') {
          const fe = finishError(chunk.reason);
          if (fe) entry.error = fe.kind === 'length' ? `truncated: ${fe.message}` : fe.message;
          entry.done = true;
        }
      }
      if (!entry.done) entry.done = true;
    } catch (streamError) {
      await dbg('task', taskId, 'THREW:', String((streamError && streamError.message) || streamError));
      entry.error = String((streamError && streamError.message) || streamError);
      entry.done = true;
    }
    await dbg('task', taskId, 'ended deltaCount=' + deltaCount, 'textLen=' + entry.text.length, 'err=' + (entry.error || '-'));
  })();
  return taskId;
}

/** 取任务快照；done 的任务取出后即删除（一次性交付，不残留）。 */
function pollTask(taskId) {
  const entry = tasks.get(taskId);
  if (!entry) return null;
  entry.pollCount += 1;
  if (entry.pollCount % 10 === 1) {
    void dbg('poll', taskId, '#' + entry.pollCount, 'done=' + entry.done, 'textLen=' + entry.text.length);
  }
  const snapshot = { done: entry.done, text: entry.text, error: entry.error };
  if (entry.done) tasks.delete(taskId);
  return snapshot;
}

function abortTask(taskId) {
  const entry = tasks.get(taskId);
  if (entry) entry.abort = true;
}

/** 会话默认模型解析（RPC 与 HTTP 两个面共用）。 */
function currentSessionModel(ctx) {
  const agentDefaultModel = ctx.get('agentDefaultModel');
  if (!agentDefaultModel) {
    return { error: err('no-agent-model', 'agentDefaultModel service unavailable') };
  }
  const sel = agentDefaultModel.currentSelection();
  if (!sel || !sel.model) {
    return { error: err('no-model', 'no current model selected') };
  }
  const value = { provider: sel.provider, model: sel.model };
  if (sel.reasoningEffort !== undefined) value.reasoningEffort = sel.reasoningEffort;
  return { value };
}

/** RPC handler：{ok,value}/{ok:false,error}。endpoint: get | set | sessionModel | optimize.start | optimize.poll | optimize.abort
 *  说明：makeHandler 目前仅由单测驱动（运行时客户端统一走 HTTP API），保留它是为了
 *  让降级协议（start+poll）有独立于浏览器的回归覆盖；两个面共用同一套任务/校验实现，
 *  不再有旧版那种各自复制一份、行为漂移的双实现。 */
export function makeHandler(ctx) {
  return async (endpoint, payload = {}) => {
    try {
      switch (endpoint) {
        case 'get':
          return ok(await readConfig());
        case 'set': {
          const next = { ...(await readConfig()), ...(payload.patch ?? {}) };
          await writeConfig(next);
          return ok(next);
        }
        case 'sessionModel': {
          const model = currentSessionModel(ctx);
          return model.error ?? ok(model.value);
        }
        case 'optimize.start': {
          const llm = ctx.get('llm');
          if (!llm) return err('no-llm', 'llm service unavailable');
          const invalid = validateOptimizeArgs(payload);
          if (invalid) return err(invalid, invalid === 'no-text' ? 'empty text' : 'provider/model required');
          const taskId = createTask(llm, payload);
          await dbg('start', taskId, payload.provider, payload.model, 'textLen=' + payload.text.length);
          return ok({ taskId });
        }
        case 'optimize.poll': {
          const snapshot = typeof payload.taskId === 'string' ? pollTask(payload.taskId) : null;
          if (!snapshot) return err('no-task', 'unknown task');
          return ok(snapshot);
        }
        case 'optimize.abort': {
          if (typeof payload.taskId === 'string') abortTask(payload.taskId);
          return ok(true);
        }
        default:
          return err('unknown', endpoint);
      }
    } catch (error) {
      return err('error', error instanceof Error ? error.message : String(error));
    }
  };
}

async function readJsonBody(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    const buffer = Buffer.from(chunk);
    total += buffer.length;
    if (total > MAX_BODY_BYTES) throw new Error('body too large');
    chunks.push(buffer);
  }
  const text = Buffer.concat(chunks).toString('utf8');
  if (!text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('bad json');
  }
}

function writeJson(res, status, value) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(value));
}

/** HTTP JSON API 路由（dsh-elf 形态）：POST /dsh-prompt-generator/api/<method>
 *  SSE 帧载荷统一为 JSON（delta/reasoning: {"t":...}；error: {"kind":...,"m":...}）：
 *  JSON 自带转义，空格/换行/字面反斜杠都无损——旧版「服务端手工转 \n + 客户端 trim」
 *  的做法会吃掉英文 token 首尾空格、且从不反转义（单词粘连、字面 \n 出厂的根因）。 */
function createApiRoute(getCtx) {
  return async (req, res) => {
    // 方法检查放在读 body 之前：405 不该先把请求体读完（旧版顺序反了）
    if (req.method !== 'POST') {
      writeJson(res, 405, { ok: false, error: { code: 'method', details: 'post only' } });
      return;
    }
    let args = {};
    try {
      args = await readJsonBody(req);
    } catch (error) {
      writeJson(res, 400, { ok: false, error: { code: 'bad-body', details: String((error && error.message) || error) } });
      return;
    }
    const pathname = new URL(req.url || '/', 'http://dsh.internal').pathname;
    const method = pathname.startsWith(HTTP_PREFIX + '/')
      ? decodeURIComponent(pathname.slice(HTTP_PREFIX.length + 1))
      : '';
    if (!method || method.includes('/')) {
      writeJson(res, 404, { ok: false, error: { code: 'unknown', details: 'unknown' } });
      return;
    }
    const ctx = getCtx();
    const llm = ctx.get('llm');
    try {
      switch (method) {
        case 'optimize.stream': {
          // 真流式：SSE 直出。请求保持打开，llm.stream 的每个 text-delta 即时 write，
          // 客户端 fetch + reader 逐 chunk 呈现（逐 token 滚动）。
          if (!llm) {
            writeJson(res, 200, { ok: false, error: { code: 'no-llm', details: 'llm unavailable' } });
            return;
          }
          const invalid = validateOptimizeArgs(args);
          if (invalid) {
            writeJson(res, 200, { ok: false, error: { code: invalid, details: invalid === 'no-text' ? 'empty text' : 'provider/model required' } });
            return;
          }
          const options = buildLlmOptions(args);
          res.writeHead(200, {
            'content-type': 'text/event-stream; charset=utf-8',
            'cache-control': 'no-cache',
            connection: 'keep-alive',
          });
          res.write('event: start\ndata: {}\n\n');
          const sendError = (kind, m) => {
            res.write(`event: error\ndata: ${JSON.stringify({ kind, m: String(m) })}\n\n`);
          };
          let deltaCount = 0;
          try {
            for await (const chunk of llm.stream(options)) {
              if (chunk.type === 'text-delta') {
                deltaCount += 1;
                res.write(`event: delta\ndata: ${JSON.stringify({ t: chunk.text })}\n\n`);
              } else if (chunk.type === 'reasoning-delta' || (chunk.type === 'delta' && chunk.blockType === 'reasoning')) {
                // 推理过程先出：等待期间卡片可见内容滚动
                res.write(`event: reasoning\ndata: ${JSON.stringify({ t: String(chunk.text || '') })}\n\n`);
              } else if (chunk.type === 'finish') {
                const fe = finishError(chunk.reason);
                if (fe) sendError(fe.kind === 'length' ? 'truncated' : fe.kind, fe.message);
                break;
              }
            }
            res.write('event: done\ndata: {}\n\n');
          } catch (error) {
            await dbg('sse', args.provider, args.model, 'THREW:', String((error && error.message) || error));
            sendError('error', (error && error.message) || error);
            res.write('event: done\ndata: {}\n\n');
          } finally {
            await dbg('sse', args.provider, args.model, 'ended deltaCount=' + deltaCount);
            res.end();
          }
          return;
        }
        case 'sessionModel': {
          const model = currentSessionModel(ctx);
          if (model.error) {
            writeJson(res, 200, { ok: false, error: model.error });
            return;
          }
          writeJson(res, 200, { ok: true, value: model.value });
          return;
        }
        case 'optimize.start': {
          if (!llm) {
            writeJson(res, 200, { ok: false, error: { code: 'no-llm', details: 'llm unavailable' } });
            return;
          }
          const invalid = validateOptimizeArgs(args);
          if (invalid) {
            writeJson(res, 200, { ok: false, error: { code: invalid, details: invalid === 'no-text' ? 'empty text' : 'provider/model required' } });
            return;
          }
          const taskId = createTask(llm, args);
          await dbg('http start', taskId, args.provider, args.model, 'textLen=' + args.text.length);
          writeJson(res, 200, { ok: true, value: { taskId } });
          return;
        }
        case 'optimize.poll': {
          const snapshot = typeof args.taskId === 'string' ? pollTask(args.taskId) : null;
          if (!snapshot) {
            writeJson(res, 200, { ok: false, error: { code: 'no-task', details: 'unknown task' } });
            return;
          }
          writeJson(res, 200, { ok: true, value: snapshot });
          return;
        }
        case 'optimize.abort': {
          if (typeof args.taskId === 'string') abortTask(args.taskId);
          writeJson(res, 200, { ok: true, value: true });
          return;
        }
        case 'get': {
          writeJson(res, 200, { ok: true, value: await readConfig() });
          return;
        }
        case 'set': {
          const next = { ...(await readConfig()), ...(args.patch ?? {}) };
          await writeConfig(next);
          writeJson(res, 200, { ok: true, value: next });
          return;
        }
        default:
          writeJson(res, 404, { ok: false, error: { code: 'unknown', details: method } });
      }
    } catch (error) {
      writeJson(res, 500, { ok: false, error: String((error && error.message) || error) });
    }
  };
}

export const name = 'dsh-prompt-generator';

export function apply(ctx) {
  // 不再注入 connection：桌面宿主运行时没有该服务，inject 会让 fiber 永久 PENDING、
  // profile-selection 阶段挂死（实测启动卡死）。所有通道统一走 webServer HTTP API。
  ctx.inject(['webServer'], (webCtx) => {
    webCtx.effect(
      () => webCtx.webServer.register({
        kind: 'prefix',
        path: HTTP_PREFIX,
        handler: createApiRoute(() => ctx),
      }),
      'dsh-prompt-generator: http api',
    );
  });
}
