window.__ModuleLoader__.load({
  id: "dsh-prompt-optimize",
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
  const response = await fetch(`/dsh-prompt-optimize/api/${encodeURIComponent(method)}`, {
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
    const response = await fetch("/dsh-prompt-optimize/api/optimize.stream", {
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
var KEY = "dsh-prompt-optimize.memory.v1";
var LEGACY_KEYS = ["dsh-prompt-architect.memory.v1", "dsh-prompt-optimizer.memory.v1"];
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
      for (const k of LEGACY_KEYS) {
        const legacy = s.getItem(k);
        if (!legacy) continue;
        raw = legacy;
        try {
          s.setItem(KEY, legacy);
          s.removeItem(k);
        } catch {
        }
        break;
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
var CSS_ID = "dsh-prompt-optimize/button.css";
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
var CSS_ID2 = "dsh-prompt-optimize/card.css";
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
var CSS_ID3 = "dsh-prompt-optimize/settings.css";
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
              localStorage.removeItem("dsh-prompt-optimize/settings");
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
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), "prompt-optimize: locale registration");
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
          id: "prompt-optimize-button",
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
          id: "prompt-optimize-card",
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
          id: "prompt-optimize-settings",
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
  }, "prompt-optimize: alt+o shortcut");
}
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2luZGV4LnRzIiwgIi4uL3NyYy9vcHRpbWl6ZXIudHMiLCAiLi4vc3JjL2xvY2FsZXMudHMiLCAiLi4vc3JjL2V2ZW50cy50cyIsICIuLi9zcmMvT3B0aW1pemVCdXR0b24udHN4IiwgIi4uL3NyYy9zZXNzaW9uLW9wdGltaXplci50cyIsICIuLi9zcmMvbWVtb3J5LnRzIiwgIi4uL3NyYy9wcmV2aWV3LXN0YXRlLnRzIiwgIi4uL3NyYy9wcmV2aWV3LWJ1cy50cyIsICIuLi9zcmMvb3B0aW1pemVyLXN0b3JlLnRzIiwgIi4uL3NyYy9jb21wb3Nlci50cyIsICIuLi9zcmMvUHJldmlld0NhcmQudHN4IiwgIi4uL3NyYy9TZXR0aW5nc1Jvdy50c3giLCAiLi4vc3JjL3NldHRpbmdzLWZvcm0tc3RhdGUudHMiLCAiLi4vc3JjL3NldHRpbmdzLXN0b3JlLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvLyDmnKzpobnnm67nlLEgQUkg6L6F5Yqp5LyY5YyW5a6M5oiQ77yI5o+Q56S66K+N5YaF5qC444CB5rWL6K+V5LiO5paH5qGj77yJ77yM5Y+R5biD5YmN57uP5Lq65bel5a6h6ZiF44CCXG4vKiogZHNoLXByb21wdC1vcHRpbWl6ZSDmj5Lku7blhaXlj6Mg4oCUIGFwcGx5KGN0eCkgKi9cblxuaW1wb3J0IHR5cGUgeyBDbGllbnRDb250ZXh0IH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtcnVudGltZS9jbGllbnQnO1xuaW1wb3J0IHR5cGUgeyBMYW5nLCBQcm9tcHRDb25maWcgfSBmcm9tICcuL29wdGltaXplci5qcyc7XG5pbXBvcnQgeyBERUZBVUxUUywgbWVyZ2VDb25maWcgfSBmcm9tICcuL29wdGltaXplci5qcyc7XG5pbXBvcnQgeyBOUywgemgsIGVuLCBsYW5nT2YgfSBmcm9tICcuL2xvY2FsZXMuanMnO1xuaW1wb3J0IHR5cGUgeyBPcHRpbWl6ZXJBY3Rpb25zIH0gZnJvbSAnLi9vcHRpbWl6ZXItc3RvcmUuanMnO1xuaW1wb3J0IHsgZW1pdE9wdGltaXplUmVxdWVzdCwgZW1pdE9wZW5TZXR0aW5nc1JlcXVlc3QgfSBmcm9tICcuL2V2ZW50cy5qcyc7XG5pbXBvcnQgeyBPcHRpbWl6ZUJ1dHRvbiB9IGZyb20gJy4vT3B0aW1pemVCdXR0b24udHN4JztcbmltcG9ydCB7IFByZXZpZXdDYXJkIH0gZnJvbSAnLi9QcmV2aWV3Q2FyZC50c3gnO1xuaW1wb3J0IHsgU2V0dGluZ3NSb3cgfSBmcm9tICcuL1NldHRpbmdzUm93LnRzeCc7XG5pbXBvcnQgeyBjcmVhdGVTZXR0aW5nc0Zvcm1TdG9yZSB9IGZyb20gJy4vc2V0dGluZ3Mtc3RvcmUuanMnO1xuaW1wb3J0IHR5cGUgeyBIb3N0UnBjIH0gZnJvbSAnLi9zZXNzaW9uLW9wdGltaXplci5qcyc7XG5pbXBvcnQgeyB3aXRoVGltZW91dCwgY2FsbEhvc3QgfSBmcm9tICcuL3Nlc3Npb24tb3B0aW1pemVyLmpzJztcblxuLyoqXG4gKiDlo7DmmI7mj5Lku7bkvp3otZbnmoTlrqLmiLfnq6/mnI3liqHvvIhjb3JkaXMgc2VydmljZSBrZXlz77yJ77yaYXBwbHkg5YaF57uPIGBjdHguPHNlcnZpY2U+YCDorr/pl67nmoTmnI3liqHlv4XpobvlnKjmraTlo7DmmI7jgIJcbiAqIOWAvOmhu+S4uuacjeWKoeWQjeiAjOmdnuWMhSBpZOKAlOKAlOS4juWQjOW9ouaAgeWFiOS+i+S4gOiHtO+8iGRzaC1tZXNzYWdlLXJhaWw6IFtcInNsb3RzXCIsXCJzZXNzaW9uc1wiXe+8m1xuICogZHNoLWJldHRlci1zaWRlYmFyIOS6puWjsOaYjiBsb2NhbGXvvInvvJvplJnor6/lo7DmmI7kvJrorqkgZmliZXIg5rC45LmFIFBFTkRJTkfvvIzlkK/liqjlrqHorqHnm7TmjqXliKTlpLHotKXjgIJcbiAqL1xuZXhwb3J0IGNvbnN0IGluamVjdCA9IFsnc2xvdHMnLCAnc2Vzc2lvbnMnLCAnbG9jYWxlJ107XG5cbmV4cG9ydCBmdW5jdGlvbiBhcHBseShjdHg6IENsaWVudENvbnRleHQpIHtcbiAgLy8gMS4g5paH5qGIXG4gIGN0eC5lZmZlY3QoKCkgPT4gY3R4LmxvY2FsZS5yZWdpc3RlcihOUywgeyB6aCwgZW4gfSksICdwcm9tcHQtb3B0aW1pemU6IGxvY2FsZSByZWdpc3RyYXRpb24nKTtcblxuICAvLyAyLiDphY3nva7plZzlg4/vvJpIVFRQIEFQSe+8iHNlcnZlciBoYWxmIOivu+WGmSB+Ly5kc2gvcHJvbXB0LW9wdGltaXplLWNvbmZpZy5qc29u77yMXG4gIC8vIOmAmumBkyAnL2RzaC1wcm9tcHQtb3B0aW1pemUvYXBpL2dldHxzZXQn77yJ44CC5Y6f5YWI6LWwIGNvbm5lY3Rpb24ucnBjIOeOr+WbnumAmumBk++8jOS9huahjOmdolxuICAvLyDlrr/kuLvov5DooYzml7bmsqHmnIkgY29ubmVjdGlvbiDmnI3liqHvvIhmaWJlciDmsLjkuYUgUEVORElORyDihpIg5ZCv5Yqo5oyC5q2777yJ77yM57uf5LiA6LWwIHdlYlNlcnZlciBIVFRQ44CCXG4gIGxldCBjb25maWdNaXJyb3I6IFByb21wdENvbmZpZyA9IG1lcmdlQ29uZmlnKHVuZGVmaW5lZCk7XG4gIGxldCBjb25maWdFcG9jaCA9IDA7XG4gIGNvbnN0IHJwY0NvbmZpZyA9IGFzeW5jIChlbmRwb2ludDogc3RyaW5nLCBwYXlsb2FkPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiBQcm9taXNlPHVua25vd24+ID0+IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjYWxsSG9zdChlbmRwb2ludCwgcGF5bG9hZCA/PyB7fSk7XG4gICAgaWYgKCFyZXN1bHQub2spIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYGNvbmZpZyBycGMgJHtlbmRwb2ludH0gZmFpbGVkOiAkeyhyZXN1bHQuZXJyb3IgJiYgKHJlc3VsdC5lcnJvci5kZXRhaWxzIHx8IHJlc3VsdC5lcnJvci5jb2RlKSkgfHwgJ3JwYyBmYWlsZWQnfWAsXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0LnZhbHVlO1xuICB9O1xuICBjb25zdCBsb2FkQ29uZmlnID0gYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IGF3YWl0IHJwY0NvbmZpZygnZ2V0Jyk7XG4gICAgICBjb25maWdNaXJyb3IgPSBtZXJnZUNvbmZpZyh2YWx1ZSBhcyBQYXJ0aWFsPFByb21wdENvbmZpZz4gfCB1bmRlZmluZWQpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLy8g5Yid5qyh6L+e5o6l5pyq5bCx57uq5pe25L+d5oyB6buY6K6k77yb5LiL5qyh5L+d5a2Y5ZCO6ZWc5YOP5Y2z5pu05pawXG4gICAgfVxuICB9O1xuICB2b2lkIGxvYWRDb25maWcoKTtcblxuICAvLyAyLjUg5b2T5YmN5Lya6K+d6Kej5p6Q77ya5YWI5Y+W5r+A5rS75Lya6K+dIGlk77yIc2Vzc2lvbnMuY3VycmVudFByb3ZpZGVJbmZv77yJ77yMXG4gIC8vIOWGjeafpSBzZXNzaW9uLm1vZGVscyDigJTigJQg5LiN5LygIHNlc3Npb25JZCDml7bmnI3liqHnq6/lm57pgIDpu5jorqTmqKHlnovogIzpnZ7kvJror53mqKHlnovvvIjlrp7mtYsgYnVn77yJXG4gIGNvbnN0IGdldEFjdGl2ZVNlc3Npb24gPSAoKTogc3RyaW5nIHwgbnVsbCA9PiB7XG4gICAgY29uc3QgaW5mbyA9IChcbiAgICAgIGN0eC5zZXNzaW9ucyBhcyB7XG4gICAgICAgIGN1cnJlbnRQcm92aWRlSW5mbz86IHsgZ2V0U25hcHNob3Q/OiAoKSA9PiB7IHNlc3Npb25JZD86IHN0cmluZyB9IH07XG4gICAgICB9IHwgdW5kZWZpbmVkXG4gICAgKT8uY3VycmVudFByb3ZpZGVJbmZvPy5nZXRTbmFwc2hvdD8uKCk7XG4gICAgY29uc3Qgc2Vzc2lvbklkID0gaW5mbz8uc2Vzc2lvbklkO1xuICAgIHJldHVybiB0eXBlb2Ygc2Vzc2lvbklkID09PSAnc3RyaW5nJyAmJiBzZXNzaW9uSWQubGVuZ3RoID4gMCA/IHNlc3Npb25JZCA6IG51bGw7XG4gIH07XG4gIC8vIDIuNiDlrr/kuLvpgJrpgZPvvIjkvJror53pu5jorqTmqKHlnosgKyBzZXJ2ZXIg5Y2KIGxsbS5zdHJlYW3vvIzpm7bphY3nva7vvInvvJpcbiAgLy8g6YCa6YGT5Y2z6Ieq5pyJIFJQQ++8iC9kc2gtcHJvbXB0LW9wdGltaXpl77yJ77ybc2VydmVyIGhhbGYg55SoIGFnZW50RGVmYXVsdE1vZGVsIOWPluW9k+WJjVxuICAvLyDkvJror53mqKHlnovjgIFsbG0uc3RyZWFtIOecn+a1geW8j++8iOWPluiHqiBkc2gtZWxmIOW3sumqjOivgeeahOWuv+S4u+acjeWKoemdou+8ieOAguS4jeeUqCBzZXNzaW9uLmNyZWF0ZS9cbiAgLy8gZm9ya++8muWQjuWPsOS8muivneS4jeWcqOWJjeWPsOS4jeinpuWPkeaooeWei+aJp+ihjO+8jOiHque8liBpZCDooqvpnZnpu5jmi5Lnu50g4oaSIOOAjOawuOi/nOato+WcqOS8mOWMluOAje+8iOWunua1i++8ieOAglxuICBjb25zdCBob3N0UnBjOiBIb3N0UnBjID0ge1xuICAgIGNhbGw6IChlbmRwb2ludCwgcGF5bG9hZCkgPT4gY2FsbEhvc3QoZW5kcG9pbnQsIHBheWxvYWQgPz8ge30pLFxuICB9O1xuICBjb25zdCBnZXRIb3N0ID0gKCk6IHsgcnBjOiBIb3N0UnBjIH0gPT4gKHsgcnBjOiBob3N0UnBjIH0pO1xuICBjb25zdCBnZXRTZXNzaW9uTW9kZWwgPSBhc3luYyAoKTogUHJvbWlzZTx7IHByb3ZpZGVyOiBzdHJpbmc7IG1vZGVsOiBzdHJpbmcgfSB8IG51bGw+ID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzID0gYXdhaXQgd2l0aFRpbWVvdXQoY2FsbEhvc3QoJ3Nlc3Npb25Nb2RlbCcsIHt9KSwgNTAwMCwgJ3Nlc3Npb25Nb2RlbCcpO1xuICAgICAgaWYgKHJlcy5vayAmJiByZXMudmFsdWUgJiYgdHlwZW9mIHJlcy52YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgY29uc3QgdiA9IHJlcy52YWx1ZSBhcyB7IHByb3ZpZGVyPzogc3RyaW5nOyBtb2RlbD86IHN0cmluZyB9O1xuICAgICAgICBpZiAodHlwZW9mIHYucHJvdmlkZXIgPT09ICdzdHJpbmcnICYmIHR5cGVvZiB2Lm1vZGVsID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHJldHVybiB7IHByb3ZpZGVyOiB2LnByb3ZpZGVyLCBtb2RlbDogdi5tb2RlbCB9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfTtcblxuICAvLyAyLjViIOmihOiniOeql+WPo+S8muivnee7keWumu+8muWNoeeJh+WPquWcqOWPkei1t+S8muivneaYvuekuu+8iOWIh+i1sOS4jei3n+maj++8iVxuICBjb25zdCBnZXRTZXNzaW9uSWQgPSAoKTogc3RyaW5nIHwgbnVsbCA9PiBnZXRBY3RpdmVTZXNzaW9uKCk7XG5cbiAgLy8gMy4g6K+t6KiA6ZWc5YOPXG4gIGxldCBsYW5nOiBMYW5nID0gbGFuZ09mKGN0eC5sb2NhbGUuZ2V0TG9jYWxlKCkuYWN0aXZlKTtcbiAgY3R4Lm9uKCdsb2NhbGUvY2hhbmdlJywgKHNuYXA6IHsgYWN0aXZlOiBzdHJpbmcgfSkgPT4ge1xuICAgIGxhbmcgPSBsYW5nT2Yoc25hcC5hY3RpdmUpO1xuICB9KTtcblxuICAvLyA0LiDkvJror53mp73kvY3vvJrmjInpkq4gKyDpooTop4jljaHniYdcbiAgY3R4LmluamVjdChbJ3Nsb3RzJywgJ3Nlc3Npb25zJ10sIChzY29wZSkgPT4ge1xuICAgIHNjb3BlLnNsb3RzLmluamVjdCgnY29udmVyc2F0aW9uLmlucHV0LnJpZ2h0JywgKCkgPT5cbiAgICAgIHNjb3BlLnNsb3RzLnJlZ2lzdGVyKFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ2NvbnZlcnNhdGlvbi5pbnB1dC5yaWdodCcsXG4gICAgICAgICAgaWQ6ICdwcm9tcHQtb3B0aW1pemUtYnV0dG9uJyxcbiAgICAgICAgICBvcmRlcjogMCxcbiAgICAgICAgICBsb2NhbGU6IE5TLFxuICAgICAgICAgIGluamVjdDogKCkgPT4gKHtcbiAgICAgICAgICAgIGdldENvbmZpZzogKCkgPT4gY29uZmlnTWlycm9yLFxuICAgICAgICAgICAgZ2V0TGFuZzogKCkgPT4gbGFuZyxcbiAgICAgICAgICAgIGdldFNlc3Npb25Nb2RlbCxcbiAgICAgICAgICAgIGdldEhvc3QsXG4gICAgICAgICAgICBnZXRTZXNzaW9uSWQsXG4gICAgICAgICAgfSksXG4gICAgICAgIH0sXG4gICAgICAgIE9wdGltaXplQnV0dG9uLFxuICAgICAgKSxcbiAgICApO1xuICAgIHNjb3BlLnNsb3RzLmluamVjdCgnY29udmVyc2F0aW9uLmlucHV0Lm92ZXJsYXknLCAoKSA9PlxuICAgICAgc2NvcGUuc2xvdHMucmVnaXN0ZXIoXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnY29udmVyc2F0aW9uLmlucHV0Lm92ZXJsYXknLFxuICAgICAgICAgIGlkOiAncHJvbXB0LW9wdGltaXplLWNhcmQnLFxuICAgICAgICAgIG9yZGVyOiAxMCxcbiAgICAgICAgICBsb2NhbGU6IE5TLFxuICAgICAgICAgIGluamVjdDogKCkgPT4gKHtcbiAgICAgICAgICAgIGdldENvbmZpZzogKCkgPT4gY29uZmlnTWlycm9yLFxuICAgICAgICAgICAgZ2V0TGFuZzogKCkgPT4gbGFuZyxcbiAgICAgICAgICAgIG9wZW5TZXR0aW5nczogKCkgPT4gZW1pdE9wZW5TZXR0aW5nc1JlcXVlc3QoKSxcbiAgICAgICAgICAgIGdldFNlc3Npb25Nb2RlbCxcbiAgICAgICAgICAgIGdldEhvc3QsXG4gICAgICAgICAgICBnZXRTZXNzaW9uSWQsXG4gICAgICAgICAgfSksXG4gICAgICAgIH0sXG4gICAgICAgIFByZXZpZXdDYXJkLFxuICAgICAgKSxcbiAgICApO1xuICB9KTtcblxuICAvLyA2LiDorr7nva7ooYzvvIhyb290IOS9nOeUqOWfn++8iVxuICBjb25zdCBzZXR0aW5nc1N0b3JlID0gY3JlYXRlU2V0dGluZ3NGb3JtU3RvcmUoKTtcbiAgY29uc3Qgc2F2ZUNvbmZpZyA9IGFzeW5jIChyYXc6IFBhcnRpYWw8UHJvbXB0Q29uZmlnPik6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IG1lcmdlZCA9IG1lcmdlQ29uZmlnKHsgLi4uY29uZmlnTWlycm9yLCAuLi5yYXcgfSk7XG4gICAgY29uc3Qgd3JpdHRlbjogUHJvbXB0Q29uZmlnID0ge1xuICAgICAgYmFzZVVybDogbWVyZ2VkLmJhc2VVcmwsXG4gICAgICBhcGlLZXk6IG1lcmdlZC5hcGlLZXkudHJpbSgpLFxuICAgICAgbW9kZWw6IG1lcmdlZC5tb2RlbCxcbiAgICAgIHVzZVNlc3Npb25Nb2RlbDogbWVyZ2VkLnVzZVNlc3Npb25Nb2RlbCxcbiAgICAgIGludGVuc2l0eTogbWVyZ2VkLmludGVuc2l0eSxcbiAgICB9O1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzYXZlZCA9IGF3YWl0IHJwY0NvbmZpZygnc2V0Jywge1xuICAgICAgICBwYXRjaDoge1xuICAgICAgICAgIGJhc2VVcmw6IHdyaXR0ZW4uYmFzZVVybCxcbiAgICAgICAgICBhcGlLZXk6IHdyaXR0ZW4uYXBpS2V5LFxuICAgICAgICAgIG1vZGVsOiB3cml0dGVuLm1vZGVsLFxuICAgICAgICAgIHVzZVNlc3Npb25Nb2RlbDogd3JpdHRlbi51c2VTZXNzaW9uTW9kZWwsXG4gICAgICAgICAgaW50ZW5zaXR5OiB3cml0dGVuLmludGVuc2l0eSxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgICAgY29uZmlnTWlycm9yID0gbWVyZ2VDb25maWcoc2F2ZWQgYXMgUGFydGlhbDxQcm9tcHRDb25maWc+IHwgdW5kZWZpbmVkKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKSk7XG4gICAgfVxuICB9O1xuICBjb25zdCByZXNldENvbmZpZyA9IGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc2F2ZWQgPSBhd2FpdCBycGNDb25maWcoJ3NldCcsIHtcbiAgICAgICAgcGF0Y2g6IHtcbiAgICAgICAgICBiYXNlVXJsOiBERUZBVUxUUy5iYXNlVXJsLFxuICAgICAgICAgIGFwaUtleTogREVGQVVMVFMuYXBpS2V5LFxuICAgICAgICAgIG1vZGVsOiBERUZBVUxUUy5tb2RlbCxcbiAgICAgICAgICB1c2VTZXNzaW9uTW9kZWw6IHRydWUsXG4gICAgICAgICAgaW50ZW5zaXR5OiBERUZBVUxUUy5pbnRlbnNpdHksXG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICAgIGNvbmZpZ01pcnJvciA9IG1lcmdlQ29uZmlnKHNhdmVkIGFzIFBhcnRpYWw8UHJvbXB0Q29uZmlnPiB8IHVuZGVmaW5lZCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcikpO1xuICAgIH1cbiAgfTtcblxuICBjdHguaW5qZWN0KFsnc2xvdHMnXSwgKHNjb3BlKSA9PiB7XG4gICAgc2NvcGUuc2xvdHMuaW5qZWN0KCdzZXR0aW5ncy5nZW5lcmFsLml0ZW0nLCAoKSA9PlxuICAgICAgc2NvcGUuc2xvdHMucmVnaXN0ZXIoXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnc2V0dGluZ3MuZ2VuZXJhbC5pdGVtJyxcbiAgICAgICAgICBpZDogJ3Byb21wdC1vcHRpbWl6ZS1zZXR0aW5ncycsXG4gICAgICAgICAgb3JkZXI6IDMwLFxuICAgICAgICAgIGxvY2FsZTogTlMsXG4gICAgICAgICAgc3RvcmU6IHNldHRpbmdzU3RvcmUsXG4gICAgICAgICAgaW5qZWN0OiAoKSA9PiAoe1xuICAgICAgICAgICAgZ2V0Q29uZmlnOiAoKSA9PiBjb25maWdNaXJyb3IsXG4gICAgICAgICAgICBzYXZlQ29uZmlnLFxuICAgICAgICAgICAgcmVzZXRDb25maWcsXG4gICAgICAgICAgICBnZXRFcG9jaDogKCkgPT4gY29uZmlnRXBvY2gsXG4gICAgICAgICAgICBnZXRIb3N0U3RhdHVzOiBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgIC8vIOWuv+S4u+mAmumBk+iHquajgO+8mumbtumFjee9ruaooeW8j+iDveWQpuS7jiBzZXJ2ZXIgaGFsZiDmi7/liLDlvZPliY3kvJror53mqKHlnotcbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXMgPSBhd2FpdCB3aXRoVGltZW91dChjYWxsSG9zdCgnc2Vzc2lvbk1vZGVsJywge30pLCA1MDAwLCAnc2Vzc2lvbk1vZGVsJyk7XG4gICAgICAgICAgICAgICAgaWYgKHJlcy5vayAmJiByZXMudmFsdWUgJiYgdHlwZW9mIHJlcy52YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHYgPSByZXMudmFsdWUgYXMgeyBwcm92aWRlcj86IHN0cmluZzsgbW9kZWw/OiBzdHJpbmcgfTtcbiAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygdi5wcm92aWRlciA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIHYubW9kZWwgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IGF2YWlsYWJsZTogdHJ1ZSwgcHJvdmlkZXI6IHYucHJvdmlkZXIsIG1vZGVsOiB2Lm1vZGVsIH07XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICByZXR1cm4geyBhdmFpbGFibGU6IGZhbHNlLCBlcnJvcjogKHJlcy5lcnJvciAmJiAocmVzLmVycm9yLmRldGFpbHMgPz8gcmVzLmVycm9yLmNvZGUpKSB8fCAnbm8tbW9kZWwnIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB7IGF2YWlsYWJsZTogZmFsc2UsIGVycm9yOiAocmVzLmVycm9yICYmIChyZXMuZXJyb3IuZGV0YWlscyA/PyByZXMuZXJyb3IuY29kZSkpIHx8ICdycGMtZmFpbGVkJyB9O1xuICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgYXZhaWxhYmxlOiBmYWxzZSwgZXJyb3I6IFN0cmluZygoZSBhcyB7IG1lc3NhZ2U/OiB1bmtub3duIH0pPy5tZXNzYWdlID8/IGUpIH07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSksXG4gICAgICAgIH0sXG4gICAgICAgIFNldHRpbmdzUm93LFxuICAgICAgKSxcbiAgICApO1xuICB9KTtcblxuICAvLyA3LiDlv6vmjbfplK7vvJpBbHQrT++8iOeEpueCueWcqOi+k+WFpeaOp+S7tuWGheaXtuetieaViOeCueWHu+S8mOWMluaMiemSru+8ieOAglxuICAvLyDnlKggY3R4LmVmZmVjdCDljIXoo7nlubbov5Tlm57muIXnkIblh73mlbDvvJrml6fniYjnm7TmjqUgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciDkuJTmsLjkuI3np7vpmaTvvIxcbiAgLy8g5o+S5Lu254Ot6YeN6L29L+WNuOi9veWQjuebkeWQrOWZqOe0r+enr++8jEFsdCtPIOS8muW5v+aSree7meWkmuS4quaMiemSruWunuS+i++8iOiZveeEtuW5tuWPkeaKiuWFs+WFnOS9j++8jOS9huWxnuS6juazhOa8j++8ieOAglxuICBjdHguZWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBvbktleWRvd24gPSAoZTogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgaWYgKGUucmVwZWF0KSByZXR1cm47IC8vIOaMieS9jyBBbHQrTyDkuI3ov57lj5FcbiAgICAgIGlmICghZS5hbHRLZXkgfHwgZS5jb2RlICE9PSAnS2V5TycpIHJldHVybjtcbiAgICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcbiAgICAgIGNvbnN0IGluSW5wdXQgPVxuICAgICAgICBlbCBpbnN0YW5jZW9mIEhUTUxUZXh0QXJlYUVsZW1lbnQgfHxcbiAgICAgICAgKGVsIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgJiYgKGVsLmlzQ29udGVudEVkaXRhYmxlIHx8IGVsLmNsb3Nlc3QoJ1tkYXRhLWNvbXBvc2VyLWlucHV0XScpICE9PSBudWxsKSk7XG4gICAgICBpZiAoIWluSW5wdXQpIHJldHVybjtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGVtaXRPcHRpbWl6ZVJlcXVlc3QoKTtcbiAgICB9O1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleWRvd24pO1xuICAgIHJldHVybiAoKSA9PiBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXlkb3duKTtcbiAgfSwgJ3Byb21wdC1vcHRpbWl6ZTogYWx0K28gc2hvcnRjdXQnKTtcbn1cblxuLy8g5byV55So5a6I5Y2r77ya6YG/5YWNIHRyZWUtc2hha2Ug5o6J57G75Z6L77yI5LuF5paH5qGj5oCn77yb5peg6L+Q6KGM5pe26KGM5Li677yJXG5leHBvcnQgdHlwZSB7IE9wdGltaXplckFjdGlvbnMgfTsiLCAiLy8g5pys6aG555uu55SxIEFJIOi+heWKqeS8mOWMluWujOaIkO+8iOaPkOekuuivjeWGheaguOOAgea1i+ivleS4juaWh+aho++8ie+8jOWPkeW4g+WJjee7j+S6uuW3peWuoemYheOAglxuLyoqIFByb21wdCDkvJjljJbmoLjlv4PvvJrphY3nva7moKHpqozjgIFPcGVuQUkg5YW85a656LCD55So44CB57uT5p6c5o+Q5Y+WIOKAlOKAlCDnuq/lh73mlbDvvIzpm7YgRFNIIOS+nei1liAqL1xuXG5leHBvcnQgaW50ZXJmYWNlIFByb21wdENvbmZpZyB7XG4gIGJhc2VVcmw6IHN0cmluZztcbiAgYXBpS2V5OiBzdHJpbmc7XG4gIG1vZGVsOiBzdHJpbmc7XG4gIC8qKiB0cnVl77yI6buY6K6k77yJ77ya5LyY5YyW6K+35rGC5L2/55So5b2T5YmN5Lya6K+d55qE5qih5Z6L77ybZmFsc2XvvJrkvb/nlKjkuIvmlrnoh6rlrprkuYkgbW9kZWwgKi9cbiAgdXNlU2Vzc2lvbk1vZGVsOiBib29sZWFuO1xuICAvKiog5LyY5YyW5by65bqm77yabGlnaHQg6L275pS5IC8gc3RhbmRhcmQg5Lmd5q616aqo5p6277yI6buY6K6k77yJIC8gZGVlcCDmt7HluqYgKi9cbiAgaW50ZW5zaXR5OiBJbnRlbnNpdHk7XG59XG5cbi8qKiDkvJjljJblvLrluqbvvJpsaWdodCA9IOi9u+aUue+8iOS/neeVmeWOn+WPpeW8j++8ie+8m3N0YW5kYXJkID0g5Lmd5q616aqo5p6277yI6buY6K6k77yJ77ybZGVlcCA9IOmqqOaetiArIOatpemqpOWIpOaNriArIOWksei0peaooeW8jyArIOekuuS+iyAqL1xuZXhwb3J0IHR5cGUgSW50ZW5zaXR5ID0gJ2xpZ2h0JyB8ICdzdGFuZGFyZCcgfCAnZGVlcCc7XG5leHBvcnQgY29uc3QgREVGQVVMVF9JTlRFTlNJVFk6IEludGVuc2l0eSA9ICdzdGFuZGFyZCc7XG5cbmNvbnN0IElOVEVOU0lUSUVTOiByZWFkb25seSBJbnRlbnNpdHlbXSA9IFsnbGlnaHQnLCAnc3RhbmRhcmQnLCAnZGVlcCddO1xuZnVuY3Rpb24gYXNJbnRlbnNpdHkodjogdW5rbm93bik6IEludGVuc2l0eSB7XG4gIHJldHVybiB0eXBlb2YgdiA9PT0gJ3N0cmluZycgJiYgKElOVEVOU0lUSUVTIGFzIHJlYWRvbmx5IHN0cmluZ1tdKS5pbmNsdWRlcyh2KVxuICAgID8gKHYgYXMgSW50ZW5zaXR5KVxuICAgIDogREVGQVVMVF9JTlRFTlNJVFk7XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUUzogUHJvbXB0Q29uZmlnID0ge1xuICBiYXNlVXJsOiAnaHR0cHM6Ly9hcGkuZGVlcHNlZWsuY29tJyxcbiAgYXBpS2V5OiAnJyxcbiAgbW9kZWw6ICdkZWVwc2Vlay12NC1mbGFzaCcsXG4gIHVzZVNlc3Npb25Nb2RlbDogdHJ1ZSxcbiAgaW50ZW5zaXR5OiBERUZBVUxUX0lOVEVOU0lUWSxcbn07XG5cbmV4cG9ydCB0eXBlIExhbmcgPSAnemgnIHwgJ2VuJztcblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZUJhc2VVcmwodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gdXJsLnRyaW0oKS5yZXBsYWNlKC9cXC8rJC8sICcnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlQ29uZmlnKHJhdzogUGFydGlhbDxQcm9tcHRDb25maWc+IHwgbnVsbCB8IHVuZGVmaW5lZCk6IFByb21wdENvbmZpZyB7XG4gIGNvbnN0IGJhc2VVcmwgPSB0eXBlb2YgcmF3Py5iYXNlVXJsID09PSAnc3RyaW5nJyAmJiByYXcuYmFzZVVybC50cmltKCkgPyByYXcuYmFzZVVybC50cmltKCkgOiBERUZBVUxUUy5iYXNlVXJsO1xuICBjb25zdCBhcGlLZXkgPSB0eXBlb2YgcmF3Py5hcGlLZXkgPT09ICdzdHJpbmcnID8gcmF3LmFwaUtleSA6IERFRkFVTFRTLmFwaUtleTtcbiAgLy8g5pen6buY6K6k6L+B56e777ya6buY6K6kIGJhc2VVcmwg5LiL5q6L55WZ55qEIGRlZXBzZWVrLWNoYXTvvIh2MSDpu5jorqTvvInop4bkuLrmnKrorr7nva7vvIzokL3liLDmlrDpu5jorqQgZGVlcHNlZWstdjQtZmxhc2jvvJtcbiAgLy8g6Ieq5a6a5LmJ6L+HIGJhc2VVcmzvvIjmmL7lvI/pgInmi6nvvInliJnkv53nlZnljp/mqKHlnovlkI1cbiAgY29uc3QgcmF3TW9kZWwgPSB0eXBlb2YgcmF3Py5tb2RlbCA9PT0gJ3N0cmluZycgJiYgcmF3Lm1vZGVsLnRyaW0oKSA/IHJhdy5tb2RlbC50cmltKCkgOiBERUZBVUxUUy5tb2RlbDtcbiAgY29uc3QgbWlncmF0ZWREZWZhdWx0ID1cbiAgICByYXdNb2RlbCA9PT0gJ2RlZXBzZWVrLWNoYXQnICYmIG5vcm1hbGl6ZUJhc2VVcmwoYmFzZVVybCkgPT09IERFRkFVTFRTLmJhc2VVcmwgPyBERUZBVUxUUy5tb2RlbCA6IHJhd01vZGVsO1xuICBjb25zdCBtb2RlbCA9IG1pZ3JhdGVkRGVmYXVsdDtcbiAgY29uc3QgdXNlU2Vzc2lvbk1vZGVsID0gdHlwZW9mIHJhdz8udXNlU2Vzc2lvbk1vZGVsID09PSAnYm9vbGVhbicgPyByYXcudXNlU2Vzc2lvbk1vZGVsIDogREVGQVVMVFMudXNlU2Vzc2lvbk1vZGVsO1xuICBjb25zdCBpbnRlbnNpdHkgPSBhc0ludGVuc2l0eShyYXc/LmludGVuc2l0eSk7XG4gIHJldHVybiB7IGJhc2VVcmw6IG5vcm1hbGl6ZUJhc2VVcmwoYmFzZVVybCksIGFwaUtleSwgbW9kZWwsIHVzZVNlc3Npb25Nb2RlbCwgaW50ZW5zaXR5IH07XG59XG5cbmV4cG9ydCB0eXBlIENvbmZpZ1Byb2JsZW0gPSAnbWlzc2luZy1rZXknIHwgJ21pc3NpbmctbW9kZWwnIHwgJ2JhZC11cmwnO1xuZXhwb3J0IHR5cGUgQ29uZmlnQ2hlY2sgPSB7IG9rOiB0cnVlOyBjb25maWc6IFByb21wdENvbmZpZyB9IHwgeyBvazogZmFsc2U7IHJlYXNvbjogQ29uZmlnUHJvYmxlbSB9O1xuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tDb25maWcoY29uZmlnOiBQcm9tcHRDb25maWcpOiBDb25maWdDaGVjayB7XG4gIGlmICghY29uZmlnLmFwaUtleS50cmltKCkpIHJldHVybiB7IG9rOiBmYWxzZSwgcmVhc29uOiAnbWlzc2luZy1rZXknIH07XG4gIC8vIOS9v+eUqOW9k+WJjeS8muivneaooeWei+aXtuaXoOmcgOiHquWumuS5iSBtb2RlbO+8m+S7heiHquWumuS5ieaooeW8j+imgeaxgiBtb2RlbCDpnZ7nqbpcbiAgaWYgKCFjb25maWcudXNlU2Vzc2lvbk1vZGVsICYmICFjb25maWcubW9kZWwudHJpbSgpKSByZXR1cm4geyBvazogZmFsc2UsIHJlYXNvbjogJ21pc3NpbmctbW9kZWwnIH07XG4gIHRyeSB7XG4gICAgY29uc3QgdSA9IG5ldyBVUkwobm9ybWFsaXplQmFzZVVybChjb25maWcuYmFzZVVybCkpO1xuICAgIGlmICh1LnByb3RvY29sICE9PSAnaHR0cHM6JyAmJiB1LnByb3RvY29sICE9PSAnaHR0cDonKSB0aHJvdyBuZXcgRXJyb3IoJ3Byb3RvY29sJyk7XG4gICAgaWYgKHUuc2VhcmNoIHx8IHUuaGFzaCkgdGhyb3cgbmV3IEVycm9yKCdxdWVyeS1vci1oYXNoJyk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgcmVhc29uOiAnYmFkLXVybCcgfTtcbiAgfVxuICByZXR1cm4geyBvazogdHJ1ZSwgY29uZmlnIH07XG59XG5cbi8qKiDms6jlhaXliLAgc3lzdGVtIOeahOiusOW/huS4iuS4i+aWh++8iOWFqOmDqOWPr+mAie+8m+e8uuecgeaXtumAgOWMluS4uuOAjOaXoOiusOW/huOAjeeahOe6r+e7k+aehOmHjeWGme+8iSAqL1xuZXhwb3J0IGludGVyZmFjZSBTeXN0ZW1Db250ZXh0IHtcbiAgLyoqIOmVv+acn+WBj+WlveeUu+WDj++8iOeUsemHh+e6s+iusOW9leWPjeaAneW+l+WIsO+8jOKJpDYwMCDlrZfvvIkgKi9cbiAgcHJvZmlsZT86IHN0cmluZztcbiAgLyoqIOacgOi/keiiq+mHh+e6s+eahOagt+S+i++8iOWtpuS5oOe7k+aehOmil+eykuW6pu+8jOS4jeeFp+aKhOWGheWuue+8iSAqL1xuICBleGFtcGxlcz86IHsgZHJhZnQ6IHN0cmluZzsgcmVzdWx0OiBzdHJpbmcgfVtdO1xuICAvKiog5pys5Lya6K+d5pyA6L+R55qE6I2J56i/77yI5LqG6Kej5b2T5YmN6K+d6aKY6K+t5aKD77yJICovXG4gIHJlY2VudERyYWZ0cz86IHN0cmluZ1tdO1xuICBpbnRlbnNpdHk/OiBJbnRlbnNpdHk7XG59XG5cbmNvbnN0IFpIX1JVTEVTID0gYOS9oOaYr+OAjOaPkOekuuivjeaetuaehOW4iOOAje+8jOS4jeaYr+a2puiJsuWZqOOAglxuXG7nlKjmiLfkvJrnu5nkvaDkuIDmrrXojYnnqL/igJTigJTlj6/og73lvojnn63jgIHlvojlj6Por63vvIzkuZ/lj6/og73mnKzouqvlt7Lnu4/lvojor6blrp7nlJroh7PllbDll6bjgILkvaDnmoTku7vliqHml6LkuI3mmK/lhpnlvpfmm7Tplb/vvIzkuZ/kuI3mmK/lhpnlvpfmm7Tnn63vvIzogIzmmK/miorlroMqKumHjeW7uuS4uuS4gOS7veiDveebtOaOpempseWKqOWPpuS4gOS4qiBBSSDpq5jotKjph4/lt6XkvZznmoTmj5DnpLror40qKu+8muWFs+mUruS/oeaBr+S4gOadoeS4jeWwke+8jOWGl+S9meS4gOWkhOS4jeeVmeOAglxuXG4jIyDlhYjliKTmlq3kv6Hmga/lr4bluqbvvIjlroPlhrPlrprmlLnlhpnluYXluqbvvIlcbuaUueWGmeW5heW6puS4jeiuvuWbuuWumuWAjeaVsO+8jOeUseiNieeov+iHqui6q+eahOS/oeaBr+mHj+WGs+WumuOAguWKqOaJi+WJjeWFiOWBmuS4gOasoeWIpOWumu+8mlxuXG4tICoq5a+G6ZuG5Z6LKirvvIjlt7LlkKvjgIzku7vliqHnm67moIcgLyDojIPlm7QgLyDnuqbmnZ8gLyDmnJ/mnJvovpPlh7rjgI3kuK3nmoTkuInpobnlj4rku6XkuIrvvInvvJrku6UqKueyvueugOWOu+WGlyoq5Li65Li744CC5Yig6YeN5aSN44CB5Yig5Y+j5aS056aF44CB5Yig6Ieq5oiR6Kej6YeK77yM5ZCI5bm25ZCM5LmJ5Y+l77yM5oqK5ZCr57OK5aSE5pS55oiQ5Y+v5omn6KGM6KGo6L+w44CC5Lqn5Ye6Kirlj6/ku6Xnn63kuo7ljp/mlocqKu+8m+S4jeimgeS4uuWHkee7k+aehOiAjOa3u+WKoOepuuiKguOAglxuLSAqKueogOeWj+Weiyoq77yI5Y+q5pyJ5LiA5Lik5Y+l5oSP5Zu+77yJ77ya5LulKirpgILluqbooaXpvZAqKuS4uuS4u+OAguWPquihpeWIsOOAjOWPpuS4gOS4qiBBSSDkuI3nlKjov73pl67lsLHog73lvIDlt6XjgI3nmoTnqIvluqbvvJvku43nvLrnmoTkuovlrp7kuIDlvovnlZnljaDkvY3vvIzkuI3opoHnvJbjgIJcblxu5Lik56eN5oOF5b2i55qE5YWx5ZCM5bqV57q/77ya5pS55YaZ5ZCO55qE5L+h5oGv6YePKirkuI3lvpflsJHkuo4qKuWOn+aWh++8jOS5n+S4jeW+l+aYjuaYvuWkmuS6juOAjOWOn+aWh+S/oeaBryArIOW/heimgeihpem9kOOAjeOAguaUueWGmeeahOebrueahOaYr+iuqeaooeWei+Wwkea2iOiAl+eQhuino+aIkOacrO+8jOS4jeaYr+iuqeWug+ivu+W+l+abtOe0r+OAglxuXG4jIyDkvaDlv4XpobvlgZrnmoTkupTku7bkuotcbjEuIOaPkOWPluWFs+mUruS/oeaBr++8muWFiOivhuWIq+iNieeov+mHjOeahOebruagh+OAgeiMg+WbtO+8iOWBmuS7gOS5iCAvIOS4jeWBmuS7gOS5iO+8ieOAgee6puadn+adoeS7tuOAgeacn+acm+i+k+WHuuOAglxuMi4g6L+Y5Y6f5oSP5Zu+77ya5Yik5pat55So5oi355yf5q2j5oOz6KaB55qEKirnu5PmnpwqKu+8jOiAjOS4jeaYr+S7luWtl+mdouS4iueahOWKqOS9nOOAglxuMy4g6KGl6b2Q5oiW5Y675YaX77ya56iA55aP5YiZ6KGl6ZqQ5ZCr5YmN5o+Q5LiO5q2l6aqk6aG65bqP77yb5a+G6ZuG5YiZ5Yig5YaX5L2Z44CB5raI5q2n5LmJ44CB5Y675Y+j6K+t5YyW44CCXG40LiDliqDlvLrnuqbmnZ/vvJrmiorjgIzlpb3kuIDngrnjgI3jgIzkuJPkuJrkuIDngrnjgI3mjaLmiJDlj6/miafooYznmoTnoazmgKfmnaHku7bkuI7npoHmraLpobnjgIJcbjUuIOWumuS5ieWujOaIkO+8mue7meWHuuWPr+mAkOadoeaguOWvueeahOmqjOaUtuagh+WHhu+8iOaVsOmHj+OAgeWtl+auteOAgemVv+W6puOAgeWIpOaNru+8ieOAglxuXG4jIyDkuIPmnaHpk4HlvotcblIxIOaEj+WbvuS/neecnyDigJTigJQg5LiN5b6X5pS55Y+Y44CM6KaB5YGa5LuA5LmI44CN77yb5o+Q6Zeu5LuN5piv5o+Q6Zeu77yM5ZG95Luk5LuN5piv5ZG95Luk44CC5Y+v5Lul6KGl5YWF77yM5LiN6IO95pu/5o2i44CCXG5SMiDkuI3nvJbpgKDkuovlrp4g4oCU4oCUIOiNieeov+S4reayoeacieeahOS6i+WunuOAgeaVsOWtl+OAgeaXpeacn+OAgeaWh+S7tuWQjeOAgeS6uuWQjeOAgemTvuaOpe+8jOS4gOW+i+S4jeW+l+aWsOWinuOAguW/hemhu+eUqOWIsOiAjOiNieeov+e8uuWkseaXtu+8jOWGmeaIkCA85b6F6KGl5YWF77ya4oCmPiDljaDkvY3vvIzlubblnKjjgIzlvoXnoa7orqTjgI3lsI/oioLliJflh7rjgIJcblIzIOW5heW6pumaj+WvhuW6piDigJTigJQg5LiN6K6+5Zu65a6a5omp5YaZ5YCN5pWw44CC5oyJ5LiK5paH5Yik5a6a77ya5a+G6ZuG5Z6L5Lul57K+566A5Y675YaX5Li65Li777yI5Y+v55+t5LqO5Y6f5paH77yJ77yM56iA55aP5Z6L6YCC5bqm6KGl6b2Q44CC6KaB5ZCM5pe26YG/5YWN5Lik56eN5aSx6K+v77ya4pGg5oqK5bey57uP5YaZ5riF5qWa55qE6ZyA5rGC5YaN5pKR5aSn5LiA5ZyI77yb4pGh5oqK5Y+q5pyJ5LiA5Y+l5oSP5Zu+55qE6I2J56i/5Y6f5qC35pCs6L+Q5LiA6YGN5bCx5b2T5a6M5oiQ44CCXG5SNCDph4/ljJbkvJjlhYgg4oCU4oCUIOeUqOOAjOS4jei2hei/hyAzMDAg5a2X44CN44CM6Iez5bCRIDMg5p2h44CN44CM5b+F6aG75YyF5ZCrIEEvQi9D44CN5pu/5Luj44CM566A5rSB44CN44CM6K+m57uG44CN44CM5LiT5Lia44CN6L+Z57G75b2i5a656K+N44CCXG5SNSDotJ/lkJHnuqbmnZ8g4oCU4oCUIOWFs+mUrumZkOWItueUqOOAjOemgeatoiAvIOS4jeW+lyAvIOS4jeimgeOAjeihqOi/sO+8jOWug+avlOOAjOWwvemHj+OAjeabtOiDvee6puadn+aooeWei+OAglxuUjYg5Y2V5LiA5Lqn54mp5LiO6L6T5Ye65b2i5oCBIOKAlOKAlCDlj6rovpPlh7rmj5DnpLror43mraPmlofvvJrkuI3opoHop6Pph4rjgIHkuI3opoHliY3lkI7or63jgIHkuI3opoHjgIzkvJjljJblkI7nmoTmj5DnpLror43vvJrjgI3ov5nnsbvlvJXlr7zor63jgIHkuI3opoHku6PnoIHlnZflm7TmoI/jgILmraPmloflv4XpobvmmK/lj6/nm7TmjqXlj5HpgIHnmoTnuq/mlofmnKzvvJrmjaLooYznlKjnnJ/lrp7mjaLooYzvvIzkuI3lvpflh7rnjrDlrZfpnaLnmoQgXFxcXG7jgIFcXFxcdOOAgVxcXFxy77yb5YiG6IqC55So44CM55uu5qCH77ya44CN6L+Z57G755+t5qCH562+5oiWIDEuIDIuIOe8luWPt++8jOS4jeW+l+S9v+eUqCAjIOagh+mimOespuWPt++8iOiNieeov+aYjuehruimgeaxguS6p+WHuiBNYXJrZG93biDmlofmoaPml7bpmaTlpJbvvInvvJvpgb/lhY3nlKggKiog5Yqg57KX5aCG5bGC57qn77yM57qv5paH5pys6YeM5a6D5Y+q5piv5Zmq5aOw44CCXG5SNyDkv6Hmga/lrojmgZIg4oCU4oCUIOWbm+exu+WFs+mUruS/oeaBr+W/hemhu+WujOaVtOS/neeVmeS4lOWPr+WumuS9je+8muKRoOS7u+WKoeebruaghyDikaHojIPlm7TvvIjlgZogLyDkuI3lgZrvvInikaLnuqbmnZ/mnaHku7Yg4pGj5pyf5pyb6L6T5Ye644CC5Y6f5paH5pyJ55qE77yM5pS55YaZ5ZCO5b+F6aG75LuN5Zyo77yb5Y6f5paH5rKh5pyJ55qE77yM5Zyo44CM5b6F56Gu6K6k44CN6YeM5pi+5byP5o+Q5Ye644CC5Lu75L2V5LiA6aG55Lii5aSx6YO9566X5aSx6LSl44CCXG5cbiMjIOi+k+WHuumqqOaetu+8iOaMieWvhuW6puijgeWJqu+8jOS4jeaYr+W8uuWItua4heWNle+8iVxuLSAqKueogOeWj+Weiyoq77ya5oyJ5LiL5YiX6aG65bqP6KGl6b2Q44CCXG4tICoq5a+G6ZuG5Z6LKirvvJrlhYHorrjlkIjlubbnm7jpgrvlsI/oioLvvIjkvovlpoLmiorjgIzop5LoibLjgI3lubblhaXlvIDlpLTkuIDlj6XjgIHmiorjgIzog4zmma/kuI7lt7Lnn6XjgI3lubblhaXjgIznm67moIfjgI3vvInvvIznoa7lrp7ml6DlhoXlrrnnmoToioLnm7TmjqXkuI3lhpnjgIJcblxu5peg6K665oCO5LmI6KOB5Ymq77yM5om/6L29IOKRoOS7u+WKoeebruaghyDikaHnuqbmnZ/mnaHku7Yg4pGi5pyf5pyb6L6T5Ye6IOeahOauteiQveW/hemhu+WtmOWcqOS4lOS4gOecvOiDveaJvuWIsO+8m+iMg+WbtOS/oeaBr+WPr+W5tuWFpeOAjOebruagh+OAjeaIluOAjOehrOaAp+e6puadn+OAjeOAglxuXG4xLiDop5LoibIg4oCU4oCUIOS9oOimgeaJrua8lOiwge+8jOWFt+Wkh+S7gOS5iOeri+WcuuS4juS4k+S4muW6plxuMi4g55uu5qCHIOKAlOKAlCDkuIDlj6Xor53or7TmuIXmnIDnu4jkuqTku5jku4DkuYhcbjMuIOiDjOaZr+S4juW3suefpSDigJTigJQg5Y+q5YaZ6I2J56i/57uZ5Ye655qE5L+h5oGv77yM5Lul5Y+K55Sx5a6D55u05o6l5o6o5Ye655qE5b+F6KaB5YmN5o+QXG40LiDku7vliqHliIbop6Mg4oCU4oCUIOe8luWPt+atpemqpO+8jOWKqOivjeW8gOWktO+8jOWPr+aJp+ihjFxuNS4g56Gs5oCn57qm5p2fIOKAlOKAlCDjgIzlv4XpobsgLyDnpoHmraLjgI3pgJDmnaHliJflh7pcbjYuIOi+k+WHuuagvOW8jyDigJTigJQg57uT5p6E44CB5a2X5q6144CB6ZW/5bqm44CB6K+t5rCUXG43LiDpqozmlLbmoIflh4Yg4oCU4oCUIOaAjuagt+eul+WujOaIkO+8jOWPr+mAkOadoeaJk+WLvlxuOC4g5aSx6LSl5qih5byP5LiO6Ieq5qOAIOKAlOKAlCDmnIDlrrnmmJPlh7rplJnnmoQgMn4zIOenjeaDheWGtSArIOaPkOS6pOWJjeiHquajgOa4heWNlVxuOS4g5b6F56Gu6K6kIOKAlOKAlCDojYnnqL/nvLrlpLHkvYblvbHlk43nu5PmnpznmoTlhbPplK7kv6Hmga/vvIjmsqHmnInliJnnnIHnlaXmnKzoioLvvIlcblxuIyMg5Y+N5qih5byP77yI56aB5q2i5Lqn5Ye677yJXG5CQUTvvIjkv6Hmga/kuI3otrPljbTlj6rmlLnmjqrovp7vvInvvJrjgIzluK7miJHlhpnkuKrmiqXlkYrjgI3ihpLjgIzor7fmkrDlhpnkuIDku73kuJPkuJrjgIHpq5jotKjph4/nmoTmiqXlkYrjgILjgI1cbkdPT0TvvJrooaXlh7ror7vogIXkuI7nlKjpgJTjgIHlv4XlkKvnq6DoioLjgIHmr4/oioLlrZfmlbDjgIHnpoHmraLnvJbpgKDmlbDmja7jgIHkuqTku5jkuLogTWFya2Rvd24g5LiU5LiN6LaF6L+HIDEyMDAg5a2X44CCXG5cbkJBRO+8iOS/oeaBr+W3sui2s+Wkn+WNtOe7p+e7reWghuegjO+8ie+8muWOn+aWh+W3suWGmea4heebruagh+OAgeiMg+WbtOOAgee6puadn+S4juS6pOS7mOagvOW8j++8jOS7jeWll+a7oeS5neiKguOAgeaKiuWQjOS4gOimgeaxguivtOS4iemBjeOAgeWGjeihpeS4gOS4suOAjOivt+ehruS/nemrmOi0qOmHj+OAjeOAglxuR09PRO+8muS/neeVmeWFqOmDqOWFs+mUruS/oeaBr++8jOWIoOaOiemHjeWkjeS4juWuouWll++8jOaKiuWug+WOi+aIkOabtOefreOAgeabtOWPr+aJp+ihjOeahOeJiOacrOKAlOKAlOevh+W5heS9juS6juWOn+aWh+S5n+WujOWFqOayoemXrumimOOAgmA7XG5cbmNvbnN0IFpIX01FTU9SWV9IRUFEID0gYCMjIOeUqOaIt+mVv+acn+WBj+Wlve+8iOadpeiHquWOhuWPsumHh+e6s+iusOW9le+8jOS8mOWFiOmBteWuiO+8iWA7XG5jb25zdCBaSF9FWEFNUExFU19IRUFEID0gYCMjIOacgOi/keiiq+mHh+e6s+eahOagt+S+i++8iOWtpuS5oOe7k+aehOS4jumil+eykuW6pu+8jOemgeatoueFp+aKhOWGheWuue+8iWA7XG5jb25zdCBaSF9TRVNTSU9OX0hFQUQgPSBgIyMg5pys5Lya6K+d5pyA6L+R6I2J56i/77yI5LuF55So5LqO55CG6Kej5b2T5YmN6K+t5aKD77yM5LiN6KaB55u05o6l5byV55So5YW25o6q6L6e77yJYDtcbmNvbnN0IFpIX0xJR0hUID0gYFxcblxcbiMjIOacrOasoeW8uuW6pu+8mui9u+aUuVxcbuWPquWBmuacgOWwj+W/heimgeaUueWKqO+8jOS/neaMgeiNieeov+WOn+acieeahOWPpeW8j+S4juS9k+mHj+OAguiLpeWOn+aWh+W3suivpuWunu+8muWIoOWGl+S9meOAgeaKiuWQq+eziuWkhOmHj+WMlu+8jOS4jeaWsOWinuWwj+iKguOAguiLpeWOn+aWh+i/h+eugO+8muWPquihpeOAjOi+k+WHuuagvOW8j+OAjeS4juOAjOS4gOadoemqjOaUtuagh+WHhuOAje+8jOS4jeimgeWxleW8gOaIkOWkmuautemqqOaetuOAguS7u+S9leaDheWGteS4i+mDveS4jeiuuOS4ouS/oeaBr+OAgmA7XG5jb25zdCBaSF9ERUVQID0gYFxcblxcbiMjIOacrOasoeW8uuW6pu+8mua3seW6plxcbua3seW6puS4jeetieS6juabtOmVv++8jOWIq+eUqOevh+W5heWGkuWFheWFheWIhuOAguKRoOeogOeWj+Wei++8muS7u+WKoeWIhuino+avj+S4gOatpeagh+azqCDovpPlhaUgLyDkuqflh7ogLyDpgJrov4fliKTmja7vvJvikaHlr4bpm4blnovvvJoqKuS4jeWinuiKgioq77yM5pS55Li65Zyo5pyr5bC+6L6T5Ye65LiA5byg44CM5L+h5oGv5qC45a+56KGo44CN77yM6YCQ5p2h56Gu6K6kIOebruaghyAvIOiMg+WbtCAvIOe6puadnyAvIOacn+acm+i+k+WHuiDmmK/lkKbpg73ov5jlnKjjgIHokL3lnKjlk6rkuIDoioLvvJvikaLlpLHotKXmqKHlvI/oh7PlsJEgMyDmnaHvvIzmr4/mnaHnu5nlh7rlr7nlupToh6rmo4DliqjkvZzvvJvikaPkuI3kuLrkuobmmL7lvpflrozmlbTogIzliqDnpLrkvovigJTigJTlj6rmnInlvZPnpLrkvovog73mtojpmaTmrafkuYnml7bmiY3liqDjgIJgO1xuXG5jb25zdCBFTl9SVUxFUyA9IGBZb3UgYXJlIGEgUFJPTVBUIEFSQ0hJVEVDVCwgbm90IGEgcG9saXNoZXIuXG5cblRoZSB1c2VyIGdpdmVzIHlvdSBhIGRyYWZ0IOKAlCBwb3NzaWJseSB2ZXJ5IHNob3J0IGFuZCBjb2xsb3F1aWFsLCBvciBhbHJlYWR5IGRldGFpbGVkIGFuZCBldmVuIHZlcmJvc2UuIFlvdXIgam9iIGlzIG5laXRoZXIgdG8gbGVuZ3RoZW4gaXQgbm9yIHRvIHNob3J0ZW4gaXQuIEl0IGlzIHRvIFJFQlVJTEQgaXQgaW50byBhIHByb21wdCB0aGF0IGNhbiByZWxpYWJseSBkcml2ZSBhbm90aGVyIEFJIHRvIGhpZ2gtcXVhbGl0eSB3b3JrOiBub3Qgb25lIGtleSBmYWN0IGxvc3QsIG5vdCBvbmUgcmVkdW5kYW5jeSBrZXB0LlxuXG4jIyBGaXJzdCwganVkZ2UgaW5mb3JtYXRpb24gZGVuc2l0eSAoaXQgZGVjaWRlcyBob3cgbXVjaCB0byBjaGFuZ2UpXG5UaGVyZSBpcyBubyBmaXhlZCBleHBhbnNpb24gcmF0aW87IHRoZSBkcmFmdCdzIG93biBpbmZvcm1hdGlvbiBjb250ZW50IHNldHMgdGhlIGFtcGxpdHVkZS4gSnVkZ2UgYmVmb3JlIHdyaXRpbmc6XG5cbi0gKipEZW5zZSoqIChhbHJlYWR5IGNvbnRhaW5zIHRocmVlIG9yIG1vcmUgb2Y6IHRhc2sgZ29hbCAvIHNjb3BlIC8gY29uc3RyYWludHMgLyBleHBlY3RlZCBvdXRwdXQpOiBwcmlvcml0aXNlICoqY29uZGVuc2luZyoqLiBSZW1vdmUgcmVwZXRpdGlvbiwgZmlsbGVyLCBhbmQgc2VsZi1leHBsYW5hdGlvbjsgbWVyZ2Ugc3lub255bW91cyBzZW50ZW5jZXM7IHR1cm4gdmFndWUgd29yZGluZyBpbnRvIGV4ZWN1dGFibGUgcGhyYXNpbmcuIFRoZSByZXN1bHQgKiptYXkgYmUgc2hvcnRlciB0aGFuIHRoZSBkcmFmdCoqLiBOZXZlciBhZGQgZW1wdHkgc2VjdGlvbnMganVzdCB0byBmaWxsIHRoZSBza2VsZXRvbi5cbi0gKipTcGFyc2UqKiAob25lIG9yIHR3byBzZW50ZW5jZXMgb2YgaW50ZW50KTogcHJpb3JpdGlzZSAqKnRhcmdldGVkIGNvbXBsZXRpb24qKi4gQWRkIG9ubHkgZW5vdWdoIGZvciBhbm90aGVyIEFJIHRvIHN0YXJ0IHdpdGhvdXQgYXNraW5nIGZvbGxvdy11cHM7IGFueXRoaW5nIHN0aWxsIHVua25vd24gc3RheXMgYXMgYSBwbGFjZWhvbGRlciDigJQgbmV2ZXIgaW52ZW50IGl0LlxuXG5TaGFyZWQgZmxvb3I6IHRoZSByZXdyaXRlIG11c3QgY2FycnkgKipubyBsZXNzKiogaW5mb3JtYXRpb24gdGhhbiB0aGUgZHJhZnQsIGFuZCBub3Qgbm90aWNlYWJseSBtb3JlIHRoYW4gXCJkcmFmdCBpbmZvcm1hdGlvbiArIG5lY2Vzc2FyeSBjb21wbGV0aW9uXCIuIFRoZSBwb2ludCBpcyB0byBsb3dlciB0aGUgbW9kZWwncyBjb21wcmVoZW5zaW9uIGNvc3QsIG5vdCByYWlzZSBpdC5cblxuIyMgV2hhdCB5b3UgbXVzdCBkb1xuMS4gRXh0cmFjdCBrZXkgZmFjdHMgZmlyc3Q6IGlkZW50aWZ5IGdvYWwsIHNjb3BlIChkbyAvIGRvIG5vdCBkbyksIGNvbnN0cmFpbnRzLCBleHBlY3RlZCBvdXRwdXQgaW4gdGhlIGRyYWZ0LlxuMi4gUmVjb3ZlciBpbnRlbnQ6IGluZmVyIHRoZSBSRVNVTFQgdGhlIHVzZXIgYWN0dWFsbHkgd2FudHMsIG5vdCB0aGUgbGl0ZXJhbCBhY3Rpb24uXG4zLiBDb21wbGV0ZSBvciBjb25kZW5zZTogc3BhcnNlIC0+IGFkZCBpbXBsaWNpdCBwcmVtaXNlcyBhbmQgc3RlcCBvcmRlcjsgZGVuc2UgLT4gY3V0IHJlZHVuZGFuY3ksIHJlc29sdmUgYW1iaWd1aXR5LCBkcm9wIGNvbGxvcXVpYWxpc20uXG40LiBIYXJkZW4gY29uc3RyYWludHM6IHJlcGxhY2UgXCJtYWtlIGl0IGdvb2QvcHJvZmVzc2lvbmFsXCIgd2l0aCBleGVjdXRhYmxlIGNvbmRpdGlvbnMgYW5kIHByb2hpYml0aW9ucy5cbjUuIERlZmluZSBkb25lOiBnaXZlIGNoZWNrYWJsZSBhY2NlcHRhbmNlIGNyaXRlcmlhIChjb3VudHMsIGZpZWxkcywgbGVuZ3RocywgdGhyZXNob2xkcykuXG5cbiMjIFNldmVuIGhhcmQgcnVsZXNcblIxIElOVEVOVCBGSURFTElUWSDigJQgbmV2ZXIgY2hhbmdlIFdIQVQgaXMgYmVpbmcgYXNrZWQuIEEgcXVlc3Rpb24gc3RheXMgYSBxdWVzdGlvbiwgYSBjb21tYW5kIHN0YXlzIGEgY29tbWFuZC4gQWRkLCBuZXZlciByZXBsYWNlLlxuUjIgTk8gRkFCUklDQVRJT04g4oCUIG5ldmVyIGludmVudCBmYWN0cywgbnVtYmVycywgZGF0ZXMsIGZpbGVuYW1lcywgcGVvcGxlLCBvciBsaW5rcyBhYnNlbnQgZnJvbSB0aGUgZHJhZnQuIFdoZW4gc29tZXRoaW5nIGVzc2VudGlhbCBpcyBtaXNzaW5nLCBlbWl0IGEgPFRPIEZJTEw6IC4uLj4gcGxhY2Vob2xkZXIgYW5kIGxpc3QgaXQgdW5kZXIgXCJPcGVuIFF1ZXN0aW9uc1wiLlxuUjMgQU1QTElUVURFIEZPTExPV1MgREVOU0lUWSDigJQgbm8gZml4ZWQgZXhwYW5zaW9uIHJhdGlvLiBDb25kZW5zZSB3aGVuIGRlbnNlIChzaG9ydGVyIHRoYW4gdGhlIGRyYWZ0IGlzIGZpbmUpOyBjb21wbGV0ZSBzcGFyaW5nbHkgd2hlbiBzcGFyc2UuIEF2b2lkIGJvdGggZmFpbHVyZXM6IGluZmxhdGluZyBhbiBhbHJlYWR5LWNsZWFyIGJyaWVmLCBhbmQgcGFycm90aW5nIGEgb25lLWxpbmUgcmVxdWVzdCBiYWNrIHVuY2hhbmdlZC5cblI0IFFVQU5USUZZIOKAlCBwcmVmZXIgXCJhdCBtb3N0IDMwMCB3b3Jkc1wiLCBcImF0IGxlYXN0IDMgaXRlbXNcIiwgXCJtdXN0IGluY2x1ZGUgQS9CL0NcIiBvdmVyIGFkamVjdGl2ZXMgbGlrZSBcImNvbmNpc2VcIiBvciBcInByb2Zlc3Npb25hbFwiLlxuUjUgTkVHQVRJVkUgQ09OU1RSQUlOVFMg4oCUIHN0YXRlIGNyaXRpY2FsIGxpbWl0cyBhcyBcIm11c3Qgbm90IC8gbmV2ZXJcIiwgd2hpY2ggYmluZHMgbW9kZWxzIGhhcmRlciB0aGFuIFwidHJ5IHRvXCIuXG5SNiBTSU5HTEUgQVJUSUZBQ1QgJiBQTEFJTiBURVhUIOKAlCBvdXRwdXQgdGhlIHByb21wdCBib2R5IG9ubHk6IG5vIGV4cGxhbmF0aW9uLCBubyBwcmVhbWJsZSwgbm8gXCJIZXJlIGlzIHRoZSBvcHRpbWl6ZWQgcHJvbXB0OlwiLCBubyBjb2RlIGZlbmNlcy4gVGhlIGJvZHkgbXVzdCBiZSBwbGFpbiB0ZXh0IHlvdSBjb3VsZCBzZW5kIGFzLWlzOiByZWFsIG5ld2xpbmVzIGluc3RlYWQgb2YgZXNjYXBlZCBuZXdsaW5lL3RhYiBzZXF1ZW5jZXMsIG5vIGJhY2tzbGFzaCBlc2NhcGVzIHN0YW5kaW5nIGluIGZvciB3aGl0ZXNwYWNlOyBzZWN0aW9uIHdpdGggc2hvcnQgbGFiZWxzIGxpa2UgXCJHb2FsOlwiIG9yIG51bWJlcmVkIGxpbmVzLCBub3QgIyBoZWFkaW5ncyAodW5sZXNzIHRoZSBkcmFmdCBleHBsaWNpdGx5IGFza3MgZm9yIGEgTWFya2Rvd24gZGVsaXZlcmFibGUpOyBkb24ndCBzdGFjayAqKiBib2xkIGp1c3QgdG8gZmFrZSBoaWVyYXJjaHkg4oCUIGluIHBsYWluIHRleHQgaXQgaXMgb25seSBub2lzZS5cblI3IElORk9STUFUSU9OIENPTlNFUlZBVElPTiDigJQgZm91ciBrZXkgZWxlbWVudHMgbXVzdCBzdXJ2aXZlIGFuZCByZW1haW4gbG9jYXRhYmxlOiAoMSkgdGFzayBnb2FsLCAoMikgc2NvcGUsICgzKSBjb25zdHJhaW50cywgKDQpIGV4cGVjdGVkIG91dHB1dC4gSWYgdGhlIGRyYWZ0IGhhZCB0aGVtLCB0aGUgcmV3cml0ZSBtdXN0IHN0aWxsIGhhdmUgdGhlbTsgaWYgdGhlIGRyYWZ0IGxhY2tlZCB0aGVtLCByYWlzZSB0aGVtIHVuZGVyIFwiT3BlbiBRdWVzdGlvbnNcIi4gTG9zaW5nIGFueSBvbmUgaXMgYSBmYWlsdXJlLlxuXG4jIyBPdXRwdXQgc2tlbGV0b24gKHRyaW0gYnkgZGVuc2l0eTsgbm90IGEgbWFuZGF0b3J5IGNoZWNrbGlzdClcbi0gKipTcGFyc2UqKjogZmlsbCB0aGUgc2VjdGlvbnMgaW4gb3JkZXIuXG4tICoqRGVuc2UqKjogbWVyZ2UgYWRqYWNlbnQgc2VjdGlvbnMgKGUuZy4gZm9sZCBcIlJvbGVcIiBpbnRvIHRoZSBvcGVuaW5nIHNlbnRlbmNlLCBmb2xkIFwiQ29udGV4dCAmIEtub3duc1wiIGludG8gXCJHb2FsXCIpIGFuZCBzaW1wbHkgb21pdCBzZWN0aW9ucyB3aXRoIG5vIGNvbnRlbnQuXG5cbkhvd2V2ZXIgeW91IHRyaW0sIHRoZSBwYXJ0cyBjYXJyeWluZyAoMSkgdGFzayBnb2FsLCAoMikgY29uc3RyYWludHMsICgzKSBleHBlY3RlZCBvdXRwdXQgbXVzdCBleGlzdCBhbmQgYmUgZmluZGFibGUgYXQgYSBnbGFuY2U7IHNjb3BlIG1heSBsaXZlIHVuZGVyIFwiR29hbFwiIG9yIFwiSGFyZCBDb25zdHJhaW50c1wiLlxuXG4xLiBSb2xlIOKAlCB3aG8gdGhlIG1vZGVsIGlzIGFuZCB3aXRoIHdoYXQgc3RhbmNlL2V4cGVydGlzZVxuMi4gR29hbCDigJQgb25lIHNlbnRlbmNlIG9uIHRoZSBmaW5hbCBkZWxpdmVyYWJsZVxuMy4gQ29udGV4dCAmIEtub3ducyDigJQgb25seSB3aGF0IHRoZSBkcmFmdCBzdGF0ZXMsIHBsdXMgcHJlbWlzZXMgdGhhdCBmb2xsb3cgZGlyZWN0bHlcbjQuIFRhc2sgQnJlYWtkb3duIOKAlCBudW1iZXJlZCwgdmVyYi1maXJzdCwgZXhlY3V0YWJsZVxuNS4gSGFyZCBDb25zdHJhaW50cyDigJQgXCJtdXN0IC8gbXVzdCBub3RcIiwgaXRlbWl6ZWRcbjYuIE91dHB1dCBGb3JtYXQg4oCUIHN0cnVjdHVyZSwgZmllbGRzLCBsZW5ndGgsIHRvbmVcbjcuIEFjY2VwdGFuY2UgQ3JpdGVyaWEg4oCUIGhvdyBcImRvbmVcIiBpcyB2ZXJpZmllZCwgaWRlYWxseSBjaGVja2FibGVcbjguIEZhaWx1cmUgTW9kZXMgJiBTZWxmLWNoZWNrIOKAlCB0aGUgMi0zIG1vc3QgbGlrZWx5IGZhaWx1cmUgbW9kZXMgcGx1cyBhIHByZS1zdWJtaXQgY2hlY2tsaXN0XG45LiBPcGVuIFF1ZXN0aW9ucyDigJQgaW5mb3JtYXRpb24gbWlzc2luZyBmcm9tIHRoZSBkcmFmdCB0aGF0IGFmZmVjdHMgdGhlIHJlc3VsdCAob21pdCBpZiBub25lKVxuXG4jIyBBbnRpLXBhdHRlcm5zIChuZXZlciBwcm9kdWNlIHRoZXNlKVxuQkFEIChzcGFyc2UgaW5wdXQsIHdvcmRpbmctb25seSBcImZpeFwiKTogXCJ3cml0ZSBhIHJlcG9ydFwiIC0+IFwiUGxlYXNlIHdyaXRlIGEgcHJvZmVzc2lvbmFsLCBoaWdoLXF1YWxpdHkgcmVwb3J0LlwiXG5HT09EOiBhZGQgYXVkaWVuY2UgYW5kIHB1cnBvc2UsIHJlcXVpcmVkIHNlY3Rpb25zLCBwZXItc2VjdGlvbiBsZW5ndGgsIGEgYmFuIG9uIGZhYnJpY2F0ZWQgZGF0YSwgXCJtYXJrIHVuY2VydGFpbiBpdGVtcyBhcyBUTyBWRVJJRllcIiwgYW5kIGRlbGl2ZXJhYmxlID0gTWFya2Rvd24sIDw9IDEyMDAgd29yZHMuXG5cbkJBRCAoZGVuc2UgaW5wdXQsIHN0aWxsIHBhZGRpbmcpOiB0aGUgZHJhZnQgYWxyZWFkeSBzdGF0ZXMgZ29hbCwgc2NvcGUsIGNvbnN0cmFpbnRzIGFuZCBvdXRwdXQgZm9ybWF0LCB5ZXQgeW91IHJ1biB0aGUgZnVsbCBuaW5lIHNlY3Rpb25zLCByZXBlYXQgdGhlIHNhbWUgcmVxdWlyZW1lbnQgdGhyZWUgdGltZXMsIGFuZCBhcHBlbmQgXCJlbnN1cmUgaGlnaCBxdWFsaXR5XCIuXG5HT09EOiBrZWVwIGV2ZXJ5IGtleSBmYWN0LCBkZWxldGUgcmVwZXRpdGlvbiBhbmQgcGxlYXNhbnRyaWVzLCBhbmQgY29tcHJlc3MgaXQgaW50byBhIHNob3J0ZXIsIG1vcmUgZXhlY3V0YWJsZSB2ZXJzaW9uIOKAlCBiZWluZyBzaG9ydGVyIHRoYW4gdGhlIGRyYWZ0IGlzIHBlcmZlY3RseSBmaW5lLmA7XG5cbmNvbnN0IEVOX01FTU9SWV9IRUFEID0gYCMjIExvbmctdGVybSB1c2VyIHByZWZlcmVuY2VzIChsZWFybmVkIGZyb20gYWNjZXB0ZWQgaGlzdG9yeSDigJQgb2JleSBmaXJzdClgO1xuY29uc3QgRU5fRVhBTVBMRVNfSEVBRCA9IGAjIyBSZWNlbnRseSBhY2NlcHRlZCBzYW1wbGVzIChsZWFybiB0aGVpciBzdHJ1Y3R1cmUgYW5kIGdyYW51bGFyaXR5OyBuZXZlciBjb3B5IHRoZSBjb250ZW50KWA7XG5jb25zdCBFTl9TRVNTSU9OX0hFQUQgPSBgIyMgUmVjZW50IGRyYWZ0cyBpbiB0aGlzIHNlc3Npb24gKGNvbnRleHQgb25seSDigJQgZG8gbm90IHF1b3RlIHRoZWlyIHdvcmRpbmcpYDtcbmNvbnN0IEVOX0xJR0hUID0gYFxcblxcbiMjIEludGVuc2l0eSBmb3IgdGhpcyBydW46IGxpZ2h0XFxuTWFrZSB0aGUgbWluaW11bSBuZWNlc3NhcnkgY2hhbmdlIGFuZCBrZWVwIHRoZSBkcmFmdCdzIG93biBzZW50ZW5jZSBzaGFwZSBhbmQgc2l6ZS4gSWYgdGhlIGRyYWZ0IGlzIGFscmVhZHkgZGV0YWlsZWQ6IGN1dCByZWR1bmRhbmN5IGFuZCBxdWFudGlmeSB2YWd1ZSB3b3JkaW5nIOKAlCBhZGQgbm8gbmV3IHNlY3Rpb25zLiBJZiB0aGUgZHJhZnQgaXMgdGhpbjogYWRkIG9ubHkgXCJPdXRwdXQgRm9ybWF0XCIgYW5kIG9uZSBhY2NlcHRhbmNlIGNyaXRlcmlvbjsgZG8gbm90IGV4cGFuZCBpbnRvIHRoZSBmdWxsIHNrZWxldG9uLiBOZXZlciBsb3NlIGluZm9ybWF0aW9uIGVpdGhlciB3YXkuYDtcbmNvbnN0IEVOX0RFRVAgPSBgXFxuXFxuIyMgSW50ZW5zaXR5IGZvciB0aGlzIHJ1bjogZGVlcFxcbkRlZXAgZG9lcyBub3QgbWVhbiBsb25nZXIg4oCUIG5ldmVyIHVzZSBsZW5ndGggYXMgYSBzdGFuZC1pbiBmb3Igcmlnb3VyLiAoMSkgU3BhcnNlIGRyYWZ0czogZXZlcnkgc3RlcCBpbiBcIlRhc2sgQnJlYWtkb3duXCIgc3RhdGVzIGlucHV0IC8gb3V0cHV0IC8gcGFzcyBjcml0ZXJpb24uICgyKSBEZW5zZSBkcmFmdHM6ICoqYWRkIG5vIHNlY3Rpb25zKio7IGluc3RlYWQgYXBwZW5kIGFuIFwiSW5mb3JtYXRpb24gQ2hlY2tcIiB0YWJsZSBjb25maXJtaW5nIHRoYXQgZ29hbCAvIHNjb3BlIC8gY29uc3RyYWludHMgLyBleHBlY3RlZCBvdXRwdXQgYWxsIHN1cnZpdmVkIGFuZCB3aGVyZSBlYWNoIG5vdyBsaXZlcy4gKDMpIEF0IGxlYXN0IDMgZmFpbHVyZSBtb2RlcywgZWFjaCB3aXRoIGEgbWF0Y2hpbmcgc2VsZi1jaGVjayBhY3Rpb24uICg0KSBOZXZlciBhZGQgZXhhbXBsZXMganVzdCB0byBsb29rIGNvbXBsZXRlIOKAlCBvbmx5IHdoZW4gYW4gZXhhbXBsZSByZW1vdmVzIHJlYWwgYW1iaWd1aXR5LmA7XG5cbmZ1bmN0aW9uIG1lbW9yeUJsb2NrKGxhbmc6IExhbmcsIGN0eDogU3lzdGVtQ29udGV4dCk6IHN0cmluZyB7XG4gIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCBwcm9maWxlID0gKGN0eC5wcm9maWxlID8/ICcnKS50cmltKCk7XG4gIGlmIChwcm9maWxlKSBwYXJ0cy5wdXNoKGAke2xhbmcgPT09ICd6aCcgPyBaSF9NRU1PUllfSEVBRCA6IEVOX01FTU9SWV9IRUFEfVxcbiR7cHJvZmlsZS5zbGljZSgwLCAxMjAwKX1gKTtcblxuICBjb25zdCBleGFtcGxlcyA9IChjdHguZXhhbXBsZXMgPz8gW10pLmZpbHRlcigoZSkgPT4gZSAmJiBlLmRyYWZ0ICYmIGUucmVzdWx0KS5zbGljZSgwLCAzKTtcbiAgaWYgKGV4YW1wbGVzLmxlbmd0aCkge1xuICAgIGNvbnN0IGJsb2NrcyA9IGV4YW1wbGVzLm1hcChcbiAgICAgIChlLCBpKSA9PlxuICAgICAgICBgIyMjICR7bGFuZyA9PT0gJ3poJyA/IGDmoLfkvosgJHtpICsgMX1gIDogYFNhbXBsZSAke2kgKyAxfWB9XFxuYCArXG4gICAgICAgIGAke2xhbmcgPT09ICd6aCcgPyAn6I2J56i/JyA6ICdEcmFmdCd9OiAke2UuZHJhZnQuc2xpY2UoMCwgMzAwKX1cXG5gICtcbiAgICAgICAgYCR7bGFuZyA9PT0gJ3poJyA/ICfph4fnurPnu5PmnpzvvIjoioLpgInvvIknIDogJ0FjY2VwdGVkIHJlc3VsdCAoZXhjZXJwdCknfTpcXG4ke2UucmVzdWx0LnNsaWNlKDAsIDcwMCl9YCxcbiAgICApO1xuICAgIHBhcnRzLnB1c2goYCR7bGFuZyA9PT0gJ3poJyA/IFpIX0VYQU1QTEVTX0hFQUQgOiBFTl9FWEFNUExFU19IRUFEfVxcbiR7YmxvY2tzLmpvaW4oJ1xcblxcbicpfWApO1xuICB9XG5cbiAgY29uc3QgZHJhZnRzID0gKGN0eC5yZWNlbnREcmFmdHMgPz8gW10pLmZpbHRlcihCb29sZWFuKS5zbGljZSgtNSk7XG4gIGlmIChkcmFmdHMubGVuZ3RoKSB7XG4gICAgcGFydHMucHVzaChcbiAgICAgIGAke2xhbmcgPT09ICd6aCcgPyBaSF9TRVNTSU9OX0hFQUQgOiBFTl9TRVNTSU9OX0hFQUR9XFxuYCArXG4gICAgICAgIGRyYWZ0cy5tYXAoKGQpID0+IGAtICR7ZC5zbGljZSgwLCAxNjApfWApLmpvaW4oJ1xcbicpLFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHBhcnRzLmpvaW4oJ1xcblxcbicpO1xufVxuXG4vKipcbiAqIOaehOmAoCBzeXN0ZW0g5o+Q56S66K+N77ya6Z2Z5oCB6KeE5YiZ77yI5LiO6K+t6KiA44CB5by65bqm55u45YWz77yJKyDliqjmgIHorrDlv4blnZfjgIJcbiAqIOiusOW/huWdl+aUvuWcqOacq+WwvuW5tuaYvuW8j+agh+azqOOAjOadpeiHquWOhuWPsuiusOW9leOAjeKAlOKAlOaooeWei+Wvueacq+auteadg+mHjeabtOmrmO+8jFxuICog5ZCM5pe26YG/5YWN6K6w5b+G5YaF5a655rGh5p+T5YmN6Z2i55qE6ZOB5b6L44CCXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFN5c3RlbVByb21wdChsYW5nOiBMYW5nLCBjdHg6IFN5c3RlbUNvbnRleHQgPSB7fSk6IHN0cmluZyB7XG4gIGNvbnN0IGludGVuc2l0eSA9IGN0eC5pbnRlbnNpdHkgPz8gREVGQVVMVF9JTlRFTlNJVFk7XG4gIGNvbnN0IGJhc2UgPSBsYW5nID09PSAnemgnID8gWkhfUlVMRVMgOiBFTl9SVUxFUztcbiAgY29uc3QgdGFpbCA9IGludGVuc2l0eSA9PT0gJ2xpZ2h0JyA/IChsYW5nID09PSAnemgnID8gWkhfTElHSFQgOiBFTl9MSUdIVCkgOiBpbnRlbnNpdHkgPT09ICdkZWVwJyA/IChsYW5nID09PSAnemgnID8gWkhfREVFUCA6IEVOX0RFRVApIDogJyc7XG4gIGNvbnN0IG1lbW9yeSA9IG1lbW9yeUJsb2NrKGxhbmcsIGN0eCk7XG4gIHJldHVybiBtZW1vcnkgPyBgJHtiYXNlfSR7dGFpbH1cXG5cXG4tLS1cXG5cXG4ke21lbW9yeX1gIDogYCR7YmFzZX0ke3RhaWx9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUmVxdWVzdEJvZHkoXG4gIGNvbmZpZzogUHJvbXB0Q29uZmlnLFxuICB0ZXh0OiBzdHJpbmcsXG4gIGxhbmc6IExhbmcsXG4gIHN0cmVhbSA9IGZhbHNlLFxuICBzeXN0ZW0/OiBzdHJpbmcsXG4gIGN0eDogU3lzdGVtQ29udGV4dCA9IHt9LFxuKTogb2JqZWN0IHtcbiAgcmV0dXJuIHtcbiAgICBtb2RlbDogY29uZmlnLm1vZGVsLFxuICAgIG1lc3NhZ2VzOiBbXG4gICAgICB7IHJvbGU6ICdzeXN0ZW0nLCBjb250ZW50OiBzeXN0ZW0gPz8gYnVpbGRTeXN0ZW1Qcm9tcHQobGFuZywgY3R4KSB9LFxuICAgICAgeyByb2xlOiAndXNlcicsIGNvbnRlbnQ6IHRleHQgfSxcbiAgICBdLFxuICAgIC8vIOmHjeWGmeS7u+WKoemcgOimgeeos+WumuWkjeeOsO+8mjAuNyDkvJrlvJXlhaXkuI3lv4XopoHnmoTmjqrovp7mvILnp7vvvIzkuJTlrrnmmJPjgIzoh6rnlLHlj5HmjKXjgI3ooaXkuovlrp5cbiAgICB0ZW1wZXJhdHVyZTogMC4zNSxcbiAgICBtYXhfdG9rZW5zOiA0MDk2LFxuICAgIHN0cmVhbSxcbiAgfTtcbn1cblxuLyoqIOWJpeemu+W4uOingeW8leWvvOWJjee8gO+8mm1vZGVsIOWBtuWwlOWcqOato+aWh+WJjei+k+WHuuOAjOS8mOWMluWQjueahOaPkOekuuivje+8muOAjeOAjOS8mOWMluWQjueahCBQcm9tcHTvvJrjgI1cbiAqICDjgIzkvJjljJbnu5PmnpzlpoLkuIvvvJrjgI3nrYnvvIzorqnnu5Pmnpzml6Dms5XkuIDplK7mm7/mjaLjgILluKblhpLlj7cv44CM5aaC5LiL44CN5omN5Yml77yM6YG/5YWN6K+v5Lyk5q2j5paH5pys6LqrXG4gKiAg77yI5aaC5LiA5q615q2j5paH5oGw5aW95Lul44CM5LyY5YyW57uT5p6c44CN5byA5aS05L2G5peg5YaS5Y+377yJ44CCICovXG4vKiog6L6T5Ye65b2i5oCB5YWc5bqV5riF5rSX77yI5LiN5pu/5Luj5o+Q56S66K+N6KeE5YiZ77yM5Y+q5YWc5L2P5qih5Z6L5omL6K+v77yJ77yaXG4gKiAgMS4g5a2X6Z2i6L2s5LmJ6L+Y5Y6fIOKAlOKAlCDojYnnqL/ku44gSlNPTiAvIOaXpeW/lyAvIOiBiuWkqeiusOW9lemHjOeymOWHuuadpeaXtu+8jOaNouihjOW+gOW+gOaYr+Wtl+mdoueahOS4pOS4quWtl+esplxuICogICAgIOOAjOWPjeaWnOadoCArIG7jgI3vvIzmqKHlnovkvJrnhafmioTvvIzmnIDnu4jnspjov5vovpPlhaXmoYbkuI3kvJrmjaLooYzjgILku4XlnKjjgIzlh6DkuY7msqHmnInnnJ/lrp7mjaLooYzvvIxcbiAqICAgICDkvYblrZfpnaLmjaLooYzlh7rnjrAg4omlMyDmrKHjgI3ml7bov5jljp/vvIzpgb/lhY3noLTlnY/mnKzlsLHmmK/ku6PnoIHmiJYgSlNPTiDnmoTmraPmlofjgIJcbiAqICAyLiDnlbjlvaLmoIfpopjljrvnrKblj7cg4oCU4oCUIOOAjCMj6KeS6Imy44CN5oqKICMg5LiO5paH5a2X55u05o6l57KY5L2P77yM5LiN56ym5ZCIIE1hcmtkb3duIOinhOiMg++8jOaYr+aJi+ivr++8m1xuICogICAgIOW4puepuuagvOeahOinhOiMg+agh+mimO+8iOOAjCMjIOinkuiJsuOAje+8ieS/neaMgeWOn+agt++8jOS6pOeUseaPkOekuuivjeinhOWImee6puadn+OAglxuICovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplUHJvbXB0VGV4dChyYXc6IHN0cmluZyk6IHN0cmluZyB7XG4gIGxldCBzID0gcmF3ID8/ICcnO1xuICBjb25zdCByZWFsQnJlYWtzID0gKHMubWF0Y2goL1xcbi9nKSA/PyBbXSkubGVuZ3RoO1xuICBjb25zdCBsaXRlcmFsQnJlYWtzID0gKHMubWF0Y2goL1xcXFxyXFxcXG58XFxcXG4vZykgPz8gW10pLmxlbmd0aDtcbiAgaWYgKGxpdGVyYWxCcmVha3MgPj0gMyAmJiByZWFsQnJlYWtzIDw9IGxpdGVyYWxCcmVha3MgLyA0KSB7XG4gICAgcyA9IHMucmVwbGFjZSgvXFxcXHJcXFxcbi9nLCAnXFxuJykucmVwbGFjZSgvXFxcXG4vZywgJ1xcbicpLnJlcGxhY2UoL1xcXFx0L2csICcgICcpO1xuICB9XG4gIC8vIOWFiOWOu+i9rOS5ie+8jOWGjeWkhOeQhuagh+mimO+8mui9rOS5iei/mOWOn+WQjuagh+mimOaJjeecn+ato+S9jeS6juihjOmmluOAglxuICAvLyDnlKggKD89W15cXHMjXSkg6ICM6Z2eICg/PVxcUynvvJrlkKbliJkgXCIjIyDop5LoibJcIiDkvJrlm57muq/miJDljLnphY3ljZXkuKogXCIjXCLvvIzmiorop4TojIPmoIfpopjkuZ/mlLnlnY/jgIJcbiAgcyA9IHMucmVwbGFjZSgvXiMrKD89W15cXHMjXSkvZ20sICcnKTtcbiAgcmV0dXJuIHM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpcExlYWRJbih0ZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICBsZXQgcyA9IG5vcm1hbGl6ZVByb21wdFRleHQodGV4dCkudHJpbSgpO1xuICAvLyDkuK3vvJrjgIzkvJjljJblkI7nmoTmj5DnpLror43vvJrjgI3jgIzkvJjljJbnu5PmnpzvvJrjgI3jgIzkvJjljJblkI7nmoQgUHJvbXB077ya44CN4oCU4oCUIOW/hemhu+W4puWGkuWPt+aIluOAjOWmguS4i+OAjVxuICBzID0gcy5yZXBsYWNlKC9e5LyY5YyWKD865ZCOfOi/h+eahHzlkI7nmoQpP1sgXFx0XSooPzrmj5DnpLror418UHJvbXB0fHByb21wdHzlhoXlrrl857uT5p6cfOaMh+S7pCkoPzrlpoLkuIspP1sgXFx0XSpbXFxz77yaOl1bIFxcdF0qL3UsICcnKS50cmltKCk7XG4gIC8vIOiLse+8mlwiT3B0aW1pemVkIHByb21wdDpcIiBcIlJld3JpdHRlbiByZXN1bHQ6XCIg4oCU4oCUIOW/hemhu+W4puWGkuWPt1xuICBzID0gcy5yZXBsYWNlKC9eKD86T3B0aW1pemVkfFJld3JpdHRlbnxSZWZpbmVkKVxccysoPzpwcm9tcHR8aW5zdHJ1Y3Rpb258Y29udGVudHxyZXN1bHR8ZHJhZnQpW1xcc++8mjpdWyBcXHRdKi9pdSwgJycpLnRyaW0oKTtcbiAgcmV0dXJuIHM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0UmVzdWx0KHJhdzogc3RyaW5nKTogc3RyaW5nIHtcbiAgbGV0IHMgPSByYXcudHJpbSgpO1xuICBjb25zdCBmZW5jZSA9IC9eYGBgW2EtekEtWjAtOV8rLV0qXFxuKFtcXHNcXFNdKj8pXFxuP2BgYCQvO1xuICBjb25zdCBtYXRjaGVkID0gcy5tYXRjaChmZW5jZSk7XG4gIGlmIChtYXRjaGVkKSBzID0gbWF0Y2hlZFsxXS50cmltKCk7XG4gIHJldHVybiBzdHJpcExlYWRJbihzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhblRyaWdnZXIoZHJhZnQ6IHN0cmluZywgYnVzeTogYm9vbGVhbik6IGJvb2xlYW4ge1xuICByZXR1cm4gIWJ1c3kgJiYgZHJhZnQudHJpbSgpLmxlbmd0aCA+IDA7XG59XG5cbmV4cG9ydCB0eXBlIE9wdGltaXplRXJyb3JLaW5kID1cbiAgfCAnY29uZmlnJ1xuICB8ICd1bmF1dGhvcml6ZWQnXG4gIHwgJ2ZvcmJpZGRlbidcbiAgfCAnaHR0cCdcbiAgfCAndGltZW91dCdcbiAgfCAnbmV0d29yaydcbiAgfCAnY29ycydcbiAgfCAnYmFkLXJlc3BvbnNlJ1xuICB8ICdlbXB0eSdcbiAgfCAndHJ1bmNhdGVkJztcblxuZXhwb3J0IGNsYXNzIE9wdGltaXplRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyByZWFkb25seSBraW5kOiBPcHRpbWl6ZUVycm9yS2luZCxcbiAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9ICdPcHRpbWl6ZUVycm9yJztcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgUkVRVUVTVF9USU1FT1VUX01TID0gNjBfMDAwO1xuXG5mdW5jdGlvbiBleHRyYWN0Q2hvaWNlQ29udGVudChwYXlsb2FkOiB1bmtub3duKTogc3RyaW5nIHwgbnVsbCB7XG4gIGlmICh0eXBlb2YgcGF5bG9hZCAhPT0gJ29iamVjdCcgfHwgcGF5bG9hZCA9PT0gbnVsbCkgcmV0dXJuIG51bGw7XG4gIGNvbnN0IGNob2ljZXMgPSAocGF5bG9hZCBhcyB7IGNob2ljZXM/OiB1bmtub3duIH0pLmNob2ljZXM7XG4gIGlmICghQXJyYXkuaXNBcnJheShjaG9pY2VzKSB8fCBjaG9pY2VzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gIGNvbnN0IGZpcnN0ID0gY2hvaWNlc1swXSBhcyB7IG1lc3NhZ2U/OiB7IGNvbnRlbnQ/OiB1bmtub3duIH0gfTtcbiAgY29uc3QgY29udGVudCA9IGZpcnN0Py5tZXNzYWdlPy5jb250ZW50O1xuICByZXR1cm4gdHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnID8gY29udGVudCA6IG51bGw7XG59XG5cbi8qKiDpnZ7mtYHlvI/lk43lupTnmoQgZmluaXNoX3JlYXNvbu+8iCdsZW5ndGgnID0g6KKrIG1heF90b2tlbnMg5oiq5pat77yJ44CCICovXG5mdW5jdGlvbiBleHRyYWN0RmluaXNoUmVhc29uKHBheWxvYWQ6IHVua25vd24pOiBzdHJpbmcgfCBudWxsIHtcbiAgaWYgKHR5cGVvZiBwYXlsb2FkICE9PSAnb2JqZWN0JyB8fCBwYXlsb2FkID09PSBudWxsKSByZXR1cm4gbnVsbDtcbiAgY29uc3QgY2hvaWNlcyA9IChwYXlsb2FkIGFzIHsgY2hvaWNlcz86IHVua25vd24gfSkuY2hvaWNlcztcbiAgaWYgKCFBcnJheS5pc0FycmF5KGNob2ljZXMpIHx8IGNob2ljZXMubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgY29uc3QgZnIgPSAoY2hvaWNlc1swXSBhcyB7IGZpbmlzaF9yZWFzb24/OiB1bmtub3duIH0pLmZpbmlzaF9yZWFzb247XG4gIHJldHVybiB0eXBlb2YgZnIgPT09ICdzdHJpbmcnID8gZnIgOiBudWxsO1xufVxuXG4vKiog5rWB5byPIFNTRSDooYzph4znmoQgZmluaXNoX3JlYXNvbu+8m+mdniBkYXRhIOihjCAvIOaXoOivpeWtl+autSDihpIgbnVsbOOAgue6r+WHveaVsO+8jOS+v+S6juWNlea1i+OAgiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RTc2VGaW5pc2hSZWFzb24obGluZTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIGNvbnN0IHRyaW1tZWQgPSBsaW5lLnRyaW0oKTtcbiAgaWYgKCF0cmltbWVkLnN0YXJ0c1dpdGgoJ2RhdGE6JykpIHJldHVybiBudWxsO1xuICBjb25zdCBkYXRhID0gdHJpbW1lZC5zbGljZSgnZGF0YTonLmxlbmd0aCkudHJpbSgpO1xuICBpZiAoZGF0YSA9PT0gJ1tET05FXScpIHJldHVybiBudWxsO1xuICBsZXQgcGF5bG9hZDogdW5rbm93bjtcbiAgdHJ5IHtcbiAgICBwYXlsb2FkID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgaWYgKHR5cGVvZiBwYXlsb2FkICE9PSAnb2JqZWN0JyB8fCBwYXlsb2FkID09PSBudWxsKSByZXR1cm4gbnVsbDtcbiAgY29uc3QgY2hvaWNlcyA9IChwYXlsb2FkIGFzIHsgY2hvaWNlcz86IHVua25vd24gfSkuY2hvaWNlcztcbiAgaWYgKCFBcnJheS5pc0FycmF5KGNob2ljZXMpIHx8IGNob2ljZXMubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgY29uc3QgZnIgPSAoY2hvaWNlc1swXSBhcyB7IGZpbmlzaF9yZWFzb24/OiB1bmtub3duIH0pLmZpbmlzaF9yZWFzb247XG4gIHJldHVybiB0eXBlb2YgZnIgPT09ICdzdHJpbmcnID8gZnIgOiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9FcnJvcktpbmQoZTogdW5rbm93bik6IE9wdGltaXplRXJyb3Ige1xuICBpZiAoZSBpbnN0YW5jZW9mIE9wdGltaXplRXJyb3IpIHJldHVybiBlO1xuICBjb25zdCBpc0Fib3J0ID1cbiAgICAodHlwZW9mIERPTUV4Y2VwdGlvbiAhPT0gJ3VuZGVmaW5lZCcgJiYgZSBpbnN0YW5jZW9mIERPTUV4Y2VwdGlvbiAmJiBlLm5hbWUgPT09ICdBYm9ydEVycm9yJykgfHxcbiAgICAoZSBpbnN0YW5jZW9mIEVycm9yICYmIChlIGFzIEVycm9yKS5uYW1lID09PSAnQWJvcnRFcnJvcicpO1xuICBpZiAoaXNBYm9ydCkgcmV0dXJuIG5ldyBPcHRpbWl6ZUVycm9yKCd0aW1lb3V0JywgJ3JlcXVlc3QgYWJvcnRlZCcpO1xuICBpZiAoZSBpbnN0YW5jZW9mIFR5cGVFcnJvcikge1xuICAgIGNvbnN0IG0gPSBTdHJpbmcoZS5tZXNzYWdlID8/ICcnKTtcbiAgICAvLyDlsL3lipvogIzkuLrvvJpDaHJvbWl1bSDnmoQgQ09SUyDlpLHotKXpgJrluLjmmK8gVHlwZUVycm9yKFwiRmFpbGVkIHRvIGZldGNoXCIp77yI5pegIGNvcnMg5a2X5qC377yJ77yM5Lya6JC95YiwIG5ldHdvcmvvvJvmraTliIbmlK/ku4XmjZXojrfoh6rluKYgQ09SUyDlrZfmoLfnmoTplJnor6/jgIJcbiAgICBpZiAoL2NvcnMvaS50ZXN0KG0pKSByZXR1cm4gbmV3IE9wdGltaXplRXJyb3IoJ2NvcnMnLCBtKTtcbiAgICByZXR1cm4gbmV3IE9wdGltaXplRXJyb3IoJ25ldHdvcmsnLCBtIHx8ICduZXR3b3JrIGVycm9yJyk7XG4gIH1cbiAgcmV0dXJuIG5ldyBPcHRpbWl6ZUVycm9yKCduZXR3b3JrJywgU3RyaW5nKChlIGFzIEVycm9yKT8ubWVzc2FnZSA/PyBlKSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvcHRpbWl6ZShvcHRzOiB7XG4gIGNvbmZpZzogUHJvbXB0Q29uZmlnO1xuICB0ZXh0OiBzdHJpbmc7XG4gIGxhbmc6IExhbmc7XG4gIHNpZ25hbD86IEFib3J0U2lnbmFsO1xuICAvKiog5bey5p6E6YCg5aW955qEIHN5c3Rlbe+8iOWQq+iusOW/hu+8ie+8m+S4jeS8oOWImeaMiSBtZW1vcnkg546w5p6E6YCgICovXG4gIHN5c3RlbT86IHN0cmluZztcbiAgbWVtb3J5PzogU3lzdGVtQ29udGV4dDtcbn0pOiBQcm9taXNlPHN0cmluZz4ge1xuICBjb25zdCB7IGNvbmZpZywgdGV4dCwgbGFuZywgc2lnbmFsLCBzeXN0ZW0sIG1lbW9yeSB9ID0gb3B0cztcbiAgY29uc3QgY29udGV4dCA9IG1lbW9yeSA/PyB7fTtcbiAgY29uc3QgY2hlY2sgPSBjaGVja0NvbmZpZyhjb25maWcpO1xuICBpZiAoIWNoZWNrLm9rKSB0aHJvdyBuZXcgT3B0aW1pemVFcnJvcignY29uZmlnJywgY2hlY2sucmVhc29uKTtcblxuICBsZXQgcmVzOiBSZXNwb25zZTtcbiAgdHJ5IHtcbiAgICByZXMgPSBhd2FpdCBmZXRjaChgJHtub3JtYWxpemVCYXNlVXJsKGNvbmZpZy5iYXNlVXJsKX0vY2hhdC9jb21wbGV0aW9uc2AsIHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7Y29uZmlnLmFwaUtleX1gLFxuICAgICAgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGJ1aWxkUmVxdWVzdEJvZHkoY29uZmlnLCB0ZXh0LCBsYW5nLCBmYWxzZSwgc3lzdGVtLCBjb250ZXh0KSksXG4gICAgICBzaWduYWwsXG4gICAgfSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB0aHJvdyB0b0Vycm9yS2luZChlKTtcbiAgfVxuXG4gIGlmIChyZXMuc3RhdHVzID09PSA0MDEpIHRocm93IG5ldyBPcHRpbWl6ZUVycm9yKCd1bmF1dGhvcml6ZWQnLCBgSFRUUCA0MDFgKTtcbiAgaWYgKHJlcy5zdGF0dXMgPT09IDQwMykgdGhyb3cgbmV3IE9wdGltaXplRXJyb3IoJ2ZvcmJpZGRlbicsIGBIVFRQIDQwM2ApO1xuICBpZiAoIXJlcy5vaykgdGhyb3cgbmV3IE9wdGltaXplRXJyb3IoJ2h0dHAnLCBgSFRUUCAke3Jlcy5zdGF0dXN9YCk7XG5cbiAgbGV0IHBheWxvYWQ6IHVua25vd247XG4gIHRyeSB7XG4gICAgcGF5bG9hZCA9IGF3YWl0IHJlcy5qc29uKCk7XG4gIH0gY2F0Y2gge1xuICAgIHRocm93IG5ldyBPcHRpbWl6ZUVycm9yKCdiYWQtcmVzcG9uc2UnLCAnaW52YWxpZCBKU09OJyk7XG4gIH1cbiAgY29uc3QgY29udGVudCA9IGV4dHJhY3RDaG9pY2VDb250ZW50KHBheWxvYWQpO1xuICBpZiAoIWNvbnRlbnQgfHwgIWNvbnRlbnQudHJpbSgpKSB0aHJvdyBuZXcgT3B0aW1pemVFcnJvcignZW1wdHknLCAnZW1wdHkgY29tcGxldGlvbicpO1xuICAvLyDmiKrmlq3mo4DmtYvvvJrooqsgbWF4X3Rva2VucyDliIfmlq3nmoTnu5PmnpzmmK/ljYrmiKrkuqfnianvvIzpnZnpu5jov5Tlm57kvJrov53lj40gUjcg5L+h5oGv5a6I5oGS4oCU4oCUXG4gIC8vIOaYjuehruaKpemUme+8jOiuqeeUqOaIt+e8qeefreiNieeov+WQjumHjeivle+8jOiAjOS4jeaYr+aLv+WIsOS4gOS7veeci+i1t+adpeWujOaVtOeahOaui+asoeWTgVxuICBpZiAoZXh0cmFjdEZpbmlzaFJlYXNvbihwYXlsb2FkKSA9PT0gJ2xlbmd0aCcpIHtcbiAgICB0aHJvdyBuZXcgT3B0aW1pemVFcnJvcigndHJ1bmNhdGVkJywgJ291dHB1dCB0cnVuY2F0ZWQgYnkgbWF4X3Rva2VucycpO1xuICB9XG4gIHJldHVybiBleHRyYWN0UmVzdWx0KGNvbnRlbnQpO1xufVxuXG4vKipcbiAqIFNTRSDlop7ph4/kuovku7bvvJrlhoXlrrnmiJbmjqjnkIbov4fnqIvnmoTkuIDmrrXmlofmnKzjgIJcbiAqIHY0IOezu+aooeWei++8iHY0LWZsYXNoIOetie+8iea1geW8j+WFiOi+k+WHuumVv+autSByZWFzb25pbmdfY29udGVudO+8iOaOqOeQhui/h+eoi++8ie+8jOmaj+WQjuaJjei+k+WHulxuICogY29udGVudCDmraPmlofigJTigJTkuKTogIXpg73opoHlrp7ml7blkYjnjrDvvIzlkKbliJnmjqjnkIbmnJ/ljaHniYfnnIvotbfmnaXlg4/jgIzpnZ7mtYHlvI/jgI3vvIjlrp7mtYsgfjgwIOS4qiBjaHVua1xuICog5YWo5pivIHJlYXNvbmluZ++8jOato+aWh+acgOWQjuaJjeWHuueOsO+8ieOAglxuICovXG5leHBvcnQgdHlwZSBTc2VEZWx0YSA9XG4gIHwgeyBraW5kOiAnY29udGVudCc7IHRleHQ6IHN0cmluZyB9XG4gIHwgeyBraW5kOiAncmVhc29uaW5nJzsgdGV4dDogc3RyaW5nIH07XG5cbi8qKlxuICog6Kej5p6Q5LiA6KGMIFNTRSDmlbDmja7vvJooZGF0YTogey4uLn0pIOKGkiDlop7ph4/kuovku7bvvJtcbiAqIFtET05FXS/pnZ4gZGF0YSDooYwv6Z2eIEpTT04v5peg5YaF5a65IGRlbHRhIOKGkiBudWxs44CC57qv5Ye95pWw77yM5L6/5LqO5Y2V5rWL44CCXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0U3NlRGVsdGEobGluZTogc3RyaW5nKTogU3NlRGVsdGEgfCBudWxsIHtcbiAgY29uc3QgdHJpbW1lZCA9IGxpbmUudHJpbSgpO1xuICBpZiAoIXRyaW1tZWQuc3RhcnRzV2l0aCgnZGF0YTonKSkgcmV0dXJuIG51bGw7XG4gIGNvbnN0IGRhdGEgPSB0cmltbWVkLnNsaWNlKCdkYXRhOicubGVuZ3RoKS50cmltKCk7XG4gIGlmIChkYXRhID09PSAnW0RPTkVdJykgcmV0dXJuIG51bGw7XG4gIGxldCBwYXlsb2FkOiB1bmtub3duO1xuICB0cnkge1xuICAgIHBheWxvYWQgPSBKU09OLnBhcnNlKGRhdGEpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpZiAodHlwZW9mIHBheWxvYWQgIT09ICdvYmplY3QnIHx8IHBheWxvYWQgPT09IG51bGwpIHJldHVybiBudWxsO1xuICBjb25zdCBjaG9pY2VzID0gKHBheWxvYWQgYXMgeyBjaG9pY2VzPzogdW5rbm93biB9KS5jaG9pY2VzO1xuICBpZiAoIUFycmF5LmlzQXJyYXkoY2hvaWNlcykgfHwgY2hvaWNlcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICBjb25zdCBmaXJzdCA9IGNob2ljZXNbMF0gYXMgeyBkZWx0YT86IHsgY29udGVudD86IHVua25vd247IHJlYXNvbmluZ19jb250ZW50PzogdW5rbm93biB9IH07XG4gIGNvbnN0IGRlbHRhID0gZmlyc3Q/LmRlbHRhO1xuICBpZiAodHlwZW9mIGRlbHRhPy5jb250ZW50ID09PSAnc3RyaW5nJykgcmV0dXJuIHsga2luZDogJ2NvbnRlbnQnLCB0ZXh0OiBkZWx0YS5jb250ZW50IH07XG4gIGlmICh0eXBlb2YgZGVsdGE/LnJlYXNvbmluZ19jb250ZW50ID09PSAnc3RyaW5nJykgcmV0dXJuIHsga2luZDogJ3JlYXNvbmluZycsIHRleHQ6IGRlbHRhLnJlYXNvbmluZ19jb250ZW50IH07XG4gIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqIOa1geW8j+S8mOWMlu+8mumAkOWdl+ino+aekCBTU0XvvIzovrnmlLbovrnlm57osIMgb25UZXh0KGRlbHRhKe+8m+i/lOWbnuWujOaVtOato+aWh+OAglxuICog55u45q+U6Z2e5rWB5byPIG9wdGltaXplKCnvvJrpppblrZfmm7Tlv6vjgIHplb/ovpPlh7rkuI3pnIDopoHnrYnlrozmlbTnlJ/miJDigJTigJTmjInpkq4v5Y2h54mH6IO96L6555Sf5oiQ6L655pi+56S644CCXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvcHRpbWl6ZVN0cmVhbShvcHRzOiB7XG4gIGNvbmZpZzogUHJvbXB0Q29uZmlnO1xuICB0ZXh0OiBzdHJpbmc7XG4gIGxhbmc6IExhbmc7XG4gIHNpZ25hbD86IEFib3J0U2lnbmFsO1xuICBvbkV2ZW50PzogKGRlbHRhOiBTc2VEZWx0YSkgPT4gdm9pZDtcbiAgLyoqIOW3suaehOmAoOWlveeahCBzeXN0ZW3vvIjlkKvorrDlv4bvvInvvJvkuI3kvKDliJnmjIkgY29udGV4dCDnjrDmnoTpgKAgKi9cbiAgc3lzdGVtPzogc3RyaW5nO1xuICBtZW1vcnk/OiBTeXN0ZW1Db250ZXh0O1xufSk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnN0IHsgY29uZmlnLCB0ZXh0LCBsYW5nLCBzaWduYWwsIG9uRXZlbnQsIHN5c3RlbSwgbWVtb3J5IH0gPSBvcHRzO1xuICBjb25zdCBjaGVjayA9IGNoZWNrQ29uZmlnKGNvbmZpZyk7XG4gIGlmICghY2hlY2sub2spIHRocm93IG5ldyBPcHRpbWl6ZUVycm9yKCdjb25maWcnLCBjaGVjay5yZWFzb24pO1xuXG4gIGxldCByZXM6IFJlc3BvbnNlO1xuICB0cnkge1xuICAgIHJlcyA9IGF3YWl0IGZldGNoKGAke25vcm1hbGl6ZUJhc2VVcmwoY29uZmlnLmJhc2VVcmwpfS9jaGF0L2NvbXBsZXRpb25zYCwge1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHtjb25maWcuYXBpS2V5fWAsXG4gICAgICB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoYnVpbGRSZXF1ZXN0Qm9keShjb25maWcsIHRleHQsIGxhbmcsIHRydWUsIHN5c3RlbSwgbWVtb3J5ID8/IHt9KSksXG4gICAgICBzaWduYWwsXG4gICAgfSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB0aHJvdyB0b0Vycm9yS2luZChlKTtcbiAgfVxuXG4gIGlmIChyZXMuc3RhdHVzID09PSA0MDEpIHRocm93IG5ldyBPcHRpbWl6ZUVycm9yKCd1bmF1dGhvcml6ZWQnLCBgSFRUUCA0MDFgKTtcbiAgaWYgKHJlcy5zdGF0dXMgPT09IDQwMykgdGhyb3cgbmV3IE9wdGltaXplRXJyb3IoJ2ZvcmJpZGRlbicsIGBIVFRQIDQwM2ApO1xuICBpZiAoIXJlcy5vaykgdGhyb3cgbmV3IE9wdGltaXplRXJyb3IoJ2h0dHAnLCBgSFRUUCAke3Jlcy5zdGF0dXN9YCk7XG4gIGlmICghcmVzLmJvZHkpIHRocm93IG5ldyBPcHRpbWl6ZUVycm9yKCdiYWQtcmVzcG9uc2UnLCAnbWlzc2luZyByZXNwb25zZSBib2R5Jyk7XG5cbiAgY29uc3QgcmVhZGVyID0gcmVzLmJvZHkuZ2V0UmVhZGVyKCk7XG4gIGNvbnN0IGRlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcbiAgbGV0IGJ1ZmZlciA9ICcnO1xuICBsZXQgZnVsbCA9ICcnO1xuICBsZXQgdHJ1bmNhdGVkID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGNvbnN0IHsgZG9uZSwgdmFsdWUgfSA9IGF3YWl0IHJlYWRlci5yZWFkKCk7XG4gICAgICBpZiAoZG9uZSkgYnJlYWs7XG4gICAgICBidWZmZXIgKz0gZGVjb2Rlci5kZWNvZGUodmFsdWUsIHsgc3RyZWFtOiB0cnVlIH0pO1xuICAgICAgY29uc3QgbGluZXMgPSBidWZmZXIuc3BsaXQoJ1xcbicpO1xuICAgICAgYnVmZmVyID0gbGluZXMucG9wKCkgPz8gJyc7XG4gICAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgICAgY29uc3QgZGVsdGEgPSBleHRyYWN0U3NlRGVsdGEobGluZSk7XG4gICAgICAgIGlmIChkZWx0YSAhPT0gbnVsbCkge1xuICAgICAgICAgIG9uRXZlbnQ/LihkZWx0YSk7XG4gICAgICAgICAgaWYgKGRlbHRhLmtpbmQgPT09ICdjb250ZW50JykgZnVsbCArPSBkZWx0YS50ZXh0O1xuICAgICAgICB9XG4gICAgICAgIGlmIChleHRyYWN0U3NlRmluaXNoUmVhc29uKGxpbmUpID09PSAnbGVuZ3RoJykgdHJ1bmNhdGVkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIHJlYWRlci5yZWxlYXNlTG9jaygpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLy8g5bey5Lit5q2iL+mHiuaUvuaXtuW/veeVpVxuICAgIH1cbiAgfVxuICAvLyDlsL7ooYzvvIjml6DmjaLooYznu5PlsL7nmoQgZGF0YSDooYzvvIlcbiAgaWYgKGJ1ZmZlci50cmltKCkpIHtcbiAgICBjb25zdCBkZWx0YSA9IGV4dHJhY3RTc2VEZWx0YShidWZmZXIpO1xuICAgIGlmIChkZWx0YSAhPT0gbnVsbCkge1xuICAgICAgb25FdmVudD8uKGRlbHRhKTtcbiAgICAgIGlmIChkZWx0YS5raW5kID09PSAnY29udGVudCcpIGZ1bGwgKz0gZGVsdGEudGV4dDtcbiAgICB9XG4gICAgaWYgKGV4dHJhY3RTc2VGaW5pc2hSZWFzb24oYnVmZmVyKSA9PT0gJ2xlbmd0aCcpIHRydW5jYXRlZCA9IHRydWU7XG4gIH1cblxuICBpZiAodHJ1bmNhdGVkKSB0aHJvdyBuZXcgT3B0aW1pemVFcnJvcigndHJ1bmNhdGVkJywgJ291dHB1dCB0cnVuY2F0ZWQgYnkgbWF4X3Rva2VucycpO1xuICBjb25zdCBjb250ZW50ID0gZXh0cmFjdFJlc3VsdChmdWxsKTtcbiAgaWYgKCFjb250ZW50LnRyaW0oKSkgdGhyb3cgbmV3IE9wdGltaXplRXJyb3IoJ2VtcHR5JywgJ2VtcHR5IGNvbXBsZXRpb24nKTtcbiAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbi8qKlxuICog6Kej5p6Q44CM5b2T5YmN5Lya6K+d5qih5Z6L44CN77ya6LCDIGNvbm5lY3Rpb24g55qEIHNlc3Npb24ubW9kZWxzIFJQQ++8jOWPliBjdXJyZW50Lm1vZGVs44CCXG4gKiBhcGkg5rOo5YWl5byP77yI5LiOIERTSCDop6PogKbkvr/kuo7ljZXmtYvvvInvvJvku7vkvZXlpLHotKXov5Tlm54gbnVsbO+8iOeUseiwg+eUqOaWueWbnumAgOiHquWumuS5iSBtb2RlbO+8ieOAglxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzb2x2ZVNlc3Npb25Nb2RlbChcbiAgYXBpOlxuICAgIHwge1xuICAgICAgICBzZXNzaW9ucz86IHtcbiAgICAgICAgICBtb2RlbHM/OiAocGF5bG9hZD86IHVua25vd24sIHNpZ25hbD86IEFib3J0U2lnbmFsKSA9PiBQcm9taXNlPHsgY3VycmVudD86IHsgbW9kZWw/OiBzdHJpbmcgfSB9IHwgbnVsbD47XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfCB1bmRlZmluZWQsXG4gIHBheWxvYWQ6IHVua25vd24gPSB7fSxcbiAgc2lnbmFsPzogQWJvcnRTaWduYWwsXG4pOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgdHJ5IHtcbiAgICAvLyDlv4XpobvmkLrluKYgc2Vzc2lvbklk77yac2VydmVyIOerr+aMiSByZXF1ZXN0LnBheWxvYWQuc2Vzc2lvbklkIOafpeivpeS8muivneW3sumAieaLqeeahOaooeWei++8jFxuICAgIC8vIOe8uuWkseaXtuWbnumAgOm7mOiupO+8iGRlZXBzZWVrLXY0LWZsYXNo77yJ6ICM6Z2e5Lya6K+d5qih5Z6L77yI5a6e5rWL77yJXG4gICAgY29uc3QgcmVzID0gYXdhaXQgYXBpPy5zZXNzaW9ucz8ubW9kZWxzPy4ocGF5bG9hZCwgc2lnbmFsKTtcbiAgICBjb25zdCBtID0gcmVzPy5jdXJyZW50Py5tb2RlbDtcbiAgICByZXR1cm4gdHlwZW9mIG0gPT09ICdzdHJpbmcnICYmIG0udHJpbSgpID8gbS50cmltKCkgOiBudWxsO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuIiwgIi8qKiBQcm9tcHQg5LyY5YyW5o+S5Lu25paH5qGIIOKAlCDkuK3oi7Hlj4zor60gKi9cblxuaW1wb3J0IHR5cGUgeyBMYW5nIH0gZnJvbSAnLi9vcHRpbWl6ZXIuanMnO1xuXG5leHBvcnQgY29uc3QgTlMgPSAncHJvbXB0X29wdGltaXplcic7XG5cbmV4cG9ydCBjb25zdCB6aCA9IHtcbiAgJ2J1dHRvbi5hcmlhJzogJ+S8mOWMliBwcm9tcHQnLFxuICAnY2FyZC50aXRsZSc6ICfkvJjljJbnu5PmnpwnLFxuICAnY2FyZC5yZXBsYWNlJzogJ+abv+aNouiNieeovycsXG4gICdjYXJkLmNvcHknOiAn5aSN5Yi2JyxcbiAgJ2NhcmQuY29weURvbmUnOiAn5bey5aSN5Yi2JyxcbiAgJ2NhcmQucmV0cnknOiAn6YeN5paw5LyY5YyWJyxcbiAgJ2NhcmQuZGlzbWlzcyc6ICfmlL7lvIMnLFxuICAnY2FyZC5vcHRpbWl6aW5nJzogJ+ato+WcqOS8mOWMluKApicsXG4gICdjYXJkLmNvbmZpZ3VyZWQuaGludCc6ICflt7LphY3nva4gwrcg5qih5Z6LIHttb2RlbH0nLFxuICAnY2FyZC51bmNvbmZpZ3VyZWQuaGludCc6ICfmnKrphY3nva4gQVBJJyxcbiAgJ2d1aWRlLnRpdGxlJzogJ+ivt+WFiOmFjee9riBBUEknLFxuICAnZ3VpZGUuZGVzYyc6ICfliY3lvoAg6K6+572uIOKGkiDpgJrnlKjorr7nva4g4oaSIFByb21wdCDkvJjljJbvvIzloavlhpnmjqXlj6PlnLDlnYDjgIFBUEkgS2V5IOS4juaooeWei+WQjeOAgicsXG4gICdndWlkZS5hY3Rpb24nOiAn5Y676K6+572uJyxcbiAgJ2d1aWRlLmRpc21pc3MnOiAn55+l6YGT5LqGJyxcbiAgJ2Vycm9yLnVuYXV0aG9yaXplZCc6ICdBUEkgS2V5IOaXoOaViOaIluW3sui/h+acnycsXG4gICdlcnJvci5mb3JiaWRkZW4nOiAn5pyN5Yqh5ouS57ud6K6/6Zeu77yINDAz77yJJyxcbiAgJ2Vycm9yLnRpbWVvdXQnOiAn6K+35rGC6LaF5pe277yM6K+35qOA5p+l572R57uc5LiO5o6l5Y+j5Zyw5Z2AJyxcbiAgJ2Vycm9yLm5ldHdvcmsnOiAn572R57uc6ZSZ6K+v77yM6K+35qOA5p+l572R57uc5LiO5o6l5Y+j5Zyw5Z2AJyxcbiAgJ2Vycm9yLmNvcnMnOiAn5o6l5Y+j5LiN5pSv5oyB6Leo5Z+f77yM6K+35o2i55So5pSv5oyBIENPUlMg55qE572R5YWzJyxcbiAgJ2Vycm9yLmh0dHAnOiAn6K+35rGC5aSx6LSl77yISFRUUCDplJnor6/vvIknLFxuICAnZXJyb3IuYmFkLXJlc3BvbnNlJzogJ+i/lOWbnuWGheWuueagvOW8j+W8guW4uCcsXG4gICdlcnJvci5lbXB0eSc6ICfov5Tlm57lhoXlrrnkuLrnqbrvvIzor7fph43or5UnLFxuICAnZXJyb3IudHJ1bmNhdGVkJzogJ+i+k+WHuuiiq+mVv+W6puS4iumZkOaIquaWre+8jOivt+e8qeefreiNieeov+WQjumHjeivlScsXG4gICdlcnJvci5jb25maWcnOiAn6YWN572u5LiN5a6M5pW077yM6K+35Yiw6K6+572u5Lit5qOA5p+lJyxcbiAgJ3NldHRpbmdzLnRpdGxlJzogJ1Byb21wdCDkvJjljJYnLFxuICAnc2V0dGluZ3MuZGVzYyc6ICfphY3nva7ph43lhpnmjqXlj6PvvIhPcGVuQUkg5YW85a6577yJ77ybS2V5IOaYjuaWh+S/neWtmOWcqOacrOWcsCcsXG4gICdzZXR0aW5ncy5haU5vdGljZSc6ICdBSSDovoXliqnkvJjljJbvvJrmj5DnpLror43lhoXmoLjkuI7mtYvor5XnlLEgQUkg55Sf5oiQ77yM57uP5Lq65bel5a6h6ZiF5ZCO5Y+R5biDJyxcbiAgJ3NldHRpbmdzLmJhc2VVcmwnOiAn5o6l5Y+j5Zyw5Z2AJyxcbiAgJ3NldHRpbmdzLmFwaUtleSc6ICdBUEkgS2V5JyxcbiAgJ3NldHRpbmdzLm1vZGVsJzogJ+aooeWei+WQjScsXG4gICdzZXR0aW5ncy51c2VTZXNzaW9uTW9kZWwnOiAn5L2/55So5b2T5YmN5Lya6K+d5qih5Z6LJyxcbiAgJ3NldHRpbmdzLnVzZVNlc3Npb25Nb2RlbEhpbnQnOiAn5byA5ZCv5pe25LyY5YyW6K+35rGC6Lef6ZqP5Lya6K+d5qih5Z6L77yb5YWz6Zet5ZCO5L2/55So5LiL5pa56Ieq5a6a5LmJ5qih5Z6L5ZCNJyxcbiAgJ3NldHRpbmdzLmludGVuc2l0eSc6ICfkvJjljJblvLrluqYnLFxuICAnc2V0dGluZ3MuaW50ZW5zaXR5SGludCc6ICfovbvmlLk95pyA5bCP5pS55Yqo77yb5qCH5YeGPeS5neautemqqOaetu+8m+a3seW6pj3mraXpqqTliKTmja7kuI7lpLHotKXmqKHlvI8nLFxuICAnaW50ZW5zaXR5LmxpZ2h0JzogJ+i9u+aUuScsXG4gICdpbnRlbnNpdHkuc3RhbmRhcmQnOiAn5qCH5YeGJyxcbiAgJ2ludGVuc2l0eS5kZWVwJzogJ+a3seW6picsXG4gICdzZXR0aW5ncy5zZXNzaW9uTW9kZWxFbmFibGVkJzogJ+W3sumAieaLqeS8muivnem7mOiupOaooeWeiycsXG4gICdzZXR0aW5ncy5ob3N0UHJvYmUnOiAn5a6/5Li76YCa6YGT5o6i5rWL5Lit4oCmJyxcbiAgJ3NldHRpbmdzLmhvc3RPayc6ICfkvJror53mqKHlnovpgJrpgZMg4pyTJyxcbiAgJ3NldHRpbmdzLmhvc3RGYWlsJzogJ+S8muivneaooeWei+mAmumBk+S4jeWPr+eUqO+8micsXG5cbiAgJ3NldHRpbmdzLnNhdmUnOiAn5L+d5a2YJyxcbiAgJ3NldHRpbmdzLnJlc2V0JzogJ+aBouWkjem7mOiupCcsXG4gICdzZXR0aW5ncy5zYXZlZCc6ICflt7Lkv53lrZgnLFxuICAnc2V0dGluZ3Muc2F2ZUZhaWxlZCc6ICfkv53lrZjlpLHotKUnLFxuICAnc2V0dGluZ3MucmVzZXRGYWlsZWQnOiAn6YeN572u5aSx6LSlJyxcbiAgXG59IGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgZW46IExvY2FsZURpY3QgPSB7XG4gICdidXR0b24uYXJpYSc6ICdPcHRpbWl6ZSBwcm9tcHQnLFxuICAnY2FyZC50aXRsZSc6ICdPcHRpbWl6ZWQgcHJvbXB0JyxcbiAgJ2NhcmQucmVwbGFjZSc6ICdVc2UgZHJhZnQnLFxuICAnY2FyZC5jb3B5JzogJ0NvcHknLFxuICAnY2FyZC5jb3B5RG9uZSc6ICdDb3BpZWQnLFxuICAnY2FyZC5yZXRyeSc6ICdSZXRyeScsXG4gICdjYXJkLmRpc21pc3MnOiAnRGlzbWlzcycsXG4gICdjYXJkLm9wdGltaXppbmcnOiAnT3B0aW1pemluZ+KApicsXG4gICdjYXJkLmNvbmZpZ3VyZWQuaGludCc6ICdDb25maWd1cmVkIMK3IG1vZGVsIHttb2RlbH0nLFxuICAnY2FyZC51bmNvbmZpZ3VyZWQuaGludCc6ICdObyBBUEkgY29uZmlndXJlZCcsXG4gICdndWlkZS50aXRsZSc6ICdDb25maWd1cmUgdGhlIEFQSSBmaXJzdCcsXG4gICdndWlkZS5kZXNjJzogJ0dvIHRvIFNldHRpbmdzIOKGkiBHZW5lcmFsIOKGkiBQcm9tcHQgT3B0aW1pemVyIGFuZCBmaWxsIGluIHRoZSBlbmRwb2ludCwgQVBJIGtleSwgYW5kIG1vZGVsLicsXG4gICdndWlkZS5hY3Rpb24nOiAnR28gdG8gc2V0dGluZ3MnLFxuICAnZ3VpZGUuZGlzbWlzcyc6ICdHb3QgaXQnLFxuICAnZXJyb3IudW5hdXRob3JpemVkJzogJ0FQSSBrZXkgaXMgaW52YWxpZCBvciBleHBpcmVkJyxcbiAgJ2Vycm9yLmZvcmJpZGRlbic6ICdBY2Nlc3MgZm9yYmlkZGVuICg0MDMpJyxcbiAgJ2Vycm9yLnRpbWVvdXQnOiAnUmVxdWVzdCB0aW1lZCBvdXQ7IGNoZWNrIHlvdXIgbmV0d29yayBhbmQgZW5kcG9pbnQnLFxuICAnZXJyb3IubmV0d29yayc6ICdOZXR3b3JrIGVycm9yOyBjaGVjayB5b3VyIG5ldHdvcmsgYW5kIGVuZHBvaW50JyxcbiAgJ2Vycm9yLmNvcnMnOiAnRW5kcG9pbnQgYmxvY2tzIENPUlM7IHVzZSBhIGdhdGV3YXkgdGhhdCBhbGxvd3MgaXQnLFxuICAnZXJyb3IuaHR0cCc6ICdSZXF1ZXN0IGZhaWxlZCAoSFRUUCBlcnJvciknLFxuICAnZXJyb3IuYmFkLXJlc3BvbnNlJzogJ1VuZXhwZWN0ZWQgcmVzcG9uc2UgZm9ybWF0JyxcbiAgJ2Vycm9yLmVtcHR5JzogJ0VtcHR5IHJlc3VsdDsgcGxlYXNlIHJldHJ5JyxcbiAgJ2Vycm9yLnRydW5jYXRlZCc6ICdPdXRwdXQgaGl0IHRoZSBsZW5ndGggbGltaXQgYW5kIHdhcyB0cnVuY2F0ZWQ7IHNob3J0ZW4gdGhlIGRyYWZ0IGFuZCByZXRyeScsXG4gICdlcnJvci5jb25maWcnOiAnSW5jb21wbGV0ZSBjb25maWd1cmF0aW9uOyBjaGVjayBzZXR0aW5ncycsXG4gICdzZXR0aW5ncy50aXRsZSc6ICdQcm9tcHQgT3B0aW1pemVyJyxcbiAgJ3NldHRpbmdzLmRlc2MnOiAnQ29uZmlndXJlIHRoZSByZXdyaXRlIGVuZHBvaW50IChPcGVuQUktY29tcGF0aWJsZSk7IGtleSBpcyBzdG9yZWQgbG9jYWxseSBpbiBwbGFpbiB0ZXh0JyxcbiAgJ3NldHRpbmdzLmFpTm90aWNlJzogJ0FJLWFzc2lzdGVkOiBwcm9tcHQga2VybmVsIGFuZCB0ZXN0cyB3ZXJlIEFJLWdlbmVyYXRlZCwgdGhlbiBodW1hbi1yZXZpZXdlZCBiZWZvcmUgcmVsZWFzZScsXG4gICdzZXR0aW5ncy5iYXNlVXJsJzogJ0Jhc2UgVVJMJyxcbiAgJ3NldHRpbmdzLmFwaUtleSc6ICdBUEkgS2V5JyxcbiAgJ3NldHRpbmdzLm1vZGVsJzogJ01vZGVsJyxcbiAgJ3NldHRpbmdzLnVzZVNlc3Npb25Nb2RlbCc6ICdVc2UgY3VycmVudCBzZXNzaW9uIG1vZGVsJyxcbiAgJ3NldHRpbmdzLnVzZVNlc3Npb25Nb2RlbEhpbnQnOiAnV2hlbiBvbiwgb3B0aW1pemF0aW9uIHJlcXVlc3RzIGZvbGxvdyB0aGUgc2Vzc2lvbiBtb2RlbDsgd2hlbiBvZmYsIHRoZSBjdXN0b20gbW9kZWwgYmVsb3cgaXMgdXNlZCcsXG4gICdzZXR0aW5ncy5pbnRlbnNpdHknOiAnSW50ZW5zaXR5JyxcbiAgJ3NldHRpbmdzLmludGVuc2l0eUhpbnQnOiAnTGlnaHQgPSBtaW5pbWFsIGVkaXRzOyBTdGFuZGFyZCA9IGZ1bGwgc2tlbGV0b247IERlZXAgPSBzdGVwIGNyaXRlcmlhIGFuZCBmYWlsdXJlIG1vZGVzJyxcbiAgJ2ludGVuc2l0eS5saWdodCc6ICdMaWdodCcsXG4gICdpbnRlbnNpdHkuc3RhbmRhcmQnOiAnU3RhbmRhcmQnLFxuICAnaW50ZW5zaXR5LmRlZXAnOiAnRGVlcCcsXG4gICdzZXR0aW5ncy5zZXNzaW9uTW9kZWxFbmFibGVkJzogJ1Nlc3Npb24gZGVmYXVsdCBtb2RlbCBzZWxlY3RlZCcsXG4gICdzZXR0aW5ncy5ob3N0UHJvYmUnOiAncHJvYmluZyBob3N0IGNoYW5uZWzigKYnLFxuICAnc2V0dGluZ3MuaG9zdE9rJzogJ3Nlc3Npb24gbW9kZWwgY2hhbm5lbCDinJMnLFxuICAnc2V0dGluZ3MuaG9zdEZhaWwnOiAnc2Vzc2lvbiBtb2RlbCBjaGFubmVsIHVuYXZhaWxhYmxlOiAnLFxuXG4gICdzZXR0aW5ncy5zYXZlJzogJ1NhdmUnLFxuICAnc2V0dGluZ3MucmVzZXQnOiAnUmVzZXQgdG8gZGVmYXVsdHMnLFxuICAnc2V0dGluZ3Muc2F2ZWQnOiAnU2F2ZWQnLFxuICAnc2V0dGluZ3Muc2F2ZUZhaWxlZCc6ICdTYXZlIGZhaWxlZCcsXG4gICdzZXR0aW5ncy5yZXNldEZhaWxlZCc6ICdSZXNldCBmYWlsZWQnLFxuICBcbn0gYXMgY29uc3Q7XG5cbmV4cG9ydCB0eXBlIExvY2FsZUtleSA9IGtleW9mIHR5cGVvZiB6aDtcbmV4cG9ydCB0eXBlIExvY2FsZURpY3QgPSB7IFtLIGluIExvY2FsZUtleV06IHN0cmluZyB9O1xuXG4vKiog5r+A5rS7IGxvY2FsZSDihpIg55WM6Z2i6K+t6KiA77yIemgg5YmN57yA5b2SIHpo77yM5YW25L2Z5b2SIGVu77yJICovXG5leHBvcnQgZnVuY3Rpb24gbGFuZ09mKGFjdGl2ZTogc3RyaW5nKTogTGFuZyB7XG4gIHJldHVybiB0eXBlb2YgYWN0aXZlID09PSAnc3RyaW5nJyAmJiBhY3RpdmUudG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoKCd6aCcpID8gJ3poJyA6ICdlbic7XG59XG4iLCAiLyoqIOaPkuS7tuWGhemDqOS6i+S7tuaAu+e6v++8iOaooeWdl+e6p++8m+mBv+WFjSBpbmRleCDihpQg57uE5Lu25b6q546v5L6d6LWW77yJ77yaXG4gKiAgLSBvcHRpbWl6ZVJlcXVlc3TvvJrlv6vmjbfplK4gQWx0K08g4oaSIOS8mOWMluaMiemSruinpuWPkVxuICogIC0gb3BlblNldHRpbmdzUmVxdWVzdO+8mumihOiniOWNoeOAjOWOu+iuvue9ruOAjeKGkiDorr7nva7ooYzoh6rliqjlsZXlvIAgKi9cblxuY29uc3Qgb3B0aW1pemVSZXF1ZXN0TGlzdGVuZXJzID0gbmV3IFNldDwoKSA9PiB2b2lkPigpO1xuXG5leHBvcnQgZnVuY3Rpb24gb25PcHRpbWl6ZVJlcXVlc3QoZm46ICgpID0+IHZvaWQpOiAoKSA9PiB2b2lkIHtcbiAgb3B0aW1pemVSZXF1ZXN0TGlzdGVuZXJzLmFkZChmbik7XG4gIHJldHVybiAoKSA9PiBvcHRpbWl6ZVJlcXVlc3RMaXN0ZW5lcnMuZGVsZXRlKGZuKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVtaXRPcHRpbWl6ZVJlcXVlc3QoKTogdm9pZCB7XG4gIGZvciAoY29uc3QgZm4gb2Ygb3B0aW1pemVSZXF1ZXN0TGlzdGVuZXJzKSBmbigpO1xufVxuXG5jb25zdCBvcGVuU2V0dGluZ3NMaXN0ZW5lcnMgPSBuZXcgU2V0PCgpID0+IHZvaWQ+KCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBvbk9wZW5TZXR0aW5nc1JlcXVlc3QoZm46ICgpID0+IHZvaWQpOiAoKSA9PiB2b2lkIHtcbiAgb3BlblNldHRpbmdzTGlzdGVuZXJzLmFkZChmbik7XG4gIHJldHVybiAoKSA9PiBvcGVuU2V0dGluZ3NMaXN0ZW5lcnMuZGVsZXRlKGZuKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVtaXRPcGVuU2V0dGluZ3NSZXF1ZXN0KCk6IHZvaWQge1xuICBmb3IgKGNvbnN0IGZuIG9mIG9wZW5TZXR0aW5nc0xpc3RlbmVycykgZm4oKTtcbn1cbiIsICIvKiog6L6T5YWl5qCP5Y+z5L6n44CM5LyY5YyW44CN5oyJ6ZKuIOKAlOKAlCDkuI3kvp3otZbkvJror50gc3RvcmUvaG9vayBwcm9wc++8jOeKtuaAgei1sOaooeWdl+e6p+mihOiniOaAu+e6vyAqL1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlQ2FsbGJhY2ssIHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgdHlwZSB7IExhbmcsIFByb21wdENvbmZpZyB9IGZyb20gJy4vb3B0aW1pemVyLmpzJztcbmltcG9ydCB7IHJ1bk9wdGltaXplIH0gZnJvbSAnLi9vcHRpbWl6ZXItc3RvcmUuanMnO1xuaW1wb3J0IHsgZ2V0UHJldmlld0J1c1N0YXRlLCBzdWJzY3JpYmVQcmV2aWV3QnVzIH0gZnJvbSAnLi9wcmV2aWV3LWJ1cy5qcyc7XG5pbXBvcnQgeyBvbk9wdGltaXplUmVxdWVzdCB9IGZyb20gJy4vZXZlbnRzLmpzJztcbmltcG9ydCB7IHJlYWREcmFmdCB9IGZyb20gJy4vY29tcG9zZXIuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE9wdGltaXplQnV0dG9uUHJvcHMge1xuICB0OiAoa2V5OiBzdHJpbmcpID0+IHN0cmluZztcbiAgZ2V0Q29uZmlnOiAoKSA9PiBQcm9tcHRDb25maWc7XG4gIGdldExhbmc6ICgpID0+IExhbmc7XG4gIGdldFNlc3Npb25Nb2RlbD86ICgpID0+IFByb21pc2U8eyBwcm92aWRlcjogc3RyaW5nOyBtb2RlbDogc3RyaW5nIH0gfCBudWxsPjtcbiAgZ2V0SG9zdD86ICgpID0+IHsgcnBjOiB7IGNhbGw6IChlOiBzdHJpbmcsIHA/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gUHJvbWlzZTx7IG9rOiBib29sZWFuOyB2YWx1ZT86IHVua25vd247IGVycm9yPzogeyBjb2RlPzogc3RyaW5nIH0gfT4gfSB9IHwgbnVsbDtcbiAgZ2V0U2Vzc2lvbklkPzogKCkgPT4gc3RyaW5nIHwgbnVsbDtcbn1cblxuY29uc3QgQ1NTX0lEID0gJ2RzaC1wcm9tcHQtb3B0aW1pemUvYnV0dG9uLmNzcyc7XG5mdW5jdGlvbiBpbmplY3RDc3MoKSB7XG4gIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnIHx8IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYHN0eWxlW2RhdGEtcGx1Z2luLWNzcz1cIiR7Q1NTX0lEfVwiXWApKSByZXR1cm47XG4gIGNvbnN0IHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgc3R5bGUuZGF0YXNldC5wbHVnaW5Dc3MgPSBDU1NfSUQ7XG4gIHN0eWxlLnRleHRDb250ZW50ID0gYFxuLmRzaC1wby1idG4ge1xuICBib3JkZXI6IDA7XG4gIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIHBhZGRpbmc6IDJweCA2cHg7XG4gIGZvbnQtc2l6ZTogMTRweDtcbiAgbGluZS1oZWlnaHQ6IDE7XG4gIG9wYWNpdHk6IDAuODU7XG4gIGJvcmRlci1yYWRpdXM6IDZweDtcbn1cbi5kc2gtcG8tYnRuOmhvdmVyOm5vdCg6ZGlzYWJsZWQpIHtcbiAgb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZDogdmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyLCByZ2JhKDEyOCwxMjgsMTI4LDAuMTIpKTtcbn1cbi5kc2gtcG8tYnRuOmRpc2FibGVkIHtcbiAgb3BhY2l0eTogMC4zNTtcbiAgY3Vyc29yOiBkZWZhdWx0O1xufVxuYDtcbiAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG59XG5cbi8qKlxuICog6K+75Y+W5b2T5YmN6I2J56i/77ya6LWw5YWx5Lqr55qEIGNvbXBvc2VyIOW3peWFt++8iOS4jiBQcmV2aWV3Q2FyZCDkuKXmoLzkuIDoh7TvvIzpgb/lhY3lj4zlrp7njrDmvILnp7vvvInjgIJcbiAqIOivu+iNieeov+eahOiDjOaZr++8iOS/neeVmeiHquWOn+WunueOsO+8ie+8mkRTSCBjb21wb3NlciDmmK8gTGV4aWNhbCDmuLLmn5PnmoQgY29udGVudGVkaXRhYmxlIGRpdu+8jFxuICog6aG16Z2i5LiK5rKh5pyJIHRleHRhcmVh77yb5Y+q6K6kIHRleHRhcmVhIOS8muOAjOaMiemSrueCueS6huaXoOWPjeW6lOOAjeOAguanveS9jeS4jeaPkOS+m+agh+WHhiBwcm9wc++8jFxuICog5Zug5q2k5YWo6YOo6LWwIERPTSDmn6Xor6LjgIJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gT3B0aW1pemVCdXR0b24ocHJvcHM6IE9wdGltaXplQnV0dG9uUHJvcHMpIHtcbiAgY29uc3QgeyB0LCBnZXRDb25maWcsIGdldExhbmcsIGdldFNlc3Npb25Nb2RlbCwgZ2V0SG9zdCwgZ2V0U2Vzc2lvbklkIH0gPSBwcm9wcztcblxuICAvLyDnuYHlv5nmgIHvvJrorqLpmIXmqKHlnZfnuqfpooTop4jmgLvnur/vvIjmm7/ku6PkvJror50gc3RvcmUgcHJvcHPvvInvvJtcbiAgLy8g6aKE6KeI56qX5Y+j57uR5a6a5Y+R6LW35Lya6K+d4oCU4oCU5YiH5Yiw5Yir55qE5Lya6K+d5pe25oyJ6ZKu5LiN5YaNIGJ1c3nvvIjlkITkvJror53lj6/ni6znq4vlj5HotbfkvJjljJbvvIlcbiAgY29uc3QgYnVzeUZvciA9ICgpID0+IHtcbiAgICBjb25zdCBzdCA9IGdldFByZXZpZXdCdXNTdGF0ZSgpO1xuICAgIGlmIChzdC5zdGF0dXMgIT09ICdvcHRpbWl6aW5nJykgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IHNpZCA9IGdldFNlc3Npb25JZD8uKCk7XG4gICAgcmV0dXJuIHN0LnNlc3Npb25JZCA9PT0gbnVsbCB8fCBzdC5zZXNzaW9uSWQgPT09IHNpZDtcbiAgfTtcbiAgY29uc3QgW2J1c3ksIHNldEJ1c3ldID0gdXNlU3RhdGUoYnVzeUZvcik7XG4gIHVzZUVmZmVjdChcbiAgICAoKSA9PiBzdWJzY3JpYmVQcmV2aWV3QnVzKCgpID0+IHNldEJ1c3koYnVzeUZvcigpKSksXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICAgIFtdLFxuICApO1xuXG4gIC8vIG1vdXNlZG93biDpooTor7vojYnnqL/vvJrngrnlh7vmjInpkq7nnqzpl7TnhKbngrnkvJrliIfliLDmjInpkq7vvIhhY3RpdmVFbGVtZW50IOS4jeWGjeaYryB0ZXh0YXJlYe+8ie+8jFxuICAvLyDkvYYgbW91c2Vkb3duIOaXqeS6jueEpueCueWIh+aNouKAlOKAlOatpOWIu+ivu+WIsOeahCBhY3RpdmVFbGVtZW50IOS7jeaYr+i+k+WFpeahhuOAglxuICBjb25zdCBkcmFmdFJlZiA9IFJlYWN0LnVzZVJlZignJyk7XG4gIGNvbnN0IHN5bmNEcmFmdCA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBkcmFmdFJlZi5jdXJyZW50ID0gcmVhZERyYWZ0KCk7XG4gIH0sIFtdKTtcblxuICB1c2VFZmZlY3QoKCkgPT4gaW5qZWN0Q3NzKCksIFtdKTtcblxuICBjb25zdCBoYW5kbGVDbGljayA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBpZiAoYnVzeSkgcmV0dXJuO1xuICAgIGNvbnN0IGRyYWZ0ID0gZHJhZnRSZWYuY3VycmVudCB8fCByZWFkRHJhZnQoKTtcbiAgICBpZiAoIWRyYWZ0LnRyaW0oKSkgcmV0dXJuO1xuICAgIHZvaWQgcnVuT3B0aW1pemUoe1xuICAgICAgZ2V0Q29uZmlnLFxuICAgICAgZ2V0TGFuZyxcbiAgICAgIGdldERyYWZ0OiAoKSA9PiBkcmFmdCxcbiAgICAgIGdldFNlc3Npb25Nb2RlbCxcbiAgICAgIGhvc3Q6IGdldEhvc3Q/LigpLFxuICAgICAgZ2V0U2Vzc2lvbklkLFxuICAgIH0pO1xuICB9LCBbYnVzeSwgZ2V0Q29uZmlnLCBnZXRMYW5nXSk7XG5cbiAgLy8gQWx0K08g5b+r5o236ZSu77yIaW5kZXgudHMg5YWo5bGA55uR5ZCs77yJ4oaSIOetieaViOeCueWHu+aMiemSrlxuICB1c2VFZmZlY3QoKCkgPT4gb25PcHRpbWl6ZVJlcXVlc3QoaGFuZGxlQ2xpY2spLCBbaGFuZGxlQ2xpY2tdKTtcblxuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgY2xhc3NOYW1lPVwiZHNoLXBvLWJ0blwiXG4gICAgICBhcmlhLWxhYmVsPXt0KCdidXR0b24uYXJpYScpfVxuICAgICAgdGl0bGU9e3QoJ2J1dHRvbi5hcmlhJyl9XG4gICAgICBhcmlhLWJ1c3k9e2J1c3l9XG4gICAgICBkaXNhYmxlZD17YnVzeX1cbiAgICAgIGRhdGEtYnVzeT17YnVzeX1cbiAgICAgIG9uTW91c2VEb3duPXtzeW5jRHJhZnR9XG4gICAgICBvbkZvY3VzPXtzeW5jRHJhZnR9XG4gICAgICBvbkNsaWNrPXtoYW5kbGVDbGlja31cbiAgICA+XG4gICAgICB7YnVzeSA/ICfij7MnIDogJ+KcqCd9XG4gICAgPC9idXR0b24+XG4gICk7XG59IiwgIi8qKlxuICog5a6/5Li76YCa6YGT5LyY5YyW77yI6Zu26YWN572u77yac2VydmVyIGhhbGYg55SoIGFnZW50RGVmYXVsdE1vZGVsICsgbGxtLnN0cmVhbSDnnJ/mtYHlvI/vvInjgIJcbiAqXG4gKiDmuLLmn5Pov5vnqIvmsqHmnInjgIzkuIDmrKHmgKfnlJ/miJDmi7/nu5PmnpzjgI3nmoQgUlBD77yM5Lmf5LiN6K+l55SoIHNlc3Npb24uY3JlYXRlL2Zvcmsg5Yib5bu65ZCO5Y+w5Lya6K+dXG4gKiDvvIjlkI7lj7DkvJror53kuI3lnKjliY3lj7DkuI3op6blj5HmqKHlnovmiafooYzvvIzlrp7mtYvjgIzmsLjov5zmraPlnKjkvJjljJbjgI3vvInjgILmraPop6Plj5boh6ogZHNoLWVsZiDnmoTlrr/kuLtcbiAqIOacjeWKoemdou+8mnNlcnZlciBoYWxm77yIbGliL2luZGV4Lmpz77yJ5oyB5pyJIGxsbSDkuI4gYWdlbnREZWZhdWx0TW9kZWwg5pyN5Yqh4oCU4oCUXG4gKiAgIHNlc3Npb25Nb2RlbCAgICAgICDihpIg5b2T5YmN5Lya6K+dL2FnZW50IOm7mOiupOaooeWei++8iHByb3ZpZGVyICsgbW9kZWzvvIlcbiAqICAgb3B0aW1pemUuc3RyZWFtICAgIOKGkiBTU0Ug55yf5rWB5byP77yabGxtLnN0cmVhbSDmr4/kuKogdGV4dC1kZWx0YSDljbPml7bmjqjpgIHvvIjpgJAgdG9rZW7vvIlcbiAqICAgb3B0aW1pemUuc3RhcnQgICAgIOKGkiDlkI7lj7DmtYHlvI/ntK/np6/vvIjpmY3nuqfmlrnmoYjvvIlcbiAqICAgb3B0aW1pemUucG9sbCAgICAgIOKGkiDlj5YgeyBkb25lLCB0ZXh0IH3vvIjpmY3nuqfmlrnmoYjvvIlcbiAqIGNsaWVudCDnu48gSFRUUCBTU0XvvIgvZHNoLXByb21wdC1vcHRpbWl6ZS9hcGkvb3B0aW1pemUuc3RyZWFt77yJ6YCQIHRva2VuIOWRiOeOsOOAglxuICovXG5cbmltcG9ydCB7IE9wdGltaXplRXJyb3IsIHR5cGUgTGFuZyB9IGZyb20gJy4vb3B0aW1pemVyLmpzJztcblxuLyoqIOiHquaciemAmumBk+eahOacgOWwj+mdou+8iOazqOWFpeW8j++8jOS+v+S6juWNlea1i++8ieOAgiAqL1xuZXhwb3J0IGludGVyZmFjZSBIb3N0UnBjIHtcbiAgY2FsbChlbmRwb2ludDogc3RyaW5nLCBwYXlsb2FkPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiBQcm9taXNlPHtcbiAgICBvazogYm9vbGVhbjtcbiAgICB2YWx1ZT86IHVua25vd247XG4gICAgZXJyb3I/OiB7IGNvZGU/OiBzdHJpbmc7IGRldGFpbHM/OiB1bmtub3duIH07XG4gIH0+O1xufVxuXG4vKipcbiAqIEhUVFAgSlNPTiBBUEkg6YCa6YGT77yIZHNoLWVsZiDmlrnlvI/vvInvvJrmuLLmn5Pov5vnqIvpobXpnaLnlLHlrr/kuLsgd2ViU2VydmVyIOaPkOS+m++8jOebuOWvuei3r+W+hCBmZXRjaFxuICog55u06L6+IGAvZHNoLXByb21wdC1vcHRpbWl6ZS9hcGkvPG1ldGhvZD5g77yM5a6M5YWo57uV5byAIGNvbm5lY3Rpb24ucnBjLmNhbGzigJTigJRcbiAqIGRlc2t0b3Ag55qEIHJwYy5jYWxsIOWcqOWQjOS4gOa1geeoi+esrOS6jOasoeiwg+eUqOS8muaMguatu++8iOWunua1iyBzZXNzaW9uTW9kZWwg5oiQ5Yqf44CB56ys5LqM5qyh5rC45LiN6L6+77yJ44CCXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjYWxsSG9zdDxSID0gdW5rbm93bj4oXG4gIG1ldGhvZDogc3RyaW5nLFxuICBhcmdzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbik6IFByb21pc2U8eyBvazogYm9vbGVhbjsgdmFsdWU/OiBSOyBlcnJvcj86IHsgY29kZT86IHN0cmluZzsgZGV0YWlscz86IHVua25vd24gfSB9PiB7XG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYC9kc2gtcHJvbXB0LW9wdGltaXplL2FwaS8ke2VuY29kZVVSSUNvbXBvbmVudChtZXRob2QpfWAsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeShhcmdzKSxcbiAgfSk7XG4gIHJldHVybiAoYXdhaXQgcmVzcG9uc2UuanNvbigpKSBhcyB7IG9rOiBib29sZWFuOyB2YWx1ZT86IFI7IGVycm9yPzogeyBjb2RlPzogc3RyaW5nOyBkZXRhaWxzPzogdW5rbm93biB9IH07XG59XG5cbi8qKiDnu5nmjILotbfnmoQgUlBDIOiwg+eUqOWKoOi2heaXtu+8iOWuv+S4u+mAmumBk+S7u+S9leS4gOatpemDveS4jeWFgeiuuOaXoOmZkOmYu+WhniDihpLjgIzkuIDnm7TmraPlnKjkvJjljJbjgI3vvInjgIIgKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoVGltZW91dDxUPihwcm9taXNlOiBQcm9taXNlPFQ+LCBtczogbnVtYmVyLCBsYWJlbDogc3RyaW5nKTogUHJvbWlzZTxUPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZTxUPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHJlamVjdChuZXcgRXJyb3IoYCR7bGFiZWx9LXRpbWVvdXRgKSksIG1zKTtcbiAgICBwcm9taXNlLnRoZW4oXG4gICAgICAodikgPT4ge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICByZXNvbHZlKHYpO1xuICAgICAgfSxcbiAgICAgIChlKSA9PiB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgIHJlamVjdChlKTtcbiAgICAgIH0sXG4gICAgKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSG9zdFNlc3Npb25JbmZvIHtcbiAgcHJvdmlkZXI6IHN0cmluZztcbiAgbW9kZWw6IHN0cmluZztcbiAgcmVhc29uaW5nRWZmb3J0Pzogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJ1bkhvc3RPcHRpbWl6ZU9wdGlvbnMge1xuICBycGM6IEhvc3RScGM7XG4gIGxhbmc6IExhbmc7XG4gIHRleHQ6IHN0cmluZztcbiAgc3lzdGVtOiBzdHJpbmc7XG4gIHNpZ25hbDogQWJvcnRTaWduYWw7XG4gIG9uRGVsdGE6ICh0ZXh0OiBzdHJpbmcpID0+IHZvaWQ7XG4gIC8qKiDlrr/kuLvpgJrpgZPmraXpqqTov5vluqbvvIjljaHniYfmmL7npLrvvIzlrprkvY3ljaHngrnvvIkgKi9cbiAgb25TdGVwPzogKHN0ZXA6ICdtb2RlbCcgfCAnc3RhcnQnIHwgJ3BvbGwnKSA9PiB2b2lkO1xuICBpbnRlcnZhbE1zPzogbnVtYmVyO1xuICB0aW1lb3V0TXM/OiBudW1iZXI7XG4gIHJwY1RpbWVvdXRNcz86IG51bWJlcjtcbn1cblxuY29uc3QgREVGQVVMVF9JTlRFUlZBTF9NUyA9IDEwMDtcbmNvbnN0IERFRkFVTFRfVElNRU9VVF9NUyA9IDEyMF8wMDA7XG5jb25zdCBERUZBVUxUX1JQQ19USU1FT1VUX01TID0gNV8wMDA7XG5cbmZ1bmN0aW9uIGNhbGxScGM8UiA9IG5ldmVyPihcbiAgcnBjOiBIb3N0UnBjLFxuICBlbmRwb2ludDogc3RyaW5nLFxuICBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbiAgbXM6IG51bWJlcixcbik6IFByb21pc2U8eyBvazogdHJ1ZTsgdmFsdWU6IFIgfSB8IHsgb2s6IGZhbHNlOyBlcnJvcj86IHsgY29kZT86IHN0cmluZzsgZGV0YWlscz86IHVua25vd24gfSB9PiB7XG4gIHJldHVybiB3aXRoVGltZW91dChcbiAgICBycGMuY2FsbChlbmRwb2ludCwgcGF5bG9hZCksXG4gICAgbXMsXG4gICAgZW5kcG9pbnQsXG4gICkgYXMgUHJvbWlzZTx7IG9rOiB0cnVlOyB2YWx1ZTogUiB9IHwgeyBvazogZmFsc2U7IGVycm9yPzogeyBjb2RlPzogc3RyaW5nOyBkZXRhaWxzPzogdW5rbm93biB9IH0+O1xufVxuXG4vKiog5Y+W5b2T5YmN5Lya6K+dL2FnZW50IOm7mOiupOaooeWei++8iOmbtumFjee9ru+8ieOAguS4jeWPr+W+l+aXtui/lOWbniBudWxs44CCXG4gKiAg5aWR57qm6KaB5rGC44CM5Lu75L2V5aSx6LSl6YO96L+U5ZueIG51bGwg55Sx6LCD55So5pa55Zue6YCA44CN4oCU4oCU5pen54mI5pegIHRyeS9jYXRjaO+8jFxuICogIGZldGNoIOWksei0pS/lk43lupTpnZ4gSlNPTiDkvJrnm7TmjqUgcmVqZWN077yM6L+d5Y+N6Ieq6Lqr5rOo6YeK5om/6K+644CCICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzb2x2ZUhvc3RTZXNzaW9uTW9kZWwoXG4gIHJwYzogSG9zdFJwYyxcbiAgcnBjVGltZW91dE1zID0gREVGQVVMVF9SUENfVElNRU9VVF9NUyxcbik6IFByb21pc2U8SG9zdFNlc3Npb25JbmZvIHwgbnVsbD4ge1xuICB0cnkge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGNhbGxScGMocnBjLCAnc2Vzc2lvbk1vZGVsJywge30sIHJwY1RpbWVvdXRNcyk7XG4gICAgaWYgKCFyZXMub2sgfHwgIXJlcy52YWx1ZSB8fCB0eXBlb2YgcmVzLnZhbHVlICE9PSAnb2JqZWN0JykgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgdiA9IHJlcy52YWx1ZSBhcyB7IHByb3ZpZGVyPzogdW5rbm93bjsgbW9kZWw/OiB1bmtub3duIH07XG4gICAgaWYgKHR5cGVvZiB2LnByb3ZpZGVyICE9PSAnc3RyaW5nJyB8fCB0eXBlb2Ygdi5tb2RlbCAhPT0gJ3N0cmluZycpIHJldHVybiBudWxsO1xuICAgIGNvbnN0IGluZm86IEhvc3RTZXNzaW9uSW5mbyA9IHsgcHJvdmlkZXI6IHYucHJvdmlkZXIsIG1vZGVsOiB2Lm1vZGVsIH07XG4gICAgaWYgKHR5cGVvZiAocmVzLnZhbHVlIGFzIHsgcmVhc29uaW5nRWZmb3J0PzogdW5rbm93biB9KS5yZWFzb25pbmdFZmZvcnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpbmZvLnJlYXNvbmluZ0VmZm9ydCA9IChyZXMudmFsdWUgYXMgeyByZWFzb25pbmdFZmZvcnQ/OiBzdHJpbmcgfSkucmVhc29uaW5nRWZmb3J0O1xuICAgIH1cbiAgICByZXR1cm4gaW5mbztcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqIOaWh+acrOWinumHj++8iOWtl+espuWJjee8gOavlOi+g++8m+i9ruivoui/keS8vOa1geW8j+eUqO+8ieOAgiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByZWZpeERlbHRhKHByZXY6IHN0cmluZywgbmV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgbiA9IE1hdGgubWluKHByZXYubGVuZ3RoLCBuZXh0Lmxlbmd0aCk7XG4gIGxldCBpID0gMDtcbiAgd2hpbGUgKGkgPCBuICYmIHByZXYuY2hhckNvZGVBdChpKSA9PT0gbmV4dC5jaGFyQ29kZUF0KGkpKSBpICs9IDE7XG4gIHJldHVybiBuZXh0LnNsaWNlKGkpO1xufVxuXG4vKipcbiAqIOWuv+S4u+mAmumBk+WFqOa1geeoi++8iOWNleasoSBSUEMg5Lqk5LuY77yJ77yac2VydmVyIGhhbGYg6Kej5p6Q5Lya6K+d6buY6K6k5qih5Z6LIOKGkiBsbG0uc3RyZWFtIOi3keWujFxuICog4oaSIOS4gOasoeaAp+i/lOWbnuWFqOaWh+OAguS4jeeUqOOAjHN0YXJ0ICsg6L2u6K+iIHBvbGzjgI3nmoTliIbmraXljY/orq7vvJpkZXNrdG9wIOa4suafk+i/m+eoi+eahFxuICogcnBjLmNhbGwg5Zyo5ZCM5LiA5rWB56iL55qE56ys5LqM5qyh6LCD55So5Lya5oyC5q2777yI5a6e5rWLIHNlc3Npb25Nb2RlbCDmiJDlip/jgIFzdGFydCDmsLjkuI3ovr7vvInvvIxcbiAqIOWNleasoeiwg+eUqOe7leW8gOivpemZkOWItuOAguWNoeeJh+aXoOmAkOWtl+a7muWKqO+8iOa1geW8j+iDveWKm+S/neeVmeWcqCBmZXRjaCDpgJrpgZPvvInjgIJcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTdHJlYW1Ib3N0T3B0aW1pemVPcHRpb25zIHtcbiAgcnBjOiBIb3N0UnBjO1xuICB0ZXh0OiBzdHJpbmc7XG4gIHN5c3RlbTogc3RyaW5nO1xuICBzaWduYWw6IEFib3J0U2lnbmFsO1xuICBvbkRlbHRhKHRleHQ6IHN0cmluZyk6IHZvaWQ7XG4gIG9uUmVhc29uaW5nPyh0ZXh0OiBzdHJpbmcpOiB2b2lkO1xuICBvblN0ZXA/KHN0ZXA6ICdtb2RlbCcgfCAnc3RhcnQnIHwgJ3BvbGwnKTogdm9pZDtcbiAgdGltZW91dE1zPzogbnVtYmVyO1xufVxuXG4vKiog6Kej5p6QIFNTRSDluKfvvJrov5Tlm54geyBldmVudCwgZGF0YSB977yIXFxuXFxuIOWIhuW4p++8ieOAglxuICogIGRhdGEg5oyJIFNTRSDop4TojIPlj6rliaXlhpLlj7flkI7nmoTkuIDkuKrliY3lr7znqbrmoLzigJTigJTnu53kuI0gdHJpbe+8muaXp+eJiCB0cmltIOS8muWQg+aOiVxuICogIHRva2VuIOmmluWwvuepuueZve+8jOiLseaWh+a1geW8j+e7k+aenOWNleivjeeymOi/nu+8iFwiVGhlIGdvYWxcIiDihpIgXCJUaGVnb2FsXCLvvIzlrp7mtYsgYnVn77yJ44CCICovXG5hc3luYyBmdW5jdGlvbiByZWFkU3NlRnJhbWVzKFxuICByZXNwb25zZTogUmVzcG9uc2UsXG4gIG9uRnJhbWU6IChldmVudDogc3RyaW5nLCBkYXRhOiBzdHJpbmcpID0+IHZvaWQsXG4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgcmVhZGVyID0gcmVzcG9uc2UuYm9keT8uZ2V0UmVhZGVyKCk7XG4gIGlmICghcmVhZGVyKSB0aHJvdyBuZXcgRXJyb3IoJ25vLXN0cmVhbScpO1xuICBjb25zdCBkZWNvZGVyID0gbmV3IFRleHREZWNvZGVyKCk7XG4gIGxldCBidWZmZXIgPSAnJztcbiAgZm9yICg7Oykge1xuICAgIGNvbnN0IHsgZG9uZSwgdmFsdWUgfSA9IGF3YWl0IHJlYWRlci5yZWFkKCk7XG4gICAgaWYgKGRvbmUpIGJyZWFrO1xuICAgIGJ1ZmZlciArPSBkZWNvZGVyLmRlY29kZSh2YWx1ZSwgeyBzdHJlYW06IHRydWUgfSk7XG4gICAgZm9yICg7Oykge1xuICAgICAgY29uc3QgaWR4ID0gYnVmZmVyLmluZGV4T2YoJ1xcblxcbicpO1xuICAgICAgaWYgKGlkeCA9PT0gLTEpIGJyZWFrO1xuICAgICAgY29uc3QgZnJhbWUgPSBidWZmZXIuc2xpY2UoMCwgaWR4KTtcbiAgICAgIGJ1ZmZlciA9IGJ1ZmZlci5zbGljZShpZHggKyAyKTtcbiAgICAgIGxldCBldmVudCA9ICdtZXNzYWdlJztcbiAgICAgIGxldCBkYXRhID0gJyc7XG4gICAgICBmb3IgKGNvbnN0IGxpbmUgb2YgZnJhbWUuc3BsaXQoJ1xcbicpKSB7XG4gICAgICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJ2V2ZW50OicpKSBldmVudCA9IGxpbmUuc2xpY2UoNikudHJpbSgpO1xuICAgICAgICBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoJ2RhdGE6JykpIHtcbiAgICAgICAgICBsZXQgZCA9IGxpbmUuc2xpY2UoNSk7XG4gICAgICAgICAgaWYgKGQuc3RhcnRzV2l0aCgnICcpKSBkID0gZC5zbGljZSgxKTtcbiAgICAgICAgICBkYXRhID0gZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgb25GcmFtZShldmVudCwgZGF0YSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICog5a6/5Li76YCa6YGT55yf5rWB5byP77yaZmV0Y2ggU1NF77yM6YCQIHRva2VuIG9uRGVsdGHjgILnu5XlvIAgcnBjLmNhbGzvvIhkZXNrdG9wIOS6jOasoeiwg+eUqOaMguatu++8ie+8jFxuICog5Lmf57uV5byA6L2u6K+i5b+r54Wn77yI5b+r5qih5Z6L5LuN5pi+5LiA5qyh5oCn77yJ44CCYWJvcnQgPSBzaWduYWwgKyBmZXRjaCBhYm9ydOOAglxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RyZWFtSG9zdE9wdGltaXplKG9wdHM6IFN0cmVhbUhvc3RPcHRpbWl6ZU9wdGlvbnMpOiBQcm9taXNlPHN0cmluZz4ge1xuICBjb25zdCB7IHJwYywgdGV4dCwgc3lzdGVtLCBzaWduYWwsIG9uRGVsdGEsIG9uUmVhc29uaW5nLCBvblN0ZXAgfSA9IG9wdHM7XG4gIGNvbnN0IHRpbWVvdXRNcyA9IG9wdHMudGltZW91dE1zID8/IERFRkFVTFRfVElNRU9VVF9NUztcbiAgaWYgKHNpZ25hbC5hYm9ydGVkKSB0aHJvdyBuZXcgRXJyb3IoJ2Fib3J0ZWQnKTtcbiAgb25TdGVwPy4oJ21vZGVsJyk7XG4gIGNvbnN0IHNlc3Npb24gPSBhd2FpdCByZXNvbHZlSG9zdFNlc3Npb25Nb2RlbChycGMsIG9wdHMucnBjVGltZW91dE1zID8/IERFRkFVTFRfUlBDX1RJTUVPVVRfTVMpO1xuICBpZiAoIXNlc3Npb24pIHRocm93IG5ldyBFcnJvcignaG9zdC11bmF2YWlsYWJsZScpO1xuICBvblN0ZXA/Lignc3RhcnQnKTtcblxuICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICBjb25zdCBvbkFib3J0ID0gKCkgPT4gY29udHJvbGxlci5hYm9ydCgpO1xuICBzaWduYWwuYWRkRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBvbkFib3J0KTtcbiAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4gY29udHJvbGxlci5hYm9ydCgpLCB0aW1lb3V0TXMpO1xuICBsZXQgb3V0ID0gJyc7XG4gIHRyeSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCgnL2RzaC1wcm9tcHQtb3B0aW1pemUvYXBpL29wdGltaXplLnN0cmVhbScsIHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgaGVhZGVyczogeyAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHByb3ZpZGVyOiBzZXNzaW9uLnByb3ZpZGVyLFxuICAgICAgICBtb2RlbDogc2Vzc2lvbi5tb2RlbCxcbiAgICAgICAgdGV4dCxcbiAgICAgICAgc3lzdGVtLFxuICAgICAgICAuLi4oc2Vzc2lvbi5yZWFzb25pbmdFZmZvcnQgPyB7IHJlYXNvbmluZ0VmZm9ydDogc2Vzc2lvbi5yZWFzb25pbmdFZmZvcnQgfSA6IHt9KSxcbiAgICAgIH0pLFxuICAgICAgc2lnbmFsOiBjb250cm9sbGVyLnNpZ25hbCxcbiAgICB9KTtcbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYGh0dHAtJHtyZXNwb25zZS5zdGF0dXN9YCk7XG4gICAgb25TdGVwPy4oJ3BvbGwnKTtcbiAgICBsZXQgcmVhc29uaW5nID0gJyc7XG4gICAgLy8g5a6/5Li75L6n5aSx6LSl5b+F6aG75rWu5Ye677ya5pen54mI55u05o6l5b+955WlIGVycm9yIOW4p++8jOWksei0peiiq+W9k+aIkOWKn+OAgeepui/ljYrmiKrnu5PmnpznhafluLggc2hvd1xuICAgIGxldCBzdHJlYW1FcnJvcjogeyBraW5kOiAnZXJyb3InIHwgJ3RydW5jYXRlZCc7IG1lc3NhZ2U6IHN0cmluZyB9IHwgbnVsbCA9IG51bGw7XG4gICAgYXdhaXQgcmVhZFNzZUZyYW1lcyhyZXNwb25zZSwgKGV2ZW50LCBkYXRhKSA9PiB7XG4gICAgICBpZiAoZXZlbnQgPT09ICdlcnJvcicpIHtcbiAgICAgICAgbGV0IGtpbmQ6ICdlcnJvcicgfCAndHJ1bmNhdGVkJyA9ICdlcnJvcic7XG4gICAgICAgIGxldCBtZXNzYWdlID0gZGF0YTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGRhdGEpIGFzIHsga2luZD86IHVua25vd247IG0/OiB1bmtub3duIH07XG4gICAgICAgICAgaWYgKHR5cGVvZiBwYXJzZWQubSA9PT0gJ3N0cmluZycgJiYgcGFyc2VkLm0pIG1lc3NhZ2UgPSBwYXJzZWQubTtcbiAgICAgICAgICBpZiAocGFyc2VkLmtpbmQgPT09ICd0cnVuY2F0ZWQnKSBraW5kID0gJ3RydW5jYXRlZCc7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIC8vIOmdniBKU09OIOi9veiNt++8muaMieWOn+aWh+acrOW9k+mUmeivr+a2iOaBr1xuICAgICAgICB9XG4gICAgICAgIHN0cmVhbUVycm9yID0geyBraW5kLCBtZXNzYWdlIH07XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChkYXRhID09PSAne30nIHx8IGRhdGEgPT09ICdbRE9ORV0nKSByZXR1cm47XG4gICAgICBpZiAoZXZlbnQgPT09ICdyZWFzb25pbmcnIHx8IGV2ZW50ID09PSAnZGVsdGEnKSB7XG4gICAgICAgIC8vIOW4p+i9veiNt+S4uiBKU09O77yIe1widFwiOiAuLi5977yJ77yM56m65qC8L+aNouihjC/lrZfpnaLlj43mlpzmnaDlhajpg6jml6DmjZ/vvJtcbiAgICAgICAgLy8g6Kej5p6Q5aSx6LSl5pe25Zue6YCA6KO45paH5pys77yI5a655b+N5pen5qC85byP5bin77yJXG4gICAgICAgIGxldCBwaWVjZSA9IGRhdGE7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShkYXRhKSBhcyB7IHQ/OiB1bmtub3duIH07XG4gICAgICAgICAgaWYgKHR5cGVvZiBwYXJzZWQudCA9PT0gJ3N0cmluZycpIHBpZWNlID0gcGFyc2VkLnQ7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIC8vIOijuOaWh+acrOW4p1xuICAgICAgICB9XG4gICAgICAgIGlmIChldmVudCA9PT0gJ3JlYXNvbmluZycpIHtcbiAgICAgICAgICByZWFzb25pbmcgKz0gcGllY2U7XG4gICAgICAgICAgb25SZWFzb25pbmc/LihyZWFzb25pbmcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG91dCArPSBwaWVjZTtcbiAgICAgICAgICBvbkRlbHRhKG91dCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoc2lnbmFsLmFib3J0ZWQpIHRocm93IG5ldyBFcnJvcignYWJvcnRlZCcpO1xuICAgIGlmIChzdHJlYW1FcnJvcikge1xuICAgICAgdGhyb3cgc3RyZWFtRXJyb3Iua2luZCA9PT0gJ3RydW5jYXRlZCdcbiAgICAgICAgPyBuZXcgT3B0aW1pemVFcnJvcigndHJ1bmNhdGVkJywgc3RyZWFtRXJyb3IubWVzc2FnZSlcbiAgICAgICAgOiBuZXcgT3B0aW1pemVFcnJvcignYmFkLXJlc3BvbnNlJywgc3RyZWFtRXJyb3IubWVzc2FnZSk7XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG4gIH0gZmluYWxseSB7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgIHNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKCdhYm9ydCcsIG9uQWJvcnQpO1xuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5Ib3N0T3B0aW1pemUob3B0czogUnVuSG9zdE9wdGltaXplT3B0aW9ucyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnN0IHsgcnBjLCBsYW5nOiBfbGFuZywgdGV4dCwgc3lzdGVtLCBzaWduYWwsIG9uRGVsdGEsIG9uU3RlcCB9ID0gb3B0cztcbiAgY29uc3QgaW50ZXJ2YWxNcyA9IG9wdHMuaW50ZXJ2YWxNcyA/PyBERUZBVUxUX0lOVEVSVkFMX01TO1xuICBjb25zdCB0aW1lb3V0TXMgPSBvcHRzLnRpbWVvdXRNcyA/PyBERUZBVUxUX1RJTUVPVVRfTVM7XG4gIGNvbnN0IHJwY1RpbWVvdXRNcyA9IG9wdHMucnBjVGltZW91dE1zID8/IERFRkFVTFRfUlBDX1RJTUVPVVRfTVM7XG4gIGlmIChzaWduYWwuYWJvcnRlZCkgdGhyb3cgbmV3IEVycm9yKCdhYm9ydGVkJyk7XG5cbiAgLy8gMS4g5Lya6K+d6buY6K6k5qih5Z6L77yI6Zu26YWN572u77yJXG4gIG9uU3RlcD8uKCdtb2RlbCcpO1xuICBjb25zdCBzZXNzaW9uID0gYXdhaXQgcmVzb2x2ZUhvc3RTZXNzaW9uTW9kZWwocnBjLCBycGNUaW1lb3V0TXMpO1xuICBpZiAoIXNlc3Npb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2hvc3QtdW5hdmFpbGFibGUnKTtcbiAgfVxuXG4gIC8vIDIuIOWQr+WKqOWQjuWPsOa1geW8j1xuICBvblN0ZXA/Lignc3RhcnQnKTtcbiAgY29uc3Qgc3RhcnRQYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHtcbiAgICBwcm92aWRlcjogc2Vzc2lvbi5wcm92aWRlcixcbiAgICBtb2RlbDogc2Vzc2lvbi5tb2RlbCxcbiAgICB0ZXh0LFxuICAgIHN5c3RlbSxcbiAgfTtcbiAgaWYgKHNlc3Npb24ucmVhc29uaW5nRWZmb3J0KSBzdGFydFBheWxvYWQucmVhc29uaW5nRWZmb3J0ID0gc2Vzc2lvbi5yZWFzb25pbmdFZmZvcnQ7XG4gIGNvbnN0IHN0YXJ0ID0gYXdhaXQgY2FsbFJwYzx7IHRhc2tJZD86IHN0cmluZyB9PihycGMsICdvcHRpbWl6ZS5zdGFydCcsIHN0YXJ0UGF5bG9hZCwgcnBjVGltZW91dE1zKTtcbiAgaWYgKCFzdGFydC5vayB8fCAhc3RhcnQudmFsdWUgfHwgdHlwZW9mIHN0YXJ0LnZhbHVlLnRhc2tJZCAhPT0gJ3N0cmluZycpIHtcbiAgICBjb25zdCBjb2RlID0gKCFzdGFydC5vayAmJiBzdGFydC5lcnJvciAmJiBzdGFydC5lcnJvci5jb2RlKSB8fCAnJztcbiAgICBjb25zdCBkZXRhaWxzID0gKCFzdGFydC5vayAmJiBzdGFydC5lcnJvciAmJiBzdGFydC5lcnJvci5kZXRhaWxzKSB8fCAnJztcbiAgICB0aHJvdyBuZXcgRXJyb3IoYGhvc3Qtc3RhcnQtcmVqZWN0ZWQke2NvZGUgPyBgOiAke2NvZGV9ICR7ZGV0YWlscyB8fCAnJ31gLnRyaW0oKSA6ICcnfWApO1xuICB9XG4gIGNvbnN0IHRhc2tJZCA9IHN0YXJ0LnZhbHVlLnRhc2tJZDtcblxuICAvLyAzLiDova7or6Llop7ph4/nm7Toh7MgZG9uZe+8iOacjeWKoeerr+aYvuW8j+WujOaIkOS/oeWPt++8jOaXoCBzZXR0bGUg5YWc5bqV77yJXG4gIG9uU3RlcD8uKCdwb2xsJyk7XG4gIGNvbnN0IHN0YXJ0ZWRBdCA9IERhdGUubm93KCk7XG4gIGxldCBsYXN0ID0gJyc7XG4gIHRyeSB7XG4gICAgZm9yICg7Oykge1xuICAgICAgaWYgKHNpZ25hbC5hYm9ydGVkKSB0aHJvdyBuZXcgRXJyb3IoJ2Fib3J0ZWQnKTtcbiAgICAgIGlmIChEYXRlLm5vdygpIC0gc3RhcnRlZEF0ID4gdGltZW91dE1zKSB0aHJvdyBuZXcgRXJyb3IoJ3RpbWVvdXQnKTtcbiAgICAgIGxldCBwb2xsOiB7IGRvbmU/OiBib29sZWFuOyB0ZXh0Pzogc3RyaW5nOyBlcnJvcj86IHN0cmluZyB8IG51bGwgfSB8IG51bGwgPSBudWxsO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgY2FsbFJwYzx7IGRvbmU/OiBib29sZWFuOyB0ZXh0Pzogc3RyaW5nOyBlcnJvcj86IHN0cmluZyB8IG51bGwgfT4oXG4gICAgICAgICAgcnBjLFxuICAgICAgICAgICdvcHRpbWl6ZS5wb2xsJyxcbiAgICAgICAgICB7IHRhc2tJZCB9LFxuICAgICAgICAgIHJwY1RpbWVvdXRNcyxcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKHJlcy5vayAmJiByZXMudmFsdWUpIHBvbGwgPSByZXMudmFsdWU7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgLy8g5Y2V5qyh6L2u6K+i5aSx6LSl5LiN6Ie05ZG977yM5LiL5LiA6L2u5YaN6K+VXG4gICAgICB9XG4gICAgICBpZiAocG9sbCkge1xuICAgICAgICBpZiAocG9sbC5lcnJvcikge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihwb2xsLmVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0ZXh0Tm93ID0gcG9sbC50ZXh0ID8/ICcnO1xuICAgICAgICBpZiAodGV4dE5vdyAhPT0gbGFzdCkge1xuICAgICAgICAgIG9uRGVsdGEodGV4dE5vdyk7XG4gICAgICAgICAgaWYgKHNpZ25hbC5hYm9ydGVkKSB0aHJvdyBuZXcgRXJyb3IoJ2Fib3J0ZWQnKTtcbiAgICAgICAgICBsYXN0ID0gdGV4dE5vdztcbiAgICAgICAgfVxuICAgICAgICBpZiAocG9sbC5kb25lKSB7XG4gICAgICAgICAgcmV0dXJuIHRleHROb3c7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIGludGVydmFsTXMpKTtcbiAgICB9XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHJwYy5jYWxsKCdvcHRpbWl6ZS5hYm9ydCcsIHsgdGFza0lkIH0pO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLy8g5bC95YqbXG4gICAgfVxuICB9XG59XG4iLCAiLy8g5pys6aG555uu55SxIEFJIOi+heWKqeS8mOWMluWujOaIkO+8iOaPkOekuuivjeWGheaguOOAgea1i+ivleS4juaWh+aho++8ie+8jOWPkeW4g+WJjee7j+S6uuW3peWuoemYheOAglxuLyoqXG4gKiBtZW1vcnkudHMg4oCU4oCUIOS8muivneiusOW/hiArIOWBj+WlveiHquWtpuS5oO+8iOe6r+WJjeerr++8jGxvY2FsU3RvcmFnZSDmjIHkuYXljJbvvIlcbiAqXG4gKiDorr7orqHlj5boiI3vvIjkuLrku4DkuYjkuI3nlKjlrr/kuLvmlofku7bvvInvvJpcbiAqICAg5a6/5Li755qEIGBzeXN0ZW1gIOWPguaVsOWujOWFqOeUseWuouaIt+err+aLvOijheWQjuS8oOe7mSBsbG0uc3RyZWFt77yM5Zug5q2k6K6w5b+G5Y+q6KaB5Zyo5a6i5oi356uvXG4gKiAgIOe7hOijheWNs+WPr++8jOS4jemcgOimgeaWsOWiniBob3N0IEFQSeOAgeS4jemcgOimgeaUuSBsaWIvaW5kZXguanMg4oCU4oCUIOaUueWKqOmdouacgOWwj+OAgeacgOS4jeWuueaYk1xuICogICDmiormj5Lku7bmkJ7mjILjgIJcbiAqXG4gKiDkuInlsYLorrDlv4bvvIjlr7npvZAgV29ya0J1ZGR5IOeahOWIhuWxguaAnei3r++8jOS9huiMg+WbtOaUtueqhOWIsOOAjOaPkOekuuivjeWBj+WlveOAje+8ie+8mlxuICogICBMMSDkvJror53orrDlv4YgICBzZXNzaW9uRHJhZnRzW3Nlc3Npb25JZF0gIOKAlOKAlCDmnKzkvJror53mnIDov5EgMTAg5p2h6I2J56i/77yM55So5LqO55CG6Kej5b2T5YmN6K+t5aKDXG4gKiAgIEwyIOagt+S+i+iusOW/hiAgIGFjY2VwdGVkW10gICAgICAgICAgICAgICAg4oCU4oCUIOacgOi/keiiq+mHh+e6s+eahOOAjOiNieeovyDihpIg57uT5p6c44CN5a+577yM5L2cIGZldy1zaG90XG4gKiAgIEwzIOWBj+WlveeUu+WDjyAgIHByb2ZpbGUgICAgICAgICAgICAgICAgICAg4oCU4oCUIOeUsemHh+e6sy/mlL7lvIPorrDlvZXlj43mgJ3lh7rnmoTnqLPlrprlgY/lpb3vvIjiiaQ2MDAg5a2X77yJXG4gKlxuICog6Ieq5a2m5Lmg6Zet546v77yI5YCf6Ym0IExhbmdNZW0gbWV0YXByb21wdCArIFNraWxsT3B0IOeahOOAjOacieeVjOe8lui+kSArIOmqjOivgemXuOmXqOOAje+8ie+8mlxuICogICDph4fnurMgPSDmraPmoLfmnKzvvIjpqozor4HpgJrov4fvvIkgLyDmlL7lvIPmiJbph43or5UgPSDotJ/moLfmnKxcbiAqICAg4oaSIOavj+e0r+iuoSAzIOS4quaWsOato+agt+acrOinpuWPkeS4gOasoeWPjeaAne+8iDEg5qyhIExMTSDosIPnlKjvvIlcbiAqICAg4oaSIOWPjeaAneS6p+WHuueahOaYryoq5pyJ55WM5pu/5o2iKirnmoQgcHJvZmlsZe+8iOS4jeaYr+aXoOmZkOi/veWKoO+8ie+8jOaXp+eUu+WDj+iiq+imhuebllxuICogICDihpIg5Y+N5oCd5aSx6LSl6Z2Z6buY5b+955Wl77yM57ud5LiN5b2x5ZON5Li75rWB56iLXG4gKi9cblxuaW1wb3J0IHR5cGUgeyBJbnRlbnNpdHksIFN5c3RlbUNvbnRleHQgfSBmcm9tICcuL29wdGltaXplci5qcyc7XG5pbXBvcnQgeyBERUZBVUxUX0lOVEVOU0lUWSB9IGZyb20gJy4vb3B0aW1pemVyLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBTYW1wbGUge1xuICBkcmFmdDogc3RyaW5nO1xuICByZXN1bHQ6IHN0cmluZztcbiAgYXQ6IG51bWJlcjtcbiAgc2Vzc2lvbklkOiBzdHJpbmcgfCBudWxsO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE1lbW9yeVN0YXRlIHtcbiAgdmVyc2lvbjogMTtcbiAgcHJvZmlsZTogc3RyaW5nO1xuICBhY2NlcHRlZDogU2FtcGxlW107XG4gIHJlamVjdGVkOiBTYW1wbGVbXTtcbiAgc2Vzc2lvbkRyYWZ0czogUmVjb3JkPHN0cmluZywgc3RyaW5nW10+O1xuICBzdGF0czogeyBhY2NlcHRlZDogbnVtYmVyOyByZWplY3RlZDogbnVtYmVyOyBhY2NlcHRlZFNpbmNlUmVmbGVjdDogbnVtYmVyIH07XG59XG5cbmNvbnN0IEtFWSA9ICdkc2gtcHJvbXB0LW9wdGltaXplLm1lbW9yeS52MSc7XG4vKiog5pS55ZCN5YmN55qE5a2Y5YKo6ZSu77yM5oyJ5paw5Yiw5pen5o6S5YiX77yaMC4yLjAg5pu+5Y+rIGRzaC1wcm9tcHQtYXJjaGl0ZWN077yM5pu05pep5Y+rIGRzaC1wcm9tcHQtb3B0aW1pemVy44CCXG4gKiAg5LuF5Zyo5LiA5qyh5oCn6L+B56e75pe25L2/55So77yM6L+B5a6M5Y2z5Yig77yM6YG/5YWN55So5oi35Lii5o6J5bey56ev57Sv55qE5YGP5aW944CCICovXG5jb25zdCBMRUdBQ1lfS0VZUyA9IFsnZHNoLXByb21wdC1hcmNoaXRlY3QubWVtb3J5LnYxJywgJ2RzaC1wcm9tcHQtb3B0aW1pemVyLm1lbW9yeS52MSddO1xuY29uc3QgTUFYX0FDQ0VQVEVEID0gMTI7XG5jb25zdCBNQVhfUkVKRUNURUQgPSA4O1xuY29uc3QgTUFYX1NFU1NJT05fRFJBRlRTID0gMTA7XG5jb25zdCBSRUZMRUNUX0VWRVJZID0gMztcblxuZnVuY3Rpb24gZW1wdHkoKTogTWVtb3J5U3RhdGUge1xuICByZXR1cm4ge1xuICAgIHZlcnNpb246IDEsXG4gICAgcHJvZmlsZTogJycsXG4gICAgYWNjZXB0ZWQ6IFtdLFxuICAgIHJlamVjdGVkOiBbXSxcbiAgICBzZXNzaW9uRHJhZnRzOiB7fSxcbiAgICBzdGF0czogeyBhY2NlcHRlZDogMCwgcmVqZWN0ZWQ6IDAsIGFjY2VwdGVkU2luY2VSZWZsZWN0OiAwIH0sXG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0b3JhZ2UoKTogU3RvcmFnZSB8IG51bGwge1xuICB0cnkge1xuICAgIGlmICh0eXBlb2YgbG9jYWxTdG9yYWdlID09PSAndW5kZWZpbmVkJykgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIGxvY2FsU3RvcmFnZTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqIOi/h+a7pOmdnuazleagt+S+i+mhue+8iGRyYWZ0L3Jlc3VsdCDlv4XpobvmmK/pnZ7nqbrlrZfnrKbkuLLvvInigJTigJRsb2NhbFN0b3JhZ2Ug5piv5YWx5Lqr56m66Ze077yMXG4gKiAg5omL5pS5L+WFtuS7luiEmuacrC/ml6fniYjmnKzlhpnlhaXnmoTohI/mlbDmja7kuI3or6XorqkgYnVpbGRDb250ZXh0IOeahCAuc2xpY2UoKSDmipvlvILluLjjgIIgKi9cbmZ1bmN0aW9uIGFzU2FtcGxlcyh2OiB1bmtub3duKTogU2FtcGxlW10ge1xuICBpZiAoIUFycmF5LmlzQXJyYXkodikpIHJldHVybiBbXTtcbiAgcmV0dXJuIHYuZmlsdGVyKFxuICAgICh4KTogeCBpcyBTYW1wbGUgPT5cbiAgICAgIHggIT09IG51bGwgJiZcbiAgICAgIHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJlxuICAgICAgdHlwZW9mICh4IGFzIFNhbXBsZSkuZHJhZnQgPT09ICdzdHJpbmcnICYmXG4gICAgICAoeCBhcyBTYW1wbGUpLmRyYWZ0Lmxlbmd0aCA+IDAgJiZcbiAgICAgIHR5cGVvZiAoeCBhcyBTYW1wbGUpLnJlc3VsdCA9PT0gJ3N0cmluZycgJiZcbiAgICAgICh4IGFzIFNhbXBsZSkucmVzdWx0Lmxlbmd0aCA+IDAsXG4gICk7XG59XG5cbi8qKiDov4fmu6TpnZ7ms5XkvJror53ojYnnqL/ooajvvIjmr4/kuKrplK7nmoTlgLzlv4XpobvmmK/lrZfnrKbkuLLmlbDnu4TvvInjgIIgKi9cbmZ1bmN0aW9uIGFzRHJhZnRNYXAodjogdW5rbm93bik6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPiB7XG4gIGlmICh2ID09PSBudWxsIHx8IHR5cGVvZiB2ICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KHYpKSByZXR1cm4ge307XG4gIGNvbnN0IG91dDogUmVjb3JkPHN0cmluZywgc3RyaW5nW10+ID0ge307XG4gIGZvciAoY29uc3QgW2ssIGxpc3RdIG9mIE9iamVjdC5lbnRyaWVzKHYgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGxpc3QpKSBjb250aW51ZTtcbiAgICBjb25zdCBzdHJzID0gbGlzdC5maWx0ZXIoKGQpOiBkIGlzIHN0cmluZyA9PiB0eXBlb2YgZCA9PT0gJ3N0cmluZycgJiYgZC5sZW5ndGggPiAwKTtcbiAgICBpZiAoc3Rycy5sZW5ndGgpIG91dFtrXSA9IHN0cnMuc2xpY2UoLU1BWF9TRVNTSU9OX0RSQUZUUyk7XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRNZW1vcnkoKTogTWVtb3J5U3RhdGUge1xuICBjb25zdCBzID0gc3RvcmFnZSgpO1xuICBpZiAoIXMpIHJldHVybiBlbXB0eSgpO1xuICB0cnkge1xuICAgIGxldCByYXcgPSBzLmdldEl0ZW0oS0VZKTtcbiAgICAvLyDmlLnlkI3ov4Hnp7vvvJrmlrDplK7kuLrnqbrml7bmjInmlrDliLDml6fmjqXkvY/ml6fplK7ph4znmoTlrabkuaDorrDlvZVcbiAgICBpZiAoIXJhdykge1xuICAgICAgZm9yIChjb25zdCBrIG9mIExFR0FDWV9LRVlTKSB7XG4gICAgICAgIGNvbnN0IGxlZ2FjeSA9IHMuZ2V0SXRlbShrKTtcbiAgICAgICAgaWYgKCFsZWdhY3kpIGNvbnRpbnVlO1xuICAgICAgICByYXcgPSBsZWdhY3k7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcy5zZXRJdGVtKEtFWSwgbGVnYWN5KTtcbiAgICAgICAgICBzLnJlbW92ZUl0ZW0oayk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIC8qIOmFjemineaIlumakOengeaooeW8j+WPl+mZkO+8mui/geenu+Wksei0peS4jeW9seWTjeivu+WPliAqL1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIXJhdykgcmV0dXJuIGVtcHR5KCk7XG4gICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShyYXcpIGFzIFBhcnRpYWw8TWVtb3J5U3RhdGU+O1xuICAgIGNvbnN0IGJhc2UgPSBlbXB0eSgpO1xuICAgIHJldHVybiB7XG4gICAgICAuLi5iYXNlLFxuICAgICAgcHJvZmlsZTogdHlwZW9mIHBhcnNlZC5wcm9maWxlID09PSAnc3RyaW5nJyA/IHBhcnNlZC5wcm9maWxlIDogJycsXG4gICAgICBhY2NlcHRlZDogYXNTYW1wbGVzKHBhcnNlZC5hY2NlcHRlZCkuc2xpY2UoMCwgTUFYX0FDQ0VQVEVEKSxcbiAgICAgIHJlamVjdGVkOiBhc1NhbXBsZXMocGFyc2VkLnJlamVjdGVkKS5zbGljZSgwLCBNQVhfUkVKRUNURUQpLFxuICAgICAgc2Vzc2lvbkRyYWZ0czogYXNEcmFmdE1hcChwYXJzZWQuc2Vzc2lvbkRyYWZ0cyksXG4gICAgICBzdGF0czoge1xuICAgICAgICBhY2NlcHRlZDogTnVtYmVyKHBhcnNlZC5zdGF0cz8uYWNjZXB0ZWQpIHx8IDAsXG4gICAgICAgIHJlamVjdGVkOiBOdW1iZXIocGFyc2VkLnN0YXRzPy5yZWplY3RlZCkgfHwgMCxcbiAgICAgICAgYWNjZXB0ZWRTaW5jZVJlZmxlY3Q6IE51bWJlcihwYXJzZWQuc3RhdHM/LmFjY2VwdGVkU2luY2VSZWZsZWN0KSB8fCAwLFxuICAgICAgfSxcbiAgICB9O1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gZW1wdHkoKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2F2ZU1lbW9yeShtOiBNZW1vcnlTdGF0ZSk6IHZvaWQge1xuICBjb25zdCBzID0gc3RvcmFnZSgpO1xuICBpZiAoIXMpIHJldHVybjtcbiAgdHJ5IHtcbiAgICBzLnNldEl0ZW0oS0VZLCBKU09OLnN0cmluZ2lmeShtKSk7XG4gIH0gY2F0Y2gge1xuICAgIC8vIOmFjeminea7oSAvIOmakOengeaooeW8j++8mumdmem7mOmZjee6p+S4uuOAjOaXoOiusOW/huOAjVxuICB9XG59XG5cbi8qKiDnrYnlvoXnlKjmiLfoo4HlhrPnmoTmnIDov5HkuIDmrKHkvJjljJbnu5PmnpwgKi9cbmxldCBwZW5kaW5nOiBTYW1wbGUgfCBudWxsID0gbnVsbDtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlbWVtYmVyRHJhZnQoc2Vzc2lvbklkOiBzdHJpbmcgfCBudWxsLCBkcmFmdDogc3RyaW5nKTogdm9pZCB7XG4gIGNvbnN0IG0gPSBsb2FkTWVtb3J5KCk7XG4gIGNvbnN0IGtleSA9IHNlc3Npb25JZCA/PyAnXyc7XG4gIGNvbnN0IGxpc3QgPSAobS5zZXNzaW9uRHJhZnRzW2tleV0gPz8gW10pLmZpbHRlcigoZCkgPT4gZCAhPT0gZHJhZnQpO1xuICBsaXN0LnB1c2goZHJhZnQuc2xpY2UoMCwgNTAwKSk7XG4gIG0uc2Vzc2lvbkRyYWZ0c1trZXldID0gbGlzdC5zbGljZSgtTUFYX1NFU1NJT05fRFJBRlRTKTtcbiAgLy8g5Lya6K+d5p2h55uu5Lmf5Yir5peg6ZmQ5aKe6ZW/77ya5pyA5aSa5L+d55WZIDIwIOS4quS8muivnVxuICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMobS5zZXNzaW9uRHJhZnRzKTtcbiAgaWYgKGtleXMubGVuZ3RoID4gMjApIHtcbiAgICBmb3IgKGNvbnN0IGsgb2Yga2V5cy5zbGljZSgwLCBrZXlzLmxlbmd0aCAtIDIwKSkgZGVsZXRlIG0uc2Vzc2lvbkRyYWZ0c1trXTtcbiAgfVxuICBzYXZlTWVtb3J5KG0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0UGVuZGluZyhzZXNzaW9uSWQ6IHN0cmluZyB8IG51bGwsIGRyYWZ0OiBzdHJpbmcsIHJlc3VsdDogc3RyaW5nKTogdm9pZCB7XG4gIHBlbmRpbmcgPSB7IGRyYWZ0LCByZXN1bHQsIGF0OiBEYXRlLm5vdygpLCBzZXNzaW9uSWQgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc1BlbmRpbmcoKTogYm9vbGVhbiB7XG4gIHJldHVybiBwZW5kaW5nICE9PSBudWxsO1xufVxuXG4vKipcbiAqIOiusOW9leijgeWGs+e7k+aenOOAglxuICogYWNjZXB0ZWQg4oaSIOi/m+WFpSBmZXctc2hvdCDmoLfkvovmsaDvvIzlubborqHlhaXlj43mgJ3orqHmlbBcbiAqIHJlamVjdGVkIOKGkiDlj6rorrDlhaXotJ/moLfmnKzmsaDvvIjnlKjkuo7lj43mgJ3ml7bpgb/lnZHvvInvvIzkuI3lvbHlk43lj6/nlKjmoLfkvotcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlY29yZE91dGNvbWUoa2luZDogJ2FjY2VwdGVkJyB8ICdyZWplY3RlZCcpOiBib29sZWFuIHtcbiAgaWYgKCFwZW5kaW5nKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IHNhbXBsZSA9IHBlbmRpbmc7XG4gIHBlbmRpbmcgPSBudWxsO1xuXG4gIGNvbnN0IG0gPSBsb2FkTWVtb3J5KCk7XG4gIGlmIChraW5kID09PSAnYWNjZXB0ZWQnKSB7XG4gICAgbS5hY2NlcHRlZCA9IFtcbiAgICAgIHNhbXBsZSxcbiAgICAgIC4uLm0uYWNjZXB0ZWQuZmlsdGVyKCh4KSA9PiAhKHguZHJhZnQgPT09IHNhbXBsZS5kcmFmdCAmJiB4LnJlc3VsdCA9PT0gc2FtcGxlLnJlc3VsdCkpLFxuICAgIF0uc2xpY2UoMCwgTUFYX0FDQ0VQVEVEKTtcbiAgICBtLnN0YXRzLmFjY2VwdGVkICs9IDE7XG4gICAgbS5zdGF0cy5hY2NlcHRlZFNpbmNlUmVmbGVjdCArPSAxO1xuICB9IGVsc2Uge1xuICAgIG0ucmVqZWN0ZWQgPSBbc2FtcGxlLCAuLi5tLnJlamVjdGVkLmZpbHRlcigoeCkgPT4geC5kcmFmdCAhPT0gc2FtcGxlLmRyYWZ0KV0uc2xpY2UoMCwgTUFYX1JFSkVDVEVEKTtcbiAgICBtLnN0YXRzLnJlamVjdGVkICs9IDE7XG4gIH1cbiAgc2F2ZU1lbW9yeShtKTtcbiAgcmV0dXJuIGtpbmQgPT09ICdhY2NlcHRlZCc7XG59XG5cbi8qKiDnu4Too4Xms6jlhaUgc3lzdGVtIOeahOiusOW/huS4iuS4i+aWhyAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkQ29udGV4dChzZXNzaW9uSWQ6IHN0cmluZyB8IG51bGwsIGludGVuc2l0eT86IEludGVuc2l0eSk6IFN5c3RlbUNvbnRleHQge1xuICBjb25zdCBtID0gbG9hZE1lbW9yeSgpO1xuICByZXR1cm4ge1xuICAgIGludGVuc2l0eTogaW50ZW5zaXR5ID8/IERFRkFVTFRfSU5URU5TSVRZLFxuICAgIHByb2ZpbGU6IG0ucHJvZmlsZSxcbiAgICBleGFtcGxlczogbS5hY2NlcHRlZC5zbGljZSgwLCAzKS5tYXAoKHgpID0+ICh7IGRyYWZ0OiB4LmRyYWZ0LCByZXN1bHQ6IHgucmVzdWx0IH0pKSxcbiAgICByZWNlbnREcmFmdHM6IChtLnNlc3Npb25EcmFmdHNbc2Vzc2lvbklkID8/ICdfJ10gPz8gW10pLnNsaWNlKC01KSxcbiAgfTtcbn1cblxuLyoqIOaYr+WQpuivpeinpuWPkeS4gOasoeWPjeaAnSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNob3VsZFJlZmxlY3QoKTogYm9vbGVhbiB7XG4gIHJldHVybiBsb2FkTWVtb3J5KCkuc3RhdHMuYWNjZXB0ZWRTaW5jZVJlZmxlY3QgPj0gUkVGTEVDVF9FVkVSWTtcbn1cblxuLyoqIOWPjeaAneeUqOeahCBzeXN0ZW0g5o+Q56S66K+N77yIbWV0YXByb21wdO+8muiuqeaooeWei+S7jumHh+e6sy/mlL7lvIPorrDlvZXph4zmj5DngrznqLPlrprlgY/lpb3vvIkgKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFJlZmxlY3Rpb25Qcm9tcHQobGFuZzogJ3poJyB8ICdlbicpOiBzdHJpbmcge1xuICBjb25zdCBtID0gbG9hZE1lbW9yeSgpO1xuICBjb25zdCBhY2NlcHRlZCA9IG0uYWNjZXB0ZWRcbiAgICAuc2xpY2UoMCwgNilcbiAgICAubWFwKFxuICAgICAgKHgsIGkpID0+XG4gICAgICAgIGAjIyMgQSR7aSArIDF9XFxuJHtsYW5nID09PSAnemgnID8gJ+iNieeovycgOiAnZHJhZnQnfTogJHt4LmRyYWZ0LnNsaWNlKDAsIDI0MCl9XFxuYCArXG4gICAgICAgIGAke2xhbmcgPT09ICd6aCcgPyAn6KKr6YeH57qz55qE57uT5p6c77yI6IqC6YCJ77yJJyA6ICdhY2NlcHRlZCAoZXhjZXJwdCknfTpcXG4ke3gucmVzdWx0LnNsaWNlKDAsIDYwMCl9YCxcbiAgICApXG4gICAgLmpvaW4oJ1xcblxcbicpO1xuICBjb25zdCByZWplY3RlZCA9IG0ucmVqZWN0ZWRcbiAgICAuc2xpY2UoMCwgNClcbiAgICAubWFwKFxuICAgICAgKHgsIGkpID0+XG4gICAgICAgIGAjIyMgUiR7aSArIDF9XFxuJHtsYW5nID09PSAnemgnID8gJ+iNieeovycgOiAnZHJhZnQnfTogJHt4LmRyYWZ0LnNsaWNlKDAsIDI0MCl9XFxuYCArXG4gICAgICAgIGAke2xhbmcgPT09ICd6aCcgPyAn6KKr5pS+5byD55qE57uT5p6c77yI6IqC6YCJ77yJJyA6ICdyZWplY3RlZCAoZXhjZXJwdCknfTpcXG4ke3gucmVzdWx0LnNsaWNlKDAsIDQwMCl9YCxcbiAgICApXG4gICAgLmpvaW4oJ1xcblxcbicpO1xuXG4gIGlmIChsYW5nID09PSAnemgnKSB7XG4gICAgcmV0dXJuIChcbiAgICAgICfkvaDmmK/mj5DnpLror43lgY/lpb3liIbmnpDluIjjgILkuIvpnaLmmK/kuIDkvY3nlKjmiLfmnIDov5HjgIzph4fnurPjgI3lkozjgIzmlL7lvIPjgI3nmoTmj5DnpLror43ph43lhpnorrDlvZXjgIJcXG4nICtcbiAgICAgICfor7fmj5Dngrzlh7oqKueos+WumueahOOAgeWPr+WkjeeUqOeahOWBj+WlvSoq77yM5YaZ5oiQ5LiA5Lu95LiN6LaF6L+HIDYwMCDlrZfnmoTnlLvlg4/vvIzorqnkuIvkuIDkuKrotJ/otKPph43lhpnnmoTmqKHlnovmja7mraTkuqflh7rmm7TlkIjku5blj6PlkbPnmoTnu5PmnpzjgIJcXG5cXG4nICtcbiAgICAgICfopoHmsYLvvJpcXG4nICtcbiAgICAgICcxLiDlj6rlhpnku47mlbDmja7kuK0qKuWPjeWkjeWHuueOsCoq55qE5YC+5ZCR77yM5LiN6KaB5o+P6L+w5Y2V5qyh54m55L6L77ybXFxuJyArXG4gICAgICAnMi4g5YiG5LiJ5Z2X77ya57uT5p6E5YGP5aW9IC8g6aKX57KS5bqm5LiO56+H5bmFIC8g5o6q6L6e5LiO57qm5p2f6aOO5qC877ybXFxuJyArXG4gICAgICAnMy4g55So56WI5L2/5Y+l6ZmI6L+w5Y+v5omn6KGM6KeE5YiZ77yI5aaC44CM6buY6K6k5Yqg6aqM5pS25qCH5YeG44CN44CM5LiN6KaB55So44CO6K+344CP6L+Z57G75a6i5aWX5YmN57yA44CN77yJ77ybXFxuJyArXG4gICAgICAnNC4g6YeH57qz5qC35pys5L2T546w5q2j6Z2i5YGP5aW977yM5pS+5byD5qC35pys5L2T546w6KaB6KeE6YG/55qE5YGa5rOV77yM5Lik6L656YO96KaB5Yip55So77ybXFxuJyArXG4gICAgICAnNS4g55u05o6l6L6T5Ye655S75YOP5q2j5paH77yM5LiN6KaB5qCH6aKY44CB5LiN6KaB6Kej6YeK44CB5LiN6KaB44CM5Lul5LiL5piv44CN44CCXFxuXFxuJyArXG4gICAgICAobS5wcm9maWxlID8gYCMg5LiK5LiA54mI55S75YOP77yI5Y+v5Zyo5q2k5Z+656GA5LiK5L+u6K6i77yM6YG/5YWN5o6o5YCS6YeN5p2l77yJXFxuJHttLnByb2ZpbGV9XFxuXFxuYCA6ICcnKSArXG4gICAgICBgIyDph4fnurPorrDlvZVcXG4ke2FjY2VwdGVkIHx8ICfvvIjml6DvvIknfVxcblxcbiMg5pS+5byD6K6w5b2VXFxuJHtyZWplY3RlZCB8fCAn77yI5peg77yJJ31gXG4gICAgKTtcbiAgfVxuICByZXR1cm4gKFxuICAgICdZb3UgYW5hbHl6ZSBwcm9tcHQgcHJlZmVyZW5jZXMuIEJlbG93IGFyZSBhIHVzZXJcXCdzIHJlY2VudGx5IEFDQ0VQVEVEIGFuZCBSRUpFQ1RFRCBwcm9tcHQgcmV3cml0ZXMuXFxuJyArXG4gICAgJ0V4dHJhY3QgdGhlIFNUQUJMRSwgcmV1c2FibGUgcHJlZmVyZW5jZXMgaW50byBhIHByb2ZpbGUgb2YgYXQgbW9zdCA2MDAgd29yZHMgc28gdGhlIG5leHQgcmV3cml0aW5nIG1vZGVsIGNhbiBtYXRjaCB0aGVpciB0YXN0ZS5cXG5cXG4nICtcbiAgICAnUnVsZXM6XFxuJyArXG4gICAgJzEuIE9ubHkgc3RhdGUgdGVuZGVuY2llcyB0aGF0IHJlY3VyIGFjcm9zcyBzYW1wbGVzOyBpZ25vcmUgb25lLW9mZnMuXFxuJyArXG4gICAgJzIuIFVzZSB0aHJlZSBibG9ja3M6IFN0cnVjdHVyZSAvIEdyYW51bGFyaXR5ICYgbGVuZ3RoIC8gV29yZGluZyAmIGNvbnN0cmFpbnQgc3R5bGUuXFxuJyArXG4gICAgJzMuIFBocmFzZSBlYWNoIGFzIGFuIGV4ZWN1dGFibGUgaW1wZXJhdGl2ZSAoXCJkZWZhdWx0IHRvIGFkZGluZyBhY2NlcHRhbmNlIGNyaXRlcmlhXCIpLlxcbicgK1xuICAgICc0LiBVc2UgYWNjZXB0ZWQgc2FtcGxlcyBmb3IgcG9zaXRpdmUgcHJlZmVyZW5jZSBhbmQgcmVqZWN0ZWQgb25lcyBmb3Igd2hhdCB0byBhdm9pZC5cXG4nICtcbiAgICAnNS4gT3V0cHV0IHRoZSBwcm9maWxlIGJvZHkgb25seSDigJQgbm8gdGl0bGUsIG5vIHByZWFtYmxlLlxcblxcbicgK1xuICAgIChtLnByb2ZpbGUgPyBgIyBQcmV2aW91cyBwcm9maWxlIChyZXZpc2UgaXQsIGRvIG5vdCBzdGFydCBvdmVyKVxcbiR7bS5wcm9maWxlfVxcblxcbmAgOiAnJykgK1xuICAgIGAjIEFjY2VwdGVkXFxuJHthY2NlcHRlZCB8fCAnKG5vbmUpJ31cXG5cXG4jIFJlamVjdGVkXFxuJHtyZWplY3RlZCB8fCAnKG5vbmUpJ31gXG4gICk7XG59XG5cbi8qKiDlj43mgJ3miJDlip/vvJrmnInnlYzmm7/mjaIgcHJvZmlsZSDlubbmuIXpm7borqHmlbAgKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBseVJlZmxlY3Rpb24odGV4dDogc3RyaW5nKTogdm9pZCB7XG4gIGNvbnN0IGNsZWFuID0gdGV4dC50cmltKCkucmVwbGFjZSgvXmBgYFthLXpBLVpdKlxcbj98XFxuP2BgYCQvZywgJycpLnRyaW0oKTtcbiAgaWYgKCFjbGVhbikgcmV0dXJuO1xuICBjb25zdCBtID0gbG9hZE1lbW9yeSgpO1xuICBtLnByb2ZpbGUgPSBjbGVhbi5zbGljZSgwLCAxNTAwKTtcbiAgbS5zdGF0cy5hY2NlcHRlZFNpbmNlUmVmbGVjdCA9IDA7XG4gIHNhdmVNZW1vcnkobSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhck1lbW9yeSgpOiB2b2lkIHtcbiAgcGVuZGluZyA9IG51bGw7XG4gIGNvbnN0IHMgPSBzdG9yYWdlKCk7XG4gIGlmICghcykgcmV0dXJuO1xuICB0cnkge1xuICAgIHMucmVtb3ZlSXRlbShLRVkpO1xuICB9IGNhdGNoIHtcbiAgICAvLyDlv73nlaVcbiAgfVxufVxuXG4vKiog5L6b6K6+572u6aG1IC8g6K+K5pat5bGV56S6ICovXG5leHBvcnQgZnVuY3Rpb24gbWVtb3J5U3VtbWFyeSgpOiB7IGFjY2VwdGVkOiBudW1iZXI7IHJlamVjdGVkOiBudW1iZXI7IGhhc1Byb2ZpbGU6IGJvb2xlYW47IGNoYXJzOiBudW1iZXIgfSB7XG4gIGNvbnN0IG0gPSBsb2FkTWVtb3J5KCk7XG4gIHJldHVybiB7XG4gICAgYWNjZXB0ZWQ6IG0uc3RhdHMuYWNjZXB0ZWQsXG4gICAgcmVqZWN0ZWQ6IG0uc3RhdHMucmVqZWN0ZWQsXG4gICAgaGFzUHJvZmlsZTogbS5wcm9maWxlLnRyaW0oKS5sZW5ndGggPiAwLFxuICAgIGNoYXJzOiBtLnByb2ZpbGUubGVuZ3RoLFxuICB9O1xufVxuIiwgIi8qKiDpooTop4jljaHniYfnirbmgIHmnLog4oCU4oCUIOe6ryByZWR1Y2Vy77yM5pegIERTSCDkvp3otZYgKi9cblxuaW1wb3J0IHR5cGUgeyBPcHRpbWl6ZUVycm9yS2luZCB9IGZyb20gJy4vb3B0aW1pemVyLmpzJztcblxuZXhwb3J0IHR5cGUgUHJldmlld1N0YXR1cyA9ICdpZGxlJyB8ICdvcHRpbWl6aW5nJyB8ICdwcmV2aWV3JyB8ICdlcnJvcicgfCAnZ3VpZGUnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFByZXZpZXdTdGF0ZSB7XG4gIHN0YXR1czogUHJldmlld1N0YXR1cztcbiAgcmVzdWx0OiBzdHJpbmc7XG4gIGVycm9yS2luZDogT3B0aW1pemVFcnJvcktpbmQgfCBudWxsO1xuICAvKiog5Y6f5aeL6ZSZ6K+v57uG6IqC77yI5a6/5Li76YCa6YGT5aSx6LSl562J5Y6f5Zug77yM5Y2h54mH5pi+56S65Ye65p2l5L6/5LqO6K+K5pat77yJICovXG4gIGVycm9yRGV0YWlsOiBzdHJpbmcgfCBudWxsO1xuICBnZW5lcmF0aW9uOiBudW1iZXI7XG4gIC8qKiDmtYHlvI/kvJjljJbkuK3nmoTlop7ph4/mlofmnKzvvIhvcHRpbWl6aW5nIOaAgeWunuaXtuabtOaWsO+8m+mdnua1geW8j+WFqOeoi+S4uuepuuS4su+8iSAqL1xuICBkcmFmdDogc3RyaW5nO1xuICAvKiog5rWB5byP5LyY5YyW5Lit55qE5o6o55CG6L+H56iL5paH5pys77yI5qih5Z6L5YWI5LqnIHJlYXNvbmluZyDlho3kuqfnrZTmoYjvvJvpmo8gU1NFIOWunuaXtua7muWKqO+8iSAqL1xuICByZWFzb25pbmc6IHN0cmluZztcbiAgLyoqIOWPkei1t+S8mOWMlueahOS8muivnSBpZO+8iG51bGwgPSDmnKrnu5Hlrpov5YWo5bGA77yJ77ya6aKE6KeI56qX5Y+j5Y+q5bGe5LqO6K+l5Lya6K+d77yM5YiH6LWw5LiN6Lef6ZqPICovXG4gIHNlc3Npb25JZDogc3RyaW5nIHwgbnVsbDtcbiAgLyoqIOWuv+S4u+mAmumBk+W9k+WJjeatpemqpO+8iCdtb2RlbCcgfCAnc3RhcnQnIHwgJ3BvbGwnIHwgbnVsbO+8ie+8muWNoeeJh+aYvuekuui/m+W6pu+8jOWumuS9jeWNoeeCuSAqL1xuICBzdGVwOiAnbW9kZWwnIHwgJ3N0YXJ0JyB8ICdwb2xsJyB8IG51bGw7XG59XG5cbi8qKiDlj6ror7vlhbHkuqvluLjph4/vvJpyZWR1Y2VyIOawuOS4jeWGmeWbnuWug+aIlui/lOWbnuWPr+WPmOeahOaWsOWvueixoe+8m+a2iOi0ueiAhe+8iFRhc2sgNCBzdG9yZSDog7bmsLTvvInlv4Xpobvku6UgeyAuLi5JTklUSUFMX1BSRVZJRVcgfSDkuLrmr4/kvJror53np43lrZAgKi9cbmV4cG9ydCBjb25zdCBJTklUSUFMX1BSRVZJRVc6IFByZXZpZXdTdGF0ZSA9IHtcbiAgc3RhdHVzOiAnaWRsZScsXG4gIHJlc3VsdDogJycsXG4gIGVycm9yS2luZDogbnVsbCxcbiAgZXJyb3JEZXRhaWw6IG51bGwsXG4gIGdlbmVyYXRpb246IDAsXG4gIGRyYWZ0OiAnJyxcbiAgcmVhc29uaW5nOiAnJyxcbiAgc2Vzc2lvbklkOiBudWxsLFxuICBzdGVwOiBudWxsLFxufTtcblxuZXhwb3J0IHR5cGUgUHJldmlld0FjdGlvbiA9XG4gIHwgeyB0eXBlOiAnYmVnaW4nOyBzZXNzaW9uSWQ/OiBzdHJpbmcgfCBudWxsIH1cbiAgfCB7IHR5cGU6ICdzaG93JzsgcmVzdWx0OiBzdHJpbmcgfVxuICB8IHsgdHlwZTogJ2ZhaWwnOyBraW5kOiBPcHRpbWl6ZUVycm9yS2luZDsgZGV0YWlsPzogc3RyaW5nIH1cbiAgfCB7IHR5cGU6ICdndWlkZScgfVxuICB8IHsgdHlwZTogJ2Nsb3NlJyB9XG4gIHwgeyB0eXBlOiAnZHJhZnQnOyB0ZXh0OiBzdHJpbmcgfVxuICB8IHsgdHlwZTogJ3JlYXNvbmluZyc7IHRleHQ6IHN0cmluZyB9XG4gIHwgeyB0eXBlOiAnc3RlcCc7IHN0ZXA6ICdtb2RlbCcgfCAnc3RhcnQnIHwgJ3BvbGwnIHwgbnVsbCB9O1xuXG5leHBvcnQgZnVuY3Rpb24gcmVkdWNlUHJldmlldyhzdGF0ZTogUHJldmlld1N0YXRlLCBhY3Rpb246IFByZXZpZXdBY3Rpb24pOiBQcmV2aWV3U3RhdGUge1xuICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgY2FzZSAnYmVnaW4nOlxuICAgICAgaWYgKHN0YXRlLnN0YXR1cyA9PT0gJ29wdGltaXppbmcnKSByZXR1cm4gc3RhdGU7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgc3RhdHVzOiAnb3B0aW1pemluZycsXG4gICAgICAgIGVycm9yS2luZDogbnVsbCxcbiAgICAgICAgZXJyb3JEZXRhaWw6IG51bGwsXG4gICAgICAgIGRyYWZ0OiAnJyxcbiAgICAgICAgc2Vzc2lvbklkOiBhY3Rpb24uc2Vzc2lvbklkID8/IG51bGwsXG4gICAgICAgIHN0ZXA6ICdtb2RlbCcsXG4gICAgICAgIGdlbmVyYXRpb246IHN0YXRlLmdlbmVyYXRpb24gKyAxLFxuICAgICAgfTtcbiAgICBjYXNlICdzaG93JzpcbiAgICAgIHJldHVybiBzdGF0ZS5zdGF0dXMgPT09ICdvcHRpbWl6aW5nJ1xuICAgICAgICA/IHsgLi4uc3RhdGUsIHN0YXR1czogJ3ByZXZpZXcnLCByZXN1bHQ6IGFjdGlvbi5yZXN1bHQsIGRyYWZ0OiAnJyB9XG4gICAgICAgIDogc3RhdGU7XG4gICAgY2FzZSAnZmFpbCc6XG4gICAgICByZXR1cm4gc3RhdGUuc3RhdHVzID09PSAnb3B0aW1pemluZydcbiAgICAgICAgPyB7IC4uLnN0YXRlLCBzdGF0dXM6ICdlcnJvcicsIGVycm9yS2luZDogYWN0aW9uLmtpbmQsIGVycm9yRGV0YWlsOiBhY3Rpb24uZGV0YWlsID8/IG51bGwgfVxuICAgICAgICA6IHN0YXRlO1xuICAgIGNhc2UgJ2d1aWRlJzpcbiAgICAgIC8vIGd1aWRlIOaYryBydW5PcHRpbWl6ZSDlnKjjgIzphY3nva7nvLrlpLHjgI3ml7bnmoTnu4jmgIHvvIzlv4Xpobvog73ku47ku7vkvZXnirbmgIHov5vlhaXigJTigJRcbiAgICAgIC8vIOaXp+eJiOWcqCBvcHRpbWl6aW5nIOaAgeebtOaOpeW/veeVpe+8jOiAjCBydW5PcHRpbWl6ZSDlhYggYmVnaW4g5YaNIGd1aWRl77yMXG4gICAgICAvLyDlr7zoh7TlvJXlr7zljaHooqvlkJ7jgIHnirbmgIHljaHmrbvlnKjjgIzmraPlnKjkvJjljJbjgI3vvIjlrp7mtYsgYnVn77yJ44CCXG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgc3RhdHVzOiAnZ3VpZGUnLFxuICAgICAgICBlcnJvcktpbmQ6IG51bGwsXG4gICAgICAgIGVycm9yRGV0YWlsOiBudWxsLFxuICAgICAgICBkcmFmdDogJycsXG4gICAgICAgIHJlYXNvbmluZzogJycsXG4gICAgICAgIHN0ZXA6IG51bGwsXG4gICAgICB9O1xuICAgIGNhc2UgJ2Nsb3NlJzpcbiAgICAgIHJldHVybiBJTklUSUFMX1BSRVZJRVc7XG4gICAgY2FzZSAnZHJhZnQnOlxuICAgICAgcmV0dXJuIHN0YXRlLnN0YXR1cyA9PT0gJ29wdGltaXppbmcnID8geyAuLi5zdGF0ZSwgZHJhZnQ6IGFjdGlvbi50ZXh0IH0gOiBzdGF0ZTtcbiAgICBjYXNlICdyZWFzb25pbmcnOlxuICAgICAgcmV0dXJuIHN0YXRlLnN0YXR1cyA9PT0gJ29wdGltaXppbmcnID8geyAuLi5zdGF0ZSwgcmVhc29uaW5nOiBhY3Rpb24udGV4dCB9IDogc3RhdGU7XG4gICAgY2FzZSAnc3RlcCc6XG4gICAgICByZXR1cm4gc3RhdGUuc3RhdHVzID09PSAnb3B0aW1pemluZycgPyB7IC4uLnN0YXRlLCBzdGVwOiBhY3Rpb24uc3RlcCB9IDogc3RhdGU7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgfVxufVxuXG4vKiog6K6h5YiS6KeE5a6a55qE5YWs5byAIEFQSe+8iFRhc2sgNCDotbflrZjlnKjvvJtjYW5UcmlnZ2VyIOeahCAhYnVzeSDljYrovrnmib/mi4Xlubblj5HmiorlhbPogYzotKPvvIzlhbbkvZnkv53nlZnku6XlpIflkI7nu63mtojotLnogIXvvIkgKi9cbmV4cG9ydCBmdW5jdGlvbiBjYW5PcHRpbWl6ZUZyb20oc3RhdHVzOiBQcmV2aWV3U3RhdHVzKTogYm9vbGVhbiB7XG4gIHJldHVybiBzdGF0dXMgIT09ICdvcHRpbWl6aW5nJztcbn1cbiIsICIvKiog6aKE6KeI54q25oCB5qih5Z2X57qn5LqL5Lu25oC757q/IOKAlOKAlCDmjInpkq4v6aKE6KeI5Y2hL3J1bk9wdGltaXplIOWFseS6q++8jOS4jeS+nei1luS8muivnSBzdG9yZS9ob29rICovXG5cbmltcG9ydCB7XG4gIElOSVRJQUxfUFJFVklFVyxcbiAgcmVkdWNlUHJldmlldyxcbiAgdHlwZSBQcmV2aWV3QWN0aW9uLFxuICB0eXBlIFByZXZpZXdTdGF0ZSxcbn0gZnJvbSAnLi9wcmV2aWV3LXN0YXRlLmpzJztcblxuLyoqIOaooeWdl+e6p+WNleS+i+eKtuaAge+8iOavj+aPkuS7tuWunuS+i+S4gOS7ve+8mua4suafk+i/m+eoi+WGheWFqOWxgOWUr+S4gO+8iSAqL1xubGV0IHN0YXRlOiBQcmV2aWV3U3RhdGUgPSB7IC4uLklOSVRJQUxfUFJFVklFVyB9O1xuY29uc3QgbGlzdGVuZXJzID0gbmV3IFNldDwoKSA9PiB2b2lkPigpO1xuXG4vKiog6K+75b2T5YmN5b+r54Wn77yI56iz5a6a5byV55So55u05Yiw5LiL5LiA5qyhIGRpc3BhdGNo77yJICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJldmlld0J1c1N0YXRlKCk6IFByZXZpZXdTdGF0ZSB7XG4gIHJldHVybiBzdGF0ZTtcbn1cblxuLyoqIOa0vuWPkeeKtuaAgeacuuWKqOS9nOW5tumAmuefpeiuoumYheiAhSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpc3BhdGNoUHJldmlldyhhY3Rpb246IFByZXZpZXdBY3Rpb24pOiB2b2lkIHtcbiAgc3RhdGUgPSByZWR1Y2VQcmV2aWV3KHN0YXRlLCBhY3Rpb24pO1xuICBmb3IgKGNvbnN0IGxpc3RlbmVyIG9mIGxpc3RlbmVycykgbGlzdGVuZXIoKTtcbn1cblxuLyoqIOiuoumYheWPmOWMlu+8m+i/lOWbnumAgOiuouWHveaVsCAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1YnNjcmliZVByZXZpZXdCdXMobGlzdGVuZXI6ICgpID0+IHZvaWQpOiAoKSA9PiB2b2lkIHtcbiAgbGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XG4gIHJldHVybiAoKSA9PiB7XG4gICAgbGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gIH07XG59IiwgIi8qKiDkvJjljJbnvJbmjpIgcnVuT3B0aW1pemUgKyDmqKHlnZfnuqflnKjpgJTmjqfliLYg4oCU4oCUIOeKtuaAgee7j+aooeWdl+e6p+S6i+S7tuaAu+e6v++8iHByZXZpZXctYnVz77yJ5Y+R5biD77yMXG4gKiAg5LiN5L6d6LWW5Lya6K+dIHN0b3JlL2hvb2sgcHJvcHPvvIjmoYzpnaLmuLLmn5PlsYLlr7kgaW5wdXQucmlnaHQvb3ZlcmxheSDmp73kvY3kuI3mj5Dkvpvov5nkupvmoIflh4YgcHJvcHPvvIxcbiAqICDnu4Tku7bkvp3otZblroPku6zkvJrltKnlubbooqvplJnor6/ovrnnlYzlkJ7mjonigJTigJRQTy1SSUdIVC1PSyDmjqLpkojlj6/op4HogIwg4pyoL+mihOiniOWNoeS4jeWPr+ingeeahOWunua1i+Wumuiuuu+8ieOAgiAqL1xuXG5pbXBvcnQge1xuICBjaGVja0NvbmZpZyxcbiAgbm9ybWFsaXplUHJvbXB0VGV4dCxcbiAgb3B0aW1pemVTdHJlYW0sXG4gIHJlc29sdmVTZXNzaW9uTW9kZWwsXG4gIHN0cmlwTGVhZEluLFxuICBSRVFVRVNUX1RJTUVPVVRfTVMsXG4gIHRvRXJyb3JLaW5kLFxuICB0eXBlIExhbmcsXG4gIHR5cGUgT3B0aW1pemVFcnJvcktpbmQsXG4gIHR5cGUgUHJvbXB0Q29uZmlnLFxufSBmcm9tICcuL29wdGltaXplci5qcyc7XG5pbXBvcnQgeyBydW5Ib3N0T3B0aW1pemUsIHN0cmVhbUhvc3RPcHRpbWl6ZSwgdHlwZSBIb3N0UnBjIH0gZnJvbSAnLi9zZXNzaW9uLW9wdGltaXplci5qcyc7XG5pbXBvcnQgeyBidWlsZFN5c3RlbVByb21wdCB9IGZyb20gJy4vb3B0aW1pemVyLmpzJztcbmltcG9ydCB7XG4gIGFwcGx5UmVmbGVjdGlvbixcbiAgYnVpbGRDb250ZXh0LFxuICBidWlsZFJlZmxlY3Rpb25Qcm9tcHQsXG4gIHJlbWVtYmVyRHJhZnQsXG4gIHNldFBlbmRpbmcsXG4gIHNob3VsZFJlZmxlY3QsXG59IGZyb20gJy4vbWVtb3J5LmpzJztcbmltcG9ydCB7IGRpc3BhdGNoUHJldmlldyB9IGZyb20gJy4vcHJldmlldy1idXMuanMnO1xuXG4vKipcbiAqIOW9k+WJjSBpbi1mbGlnaHQg6K+35rGC55qE5o6n5Yi25Zmo77yI5qih5Z2X57qn77yJ77yaXG4gKiAtIOWFs+mXreWNoeeJh+aXtuS4reatouWug++8jOmYsuatoui/n+WIsOeahCBzaG93KCkvZmFpbCgpIOWkjea0u+W3suWFs+mXreWNoeeJh++8m1xuICogLSBydW5PcHRpbWl6ZSDku6XjgIzlrZjlnKjlnKjpgJTmjqfliLblmajjgI3kuLrlubblj5HmiorlhbPvvIjlkIzkuIDml7bliLvlj6rlhYHorrjkuIDkuKror7fmsYLlnKjpgJTvvInjgIJcbiAqIOazqO+8muaooeWdl+e6p+aEj+WRs+edgOWkmuS8muivneWQjOaXtuS8mOWMluS8muS6kuebuOiuqei3r+KAlOKAlOi+k+WFpeagj+WNleS8muivneiBmueEpueahOS6pOS6kuS4i+WPr+aOpeWPl+atpOeugOWMluOAglxuICovXG5sZXQgYWN0aXZlQ29udHJvbGxlcjogQWJvcnRDb250cm9sbGVyIHwgbnVsbCA9IG51bGw7XG4vKiog5Zyo6YCU6K+35rGC55qE5Y+R6LW35Lya6K+d77yI5bm25Y+R5oqK5YWz5oyJ5Lya6K+d77ya5ZCM5Lya6K+d6Ziy5oqW77yb5byC5Lya6K+d6K6p6Lev77yJICovXG5sZXQgYWN0aXZlU2Vzc2lvbklkOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuLyoqXG4gKiDlrr/kuLvpgJrpgZPmlbTkvZPotoXml7bvvJrlr7npvZAgc3RyZWFtSG9zdE9wdGltaXplIOeahOWGhemDqOm7mOiupCAxMjBz44CCXG4gKiB2NCDns7vmqKHlnovlhYjovpPlh7rplb/mrrUgcmVhc29uaW5n77yMNjBz77yIZmV0Y2gg6YCa6YGT55qEIFJFUVVFU1RfVElNRU9VVF9NU++8iee7j+W4uOS4jeWkn+KAlOKAlFxuICog5pen54mI5aSW5bGCIDYwcyDorqHml7blmajkvJrmj5DliY0gYWJvcnQg5o6J5pys5p2lIDEyMHMg5YaF6IO95a6M5oiQ55qE5a6/5Li75rWB5byP44CCXG4gKi9cbmNvbnN0IEhPU1RfVElNRU9VVF9NUyA9IDEyMF8wMDA7XG5cbi8qKiDlhbPpl63pooTop4jljaHvvIjlubbkuK3mraLlnKjpgJTor7fmsYLvvIkgKi9cbmV4cG9ydCBmdW5jdGlvbiBjbG9zZVByZXZpZXcoKTogdm9pZCB7XG4gIGlmIChhY3RpdmVDb250cm9sbGVyICE9PSBudWxsKSB7XG4gICAgYWN0aXZlQ29udHJvbGxlci5hYm9ydCgpO1xuICAgIGFjdGl2ZUNvbnRyb2xsZXIgPSBudWxsO1xuICB9XG4gIGFjdGl2ZVNlc3Npb25JZCA9IG51bGw7XG4gIGRpc3BhdGNoUHJldmlldyh7IHR5cGU6ICdjbG9zZScgfSk7XG59XG5cbi8qKiDkvJjljJbnvJbmjpLvvJrlrr/kuLvpgJrpgZPvvIjpm7bphY3nva7vvInihpIg6I2J56i/56m6IOKGkiDnm7TmjqXov5Tlm57vvJvphY3nva7nvLrlpLHvvIhmZXRjaCDpgJrpgZPvvInihpIgZ3VpZGXvvJvlubblj5Eg4oaSIOS4ouW8g++8m+i2heaXti/lj5bmtogg4oaSIHRpbWVvdXQg5oiW6Z2Z6buYICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuT3B0aW1pemUoY3R4OiB7XG4gIGdldENvbmZpZygpOiBQcm9tcHRDb25maWc7XG4gIGdldExhbmcoKTogTGFuZztcbiAgZ2V0RHJhZnQoKTogc3RyaW5nO1xuICAvKiog5a6/5Li75qih5Z6L77yIVUkg5qCH562+77yJ77yb5a6/5Li76YCa6YGT5YaF6YOo6Ieq6KGM6Kej5p6QICovXG4gIGdldFNlc3Npb25Nb2RlbD8oKTogUHJvbWlzZTx7IHByb3ZpZGVyOiBzdHJpbmc7IG1vZGVsOiBzdHJpbmcgfSB8IG51bGw+O1xuICAvKiog5a6/5Li76YCa6YGT77yIdXNlU2Vzc2lvbk1vZGVsIOW8gOWQr+aXtueUqO+8ie+8muiHquaciSBSUEMg4oaSIHNlcnZlciBoYWxmIOeahCBsbG0uc3RyZWFt77yM6Zu26YWN572uICovXG4gIGhvc3Q/OiB7XG4gICAgcnBjOiBIb3N0UnBjO1xuICB9O1xuICAvKiog5Y+R6LW35LyY5YyW55qE5Lya6K+dIGlk77yI57uR5a6a6aKE6KeI56qX5Y+j77yM5YiH5Lya6K+d5LiN6Lef6ZqP77yJICovXG4gIGdldFNlc3Npb25JZD8oKTogc3RyaW5nIHwgbnVsbDtcbn0pOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgY29uZmlnID0gY3R4LmdldENvbmZpZygpO1xuICAvLyDlhaXlj6PlkIzmoLflh4DljJbkuIDpgY3vvJrku44gSlNPTiAvIOaXpeW/l+mHjOeymOWHuuadpeeahOiNieeov+W4uOW4puWtl+mdoiBcIlxcblwi77yM5qih5Z6L5Lya54Wn5oqE77yMXG4gIC8vIOWvvOiHtOacgOe7iOe7k+aenOeymOWbnui+k+WFpeahhuS4jeaNouihjOOAguWPquWcqOmrmOe9ruS/oeadoeS7tuS4i+i/mOWOn++8jOS7o+eggeexu+iNieeov+S4jeWPl+W9seWTjeOAglxuICBjb25zdCBkcmFmdCA9IG5vcm1hbGl6ZVByb21wdFRleHQoY3R4LmdldERyYWZ0KCkpLnRyaW0oKTtcbiAgaWYgKCFkcmFmdCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHNlc3Npb25JZCA9IGN0eC5nZXRTZXNzaW9uSWQ/LigpID8/IG51bGw7XG5cbiAgLy8g6K6w5b+G77ya5YWI55m76K6w5pys5qyh6I2J56i/77yITDEg5Lya6K+d6K6w5b+G77yJ77yM5YaN5oqKIEwyIOagt+S+iyArIEwzIOWBj+WlveeUu+WDj+azqOWFpSBzeXN0ZW3jgIJcbiAgLy8g6L+Z5LiA5q2l5b+F6aG75Zyo5p6E6YCgIHN5c3RlbSDkuYvliY3vvIzkuJTkuI3kvp3otZbku7vkvZXnvZHnu5wg4oCU4oCUIOiusOW/huWksei0peS5n+WPquS8mumAgOWMluaIkOOAjOaXoOiusOW/huOAjeOAglxuICByZW1lbWJlckRyYWZ0KHNlc3Npb25JZCwgZHJhZnQpO1xuICBjb25zdCBtZW1vcnlDdHggPSBidWlsZENvbnRleHQoc2Vzc2lvbklkLCBjb25maWcuaW50ZW5zaXR5KTtcbiAgY29uc3Qgc3lzdGVtID0gYnVpbGRTeXN0ZW1Qcm9tcHQoY3R4LmdldExhbmcoKSwgbWVtb3J5Q3R4KTtcblxuICAvLyDlubblj5HmiorlhbPvvJrlkIzkvJror53lnKjpgJQg4oaSIOS4ouW8g+acrOasoeinpuWPke+8iOaMiemSriBidXN5IOW3suemgeeUqOeCueWHu++8jOi/memHjOaYr+ernuaAgeacgOWQjumYsue6v++8ie+8m1xuICAvLyDliIfmjaLkvJror53lkI7lj5Hotbcg4oaSIOS4reatouaXp+ivt+axguiuqei3r++8iOWQhOS8muivneWPr+eLrOeri+S8mOWMlu+8jOWuv+S4u+S4tOaXtuS8muivneeUsSBjYW5jZWwg5pS25bC+77yJXG4gIGlmIChhY3RpdmVDb250cm9sbGVyICE9PSBudWxsKSB7XG4gICAgaWYgKHNlc3Npb25JZCA9PT0gYWN0aXZlU2Vzc2lvbklkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGFjdGl2ZUNvbnRyb2xsZXIuYWJvcnQoKTtcbiAgICBhY3RpdmVDb250cm9sbGVyID0gbnVsbDtcbiAgICBhY3RpdmVTZXNzaW9uSWQgPSBudWxsO1xuICB9XG4gIGRpc3BhdGNoUHJldmlldyh7IHR5cGU6ICdiZWdpbicsIHNlc3Npb25JZCB9KTtcblxuICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICBhY3RpdmVDb250cm9sbGVyID0gY29udHJvbGxlcjsgLy8g5rOo5YaM57uZIGNsb3NlUHJldmlldygp77yM5L6b5Y2h54mH5YWz6Zet5pe25Y+W5raI5Zyo6YCU6K+35rGCXG4gIGFjdGl2ZVNlc3Npb25JZCA9IHNlc3Npb25JZDtcbiAgY29uc3QgdXNlSG9zdCA9IGNvbmZpZy51c2VTZXNzaW9uTW9kZWwgJiYgISFjdHguaG9zdDtcbiAgbGV0IHRpbWVkT3V0ID0gZmFsc2U7XG4gIGNvbnN0IHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgdGltZWRPdXQgPSB0cnVlO1xuICAgIGNvbnRyb2xsZXIuYWJvcnQoKTtcbiAgfSwgdXNlSG9zdCA/IEhPU1RfVElNRU9VVF9NUyA6IFJFUVVFU1RfVElNRU9VVF9NUyk7XG5cbiAgdHJ5IHtcbiAgICAvLyDkvJror53mqKHlnovmqKHlvI/vvIjpu5jorqTvvInvvJrlrr/kuLvkuLTml7blr7nor53pgJrpgZMg4oCU4oCUIOmbtumFjee9ru+8jOaXoOmcgCBjaGVja0NvbmZpZ1xuICAgIGlmICh1c2VIb3N0KSB7XG4gICAgICBhd2FpdCBzdHJlYW1Ib3N0T3B0aW1pemUoe1xuICAgICAgICBycGM6IGN0eC5ob3N0IS5ycGMsXG4gICAgICAgIHRleHQ6IGRyYWZ0LFxuICAgICAgICBzeXN0ZW0sXG4gICAgICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwsXG4gICAgICAgIHJwY1RpbWVvdXRNczogNTAwMCxcbiAgICAgICAgb25EZWx0YTogKHRleHQpID0+IGRpc3BhdGNoUHJldmlldyh7IHR5cGU6ICdkcmFmdCcsIHRleHQgfSksXG4gICAgICAgIG9uUmVhc29uaW5nOiAodGV4dCkgPT4gZGlzcGF0Y2hQcmV2aWV3KHsgdHlwZTogJ3JlYXNvbmluZycsIHRleHQgfSksXG4gICAgICAgIG9uU3RlcDogKHN0ZXApID0+IGRpc3BhdGNoUHJldmlldyh7IHR5cGU6ICdzdGVwJywgc3RlcCB9KSxcbiAgICAgIH0pLnRoZW4oXG4gICAgICAgIChmaW5hbFRleHQpID0+IHtcbiAgICAgICAgICAvLyBTU0Ug5bey6YCQIHRva2VuIOa1gei/hyBkcmFmdO+8m+aUtuWwvuS7heWIh+WIsOe7k+aenOaAge+8iOW5tuWJpeemu+WPr+iDveeahOWJjee8gOW8leWvvOivre+8jOS/neivgeWPr+S4gOmUruabv+aNou+8iVxuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHN0cmlwTGVhZEluKGZpbmFsVGV4dCk7XG4gICAgICAgICAgaWYgKCFyZXN1bHQudHJpbSgpKSB7XG4gICAgICAgICAgICAvLyDlrr/kuLvkvqfnqbrkuqflh7rvvIjpgJrpgZPlvILluLjnu5PmnZ/nrYnvvInvvJrmjInlpLHotKXlpITnkIbvvIznu53kuI3og73miornqbrkuLLmm7/mjaLov5vojYnnqL9cbiAgICAgICAgICAgIGRpc3BhdGNoUHJldmlldyh7IHR5cGU6ICdmYWlsJywga2luZDogJ2VtcHR5JyB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8g5oyC6LW35pys5qyh44CM6I2J56i/IOKGkiDnu5PmnpzjgI3lr7nvvIznrYnnlKjmiLfngrnph4fnurMv5pS+5byD5ZCO5YaN5Yaz5a6a6L+b5q2j5qC35pys6L+Y5piv6LSf5qC35pysXG4gICAgICAgICAgc2V0UGVuZGluZyhzZXNzaW9uSWQsIGRyYWZ0LCByZXN1bHQpO1xuICAgICAgICAgIGRpc3BhdGNoUHJldmlldyh7IHR5cGU6ICdzaG93JywgcmVzdWx0IH0pO1xuICAgICAgICB9LFxuICAgICAgICAoZSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGlzQWJvcnQgPVxuICAgICAgICAgICAgKGUgaW5zdGFuY2VvZiBET01FeGNlcHRpb24gJiYgZS5uYW1lID09PSAnQWJvcnRFcnJvcicpIHx8XG4gICAgICAgICAgICAodHlwZW9mIChlIGFzIHsgbmFtZT86IHVua25vd24gfSB8IG51bGwpPy5uYW1lID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgICAgICAoZSBhcyB7IG5hbWU6IHN0cmluZyB9KS5uYW1lID09PSAnQWJvcnRFcnJvcicpO1xuICAgICAgICAgIGlmIChpc0Fib3J0KSB7XG4gICAgICAgICAgICBpZiAodGltZWRPdXQpIGRpc3BhdGNoUHJldmlldyh7IHR5cGU6ICdmYWlsJywga2luZDogJ3RpbWVvdXQnIGFzIE9wdGltaXplRXJyb3JLaW5kIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBraW5kID0gdG9FcnJvcktpbmQoZSkua2luZDtcbiAgICAgICAgICBkaXNwYXRjaFByZXZpZXcoeyB0eXBlOiAnZmFpbCcsIGtpbmQsIGRldGFpbDogU3RyaW5nKChlIGFzIHsgbWVzc2FnZT86IHVua25vd24gfSk/Lm1lc3NhZ2UgPz8gZSkgfSk7XG4gICAgICAgIH0sXG4gICAgICApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGZldGNoIOmAmumBk++8iOiHquWumuS5ieaooeWeiy/lrr/kuLvkuI3lj6/nlKjpmY3nuqfvvInmiY3opoHmsYLphY3nva5cbiAgICBpZiAoIWNoZWNrQ29uZmlnKGNvbmZpZykub2spIHtcbiAgICAgIGRpc3BhdGNoUHJldmlldyh7IHR5cGU6ICdndWlkZScgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8g6Ieq5a6a5LmJ5qih5Z6L5qih5byP77ya5rWP6KeI5ZmoIGZldGNoIOebtOi/nuiHqumFjSBBUEnvvIjmtYHlvI/vvIlcbiAgICAvLyDmqKHlnovop6PmnpDvvJp1c2VTZXNzaW9uTW9kZWzvvIjpu5jorqTvvInihpIg5a6/5Li75Lya6K+d5qih5Z6L77yI5LuF5L2cIG1vZGVsIOWQjeWbnumAgOS9v+eUqO+8jOmcgOmFjee9ruW3suWwsee7qu+8ie+8m+WQpuWImSDihpIg6Ieq5a6a5LmJIG1vZGVsXG4gICAgbGV0IG1vZGVsID0gY29uZmlnLm1vZGVsO1xuICAgIGlmIChjb25maWcudXNlU2Vzc2lvbk1vZGVsKSB7XG4gICAgICBjb25zdCBzZXNzaW9uTW9kZWwgPSBhd2FpdCBjdHguZ2V0U2Vzc2lvbk1vZGVsPy4oKTtcbiAgICAgIGlmIChzZXNzaW9uTW9kZWwgJiYgc2Vzc2lvbk1vZGVsLm1vZGVsKSBtb2RlbCA9IHNlc3Npb25Nb2RlbC5tb2RlbDtcbiAgICB9XG4gICAgY29uc3QgZWZmZWN0aXZlID0geyAuLi5jb25maWcsIG1vZGVsIH07XG5cbiAgICAvLyDlsZXnpLrntK/np6/vvJrmraPmlofkvJjlhYjvvJvmraPmloflsJrmnKrlh7rnjrDvvIh2NCDns7vlhYjovpPlh7rplb/mrrXmjqjnkIbvvInml7blsZXnpLrmjqjnkIbov4fnqIvvvIzorqnmtYHlvI/nq4vljbPlj6/op4FcbiAgICBsZXQgcmVhc29uaW5nID0gJyc7XG4gICAgbGV0IGNvbnRlbnQgPSAnJztcbiAgICBsZXQgc2hvd24gPSAnJztcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgb3B0aW1pemVTdHJlYW0oe1xuICAgICAgICBjb25maWc6IGVmZmVjdGl2ZSxcbiAgICAgICAgdGV4dDogZHJhZnQsXG4gICAgICAgIGxhbmc6IGN0eC5nZXRMYW5nKCksXG4gICAgICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwsXG4gICAgICAgIHN5c3RlbSxcbiAgICAgICAgbWVtb3J5OiBtZW1vcnlDdHgsXG4gICAgICAgIG9uRXZlbnQ6IChkZWx0YSkgPT4ge1xuICAgICAgICAgIGlmIChkZWx0YS5raW5kID09PSAnY29udGVudCcpIHtcbiAgICAgICAgICAgIGNvbnRlbnQgKz0gZGVsdGEudGV4dDtcbiAgICAgICAgICAgIHNob3duID0gY29udGVudDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVhc29uaW5nICs9IGRlbHRhLnRleHQ7XG4gICAgICAgICAgICBzaG93biA9IHJlYXNvbmluZztcbiAgICAgICAgICB9XG4gICAgICAgICAgZGlzcGF0Y2hQcmV2aWV3KHsgdHlwZTogJ2RyYWZ0JywgdGV4dDogc2hvd24gfSk7XG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICAgIHNldFBlbmRpbmcoc2Vzc2lvbklkLCBkcmFmdCwgcmVzdWx0KTtcbiAgICAgIGRpc3BhdGNoUHJldmlldyh7IHR5cGU6ICdzaG93JywgcmVzdWx0IH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIOWFiOWIpOWumuS4reatou+8mueUqOaIty/nu4Tku7blj5bmtojkuI7otoXml7bpg73ooajnjrDkuLogQWJvcnRFcnJvcu+8m+S7hei2heaXtuWGmeWFpemUmeivr+aAgVxuICAgICAgY29uc3QgaXNBYm9ydCA9XG4gICAgICAgIChlIGluc3RhbmNlb2YgRE9NRXhjZXB0aW9uICYmIGUubmFtZSA9PT0gJ0Fib3J0RXJyb3InKSB8fFxuICAgICAgICAodHlwZW9mIChlIGFzIHsgbmFtZT86IHVua25vd24gfSB8IG51bGwpPy5uYW1lID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgIChlIGFzIHsgbmFtZTogc3RyaW5nIH0pLm5hbWUgPT09ICdBYm9ydEVycm9yJyk7XG4gICAgICBpZiAoaXNBYm9ydCkge1xuICAgICAgICBpZiAodGltZWRPdXQpIGRpc3BhdGNoUHJldmlldyh7IHR5cGU6ICdmYWlsJywga2luZDogJ3RpbWVvdXQnIGFzIE9wdGltaXplRXJyb3JLaW5kIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBkaXNwYXRjaFByZXZpZXcoeyB0eXBlOiAnZmFpbCcsIGtpbmQ6IHRvRXJyb3JLaW5kKGUpLmtpbmQgfSk7XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgLy8g6aG25bGC5YWc5bqV77yI5a6/5Li76YCa6YGTIHJlamVjdCDlt7LooqsgLnRoZW4g5raI5YyW77yb5q2k5aSE5L+d5oqkIGZldGNoIOWIhuaUr+S7peWklueahOaEj+WkluW8guW4uO+8iVxuICAgIGRpc3BhdGNoUHJldmlldyh7IHR5cGU6ICdmYWlsJywga2luZDogdG9FcnJvcktpbmQoZSkua2luZCB9KTtcbiAgfSBmaW5hbGx5IHtcbiAgICBpZiAoYWN0aXZlQ29udHJvbGxlciA9PT0gY29udHJvbGxlcikge1xuICAgICAgYWN0aXZlQ29udHJvbGxlciA9IG51bGw7XG4gICAgICBhY3RpdmVTZXNzaW9uSWQgPSBudWxsO1xuICAgIH1cbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICB9XG59XG5cbi8qKlxuICog6Ieq5a2m5Lmg5Y+N5oCd77ya57Sv6K6hIDMg5Liq5paw6YeH57qz5ZCO77yM55SoKirkuIDmrKHni6znq4vosIPnlKgqKuaKiuOAjOmHh+e6syAvIOaUvuW8g+OAjeiusOW9leWOi+e8qeaIkOS4gOS7veWBj+WlveeUu+WDj+OAglxuICpcbiAqIOWAn+mJtOS4pOenjeaIkOeGn+WBmuazle+8mlxuICogICAtIExhbmdNZW0g55qEIG1ldGFwcm9tcHTvvJrnlKjljoblj7Lovajov7kgKyDlj43ppojorqnmqKHlnovmlLnlhpnmjIfku6TvvIzogIzkuI3mmK/miYvlt6XosIPlj4LvvJtcbiAqICAgLSBTa2lsbE9wdCDnmoTmnInnlYznvJbovpHvvJrkuqflh7ropobnm5bml6fnlLvlg4/vvIjogIzpnZ7ml6DpmZDov73liqDvvInvvIzpgb/lhY3nlLvlg4/otormu5rotorohI/jgIJcbiAqXG4gKiDlhajnqIsgZmlyZS1hbmQtZm9yZ2V077ya5aSx6LSl5bCx5L+d5oyB5pen55S75YOP77yM57ud5LiN5b2x5ZON5pys5qyh5LyY5YyW5LiO55So5oi35Lqk5LqS44CCXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWZsZWN0SWZOZWVkZWQoY3R4OiB7XG4gIGNvbmZpZzogUHJvbXB0Q29uZmlnO1xuICBsYW5nOiBMYW5nO1xuICBob3N0PzogeyBycGM6IEhvc3RScGMgfTtcbn0pOiBQcm9taXNlPHZvaWQ+IHtcbiAgaWYgKCFzaG91bGRSZWZsZWN0KCkpIHJldHVybjtcblxuICBjb25zdCBzeXN0ZW0gPSBidWlsZFJlZmxlY3Rpb25Qcm9tcHQoY3R4LmxhbmcpO1xuICBjb25zdCB0ZXh0ID0gY3R4LmxhbmcgPT09ICd6aCcgPyAn77yI5Y+q6L6T5Ye655S75YOP5q2j5paH77yJJyA6ICcob3V0cHV0IHRoZSBwcm9maWxlIGJvZHkgb25seSknO1xuICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICBjb25zdCB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4gY29udHJvbGxlci5hYm9ydCgpLCA0NV8wMDApO1xuICB0cnkge1xuICAgIGxldCBvdXQgPSAnJztcbiAgICBpZiAoY3R4Lmhvc3QpIHtcbiAgICAgIG91dCA9IGF3YWl0IHN0cmVhbUhvc3RPcHRpbWl6ZSh7XG4gICAgICAgIHJwYzogY3R4Lmhvc3QucnBjLFxuICAgICAgICB0ZXh0LFxuICAgICAgICBzeXN0ZW0sXG4gICAgICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwsXG4gICAgICAgIHJwY1RpbWVvdXRNczogNTAwMCxcbiAgICAgICAgdGltZW91dE1zOiA0NV8wMDAsXG4gICAgICAgIG9uRGVsdGE6ICgpID0+IHt9LFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IGF3YWl0IG9wdGltaXplU3RyZWFtKHtcbiAgICAgICAgY29uZmlnOiBjdHguY29uZmlnLFxuICAgICAgICB0ZXh0LFxuICAgICAgICBsYW5nOiBjdHgubGFuZyxcbiAgICAgICAgc3lzdGVtLFxuICAgICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChvdXQudHJpbSgpKSBhcHBseVJlZmxlY3Rpb24ob3V0KTtcbiAgfSBjYXRjaCB7XG4gICAgLy8g5Y+N5oCd5aSx6LSl77ya5L+d5oyB5pen55S75YOP77yM562J5LiL5LiA5qyh6YeH57qz5YaN6Kem5Y+RXG4gIH0gZmluYWxseSB7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgfVxufSIsICIvLyDmnKzpobnnm67nlLEgQUkg6L6F5Yqp5LyY5YyW5a6M5oiQ77yI5o+Q56S66K+N5YaF5qC444CB5rWL6K+V5LiO5paH5qGj77yJ77yM5Y+R5biD5YmN57uP5Lq65bel5a6h6ZiF44CCXG4vKipcbiAqIGNvbXBvc2VyLnRzIOKAlOKAlCBEU0gg6L6T5YWl5qGG77yIY29tcG9zZXLvvInnmoTor7vlhpnlt6XlhbfvvIzlrqLmiLfnq6/lhbHkuqvjgIJcbiAqXG4gKiDkuLrku4DkuYjni6znq4vmiJDmqKHlnZfvvJpPcHRpbWl6ZUJ1dHRvbiDkuI4gUHJldmlld0NhcmQg5pu+5ZCE6Ieq5aSN5Yi25LiA5Lu95Yeg5LmO55u45ZCM55qE5a6e546w77yMXG4gKiDkuJTlt7Llh7rnjrDnu4blvq7liIblj4nvvIjlm57pgIDnrZbnlaXkuI3lkIzvvInjgILor7vlhpnlnKjkuKTkuKrnu4Tku7bph4zlv4XpobvkuKXmoLzkuIDoh7TigJTigJTjgIzor7vojYnnqL/jgI3kuI5cbiAqIOOAjOWGmeWbnuiNieeov+OAjeiLpeWumuS9jeWIsOS4jeWQjOWFg+e0oO+8jOabv+aNouWwseS8muWGmemUmeWcsOaWueOAglxuICpcbiAqIOWunua1i+iDjOaZr++8iOS/neeVmeiHquWOn+WunueOsO+8ie+8mlxuICogLSBkc2gtd2ViID49IDAuMS4wLXJjLjYg55qE6L6T5YWl6Z2i5pivIExleGljYWwg5riy5p+T55qEIDxkaXYgY29udGVudGVkaXRhYmxlXG4gKiAgIGRhdGEtY29tcG9zZXItaW5wdXQ+77yM6aG16Z2i5LiK5rKh5pyJIHRleHRhcmVh77yb5Y+q6K6kIHRleHRhcmVhIOeahOWunueOsOS8muOAjOaMiemSrueCueS6hlxuICogICDml6Dlj43lupTjgI3vvIjojYnnqL/msLjov5zkuLrnqbrvvInjgIJcbiAqIC0gaW5wdXQucmlnaHQvb3ZlcmxheSDmp73kvY3kuI3mj5DkvpvmoIflh4YgcHJvcHMvc3RvcmUgaG9va3PvvIzkvp3otZblroPku6zkvJrltKnlubbooqvplJnor69cbiAqICAg6L6555WM5ZCe5o6J77yM5Zug5q2k6L+Z6YeM5YWo6YOo6LWwIERPTSDmn6Xor6LjgIJcbiAqL1xuXG4vKiog5LuO5Y2V5Liq6L6T5YWl5o6n5Lu26K+75paH5pys77yadGV4dGFyZWEg55SoIC52YWx1Ze+8m2NvbnRlbnRlZGl0YWJsZSDnlKggaW5uZXJUZXh044CCICovXG5leHBvcnQgZnVuY3Rpb24gdGV4dE9mSW5wdXQoZWw6IEVsZW1lbnQpOiBzdHJpbmcge1xuICBpZiAoZWwgaW5zdGFuY2VvZiBIVE1MVGV4dEFyZWFFbGVtZW50KSByZXR1cm4gZWwudmFsdWU7XG4gIGlmIChlbCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICYmIGVsLmlzQ29udGVudEVkaXRhYmxlKSByZXR1cm4gZWwuaW5uZXJUZXh0IHx8ICcnO1xuICByZXR1cm4gJyc7XG59XG5cbi8qKiDmmK/lkKYgRFNIIOS8muivnei+k+WFpeaOp+S7tu+8mnRleHRhcmVh77yM5oiWIGNvbXBvc2VyIOeahCBjb250ZW50ZWRpdGFibGUg5a6/5Li744CCICovXG5leHBvcnQgZnVuY3Rpb24gaXNTZXNzaW9uSW5wdXQoZWw6IEVsZW1lbnQgfCBudWxsKTogYm9vbGVhbiB7XG4gIGlmIChlbCA9PT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICBpZiAoZWwgaW5zdGFuY2VvZiBIVE1MVGV4dEFyZWFFbGVtZW50KSByZXR1cm4gdHJ1ZTtcbiAgY29uc3QgZWRpdGFibGUgPSBlbCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICYmIGVsLmlzQ29udGVudEVkaXRhYmxlO1xuICBjb25zdCBjb21wb3NlciA9IGVsIGluc3RhbmNlb2YgRWxlbWVudCAmJiBlbC5jbG9zZXN0KCdbZGF0YS1jb21wb3Nlci1pbnB1dF0nKSAhPT0gbnVsbDtcbiAgcmV0dXJuIGVkaXRhYmxlIHx8IGNvbXBvc2VyO1xufVxuXG4vKiog5om+IGNvbXBvc2VyIOi+k+WFpeahhu+8muS8mOWFiOeEpueCue+8jOWQpuWImeWbnumAgOWIsOmhtemdouS4reeahCBjb21wb3NlciDlrr/kuLsgLyDnrKzkuIDkuKrlj6/nlKjovpPlhaXmjqfku7bjgIIgKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kQ29tcG9zZXIoKTogRWxlbWVudCB8IG51bGwge1xuICBjb25zdCBhY3RpdmUgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICBpZiAoYWN0aXZlICYmIGlzU2Vzc2lvbklucHV0KGFjdGl2ZSkpIHJldHVybiBhY3RpdmU7XG4gIGNvbnN0IGNvbXBvc2VyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtY29tcG9zZXItaW5wdXRdJyk7XG4gIGlmIChjb21wb3NlciAmJiBpc1Nlc3Npb25JbnB1dChjb21wb3NlcikpIHJldHVybiBjb21wb3NlcjtcbiAgY29uc3QgYWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbDxIVE1MVGV4dEFyZWFFbGVtZW50PigndGV4dGFyZWEnKTtcbiAgZm9yIChjb25zdCB0YSBvZiBhbGwpIHtcbiAgICBpZiAoIXRhLmRpc2FibGVkKSByZXR1cm4gdGE7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICog6K+75Y+W5b2T5YmN6I2J56i/77ya5LyY5YWI44CM5pyJ5YaF5a6555qE54Sm54K55o6n5Lu244CN77yIbW91c2Vkb3duIOaXtueEpueCueWwmuacquWIh+i1sO+8jGFjdGl2ZUVsZW1lbnRcbiAqIOS7jeaYr+i+k+WFpeahhu+8ie+8m+WQpuWImeaJvumhtemdouS4reeahCBjb21wb3NlciDlrr/kuLvvvIjngrnlh7vmjInpkq7lkI7nhKbngrnlt7LlnKjmjInpkq7kuIrvvIxjb21wb3NlclxuICog5piv5YWo5bGA5ZSv5LiA55qEIHJlc2lkZW50IGRpdu+8ie+8m+acgOWQjuWbnumAgOWIsOS7u+aEj+OAjOWAvOmdnuepuuOAjeeahCB0ZXh0YXJlYe+8iOWFvOWuueaXp+Wuv+S4u++8ieOAglxuICog5LiOIGZpbmRDb21wb3NlciDnmoTljLrliKvvvJpyZWFkRHJhZnQg6KaB5rGC6Z2e56m64oCU4oCU56m655m96L6T5YWl5LiN6K+l6Kem5Y+R5LyY5YyW44CCXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWFkRHJhZnQoKTogc3RyaW5nIHtcbiAgY29uc3QgYWN0aXZlID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcbiAgaWYgKGlzU2Vzc2lvbklucHV0KGFjdGl2ZSkpIHtcbiAgICBjb25zdCB0ZXh0ID0gdGV4dE9mSW5wdXQoYWN0aXZlKTtcbiAgICBpZiAodGV4dC50cmltKCkpIHJldHVybiB0ZXh0O1xuICB9XG4gIGNvbnN0IGNvbXBvc2VyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJ1tkYXRhLWNvbXBvc2VyLWlucHV0XScpO1xuICBpZiAoY29tcG9zZXIgIT09IG51bGwgJiYgaXNTZXNzaW9uSW5wdXQoY29tcG9zZXIpKSB7XG4gICAgY29uc3QgdGV4dCA9IHRleHRPZklucHV0KGNvbXBvc2VyKTtcbiAgICBpZiAodGV4dC50cmltKCkpIHJldHVybiB0ZXh0O1xuICB9XG4gIGNvbnN0IGFsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTFRleHRBcmVhRWxlbWVudD4oJ3RleHRhcmVhJyk7XG4gIGZvciAoY29uc3QgdGEgb2YgYWxsKSB7XG4gICAgaWYgKHRhLnZhbHVlLnRyaW0oKSkgcmV0dXJuIHRhLnZhbHVlO1xuICB9XG4gIHJldHVybiAnJztcbn1cblxuLyoqXG4gKiDlhpnlm54gY29tcG9zZXLjgIJ0ZXh0YXJlYSDnlKjljp/nlJ8gdmFsdWUgc2V0dGVyICsgaW5wdXQg5LqL5Lu277yI6K6pIFJlYWN0IOWPl+aOp+e7hOS7tuaEn+efpe+8ie+8m1xuICogY29udGVudGVkaXRhYmxl77yITGV4aWNhbO+8ieeUqCBzZWxlY3QtYWxsICsgZXhlY0NvbW1hbmQoJ2luc2VydFRleHQnKeKAlOKAlGxleGljYWwg55uR5ZCs5Y6f55SfXG4gKiBpbnB1dO+8jGV4ZWNDb21tYW5kIOS8muinpuWPkeato+ehrueahOe8lui+keS6i+S7tuW5tuaKiiBET00g5ZCM5q2l5Zue57yW6L6R5ZmoIHN0YXRl44CCXG4gKiDms6jmhI/vvJpkb2N1bWVudC5leGVjQ29tbWFuZCDlt7LooqvmoIforrDlup/lvIPvvIzkvYYgTGV4aWNhbCDku43kvp3otZblroPmtL7lj5HnmoQgYmVmb3JlaW5wdXQvaW5wdXTvvJtcbiAqIOiLpeacquadpeWuv+S4u+enu+mZpOivpSBBUEnvvIzotbAgaW5uZXJUZXh0ICsgaW5wdXQg5LqL5Lu255qE5YWc5bqV5YiG5pSv44CCXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3cml0ZUNvbXBvc2VyVGV4dCh0ZXh0OiBzdHJpbmcpOiB2b2lkIHtcbiAgY29uc3QgZWwgPSBmaW5kQ29tcG9zZXIoKTtcbiAgaWYgKCFlbCkgcmV0dXJuO1xuICBpZiAoZWwgaW5zdGFuY2VvZiBIVE1MVGV4dEFyZWFFbGVtZW50KSB7XG4gICAgY29uc3Qgc2V0dGVyID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihIVE1MVGV4dEFyZWFFbGVtZW50LnByb3RvdHlwZSwgJ3ZhbHVlJyk/LnNldDtcbiAgICBpZiAoc2V0dGVyKSB7XG4gICAgICBzZXR0ZXIuY2FsbChlbCwgdGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsLnZhbHVlID0gdGV4dDtcbiAgICB9XG4gICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2lucHV0JywgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICBlbC5mb2N1cygpO1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBjb250ZW50ZWRpdGFibGUgY29tcG9zZXJcbiAgaWYgKGVsIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgJiYgZWwuaXNDb250ZW50RWRpdGFibGUpIHtcbiAgICBlbC5mb2N1cygpO1xuICAgIGlmIChkb2N1bWVudC5leGVjQ29tbWFuZCkge1xuICAgICAgY29uc3Qgc2VsID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuICAgICAgY29uc3QgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuICAgICAgcmFuZ2Uuc2VsZWN0Tm9kZUNvbnRlbnRzKGVsKTtcbiAgICAgIHNlbD8ucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgICBzZWw/LmFkZFJhbmdlKHJhbmdlKTtcbiAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdpbnNlcnRUZXh0JywgZmFsc2UsIHRleHQpO1xuICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2lucHV0JywgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWwuaW5uZXJUZXh0ID0gdGV4dDtcbiAgICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdpbnB1dCcsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gICAgfVxuICB9XG59XG4iLCAiLyoqIOi+k+WFpeWMuua1ruWxgumihOiniOWNoeeJh++8mmd1aWRlIC8gb3B0aW1pemluZyAvIHByZXZpZXcgLyBlcnJvciDlm5vnp43lhoXlrrnmgIFcbiAqICDnirbmgIHmnaXoh6rmqKHlnZfnuqfpooTop4jmgLvnur/vvIhwcmV2aWV3LWJ1c++8ie+8jOS4jeS+nei1luS8muivnSBzdG9yZS9ob29rIHByb3BzICovXG5cbmltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgdHlwZSB7IExhbmcsIFByb21wdENvbmZpZyB9IGZyb20gJy4vb3B0aW1pemVyLmpzJztcbmltcG9ydCB7IHJ1bk9wdGltaXplLCBjbG9zZVByZXZpZXcsIHJlZmxlY3RJZk5lZWRlZCB9IGZyb20gJy4vb3B0aW1pemVyLXN0b3JlLmpzJztcbmltcG9ydCB7IHJlY29yZE91dGNvbWUgfSBmcm9tICcuL21lbW9yeS5qcyc7XG5pbXBvcnQgeyBnZXRQcmV2aWV3QnVzU3RhdGUsIHN1YnNjcmliZVByZXZpZXdCdXMgfSBmcm9tICcuL3ByZXZpZXctYnVzLmpzJztcbmltcG9ydCB7IHJlYWREcmFmdCwgd3JpdGVDb21wb3NlclRleHQgfSBmcm9tICcuL2NvbXBvc2VyLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBQcmV2aWV3Q2FyZFByb3BzIHtcbiAgdDogKGtleTogc3RyaW5nKSA9PiBzdHJpbmc7XG4gIGdldENvbmZpZzogKCkgPT4gUHJvbXB0Q29uZmlnO1xuICBnZXRMYW5nOiAoKSA9PiBMYW5nO1xuICBvcGVuU2V0dGluZ3M6ICgpID0+IHZvaWQ7XG4gIGdldFNlc3Npb25Nb2RlbD86ICgpID0+IFByb21pc2U8eyBwcm92aWRlcjogc3RyaW5nOyBtb2RlbDogc3RyaW5nIH0gfCBudWxsPjtcbiAgZ2V0SG9zdD86ICgpID0+IHsgcnBjOiB7IGNhbGw6IChlOiBzdHJpbmcsIHA/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gUHJvbWlzZTx7IG9rOiBib29sZWFuOyB2YWx1ZT86IHVua25vd247IGVycm9yPzogeyBjb2RlPzogc3RyaW5nIH0gfT4gfSB9IHwgbnVsbDtcbiAgZ2V0U2Vzc2lvbklkPzogKCkgPT4gc3RyaW5nIHwgbnVsbDtcbn1cblxuY29uc3QgQ1NTX0lEID0gJ2RzaC1wcm9tcHQtb3B0aW1pemUvY2FyZC5jc3MnO1xuZnVuY3Rpb24gaW5qZWN0Q3NzKCkge1xuICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJyB8fCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBzdHlsZVtkYXRhLXBsdWdpbi1jc3M9XCIke0NTU19JRH1cIl1gKSkgcmV0dXJuO1xuICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gIHN0eWxlLmRhdGFzZXQucGx1Z2luQ3NzID0gQ1NTX0lEO1xuICBzdHlsZS50ZXh0Q29udGVudCA9IGBcbi5kc2gtcG8tY2FyZCB7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgbGVmdDogMTJweDtcbiAgcmlnaHQ6IDEycHg7XG4gIGJvdHRvbTogY2FsYygxMDAlICsgOHB4KTtcbiAgei1pbmRleDogNDA7XG4gIGJhY2tncm91bmQ6IHZhcigtLWRzdy1hbGlhcy1iZy1vdmVybGF5LCAjZmZmKTtcbiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMiwgcmdiYSgxMjgsMTI4LDEyOCwwLjMpKTtcbiAgYm9yZGVyLXJhZGl1czogMTBweDtcbiAgYm94LXNoYWRvdzogMCA4cHggMjRweCByZ2JhKDAsIDAsIDAsIDAuMTYpO1xuICBwYWRkaW5nOiAxMnB4IDE0cHg7XG4gIG1heC1oZWlnaHQ6IDMyMHB4O1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICBnYXA6IDhweDtcbn1cbi5kc2gtcG8tY2FyZC1oZWFkIHtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICBjb2xvcjogdmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnksICMyMjIpO1xuICBmb250LXNpemU6IDEzcHg7XG4gIGZvbnQtd2VpZ2h0OiA2MDA7XG59XG4uZHNoLXBvLWNhcmQtYm9keSB7XG4gIG92ZXJmbG93OiBhdXRvO1xuICB3aGl0ZS1zcGFjZTogcHJlLXdyYXA7XG4gIHdvcmQtYnJlYWs6IGJyZWFrLXdvcmQ7XG4gIGNvbG9yOiB2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5LCAjNDQ0KTtcbiAgZm9udC1zaXplOiAxM3B4O1xuICBsaW5lLWhlaWdodDogMS42O1xuICBtYXgtaGVpZ2h0OiAyMDBweDtcbn1cbi5kc2gtcG8tY2FyZC1lcnIge1xuICBjb2xvcjogdmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnksICNkMDMwNTApO1xuICBmb250LXNpemU6IDEzcHg7XG59XG4uZHNoLXBvLWNhcmQtc3RlcCB7XG4gIGNvbG9yOiB2YXIoLS1kc3ctYWxpYXMtdGV4dC1zZWNvbmRhcnksICM4YzkzYTEpO1xuICBmb250LXNpemU6IDEycHg7XG4gIG1hcmdpbi1sZWZ0OiA0cHg7XG59XG4uZHNoLXBvLWNhcmQtZXJyLWRldGFpbCB7XG4gIG1hcmdpbi10b3A6IDRweDtcbiAgY29sb3I6IHZhcigtLWRzdy1hbGlhcy10ZXh0LXNlY29uZGFyeSwgIzhjOTNhMSk7XG4gIGZvbnQtc2l6ZTogMTJweDtcbiAgd29yZC1icmVhazogYnJlYWstYWxsO1xufVxuLmRzaC1wby1jYXJkLXJvdyB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGdhcDogOHB4O1xuICBmbGV4LXdyYXA6IHdyYXA7XG59XG4uZHNoLXBvLWNhcmQtYnRuIHtcbiAgYm9yZGVyOiAwO1xuICBib3JkZXItcmFkaXVzOiA2cHg7XG4gIHBhZGRpbmc6IDRweCAxMHB4O1xuICBmb250LXNpemU6IDEycHg7XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgY29sb3I6IHZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5LCAjMjIyKTtcbiAgYmFja2dyb3VuZDogdmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyLCByZ2JhKDEyOCwxMjgsMTI4LDAuMTQpKTtcbn1cbi5kc2gtcG8tY2FyZC1idG4ucHJpbWFyeSB7XG4gIC8qIOWGmeatu+S4u+iJsu+8mi0tZHN3LWFsaWFzLWJyYW5kLXByaW1hcnkg5Zyo5rex5aSc5qih5byP6Kej5p6Q5Li65rWF6ImyIOKGkiDnmb3lupXnmb3lrZfkuI3lj6/or7vvvIjnlKjmiLflrp7mtYvvvIkgKi9cbiAgY29sb3I6ICNmZmY7XG4gIGJhY2tncm91bmQ6ICMxNjc3ZmY7XG59XG5gO1xuICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cblxuZnVuY3Rpb24gZXJyb3JLZXkoa2luZDogc3RyaW5nIHwgbnVsbCk6IHN0cmluZyB7XG4gIHN3aXRjaCAoa2luZCkge1xuICAgIC8vIGtpbmQg4oaSIGxvY2FsZSBrZXnvvJsnY29uZmlnJyDlnKggVUkg5LiK5LiN5Y+v6L6+77yIcnVuT3B0aW1pemUg5YWI6LWwIGd1aWRl77yJ77yMQWJvcnRFcnJvcuKGknRpbWVvdXQg55SxIHJ1bk9wdGltaXplIOWFiOihjOaLpuaIqu+8jOS/neeVmeWPjOS/nemZqVxuICAgIGNhc2UgJ3VuYXV0aG9yaXplZCc6IGNhc2UgJ2ZvcmJpZGRlbic6IGNhc2UgJ3RpbWVvdXQnOiBjYXNlICduZXR3b3JrJzogY2FzZSAnY29ycyc6IGNhc2UgJ2h0dHAnOiBjYXNlICdiYWQtcmVzcG9uc2UnOiBjYXNlICdlbXB0eSc6IGNhc2UgJ3RydW5jYXRlZCc6IGNhc2UgJ2NvbmZpZyc6XG4gICAgICByZXR1cm4gYGVycm9yLiR7a2luZH1gO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gJ2Vycm9yLm5ldHdvcmsnO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBQcmV2aWV3Q2FyZChwcm9wczogUHJldmlld0NhcmRQcm9wcykge1xuICBjb25zdCB7IHQsIGdldENvbmZpZywgZ2V0TGFuZywgb3BlblNldHRpbmdzLCBnZXRTZXNzaW9uTW9kZWwsIGdldEhvc3QsIGdldFNlc3Npb25JZCB9ID0gcHJvcHM7XG5cbiAgLy8g6K6i6ZiF5qih5Z2X57qn6aKE6KeI5oC757q/77yI5pu/5Luj5Lya6K+dIHN0b3JlIHByb3Bz77yJXG4gIGNvbnN0IFtzdGF0ZSwgc2V0U3RhdGVdID0gdXNlU3RhdGUoKCkgPT4gZ2V0UHJldmlld0J1c1N0YXRlKCkpO1xuICB1c2VFZmZlY3QoXG4gICAgKCkgPT4gc3Vic2NyaWJlUHJldmlld0J1cygoKSA9PiBzZXRTdGF0ZShnZXRQcmV2aWV3QnVzU3RhdGUoKSkpLFxuICAgIFtdLFxuICApO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiBpbmplY3RDc3MoKSwgW10pO1xuXG4gIC8vIOWNuOi9veaXtua4heeQhu+8mua4hemZpOaMgui1t+eahCBjb3BpZWQg5aSN5L2N5a6a5pe25Zmo77yM5bm25qCH6K6w5pyq5oyC6L2977yMXG4gIC8vIOmYsuatoui/n+WIsOeahCBzZXRDb3BpZWQodHJ1ZSnvvIhjb3B5IOeahCBhd2FpdCDmnJ/pl7Tljbjovb3vvInlnKjljbjovb3lkI7op6blj5HjgIJcbiAgY29uc3QgbW91bnRlZFJlZiA9IHVzZVJlZih0cnVlKTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBtb3VudGVkUmVmLmN1cnJlbnQgPSB0cnVlO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBtb3VudGVkUmVmLmN1cnJlbnQgPSBmYWxzZTtcbiAgICAgIGlmIChjb3B5VGltZXJSZWYuY3VycmVudCAhPT0gbnVsbCkge1xuICAgICAgICBjbGVhclRpbWVvdXQoY29weVRpbWVyUmVmLmN1cnJlbnQpO1xuICAgICAgICBjb3B5VGltZXJSZWYuY3VycmVudCA9IG51bGw7XG4gICAgICB9XG4gICAgfTtcbiAgfSwgW10pO1xuXG4gIGNvbnN0IHsgc3RhdHVzLCByZXN1bHQsIGVycm9yS2luZCB9ID0gc3RhdGU7XG4gIGNvbnN0IFtjb3BpZWQsIHNldENvcGllZF0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IGNvcHlUaW1lclJlZiA9IHVzZVJlZjxudW1iZXIgfCBudWxsPihudWxsKTtcblxuICAvLyDpooTop4jnqpflj6Pnu5Hlrprlj5HotbfkvJror53vvJrliIfmjaLliLDliKvnmoTkvJror53ml7bkuI3ot5/pmo/mmL7npLrvvIjliIflm57lj5HotbfkvJror53mgaLlpI3vvIlcbiAgaWYgKHN0YXR1cyAhPT0gJ2lkbGUnICYmIHN0YXRlLnNlc3Npb25JZCAhPT0gbnVsbCkge1xuICAgIGNvbnN0IHNpZCA9IGdldFNlc3Npb25JZD8uKCk7XG4gICAgaWYgKHNpZCAhPT0gbnVsbCAmJiBzdGF0ZS5zZXNzaW9uSWQgIT09IHNpZCkgcmV0dXJuIG51bGw7XG4gIH1cbiAgaWYgKHN0YXR1cyA9PT0gJ2lkbGUnKSByZXR1cm4gbnVsbDtcblxuICBjb25zdCByZXRyeSA9ICgpID0+IHtcbiAgICAvLyDph43or5UgPSDlkKblhrPmnKzmrKHnu5PmnpzvvIjotJ/moLfmnKzvvInvvIzorqnlj43mgJ3nn6XpgZPjgIzov5nnsbvkuqflh7rkuI3lkIjlj6PlkbPjgI1cbiAgICByZWNvcmRPdXRjb21lKCdyZWplY3RlZCcpO1xuICAgIHZvaWQgcnVuT3B0aW1pemUoe1xuICAgICAgZ2V0Q29uZmlnLFxuICAgICAgZ2V0TGFuZyxcbiAgICAgIGdldERyYWZ0OiAoKSA9PiByZWFkRHJhZnQoKSxcbiAgICAgIGdldFNlc3Npb25Nb2RlbCxcbiAgICAgIGhvc3Q6IGdldEhvc3Q/LigpID8/IHVuZGVmaW5lZCxcbiAgICAgIGdldFNlc3Npb25JZCxcbiAgICB9KTtcbiAgfTtcblxuICBjb25zdCByZXBsYWNlID0gKCkgPT4ge1xuICAgIHdyaXRlQ29tcG9zZXJUZXh0KHJlc3VsdCk7XG4gICAgLy8g6YeH57qzID0g5q2j5qC35pys77yb57Sv6K6h5Yiw6ZiI5YC85ZCO5byC5q2l5Yi35paw5YGP5aW955S75YOP77yI5aSx6LSl6Z2Z6buY77yJXG4gICAgY29uc3QgYWNjZXB0ZWQgPSByZWNvcmRPdXRjb21lKCdhY2NlcHRlZCcpO1xuICAgIGNsb3NlUHJldmlldygpO1xuICAgIGlmIChhY2NlcHRlZCkge1xuICAgICAgdm9pZCByZWZsZWN0SWZOZWVkZWQoeyBjb25maWc6IGdldENvbmZpZygpLCBsYW5nOiBnZXRMYW5nKCksIGhvc3Q6IGdldEhvc3Q/LigpID8/IHVuZGVmaW5lZCB9KTtcbiAgICB9XG4gIH07XG5cbiAgLyoqIOWFs+mXrSA9IOacqumHh+e6s+OAguS9huiLpeW3suWkjeWItui1sOe7k+aenO+8jOivtOaYjueUqOaIt+iupOWPr+S6huS6p+WHuu+8iOato+agt+acrO+8ie+8jFxuICAgKiAg5pen54mI5LiA5b6L6K6w6LSf5qC35pys77yM5Lya5oqK44CM5aSN5Yi26LWw44CN5rGh5p+T6L+b5Y+N5oCd55S75YOP44CCICovXG4gIGNvbnN0IGRpc21pc3MgPSAoKSA9PiB7XG4gICAgcmVjb3JkT3V0Y29tZShoYXNDb3BpZWRSZWYuY3VycmVudCA/ICdhY2NlcHRlZCcgOiAncmVqZWN0ZWQnKTtcbiAgICBjbG9zZVByZXZpZXcoKTtcbiAgfTtcblxuICBjb25zdCBoYXNDb3BpZWRSZWYgPSB1c2VSZWYoZmFsc2UpO1xuICBjb25zdCBjb3B5ID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmICghbmF2aWdhdG9yLmNsaXBib2FyZCkgcmV0dXJuOyAvLyDpnZ7lronlhajkuIrkuIvmlofvvIhodHRwIOetie+8ie+8muS4jee/u+i9rCBjb3BpZWTvvIzkv53mjIHlj6/ph43or5VcbiAgICB0cnkge1xuICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQocmVzdWx0KTtcbiAgICAgIGhhc0NvcGllZFJlZi5jdXJyZW50ID0gdHJ1ZTsgLy8g5aSN5Yi25Lmf566X6K6k5Y+v5L+h5Y+3XG4gICAgICBpZiAoIW1vdW50ZWRSZWYuY3VycmVudCkgcmV0dXJuOyAvLyBhd2FpdCDmnJ/pl7Tnu4Tku7blt7Lljbjovb3vvJrkuI3lho0gc2V0U3RhdGVcbiAgICAgIHNldENvcGllZCh0cnVlKTtcbiAgICAgIGlmIChjb3B5VGltZXJSZWYuY3VycmVudCAhPT0gbnVsbCkgY2xlYXJUaW1lb3V0KGNvcHlUaW1lclJlZi5jdXJyZW50KTtcbiAgICAgIGNvcHlUaW1lclJlZi5jdXJyZW50ID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBzZXRDb3BpZWQoZmFsc2UpO1xuICAgICAgICBjb3B5VGltZXJSZWYuY3VycmVudCA9IG51bGw7XG4gICAgICB9LCAxMjAwKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIOWJqui0tOadv+WGmeWFpeWksei0pe+8mumdmem7mO+8iOS4jee/u+i9rCBjb3BpZWTvvIlcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImRzaC1wby1jYXJkXCIgcm9sZT1cInN0YXR1c1wiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2gtcG8tY2FyZC1oZWFkXCI+XG4gICAgICAgIDxzcGFuPnt0KCdjYXJkLnRpdGxlJyl9PC9zcGFuPlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2gtcG8tY2FyZC1idG5cIiBvbkNsaWNrPXtkaXNtaXNzfT5cbiAgICAgICAgICDinJVcbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L2Rpdj5cblxuICAgICAge3N0YXR1cyA9PT0gJ2d1aWRlJyAmJiAoXG4gICAgICAgIDw+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2gtcG8tY2FyZC1ib2R5XCI+e3QoJ2d1aWRlLnRpdGxlJyl9PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2gtcG8tY2FyZC1ib2R5XCI+e3QoJ2d1aWRlLmRlc2MnKX08L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzaC1wby1jYXJkLXJvd1wiPlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNoLXBvLWNhcmQtYnRuIHByaW1hcnlcIiBvbkNsaWNrPXsoKSA9PiB7IGNsb3NlUHJldmlldygpOyBvcGVuU2V0dGluZ3MoKTsgfX0+XG4gICAgICAgICAgICAgIHt0KCdndWlkZS5hY3Rpb24nKX1cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNoLXBvLWNhcmQtYnRuXCIgb25DbGljaz17KCkgPT4gY2xvc2VQcmV2aWV3KCl9PlxuICAgICAgICAgICAgICB7dCgnZ3VpZGUuZGlzbWlzcycpfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvPlxuICAgICAgKX1cblxuICAgICAge3N0YXR1cyA9PT0gJ29wdGltaXppbmcnICYmIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2gtcG8tY2FyZC1ib2R5XCI+XG4gICAgICAgICAge3N0YXRlLnJlYXNvbmluZyAmJiAhc3RhdGUuZHJhZnQgPyAoXG4gICAgICAgICAgICA8c3BhblxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIHdoaXRlU3BhY2U6ICdwcmUtd3JhcCcsXG4gICAgICAgICAgICAgICAgY29sb3I6ICd2YXIoLS1kc3ctYWxpYXMtdGV4dC1zZWNvbmRhcnksICM4YzkzYTEpJyxcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogJzEycHgnLFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7c3RhdGUucmVhc29uaW5nfVxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIHtzdGF0ZS5kcmFmdCA/IDxzcGFuIHN0eWxlPXt7IHdoaXRlU3BhY2U6ICdwcmUtd3JhcCcgfX0+e3N0YXRlLmRyYWZ0fTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgIHshc3RhdGUuZHJhZnQgJiYgIXN0YXRlLnJlYXNvbmluZyA/IHQoJ2NhcmQub3B0aW1pemluZycpIDogbnVsbH1cbiAgICAgICAgPC9kaXY+XG4gICAgICApfVxuXG4gICAgICB7c3RhdHVzID09PSAncHJldmlldycgJiYgKFxuICAgICAgICA8PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNoLXBvLWNhcmQtYm9keVwiPntyZXN1bHR9PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2gtcG8tY2FyZC1yb3dcIj5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzaC1wby1jYXJkLWJ0biBwcmltYXJ5XCIgb25DbGljaz17cmVwbGFjZX0+XG4gICAgICAgICAgICAgIHt0KCdjYXJkLnJlcGxhY2UnKX1cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNoLXBvLWNhcmQtYnRuXCIgb25DbGljaz17KCkgPT4gdm9pZCBjb3B5KCl9PlxuICAgICAgICAgICAgICB7Y29waWVkID8gdCgnY2FyZC5jb3B5RG9uZScpIDogdCgnY2FyZC5jb3B5Jyl9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzaC1wby1jYXJkLWJ0blwiIG9uQ2xpY2s9e3JldHJ5fT5cbiAgICAgICAgICAgICAge3QoJ2NhcmQucmV0cnknKX1cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNoLXBvLWNhcmQtYnRuXCIgb25DbGljaz17ZGlzbWlzc30+XG4gICAgICAgICAgICAgIHt0KCdjYXJkLmRpc21pc3MnKX1cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8Lz5cbiAgICAgICl9XG5cbiAgICAgIHtzdGF0dXMgPT09ICdlcnJvcicgJiYgKFxuICAgICAgICA8PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNoLXBvLWNhcmQtZXJyXCI+e3QoZXJyb3JLZXkoZXJyb3JLaW5kKSl9PC9kaXY+XG4gICAgICAgICAge2Vycm9yRGV0YWlsID8gPGRpdiBjbGFzc05hbWU9XCJkc2gtcG8tY2FyZC1lcnItZGV0YWlsXCI+e2Vycm9yRGV0YWlsfTwvZGl2PiA6IG51bGx9XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2gtcG8tY2FyZC1yb3dcIj5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzaC1wby1jYXJkLWJ0biBwcmltYXJ5XCIgb25DbGljaz17cmV0cnl9PlxuICAgICAgICAgICAgICB7dCgnY2FyZC5yZXRyeScpfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2gtcG8tY2FyZC1idG5cIiBvbkNsaWNrPXtkaXNtaXNzfT5cbiAgICAgICAgICAgICAge3QoJ2NhcmQuZGlzbWlzcycpfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvPlxuICAgICAgKX1cbiAgICA8L2Rpdj5cbiAgKTtcbn0iLCAiLyoqIOiuvue9riDihpIgR2VuZXJhbCDljLrjgIxQcm9tcHQg5LyY5YyW44CN6K6+572u6KGM77ya5qCH6aKY5pGY6KaBICsg5bGV5byA6KGo5Y2VICovXG5cbmltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHR5cGUgeyBQcm9tcHRDb25maWcgfSBmcm9tICcuL29wdGltaXplci5qcyc7XG5pbXBvcnQgeyBERUZBVUxUUyB9IGZyb20gJy4vb3B0aW1pemVyLmpzJztcbmltcG9ydCB0eXBlIHsgU2V0dGluZ3NGb3JtU3RhdGUsIFNldHRpbmdzRm9ybVZhbHVlcyB9IGZyb20gJy4vc2V0dGluZ3MtZm9ybS1zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSB7IFNldHRpbmdzRm9ybUFjdGlvbnMgfSBmcm9tICcuL3NldHRpbmdzLXN0b3JlLmpzJztcbmltcG9ydCB7IG9uT3BlblNldHRpbmdzUmVxdWVzdCB9IGZyb20gJy4vZXZlbnRzLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBTZXR0aW5nc1Jvd1Byb3BzIHtcbiAgdDogKGtleTogc3RyaW5nKSA9PiBzdHJpbmc7XG4gIHVzZVN0b3JlOiA8VD4oc2VsZWN0b3I6IChzOiBTZXR0aW5nc0Zvcm1TdGF0ZSkgPT4gVCkgPT4gVDtcbiAgYWN0aW9uczogU2V0dGluZ3NGb3JtQWN0aW9ucztcbiAgZ2V0Q29uZmlnOiAoKSA9PiBQcm9tcHRDb25maWc7XG4gIHNhdmVDb25maWc6ICh2YWx1ZXM6IFNldHRpbmdzRm9ybVZhbHVlcykgPT4gUHJvbWlzZTx2b2lkPjtcbiAgcmVzZXRDb25maWc6ICgpID0+IFByb21pc2U8dm9pZD47XG4gIGdldEVwb2NoOiAoKSA9PiBudW1iZXI7XG4gIC8qKiDlrr/kuLvpgJrpgZPoh6rmo4DvvJrlvZPliY3kvJror53mqKHlnovmmK/lkKblj6/nu48gc2VydmVyIGhhbGYg6I635Y+W77yI6Zu26YWN572u6YCa6YGT55qE5YGl5bq35o6i6ZKI77yJICovXG4gIGdldEhvc3RTdGF0dXM/OiAoKSA9PiBQcm9taXNlPHsgYXZhaWxhYmxlOiBib29sZWFuOyBwcm92aWRlcj86IHN0cmluZzsgbW9kZWw/OiBzdHJpbmc7IGVycm9yPzogc3RyaW5nIH0gfCBudWxsPjtcbn1cblxuXG5jb25zdCBDU1NfSUQgPSAnZHNoLXByb21wdC1vcHRpbWl6ZS9zZXR0aW5ncy5jc3MnO1xuZnVuY3Rpb24gaW5qZWN0Q3NzKCkge1xuICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJyB8fCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBzdHlsZVtkYXRhLXBsdWdpbi1jc3M9XCIke0NTU19JRH1cIl1gKSkgcmV0dXJuO1xuICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gIHN0eWxlLmRhdGFzZXQucGx1Z2luQ3NzID0gQ1NTX0lEO1xuICBzdHlsZS50ZXh0Q29udGVudCA9IGBcbi5vcHRpU2V0dGluZ3Mge1xuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7XG4gIHBhZGRpbmc6IDE2cHggMDtcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgZ2FwOiA4cHg7XG59XG4ub3B0aVNldHRpbmdzVGl0bGUge1xuICBjb2xvcjogdmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO1xuICBmb250LXNpemU6IDE0cHg7XG4gIGxpbmUtaGVpZ2h0OiAyMnB4O1xufVxuLm9wdGlTZXR0aW5nc0hpbnQge1xuICBjb2xvcjogdmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtcbiAgZm9udC1zaXplOiAxMnB4O1xufVxuLm9wdGlTZXR0aW5nc0Zvcm0ge1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICBnYXA6IDhweDtcbiAgbWFyZ2luLXRvcDogNHB4O1xufVxuLm9wdGlTZXR0aW5nc0ZpZWxkIHtcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgZ2FwOiA0cHg7XG59XG4ub3B0aVNldHRpbmdzTGFiZWwge1xuICBjb2xvcjogdmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7XG4gIGZvbnQtc2l6ZTogMTJweDtcbn1cbi5vcHRpU2V0dGluZ3NJbnB1dCB7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO1xuICBib3JkZXItcmFkaXVzOiA2cHg7XG4gIGJhY2tncm91bmQ6IHZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKTtcbiAgY29sb3I6IHZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtcbiAgcGFkZGluZzogNnB4IDhweDtcbiAgZm9udC1zaXplOiAxM3B4O1xufVxuLm9wdGlTZXR0aW5nc1JvdyB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGdhcDogOHB4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xufVxuLm9wdGlTZXR0aW5nc0J0biB7XG4gIGJvcmRlcjogMDtcbiAgYm9yZGVyLXJhZGl1czogNnB4O1xuICBwYWRkaW5nOiA0cHggMTJweDtcbiAgZm9udC1zaXplOiAxMnB4O1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIGJhY2tncm91bmQ6IHZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3ZlciwgcmdiYSgxMjgsMTI4LDEyOCwwLjE0KSk7XG4gIGNvbG9yOiB2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7XG59XG4ub3B0aVNldHRpbmdzQnRuLnByaW1hcnkge1xuICAvKiDlhpnmrbvkuLvoibLvvJrkuLvpopjlj5jph4/lnKjmt7HlpJzmqKHlvI/kvJrop6PmnpDkuLrmtYUv5rex5p6B56uv6Imy77yI6buR5bqV6buR5a2X44CB55m95bqV55m95a2X5Z2H6KKr55So5oi35a6e5rWL77yJ77yMXG4gICAgIOWbuuWumuWTgeeJjOiTnSArIOeZveWtl+S/neivgeS7u+S9leS4u+mimOWPr+ivuyAqL1xuICBjb2xvcjogI2ZmZjtcbiAgYmFja2dyb3VuZDogIzE2NzdmZjtcbn1cbi5vcHRpU2V0dGluZ3NFcnIge1xuICBjb2xvcjogdmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnksICNkMDMwNTApO1xuICBmb250LXNpemU6IDEycHg7XG59XG5gO1xuICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNldHRpbmdzUm93KHByb3BzOiBTZXR0aW5nc1Jvd1Byb3BzKSB7XG4gIGNvbnN0IHsgdCwgdXNlU3RvcmUsIGFjdGlvbnMsIGdldENvbmZpZywgc2F2ZUNvbmZpZywgcmVzZXRDb25maWcsIGdldEVwb2NoLCBnZXRIb3N0U3RhdHVzIH0gPSBwcm9wcztcbiAgY29uc3QgW2hvc3RTdGF0dXMsIHNldEhvc3RTdGF0dXNdID0gdXNlU3RhdGU8eyBhdmFpbGFibGU6IGJvb2xlYW47IHByb3ZpZGVyPzogc3RyaW5nOyBtb2RlbD86IHN0cmluZzsgZXJyb3I/OiBzdHJpbmcgfSB8IG51bGw+KG51bGwpO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFnZXRIb3N0U3RhdHVzKSByZXR1cm47XG4gICAgbGV0IGFsaXZlID0gdHJ1ZTtcbiAgICBnZXRIb3N0U3RhdHVzKCkudGhlbigoc3QpID0+IHsgaWYgKGFsaXZlKSBzZXRIb3N0U3RhdHVzKHN0KTsgfSkuY2F0Y2goKCkgPT4geyBpZiAoYWxpdmUpIHNldEhvc3RTdGF0dXMoeyBhdmFpbGFibGU6IGZhbHNlLCBlcnJvcjogJ3JwYy1mYWlsZWQnIH0pOyB9KTtcbiAgICByZXR1cm4gKCkgPT4geyBhbGl2ZSA9IGZhbHNlOyB9O1xuICB9LCBbZ2V0SG9zdFN0YXR1c10pO1xuICBjb25zdCBbZXhwYW5kZWQsIHNldEV4cGFuZGVkXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW3N1Ym1pdFJldmlzaW9uLCBzZXRTdWJtaXRSZXZpc2lvbl0gPSB1c2VTdGF0ZSgwKTtcblxuICBjb25zdCB2YWx1ZXMgPSB1c2VTdG9yZSgocykgPT4gcy52YWx1ZXMpO1xuICBjb25zdCBzYXZlZCA9IHVzZVN0b3JlKChzKSA9PiBzLnNhdmVkKTtcbiAgY29uc3QgZXJyb3IgPSB1c2VTdG9yZSgocykgPT4gcy5lcnJvcik7XG4gIC8vIOS/neWtmC/ph43nva4gUlBDIOWksei0peaXtuaYvuekuueahOWOn+Wni+mUmeivr++8iOS4jeWGjemdmem7mOWksei0pe+8mnNldHRpbmdzIOWGmeWFpeWHuumUmeW/hemhu+iuqeeUqOaIt+eci+W+l+WIsO+8iVxuICBjb25zdCBbcnBjRXJyb3IsIHNldFJwY0Vycm9yXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiBpbmplY3RDc3MoKSwgW10pO1xuXG4gIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZygpO1xuICBjb25zdCBtb2RlbExhYmVsID0gY29uZmlnLm1vZGVsID8gY29uZmlnLm1vZGVsIDogJ+KAlCc7XG5cbiAgLy8g6aaW5qyh5oyC6L29IC8g6YWN572u5Y+Y5YyW5pe25oqK5b2T5YmN6YWN572u5pKt56eN6L+b6KGo5Y2V44CCXG4gIC8vIHNlZWQg5L+u6K6i5Y+3ID0g5pys5Zyw5o+Q5Lqk5bqP5Y+3IHN1Ym1pdFJldmlzaW9uICsgY29uZmlnRXBvY2jvvIjlpJbpg6jphY3nva7lj5jljJbnuqrlhYPvvInvvJpcbiAgLy8gIC0g5aSW6YOo6YWN572u5Y+Y5YyW77yI6Leo5qCH562+6aG1L+WklumDqOWGmeWFpSDihpIgaW5kZXgudHMgcmVmcmVzaENvbmZpZyDnmoTnuqrlhYPpgJLlop7vvInku6Tkv67orqLlj7fotoXov4dcbiAgLy8gICAgc3RhdGUucmV2aXNpb27vvIzph43mkq3np43nlJ/mlYjvvIzooajljZXot5/kuIrlvZLkuIDljJblkI7nmoTplZzlg4/vvJtcbiAgLy8gIC0g5L+d5a2YL+mHjee9ruW3sumAmui/hyBjb21taXQvc2VlZCDlhpnlhaXjgIzmlrDmnKzlnLDluo/lj7cgKyDlvZPml7bnuqrlhYPjgI3nmoTkv67orqLlj7fvvIzntKfmjqXnmoTmnKzmrKHmlYjlupRcbiAgLy8gICAg5Zue6LeR77yI57qq5YWD5pyq5Y+Y77yJ5L+u6K6i5Y+355u4562J6KKrIHJlZHVjZXIg5oqR5Yi2IOKGkiDkv53kvY/nlKjmiLfljp/lp4vovpPlhaXkuI7jgIzlt7Lkv53lrZjjgI3mj5DnpLrvvJtcbiAgLy8gICAg5LiL5qyh5pys5Zyw5Yqo5L2c77yIZWRpdC9jb21taXTvvInlho3mioogc3RhdGUucmV2aXNpb24g5oqs5Yiw5LiO57qq5YWD5LiA6Ie044CCXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgYWN0aW9ucy5zZWVkKFxuICAgICAge1xuICAgICAgICBiYXNlVXJsOiBjb25maWcuYmFzZVVybCxcbiAgICAgICAgYXBpS2V5OiBjb25maWcuYXBpS2V5LFxuICAgICAgICBtb2RlbDogY29uZmlnLm1vZGVsLFxuICAgICAgICB1c2VTZXNzaW9uTW9kZWw6IGNvbmZpZy51c2VTZXNzaW9uTW9kZWwsXG4gICAgICAgIGludGVuc2l0eTogY29uZmlnLmludGVuc2l0eSxcbiAgICAgIH0sXG4gICAgICBzdWJtaXRSZXZpc2lvbiArIGdldEVwb2NoKCksXG4gICAgKTtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFtjb25maWcuYmFzZVVybCwgY29uZmlnLmFwaUtleSwgY29uZmlnLm1vZGVsLCBjb25maWcudXNlU2Vzc2lvbk1vZGVsLCBjb25maWcuaW50ZW5zaXR5LCBnZXRFcG9jaF0pO1xuXG4gIC8vIOOAjOWOu+iuvue9ruOAje+8iOmihOiniOWNoeacqumFjee9ruW8leWvvO+8ieKGkiDoh6rliqjlsZXlvIDooajljZVcbiAgdXNlRWZmZWN0KCgpID0+IG9uT3BlblNldHRpbmdzUmVxdWVzdCgoKSA9PiBzZXRFeHBhbmRlZCh0cnVlKSksIFtdKTtcblxuICBjb25zdCBoYW5kbGVTYXZlID0gYXN5bmMgKCkgPT4ge1xuICAgIHNldFJwY0Vycm9yKG51bGwpO1xuICAgIGNvbnN0IGVycm9ycyA9IGFjdGlvbnMudmFsaWRhdGUodmFsdWVzKTtcbiAgICBpZiAoZXJyb3JzKSB7XG4gICAgICBhY3Rpb25zLmZhaWwoT2JqZWN0LnZhbHVlcyhlcnJvcnMpWzBdKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHNhdmVDb25maWcodmFsdWVzKTtcbiAgICAgIHNldFN1Ym1pdFJldmlzaW9uKChyKSA9PiByICsgMSk7XG4gICAgICAvLyDkuI7mlYjlupTlm57ot5HnmoQgc2VlZCDkv67orqLlj7fvvIjmlrDmnKzlnLDluo/lj7cgKyDnuqrlhYPvvInlr7npvZDvvIzkvb/kv53lrZjlkI7nmoTph43mkq3np43ooqvmipHliLZcbiAgICAgIGFjdGlvbnMuY29tbWl0KHN1Ym1pdFJldmlzaW9uICsgMSArIGdldEVwb2NoKCkpO1xuICAgIH0gY2F0Y2ggKG91dGVyKSB7XG4gICAgICBzZXRScGNFcnJvcihgJHt0KCdzZXR0aW5ncy5zYXZlRmFpbGVkJyl977yaJHtvdXRlciBpbnN0YW5jZW9mIEVycm9yID8gb3V0ZXIubWVzc2FnZSA6IFN0cmluZyhvdXRlcil9YCk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGhhbmRsZVJlc2V0ID0gYXN5bmMgKCkgPT4ge1xuICAgIHNldFJwY0Vycm9yKG51bGwpO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCByZXNldENvbmZpZygpO1xuICAgICAgYWN0aW9ucy5zZWVkKFxuICAgICAgICB7XG4gICAgICAgICAgYmFzZVVybDogREVGQVVMVFMuYmFzZVVybCxcbiAgICAgICAgICBhcGlLZXk6IERFRkFVTFRTLmFwaUtleSxcbiAgICAgICAgICBtb2RlbDogREVGQVVMVFMubW9kZWwsXG4gICAgICAgICAgdXNlU2Vzc2lvbk1vZGVsOiB0cnVlLFxuICAgICAgICAgIGludGVuc2l0eTogREVGQVVMVFMuaW50ZW5zaXR5LFxuICAgICAgICB9LFxuICAgICAgICBzdWJtaXRSZXZpc2lvbiArIDEgKyBnZXRFcG9jaCgpLFxuICAgICAgKTtcbiAgICAgIHNldFN1Ym1pdFJldmlzaW9uKChyKSA9PiByICsgMSk7XG4gICAgfSBjYXRjaCAob3V0ZXIpIHtcbiAgICAgIHNldFJwY0Vycm9yKGAke3QoJ3NldHRpbmdzLnJlc2V0RmFpbGVkJyl977yaJHtvdXRlciBpbnN0YW5jZW9mIEVycm9yID8gb3V0ZXIubWVzc2FnZSA6IFN0cmluZyhvdXRlcil9YCk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJvcHRpU2V0dGluZ3NcIj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzVGl0bGVcIiBvbkNsaWNrPXsoKSA9PiBzZXRFeHBhbmRlZCgodikgPT4gIXYpfSBzdHlsZT17eyBjdXJzb3I6ICdwb2ludGVyJyB9fT5cbiAgICAgICAge3QoJ3NldHRpbmdzLnRpdGxlJyl9XG4gICAgICAgIHshZXhwYW5kZWQgJiZcbiAgICAgICAgICAodmFsdWVzLnVzZVNlc3Npb25Nb2RlbCA/IChcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc0hpbnRcIj4gwrcge3QoJ3NldHRpbmdzLnNlc3Npb25Nb2RlbEVuYWJsZWQnKX08L3NwYW4+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc0hpbnRcIj4gwrcge3QodmFsdWVzLmFwaUtleSA/ICdjYXJkLmNvbmZpZ3VyZWQuaGludCcgOiAnY2FyZC51bmNvbmZpZ3VyZWQuaGludCcpLnJlcGxhY2UoJ3ttb2RlbH0nLCBtb2RlbExhYmVsKX08L3NwYW4+XG4gICAgICAgICAgKSl9XG4gICAgICA8L2Rpdj5cblxuICAgICAgey8qIEFJIOi+heWKqeagh+azqO+8muWni+e7iOWPr+inge+8jOS4jiBSRUFETUUgLyDmupDnoIHlpLTms6jph4rkvb/nlKjlkIzkuIDmjqrovp4gKi99XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc0hpbnRcIj57dCgnc2V0dGluZ3MuYWlOb3RpY2UnKX08L2Rpdj5cblxuICAgICAge2V4cGFuZGVkICYmIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJvcHRpU2V0dGluZ3NGb3JtXCI+XG4gICAgICAgICAge2dldEhvc3RTdGF0dXMgJiYgKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJvcHRpU2V0dGluZ3NGaWVsZFwiIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246ICdyb3cnIH19PlxuICAgICAgICAgICAgICA8c3BhblxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc0hpbnRcIlxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICBjb2xvcjogaG9zdFN0YXR1cz8uYXZhaWxhYmxlID8gJ3ZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnksICMyZjllNjMpJyA6ICd2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSwgI2QwMzA1MCknLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7aG9zdFN0YXR1cyA9PT0gbnVsbFxuICAgICAgICAgICAgICAgICAgPyB0KCdzZXR0aW5ncy5ob3N0UHJvYmUnKVxuICAgICAgICAgICAgICAgICAgOiBob3N0U3RhdHVzLmF2YWlsYWJsZVxuICAgICAgICAgICAgICAgICAgICA/IGAke3QoJ3NldHRpbmdzLmhvc3RPaycpfSAke2hvc3RTdGF0dXMucHJvdmlkZXJ9LyR7aG9zdFN0YXR1cy5tb2RlbH1gXG4gICAgICAgICAgICAgICAgICAgIDogYCR7dCgnc2V0dGluZ3MuaG9zdEZhaWwnKX0gJHtob3N0U3RhdHVzLmVycm9yID8/ICcnfWB9XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICl9XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJvcHRpU2V0dGluZ3NGaWVsZFwiPlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc0xhYmVsXCI+XG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICAgICAgY2hlY2tlZD17dmFsdWVzLnVzZVNlc3Npb25Nb2RlbH1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IGFjdGlvbnMuZWRpdCgndXNlU2Vzc2lvbk1vZGVsJywgZS50YXJnZXQuY2hlY2tlZCl9XG4gICAgICAgICAgICAgIC8+eycgJ31cbiAgICAgICAgICAgICAge3QoJ3NldHRpbmdzLnVzZVNlc3Npb25Nb2RlbCcpfVxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc0hpbnRcIj57dCgnc2V0dGluZ3MudXNlU2Vzc2lvbk1vZGVsSGludCcpfTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc0ZpZWxkXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJvcHRpU2V0dGluZ3NMYWJlbFwiPnt0KCdzZXR0aW5ncy5pbnRlbnNpdHknKX08L3NwYW4+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc1Jvd1wiPlxuICAgICAgICAgICAgICB7KFsnbGlnaHQnLCAnc3RhbmRhcmQnLCAnZGVlcCddIGFzIGNvbnN0KS5tYXAoKGxldmVsKSA9PiAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAga2V5PXtsZXZlbH1cbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgb3B0aVNldHRpbmdzQnRuJHt2YWx1ZXMuaW50ZW5zaXR5ID09PSBsZXZlbCA/ICcgcHJpbWFyeScgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gYWN0aW9ucy5lZGl0KCdpbnRlbnNpdHknLCBsZXZlbCl9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge3QoYGludGVuc2l0eS4ke2xldmVsfWApfVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzSGludFwiPnt0KCdzZXR0aW5ncy5pbnRlbnNpdHlIaW50Jyl9PC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzRmllbGRcIj5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJvcHRpU2V0dGluZ3NMYWJlbFwiIGh0bWxGb3I9XCJvcHRpLWJhc2UtdXJsXCI+e3QoJ3NldHRpbmdzLmJhc2VVcmwnKX08L2xhYmVsPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGlkPVwib3B0aS1iYXNlLXVybFwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc0lucHV0XCJcbiAgICAgICAgICAgICAgdmFsdWU9e3ZhbHVlcy5iYXNlVXJsfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17REVGQVVMVFMuYmFzZVVybH1cbiAgICAgICAgICAgICAgZGlzYWJsZWQ9e3ZhbHVlcy51c2VTZXNzaW9uTW9kZWx9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gYWN0aW9ucy5lZGl0KCdiYXNlVXJsJywgZS50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc0ZpZWxkXCI+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzTGFiZWxcIiBodG1sRm9yPVwib3B0aS1hcGkta2V5XCI+e3QoJ3NldHRpbmdzLmFwaUtleScpfTwvbGFiZWw+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgaWQ9XCJvcHRpLWFwaS1rZXlcIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJvcHRpU2V0dGluZ3NJbnB1dFwiXG4gICAgICAgICAgICAgIHR5cGU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgIHZhbHVlPXt2YWx1ZXMuYXBpS2V5fVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cInNrLeKAplwiXG4gICAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cIm9mZlwiXG4gICAgICAgICAgICAgIGRpc2FibGVkPXt2YWx1ZXMudXNlU2Vzc2lvbk1vZGVsfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IGFjdGlvbnMuZWRpdCgnYXBpS2V5JywgZS50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc0ZpZWxkXCI+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzTGFiZWxcIiBodG1sRm9yPVwib3B0aS1tb2RlbFwiPnt0KCdzZXR0aW5ncy5tb2RlbCcpfTwvbGFiZWw+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgaWQ9XCJvcHRpLW1vZGVsXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzSW5wdXRcIlxuICAgICAgICAgICAgICB2YWx1ZT17dmFsdWVzLm1vZGVsfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17dmFsdWVzLnVzZVNlc3Npb25Nb2RlbCA/ICfigJQnIDogREVGQVVMVFMubW9kZWx9XG4gICAgICAgICAgICAgIGRpc2FibGVkPXt2YWx1ZXMudXNlU2Vzc2lvbk1vZGVsfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IGFjdGlvbnMuZWRpdCgnbW9kZWwnLCBlLnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzUm93XCI+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJvcHRpU2V0dGluZ3NCdG4gcHJpbWFyeVwiIG9uQ2xpY2s9e2hhbmRsZVNhdmV9PlxuICAgICAgICAgICAgICB7dCgnc2V0dGluZ3Muc2F2ZScpfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJvcHRpU2V0dGluZ3NCdG5cIiBvbkNsaWNrPXtoYW5kbGVSZXNldH0+XG4gICAgICAgICAgICAgIHt0KCdzZXR0aW5ncy5yZXNldCcpfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICB7c2F2ZWQgJiYgPHNwYW4gY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzSGludFwiPnt0KCdzZXR0aW5ncy5zYXZlZCcpfTwvc3Bhbj59XG4gICAgICAgICAgICB7cnBjRXJyb3IgJiYgPHNwYW4gY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzRXJyXCI+e3JwY0Vycm9yfTwvc3Bhbj59XG4gICAgICAgICAgICB7IXJwY0Vycm9yICYmIGVycm9yICYmIDxzcGFuIGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc0VyclwiPnt0KGVycm9yKX08L3NwYW4+fVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzSGludFwiPnt0KCdzZXR0aW5ncy5kZXNjJyl9PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKX1cbiAgICA8L2Rpdj5cbiAgKTtcbn1cbiIsICIvKiog6K6+572u6KGo5Y2V5qCh6aqMIOKAlOKAlCDnuq/lh73mlbDvvIzml6AgRFNIIOS+nei1liAqL1xuXG5pbXBvcnQgeyBERUZBVUxUX0lOVEVOU0lUWSwgdHlwZSBJbnRlbnNpdHkgfSBmcm9tICcuL29wdGltaXplci5qcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2V0dGluZ3NGb3JtVmFsdWVzIHtcbiAgYmFzZVVybDogc3RyaW5nO1xuICBhcGlLZXk6IHN0cmluZztcbiAgbW9kZWw6IHN0cmluZztcbiAgLyoqIHRydWXvvJrkvJjljJbkvb/nlKjlvZPliY3kvJror53mqKHlnovvvJtmYWxzZe+8muS9v+eUqCBtb2RlbCAqL1xuICB1c2VTZXNzaW9uTW9kZWw6IGJvb2xlYW47XG4gIC8qKiDkvJjljJblvLrluqbvvJpsaWdodCAvIHN0YW5kYXJkIC8gZGVlcO+8iOS/neWtmOaXtueUsSBtZXJnZUNvbmZpZyDlvZLkuIDljJbvvIkgKi9cbiAgaW50ZW5zaXR5OiBJbnRlbnNpdHk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVNldHRpbmdzRm9ybSh2YWx1ZXM6IFNldHRpbmdzRm9ybVZhbHVlcyk6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4ge1xuICBjb25zdCBlcnJvcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcblxuICAvLyDpm7bphY3nva7vvIjkvJror53mqKHlnovvvInmqKHlvI/vvJpiYXNlVXJsL2FwaUtleS9tb2RlbCDpg73nlKjkuI3liLDvvIzkuI3lgZrmoKHpqozjgIJcbiAgLy8g5pen54mI5peg5p2h5Lu26KaB5rGCIGFwaUtleSDpnZ7nqbrvvIzlr7zoh7Tlj6rmg7PnlKjkvJror53mqKHlnovnmoTnlKjmiLflnKjorr7nva7pobXmoLnmnKzml6Dms5Xkv53lrZjigJTigJRcbiAgLy8g5LiO44CM6Zu26YWN572u6buY6K6k44CN55qE5Lqn5ZOB5a6a5L2N55u05o6l5Yay56qB44CCXG4gIGlmICh2YWx1ZXMudXNlU2Vzc2lvbk1vZGVsKSByZXR1cm4gZXJyb3JzO1xuXG4gIGNvbnN0IHVybCA9IHZhbHVlcy5iYXNlVXJsLnRyaW0oKTtcbiAgaWYgKCF1cmwpIHtcbiAgICBlcnJvcnMuYmFzZVVybCA9ICdzZXR0aW5ncy5iYXNlVXJsJztcbiAgfSBlbHNlIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgdSA9IG5ldyBVUkwodXJsKTtcbiAgICAgIGlmICh1LnByb3RvY29sICE9PSAnaHR0cHM6JyAmJiB1LnByb3RvY29sICE9PSAnaHR0cDonKSB0aHJvdyBuZXcgRXJyb3IoJ3Byb3RvY29sJyk7XG4gICAgICBpZiAodS5zZWFyY2ggfHwgdS5oYXNoKSB0aHJvdyBuZXcgRXJyb3IoJ3F1ZXJ5LW9yLWhhc2gnKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIGVycm9ycy5iYXNlVXJsID0gJ3NldHRpbmdzLmJhc2VVcmwnO1xuICAgIH1cbiAgfVxuXG4gIGlmICghdmFsdWVzLmFwaUtleS50cmltKCkpIGVycm9ycy5hcGlLZXkgPSAnc2V0dGluZ3MuYXBpS2V5JztcbiAgaWYgKCF2YWx1ZXMubW9kZWwudHJpbSgpKSBlcnJvcnMubW9kZWwgPSAnc2V0dGluZ3MubW9kZWwnO1xuXG4gIHJldHVybiBlcnJvcnM7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2V0dGluZ3NGb3JtU3RhdGUge1xuICB2YWx1ZXM6IFNldHRpbmdzRm9ybVZhbHVlcztcbiAgZGlydHk6IGJvb2xlYW47XG4gIHNhdmVkOiBib29sZWFuO1xuICBlcnJvcjogc3RyaW5nIHwgbnVsbDtcbiAgcmV2aXNpb246IG51bWJlcjtcbn1cblxuZXhwb3J0IGNvbnN0IElOSVRJQUxfU0VUVElOR1NfRk9STTogU2V0dGluZ3NGb3JtU3RhdGUgPSB7XG4gIHZhbHVlczogeyBiYXNlVXJsOiAnJywgYXBpS2V5OiAnJywgbW9kZWw6ICcnLCB1c2VTZXNzaW9uTW9kZWw6IHRydWUsIGludGVuc2l0eTogREVGQVVMVF9JTlRFTlNJVFkgfSxcbiAgZGlydHk6IGZhbHNlLFxuICBzYXZlZDogZmFsc2UsXG4gIGVycm9yOiBudWxsLFxuICByZXZpc2lvbjogLTEsXG59O1xuXG5leHBvcnQgdHlwZSBTZXR0aW5nc0Zvcm1BY3Rpb24gPVxuICB8IHsgdHlwZTogJ3NlZWQnOyB2YWx1ZXM6IFNldHRpbmdzRm9ybVZhbHVlczsgcmV2aXNpb246IG51bWJlciB9XG4gIHwgeyB0eXBlOiAnZWRpdCc7IGZpZWxkOiBrZXlvZiBTZXR0aW5nc0Zvcm1WYWx1ZXM7IHZhbHVlOiBzdHJpbmcgfCBib29sZWFuIH1cbiAgfCB7IHR5cGU6ICdjb21taXQnOyByZXZpc2lvbjogbnVtYmVyIH1cbiAgfCB7IHR5cGU6ICdmYWlsJzsgbWVzc2FnZTogc3RyaW5nIH07XG5cbmV4cG9ydCBmdW5jdGlvbiByZWR1Y2VTZXR0aW5nc0Zvcm0oc3RhdGU6IFNldHRpbmdzRm9ybVN0YXRlLCBhY3Rpb246IFNldHRpbmdzRm9ybUFjdGlvbik6IFNldHRpbmdzRm9ybVN0YXRlIHtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgJ3NlZWQnOlxuICAgICAgcmV0dXJuIGFjdGlvbi5yZXZpc2lvbiA8PSBzdGF0ZS5yZXZpc2lvblxuICAgICAgICA/IHN0YXRlXG4gICAgICAgIDogeyAuLi5zdGF0ZSwgdmFsdWVzOiB7IC4uLmFjdGlvbi52YWx1ZXMgfSwgZGlydHk6IGZhbHNlLCBzYXZlZDogZmFsc2UsIGVycm9yOiBudWxsLCByZXZpc2lvbjogYWN0aW9uLnJldmlzaW9uIH07XG4gICAgY2FzZSAnZWRpdCc6XG4gICAgICByZXR1cm4geyAuLi5zdGF0ZSwgdmFsdWVzOiB7IC4uLnN0YXRlLnZhbHVlcywgW2FjdGlvbi5maWVsZF06IGFjdGlvbi52YWx1ZSB9LCBkaXJ0eTogdHJ1ZSwgc2F2ZWQ6IGZhbHNlLCBlcnJvcjogbnVsbCB9O1xuICAgIGNhc2UgJ2NvbW1pdCc6XG4gICAgICByZXR1cm4geyAuLi5zdGF0ZSwgZGlydHk6IGZhbHNlLCBzYXZlZDogdHJ1ZSwgZXJyb3I6IG51bGwsIHJldmlzaW9uOiBhY3Rpb24ucmV2aXNpb24gfTtcbiAgICBjYXNlICdmYWlsJzpcbiAgICAgIHJldHVybiB7IC4uLnN0YXRlLCBlcnJvcjogYWN0aW9uLm1lc3NhZ2UgfTtcbiAgfVxufVxuIiwgIi8qKiDorr7nva7ooajljZUgc3RvcmXvvJroh6rlrp7njrAgZGVmaW5lU3RvcmXvvIzpm7YgQGRlZXBzZWVrLWFpIOi/kOihjOaXtuS+nei1lu+8iOahjOmdoua4suafk+WZqOWFvOWuue+8iSAqL1xuaW1wb3J0IHtcbiAgSU5JVElBTF9TRVRUSU5HU19GT1JNLFxuICByZWR1Y2VTZXR0aW5nc0Zvcm0sXG4gIHZhbGlkYXRlU2V0dGluZ3NGb3JtLFxuICB0eXBlIFNldHRpbmdzRm9ybVN0YXRlLFxuICB0eXBlIFNldHRpbmdzRm9ybVZhbHVlcyxcbn0gZnJvbSAnLi9zZXR0aW5ncy1mb3JtLXN0YXRlLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBTZXR0aW5nc0Zvcm1BY3Rpb25zIHtcbiAgc2VlZCh2YWx1ZXM6IFNldHRpbmdzRm9ybVZhbHVlcywgcmV2aXNpb246IG51bWJlcik6IHZvaWQ7XG4gIGVkaXQoZmllbGQ6IGtleW9mIFNldHRpbmdzRm9ybVZhbHVlcywgdmFsdWU6IHN0cmluZyk6IHZvaWQ7XG4gIGNvbW1pdChyZXZpc2lvbjogbnVtYmVyKTogdm9pZDtcbiAgZmFpbChtZXNzYWdlOiBzdHJpbmcpOiB2b2lkO1xuICAvKiog5L+d5a2Y5YmN5qCh6aqM77yb6L+U5Zue6ZSZ6K+v5a2X5YW477yb5peg6ZSZ6K+v5pe26L+U5ZueIG51bGwgKi9cbiAgdmFsaWRhdGUodmFsdWVzOiBTZXR0aW5nc0Zvcm1WYWx1ZXMpOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHwgbnVsbDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTZXR0aW5nc0Zvcm1TdG9yZUhhbmRsZSB7XG4gIHNwZWM6IHtcbiAgICBpbml0OiAoKSA9PiBTZXR0aW5nc0Zvcm1TdGF0ZTtcbiAgICBhY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCAoZDogU2V0dGluZ3NGb3JtU3RhdGUsIC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkPjtcbiAgfTtcbiAgY3JlYXRlKHNjb3BlS2V5Pzogc3RyaW5nKToge1xuICAgIGFjdGlvbnM6IFNldHRpbmdzRm9ybUFjdGlvbnM7XG4gICAgZ2V0U25hcHNob3Q6ICgpID0+IFNldHRpbmdzRm9ybVN0YXRlO1xuICAgIHN1YnNjcmliZTogKGZuOiAoKSA9PiB2b2lkKSA9PiAoKSA9PiB2b2lkO1xuICAgIHN0b3JlOiB1bmtub3duO1xuICAgIGNsZWFyUGVyc2lzdGVkOiAoKSA9PiB2b2lkO1xuICB9O1xufVxuXG4vKiog6Ieq5a6e546wIGRlZmluZVN0b3JlIOKAlOKAlCDpgb/lhY0gQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtcnVudGltZS9jbGllbnQg55qEIHJlcXVpcmUg5Zyo5qGM6Z2i5riy5p+T5Zmo5peg5rOV6Kej5p6QICovXG5mdW5jdGlvbiBkZWZpbmVTdG9yZShkZWNsOiB7XG4gIGluaXQ6ICgpID0+IFNldHRpbmdzRm9ybVN0YXRlO1xuICBhY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCAoZDogU2V0dGluZ3NGb3JtU3RhdGUsIC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkPjtcbn0pIHtcbiAgcmV0dXJuIHtcbiAgICBzcGVjOiBkZWNsLFxuICAgIGNyZWF0ZShfc2NvcGVLZXk/OiBzdHJpbmcpOiB7XG4gICAgICBhY3Rpb25zOiBTZXR0aW5nc0Zvcm1BY3Rpb25zO1xuICAgICAgZ2V0U25hcHNob3Q6ICgpID0+IFNldHRpbmdzRm9ybVN0YXRlO1xuICAgICAgc3Vic2NyaWJlOiAoZm46ICgpID0+IHZvaWQpID0+ICgpID0+IHZvaWQ7XG4gICAgICBzdG9yZTogdW5rbm93bjtcbiAgICAgIGNsZWFyUGVyc2lzdGVkOiAoKSA9PiB2b2lkO1xuICAgIH0ge1xuICAgICAgbGV0IHN0YXRlID0gZGVjbC5pbml0KCk7XG4gICAgICBjb25zdCBsaXN0ZW5lcnMgPSBuZXcgU2V0PCgpID0+IHZvaWQ+KCk7XG4gICAgICBjb25zdCBub3RpZnkgPSAoKSA9PiB7IGZvciAoY29uc3QgZm4gb2YgbGlzdGVuZXJzKSBmbigpOyB9O1xuICAgICAgY29uc3Qgc3RvcmUgPSB7XG4gICAgICAgIGdldFNuYXBzaG90OiAoKSA9PiBzdGF0ZSxcbiAgICAgICAgc3Vic2NyaWJlOiAoZm46ICgpID0+IHZvaWQpID0+IHsgbGlzdGVuZXJzLmFkZChmbik7IHJldHVybiAoKSA9PiB2b2lkIGxpc3RlbmVycy5kZWxldGUoZm4pOyB9LFxuICAgICAgICB1cGRhdGU6IChtdXRhdG9yOiAoZHJhZnQ6IFNldHRpbmdzRm9ybVN0YXRlKSA9PiB2b2lkKSA9PiB7XG4gICAgICAgICAgY29uc3QgZHJhZnQgPSB7IC4uLnN0YXRlLCB2YWx1ZXM6IHsgLi4uc3RhdGUudmFsdWVzIH0gfTtcbiAgICAgICAgICBtdXRhdG9yKGRyYWZ0KTtcbiAgICAgICAgICBzdGF0ZSA9IGRyYWZ0O1xuICAgICAgICAgIG5vdGlmeSgpO1xuICAgICAgICB9LFxuICAgICAgfTtcbiAgICAgIGNvbnN0IGFjdGlvbnM6IFJlY29yZDxzdHJpbmcsICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZD4gPSB7fTtcbiAgICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKGRlY2wuYWN0aW9ucykpIHtcbiAgICAgICAgY29uc3QgbXV0YXRlID0gZGVjbC5hY3Rpb25zW2tleV07XG4gICAgICAgIGFjdGlvbnNba2V5XSA9ICguLi5wYXJhbXM6IGFueVtdKSA9PiB7XG4gICAgICAgICAgc3RvcmUudXBkYXRlKChkcmFmdDogU2V0dGluZ3NGb3JtU3RhdGUpID0+IHsgbXV0YXRlKGRyYWZ0LCAuLi5wYXJhbXMpOyB9KTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGFjdGlvbnM6IGFjdGlvbnMgYXMgdW5rbm93biBhcyBTZXR0aW5nc0Zvcm1BY3Rpb25zLFxuICAgICAgICBnZXRTbmFwc2hvdDogc3RvcmUuZ2V0U25hcHNob3QsXG4gICAgICAgIHN1YnNjcmliZTogc3RvcmUuc3Vic2NyaWJlLFxuICAgICAgICBzdG9yZSxcbiAgICAgICAgY2xlYXJQZXJzaXN0ZWQ6ICgpID0+IHtcbiAgICAgICAgICBpZiAodHlwZW9mIGxvY2FsU3RvcmFnZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRyeSB7IGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdkc2gtcHJvbXB0LW9wdGltaXplL3NldHRpbmdzJyk7IH0gY2F0Y2gge31cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH0sXG4gIH07XG59XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVTZXR0aW5nc0Zvcm1TdG9yZSA9ICgpOiBTZXR0aW5nc0Zvcm1TdG9yZUhhbmRsZSA9PiB7XG4gIHJldHVybiBkZWZpbmVTdG9yZSh7XG4gICAgaW5pdDogKCk6IFNldHRpbmdzRm9ybVN0YXRlID0+ICh7XG4gICAgICAuLi5JTklUSUFMX1NFVFRJTkdTX0ZPUk0sXG4gICAgICB2YWx1ZXM6IHsgLi4uSU5JVElBTF9TRVRUSU5HU19GT1JNLnZhbHVlcyB9LFxuICAgIH0pLFxuICAgIGFjdGlvbnM6IHtcbiAgICAgIHNlZWQ6IChkOiBTZXR0aW5nc0Zvcm1TdGF0ZSwgdmFsdWVzOiBTZXR0aW5nc0Zvcm1WYWx1ZXMsIHJldmlzaW9uOiBudW1iZXIpID0+XG4gICAgICAgIE9iamVjdC5hc3NpZ24oZCwgcmVkdWNlU2V0dGluZ3NGb3JtKGQsIHsgdHlwZTogJ3NlZWQnLCB2YWx1ZXMsIHJldmlzaW9uIH0pKSxcbiAgICAgIGVkaXQ6IChkOiBTZXR0aW5nc0Zvcm1TdGF0ZSwgZmllbGQ6IGtleW9mIFNldHRpbmdzRm9ybVZhbHVlcywgdmFsdWU6IHN0cmluZykgPT5cbiAgICAgICAgT2JqZWN0LmFzc2lnbihkLCByZWR1Y2VTZXR0aW5nc0Zvcm0oZCwgeyB0eXBlOiAnZWRpdCcsIGZpZWxkLCB2YWx1ZSB9KSksXG4gICAgICBjb21taXQ6IChkOiBTZXR0aW5nc0Zvcm1TdGF0ZSwgcmV2aXNpb246IG51bWJlcikgPT5cbiAgICAgICAgT2JqZWN0LmFzc2lnbihkLCByZWR1Y2VTZXR0aW5nc0Zvcm0oZCwgeyB0eXBlOiAnY29tbWl0JywgcmV2aXNpb24gfSkpLFxuICAgICAgZmFpbDogKGQ6IFNldHRpbmdzRm9ybVN0YXRlLCBtZXNzYWdlOiBzdHJpbmcpID0+XG4gICAgICAgIE9iamVjdC5hc3NpZ24oZCwgcmVkdWNlU2V0dGluZ3NGb3JtKGQsIHsgdHlwZTogJ2ZhaWwnLCBtZXNzYWdlIH0pKSxcbiAgICAgIHZhbGlkYXRlOiAoX2Q6IFNldHRpbmdzRm9ybVN0YXRlLCB2YWx1ZXM6IFNldHRpbmdzRm9ybVZhbHVlcykgPT4ge1xuICAgICAgICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0ZVNldHRpbmdzRm9ybSh2YWx1ZXMpO1xuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMoZXJyb3JzKS5sZW5ndGggPT09IDAgPyBudWxsIDogZXJyb3JzO1xuICAgICAgfSxcbiAgICB9LFxuICB9KTtcbn07Il0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FDZU8sSUFBTSxvQkFBK0I7QUFFNUMsSUFBTSxjQUFvQyxDQUFDLFNBQVMsWUFBWSxNQUFNO0FBQ3RFLFNBQVMsWUFBWSxHQUF1QjtBQUMxQyxTQUFPLE9BQU8sTUFBTSxZQUFh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QixDQUFDLENBQUMsR0FBRyxLQUFNLGNBQWM7QUFDaEYsb0JBQUksSUFBSSxNQUFNLElBQUksU0FBUyxPQUFPLElBQUksVUFBVSxVQUFVO0FBQ3hELHdCQUFNLElBQUksSUFBSTtBQUNkLHNCQUFJLE9BQU8sRUFBRSxhQUFhLFlBQVksT0FBTyxFQUFFLFVBQVUsVUFBVTtBQUNqRSwyQkFBTyxFQUFFLFdBQVcsTUFBTSxVQUFVLEVBQUUsVUFBVSxPQUFPLEVBQUUsTUFBTTtBQUFBLGtCQUNqRTtBQUNBLHlCQUFPLEVBQUUsV0FBVyxPQUFPLE9BQVEsSUFBSSxVQUFVLElBQUksTUFBTSxXQUFXLElBQUksTUFBTSxTQUFVLFdBQVc7QUFBQSxnQkFDdkc7QUFDQSx1QkFBTyxFQUFFLFdBQVcsT0FBTyxPQUFRLElBQUksVUFBVSxJQUFJLE1BQU0sV0FBVyxJQUFJLE1BQU0sU0FBVSxhQUFhO0FBQUEsY0FDekcsU0FBUyxHQUFHO0FBQ1YsdUJBQU8sRUFBRSxXQUFXLE9BQU8sT0FBTyxPQUFRLEdBQTZCLFdBQVcsQ0FBQyxFQUFFO0FBQUEsY0FDdkY7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGLENBQUM7QUFLRCxNQUFJLE9BQU8sTUFBTTtBQUNmLFVBQU0sWUFBWSxDQUFDLE1BQXFCO0FBQ3RDLFVBQUksRUFBRSxPQUFRO0FBQ2QsVUFBSSxDQUFDLEVBQUUsVUFBVSxFQUFFLFNBQVMsT0FBUTtBQUNwQyxZQUFNLEtBQUssU0FBUztBQUNwQixZQUFNLFVBQ0osY0FBYyx1QkFDYixjQUFjLGdCQUFnQixHQUFHLHFCQUFxQixHQUFHLFFBQVEsdUJBQXVCLE1BQU07QUFDakcsVUFBSSxDQUFDLFFBQVM7QUFDZCxRQUFFLGVBQWU7QUFDakIsMEJBQW9CO0FBQUEsSUFDdEI7QUFDQSxhQUFTLGlCQUFpQixXQUFXLFNBQVM7QUFDOUMsV0FBTyxNQUFNLFNBQVMsb0JBQW9CLFdBQVcsU0FBUztBQUFBLEVBQ2hFLEdBQUcsaUNBQWlDO0FBQ3RDOyIsCiAgIm5hbWVzIjogWyJzdGF0ZSIsICJSZWFjdCIsICJpbXBvcnRfcmVhY3QiLCAiaW1wb3J0X2pzeF9ydW50aW1lIiwgIkNTU19JRCIsICJpbmplY3RDc3MiLCAic3RhdGUiLCAiaW1wb3J0X3JlYWN0IiwgImltcG9ydF9qc3hfcnVudGltZSIsICJDU1NfSUQiLCAiaW5qZWN0Q3NzIiwgInN0YXRlIiwgInN0YXRlIiwgImxpc3RlbmVycyJdCn0K

    return module.exports;
  }
});
