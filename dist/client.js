window.__ModuleLoader__.load({
  id: "dsh-prompt-architect",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// src/optimizer.ts
var DEFAULT_INTENSITY = "standard";
var INTENSITIES = ["light", "standard", "deep"];
function asIntensity(v) {
  return typeof v === "string" && INTENSITIES.includes(v) ? v : DEFAULT_INTENSITY;
}
var DEFAULTS = {
  baseUrl: "https://api.deepseek.com",
  apiKey: "",
  model: "deepseek-v4-flash",
  useSessionModel: true,
  intensity: DEFAULT_INTENSITY
};
function normalizeBaseUrl(url) {
  return url.trim().replace(/\/+$/, "");
}
function mergeConfig(raw) {
  const baseUrl = typeof raw?.baseUrl === "string" && raw.baseUrl.trim() ? raw.baseUrl.trim() : DEFAULTS.baseUrl;
  const apiKey = typeof raw?.apiKey === "string" ? raw.apiKey : DEFAULTS.apiKey;
  const rawModel = typeof raw?.model === "string" && raw.model.trim() ? raw.model.trim() : DEFAULTS.model;
  const migratedDefault = rawModel === "deepseek-chat" && normalizeBaseUrl(baseUrl) === DEFAULTS.baseUrl ? DEFAULTS.model : rawModel;
  const model = migratedDefault;
  const useSessionModel = typeof raw?.useSessionModel === "boolean" ? raw.useSessionModel : DEFAULTS.useSessionModel;
  const intensity = asIntensity(raw?.intensity);
  return { baseUrl: normalizeBaseUrl(baseUrl), apiKey, model, useSessionModel, intensity };
}
function checkConfig(config) {
  if (!config.apiKey.trim()) return { ok: false, reason: "missing-key" };
  if (!config.useSessionModel && !config.model.trim()) return { ok: false, reason: "missing-model" };
  try {
    const u = new URL(normalizeBaseUrl(config.baseUrl));
    if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error("protocol");
    if (u.search || u.hash) throw new Error("query-or-hash");
  } catch {
    return { ok: false, reason: "bad-url" };
  }
  return { ok: true, config };
}
var ZH_RULES = `你是「提示词架构师」，不是润色器。

用户会给你一段草稿——可能很短、很口语，也可能本身已经很详实甚至啰嗦。你的任务既不是写得更长，也不是写得更短，而是把它**重建为一份能直接驱动另一个 AI 高质量工作的提示词**：关键信息一条不少，冗余一处不留。

## 先判断信息密度（它决定改写幅度）
改写幅度不设固定倍数，由草稿自身的信息量决定。动手前先做一次判定：

- **密集型**（已含「任务目标 / 范围 / 约束 / 期望输出」中的三项及以上）：以**精简去冗**为主。删重复、删口头禅、删自我解释，合并同义句，把含糊处改成可执行表述。产出**可以短于原文**；不要为凑结构而添加空节。
- **稀疏型**（只有一两句意图）：以**适度补齐**为主。只补到「另一个 AI 不用追问就能开工」的程度；仍缺的事实一律留占位，不要编。

两种情形的共同底线：改写后的信息量**不得少于**原文，也不得明显多于「原文信息 + 必要补齐」。改写的目的是让模型少消耗理解成本，不是让它读得更累。

## 你必须做的五件事
1. 提取关键信息：先识别草稿里的目标、范围（做什么 / 不做什么）、约束条件、期望输出。
2. 还原意图：判断用户真正想要的**结果**，而不是他字面上的动作。
3. 补齐或去冗：稀疏则补隐含前提与步骤顺序；密集则删冗余、消歧义、去口语化。
4. 加强约束：把「好一点」「专业一点」换成可执行的硬性条件与禁止项。
5. 定义完成：给出可逐条核对的验收标准（数量、字段、长度、判据）。

## 七条铁律
R1 意图保真 —— 不得改变「要做什么」；提问仍是提问，命令仍是命令。可以补充，不能替换。
R2 不编造事实 —— 草稿中没有的事实、数字、日期、文件名、人名、链接，一律不得新增。必须用到而草稿缺失时，写成 <待补充：…> 占位，并在「待确认」小节列出。
R3 幅度随密度 —— 不设固定扩写倍数。按上文判定：密集型以精简去冗为主（可短于原文），稀疏型适度补齐。要同时避免两种失误：①把已经写清楚的需求再撑大一圈；②把只有一句意图的草稿原样搬运一遍就当完成。
R4 量化优先 —— 用「不超过 300 字」「至少 3 条」「必须包含 A/B/C」替代「简洁」「详细」「专业」这类形容词。
R5 负向约束 —— 关键限制用「禁止 / 不得 / 不要」表述，它比「尽量」更能约束模型。
R6 单一产物与输出形态 —— 只输出提示词正文：不要解释、不要前后语、不要「优化后的提示词：」这类引导语、不要代码块围栏。正文必须是可直接发送的纯文本：换行用真实换行，不得出现字面的 \\n、\\t、\\r；分节用「目标：」这类短标签或 1. 2. 编号，不得使用 # 标题符号（草稿明确要求产出 Markdown 文档时除外）；避免用 ** 加粗堆层级，纯文本里它只是噪声。
R7 信息守恒 —— 四类关键信息必须完整保留且可定位：①任务目标 ②范围（做 / 不做）③约束条件 ④期望输出。原文有的，改写后必须仍在；原文没有的，在「待确认」里显式提出。任何一项丢失都算失败。

## 输出骨架（按密度裁剪，不是强制清单）
- **稀疏型**：按下列顺序补齐。
- **密集型**：允许合并相邻小节（例如把「角色」并入开头一句、把「背景与已知」并入「目标」），确实无内容的节直接不写。

无论怎么裁剪，承载 ①任务目标 ②约束条件 ③期望输出 的段落必须存在且一眼能找到；范围信息可并入「目标」或「硬性约束」。

1. 角色 —— 你要扮演谁，具备什么立场与专业度
2. 目标 —— 一句话说清最终交付什么
3. 背景与已知 —— 只写草稿给出的信息，以及由它直接推出的必要前提
4. 任务分解 —— 编号步骤，动词开头，可执行
5. 硬性约束 —— 「必须 / 禁止」逐条列出
6. 输出格式 —— 结构、字段、长度、语气
7. 验收标准 —— 怎样算完成，可逐条打勾
8. 失败模式与自检 —— 最容易出错的 2~3 种情况 + 提交前自检清单
9. 待确认 —— 草稿缺失但影响结果的关键信息（没有则省略本节）

## 反模式（禁止产出）
BAD（信息不足却只改措辞）：「帮我写个报告」→「请撰写一份专业、高质量的报告。」
GOOD：补出读者与用途、必含章节、每节字数、禁止编造数据、交付为 Markdown 且不超过 1200 字。

BAD（信息已足够却继续堆砌）：原文已写清目标、范围、约束与交付格式，仍套满九节、把同一要求说三遍、再补一串「请确保高质量」。
GOOD：保留全部关键信息，删掉重复与客套，把它压成更短、更可执行的版本——篇幅低于原文也完全没问题。`;
var ZH_MEMORY_HEAD = `## 用户长期偏好（来自历史采纳记录，优先遵守）`;
var ZH_EXAMPLES_HEAD = `## 最近被采纳的样例（学习结构与颗粒度，禁止照抄内容）`;
var ZH_SESSION_HEAD = `## 本会话最近草稿（仅用于理解当前语境，不要直接引用其措辞）`;
var ZH_LIGHT = `

## 本次强度：轻改
只做最小必要改动，保持草稿原有的句式与体量。若原文已详实：删冗余、把含糊处量化，不新增小节。若原文过简：只补「输出格式」与「一条验收标准」，不要展开成多段骨架。任何情况下都不许丢信息。`;
var ZH_DEEP = `

## 本次强度：深度
深度不等于更长，别用篇幅冒充充分。①稀疏型：任务分解每一步标注 输入 / 产出 / 通过判据；②密集型：**不增节**，改为在末尾输出一张「信息核对表」，逐条确认 目标 / 范围 / 约束 / 期望输出 是否都还在、落在哪一节；③失败模式至少 3 条，每条给出对应自检动作；④不为了显得完整而加示例——只有当示例能消除歧义时才加。`;
var EN_RULES = `You are a PROMPT ARCHITECT, not a polisher.

The user gives you a draft — possibly very short and colloquial, or already detailed and even verbose. Your job is neither to lengthen it nor to shorten it. It is to REBUILD it into a prompt that can reliably drive another AI to high-quality work: not one key fact lost, not one redundancy kept.

## First, judge information density (it decides how much to change)
There is no fixed expansion ratio; the draft's own information content sets the amplitude. Judge before writing:

- **Dense** (already contains three or more of: task goal / scope / constraints / expected output): prioritise **condensing**. Remove repetition, filler, and self-explanation; merge synonymous sentences; turn vague wording into executable phrasing. The result **may be shorter than the draft**. Never add empty sections just to fill the skeleton.
- **Sparse** (one or two sentences of intent): prioritise **targeted completion**. Add only enough for another AI to start without asking follow-ups; anything still unknown stays as a placeholder — never invent it.

Shared floor: the rewrite must carry **no less** information than the draft, and not noticeably more than "draft information + necessary completion". The point is to lower the model's comprehension cost, not raise it.

## What you must do
1. Extract key facts first: identify goal, scope (do / do not do), constraints, expected output in the draft.
2. Recover intent: infer the RESULT the user actually wants, not the literal action.
3. Complete or condense: sparse -> add implicit premises and step order; dense -> cut redundancy, resolve ambiguity, drop colloquialism.
4. Harden constraints: replace "make it good/professional" with executable conditions and prohibitions.
5. Define done: give checkable acceptance criteria (counts, fields, lengths, thresholds).

## Seven hard rules
R1 INTENT FIDELITY — never change WHAT is being asked. A question stays a question, a command stays a command. Add, never replace.
R2 NO FABRICATION — never invent facts, numbers, dates, filenames, people, or links absent from the draft. When something essential is missing, emit a <TO FILL: ...> placeholder and list it under "Open Questions".
R3 AMPLITUDE FOLLOWS DENSITY — no fixed expansion ratio. Condense when dense (shorter than the draft is fine); complete sparingly when sparse. Avoid both failures: inflating an already-clear brief, and parroting a one-line request back unchanged.
R4 QUANTIFY — prefer "at most 300 words", "at least 3 items", "must include A/B/C" over adjectives like "concise" or "professional".
R5 NEGATIVE CONSTRAINTS — state critical limits as "must not / never", which binds models harder than "try to".
R6 SINGLE ARTIFACT & PLAIN TEXT — output the prompt body only: no explanation, no preamble, no "Here is the optimized prompt:", no code fences. The body must be plain text you could send as-is: real newlines instead of escaped newline/tab sequences, no backslash escapes standing in for whitespace; section with short labels like "Goal:" or numbered lines, not # headings (unless the draft explicitly asks for a Markdown deliverable); don't stack ** bold just to fake hierarchy — in plain text it is only noise.
R7 INFORMATION CONSERVATION — four key elements must survive and remain locatable: (1) task goal, (2) scope, (3) constraints, (4) expected output. If the draft had them, the rewrite must still have them; if the draft lacked them, raise them under "Open Questions". Losing any one is a failure.

## Output skeleton (trim by density; not a mandatory checklist)
- **Sparse**: fill the sections in order.
- **Dense**: merge adjacent sections (e.g. fold "Role" into the opening sentence, fold "Context & Knowns" into "Goal") and simply omit sections with no content.

However you trim, the parts carrying (1) task goal, (2) constraints, (3) expected output must exist and be findable at a glance; scope may live under "Goal" or "Hard Constraints".

1. Role — who the model is and with what stance/expertise
2. Goal — one sentence on the final deliverable
3. Context & Knowns — only what the draft states, plus premises that follow directly
4. Task Breakdown — numbered, verb-first, executable
5. Hard Constraints — "must / must not", itemized
6. Output Format — structure, fields, length, tone
7. Acceptance Criteria — how "done" is verified, ideally checkable
8. Failure Modes & Self-check — the 2-3 most likely failure modes plus a pre-submit checklist
9. Open Questions — information missing from the draft that affects the result (omit if none)

## Anti-patterns (never produce these)
BAD (sparse input, wording-only "fix"): "write a report" -> "Please write a professional, high-quality report."
GOOD: add audience and purpose, required sections, per-section length, a ban on fabricated data, "mark uncertain items as TO VERIFY", and deliverable = Markdown, <= 1200 words.

BAD (dense input, still padding): the draft already states goal, scope, constraints and output format, yet you run the full nine sections, repeat the same requirement three times, and append "ensure high quality".
GOOD: keep every key fact, delete repetition and pleasantries, and compress it into a shorter, more executable version — being shorter than the draft is perfectly fine.`;
var EN_MEMORY_HEAD = `## Long-term user preferences (learned from accepted history — obey first)`;
var EN_EXAMPLES_HEAD = `## Recently accepted samples (learn their structure and granularity; never copy the content)`;
var EN_SESSION_HEAD = `## Recent drafts in this session (context only — do not quote their wording)`;
var EN_LIGHT = `

## Intensity for this run: light
Make the minimum necessary change and keep the draft's own sentence shape and size. If the draft is already detailed: cut redundancy and quantify vague wording — add no new sections. If the draft is thin: add only "Output Format" and one acceptance criterion; do not expand into the full skeleton. Never lose information either way.`;
var EN_DEEP = `

## Intensity for this run: deep
Deep does not mean longer — never use length as a stand-in for rigour. (1) Sparse drafts: every step in "Task Breakdown" states input / output / pass criterion. (2) Dense drafts: **add no sections**; instead append an "Information Check" table confirming that goal / scope / constraints / expected output all survived and where each now lives. (3) At least 3 failure modes, each with a matching self-check action. (4) Never add examples just to look complete — only when an example removes real ambiguity.`;
function memoryBlock(lang, ctx) {
  const parts = [];
  const profile = (ctx.profile ?? "").trim();
  if (profile) parts.push(`${lang === "zh" ? ZH_MEMORY_HEAD : EN_MEMORY_HEAD}
${profile.slice(0, 1200)}`);
  const examples = (ctx.examples ?? []).filter((e) => e && e.draft && e.result).slice(0, 3);
  if (examples.length) {
    const blocks = examples.map(
      (e, i) => `### ${lang === "zh" ? `样例 ${i + 1}` : `Sample ${i + 1}`}
${lang === "zh" ? "草稿" : "Draft"}: ${e.draft.slice(0, 300)}
${lang === "zh" ? "采纳结果（节选）" : "Accepted result (excerpt)"}:
${e.result.slice(0, 700)}`
    );
    parts.push(`${lang === "zh" ? ZH_EXAMPLES_HEAD : EN_EXAMPLES_HEAD}
${blocks.join("\n\n")}`);
  }
  const drafts = (ctx.recentDrafts ?? []).filter(Boolean).slice(-5);
  if (drafts.length) {
    parts.push(
      `${lang === "zh" ? ZH_SESSION_HEAD : EN_SESSION_HEAD}
` + drafts.map((d) => `- ${d.slice(0, 160)}`).join("\n")
    );
  }
  return parts.join("\n\n");
}
function buildSystemPrompt(lang, ctx = {}) {
  const intensity = ctx.intensity ?? DEFAULT_INTENSITY;
  const base = lang === "zh" ? ZH_RULES : EN_RULES;
  const tail = intensity === "light" ? lang === "zh" ? ZH_LIGHT : EN_LIGHT : intensity === "deep" ? lang === "zh" ? ZH_DEEP : EN_DEEP : "";
  const memory = memoryBlock(lang, ctx);
  return memory ? `${base}${tail}

---

${memory}` : `${base}${tail}`;
}
function buildRequestBody(config, text, lang, stream = false, system, ctx = {}) {
  return {
    model: config.model,
    messages: [
      { role: "system", content: system ?? buildSystemPrompt(lang, ctx) },
      { role: "user", content: text }
    ],
    // 重写任务需要稳定复现：0.7 会引入不必要的措辞漂移，且容易「自由发挥」补事实
    temperature: 0.35,
    max_tokens: 4096,
    stream
  };
}
function normalizePromptText(raw) {
  let s = raw ?? "";
  const realBreaks = (s.match(/\n/g) ?? []).length;
  const literalBreaks = (s.match(/\\r\\n|\\n/g) ?? []).length;
  if (literalBreaks >= 3 && realBreaks <= literalBreaks / 4) {
    s = s.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\\t/g, "  ");
  }
  s = s.replace(/^#+(?=[^\s#])/gm, "");
  return s;
}
function stripLeadIn(text) {
  let s = normalizePromptText(text).trim();
  s = s.replace(/^优化(?:后|过的|后的)?[ \t]*(?:提示词|Prompt|prompt|内容|结果|指令)(?:如下)?[ \t]*[\s：:][ \t]*/u, "").trim();
  s = s.replace(/^(?:Optimized|Rewritten|Refined)\s+(?:prompt|instruction|content|result|draft)[\s：:][ \t]*/iu, "").trim();
  return s;
}
function extractResult(raw) {
  let s = raw.trim();
  const fence = /^```[a-zA-Z0-9_+-]*\n([\s\S]*?)\n?```$/;
  const matched = s.match(fence);
  if (matched) s = matched[1].trim();
  return stripLeadIn(s);
}
var OptimizeError = class extends Error {
  constructor(kind, message) {
    super(message);
    __publicField(this, "kind", kind);
    this.name = "OptimizeError";
  }
};
var REQUEST_TIMEOUT_MS = 6e4;
function extractSseFinishReason(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return null;
  const data = trimmed.slice("data:".length).trim();
  if (data === "[DONE]") return null;
  let payload;
  try {
    payload = JSON.parse(data);
  } catch {
    return null;
  }
  if (typeof payload !== "object" || payload === null) return null;
  const choices = payload.choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;
  const fr = choices[0].finish_reason;
  return typeof fr === "string" ? fr : null;
}
function toErrorKind(e) {
  if (e instanceof OptimizeError) return e;
  const isAbort = typeof DOMException !== "undefined" && e instanceof DOMException && e.name === "AbortError" || e instanceof Error && e.name === "AbortError";
  if (isAbort) return new OptimizeError("timeout", "request aborted");
  if (e instanceof TypeError) {
    const m = String(e.message ?? "");
    if (/cors/i.test(m)) return new OptimizeError("cors", m);
    return new OptimizeError("network", m || "network error");
  }
  return new OptimizeError("network", String(e?.message ?? e));
}
function extractSseDelta(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return null;
  const data = trimmed.slice("data:".length).trim();
  if (data === "[DONE]") return null;
  let payload;
  try {
    payload = JSON.parse(data);
  } catch {
    return null;
  }
  if (typeof payload !== "object" || payload === null) return null;
  const choices = payload.choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;
  const first = choices[0];
  const delta = first?.delta;
  if (typeof delta?.content === "string") return { kind: "content", text: delta.content };
  if (typeof delta?.reasoning_content === "string") return { kind: "reasoning", text: delta.reasoning_content };
  return null;
}
async function optimizeStream(opts) {
  const { config, text, lang, signal, onEvent, system, memory } = opts;
  const check = checkConfig(config);
  if (!check.ok) throw new OptimizeError("config", check.reason);
  let res;
  try {
    res = await fetch(`${normalizeBaseUrl(config.baseUrl)}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`
      },
      body: JSON.stringify(buildRequestBody(config, text, lang, true, system, memory ?? {})),
      signal
    });
  } catch (e) {
    throw toErrorKind(e);
  }
  if (res.status === 401) throw new OptimizeError("unauthorized", `HTTP 401`);
  if (res.status === 403) throw new OptimizeError("forbidden", `HTTP 403`);
  if (!res.ok) throw new OptimizeError("http", `HTTP ${res.status}`);
  if (!res.body) throw new OptimizeError("bad-response", "missing response body");
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";
  let truncated = false;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const delta = extractSseDelta(line);
        if (delta !== null) {
          onEvent?.(delta);
          if (delta.kind === "content") full += delta.text;
        }
        if (extractSseFinishReason(line) === "length") truncated = true;
      }
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
    }
  }
  if (buffer.trim()) {
    const delta = extractSseDelta(buffer);
    if (delta !== null) {
      onEvent?.(delta);
      if (delta.kind === "content") full += delta.text;
    }
    if (extractSseFinishReason(buffer) === "length") truncated = true;
  }
  if (truncated) throw new OptimizeError("truncated", "output truncated by max_tokens");
  const content = extractResult(full);
  if (!content.trim()) throw new OptimizeError("empty", "empty completion");
  return content;
}

// src/locales.ts
var NS = "prompt_optimizer";
var zh = {
  "button.aria": "优化 prompt",
  "card.title": "优化结果",
  "card.replace": "替换草稿",
  "card.copy": "复制",
  "card.copyDone": "已复制",
  "card.retry": "重新优化",
  "card.dismiss": "放弃",
  "card.optimizing": "正在优化…",
  "card.configured.hint": "已配置 · 模型 {model}",
  "card.unconfigured.hint": "未配置 API",
  "guide.title": "请先配置 API",
  "guide.desc": "前往 设置 → 通用设置 → Prompt 优化，填写接口地址、API Key 与模型名。",
  "guide.action": "去设置",
  "guide.dismiss": "知道了",
  "error.unauthorized": "API Key 无效或已过期",
  "error.forbidden": "服务拒绝访问（403）",
  "error.timeout": "请求超时，请检查网络与接口地址",
  "error.network": "网络错误，请检查网络与接口地址",
  "error.cors": "接口不支持跨域，请换用支持 CORS 的网关",
  "error.http": "请求失败（HTTP 错误）",
  "error.bad-response": "返回内容格式异常",
  "error.empty": "返回内容为空，请重试",
  "error.truncated": "输出被长度上限截断，请缩短草稿后重试",
  "error.config": "配置不完整，请到设置中检查",
  "settings.title": "Prompt 优化",
  "settings.desc": "配置重写接口（OpenAI 兼容）；Key 明文保存在本地",
  "settings.aiNotice": "AI 辅助优化：提示词内核与测试由 AI 生成，经人工审阅后发布",
  "settings.baseUrl": "接口地址",
  "settings.apiKey": "API Key",
  "settings.model": "模型名",
  "settings.useSessionModel": "使用当前会话模型",
  "settings.useSessionModelHint": "开启时优化请求跟随会话模型；关闭后使用下方自定义模型名",
  "settings.intensity": "优化强度",
  "settings.intensityHint": "轻改=最小改动；标准=九段骨架；深度=步骤判据与失败模式",
  "intensity.light": "轻改",
  "intensity.standard": "标准",
  "intensity.deep": "深度",
  "settings.sessionModelEnabled": "已选择会话默认模型",
  "settings.hostProbe": "宿主通道探测中…",
  "settings.hostOk": "会话模型通道 ✓",
  "settings.hostFail": "会话模型通道不可用：",
  "settings.save": "保存",
  "settings.reset": "恢复默认",
  "settings.saved": "已保存",
  "settings.saveFailed": "保存失败",
  "settings.resetFailed": "重置失败"
};
var en = {
  "button.aria": "Optimize prompt",
  "card.title": "Optimized prompt",
  "card.replace": "Use draft",
  "card.copy": "Copy",
  "card.copyDone": "Copied",
  "card.retry": "Retry",
  "card.dismiss": "Dismiss",
  "card.optimizing": "Optimizing…",
  "card.configured.hint": "Configured · model {model}",
  "card.unconfigured.hint": "No API configured",
  "guide.title": "Configure the API first",
  "guide.desc": "Go to Settings → General → Prompt Optimizer and fill in the endpoint, API key, and model.",
  "guide.action": "Go to settings",
  "guide.dismiss": "Got it",
  "error.unauthorized": "API key is invalid or expired",
  "error.forbidden": "Access forbidden (403)",
  "error.timeout": "Request timed out; check your network and endpoint",
  "error.network": "Network error; check your network and endpoint",
  "error.cors": "Endpoint blocks CORS; use a gateway that allows it",
  "error.http": "Request failed (HTTP error)",
  "error.bad-response": "Unexpected response format",
  "error.empty": "Empty result; please retry",
  "error.truncated": "Output hit the length limit and was truncated; shorten the draft and retry",
  "error.config": "Incomplete configuration; check settings",
  "settings.title": "Prompt Optimizer",
  "settings.desc": "Configure the rewrite endpoint (OpenAI-compatible); key is stored locally in plain text",
  "settings.aiNotice": "AI-assisted: prompt kernel and tests were AI-generated, then human-reviewed before release",
  "settings.baseUrl": "Base URL",
  "settings.apiKey": "API Key",
  "settings.model": "Model",
  "settings.useSessionModel": "Use current session model",
  "settings.useSessionModelHint": "When on, optimization requests follow the session model; when off, the custom model below is used",
  "settings.intensity": "Intensity",
  "settings.intensityHint": "Light = minimal edits; Standard = full skeleton; Deep = step criteria and failure modes",
  "intensity.light": "Light",
  "intensity.standard": "Standard",
  "intensity.deep": "Deep",
  "settings.sessionModelEnabled": "Session default model selected",
  "settings.hostProbe": "probing host channel…",
  "settings.hostOk": "session model channel ✓",
  "settings.hostFail": "session model channel unavailable: ",
  "settings.save": "Save",
  "settings.reset": "Reset to defaults",
  "settings.saved": "Saved",
  "settings.saveFailed": "Save failed",
  "settings.resetFailed": "Reset failed"
};
function langOf(active) {
  return typeof active === "string" && active.toLowerCase().startsWith("zh") ? "zh" : "en";
}

// src/events.ts
var optimizeRequestListeners = /* @__PURE__ */ new Set();
function onOptimizeRequest(fn) {
  optimizeRequestListeners.add(fn);
  return () => optimizeRequestListeners.delete(fn);
}
function emitOptimizeRequest() {
  for (const fn of optimizeRequestListeners) fn();
}
var openSettingsListeners = /* @__PURE__ */ new Set();
function onOpenSettingsRequest(fn) {
  openSettingsListeners.add(fn);
  return () => openSettingsListeners.delete(fn);
}
function emitOpenSettingsRequest() {
  for (const fn of openSettingsListeners) fn();
}

// src/OptimizeButton.tsx
var import_react = __toESM(require("react"), 1);

// src/session-optimizer.ts
async function callHost(method, args) {
  const response = await fetch(`/dsh-prompt-architect/api/${encodeURIComponent(method)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(args)
  });
  return await response.json();
}
function withTimeout(promise, ms, label) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label}-timeout`)), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}
var DEFAULT_TIMEOUT_MS = 12e4;
var DEFAULT_RPC_TIMEOUT_MS = 5e3;
function callRpc(rpc, endpoint, payload, ms) {
  return withTimeout(
    rpc.call(endpoint, payload),
    ms,
    endpoint
  );
}
async function resolveHostSessionModel(rpc, rpcTimeoutMs = DEFAULT_RPC_TIMEOUT_MS) {
  try {
    const res = await callRpc(rpc, "sessionModel", {}, rpcTimeoutMs);
    if (!res.ok || !res.value || typeof res.value !== "object") return null;
    const v = res.value;
    if (typeof v.provider !== "string" || typeof v.model !== "string") return null;
    const info = { provider: v.provider, model: v.model };
    if (typeof res.value.reasoningEffort === "string") {
      info.reasoningEffort = res.value.reasoningEffort;
    }
    return info;
  } catch {
    return null;
  }
}
async function readSseFrames(response, onFrame) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("no-stream");
  const decoder = new TextDecoder();
  let buffer = "";
  for (; ; ) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    for (; ; ) {
      const idx = buffer.indexOf("\n\n");
      if (idx === -1) break;
      const frame = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      let event = "message";
      let data = "";
      for (const line of frame.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) {
          let d = line.slice(5);
          if (d.startsWith(" ")) d = d.slice(1);
          data = d;
        }
      }
      onFrame(event, data);
    }
  }
}
async function streamHostOptimize(opts) {
  const { rpc, text, system, signal, onDelta, onReasoning, onStep } = opts;
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  if (signal.aborted) throw new Error("aborted");
  onStep?.("model");
  const session = await resolveHostSessionModel(rpc, opts.rpcTimeoutMs ?? DEFAULT_RPC_TIMEOUT_MS);
  if (!session) throw new Error("host-unavailable");
  onStep?.("start");
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  signal.addEventListener("abort", onAbort);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let out = "";
  try {
    const response = await fetch("/dsh-prompt-architect/api/optimize.stream", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        provider: session.provider,
        model: session.model,
        text,
        system,
        ...session.reasoningEffort ? { reasoningEffort: session.reasoningEffort } : {}
      }),
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`http-${response.status}`);
    onStep?.("poll");
    let reasoning = "";
    let streamError = null;
    await readSseFrames(response, (event, data) => {
      if (event === "error") {
        let kind = "error";
        let message = data;
        try {
          const parsed = JSON.parse(data);
          if (typeof parsed.m === "string" && parsed.m) message = parsed.m;
          if (parsed.kind === "truncated") kind = "truncated";
        } catch {
        }
        streamError = { kind, message };
        return;
      }
      if (data === "{}" || data === "[DONE]") return;
      if (event === "reasoning" || event === "delta") {
        let piece = data;
        try {
          const parsed = JSON.parse(data);
          if (typeof parsed.t === "string") piece = parsed.t;
        } catch {
        }
        if (event === "reasoning") {
          reasoning += piece;
          onReasoning?.(reasoning);
        } else {
          out += piece;
          onDelta(out);
        }
      }
    });
    if (signal.aborted) throw new Error("aborted");
    if (streamError) {
      throw streamError.kind === "truncated" ? new OptimizeError("truncated", streamError.message) : new OptimizeError("bad-response", streamError.message);
    }
    return out;
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener("abort", onAbort);
  }
}

// src/memory.ts
var KEY = "dsh-prompt-architect.memory.v1";
var LEGACY_KEY = "dsh-prompt-optimizer.memory.v1";
var MAX_ACCEPTED = 12;
var MAX_REJECTED = 8;
var MAX_SESSION_DRAFTS = 10;
var REFLECT_EVERY = 3;
function empty() {
  return {
    version: 1,
    profile: "",
    accepted: [],
    rejected: [],
    sessionDrafts: {},
    stats: { accepted: 0, rejected: 0, acceptedSinceReflect: 0 }
  };
}
function storage() {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage;
  } catch {
    return null;
  }
}
function asSamples(v) {
  if (!Array.isArray(v)) return [];
  return v.filter(
    (x) => x !== null && typeof x === "object" && typeof x.draft === "string" && x.draft.length > 0 && typeof x.result === "string" && x.result.length > 0
  );
}
function asDraftMap(v) {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return {};
  const out = {};
  for (const [k, list] of Object.entries(v)) {
    if (!Array.isArray(list)) continue;
    const strs = list.filter((d) => typeof d === "string" && d.length > 0);
    if (strs.length) out[k] = strs.slice(-MAX_SESSION_DRAFTS);
  }
  return out;
}
function loadMemory() {
  const s = storage();
  if (!s) return empty();
  try {
    let raw = s.getItem(KEY);
    if (!raw) {
      const legacy = s.getItem(LEGACY_KEY);
      if (legacy) {
        raw = legacy;
        try {
          s.setItem(KEY, legacy);
          s.removeItem(LEGACY_KEY);
        } catch {
        }
      }
    }
    if (!raw) return empty();
    const parsed = JSON.parse(raw);
    const base = empty();
    return {
      ...base,
      profile: typeof parsed.profile === "string" ? parsed.profile : "",
      accepted: asSamples(parsed.accepted).slice(0, MAX_ACCEPTED),
      rejected: asSamples(parsed.rejected).slice(0, MAX_REJECTED),
      sessionDrafts: asDraftMap(parsed.sessionDrafts),
      stats: {
        accepted: Number(parsed.stats?.accepted) || 0,
        rejected: Number(parsed.stats?.rejected) || 0,
        acceptedSinceReflect: Number(parsed.stats?.acceptedSinceReflect) || 0
      }
    };
  } catch {
    return empty();
  }
}
function saveMemory(m) {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(KEY, JSON.stringify(m));
  } catch {
  }
}
var pending = null;
function rememberDraft(sessionId, draft) {
  const m = loadMemory();
  const key = sessionId ?? "_";
  const list = (m.sessionDrafts[key] ?? []).filter((d) => d !== draft);
  list.push(draft.slice(0, 500));
  m.sessionDrafts[key] = list.slice(-MAX_SESSION_DRAFTS);
  const keys = Object.keys(m.sessionDrafts);
  if (keys.length > 20) {
    for (const k of keys.slice(0, keys.length - 20)) delete m.sessionDrafts[k];
  }
  saveMemory(m);
}
function setPending(sessionId, draft, result) {
  pending = { draft, result, at: Date.now(), sessionId };
}
function recordOutcome(kind) {
  if (!pending) return false;
  const sample = pending;
  pending = null;
  const m = loadMemory();
  if (kind === "accepted") {
    m.accepted = [
      sample,
      ...m.accepted.filter((x) => !(x.draft === sample.draft && x.result === sample.result))
    ].slice(0, MAX_ACCEPTED);
    m.stats.accepted += 1;
    m.stats.acceptedSinceReflect += 1;
  } else {
    m.rejected = [sample, ...m.rejected.filter((x) => x.draft !== sample.draft)].slice(0, MAX_REJECTED);
    m.stats.rejected += 1;
  }
  saveMemory(m);
  return kind === "accepted";
}
function buildContext(sessionId, intensity) {
  const m = loadMemory();
  return {
    intensity: intensity ?? DEFAULT_INTENSITY,
    profile: m.profile,
    examples: m.accepted.slice(0, 3).map((x) => ({ draft: x.draft, result: x.result })),
    recentDrafts: (m.sessionDrafts[sessionId ?? "_"] ?? []).slice(-5)
  };
}
function shouldReflect() {
  return loadMemory().stats.acceptedSinceReflect >= REFLECT_EVERY;
}
function buildReflectionPrompt(lang) {
  const m = loadMemory();
  const accepted = m.accepted.slice(0, 6).map(
    (x, i) => `### A${i + 1}
${lang === "zh" ? "草稿" : "draft"}: ${x.draft.slice(0, 240)}
${lang === "zh" ? "被采纳的结果（节选）" : "accepted (excerpt)"}:
${x.result.slice(0, 600)}`
  ).join("\n\n");
  const rejected = m.rejected.slice(0, 4).map(
    (x, i) => `### R${i + 1}
${lang === "zh" ? "草稿" : "draft"}: ${x.draft.slice(0, 240)}
${lang === "zh" ? "被放弃的结果（节选）" : "rejected (excerpt)"}:
${x.result.slice(0, 400)}`
  ).join("\n\n");
  if (lang === "zh") {
    return "你是提示词偏好分析师。下面是一位用户最近「采纳」和「放弃」的提示词重写记录。\n请提炼出**稳定的、可复用的偏好**，写成一份不超过 600 字的画像，让下一个负责重写的模型据此产出更合他口味的结果。\n\n要求：\n1. 只写从数据中**反复出现**的倾向，不要描述单次特例；\n2. 分三块：结构偏好 / 颗粒度与篇幅 / 措辞与约束风格；\n3. 用祈使句陈述可执行规则（如「默认加验收标准」「不要用『请』这类客套前缀」）；\n4. 采纳样本体现正面偏好，放弃样本体现要规避的做法，两边都要利用；\n5. 直接输出画像正文，不要标题、不要解释、不要「以下是」。\n\n" + (m.profile ? `# 上一版画像（可在此基础上修订，避免推倒重来）
${m.profile}

` : "") + `# 采纳记录
${accepted || "（无）"}

# 放弃记录
${rejected || "（无）"}`;
  }
  return `You analyze prompt preferences. Below are a user's recently ACCEPTED and REJECTED prompt rewrites.
Extract the STABLE, reusable preferences into a profile of at most 600 words so the next rewriting model can match their taste.

Rules:
1. Only state tendencies that recur across samples; ignore one-offs.
2. Use three blocks: Structure / Granularity & length / Wording & constraint style.
3. Phrase each as an executable imperative ("default to adding acceptance criteria").
4. Use accepted samples for positive preference and rejected ones for what to avoid.
5. Output the profile body only — no title, no preamble.

` + (m.profile ? `# Previous profile (revise it, do not start over)
${m.profile}

` : "") + `# Accepted
${accepted || "(none)"}

# Rejected
${rejected || "(none)"}`;
}
function applyReflection(text) {
  const clean = text.trim().replace(/^```[a-zA-Z]*\n?|\n?```$/g, "").trim();
  if (!clean) return;
  const m = loadMemory();
  m.profile = clean.slice(0, 1500);
  m.stats.acceptedSinceReflect = 0;
  saveMemory(m);
}

// src/preview-state.ts
var INITIAL_PREVIEW = {
  status: "idle",
  result: "",
  errorKind: null,
  errorDetail: null,
  generation: 0,
  draft: "",
  reasoning: "",
  sessionId: null,
  step: null
};
function reducePreview(state2, action) {
  switch (action.type) {
    case "begin":
      if (state2.status === "optimizing") return state2;
      return {
        ...state2,
        status: "optimizing",
        errorKind: null,
        errorDetail: null,
        draft: "",
        sessionId: action.sessionId ?? null,
        step: "model",
        generation: state2.generation + 1
      };
    case "show":
      return state2.status === "optimizing" ? { ...state2, status: "preview", result: action.result, draft: "" } : state2;
    case "fail":
      return state2.status === "optimizing" ? { ...state2, status: "error", errorKind: action.kind, errorDetail: action.detail ?? null } : state2;
    case "guide":
      return {
        ...state2,
        status: "guide",
        errorKind: null,
        errorDetail: null,
        draft: "",
        reasoning: "",
        step: null
      };
    case "close":
      return INITIAL_PREVIEW;
    case "draft":
      return state2.status === "optimizing" ? { ...state2, draft: action.text } : state2;
    case "reasoning":
      return state2.status === "optimizing" ? { ...state2, reasoning: action.text } : state2;
    case "step":
      return state2.status === "optimizing" ? { ...state2, step: action.step } : state2;
    default:
      return state2;
  }
}

// src/preview-bus.ts
var state = { ...INITIAL_PREVIEW };
var listeners = /* @__PURE__ */ new Set();
function getPreviewBusState() {
  return state;
}
function dispatchPreview(action) {
  state = reducePreview(state, action);
  for (const listener of listeners) listener();
}
function subscribePreviewBus(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// src/optimizer-store.ts
var activeController = null;
var activeSessionId = null;
var HOST_TIMEOUT_MS = 12e4;
function closePreview() {
  if (activeController !== null) {
    activeController.abort();
    activeController = null;
  }
  activeSessionId = null;
  dispatchPreview({ type: "close" });
}
async function runOptimize(ctx) {
  const config = ctx.getConfig();
  const draft = normalizePromptText(ctx.getDraft()).trim();
  if (!draft) {
    return;
  }
  const sessionId = ctx.getSessionId?.() ?? null;
  rememberDraft(sessionId, draft);
  const memoryCtx = buildContext(sessionId, config.intensity);
  const system = buildSystemPrompt(ctx.getLang(), memoryCtx);
  if (activeController !== null) {
    if (sessionId === activeSessionId) {
      return;
    }
    activeController.abort();
    activeController = null;
    activeSessionId = null;
  }
  dispatchPreview({ type: "begin", sessionId });
  const controller = new AbortController();
  activeController = controller;
  activeSessionId = sessionId;
  const useHost = config.useSessionModel && !!ctx.host;
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, useHost ? HOST_TIMEOUT_MS : REQUEST_TIMEOUT_MS);
  try {
    if (useHost) {
      await streamHostOptimize({
        rpc: ctx.host.rpc,
        text: draft,
        system,
        signal: controller.signal,
        rpcTimeoutMs: 5e3,
        onDelta: (text) => dispatchPreview({ type: "draft", text }),
        onReasoning: (text) => dispatchPreview({ type: "reasoning", text }),
        onStep: (step) => dispatchPreview({ type: "step", step })
      }).then(
        (finalText) => {
          const result = stripLeadIn(finalText);
          if (!result.trim()) {
            dispatchPreview({ type: "fail", kind: "empty" });
            return;
          }
          setPending(sessionId, draft, result);
          dispatchPreview({ type: "show", result });
        },
        (e) => {
          const isAbort = e instanceof DOMException && e.name === "AbortError" || typeof e?.name === "string" && e.name === "AbortError";
          if (isAbort) {
            if (timedOut) dispatchPreview({ type: "fail", kind: "timeout" });
            return;
          }
          const kind = toErrorKind(e).kind;
          dispatchPreview({ type: "fail", kind, detail: String(e?.message ?? e) });
        }
      );
      return;
    }
    if (!checkConfig(config).ok) {
      dispatchPreview({ type: "guide" });
      return;
    }
    let model = config.model;
    if (config.useSessionModel) {
      const sessionModel = await ctx.getSessionModel?.();
      if (sessionModel && sessionModel.model) model = sessionModel.model;
    }
    const effective = { ...config, model };
    let reasoning = "";
    let content = "";
    let shown = "";
    try {
      const result = await optimizeStream({
        config: effective,
        text: draft,
        lang: ctx.getLang(),
        signal: controller.signal,
        system,
        memory: memoryCtx,
        onEvent: (delta) => {
          if (delta.kind === "content") {
            content += delta.text;
            shown = content;
          } else {
            reasoning += delta.text;
            shown = reasoning;
          }
          dispatchPreview({ type: "draft", text: shown });
        }
      });
      setPending(sessionId, draft, result);
      dispatchPreview({ type: "show", result });
    } catch (e) {
      const isAbort = e instanceof DOMException && e.name === "AbortError" || typeof e?.name === "string" && e.name === "AbortError";
      if (isAbort) {
        if (timedOut) dispatchPreview({ type: "fail", kind: "timeout" });
        return;
      }
      dispatchPreview({ type: "fail", kind: toErrorKind(e).kind });
    }
  } catch (e) {
    dispatchPreview({ type: "fail", kind: toErrorKind(e).kind });
  } finally {
    if (activeController === controller) {
      activeController = null;
      activeSessionId = null;
    }
    clearTimeout(timer);
  }
}
async function reflectIfNeeded(ctx) {
  if (!shouldReflect()) return;
  const system = buildReflectionPrompt(ctx.lang);
  const text = ctx.lang === "zh" ? "（只输出画像正文）" : "(output the profile body only)";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45e3);
  try {
    let out = "";
    if (ctx.host) {
      out = await streamHostOptimize({
        rpc: ctx.host.rpc,
        text,
        system,
        signal: controller.signal,
        rpcTimeoutMs: 5e3,
        timeoutMs: 45e3,
        onDelta: () => {
        }
      });
    } else {
      out = await optimizeStream({
        config: ctx.config,
        text,
        lang: ctx.lang,
        system,
        signal: controller.signal
      });
    }
    if (out.trim()) applyReflection(out);
  } catch {
  } finally {
    clearTimeout(timer);
  }
}

// src/composer.ts
function textOfInput(el) {
  if (el instanceof HTMLTextAreaElement) return el.value;
  if (el instanceof HTMLElement && el.isContentEditable) return el.innerText || "";
  return "";
}
function isSessionInput(el) {
  if (el === null) return false;
  if (el instanceof HTMLTextAreaElement) return true;
  const editable = el instanceof HTMLElement && el.isContentEditable;
  const composer = el instanceof Element && el.closest("[data-composer-input]") !== null;
  return editable || composer;
}
function findComposer() {
  const active = document.activeElement;
  if (active && isSessionInput(active)) return active;
  const composer = document.querySelector("[data-composer-input]");
  if (composer && isSessionInput(composer)) return composer;
  const all = document.querySelectorAll("textarea");
  for (const ta of all) {
    if (!ta.disabled) return ta;
  }
  return null;
}
function readDraft() {
  const active = document.activeElement;
  if (isSessionInput(active)) {
    const text = textOfInput(active);
    if (text.trim()) return text;
  }
  const composer = document.querySelector("[data-composer-input]");
  if (composer !== null && isSessionInput(composer)) {
    const text = textOfInput(composer);
    if (text.trim()) return text;
  }
  const all = document.querySelectorAll("textarea");
  for (const ta of all) {
    if (ta.value.trim()) return ta.value;
  }
  return "";
}
function writeComposerText(text) {
  const el = findComposer();
  if (!el) return;
  if (el instanceof HTMLTextAreaElement) {
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
    if (setter) {
      setter.call(el, text);
    } else {
      el.value = text;
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.focus();
    return;
  }
  if (el instanceof HTMLElement && el.isContentEditable) {
    el.focus();
    if (document.execCommand) {
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(el);
      sel?.removeAllRanges();
      sel?.addRange(range);
      document.execCommand("insertText", false, text);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    } else {
      el.innerText = text;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
}

// src/OptimizeButton.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var CSS_ID = "dsh-prompt-architect/button.css";
function injectCss() {
  if (typeof document === "undefined" || document.querySelector(`style[data-plugin-css="${CSS_ID}"]`)) return;
  const style = document.createElement("style");
  style.dataset.pluginCss = CSS_ID;
  style.textContent = `
.dsh-po-btn {
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 2px 6px;
  font-size: 14px;
  line-height: 1;
  opacity: 0.85;
  border-radius: 6px;
}
.dsh-po-btn:hover:not(:disabled) {
  opacity: 1;
  background: var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,0.12));
}
.dsh-po-btn:disabled {
  opacity: 0.35;
  cursor: default;
}
`;
  document.head.appendChild(style);
}
function OptimizeButton(props) {
  const { t, getConfig, getLang, getSessionModel, getHost, getSessionId } = props;
  const busyFor = () => {
    const st = getPreviewBusState();
    if (st.status !== "optimizing") return false;
    const sid = getSessionId?.();
    return st.sessionId === null || st.sessionId === sid;
  };
  const [busy, setBusy] = (0, import_react.useState)(busyFor);
  (0, import_react.useEffect)(
    () => subscribePreviewBus(() => setBusy(busyFor())),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const draftRef = import_react.default.useRef("");
  const syncDraft = import_react.default.useCallback(() => {
    draftRef.current = readDraft();
  }, []);
  (0, import_react.useEffect)(() => injectCss(), []);
  const handleClick = (0, import_react.useCallback)(() => {
    if (busy) return;
    const draft = draftRef.current || readDraft();
    if (!draft.trim()) return;
    void runOptimize({
      getConfig,
      getLang,
      getDraft: () => draft,
      getSessionModel,
      host: getHost?.(),
      getSessionId
    });
  }, [busy, getConfig, getLang]);
  (0, import_react.useEffect)(() => onOptimizeRequest(handleClick), [handleClick]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "button",
    {
      type: "button",
      className: "dsh-po-btn",
      "aria-label": t("button.aria"),
      title: t("button.aria"),
      "aria-busy": busy,
      disabled: busy,
      "data-busy": busy,
      onMouseDown: syncDraft,
      onFocus: syncDraft,
      onClick: handleClick,
      children: busy ? "⏳" : "✨"
    }
  );
}

// src/PreviewCard.tsx
var import_react2 = require("react");
var import_jsx_runtime2 = require("react/jsx-runtime");
var CSS_ID2 = "dsh-prompt-architect/card.css";
function injectCss2() {
  if (typeof document === "undefined" || document.querySelector(`style[data-plugin-css="${CSS_ID2}"]`)) return;
  const style = document.createElement("style");
  style.dataset.pluginCss = CSS_ID2;
  style.textContent = `
.dsh-po-card {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: calc(100% + 8px);
  z-index: 40;
  background: var(--dsw-alias-bg-overlay, #fff);
  border: 1px solid var(--dsw-alias-border-l2, rgba(128,128,128,0.3));
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
  padding: 12px 14px;
  max-height: 320px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dsh-po-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--dsw-alias-label-primary, #222);
  font-size: 13px;
  font-weight: 600;
}
.dsh-po-card-body {
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--dsw-alias-label-secondary, #444);
  font-size: 13px;
  line-height: 1.6;
  max-height: 200px;
}
.dsh-po-card-err {
  color: var(--dsw-alias-state-error-primary, #d03050);
  font-size: 13px;
}
.dsh-po-card-step {
  color: var(--dsw-alias-text-secondary, #8c93a1);
  font-size: 12px;
  margin-left: 4px;
}
.dsh-po-card-err-detail {
  margin-top: 4px;
  color: var(--dsw-alias-text-secondary, #8c93a1);
  font-size: 12px;
  word-break: break-all;
}
.dsh-po-card-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.dsh-po-card-btn {
  border: 0;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
  color: var(--dsw-alias-label-primary, #222);
  background: var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,0.14));
}
.dsh-po-card-btn.primary {
  /* 写死主色：--dsw-alias-brand-primary 在深夜模式解析为浅色 → 白底白字不可读（用户实测） */
  color: #fff;
  background: #1677ff;
}
`;
  document.head.appendChild(style);
}
function errorKey(kind) {
  switch (kind) {
    // kind → locale key；'config' 在 UI 上不可达（runOptimize 先走 guide），AbortError→timeout 由 runOptimize 先行拦截，保留双保险
    case "unauthorized":
    case "forbidden":
    case "timeout":
    case "network":
    case "cors":
    case "http":
    case "bad-response":
    case "empty":
    case "truncated":
    case "config":
      return `error.${kind}`;
    default:
      return "error.network";
  }
}
function PreviewCard(props) {
  const { t, getConfig, getLang, openSettings, getSessionModel, getHost, getSessionId } = props;
  const [state2, setState] = (0, import_react2.useState)(() => getPreviewBusState());
  (0, import_react2.useEffect)(
    () => subscribePreviewBus(() => setState(getPreviewBusState())),
    []
  );
  (0, import_react2.useEffect)(() => injectCss2(), []);
  const mountedRef = (0, import_react2.useRef)(true);
  (0, import_react2.useEffect)(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (copyTimerRef.current !== null) {
        clearTimeout(copyTimerRef.current);
        copyTimerRef.current = null;
      }
    };
  }, []);
  const { status, result, errorKind } = state2;
  const [copied, setCopied] = (0, import_react2.useState)(false);
  const copyTimerRef = (0, import_react2.useRef)(null);
  if (status !== "idle" && state2.sessionId !== null) {
    const sid = getSessionId?.();
    if (sid !== null && state2.sessionId !== sid) return null;
  }
  if (status === "idle") return null;
  const retry = () => {
    recordOutcome("rejected");
    void runOptimize({
      getConfig,
      getLang,
      getDraft: () => readDraft(),
      getSessionModel,
      host: getHost?.() ?? void 0,
      getSessionId
    });
  };
  const replace = () => {
    writeComposerText(result);
    const accepted = recordOutcome("accepted");
    closePreview();
    if (accepted) {
      void reflectIfNeeded({ config: getConfig(), lang: getLang(), host: getHost?.() ?? void 0 });
    }
  };
  const dismiss = () => {
    recordOutcome(hasCopiedRef.current ? "accepted" : "rejected");
    closePreview();
  };
  const hasCopiedRef = (0, import_react2.useRef)(false);
  const copy = async () => {
    if (!navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(result);
      hasCopiedRef.current = true;
      if (!mountedRef.current) return;
      setCopied(true);
      if (copyTimerRef.current !== null) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => {
        setCopied(false);
        copyTimerRef.current = null;
      }, 1200);
    } catch {
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-po-card", role: "status", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-po-card-head", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: t("card.title") }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dsh-po-card-btn", onClick: dismiss, children: "✕" })
    ] }),
    status === "guide" && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dsh-po-card-body", children: t("guide.title") }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dsh-po-card-body", children: t("guide.desc") }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-po-card-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dsh-po-card-btn primary", onClick: () => {
          closePreview();
          openSettings();
        }, children: t("guide.action") }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dsh-po-card-btn", onClick: () => closePreview(), children: t("guide.dismiss") })
      ] })
    ] }),
    status === "optimizing" && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-po-card-body", children: [
      state2.reasoning && !state2.draft ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "span",
        {
          style: {
            whiteSpace: "pre-wrap",
            color: "var(--dsw-alias-text-secondary, #8c93a1)",
            fontSize: "12px"
          },
          children: state2.reasoning
        }
      ) : null,
      state2.draft ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { whiteSpace: "pre-wrap" }, children: state2.draft }) : null,
      !state2.draft && !state2.reasoning ? t("card.optimizing") : null
    ] }),
    status === "preview" && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dsh-po-card-body", children: result }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-po-card-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dsh-po-card-btn primary", onClick: replace, children: t("card.replace") }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dsh-po-card-btn", onClick: () => void copy(), children: copied ? t("card.copyDone") : t("card.copy") }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dsh-po-card-btn", onClick: retry, children: t("card.retry") }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dsh-po-card-btn", onClick: dismiss, children: t("card.dismiss") })
      ] })
    ] }),
    status === "error" && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dsh-po-card-err", children: t(errorKey(errorKind)) }),
      errorDetail ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dsh-po-card-err-detail", children: errorDetail }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-po-card-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dsh-po-card-btn primary", onClick: retry, children: t("card.retry") }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dsh-po-card-btn", onClick: dismiss, children: t("card.dismiss") })
      ] })
    ] })
  ] });
}

// src/SettingsRow.tsx
var import_react3 = require("react");
var import_jsx_runtime3 = require("react/jsx-runtime");
var CSS_ID3 = "dsh-prompt-architect/settings.css";
function injectCss3() {
  if (typeof document === "undefined" || document.querySelector(`style[data-plugin-css="${CSS_ID3}"]`)) return;
  const style = document.createElement("style");
  style.dataset.pluginCss = CSS_ID3;
  style.textContent = `
.optiSettings {
  border-bottom: 1px solid var(--dsw-alias-border-l2);
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.optiSettingsTitle {
  color: var(--dsw-alias-label-primary);
  font-size: 14px;
  line-height: 22px;
}
.optiSettingsHint {
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
}
.optiSettingsForm {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}
.optiSettingsField {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.optiSettingsLabel {
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
}
.optiSettingsInput {
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  padding: 6px 8px;
  font-size: 13px;
}
.optiSettingsRow {
  display: flex;
  gap: 8px;
  align-items: center;
}
.optiSettingsBtn {
  border: 0;
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  background: var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,0.14));
  color: var(--dsw-alias-label-primary);
}
.optiSettingsBtn.primary {
  /* 写死主色：主题变量在深夜模式会解析为浅/深极端色（黑底黑字、白底白字均被用户实测），
     固定品牌蓝 + 白字保证任何主题可读 */
  color: #fff;
  background: #1677ff;
}
.optiSettingsErr {
  color: var(--dsw-alias-state-error-primary, #d03050);
  font-size: 12px;
}
`;
  document.head.appendChild(style);
}
function SettingsRow(props) {
  const { t, useStore, actions, getConfig, saveConfig, resetConfig, getEpoch, getHostStatus } = props;
  const [hostStatus, setHostStatus] = (0, import_react3.useState)(null);
  (0, import_react3.useEffect)(() => {
    if (!getHostStatus) return;
    let alive = true;
    getHostStatus().then((st) => {
      if (alive) setHostStatus(st);
    }).catch(() => {
      if (alive) setHostStatus({ available: false, error: "rpc-failed" });
    });
    return () => {
      alive = false;
    };
  }, [getHostStatus]);
  const [expanded, setExpanded] = (0, import_react3.useState)(false);
  const [submitRevision, setSubmitRevision] = (0, import_react3.useState)(0);
  const values = useStore((s) => s.values);
  const saved = useStore((s) => s.saved);
  const error = useStore((s) => s.error);
  const [rpcError, setRpcError] = (0, import_react3.useState)(null);
  (0, import_react3.useEffect)(() => injectCss3(), []);
  const config = getConfig();
  const modelLabel = config.model ? config.model : "—";
  (0, import_react3.useEffect)(() => {
    actions.seed(
      {
        baseUrl: config.baseUrl,
        apiKey: config.apiKey,
        model: config.model,
        useSessionModel: config.useSessionModel,
        intensity: config.intensity
      },
      submitRevision + getEpoch()
    );
  }, [config.baseUrl, config.apiKey, config.model, config.useSessionModel, config.intensity, getEpoch]);
  (0, import_react3.useEffect)(() => onOpenSettingsRequest(() => setExpanded(true)), []);
  const handleSave = async () => {
    setRpcError(null);
    const errors = actions.validate(values);
    if (errors) {
      actions.fail(Object.values(errors)[0]);
      return;
    }
    try {
      await saveConfig(values);
      setSubmitRevision((r) => r + 1);
      actions.commit(submitRevision + 1 + getEpoch());
    } catch (outer) {
      setRpcError(`${t("settings.saveFailed")}：${outer instanceof Error ? outer.message : String(outer)}`);
    }
  };
  const handleReset = async () => {
    setRpcError(null);
    try {
      await resetConfig();
      actions.seed(
        {
          baseUrl: DEFAULTS.baseUrl,
          apiKey: DEFAULTS.apiKey,
          model: DEFAULTS.model,
          useSessionModel: true,
          intensity: DEFAULTS.intensity
        },
        submitRevision + 1 + getEpoch()
      );
      setSubmitRevision((r) => r + 1);
    } catch (outer) {
      setRpcError(`${t("settings.resetFailed")}：${outer instanceof Error ? outer.message : String(outer)}`);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "optiSettings", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "optiSettingsTitle", onClick: () => setExpanded((v) => !v), style: { cursor: "pointer" }, children: [
      t("settings.title"),
      !expanded && (values.useSessionModel ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "optiSettingsHint", children: [
        " · ",
        t("settings.sessionModelEnabled")
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "optiSettingsHint", children: [
        " · ",
        t(values.apiKey ? "card.configured.hint" : "card.unconfigured.hint").replace("{model}", modelLabel)
      ] }))
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "optiSettingsHint", children: t("settings.aiNotice") }),
    expanded && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "optiSettingsForm", children: [
      getHostStatus && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "optiSettingsField", style: { flexDirection: "row" }, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "span",
        {
          className: "optiSettingsHint",
          style: {
            color: hostStatus?.available ? "var(--dsw-alias-state-success-primary, #2f9e63)" : "var(--dsw-alias-state-error-primary, #d03050)"
          },
          children: hostStatus === null ? t("settings.hostProbe") : hostStatus.available ? `${t("settings.hostOk")} ${hostStatus.provider}/${hostStatus.model}` : `${t("settings.hostFail")} ${hostStatus.error ?? ""}`
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "optiSettingsField", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("label", { className: "optiSettingsLabel", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "input",
            {
              type: "checkbox",
              checked: values.useSessionModel,
              onChange: (e) => actions.edit("useSessionModel", e.target.checked)
            }
          ),
          " ",
          t("settings.useSessionModel")
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "optiSettingsHint", children: t("settings.useSessionModelHint") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "optiSettingsField", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "optiSettingsLabel", children: t("settings.intensity") }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "optiSettingsRow", children: ["light", "standard", "deep"].map((level) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "button",
          {
            type: "button",
            className: `optiSettingsBtn${values.intensity === level ? " primary" : ""}`,
            onClick: () => actions.edit("intensity", level),
            children: t(`intensity.${level}`)
          },
          level
        )) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "optiSettingsHint", children: t("settings.intensityHint") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "optiSettingsField", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { className: "optiSettingsLabel", htmlFor: "opti-base-url", children: t("settings.baseUrl") }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "input",
          {
            id: "opti-base-url",
            className: "optiSettingsInput",
            value: values.baseUrl,
            placeholder: DEFAULTS.baseUrl,
            disabled: values.useSessionModel,
            onChange: (e) => actions.edit("baseUrl", e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "optiSettingsField", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { className: "optiSettingsLabel", htmlFor: "opti-api-key", children: t("settings.apiKey") }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "input",
          {
            id: "opti-api-key",
            className: "optiSettingsInput",
            type: "password",
            value: values.apiKey,
            placeholder: "sk-…",
            autoComplete: "off",
            disabled: values.useSessionModel,
            onChange: (e) => actions.edit("apiKey", e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "optiSettingsField", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { className: "optiSettingsLabel", htmlFor: "opti-model", children: t("settings.model") }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "input",
          {
            id: "opti-model",
            className: "optiSettingsInput",
            value: values.model,
            placeholder: values.useSessionModel ? "—" : DEFAULTS.model,
            disabled: values.useSessionModel,
            onChange: (e) => actions.edit("model", e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "optiSettingsRow", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "optiSettingsBtn primary", onClick: handleSave, children: t("settings.save") }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "optiSettingsBtn", onClick: handleReset, children: t("settings.reset") }),
        saved && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "optiSettingsHint", children: t("settings.saved") }),
        rpcError && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "optiSettingsErr", children: rpcError }),
        !rpcError && error && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "optiSettingsErr", children: t(error) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "optiSettingsHint", children: t("settings.desc") })
    ] })
  ] });
}

// src/settings-form-state.ts
function validateSettingsForm(values) {
  const errors = {};
  if (values.useSessionModel) return errors;
  const url = values.baseUrl.trim();
  if (!url) {
    errors.baseUrl = "settings.baseUrl";
  } else {
    try {
      const u = new URL(url);
      if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error("protocol");
      if (u.search || u.hash) throw new Error("query-or-hash");
    } catch {
      errors.baseUrl = "settings.baseUrl";
    }
  }
  if (!values.apiKey.trim()) errors.apiKey = "settings.apiKey";
  if (!values.model.trim()) errors.model = "settings.model";
  return errors;
}
var INITIAL_SETTINGS_FORM = {
  values: { baseUrl: "", apiKey: "", model: "", useSessionModel: true, intensity: DEFAULT_INTENSITY },
  dirty: false,
  saved: false,
  error: null,
  revision: -1
};
function reduceSettingsForm(state2, action) {
  switch (action.type) {
    case "seed":
      return action.revision <= state2.revision ? state2 : { ...state2, values: { ...action.values }, dirty: false, saved: false, error: null, revision: action.revision };
    case "edit":
      return { ...state2, values: { ...state2.values, [action.field]: action.value }, dirty: true, saved: false, error: null };
    case "commit":
      return { ...state2, dirty: false, saved: true, error: null, revision: action.revision };
    case "fail":
      return { ...state2, error: action.message };
  }
}

// src/settings-store.ts
function defineStore(decl) {
  return {
    spec: decl,
    create(_scopeKey) {
      let state2 = decl.init();
      const listeners2 = /* @__PURE__ */ new Set();
      const notify = () => {
        for (const fn of listeners2) fn();
      };
      const store = {
        getSnapshot: () => state2,
        subscribe: (fn) => {
          listeners2.add(fn);
          return () => void listeners2.delete(fn);
        },
        update: (mutator) => {
          const draft = { ...state2, values: { ...state2.values } };
          mutator(draft);
          state2 = draft;
          notify();
        }
      };
      const actions = {};
      for (const key of Object.keys(decl.actions)) {
        const mutate = decl.actions[key];
        actions[key] = (...params) => {
          store.update((draft) => {
            mutate(draft, ...params);
          });
        };
      }
      return {
        actions,
        getSnapshot: store.getSnapshot,
        subscribe: store.subscribe,
        store,
        clearPersisted: () => {
          if (typeof localStorage !== "undefined") {
            try {
              localStorage.removeItem("dsh-prompt-architect/settings");
            } catch {
            }
          }
        }
      };
    }
  };
}
var createSettingsFormStore = () => {
  return defineStore({
    init: () => ({
      ...INITIAL_SETTINGS_FORM,
      values: { ...INITIAL_SETTINGS_FORM.values }
    }),
    actions: {
      seed: (d, values, revision) => Object.assign(d, reduceSettingsForm(d, { type: "seed", values, revision })),
      edit: (d, field, value) => Object.assign(d, reduceSettingsForm(d, { type: "edit", field, value })),
      commit: (d, revision) => Object.assign(d, reduceSettingsForm(d, { type: "commit", revision })),
      fail: (d, message) => Object.assign(d, reduceSettingsForm(d, { type: "fail", message })),
      validate: (_d, values) => {
        const errors = validateSettingsForm(values);
        return Object.keys(errors).length === 0 ? null : errors;
      }
    }
  });
};

// src/index.ts
var inject = ["slots", "sessions", "locale"];
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), "prompt-architect: locale registration");
  let configMirror = mergeConfig(void 0);
  let configEpoch = 0;
  const rpcConfig = async (endpoint, payload) => {
    const result = await callHost(endpoint, payload ?? {});
    if (!result.ok) {
      throw new Error(
        `config rpc ${endpoint} failed: ${result.error && (result.error.details || result.error.code) || "rpc failed"}`
      );
    }
    return result.value;
  };
  const loadConfig = async () => {
    try {
      const value = await rpcConfig("get");
      configMirror = mergeConfig(value);
    } catch {
    }
  };
  void loadConfig();
  const getActiveSession = () => {
    const info = ctx.sessions?.currentProvideInfo?.getSnapshot?.();
    const sessionId = info?.sessionId;
    return typeof sessionId === "string" && sessionId.length > 0 ? sessionId : null;
  };
  const hostRpc = {
    call: (endpoint, payload) => callHost(endpoint, payload ?? {})
  };
  const getHost = () => ({ rpc: hostRpc });
  const getSessionModel = async () => {
    try {
      const res = await withTimeout(callHost("sessionModel", {}), 5e3, "sessionModel");
      if (res.ok && res.value && typeof res.value === "object") {
        const v = res.value;
        if (typeof v.provider === "string" && typeof v.model === "string") {
          return { provider: v.provider, model: v.model };
        }
      }
      return null;
    } catch {
      return null;
    }
  };
  const getSessionId = () => getActiveSession();
  let lang = langOf(ctx.locale.getLocale().active);
  ctx.on("locale/change", (snap) => {
    lang = langOf(snap.active);
  });
  ctx.inject(["slots", "sessions"], (scope) => {
    scope.slots.inject(
      "conversation.input.right",
      () => scope.slots.register(
        {
          name: "conversation.input.right",
          id: "prompt-architect-button",
          order: 0,
          locale: NS,
          inject: () => ({
            getConfig: () => configMirror,
            getLang: () => lang,
            getSessionModel,
            getHost,
            getSessionId
          })
        },
        OptimizeButton
      )
    );
    scope.slots.inject(
      "conversation.input.overlay",
      () => scope.slots.register(
        {
          name: "conversation.input.overlay",
          id: "prompt-architect-card",
          order: 10,
          locale: NS,
          inject: () => ({
            getConfig: () => configMirror,
            getLang: () => lang,
            openSettings: () => emitOpenSettingsRequest(),
            getSessionModel,
            getHost,
            getSessionId
          })
        },
        PreviewCard
      )
    );
  });
  const settingsStore = createSettingsFormStore();
  const saveConfig = async (raw) => {
    const merged = mergeConfig({ ...configMirror, ...raw });
    const written = {
      baseUrl: merged.baseUrl,
      apiKey: merged.apiKey.trim(),
      model: merged.model,
      useSessionModel: merged.useSessionModel,
      intensity: merged.intensity
    };
    try {
      const saved = await rpcConfig("set", {
        patch: {
          baseUrl: written.baseUrl,
          apiKey: written.apiKey,
          model: written.model,
          useSessionModel: written.useSessionModel,
          intensity: written.intensity
        }
      });
      configMirror = mergeConfig(saved);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  };
  const resetConfig = async () => {
    try {
      const saved = await rpcConfig("set", {
        patch: {
          baseUrl: DEFAULTS.baseUrl,
          apiKey: DEFAULTS.apiKey,
          model: DEFAULTS.model,
          useSessionModel: true,
          intensity: DEFAULTS.intensity
        }
      });
      configMirror = mergeConfig(saved);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  };
  ctx.inject(["slots"], (scope) => {
    scope.slots.inject(
      "settings.general.item",
      () => scope.slots.register(
        {
          name: "settings.general.item",
          id: "prompt-architect-settings",
          order: 30,
          locale: NS,
          store: settingsStore,
          inject: () => ({
            getConfig: () => configMirror,
            saveConfig,
            resetConfig,
            getEpoch: () => configEpoch,
            getHostStatus: async () => {
              try {
                const res = await withTimeout(callHost("sessionModel", {}), 5e3, "sessionModel");
                if (res.ok && res.value && typeof res.value === "object") {
                  const v = res.value;
                  if (typeof v.provider === "string" && typeof v.model === "string") {
                    return { available: true, provider: v.provider, model: v.model };
                  }
                  return { available: false, error: res.error && (res.error.details ?? res.error.code) || "no-model" };
                }
                return { available: false, error: res.error && (res.error.details ?? res.error.code) || "rpc-failed" };
              } catch (e) {
                return { available: false, error: String(e?.message ?? e) };
              }
            }
          })
        },
        SettingsRow
      )
    );
  });
  ctx.effect(() => {
    const onKeydown = (e) => {
      if (e.repeat) return;
      if (!e.altKey || e.code !== "KeyO") return;
      const el = document.activeElement;
      const inInput = el instanceof HTMLTextAreaElement || el instanceof HTMLElement && (el.isContentEditable || el.closest("[data-composer-input]") !== null);
      if (!inInput) return;
      e.preventDefault();
      emitOptimizeRequest();
    };
    document.addEventListener("keydown", onKeydown);
    return () => document.removeEventListener("keydown", onKeydown);
  }, "prompt-architect: alt+o shortcut");
}
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2luZGV4LnRzIiwgIi4uL3NyYy9vcHRpbWl6ZXIudHMiLCAiLi4vc3JjL2xvY2FsZXMudHMiLCAiLi4vc3JjL2V2ZW50cy50cyIsICIuLi9zcmMvT3B0aW1pemVCdXR0b24udHN4IiwgIi4uL3NyYy9zZXNzaW9uLW9wdGltaXplci50cyIsICIuLi9zcmMvbWVtb3J5LnRzIiwgIi4uL3NyYy9wcmV2aWV3LXN0YXRlLnRzIiwgIi4uL3NyYy9wcmV2aWV3LWJ1cy50cyIsICIuLi9zcmMvb3B0aW1pemVyLXN0b3JlLnRzIiwgIi4uL3NyYy9jb21wb3Nlci50cyIsICIuLi9zcmMvUHJldmlld0NhcmQudHN4IiwgIi4uL3NyYy9TZXR0aW5nc1Jvdy50c3giLCAiLi4vc3JjL3NldHRpbmdzLWZvcm0tc3RhdGUudHMiLCAiLi4vc3JjL3NldHRpbmdzLXN0b3JlLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvLyDmnKzpobnnm67nlLEgQUkg6L6F5Yqp5LyY5YyW5a6M5oiQ77yI5o+Q56S66K+N5YaF5qC444CB5rWL6K+V5LiO5paH5qGj77yJ77yM5Y+R5biD5YmN57uP5Lq65bel5a6h6ZiF44CCXG4vKiogZHNoLXByb21wdC1hcmNoaXRlY3Qg5o+S5Lu25YWl5Y+jIOKAlCBhcHBseShjdHgpICovXG5cbmltcG9ydCB0eXBlIHsgQ2xpZW50Q29udGV4dCB9IGZyb20gJ0BkZWVwc2Vlay1haS9kc2gtY2xpZW50LXJ1bnRpbWUvY2xpZW50JztcbmltcG9ydCB0eXBlIHsgTGFuZywgUHJvbXB0Q29uZmlnIH0gZnJvbSAnLi9vcHRpbWl6ZXIuanMnO1xuaW1wb3J0IHsgREVGQVVMVFMsIG1lcmdlQ29uZmlnIH0gZnJvbSAnLi9vcHRpbWl6ZXIuanMnO1xuaW1wb3J0IHsgTlMsIHpoLCBlbiwgbGFuZ09mIH0gZnJvbSAnLi9sb2NhbGVzLmpzJztcbmltcG9ydCB0eXBlIHsgT3B0aW1pemVyQWN0aW9ucyB9IGZyb20gJy4vb3B0aW1pemVyLXN0b3JlLmpzJztcbmltcG9ydCB7IGVtaXRPcHRpbWl6ZVJlcXVlc3QsIGVtaXRPcGVuU2V0dGluZ3NSZXF1ZXN0IH0gZnJvbSAnLi9ldmVudHMuanMnO1xuaW1wb3J0IHsgT3B0aW1pemVCdXR0b24gfSBmcm9tICcuL09wdGltaXplQnV0dG9uLnRzeCc7XG5pbXBvcnQgeyBQcmV2aWV3Q2FyZCB9IGZyb20gJy4vUHJldmlld0NhcmQudHN4JztcbmltcG9ydCB7IFNldHRpbmdzUm93IH0gZnJvbSAnLi9TZXR0aW5nc1Jvdy50c3gnO1xuaW1wb3J0IHsgY3JlYXRlU2V0dGluZ3NGb3JtU3RvcmUgfSBmcm9tICcuL3NldHRpbmdzLXN0b3JlLmpzJztcbmltcG9ydCB0eXBlIHsgSG9zdFJwYyB9IGZyb20gJy4vc2Vzc2lvbi1vcHRpbWl6ZXIuanMnO1xuaW1wb3J0IHsgd2l0aFRpbWVvdXQsIGNhbGxIb3N0IH0gZnJvbSAnLi9zZXNzaW9uLW9wdGltaXplci5qcyc7XG5cbi8qKlxuICog5aOw5piO5o+S5Lu25L6d6LWW55qE5a6i5oi356uv5pyN5Yqh77yIY29yZGlzIHNlcnZpY2Uga2V5c++8ie+8mmFwcGx5IOWGhee7jyBgY3R4LjxzZXJ2aWNlPmAg6K6/6Zeu55qE5pyN5Yqh5b+F6aG75Zyo5q2k5aOw5piO44CCXG4gKiDlgLzpobvkuLrmnI3liqHlkI3ogIzpnZ7ljIUgaWTigJTigJTkuI7lkIzlvaLmgIHlhYjkvovkuIDoh7TvvIhkc2gtbWVzc2FnZS1yYWlsOiBbXCJzbG90c1wiLFwic2Vzc2lvbnNcIl3vvJtcbiAqIGRzaC1iZXR0ZXItc2lkZWJhciDkuqblo7DmmI4gbG9jYWxl77yJ77yb6ZSZ6K+v5aOw5piO5Lya6K6pIGZpYmVyIOawuOS5hSBQRU5ESU5H77yM5ZCv5Yqo5a6h6K6h55u05o6l5Yik5aSx6LSl44CCXG4gKi9cbmV4cG9ydCBjb25zdCBpbmplY3QgPSBbJ3Nsb3RzJywgJ3Nlc3Npb25zJywgJ2xvY2FsZSddO1xuXG5leHBvcnQgZnVuY3Rpb24gYXBwbHkoY3R4OiBDbGllbnRDb250ZXh0KSB7XG4gIC8vIDEuIOaWh+ahiFxuICBjdHguZWZmZWN0KCgpID0+IGN0eC5sb2NhbGUucmVnaXN0ZXIoTlMsIHsgemgsIGVuIH0pLCAncHJvbXB0LWFyY2hpdGVjdDogbG9jYWxlIHJlZ2lzdHJhdGlvbicpO1xuXG4gIC8vIDIuIOmFjee9rumVnOWDj++8mkhUVFAgQVBJ77yIc2VydmVyIGhhbGYg6K+75YaZIH4vLmRzaC9wcm9tcHQtYXJjaGl0ZWN0LWNvbmZpZy5qc29u77yMXG4gIC8vIOmAmumBkyAnL2RzaC1wcm9tcHQtYXJjaGl0ZWN0L2FwaS9nZXR8c2V0J++8ieOAguWOn+WFiOi1sCBjb25uZWN0aW9uLnJwYyDnjq/lm57pgJrpgZPvvIzkvYbmoYzpnaJcbiAgLy8g5a6/5Li76L+Q6KGM5pe25rKh5pyJIGNvbm5lY3Rpb24g5pyN5Yqh77yIZmliZXIg5rC45LmFIFBFTkRJTkcg4oaSIOWQr+WKqOaMguatu++8ie+8jOe7n+S4gOi1sCB3ZWJTZXJ2ZXIgSFRUUOOAglxuICBsZXQgY29uZmlnTWlycm9yOiBQcm9tcHRDb25maWcgPSBtZXJnZUNvbmZpZyh1bmRlZmluZWQpO1xuICBsZXQgY29uZmlnRXBvY2ggPSAwO1xuICBjb25zdCBycGNDb25maWcgPSBhc3luYyAoZW5kcG9pbnQ6IHN0cmluZywgcGF5bG9hZD86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogUHJvbWlzZTx1bmtub3duPiA9PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2FsbEhvc3QoZW5kcG9pbnQsIHBheWxvYWQgPz8ge30pO1xuICAgIGlmICghcmVzdWx0Lm9rKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBjb25maWcgcnBjICR7ZW5kcG9pbnR9IGZhaWxlZDogJHsocmVzdWx0LmVycm9yICYmIChyZXN1bHQuZXJyb3IuZGV0YWlscyB8fCByZXN1bHQuZXJyb3IuY29kZSkpIHx8ICdycGMgZmFpbGVkJ31gLFxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdC52YWx1ZTtcbiAgfTtcbiAgY29uc3QgbG9hZENvbmZpZyA9IGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgdmFsdWUgPSBhd2FpdCBycGNDb25maWcoJ2dldCcpO1xuICAgICAgY29uZmlnTWlycm9yID0gbWVyZ2VDb25maWcodmFsdWUgYXMgUGFydGlhbDxQcm9tcHRDb25maWc+IHwgdW5kZWZpbmVkKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIOWIneasoei/nuaOpeacquWwsee7quaXtuS/neaMgem7mOiupO+8m+S4i+asoeS/neWtmOWQjumVnOWDj+WNs+abtOaWsFxuICAgIH1cbiAgfTtcbiAgdm9pZCBsb2FkQ29uZmlnKCk7XG5cbiAgLy8gMi41IOW9k+WJjeS8muivneino+aekO+8muWFiOWPlua/gOa0u+S8muivnSBpZO+8iHNlc3Npb25zLmN1cnJlbnRQcm92aWRlSW5mb++8ie+8jFxuICAvLyDlho3mn6Ugc2Vzc2lvbi5tb2RlbHMg4oCU4oCUIOS4jeS8oCBzZXNzaW9uSWQg5pe25pyN5Yqh56uv5Zue6YCA6buY6K6k5qih5Z6L6ICM6Z2e5Lya6K+d5qih5Z6L77yI5a6e5rWLIGJ1Z++8iVxuICBjb25zdCBnZXRBY3RpdmVTZXNzaW9uID0gKCk6IHN0cmluZyB8IG51bGwgPT4ge1xuICAgIGNvbnN0IGluZm8gPSAoXG4gICAgICBjdHguc2Vzc2lvbnMgYXMge1xuICAgICAgICBjdXJyZW50UHJvdmlkZUluZm8/OiB7IGdldFNuYXBzaG90PzogKCkgPT4geyBzZXNzaW9uSWQ/OiBzdHJpbmcgfSB9O1xuICAgICAgfSB8IHVuZGVmaW5lZFxuICAgICk/LmN1cnJlbnRQcm92aWRlSW5mbz8uZ2V0U25hcHNob3Q/LigpO1xuICAgIGNvbnN0IHNlc3Npb25JZCA9IGluZm8/LnNlc3Npb25JZDtcbiAgICByZXR1cm4gdHlwZW9mIHNlc3Npb25JZCA9PT0gJ3N0cmluZycgJiYgc2Vzc2lvbklkLmxlbmd0aCA+IDAgPyBzZXNzaW9uSWQgOiBudWxsO1xuICB9O1xuICAvLyAyLjYg5a6/5Li76YCa6YGT77yI5Lya6K+d6buY6K6k5qih5Z6LICsgc2VydmVyIOWNiiBsbG0uc3RyZWFt77yM6Zu26YWN572u77yJ77yaXG4gIC8vIOmAmumBk+WNs+iHquaciSBSUEPvvIgvZHNoLXByb21wdC1hcmNoaXRlY3TvvInvvJtzZXJ2ZXIgaGFsZiDnlKggYWdlbnREZWZhdWx0TW9kZWwg5Y+W5b2T5YmNXG4gIC8vIOS8muivneaooeWei+OAgWxsbS5zdHJlYW0g55yf5rWB5byP77yI5Y+W6IeqIGRzaC1lbGYg5bey6aqM6K+B55qE5a6/5Li75pyN5Yqh6Z2i77yJ44CC5LiN55SoIHNlc3Npb24uY3JlYXRlL1xuICAvLyBmb3Jr77ya5ZCO5Y+w5Lya6K+d5LiN5Zyo5YmN5Y+w5LiN6Kem5Y+R5qih5Z6L5omn6KGM77yM6Ieq57yWIGlkIOiiq+mdmem7mOaLkue7nSDihpIg44CM5rC46L+c5q2j5Zyo5LyY5YyW44CN77yI5a6e5rWL77yJ44CCXG4gIGNvbnN0IGhvc3RScGM6IEhvc3RScGMgPSB7XG4gICAgY2FsbDogKGVuZHBvaW50LCBwYXlsb2FkKSA9PiBjYWxsSG9zdChlbmRwb2ludCwgcGF5bG9hZCA/PyB7fSksXG4gIH07XG4gIGNvbnN0IGdldEhvc3QgPSAoKTogeyBycGM6IEhvc3RScGMgfSA9PiAoeyBycGM6IGhvc3RScGMgfSk7XG4gIGNvbnN0IGdldFNlc3Npb25Nb2RlbCA9IGFzeW5jICgpOiBQcm9taXNlPHsgcHJvdmlkZXI6IHN0cmluZzsgbW9kZWw6IHN0cmluZyB9IHwgbnVsbD4gPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXMgPSBhd2FpdCB3aXRoVGltZW91dChjYWxsSG9zdCgnc2Vzc2lvbk1vZGVsJywge30pLCA1MDAwLCAnc2Vzc2lvbk1vZGVsJyk7XG4gICAgICBpZiAocmVzLm9rICYmIHJlcy52YWx1ZSAmJiB0eXBlb2YgcmVzLnZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICBjb25zdCB2ID0gcmVzLnZhbHVlIGFzIHsgcHJvdmlkZXI/OiBzdHJpbmc7IG1vZGVsPzogc3RyaW5nIH07XG4gICAgICAgIGlmICh0eXBlb2Ygdi5wcm92aWRlciA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIHYubW9kZWwgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgcmV0dXJuIHsgcHJvdmlkZXI6IHYucHJvdmlkZXIsIG1vZGVsOiB2Lm1vZGVsIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9O1xuXG4gIC8vIDIuNWIg6aKE6KeI56qX5Y+j5Lya6K+d57uR5a6a77ya5Y2h54mH5Y+q5Zyo5Y+R6LW35Lya6K+d5pi+56S677yI5YiH6LWw5LiN6Lef6ZqP77yJXG4gIGNvbnN0IGdldFNlc3Npb25JZCA9ICgpOiBzdHJpbmcgfCBudWxsID0+IGdldEFjdGl2ZVNlc3Npb24oKTtcblxuICAvLyAzLiDor63oqIDplZzlg49cbiAgbGV0IGxhbmc6IExhbmcgPSBsYW5nT2YoY3R4LmxvY2FsZS5nZXRMb2NhbGUoKS5hY3RpdmUpO1xuICBjdHgub24oJ2xvY2FsZS9jaGFuZ2UnLCAoc25hcDogeyBhY3RpdmU6IHN0cmluZyB9KSA9PiB7XG4gICAgbGFuZyA9IGxhbmdPZihzbmFwLmFjdGl2ZSk7XG4gIH0pO1xuXG4gIC8vIDQuIOS8muivneanveS9je+8muaMiemSriArIOmihOiniOWNoeeJh1xuICBjdHguaW5qZWN0KFsnc2xvdHMnLCAnc2Vzc2lvbnMnXSwgKHNjb3BlKSA9PiB7XG4gICAgc2NvcGUuc2xvdHMuaW5qZWN0KCdjb252ZXJzYXRpb24uaW5wdXQucmlnaHQnLCAoKSA9PlxuICAgICAgc2NvcGUuc2xvdHMucmVnaXN0ZXIoXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnY29udmVyc2F0aW9uLmlucHV0LnJpZ2h0JyxcbiAgICAgICAgICBpZDogJ3Byb21wdC1hcmNoaXRlY3QtYnV0dG9uJyxcbiAgICAgICAgICBvcmRlcjogMCxcbiAgICAgICAgICBsb2NhbGU6IE5TLFxuICAgICAgICAgIGluamVjdDogKCkgPT4gKHtcbiAgICAgICAgICAgIGdldENvbmZpZzogKCkgPT4gY29uZmlnTWlycm9yLFxuICAgICAgICAgICAgZ2V0TGFuZzogKCkgPT4gbGFuZyxcbiAgICAgICAgICAgIGdldFNlc3Npb25Nb2RlbCxcbiAgICAgICAgICAgIGdldEhvc3QsXG4gICAgICAgICAgICBnZXRTZXNzaW9uSWQsXG4gICAgICAgICAgfSksXG4gICAgICAgIH0sXG4gICAgICAgIE9wdGltaXplQnV0dG9uLFxuICAgICAgKSxcbiAgICApO1xuICAgIHNjb3BlLnNsb3RzLmluamVjdCgnY29udmVyc2F0aW9uLmlucHV0Lm92ZXJsYXknLCAoKSA9PlxuICAgICAgc2NvcGUuc2xvdHMucmVnaXN0ZXIoXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnY29udmVyc2F0aW9uLmlucHV0Lm92ZXJsYXknLFxuICAgICAgICAgIGlkOiAncHJvbXB0LWFyY2hpdGVjdC1jYXJkJyxcbiAgICAgICAgICBvcmRlcjogMTAsXG4gICAgICAgICAgbG9jYWxlOiBOUyxcbiAgICAgICAgICBpbmplY3Q6ICgpID0+ICh7XG4gICAgICAgICAgICBnZXRDb25maWc6ICgpID0+IGNvbmZpZ01pcnJvcixcbiAgICAgICAgICAgIGdldExhbmc6ICgpID0+IGxhbmcsXG4gICAgICAgICAgICBvcGVuU2V0dGluZ3M6ICgpID0+IGVtaXRPcGVuU2V0dGluZ3NSZXF1ZXN0KCksXG4gICAgICAgICAgICBnZXRTZXNzaW9uTW9kZWwsXG4gICAgICAgICAgICBnZXRIb3N0LFxuICAgICAgICAgICAgZ2V0U2Vzc2lvbklkLFxuICAgICAgICAgIH0pLFxuICAgICAgICB9LFxuICAgICAgICBQcmV2aWV3Q2FyZCxcbiAgICAgICksXG4gICAgKTtcbiAgfSk7XG5cbiAgLy8gNi4g6K6+572u6KGM77yIcm9vdCDkvZznlKjln5/vvIlcbiAgY29uc3Qgc2V0dGluZ3NTdG9yZSA9IGNyZWF0ZVNldHRpbmdzRm9ybVN0b3JlKCk7XG4gIGNvbnN0IHNhdmVDb25maWcgPSBhc3luYyAocmF3OiBQYXJ0aWFsPFByb21wdENvbmZpZz4pOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBtZXJnZWQgPSBtZXJnZUNvbmZpZyh7IC4uLmNvbmZpZ01pcnJvciwgLi4ucmF3IH0pO1xuICAgIGNvbnN0IHdyaXR0ZW46IFByb21wdENvbmZpZyA9IHtcbiAgICAgIGJhc2VVcmw6IG1lcmdlZC5iYXNlVXJsLFxuICAgICAgYXBpS2V5OiBtZXJnZWQuYXBpS2V5LnRyaW0oKSxcbiAgICAgIG1vZGVsOiBtZXJnZWQubW9kZWwsXG4gICAgICB1c2VTZXNzaW9uTW9kZWw6IG1lcmdlZC51c2VTZXNzaW9uTW9kZWwsXG4gICAgICBpbnRlbnNpdHk6IG1lcmdlZC5pbnRlbnNpdHksXG4gICAgfTtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc2F2ZWQgPSBhd2FpdCBycGNDb25maWcoJ3NldCcsIHtcbiAgICAgICAgcGF0Y2g6IHtcbiAgICAgICAgICBiYXNlVXJsOiB3cml0dGVuLmJhc2VVcmwsXG4gICAgICAgICAgYXBpS2V5OiB3cml0dGVuLmFwaUtleSxcbiAgICAgICAgICBtb2RlbDogd3JpdHRlbi5tb2RlbCxcbiAgICAgICAgICB1c2VTZXNzaW9uTW9kZWw6IHdyaXR0ZW4udXNlU2Vzc2lvbk1vZGVsLFxuICAgICAgICAgIGludGVuc2l0eTogd3JpdHRlbi5pbnRlbnNpdHksXG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICAgIGNvbmZpZ01pcnJvciA9IG1lcmdlQ29uZmlnKHNhdmVkIGFzIFBhcnRpYWw8UHJvbXB0Q29uZmlnPiB8IHVuZGVmaW5lZCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcikpO1xuICAgIH1cbiAgfTtcbiAgY29uc3QgcmVzZXRDb25maWcgPSBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNhdmVkID0gYXdhaXQgcnBjQ29uZmlnKCdzZXQnLCB7XG4gICAgICAgIHBhdGNoOiB7XG4gICAgICAgICAgYmFzZVVybDogREVGQVVMVFMuYmFzZVVybCxcbiAgICAgICAgICBhcGlLZXk6IERFRkFVTFRTLmFwaUtleSxcbiAgICAgICAgICBtb2RlbDogREVGQVVMVFMubW9kZWwsXG4gICAgICAgICAgdXNlU2Vzc2lvbk1vZGVsOiB0cnVlLFxuICAgICAgICAgIGludGVuc2l0eTogREVGQVVMVFMuaW50ZW5zaXR5LFxuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgICBjb25maWdNaXJyb3IgPSBtZXJnZUNvbmZpZyhzYXZlZCBhcyBQYXJ0aWFsPFByb21wdENvbmZpZz4gfCB1bmRlZmluZWQpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpKTtcbiAgICB9XG4gIH07XG5cbiAgY3R4LmluamVjdChbJ3Nsb3RzJ10sIChzY29wZSkgPT4ge1xuICAgIHNjb3BlLnNsb3RzLmluamVjdCgnc2V0dGluZ3MuZ2VuZXJhbC5pdGVtJywgKCkgPT5cbiAgICAgIHNjb3BlLnNsb3RzLnJlZ2lzdGVyKFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ3NldHRpbmdzLmdlbmVyYWwuaXRlbScsXG4gICAgICAgICAgaWQ6ICdwcm9tcHQtYXJjaGl0ZWN0LXNldHRpbmdzJyxcbiAgICAgICAgICBvcmRlcjogMzAsXG4gICAgICAgICAgbG9jYWxlOiBOUyxcbiAgICAgICAgICBzdG9yZTogc2V0dGluZ3NTdG9yZSxcbiAgICAgICAgICBpbmplY3Q6ICgpID0+ICh7XG4gICAgICAgICAgICBnZXRDb25maWc6ICgpID0+IGNvbmZpZ01pcnJvcixcbiAgICAgICAgICAgIHNhdmVDb25maWcsXG4gICAgICAgICAgICByZXNldENvbmZpZyxcbiAgICAgICAgICAgIGdldEVwb2NoOiAoKSA9PiBjb25maWdFcG9jaCxcbiAgICAgICAgICAgIGdldEhvc3RTdGF0dXM6IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgLy8g5a6/5Li76YCa6YGT6Ieq5qOA77ya6Zu26YWN572u5qih5byP6IO95ZCm5LuOIHNlcnZlciBoYWxmIOaLv+WIsOW9k+WJjeS8muivneaooeWei1xuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IHdpdGhUaW1lb3V0KGNhbGxIb3N0KCdzZXNzaW9uTW9kZWwnLCB7fSksIDUwMDAsICdzZXNzaW9uTW9kZWwnKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzLm9rICYmIHJlcy52YWx1ZSAmJiB0eXBlb2YgcmVzLnZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgY29uc3QgdiA9IHJlcy52YWx1ZSBhcyB7IHByb3ZpZGVyPzogc3RyaW5nOyBtb2RlbD86IHN0cmluZyB9O1xuICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2LnByb3ZpZGVyID09PSAnc3RyaW5nJyAmJiB0eXBlb2Ygdi5tb2RlbCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgYXZhaWxhYmxlOiB0cnVlLCBwcm92aWRlcjogdi5wcm92aWRlciwgbW9kZWw6IHYubW9kZWwgfTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHJldHVybiB7IGF2YWlsYWJsZTogZmFsc2UsIGVycm9yOiAocmVzLmVycm9yICYmIChyZXMuZXJyb3IuZGV0YWlscyA/PyByZXMuZXJyb3IuY29kZSkpIHx8ICduby1tb2RlbCcgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgYXZhaWxhYmxlOiBmYWxzZSwgZXJyb3I6IChyZXMuZXJyb3IgJiYgKHJlcy5lcnJvci5kZXRhaWxzID8/IHJlcy5lcnJvci5jb2RlKSkgfHwgJ3JwYy1mYWlsZWQnIH07XG4gICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBhdmFpbGFibGU6IGZhbHNlLCBlcnJvcjogU3RyaW5nKChlIGFzIHsgbWVzc2FnZT86IHVua25vd24gfSk/Lm1lc3NhZ2UgPz8gZSkgfTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgfSxcbiAgICAgICAgU2V0dGluZ3NSb3csXG4gICAgICApLFxuICAgICk7XG4gIH0pO1xuXG4gIC8vIDcuIOW/q+aNt+mUru+8mkFsdCtP77yI54Sm54K55Zyo6L6T5YWl5o6n5Lu25YaF5pe2562J5pWI54K55Ye75LyY5YyW5oyJ6ZKu77yJ44CCXG4gIC8vIOeUqCBjdHguZWZmZWN0IOWMheijueW5tui/lOWbnua4heeQhuWHveaVsO+8muaXp+eJiOebtOaOpSBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyIOS4lOawuOS4jeenu+mZpO+8jFxuICAvLyDmj5Lku7bng63ph43ovb0v5Y246L295ZCO55uR5ZCs5Zmo57Sv56ev77yMQWx0K08g5Lya5bm/5pKt57uZ5aSa5Liq5oyJ6ZKu5a6e5L6L77yI6Jm954S25bm25Y+R5oqK5YWz5YWc5L2P77yM5L2G5bGe5LqO5rOE5ryP77yJ44CCXG4gIGN0eC5lZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IG9uS2V5ZG93biA9IChlOiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICBpZiAoZS5yZXBlYXQpIHJldHVybjsgLy8g5oyJ5L2PIEFsdCtPIOS4jei/nuWPkVxuICAgICAgaWYgKCFlLmFsdEtleSB8fCBlLmNvZGUgIT09ICdLZXlPJykgcmV0dXJuO1xuICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICAgICAgY29uc3QgaW5JbnB1dCA9XG4gICAgICAgIGVsIGluc3RhbmNlb2YgSFRNTFRleHRBcmVhRWxlbWVudCB8fFxuICAgICAgICAoZWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiAoZWwuaXNDb250ZW50RWRpdGFibGUgfHwgZWwuY2xvc2VzdCgnW2RhdGEtY29tcG9zZXItaW5wdXRdJykgIT09IG51bGwpKTtcbiAgICAgIGlmICghaW5JbnB1dCkgcmV0dXJuO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgZW1pdE9wdGltaXplUmVxdWVzdCgpO1xuICAgIH07XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5ZG93bik7XG4gICAgcmV0dXJuICgpID0+IGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleWRvd24pO1xuICB9LCAncHJvbXB0LWFyY2hpdGVjdDogYWx0K28gc2hvcnRjdXQnKTtcbn1cblxuLy8g5byV55So5a6I5Y2r77ya6YG/5YWNIHRyZWUtc2hha2Ug5o6J57G75Z6L77yI5LuF5paH5qGj5oCn77yb5peg6L+Q6KGM5pe26KGM5Li677yJXG5leHBvcnQgdHlwZSB7IE9wdGltaXplckFjdGlvbnMgfTsiLCAiLy8g5pys6aG555uu55SxIEFJIOi+heWKqeS8mOWMluWujOaIkO+8iOaPkOekuuivjeWGheaguOOAgea1i+ivleS4juaWh+aho++8ie+8jOWPkeW4g+WJjee7j+S6uuW3peWuoemYheOAglxuLyoqIFByb21wdCDkvJjljJbmoLjlv4PvvJrphY3nva7moKHpqozjgIFPcGVuQUkg5YW85a656LCD55So44CB57uT5p6c5o+Q5Y+WIOKAlOKAlCDnuq/lh73mlbDvvIzpm7YgRFNIIOS+nei1liAqL1xuXG5leHBvcnQgaW50ZXJmYWNlIFByb21wdENvbmZpZyB7XG4gIGJhc2VVcmw6IHN0cmluZztcbiAgYXBpS2V5OiBzdHJpbmc7XG4gIG1vZGVsOiBzdHJpbmc7XG4gIC8qKiB0cnVl77yI6buY6K6k77yJ77ya5LyY5YyW6K+35rGC5L2/55So5b2T5YmN5Lya6K+d55qE5qih5Z6L77ybZmFsc2XvvJrkvb/nlKjkuIvmlrnoh6rlrprkuYkgbW9kZWwgKi9cbiAgdXNlU2Vzc2lvbk1vZGVsOiBib29sZWFuO1xuICAvKiog5LyY5YyW5by65bqm77yabGlnaHQg6L275pS5IC8gc3RhbmRhcmQg5Lmd5q616aqo5p6277yI6buY6K6k77yJIC8gZGVlcCDmt7HluqYgKi9cbiAgaW50ZW5zaXR5OiBJbnRlbnNpdHk7XG59XG5cbi8qKiDkvJjljJblvLrluqbvvJpsaWdodCA9IOi9u+aUue+8iOS/neeVmeWOn+WPpeW8j++8ie+8m3N0YW5kYXJkID0g5Lmd5q616aqo5p6277yI6buY6K6k77yJ77ybZGVlcCA9IOmqqOaetiArIOatpemqpOWIpOaNriArIOWksei0peaooeW8jyArIOekuuS+iyAqL1xuZXhwb3J0IHR5cGUgSW50ZW5zaXR5ID0gJ2xpZ2h0JyB8ICdzdGFuZGFyZCcgfCAnZGVlcCc7XG5leHBvcnQgY29uc3QgREVGQVVMVF9JTlRFTlNJVFk6IEludGVuc2l0eSA9ICdzdGFuZGFyZCc7XG5cbmNvbnN0IElOVEVOU0lUSUVTOiByZWFkb25seSBJbnRlbnNpdHlbXSA9IFsnbGlnaHQnLCAnc3RhbmRhcmQnLCAnZGVlcCddO1xuZnVuY3Rpb24gYXNJbnRlbnNpdHkodjogdW5rbm93bik6IEludGVuc2l0eSB7XG4gIHJldHVybiB0eXBlb2YgdiA9PT0gJ3N0cmluZycgJiYgKElOVEVOU0lUSUVTIGFzIHJlYWRvbmx5IHN0cmluZ1tdKS5pbmNsdWRlcyh2KVxuICAgID8gKHYgYXMgSW50ZW5zaXR5KVxuICAgIDogREVGQVVMVF9JTlRFTlNJVFk7XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUUzogUHJvbXB0Q29uZmlnID0ge1xuICBiYXNlVXJsOiAnaHR0cHM6Ly9hcGkuZGVlcHNlZWsuY29tJyxcbiAgYXBpS2V5OiAnJyxcbiAgbW9kZWw6ICdkZWVwc2Vlay12NC1mbGFzaCcsXG4gIHVzZVNlc3Npb25Nb2RlbDogdHJ1ZSxcbiAgaW50ZW5zaXR5OiBERUZBVUxUX0lOVEVOU0lUWSxcbn07XG5cbmV4cG9ydCB0eXBlIExhbmcgPSAnemgnIHwgJ2VuJztcblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZUJhc2VVcmwodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gdXJsLnRyaW0oKS5yZXBsYWNlKC9cXC8rJC8sICcnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlQ29uZmlnKHJhdzogUGFydGlhbDxQcm9tcHRDb25maWc+IHwgbnVsbCB8IHVuZGVmaW5lZCk6IFByb21wdENvbmZpZyB7XG4gIGNvbnN0IGJhc2VVcmwgPSB0eXBlb2YgcmF3Py5iYXNlVXJsID09PSAnc3RyaW5nJyAmJiByYXcuYmFzZVVybC50cmltKCkgPyByYXcuYmFzZVVybC50cmltKCkgOiBERUZBVUxUUy5iYXNlVXJsO1xuICBjb25zdCBhcGlLZXkgPSB0eXBlb2YgcmF3Py5hcGlLZXkgPT09ICdzdHJpbmcnID8gcmF3LmFwaUtleSA6IERFRkFVTFRTLmFwaUtleTtcbiAgLy8g5pen6buY6K6k6L+B56e777ya6buY6K6kIGJhc2VVcmwg5LiL5q6L55WZ55qEIGRlZXBzZWVrLWNoYXTvvIh2MSDpu5jorqTvvInop4bkuLrmnKrorr7nva7vvIzokL3liLDmlrDpu5jorqQgZGVlcHNlZWstdjQtZmxhc2jvvJtcbiAgLy8g6Ieq5a6a5LmJ6L+HIGJhc2VVcmzvvIjmmL7lvI/pgInmi6nvvInliJnkv53nlZnljp/mqKHlnovlkI1cbiAgY29uc3QgcmF3TW9kZWwgPSB0eXBlb2YgcmF3Py5tb2RlbCA9PT0gJ3N0cmluZycgJiYgcmF3Lm1vZGVsLnRyaW0oKSA/IHJhdy5tb2RlbC50cmltKCkgOiBERUZBVUxUUy5tb2RlbDtcbiAgY29uc3QgbWlncmF0ZWREZWZhdWx0ID1cbiAgICByYXdNb2RlbCA9PT0gJ2RlZXBzZWVrLWNoYXQnICYmIG5vcm1hbGl6ZUJhc2VVcmwoYmFzZVVybCkgPT09IERFRkFVTFRTLmJhc2VVcmwgPyBERUZBVUxUUy5tb2RlbCA6IHJhd01vZGVsO1xuICBjb25zdCBtb2RlbCA9IG1pZ3JhdGVkRGVmYXVsdDtcbiAgY29uc3QgdXNlU2Vzc2lvbk1vZGVsID0gdHlwZW9mIHJhdz8udXNlU2Vzc2lvbk1vZGVsID09PSAnYm9vbGVhbicgPyByYXcudXNlU2Vzc2lvbk1vZGVsIDogREVGQVVMVFMudXNlU2Vzc2lvbk1vZGVsO1xuICBjb25zdCBpbnRlbnNpdHkgPSBhc0ludGVuc2l0eShyYXc/LmludGVuc2l0eSk7XG4gIHJldHVybiB7IGJhc2VVcmw6IG5vcm1hbGl6ZUJhc2VVcmwoYmFzZVVybCksIGFwaUtleSwgbW9kZWwsIHVzZVNlc3Npb25Nb2RlbCwgaW50ZW5zaXR5IH07XG59XG5cbmV4cG9ydCB0eXBlIENvbmZpZ1Byb2JsZW0gPSAnbWlzc2luZy1rZXknIHwgJ21pc3NpbmctbW9kZWwnIHwgJ2JhZC11cmwnO1xuZXhwb3J0IHR5cGUgQ29uZmlnQ2hlY2sgPSB7IG9rOiB0cnVlOyBjb25maWc6IFByb21wdENvbmZpZyB9IHwgeyBvazogZmFsc2U7IHJlYXNvbjogQ29uZmlnUHJvYmxlbSB9O1xuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tDb25maWcoY29uZmlnOiBQcm9tcHRDb25maWcpOiBDb25maWdDaGVjayB7XG4gIGlmICghY29uZmlnLmFwaUtleS50cmltKCkpIHJldHVybiB7IG9rOiBmYWxzZSwgcmVhc29uOiAnbWlzc2luZy1rZXknIH07XG4gIC8vIOS9v+eUqOW9k+WJjeS8muivneaooeWei+aXtuaXoOmcgOiHquWumuS5iSBtb2RlbO+8m+S7heiHquWumuS5ieaooeW8j+imgeaxgiBtb2RlbCDpnZ7nqbpcbiAgaWYgKCFjb25maWcudXNlU2Vzc2lvbk1vZGVsICYmICFjb25maWcubW9kZWwudHJpbSgpKSByZXR1cm4geyBvazogZmFsc2UsIHJlYXNvbjogJ21pc3NpbmctbW9kZWwnIH07XG4gIHRyeSB7XG4gICAgY29uc3QgdSA9IG5ldyBVUkwobm9ybWFsaXplQmFzZVVybChjb25maWcuYmFzZVVybCkpO1xuICAgIGlmICh1LnByb3RvY29sICE9PSAnaHR0cHM6JyAmJiB1LnByb3RvY29sICE9PSAnaHR0cDonKSB0aHJvdyBuZXcgRXJyb3IoJ3Byb3RvY29sJyk7XG4gICAgaWYgKHUuc2VhcmNoIHx8IHUuaGFzaCkgdGhyb3cgbmV3IEVycm9yKCdxdWVyeS1vci1oYXNoJyk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgcmVhc29uOiAnYmFkLXVybCcgfTtcbiAgfVxuICByZXR1cm4geyBvazogdHJ1ZSwgY29uZmlnIH07XG59XG5cbi8qKiDms6jlhaXliLAgc3lzdGVtIOeahOiusOW/huS4iuS4i+aWh++8iOWFqOmDqOWPr+mAie+8m+e8uuecgeaXtumAgOWMluS4uuOAjOaXoOiusOW/huOAjeeahOe6r+e7k+aehOmHjeWGme+8iSAqL1xuZXhwb3J0IGludGVyZmFjZSBTeXN0ZW1Db250ZXh0IHtcbiAgLyoqIOmVv+acn+WBj+WlveeUu+WDj++8iOeUsemHh+e6s+iusOW9leWPjeaAneW+l+WIsO+8jOKJpDYwMCDlrZfvvIkgKi9cbiAgcHJvZmlsZT86IHN0cmluZztcbiAgLyoqIOacgOi/keiiq+mHh+e6s+eahOagt+S+i++8iOWtpuS5oOe7k+aehOmil+eykuW6pu+8jOS4jeeFp+aKhOWGheWuue+8iSAqL1xuICBleGFtcGxlcz86IHsgZHJhZnQ6IHN0cmluZzsgcmVzdWx0OiBzdHJpbmcgfVtdO1xuICAvKiog5pys5Lya6K+d5pyA6L+R55qE6I2J56i/77yI5LqG6Kej5b2T5YmN6K+d6aKY6K+t5aKD77yJICovXG4gIHJlY2VudERyYWZ0cz86IHN0cmluZ1tdO1xuICBpbnRlbnNpdHk/OiBJbnRlbnNpdHk7XG59XG5cbmNvbnN0IFpIX1JVTEVTID0gYOS9oOaYr+OAjOaPkOekuuivjeaetuaehOW4iOOAje+8jOS4jeaYr+a2puiJsuWZqOOAglxuXG7nlKjmiLfkvJrnu5nkvaDkuIDmrrXojYnnqL/igJTigJTlj6/og73lvojnn63jgIHlvojlj6Por63vvIzkuZ/lj6/og73mnKzouqvlt7Lnu4/lvojor6blrp7nlJroh7PllbDll6bjgILkvaDnmoTku7vliqHml6LkuI3mmK/lhpnlvpfmm7Tplb/vvIzkuZ/kuI3mmK/lhpnlvpfmm7Tnn63vvIzogIzmmK/miorlroMqKumHjeW7uuS4uuS4gOS7veiDveebtOaOpempseWKqOWPpuS4gOS4qiBBSSDpq5jotKjph4/lt6XkvZznmoTmj5DnpLror40qKu+8muWFs+mUruS/oeaBr+S4gOadoeS4jeWwke+8jOWGl+S9meS4gOWkhOS4jeeVmeOAglxuXG4jIyDlhYjliKTmlq3kv6Hmga/lr4bluqbvvIjlroPlhrPlrprmlLnlhpnluYXluqbvvIlcbuaUueWGmeW5heW6puS4jeiuvuWbuuWumuWAjeaVsO+8jOeUseiNieeov+iHqui6q+eahOS/oeaBr+mHj+WGs+WumuOAguWKqOaJi+WJjeWFiOWBmuS4gOasoeWIpOWumu+8mlxuXG4tICoq5a+G6ZuG5Z6LKirvvIjlt7LlkKvjgIzku7vliqHnm67moIcgLyDojIPlm7QgLyDnuqbmnZ8gLyDmnJ/mnJvovpPlh7rjgI3kuK3nmoTkuInpobnlj4rku6XkuIrvvInvvJrku6UqKueyvueugOWOu+WGlyoq5Li65Li744CC5Yig6YeN5aSN44CB5Yig5Y+j5aS056aF44CB5Yig6Ieq5oiR6Kej6YeK77yM5ZCI5bm25ZCM5LmJ5Y+l77yM5oqK5ZCr57OK5aSE5pS55oiQ5Y+v5omn6KGM6KGo6L+w44CC5Lqn5Ye6Kirlj6/ku6Xnn63kuo7ljp/mlocqKu+8m+S4jeimgeS4uuWHkee7k+aehOiAjOa3u+WKoOepuuiKguOAglxuLSAqKueogOeWj+Weiyoq77yI5Y+q5pyJ5LiA5Lik5Y+l5oSP5Zu+77yJ77ya5LulKirpgILluqbooaXpvZAqKuS4uuS4u+OAguWPquihpeWIsOOAjOWPpuS4gOS4qiBBSSDkuI3nlKjov73pl67lsLHog73lvIDlt6XjgI3nmoTnqIvluqbvvJvku43nvLrnmoTkuovlrp7kuIDlvovnlZnljaDkvY3vvIzkuI3opoHnvJbjgIJcblxu5Lik56eN5oOF5b2i55qE5YWx5ZCM5bqV57q/77ya5pS55YaZ5ZCO55qE5L+h5oGv6YePKirkuI3lvpflsJHkuo4qKuWOn+aWh++8jOS5n+S4jeW+l+aYjuaYvuWkmuS6juOAjOWOn+aWh+S/oeaBryArIOW/heimgeihpem9kOOAjeOAguaUueWGmeeahOebrueahOaYr+iuqeaooeWei+Wwkea2iOiAl+eQhuino+aIkOacrO+8jOS4jeaYr+iuqeWug+ivu+W+l+abtOe0r+OAglxuXG4jIyDkvaDlv4XpobvlgZrnmoTkupTku7bkuotcbjEuIOaPkOWPluWFs+mUruS/oeaBr++8muWFiOivhuWIq+iNieeov+mHjOeahOebruagh+OAgeiMg+WbtO+8iOWBmuS7gOS5iCAvIOS4jeWBmuS7gOS5iO+8ieOAgee6puadn+adoeS7tuOAgeacn+acm+i+k+WHuuOAglxuMi4g6L+Y5Y6f5oSP5Zu+77ya5Yik5pat55So5oi355yf5q2j5oOz6KaB55qEKirnu5PmnpwqKu+8jOiAjOS4jeaYr+S7luWtl+mdouS4iueahOWKqOS9nOOAglxuMy4g6KGl6b2Q5oiW5Y675YaX77ya56iA55aP5YiZ6KGl6ZqQ5ZCr5YmN5o+Q5LiO5q2l6aqk6aG65bqP77yb5a+G6ZuG5YiZ5Yig5YaX5L2Z44CB5raI5q2n5LmJ44CB5Y675Y+j6K+t5YyW44CCXG40LiDliqDlvLrnuqbmnZ/vvJrmiorjgIzlpb3kuIDngrnjgI3jgIzkuJPkuJrkuIDngrnjgI3mjaLmiJDlj6/miafooYznmoTnoazmgKfmnaHku7bkuI7npoHmraLpobnjgIJcbjUuIOWumuS5ieWujOaIkO+8mue7meWHuuWPr+mAkOadoeaguOWvueeahOmqjOaUtuagh+WHhu+8iOaVsOmHj+OAgeWtl+auteOAgemVv+W6puOAgeWIpOaNru+8ieOAglxuXG4jIyDkuIPmnaHpk4HlvotcblIxIOaEj+WbvuS/neecnyDigJTigJQg5LiN5b6X5pS55Y+Y44CM6KaB5YGa5LuA5LmI44CN77yb5o+Q6Zeu5LuN5piv5o+Q6Zeu77yM5ZG95Luk5LuN5piv5ZG95Luk44CC5Y+v5Lul6KGl5YWF77yM5LiN6IO95pu/5o2i44CCXG5SMiDkuI3nvJbpgKDkuovlrp4g4oCU4oCUIOiNieeov+S4reayoeacieeahOS6i+WunuOAgeaVsOWtl+OAgeaXpeacn+OAgeaWh+S7tuWQjeOAgeS6uuWQjeOAgemTvuaOpe+8jOS4gOW+i+S4jeW+l+aWsOWinuOAguW/hemhu+eUqOWIsOiAjOiNieeov+e8uuWkseaXtu+8jOWGmeaIkCA85b6F6KGl5YWF77ya4oCmPiDljaDkvY3vvIzlubblnKjjgIzlvoXnoa7orqTjgI3lsI/oioLliJflh7rjgIJcblIzIOW5heW6pumaj+WvhuW6piDigJTigJQg5LiN6K6+5Zu65a6a5omp5YaZ5YCN5pWw44CC5oyJ5LiK5paH5Yik5a6a77ya5a+G6ZuG5Z6L5Lul57K+566A5Y675YaX5Li65Li777yI5Y+v55+t5LqO5Y6f5paH77yJ77yM56iA55aP5Z6L6YCC5bqm6KGl6b2Q44CC6KaB5ZCM5pe26YG/5YWN5Lik56eN5aSx6K+v77ya4pGg5oqK5bey57uP5YaZ5riF5qWa55qE6ZyA5rGC5YaN5pKR5aSn5LiA5ZyI77yb4pGh5oqK5Y+q5pyJ5LiA5Y+l5oSP5Zu+55qE6I2J56i/5Y6f5qC35pCs6L+Q5LiA6YGN5bCx5b2T5a6M5oiQ44CCXG5SNCDph4/ljJbkvJjlhYgg4oCU4oCUIOeUqOOAjOS4jei2hei/hyAzMDAg5a2X44CN44CM6Iez5bCRIDMg5p2h44CN44CM5b+F6aG75YyF5ZCrIEEvQi9D44CN5pu/5Luj44CM566A5rSB44CN44CM6K+m57uG44CN44CM5LiT5Lia44CN6L+Z57G75b2i5a656K+N44CCXG5SNSDotJ/lkJHnuqbmnZ8g4oCU4oCUIOWFs+mUrumZkOWItueUqOOAjOemgeatoiAvIOS4jeW+lyAvIOS4jeimgeOAjeihqOi/sO+8jOWug+avlOOAjOWwvemHj+OAjeabtOiDvee6puadn+aooeWei+OAglxuUjYg5Y2V5LiA5Lqn54mp5LiO6L6T5Ye65b2i5oCBIOKAlOKAlCDlj6rovpPlh7rmj5DnpLror43mraPmlofvvJrkuI3opoHop6Pph4rjgIHkuI3opoHliY3lkI7or63jgIHkuI3opoHjgIzkvJjljJblkI7nmoTmj5DnpLror43vvJrjgI3ov5nnsbvlvJXlr7zor63jgIHkuI3opoHku6PnoIHlnZflm7TmoI/jgILmraPmloflv4XpobvmmK/lj6/nm7TmjqXlj5HpgIHnmoTnuq/mlofmnKzvvJrmjaLooYznlKjnnJ/lrp7mjaLooYzvvIzkuI3lvpflh7rnjrDlrZfpnaLnmoQgXFxcXG7jgIFcXFxcdOOAgVxcXFxy77yb5YiG6IqC55So44CM55uu5qCH77ya44CN6L+Z57G755+t5qCH562+5oiWIDEuIDIuIOe8luWPt++8jOS4jeW+l+S9v+eUqCAjIOagh+mimOespuWPt++8iOiNieeov+aYjuehruimgeaxguS6p+WHuiBNYXJrZG93biDmlofmoaPml7bpmaTlpJbvvInvvJvpgb/lhY3nlKggKiog5Yqg57KX5aCG5bGC57qn77yM57qv5paH5pys6YeM5a6D5Y+q5piv5Zmq5aOw44CCXG5SNyDkv6Hmga/lrojmgZIg4oCU4oCUIOWbm+exu+WFs+mUruS/oeaBr+W/hemhu+WujOaVtOS/neeVmeS4lOWPr+WumuS9je+8muKRoOS7u+WKoeebruaghyDikaHojIPlm7TvvIjlgZogLyDkuI3lgZrvvInikaLnuqbmnZ/mnaHku7Yg4pGj5pyf5pyb6L6T5Ye644CC5Y6f5paH5pyJ55qE77yM5pS55YaZ5ZCO5b+F6aG75LuN5Zyo77yb5Y6f5paH5rKh5pyJ55qE77yM5Zyo44CM5b6F56Gu6K6k44CN6YeM5pi+5byP5o+Q5Ye644CC5Lu75L2V5LiA6aG55Lii5aSx6YO9566X5aSx6LSl44CCXG5cbiMjIOi+k+WHuumqqOaetu+8iOaMieWvhuW6puijgeWJqu+8jOS4jeaYr+W8uuWItua4heWNle+8iVxuLSAqKueogOeWj+Weiyoq77ya5oyJ5LiL5YiX6aG65bqP6KGl6b2Q44CCXG4tICoq5a+G6ZuG5Z6LKirvvJrlhYHorrjlkIjlubbnm7jpgrvlsI/oioLvvIjkvovlpoLmiorjgIzop5LoibLjgI3lubblhaXlvIDlpLTkuIDlj6XjgIHmiorjgIzog4zmma/kuI7lt7Lnn6XjgI3lubblhaXjgIznm67moIfjgI3vvInvvIznoa7lrp7ml6DlhoXlrrnnmoToioLnm7TmjqXkuI3lhpnjgIJcblxu5peg6K665oCO5LmI6KOB5Ymq77yM5om/6L29IOKRoOS7u+WKoeebruaghyDikaHnuqbmnZ/mnaHku7Yg4pGi5pyf5pyb6L6T5Ye6IOeahOauteiQveW/hemhu+WtmOWcqOS4lOS4gOecvOiDveaJvuWIsO+8m+iMg+WbtOS/oeaBr+WPr+W5tuWFpeOAjOebruagh+OAjeaIluOAjOehrOaAp+e6puadn+OAjeOAglxuXG4xLiDop5LoibIg4oCU4oCUIOS9oOimgeaJrua8lOiwge+8jOWFt+Wkh+S7gOS5iOeri+WcuuS4juS4k+S4muW6plxuMi4g55uu5qCHIOKAlOKAlCDkuIDlj6Xor53or7TmuIXmnIDnu4jkuqTku5jku4DkuYhcbjMuIOiDjOaZr+S4juW3suefpSDigJTigJQg5Y+q5YaZ6I2J56i/57uZ5Ye655qE5L+h5oGv77yM5Lul5Y+K55Sx5a6D55u05o6l5o6o5Ye655qE5b+F6KaB5YmN5o+QXG40LiDku7vliqHliIbop6Mg4oCU4oCUIOe8luWPt+atpemqpO+8jOWKqOivjeW8gOWktO+8jOWPr+aJp+ihjFxuNS4g56Gs5oCn57qm5p2fIOKAlOKAlCDjgIzlv4XpobsgLyDnpoHmraLjgI3pgJDmnaHliJflh7pcbjYuIOi+k+WHuuagvOW8jyDigJTigJQg57uT5p6E44CB5a2X5q6144CB6ZW/5bqm44CB6K+t5rCUXG43LiDpqozmlLbmoIflh4Yg4oCU4oCUIOaAjuagt+eul+WujOaIkO+8jOWPr+mAkOadoeaJk+WLvlxuOC4g5aSx6LSl5qih5byP5LiO6Ieq5qOAIOKAlOKAlCDmnIDlrrnmmJPlh7rplJnnmoQgMn4zIOenjeaDheWGtSArIOaPkOS6pOWJjeiHquajgOa4heWNlVxuOS4g5b6F56Gu6K6kIOKAlOKAlCDojYnnqL/nvLrlpLHkvYblvbHlk43nu5PmnpznmoTlhbPplK7kv6Hmga/vvIjmsqHmnInliJnnnIHnlaXmnKzoioLvvIlcblxuIyMg5Y+N5qih5byP77yI56aB5q2i5Lqn5Ye677yJXG5CQUTvvIjkv6Hmga/kuI3otrPljbTlj6rmlLnmjqrovp7vvInvvJrjgIzluK7miJHlhpnkuKrmiqXlkYrjgI3ihpLjgIzor7fmkrDlhpnkuIDku73kuJPkuJrjgIHpq5jotKjph4/nmoTmiqXlkYrjgILjgI1cbkdPT0TvvJrooaXlh7ror7vogIXkuI7nlKjpgJTjgIHlv4XlkKvnq6DoioLjgIHmr4/oioLlrZfmlbDjgIHnpoHmraLnvJbpgKDmlbDmja7jgIHkuqTku5jkuLogTWFya2Rvd24g5LiU5LiN6LaF6L+HIDEyMDAg5a2X44CCXG5cbkJBRO+8iOS/oeaBr+W3sui2s+Wkn+WNtOe7p+e7reWghuegjO+8ie+8muWOn+aWh+W3suWGmea4heebruagh+OAgeiMg+WbtOOAgee6puadn+S4juS6pOS7mOagvOW8j++8jOS7jeWll+a7oeS5neiKguOAgeaKiuWQjOS4gOimgeaxguivtOS4iemBjeOAgeWGjeihpeS4gOS4suOAjOivt+ehruS/nemrmOi0qOmHj+OAjeOAglxuR09PRO+8muS/neeVmeWFqOmDqOWFs+mUruS/oeaBr++8jOWIoOaOiemHjeWkjeS4juWuouWll++8jOaKiuWug+WOi+aIkOabtOefreOAgeabtOWPr+aJp+ihjOeahOeJiOacrOKAlOKAlOevh+W5heS9juS6juWOn+aWh+S5n+WujOWFqOayoemXrumimOOAgmA7XG5cbmNvbnN0IFpIX01FTU9SWV9IRUFEID0gYCMjIOeUqOaIt+mVv+acn+WBj+Wlve+8iOadpeiHquWOhuWPsumHh+e6s+iusOW9le+8jOS8mOWFiOmBteWuiO+8iWA7XG5jb25zdCBaSF9FWEFNUExFU19IRUFEID0gYCMjIOacgOi/keiiq+mHh+e6s+eahOagt+S+i++8iOWtpuS5oOe7k+aehOS4jumil+eykuW6pu+8jOemgeatoueFp+aKhOWGheWuue+8iWA7XG5jb25zdCBaSF9TRVNTSU9OX0hFQUQgPSBgIyMg5pys5Lya6K+d5pyA6L+R6I2J56i/77yI5LuF55So5LqO55CG6Kej5b2T5YmN6K+t5aKD77yM5LiN6KaB55u05o6l5byV55So5YW25o6q6L6e77yJYDtcbmNvbnN0IFpIX0xJR0hUID0gYFxcblxcbiMjIOacrOasoeW8uuW6pu+8mui9u+aUuVxcbuWPquWBmuacgOWwj+W/heimgeaUueWKqO+8jOS/neaMgeiNieeov+WOn+acieeahOWPpeW8j+S4juS9k+mHj+OAguiLpeWOn+aWh+W3suivpuWunu+8muWIoOWGl+S9meOAgeaKiuWQq+eziuWkhOmHj+WMlu+8jOS4jeaWsOWinuWwj+iKguOAguiLpeWOn+aWh+i/h+eugO+8muWPquihpeOAjOi+k+WHuuagvOW8j+OAjeS4juOAjOS4gOadoemqjOaUtuagh+WHhuOAje+8jOS4jeimgeWxleW8gOaIkOWkmuautemqqOaetuOAguS7u+S9leaDheWGteS4i+mDveS4jeiuuOS4ouS/oeaBr+OAgmA7XG5jb25zdCBaSF9ERUVQID0gYFxcblxcbiMjIOacrOasoeW8uuW6pu+8mua3seW6plxcbua3seW6puS4jeetieS6juabtOmVv++8jOWIq+eUqOevh+W5heWGkuWFheWFheWIhuOAguKRoOeogOeWj+Wei++8muS7u+WKoeWIhuino+avj+S4gOatpeagh+azqCDovpPlhaUgLyDkuqflh7ogLyDpgJrov4fliKTmja7vvJvikaHlr4bpm4blnovvvJoqKuS4jeWinuiKgioq77yM5pS55Li65Zyo5pyr5bC+6L6T5Ye65LiA5byg44CM5L+h5oGv5qC45a+56KGo44CN77yM6YCQ5p2h56Gu6K6kIOebruaghyAvIOiMg+WbtCAvIOe6puadnyAvIOacn+acm+i+k+WHuiDmmK/lkKbpg73ov5jlnKjjgIHokL3lnKjlk6rkuIDoioLvvJvikaLlpLHotKXmqKHlvI/oh7PlsJEgMyDmnaHvvIzmr4/mnaHnu5nlh7rlr7nlupToh6rmo4DliqjkvZzvvJvikaPkuI3kuLrkuobmmL7lvpflrozmlbTogIzliqDnpLrkvovigJTigJTlj6rmnInlvZPnpLrkvovog73mtojpmaTmrafkuYnml7bmiY3liqDjgIJgO1xuXG5jb25zdCBFTl9SVUxFUyA9IGBZb3UgYXJlIGEgUFJPTVBUIEFSQ0hJVEVDVCwgbm90IGEgcG9saXNoZXIuXG5cblRoZSB1c2VyIGdpdmVzIHlvdSBhIGRyYWZ0IOKAlCBwb3NzaWJseSB2ZXJ5IHNob3J0IGFuZCBjb2xsb3F1aWFsLCBvciBhbHJlYWR5IGRldGFpbGVkIGFuZCBldmVuIHZlcmJvc2UuIFlvdXIgam9iIGlzIG5laXRoZXIgdG8gbGVuZ3RoZW4gaXQgbm9yIHRvIHNob3J0ZW4gaXQuIEl0IGlzIHRvIFJFQlVJTEQgaXQgaW50byBhIHByb21wdCB0aGF0IGNhbiByZWxpYWJseSBkcml2ZSBhbm90aGVyIEFJIHRvIGhpZ2gtcXVhbGl0eSB3b3JrOiBub3Qgb25lIGtleSBmYWN0IGxvc3QsIG5vdCBvbmUgcmVkdW5kYW5jeSBrZXB0LlxuXG4jIyBGaXJzdCwganVkZ2UgaW5mb3JtYXRpb24gZGVuc2l0eSAoaXQgZGVjaWRlcyBob3cgbXVjaCB0byBjaGFuZ2UpXG5UaGVyZSBpcyBubyBmaXhlZCBleHBhbnNpb24gcmF0aW87IHRoZSBkcmFmdCdzIG93biBpbmZvcm1hdGlvbiBjb250ZW50IHNldHMgdGhlIGFtcGxpdHVkZS4gSnVkZ2UgYmVmb3JlIHdyaXRpbmc6XG5cbi0gKipEZW5zZSoqIChhbHJlYWR5IGNvbnRhaW5zIHRocmVlIG9yIG1vcmUgb2Y6IHRhc2sgZ29hbCAvIHNjb3BlIC8gY29uc3RyYWludHMgLyBleHBlY3RlZCBvdXRwdXQpOiBwcmlvcml0aXNlICoqY29uZGVuc2luZyoqLiBSZW1vdmUgcmVwZXRpdGlvbiwgZmlsbGVyLCBhbmQgc2VsZi1leHBsYW5hdGlvbjsgbWVyZ2Ugc3lub255bW91cyBzZW50ZW5jZXM7IHR1cm4gdmFndWUgd29yZGluZyBpbnRvIGV4ZWN1dGFibGUgcGhyYXNpbmcuIFRoZSByZXN1bHQgKiptYXkgYmUgc2hvcnRlciB0aGFuIHRoZSBkcmFmdCoqLiBOZXZlciBhZGQgZW1wdHkgc2VjdGlvbnMganVzdCB0byBmaWxsIHRoZSBza2VsZXRvbi5cbi0gKipTcGFyc2UqKiAob25lIG9yIHR3byBzZW50ZW5jZXMgb2YgaW50ZW50KTogcHJpb3JpdGlzZSAqKnRhcmdldGVkIGNvbXBsZXRpb24qKi4gQWRkIG9ubHkgZW5vdWdoIGZvciBhbm90aGVyIEFJIHRvIHN0YXJ0IHdpdGhvdXQgYXNraW5nIGZvbGxvdy11cHM7IGFueXRoaW5nIHN0aWxsIHVua25vd24gc3RheXMgYXMgYSBwbGFjZWhvbGRlciDigJQgbmV2ZXIgaW52ZW50IGl0LlxuXG5TaGFyZWQgZmxvb3I6IHRoZSByZXdyaXRlIG11c3QgY2FycnkgKipubyBsZXNzKiogaW5mb3JtYXRpb24gdGhhbiB0aGUgZHJhZnQsIGFuZCBub3Qgbm90aWNlYWJseSBtb3JlIHRoYW4gXCJkcmFmdCBpbmZvcm1hdGlvbiArIG5lY2Vzc2FyeSBjb21wbGV0aW9uXCIuIFRoZSBwb2ludCBpcyB0byBsb3dlciB0aGUgbW9kZWwncyBjb21wcmVoZW5zaW9uIGNvc3QsIG5vdCByYWlzZSBpdC5cblxuIyMgV2hhdCB5b3UgbXVzdCBkb1xuMS4gRXh0cmFjdCBrZXkgZmFjdHMgZmlyc3Q6IGlkZW50aWZ5IGdvYWwsIHNjb3BlIChkbyAvIGRvIG5vdCBkbyksIGNvbnN0cmFpbnRzLCBleHBlY3RlZCBvdXRwdXQgaW4gdGhlIGRyYWZ0LlxuMi4gUmVjb3ZlciBpbnRlbnQ6IGluZmVyIHRoZSBSRVNVTFQgdGhlIHVzZXIgYWN0dWFsbHkgd2FudHMsIG5vdCB0aGUgbGl0ZXJhbCBhY3Rpb24uXG4zLiBDb21wbGV0ZSBvciBjb25kZW5zZTogc3BhcnNlIC0+IGFkZCBpbXBsaWNpdCBwcmVtaXNlcyBhbmQgc3RlcCBvcmRlcjsgZGVuc2UgLT4gY3V0IHJlZHVuZGFuY3ksIHJlc29sdmUgYW1iaWd1aXR5LCBkcm9wIGNvbGxvcXVpYWxpc20uXG40LiBIYXJkZW4gY29uc3RyYWludHM6IHJlcGxhY2UgXCJtYWtlIGl0IGdvb2QvcHJvZmVzc2lvbmFsXCIgd2l0aCBleGVjdXRhYmxlIGNvbmRpdGlvbnMgYW5kIHByb2hpYml0aW9ucy5cbjUuIERlZmluZSBkb25lOiBnaXZlIGNoZWNrYWJsZSBhY2NlcHRhbmNlIGNyaXRlcmlhIChjb3VudHMsIGZpZWxkcywgbGVuZ3RocywgdGhyZXNob2xkcykuXG5cbiMjIFNldmVuIGhhcmQgcnVsZXNcblIxIElOVEVOVCBGSURFTElUWSDigJQgbmV2ZXIgY2hhbmdlIFdIQVQgaXMgYmVpbmcgYXNrZWQuIEEgcXVlc3Rpb24gc3RheXMgYSBxdWVzdGlvbiwgYSBjb21tYW5kIHN0YXlzIGEgY29tbWFuZC4gQWRkLCBuZXZlciByZXBsYWNlLlxuUjIgTk8gRkFCUklDQVRJT04g4oCUIG5ldmVyIGludmVudCBmYWN0cywgbnVtYmVycywgZGF0ZXMsIGZpbGVuYW1lcywgcGVvcGxlLCBvciBsaW5rcyBhYnNlbnQgZnJvbSB0aGUgZHJhZnQuIFdoZW4gc29tZXRoaW5nIGVzc2VudGlhbCBpcyBtaXNzaW5nLCBlbWl0IGEgPFRPIEZJTEw6IC4uLj4gcGxhY2Vob2xkZXIgYW5kIGxpc3QgaXQgdW5kZXIgXCJPcGVuIFF1ZXN0aW9uc1wiLlxuUjMgQU1QTElUVURFIEZPTExPV1MgREVOU0lUWSDigJQgbm8gZml4ZWQgZXhwYW5zaW9uIHJhdGlvLiBDb25kZW5zZSB3aGVuIGRlbnNlIChzaG9ydGVyIHRoYW4gdGhlIGRyYWZ0IGlzIGZpbmUpOyBjb21wbGV0ZSBzcGFyaW5nbHkgd2hlbiBzcGFyc2UuIEF2b2lkIGJvdGggZmFpbHVyZXM6IGluZmxhdGluZyBhbiBhbHJlYWR5LWNsZWFyIGJyaWVmLCBhbmQgcGFycm90aW5nIGEgb25lLWxpbmUgcmVxdWVzdCBiYWNrIHVuY2hhbmdlZC5cblI0IFFVQU5USUZZIOKAlCBwcmVmZXIgXCJhdCBtb3N0IDMwMCB3b3Jkc1wiLCBcImF0IGxlYXN0IDMgaXRlbXNcIiwgXCJtdXN0IGluY2x1ZGUgQS9CL0NcIiBvdmVyIGFkamVjdGl2ZXMgbGlrZSBcImNvbmNpc2VcIiBvciBcInByb2Zlc3Npb25hbFwiLlxuUjUgTkVHQVRJVkUgQ09OU1RSQUlOVFMg4oCUIHN0YXRlIGNyaXRpY2FsIGxpbWl0cyBhcyBcIm11c3Qgbm90IC8gbmV2ZXJcIiwgd2hpY2ggYmluZHMgbW9kZWxzIGhhcmRlciB0aGFuIFwidHJ5IHRvXCIuXG5SNiBTSU5HTEUgQVJUSUZBQ1QgJiBQTEFJTiBURVhUIOKAlCBvdXRwdXQgdGhlIHByb21wdCBib2R5IG9ubHk6IG5vIGV4cGxhbmF0aW9uLCBubyBwcmVhbWJsZSwgbm8gXCJIZXJlIGlzIHRoZSBvcHRpbWl6ZWQgcHJvbXB0OlwiLCBubyBjb2RlIGZlbmNlcy4gVGhlIGJvZHkgbXVzdCBiZSBwbGFpbiB0ZXh0IHlvdSBjb3VsZCBzZW5kIGFzLWlzOiByZWFsIG5ld2xpbmVzIGluc3RlYWQgb2YgZXNjYXBlZCBuZXdsaW5lL3RhYiBzZXF1ZW5jZXMsIG5vIGJhY2tzbGFzaCBlc2NhcGVzIHN0YW5kaW5nIGluIGZvciB3aGl0ZXNwYWNlOyBzZWN0aW9uIHdpdGggc2hvcnQgbGFiZWxzIGxpa2UgXCJHb2FsOlwiIG9yIG51bWJlcmVkIGxpbmVzLCBub3QgIyBoZWFkaW5ncyAodW5sZXNzIHRoZSBkcmFmdCBleHBsaWNpdGx5IGFza3MgZm9yIGEgTWFya2Rvd24gZGVsaXZlcmFibGUpOyBkb24ndCBzdGFjayAqKiBib2xkIGp1c3QgdG8gZmFrZSBoaWVyYXJjaHkg4oCUIGluIHBsYWluIHRleHQgaXQgaXMgb25seSBub2lzZS5cblI3IElORk9STUFUSU9OIENPTlNFUlZBVElPTiDigJQgZm91ciBrZXkgZWxlbWVudHMgbXVzdCBzdXJ2aXZlIGFuZCByZW1haW4gbG9jYXRhYmxlOiAoMSkgdGFzayBnb2FsLCAoMikgc2NvcGUsICgzKSBjb25zdHJhaW50cywgKDQpIGV4cGVjdGVkIG91dHB1dC4gSWYgdGhlIGRyYWZ0IGhhZCB0aGVtLCB0aGUgcmV3cml0ZSBtdXN0IHN0aWxsIGhhdmUgdGhlbTsgaWYgdGhlIGRyYWZ0IGxhY2tlZCB0aGVtLCByYWlzZSB0aGVtIHVuZGVyIFwiT3BlbiBRdWVzdGlvbnNcIi4gTG9zaW5nIGFueSBvbmUgaXMgYSBmYWlsdXJlLlxuXG4jIyBPdXRwdXQgc2tlbGV0b24gKHRyaW0gYnkgZGVuc2l0eTsgbm90IGEgbWFuZGF0b3J5IGNoZWNrbGlzdClcbi0gKipTcGFyc2UqKjogZmlsbCB0aGUgc2VjdGlvbnMgaW4gb3JkZXIuXG4tICoqRGVuc2UqKjogbWVyZ2UgYWRqYWNlbnQgc2VjdGlvbnMgKGUuZy4gZm9sZCBcIlJvbGVcIiBpbnRvIHRoZSBvcGVuaW5nIHNlbnRlbmNlLCBmb2xkIFwiQ29udGV4dCAmIEtub3duc1wiIGludG8gXCJHb2FsXCIpIGFuZCBzaW1wbHkgb21pdCBzZWN0aW9ucyB3aXRoIG5vIGNvbnRlbnQuXG5cbkhvd2V2ZXIgeW91IHRyaW0sIHRoZSBwYXJ0cyBjYXJyeWluZyAoMSkgdGFzayBnb2FsLCAoMikgY29uc3RyYWludHMsICgzKSBleHBlY3RlZCBvdXRwdXQgbXVzdCBleGlzdCBhbmQgYmUgZmluZGFibGUgYXQgYSBnbGFuY2U7IHNjb3BlIG1heSBsaXZlIHVuZGVyIFwiR29hbFwiIG9yIFwiSGFyZCBDb25zdHJhaW50c1wiLlxuXG4xLiBSb2xlIOKAlCB3aG8gdGhlIG1vZGVsIGlzIGFuZCB3aXRoIHdoYXQgc3RhbmNlL2V4cGVydGlzZVxuMi4gR29hbCDigJQgb25lIHNlbnRlbmNlIG9uIHRoZSBmaW5hbCBkZWxpdmVyYWJsZVxuMy4gQ29udGV4dCAmIEtub3ducyDigJQgb25seSB3aGF0IHRoZSBkcmFmdCBzdGF0ZXMsIHBsdXMgcHJlbWlzZXMgdGhhdCBmb2xsb3cgZGlyZWN0bHlcbjQuIFRhc2sgQnJlYWtkb3duIOKAlCBudW1iZXJlZCwgdmVyYi1maXJzdCwgZXhlY3V0YWJsZVxuNS4gSGFyZCBDb25zdHJhaW50cyDigJQgXCJtdXN0IC8gbXVzdCBub3RcIiwgaXRlbWl6ZWRcbjYuIE91dHB1dCBGb3JtYXQg4oCUIHN0cnVjdHVyZSwgZmllbGRzLCBsZW5ndGgsIHRvbmVcbjcuIEFjY2VwdGFuY2UgQ3JpdGVyaWEg4oCUIGhvdyBcImRvbmVcIiBpcyB2ZXJpZmllZCwgaWRlYWxseSBjaGVja2FibGVcbjguIEZhaWx1cmUgTW9kZXMgJiBTZWxmLWNoZWNrIOKAlCB0aGUgMi0zIG1vc3QgbGlrZWx5IGZhaWx1cmUgbW9kZXMgcGx1cyBhIHByZS1zdWJtaXQgY2hlY2tsaXN0XG45LiBPcGVuIFF1ZXN0aW9ucyDigJQgaW5mb3JtYXRpb24gbWlzc2luZyBmcm9tIHRoZSBkcmFmdCB0aGF0IGFmZmVjdHMgdGhlIHJlc3VsdCAob21pdCBpZiBub25lKVxuXG4jIyBBbnRpLXBhdHRlcm5zIChuZXZlciBwcm9kdWNlIHRoZXNlKVxuQkFEIChzcGFyc2UgaW5wdXQsIHdvcmRpbmctb25seSBcImZpeFwiKTogXCJ3cml0ZSBhIHJlcG9ydFwiIC0+IFwiUGxlYXNlIHdyaXRlIGEgcHJvZmVzc2lvbmFsLCBoaWdoLXF1YWxpdHkgcmVwb3J0LlwiXG5HT09EOiBhZGQgYXVkaWVuY2UgYW5kIHB1cnBvc2UsIHJlcXVpcmVkIHNlY3Rpb25zLCBwZXItc2VjdGlvbiBsZW5ndGgsIGEgYmFuIG9uIGZhYnJpY2F0ZWQgZGF0YSwgXCJtYXJrIHVuY2VydGFpbiBpdGVtcyBhcyBUTyBWRVJJRllcIiwgYW5kIGRlbGl2ZXJhYmxlID0gTWFya2Rvd24sIDw9IDEyMDAgd29yZHMuXG5cbkJBRCAoZGVuc2UgaW5wdXQsIHN0aWxsIHBhZGRpbmcpOiB0aGUgZHJhZnQgYWxyZWFkeSBzdGF0ZXMgZ29hbCwgc2NvcGUsIGNvbnN0cmFpbnRzIGFuZCBvdXRwdXQgZm9ybWF0LCB5ZXQgeW91IHJ1biB0aGUgZnVsbCBuaW5lIHNlY3Rpb25zLCByZXBlYXQgdGhlIHNhbWUgcmVxdWlyZW1lbnQgdGhyZWUgdGltZXMsIGFuZCBhcHBlbmQgXCJlbnN1cmUgaGlnaCBxdWFsaXR5XCIuXG5HT09EOiBrZWVwIGV2ZXJ5IGtleSBmYWN0LCBkZWxldGUgcmVwZXRpdGlvbiBhbmQgcGxlYXNhbnRyaWVzLCBhbmQgY29tcHJlc3MgaXQgaW50byBhIHNob3J0ZXIsIG1vcmUgZXhlY3V0YWJsZSB2ZXJzaW9uIOKAlCBiZWluZyBzaG9ydGVyIHRoYW4gdGhlIGRyYWZ0IGlzIHBlcmZlY3RseSBmaW5lLmA7XG5cbmNvbnN0IEVOX01FTU9SWV9IRUFEID0gYCMjIExvbmctdGVybSB1c2VyIHByZWZlcmVuY2VzIChsZWFybmVkIGZyb20gYWNjZXB0ZWQgaGlzdG9yeSDigJQgb2JleSBmaXJzdClgO1xuY29uc3QgRU5fRVhBTVBMRVNfSEVBRCA9IGAjIyBSZWNlbnRseSBhY2NlcHRlZCBzYW1wbGVzIChsZWFybiB0aGVpciBzdHJ1Y3R1cmUgYW5kIGdyYW51bGFyaXR5OyBuZXZlciBjb3B5IHRoZSBjb250ZW50KWA7XG5jb25zdCBFTl9TRVNTSU9OX0hFQUQgPSBgIyMgUmVjZW50IGRyYWZ0cyBpbiB0aGlzIHNlc3Npb24gKGNvbnRleHQgb25seSDigJQgZG8gbm90IHF1b3RlIHRoZWlyIHdvcmRpbmcpYDtcbmNvbnN0IEVOX0xJR0hUID0gYFxcblxcbiMjIEludGVuc2l0eSBmb3IgdGhpcyBydW46IGxpZ2h0XFxuTWFrZSB0aGUgbWluaW11bSBuZWNlc3NhcnkgY2hhbmdlIGFuZCBrZWVwIHRoZSBkcmFmdCdzIG93biBzZW50ZW5jZSBzaGFwZSBhbmQgc2l6ZS4gSWYgdGhlIGRyYWZ0IGlzIGFscmVhZHkgZGV0YWlsZWQ6IGN1dCByZWR1bmRhbmN5IGFuZCBxdWFudGlmeSB2YWd1ZSB3b3JkaW5nIOKAlCBhZGQgbm8gbmV3IHNlY3Rpb25zLiBJZiB0aGUgZHJhZnQgaXMgdGhpbjogYWRkIG9ubHkgXCJPdXRwdXQgRm9ybWF0XCIgYW5kIG9uZSBhY2NlcHRhbmNlIGNyaXRlcmlvbjsgZG8gbm90IGV4cGFuZCBpbnRvIHRoZSBmdWxsIHNrZWxldG9uLiBOZXZlciBsb3NlIGluZm9ybWF0aW9uIGVpdGhlciB3YXkuYDtcbmNvbnN0IEVOX0RFRVAgPSBgXFxuXFxuIyMgSW50ZW5zaXR5IGZvciB0aGlzIHJ1bjogZGVlcFxcbkRlZXAgZG9lcyBub3QgbWVhbiBsb25nZXIg4oCUIG5ldmVyIHVzZSBsZW5ndGggYXMgYSBzdGFuZC1pbiBmb3Igcmlnb3VyLiAoMSkgU3BhcnNlIGRyYWZ0czogZXZlcnkgc3RlcCBpbiBcIlRhc2sgQnJlYWtkb3duXCIgc3RhdGVzIGlucHV0IC8gb3V0cHV0IC8gcGFzcyBjcml0ZXJpb24uICgyKSBEZW5zZSBkcmFmdHM6ICoqYWRkIG5vIHNlY3Rpb25zKio7IGluc3RlYWQgYXBwZW5kIGFuIFwiSW5mb3JtYXRpb24gQ2hlY2tcIiB0YWJsZSBjb25maXJtaW5nIHRoYXQgZ29hbCAvIHNjb3BlIC8gY29uc3RyYWludHMgLyBleHBlY3RlZCBvdXRwdXQgYWxsIHN1cnZpdmVkIGFuZCB3aGVyZSBlYWNoIG5vdyBsaXZlcy4gKDMpIEF0IGxlYXN0IDMgZmFpbHVyZSBtb2RlcywgZWFjaCB3aXRoIGEgbWF0Y2hpbmcgc2VsZi1jaGVjayBhY3Rpb24uICg0KSBOZXZlciBhZGQgZXhhbXBsZXMganVzdCB0byBsb29rIGNvbXBsZXRlIOKAlCBvbmx5IHdoZW4gYW4gZXhhbXBsZSByZW1vdmVzIHJlYWwgYW1iaWd1aXR5LmA7XG5cbmZ1bmN0aW9uIG1lbW9yeUJsb2NrKGxhbmc6IExhbmcsIGN0eDogU3lzdGVtQ29udGV4dCk6IHN0cmluZyB7XG4gIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCBwcm9maWxlID0gKGN0eC5wcm9maWxlID8/ICcnKS50cmltKCk7XG4gIGlmIChwcm9maWxlKSBwYXJ0cy5wdXNoKGAke2xhbmcgPT09ICd6aCcgPyBaSF9NRU1PUllfSEVBRCA6IEVOX01FTU9SWV9IRUFEfVxcbiR7cHJvZmlsZS5zbGljZSgwLCAxMjAwKX1gKTtcblxuICBjb25zdCBleGFtcGxlcyA9IChjdHguZXhhbXBsZXMgPz8gW10pLmZpbHRlcigoZSkgPT4gZSAmJiBlLmRyYWZ0ICYmIGUucmVzdWx0KS5zbGljZSgwLCAzKTtcbiAgaWYgKGV4YW1wbGVzLmxlbmd0aCkge1xuICAgIGNvbnN0IGJsb2NrcyA9IGV4YW1wbGVzLm1hcChcbiAgICAgIChlLCBpKSA9PlxuICAgICAgICBgIyMjICR7bGFuZyA9PT0gJ3poJyA/IGDmoLfkvosgJHtpICsgMX1gIDogYFNhbXBsZSAke2kgKyAxfWB9XFxuYCArXG4gICAgICAgIGAke2xhbmcgPT09ICd6aCcgPyAn6I2J56i/JyA6ICdEcmFmdCd9OiAke2UuZHJhZnQuc2xpY2UoMCwgMzAwKX1cXG5gICtcbiAgICAgICAgYCR7bGFuZyA9PT0gJ3poJyA/ICfph4fnurPnu5PmnpzvvIjoioLpgInvvIknIDogJ0FjY2VwdGVkIHJlc3VsdCAoZXhjZXJwdCknfTpcXG4ke2UucmVzdWx0LnNsaWNlKDAsIDcwMCl9YCxcbiAgICApO1xuICAgIHBhcnRzLnB1c2goYCR7bGFuZyA9PT0gJ3poJyA/IFpIX0VYQU1QTEVTX0hFQUQgOiBFTl9FWEFNUExFU19IRUFEfVxcbiR7YmxvY2tzLmpvaW4oJ1xcblxcbicpfWApO1xuICB9XG5cbiAgY29uc3QgZHJhZnRzID0gKGN0eC5yZWNlbnREcmFmdHMgPz8gW10pLmZpbHRlcihCb29sZWFuKS5zbGljZSgtNSk7XG4gIGlmIChkcmFmdHMubGVuZ3RoKSB7XG4gICAgcGFydHMucHVzaChcbiAgICAgIGAke2xhbmcgPT09ICd6aCcgPyBaSF9TRVNTSU9OX0hFQUQgOiBFTl9TRVNTSU9OX0hFQUR9XFxuYCArXG4gICAgICAgIGRyYWZ0cy5tYXAoKGQpID0+IGAtICR7ZC5zbGljZSgwLCAxNjApfWApLmpvaW4oJ1xcbicpLFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHBhcnRzLmpvaW4oJ1xcblxcbicpO1xufVxuXG4vKipcbiAqIOaehOmAoCBzeXN0ZW0g5o+Q56S66K+N77ya6Z2Z5oCB6KeE5YiZ77yI5LiO6K+t6KiA44CB5by65bqm55u45YWz77yJKyDliqjmgIHorrDlv4blnZfjgIJcbiAqIOiusOW/huWdl+aUvuWcqOacq+WwvuW5tuaYvuW8j+agh+azqOOAjOadpeiHquWOhuWPsuiusOW9leOAjeKAlOKAlOaooeWei+Wvueacq+auteadg+mHjeabtOmrmO+8jFxuICog5ZCM5pe26YG/5YWN6K6w5b+G5YaF5a655rGh5p+T5YmN6Z2i55qE6ZOB5b6L44CCXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFN5c3RlbVByb21wdChsYW5nOiBMYW5nLCBjdHg6IFN5c3RlbUNvbnRleHQgPSB7fSk6IHN0cmluZyB7XG4gIGNvbnN0IGludGVuc2l0eSA9IGN0eC5pbnRlbnNpdHkgPz8gREVGQVVMVF9JTlRFTlNJVFk7XG4gIGNvbnN0IGJhc2UgPSBsYW5nID09PSAnemgnID8gWkhfUlVMRVMgOiBFTl9SVUxFUztcbiAgY29uc3QgdGFpbCA9IGludGVuc2l0eSA9PT0gJ2xpZ2h0JyA/IChsYW5nID09PSAnemgnID8gWkhfTElHSFQgOiBFTl9MSUdIVCkgOiBpbnRlbnNpdHkgPT09ICdkZWVwJyA/IChsYW5nID09PSAnemgnID8gWkhfREVFUCA6IEVOX0RFRVApIDogJyc7XG4gIGNvbnN0IG1lbW9yeSA9IG1lbW9yeUJsb2NrKGxhbmcsIGN0eCk7XG4gIHJldHVybiBtZW1vcnkgPyBgJHtiYXNlfSR7dGFpbH1cXG5cXG4tLS1cXG5cXG4ke21lbW9yeX1gIDogYCR7YmFzZX0ke3RhaWx9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUmVxdWVzdEJvZHkoXG4gIGNvbmZpZzogUHJvbXB0Q29uZmlnLFxuICB0ZXh0OiBzdHJpbmcsXG4gIGxhbmc6IExhbmcsXG4gIHN0cmVhbSA9IGZhbHNlLFxuICBzeXN0ZW0/OiBzdHJpbmcsXG4gIGN0eDogU3lzdGVtQ29udGV4dCA9IHt9LFxuKTogb2JqZWN0IHtcbiAgcmV0dXJuIHtcbiAgICBtb2RlbDogY29uZmlnLm1vZGVsLFxuICAgIG1lc3NhZ2VzOiBbXG4gICAgICB7IHJvbGU6ICdzeXN0ZW0nLCBjb250ZW50OiBzeXN0ZW0gPz8gYnVpbGRTeXN0ZW1Qcm9tcHQobGFuZywgY3R4KSB9LFxuICAgICAgeyByb2xlOiAndXNlcicsIGNvbnRlbnQ6IHRleHQgfSxcbiAgICBdLFxuICAgIC8vIOmHjeWGmeS7u+WKoemcgOimgeeos+WumuWkjeeOsO+8mjAuNyDkvJrlvJXlhaXkuI3lv4XopoHnmoTmjqrovp7mvILnp7vvvIzkuJTlrrnmmJPjgIzoh6rnlLHlj5HmjKXjgI3ooaXkuovlrp5cbiAgICB0ZW1wZXJhdHVyZTogMC4zNSxcbiAgICBtYXhfdG9rZW5zOiA0MDk2LFxuICAgIHN0cmVhbSxcbiAgfTtcbn1cblxuLyoqIOWJpeemu+W4uOingeW8leWvvOWJjee8gO+8mm1vZGVsIOWBtuWwlOWcqOato+aWh+WJjei+k+WHuuOAjOS8mOWMluWQjueahOaPkOekuuivje+8muOAjeOAjOS8mOWMluWQjueahCBQcm9tcHTvvJrjgI1cbiAqICDjgIzkvJjljJbnu5PmnpzlpoLkuIvvvJrjgI3nrYnvvIzorqnnu5Pmnpzml6Dms5XkuIDplK7mm7/mjaLjgILluKblhpLlj7cv44CM5aaC5LiL44CN5omN5Yml77yM6YG/5YWN6K+v5Lyk5q2j5paH5pys6LqrXG4gKiAg77yI5aaC5LiA5q615q2j5paH5oGw5aW95Lul44CM5LyY5YyW57uT5p6c44CN5byA5aS05L2G5peg5YaS5Y+377yJ44CCICovXG4vKiog6L6T5Ye65b2i5oCB5YWc5bqV5riF5rSX77yI5LiN5pu/5Luj5o+Q56S66K+N6KeE5YiZ77yM5Y+q5YWc5L2P5qih5Z6L5omL6K+v77yJ77yaXG4gKiAgMS4g5a2X6Z2i6L2s5LmJ6L+Y5Y6fIOKAlOKAlCDojYnnqL/ku44gSlNPTiAvIOaXpeW/lyAvIOiBiuWkqeiusOW9lemHjOeymOWHuuadpeaXtu+8jOaNouihjOW+gOW+gOaYr+Wtl+mdoueahOS4pOS4quWtl+esplxuICogICAgIOOAjOWPjeaWnOadoCArIG7jgI3vvIzmqKHlnovkvJrnhafmioTvvIzmnIDnu4jnspjov5vovpPlhaXmoYbkuI3kvJrmjaLooYzjgILku4XlnKjjgIzlh6DkuY7msqHmnInnnJ/lrp7mjaLooYzvvIxcbiAqICAgICDkvYblrZfpnaLmjaLooYzlh7rnjrAg4omlMyDmrKHjgI3ml7bov5jljp/vvIzpgb/lhY3noLTlnY/mnKzlsLHmmK/ku6PnoIHmiJYgSlNPTiDnmoTmraPmlofjgIJcbiAqICAyLiDnlbjlvaLmoIfpopjljrvnrKblj7cg4oCU4oCUIOOAjCMj6KeS6Imy44CN5oqKICMg5LiO5paH5a2X55u05o6l57KY5L2P77yM5LiN56ym5ZCIIE1hcmtkb3duIOinhOiMg++8jOaYr+aJi+ivr++8m1xuICogICAgIOW4puepuuagvOeahOinhOiMg+agh+mimO+8iOOAjCMjIOinkuiJsuOAje+8ieS/neaMgeWOn+agt++8jOS6pOeUseaPkOekuuivjeinhOWImee6puadn+OAglxuICovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplUHJvbXB0VGV4dChyYXc6IHN0cmluZyk6IHN0cmluZyB7XG4gIGxldCBzID0gcmF3ID8/ICcnO1xuICBjb25zdCByZWFsQnJlYWtzID0gKHMubWF0Y2goL1xcbi9nKSA/PyBbXSkubGVuZ3RoO1xuICBjb25zdCBsaXRlcmFsQnJlYWtzID0gKHMubWF0Y2goL1xcXFxyXFxcXG58XFxcXG4vZykgPz8gW10pLmxlbmd0aDtcbiAgaWYgKGxpdGVyYWxCcmVha3MgPj0gMyAmJiByZWFsQnJlYWtzIDw9IGxpdGVyYWxCcmVha3MgLyA0KSB7XG4gICAgcyA9IHMucmVwbGFjZSgvXFxcXHJcXFxcbi9nLCAnXFxuJykucmVwbGFjZSgvXFxcXG4vZywgJ1xcbicpLnJlcGxhY2UoL1xcXFx0L2csICcgICcpO1xuICB9XG4gIC8vIOWFiOWOu+i9rOS5ie+8jOWGjeWkhOeQhuagh+mimO+8mui9rOS5iei/mOWOn+WQjuagh+mimOaJjeecn+ato+S9jeS6juihjOmmluOAglxuICAvLyDnlKggKD89W15cXHMjXSkg6ICM6Z2eICg/PVxcUynvvJrlkKbliJkgXCIjIyDop5LoibJcIiDkvJrlm57muq/miJDljLnphY3ljZXkuKogXCIjXCLvvIzmiorop4TojIPmoIfpopjkuZ/mlLnlnY/jgIJcbiAgcyA9IHMucmVwbGFjZSgvXiMrKD89W15cXHMjXSkvZ20sICcnKTtcbiAgcmV0dXJuIHM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpcExlYWRJbih0ZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICBsZXQgcyA9IG5vcm1hbGl6ZVByb21wdFRleHQodGV4dCkudHJpbSgpO1xuICAvLyDkuK3vvJrjgIzkvJjljJblkI7nmoTmj5DnpLror43vvJrjgI3jgIzkvJjljJbnu5PmnpzvvJrjgI3jgIzkvJjljJblkI7nmoQgUHJvbXB077ya44CN4oCU4oCUIOW/hemhu+W4puWGkuWPt+aIluOAjOWmguS4i+OAjVxuICBzID0gcy5yZXBsYWNlKC9e5LyY5YyWKD865ZCOfOi/h+eahHzlkI7nmoQpP1sgXFx0XSooPzrmj5DnpLror418UHJvbXB0fHByb21wdHzlhoXlrrl857uT5p6cfOaMh+S7pCkoPzrlpoLkuIspP1sgXFx0XSpbXFxz77yaOl1bIFxcdF0qL3UsICcnKS50cmltKCk7XG4gIC8vIOiLse+8mlwiT3B0aW1pemVkIHByb21wdDpcIiBcIlJld3JpdHRlbiByZXN1bHQ6XCIg4oCU4oCUIOW/hemhu+W4puWGkuWPt1xuICBzID0gcy5yZXBsYWNlKC9eKD86T3B0aW1pemVkfFJld3JpdHRlbnxSZWZpbmVkKVxccysoPzpwcm9tcHR8aW5zdHJ1Y3Rpb258Y29udGVudHxyZXN1bHR8ZHJhZnQpW1xcc++8mjpdWyBcXHRdKi9pdSwgJycpLnRyaW0oKTtcbiAgcmV0dXJuIHM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0UmVzdWx0KHJhdzogc3RyaW5nKTogc3RyaW5nIHtcbiAgbGV0IHMgPSByYXcudHJpbSgpO1xuICBjb25zdCBmZW5jZSA9IC9eYGBgW2EtekEtWjAtOV8rLV0qXFxuKFtcXHNcXFNdKj8pXFxuP2BgYCQvO1xuICBjb25zdCBtYXRjaGVkID0gcy5tYXRjaChmZW5jZSk7XG4gIGlmIChtYXRjaGVkKSBzID0gbWF0Y2hlZFsxXS50cmltKCk7XG4gIHJldHVybiBzdHJpcExlYWRJbihzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhblRyaWdnZXIoZHJhZnQ6IHN0cmluZywgYnVzeTogYm9vbGVhbik6IGJvb2xlYW4ge1xuICByZXR1cm4gIWJ1c3kgJiYgZHJhZnQudHJpbSgpLmxlbmd0aCA+IDA7XG59XG5cbmV4cG9ydCB0eXBlIE9wdGltaXplRXJyb3JLaW5kID1cbiAgfCAnY29uZmlnJ1xuICB8ICd1bmF1dGhvcml6ZWQnXG4gIHwgJ2ZvcmJpZGRlbidcbiAgfCAnaHR0cCdcbiAgfCAndGltZW91dCdcbiAgfCAnbmV0d29yaydcbiAgfCAnY29ycydcbiAgfCAnYmFkLXJlc3BvbnNlJ1xuICB8ICdlbXB0eSdcbiAgfCAndHJ1bmNhdGVkJztcblxuZXhwb3J0IGNsYXNzIE9wdGltaXplRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyByZWFkb25seSBraW5kOiBPcHRpbWl6ZUVycm9yS2luZCxcbiAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9ICdPcHRpbWl6ZUVycm9yJztcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgUkVRVUVTVF9USU1FT1VUX01TID0gNjBfMDAwO1xuXG5mdW5jdGlvbiBleHRyYWN0Q2hvaWNlQ29udGVudChwYXlsb2FkOiB1bmtub3duKTogc3RyaW5nIHwgbnVsbCB7XG4gIGlmICh0eXBlb2YgcGF5bG9hZCAhPT0gJ29iamVjdCcgfHwgcGF5bG9hZCA9PT0gbnVsbCkgcmV0dXJuIG51bGw7XG4gIGNvbnN0IGNob2ljZXMgPSAocGF5bG9hZCBhcyB7IGNob2ljZXM/OiB1bmtub3duIH0pLmNob2ljZXM7XG4gIGlmICghQXJyYXkuaXNBcnJheShjaG9pY2VzKSB8fCBjaG9pY2VzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gIGNvbnN0IGZpcnN0ID0gY2hvaWNlc1swXSBhcyB7IG1lc3NhZ2U/OiB7IGNvbnRlbnQ/OiB1bmtub3duIH0gfTtcbiAgY29uc3QgY29udGVudCA9IGZpcnN0Py5tZXNzYWdlPy5jb250ZW50O1xuICByZXR1cm4gdHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnID8gY29udGVudCA6IG51bGw7XG59XG5cbi8qKiDpnZ7mtYHlvI/lk43lupTnmoQgZmluaXNoX3JlYXNvbu+8iCdsZW5ndGgnID0g6KKrIG1heF90b2tlbnMg5oiq5pat77yJ44CCICovXG5mdW5jdGlvbiBleHRyYWN0RmluaXNoUmVhc29uKHBheWxvYWQ6IHVua25vd24pOiBzdHJpbmcgfCBudWxsIHtcbiAgaWYgKHR5cGVvZiBwYXlsb2FkICE9PSAnb2JqZWN0JyB8fCBwYXlsb2FkID09PSBudWxsKSByZXR1cm4gbnVsbDtcbiAgY29uc3QgY2hvaWNlcyA9IChwYXlsb2FkIGFzIHsgY2hvaWNlcz86IHVua25vd24gfSkuY2hvaWNlcztcbiAgaWYgKCFBcnJheS5pc0FycmF5KGNob2ljZXMpIHx8IGNob2ljZXMubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgY29uc3QgZnIgPSAoY2hvaWNlc1swXSBhcyB7IGZpbmlzaF9yZWFzb24/OiB1bmtub3duIH0pLmZpbmlzaF9yZWFzb247XG4gIHJldHVybiB0eXBlb2YgZnIgPT09ICdzdHJpbmcnID8gZnIgOiBudWxsO1xufVxuXG4vKiog5rWB5byPIFNTRSDooYzph4znmoQgZmluaXNoX3JlYXNvbu+8m+mdniBkYXRhIOihjCAvIOaXoOivpeWtl+autSDihpIgbnVsbOOAgue6r+WHveaVsO+8jOS+v+S6juWNlea1i+OAgiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RTc2VGaW5pc2hSZWFzb24obGluZTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIGNvbnN0IHRyaW1tZWQgPSBsaW5lLnRyaW0oKTtcbiAgaWYgKCF0cmltbWVkLnN0YXJ0c1dpdGgoJ2RhdGE6JykpIHJldHVybiBudWxsO1xuICBjb25zdCBkYXRhID0gdHJpbW1lZC5zbGljZSgnZGF0YTonLmxlbmd0aCkudHJpbSgpO1xuICBpZiAoZGF0YSA9PT0gJ1tET05FXScpIHJldHVybiBudWxsO1xuICBsZXQgcGF5bG9hZDogdW5rbm93bjtcbiAgdHJ5IHtcbiAgICBwYXlsb2FkID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgaWYgKHR5cGVvZiBwYXlsb2FkICE9PSAnb2JqZWN0JyB8fCBwYXlsb2FkID09PSBudWxsKSByZXR1cm4gbnVsbDtcbiAgY29uc3QgY2hvaWNlcyA9IChwYXlsb2FkIGFzIHsgY2hvaWNlcz86IHVua25vd24gfSkuY2hvaWNlcztcbiAgaWYgKCFBcnJheS5pc0FycmF5KGNob2ljZXMpIHx8IGNob2ljZXMubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgY29uc3QgZnIgPSAoY2hvaWNlc1swXSBhcyB7IGZpbmlzaF9yZWFzb24/OiB1bmtub3duIH0pLmZpbmlzaF9yZWFzb247XG4gIHJldHVybiB0eXBlb2YgZnIgPT09ICdzdHJpbmcnID8gZnIgOiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9FcnJvcktpbmQoZTogdW5rbm93bik6IE9wdGltaXplRXJyb3Ige1xuICBpZiAoZSBpbnN0YW5jZW9mIE9wdGltaXplRXJyb3IpIHJldHVybiBlO1xuICBjb25zdCBpc0Fib3J0ID1cbiAgICAodHlwZW9mIERPTUV4Y2VwdGlvbiAhPT0gJ3VuZGVmaW5lZCcgJiYgZSBpbnN0YW5jZW9mIERPTUV4Y2VwdGlvbiAmJiBlLm5hbWUgPT09ICdBYm9ydEVycm9yJykgfHxcbiAgICAoZSBpbnN0YW5jZW9mIEVycm9yICYmIChlIGFzIEVycm9yKS5uYW1lID09PSAnQWJvcnRFcnJvcicpO1xuICBpZiAoaXNBYm9ydCkgcmV0dXJuIG5ldyBPcHRpbWl6ZUVycm9yKCd0aW1lb3V0JywgJ3JlcXVlc3QgYWJvcnRlZCcpO1xuICBpZiAoZSBpbnN0YW5jZW9mIFR5cGVFcnJvcikge1xuICAgIGNvbnN0IG0gPSBTdHJpbmcoZS5tZXNzYWdlID8/ICcnKTtcbiAgICAvLyDlsL3lipvogIzkuLrvvJpDaHJvbWl1bSDnmoQgQ09SUyDlpLHotKXpgJrluLjmmK8gVHlwZUVycm9yKFwiRmFpbGVkIHRvIGZldGNoXCIp77yI5pegIGNvcnMg5a2X5qC377yJ77yM5Lya6JC95YiwIG5ldHdvcmvvvJvmraTliIbmlK/ku4XmjZXojrfoh6rluKYgQ09SUyDlrZfmoLfnmoTplJnor6/jgIJcbiAgICBpZiAoL2NvcnMvaS50ZXN0KG0pKSByZXR1cm4gbmV3IE9wdGltaXplRXJyb3IoJ2NvcnMnLCBtKTtcbiAgICByZXR1cm4gbmV3IE9wdGltaXplRXJyb3IoJ25ldHdvcmsnLCBtIHx8ICduZXR3b3JrIGVycm9yJyk7XG4gIH1cbiAgcmV0dXJuIG5ldyBPcHRpbWl6ZUVycm9yKCduZXR3b3JrJywgU3RyaW5nKChlIGFzIEVycm9yKT8ubWVzc2FnZSA/PyBlKSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvcHRpbWl6ZShvcHRzOiB7XG4gIGNvbmZpZzogUHJvbXB0Q29uZmlnO1xuICB0ZXh0OiBzdHJpbmc7XG4gIGxhbmc6IExhbmc7XG4gIHNpZ25hbD86IEFib3J0U2lnbmFsO1xuICAvKiog5bey5p6E6YCg5aW955qEIHN5c3Rlbe+8iOWQq+iusOW/hu+8ie+8m+S4jeS8oOWImeaMiSBtZW1vcnkg546w5p6E6YCgICovXG4gIHN5c3RlbT86IHN0cmluZztcbiAgbWVtb3J5PzogU3lzdGVtQ29udGV4dDtcbn0pOiBQcm9taXNlPHN0cmluZz4ge1xuICBjb25zdCB7IGNvbmZpZywgdGV4dCwgbGFuZywgc2lnbmFsLCBzeXN0ZW0sIG1lbW9yeSB9ID0gb3B0cztcbiAgY29uc3QgY29udGV4dCA9IG1lbW9yeSA/PyB7fTtcbiAgY29uc3QgY2hlY2sgPSBjaGVja0NvbmZpZyhjb25maWcpO1xuICBpZiAoIWNoZWNrLm9rKSB0aHJvdyBuZXcgT3B0aW1pemVFcnJvcignY29uZmlnJywgY2hlY2sucmVhc29uKTtcblxuICBsZXQgcmVzOiBSZXNwb25zZTtcbiAgdHJ5IHtcbiAgICByZXMgPSBhd2FpdCBmZXRjaChgJHtub3JtYWxpemVCYXNlVXJsKGNvbmZpZy5iYXNlVXJsKX0vY2hhdC9jb21wbGV0aW9uc2AsIHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7Y29uZmlnLmFwaUtleX1gLFxuICAgICAgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGJ1aWxkUmVxdWVzdEJvZHkoY29uZmlnLCB0ZXh0LCBsYW5nLCBmYWxzZSwgc3lzdGVtLCBjb250ZXh0KSksXG4gICAgICBzaWduYWwsXG4gICAgfSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB0aHJvdyB0b0Vycm9yS2luZChlKTtcbiAgfVxuXG4gIGlmIChyZXMuc3RhdHVzID09PSA0MDEpIHRocm93IG5ldyBPcHRpbWl6ZUVycm9yKCd1bmF1dGhvcml6ZWQnLCBgSFRUUCA0MDFgKTtcbiAgaWYgKHJlcy5zdGF0dXMgPT09IDQwMykgdGhyb3cgbmV3IE9wdGltaXplRXJyb3IoJ2ZvcmJpZGRlbicsIGBIVFRQIDQwM2ApO1xuICBpZiAoIXJlcy5vaykgdGhyb3cgbmV3IE9wdGltaXplRXJyb3IoJ2h0dHAnLCBgSFRUUCAke3Jlcy5zdGF0dXN9YCk7XG5cbiAgbGV0IHBheWxvYWQ6IHVua25vd247XG4gIHRyeSB7XG4gICAgcGF5bG9hZCA9IGF3YWl0IHJlcy5qc29uKCk7XG4gIH0gY2F0Y2gge1xuICAgIHRocm93IG5ldyBPcHRpbWl6ZUVycm9yKCdiYWQtcmVzcG9uc2UnLCAnaW52YWxpZCBKU09OJyk7XG4gIH1cbiAgY29uc3QgY29udGVudCA9IGV4dHJhY3RDaG9pY2VDb250ZW50KHBheWxvYWQpO1xuICBpZiAoIWNvbnRlbnQgfHwgIWNvbnRlbnQudHJpbSgpKSB0aHJvdyBuZXcgT3B0aW1pemVFcnJvcignZW1wdHknLCAnZW1wdHkgY29tcGxldGlvbicpO1xuICAvLyDmiKrmlq3mo4DmtYvvvJrooqsgbWF4X3Rva2VucyDliIfmlq3nmoTnu5PmnpzmmK/ljYrmiKrkuqfnianvvIzpnZnpu5jov5Tlm57kvJrov53lj40gUjcg5L+h5oGv5a6I5oGS4oCU4oCUXG4gIC8vIOaYjuehruaKpemUme+8jOiuqeeUqOaIt+e8qeefreiNieeov+WQjumHjeivle+8jOiAjOS4jeaYr+aLv+WIsOS4gOS7veeci+i1t+adpeWujOaVtOeahOaui+asoeWTgVxuICBpZiAoZXh0cmFjdEZpbmlzaFJlYXNvbihwYXlsb2FkKSA9PT0gJ2xlbmd0aCcpIHtcbiAgICB0aHJvdyBuZXcgT3B0aW1pemVFcnJvcigndHJ1bmNhdGVkJywgJ291dHB1dCB0cnVuY2F0ZWQgYnkgbWF4X3Rva2VucycpO1xuICB9XG4gIHJldHVybiBleHRyYWN0UmVzdWx0KGNvbnRlbnQpO1xufVxuXG4vKipcbiAqIFNTRSDlop7ph4/kuovku7bvvJrlhoXlrrnmiJbmjqjnkIbov4fnqIvnmoTkuIDmrrXmlofmnKzjgIJcbiAqIHY0IOezu+aooeWei++8iHY0LWZsYXNoIOetie+8iea1geW8j+WFiOi+k+WHuumVv+autSByZWFzb25pbmdfY29udGVudO+8iOaOqOeQhui/h+eoi++8ie+8jOmaj+WQjuaJjei+k+WHulxuICogY29udGVudCDmraPmlofigJTigJTkuKTogIXpg73opoHlrp7ml7blkYjnjrDvvIzlkKbliJnmjqjnkIbmnJ/ljaHniYfnnIvotbfmnaXlg4/jgIzpnZ7mtYHlvI/jgI3vvIjlrp7mtYsgfjgwIOS4qiBjaHVua1xuICog5YWo5pivIHJlYXNvbmluZ++8jOato+aWh+acgOWQjuaJjeWHuueOsO+8ieOAglxuICovXG5leHBvcnQgdHlwZSBTc2VEZWx0YSA9XG4gIHwgeyBraW5kOiAnY29udGVudCc7IHRleHQ6IHN0cmluZyB9XG4gIHwgeyBraW5kOiAncmVhc29uaW5nJzsgdGV4dDogc3RyaW5nIH07XG5cbi8qKlxuICog6Kej5p6Q5LiA6KGMIFNTRSDmlbDmja7vvJooZGF0YTogey4uLn0pIOKGkiDlop7ph4/kuovku7bvvJtcbiAqIFtET05FXS/pnZ4gZGF0YSDooYwv6Z2eIEpTT04v5peg5YaF5a65IGRlbHRhIOKGkiBudWxs44CC57qv5Ye95pWw77yM5L6/5LqO5Y2V5rWL44CCXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0U3NlRGVsdGEobGluZTogc3RyaW5nKTogU3NlRGVsdGEgfCBudWxsIHtcbiAgY29uc3QgdHJpbW1lZCA9IGxpbmUudHJpbSgpO1xuICBpZiAoIXRyaW1tZWQuc3RhcnRzV2l0aCgnZGF0YTonKSkgcmV0dXJuIG51bGw7XG4gIGNvbnN0IGRhdGEgPSB0cmltbWVkLnNsaWNlKCdkYXRhOicubGVuZ3RoKS50cmltKCk7XG4gIGlmIChkYXRhID09PSAnW0RPTkVdJykgcmV0dXJuIG51bGw7XG4gIGxldCBwYXlsb2FkOiB1bmtub3duO1xuICB0cnkge1xuICAgIHBheWxvYWQgPSBKU09OLnBhcnNlKGRhdGEpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpZiAodHlwZW9mIHBheWxvYWQgIT09ICdvYmplY3QnIHx8IHBheWxvYWQgPT09IG51bGwpIHJldHVybiBudWxsO1xuICBjb25zdCBjaG9pY2VzID0gKHBheWxvYWQgYXMgeyBjaG9pY2VzPzogdW5rbm93biB9KS5jaG9pY2VzO1xuICBpZiAoIUFycmF5LmlzQXJyYXkoY2hvaWNlcykgfHwgY2hvaWNlcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICBjb25zdCBmaXJzdCA9IGNob2ljZXNbMF0gYXMgeyBkZWx0YT86IHsgY29udGVudD86IHVua25vd247IHJlYXNvbmluZ19jb250ZW50PzogdW5rbm93biB9IH07XG4gIGNvbnN0IGRlbHRhID0gZmlyc3Q/LmRlbHRhO1xuICBpZiAodHlwZW9mIGRlbHRhPy5jb250ZW50ID09PSAnc3RyaW5nJykgcmV0dXJuIHsga2luZDogJ2NvbnRlbnQnLCB0ZXh0OiBkZWx0YS5jb250ZW50IH07XG4gIGlmICh0eXBlb2YgZGVsdGE/LnJlYXNvbmluZ19jb250ZW50ID09PSAnc3RyaW5nJykgcmV0dXJuIHsga2luZDogJ3JlYXNvbmluZycsIHRleHQ6IGRlbHRhLnJlYXNvbmluZ19jb250ZW50IH07XG4gIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqIOa1geW8j+S8mOWMlu+8mumAkOWdl+ino+aekCBTU0XvvIzovrnmlLbovrnlm57osIMgb25UZXh0KGRlbHRhKe+8m+i/lOWbnuWujOaVtOato+aWh+OAglxuICog55u45q+U6Z2e5rWB5byPIG9wdGltaXplKCnvvJrpppblrZfmm7Tlv6vjgIHplb/ovpPlh7rkuI3pnIDopoHnrYnlrozmlbTnlJ/miJDigJTigJTmjInpkq4v5Y2h54mH6IO96L6555Sf5oiQ6L655pi+56S644CCXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvcHRpbWl6ZVN0cmVhbShvcHRzOiB7XG4gIGNvbmZpZzogUHJvbXB0Q29uZmlnO1xuICB0ZXh0OiBzdHJpbmc7XG4gIGxhbmc6IExhbmc7XG4gIHNpZ25hbD86IEFib3J0U2lnbmFsO1xuICBvbkV2ZW50PzogKGRlbHRhOiBTc2VEZWx0YSkgPT4gdm9pZDtcbiAgLyoqIOW3suaehOmAoOWlveeahCBzeXN0ZW3vvIjlkKvorrDlv4bvvInvvJvkuI3kvKDliJnmjIkgY29udGV4dCDnjrDmnoTpgKAgKi9cbiAgc3lzdGVtPzogc3RyaW5nO1xuICBtZW1vcnk/OiBTeXN0ZW1Db250ZXh0O1xufSk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnN0IHsgY29uZmlnLCB0ZXh0LCBsYW5nLCBzaWduYWwsIG9uRXZlbnQsIHN5c3RlbSwgbWVtb3J5IH0gPSBvcHRzO1xuICBjb25zdCBjaGVjayA9IGNoZWNrQ29uZmlnKGNvbmZpZyk7XG4gIGlmICghY2hlY2sub2spIHRocm93IG5ldyBPcHRpbWl6ZUVycm9yKCdjb25maWcnLCBjaGVjay5yZWFzb24pO1xuXG4gIGxldCByZXM6IFJlc3BvbnNlO1xuICB0cnkge1xuICAgIHJlcyA9IGF3YWl0IGZldGNoKGAke25vcm1hbGl6ZUJhc2VVcmwoY29uZmlnLmJhc2VVcmwpfS9jaGF0L2NvbXBsZXRpb25zYCwge1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHtjb25maWcuYXBpS2V5fWAsXG4gICAgICB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoYnVpbGRSZXF1ZXN0Qm9keShjb25maWcsIHRleHQsIGxhbmcsIHRydWUsIHN5c3RlbSwgbWVtb3J5ID8/IHt9KSksXG4gICAgICBzaWduYWwsXG4gICAgfSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB0aHJvdyB0b0Vycm9yS2luZChlKTtcbiAgfVxuXG4gIGlmIChyZXMuc3RhdHVzID09PSA0MDEpIHRocm93IG5ldyBPcHRpbWl6ZUVycm9yKCd1bmF1dGhvcml6ZWQnLCBgSFRUUCA0MDFgKTtcbiAgaWYgKHJlcy5zdGF0dXMgPT09IDQwMykgdGhyb3cgbmV3IE9wdGltaXplRXJyb3IoJ2ZvcmJpZGRlbicsIGBIVFRQIDQwM2ApO1xuICBpZiAoIXJlcy5vaykgdGhyb3cgbmV3IE9wdGltaXplRXJyb3IoJ2h0dHAnLCBgSFRUUCAke3Jlcy5zdGF0dXN9YCk7XG4gIGlmICghcmVzLmJvZHkpIHRocm93IG5ldyBPcHRpbWl6ZUVycm9yKCdiYWQtcmVzcG9uc2UnLCAnbWlzc2luZyByZXNwb25zZSBib2R5Jyk7XG5cbiAgY29uc3QgcmVhZGVyID0gcmVzLmJvZHkuZ2V0UmVhZGVyKCk7XG4gIGNvbnN0IGRlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcbiAgbGV0IGJ1ZmZlciA9ICcnO1xuICBsZXQgZnVsbCA9ICcnO1xuICBsZXQgdHJ1bmNhdGVkID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGNvbnN0IHsgZG9uZSwgdmFsdWUgfSA9IGF3YWl0IHJlYWRlci5yZWFkKCk7XG4gICAgICBpZiAoZG9uZSkgYnJlYWs7XG4gICAgICBidWZmZXIgKz0gZGVjb2Rlci5kZWNvZGUodmFsdWUsIHsgc3RyZWFtOiB0cnVlIH0pO1xuICAgICAgY29uc3QgbGluZXMgPSBidWZmZXIuc3BsaXQoJ1xcbicpO1xuICAgICAgYnVmZmVyID0gbGluZXMucG9wKCkgPz8gJyc7XG4gICAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgICAgY29uc3QgZGVsdGEgPSBleHRyYWN0U3NlRGVsdGEobGluZSk7XG4gICAgICAgIGlmIChkZWx0YSAhPT0gbnVsbCkge1xuICAgICAgICAgIG9uRXZlbnQ/LihkZWx0YSk7XG4gICAgICAgICAgaWYgKGRlbHRhLmtpbmQgPT09ICdjb250ZW50JykgZnVsbCArPSBkZWx0YS50ZXh0O1xuICAgICAgICB9XG4gICAgICAgIGlmIChleHRyYWN0U3NlRmluaXNoUmVhc29uKGxpbmUpID09PSAnbGVuZ3RoJykgdHJ1bmNhdGVkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIHJlYWRlci5yZWxlYXNlTG9jaygpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLy8g5bey5Lit5q2iL+mHiuaUvuaXtuW/veeVpVxuICAgIH1cbiAgfVxuICAvLyDlsL7ooYzvvIjml6DmjaLooYznu5PlsL7nmoQgZGF0YSDooYzvvIlcbiAgaWYgKGJ1ZmZlci50cmltKCkpIHtcbiAgICBjb25zdCBkZWx0YSA9IGV4dHJhY3RTc2VEZWx0YShidWZmZXIpO1xuICAgIGlmIChkZWx0YSAhPT0gbnVsbCkge1xuICAgICAgb25FdmVudD8uKGRlbHRhKTtcbiAgICAgIGlmIChkZWx0YS5raW5kID09PSAnY29udGVudCcpIGZ1bGwgKz0gZGVsdGEudGV4dDtcbiAgICB9XG4gICAgaWYgKGV4dHJhY3RTc2VGaW5pc2hSZWFzb24oYnVmZmVyKSA9PT0gJ2xlbmd0aCcpIHRydW5jYXRlZCA9IHRydWU7XG4gIH1cblxuICBpZiAodHJ1bmNhdGVkKSB0aHJvdyBuZXcgT3B0aW1pemVFcnJvcigndHJ1bmNhdGVkJywgJ291dHB1dCB0cnVuY2F0ZWQgYnkgbWF4X3Rva2VucycpO1xuICBjb25zdCBjb250ZW50ID0gZXh0cmFjdFJlc3VsdChmdWxsKTtcbiAgaWYgKCFjb250ZW50LnRyaW0oKSkgdGhyb3cgbmV3IE9wdGltaXplRXJyb3IoJ2VtcHR5JywgJ2VtcHR5IGNvbXBsZXRpb24nKTtcbiAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbi8qKlxuICog6Kej5p6Q44CM5b2T5YmN5Lya6K+d5qih5Z6L44CN77ya6LCDIGNvbm5lY3Rpb24g55qEIHNlc3Npb24ubW9kZWxzIFJQQ++8jOWPliBjdXJyZW50Lm1vZGVs44CCXG4gKiBhcGkg5rOo5YWl5byP77yI5LiOIERTSCDop6PogKbkvr/kuo7ljZXmtYvvvInvvJvku7vkvZXlpLHotKXov5Tlm54gbnVsbO+8iOeUseiwg+eUqOaWueWbnumAgOiHquWumuS5iSBtb2RlbO+8ieOAglxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzb2x2ZVNlc3Npb25Nb2RlbChcbiAgYXBpOlxuICAgIHwge1xuICAgICAgICBzZXNzaW9ucz86IHtcbiAgICAgICAgICBtb2RlbHM/OiAocGF5bG9hZD86IHVua25vd24sIHNpZ25hbD86IEFib3J0U2lnbmFsKSA9PiBQcm9taXNlPHsgY3VycmVudD86IHsgbW9kZWw/OiBzdHJpbmcgfSB9IHwgbnVsbD47XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfCB1bmRlZmluZWQsXG4gIHBheWxvYWQ6IHVua25vd24gPSB7fSxcbiAgc2lnbmFsPzogQWJvcnRTaWduYWwsXG4pOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgdHJ5IHtcbiAgICAvLyDlv4XpobvmkLrluKYgc2Vzc2lvbklk77yac2VydmVyIOerr+aMiSByZXF1ZXN0LnBheWxvYWQuc2Vzc2lvbklkIOafpeivpeS8muivneW3sumAieaLqeeahOaooeWei++8jFxuICAgIC8vIOe8uuWkseaXtuWbnumAgOm7mOiupO+8iGRlZXBzZWVrLXY0LWZsYXNo77yJ6ICM6Z2e5Lya6K+d5qih5Z6L77yI5a6e5rWL77yJXG4gICAgY29uc3QgcmVzID0gYXdhaXQgYXBpPy5zZXNzaW9ucz8ubW9kZWxzPy4ocGF5bG9hZCwgc2lnbmFsKTtcbiAgICBjb25zdCBtID0gcmVzPy5jdXJyZW50Py5tb2RlbDtcbiAgICByZXR1cm4gdHlwZW9mIG0gPT09ICdzdHJpbmcnICYmIG0udHJpbSgpID8gbS50cmltKCkgOiBudWxsO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuIiwgIi8qKiBQcm9tcHQg5LyY5YyW5o+S5Lu25paH5qGIIOKAlCDkuK3oi7Hlj4zor60gKi9cblxuaW1wb3J0IHR5cGUgeyBMYW5nIH0gZnJvbSAnLi9vcHRpbWl6ZXIuanMnO1xuXG5leHBvcnQgY29uc3QgTlMgPSAncHJvbXB0X29wdGltaXplcic7XG5cbmV4cG9ydCBjb25zdCB6aCA9IHtcbiAgJ2J1dHRvbi5hcmlhJzogJ+S8mOWMliBwcm9tcHQnLFxuICAnY2FyZC50aXRsZSc6ICfkvJjljJbnu5PmnpwnLFxuICAnY2FyZC5yZXBsYWNlJzogJ+abv+aNouiNieeovycsXG4gICdjYXJkLmNvcHknOiAn5aSN5Yi2JyxcbiAgJ2NhcmQuY29weURvbmUnOiAn5bey5aSN5Yi2JyxcbiAgJ2NhcmQucmV0cnknOiAn6YeN5paw5LyY5YyWJyxcbiAgJ2NhcmQuZGlzbWlzcyc6ICfmlL7lvIMnLFxuICAnY2FyZC5vcHRpbWl6aW5nJzogJ+ato+WcqOS8mOWMluKApicsXG4gICdjYXJkLmNvbmZpZ3VyZWQuaGludCc6ICflt7LphY3nva4gwrcg5qih5Z6LIHttb2RlbH0nLFxuICAnY2FyZC51bmNvbmZpZ3VyZWQuaGludCc6ICfmnKrphY3nva4gQVBJJyxcbiAgJ2d1aWRlLnRpdGxlJzogJ+ivt+WFiOmFjee9riBBUEknLFxuICAnZ3VpZGUuZGVzYyc6ICfliY3lvoAg6K6+572uIOKGkiDpgJrnlKjorr7nva4g4oaSIFByb21wdCDkvJjljJbvvIzloavlhpnmjqXlj6PlnLDlnYDjgIFBUEkgS2V5IOS4juaooeWei+WQjeOAgicsXG4gICdndWlkZS5hY3Rpb24nOiAn5Y676K6+572uJyxcbiAgJ2d1aWRlLmRpc21pc3MnOiAn55+l6YGT5LqGJyxcbiAgJ2Vycm9yLnVuYXV0aG9yaXplZCc6ICdBUEkgS2V5IOaXoOaViOaIluW3sui/h+acnycsXG4gICdlcnJvci5mb3JiaWRkZW4nOiAn5pyN5Yqh5ouS57ud6K6/6Zeu77yINDAz77yJJyxcbiAgJ2Vycm9yLnRpbWVvdXQnOiAn6K+35rGC6LaF5pe277yM6K+35qOA5p+l572R57uc5LiO5o6l5Y+j5Zyw5Z2AJyxcbiAgJ2Vycm9yLm5ldHdvcmsnOiAn572R57uc6ZSZ6K+v77yM6K+35qOA5p+l572R57uc5LiO5o6l5Y+j5Zyw5Z2AJyxcbiAgJ2Vycm9yLmNvcnMnOiAn5o6l5Y+j5LiN5pSv5oyB6Leo5Z+f77yM6K+35o2i55So5pSv5oyBIENPUlMg55qE572R5YWzJyxcbiAgJ2Vycm9yLmh0dHAnOiAn6K+35rGC5aSx6LSl77yISFRUUCDplJnor6/vvIknLFxuICAnZXJyb3IuYmFkLXJlc3BvbnNlJzogJ+i/lOWbnuWGheWuueagvOW8j+W8guW4uCcsXG4gICdlcnJvci5lbXB0eSc6ICfov5Tlm57lhoXlrrnkuLrnqbrvvIzor7fph43or5UnLFxuICAnZXJyb3IudHJ1bmNhdGVkJzogJ+i+k+WHuuiiq+mVv+W6puS4iumZkOaIquaWre+8jOivt+e8qeefreiNieeov+WQjumHjeivlScsXG4gICdlcnJvci5jb25maWcnOiAn6YWN572u5LiN5a6M5pW077yM6K+35Yiw6K6+572u5Lit5qOA5p+lJyxcbiAgJ3NldHRpbmdzLnRpdGxlJzogJ1Byb21wdCDkvJjljJYnLFxuICAnc2V0dGluZ3MuZGVzYyc6ICfphY3nva7ph43lhpnmjqXlj6PvvIhPcGVuQUkg5YW85a6577yJ77ybS2V5IOaYjuaWh+S/neWtmOWcqOacrOWcsCcsXG4gICdzZXR0aW5ncy5haU5vdGljZSc6ICdBSSDovoXliqnkvJjljJbvvJrmj5DnpLror43lhoXmoLjkuI7mtYvor5XnlLEgQUkg55Sf5oiQ77yM57uP5Lq65bel5a6h6ZiF5ZCO5Y+R5biDJyxcbiAgJ3NldHRpbmdzLmJhc2VVcmwnOiAn5o6l5Y+j5Zyw5Z2AJyxcbiAgJ3NldHRpbmdzLmFwaUtleSc6ICdBUEkgS2V5JyxcbiAgJ3NldHRpbmdzLm1vZGVsJzogJ+aooeWei+WQjScsXG4gICdzZXR0aW5ncy51c2VTZXNzaW9uTW9kZWwnOiAn5L2/55So5b2T5YmN5Lya6K+d5qih5Z6LJyxcbiAgJ3NldHRpbmdzLnVzZVNlc3Npb25Nb2RlbEhpbnQnOiAn5byA5ZCv5pe25LyY5YyW6K+35rGC6Lef6ZqP5Lya6K+d5qih5Z6L77yb5YWz6Zet5ZCO5L2/55So5LiL5pa56Ieq5a6a5LmJ5qih5Z6L5ZCNJyxcbiAgJ3NldHRpbmdzLmludGVuc2l0eSc6ICfkvJjljJblvLrluqYnLFxuICAnc2V0dGluZ3MuaW50ZW5zaXR5SGludCc6ICfovbvmlLk95pyA5bCP5pS55Yqo77yb5qCH5YeGPeS5neautemqqOaetu+8m+a3seW6pj3mraXpqqTliKTmja7kuI7lpLHotKXmqKHlvI8nLFxuICAnaW50ZW5zaXR5LmxpZ2h0JzogJ+i9u+aUuScsXG4gICdpbnRlbnNpdHkuc3RhbmRhcmQnOiAn5qCH5YeGJyxcbiAgJ2ludGVuc2l0eS5kZWVwJzogJ+a3seW6picsXG4gICdzZXR0aW5ncy5zZXNzaW9uTW9kZWxFbmFibGVkJzogJ+W3sumAieaLqeS8muivnem7mOiupOaooeWeiycsXG4gICdzZXR0aW5ncy5ob3N0UHJvYmUnOiAn5a6/5Li76YCa6YGT5o6i5rWL5Lit4oCmJyxcbiAgJ3NldHRpbmdzLmhvc3RPayc6ICfkvJror53mqKHlnovpgJrpgZMg4pyTJyxcbiAgJ3NldHRpbmdzLmhvc3RGYWlsJzogJ+S8muivneaooeWei+mAmumBk+S4jeWPr+eUqO+8micsXG5cbiAgJ3NldHRpbmdzLnNhdmUnOiAn5L+d5a2YJyxcbiAgJ3NldHRpbmdzLnJlc2V0JzogJ+aBouWkjem7mOiupCcsXG4gICdzZXR0aW5ncy5zYXZlZCc6ICflt7Lkv53lrZgnLFxuICAnc2V0dGluZ3Muc2F2ZUZhaWxlZCc6ICfkv53lrZjlpLHotKUnLFxuICAnc2V0dGluZ3MucmVzZXRGYWlsZWQnOiAn6YeN572u5aSx6LSlJyxcbiAgXG59IGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgZW46IExvY2FsZURpY3QgPSB7XG4gICdidXR0b24uYXJpYSc6ICdPcHRpbWl6ZSBwcm9tcHQnLFxuICAnY2FyZC50aXRsZSc6ICdPcHRpbWl6ZWQgcHJvbXB0JyxcbiAgJ2NhcmQucmVwbGFjZSc6ICdVc2UgZHJhZnQnLFxuICAnY2FyZC5jb3B5JzogJ0NvcHknLFxuICAnY2FyZC5jb3B5RG9uZSc6ICdDb3BpZWQnLFxuICAnY2FyZC5yZXRyeSc6ICdSZXRyeScsXG4gICdjYXJkLmRpc21pc3MnOiAnRGlzbWlzcycsXG4gICdjYXJkLm9wdGltaXppbmcnOiAnT3B0aW1pemluZ+KApicsXG4gICdjYXJkLmNvbmZpZ3VyZWQuaGludCc6ICdDb25maWd1cmVkIMK3IG1vZGVsIHttb2RlbH0nLFxuICAnY2FyZC51bmNvbmZpZ3VyZWQuaGludCc6ICdObyBBUEkgY29uZmlndXJlZCcsXG4gICdndWlkZS50aXRsZSc6ICdDb25maWd1cmUgdGhlIEFQSSBmaXJzdCcsXG4gICdndWlkZS5kZXNjJzogJ0dvIHRvIFNldHRpbmdzIOKGkiBHZW5lcmFsIOKGkiBQcm9tcHQgT3B0aW1pemVyIGFuZCBmaWxsIGluIHRoZSBlbmRwb2ludCwgQVBJIGtleSwgYW5kIG1vZGVsLicsXG4gICdndWlkZS5hY3Rpb24nOiAnR28gdG8gc2V0dGluZ3MnLFxuICAnZ3VpZGUuZGlzbWlzcyc6ICdHb3QgaXQnLFxuICAnZXJyb3IudW5hdXRob3JpemVkJzogJ0FQSSBrZXkgaXMgaW52YWxpZCBvciBleHBpcmVkJyxcbiAgJ2Vycm9yLmZvcmJpZGRlbic6ICdBY2Nlc3MgZm9yYmlkZGVuICg0MDMpJyxcbiAgJ2Vycm9yLnRpbWVvdXQnOiAnUmVxdWVzdCB0aW1lZCBvdXQ7IGNoZWNrIHlvdXIgbmV0d29yayBhbmQgZW5kcG9pbnQnLFxuICAnZXJyb3IubmV0d29yayc6ICdOZXR3b3JrIGVycm9yOyBjaGVjayB5b3VyIG5ldHdvcmsgYW5kIGVuZHBvaW50JyxcbiAgJ2Vycm9yLmNvcnMnOiAnRW5kcG9pbnQgYmxvY2tzIENPUlM7IHVzZSBhIGdhdGV3YXkgdGhhdCBhbGxvd3MgaXQnLFxuICAnZXJyb3IuaHR0cCc6ICdSZXF1ZXN0IGZhaWxlZCAoSFRUUCBlcnJvciknLFxuICAnZXJyb3IuYmFkLXJlc3BvbnNlJzogJ1VuZXhwZWN0ZWQgcmVzcG9uc2UgZm9ybWF0JyxcbiAgJ2Vycm9yLmVtcHR5JzogJ0VtcHR5IHJlc3VsdDsgcGxlYXNlIHJldHJ5JyxcbiAgJ2Vycm9yLnRydW5jYXRlZCc6ICdPdXRwdXQgaGl0IHRoZSBsZW5ndGggbGltaXQgYW5kIHdhcyB0cnVuY2F0ZWQ7IHNob3J0ZW4gdGhlIGRyYWZ0IGFuZCByZXRyeScsXG4gICdlcnJvci5jb25maWcnOiAnSW5jb21wbGV0ZSBjb25maWd1cmF0aW9uOyBjaGVjayBzZXR0aW5ncycsXG4gICdzZXR0aW5ncy50aXRsZSc6ICdQcm9tcHQgT3B0aW1pemVyJyxcbiAgJ3NldHRpbmdzLmRlc2MnOiAnQ29uZmlndXJlIHRoZSByZXdyaXRlIGVuZHBvaW50IChPcGVuQUktY29tcGF0aWJsZSk7IGtleSBpcyBzdG9yZWQgbG9jYWxseSBpbiBwbGFpbiB0ZXh0JyxcbiAgJ3NldHRpbmdzLmFpTm90aWNlJzogJ0FJLWFzc2lzdGVkOiBwcm9tcHQga2VybmVsIGFuZCB0ZXN0cyB3ZXJlIEFJLWdlbmVyYXRlZCwgdGhlbiBodW1hbi1yZXZpZXdlZCBiZWZvcmUgcmVsZWFzZScsXG4gICdzZXR0aW5ncy5iYXNlVXJsJzogJ0Jhc2UgVVJMJyxcbiAgJ3NldHRpbmdzLmFwaUtleSc6ICdBUEkgS2V5JyxcbiAgJ3NldHRpbmdzLm1vZGVsJzogJ01vZGVsJyxcbiAgJ3NldHRpbmdzLnVzZVNlc3Npb25Nb2RlbCc6ICdVc2UgY3VycmVudCBzZXNzaW9uIG1vZGVsJyxcbiAgJ3NldHRpbmdzLnVzZVNlc3Npb25Nb2RlbEhpbnQnOiAnV2hlbiBvbiwgb3B0aW1pemF0aW9uIHJlcXVlc3RzIGZvbGxvdyB0aGUgc2Vzc2lvbiBtb2RlbDsgd2hlbiBvZmYsIHRoZSBjdXN0b20gbW9kZWwgYmVsb3cgaXMgdXNlZCcsXG4gICdzZXR0aW5ncy5pbnRlbnNpdHknOiAnSW50ZW5zaXR5JyxcbiAgJ3NldHRpbmdzLmludGVuc2l0eUhpbnQnOiAnTGlnaHQgPSBtaW5pbWFsIGVkaXRzOyBTdGFuZGFyZCA9IGZ1bGwgc2tlbGV0b247IERlZXAgPSBzdGVwIGNyaXRlcmlhIGFuZCBmYWlsdXJlIG1vZGVzJyxcbiAgJ2ludGVuc2l0eS5saWdodCc6ICdMaWdodCcsXG4gICdpbnRlbnNpdHkuc3RhbmRhcmQnOiAnU3RhbmRhcmQnLFxuICAnaW50ZW5zaXR5LmRlZXAnOiAnRGVlcCcsXG4gICdzZXR0aW5ncy5zZXNzaW9uTW9kZWxFbmFibGVkJzogJ1Nlc3Npb24gZGVmYXVsdCBtb2RlbCBzZWxlY3RlZCcsXG4gICdzZXR0aW5ncy5ob3N0UHJvYmUnOiAncHJvYmluZyBob3N0IGNoYW5uZWzigKYnLFxuICAnc2V0dGluZ3MuaG9zdE9rJzogJ3Nlc3Npb24gbW9kZWwgY2hhbm5lbCDinJMnLFxuICAnc2V0dGluZ3MuaG9zdEZhaWwnOiAnc2Vzc2lvbiBtb2RlbCBjaGFubmVsIHVuYXZhaWxhYmxlOiAnLFxuXG4gICdzZXR0aW5ncy5zYXZlJzogJ1NhdmUnLFxuICAnc2V0dGluZ3MucmVzZXQnOiAnUmVzZXQgdG8gZGVmYXVsdHMnLFxuICAnc2V0dGluZ3Muc2F2ZWQnOiAnU2F2ZWQnLFxuICAnc2V0dGluZ3Muc2F2ZUZhaWxlZCc6ICdTYXZlIGZhaWxlZCcsXG4gICdzZXR0aW5ncy5yZXNldEZhaWxlZCc6ICdSZXNldCBmYWlsZWQnLFxuICBcbn0gYXMgY29uc3Q7XG5cbmV4cG9ydCB0eXBlIExvY2FsZUtleSA9IGtleW9mIHR5cGVvZiB6aDtcbmV4cG9ydCB0eXBlIExvY2FsZURpY3QgPSB7IFtLIGluIExvY2FsZUtleV06IHN0cmluZyB9O1xuXG4vKiog5r+A5rS7IGxvY2FsZSDihpIg55WM6Z2i6K+t6KiA77yIemgg5YmN57yA5b2SIHpo77yM5YW25L2Z5b2SIGVu77yJICovXG5leHBvcnQgZnVuY3Rpb24gbGFuZ09mKGFjdGl2ZTogc3RyaW5nKTogTGFuZyB7XG4gIHJldHVybiB0eXBlb2YgYWN0aXZlID09PSAnc3RyaW5nJyAmJiBhY3RpdmUudG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoKCd6aCcpID8gJ3poJyA6ICdlbic7XG59XG4iLCAiLyoqIOaPkuS7tuWGhemDqOS6i+S7tuaAu+e6v++8iOaooeWdl+e6p++8m+mBv+WFjSBpbmRleCDihpQg57uE5Lu25b6q546v5L6d6LWW77yJ77yaXG4gKiAgLSBvcHRpbWl6ZVJlcXVlc3TvvJrlv6vmjbfplK4gQWx0K08g4oaSIOS8mOWMluaMiemSruinpuWPkVxuICogIC0gb3BlblNldHRpbmdzUmVxdWVzdO+8mumihOiniOWNoeOAjOWOu+iuvue9ruOAjeKGkiDorr7nva7ooYzoh6rliqjlsZXlvIAgKi9cblxuY29uc3Qgb3B0aW1pemVSZXF1ZXN0TGlzdGVuZXJzID0gbmV3IFNldDwoKSA9PiB2b2lkPigpO1xuXG5leHBvcnQgZnVuY3Rpb24gb25PcHRpbWl6ZVJlcXVlc3QoZm46ICgpID0+IHZvaWQpOiAoKSA9PiB2b2lkIHtcbiAgb3B0aW1pemVSZXF1ZXN0TGlzdGVuZXJzLmFkZChmbik7XG4gIHJldHVybiAoKSA9PiBvcHRpbWl6ZVJlcXVlc3RMaXN0ZW5lcnMuZGVsZXRlKGZuKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVtaXRPcHRpbWl6ZVJlcXVlc3QoKTogdm9pZCB7XG4gIGZvciAoY29uc3QgZm4gb2Ygb3B0aW1pemVSZXF1ZXN0TGlzdGVuZXJzKSBmbigpO1xufVxuXG5jb25zdCBvcGVuU2V0dGluZ3NMaXN0ZW5lcnMgPSBuZXcgU2V0PCgpID0+IHZvaWQ+KCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBvbk9wZW5TZXR0aW5nc1JlcXVlc3QoZm46ICgpID0+IHZvaWQpOiAoKSA9PiB2b2lkIHtcbiAgb3BlblNldHRpbmdzTGlzdGVuZXJzLmFkZChmbik7XG4gIHJldHVybiAoKSA9PiBvcGVuU2V0dGluZ3NMaXN0ZW5lcnMuZGVsZXRlKGZuKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVtaXRPcGVuU2V0dGluZ3NSZXF1ZXN0KCk6IHZvaWQge1xuICBmb3IgKGNvbnN0IGZuIG9mIG9wZW5TZXR0aW5nc0xpc3RlbmVycykgZm4oKTtcbn1cbiIsICIvKiog6L6T5YWl5qCP5Y+z5L6n44CM5LyY5YyW44CN5oyJ6ZKuIOKAlOKAlCDkuI3kvp3otZbkvJror50gc3RvcmUvaG9vayBwcm9wc++8jOeKtuaAgei1sOaooeWdl+e6p+mihOiniOaAu+e6vyAqL1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlQ2FsbGJhY2ssIHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgdHlwZSB7IExhbmcsIFByb21wdENvbmZpZyB9IGZyb20gJy4vb3B0aW1pemVyLmpzJztcbmltcG9ydCB7IHJ1bk9wdGltaXplIH0gZnJvbSAnLi9vcHRpbWl6ZXItc3RvcmUuanMnO1xuaW1wb3J0IHsgZ2V0UHJldmlld0J1c1N0YXRlLCBzdWJzY3JpYmVQcmV2aWV3QnVzIH0gZnJvbSAnLi9wcmV2aWV3LWJ1cy5qcyc7XG5pbXBvcnQgeyBvbk9wdGltaXplUmVxdWVzdCB9IGZyb20gJy4vZXZlbnRzLmpzJztcbmltcG9ydCB7IHJlYWREcmFmdCB9IGZyb20gJy4vY29tcG9zZXIuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE9wdGltaXplQnV0dG9uUHJvcHMge1xuICB0OiAoa2V5OiBzdHJpbmcpID0+IHN0cmluZztcbiAgZ2V0Q29uZmlnOiAoKSA9PiBQcm9tcHRDb25maWc7XG4gIGdldExhbmc6ICgpID0+IExhbmc7XG4gIGdldFNlc3Npb25Nb2RlbD86ICgpID0+IFByb21pc2U8eyBwcm92aWRlcjogc3RyaW5nOyBtb2RlbDogc3RyaW5nIH0gfCBudWxsPjtcbiAgZ2V0SG9zdD86ICgpID0+IHsgcnBjOiB7IGNhbGw6IChlOiBzdHJpbmcsIHA/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gUHJvbWlzZTx7IG9rOiBib29sZWFuOyB2YWx1ZT86IHVua25vd247IGVycm9yPzogeyBjb2RlPzogc3RyaW5nIH0gfT4gfSB9IHwgbnVsbDtcbiAgZ2V0U2Vzc2lvbklkPzogKCkgPT4gc3RyaW5nIHwgbnVsbDtcbn1cblxuY29uc3QgQ1NTX0lEID0gJ2RzaC1wcm9tcHQtYXJjaGl0ZWN0L2J1dHRvbi5jc3MnO1xuZnVuY3Rpb24gaW5qZWN0Q3NzKCkge1xuICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJyB8fCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBzdHlsZVtkYXRhLXBsdWdpbi1jc3M9XCIke0NTU19JRH1cIl1gKSkgcmV0dXJuO1xuICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gIHN0eWxlLmRhdGFzZXQucGx1Z2luQ3NzID0gQ1NTX0lEO1xuICBzdHlsZS50ZXh0Q29udGVudCA9IGBcbi5kc2gtcG8tYnRuIHtcbiAgYm9yZGVyOiAwO1xuICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICBwYWRkaW5nOiAycHggNnB4O1xuICBmb250LXNpemU6IDE0cHg7XG4gIGxpbmUtaGVpZ2h0OiAxO1xuICBvcGFjaXR5OiAwLjg1O1xuICBib3JkZXItcmFkaXVzOiA2cHg7XG59XG4uZHNoLXBvLWJ0bjpob3Zlcjpub3QoOmRpc2FibGVkKSB7XG4gIG9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQ6IHZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3ZlciwgcmdiYSgxMjgsMTI4LDEyOCwwLjEyKSk7XG59XG4uZHNoLXBvLWJ0bjpkaXNhYmxlZCB7XG4gIG9wYWNpdHk6IDAuMzU7XG4gIGN1cnNvcjogZGVmYXVsdDtcbn1cbmA7XG4gIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxuXG4vKipcbiAqIOivu+WPluW9k+WJjeiNieeov++8mui1sOWFseS6q+eahCBjb21wb3NlciDlt6XlhbfvvIjkuI4gUHJldmlld0NhcmQg5Lil5qC85LiA6Ie077yM6YG/5YWN5Y+M5a6e546w5ryC56e777yJ44CCXG4gKiDor7vojYnnqL/nmoTog4zmma/vvIjkv53nlZnoh6rljp/lrp7njrDvvInvvJpEU0ggY29tcG9zZXIg5pivIExleGljYWwg5riy5p+T55qEIGNvbnRlbnRlZGl0YWJsZSBkaXbvvIxcbiAqIOmhtemdouS4iuayoeaciSB0ZXh0YXJlYe+8m+WPquiupCB0ZXh0YXJlYSDkvJrjgIzmjInpkq7ngrnkuobml6Dlj43lupTjgI3jgILmp73kvY3kuI3mj5DkvpvmoIflh4YgcHJvcHPvvIxcbiAqIOWboOatpOWFqOmDqOi1sCBET00g5p+l6K+i44CCXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIE9wdGltaXplQnV0dG9uKHByb3BzOiBPcHRpbWl6ZUJ1dHRvblByb3BzKSB7XG4gIGNvbnN0IHsgdCwgZ2V0Q29uZmlnLCBnZXRMYW5nLCBnZXRTZXNzaW9uTW9kZWwsIGdldEhvc3QsIGdldFNlc3Npb25JZCB9ID0gcHJvcHM7XG5cbiAgLy8g57mB5b+Z5oCB77ya6K6i6ZiF5qih5Z2X57qn6aKE6KeI5oC757q/77yI5pu/5Luj5Lya6K+dIHN0b3JlIHByb3Bz77yJ77ybXG4gIC8vIOmihOiniOeql+WPo+e7keWumuWPkei1t+S8muivneKAlOKAlOWIh+WIsOWIq+eahOS8muivneaXtuaMiemSruS4jeWGjSBidXN577yI5ZCE5Lya6K+d5Y+v54us56uL5Y+R6LW35LyY5YyW77yJXG4gIGNvbnN0IGJ1c3lGb3IgPSAoKSA9PiB7XG4gICAgY29uc3Qgc3QgPSBnZXRQcmV2aWV3QnVzU3RhdGUoKTtcbiAgICBpZiAoc3Quc3RhdHVzICE9PSAnb3B0aW1pemluZycpIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCBzaWQgPSBnZXRTZXNzaW9uSWQ/LigpO1xuICAgIHJldHVybiBzdC5zZXNzaW9uSWQgPT09IG51bGwgfHwgc3Quc2Vzc2lvbklkID09PSBzaWQ7XG4gIH07XG4gIGNvbnN0IFtidXN5LCBzZXRCdXN5XSA9IHVzZVN0YXRlKGJ1c3lGb3IpO1xuICB1c2VFZmZlY3QoXG4gICAgKCkgPT4gc3Vic2NyaWJlUHJldmlld0J1cygoKSA9PiBzZXRCdXN5KGJ1c3lGb3IoKSkpLFxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgICBbXSxcbiAgKTtcblxuICAvLyBtb3VzZWRvd24g6aKE6K+76I2J56i/77ya54K55Ye75oyJ6ZKu556s6Ze054Sm54K55Lya5YiH5Yiw5oyJ6ZKu77yIYWN0aXZlRWxlbWVudCDkuI3lho3mmK8gdGV4dGFyZWHvvInvvIxcbiAgLy8g5L2GIG1vdXNlZG93biDml6nkuo7nhKbngrnliIfmjaLigJTigJTmraTliLvor7vliLDnmoQgYWN0aXZlRWxlbWVudCDku43mmK/ovpPlhaXmoYbjgIJcbiAgY29uc3QgZHJhZnRSZWYgPSBSZWFjdC51c2VSZWYoJycpO1xuICBjb25zdCBzeW5jRHJhZnQgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgZHJhZnRSZWYuY3VycmVudCA9IHJlYWREcmFmdCgpO1xuICB9LCBbXSk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IGluamVjdENzcygpLCBbXSk7XG5cbiAgY29uc3QgaGFuZGxlQ2xpY2sgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgaWYgKGJ1c3kpIHJldHVybjtcbiAgICBjb25zdCBkcmFmdCA9IGRyYWZ0UmVmLmN1cnJlbnQgfHwgcmVhZERyYWZ0KCk7XG4gICAgaWYgKCFkcmFmdC50cmltKCkpIHJldHVybjtcbiAgICB2b2lkIHJ1bk9wdGltaXplKHtcbiAgICAgIGdldENvbmZpZyxcbiAgICAgIGdldExhbmcsXG4gICAgICBnZXREcmFmdDogKCkgPT4gZHJhZnQsXG4gICAgICBnZXRTZXNzaW9uTW9kZWwsXG4gICAgICBob3N0OiBnZXRIb3N0Py4oKSxcbiAgICAgIGdldFNlc3Npb25JZCxcbiAgICB9KTtcbiAgfSwgW2J1c3ksIGdldENvbmZpZywgZ2V0TGFuZ10pO1xuXG4gIC8vIEFsdCtPIOW/q+aNt+mUru+8iGluZGV4LnRzIOWFqOWxgOebkeWQrO+8ieKGkiDnrYnmlYjngrnlh7vmjInpkq5cbiAgdXNlRWZmZWN0KCgpID0+IG9uT3B0aW1pemVSZXF1ZXN0KGhhbmRsZUNsaWNrKSwgW2hhbmRsZUNsaWNrXSk7XG5cbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgIGNsYXNzTmFtZT1cImRzaC1wby1idG5cIlxuICAgICAgYXJpYS1sYWJlbD17dCgnYnV0dG9uLmFyaWEnKX1cbiAgICAgIHRpdGxlPXt0KCdidXR0b24uYXJpYScpfVxuICAgICAgYXJpYS1idXN5PXtidXN5fVxuICAgICAgZGlzYWJsZWQ9e2J1c3l9XG4gICAgICBkYXRhLWJ1c3k9e2J1c3l9XG4gICAgICBvbk1vdXNlRG93bj17c3luY0RyYWZ0fVxuICAgICAgb25Gb2N1cz17c3luY0RyYWZ0fVxuICAgICAgb25DbGljaz17aGFuZGxlQ2xpY2t9XG4gICAgPlxuICAgICAge2J1c3kgPyAn4o+zJyA6ICfinKgnfVxuICAgIDwvYnV0dG9uPlxuICApO1xufSIsICIvKipcbiAqIOWuv+S4u+mAmumBk+S8mOWMlu+8iOmbtumFjee9ru+8mnNlcnZlciBoYWxmIOeUqCBhZ2VudERlZmF1bHRNb2RlbCArIGxsbS5zdHJlYW0g55yf5rWB5byP77yJ44CCXG4gKlxuICog5riy5p+T6L+b56iL5rKh5pyJ44CM5LiA5qyh5oCn55Sf5oiQ5ou/57uT5p6c44CN55qEIFJQQ++8jOS5n+S4jeivpeeUqCBzZXNzaW9uLmNyZWF0ZS9mb3JrIOWIm+W7uuWQjuWPsOS8muivnVxuICog77yI5ZCO5Y+w5Lya6K+d5LiN5Zyo5YmN5Y+w5LiN6Kem5Y+R5qih5Z6L5omn6KGM77yM5a6e5rWL44CM5rC46L+c5q2j5Zyo5LyY5YyW44CN77yJ44CC5q2j6Kej5Y+W6IeqIGRzaC1lbGYg55qE5a6/5Li7XG4gKiDmnI3liqHpnaLvvJpzZXJ2ZXIgaGFsZu+8iGxpYi9pbmRleC5qc++8ieaMgeaciSBsbG0g5LiOIGFnZW50RGVmYXVsdE1vZGVsIOacjeWKoeKAlOKAlFxuICogICBzZXNzaW9uTW9kZWwgICAgICAg4oaSIOW9k+WJjeS8muivnS9hZ2VudCDpu5jorqTmqKHlnovvvIhwcm92aWRlciArIG1vZGVs77yJXG4gKiAgIG9wdGltaXplLnN0cmVhbSAgICDihpIgU1NFIOecn+a1geW8j++8mmxsbS5zdHJlYW0g5q+P5LiqIHRleHQtZGVsdGEg5Y2z5pe25o6o6YCB77yI6YCQIHRva2Vu77yJXG4gKiAgIG9wdGltaXplLnN0YXJ0ICAgICDihpIg5ZCO5Y+w5rWB5byP57Sv56ev77yI6ZmN57qn5pa55qGI77yJXG4gKiAgIG9wdGltaXplLnBvbGwgICAgICDihpIg5Y+WIHsgZG9uZSwgdGV4dCB977yI6ZmN57qn5pa55qGI77yJXG4gKiBjbGllbnQg57uPIEhUVFAgU1NF77yIL2RzaC1wcm9tcHQtYXJjaGl0ZWN0L2FwaS9vcHRpbWl6ZS5zdHJlYW3vvInpgJAgdG9rZW4g5ZGI546w44CCXG4gKi9cblxuaW1wb3J0IHsgT3B0aW1pemVFcnJvciwgdHlwZSBMYW5nIH0gZnJvbSAnLi9vcHRpbWl6ZXIuanMnO1xuXG4vKiog6Ieq5pyJ6YCa6YGT55qE5pyA5bCP6Z2i77yI5rOo5YWl5byP77yM5L6/5LqO5Y2V5rWL77yJ44CCICovXG5leHBvcnQgaW50ZXJmYWNlIEhvc3RScGMge1xuICBjYWxsKGVuZHBvaW50OiBzdHJpbmcsIHBheWxvYWQ/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IFByb21pc2U8e1xuICAgIG9rOiBib29sZWFuO1xuICAgIHZhbHVlPzogdW5rbm93bjtcbiAgICBlcnJvcj86IHsgY29kZT86IHN0cmluZzsgZGV0YWlscz86IHVua25vd24gfTtcbiAgfT47XG59XG5cbi8qKlxuICogSFRUUCBKU09OIEFQSSDpgJrpgZPvvIhkc2gtZWxmIOaWueW8j++8ie+8mua4suafk+i/m+eoi+mhtemdoueUseWuv+S4uyB3ZWJTZXJ2ZXIg5o+Q5L6b77yM55u45a+56Lev5b6EIGZldGNoXG4gKiDnm7Tovr4gYC9kc2gtcHJvbXB0LWFyY2hpdGVjdC9hcGkvPG1ldGhvZD5g77yM5a6M5YWo57uV5byAIGNvbm5lY3Rpb24ucnBjLmNhbGzigJTigJRcbiAqIGRlc2t0b3Ag55qEIHJwYy5jYWxsIOWcqOWQjOS4gOa1geeoi+esrOS6jOasoeiwg+eUqOS8muaMguatu++8iOWunua1iyBzZXNzaW9uTW9kZWwg5oiQ5Yqf44CB56ys5LqM5qyh5rC45LiN6L6+77yJ44CCXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjYWxsSG9zdDxSID0gdW5rbm93bj4oXG4gIG1ldGhvZDogc3RyaW5nLFxuICBhcmdzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbik6IFByb21pc2U8eyBvazogYm9vbGVhbjsgdmFsdWU/OiBSOyBlcnJvcj86IHsgY29kZT86IHN0cmluZzsgZGV0YWlscz86IHVua25vd24gfSB9PiB7XG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYC9kc2gtcHJvbXB0LWFyY2hpdGVjdC9hcGkvJHtlbmNvZGVVUklDb21wb25lbnQobWV0aG9kKX1gLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczogeyAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoYXJncyksXG4gIH0pO1xuICByZXR1cm4gKGF3YWl0IHJlc3BvbnNlLmpzb24oKSkgYXMgeyBvazogYm9vbGVhbjsgdmFsdWU/OiBSOyBlcnJvcj86IHsgY29kZT86IHN0cmluZzsgZGV0YWlscz86IHVua25vd24gfSB9O1xufVxuXG4vKiog57uZ5oyC6LW355qEIFJQQyDosIPnlKjliqDotoXml7bvvIjlrr/kuLvpgJrpgZPku7vkvZXkuIDmraXpg73kuI3lhYHorrjml6DpmZDpmLvloZ4g4oaS44CM5LiA55u05q2j5Zyo5LyY5YyW44CN77yJ44CCICovXG5leHBvcnQgZnVuY3Rpb24gd2l0aFRpbWVvdXQ8VD4ocHJvbWlzZTogUHJvbWlzZTxUPiwgbXM6IG51bWJlciwgbGFiZWw6IHN0cmluZyk6IFByb21pc2U8VD4ge1xuICByZXR1cm4gbmV3IFByb21pc2U8VD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiByZWplY3QobmV3IEVycm9yKGAke2xhYmVsfS10aW1lb3V0YCkpLCBtcyk7XG4gICAgcHJvbWlzZS50aGVuKFxuICAgICAgKHYpID0+IHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgcmVzb2x2ZSh2KTtcbiAgICAgIH0sXG4gICAgICAoZSkgPT4ge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICByZWplY3QoZSk7XG4gICAgICB9LFxuICAgICk7XG4gIH0pO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEhvc3RTZXNzaW9uSW5mbyB7XG4gIHByb3ZpZGVyOiBzdHJpbmc7XG4gIG1vZGVsOiBzdHJpbmc7XG4gIHJlYXNvbmluZ0VmZm9ydD86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSdW5Ib3N0T3B0aW1pemVPcHRpb25zIHtcbiAgcnBjOiBIb3N0UnBjO1xuICBsYW5nOiBMYW5nO1xuICB0ZXh0OiBzdHJpbmc7XG4gIHN5c3RlbTogc3RyaW5nO1xuICBzaWduYWw6IEFib3J0U2lnbmFsO1xuICBvbkRlbHRhOiAodGV4dDogc3RyaW5nKSA9PiB2b2lkO1xuICAvKiog5a6/5Li76YCa6YGT5q2l6aqk6L+b5bqm77yI5Y2h54mH5pi+56S677yM5a6a5L2N5Y2h54K577yJICovXG4gIG9uU3RlcD86IChzdGVwOiAnbW9kZWwnIHwgJ3N0YXJ0JyB8ICdwb2xsJykgPT4gdm9pZDtcbiAgaW50ZXJ2YWxNcz86IG51bWJlcjtcbiAgdGltZW91dE1zPzogbnVtYmVyO1xuICBycGNUaW1lb3V0TXM/OiBudW1iZXI7XG59XG5cbmNvbnN0IERFRkFVTFRfSU5URVJWQUxfTVMgPSAxMDA7XG5jb25zdCBERUZBVUxUX1RJTUVPVVRfTVMgPSAxMjBfMDAwO1xuY29uc3QgREVGQVVMVF9SUENfVElNRU9VVF9NUyA9IDVfMDAwO1xuXG5mdW5jdGlvbiBjYWxsUnBjPFIgPSBuZXZlcj4oXG4gIHJwYzogSG9zdFJwYyxcbiAgZW5kcG9pbnQ6IHN0cmluZyxcbiAgcGF5bG9hZDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXG4gIG1zOiBudW1iZXIsXG4pOiBQcm9taXNlPHsgb2s6IHRydWU7IHZhbHVlOiBSIH0gfCB7IG9rOiBmYWxzZTsgZXJyb3I/OiB7IGNvZGU/OiBzdHJpbmc7IGRldGFpbHM/OiB1bmtub3duIH0gfT4ge1xuICByZXR1cm4gd2l0aFRpbWVvdXQoXG4gICAgcnBjLmNhbGwoZW5kcG9pbnQsIHBheWxvYWQpLFxuICAgIG1zLFxuICAgIGVuZHBvaW50LFxuICApIGFzIFByb21pc2U8eyBvazogdHJ1ZTsgdmFsdWU6IFIgfSB8IHsgb2s6IGZhbHNlOyBlcnJvcj86IHsgY29kZT86IHN0cmluZzsgZGV0YWlscz86IHVua25vd24gfSB9Pjtcbn1cblxuLyoqIOWPluW9k+WJjeS8muivnS9hZ2VudCDpu5jorqTmqKHlnovvvIjpm7bphY3nva7vvInjgILkuI3lj6/lvpfml7bov5Tlm54gbnVsbOOAglxuICogIOWlkee6puimgeaxguOAjOS7u+S9leWksei0pemDvei/lOWbniBudWxsIOeUseiwg+eUqOaWueWbnumAgOOAjeKAlOKAlOaXp+eJiOaXoCB0cnkvY2F0Y2jvvIxcbiAqICBmZXRjaCDlpLHotKUv5ZON5bqU6Z2eIEpTT04g5Lya55u05o6lIHJlamVjdO+8jOi/neWPjeiHqui6q+azqOmHiuaJv+ivuuOAgiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlc29sdmVIb3N0U2Vzc2lvbk1vZGVsKFxuICBycGM6IEhvc3RScGMsXG4gIHJwY1RpbWVvdXRNcyA9IERFRkFVTFRfUlBDX1RJTUVPVVRfTVMsXG4pOiBQcm9taXNlPEhvc3RTZXNzaW9uSW5mbyB8IG51bGw+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCByZXMgPSBhd2FpdCBjYWxsUnBjKHJwYywgJ3Nlc3Npb25Nb2RlbCcsIHt9LCBycGNUaW1lb3V0TXMpO1xuICAgIGlmICghcmVzLm9rIHx8ICFyZXMudmFsdWUgfHwgdHlwZW9mIHJlcy52YWx1ZSAhPT0gJ29iamVjdCcpIHJldHVybiBudWxsO1xuICAgIGNvbnN0IHYgPSByZXMudmFsdWUgYXMgeyBwcm92aWRlcj86IHVua25vd247IG1vZGVsPzogdW5rbm93biB9O1xuICAgIGlmICh0eXBlb2Ygdi5wcm92aWRlciAhPT0gJ3N0cmluZycgfHwgdHlwZW9mIHYubW9kZWwgIT09ICdzdHJpbmcnKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCBpbmZvOiBIb3N0U2Vzc2lvbkluZm8gPSB7IHByb3ZpZGVyOiB2LnByb3ZpZGVyLCBtb2RlbDogdi5tb2RlbCB9O1xuICAgIGlmICh0eXBlb2YgKHJlcy52YWx1ZSBhcyB7IHJlYXNvbmluZ0VmZm9ydD86IHVua25vd24gfSkucmVhc29uaW5nRWZmb3J0ID09PSAnc3RyaW5nJykge1xuICAgICAgaW5mby5yZWFzb25pbmdFZmZvcnQgPSAocmVzLnZhbHVlIGFzIHsgcmVhc29uaW5nRWZmb3J0Pzogc3RyaW5nIH0pLnJlYXNvbmluZ0VmZm9ydDtcbiAgICB9XG4gICAgcmV0dXJuIGluZm87XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8qKiDmlofmnKzlop7ph4/vvIjlrZfnrKbliY3nvIDmr5TovoPvvJvova7or6Lov5HkvLzmtYHlvI/nlKjvvInjgIIgKi9cbmV4cG9ydCBmdW5jdGlvbiBwcmVmaXhEZWx0YShwcmV2OiBzdHJpbmcsIG5leHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IG4gPSBNYXRoLm1pbihwcmV2Lmxlbmd0aCwgbmV4dC5sZW5ndGgpO1xuICBsZXQgaSA9IDA7XG4gIHdoaWxlIChpIDwgbiAmJiBwcmV2LmNoYXJDb2RlQXQoaSkgPT09IG5leHQuY2hhckNvZGVBdChpKSkgaSArPSAxO1xuICByZXR1cm4gbmV4dC5zbGljZShpKTtcbn1cblxuLyoqXG4gKiDlrr/kuLvpgJrpgZPlhajmtYHnqIvvvIjljZXmrKEgUlBDIOS6pOS7mO+8ie+8mnNlcnZlciBoYWxmIOino+aekOS8muivnem7mOiupOaooeWeiyDihpIgbGxtLnN0cmVhbSDot5HlroxcbiAqIOKGkiDkuIDmrKHmgKfov5Tlm57lhajmlofjgILkuI3nlKjjgIxzdGFydCArIOi9ruivoiBwb2xs44CN55qE5YiG5q2l5Y2P6K6u77yaZGVza3RvcCDmuLLmn5Pov5vnqIvnmoRcbiAqIHJwYy5jYWxsIOWcqOWQjOS4gOa1geeoi+eahOesrOS6jOasoeiwg+eUqOS8muaMguatu++8iOWunua1iyBzZXNzaW9uTW9kZWwg5oiQ5Yqf44CBc3RhcnQg5rC45LiN6L6+77yJ77yMXG4gKiDljZXmrKHosIPnlKjnu5XlvIDor6XpmZDliLbjgILljaHniYfml6DpgJDlrZfmu5rliqjvvIjmtYHlvI/og73lipvkv53nlZnlnKggZmV0Y2gg6YCa6YGT77yJ44CCXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU3RyZWFtSG9zdE9wdGltaXplT3B0aW9ucyB7XG4gIHJwYzogSG9zdFJwYztcbiAgdGV4dDogc3RyaW5nO1xuICBzeXN0ZW06IHN0cmluZztcbiAgc2lnbmFsOiBBYm9ydFNpZ25hbDtcbiAgb25EZWx0YSh0ZXh0OiBzdHJpbmcpOiB2b2lkO1xuICBvblJlYXNvbmluZz8odGV4dDogc3RyaW5nKTogdm9pZDtcbiAgb25TdGVwPyhzdGVwOiAnbW9kZWwnIHwgJ3N0YXJ0JyB8ICdwb2xsJyk6IHZvaWQ7XG4gIHRpbWVvdXRNcz86IG51bWJlcjtcbn1cblxuLyoqIOino+aekCBTU0Ug5bin77ya6L+U5ZueIHsgZXZlbnQsIGRhdGEgfe+8iFxcblxcbiDliIbluKfvvInjgIJcbiAqICBkYXRhIOaMiSBTU0Ug6KeE6IyD5Y+q5Yml5YaS5Y+35ZCO55qE5LiA5Liq5YmN5a+856m65qC84oCU4oCU57ud5LiNIHRyaW3vvJrml6fniYggdHJpbSDkvJrlkIPmjolcbiAqICB0b2tlbiDpppblsL7nqbrnmb3vvIzoi7HmlofmtYHlvI/nu5PmnpzljZXor43nspjov57vvIhcIlRoZSBnb2FsXCIg4oaSIFwiVGhlZ29hbFwi77yM5a6e5rWLIGJ1Z++8ieOAgiAqL1xuYXN5bmMgZnVuY3Rpb24gcmVhZFNzZUZyYW1lcyhcbiAgcmVzcG9uc2U6IFJlc3BvbnNlLFxuICBvbkZyYW1lOiAoZXZlbnQ6IHN0cmluZywgZGF0YTogc3RyaW5nKSA9PiB2b2lkLFxuKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHJlYWRlciA9IHJlc3BvbnNlLmJvZHk/LmdldFJlYWRlcigpO1xuICBpZiAoIXJlYWRlcikgdGhyb3cgbmV3IEVycm9yKCduby1zdHJlYW0nKTtcbiAgY29uc3QgZGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigpO1xuICBsZXQgYnVmZmVyID0gJyc7XG4gIGZvciAoOzspIHtcbiAgICBjb25zdCB7IGRvbmUsIHZhbHVlIH0gPSBhd2FpdCByZWFkZXIucmVhZCgpO1xuICAgIGlmIChkb25lKSBicmVhaztcbiAgICBidWZmZXIgKz0gZGVjb2Rlci5kZWNvZGUodmFsdWUsIHsgc3RyZWFtOiB0cnVlIH0pO1xuICAgIGZvciAoOzspIHtcbiAgICAgIGNvbnN0IGlkeCA9IGJ1ZmZlci5pbmRleE9mKCdcXG5cXG4nKTtcbiAgICAgIGlmIChpZHggPT09IC0xKSBicmVhaztcbiAgICAgIGNvbnN0IGZyYW1lID0gYnVmZmVyLnNsaWNlKDAsIGlkeCk7XG4gICAgICBidWZmZXIgPSBidWZmZXIuc2xpY2UoaWR4ICsgMik7XG4gICAgICBsZXQgZXZlbnQgPSAnbWVzc2FnZSc7XG4gICAgICBsZXQgZGF0YSA9ICcnO1xuICAgICAgZm9yIChjb25zdCBsaW5lIG9mIGZyYW1lLnNwbGl0KCdcXG4nKSkge1xuICAgICAgICBpZiAobGluZS5zdGFydHNXaXRoKCdldmVudDonKSkgZXZlbnQgPSBsaW5lLnNsaWNlKDYpLnRyaW0oKTtcbiAgICAgICAgZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKCdkYXRhOicpKSB7XG4gICAgICAgICAgbGV0IGQgPSBsaW5lLnNsaWNlKDUpO1xuICAgICAgICAgIGlmIChkLnN0YXJ0c1dpdGgoJyAnKSkgZCA9IGQuc2xpY2UoMSk7XG4gICAgICAgICAgZGF0YSA9IGQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG9uRnJhbWUoZXZlbnQsIGRhdGEpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIOWuv+S4u+mAmumBk+ecn+a1geW8j++8mmZldGNoIFNTRe+8jOmAkCB0b2tlbiBvbkRlbHRh44CC57uV5byAIHJwYy5jYWxs77yIZGVza3RvcCDkuozmrKHosIPnlKjmjILmrbvvvInvvIxcbiAqIOS5n+e7leW8gOi9ruivouW/q+eFp++8iOW/q+aooeWei+S7jeaYvuS4gOasoeaAp++8ieOAgmFib3J0ID0gc2lnbmFsICsgZmV0Y2ggYWJvcnTjgIJcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0cmVhbUhvc3RPcHRpbWl6ZShvcHRzOiBTdHJlYW1Ib3N0T3B0aW1pemVPcHRpb25zKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgY29uc3QgeyBycGMsIHRleHQsIHN5c3RlbSwgc2lnbmFsLCBvbkRlbHRhLCBvblJlYXNvbmluZywgb25TdGVwIH0gPSBvcHRzO1xuICBjb25zdCB0aW1lb3V0TXMgPSBvcHRzLnRpbWVvdXRNcyA/PyBERUZBVUxUX1RJTUVPVVRfTVM7XG4gIGlmIChzaWduYWwuYWJvcnRlZCkgdGhyb3cgbmV3IEVycm9yKCdhYm9ydGVkJyk7XG4gIG9uU3RlcD8uKCdtb2RlbCcpO1xuICBjb25zdCBzZXNzaW9uID0gYXdhaXQgcmVzb2x2ZUhvc3RTZXNzaW9uTW9kZWwocnBjLCBvcHRzLnJwY1RpbWVvdXRNcyA/PyBERUZBVUxUX1JQQ19USU1FT1VUX01TKTtcbiAgaWYgKCFzZXNzaW9uKSB0aHJvdyBuZXcgRXJyb3IoJ2hvc3QtdW5hdmFpbGFibGUnKTtcbiAgb25TdGVwPy4oJ3N0YXJ0Jyk7XG5cbiAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgY29uc3Qgb25BYm9ydCA9ICgpID0+IGNvbnRyb2xsZXIuYWJvcnQoKTtcbiAgc2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoJ2Fib3J0Jywgb25BYm9ydCk7XG4gIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IGNvbnRyb2xsZXIuYWJvcnQoKSwgdGltZW91dE1zKTtcbiAgbGV0IG91dCA9ICcnO1xuICB0cnkge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goJy9kc2gtcHJvbXB0LWFyY2hpdGVjdC9hcGkvb3B0aW1pemUuc3RyZWFtJywge1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgcHJvdmlkZXI6IHNlc3Npb24ucHJvdmlkZXIsXG4gICAgICAgIG1vZGVsOiBzZXNzaW9uLm1vZGVsLFxuICAgICAgICB0ZXh0LFxuICAgICAgICBzeXN0ZW0sXG4gICAgICAgIC4uLihzZXNzaW9uLnJlYXNvbmluZ0VmZm9ydCA/IHsgcmVhc29uaW5nRWZmb3J0OiBzZXNzaW9uLnJlYXNvbmluZ0VmZm9ydCB9IDoge30pLFxuICAgICAgfSksXG4gICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsLFxuICAgIH0pO1xuICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihgaHR0cC0ke3Jlc3BvbnNlLnN0YXR1c31gKTtcbiAgICBvblN0ZXA/LigncG9sbCcpO1xuICAgIGxldCByZWFzb25pbmcgPSAnJztcbiAgICAvLyDlrr/kuLvkvqflpLHotKXlv4Xpobvmta7lh7rvvJrml6fniYjnm7TmjqXlv73nlaUgZXJyb3Ig5bin77yM5aSx6LSl6KKr5b2T5oiQ5Yqf44CB56m6L+WNiuaIque7k+aenOeFp+W4uCBzaG93XG4gICAgbGV0IHN0cmVhbUVycm9yOiB7IGtpbmQ6ICdlcnJvcicgfCAndHJ1bmNhdGVkJzsgbWVzc2FnZTogc3RyaW5nIH0gfCBudWxsID0gbnVsbDtcbiAgICBhd2FpdCByZWFkU3NlRnJhbWVzKHJlc3BvbnNlLCAoZXZlbnQsIGRhdGEpID0+IHtcbiAgICAgIGlmIChldmVudCA9PT0gJ2Vycm9yJykge1xuICAgICAgICBsZXQga2luZDogJ2Vycm9yJyB8ICd0cnVuY2F0ZWQnID0gJ2Vycm9yJztcbiAgICAgICAgbGV0IG1lc3NhZ2UgPSBkYXRhO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoZGF0YSkgYXMgeyBraW5kPzogdW5rbm93bjsgbT86IHVua25vd24gfTtcbiAgICAgICAgICBpZiAodHlwZW9mIHBhcnNlZC5tID09PSAnc3RyaW5nJyAmJiBwYXJzZWQubSkgbWVzc2FnZSA9IHBhcnNlZC5tO1xuICAgICAgICAgIGlmIChwYXJzZWQua2luZCA9PT0gJ3RydW5jYXRlZCcpIGtpbmQgPSAndHJ1bmNhdGVkJztcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgLy8g6Z2eIEpTT04g6L296I2377ya5oyJ5Y6f5paH5pys5b2T6ZSZ6K+v5raI5oGvXG4gICAgICAgIH1cbiAgICAgICAgc3RyZWFtRXJyb3IgPSB7IGtpbmQsIG1lc3NhZ2UgfTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGRhdGEgPT09ICd7fScgfHwgZGF0YSA9PT0gJ1tET05FXScpIHJldHVybjtcbiAgICAgIGlmIChldmVudCA9PT0gJ3JlYXNvbmluZycgfHwgZXZlbnQgPT09ICdkZWx0YScpIHtcbiAgICAgICAgLy8g5bin6L296I235Li6IEpTT07vvIh7XCJ0XCI6IC4uLn3vvInvvIznqbrmoLwv5o2i6KGML+Wtl+mdouWPjeaWnOadoOWFqOmDqOaXoOaNn++8m1xuICAgICAgICAvLyDop6PmnpDlpLHotKXml7blm57pgIDoo7jmlofmnKzvvIjlrrnlv43ml6fmoLzlvI/luKfvvIlcbiAgICAgICAgbGV0IHBpZWNlID0gZGF0YTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGRhdGEpIGFzIHsgdD86IHVua25vd24gfTtcbiAgICAgICAgICBpZiAodHlwZW9mIHBhcnNlZC50ID09PSAnc3RyaW5nJykgcGllY2UgPSBwYXJzZWQudDtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgLy8g6KO45paH5pys5binXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2ZW50ID09PSAncmVhc29uaW5nJykge1xuICAgICAgICAgIHJlYXNvbmluZyArPSBwaWVjZTtcbiAgICAgICAgICBvblJlYXNvbmluZz8uKHJlYXNvbmluZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb3V0ICs9IHBpZWNlO1xuICAgICAgICAgIG9uRGVsdGEob3V0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChzaWduYWwuYWJvcnRlZCkgdGhyb3cgbmV3IEVycm9yKCdhYm9ydGVkJyk7XG4gICAgaWYgKHN0cmVhbUVycm9yKSB7XG4gICAgICB0aHJvdyBzdHJlYW1FcnJvci5raW5kID09PSAndHJ1bmNhdGVkJ1xuICAgICAgICA/IG5ldyBPcHRpbWl6ZUVycm9yKCd0cnVuY2F0ZWQnLCBzdHJlYW1FcnJvci5tZXNzYWdlKVxuICAgICAgICA6IG5ldyBPcHRpbWl6ZUVycm9yKCdiYWQtcmVzcG9uc2UnLCBzdHJlYW1FcnJvci5tZXNzYWdlKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbiAgfSBmaW5hbGx5IHtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgc2lnbmFsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Fib3J0Jywgb25BYm9ydCk7XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bkhvc3RPcHRpbWl6ZShvcHRzOiBSdW5Ib3N0T3B0aW1pemVPcHRpb25zKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgY29uc3QgeyBycGMsIGxhbmc6IF9sYW5nLCB0ZXh0LCBzeXN0ZW0sIHNpZ25hbCwgb25EZWx0YSwgb25TdGVwIH0gPSBvcHRzO1xuICBjb25zdCBpbnRlcnZhbE1zID0gb3B0cy5pbnRlcnZhbE1zID8/IERFRkFVTFRfSU5URVJWQUxfTVM7XG4gIGNvbnN0IHRpbWVvdXRNcyA9IG9wdHMudGltZW91dE1zID8/IERFRkFVTFRfVElNRU9VVF9NUztcbiAgY29uc3QgcnBjVGltZW91dE1zID0gb3B0cy5ycGNUaW1lb3V0TXMgPz8gREVGQVVMVF9SUENfVElNRU9VVF9NUztcbiAgaWYgKHNpZ25hbC5hYm9ydGVkKSB0aHJvdyBuZXcgRXJyb3IoJ2Fib3J0ZWQnKTtcblxuICAvLyAxLiDkvJror53pu5jorqTmqKHlnovvvIjpm7bphY3nva7vvIlcbiAgb25TdGVwPy4oJ21vZGVsJyk7XG4gIGNvbnN0IHNlc3Npb24gPSBhd2FpdCByZXNvbHZlSG9zdFNlc3Npb25Nb2RlbChycGMsIHJwY1RpbWVvdXRNcyk7XG4gIGlmICghc2Vzc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcignaG9zdC11bmF2YWlsYWJsZScpO1xuICB9XG5cbiAgLy8gMi4g5ZCv5Yqo5ZCO5Y+w5rWB5byPXG4gIG9uU3RlcD8uKCdzdGFydCcpO1xuICBjb25zdCBzdGFydFBheWxvYWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge1xuICAgIHByb3ZpZGVyOiBzZXNzaW9uLnByb3ZpZGVyLFxuICAgIG1vZGVsOiBzZXNzaW9uLm1vZGVsLFxuICAgIHRleHQsXG4gICAgc3lzdGVtLFxuICB9O1xuICBpZiAoc2Vzc2lvbi5yZWFzb25pbmdFZmZvcnQpIHN0YXJ0UGF5bG9hZC5yZWFzb25pbmdFZmZvcnQgPSBzZXNzaW9uLnJlYXNvbmluZ0VmZm9ydDtcbiAgY29uc3Qgc3RhcnQgPSBhd2FpdCBjYWxsUnBjPHsgdGFza0lkPzogc3RyaW5nIH0+KHJwYywgJ29wdGltaXplLnN0YXJ0Jywgc3RhcnRQYXlsb2FkLCBycGNUaW1lb3V0TXMpO1xuICBpZiAoIXN0YXJ0Lm9rIHx8ICFzdGFydC52YWx1ZSB8fCB0eXBlb2Ygc3RhcnQudmFsdWUudGFza0lkICE9PSAnc3RyaW5nJykge1xuICAgIGNvbnN0IGNvZGUgPSAoIXN0YXJ0Lm9rICYmIHN0YXJ0LmVycm9yICYmIHN0YXJ0LmVycm9yLmNvZGUpIHx8ICcnO1xuICAgIGNvbnN0IGRldGFpbHMgPSAoIXN0YXJ0Lm9rICYmIHN0YXJ0LmVycm9yICYmIHN0YXJ0LmVycm9yLmRldGFpbHMpIHx8ICcnO1xuICAgIHRocm93IG5ldyBFcnJvcihgaG9zdC1zdGFydC1yZWplY3RlZCR7Y29kZSA/IGA6ICR7Y29kZX0gJHtkZXRhaWxzIHx8ICcnfWAudHJpbSgpIDogJyd9YCk7XG4gIH1cbiAgY29uc3QgdGFza0lkID0gc3RhcnQudmFsdWUudGFza0lkO1xuXG4gIC8vIDMuIOi9ruivouWinumHj+ebtOiHsyBkb25l77yI5pyN5Yqh56uv5pi+5byP5a6M5oiQ5L+h5Y+377yM5pegIHNldHRsZSDlhZzlupXvvIlcbiAgb25TdGVwPy4oJ3BvbGwnKTtcbiAgY29uc3Qgc3RhcnRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgbGV0IGxhc3QgPSAnJztcbiAgdHJ5IHtcbiAgICBmb3IgKDs7KSB7XG4gICAgICBpZiAoc2lnbmFsLmFib3J0ZWQpIHRocm93IG5ldyBFcnJvcignYWJvcnRlZCcpO1xuICAgICAgaWYgKERhdGUubm93KCkgLSBzdGFydGVkQXQgPiB0aW1lb3V0TXMpIHRocm93IG5ldyBFcnJvcigndGltZW91dCcpO1xuICAgICAgbGV0IHBvbGw6IHsgZG9uZT86IGJvb2xlYW47IHRleHQ/OiBzdHJpbmc7IGVycm9yPzogc3RyaW5nIHwgbnVsbCB9IHwgbnVsbCA9IG51bGw7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBjYWxsUnBjPHsgZG9uZT86IGJvb2xlYW47IHRleHQ/OiBzdHJpbmc7IGVycm9yPzogc3RyaW5nIHwgbnVsbCB9PihcbiAgICAgICAgICBycGMsXG4gICAgICAgICAgJ29wdGltaXplLnBvbGwnLFxuICAgICAgICAgIHsgdGFza0lkIH0sXG4gICAgICAgICAgcnBjVGltZW91dE1zLFxuICAgICAgICApO1xuICAgICAgICBpZiAocmVzLm9rICYmIHJlcy52YWx1ZSkgcG9sbCA9IHJlcy52YWx1ZTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICAvLyDljZXmrKHova7or6LlpLHotKXkuI3oh7Tlkb3vvIzkuIvkuIDova7lho3or5VcbiAgICAgIH1cbiAgICAgIGlmIChwb2xsKSB7XG4gICAgICAgIGlmIChwb2xsLmVycm9yKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHBvbGwuZXJyb3IpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRleHROb3cgPSBwb2xsLnRleHQgPz8gJyc7XG4gICAgICAgIGlmICh0ZXh0Tm93ICE9PSBsYXN0KSB7XG4gICAgICAgICAgb25EZWx0YSh0ZXh0Tm93KTtcbiAgICAgICAgICBpZiAoc2lnbmFsLmFib3J0ZWQpIHRocm93IG5ldyBFcnJvcignYWJvcnRlZCcpO1xuICAgICAgICAgIGxhc3QgPSB0ZXh0Tm93O1xuICAgICAgICB9XG4gICAgICAgIGlmIChwb2xsLmRvbmUpIHtcbiAgICAgICAgICByZXR1cm4gdGV4dE5vdztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgaW50ZXJ2YWxNcykpO1xuICAgIH1cbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgcnBjLmNhbGwoJ29wdGltaXplLmFib3J0JywgeyB0YXNrSWQgfSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyDlsL3liptcbiAgICB9XG4gIH1cbn1cbiIsICIvLyDmnKzpobnnm67nlLEgQUkg6L6F5Yqp5LyY5YyW5a6M5oiQ77yI5o+Q56S66K+N5YaF5qC444CB5rWL6K+V5LiO5paH5qGj77yJ77yM5Y+R5biD5YmN57uP5Lq65bel5a6h6ZiF44CCXG4vKipcbiAqIG1lbW9yeS50cyDigJTigJQg5Lya6K+d6K6w5b+GICsg5YGP5aW96Ieq5a2m5Lmg77yI57qv5YmN56uv77yMbG9jYWxTdG9yYWdlIOaMgeS5heWMlu+8iVxuICpcbiAqIOiuvuiuoeWPluiIje+8iOS4uuS7gOS5iOS4jeeUqOWuv+S4u+aWh+S7tu+8ie+8mlxuICogICDlrr/kuLvnmoQgYHN5c3RlbWAg5Y+C5pWw5a6M5YWo55Sx5a6i5oi356uv5ou86KOF5ZCO5Lyg57uZIGxsbS5zdHJlYW3vvIzlm6DmraTorrDlv4blj6ropoHlnKjlrqLmiLfnq69cbiAqICAg57uE6KOF5Y2z5Y+v77yM5LiN6ZyA6KaB5paw5aKeIGhvc3QgQVBJ44CB5LiN6ZyA6KaB5pS5IGxpYi9pbmRleC5qcyDigJTigJQg5pS55Yqo6Z2i5pyA5bCP44CB5pyA5LiN5a655piTXG4gKiAgIOaKiuaPkuS7tuaQnuaMguOAglxuICpcbiAqIOS4ieWxguiusOW/hu+8iOWvuem9kCBXb3JrQnVkZHkg55qE5YiG5bGC5oCd6Lev77yM5L2G6IyD5Zu05pS256qE5Yiw44CM5o+Q56S66K+N5YGP5aW944CN77yJ77yaXG4gKiAgIEwxIOS8muivneiusOW/hiAgIHNlc3Npb25EcmFmdHNbc2Vzc2lvbklkXSAg4oCU4oCUIOacrOS8muivneacgOi/kSAxMCDmnaHojYnnqL/vvIznlKjkuo7nkIbop6PlvZPliY3or63looNcbiAqICAgTDIg5qC35L6L6K6w5b+GICAgYWNjZXB0ZWRbXSAgICAgICAgICAgICAgICDigJTigJQg5pyA6L+R6KKr6YeH57qz55qE44CM6I2J56i/IOKGkiDnu5PmnpzjgI3lr7nvvIzkvZwgZmV3LXNob3RcbiAqICAgTDMg5YGP5aW955S75YOPICAgcHJvZmlsZSAgICAgICAgICAgICAgICAgICDigJTigJQg55Sx6YeH57qzL+aUvuW8g+iusOW9leWPjeaAneWHuueahOeos+WumuWBj+Wlve+8iOKJpDYwMCDlrZfvvIlcbiAqXG4gKiDoh6rlrabkuaDpl63njq/vvIjlgJ/pibQgTGFuZ01lbSBtZXRhcHJvbXB0ICsgU2tpbGxPcHQg55qE44CM5pyJ55WM57yW6L6RICsg6aqM6K+B6Ze46Zeo44CN77yJ77yaXG4gKiAgIOmHh+e6syA9IOato+agt+acrO+8iOmqjOivgemAmui/h++8iSAvIOaUvuW8g+aIlumHjeivlSA9IOi0n+agt+acrFxuICogICDihpIg5q+P57Sv6K6hIDMg5Liq5paw5q2j5qC35pys6Kem5Y+R5LiA5qyh5Y+N5oCd77yIMSDmrKEgTExNIOiwg+eUqO+8iVxuICogICDihpIg5Y+N5oCd5Lqn5Ye655qE5pivKirmnInnlYzmm7/mjaIqKueahCBwcm9maWxl77yI5LiN5piv5peg6ZmQ6L+95Yqg77yJ77yM5pen55S75YOP6KKr6KaG55uWXG4gKiAgIOKGkiDlj43mgJ3lpLHotKXpnZnpu5jlv73nlaXvvIznu53kuI3lvbHlk43kuLvmtYHnqItcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IEludGVuc2l0eSwgU3lzdGVtQ29udGV4dCB9IGZyb20gJy4vb3B0aW1pemVyLmpzJztcbmltcG9ydCB7IERFRkFVTFRfSU5URU5TSVRZIH0gZnJvbSAnLi9vcHRpbWl6ZXIuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNhbXBsZSB7XG4gIGRyYWZ0OiBzdHJpbmc7XG4gIHJlc3VsdDogc3RyaW5nO1xuICBhdDogbnVtYmVyO1xuICBzZXNzaW9uSWQ6IHN0cmluZyB8IG51bGw7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWVtb3J5U3RhdGUge1xuICB2ZXJzaW9uOiAxO1xuICBwcm9maWxlOiBzdHJpbmc7XG4gIGFjY2VwdGVkOiBTYW1wbGVbXTtcbiAgcmVqZWN0ZWQ6IFNhbXBsZVtdO1xuICBzZXNzaW9uRHJhZnRzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT47XG4gIHN0YXRzOiB7IGFjY2VwdGVkOiBudW1iZXI7IHJlamVjdGVkOiBudW1iZXI7IGFjY2VwdGVkU2luY2VSZWZsZWN0OiBudW1iZXIgfTtcbn1cblxuY29uc3QgS0VZID0gJ2RzaC1wcm9tcHQtYXJjaGl0ZWN0Lm1lbW9yeS52MSc7XG4vKiog5pS55ZCN5YmN55qE5a2Y5YKo6ZSu77yI5o+S5Lu25b2T5pe25Y+rIGRzaC1wcm9tcHQtb3B0aW1pemVy77yJ77ya5Y+q55So5LqO5LiA5qyh5oCn6L+B56e777yM6L+B5a6M5Y2z5YigICovXG5jb25zdCBMRUdBQ1lfS0VZID0gJ2RzaC1wcm9tcHQtb3B0aW1pemVyLm1lbW9yeS52MSc7XG5jb25zdCBNQVhfQUNDRVBURUQgPSAxMjtcbmNvbnN0IE1BWF9SRUpFQ1RFRCA9IDg7XG5jb25zdCBNQVhfU0VTU0lPTl9EUkFGVFMgPSAxMDtcbmNvbnN0IFJFRkxFQ1RfRVZFUlkgPSAzO1xuXG5mdW5jdGlvbiBlbXB0eSgpOiBNZW1vcnlTdGF0ZSB7XG4gIHJldHVybiB7XG4gICAgdmVyc2lvbjogMSxcbiAgICBwcm9maWxlOiAnJyxcbiAgICBhY2NlcHRlZDogW10sXG4gICAgcmVqZWN0ZWQ6IFtdLFxuICAgIHNlc3Npb25EcmFmdHM6IHt9LFxuICAgIHN0YXRzOiB7IGFjY2VwdGVkOiAwLCByZWplY3RlZDogMCwgYWNjZXB0ZWRTaW5jZVJlZmxlY3Q6IDAgfSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3RvcmFnZSgpOiBTdG9yYWdlIHwgbnVsbCB7XG4gIHRyeSB7XG4gICAgaWYgKHR5cGVvZiBsb2NhbFN0b3JhZ2UgPT09ICd1bmRlZmluZWQnKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKiog6L+H5ruk6Z2e5rOV5qC35L6L6aG577yIZHJhZnQvcmVzdWx0IOW/hemhu+aYr+mdnuepuuWtl+espuS4su+8ieKAlOKAlGxvY2FsU3RvcmFnZSDmmK/lhbHkuqvnqbrpl7TvvIxcbiAqICDmiYvmlLkv5YW25LuW6ISa5pysL+aXp+eJiOacrOWGmeWFpeeahOiEj+aVsOaNruS4jeivpeiuqSBidWlsZENvbnRleHQg55qEIC5zbGljZSgpIOaKm+W8guW4uOOAgiAqL1xuZnVuY3Rpb24gYXNTYW1wbGVzKHY6IHVua25vd24pOiBTYW1wbGVbXSB7XG4gIGlmICghQXJyYXkuaXNBcnJheSh2KSkgcmV0dXJuIFtdO1xuICByZXR1cm4gdi5maWx0ZXIoXG4gICAgKHgpOiB4IGlzIFNhbXBsZSA9PlxuICAgICAgeCAhPT0gbnVsbCAmJlxuICAgICAgdHlwZW9mIHggPT09ICdvYmplY3QnICYmXG4gICAgICB0eXBlb2YgKHggYXMgU2FtcGxlKS5kcmFmdCA9PT0gJ3N0cmluZycgJiZcbiAgICAgICh4IGFzIFNhbXBsZSkuZHJhZnQubGVuZ3RoID4gMCAmJlxuICAgICAgdHlwZW9mICh4IGFzIFNhbXBsZSkucmVzdWx0ID09PSAnc3RyaW5nJyAmJlxuICAgICAgKHggYXMgU2FtcGxlKS5yZXN1bHQubGVuZ3RoID4gMCxcbiAgKTtcbn1cblxuLyoqIOi/h+a7pOmdnuazleS8muivneiNieeov+ihqO+8iOavj+S4qumUrueahOWAvOW/hemhu+aYr+Wtl+espuS4suaVsOe7hO+8ieOAgiAqL1xuZnVuY3Rpb24gYXNEcmFmdE1hcCh2OiB1bmtub3duKTogUmVjb3JkPHN0cmluZywgc3RyaW5nW10+IHtcbiAgaWYgKHYgPT09IG51bGwgfHwgdHlwZW9mIHYgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkodikpIHJldHVybiB7fTtcbiAgY29uc3Qgb3V0OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT4gPSB7fTtcbiAgZm9yIChjb25zdCBbaywgbGlzdF0gb2YgT2JqZWN0LmVudHJpZXModiBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkobGlzdCkpIGNvbnRpbnVlO1xuICAgIGNvbnN0IHN0cnMgPSBsaXN0LmZpbHRlcigoZCk6IGQgaXMgc3RyaW5nID0+IHR5cGVvZiBkID09PSAnc3RyaW5nJyAmJiBkLmxlbmd0aCA+IDApO1xuICAgIGlmIChzdHJzLmxlbmd0aCkgb3V0W2tdID0gc3Rycy5zbGljZSgtTUFYX1NFU1NJT05fRFJBRlRTKTtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZE1lbW9yeSgpOiBNZW1vcnlTdGF0ZSB7XG4gIGNvbnN0IHMgPSBzdG9yYWdlKCk7XG4gIGlmICghcykgcmV0dXJuIGVtcHR5KCk7XG4gIHRyeSB7XG4gICAgbGV0IHJhdyA9IHMuZ2V0SXRlbShLRVkpO1xuICAgIC8vIOaUueWQjei/geenu++8muaWsOmUruS4uuepuuaXtuaOpeS9j+aXp+mUrumHjOeahOWtpuS5oOiusOW9le+8jOmBv+WFjeeUqOaIt+eZveeZveS4ouaOieW3suenr+e0r+eahOWBj+WlvVxuICAgIGlmICghcmF3KSB7XG4gICAgICBjb25zdCBsZWdhY3kgPSBzLmdldEl0ZW0oTEVHQUNZX0tFWSk7XG4gICAgICBpZiAobGVnYWN5KSB7XG4gICAgICAgIHJhdyA9IGxlZ2FjeTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBzLnNldEl0ZW0oS0VZLCBsZWdhY3kpO1xuICAgICAgICAgIHMucmVtb3ZlSXRlbShMRUdBQ1lfS0VZKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgLyog6YWN6aKd5oiW6ZqQ56eB5qih5byP5Y+X6ZmQ77ya6L+B56e75aSx6LSl5LiN5b2x5ZON6K+75Y+WICovXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFyYXcpIHJldHVybiBlbXB0eSgpO1xuICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UocmF3KSBhcyBQYXJ0aWFsPE1lbW9yeVN0YXRlPjtcbiAgICBjb25zdCBiYXNlID0gZW1wdHkoKTtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uYmFzZSxcbiAgICAgIHByb2ZpbGU6IHR5cGVvZiBwYXJzZWQucHJvZmlsZSA9PT0gJ3N0cmluZycgPyBwYXJzZWQucHJvZmlsZSA6ICcnLFxuICAgICAgYWNjZXB0ZWQ6IGFzU2FtcGxlcyhwYXJzZWQuYWNjZXB0ZWQpLnNsaWNlKDAsIE1BWF9BQ0NFUFRFRCksXG4gICAgICByZWplY3RlZDogYXNTYW1wbGVzKHBhcnNlZC5yZWplY3RlZCkuc2xpY2UoMCwgTUFYX1JFSkVDVEVEKSxcbiAgICAgIHNlc3Npb25EcmFmdHM6IGFzRHJhZnRNYXAocGFyc2VkLnNlc3Npb25EcmFmdHMpLFxuICAgICAgc3RhdHM6IHtcbiAgICAgICAgYWNjZXB0ZWQ6IE51bWJlcihwYXJzZWQuc3RhdHM/LmFjY2VwdGVkKSB8fCAwLFxuICAgICAgICByZWplY3RlZDogTnVtYmVyKHBhcnNlZC5zdGF0cz8ucmVqZWN0ZWQpIHx8IDAsXG4gICAgICAgIGFjY2VwdGVkU2luY2VSZWZsZWN0OiBOdW1iZXIocGFyc2VkLnN0YXRzPy5hY2NlcHRlZFNpbmNlUmVmbGVjdCkgfHwgMCxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGVtcHR5KCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhdmVNZW1vcnkobTogTWVtb3J5U3RhdGUpOiB2b2lkIHtcbiAgY29uc3QgcyA9IHN0b3JhZ2UoKTtcbiAgaWYgKCFzKSByZXR1cm47XG4gIHRyeSB7XG4gICAgcy5zZXRJdGVtKEtFWSwgSlNPTi5zdHJpbmdpZnkobSkpO1xuICB9IGNhdGNoIHtcbiAgICAvLyDphY3pop3mu6EgLyDpmpDnp4HmqKHlvI/vvJrpnZnpu5jpmY3nuqfkuLrjgIzml6DorrDlv4bjgI1cbiAgfVxufVxuXG4vKiog562J5b6F55So5oi36KOB5Yaz55qE5pyA6L+R5LiA5qyh5LyY5YyW57uT5p6cICovXG5sZXQgcGVuZGluZzogU2FtcGxlIHwgbnVsbCA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1lbWJlckRyYWZ0KHNlc3Npb25JZDogc3RyaW5nIHwgbnVsbCwgZHJhZnQ6IHN0cmluZyk6IHZvaWQge1xuICBjb25zdCBtID0gbG9hZE1lbW9yeSgpO1xuICBjb25zdCBrZXkgPSBzZXNzaW9uSWQgPz8gJ18nO1xuICBjb25zdCBsaXN0ID0gKG0uc2Vzc2lvbkRyYWZ0c1trZXldID8/IFtdKS5maWx0ZXIoKGQpID0+IGQgIT09IGRyYWZ0KTtcbiAgbGlzdC5wdXNoKGRyYWZ0LnNsaWNlKDAsIDUwMCkpO1xuICBtLnNlc3Npb25EcmFmdHNba2V5XSA9IGxpc3Quc2xpY2UoLU1BWF9TRVNTSU9OX0RSQUZUUyk7XG4gIC8vIOS8muivneadoeebruS5n+WIq+aXoOmZkOWinumVv++8muacgOWkmuS/neeVmSAyMCDkuKrkvJror51cbiAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKG0uc2Vzc2lvbkRyYWZ0cyk7XG4gIGlmIChrZXlzLmxlbmd0aCA+IDIwKSB7XG4gICAgZm9yIChjb25zdCBrIG9mIGtleXMuc2xpY2UoMCwga2V5cy5sZW5ndGggLSAyMCkpIGRlbGV0ZSBtLnNlc3Npb25EcmFmdHNba107XG4gIH1cbiAgc2F2ZU1lbW9yeShtKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFBlbmRpbmcoc2Vzc2lvbklkOiBzdHJpbmcgfCBudWxsLCBkcmFmdDogc3RyaW5nLCByZXN1bHQ6IHN0cmluZyk6IHZvaWQge1xuICBwZW5kaW5nID0geyBkcmFmdCwgcmVzdWx0LCBhdDogRGF0ZS5ub3coKSwgc2Vzc2lvbklkIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNQZW5kaW5nKCk6IGJvb2xlYW4ge1xuICByZXR1cm4gcGVuZGluZyAhPT0gbnVsbDtcbn1cblxuLyoqXG4gKiDorrDlvZXoo4HlhrPnu5PmnpzjgIJcbiAqIGFjY2VwdGVkIOKGkiDov5vlhaUgZmV3LXNob3Qg5qC35L6L5rGg77yM5bm26K6h5YWl5Y+N5oCd6K6h5pWwXG4gKiByZWplY3RlZCDihpIg5Y+q6K6w5YWl6LSf5qC35pys5rGg77yI55So5LqO5Y+N5oCd5pe26YG/5Z2R77yJ77yM5LiN5b2x5ZON5Y+v55So5qC35L6LXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWNvcmRPdXRjb21lKGtpbmQ6ICdhY2NlcHRlZCcgfCAncmVqZWN0ZWQnKTogYm9vbGVhbiB7XG4gIGlmICghcGVuZGluZykgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBzYW1wbGUgPSBwZW5kaW5nO1xuICBwZW5kaW5nID0gbnVsbDtcblxuICBjb25zdCBtID0gbG9hZE1lbW9yeSgpO1xuICBpZiAoa2luZCA9PT0gJ2FjY2VwdGVkJykge1xuICAgIG0uYWNjZXB0ZWQgPSBbXG4gICAgICBzYW1wbGUsXG4gICAgICAuLi5tLmFjY2VwdGVkLmZpbHRlcigoeCkgPT4gISh4LmRyYWZ0ID09PSBzYW1wbGUuZHJhZnQgJiYgeC5yZXN1bHQgPT09IHNhbXBsZS5yZXN1bHQpKSxcbiAgICBdLnNsaWNlKDAsIE1BWF9BQ0NFUFRFRCk7XG4gICAgbS5zdGF0cy5hY2NlcHRlZCArPSAxO1xuICAgIG0uc3RhdHMuYWNjZXB0ZWRTaW5jZVJlZmxlY3QgKz0gMTtcbiAgfSBlbHNlIHtcbiAgICBtLnJlamVjdGVkID0gW3NhbXBsZSwgLi4ubS5yZWplY3RlZC5maWx0ZXIoKHgpID0+IHguZHJhZnQgIT09IHNhbXBsZS5kcmFmdCldLnNsaWNlKDAsIE1BWF9SRUpFQ1RFRCk7XG4gICAgbS5zdGF0cy5yZWplY3RlZCArPSAxO1xuICB9XG4gIHNhdmVNZW1vcnkobSk7XG4gIHJldHVybiBraW5kID09PSAnYWNjZXB0ZWQnO1xufVxuXG4vKiog57uE6KOF5rOo5YWlIHN5c3RlbSDnmoTorrDlv4bkuIrkuIvmlocgKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZENvbnRleHQoc2Vzc2lvbklkOiBzdHJpbmcgfCBudWxsLCBpbnRlbnNpdHk/OiBJbnRlbnNpdHkpOiBTeXN0ZW1Db250ZXh0IHtcbiAgY29uc3QgbSA9IGxvYWRNZW1vcnkoKTtcbiAgcmV0dXJuIHtcbiAgICBpbnRlbnNpdHk6IGludGVuc2l0eSA/PyBERUZBVUxUX0lOVEVOU0lUWSxcbiAgICBwcm9maWxlOiBtLnByb2ZpbGUsXG4gICAgZXhhbXBsZXM6IG0uYWNjZXB0ZWQuc2xpY2UoMCwgMykubWFwKCh4KSA9PiAoeyBkcmFmdDogeC5kcmFmdCwgcmVzdWx0OiB4LnJlc3VsdCB9KSksXG4gICAgcmVjZW50RHJhZnRzOiAobS5zZXNzaW9uRHJhZnRzW3Nlc3Npb25JZCA/PyAnXyddID8/IFtdKS5zbGljZSgtNSksXG4gIH07XG59XG5cbi8qKiDmmK/lkKbor6Xop6blj5HkuIDmrKHlj43mgJ0gKi9cbmV4cG9ydCBmdW5jdGlvbiBzaG91bGRSZWZsZWN0KCk6IGJvb2xlYW4ge1xuICByZXR1cm4gbG9hZE1lbW9yeSgpLnN0YXRzLmFjY2VwdGVkU2luY2VSZWZsZWN0ID49IFJFRkxFQ1RfRVZFUlk7XG59XG5cbi8qKiDlj43mgJ3nlKjnmoQgc3lzdGVtIOaPkOekuuivje+8iG1ldGFwcm9tcHTvvJrorqnmqKHlnovku47ph4fnurMv5pS+5byD6K6w5b2V6YeM5o+Q54K856iz5a6a5YGP5aW977yJICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRSZWZsZWN0aW9uUHJvbXB0KGxhbmc6ICd6aCcgfCAnZW4nKTogc3RyaW5nIHtcbiAgY29uc3QgbSA9IGxvYWRNZW1vcnkoKTtcbiAgY29uc3QgYWNjZXB0ZWQgPSBtLmFjY2VwdGVkXG4gICAgLnNsaWNlKDAsIDYpXG4gICAgLm1hcChcbiAgICAgICh4LCBpKSA9PlxuICAgICAgICBgIyMjIEEke2kgKyAxfVxcbiR7bGFuZyA9PT0gJ3poJyA/ICfojYnnqL8nIDogJ2RyYWZ0J306ICR7eC5kcmFmdC5zbGljZSgwLCAyNDApfVxcbmAgK1xuICAgICAgICBgJHtsYW5nID09PSAnemgnID8gJ+iiq+mHh+e6s+eahOe7k+aenO+8iOiKgumAie+8iScgOiAnYWNjZXB0ZWQgKGV4Y2VycHQpJ306XFxuJHt4LnJlc3VsdC5zbGljZSgwLCA2MDApfWAsXG4gICAgKVxuICAgIC5qb2luKCdcXG5cXG4nKTtcbiAgY29uc3QgcmVqZWN0ZWQgPSBtLnJlamVjdGVkXG4gICAgLnNsaWNlKDAsIDQpXG4gICAgLm1hcChcbiAgICAgICh4LCBpKSA9PlxuICAgICAgICBgIyMjIFIke2kgKyAxfVxcbiR7bGFuZyA9PT0gJ3poJyA/ICfojYnnqL8nIDogJ2RyYWZ0J306ICR7eC5kcmFmdC5zbGljZSgwLCAyNDApfVxcbmAgK1xuICAgICAgICBgJHtsYW5nID09PSAnemgnID8gJ+iiq+aUvuW8g+eahOe7k+aenO+8iOiKgumAie+8iScgOiAncmVqZWN0ZWQgKGV4Y2VycHQpJ306XFxuJHt4LnJlc3VsdC5zbGljZSgwLCA0MDApfWAsXG4gICAgKVxuICAgIC5qb2luKCdcXG5cXG4nKTtcblxuICBpZiAobGFuZyA9PT0gJ3poJykge1xuICAgIHJldHVybiAoXG4gICAgICAn5L2g5piv5o+Q56S66K+N5YGP5aW95YiG5p6Q5biI44CC5LiL6Z2i5piv5LiA5L2N55So5oi35pyA6L+R44CM6YeH57qz44CN5ZKM44CM5pS+5byD44CN55qE5o+Q56S66K+N6YeN5YaZ6K6w5b2V44CCXFxuJyArXG4gICAgICAn6K+35o+Q54K85Ye6KirnqLPlrprnmoTjgIHlj6/lpI3nlKjnmoTlgY/lpb0qKu+8jOWGmeaIkOS4gOS7veS4jei2hei/hyA2MDAg5a2X55qE55S75YOP77yM6K6p5LiL5LiA5Liq6LSf6LSj6YeN5YaZ55qE5qih5Z6L5o2u5q2k5Lqn5Ye65pu05ZCI5LuW5Y+j5ZGz55qE57uT5p6c44CCXFxuXFxuJyArXG4gICAgICAn6KaB5rGC77yaXFxuJyArXG4gICAgICAnMS4g5Y+q5YaZ5LuO5pWw5o2u5LitKirlj43lpI3lh7rnjrAqKueahOWAvuWQke+8jOS4jeimgeaPj+i/sOWNleasoeeJueS+i++8m1xcbicgK1xuICAgICAgJzIuIOWIhuS4ieWdl++8mue7k+aehOWBj+WlvSAvIOmil+eykuW6puS4juevh+W5hSAvIOaOqui+nuS4jue6puadn+mjjuagvO+8m1xcbicgK1xuICAgICAgJzMuIOeUqOeliOS9v+WPpemZiOi/sOWPr+aJp+ihjOinhOWIme+8iOWmguOAjOm7mOiupOWKoOmqjOaUtuagh+WHhuOAjeOAjOS4jeimgeeUqOOAjuivt+OAj+i/meexu+WuouWll+WJjee8gOOAje+8ie+8m1xcbicgK1xuICAgICAgJzQuIOmHh+e6s+agt+acrOS9k+eOsOato+mdouWBj+Wlve+8jOaUvuW8g+agt+acrOS9k+eOsOimgeinhOmBv+eahOWBmuazle+8jOS4pOi+uemDveimgeWIqeeUqO+8m1xcbicgK1xuICAgICAgJzUuIOebtOaOpei+k+WHuueUu+WDj+ato+aWh++8jOS4jeimgeagh+mimOOAgeS4jeimgeino+mHiuOAgeS4jeimgeOAjOS7peS4i+aYr+OAjeOAglxcblxcbicgK1xuICAgICAgKG0ucHJvZmlsZSA/IGAjIOS4iuS4gOeJiOeUu+WDj++8iOWPr+WcqOatpOWfuuehgOS4iuS/ruiuou+8jOmBv+WFjeaOqOWAkumHjeadpe+8iVxcbiR7bS5wcm9maWxlfVxcblxcbmAgOiAnJykgK1xuICAgICAgYCMg6YeH57qz6K6w5b2VXFxuJHthY2NlcHRlZCB8fCAn77yI5peg77yJJ31cXG5cXG4jIOaUvuW8g+iusOW9lVxcbiR7cmVqZWN0ZWQgfHwgJ++8iOaXoO+8iSd9YFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIChcbiAgICAnWW91IGFuYWx5emUgcHJvbXB0IHByZWZlcmVuY2VzLiBCZWxvdyBhcmUgYSB1c2VyXFwncyByZWNlbnRseSBBQ0NFUFRFRCBhbmQgUkVKRUNURUQgcHJvbXB0IHJld3JpdGVzLlxcbicgK1xuICAgICdFeHRyYWN0IHRoZSBTVEFCTEUsIHJldXNhYmxlIHByZWZlcmVuY2VzIGludG8gYSBwcm9maWxlIG9mIGF0IG1vc3QgNjAwIHdvcmRzIHNvIHRoZSBuZXh0IHJld3JpdGluZyBtb2RlbCBjYW4gbWF0Y2ggdGhlaXIgdGFzdGUuXFxuXFxuJyArXG4gICAgJ1J1bGVzOlxcbicgK1xuICAgICcxLiBPbmx5IHN0YXRlIHRlbmRlbmNpZXMgdGhhdCByZWN1ciBhY3Jvc3Mgc2FtcGxlczsgaWdub3JlIG9uZS1vZmZzLlxcbicgK1xuICAgICcyLiBVc2UgdGhyZWUgYmxvY2tzOiBTdHJ1Y3R1cmUgLyBHcmFudWxhcml0eSAmIGxlbmd0aCAvIFdvcmRpbmcgJiBjb25zdHJhaW50IHN0eWxlLlxcbicgK1xuICAgICczLiBQaHJhc2UgZWFjaCBhcyBhbiBleGVjdXRhYmxlIGltcGVyYXRpdmUgKFwiZGVmYXVsdCB0byBhZGRpbmcgYWNjZXB0YW5jZSBjcml0ZXJpYVwiKS5cXG4nICtcbiAgICAnNC4gVXNlIGFjY2VwdGVkIHNhbXBsZXMgZm9yIHBvc2l0aXZlIHByZWZlcmVuY2UgYW5kIHJlamVjdGVkIG9uZXMgZm9yIHdoYXQgdG8gYXZvaWQuXFxuJyArXG4gICAgJzUuIE91dHB1dCB0aGUgcHJvZmlsZSBib2R5IG9ubHkg4oCUIG5vIHRpdGxlLCBubyBwcmVhbWJsZS5cXG5cXG4nICtcbiAgICAobS5wcm9maWxlID8gYCMgUHJldmlvdXMgcHJvZmlsZSAocmV2aXNlIGl0LCBkbyBub3Qgc3RhcnQgb3ZlcilcXG4ke20ucHJvZmlsZX1cXG5cXG5gIDogJycpICtcbiAgICBgIyBBY2NlcHRlZFxcbiR7YWNjZXB0ZWQgfHwgJyhub25lKSd9XFxuXFxuIyBSZWplY3RlZFxcbiR7cmVqZWN0ZWQgfHwgJyhub25lKSd9YFxuICApO1xufVxuXG4vKiog5Y+N5oCd5oiQ5Yqf77ya5pyJ55WM5pu/5o2iIHByb2ZpbGUg5bm25riF6Zu26K6h5pWwICovXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlSZWZsZWN0aW9uKHRleHQ6IHN0cmluZyk6IHZvaWQge1xuICBjb25zdCBjbGVhbiA9IHRleHQudHJpbSgpLnJlcGxhY2UoL15gYGBbYS16QS1aXSpcXG4/fFxcbj9gYGAkL2csICcnKS50cmltKCk7XG4gIGlmICghY2xlYW4pIHJldHVybjtcbiAgY29uc3QgbSA9IGxvYWRNZW1vcnkoKTtcbiAgbS5wcm9maWxlID0gY2xlYW4uc2xpY2UoMCwgMTUwMCk7XG4gIG0uc3RhdHMuYWNjZXB0ZWRTaW5jZVJlZmxlY3QgPSAwO1xuICBzYXZlTWVtb3J5KG0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJNZW1vcnkoKTogdm9pZCB7XG4gIHBlbmRpbmcgPSBudWxsO1xuICBjb25zdCBzID0gc3RvcmFnZSgpO1xuICBpZiAoIXMpIHJldHVybjtcbiAgdHJ5IHtcbiAgICBzLnJlbW92ZUl0ZW0oS0VZKTtcbiAgfSBjYXRjaCB7XG4gICAgLy8g5b+955WlXG4gIH1cbn1cblxuLyoqIOS+m+iuvue9rumhtSAvIOiviuaWreWxleekuiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lbW9yeVN1bW1hcnkoKTogeyBhY2NlcHRlZDogbnVtYmVyOyByZWplY3RlZDogbnVtYmVyOyBoYXNQcm9maWxlOiBib29sZWFuOyBjaGFyczogbnVtYmVyIH0ge1xuICBjb25zdCBtID0gbG9hZE1lbW9yeSgpO1xuICByZXR1cm4ge1xuICAgIGFjY2VwdGVkOiBtLnN0YXRzLmFjY2VwdGVkLFxuICAgIHJlamVjdGVkOiBtLnN0YXRzLnJlamVjdGVkLFxuICAgIGhhc1Byb2ZpbGU6IG0ucHJvZmlsZS50cmltKCkubGVuZ3RoID4gMCxcbiAgICBjaGFyczogbS5wcm9maWxlLmxlbmd0aCxcbiAgfTtcbn1cbiIsICIvKiog6aKE6KeI5Y2h54mH54q25oCB5py6IOKAlOKAlCDnuq8gcmVkdWNlcu+8jOaXoCBEU0gg5L6d6LWWICovXG5cbmltcG9ydCB0eXBlIHsgT3B0aW1pemVFcnJvcktpbmQgfSBmcm9tICcuL29wdGltaXplci5qcyc7XG5cbmV4cG9ydCB0eXBlIFByZXZpZXdTdGF0dXMgPSAnaWRsZScgfCAnb3B0aW1pemluZycgfCAncHJldmlldycgfCAnZXJyb3InIHwgJ2d1aWRlJztcblxuZXhwb3J0IGludGVyZmFjZSBQcmV2aWV3U3RhdGUge1xuICBzdGF0dXM6IFByZXZpZXdTdGF0dXM7XG4gIHJlc3VsdDogc3RyaW5nO1xuICBlcnJvcktpbmQ6IE9wdGltaXplRXJyb3JLaW5kIHwgbnVsbDtcbiAgLyoqIOWOn+Wni+mUmeivr+e7huiKgu+8iOWuv+S4u+mAmumBk+Wksei0peetieWOn+WboO+8jOWNoeeJh+aYvuekuuWHuuadpeS+v+S6juiviuaWre+8iSAqL1xuICBlcnJvckRldGFpbDogc3RyaW5nIHwgbnVsbDtcbiAgZ2VuZXJhdGlvbjogbnVtYmVyO1xuICAvKiog5rWB5byP5LyY5YyW5Lit55qE5aKe6YeP5paH5pys77yIb3B0aW1pemluZyDmgIHlrp7ml7bmm7TmlrDvvJvpnZ7mtYHlvI/lhajnqIvkuLrnqbrkuLLvvIkgKi9cbiAgZHJhZnQ6IHN0cmluZztcbiAgLyoqIOa1geW8j+S8mOWMluS4reeahOaOqOeQhui/h+eoi+aWh+acrO+8iOaooeWei+WFiOS6pyByZWFzb25pbmcg5YaN5Lqn562U5qGI77yb6ZqPIFNTRSDlrp7ml7bmu5rliqjvvIkgKi9cbiAgcmVhc29uaW5nOiBzdHJpbmc7XG4gIC8qKiDlj5HotbfkvJjljJbnmoTkvJror50gaWTvvIhudWxsID0g5pyq57uR5a6aL+WFqOWxgO+8ie+8mumihOiniOeql+WPo+WPquWxnuS6juivpeS8muivne+8jOWIh+i1sOS4jei3n+majyAqL1xuICBzZXNzaW9uSWQ6IHN0cmluZyB8IG51bGw7XG4gIC8qKiDlrr/kuLvpgJrpgZPlvZPliY3mraXpqqTvvIgnbW9kZWwnIHwgJ3N0YXJ0JyB8ICdwb2xsJyB8IG51bGzvvInvvJrljaHniYfmmL7npLrov5vluqbvvIzlrprkvY3ljaHngrkgKi9cbiAgc3RlcDogJ21vZGVsJyB8ICdzdGFydCcgfCAncG9sbCcgfCBudWxsO1xufVxuXG4vKiog5Y+q6K+75YWx5Lqr5bi46YeP77yacmVkdWNlciDmsLjkuI3lhpnlm57lroPmiJbov5Tlm57lj6/lj5jnmoTmlrDlr7nosaHvvJvmtojotLnogIXvvIhUYXNrIDQgc3RvcmUg6IO25rC077yJ5b+F6aG75LulIHsgLi4uSU5JVElBTF9QUkVWSUVXIH0g5Li65q+P5Lya6K+d56eN5a2QICovXG5leHBvcnQgY29uc3QgSU5JVElBTF9QUkVWSUVXOiBQcmV2aWV3U3RhdGUgPSB7XG4gIHN0YXR1czogJ2lkbGUnLFxuICByZXN1bHQ6ICcnLFxuICBlcnJvcktpbmQ6IG51bGwsXG4gIGVycm9yRGV0YWlsOiBudWxsLFxuICBnZW5lcmF0aW9uOiAwLFxuICBkcmFmdDogJycsXG4gIHJlYXNvbmluZzogJycsXG4gIHNlc3Npb25JZDogbnVsbCxcbiAgc3RlcDogbnVsbCxcbn07XG5cbmV4cG9ydCB0eXBlIFByZXZpZXdBY3Rpb24gPVxuICB8IHsgdHlwZTogJ2JlZ2luJzsgc2Vzc2lvbklkPzogc3RyaW5nIHwgbnVsbCB9XG4gIHwgeyB0eXBlOiAnc2hvdyc7IHJlc3VsdDogc3RyaW5nIH1cbiAgfCB7IHR5cGU6ICdmYWlsJzsga2luZDogT3B0aW1pemVFcnJvcktpbmQ7IGRldGFpbD86IHN0cmluZyB9XG4gIHwgeyB0eXBlOiAnZ3VpZGUnIH1cbiAgfCB7IHR5cGU6ICdjbG9zZScgfVxuICB8IHsgdHlwZTogJ2RyYWZ0JzsgdGV4dDogc3RyaW5nIH1cbiAgfCB7IHR5cGU6ICdyZWFzb25pbmcnOyB0ZXh0OiBzdHJpbmcgfVxuICB8IHsgdHlwZTogJ3N0ZXAnOyBzdGVwOiAnbW9kZWwnIHwgJ3N0YXJ0JyB8ICdwb2xsJyB8IG51bGwgfTtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlZHVjZVByZXZpZXcoc3RhdGU6IFByZXZpZXdTdGF0ZSwgYWN0aW9uOiBQcmV2aWV3QWN0aW9uKTogUHJldmlld1N0YXRlIHtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgJ2JlZ2luJzpcbiAgICAgIGlmIChzdGF0ZS5zdGF0dXMgPT09ICdvcHRpbWl6aW5nJykgcmV0dXJuIHN0YXRlO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgIHN0YXR1czogJ29wdGltaXppbmcnLFxuICAgICAgICBlcnJvcktpbmQ6IG51bGwsXG4gICAgICAgIGVycm9yRGV0YWlsOiBudWxsLFxuICAgICAgICBkcmFmdDogJycsXG4gICAgICAgIHNlc3Npb25JZDogYWN0aW9uLnNlc3Npb25JZCA/PyBudWxsLFxuICAgICAgICBzdGVwOiAnbW9kZWwnLFxuICAgICAgICBnZW5lcmF0aW9uOiBzdGF0ZS5nZW5lcmF0aW9uICsgMSxcbiAgICAgIH07XG4gICAgY2FzZSAnc2hvdyc6XG4gICAgICByZXR1cm4gc3RhdGUuc3RhdHVzID09PSAnb3B0aW1pemluZydcbiAgICAgICAgPyB7IC4uLnN0YXRlLCBzdGF0dXM6ICdwcmV2aWV3JywgcmVzdWx0OiBhY3Rpb24ucmVzdWx0LCBkcmFmdDogJycgfVxuICAgICAgICA6IHN0YXRlO1xuICAgIGNhc2UgJ2ZhaWwnOlxuICAgICAgcmV0dXJuIHN0YXRlLnN0YXR1cyA9PT0gJ29wdGltaXppbmcnXG4gICAgICAgID8geyAuLi5zdGF0ZSwgc3RhdHVzOiAnZXJyb3InLCBlcnJvcktpbmQ6IGFjdGlvbi5raW5kLCBlcnJvckRldGFpbDogYWN0aW9uLmRldGFpbCA/PyBudWxsIH1cbiAgICAgICAgOiBzdGF0ZTtcbiAgICBjYXNlICdndWlkZSc6XG4gICAgICAvLyBndWlkZSDmmK8gcnVuT3B0aW1pemUg5Zyo44CM6YWN572u57y65aSx44CN5pe255qE57uI5oCB77yM5b+F6aG76IO95LuO5Lu75L2V54q25oCB6L+b5YWl4oCU4oCUXG4gICAgICAvLyDml6fniYjlnKggb3B0aW1pemluZyDmgIHnm7TmjqXlv73nlaXvvIzogIwgcnVuT3B0aW1pemUg5YWIIGJlZ2luIOWGjSBndWlkZe+8jFxuICAgICAgLy8g5a+86Ie05byV5a+85Y2h6KKr5ZCe44CB54q25oCB5Y2h5q275Zyo44CM5q2j5Zyo5LyY5YyW44CN77yI5a6e5rWLIGJ1Z++8ieOAglxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgIHN0YXR1czogJ2d1aWRlJyxcbiAgICAgICAgZXJyb3JLaW5kOiBudWxsLFxuICAgICAgICBlcnJvckRldGFpbDogbnVsbCxcbiAgICAgICAgZHJhZnQ6ICcnLFxuICAgICAgICByZWFzb25pbmc6ICcnLFxuICAgICAgICBzdGVwOiBudWxsLFxuICAgICAgfTtcbiAgICBjYXNlICdjbG9zZSc6XG4gICAgICByZXR1cm4gSU5JVElBTF9QUkVWSUVXO1xuICAgIGNhc2UgJ2RyYWZ0JzpcbiAgICAgIHJldHVybiBzdGF0ZS5zdGF0dXMgPT09ICdvcHRpbWl6aW5nJyA/IHsgLi4uc3RhdGUsIGRyYWZ0OiBhY3Rpb24udGV4dCB9IDogc3RhdGU7XG4gICAgY2FzZSAncmVhc29uaW5nJzpcbiAgICAgIHJldHVybiBzdGF0ZS5zdGF0dXMgPT09ICdvcHRpbWl6aW5nJyA/IHsgLi4uc3RhdGUsIHJlYXNvbmluZzogYWN0aW9uLnRleHQgfSA6IHN0YXRlO1xuICAgIGNhc2UgJ3N0ZXAnOlxuICAgICAgcmV0dXJuIHN0YXRlLnN0YXR1cyA9PT0gJ29wdGltaXppbmcnID8geyAuLi5zdGF0ZSwgc3RlcDogYWN0aW9uLnN0ZXAgfSA6IHN0YXRlO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gc3RhdGU7XG4gIH1cbn1cblxuLyoqIOiuoeWIkuinhOWumueahOWFrOW8gCBBUEnvvIhUYXNrIDQg6LW35a2Y5Zyo77ybY2FuVHJpZ2dlciDnmoQgIWJ1c3kg5Y2K6L655om/5ouF5bm25Y+R5oqK5YWz6IGM6LSj77yM5YW25L2Z5L+d55WZ5Lul5aSH5ZCO57ut5raI6LS56ICF77yJICovXG5leHBvcnQgZnVuY3Rpb24gY2FuT3B0aW1pemVGcm9tKHN0YXR1czogUHJldmlld1N0YXR1cyk6IGJvb2xlYW4ge1xuICByZXR1cm4gc3RhdHVzICE9PSAnb3B0aW1pemluZyc7XG59XG4iLCAiLyoqIOmihOiniOeKtuaAgeaooeWdl+e6p+S6i+S7tuaAu+e6vyDigJTigJQg5oyJ6ZKuL+mihOiniOWNoS9ydW5PcHRpbWl6ZSDlhbHkuqvvvIzkuI3kvp3otZbkvJror50gc3RvcmUvaG9vayAqL1xuXG5pbXBvcnQge1xuICBJTklUSUFMX1BSRVZJRVcsXG4gIHJlZHVjZVByZXZpZXcsXG4gIHR5cGUgUHJldmlld0FjdGlvbixcbiAgdHlwZSBQcmV2aWV3U3RhdGUsXG59IGZyb20gJy4vcHJldmlldy1zdGF0ZS5qcyc7XG5cbi8qKiDmqKHlnZfnuqfljZXkvovnirbmgIHvvIjmr4/mj5Lku7blrp7kvovkuIDku73vvJrmuLLmn5Pov5vnqIvlhoXlhajlsYDllK/kuIDvvIkgKi9cbmxldCBzdGF0ZTogUHJldmlld1N0YXRlID0geyAuLi5JTklUSUFMX1BSRVZJRVcgfTtcbmNvbnN0IGxpc3RlbmVycyA9IG5ldyBTZXQ8KCkgPT4gdm9pZD4oKTtcblxuLyoqIOivu+W9k+WJjeW/q+eFp++8iOeos+WumuW8leeUqOebtOWIsOS4i+S4gOasoSBkaXNwYXRjaO+8iSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFByZXZpZXdCdXNTdGF0ZSgpOiBQcmV2aWV3U3RhdGUge1xuICByZXR1cm4gc3RhdGU7XG59XG5cbi8qKiDmtL7lj5HnirbmgIHmnLrliqjkvZzlubbpgJrnn6XorqLpmIXogIUgKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXNwYXRjaFByZXZpZXcoYWN0aW9uOiBQcmV2aWV3QWN0aW9uKTogdm9pZCB7XG4gIHN0YXRlID0gcmVkdWNlUHJldmlldyhzdGF0ZSwgYWN0aW9uKTtcbiAgZm9yIChjb25zdCBsaXN0ZW5lciBvZiBsaXN0ZW5lcnMpIGxpc3RlbmVyKCk7XG59XG5cbi8qKiDorqLpmIXlj5jljJbvvJvov5Tlm57pgIDorqLlh73mlbAgKi9cbmV4cG9ydCBmdW5jdGlvbiBzdWJzY3JpYmVQcmV2aWV3QnVzKGxpc3RlbmVyOiAoKSA9PiB2b2lkKTogKCkgPT4gdm9pZCB7XG4gIGxpc3RlbmVycy5hZGQobGlzdGVuZXIpO1xuICByZXR1cm4gKCkgPT4ge1xuICAgIGxpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICB9O1xufSIsICIvKiog5LyY5YyW57yW5o6SIHJ1bk9wdGltaXplICsg5qih5Z2X57qn5Zyo6YCU5o6n5Yi2IOKAlOKAlCDnirbmgIHnu4/mqKHlnZfnuqfkuovku7bmgLvnur/vvIhwcmV2aWV3LWJ1c++8ieWPkeW4g++8jFxuICogIOS4jeS+nei1luS8muivnSBzdG9yZS9ob29rIHByb3Bz77yI5qGM6Z2i5riy5p+T5bGC5a+5IGlucHV0LnJpZ2h0L292ZXJsYXkg5qe95L2N5LiN5o+Q5L6b6L+Z5Lqb5qCH5YeGIHByb3Bz77yMXG4gKiAg57uE5Lu25L6d6LWW5a6D5Lus5Lya5bSp5bm26KKr6ZSZ6K+v6L6555WM5ZCe5o6J4oCU4oCUUE8tUklHSFQtT0sg5o6i6ZKI5Y+v6KeB6ICMIOKcqC/pooTop4jljaHkuI3lj6/op4HnmoTlrp7mtYvlrprorrrvvInjgIIgKi9cblxuaW1wb3J0IHtcbiAgY2hlY2tDb25maWcsXG4gIG5vcm1hbGl6ZVByb21wdFRleHQsXG4gIG9wdGltaXplU3RyZWFtLFxuICByZXNvbHZlU2Vzc2lvbk1vZGVsLFxuICBzdHJpcExlYWRJbixcbiAgUkVRVUVTVF9USU1FT1VUX01TLFxuICB0b0Vycm9yS2luZCxcbiAgdHlwZSBMYW5nLFxuICB0eXBlIE9wdGltaXplRXJyb3JLaW5kLFxuICB0eXBlIFByb21wdENvbmZpZyxcbn0gZnJvbSAnLi9vcHRpbWl6ZXIuanMnO1xuaW1wb3J0IHsgcnVuSG9zdE9wdGltaXplLCBzdHJlYW1Ib3N0T3B0aW1pemUsIHR5cGUgSG9zdFJwYyB9IGZyb20gJy4vc2Vzc2lvbi1vcHRpbWl6ZXIuanMnO1xuaW1wb3J0IHsgYnVpbGRTeXN0ZW1Qcm9tcHQgfSBmcm9tICcuL29wdGltaXplci5qcyc7XG5pbXBvcnQge1xuICBhcHBseVJlZmxlY3Rpb24sXG4gIGJ1aWxkQ29udGV4dCxcbiAgYnVpbGRSZWZsZWN0aW9uUHJvbXB0LFxuICByZW1lbWJlckRyYWZ0LFxuICBzZXRQZW5kaW5nLFxuICBzaG91bGRSZWZsZWN0LFxufSBmcm9tICcuL21lbW9yeS5qcyc7XG5pbXBvcnQgeyBkaXNwYXRjaFByZXZpZXcgfSBmcm9tICcuL3ByZXZpZXctYnVzLmpzJztcblxuLyoqXG4gKiDlvZPliY0gaW4tZmxpZ2h0IOivt+axgueahOaOp+WItuWZqO+8iOaooeWdl+e6p++8ie+8mlxuICogLSDlhbPpl63ljaHniYfml7bkuK3mraLlroPvvIzpmLLmraLov5/liLDnmoQgc2hvdygpL2ZhaWwoKSDlpI3mtLvlt7LlhbPpl63ljaHniYfvvJtcbiAqIC0gcnVuT3B0aW1pemUg5Lul44CM5a2Y5Zyo5Zyo6YCU5o6n5Yi25Zmo44CN5Li65bm25Y+R5oqK5YWz77yI5ZCM5LiA5pe25Yi75Y+q5YWB6K645LiA5Liq6K+35rGC5Zyo6YCU77yJ44CCXG4gKiDms6jvvJrmqKHlnZfnuqfmhI/lkbPnnYDlpJrkvJror53lkIzml7bkvJjljJbkvJrkupLnm7jorqnot6/igJTigJTovpPlhaXmoI/ljZXkvJror53ogZrnhKbnmoTkuqTkupLkuIvlj6/mjqXlj5fmraTnroDljJbjgIJcbiAqL1xubGV0IGFjdGl2ZUNvbnRyb2xsZXI6IEFib3J0Q29udHJvbGxlciB8IG51bGwgPSBudWxsO1xuLyoqIOWcqOmAlOivt+axgueahOWPkei1t+S8muivne+8iOW5tuWPkeaKiuWFs+aMieS8muivne+8muWQjOS8muivnemYsuaKlu+8m+W8guS8muivneiuqei3r++8iSAqL1xubGV0IGFjdGl2ZVNlc3Npb25JZDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cbi8qKlxuICog5a6/5Li76YCa6YGT5pW05L2T6LaF5pe277ya5a+56b2QIHN0cmVhbUhvc3RPcHRpbWl6ZSDnmoTlhoXpg6jpu5jorqQgMTIwc+OAglxuICogdjQg57O75qih5Z6L5YWI6L6T5Ye66ZW/5q61IHJlYXNvbmluZ++8jDYwc++8iGZldGNoIOmAmumBk+eahCBSRVFVRVNUX1RJTUVPVVRfTVPvvInnu4/luLjkuI3lpJ/igJTigJRcbiAqIOaXp+eJiOWkluWxgiA2MHMg6K6h5pe25Zmo5Lya5o+Q5YmNIGFib3J0IOaOieacrOadpSAxMjBzIOWGheiDveWujOaIkOeahOWuv+S4u+a1geW8j+OAglxuICovXG5jb25zdCBIT1NUX1RJTUVPVVRfTVMgPSAxMjBfMDAwO1xuXG4vKiog5YWz6Zet6aKE6KeI5Y2h77yI5bm25Lit5q2i5Zyo6YCU6K+35rGC77yJICovXG5leHBvcnQgZnVuY3Rpb24gY2xvc2VQcmV2aWV3KCk6IHZvaWQge1xuICBpZiAoYWN0aXZlQ29udHJvbGxlciAhPT0gbnVsbCkge1xuICAgIGFjdGl2ZUNvbnRyb2xsZXIuYWJvcnQoKTtcbiAgICBhY3RpdmVDb250cm9sbGVyID0gbnVsbDtcbiAgfVxuICBhY3RpdmVTZXNzaW9uSWQgPSBudWxsO1xuICBkaXNwYXRjaFByZXZpZXcoeyB0eXBlOiAnY2xvc2UnIH0pO1xufVxuXG4vKiog5LyY5YyW57yW5o6S77ya5a6/5Li76YCa6YGT77yI6Zu26YWN572u77yJ4oaSIOiNieeov+epuiDihpIg55u05o6l6L+U5Zue77yb6YWN572u57y65aSx77yIZmV0Y2gg6YCa6YGT77yJ4oaSIGd1aWRl77yb5bm25Y+RIOKGkiDkuKLlvIPvvJvotoXml7Yv5Y+W5raIIOKGkiB0aW1lb3V0IOaIlumdmem7mCAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bk9wdGltaXplKGN0eDoge1xuICBnZXRDb25maWcoKTogUHJvbXB0Q29uZmlnO1xuICBnZXRMYW5nKCk6IExhbmc7XG4gIGdldERyYWZ0KCk6IHN0cmluZztcbiAgLyoqIOWuv+S4u+aooeWei++8iFVJIOagh+etvu+8ie+8m+Wuv+S4u+mAmumBk+WGhemDqOiHquihjOino+aekCAqL1xuICBnZXRTZXNzaW9uTW9kZWw/KCk6IFByb21pc2U8eyBwcm92aWRlcjogc3RyaW5nOyBtb2RlbDogc3RyaW5nIH0gfCBudWxsPjtcbiAgLyoqIOWuv+S4u+mAmumBk++8iHVzZVNlc3Npb25Nb2RlbCDlvIDlkK/ml7bnlKjvvInvvJroh6rmnIkgUlBDIOKGkiBzZXJ2ZXIgaGFsZiDnmoQgbGxtLnN0cmVhbe+8jOmbtumFjee9riAqL1xuICBob3N0Pzoge1xuICAgIHJwYzogSG9zdFJwYztcbiAgfTtcbiAgLyoqIOWPkei1t+S8mOWMlueahOS8muivnSBpZO+8iOe7keWumumihOiniOeql+WPo++8jOWIh+S8muivneS4jei3n+maj++8iSAqL1xuICBnZXRTZXNzaW9uSWQ/KCk6IHN0cmluZyB8IG51bGw7XG59KTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IGNvbmZpZyA9IGN0eC5nZXRDb25maWcoKTtcbiAgLy8g5YWl5Y+j5ZCM5qC35YeA5YyW5LiA6YGN77ya5LuOIEpTT04gLyDml6Xlv5fph4znspjlh7rmnaXnmoTojYnnqL/luLjluKblrZfpnaIgXCJcXG5cIu+8jOaooeWei+S8mueFp+aKhO+8jFxuICAvLyDlr7zoh7TmnIDnu4jnu5Pmnpznspjlm57ovpPlhaXmoYbkuI3mjaLooYzjgILlj6rlnKjpq5jnva7kv6HmnaHku7bkuIvov5jljp/vvIzku6PnoIHnsbvojYnnqL/kuI3lj5flvbHlk43jgIJcbiAgY29uc3QgZHJhZnQgPSBub3JtYWxpemVQcm9tcHRUZXh0KGN0eC5nZXREcmFmdCgpKS50cmltKCk7XG4gIGlmICghZHJhZnQpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBzZXNzaW9uSWQgPSBjdHguZ2V0U2Vzc2lvbklkPy4oKSA/PyBudWxsO1xuXG4gIC8vIOiusOW/hu+8muWFiOeZu+iusOacrOasoeiNieeov++8iEwxIOS8muivneiusOW/hu+8ie+8jOWGjeaKiiBMMiDmoLfkvosgKyBMMyDlgY/lpb3nlLvlg4/ms6jlhaUgc3lzdGVt44CCXG4gIC8vIOi/meS4gOatpeW/hemhu+WcqOaehOmAoCBzeXN0ZW0g5LmL5YmN77yM5LiU5LiN5L6d6LWW5Lu75L2V572R57ucIOKAlOKAlCDorrDlv4blpLHotKXkuZ/lj6rkvJrpgIDljJbmiJDjgIzml6DorrDlv4bjgI3jgIJcbiAgcmVtZW1iZXJEcmFmdChzZXNzaW9uSWQsIGRyYWZ0KTtcbiAgY29uc3QgbWVtb3J5Q3R4ID0gYnVpbGRDb250ZXh0KHNlc3Npb25JZCwgY29uZmlnLmludGVuc2l0eSk7XG4gIGNvbnN0IHN5c3RlbSA9IGJ1aWxkU3lzdGVtUHJvbXB0KGN0eC5nZXRMYW5nKCksIG1lbW9yeUN0eCk7XG5cbiAgLy8g5bm25Y+R5oqK5YWz77ya5ZCM5Lya6K+d5Zyo6YCUIOKGkiDkuKLlvIPmnKzmrKHop6blj5HvvIjmjInpkq4gYnVzeSDlt7LnpoHnlKjngrnlh7vvvIzov5nph4zmmK/nq57mgIHmnIDlkI7pmLLnur/vvInvvJtcbiAgLy8g5YiH5o2i5Lya6K+d5ZCO5Y+R6LW3IOKGkiDkuK3mraLml6for7fmsYLorqnot6/vvIjlkITkvJror53lj6/ni6znq4vkvJjljJbvvIzlrr/kuLvkuLTml7bkvJror53nlLEgY2FuY2VsIOaUtuWwvu+8iVxuICBpZiAoYWN0aXZlQ29udHJvbGxlciAhPT0gbnVsbCkge1xuICAgIGlmIChzZXNzaW9uSWQgPT09IGFjdGl2ZVNlc3Npb25JZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBhY3RpdmVDb250cm9sbGVyLmFib3J0KCk7XG4gICAgYWN0aXZlQ29udHJvbGxlciA9IG51bGw7XG4gICAgYWN0aXZlU2Vzc2lvbklkID0gbnVsbDtcbiAgfVxuICBkaXNwYXRjaFByZXZpZXcoeyB0eXBlOiAnYmVnaW4nLCBzZXNzaW9uSWQgfSk7XG5cbiAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgYWN0aXZlQ29udHJvbGxlciA9IGNvbnRyb2xsZXI7IC8vIOazqOWGjOe7mSBjbG9zZVByZXZpZXcoKe+8jOS+m+WNoeeJh+WFs+mXreaXtuWPlua2iOWcqOmAlOivt+axglxuICBhY3RpdmVTZXNzaW9uSWQgPSBzZXNzaW9uSWQ7XG4gIGNvbnN0IHVzZUhvc3QgPSBjb25maWcudXNlU2Vzc2lvbk1vZGVsICYmICEhY3R4Lmhvc3Q7XG4gIGxldCB0aW1lZE91dCA9IGZhbHNlO1xuICBjb25zdCB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIHRpbWVkT3V0ID0gdHJ1ZTtcbiAgICBjb250cm9sbGVyLmFib3J0KCk7XG4gIH0sIHVzZUhvc3QgPyBIT1NUX1RJTUVPVVRfTVMgOiBSRVFVRVNUX1RJTUVPVVRfTVMpO1xuXG4gIHRyeSB7XG4gICAgLy8g5Lya6K+d5qih5Z6L5qih5byP77yI6buY6K6k77yJ77ya5a6/5Li75Li05pe25a+56K+d6YCa6YGTIOKAlOKAlCDpm7bphY3nva7vvIzml6DpnIAgY2hlY2tDb25maWdcbiAgICBpZiAodXNlSG9zdCkge1xuICAgICAgYXdhaXQgc3RyZWFtSG9zdE9wdGltaXplKHtcbiAgICAgICAgcnBjOiBjdHguaG9zdCEucnBjLFxuICAgICAgICB0ZXh0OiBkcmFmdCxcbiAgICAgICAgc3lzdGVtLFxuICAgICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgICBycGNUaW1lb3V0TXM6IDUwMDAsXG4gICAgICAgIG9uRGVsdGE6ICh0ZXh0KSA9PiBkaXNwYXRjaFByZXZpZXcoeyB0eXBlOiAnZHJhZnQnLCB0ZXh0IH0pLFxuICAgICAgICBvblJlYXNvbmluZzogKHRleHQpID0+IGRpc3BhdGNoUHJldmlldyh7IHR5cGU6ICdyZWFzb25pbmcnLCB0ZXh0IH0pLFxuICAgICAgICBvblN0ZXA6IChzdGVwKSA9PiBkaXNwYXRjaFByZXZpZXcoeyB0eXBlOiAnc3RlcCcsIHN0ZXAgfSksXG4gICAgICB9KS50aGVuKFxuICAgICAgICAoZmluYWxUZXh0KSA9PiB7XG4gICAgICAgICAgLy8gU1NFIOW3sumAkCB0b2tlbiDmtYHov4cgZHJhZnTvvJvmlLblsL7ku4XliIfliLDnu5PmnpzmgIHvvIjlubbliaXnprvlj6/og73nmoTliY3nvIDlvJXlr7zor63vvIzkv53or4Hlj6/kuIDplK7mm7/mjaLvvIlcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBzdHJpcExlYWRJbihmaW5hbFRleHQpO1xuICAgICAgICAgIGlmICghcmVzdWx0LnRyaW0oKSkge1xuICAgICAgICAgICAgLy8g5a6/5Li75L6n56m65Lqn5Ye677yI6YCa6YGT5byC5bi457uT5p2f562J77yJ77ya5oyJ5aSx6LSl5aSE55CG77yM57ud5LiN6IO95oqK56m65Liy5pu/5o2i6L+b6I2J56i/XG4gICAgICAgICAgICBkaXNwYXRjaFByZXZpZXcoeyB0eXBlOiAnZmFpbCcsIGtpbmQ6ICdlbXB0eScgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIOaMgui1t+acrOasoeOAjOiNieeovyDihpIg57uT5p6c44CN5a+577yM562J55So5oi354K56YeH57qzL+aUvuW8g+WQjuWGjeWGs+Wumui/m+ato+agt+acrOi/mOaYr+i0n+agt+acrFxuICAgICAgICAgIHNldFBlbmRpbmcoc2Vzc2lvbklkLCBkcmFmdCwgcmVzdWx0KTtcbiAgICAgICAgICBkaXNwYXRjaFByZXZpZXcoeyB0eXBlOiAnc2hvdycsIHJlc3VsdCB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgKGUpID0+IHtcbiAgICAgICAgICBjb25zdCBpc0Fib3J0ID1cbiAgICAgICAgICAgIChlIGluc3RhbmNlb2YgRE9NRXhjZXB0aW9uICYmIGUubmFtZSA9PT0gJ0Fib3J0RXJyb3InKSB8fFxuICAgICAgICAgICAgKHR5cGVvZiAoZSBhcyB7IG5hbWU/OiB1bmtub3duIH0gfCBudWxsKT8ubmFtZSA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgICAgKGUgYXMgeyBuYW1lOiBzdHJpbmcgfSkubmFtZSA9PT0gJ0Fib3J0RXJyb3InKTtcbiAgICAgICAgICBpZiAoaXNBYm9ydCkge1xuICAgICAgICAgICAgaWYgKHRpbWVkT3V0KSBkaXNwYXRjaFByZXZpZXcoeyB0eXBlOiAnZmFpbCcsIGtpbmQ6ICd0aW1lb3V0JyBhcyBPcHRpbWl6ZUVycm9yS2luZCB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3Qga2luZCA9IHRvRXJyb3JLaW5kKGUpLmtpbmQ7XG4gICAgICAgICAgZGlzcGF0Y2hQcmV2aWV3KHsgdHlwZTogJ2ZhaWwnLCBraW5kLCBkZXRhaWw6IFN0cmluZygoZSBhcyB7IG1lc3NhZ2U/OiB1bmtub3duIH0pPy5tZXNzYWdlID8/IGUpIH0pO1xuICAgICAgICB9LFxuICAgICAgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBmZXRjaCDpgJrpgZPvvIjoh6rlrprkuYnmqKHlnosv5a6/5Li75LiN5Y+v55So6ZmN57qn77yJ5omN6KaB5rGC6YWN572uXG4gICAgaWYgKCFjaGVja0NvbmZpZyhjb25maWcpLm9rKSB7XG4gICAgICBkaXNwYXRjaFByZXZpZXcoeyB0eXBlOiAnZ3VpZGUnIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIOiHquWumuS5ieaooeWei+aooeW8j++8mua1j+iniOWZqCBmZXRjaCDnm7Tov57oh6rphY0gQVBJ77yI5rWB5byP77yJXG4gICAgLy8g5qih5Z6L6Kej5p6Q77yadXNlU2Vzc2lvbk1vZGVs77yI6buY6K6k77yJ4oaSIOWuv+S4u+S8muivneaooeWei++8iOS7heS9nCBtb2RlbCDlkI3lm57pgIDkvb/nlKjvvIzpnIDphY3nva7lt7LlsLHnu6rvvInvvJvlkKbliJkg4oaSIOiHquWumuS5iSBtb2RlbFxuICAgIGxldCBtb2RlbCA9IGNvbmZpZy5tb2RlbDtcbiAgICBpZiAoY29uZmlnLnVzZVNlc3Npb25Nb2RlbCkge1xuICAgICAgY29uc3Qgc2Vzc2lvbk1vZGVsID0gYXdhaXQgY3R4LmdldFNlc3Npb25Nb2RlbD8uKCk7XG4gICAgICBpZiAoc2Vzc2lvbk1vZGVsICYmIHNlc3Npb25Nb2RlbC5tb2RlbCkgbW9kZWwgPSBzZXNzaW9uTW9kZWwubW9kZWw7XG4gICAgfVxuICAgIGNvbnN0IGVmZmVjdGl2ZSA9IHsgLi4uY29uZmlnLCBtb2RlbCB9O1xuXG4gICAgLy8g5bGV56S657Sv56ev77ya5q2j5paH5LyY5YWI77yb5q2j5paH5bCa5pyq5Ye6546w77yIdjQg57O75YWI6L6T5Ye66ZW/5q615o6o55CG77yJ5pe25bGV56S65o6o55CG6L+H56iL77yM6K6p5rWB5byP56uL5Y2z5Y+v6KeBXG4gICAgbGV0IHJlYXNvbmluZyA9ICcnO1xuICAgIGxldCBjb250ZW50ID0gJyc7XG4gICAgbGV0IHNob3duID0gJyc7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IG9wdGltaXplU3RyZWFtKHtcbiAgICAgICAgY29uZmlnOiBlZmZlY3RpdmUsXG4gICAgICAgIHRleHQ6IGRyYWZ0LFxuICAgICAgICBsYW5nOiBjdHguZ2V0TGFuZygpLFxuICAgICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgICBzeXN0ZW0sXG4gICAgICAgIG1lbW9yeTogbWVtb3J5Q3R4LFxuICAgICAgICBvbkV2ZW50OiAoZGVsdGEpID0+IHtcbiAgICAgICAgICBpZiAoZGVsdGEua2luZCA9PT0gJ2NvbnRlbnQnKSB7XG4gICAgICAgICAgICBjb250ZW50ICs9IGRlbHRhLnRleHQ7XG4gICAgICAgICAgICBzaG93biA9IGNvbnRlbnQ7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlYXNvbmluZyArPSBkZWx0YS50ZXh0O1xuICAgICAgICAgICAgc2hvd24gPSByZWFzb25pbmc7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRpc3BhdGNoUHJldmlldyh7IHR5cGU6ICdkcmFmdCcsIHRleHQ6IHNob3duIH0pO1xuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgICBzZXRQZW5kaW5nKHNlc3Npb25JZCwgZHJhZnQsIHJlc3VsdCk7XG4gICAgICBkaXNwYXRjaFByZXZpZXcoeyB0eXBlOiAnc2hvdycsIHJlc3VsdCB9KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyDlhYjliKTlrprkuK3mraLvvJrnlKjmiLcv57uE5Lu25Y+W5raI5LiO6LaF5pe26YO96KGo546w5Li6IEFib3J0RXJyb3LvvJvku4XotoXml7blhpnlhaXplJnor6/mgIFcbiAgICAgIGNvbnN0IGlzQWJvcnQgPVxuICAgICAgICAoZSBpbnN0YW5jZW9mIERPTUV4Y2VwdGlvbiAmJiBlLm5hbWUgPT09ICdBYm9ydEVycm9yJykgfHxcbiAgICAgICAgKHR5cGVvZiAoZSBhcyB7IG5hbWU/OiB1bmtub3duIH0gfCBudWxsKT8ubmFtZSA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAoZSBhcyB7IG5hbWU6IHN0cmluZyB9KS5uYW1lID09PSAnQWJvcnRFcnJvcicpO1xuICAgICAgaWYgKGlzQWJvcnQpIHtcbiAgICAgICAgaWYgKHRpbWVkT3V0KSBkaXNwYXRjaFByZXZpZXcoeyB0eXBlOiAnZmFpbCcsIGtpbmQ6ICd0aW1lb3V0JyBhcyBPcHRpbWl6ZUVycm9yS2luZCB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgZGlzcGF0Y2hQcmV2aWV3KHsgdHlwZTogJ2ZhaWwnLCBraW5kOiB0b0Vycm9yS2luZChlKS5raW5kIH0pO1xuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIOmhtuWxguWFnOW6le+8iOWuv+S4u+mAmumBkyByZWplY3Qg5bey6KKrIC50aGVuIOa2iOWMlu+8m+atpOWkhOS/neaKpCBmZXRjaCDliIbmlK/ku6XlpJbnmoTmhI/lpJblvILluLjvvIlcbiAgICBkaXNwYXRjaFByZXZpZXcoeyB0eXBlOiAnZmFpbCcsIGtpbmQ6IHRvRXJyb3JLaW5kKGUpLmtpbmQgfSk7XG4gIH0gZmluYWxseSB7XG4gICAgaWYgKGFjdGl2ZUNvbnRyb2xsZXIgPT09IGNvbnRyb2xsZXIpIHtcbiAgICAgIGFjdGl2ZUNvbnRyb2xsZXIgPSBudWxsO1xuICAgICAgYWN0aXZlU2Vzc2lvbklkID0gbnVsbDtcbiAgICB9XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgfVxufVxuXG4vKipcbiAqIOiHquWtpuS5oOWPjeaAne+8mue0r+iuoSAzIOS4quaWsOmHh+e6s+WQju+8jOeUqCoq5LiA5qyh54us56uL6LCD55SoKirmiorjgIzph4fnurMgLyDmlL7lvIPjgI3orrDlvZXljovnvKnmiJDkuIDku73lgY/lpb3nlLvlg4/jgIJcbiAqXG4gKiDlgJ/pibTkuKTnp43miJDnhp/lgZrms5XvvJpcbiAqICAgLSBMYW5nTWVtIOeahCBtZXRhcHJvbXB077ya55So5Y6G5Y+y6L2o6L+5ICsg5Y+N6aaI6K6p5qih5Z6L5pS55YaZ5oyH5Luk77yM6ICM5LiN5piv5omL5bel6LCD5Y+C77ybXG4gKiAgIC0gU2tpbGxPcHQg55qE5pyJ55WM57yW6L6R77ya5Lqn5Ye66KaG55uW5pen55S75YOP77yI6ICM6Z2e5peg6ZmQ6L+95Yqg77yJ77yM6YG/5YWN55S75YOP6LaK5rua6LaK6ISP44CCXG4gKlxuICog5YWo56iLIGZpcmUtYW5kLWZvcmdldO+8muWksei0peWwseS/neaMgeaXp+eUu+WDj++8jOe7neS4jeW9seWTjeacrOasoeS8mOWMluS4jueUqOaIt+S6pOS6kuOAglxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVmbGVjdElmTmVlZGVkKGN0eDoge1xuICBjb25maWc6IFByb21wdENvbmZpZztcbiAgbGFuZzogTGFuZztcbiAgaG9zdD86IHsgcnBjOiBIb3N0UnBjIH07XG59KTogUHJvbWlzZTx2b2lkPiB7XG4gIGlmICghc2hvdWxkUmVmbGVjdCgpKSByZXR1cm47XG5cbiAgY29uc3Qgc3lzdGVtID0gYnVpbGRSZWZsZWN0aW9uUHJvbXB0KGN0eC5sYW5nKTtcbiAgY29uc3QgdGV4dCA9IGN0eC5sYW5nID09PSAnemgnID8gJ++8iOWPqui+k+WHuueUu+WDj+ato+aWh++8iScgOiAnKG91dHB1dCB0aGUgcHJvZmlsZSBib2R5IG9ubHkpJztcbiAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgY29uc3QgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IGNvbnRyb2xsZXIuYWJvcnQoKSwgNDVfMDAwKTtcbiAgdHJ5IHtcbiAgICBsZXQgb3V0ID0gJyc7XG4gICAgaWYgKGN0eC5ob3N0KSB7XG4gICAgICBvdXQgPSBhd2FpdCBzdHJlYW1Ib3N0T3B0aW1pemUoe1xuICAgICAgICBycGM6IGN0eC5ob3N0LnJwYyxcbiAgICAgICAgdGV4dCxcbiAgICAgICAgc3lzdGVtLFxuICAgICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgICBycGNUaW1lb3V0TXM6IDUwMDAsXG4gICAgICAgIHRpbWVvdXRNczogNDVfMDAwLFxuICAgICAgICBvbkRlbHRhOiAoKSA9PiB7fSxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBhd2FpdCBvcHRpbWl6ZVN0cmVhbSh7XG4gICAgICAgIGNvbmZpZzogY3R4LmNvbmZpZyxcbiAgICAgICAgdGV4dCxcbiAgICAgICAgbGFuZzogY3R4LmxhbmcsXG4gICAgICAgIHN5c3RlbSxcbiAgICAgICAgc2lnbmFsOiBjb250cm9sbGVyLnNpZ25hbCxcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAob3V0LnRyaW0oKSkgYXBwbHlSZWZsZWN0aW9uKG91dCk7XG4gIH0gY2F0Y2gge1xuICAgIC8vIOWPjeaAneWksei0pe+8muS/neaMgeaXp+eUu+WDj++8jOetieS4i+S4gOasoemHh+e6s+WGjeinpuWPkVxuICB9IGZpbmFsbHkge1xuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gIH1cbn0iLCAiLy8g5pys6aG555uu55SxIEFJIOi+heWKqeS8mOWMluWujOaIkO+8iOaPkOekuuivjeWGheaguOOAgea1i+ivleS4juaWh+aho++8ie+8jOWPkeW4g+WJjee7j+S6uuW3peWuoemYheOAglxuLyoqXG4gKiBjb21wb3Nlci50cyDigJTigJQgRFNIIOi+k+WFpeahhu+8iGNvbXBvc2Vy77yJ55qE6K+75YaZ5bel5YW377yM5a6i5oi356uv5YWx5Lqr44CCXG4gKlxuICog5Li65LuA5LmI54us56uL5oiQ5qih5Z2X77yaT3B0aW1pemVCdXR0b24g5LiOIFByZXZpZXdDYXJkIOabvuWQhOiHquWkjeWItuS4gOS7veWHoOS5juebuOWQjOeahOWunueOsO+8jFxuICog5LiU5bey5Ye6546w57uG5b6u5YiG5Y+J77yI5Zue6YCA562W55Wl5LiN5ZCM77yJ44CC6K+75YaZ5Zyo5Lik5Liq57uE5Lu26YeM5b+F6aG75Lil5qC85LiA6Ie04oCU4oCU44CM6K+76I2J56i/44CN5LiOXG4gKiDjgIzlhpnlm57ojYnnqL/jgI3oi6XlrprkvY3liLDkuI3lkIzlhYPntKDvvIzmm7/mjaLlsLHkvJrlhpnplJnlnLDmlrnjgIJcbiAqXG4gKiDlrp7mtYvog4zmma/vvIjkv53nlZnoh6rljp/lrp7njrDvvInvvJpcbiAqIC0gZHNoLXdlYiA+PSAwLjEuMC1yYy42IOeahOi+k+WFpemdouaYryBMZXhpY2FsIOa4suafk+eahCA8ZGl2IGNvbnRlbnRlZGl0YWJsZVxuICogICBkYXRhLWNvbXBvc2VyLWlucHV0Pu+8jOmhtemdouS4iuayoeaciSB0ZXh0YXJlYe+8m+WPquiupCB0ZXh0YXJlYSDnmoTlrp7njrDkvJrjgIzmjInpkq7ngrnkuoZcbiAqICAg5peg5Y+N5bqU44CN77yI6I2J56i/5rC46L+c5Li656m677yJ44CCXG4gKiAtIGlucHV0LnJpZ2h0L292ZXJsYXkg5qe95L2N5LiN5o+Q5L6b5qCH5YeGIHByb3BzL3N0b3JlIGhvb2tz77yM5L6d6LWW5a6D5Lus5Lya5bSp5bm26KKr6ZSZ6K+vXG4gKiAgIOi+ueeVjOWQnuaOie+8jOWboOatpOi/memHjOWFqOmDqOi1sCBET00g5p+l6K+i44CCXG4gKi9cblxuLyoqIOS7juWNleS4qui+k+WFpeaOp+S7tuivu+aWh+acrO+8mnRleHRhcmVhIOeUqCAudmFsdWXvvJtjb250ZW50ZWRpdGFibGUg55SoIGlubmVyVGV4dOOAgiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRleHRPZklucHV0KGVsOiBFbGVtZW50KTogc3RyaW5nIHtcbiAgaWYgKGVsIGluc3RhbmNlb2YgSFRNTFRleHRBcmVhRWxlbWVudCkgcmV0dXJuIGVsLnZhbHVlO1xuICBpZiAoZWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiBlbC5pc0NvbnRlbnRFZGl0YWJsZSkgcmV0dXJuIGVsLmlubmVyVGV4dCB8fCAnJztcbiAgcmV0dXJuICcnO1xufVxuXG4vKiog5piv5ZCmIERTSCDkvJror53ovpPlhaXmjqfku7bvvJp0ZXh0YXJlYe+8jOaIliBjb21wb3NlciDnmoQgY29udGVudGVkaXRhYmxlIOWuv+S4u+OAgiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzU2Vzc2lvbklucHV0KGVsOiBFbGVtZW50IHwgbnVsbCk6IGJvb2xlYW4ge1xuICBpZiAoZWwgPT09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgaWYgKGVsIGluc3RhbmNlb2YgSFRNTFRleHRBcmVhRWxlbWVudCkgcmV0dXJuIHRydWU7XG4gIGNvbnN0IGVkaXRhYmxlID0gZWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiBlbC5pc0NvbnRlbnRFZGl0YWJsZTtcbiAgY29uc3QgY29tcG9zZXIgPSBlbCBpbnN0YW5jZW9mIEVsZW1lbnQgJiYgZWwuY2xvc2VzdCgnW2RhdGEtY29tcG9zZXItaW5wdXRdJykgIT09IG51bGw7XG4gIHJldHVybiBlZGl0YWJsZSB8fCBjb21wb3Nlcjtcbn1cblxuLyoqIOaJviBjb21wb3NlciDovpPlhaXmoYbvvJrkvJjlhYjnhKbngrnvvIzlkKbliJnlm57pgIDliLDpobXpnaLkuK3nmoQgY29tcG9zZXIg5a6/5Li7IC8g56ys5LiA5Liq5Y+v55So6L6T5YWl5o6n5Lu244CCICovXG5leHBvcnQgZnVuY3Rpb24gZmluZENvbXBvc2VyKCk6IEVsZW1lbnQgfCBudWxsIHtcbiAgY29uc3QgYWN0aXZlID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcbiAgaWYgKGFjdGl2ZSAmJiBpc1Nlc3Npb25JbnB1dChhY3RpdmUpKSByZXR1cm4gYWN0aXZlO1xuICBjb25zdCBjb21wb3NlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWNvbXBvc2VyLWlucHV0XScpO1xuICBpZiAoY29tcG9zZXIgJiYgaXNTZXNzaW9uSW5wdXQoY29tcG9zZXIpKSByZXR1cm4gY29tcG9zZXI7XG4gIGNvbnN0IGFsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTFRleHRBcmVhRWxlbWVudD4oJ3RleHRhcmVhJyk7XG4gIGZvciAoY29uc3QgdGEgb2YgYWxsKSB7XG4gICAgaWYgKCF0YS5kaXNhYmxlZCkgcmV0dXJuIHRhO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqIOivu+WPluW9k+WJjeiNieeov++8muS8mOWFiOOAjOacieWGheWuueeahOeEpueCueaOp+S7tuOAje+8iG1vdXNlZG93biDml7bnhKbngrnlsJrmnKrliIfotbDvvIxhY3RpdmVFbGVtZW50XG4gKiDku43mmK/ovpPlhaXmoYbvvInvvJvlkKbliJnmib7pobXpnaLkuK3nmoQgY29tcG9zZXIg5a6/5Li777yI54K55Ye75oyJ6ZKu5ZCO54Sm54K55bey5Zyo5oyJ6ZKu5LiK77yMY29tcG9zZXJcbiAqIOaYr+WFqOWxgOWUr+S4gOeahCByZXNpZGVudCBkaXbvvInvvJvmnIDlkI7lm57pgIDliLDku7vmhI/jgIzlgLzpnZ7nqbrjgI3nmoQgdGV4dGFyZWHvvIjlhbzlrrnml6flrr/kuLvvvInjgIJcbiAqIOS4jiBmaW5kQ29tcG9zZXIg55qE5Yy65Yir77yacmVhZERyYWZ0IOimgeaxgumdnuepuuKAlOKAlOepuueZvei+k+WFpeS4jeivpeinpuWPkeS8mOWMluOAglxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVhZERyYWZ0KCk6IHN0cmluZyB7XG4gIGNvbnN0IGFjdGl2ZSA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gIGlmIChpc1Nlc3Npb25JbnB1dChhY3RpdmUpKSB7XG4gICAgY29uc3QgdGV4dCA9IHRleHRPZklucHV0KGFjdGl2ZSk7XG4gICAgaWYgKHRleHQudHJpbSgpKSByZXR1cm4gdGV4dDtcbiAgfVxuICBjb25zdCBjb21wb3NlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCdbZGF0YS1jb21wb3Nlci1pbnB1dF0nKTtcbiAgaWYgKGNvbXBvc2VyICE9PSBudWxsICYmIGlzU2Vzc2lvbklucHV0KGNvbXBvc2VyKSkge1xuICAgIGNvbnN0IHRleHQgPSB0ZXh0T2ZJbnB1dChjb21wb3Nlcik7XG4gICAgaWYgKHRleHQudHJpbSgpKSByZXR1cm4gdGV4dDtcbiAgfVxuICBjb25zdCBhbGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxUZXh0QXJlYUVsZW1lbnQ+KCd0ZXh0YXJlYScpO1xuICBmb3IgKGNvbnN0IHRhIG9mIGFsbCkge1xuICAgIGlmICh0YS52YWx1ZS50cmltKCkpIHJldHVybiB0YS52YWx1ZTtcbiAgfVxuICByZXR1cm4gJyc7XG59XG5cbi8qKlxuICog5YaZ5ZueIGNvbXBvc2Vy44CCdGV4dGFyZWEg55So5Y6f55SfIHZhbHVlIHNldHRlciArIGlucHV0IOS6i+S7tu+8iOiuqSBSZWFjdCDlj5fmjqfnu4Tku7bmhJ/nn6XvvInvvJtcbiAqIGNvbnRlbnRlZGl0YWJsZe+8iExleGljYWzvvInnlKggc2VsZWN0LWFsbCArIGV4ZWNDb21tYW5kKCdpbnNlcnRUZXh0JynigJTigJRsZXhpY2FsIOebkeWQrOWOn+eUn1xuICogaW5wdXTvvIxleGVjQ29tbWFuZCDkvJrop6blj5HmraPnoa7nmoTnvJbovpHkuovku7blubbmioogRE9NIOWQjOatpeWbnue8lui+keWZqCBzdGF0ZeOAglxuICog5rOo5oSP77yaZG9jdW1lbnQuZXhlY0NvbW1hbmQg5bey6KKr5qCH6K6w5bqf5byD77yM5L2GIExleGljYWwg5LuN5L6d6LWW5a6D5rS+5Y+R55qEIGJlZm9yZWlucHV0L2lucHV077ybXG4gKiDoi6XmnKrmnaXlrr/kuLvnp7vpmaTor6UgQVBJ77yM6LWwIGlubmVyVGV4dCArIGlucHV0IOS6i+S7tueahOWFnOW6leWIhuaUr+OAglxuICovXG5leHBvcnQgZnVuY3Rpb24gd3JpdGVDb21wb3NlclRleHQodGV4dDogc3RyaW5nKTogdm9pZCB7XG4gIGNvbnN0IGVsID0gZmluZENvbXBvc2VyKCk7XG4gIGlmICghZWwpIHJldHVybjtcbiAgaWYgKGVsIGluc3RhbmNlb2YgSFRNTFRleHRBcmVhRWxlbWVudCkge1xuICAgIGNvbnN0IHNldHRlciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoSFRNTFRleHRBcmVhRWxlbWVudC5wcm90b3R5cGUsICd2YWx1ZScpPy5zZXQ7XG4gICAgaWYgKHNldHRlcikge1xuICAgICAgc2V0dGVyLmNhbGwoZWwsIHRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbC52YWx1ZSA9IHRleHQ7XG4gICAgfVxuICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdpbnB1dCcsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gICAgZWwuZm9jdXMoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gY29udGVudGVkaXRhYmxlIGNvbXBvc2VyXG4gIGlmIChlbCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICYmIGVsLmlzQ29udGVudEVkaXRhYmxlKSB7XG4gICAgZWwuZm9jdXMoKTtcbiAgICBpZiAoZG9jdW1lbnQuZXhlY0NvbW1hbmQpIHtcbiAgICAgIGNvbnN0IHNlbCA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcbiAgICAgIGNvbnN0IHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcbiAgICAgIHJhbmdlLnNlbGVjdE5vZGVDb250ZW50cyhlbCk7XG4gICAgICBzZWw/LnJlbW92ZUFsbFJhbmdlcygpO1xuICAgICAgc2VsPy5hZGRSYW5nZShyYW5nZSk7XG4gICAgICBkb2N1bWVudC5leGVjQ29tbWFuZCgnaW5zZXJ0VGV4dCcsIGZhbHNlLCB0ZXh0KTtcbiAgICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdpbnB1dCcsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsLmlubmVyVGV4dCA9IHRleHQ7XG4gICAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnaW5wdXQnLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgIH1cbiAgfVxufVxuIiwgIi8qKiDovpPlhaXljLrmta7lsYLpooTop4jljaHniYfvvJpndWlkZSAvIG9wdGltaXppbmcgLyBwcmV2aWV3IC8gZXJyb3Ig5Zub56eN5YaF5a655oCBXG4gKiAg54q25oCB5p2l6Ieq5qih5Z2X57qn6aKE6KeI5oC757q/77yIcHJldmlldy1idXPvvInvvIzkuI3kvp3otZbkvJror50gc3RvcmUvaG9vayBwcm9wcyAqL1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHR5cGUgeyBMYW5nLCBQcm9tcHRDb25maWcgfSBmcm9tICcuL29wdGltaXplci5qcyc7XG5pbXBvcnQgeyBydW5PcHRpbWl6ZSwgY2xvc2VQcmV2aWV3LCByZWZsZWN0SWZOZWVkZWQgfSBmcm9tICcuL29wdGltaXplci1zdG9yZS5qcyc7XG5pbXBvcnQgeyByZWNvcmRPdXRjb21lIH0gZnJvbSAnLi9tZW1vcnkuanMnO1xuaW1wb3J0IHsgZ2V0UHJldmlld0J1c1N0YXRlLCBzdWJzY3JpYmVQcmV2aWV3QnVzIH0gZnJvbSAnLi9wcmV2aWV3LWJ1cy5qcyc7XG5pbXBvcnQgeyByZWFkRHJhZnQsIHdyaXRlQ29tcG9zZXJUZXh0IH0gZnJvbSAnLi9jb21wb3Nlci5qcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJldmlld0NhcmRQcm9wcyB7XG4gIHQ6IChrZXk6IHN0cmluZykgPT4gc3RyaW5nO1xuICBnZXRDb25maWc6ICgpID0+IFByb21wdENvbmZpZztcbiAgZ2V0TGFuZzogKCkgPT4gTGFuZztcbiAgb3BlblNldHRpbmdzOiAoKSA9PiB2b2lkO1xuICBnZXRTZXNzaW9uTW9kZWw/OiAoKSA9PiBQcm9taXNlPHsgcHJvdmlkZXI6IHN0cmluZzsgbW9kZWw6IHN0cmluZyB9IHwgbnVsbD47XG4gIGdldEhvc3Q/OiAoKSA9PiB7IHJwYzogeyBjYWxsOiAoZTogc3RyaW5nLCBwPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IFByb21pc2U8eyBvazogYm9vbGVhbjsgdmFsdWU/OiB1bmtub3duOyBlcnJvcj86IHsgY29kZT86IHN0cmluZyB9IH0+IH0gfSB8IG51bGw7XG4gIGdldFNlc3Npb25JZD86ICgpID0+IHN0cmluZyB8IG51bGw7XG59XG5cbmNvbnN0IENTU19JRCA9ICdkc2gtcHJvbXB0LWFyY2hpdGVjdC9jYXJkLmNzcyc7XG5mdW5jdGlvbiBpbmplY3RDc3MoKSB7XG4gIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnIHx8IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYHN0eWxlW2RhdGEtcGx1Z2luLWNzcz1cIiR7Q1NTX0lEfVwiXWApKSByZXR1cm47XG4gIGNvbnN0IHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgc3R5bGUuZGF0YXNldC5wbHVnaW5Dc3MgPSBDU1NfSUQ7XG4gIHN0eWxlLnRleHRDb250ZW50ID0gYFxuLmRzaC1wby1jYXJkIHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICBsZWZ0OiAxMnB4O1xuICByaWdodDogMTJweDtcbiAgYm90dG9tOiBjYWxjKDEwMCUgKyA4cHgpO1xuICB6LWluZGV4OiA0MDtcbiAgYmFja2dyb3VuZDogdmFyKC0tZHN3LWFsaWFzLWJnLW92ZXJsYXksICNmZmYpO1xuICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyLCByZ2JhKDEyOCwxMjgsMTI4LDAuMykpO1xuICBib3JkZXItcmFkaXVzOiAxMHB4O1xuICBib3gtc2hhZG93OiAwIDhweCAyNHB4IHJnYmEoMCwgMCwgMCwgMC4xNik7XG4gIHBhZGRpbmc6IDEycHggMTRweDtcbiAgbWF4LWhlaWdodDogMzIwcHg7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIGdhcDogOHB4O1xufVxuLmRzaC1wby1jYXJkLWhlYWQge1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gIGNvbG9yOiB2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSwgIzIyMik7XG4gIGZvbnQtc2l6ZTogMTNweDtcbiAgZm9udC13ZWlnaHQ6IDYwMDtcbn1cbi5kc2gtcG8tY2FyZC1ib2R5IHtcbiAgb3ZlcmZsb3c6IGF1dG87XG4gIHdoaXRlLXNwYWNlOiBwcmUtd3JhcDtcbiAgd29yZC1icmVhazogYnJlYWstd29yZDtcbiAgY29sb3I6IHZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnksICM0NDQpO1xuICBmb250LXNpemU6IDEzcHg7XG4gIGxpbmUtaGVpZ2h0OiAxLjY7XG4gIG1heC1oZWlnaHQ6IDIwMHB4O1xufVxuLmRzaC1wby1jYXJkLWVyciB7XG4gIGNvbG9yOiB2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSwgI2QwMzA1MCk7XG4gIGZvbnQtc2l6ZTogMTNweDtcbn1cbi5kc2gtcG8tY2FyZC1zdGVwIHtcbiAgY29sb3I6IHZhcigtLWRzdy1hbGlhcy10ZXh0LXNlY29uZGFyeSwgIzhjOTNhMSk7XG4gIGZvbnQtc2l6ZTogMTJweDtcbiAgbWFyZ2luLWxlZnQ6IDRweDtcbn1cbi5kc2gtcG8tY2FyZC1lcnItZGV0YWlsIHtcbiAgbWFyZ2luLXRvcDogNHB4O1xuICBjb2xvcjogdmFyKC0tZHN3LWFsaWFzLXRleHQtc2Vjb25kYXJ5LCAjOGM5M2ExKTtcbiAgZm9udC1zaXplOiAxMnB4O1xuICB3b3JkLWJyZWFrOiBicmVhay1hbGw7XG59XG4uZHNoLXBvLWNhcmQtcm93IHtcbiAgZGlzcGxheTogZmxleDtcbiAgZ2FwOiA4cHg7XG4gIGZsZXgtd3JhcDogd3JhcDtcbn1cbi5kc2gtcG8tY2FyZC1idG4ge1xuICBib3JkZXI6IDA7XG4gIGJvcmRlci1yYWRpdXM6IDZweDtcbiAgcGFkZGluZzogNHB4IDEwcHg7XG4gIGZvbnQtc2l6ZTogMTJweDtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICBjb2xvcjogdmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnksICMyMjIpO1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIsIHJnYmEoMTI4LDEyOCwxMjgsMC4xNCkpO1xufVxuLmRzaC1wby1jYXJkLWJ0bi5wcmltYXJ5IHtcbiAgLyog5YaZ5q275Li76Imy77yaLS1kc3ctYWxpYXMtYnJhbmQtcHJpbWFyeSDlnKjmt7HlpJzmqKHlvI/op6PmnpDkuLrmtYXoibIg4oaSIOeZveW6leeZveWtl+S4jeWPr+ivu++8iOeUqOaIt+Wunua1i++8iSAqL1xuICBjb2xvcjogI2ZmZjtcbiAgYmFja2dyb3VuZDogIzE2NzdmZjtcbn1cbmA7XG4gIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxuXG5mdW5jdGlvbiBlcnJvcktleShraW5kOiBzdHJpbmcgfCBudWxsKTogc3RyaW5nIHtcbiAgc3dpdGNoIChraW5kKSB7XG4gICAgLy8ga2luZCDihpIgbG9jYWxlIGtlee+8mydjb25maWcnIOWcqCBVSSDkuIrkuI3lj6/ovr7vvIhydW5PcHRpbWl6ZSDlhYjotbAgZ3VpZGXvvInvvIxBYm9ydEVycm9y4oaSdGltZW91dCDnlLEgcnVuT3B0aW1pemUg5YWI6KGM5oum5oiq77yM5L+d55WZ5Y+M5L+d6ZmpXG4gICAgY2FzZSAndW5hdXRob3JpemVkJzogY2FzZSAnZm9yYmlkZGVuJzogY2FzZSAndGltZW91dCc6IGNhc2UgJ25ldHdvcmsnOiBjYXNlICdjb3JzJzogY2FzZSAnaHR0cCc6IGNhc2UgJ2JhZC1yZXNwb25zZSc6IGNhc2UgJ2VtcHR5JzogY2FzZSAndHJ1bmNhdGVkJzogY2FzZSAnY29uZmlnJzpcbiAgICAgIHJldHVybiBgZXJyb3IuJHtraW5kfWA7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiAnZXJyb3IubmV0d29yayc7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFByZXZpZXdDYXJkKHByb3BzOiBQcmV2aWV3Q2FyZFByb3BzKSB7XG4gIGNvbnN0IHsgdCwgZ2V0Q29uZmlnLCBnZXRMYW5nLCBvcGVuU2V0dGluZ3MsIGdldFNlc3Npb25Nb2RlbCwgZ2V0SG9zdCwgZ2V0U2Vzc2lvbklkIH0gPSBwcm9wcztcblxuICAvLyDorqLpmIXmqKHlnZfnuqfpooTop4jmgLvnur/vvIjmm7/ku6PkvJror50gc3RvcmUgcHJvcHPvvIlcbiAgY29uc3QgW3N0YXRlLCBzZXRTdGF0ZV0gPSB1c2VTdGF0ZSgoKSA9PiBnZXRQcmV2aWV3QnVzU3RhdGUoKSk7XG4gIHVzZUVmZmVjdChcbiAgICAoKSA9PiBzdWJzY3JpYmVQcmV2aWV3QnVzKCgpID0+IHNldFN0YXRlKGdldFByZXZpZXdCdXNTdGF0ZSgpKSksXG4gICAgW10sXG4gICk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IGluamVjdENzcygpLCBbXSk7XG5cbiAgLy8g5Y246L295pe25riF55CG77ya5riF6Zmk5oyC6LW355qEIGNvcGllZCDlpI3kvY3lrprml7blmajvvIzlubbmoIforrDmnKrmjILovb3vvIxcbiAgLy8g6Ziy5q2i6L+f5Yiw55qEIHNldENvcGllZCh0cnVlKe+8iGNvcHkg55qEIGF3YWl0IOacn+mXtOWNuOi9ve+8ieWcqOWNuOi9veWQjuinpuWPkeOAglxuICBjb25zdCBtb3VudGVkUmVmID0gdXNlUmVmKHRydWUpO1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIG1vdW50ZWRSZWYuY3VycmVudCA9IHRydWU7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIG1vdW50ZWRSZWYuY3VycmVudCA9IGZhbHNlO1xuICAgICAgaWYgKGNvcHlUaW1lclJlZi5jdXJyZW50ICE9PSBudWxsKSB7XG4gICAgICAgIGNsZWFyVGltZW91dChjb3B5VGltZXJSZWYuY3VycmVudCk7XG4gICAgICAgIGNvcHlUaW1lclJlZi5jdXJyZW50ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9O1xuICB9LCBbXSk7XG5cbiAgY29uc3QgeyBzdGF0dXMsIHJlc3VsdCwgZXJyb3JLaW5kIH0gPSBzdGF0ZTtcbiAgY29uc3QgW2NvcGllZCwgc2V0Q29waWVkXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgY29weVRpbWVyUmVmID0gdXNlUmVmPG51bWJlciB8IG51bGw+KG51bGwpO1xuXG4gIC8vIOmihOiniOeql+WPo+e7keWumuWPkei1t+S8muivne+8muWIh+aNouWIsOWIq+eahOS8muivneaXtuS4jei3n+maj+aYvuekuu+8iOWIh+WbnuWPkei1t+S8muivneaBouWkje+8iVxuICBpZiAoc3RhdHVzICE9PSAnaWRsZScgJiYgc3RhdGUuc2Vzc2lvbklkICE9PSBudWxsKSB7XG4gICAgY29uc3Qgc2lkID0gZ2V0U2Vzc2lvbklkPy4oKTtcbiAgICBpZiAoc2lkICE9PSBudWxsICYmIHN0YXRlLnNlc3Npb25JZCAhPT0gc2lkKSByZXR1cm4gbnVsbDtcbiAgfVxuICBpZiAoc3RhdHVzID09PSAnaWRsZScpIHJldHVybiBudWxsO1xuXG4gIGNvbnN0IHJldHJ5ID0gKCkgPT4ge1xuICAgIC8vIOmHjeivlSA9IOWQpuWGs+acrOasoee7k+aenO+8iOi0n+agt+acrO+8ie+8jOiuqeWPjeaAneefpemBk+OAjOi/meexu+S6p+WHuuS4jeWQiOWPo+WRs+OAjVxuICAgIHJlY29yZE91dGNvbWUoJ3JlamVjdGVkJyk7XG4gICAgdm9pZCBydW5PcHRpbWl6ZSh7XG4gICAgICBnZXRDb25maWcsXG4gICAgICBnZXRMYW5nLFxuICAgICAgZ2V0RHJhZnQ6ICgpID0+IHJlYWREcmFmdCgpLFxuICAgICAgZ2V0U2Vzc2lvbk1vZGVsLFxuICAgICAgaG9zdDogZ2V0SG9zdD8uKCkgPz8gdW5kZWZpbmVkLFxuICAgICAgZ2V0U2Vzc2lvbklkLFxuICAgIH0pO1xuICB9O1xuXG4gIGNvbnN0IHJlcGxhY2UgPSAoKSA9PiB7XG4gICAgd3JpdGVDb21wb3NlclRleHQocmVzdWx0KTtcbiAgICAvLyDph4fnurMgPSDmraPmoLfmnKzvvJvntK/orqHliLDpmIjlgLzlkI7lvILmraXliLfmlrDlgY/lpb3nlLvlg4/vvIjlpLHotKXpnZnpu5jvvIlcbiAgICBjb25zdCBhY2NlcHRlZCA9IHJlY29yZE91dGNvbWUoJ2FjY2VwdGVkJyk7XG4gICAgY2xvc2VQcmV2aWV3KCk7XG4gICAgaWYgKGFjY2VwdGVkKSB7XG4gICAgICB2b2lkIHJlZmxlY3RJZk5lZWRlZCh7IGNvbmZpZzogZ2V0Q29uZmlnKCksIGxhbmc6IGdldExhbmcoKSwgaG9zdDogZ2V0SG9zdD8uKCkgPz8gdW5kZWZpbmVkIH0pO1xuICAgIH1cbiAgfTtcblxuICAvKiog5YWz6ZetID0g5pyq6YeH57qz44CC5L2G6Iul5bey5aSN5Yi26LWw57uT5p6c77yM6K+05piO55So5oi36K6k5Y+v5LqG5Lqn5Ye677yI5q2j5qC35pys77yJ77yMXG4gICAqICDml6fniYjkuIDlvovorrDotJ/moLfmnKzvvIzkvJrmiorjgIzlpI3liLbotbDjgI3msaHmn5Pov5vlj43mgJ3nlLvlg4/jgIIgKi9cbiAgY29uc3QgZGlzbWlzcyA9ICgpID0+IHtcbiAgICByZWNvcmRPdXRjb21lKGhhc0NvcGllZFJlZi5jdXJyZW50ID8gJ2FjY2VwdGVkJyA6ICdyZWplY3RlZCcpO1xuICAgIGNsb3NlUHJldmlldygpO1xuICB9O1xuXG4gIGNvbnN0IGhhc0NvcGllZFJlZiA9IHVzZVJlZihmYWxzZSk7XG4gIGNvbnN0IGNvcHkgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKCFuYXZpZ2F0b3IuY2xpcGJvYXJkKSByZXR1cm47IC8vIOmdnuWuieWFqOS4iuS4i+aWh++8iGh0dHAg562J77yJ77ya5LiN57+76L2sIGNvcGllZO+8jOS/neaMgeWPr+mHjeivlVxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChyZXN1bHQpO1xuICAgICAgaGFzQ29waWVkUmVmLmN1cnJlbnQgPSB0cnVlOyAvLyDlpI3liLbkuZ/nrpforqTlj6/kv6Hlj7dcbiAgICAgIGlmICghbW91bnRlZFJlZi5jdXJyZW50KSByZXR1cm47IC8vIGF3YWl0IOacn+mXtOe7hOS7tuW3suWNuOi9ve+8muS4jeWGjSBzZXRTdGF0ZVxuICAgICAgc2V0Q29waWVkKHRydWUpO1xuICAgICAgaWYgKGNvcHlUaW1lclJlZi5jdXJyZW50ICE9PSBudWxsKSBjbGVhclRpbWVvdXQoY29weVRpbWVyUmVmLmN1cnJlbnQpO1xuICAgICAgY29weVRpbWVyUmVmLmN1cnJlbnQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHNldENvcGllZChmYWxzZSk7XG4gICAgICAgIGNvcHlUaW1lclJlZi5jdXJyZW50ID0gbnVsbDtcbiAgICAgIH0sIDEyMDApO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLy8g5Ymq6LS05p2/5YaZ5YWl5aSx6LSl77ya6Z2Z6buY77yI5LiN57+76L2sIGNvcGllZO+8iVxuICAgIH1cbiAgfTtcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNoLXBvLWNhcmRcIiByb2xlPVwic3RhdHVzXCI+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzaC1wby1jYXJkLWhlYWRcIj5cbiAgICAgICAgPHNwYW4+e3QoJ2NhcmQudGl0bGUnKX08L3NwYW4+XG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzaC1wby1jYXJkLWJ0blwiIG9uQ2xpY2s9e2Rpc21pc3N9PlxuICAgICAgICAgIOKclVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICB7c3RhdHVzID09PSAnZ3VpZGUnICYmIChcbiAgICAgICAgPD5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzaC1wby1jYXJkLWJvZHlcIj57dCgnZ3VpZGUudGl0bGUnKX08L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzaC1wby1jYXJkLWJvZHlcIj57dCgnZ3VpZGUuZGVzYycpfTwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNoLXBvLWNhcmQtcm93XCI+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2gtcG8tY2FyZC1idG4gcHJpbWFyeVwiIG9uQ2xpY2s9eygpID0+IHsgY2xvc2VQcmV2aWV3KCk7IG9wZW5TZXR0aW5ncygpOyB9fT5cbiAgICAgICAgICAgICAge3QoJ2d1aWRlLmFjdGlvbicpfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2gtcG8tY2FyZC1idG5cIiBvbkNsaWNrPXsoKSA9PiBjbG9zZVByZXZpZXcoKX0+XG4gICAgICAgICAgICAgIHt0KCdndWlkZS5kaXNtaXNzJyl9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC8+XG4gICAgICApfVxuXG4gICAgICB7c3RhdHVzID09PSAnb3B0aW1pemluZycgJiYgKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzaC1wby1jYXJkLWJvZHlcIj5cbiAgICAgICAgICB7c3RhdGUucmVhc29uaW5nICYmICFzdGF0ZS5kcmFmdCA/IChcbiAgICAgICAgICAgIDxzcGFuXG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgd2hpdGVTcGFjZTogJ3ByZS13cmFwJyxcbiAgICAgICAgICAgICAgICBjb2xvcjogJ3ZhcigtLWRzdy1hbGlhcy10ZXh0LXNlY29uZGFyeSwgIzhjOTNhMSknLFxuICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTJweCcsXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtzdGF0ZS5yZWFzb25pbmd9XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAge3N0YXRlLmRyYWZ0ID8gPHNwYW4gc3R5bGU9e3sgd2hpdGVTcGFjZTogJ3ByZS13cmFwJyB9fT57c3RhdGUuZHJhZnR9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgeyFzdGF0ZS5kcmFmdCAmJiAhc3RhdGUucmVhc29uaW5nID8gdCgnY2FyZC5vcHRpbWl6aW5nJykgOiBudWxsfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICl9XG5cbiAgICAgIHtzdGF0dXMgPT09ICdwcmV2aWV3JyAmJiAoXG4gICAgICAgIDw+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2gtcG8tY2FyZC1ib2R5XCI+e3Jlc3VsdH08L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzaC1wby1jYXJkLXJvd1wiPlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNoLXBvLWNhcmQtYnRuIHByaW1hcnlcIiBvbkNsaWNrPXtyZXBsYWNlfT5cbiAgICAgICAgICAgICAge3QoJ2NhcmQucmVwbGFjZScpfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2gtcG8tY2FyZC1idG5cIiBvbkNsaWNrPXsoKSA9PiB2b2lkIGNvcHkoKX0+XG4gICAgICAgICAgICAgIHtjb3BpZWQgPyB0KCdjYXJkLmNvcHlEb25lJykgOiB0KCdjYXJkLmNvcHknKX1cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNoLXBvLWNhcmQtYnRuXCIgb25DbGljaz17cmV0cnl9PlxuICAgICAgICAgICAgICB7dCgnY2FyZC5yZXRyeScpfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2gtcG8tY2FyZC1idG5cIiBvbkNsaWNrPXtkaXNtaXNzfT5cbiAgICAgICAgICAgICAge3QoJ2NhcmQuZGlzbWlzcycpfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvPlxuICAgICAgKX1cblxuICAgICAge3N0YXR1cyA9PT0gJ2Vycm9yJyAmJiAoXG4gICAgICAgIDw+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2gtcG8tY2FyZC1lcnJcIj57dChlcnJvcktleShlcnJvcktpbmQpKX08L2Rpdj5cbiAgICAgICAgICB7ZXJyb3JEZXRhaWwgPyA8ZGl2IGNsYXNzTmFtZT1cImRzaC1wby1jYXJkLWVyci1kZXRhaWxcIj57ZXJyb3JEZXRhaWx9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzaC1wby1jYXJkLXJvd1wiPlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNoLXBvLWNhcmQtYnRuIHByaW1hcnlcIiBvbkNsaWNrPXtyZXRyeX0+XG4gICAgICAgICAgICAgIHt0KCdjYXJkLnJldHJ5Jyl9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzaC1wby1jYXJkLWJ0blwiIG9uQ2xpY2s9e2Rpc21pc3N9PlxuICAgICAgICAgICAgICB7dCgnY2FyZC5kaXNtaXNzJyl9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC8+XG4gICAgICApfVxuICAgIDwvZGl2PlxuICApO1xufSIsICIvKiog6K6+572uIOKGkiBHZW5lcmFsIOWMuuOAjFByb21wdCDkvJjljJbjgI3orr7nva7ooYzvvJrmoIfpopjmkZjopoEgKyDlsZXlvIDooajljZUgKi9cblxuaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgdHlwZSB7IFByb21wdENvbmZpZyB9IGZyb20gJy4vb3B0aW1pemVyLmpzJztcbmltcG9ydCB7IERFRkFVTFRTIH0gZnJvbSAnLi9vcHRpbWl6ZXIuanMnO1xuaW1wb3J0IHR5cGUgeyBTZXR0aW5nc0Zvcm1TdGF0ZSwgU2V0dGluZ3NGb3JtVmFsdWVzIH0gZnJvbSAnLi9zZXR0aW5ncy1mb3JtLXN0YXRlLmpzJztcbmltcG9ydCB0eXBlIHsgU2V0dGluZ3NGb3JtQWN0aW9ucyB9IGZyb20gJy4vc2V0dGluZ3Mtc3RvcmUuanMnO1xuaW1wb3J0IHsgb25PcGVuU2V0dGluZ3NSZXF1ZXN0IH0gZnJvbSAnLi9ldmVudHMuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNldHRpbmdzUm93UHJvcHMge1xuICB0OiAoa2V5OiBzdHJpbmcpID0+IHN0cmluZztcbiAgdXNlU3RvcmU6IDxUPihzZWxlY3RvcjogKHM6IFNldHRpbmdzRm9ybVN0YXRlKSA9PiBUKSA9PiBUO1xuICBhY3Rpb25zOiBTZXR0aW5nc0Zvcm1BY3Rpb25zO1xuICBnZXRDb25maWc6ICgpID0+IFByb21wdENvbmZpZztcbiAgc2F2ZUNvbmZpZzogKHZhbHVlczogU2V0dGluZ3NGb3JtVmFsdWVzKSA9PiBQcm9taXNlPHZvaWQ+O1xuICByZXNldENvbmZpZzogKCkgPT4gUHJvbWlzZTx2b2lkPjtcbiAgZ2V0RXBvY2g6ICgpID0+IG51bWJlcjtcbiAgLyoqIOWuv+S4u+mAmumBk+iHquajgO+8muW9k+WJjeS8muivneaooeWei+aYr+WQpuWPr+e7jyBzZXJ2ZXIgaGFsZiDojrflj5bvvIjpm7bphY3nva7pgJrpgZPnmoTlgaXlurfmjqLpkojvvIkgKi9cbiAgZ2V0SG9zdFN0YXR1cz86ICgpID0+IFByb21pc2U8eyBhdmFpbGFibGU6IGJvb2xlYW47IHByb3ZpZGVyPzogc3RyaW5nOyBtb2RlbD86IHN0cmluZzsgZXJyb3I/OiBzdHJpbmcgfSB8IG51bGw+O1xufVxuXG5cbmNvbnN0IENTU19JRCA9ICdkc2gtcHJvbXB0LWFyY2hpdGVjdC9zZXR0aW5ncy5jc3MnO1xuZnVuY3Rpb24gaW5qZWN0Q3NzKCkge1xuICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJyB8fCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBzdHlsZVtkYXRhLXBsdWdpbi1jc3M9XCIke0NTU19JRH1cIl1gKSkgcmV0dXJuO1xuICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gIHN0eWxlLmRhdGFzZXQucGx1Z2luQ3NzID0gQ1NTX0lEO1xuICBzdHlsZS50ZXh0Q29udGVudCA9IGBcbi5vcHRpU2V0dGluZ3Mge1xuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7XG4gIHBhZGRpbmc6IDE2cHggMDtcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgZ2FwOiA4cHg7XG59XG4ub3B0aVNldHRpbmdzVGl0bGUge1xuICBjb2xvcjogdmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO1xuICBmb250LXNpemU6IDE0cHg7XG4gIGxpbmUtaGVpZ2h0OiAyMnB4O1xufVxuLm9wdGlTZXR0aW5nc0hpbnQge1xuICBjb2xvcjogdmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtcbiAgZm9udC1zaXplOiAxMnB4O1xufVxuLm9wdGlTZXR0aW5nc0Zvcm0ge1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICBnYXA6IDhweDtcbiAgbWFyZ2luLXRvcDogNHB4O1xufVxuLm9wdGlTZXR0aW5nc0ZpZWxkIHtcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgZ2FwOiA0cHg7XG59XG4ub3B0aVNldHRpbmdzTGFiZWwge1xuICBjb2xvcjogdmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7XG4gIGZvbnQtc2l6ZTogMTJweDtcbn1cbi5vcHRpU2V0dGluZ3NJbnB1dCB7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO1xuICBib3JkZXItcmFkaXVzOiA2cHg7XG4gIGJhY2tncm91bmQ6IHZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKTtcbiAgY29sb3I6IHZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtcbiAgcGFkZGluZzogNnB4IDhweDtcbiAgZm9udC1zaXplOiAxM3B4O1xufVxuLm9wdGlTZXR0aW5nc1JvdyB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGdhcDogOHB4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xufVxuLm9wdGlTZXR0aW5nc0J0biB7XG4gIGJvcmRlcjogMDtcbiAgYm9yZGVyLXJhZGl1czogNnB4O1xuICBwYWRkaW5nOiA0cHggMTJweDtcbiAgZm9udC1zaXplOiAxMnB4O1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIGJhY2tncm91bmQ6IHZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3ZlciwgcmdiYSgxMjgsMTI4LDEyOCwwLjE0KSk7XG4gIGNvbG9yOiB2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7XG59XG4ub3B0aVNldHRpbmdzQnRuLnByaW1hcnkge1xuICAvKiDlhpnmrbvkuLvoibLvvJrkuLvpopjlj5jph4/lnKjmt7HlpJzmqKHlvI/kvJrop6PmnpDkuLrmtYUv5rex5p6B56uv6Imy77yI6buR5bqV6buR5a2X44CB55m95bqV55m95a2X5Z2H6KKr55So5oi35a6e5rWL77yJ77yMXG4gICAgIOWbuuWumuWTgeeJjOiTnSArIOeZveWtl+S/neivgeS7u+S9leS4u+mimOWPr+ivuyAqL1xuICBjb2xvcjogI2ZmZjtcbiAgYmFja2dyb3VuZDogIzE2NzdmZjtcbn1cbi5vcHRpU2V0dGluZ3NFcnIge1xuICBjb2xvcjogdmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnksICNkMDMwNTApO1xuICBmb250LXNpemU6IDEycHg7XG59XG5gO1xuICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNldHRpbmdzUm93KHByb3BzOiBTZXR0aW5nc1Jvd1Byb3BzKSB7XG4gIGNvbnN0IHsgdCwgdXNlU3RvcmUsIGFjdGlvbnMsIGdldENvbmZpZywgc2F2ZUNvbmZpZywgcmVzZXRDb25maWcsIGdldEVwb2NoLCBnZXRIb3N0U3RhdHVzIH0gPSBwcm9wcztcbiAgY29uc3QgW2hvc3RTdGF0dXMsIHNldEhvc3RTdGF0dXNdID0gdXNlU3RhdGU8eyBhdmFpbGFibGU6IGJvb2xlYW47IHByb3ZpZGVyPzogc3RyaW5nOyBtb2RlbD86IHN0cmluZzsgZXJyb3I/OiBzdHJpbmcgfSB8IG51bGw+KG51bGwpO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFnZXRIb3N0U3RhdHVzKSByZXR1cm47XG4gICAgbGV0IGFsaXZlID0gdHJ1ZTtcbiAgICBnZXRIb3N0U3RhdHVzKCkudGhlbigoc3QpID0+IHsgaWYgKGFsaXZlKSBzZXRIb3N0U3RhdHVzKHN0KTsgfSkuY2F0Y2goKCkgPT4geyBpZiAoYWxpdmUpIHNldEhvc3RTdGF0dXMoeyBhdmFpbGFibGU6IGZhbHNlLCBlcnJvcjogJ3JwYy1mYWlsZWQnIH0pOyB9KTtcbiAgICByZXR1cm4gKCkgPT4geyBhbGl2ZSA9IGZhbHNlOyB9O1xuICB9LCBbZ2V0SG9zdFN0YXR1c10pO1xuICBjb25zdCBbZXhwYW5kZWQsIHNldEV4cGFuZGVkXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW3N1Ym1pdFJldmlzaW9uLCBzZXRTdWJtaXRSZXZpc2lvbl0gPSB1c2VTdGF0ZSgwKTtcblxuICBjb25zdCB2YWx1ZXMgPSB1c2VTdG9yZSgocykgPT4gcy52YWx1ZXMpO1xuICBjb25zdCBzYXZlZCA9IHVzZVN0b3JlKChzKSA9PiBzLnNhdmVkKTtcbiAgY29uc3QgZXJyb3IgPSB1c2VTdG9yZSgocykgPT4gcy5lcnJvcik7XG4gIC8vIOS/neWtmC/ph43nva4gUlBDIOWksei0peaXtuaYvuekuueahOWOn+Wni+mUmeivr++8iOS4jeWGjemdmem7mOWksei0pe+8mnNldHRpbmdzIOWGmeWFpeWHuumUmeW/hemhu+iuqeeUqOaIt+eci+W+l+WIsO+8iVxuICBjb25zdCBbcnBjRXJyb3IsIHNldFJwY0Vycm9yXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiBpbmplY3RDc3MoKSwgW10pO1xuXG4gIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZygpO1xuICBjb25zdCBtb2RlbExhYmVsID0gY29uZmlnLm1vZGVsID8gY29uZmlnLm1vZGVsIDogJ+KAlCc7XG5cbiAgLy8g6aaW5qyh5oyC6L29IC8g6YWN572u5Y+Y5YyW5pe25oqK5b2T5YmN6YWN572u5pKt56eN6L+b6KGo5Y2V44CCXG4gIC8vIHNlZWQg5L+u6K6i5Y+3ID0g5pys5Zyw5o+Q5Lqk5bqP5Y+3IHN1Ym1pdFJldmlzaW9uICsgY29uZmlnRXBvY2jvvIjlpJbpg6jphY3nva7lj5jljJbnuqrlhYPvvInvvJpcbiAgLy8gIC0g5aSW6YOo6YWN572u5Y+Y5YyW77yI6Leo5qCH562+6aG1L+WklumDqOWGmeWFpSDihpIgaW5kZXgudHMgcmVmcmVzaENvbmZpZyDnmoTnuqrlhYPpgJLlop7vvInku6Tkv67orqLlj7fotoXov4dcbiAgLy8gICAgc3RhdGUucmV2aXNpb27vvIzph43mkq3np43nlJ/mlYjvvIzooajljZXot5/kuIrlvZLkuIDljJblkI7nmoTplZzlg4/vvJtcbiAgLy8gIC0g5L+d5a2YL+mHjee9ruW3sumAmui/hyBjb21taXQvc2VlZCDlhpnlhaXjgIzmlrDmnKzlnLDluo/lj7cgKyDlvZPml7bnuqrlhYPjgI3nmoTkv67orqLlj7fvvIzntKfmjqXnmoTmnKzmrKHmlYjlupRcbiAgLy8gICAg5Zue6LeR77yI57qq5YWD5pyq5Y+Y77yJ5L+u6K6i5Y+355u4562J6KKrIHJlZHVjZXIg5oqR5Yi2IOKGkiDkv53kvY/nlKjmiLfljp/lp4vovpPlhaXkuI7jgIzlt7Lkv53lrZjjgI3mj5DnpLrvvJtcbiAgLy8gICAg5LiL5qyh5pys5Zyw5Yqo5L2c77yIZWRpdC9jb21taXTvvInlho3mioogc3RhdGUucmV2aXNpb24g5oqs5Yiw5LiO57qq5YWD5LiA6Ie044CCXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgYWN0aW9ucy5zZWVkKFxuICAgICAge1xuICAgICAgICBiYXNlVXJsOiBjb25maWcuYmFzZVVybCxcbiAgICAgICAgYXBpS2V5OiBjb25maWcuYXBpS2V5LFxuICAgICAgICBtb2RlbDogY29uZmlnLm1vZGVsLFxuICAgICAgICB1c2VTZXNzaW9uTW9kZWw6IGNvbmZpZy51c2VTZXNzaW9uTW9kZWwsXG4gICAgICAgIGludGVuc2l0eTogY29uZmlnLmludGVuc2l0eSxcbiAgICAgIH0sXG4gICAgICBzdWJtaXRSZXZpc2lvbiArIGdldEVwb2NoKCksXG4gICAgKTtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFtjb25maWcuYmFzZVVybCwgY29uZmlnLmFwaUtleSwgY29uZmlnLm1vZGVsLCBjb25maWcudXNlU2Vzc2lvbk1vZGVsLCBjb25maWcuaW50ZW5zaXR5LCBnZXRFcG9jaF0pO1xuXG4gIC8vIOOAjOWOu+iuvue9ruOAje+8iOmihOiniOWNoeacqumFjee9ruW8leWvvO+8ieKGkiDoh6rliqjlsZXlvIDooajljZVcbiAgdXNlRWZmZWN0KCgpID0+IG9uT3BlblNldHRpbmdzUmVxdWVzdCgoKSA9PiBzZXRFeHBhbmRlZCh0cnVlKSksIFtdKTtcblxuICBjb25zdCBoYW5kbGVTYXZlID0gYXN5bmMgKCkgPT4ge1xuICAgIHNldFJwY0Vycm9yKG51bGwpO1xuICAgIGNvbnN0IGVycm9ycyA9IGFjdGlvbnMudmFsaWRhdGUodmFsdWVzKTtcbiAgICBpZiAoZXJyb3JzKSB7XG4gICAgICBhY3Rpb25zLmZhaWwoT2JqZWN0LnZhbHVlcyhlcnJvcnMpWzBdKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHNhdmVDb25maWcodmFsdWVzKTtcbiAgICAgIHNldFN1Ym1pdFJldmlzaW9uKChyKSA9PiByICsgMSk7XG4gICAgICAvLyDkuI7mlYjlupTlm57ot5HnmoQgc2VlZCDkv67orqLlj7fvvIjmlrDmnKzlnLDluo/lj7cgKyDnuqrlhYPvvInlr7npvZDvvIzkvb/kv53lrZjlkI7nmoTph43mkq3np43ooqvmipHliLZcbiAgICAgIGFjdGlvbnMuY29tbWl0KHN1Ym1pdFJldmlzaW9uICsgMSArIGdldEVwb2NoKCkpO1xuICAgIH0gY2F0Y2ggKG91dGVyKSB7XG4gICAgICBzZXRScGNFcnJvcihgJHt0KCdzZXR0aW5ncy5zYXZlRmFpbGVkJyl977yaJHtvdXRlciBpbnN0YW5jZW9mIEVycm9yID8gb3V0ZXIubWVzc2FnZSA6IFN0cmluZyhvdXRlcil9YCk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGhhbmRsZVJlc2V0ID0gYXN5bmMgKCkgPT4ge1xuICAgIHNldFJwY0Vycm9yKG51bGwpO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCByZXNldENvbmZpZygpO1xuICAgICAgYWN0aW9ucy5zZWVkKFxuICAgICAgICB7XG4gICAgICAgICAgYmFzZVVybDogREVGQVVMVFMuYmFzZVVybCxcbiAgICAgICAgICBhcGlLZXk6IERFRkFVTFRTLmFwaUtleSxcbiAgICAgICAgICBtb2RlbDogREVGQVVMVFMubW9kZWwsXG4gICAgICAgICAgdXNlU2Vzc2lvbk1vZGVsOiB0cnVlLFxuICAgICAgICAgIGludGVuc2l0eTogREVGQVVMVFMuaW50ZW5zaXR5LFxuICAgICAgICB9LFxuICAgICAgICBzdWJtaXRSZXZpc2lvbiArIDEgKyBnZXRFcG9jaCgpLFxuICAgICAgKTtcbiAgICAgIHNldFN1Ym1pdFJldmlzaW9uKChyKSA9PiByICsgMSk7XG4gICAgfSBjYXRjaCAob3V0ZXIpIHtcbiAgICAgIHNldFJwY0Vycm9yKGAke3QoJ3NldHRpbmdzLnJlc2V0RmFpbGVkJyl977yaJHtvdXRlciBpbnN0YW5jZW9mIEVycm9yID8gb3V0ZXIubWVzc2FnZSA6IFN0cmluZyhvdXRlcil9YCk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJvcHRpU2V0dGluZ3NcIj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzVGl0bGVcIiBvbkNsaWNrPXsoKSA9PiBzZXRFeHBhbmRlZCgodikgPT4gIXYpfSBzdHlsZT17eyBjdXJzb3I6ICdwb2ludGVyJyB9fT5cbiAgICAgICAge3QoJ3NldHRpbmdzLnRpdGxlJyl9XG4gICAgICAgIHshZXhwYW5kZWQgJiZcbiAgICAgICAgICAodmFsdWVzLnVzZVNlc3Npb25Nb2RlbCA/IChcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc0hpbnRcIj4gwrcge3QoJ3NldHRpbmdzLnNlc3Npb25Nb2RlbEVuYWJsZWQnKX08L3NwYW4+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc0hpbnRcIj4gwrcge3QodmFsdWVzLmFwaUtleSA/ICdjYXJkLmNvbmZpZ3VyZWQuaGludCcgOiAnY2FyZC51bmNvbmZpZ3VyZWQuaGludCcpLnJlcGxhY2UoJ3ttb2RlbH0nLCBtb2RlbExhYmVsKX08L3NwYW4+XG4gICAgICAgICAgKSl9XG4gICAgICA8L2Rpdj5cblxuICAgICAgey8qIEFJIOi+heWKqeagh+azqO+8muWni+e7iOWPr+inge+8jOS4jiBSRUFETUUgLyDmupDnoIHlpLTms6jph4rkvb/nlKjlkIzkuIDmjqrovp4gKi99XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc0hpbnRcIj57dCgnc2V0dGluZ3MuYWlOb3RpY2UnKX08L2Rpdj5cblxuICAgICAge2V4cGFuZGVkICYmIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJvcHRpU2V0dGluZ3NGb3JtXCI+XG4gICAgICAgICAge2dldEhvc3RTdGF0dXMgJiYgKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJvcHRpU2V0dGluZ3NGaWVsZFwiIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246ICdyb3cnIH19PlxuICAgICAgICAgICAgICA8c3BhblxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc0hpbnRcIlxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICBjb2xvcjogaG9zdFN0YXR1cz8uYXZhaWxhYmxlID8gJ3ZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnksICMyZjllNjMpJyA6ICd2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSwgI2QwMzA1MCknLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7aG9zdFN0YXR1cyA9PT0gbnVsbFxuICAgICAgICAgICAgICAgICAgPyB0KCdzZXR0aW5ncy5ob3N0UHJvYmUnKVxuICAgICAgICAgICAgICAgICAgOiBob3N0U3RhdHVzLmF2YWlsYWJsZVxuICAgICAgICAgICAgICAgICAgICA/IGAke3QoJ3NldHRpbmdzLmhvc3RPaycpfSAke2hvc3RTdGF0dXMucHJvdmlkZXJ9LyR7aG9zdFN0YXR1cy5tb2RlbH1gXG4gICAgICAgICAgICAgICAgICAgIDogYCR7dCgnc2V0dGluZ3MuaG9zdEZhaWwnKX0gJHtob3N0U3RhdHVzLmVycm9yID8/ICcnfWB9XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICl9XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJvcHRpU2V0dGluZ3NGaWVsZFwiPlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc0xhYmVsXCI+XG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICAgICAgY2hlY2tlZD17dmFsdWVzLnVzZVNlc3Npb25Nb2RlbH1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IGFjdGlvbnMuZWRpdCgndXNlU2Vzc2lvbk1vZGVsJywgZS50YXJnZXQuY2hlY2tlZCl9XG4gICAgICAgICAgICAgIC8+eycgJ31cbiAgICAgICAgICAgICAge3QoJ3NldHRpbmdzLnVzZVNlc3Npb25Nb2RlbCcpfVxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc0hpbnRcIj57dCgnc2V0dGluZ3MudXNlU2Vzc2lvbk1vZGVsSGludCcpfTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc0ZpZWxkXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJvcHRpU2V0dGluZ3NMYWJlbFwiPnt0KCdzZXR0aW5ncy5pbnRlbnNpdHknKX08L3NwYW4+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc1Jvd1wiPlxuICAgICAgICAgICAgICB7KFsnbGlnaHQnLCAnc3RhbmRhcmQnLCAnZGVlcCddIGFzIGNvbnN0KS5tYXAoKGxldmVsKSA9PiAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAga2V5PXtsZXZlbH1cbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgb3B0aVNldHRpbmdzQnRuJHt2YWx1ZXMuaW50ZW5zaXR5ID09PSBsZXZlbCA/ICcgcHJpbWFyeScgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gYWN0aW9ucy5lZGl0KCdpbnRlbnNpdHknLCBsZXZlbCl9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge3QoYGludGVuc2l0eS4ke2xldmVsfWApfVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzSGludFwiPnt0KCdzZXR0aW5ncy5pbnRlbnNpdHlIaW50Jyl9PC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzRmllbGRcIj5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJvcHRpU2V0dGluZ3NMYWJlbFwiIGh0bWxGb3I9XCJvcHRpLWJhc2UtdXJsXCI+e3QoJ3NldHRpbmdzLmJhc2VVcmwnKX08L2xhYmVsPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGlkPVwib3B0aS1iYXNlLXVybFwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc0lucHV0XCJcbiAgICAgICAgICAgICAgdmFsdWU9e3ZhbHVlcy5iYXNlVXJsfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17REVGQVVMVFMuYmFzZVVybH1cbiAgICAgICAgICAgICAgZGlzYWJsZWQ9e3ZhbHVlcy51c2VTZXNzaW9uTW9kZWx9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gYWN0aW9ucy5lZGl0KCdiYXNlVXJsJywgZS50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc0ZpZWxkXCI+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzTGFiZWxcIiBodG1sRm9yPVwib3B0aS1hcGkta2V5XCI+e3QoJ3NldHRpbmdzLmFwaUtleScpfTwvbGFiZWw+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgaWQ9XCJvcHRpLWFwaS1rZXlcIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJvcHRpU2V0dGluZ3NJbnB1dFwiXG4gICAgICAgICAgICAgIHR5cGU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgIHZhbHVlPXt2YWx1ZXMuYXBpS2V5fVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cInNrLeKAplwiXG4gICAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cIm9mZlwiXG4gICAgICAgICAgICAgIGRpc2FibGVkPXt2YWx1ZXMudXNlU2Vzc2lvbk1vZGVsfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IGFjdGlvbnMuZWRpdCgnYXBpS2V5JywgZS50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc0ZpZWxkXCI+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzTGFiZWxcIiBodG1sRm9yPVwib3B0aS1tb2RlbFwiPnt0KCdzZXR0aW5ncy5tb2RlbCcpfTwvbGFiZWw+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgaWQ9XCJvcHRpLW1vZGVsXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzSW5wdXRcIlxuICAgICAgICAgICAgICB2YWx1ZT17dmFsdWVzLm1vZGVsfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17dmFsdWVzLnVzZVNlc3Npb25Nb2RlbCA/ICfigJQnIDogREVGQVVMVFMubW9kZWx9XG4gICAgICAgICAgICAgIGRpc2FibGVkPXt2YWx1ZXMudXNlU2Vzc2lvbk1vZGVsfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IGFjdGlvbnMuZWRpdCgnbW9kZWwnLCBlLnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzUm93XCI+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJvcHRpU2V0dGluZ3NCdG4gcHJpbWFyeVwiIG9uQ2xpY2s9e2hhbmRsZVNhdmV9PlxuICAgICAgICAgICAgICB7dCgnc2V0dGluZ3Muc2F2ZScpfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJvcHRpU2V0dGluZ3NCdG5cIiBvbkNsaWNrPXtoYW5kbGVSZXNldH0+XG4gICAgICAgICAgICAgIHt0KCdzZXR0aW5ncy5yZXNldCcpfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICB7c2F2ZWQgJiYgPHNwYW4gY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzSGludFwiPnt0KCdzZXR0aW5ncy5zYXZlZCcpfTwvc3Bhbj59XG4gICAgICAgICAgICB7cnBjRXJyb3IgJiYgPHNwYW4gY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzRXJyXCI+e3JwY0Vycm9yfTwvc3Bhbj59XG4gICAgICAgICAgICB7IXJwY0Vycm9yICYmIGVycm9yICYmIDxzcGFuIGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc0VyclwiPnt0KGVycm9yKX08L3NwYW4+fVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzSGludFwiPnt0KCdzZXR0aW5ncy5kZXNjJyl9PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKX1cbiAgICA8L2Rpdj5cbiAgKTtcbn1cbiIsICIvKiog6K6+572u6KGo5Y2V5qCh6aqMIOKAlOKAlCDnuq/lh73mlbDvvIzml6AgRFNIIOS+nei1liAqL1xuXG5pbXBvcnQgeyBERUZBVUxUX0lOVEVOU0lUWSwgdHlwZSBJbnRlbnNpdHkgfSBmcm9tICcuL29wdGltaXplci5qcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2V0dGluZ3NGb3JtVmFsdWVzIHtcbiAgYmFzZVVybDogc3RyaW5nO1xuICBhcGlLZXk6IHN0cmluZztcbiAgbW9kZWw6IHN0cmluZztcbiAgLyoqIHRydWXvvJrkvJjljJbkvb/nlKjlvZPliY3kvJror53mqKHlnovvvJtmYWxzZe+8muS9v+eUqCBtb2RlbCAqL1xuICB1c2VTZXNzaW9uTW9kZWw6IGJvb2xlYW47XG4gIC8qKiDkvJjljJblvLrluqbvvJpsaWdodCAvIHN0YW5kYXJkIC8gZGVlcO+8iOS/neWtmOaXtueUsSBtZXJnZUNvbmZpZyDlvZLkuIDljJbvvIkgKi9cbiAgaW50ZW5zaXR5OiBJbnRlbnNpdHk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVNldHRpbmdzRm9ybSh2YWx1ZXM6IFNldHRpbmdzRm9ybVZhbHVlcyk6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4ge1xuICBjb25zdCBlcnJvcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcblxuICAvLyDpm7bphY3nva7vvIjkvJror53mqKHlnovvvInmqKHlvI/vvJpiYXNlVXJsL2FwaUtleS9tb2RlbCDpg73nlKjkuI3liLDvvIzkuI3lgZrmoKHpqozjgIJcbiAgLy8g5pen54mI5peg5p2h5Lu26KaB5rGCIGFwaUtleSDpnZ7nqbrvvIzlr7zoh7Tlj6rmg7PnlKjkvJror53mqKHlnovnmoTnlKjmiLflnKjorr7nva7pobXmoLnmnKzml6Dms5Xkv53lrZjigJTigJRcbiAgLy8g5LiO44CM6Zu26YWN572u6buY6K6k44CN55qE5Lqn5ZOB5a6a5L2N55u05o6l5Yay56qB44CCXG4gIGlmICh2YWx1ZXMudXNlU2Vzc2lvbk1vZGVsKSByZXR1cm4gZXJyb3JzO1xuXG4gIGNvbnN0IHVybCA9IHZhbHVlcy5iYXNlVXJsLnRyaW0oKTtcbiAgaWYgKCF1cmwpIHtcbiAgICBlcnJvcnMuYmFzZVVybCA9ICdzZXR0aW5ncy5iYXNlVXJsJztcbiAgfSBlbHNlIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgdSA9IG5ldyBVUkwodXJsKTtcbiAgICAgIGlmICh1LnByb3RvY29sICE9PSAnaHR0cHM6JyAmJiB1LnByb3RvY29sICE9PSAnaHR0cDonKSB0aHJvdyBuZXcgRXJyb3IoJ3Byb3RvY29sJyk7XG4gICAgICBpZiAodS5zZWFyY2ggfHwgdS5oYXNoKSB0aHJvdyBuZXcgRXJyb3IoJ3F1ZXJ5LW9yLWhhc2gnKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIGVycm9ycy5iYXNlVXJsID0gJ3NldHRpbmdzLmJhc2VVcmwnO1xuICAgIH1cbiAgfVxuXG4gIGlmICghdmFsdWVzLmFwaUtleS50cmltKCkpIGVycm9ycy5hcGlLZXkgPSAnc2V0dGluZ3MuYXBpS2V5JztcbiAgaWYgKCF2YWx1ZXMubW9kZWwudHJpbSgpKSBlcnJvcnMubW9kZWwgPSAnc2V0dGluZ3MubW9kZWwnO1xuXG4gIHJldHVybiBlcnJvcnM7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2V0dGluZ3NGb3JtU3RhdGUge1xuICB2YWx1ZXM6IFNldHRpbmdzRm9ybVZhbHVlcztcbiAgZGlydHk6IGJvb2xlYW47XG4gIHNhdmVkOiBib29sZWFuO1xuICBlcnJvcjogc3RyaW5nIHwgbnVsbDtcbiAgcmV2aXNpb246IG51bWJlcjtcbn1cblxuZXhwb3J0IGNvbnN0IElOSVRJQUxfU0VUVElOR1NfRk9STTogU2V0dGluZ3NGb3JtU3RhdGUgPSB7XG4gIHZhbHVlczogeyBiYXNlVXJsOiAnJywgYXBpS2V5OiAnJywgbW9kZWw6ICcnLCB1c2VTZXNzaW9uTW9kZWw6IHRydWUsIGludGVuc2l0eTogREVGQVVMVF9JTlRFTlNJVFkgfSxcbiAgZGlydHk6IGZhbHNlLFxuICBzYXZlZDogZmFsc2UsXG4gIGVycm9yOiBudWxsLFxuICByZXZpc2lvbjogLTEsXG59O1xuXG5leHBvcnQgdHlwZSBTZXR0aW5nc0Zvcm1BY3Rpb24gPVxuICB8IHsgdHlwZTogJ3NlZWQnOyB2YWx1ZXM6IFNldHRpbmdzRm9ybVZhbHVlczsgcmV2aXNpb246IG51bWJlciB9XG4gIHwgeyB0eXBlOiAnZWRpdCc7IGZpZWxkOiBrZXlvZiBTZXR0aW5nc0Zvcm1WYWx1ZXM7IHZhbHVlOiBzdHJpbmcgfCBib29sZWFuIH1cbiAgfCB7IHR5cGU6ICdjb21taXQnOyByZXZpc2lvbjogbnVtYmVyIH1cbiAgfCB7IHR5cGU6ICdmYWlsJzsgbWVzc2FnZTogc3RyaW5nIH07XG5cbmV4cG9ydCBmdW5jdGlvbiByZWR1Y2VTZXR0aW5nc0Zvcm0oc3RhdGU6IFNldHRpbmdzRm9ybVN0YXRlLCBhY3Rpb246IFNldHRpbmdzRm9ybUFjdGlvbik6IFNldHRpbmdzRm9ybVN0YXRlIHtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgJ3NlZWQnOlxuICAgICAgcmV0dXJuIGFjdGlvbi5yZXZpc2lvbiA8PSBzdGF0ZS5yZXZpc2lvblxuICAgICAgICA/IHN0YXRlXG4gICAgICAgIDogeyAuLi5zdGF0ZSwgdmFsdWVzOiB7IC4uLmFjdGlvbi52YWx1ZXMgfSwgZGlydHk6IGZhbHNlLCBzYXZlZDogZmFsc2UsIGVycm9yOiBudWxsLCByZXZpc2lvbjogYWN0aW9uLnJldmlzaW9uIH07XG4gICAgY2FzZSAnZWRpdCc6XG4gICAgICByZXR1cm4geyAuLi5zdGF0ZSwgdmFsdWVzOiB7IC4uLnN0YXRlLnZhbHVlcywgW2FjdGlvbi5maWVsZF06IGFjdGlvbi52YWx1ZSB9LCBkaXJ0eTogdHJ1ZSwgc2F2ZWQ6IGZhbHNlLCBlcnJvcjogbnVsbCB9O1xuICAgIGNhc2UgJ2NvbW1pdCc6XG4gICAgICByZXR1cm4geyAuLi5zdGF0ZSwgZGlydHk6IGZhbHNlLCBzYXZlZDogdHJ1ZSwgZXJyb3I6IG51bGwsIHJldmlzaW9uOiBhY3Rpb24ucmV2aXNpb24gfTtcbiAgICBjYXNlICdmYWlsJzpcbiAgICAgIHJldHVybiB7IC4uLnN0YXRlLCBlcnJvcjogYWN0aW9uLm1lc3NhZ2UgfTtcbiAgfVxufVxuIiwgIi8qKiDorr7nva7ooajljZUgc3RvcmXvvJroh6rlrp7njrAgZGVmaW5lU3RvcmXvvIzpm7YgQGRlZXBzZWVrLWFpIOi/kOihjOaXtuS+nei1lu+8iOahjOmdoua4suafk+WZqOWFvOWuue+8iSAqL1xuaW1wb3J0IHtcbiAgSU5JVElBTF9TRVRUSU5HU19GT1JNLFxuICByZWR1Y2VTZXR0aW5nc0Zvcm0sXG4gIHZhbGlkYXRlU2V0dGluZ3NGb3JtLFxuICB0eXBlIFNldHRpbmdzRm9ybVN0YXRlLFxuICB0eXBlIFNldHRpbmdzRm9ybVZhbHVlcyxcbn0gZnJvbSAnLi9zZXR0aW5ncy1mb3JtLXN0YXRlLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBTZXR0aW5nc0Zvcm1BY3Rpb25zIHtcbiAgc2VlZCh2YWx1ZXM6IFNldHRpbmdzRm9ybVZhbHVlcywgcmV2aXNpb246IG51bWJlcik6IHZvaWQ7XG4gIGVkaXQoZmllbGQ6IGtleW9mIFNldHRpbmdzRm9ybVZhbHVlcywgdmFsdWU6IHN0cmluZyk6IHZvaWQ7XG4gIGNvbW1pdChyZXZpc2lvbjogbnVtYmVyKTogdm9pZDtcbiAgZmFpbChtZXNzYWdlOiBzdHJpbmcpOiB2b2lkO1xuICAvKiog5L+d5a2Y5YmN5qCh6aqM77yb6L+U5Zue6ZSZ6K+v5a2X5YW477yb5peg6ZSZ6K+v5pe26L+U5ZueIG51bGwgKi9cbiAgdmFsaWRhdGUodmFsdWVzOiBTZXR0aW5nc0Zvcm1WYWx1ZXMpOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHwgbnVsbDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTZXR0aW5nc0Zvcm1TdG9yZUhhbmRsZSB7XG4gIHNwZWM6IHtcbiAgICBpbml0OiAoKSA9PiBTZXR0aW5nc0Zvcm1TdGF0ZTtcbiAgICBhY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCAoZDogU2V0dGluZ3NGb3JtU3RhdGUsIC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkPjtcbiAgfTtcbiAgY3JlYXRlKHNjb3BlS2V5Pzogc3RyaW5nKToge1xuICAgIGFjdGlvbnM6IFNldHRpbmdzRm9ybUFjdGlvbnM7XG4gICAgZ2V0U25hcHNob3Q6ICgpID0+IFNldHRpbmdzRm9ybVN0YXRlO1xuICAgIHN1YnNjcmliZTogKGZuOiAoKSA9PiB2b2lkKSA9PiAoKSA9PiB2b2lkO1xuICAgIHN0b3JlOiB1bmtub3duO1xuICAgIGNsZWFyUGVyc2lzdGVkOiAoKSA9PiB2b2lkO1xuICB9O1xufVxuXG4vKiog6Ieq5a6e546wIGRlZmluZVN0b3JlIOKAlOKAlCDpgb/lhY0gQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtcnVudGltZS9jbGllbnQg55qEIHJlcXVpcmUg5Zyo5qGM6Z2i5riy5p+T5Zmo5peg5rOV6Kej5p6QICovXG5mdW5jdGlvbiBkZWZpbmVTdG9yZShkZWNsOiB7XG4gIGluaXQ6ICgpID0+IFNldHRpbmdzRm9ybVN0YXRlO1xuICBhY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCAoZDogU2V0dGluZ3NGb3JtU3RhdGUsIC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkPjtcbn0pIHtcbiAgcmV0dXJuIHtcbiAgICBzcGVjOiBkZWNsLFxuICAgIGNyZWF0ZShfc2NvcGVLZXk/OiBzdHJpbmcpOiB7XG4gICAgICBhY3Rpb25zOiBTZXR0aW5nc0Zvcm1BY3Rpb25zO1xuICAgICAgZ2V0U25hcHNob3Q6ICgpID0+IFNldHRpbmdzRm9ybVN0YXRlO1xuICAgICAgc3Vic2NyaWJlOiAoZm46ICgpID0+IHZvaWQpID0+ICgpID0+IHZvaWQ7XG4gICAgICBzdG9yZTogdW5rbm93bjtcbiAgICAgIGNsZWFyUGVyc2lzdGVkOiAoKSA9PiB2b2lkO1xuICAgIH0ge1xuICAgICAgbGV0IHN0YXRlID0gZGVjbC5pbml0KCk7XG4gICAgICBjb25zdCBsaXN0ZW5lcnMgPSBuZXcgU2V0PCgpID0+IHZvaWQ+KCk7XG4gICAgICBjb25zdCBub3RpZnkgPSAoKSA9PiB7IGZvciAoY29uc3QgZm4gb2YgbGlzdGVuZXJzKSBmbigpOyB9O1xuICAgICAgY29uc3Qgc3RvcmUgPSB7XG4gICAgICAgIGdldFNuYXBzaG90OiAoKSA9PiBzdGF0ZSxcbiAgICAgICAgc3Vic2NyaWJlOiAoZm46ICgpID0+IHZvaWQpID0+IHsgbGlzdGVuZXJzLmFkZChmbik7IHJldHVybiAoKSA9PiB2b2lkIGxpc3RlbmVycy5kZWxldGUoZm4pOyB9LFxuICAgICAgICB1cGRhdGU6IChtdXRhdG9yOiAoZHJhZnQ6IFNldHRpbmdzRm9ybVN0YXRlKSA9PiB2b2lkKSA9PiB7XG4gICAgICAgICAgY29uc3QgZHJhZnQgPSB7IC4uLnN0YXRlLCB2YWx1ZXM6IHsgLi4uc3RhdGUudmFsdWVzIH0gfTtcbiAgICAgICAgICBtdXRhdG9yKGRyYWZ0KTtcbiAgICAgICAgICBzdGF0ZSA9IGRyYWZ0O1xuICAgICAgICAgIG5vdGlmeSgpO1xuICAgICAgICB9LFxuICAgICAgfTtcbiAgICAgIGNvbnN0IGFjdGlvbnM6IFJlY29yZDxzdHJpbmcsICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZD4gPSB7fTtcbiAgICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKGRlY2wuYWN0aW9ucykpIHtcbiAgICAgICAgY29uc3QgbXV0YXRlID0gZGVjbC5hY3Rpb25zW2tleV07XG4gICAgICAgIGFjdGlvbnNba2V5XSA9ICguLi5wYXJhbXM6IGFueVtdKSA9PiB7XG4gICAgICAgICAgc3RvcmUudXBkYXRlKChkcmFmdDogU2V0dGluZ3NGb3JtU3RhdGUpID0+IHsgbXV0YXRlKGRyYWZ0LCAuLi5wYXJhbXMpOyB9KTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGFjdGlvbnM6IGFjdGlvbnMgYXMgdW5rbm93biBhcyBTZXR0aW5nc0Zvcm1BY3Rpb25zLFxuICAgICAgICBnZXRTbmFwc2hvdDogc3RvcmUuZ2V0U25hcHNob3QsXG4gICAgICAgIHN1YnNjcmliZTogc3RvcmUuc3Vic2NyaWJlLFxuICAgICAgICBzdG9yZSxcbiAgICAgICAgY2xlYXJQZXJzaXN0ZWQ6ICgpID0+IHtcbiAgICAgICAgICBpZiAodHlwZW9mIGxvY2FsU3RvcmFnZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRyeSB7IGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdkc2gtcHJvbXB0LWFyY2hpdGVjdC9zZXR0aW5ncycpOyB9IGNhdGNoIHt9XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9LFxuICB9O1xufVxuXG5leHBvcnQgY29uc3QgY3JlYXRlU2V0dGluZ3NGb3JtU3RvcmUgPSAoKTogU2V0dGluZ3NGb3JtU3RvcmVIYW5kbGUgPT4ge1xuICByZXR1cm4gZGVmaW5lU3RvcmUoe1xuICAgIGluaXQ6ICgpOiBTZXR0aW5nc0Zvcm1TdGF0ZSA9PiAoe1xuICAgICAgLi4uSU5JVElBTF9TRVRUSU5HU19GT1JNLFxuICAgICAgdmFsdWVzOiB7IC4uLklOSVRJQUxfU0VUVElOR1NfRk9STS52YWx1ZXMgfSxcbiAgICB9KSxcbiAgICBhY3Rpb25zOiB7XG4gICAgICBzZWVkOiAoZDogU2V0dGluZ3NGb3JtU3RhdGUsIHZhbHVlczogU2V0dGluZ3NGb3JtVmFsdWVzLCByZXZpc2lvbjogbnVtYmVyKSA9PlxuICAgICAgICBPYmplY3QuYXNzaWduKGQsIHJlZHVjZVNldHRpbmdzRm9ybShkLCB7IHR5cGU6ICdzZWVkJywgdmFsdWVzLCByZXZpc2lvbiB9KSksXG4gICAgICBlZGl0OiAoZDogU2V0dGluZ3NGb3JtU3RhdGUsIGZpZWxkOiBrZXlvZiBTZXR0aW5nc0Zvcm1WYWx1ZXMsIHZhbHVlOiBzdHJpbmcpID0+XG4gICAgICAgIE9iamVjdC5hc3NpZ24oZCwgcmVkdWNlU2V0dGluZ3NGb3JtKGQsIHsgdHlwZTogJ2VkaXQnLCBmaWVsZCwgdmFsdWUgfSkpLFxuICAgICAgY29tbWl0OiAoZDogU2V0dGluZ3NGb3JtU3RhdGUsIHJldmlzaW9uOiBudW1iZXIpID0+XG4gICAgICAgIE9iamVjdC5hc3NpZ24oZCwgcmVkdWNlU2V0dGluZ3NGb3JtKGQsIHsgdHlwZTogJ2NvbW1pdCcsIHJldmlzaW9uIH0pKSxcbiAgICAgIGZhaWw6IChkOiBTZXR0aW5nc0Zvcm1TdGF0ZSwgbWVzc2FnZTogc3RyaW5nKSA9PlxuICAgICAgICBPYmplY3QuYXNzaWduKGQsIHJlZHVjZVNldHRpbmdzRm9ybShkLCB7IHR5cGU6ICdmYWlsJywgbWVzc2FnZSB9KSksXG4gICAgICB2YWxpZGF0ZTogKF9kOiBTZXR0aW5nc0Zvcm1TdGF0ZSwgdmFsdWVzOiBTZXR0aW5nc0Zvcm1WYWx1ZXMpID0+IHtcbiAgICAgICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGVTZXR0aW5nc0Zvcm0odmFsdWVzKTtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKGVycm9ycykubGVuZ3RoID09PSAwID8gbnVsbCA6IGVycm9ycztcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG59OyJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7OztBQ2VPLElBQU0sb0JBQStCO0FBRTVDLElBQU0sY0FBb0MsQ0FBQyxTQUFTLFlBQVksTUFBTTtBQUN0RSxTQUFTLFlBQVksR0FBdUI7QUFDMUMsU0FBTyxPQUFPLE1BQU0sWUFBYSxZQUFrQyxTQUFTLENBQUMsSUFDeEUsSUFDRDtBQUNOO0FBRU8sSUFBTSxXQUF5QjtBQUFBLEVBQ3BDLFNBQVM7QUFBQSxFQUNULFFBQVE7QUFBQSxFQUNSLE9BQU87QUFBQSxFQUNQLGlCQUFpQjtBQUFBLEVBQ2pCLFdBQVc7QUFDYjtBQUlP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LFVBQVUsT0FBTyxFQUFFLE1BQU07QUFBQSxrQkFDakU7QUFDQSx5QkFBTyxFQUFFLFdBQVcsT0FBTyxPQUFRLElBQUksVUFBVSxJQUFJLE1BQU0sV0FBVyxJQUFJLE1BQU0sU0FBVSxXQUFXO0FBQUEsZ0JBQ3ZHO0FBQ0EsdUJBQU8sRUFBRSxXQUFXLE9BQU8sT0FBUSxJQUFJLFVBQVUsSUFBSSxNQUFNLFdBQVcsSUFBSSxNQUFNLFNBQVUsYUFBYTtBQUFBLGNBQ3pHLFNBQVMsR0FBRztBQUNWLHVCQUFPLEVBQUUsV0FBVyxPQUFPLE9BQU8sT0FBUSxHQUE2QixXQUFXLENBQUMsRUFBRTtBQUFBLGNBQ3ZGO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRixDQUFDO0FBS0QsTUFBSSxPQUFPLE1BQU07QUFDZixVQUFNLFlBQVksQ0FBQyxNQUFxQjtBQUN0QyxVQUFJLEVBQUUsT0FBUTtBQUNkLFVBQUksQ0FBQyxFQUFFLFVBQVUsRUFBRSxTQUFTLE9BQVE7QUFDcEMsWUFBTSxLQUFLLFNBQVM7QUFDcEIsWUFBTSxVQUNKLGNBQWMsdUJBQ2IsY0FBYyxnQkFBZ0IsR0FBRyxxQkFBcUIsR0FBRyxRQUFRLHVCQUF1QixNQUFNO0FBQ2pHLFVBQUksQ0FBQyxRQUFTO0FBQ2QsUUFBRSxlQUFlO0FBQ2pCLDBCQUFvQjtBQUFBLElBQ3RCO0FBQ0EsYUFBUyxpQkFBaUIsV0FBVyxTQUFTO0FBQzlDLFdBQU8sTUFBTSxTQUFTLG9CQUFvQixXQUFXLFNBQVM7QUFBQSxFQUNoRSxHQUFHLGtDQUFrQztBQUN2QzsiLAogICJuYW1lcyI6IFsic3RhdGUiLCAiUmVhY3QiLCAiaW1wb3J0X3JlYWN0IiwgImltcG9ydF9qc3hfcnVudGltZSIsICJDU1NfSUQiLCAiaW5qZWN0Q3NzIiwgInN0YXRlIiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfanN4X3J1bnRpbWUiLCAiQ1NTX0lEIiwgImluamVjdENzcyIsICJzdGF0ZSIsICJzdGF0ZSIsICJsaXN0ZW5lcnMiXQp9Cg==

    return module.exports;
  }
});
