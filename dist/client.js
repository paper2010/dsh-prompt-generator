window.__ModuleLoader__.load({
  id: "dsh-prompt-optimizer",
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
  }
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
  "error.config": "配置不完整，请到设置中检查",
  "settings.title": "Prompt 优化",
  "settings.desc": "配置润色接口（OpenAI 兼容）；Key 明文保存在本地",
  "settings.baseUrl": "接口地址",
  "settings.apiKey": "API Key",
  "settings.model": "模型名",
  "settings.useSessionModel": "使用当前会话模型",
  "settings.useSessionModelHint": "开启时优化请求跟随会话模型；关闭后使用下方自定义模型名",
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
  "error.config": "Incomplete configuration; check settings",
  "settings.title": "Prompt Optimizer",
  "settings.desc": "Configure the rewrite endpoint (OpenAI-compatible); key is stored locally in plain text",
  "settings.baseUrl": "Base URL",
  "settings.apiKey": "API Key",
  "settings.model": "Model",
  "settings.useSessionModel": "Use current session model",
  "settings.useSessionModelHint": "When on, optimization requests follow the session model; when off, the custom model below is used",
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
  const response = await fetch(`/dsh-prompt-optimizer/api/${encodeURIComponent(method)}`, {
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
  const res = await callRpc(rpc, "sessionModel", {}, rpcTimeoutMs);
  if (!res.ok || !res.value || typeof res.value !== "object") return null;
  const v = res.value;
  if (typeof v.provider !== "string" || typeof v.model !== "string") return null;
  const info = { provider: v.provider, model: v.model };
  if (typeof res.value.reasoningEffort === "string") {
    info.reasoningEffort = res.value.reasoningEffort;
  }
  return info;
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
        else if (line.startsWith("data:")) data = line.slice(5).trim();
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
    const response = await fetch("/dsh-prompt-optimizer/api/optimize.stream", {
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
    await readSseFrames(response, (event, data) => {
      if (data === "{}" || data === "[DONE]") return;
      if (event === "reasoning") {
        reasoning += data;
        onReasoning?.(reasoning);
      } else if (event === "delta") {
        out += data;
        onDelta(out);
      }
    });
    if (signal.aborted) throw new Error("aborted");
    return out;
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener("abort", onAbort);
  }
}

// src/memory.ts
var KEY = "dsh-prompt-optimizer.memory.v1";
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
function loadMemory() {
  const s = storage();
  if (!s) return empty();
  try {
    const raw = s.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw);
    const base = empty();
    return {
      ...base,
      profile: typeof parsed.profile === "string" ? parsed.profile : "",
      accepted: Array.isArray(parsed.accepted) ? parsed.accepted.slice(0, MAX_ACCEPTED) : [],
      rejected: Array.isArray(parsed.rejected) ? parsed.rejected.slice(0, MAX_REJECTED) : [],
      sessionDrafts: parsed.sessionDrafts && typeof parsed.sessionDrafts === "object" ? parsed.sessionDrafts : {},
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
      return state2.status === "optimizing" ? state2 : { ...state2, status: "guide" };
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
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  try {
    if (config.useSessionModel && ctx.host) {
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

// src/OptimizeButton.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var CSS_ID = "dsh-prompt-optimizer/button.css";
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
var CSS_ID2 = "dsh-prompt-optimizer/card.css";
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
function textOfInput2(el) {
  if (el instanceof HTMLTextAreaElement) return el.value;
  if (el instanceof HTMLElement && el.isContentEditable) return el.innerText || "";
  return "";
}
function isSessionInput2(el) {
  if (el === null) return false;
  if (el instanceof HTMLTextAreaElement) return true;
  const editable = el instanceof HTMLElement && el.isContentEditable;
  const composer = el instanceof Element && el.closest("[data-composer-input]") !== null;
  return editable || composer;
}
function findComposer() {
  const active = document.activeElement;
  if (active && isSessionInput2(active)) return active;
  const composer = document.querySelector("[data-composer-input]");
  if (composer && isSessionInput2(composer)) return composer;
  const all = document.querySelectorAll("textarea");
  for (const ta of all) {
    if (!ta.disabled) return ta;
  }
  return null;
}
function readComposerText() {
  const el = findComposer();
  return el ? textOfInput2(el) : "";
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
      getDraft: () => readComposerText(),
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
    recordOutcome("rejected");
    closePreview();
  };
  const copy = async () => {
    if (!navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(result);
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
var CSS_ID3 = "dsh-prompt-optimizer/settings.css";
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
      { baseUrl: config.baseUrl, apiKey: config.apiKey, model: config.model, useSessionModel: config.useSessionModel },
      submitRevision + getEpoch()
    );
  }, [config.baseUrl, config.apiKey, config.model, config.useSessionModel, getEpoch]);
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
        { baseUrl: DEFAULTS.baseUrl, apiKey: DEFAULTS.apiKey, model: DEFAULTS.model },
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
  if (!values.useSessionModel && !values.model.trim()) errors.model = "settings.model";
  return errors;
}
var INITIAL_SETTINGS_FORM = {
  values: { baseUrl: "", apiKey: "", model: "", useSessionModel: true },
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
              localStorage.removeItem("dsh-prompt-optimizer/settings");
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
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), "prompt-optimizer: locale registration");
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
          id: "prompt-optimizer-button",
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
          id: "prompt-optimizer-card",
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
      useSessionModel: merged.useSessionModel
    };
    try {
      const saved = await rpcConfig("set", {
        patch: {
          baseUrl: written.baseUrl,
          apiKey: written.apiKey,
          model: written.model,
          useSessionModel: written.useSessionModel
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
          useSessionModel: true
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
          id: "prompt-optimizer-settings",
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
  const onKeydown = (e) => {
    if (!e.altKey || e.code !== "KeyO") return;
    const el = document.activeElement;
    const inInput = el instanceof HTMLTextAreaElement || el instanceof HTMLElement && (el.isContentEditable || el.closest("[data-composer-input]") !== null);
    if (!inInput) return;
    e.preventDefault();
    emitOptimizeRequest();
  };
  document.addEventListener("keydown", onKeydown);
}
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2luZGV4LnRzIiwgIi4uL3NyYy9vcHRpbWl6ZXIudHMiLCAiLi4vc3JjL2xvY2FsZXMudHMiLCAiLi4vc3JjL2V2ZW50cy50cyIsICIuLi9zcmMvT3B0aW1pemVCdXR0b24udHN4IiwgIi4uL3NyYy9zZXNzaW9uLW9wdGltaXplci50cyIsICIuLi9zcmMvbWVtb3J5LnRzIiwgIi4uL3NyYy9wcmV2aWV3LXN0YXRlLnRzIiwgIi4uL3NyYy9wcmV2aWV3LWJ1cy50cyIsICIuLi9zcmMvb3B0aW1pemVyLXN0b3JlLnRzIiwgIi4uL3NyYy9QcmV2aWV3Q2FyZC50c3giLCAiLi4vc3JjL1NldHRpbmdzUm93LnRzeCIsICIuLi9zcmMvc2V0dGluZ3MtZm9ybS1zdGF0ZS50cyIsICIuLi9zcmMvc2V0dGluZ3Mtc3RvcmUudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKiBkc2gtcHJvbXB0LW9wdGltaXplciDmj5Lku7blhaXlj6Mg4oCUIGFwcGx5KGN0eCkgKi9cblxuaW1wb3J0IHR5cGUgeyBDbGllbnRDb250ZXh0IH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtcnVudGltZS9jbGllbnQnO1xuaW1wb3J0IHR5cGUgeyBMYW5nLCBQcm9tcHRDb25maWcgfSBmcm9tICcuL29wdGltaXplci5qcyc7XG5pbXBvcnQgeyBERUZBVUxUUywgbWVyZ2VDb25maWcgfSBmcm9tICcuL29wdGltaXplci5qcyc7XG5pbXBvcnQgeyBOUywgemgsIGVuLCBsYW5nT2YgfSBmcm9tICcuL2xvY2FsZXMuanMnO1xuaW1wb3J0IHR5cGUgeyBPcHRpbWl6ZXJBY3Rpb25zIH0gZnJvbSAnLi9vcHRpbWl6ZXItc3RvcmUuanMnO1xuaW1wb3J0IHsgZW1pdE9wdGltaXplUmVxdWVzdCwgZW1pdE9wZW5TZXR0aW5nc1JlcXVlc3QgfSBmcm9tICcuL2V2ZW50cy5qcyc7XG5pbXBvcnQgeyBPcHRpbWl6ZUJ1dHRvbiB9IGZyb20gJy4vT3B0aW1pemVCdXR0b24udHN4JztcbmltcG9ydCB7IFByZXZpZXdDYXJkIH0gZnJvbSAnLi9QcmV2aWV3Q2FyZC50c3gnO1xuaW1wb3J0IHsgU2V0dGluZ3NSb3cgfSBmcm9tICcuL1NldHRpbmdzUm93LnRzeCc7XG5pbXBvcnQgeyBjcmVhdGVTZXR0aW5nc0Zvcm1TdG9yZSB9IGZyb20gJy4vc2V0dGluZ3Mtc3RvcmUuanMnO1xuaW1wb3J0IHR5cGUgeyBIb3N0UnBjIH0gZnJvbSAnLi9zZXNzaW9uLW9wdGltaXplci5qcyc7XG5pbXBvcnQgeyB3aXRoVGltZW91dCwgY2FsbEhvc3QgfSBmcm9tICcuL3Nlc3Npb24tb3B0aW1pemVyLmpzJztcblxuLyoqXG4gKiDlo7DmmI7mj5Lku7bkvp3otZbnmoTlrqLmiLfnq6/mnI3liqHvvIhjb3JkaXMgc2VydmljZSBrZXlz77yJ77yaYXBwbHkg5YaF57uPIGBjdHguPHNlcnZpY2U+YCDorr/pl67nmoTmnI3liqHlv4XpobvlnKjmraTlo7DmmI7jgIJcbiAqIOWAvOmhu+S4uuacjeWKoeWQjeiAjOmdnuWMhSBpZOKAlOKAlOS4juWQjOW9ouaAgeWFiOS+i+S4gOiHtO+8iGRzaC1tZXNzYWdlLXJhaWw6IFtcInNsb3RzXCIsXCJzZXNzaW9uc1wiXe+8m1xuICogZHNoLWJldHRlci1zaWRlYmFyIOS6puWjsOaYjiBsb2NhbGXvvInvvJvplJnor6/lo7DmmI7kvJrorqkgZmliZXIg5rC45LmFIFBFTkRJTkfvvIzlkK/liqjlrqHorqHnm7TmjqXliKTlpLHotKXjgIJcbiAqL1xuZXhwb3J0IGNvbnN0IGluamVjdCA9IFsnc2xvdHMnLCAnc2Vzc2lvbnMnLCAnbG9jYWxlJ107XG5cbmV4cG9ydCBmdW5jdGlvbiBhcHBseShjdHg6IENsaWVudENvbnRleHQpIHtcbiAgLy8gMS4g5paH5qGIXG4gIGN0eC5lZmZlY3QoKCkgPT4gY3R4LmxvY2FsZS5yZWdpc3RlcihOUywgeyB6aCwgZW4gfSksICdwcm9tcHQtb3B0aW1pemVyOiBsb2NhbGUgcmVnaXN0cmF0aW9uJyk7XG5cbiAgLy8gMi4g6YWN572u6ZWc5YOP77yaSFRUUCBBUEnvvIhzZXJ2ZXIgaGFsZiDor7vlhpkgfi8uZHNoL3Byb21wdC1vcHRpbWl6ZXItY29uZmlnLmpzb27vvIxcbiAgLy8g6YCa6YGTICcvZHNoLXByb21wdC1vcHRpbWl6ZXIvYXBpL2dldHxzZXQn77yJ44CC5Y6f5YWI6LWwIGNvbm5lY3Rpb24ucnBjIOeOr+WbnumAmumBk++8jOS9huahjOmdolxuICAvLyDlrr/kuLvov5DooYzml7bmsqHmnIkgY29ubmVjdGlvbiDmnI3liqHvvIhmaWJlciDmsLjkuYUgUEVORElORyDihpIg5ZCv5Yqo5oyC5q2777yJ77yM57uf5LiA6LWwIHdlYlNlcnZlciBIVFRQ44CCXG4gIGxldCBjb25maWdNaXJyb3I6IFByb21wdENvbmZpZyA9IG1lcmdlQ29uZmlnKHVuZGVmaW5lZCk7XG4gIGxldCBjb25maWdFcG9jaCA9IDA7XG4gIGNvbnN0IHJwY0NvbmZpZyA9IGFzeW5jIChlbmRwb2ludDogc3RyaW5nLCBwYXlsb2FkPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiBQcm9taXNlPHVua25vd24+ID0+IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjYWxsSG9zdChlbmRwb2ludCwgcGF5bG9hZCA/PyB7fSk7XG4gICAgaWYgKCFyZXN1bHQub2spIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYGNvbmZpZyBycGMgJHtlbmRwb2ludH0gZmFpbGVkOiAkeyhyZXN1bHQuZXJyb3IgJiYgKHJlc3VsdC5lcnJvci5kZXRhaWxzIHx8IHJlc3VsdC5lcnJvci5jb2RlKSkgfHwgJ3JwYyBmYWlsZWQnfWAsXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0LnZhbHVlO1xuICB9O1xuICBjb25zdCBsb2FkQ29uZmlnID0gYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IGF3YWl0IHJwY0NvbmZpZygnZ2V0Jyk7XG4gICAgICBjb25maWdNaXJyb3IgPSBtZXJnZUNvbmZpZyh2YWx1ZSBhcyBQYXJ0aWFsPFByb21wdENvbmZpZz4gfCB1bmRlZmluZWQpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLy8g5Yid5qyh6L+e5o6l5pyq5bCx57uq5pe25L+d5oyB6buY6K6k77yb5LiL5qyh5L+d5a2Y5ZCO6ZWc5YOP5Y2z5pu05pawXG4gICAgfVxuICB9O1xuICB2b2lkIGxvYWRDb25maWcoKTtcblxuICAvLyAyLjUg5b2T5YmN5Lya6K+d6Kej5p6Q77ya5YWI5Y+W5r+A5rS75Lya6K+dIGlk77yIc2Vzc2lvbnMuY3VycmVudFByb3ZpZGVJbmZv77yJ77yMXG4gIC8vIOWGjeafpSBzZXNzaW9uLm1vZGVscyDigJTigJQg5LiN5LygIHNlc3Npb25JZCDml7bmnI3liqHnq6/lm57pgIDpu5jorqTmqKHlnovogIzpnZ7kvJror53mqKHlnovvvIjlrp7mtYsgYnVn77yJXG4gIGNvbnN0IGdldEFjdGl2ZVNlc3Npb24gPSAoKTogc3RyaW5nIHwgbnVsbCA9PiB7XG4gICAgY29uc3QgaW5mbyA9IChcbiAgICAgIGN0eC5zZXNzaW9ucyBhcyB7XG4gICAgICAgIGN1cnJlbnRQcm92aWRlSW5mbz86IHsgZ2V0U25hcHNob3Q/OiAoKSA9PiB7IHNlc3Npb25JZD86IHN0cmluZyB9IH07XG4gICAgICB9IHwgdW5kZWZpbmVkXG4gICAgKT8uY3VycmVudFByb3ZpZGVJbmZvPy5nZXRTbmFwc2hvdD8uKCk7XG4gICAgY29uc3Qgc2Vzc2lvbklkID0gaW5mbz8uc2Vzc2lvbklkO1xuICAgIHJldHVybiB0eXBlb2Ygc2Vzc2lvbklkID09PSAnc3RyaW5nJyAmJiBzZXNzaW9uSWQubGVuZ3RoID4gMCA/IHNlc3Npb25JZCA6IG51bGw7XG4gIH07XG4gIC8vIDIuNiDlrr/kuLvpgJrpgZPvvIjkvJror53pu5jorqTmqKHlnosgKyBzZXJ2ZXIg5Y2KIGxsbS5zdHJlYW3vvIzpm7bphY3nva7vvInvvJpcbiAgLy8g6YCa6YGT5Y2z6Ieq5pyJIFJQQ++8iC9kc2gtcHJvbXB0LW9wdGltaXplcu+8ie+8m3NlcnZlciBoYWxmIOeUqCBhZ2VudERlZmF1bHRNb2RlbCDlj5blvZPliY1cbiAgLy8g5Lya6K+d5qih5Z6L44CBbGxtLnN0cmVhbSDnnJ/mtYHlvI/vvIjlj5boh6ogZHNoLWVsZiDlt7Lpqozor4HnmoTlrr/kuLvmnI3liqHpnaLvvInjgILkuI3nlKggc2Vzc2lvbi5jcmVhdGUvXG4gIC8vIGZvcmvvvJrlkI7lj7DkvJror53kuI3lnKjliY3lj7DkuI3op6blj5HmqKHlnovmiafooYzvvIzoh6rnvJYgaWQg6KKr6Z2Z6buY5ouS57udIOKGkiDjgIzmsLjov5zmraPlnKjkvJjljJbjgI3vvIjlrp7mtYvvvInjgIJcbiAgY29uc3QgaG9zdFJwYzogSG9zdFJwYyA9IHtcbiAgICBjYWxsOiAoZW5kcG9pbnQsIHBheWxvYWQpID0+IGNhbGxIb3N0KGVuZHBvaW50LCBwYXlsb2FkID8/IHt9KSxcbiAgfTtcbiAgY29uc3QgZ2V0SG9zdCA9ICgpOiB7IHJwYzogSG9zdFJwYyB9ID0+ICh7IHJwYzogaG9zdFJwYyB9KTtcbiAgY29uc3QgZ2V0U2Vzc2lvbk1vZGVsID0gYXN5bmMgKCk6IFByb21pc2U8eyBwcm92aWRlcjogc3RyaW5nOyBtb2RlbDogc3RyaW5nIH0gfCBudWxsPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IHdpdGhUaW1lb3V0KGNhbGxIb3N0KCdzZXNzaW9uTW9kZWwnLCB7fSksIDUwMDAsICdzZXNzaW9uTW9kZWwnKTtcbiAgICAgIGlmIChyZXMub2sgJiYgcmVzLnZhbHVlICYmIHR5cGVvZiByZXMudmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGNvbnN0IHYgPSByZXMudmFsdWUgYXMgeyBwcm92aWRlcj86IHN0cmluZzsgbW9kZWw/OiBzdHJpbmcgfTtcbiAgICAgICAgaWYgKHR5cGVvZiB2LnByb3ZpZGVyID09PSAnc3RyaW5nJyAmJiB0eXBlb2Ygdi5tb2RlbCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICByZXR1cm4geyBwcm92aWRlcjogdi5wcm92aWRlciwgbW9kZWw6IHYubW9kZWwgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH07XG5cbiAgLy8gMi41YiDpooTop4jnqpflj6PkvJror53nu5HlrprvvJrljaHniYflj6rlnKjlj5HotbfkvJror53mmL7npLrvvIjliIfotbDkuI3ot5/pmo/vvIlcbiAgY29uc3QgZ2V0U2Vzc2lvbklkID0gKCk6IHN0cmluZyB8IG51bGwgPT4gZ2V0QWN0aXZlU2Vzc2lvbigpO1xuXG4gIC8vIDMuIOivreiogOmVnOWDj1xuICBsZXQgbGFuZzogTGFuZyA9IGxhbmdPZihjdHgubG9jYWxlLmdldExvY2FsZSgpLmFjdGl2ZSk7XG4gIGN0eC5vbignbG9jYWxlL2NoYW5nZScsIChzbmFwOiB7IGFjdGl2ZTogc3RyaW5nIH0pID0+IHtcbiAgICBsYW5nID0gbGFuZ09mKHNuYXAuYWN0aXZlKTtcbiAgfSk7XG5cbiAgLy8gNC4g5Lya6K+d5qe95L2N77ya5oyJ6ZKuICsg6aKE6KeI5Y2h54mHXG4gIGN0eC5pbmplY3QoWydzbG90cycsICdzZXNzaW9ucyddLCAoc2NvcGUpID0+IHtcbiAgICBzY29wZS5zbG90cy5pbmplY3QoJ2NvbnZlcnNhdGlvbi5pbnB1dC5yaWdodCcsICgpID0+XG4gICAgICBzY29wZS5zbG90cy5yZWdpc3RlcihcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdjb252ZXJzYXRpb24uaW5wdXQucmlnaHQnLFxuICAgICAgICAgIGlkOiAncHJvbXB0LW9wdGltaXplci1idXR0b24nLFxuICAgICAgICAgIG9yZGVyOiAwLFxuICAgICAgICAgIGxvY2FsZTogTlMsXG4gICAgICAgICAgaW5qZWN0OiAoKSA9PiAoe1xuICAgICAgICAgICAgZ2V0Q29uZmlnOiAoKSA9PiBjb25maWdNaXJyb3IsXG4gICAgICAgICAgICBnZXRMYW5nOiAoKSA9PiBsYW5nLFxuICAgICAgICAgICAgZ2V0U2Vzc2lvbk1vZGVsLFxuICAgICAgICAgICAgZ2V0SG9zdCxcbiAgICAgICAgICAgIGdldFNlc3Npb25JZCxcbiAgICAgICAgICB9KSxcbiAgICAgICAgfSxcbiAgICAgICAgT3B0aW1pemVCdXR0b24sXG4gICAgICApLFxuICAgICk7XG4gICAgc2NvcGUuc2xvdHMuaW5qZWN0KCdjb252ZXJzYXRpb24uaW5wdXQub3ZlcmxheScsICgpID0+XG4gICAgICBzY29wZS5zbG90cy5yZWdpc3RlcihcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdjb252ZXJzYXRpb24uaW5wdXQub3ZlcmxheScsXG4gICAgICAgICAgaWQ6ICdwcm9tcHQtb3B0aW1pemVyLWNhcmQnLFxuICAgICAgICAgIG9yZGVyOiAxMCxcbiAgICAgICAgICBsb2NhbGU6IE5TLFxuICAgICAgICAgIGluamVjdDogKCkgPT4gKHtcbiAgICAgICAgICAgIGdldENvbmZpZzogKCkgPT4gY29uZmlnTWlycm9yLFxuICAgICAgICAgICAgZ2V0TGFuZzogKCkgPT4gbGFuZyxcbiAgICAgICAgICAgIG9wZW5TZXR0aW5nczogKCkgPT4gZW1pdE9wZW5TZXR0aW5nc1JlcXVlc3QoKSxcbiAgICAgICAgICAgIGdldFNlc3Npb25Nb2RlbCxcbiAgICAgICAgICAgIGdldEhvc3QsXG4gICAgICAgICAgICBnZXRTZXNzaW9uSWQsXG4gICAgICAgICAgfSksXG4gICAgICAgIH0sXG4gICAgICAgIFByZXZpZXdDYXJkLFxuICAgICAgKSxcbiAgICApO1xuICB9KTtcblxuICAvLyA2LiDorr7nva7ooYzvvIhyb290IOS9nOeUqOWfn++8iVxuICBjb25zdCBzZXR0aW5nc1N0b3JlID0gY3JlYXRlU2V0dGluZ3NGb3JtU3RvcmUoKTtcbiAgY29uc3Qgc2F2ZUNvbmZpZyA9IGFzeW5jIChyYXc6IFBhcnRpYWw8UHJvbXB0Q29uZmlnPik6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IG1lcmdlZCA9IG1lcmdlQ29uZmlnKHsgLi4uY29uZmlnTWlycm9yLCAuLi5yYXcgfSk7XG4gICAgY29uc3Qgd3JpdHRlbjogUHJvbXB0Q29uZmlnID0ge1xuICAgICAgYmFzZVVybDogbWVyZ2VkLmJhc2VVcmwsXG4gICAgICBhcGlLZXk6IG1lcmdlZC5hcGlLZXkudHJpbSgpLFxuICAgICAgbW9kZWw6IG1lcmdlZC5tb2RlbCxcbiAgICAgIHVzZVNlc3Npb25Nb2RlbDogbWVyZ2VkLnVzZVNlc3Npb25Nb2RlbCxcbiAgICB9O1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzYXZlZCA9IGF3YWl0IHJwY0NvbmZpZygnc2V0Jywge1xuICAgICAgICBwYXRjaDoge1xuICAgICAgICAgIGJhc2VVcmw6IHdyaXR0ZW4uYmFzZVVybCxcbiAgICAgICAgICBhcGlLZXk6IHdyaXR0ZW4uYXBpS2V5LFxuICAgICAgICAgIG1vZGVsOiB3cml0dGVuLm1vZGVsLFxuICAgICAgICAgIHVzZVNlc3Npb25Nb2RlbDogd3JpdHRlbi51c2VTZXNzaW9uTW9kZWwsXG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICAgIGNvbmZpZ01pcnJvciA9IG1lcmdlQ29uZmlnKHNhdmVkIGFzIFBhcnRpYWw8UHJvbXB0Q29uZmlnPiB8IHVuZGVmaW5lZCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcikpO1xuICAgIH1cbiAgfTtcbiAgY29uc3QgcmVzZXRDb25maWcgPSBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNhdmVkID0gYXdhaXQgcnBjQ29uZmlnKCdzZXQnLCB7XG4gICAgICAgIHBhdGNoOiB7XG4gICAgICAgICAgYmFzZVVybDogREVGQVVMVFMuYmFzZVVybCxcbiAgICAgICAgICBhcGlLZXk6IERFRkFVTFRTLmFwaUtleSxcbiAgICAgICAgICBtb2RlbDogREVGQVVMVFMubW9kZWwsXG4gICAgICAgICAgdXNlU2Vzc2lvbk1vZGVsOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgICBjb25maWdNaXJyb3IgPSBtZXJnZUNvbmZpZyhzYXZlZCBhcyBQYXJ0aWFsPFByb21wdENvbmZpZz4gfCB1bmRlZmluZWQpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpKTtcbiAgICB9XG4gIH07XG5cbiAgY3R4LmluamVjdChbJ3Nsb3RzJ10sIChzY29wZSkgPT4ge1xuICAgIHNjb3BlLnNsb3RzLmluamVjdCgnc2V0dGluZ3MuZ2VuZXJhbC5pdGVtJywgKCkgPT5cbiAgICAgIHNjb3BlLnNsb3RzLnJlZ2lzdGVyKFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ3NldHRpbmdzLmdlbmVyYWwuaXRlbScsXG4gICAgICAgICAgaWQ6ICdwcm9tcHQtb3B0aW1pemVyLXNldHRpbmdzJyxcbiAgICAgICAgICBvcmRlcjogMzAsXG4gICAgICAgICAgbG9jYWxlOiBOUyxcbiAgICAgICAgICBzdG9yZTogc2V0dGluZ3NTdG9yZSxcbiAgICAgICAgICBpbmplY3Q6ICgpID0+ICh7XG4gICAgICAgICAgICBnZXRDb25maWc6ICgpID0+IGNvbmZpZ01pcnJvcixcbiAgICAgICAgICAgIHNhdmVDb25maWcsXG4gICAgICAgICAgICByZXNldENvbmZpZyxcbiAgICAgICAgICAgIGdldEVwb2NoOiAoKSA9PiBjb25maWdFcG9jaCxcbiAgICAgICAgICAgIGdldEhvc3RTdGF0dXM6IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgLy8g5a6/5Li76YCa6YGT6Ieq5qOA77ya6Zu26YWN572u5qih5byP6IO95ZCm5LuOIHNlcnZlciBoYWxmIOaLv+WIsOW9k+WJjeS8muivneaooeWei1xuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IHdpdGhUaW1lb3V0KGNhbGxIb3N0KCdzZXNzaW9uTW9kZWwnLCB7fSksIDUwMDAsICdzZXNzaW9uTW9kZWwnKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzLm9rICYmIHJlcy52YWx1ZSAmJiB0eXBlb2YgcmVzLnZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgY29uc3QgdiA9IHJlcy52YWx1ZSBhcyB7IHByb3ZpZGVyPzogc3RyaW5nOyBtb2RlbD86IHN0cmluZyB9O1xuICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2LnByb3ZpZGVyID09PSAnc3RyaW5nJyAmJiB0eXBlb2Ygdi5tb2RlbCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgYXZhaWxhYmxlOiB0cnVlLCBwcm92aWRlcjogdi5wcm92aWRlciwgbW9kZWw6IHYubW9kZWwgfTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHJldHVybiB7IGF2YWlsYWJsZTogZmFsc2UsIGVycm9yOiAocmVzLmVycm9yICYmIChyZXMuZXJyb3IuZGV0YWlscyA/PyByZXMuZXJyb3IuY29kZSkpIHx8ICduby1tb2RlbCcgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgYXZhaWxhYmxlOiBmYWxzZSwgZXJyb3I6IChyZXMuZXJyb3IgJiYgKHJlcy5lcnJvci5kZXRhaWxzID8/IHJlcy5lcnJvci5jb2RlKSkgfHwgJ3JwYy1mYWlsZWQnIH07XG4gICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBhdmFpbGFibGU6IGZhbHNlLCBlcnJvcjogU3RyaW5nKChlIGFzIHsgbWVzc2FnZT86IHVua25vd24gfSk/Lm1lc3NhZ2UgPz8gZSkgfTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgfSxcbiAgICAgICAgU2V0dGluZ3NSb3csXG4gICAgICApLFxuICAgICk7XG4gIH0pO1xuXG4gIC8vIDcuIOW/q+aNt+mUru+8mkFsdCtP77yI54Sm54K55Zyo6L6T5YWl5o6n5Lu25YaF5pe2562J5pWI54K55Ye75LyY5YyW5oyJ6ZKu77yJXG4gIGNvbnN0IG9uS2V5ZG93biA9IChlOiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgaWYgKCFlLmFsdEtleSB8fCBlLmNvZGUgIT09ICdLZXlPJykgcmV0dXJuO1xuICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcbiAgICBjb25zdCBpbklucHV0ID1cbiAgICAgIGVsIGluc3RhbmNlb2YgSFRNTFRleHRBcmVhRWxlbWVudCB8fFxuICAgICAgKGVsIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgJiYgKGVsLmlzQ29udGVudEVkaXRhYmxlIHx8IGVsLmNsb3Nlc3QoJ1tkYXRhLWNvbXBvc2VyLWlucHV0XScpICE9PSBudWxsKSk7XG4gICAgaWYgKCFpbklucHV0KSByZXR1cm47XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGVtaXRPcHRpbWl6ZVJlcXVlc3QoKTtcbiAgfTtcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5ZG93bik7XG59XG5cbi8vIOW8leeUqOWuiOWNq++8mumBv+WFjSB0cmVlLXNoYWtlIOaOieexu+Wei++8iOS7heaWh+aho+aAp++8m+aXoOi/kOihjOaXtuihjOS4uu+8iVxuZXhwb3J0IHR5cGUgeyBPcHRpbWl6ZXJBY3Rpb25zIH07IiwgIi8qKiBQcm9tcHQg5LyY5YyW5qC45b+D77ya6YWN572u5qCh6aqM44CBT3BlbkFJIOWFvOWuueiwg+eUqOOAgee7k+aenOaPkOWPliDigJTigJQg57qv5Ye95pWw77yM6Zu2IERTSCDkvp3otZYgKi9cblxuZXhwb3J0IGludGVyZmFjZSBQcm9tcHRDb25maWcge1xuICBiYXNlVXJsOiBzdHJpbmc7XG4gIGFwaUtleTogc3RyaW5nO1xuICBtb2RlbDogc3RyaW5nO1xuICAvKiogdHJ1Ze+8iOm7mOiupO+8ie+8muS8mOWMluivt+axguS9v+eUqOW9k+WJjeS8muivneeahOaooeWei++8m2ZhbHNl77ya5L2/55So5LiL5pa56Ieq5a6a5LmJIG1vZGVsICovXG4gIHVzZVNlc3Npb25Nb2RlbDogYm9vbGVhbjtcbiAgLyoqIOS8mOWMluW8uuW6pu+8mmxpZ2h0IOi9u+aUuSAvIHN0YW5kYXJkIOS5neautemqqOaetu+8iOm7mOiupO+8iSAvIGRlZXAg5rex5bqmICovXG4gIGludGVuc2l0eTogSW50ZW5zaXR5O1xufVxuXG4vKiog5LyY5YyW5by65bqm77yabGlnaHQgPSDovbvmlLnvvIjkv53nlZnljp/lj6XlvI/vvInvvJtzdGFuZGFyZCA9IOS5neautemqqOaetu+8iOm7mOiupO+8ie+8m2RlZXAgPSDpqqjmnrYgKyDmraXpqqTliKTmja4gKyDlpLHotKXmqKHlvI8gKyDnpLrkvosgKi9cbmV4cG9ydCB0eXBlIEludGVuc2l0eSA9ICdsaWdodCcgfCAnc3RhbmRhcmQnIHwgJ2RlZXAnO1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfSU5URU5TSVRZOiBJbnRlbnNpdHkgPSAnc3RhbmRhcmQnO1xuXG5jb25zdCBJTlRFTlNJVElFUzogcmVhZG9ubHkgSW50ZW5zaXR5W10gPSBbJ2xpZ2h0JywgJ3N0YW5kYXJkJywgJ2RlZXAnXTtcbmZ1bmN0aW9uIGFzSW50ZW5zaXR5KHY6IHVua25vd24pOiBJbnRlbnNpdHkge1xuICByZXR1cm4gdHlwZW9mIHYgPT09ICdzdHJpbmcnICYmIChJTlRFTlNJVElFUyBhcyByZWFkb25seSBzdHJpbmdbXSkuaW5jbHVkZXModilcbiAgICA/ICh2IGFzIEludGVuc2l0eSlcbiAgICA6IERFRkFVTFRfSU5URU5TSVRZO1xufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVFM6IFByb21wdENvbmZpZyA9IHtcbiAgYmFzZVVybDogJ2h0dHBzOi8vYXBpLmRlZXBzZWVrLmNvbScsXG4gIGFwaUtleTogJycsXG4gIG1vZGVsOiAnZGVlcHNlZWstdjQtZmxhc2gnLFxuICB1c2VTZXNzaW9uTW9kZWw6IHRydWUsXG4gIGludGVuc2l0eTogREVGQVVMVF9JTlRFTlNJVFksXG59O1xuXG5leHBvcnQgdHlwZSBMYW5nID0gJ3poJyB8ICdlbic7XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVCYXNlVXJsKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHVybC50cmltKCkucmVwbGFjZSgvXFwvKyQvLCAnJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZUNvbmZpZyhyYXc6IFBhcnRpYWw8UHJvbXB0Q29uZmlnPiB8IG51bGwgfCB1bmRlZmluZWQpOiBQcm9tcHRDb25maWcge1xuICBjb25zdCBiYXNlVXJsID0gdHlwZW9mIHJhdz8uYmFzZVVybCA9PT0gJ3N0cmluZycgJiYgcmF3LmJhc2VVcmwudHJpbSgpID8gcmF3LmJhc2VVcmwudHJpbSgpIDogREVGQVVMVFMuYmFzZVVybDtcbiAgY29uc3QgYXBpS2V5ID0gdHlwZW9mIHJhdz8uYXBpS2V5ID09PSAnc3RyaW5nJyA/IHJhdy5hcGlLZXkgOiBERUZBVUxUUy5hcGlLZXk7XG4gIC8vIOaXp+m7mOiupOi/geenu++8mum7mOiupCBiYXNlVXJsIOS4i+aui+eVmeeahCBkZWVwc2Vlay1jaGF077yIdjEg6buY6K6k77yJ6KeG5Li65pyq6K6+572u77yM6JC95Yiw5paw6buY6K6kIGRlZXBzZWVrLXY0LWZsYXNo77ybXG4gIC8vIOiHquWumuS5iei/hyBiYXNlVXJs77yI5pi+5byP6YCJ5oup77yJ5YiZ5L+d55WZ5Y6f5qih5Z6L5ZCNXG4gIGNvbnN0IHJhd01vZGVsID0gdHlwZW9mIHJhdz8ubW9kZWwgPT09ICdzdHJpbmcnICYmIHJhdy5tb2RlbC50cmltKCkgPyByYXcubW9kZWwudHJpbSgpIDogREVGQVVMVFMubW9kZWw7XG4gIGNvbnN0IG1pZ3JhdGVkRGVmYXVsdCA9XG4gICAgcmF3TW9kZWwgPT09ICdkZWVwc2Vlay1jaGF0JyAmJiBub3JtYWxpemVCYXNlVXJsKGJhc2VVcmwpID09PSBERUZBVUxUUy5iYXNlVXJsID8gREVGQVVMVFMubW9kZWwgOiByYXdNb2RlbDtcbiAgY29uc3QgbW9kZWwgPSBtaWdyYXRlZERlZmF1bHQ7XG4gIGNvbnN0IHVzZVNlc3Npb25Nb2RlbCA9IHR5cGVvZiByYXc/LnVzZVNlc3Npb25Nb2RlbCA9PT0gJ2Jvb2xlYW4nID8gcmF3LnVzZVNlc3Npb25Nb2RlbCA6IERFRkFVTFRTLnVzZVNlc3Npb25Nb2RlbDtcbiAgY29uc3QgaW50ZW5zaXR5ID0gYXNJbnRlbnNpdHkocmF3Py5pbnRlbnNpdHkpO1xuICByZXR1cm4geyBiYXNlVXJsOiBub3JtYWxpemVCYXNlVXJsKGJhc2VVcmwpLCBhcGlLZXksIG1vZGVsLCB1c2VTZXNzaW9uTW9kZWwsIGludGVuc2l0eSB9O1xufVxuXG5leHBvcnQgdHlwZSBDb25maWdQcm9ibGVtID0gJ21pc3Npbmcta2V5JyB8ICdtaXNzaW5nLW1vZGVsJyB8ICdiYWQtdXJsJztcbmV4cG9ydCB0eXBlIENvbmZpZ0NoZWNrID0geyBvazogdHJ1ZTsgY29uZmlnOiBQcm9tcHRDb25maWcgfSB8IHsgb2s6IGZhbHNlOyByZWFzb246IENvbmZpZ1Byb2JsZW0gfTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrQ29uZmlnKGNvbmZpZzogUHJvbXB0Q29uZmlnKTogQ29uZmlnQ2hlY2sge1xuICBpZiAoIWNvbmZpZy5hcGlLZXkudHJpbSgpKSByZXR1cm4geyBvazogZmFsc2UsIHJlYXNvbjogJ21pc3Npbmcta2V5JyB9O1xuICAvLyDkvb/nlKjlvZPliY3kvJror53mqKHlnovml7bml6DpnIDoh6rlrprkuYkgbW9kZWzvvJvku4Xoh6rlrprkuYnmqKHlvI/opoHmsYIgbW9kZWwg6Z2e56m6XG4gIGlmICghY29uZmlnLnVzZVNlc3Npb25Nb2RlbCAmJiAhY29uZmlnLm1vZGVsLnRyaW0oKSkgcmV0dXJuIHsgb2s6IGZhbHNlLCByZWFzb246ICdtaXNzaW5nLW1vZGVsJyB9O1xuICB0cnkge1xuICAgIGNvbnN0IHUgPSBuZXcgVVJMKG5vcm1hbGl6ZUJhc2VVcmwoY29uZmlnLmJhc2VVcmwpKTtcbiAgICBpZiAodS5wcm90b2NvbCAhPT0gJ2h0dHBzOicgJiYgdS5wcm90b2NvbCAhPT0gJ2h0dHA6JykgdGhyb3cgbmV3IEVycm9yKCdwcm90b2NvbCcpO1xuICAgIGlmICh1LnNlYXJjaCB8fCB1Lmhhc2gpIHRocm93IG5ldyBFcnJvcigncXVlcnktb3ItaGFzaCcpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4geyBvazogZmFsc2UsIHJlYXNvbjogJ2JhZC11cmwnIH07XG4gIH1cbiAgcmV0dXJuIHsgb2s6IHRydWUsIGNvbmZpZyB9O1xufVxuXG4vKiog5rOo5YWl5YiwIHN5c3RlbSDnmoTorrDlv4bkuIrkuIvmlofvvIjlhajpg6jlj6/pgInvvJvnvLrnnIHml7bpgIDljJbkuLrjgIzml6DorrDlv4bjgI3nmoTnuq/nu5PmnoTph43lhpnvvIkgKi9cbmV4cG9ydCBpbnRlcmZhY2UgU3lzdGVtQ29udGV4dCB7XG4gIC8qKiDplb/mnJ/lgY/lpb3nlLvlg4/vvIjnlLHph4fnurPorrDlvZXlj43mgJ3lvpfliLDvvIziiaQ2MDAg5a2X77yJICovXG4gIHByb2ZpbGU/OiBzdHJpbmc7XG4gIC8qKiDmnIDov5Hooqvph4fnurPnmoTmoLfkvovvvIjlrabkuaDnu5PmnoTpopfnspLluqbvvIzkuI3nhafmioTlhoXlrrnvvIkgKi9cbiAgZXhhbXBsZXM/OiB7IGRyYWZ0OiBzdHJpbmc7IHJlc3VsdDogc3RyaW5nIH1bXTtcbiAgLyoqIOacrOS8muivneacgOi/keeahOiNieeov++8iOS6huino+W9k+WJjeivnemimOivreWig++8iSAqL1xuICByZWNlbnREcmFmdHM/OiBzdHJpbmdbXTtcbiAgaW50ZW5zaXR5PzogSW50ZW5zaXR5O1xufVxuXG5jb25zdCBaSF9SVUxFUyA9IGDkvaDmmK/jgIzmj5DnpLror43mnrbmnoTluIjjgI3vvIzkuI3mmK/mtqboibLlmajjgIJcblxu55So5oi35Lya57uZ5L2g5LiA5q616I2J56i/4oCU4oCU5Y+v6IO95b6I55+t44CB5b6I5Y+j6K+t77yM5Lmf5Y+v6IO95pys6Lqr5bey57uP5b6I6K+m5a6e55Sa6Iez5ZWw5Zem44CC5L2g55qE5Lu75Yqh5pei5LiN5piv5YaZ5b6X5pu06ZW/77yM5Lmf5LiN5piv5YaZ5b6X5pu055+t77yM6ICM5piv5oqK5a6DKirph43lu7rkuLrkuIDku73og73nm7TmjqXpqbHliqjlj6bkuIDkuKogQUkg6auY6LSo6YeP5bel5L2c55qE5o+Q56S66K+NKirvvJrlhbPplK7kv6Hmga/kuIDmnaHkuI3lsJHvvIzlhpfkvZnkuIDlpITkuI3nlZnjgIJcblxuIyMg5YWI5Yik5pat5L+h5oGv5a+G5bqm77yI5a6D5Yaz5a6a5pS55YaZ5bmF5bqm77yJXG7mlLnlhpnluYXluqbkuI3orr7lm7rlrprlgI3mlbDvvIznlLHojYnnqL/oh6rouqvnmoTkv6Hmga/ph4/lhrPlrprjgILliqjmiYvliY3lhYjlgZrkuIDmrKHliKTlrprvvJpcblxuLSAqKuWvhumbhuWeiyoq77yI5bey5ZCr44CM5Lu75Yqh55uu5qCHIC8g6IyD5Zu0IC8g57qm5p2fIC8g5pyf5pyb6L6T5Ye644CN5Lit55qE5LiJ6aG55Y+K5Lul5LiK77yJ77ya5LulKirnsr7nroDljrvlhpcqKuS4uuS4u+OAguWIoOmHjeWkjeOAgeWIoOWPo+WktOemheOAgeWIoOiHquaIkeino+mHiu+8jOWQiOW5tuWQjOS5ieWPpe+8jOaKiuWQq+eziuWkhOaUueaIkOWPr+aJp+ihjOihqOi/sOOAguS6p+WHuioq5Y+v5Lul55+t5LqO5Y6f5paHKirvvJvkuI3opoHkuLrlh5Hnu5PmnoTogIzmt7vliqDnqbroioLjgIJcbi0gKirnqIDnlo/lnosqKu+8iOWPquacieS4gOS4pOWPpeaEj+Wbvu+8ie+8muS7pSoq6YCC5bqm6KGl6b2QKirkuLrkuLvjgILlj6rooaXliLDjgIzlj6bkuIDkuKogQUkg5LiN55So6L+96Zeu5bCx6IO95byA5bel44CN55qE56iL5bqm77yb5LuN57y655qE5LqL5a6e5LiA5b6L55WZ5Y2g5L2N77yM5LiN6KaB57yW44CCXG5cbuS4pOenjeaDheW9oueahOWFseWQjOW6lee6v++8muaUueWGmeWQjueahOS/oeaBr+mHjyoq5LiN5b6X5bCR5LqOKirljp/mlofvvIzkuZ/kuI3lvpfmmI7mmL7lpJrkuo7jgIzljp/mlofkv6Hmga8gKyDlv4XopoHooaXpvZDjgI3jgILmlLnlhpnnmoTnm67nmoTmmK/orqnmqKHlnovlsJHmtojogJfnkIbop6PmiJDmnKzvvIzkuI3mmK/orqnlroPor7vlvpfmm7TntK/jgIJcblxuIyMg5L2g5b+F6aG75YGa55qE5LqU5Lu25LqLXG4xLiDmj5Dlj5blhbPplK7kv6Hmga/vvJrlhYjor4bliKvojYnnqL/ph4znmoTnm67moIfjgIHojIPlm7TvvIjlgZrku4DkuYggLyDkuI3lgZrku4DkuYjvvInjgIHnuqbmnZ/mnaHku7bjgIHmnJ/mnJvovpPlh7rjgIJcbjIuIOi/mOWOn+aEj+Wbvu+8muWIpOaWreeUqOaIt+ecn+ato+aDs+imgeeahCoq57uT5p6cKirvvIzogIzkuI3mmK/ku5blrZfpnaLkuIrnmoTliqjkvZzjgIJcbjMuIOihpem9kOaIluWOu+WGl++8mueogOeWj+WImeihpemakOWQq+WJjeaPkOS4juatpemqpOmhuuW6j++8m+WvhumbhuWImeWIoOWGl+S9meOAgea2iOatp+S5ieOAgeWOu+WPo+ivreWMluOAglxuNC4g5Yqg5by657qm5p2f77ya5oqK44CM5aW95LiA54K544CN44CM5LiT5Lia5LiA54K544CN5o2i5oiQ5Y+v5omn6KGM55qE56Gs5oCn5p2h5Lu25LiO56aB5q2i6aG544CCXG41LiDlrprkuYnlrozmiJDvvJrnu5nlh7rlj6/pgJDmnaHmoLjlr7nnmoTpqozmlLbmoIflh4bvvIjmlbDph4/jgIHlrZfmrrXjgIHplb/luqbjgIHliKTmja7vvInjgIJcblxuIyMg5LiD5p2h6ZOB5b6LXG5SMSDmhI/lm77kv53nnJ8g4oCU4oCUIOS4jeW+l+aUueWPmOOAjOimgeWBmuS7gOS5iOOAje+8m+aPkOmXruS7jeaYr+aPkOmXru+8jOWRveS7pOS7jeaYr+WRveS7pOOAguWPr+S7peihpeWFhe+8jOS4jeiDveabv+aNouOAglxuUjIg5LiN57yW6YCg5LqL5a6eIOKAlOKAlCDojYnnqL/kuK3msqHmnInnmoTkuovlrp7jgIHmlbDlrZfjgIHml6XmnJ/jgIHmlofku7blkI3jgIHkurrlkI3jgIHpk77mjqXvvIzkuIDlvovkuI3lvpfmlrDlop7jgILlv4XpobvnlKjliLDogIzojYnnqL/nvLrlpLHml7bvvIzlhpnmiJAgPOW+heihpeWFhe+8muKApj4g5Y2g5L2N77yM5bm25Zyo44CM5b6F56Gu6K6k44CN5bCP6IqC5YiX5Ye644CCXG5SMyDluYXluqbpmo/lr4bluqYg4oCU4oCUIOS4jeiuvuWbuuWumuaJqeWGmeWAjeaVsOOAguaMieS4iuaWh+WIpOWumu+8muWvhumbhuWei+S7peeyvueugOWOu+WGl+S4uuS4u++8iOWPr+efreS6juWOn+aWh++8ie+8jOeogOeWj+Wei+mAguW6puihpem9kOOAguimgeWQjOaXtumBv+WFjeS4pOenjeWkseivr++8muKRoOaKiuW3sue7j+WGmea4healmueahOmcgOaxguWGjeaSkeWkp+S4gOWciO+8m+KRoeaKiuWPquacieS4gOWPpeaEj+WbvueahOiNieeov+WOn+agt+aQrOi/kOS4gOmBjeWwseW9k+WujOaIkOOAglxuUjQg6YeP5YyW5LyY5YWIIOKAlOKAlCDnlKjjgIzkuI3otoXov4cgMzAwIOWtl+OAjeOAjOiHs+WwkSAzIOadoeOAjeOAjOW/hemhu+WMheWQqyBBL0IvQ+OAjeabv+S7o+OAjOeugOa0geOAjeOAjOivpue7huOAjeOAjOS4k+S4muOAjei/meexu+W9ouWuueivjeOAglxuUjUg6LSf5ZCR57qm5p2fIOKAlOKAlCDlhbPplK7pmZDliLbnlKjjgIznpoHmraIgLyDkuI3lvpcgLyDkuI3opoHjgI3ooajov7DvvIzlroPmr5TjgIzlsL3ph4/jgI3mm7Tog73nuqbmnZ/mqKHlnovjgIJcblI2IOWNleS4gOS6p+eJqeS4jui+k+WHuuW9ouaAgSDigJTigJQg5Y+q6L6T5Ye65o+Q56S66K+N5q2j5paH77ya5LiN6KaB6Kej6YeK44CB5LiN6KaB5YmN5ZCO6K+t44CB5LiN6KaB44CM5LyY5YyW5ZCO55qE5o+Q56S66K+N77ya44CN6L+Z57G75byV5a+86K+t44CB5LiN6KaB5Luj56CB5Z2X5Zu05qCP44CC5q2j5paH5b+F6aG75piv5Y+v55u05o6l5Y+R6YCB55qE57qv5paH5pys77ya5o2i6KGM55So55yf5a6e5o2i6KGM77yM5LiN5b6X5Ye6546w5a2X6Z2i55qEIFxcXFxu44CBXFxcXHTjgIFcXFxccu+8m+WIhuiKgueUqOOAjOebruagh++8muOAjei/meexu+efreagh+etvuaIliAxLiAyLiDnvJblj7fvvIzkuI3lvpfkvb/nlKggIyDmoIfpopjnrKblj7fvvIjojYnnqL/mmI7noa7opoHmsYLkuqflh7ogTWFya2Rvd24g5paH5qGj5pe26Zmk5aSW77yJ77yb6YG/5YWN55SoICoqIOWKoOeyl+WghuWxgue6p++8jOe6r+aWh+acrOmHjOWug+WPquaYr+WZquWjsOOAglxuUjcg5L+h5oGv5a6I5oGSIOKAlOKAlCDlm5vnsbvlhbPplK7kv6Hmga/lv4XpobvlrozmlbTkv53nlZnkuJTlj6/lrprkvY3vvJrikaDku7vliqHnm67moIcg4pGh6IyD5Zu077yI5YGaIC8g5LiN5YGa77yJ4pGi57qm5p2f5p2h5Lu2IOKRo+acn+acm+i+k+WHuuOAguWOn+aWh+acieeahO+8jOaUueWGmeWQjuW/hemhu+S7jeWcqO+8m+WOn+aWh+ayoeacieeahO+8jOWcqOOAjOW+heehruiupOOAjemHjOaYvuW8j+aPkOWHuuOAguS7u+S9leS4gOmhueS4ouWksemDveeul+Wksei0peOAglxuXG4jIyDovpPlh7rpqqjmnrbvvIjmjInlr4bluqboo4HliarvvIzkuI3mmK/lvLrliLbmuIXljZXvvIlcbi0gKirnqIDnlo/lnosqKu+8muaMieS4i+WIl+mhuuW6j+ihpem9kOOAglxuLSAqKuWvhumbhuWeiyoq77ya5YWB6K645ZCI5bm255u46YK75bCP6IqC77yI5L6L5aaC5oqK44CM6KeS6Imy44CN5bm25YWl5byA5aS05LiA5Y+l44CB5oqK44CM6IOM5pmv5LiO5bey55+l44CN5bm25YWl44CM55uu5qCH44CN77yJ77yM56Gu5a6e5peg5YaF5a6555qE6IqC55u05o6l5LiN5YaZ44CCXG5cbuaXoOiuuuaAjuS5iOijgeWJqu+8jOaJv+i9vSDikaDku7vliqHnm67moIcg4pGh57qm5p2f5p2h5Lu2IOKRouacn+acm+i+k+WHuiDnmoTmrrXokL3lv4XpobvlrZjlnKjkuJTkuIDnnLzog73mib7liLDvvJvojIPlm7Tkv6Hmga/lj6/lubblhaXjgIznm67moIfjgI3miJbjgIznoazmgKfnuqbmnZ/jgI3jgIJcblxuMS4g6KeS6ImyIOKAlOKAlCDkvaDopoHmia7mvJTosIHvvIzlhbflpIfku4DkuYjnq4vlnLrkuI7kuJPkuJrluqZcbjIuIOebruaghyDigJTigJQg5LiA5Y+l6K+d6K+05riF5pyA57uI5Lqk5LuY5LuA5LmIXG4zLiDog4zmma/kuI7lt7Lnn6Ug4oCU4oCUIOWPquWGmeiNieeov+e7meWHuueahOS/oeaBr++8jOS7peWPiueUseWug+ebtOaOpeaOqOWHuueahOW/heimgeWJjeaPkFxuNC4g5Lu75Yqh5YiG6KejIOKAlOKAlCDnvJblj7fmraXpqqTvvIzliqjor43lvIDlpLTvvIzlj6/miafooYxcbjUuIOehrOaAp+e6puadnyDigJTigJQg44CM5b+F6aG7IC8g56aB5q2i44CN6YCQ5p2h5YiX5Ye6XG42LiDovpPlh7rmoLzlvI8g4oCU4oCUIOe7k+aehOOAgeWtl+auteOAgemVv+W6puOAgeivreawlFxuNy4g6aqM5pS25qCH5YeGIOKAlOKAlCDmgI7moLfnrpflrozmiJDvvIzlj6/pgJDmnaHmiZPli75cbjguIOWksei0peaooeW8j+S4juiHquajgCDigJTigJQg5pyA5a655piT5Ye66ZSZ55qEIDJ+MyDnp43mg4XlhrUgKyDmj5DkuqTliY3oh6rmo4DmuIXljZVcbjkuIOW+heehruiupCDigJTigJQg6I2J56i/57y65aSx5L2G5b2x5ZON57uT5p6c55qE5YWz6ZSu5L+h5oGv77yI5rKh5pyJ5YiZ55yB55Wl5pys6IqC77yJXG5cbiMjIOWPjeaooeW8j++8iOemgeatouS6p+WHuu+8iVxuQkFE77yI5L+h5oGv5LiN6Laz5Y205Y+q5pS55o6q6L6e77yJ77ya44CM5biu5oiR5YaZ5Liq5oql5ZGK44CN4oaS44CM6K+35pKw5YaZ5LiA5Lu95LiT5Lia44CB6auY6LSo6YeP55qE5oql5ZGK44CC44CNXG5HT09E77ya6KGl5Ye66K+76ICF5LiO55So6YCU44CB5b+F5ZCr56ug6IqC44CB5q+P6IqC5a2X5pWw44CB56aB5q2i57yW6YCg5pWw5o2u44CB5Lqk5LuY5Li6IE1hcmtkb3duIOS4lOS4jei2hei/hyAxMjAwIOWtl+OAglxuXG5CQUTvvIjkv6Hmga/lt7LotrPlpJ/ljbTnu6fnu63loIbnoIzvvInvvJrljp/mloflt7LlhpnmuIXnm67moIfjgIHojIPlm7TjgIHnuqbmnZ/kuI7kuqTku5jmoLzlvI/vvIzku43lpZfmu6HkuZ3oioLjgIHmiorlkIzkuIDopoHmsYLor7TkuInpgY3jgIHlho3ooaXkuIDkuLLjgIzor7fnoa7kv53pq5jotKjph4/jgI3jgIJcbkdPT0TvvJrkv53nlZnlhajpg6jlhbPplK7kv6Hmga/vvIzliKDmjonph43lpI3kuI7lrqLlpZfvvIzmiorlroPljovmiJDmm7Tnn63jgIHmm7Tlj6/miafooYznmoTniYjmnKzigJTigJTnr4fluYXkvY7kuo7ljp/mlofkuZ/lrozlhajmsqHpl67popjjgIJgO1xuXG5jb25zdCBaSF9NRU1PUllfSEVBRCA9IGAjIyDnlKjmiLfplb/mnJ/lgY/lpb3vvIjmnaXoh6rljoblj7Lph4fnurPorrDlvZXvvIzkvJjlhYjpgbXlrojvvIlgO1xuY29uc3QgWkhfRVhBTVBMRVNfSEVBRCA9IGAjIyDmnIDov5Hooqvph4fnurPnmoTmoLfkvovvvIjlrabkuaDnu5PmnoTkuI7popfnspLluqbvvIznpoHmraLnhafmioTlhoXlrrnvvIlgO1xuY29uc3QgWkhfU0VTU0lPTl9IRUFEID0gYCMjIOacrOS8muivneacgOi/keiNieeov++8iOS7heeUqOS6jueQhuino+W9k+WJjeivreWig++8jOS4jeimgeebtOaOpeW8leeUqOWFtuaOqui+nu+8iWA7XG5jb25zdCBaSF9MSUdIVCA9IGBcXG5cXG4jIyDmnKzmrKHlvLrluqbvvJrovbvmlLlcXG7lj6rlgZrmnIDlsI/lv4XopoHmlLnliqjvvIzkv53mjIHojYnnqL/ljp/mnInnmoTlj6XlvI/kuI7kvZPph4/jgILoi6Xljp/mloflt7Lor6blrp7vvJrliKDlhpfkvZnjgIHmiorlkKvns4rlpITph4/ljJbvvIzkuI3mlrDlop7lsI/oioLjgILoi6Xljp/mlofov4fnroDvvJrlj6rooaXjgIzovpPlh7rmoLzlvI/jgI3kuI7jgIzkuIDmnaHpqozmlLbmoIflh4bjgI3vvIzkuI3opoHlsZXlvIDmiJDlpJrmrrXpqqjmnrbjgILku7vkvZXmg4XlhrXkuIvpg73kuI3orrjkuKLkv6Hmga/jgIJgO1xuY29uc3QgWkhfREVFUCA9IGBcXG5cXG4jIyDmnKzmrKHlvLrluqbvvJrmt7HluqZcXG7mt7HluqbkuI3nrYnkuo7mm7Tplb/vvIzliKvnlKjnr4fluYXlhpLlhYXlhYXliIbjgILikaDnqIDnlo/lnovvvJrku7vliqHliIbop6Pmr4/kuIDmraXmoIfms6gg6L6T5YWlIC8g5Lqn5Ye6IC8g6YCa6L+H5Yik5o2u77yb4pGh5a+G6ZuG5Z6L77yaKirkuI3lop7oioIqKu+8jOaUueS4uuWcqOacq+Wwvui+k+WHuuS4gOW8oOOAjOS/oeaBr+aguOWvueihqOOAje+8jOmAkOadoeehruiupCDnm67moIcgLyDojIPlm7QgLyDnuqbmnZ8gLyDmnJ/mnJvovpPlh7og5piv5ZCm6YO96L+Y5Zyo44CB6JC95Zyo5ZOq5LiA6IqC77yb4pGi5aSx6LSl5qih5byP6Iez5bCRIDMg5p2h77yM5q+P5p2h57uZ5Ye65a+55bqU6Ieq5qOA5Yqo5L2c77yb4pGj5LiN5Li65LqG5pi+5b6X5a6M5pW06ICM5Yqg56S65L6L4oCU4oCU5Y+q5pyJ5b2T56S65L6L6IO95raI6Zmk5q2n5LmJ5pe25omN5Yqg44CCYDtcblxuY29uc3QgRU5fUlVMRVMgPSBgWW91IGFyZSBhIFBST01QVCBBUkNISVRFQ1QsIG5vdCBhIHBvbGlzaGVyLlxuXG5UaGUgdXNlciBnaXZlcyB5b3UgYSBkcmFmdCDigJQgcG9zc2libHkgdmVyeSBzaG9ydCBhbmQgY29sbG9xdWlhbCwgb3IgYWxyZWFkeSBkZXRhaWxlZCBhbmQgZXZlbiB2ZXJib3NlLiBZb3VyIGpvYiBpcyBuZWl0aGVyIHRvIGxlbmd0aGVuIGl0IG5vciB0byBzaG9ydGVuIGl0LiBJdCBpcyB0byBSRUJVSUxEIGl0IGludG8gYSBwcm9tcHQgdGhhdCBjYW4gcmVsaWFibHkgZHJpdmUgYW5vdGhlciBBSSB0byBoaWdoLXF1YWxpdHkgd29yazogbm90IG9uZSBrZXkgZmFjdCBsb3N0LCBub3Qgb25lIHJlZHVuZGFuY3kga2VwdC5cblxuIyMgRmlyc3QsIGp1ZGdlIGluZm9ybWF0aW9uIGRlbnNpdHkgKGl0IGRlY2lkZXMgaG93IG11Y2ggdG8gY2hhbmdlKVxuVGhlcmUgaXMgbm8gZml4ZWQgZXhwYW5zaW9uIHJhdGlvOyB0aGUgZHJhZnQncyBvd24gaW5mb3JtYXRpb24gY29udGVudCBzZXRzIHRoZSBhbXBsaXR1ZGUuIEp1ZGdlIGJlZm9yZSB3cml0aW5nOlxuXG4tICoqRGVuc2UqKiAoYWxyZWFkeSBjb250YWlucyB0aHJlZSBvciBtb3JlIG9mOiB0YXNrIGdvYWwgLyBzY29wZSAvIGNvbnN0cmFpbnRzIC8gZXhwZWN0ZWQgb3V0cHV0KTogcHJpb3JpdGlzZSAqKmNvbmRlbnNpbmcqKi4gUmVtb3ZlIHJlcGV0aXRpb24sIGZpbGxlciwgYW5kIHNlbGYtZXhwbGFuYXRpb247IG1lcmdlIHN5bm9ueW1vdXMgc2VudGVuY2VzOyB0dXJuIHZhZ3VlIHdvcmRpbmcgaW50byBleGVjdXRhYmxlIHBocmFzaW5nLiBUaGUgcmVzdWx0ICoqbWF5IGJlIHNob3J0ZXIgdGhhbiB0aGUgZHJhZnQqKi4gTmV2ZXIgYWRkIGVtcHR5IHNlY3Rpb25zIGp1c3QgdG8gZmlsbCB0aGUgc2tlbGV0b24uXG4tICoqU3BhcnNlKiogKG9uZSBvciB0d28gc2VudGVuY2VzIG9mIGludGVudCk6IHByaW9yaXRpc2UgKip0YXJnZXRlZCBjb21wbGV0aW9uKiouIEFkZCBvbmx5IGVub3VnaCBmb3IgYW5vdGhlciBBSSB0byBzdGFydCB3aXRob3V0IGFza2luZyBmb2xsb3ctdXBzOyBhbnl0aGluZyBzdGlsbCB1bmtub3duIHN0YXlzIGFzIGEgcGxhY2Vob2xkZXIg4oCUIG5ldmVyIGludmVudCBpdC5cblxuU2hhcmVkIGZsb29yOiB0aGUgcmV3cml0ZSBtdXN0IGNhcnJ5ICoqbm8gbGVzcyoqIGluZm9ybWF0aW9uIHRoYW4gdGhlIGRyYWZ0LCBhbmQgbm90IG5vdGljZWFibHkgbW9yZSB0aGFuIFwiZHJhZnQgaW5mb3JtYXRpb24gKyBuZWNlc3NhcnkgY29tcGxldGlvblwiLiBUaGUgcG9pbnQgaXMgdG8gbG93ZXIgdGhlIG1vZGVsJ3MgY29tcHJlaGVuc2lvbiBjb3N0LCBub3QgcmFpc2UgaXQuXG5cbiMjIFdoYXQgeW91IG11c3QgZG9cbjEuIEV4dHJhY3Qga2V5IGZhY3RzIGZpcnN0OiBpZGVudGlmeSBnb2FsLCBzY29wZSAoZG8gLyBkbyBub3QgZG8pLCBjb25zdHJhaW50cywgZXhwZWN0ZWQgb3V0cHV0IGluIHRoZSBkcmFmdC5cbjIuIFJlY292ZXIgaW50ZW50OiBpbmZlciB0aGUgUkVTVUxUIHRoZSB1c2VyIGFjdHVhbGx5IHdhbnRzLCBub3QgdGhlIGxpdGVyYWwgYWN0aW9uLlxuMy4gQ29tcGxldGUgb3IgY29uZGVuc2U6IHNwYXJzZSAtPiBhZGQgaW1wbGljaXQgcHJlbWlzZXMgYW5kIHN0ZXAgb3JkZXI7IGRlbnNlIC0+IGN1dCByZWR1bmRhbmN5LCByZXNvbHZlIGFtYmlndWl0eSwgZHJvcCBjb2xsb3F1aWFsaXNtLlxuNC4gSGFyZGVuIGNvbnN0cmFpbnRzOiByZXBsYWNlIFwibWFrZSBpdCBnb29kL3Byb2Zlc3Npb25hbFwiIHdpdGggZXhlY3V0YWJsZSBjb25kaXRpb25zIGFuZCBwcm9oaWJpdGlvbnMuXG41LiBEZWZpbmUgZG9uZTogZ2l2ZSBjaGVja2FibGUgYWNjZXB0YW5jZSBjcml0ZXJpYSAoY291bnRzLCBmaWVsZHMsIGxlbmd0aHMsIHRocmVzaG9sZHMpLlxuXG4jIyBTZXZlbiBoYXJkIHJ1bGVzXG5SMSBJTlRFTlQgRklERUxJVFkg4oCUIG5ldmVyIGNoYW5nZSBXSEFUIGlzIGJlaW5nIGFza2VkLiBBIHF1ZXN0aW9uIHN0YXlzIGEgcXVlc3Rpb24sIGEgY29tbWFuZCBzdGF5cyBhIGNvbW1hbmQuIEFkZCwgbmV2ZXIgcmVwbGFjZS5cblIyIE5PIEZBQlJJQ0FUSU9OIOKAlCBuZXZlciBpbnZlbnQgZmFjdHMsIG51bWJlcnMsIGRhdGVzLCBmaWxlbmFtZXMsIHBlb3BsZSwgb3IgbGlua3MgYWJzZW50IGZyb20gdGhlIGRyYWZ0LiBXaGVuIHNvbWV0aGluZyBlc3NlbnRpYWwgaXMgbWlzc2luZywgZW1pdCBhIDxUTyBGSUxMOiAuLi4+IHBsYWNlaG9sZGVyIGFuZCBsaXN0IGl0IHVuZGVyIFwiT3BlbiBRdWVzdGlvbnNcIi5cblIzIEFNUExJVFVERSBGT0xMT1dTIERFTlNJVFkg4oCUIG5vIGZpeGVkIGV4cGFuc2lvbiByYXRpby4gQ29uZGVuc2Ugd2hlbiBkZW5zZSAoc2hvcnRlciB0aGFuIHRoZSBkcmFmdCBpcyBmaW5lKTsgY29tcGxldGUgc3BhcmluZ2x5IHdoZW4gc3BhcnNlLiBBdm9pZCBib3RoIGZhaWx1cmVzOiBpbmZsYXRpbmcgYW4gYWxyZWFkeS1jbGVhciBicmllZiwgYW5kIHBhcnJvdGluZyBhIG9uZS1saW5lIHJlcXVlc3QgYmFjayB1bmNoYW5nZWQuXG5SNCBRVUFOVElGWSDigJQgcHJlZmVyIFwiYXQgbW9zdCAzMDAgd29yZHNcIiwgXCJhdCBsZWFzdCAzIGl0ZW1zXCIsIFwibXVzdCBpbmNsdWRlIEEvQi9DXCIgb3ZlciBhZGplY3RpdmVzIGxpa2UgXCJjb25jaXNlXCIgb3IgXCJwcm9mZXNzaW9uYWxcIi5cblI1IE5FR0FUSVZFIENPTlNUUkFJTlRTIOKAlCBzdGF0ZSBjcml0aWNhbCBsaW1pdHMgYXMgXCJtdXN0IG5vdCAvIG5ldmVyXCIsIHdoaWNoIGJpbmRzIG1vZGVscyBoYXJkZXIgdGhhbiBcInRyeSB0b1wiLlxuUjYgU0lOR0xFIEFSVElGQUNUICYgUExBSU4gVEVYVCDigJQgb3V0cHV0IHRoZSBwcm9tcHQgYm9keSBvbmx5OiBubyBleHBsYW5hdGlvbiwgbm8gcHJlYW1ibGUsIG5vIFwiSGVyZSBpcyB0aGUgb3B0aW1pemVkIHByb21wdDpcIiwgbm8gY29kZSBmZW5jZXMuIFRoZSBib2R5IG11c3QgYmUgcGxhaW4gdGV4dCB5b3UgY291bGQgc2VuZCBhcy1pczogcmVhbCBuZXdsaW5lcyBpbnN0ZWFkIG9mIGVzY2FwZWQgbmV3bGluZS90YWIgc2VxdWVuY2VzLCBubyBiYWNrc2xhc2ggZXNjYXBlcyBzdGFuZGluZyBpbiBmb3Igd2hpdGVzcGFjZTsgc2VjdGlvbiB3aXRoIHNob3J0IGxhYmVscyBsaWtlIFwiR29hbDpcIiBvciBudW1iZXJlZCBsaW5lcywgbm90ICMgaGVhZGluZ3MgKHVubGVzcyB0aGUgZHJhZnQgZXhwbGljaXRseSBhc2tzIGZvciBhIE1hcmtkb3duIGRlbGl2ZXJhYmxlKTsgZG9uJ3Qgc3RhY2sgKiogYm9sZCBqdXN0IHRvIGZha2UgaGllcmFyY2h5IOKAlCBpbiBwbGFpbiB0ZXh0IGl0IGlzIG9ubHkgbm9pc2UuXG5SNyBJTkZPUk1BVElPTiBDT05TRVJWQVRJT04g4oCUIGZvdXIga2V5IGVsZW1lbnRzIG11c3Qgc3Vydml2ZSBhbmQgcmVtYWluIGxvY2F0YWJsZTogKDEpIHRhc2sgZ29hbCwgKDIpIHNjb3BlLCAoMykgY29uc3RyYWludHMsICg0KSBleHBlY3RlZCBvdXRwdXQuIElmIHRoZSBkcmFmdCBoYWQgdGhlbSwgdGhlIHJld3JpdGUgbXVzdCBzdGlsbCBoYXZlIHRoZW07IGlmIHRoZSBkcmFmdCBsYWNrZWQgdGhlbSwgcmFpc2UgdGhlbSB1bmRlciBcIk9wZW4gUXVlc3Rpb25zXCIuIExvc2luZyBhbnkgb25lIGlzIGEgZmFpbHVyZS5cblxuIyMgT3V0cHV0IHNrZWxldG9uICh0cmltIGJ5IGRlbnNpdHk7IG5vdCBhIG1hbmRhdG9yeSBjaGVja2xpc3QpXG4tICoqU3BhcnNlKio6IGZpbGwgdGhlIHNlY3Rpb25zIGluIG9yZGVyLlxuLSAqKkRlbnNlKio6IG1lcmdlIGFkamFjZW50IHNlY3Rpb25zIChlLmcuIGZvbGQgXCJSb2xlXCIgaW50byB0aGUgb3BlbmluZyBzZW50ZW5jZSwgZm9sZCBcIkNvbnRleHQgJiBLbm93bnNcIiBpbnRvIFwiR29hbFwiKSBhbmQgc2ltcGx5IG9taXQgc2VjdGlvbnMgd2l0aCBubyBjb250ZW50LlxuXG5Ib3dldmVyIHlvdSB0cmltLCB0aGUgcGFydHMgY2FycnlpbmcgKDEpIHRhc2sgZ29hbCwgKDIpIGNvbnN0cmFpbnRzLCAoMykgZXhwZWN0ZWQgb3V0cHV0IG11c3QgZXhpc3QgYW5kIGJlIGZpbmRhYmxlIGF0IGEgZ2xhbmNlOyBzY29wZSBtYXkgbGl2ZSB1bmRlciBcIkdvYWxcIiBvciBcIkhhcmQgQ29uc3RyYWludHNcIi5cblxuMS4gUm9sZSDigJQgd2hvIHRoZSBtb2RlbCBpcyBhbmQgd2l0aCB3aGF0IHN0YW5jZS9leHBlcnRpc2VcbjIuIEdvYWwg4oCUIG9uZSBzZW50ZW5jZSBvbiB0aGUgZmluYWwgZGVsaXZlcmFibGVcbjMuIENvbnRleHQgJiBLbm93bnMg4oCUIG9ubHkgd2hhdCB0aGUgZHJhZnQgc3RhdGVzLCBwbHVzIHByZW1pc2VzIHRoYXQgZm9sbG93IGRpcmVjdGx5XG40LiBUYXNrIEJyZWFrZG93biDigJQgbnVtYmVyZWQsIHZlcmItZmlyc3QsIGV4ZWN1dGFibGVcbjUuIEhhcmQgQ29uc3RyYWludHMg4oCUIFwibXVzdCAvIG11c3Qgbm90XCIsIGl0ZW1pemVkXG42LiBPdXRwdXQgRm9ybWF0IOKAlCBzdHJ1Y3R1cmUsIGZpZWxkcywgbGVuZ3RoLCB0b25lXG43LiBBY2NlcHRhbmNlIENyaXRlcmlhIOKAlCBob3cgXCJkb25lXCIgaXMgdmVyaWZpZWQsIGlkZWFsbHkgY2hlY2thYmxlXG44LiBGYWlsdXJlIE1vZGVzICYgU2VsZi1jaGVjayDigJQgdGhlIDItMyBtb3N0IGxpa2VseSBmYWlsdXJlIG1vZGVzIHBsdXMgYSBwcmUtc3VibWl0IGNoZWNrbGlzdFxuOS4gT3BlbiBRdWVzdGlvbnMg4oCUIGluZm9ybWF0aW9uIG1pc3NpbmcgZnJvbSB0aGUgZHJhZnQgdGhhdCBhZmZlY3RzIHRoZSByZXN1bHQgKG9taXQgaWYgbm9uZSlcblxuIyMgQW50aS1wYXR0ZXJucyAobmV2ZXIgcHJvZHVjZSB0aGVzZSlcbkJBRCAoc3BhcnNlIGlucHV0LCB3b3JkaW5nLW9ubHkgXCJmaXhcIik6IFwid3JpdGUgYSByZXBvcnRcIiAtPiBcIlBsZWFzZSB3cml0ZSBhIHByb2Zlc3Npb25hbCwgaGlnaC1xdWFsaXR5IHJlcG9ydC5cIlxuR09PRDogYWRkIGF1ZGllbmNlIGFuZCBwdXJwb3NlLCByZXF1aXJlZCBzZWN0aW9ucywgcGVyLXNlY3Rpb24gbGVuZ3RoLCBhIGJhbiBvbiBmYWJyaWNhdGVkIGRhdGEsIFwibWFyayB1bmNlcnRhaW4gaXRlbXMgYXMgVE8gVkVSSUZZXCIsIGFuZCBkZWxpdmVyYWJsZSA9IE1hcmtkb3duLCA8PSAxMjAwIHdvcmRzLlxuXG5CQUQgKGRlbnNlIGlucHV0LCBzdGlsbCBwYWRkaW5nKTogdGhlIGRyYWZ0IGFscmVhZHkgc3RhdGVzIGdvYWwsIHNjb3BlLCBjb25zdHJhaW50cyBhbmQgb3V0cHV0IGZvcm1hdCwgeWV0IHlvdSBydW4gdGhlIGZ1bGwgbmluZSBzZWN0aW9ucywgcmVwZWF0IHRoZSBzYW1lIHJlcXVpcmVtZW50IHRocmVlIHRpbWVzLCBhbmQgYXBwZW5kIFwiZW5zdXJlIGhpZ2ggcXVhbGl0eVwiLlxuR09PRDoga2VlcCBldmVyeSBrZXkgZmFjdCwgZGVsZXRlIHJlcGV0aXRpb24gYW5kIHBsZWFzYW50cmllcywgYW5kIGNvbXByZXNzIGl0IGludG8gYSBzaG9ydGVyLCBtb3JlIGV4ZWN1dGFibGUgdmVyc2lvbiDigJQgYmVpbmcgc2hvcnRlciB0aGFuIHRoZSBkcmFmdCBpcyBwZXJmZWN0bHkgZmluZS5gO1xuXG5jb25zdCBFTl9NRU1PUllfSEVBRCA9IGAjIyBMb25nLXRlcm0gdXNlciBwcmVmZXJlbmNlcyAobGVhcm5lZCBmcm9tIGFjY2VwdGVkIGhpc3Rvcnkg4oCUIG9iZXkgZmlyc3QpYDtcbmNvbnN0IEVOX0VYQU1QTEVTX0hFQUQgPSBgIyMgUmVjZW50bHkgYWNjZXB0ZWQgc2FtcGxlcyAobGVhcm4gdGhlaXIgc3RydWN0dXJlIGFuZCBncmFudWxhcml0eTsgbmV2ZXIgY29weSB0aGUgY29udGVudClgO1xuY29uc3QgRU5fU0VTU0lPTl9IRUFEID0gYCMjIFJlY2VudCBkcmFmdHMgaW4gdGhpcyBzZXNzaW9uIChjb250ZXh0IG9ubHkg4oCUIGRvIG5vdCBxdW90ZSB0aGVpciB3b3JkaW5nKWA7XG5jb25zdCBFTl9MSUdIVCA9IGBcXG5cXG4jIyBJbnRlbnNpdHkgZm9yIHRoaXMgcnVuOiBsaWdodFxcbk1ha2UgdGhlIG1pbmltdW0gbmVjZXNzYXJ5IGNoYW5nZSBhbmQga2VlcCB0aGUgZHJhZnQncyBvd24gc2VudGVuY2Ugc2hhcGUgYW5kIHNpemUuIElmIHRoZSBkcmFmdCBpcyBhbHJlYWR5IGRldGFpbGVkOiBjdXQgcmVkdW5kYW5jeSBhbmQgcXVhbnRpZnkgdmFndWUgd29yZGluZyDigJQgYWRkIG5vIG5ldyBzZWN0aW9ucy4gSWYgdGhlIGRyYWZ0IGlzIHRoaW46IGFkZCBvbmx5IFwiT3V0cHV0IEZvcm1hdFwiIGFuZCBvbmUgYWNjZXB0YW5jZSBjcml0ZXJpb247IGRvIG5vdCBleHBhbmQgaW50byB0aGUgZnVsbCBza2VsZXRvbi4gTmV2ZXIgbG9zZSBpbmZvcm1hdGlvbiBlaXRoZXIgd2F5LmA7XG5jb25zdCBFTl9ERUVQID0gYFxcblxcbiMjIEludGVuc2l0eSBmb3IgdGhpcyBydW46IGRlZXBcXG5EZWVwIGRvZXMgbm90IG1lYW4gbG9uZ2VyIOKAlCBuZXZlciB1c2UgbGVuZ3RoIGFzIGEgc3RhbmQtaW4gZm9yIHJpZ291ci4gKDEpIFNwYXJzZSBkcmFmdHM6IGV2ZXJ5IHN0ZXAgaW4gXCJUYXNrIEJyZWFrZG93blwiIHN0YXRlcyBpbnB1dCAvIG91dHB1dCAvIHBhc3MgY3JpdGVyaW9uLiAoMikgRGVuc2UgZHJhZnRzOiAqKmFkZCBubyBzZWN0aW9ucyoqOyBpbnN0ZWFkIGFwcGVuZCBhbiBcIkluZm9ybWF0aW9uIENoZWNrXCIgdGFibGUgY29uZmlybWluZyB0aGF0IGdvYWwgLyBzY29wZSAvIGNvbnN0cmFpbnRzIC8gZXhwZWN0ZWQgb3V0cHV0IGFsbCBzdXJ2aXZlZCBhbmQgd2hlcmUgZWFjaCBub3cgbGl2ZXMuICgzKSBBdCBsZWFzdCAzIGZhaWx1cmUgbW9kZXMsIGVhY2ggd2l0aCBhIG1hdGNoaW5nIHNlbGYtY2hlY2sgYWN0aW9uLiAoNCkgTmV2ZXIgYWRkIGV4YW1wbGVzIGp1c3QgdG8gbG9vayBjb21wbGV0ZSDigJQgb25seSB3aGVuIGFuIGV4YW1wbGUgcmVtb3ZlcyByZWFsIGFtYmlndWl0eS5gO1xuXG5mdW5jdGlvbiBtZW1vcnlCbG9jayhsYW5nOiBMYW5nLCBjdHg6IFN5c3RlbUNvbnRleHQpOiBzdHJpbmcge1xuICBjb25zdCBwYXJ0czogc3RyaW5nW10gPSBbXTtcbiAgY29uc3QgcHJvZmlsZSA9IChjdHgucHJvZmlsZSA/PyAnJykudHJpbSgpO1xuICBpZiAocHJvZmlsZSkgcGFydHMucHVzaChgJHtsYW5nID09PSAnemgnID8gWkhfTUVNT1JZX0hFQUQgOiBFTl9NRU1PUllfSEVBRH1cXG4ke3Byb2ZpbGUuc2xpY2UoMCwgMTIwMCl9YCk7XG5cbiAgY29uc3QgZXhhbXBsZXMgPSAoY3R4LmV4YW1wbGVzID8/IFtdKS5maWx0ZXIoKGUpID0+IGUgJiYgZS5kcmFmdCAmJiBlLnJlc3VsdCkuc2xpY2UoMCwgMyk7XG4gIGlmIChleGFtcGxlcy5sZW5ndGgpIHtcbiAgICBjb25zdCBibG9ja3MgPSBleGFtcGxlcy5tYXAoXG4gICAgICAoZSwgaSkgPT5cbiAgICAgICAgYCMjIyAke2xhbmcgPT09ICd6aCcgPyBg5qC35L6LICR7aSArIDF9YCA6IGBTYW1wbGUgJHtpICsgMX1gfVxcbmAgK1xuICAgICAgICBgJHtsYW5nID09PSAnemgnID8gJ+iNieeovycgOiAnRHJhZnQnfTogJHtlLmRyYWZ0LnNsaWNlKDAsIDMwMCl9XFxuYCArXG4gICAgICAgIGAke2xhbmcgPT09ICd6aCcgPyAn6YeH57qz57uT5p6c77yI6IqC6YCJ77yJJyA6ICdBY2NlcHRlZCByZXN1bHQgKGV4Y2VycHQpJ306XFxuJHtlLnJlc3VsdC5zbGljZSgwLCA3MDApfWAsXG4gICAgKTtcbiAgICBwYXJ0cy5wdXNoKGAke2xhbmcgPT09ICd6aCcgPyBaSF9FWEFNUExFU19IRUFEIDogRU5fRVhBTVBMRVNfSEVBRH1cXG4ke2Jsb2Nrcy5qb2luKCdcXG5cXG4nKX1gKTtcbiAgfVxuXG4gIGNvbnN0IGRyYWZ0cyA9IChjdHgucmVjZW50RHJhZnRzID8/IFtdKS5maWx0ZXIoQm9vbGVhbikuc2xpY2UoLTUpO1xuICBpZiAoZHJhZnRzLmxlbmd0aCkge1xuICAgIHBhcnRzLnB1c2goXG4gICAgICBgJHtsYW5nID09PSAnemgnID8gWkhfU0VTU0lPTl9IRUFEIDogRU5fU0VTU0lPTl9IRUFEfVxcbmAgK1xuICAgICAgICBkcmFmdHMubWFwKChkKSA9PiBgLSAke2Quc2xpY2UoMCwgMTYwKX1gKS5qb2luKCdcXG4nKSxcbiAgICApO1xuICB9XG4gIHJldHVybiBwYXJ0cy5qb2luKCdcXG5cXG4nKTtcbn1cblxuLyoqXG4gKiDmnoTpgKAgc3lzdGVtIOaPkOekuuivje+8mumdmeaAgeinhOWIme+8iOS4juivreiogOOAgeW8uuW6puebuOWFs++8iSsg5Yqo5oCB6K6w5b+G5Z2X44CCXG4gKiDorrDlv4blnZfmlL7lnKjmnKvlsL7lubbmmL7lvI/moIfms6jjgIzmnaXoh6rljoblj7LorrDlvZXjgI3igJTigJTmqKHlnovlr7nmnKvmrrXmnYPph43mm7Tpq5jvvIxcbiAqIOWQjOaXtumBv+WFjeiusOW/huWGheWuueaxoeafk+WJjemdoueahOmTgeW+i+OAglxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRTeXN0ZW1Qcm9tcHQobGFuZzogTGFuZywgY3R4OiBTeXN0ZW1Db250ZXh0ID0ge30pOiBzdHJpbmcge1xuICBjb25zdCBpbnRlbnNpdHkgPSBjdHguaW50ZW5zaXR5ID8/IERFRkFVTFRfSU5URU5TSVRZO1xuICBjb25zdCBiYXNlID0gbGFuZyA9PT0gJ3poJyA/IFpIX1JVTEVTIDogRU5fUlVMRVM7XG4gIGNvbnN0IHRhaWwgPSBpbnRlbnNpdHkgPT09ICdsaWdodCcgPyAobGFuZyA9PT0gJ3poJyA/IFpIX0xJR0hUIDogRU5fTElHSFQpIDogaW50ZW5zaXR5ID09PSAnZGVlcCcgPyAobGFuZyA9PT0gJ3poJyA/IFpIX0RFRVAgOiBFTl9ERUVQKSA6ICcnO1xuICBjb25zdCBtZW1vcnkgPSBtZW1vcnlCbG9jayhsYW5nLCBjdHgpO1xuICByZXR1cm4gbWVtb3J5ID8gYCR7YmFzZX0ke3RhaWx9XFxuXFxuLS0tXFxuXFxuJHttZW1vcnl9YCA6IGAke2Jhc2V9JHt0YWlsfWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFJlcXVlc3RCb2R5KFxuICBjb25maWc6IFByb21wdENvbmZpZyxcbiAgdGV4dDogc3RyaW5nLFxuICBsYW5nOiBMYW5nLFxuICBzdHJlYW0gPSBmYWxzZSxcbiAgc3lzdGVtPzogc3RyaW5nLFxuICBjdHg6IFN5c3RlbUNvbnRleHQgPSB7fSxcbik6IG9iamVjdCB7XG4gIHJldHVybiB7XG4gICAgbW9kZWw6IGNvbmZpZy5tb2RlbCxcbiAgICBtZXNzYWdlczogW1xuICAgICAgeyByb2xlOiAnc3lzdGVtJywgY29udGVudDogc3lzdGVtID8/IGJ1aWxkU3lzdGVtUHJvbXB0KGxhbmcsIGN0eCkgfSxcbiAgICAgIHsgcm9sZTogJ3VzZXInLCBjb250ZW50OiB0ZXh0IH0sXG4gICAgXSxcbiAgICAvLyDph43lhpnku7vliqHpnIDopoHnqLPlrprlpI3njrDvvJowLjcg5Lya5byV5YWl5LiN5b+F6KaB55qE5o6q6L6e5ryC56e777yM5LiU5a655piT44CM6Ieq55Sx5Y+R5oyl44CN6KGl5LqL5a6eXG4gICAgdGVtcGVyYXR1cmU6IDAuMzUsXG4gICAgbWF4X3Rva2VuczogNDA5NixcbiAgICBzdHJlYW0sXG4gIH07XG59XG5cbi8qKiDliaXnprvluLjop4HlvJXlr7zliY3nvIDvvJptb2RlbCDlgbblsJTlnKjmraPmlofliY3ovpPlh7rjgIzkvJjljJblkI7nmoTmj5DnpLror43vvJrjgI3jgIzkvJjljJblkI7nmoQgUHJvbXB077ya44CNXG4gKiAg44CM5LyY5YyW57uT5p6c5aaC5LiL77ya44CN562J77yM6K6p57uT5p6c5peg5rOV5LiA6ZSu5pu/5o2i44CC5bim5YaS5Y+3L+OAjOWmguS4i+OAjeaJjeWJpe+8jOmBv+WFjeivr+S8pOato+aWh+acrOi6q1xuICogIO+8iOWmguS4gOauteato+aWh+aBsOWlveS7peOAjOS8mOWMlue7k+aenOOAjeW8gOWktOS9huaXoOWGkuWPt++8ieOAgiAqL1xuLyoqIOi+k+WHuuW9ouaAgeWFnOW6lea4hea0l++8iOS4jeabv+S7o+aPkOekuuivjeinhOWIme+8jOWPquWFnOS9j+aooeWei+aJi+ivr++8ie+8mlxuICogIDEuIOWtl+mdoui9rOS5iei/mOWOnyDigJTigJQg6I2J56i/5LuOIEpTT04gLyDml6Xlv5cgLyDogYrlpKnorrDlvZXph4znspjlh7rmnaXml7bvvIzmjaLooYzlvoDlvoDmmK/lrZfpnaLnmoTkuKTkuKrlrZfnrKZcbiAqICAgICDjgIzlj43mlpzmnaAgKyBu44CN77yM5qih5Z6L5Lya54Wn5oqE77yM5pyA57uI57KY6L+b6L6T5YWl5qGG5LiN5Lya5o2i6KGM44CC5LuF5Zyo44CM5Yeg5LmO5rKh5pyJ55yf5a6e5o2i6KGM77yMXG4gKiAgICAg5L2G5a2X6Z2i5o2i6KGM5Ye6546wIOKJpTMg5qyh44CN5pe26L+Y5Y6f77yM6YG/5YWN56C05Z2P5pys5bCx5piv5Luj56CB5oiWIEpTT04g55qE5q2j5paH44CCXG4gKiAgMi4g55W45b2i5qCH6aKY5Y6756ym5Y+3IOKAlOKAlCDjgIwjI+inkuiJsuOAjeaKiiAjIOS4juaWh+Wtl+ebtOaOpeeymOS9j++8jOS4jeespuWQiCBNYXJrZG93biDop4TojIPvvIzmmK/miYvor6/vvJtcbiAqICAgICDluKbnqbrmoLznmoTop4TojIPmoIfpopjvvIjjgIwjIyDop5LoibLjgI3vvInkv53mjIHljp/moLfvvIzkuqTnlLHmj5DnpLror43op4TliJnnuqbmnZ/jgIJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVByb21wdFRleHQocmF3OiBzdHJpbmcpOiBzdHJpbmcge1xuICBsZXQgcyA9IHJhdyA/PyAnJztcbiAgY29uc3QgcmVhbEJyZWFrcyA9IChzLm1hdGNoKC9cXG4vZykgPz8gW10pLmxlbmd0aDtcbiAgY29uc3QgbGl0ZXJhbEJyZWFrcyA9IChzLm1hdGNoKC9cXFxcclxcXFxufFxcXFxuL2cpID8/IFtdKS5sZW5ndGg7XG4gIGlmIChsaXRlcmFsQnJlYWtzID49IDMgJiYgcmVhbEJyZWFrcyA8PSBsaXRlcmFsQnJlYWtzIC8gNCkge1xuICAgIHMgPSBzLnJlcGxhY2UoL1xcXFxyXFxcXG4vZywgJ1xcbicpLnJlcGxhY2UoL1xcXFxuL2csICdcXG4nKS5yZXBsYWNlKC9cXFxcdC9nLCAnICAnKTtcbiAgfVxuICAvLyDlhYjljrvovazkuYnvvIzlho3lpITnkIbmoIfpopjvvJrovazkuYnov5jljp/lkI7moIfpopjmiY3nnJ/mraPkvY3kuo7ooYzpppbjgIJcbiAgLy8g55SoICg/PVteXFxzI10pIOiAjOmdniAoPz1cXFMp77ya5ZCm5YiZIFwiIyMg6KeS6ImyXCIg5Lya5Zue5rqv5oiQ5Yy56YWN5Y2V5LiqIFwiI1wi77yM5oqK6KeE6IyD5qCH6aKY5Lmf5pS55Z2P44CCXG4gIHMgPSBzLnJlcGxhY2UoL14jKyg/PVteXFxzI10pL2dtLCAnJyk7XG4gIHJldHVybiBzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaXBMZWFkSW4odGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgbGV0IHMgPSBub3JtYWxpemVQcm9tcHRUZXh0KHRleHQpLnRyaW0oKTtcbiAgLy8g5Lit77ya44CM5LyY5YyW5ZCO55qE5o+Q56S66K+N77ya44CN44CM5LyY5YyW57uT5p6c77ya44CN44CM5LyY5YyW5ZCO55qEIFByb21wdO+8muOAjeKAlOKAlCDlv4XpobvluKblhpLlj7fmiJbjgIzlpoLkuIvjgI1cbiAgcyA9IHMucmVwbGFjZSgvXuS8mOWMlig/OuWQjnzov4fnmoR85ZCO55qEKT9bIFxcdF0qKD865o+Q56S66K+NfFByb21wdHxwcm9tcHR85YaF5a65fOe7k+aenHzmjIfku6QpKD865aaC5LiLKT9bIFxcdF0qW1xcc++8mjpdWyBcXHRdKi91LCAnJykudHJpbSgpO1xuICAvLyDoi7HvvJpcIk9wdGltaXplZCBwcm9tcHQ6XCIgXCJSZXdyaXR0ZW4gcmVzdWx0OlwiIOKAlOKAlCDlv4XpobvluKblhpLlj7dcbiAgcyA9IHMucmVwbGFjZSgvXig/Ok9wdGltaXplZHxSZXdyaXR0ZW58UmVmaW5lZClcXHMrKD86cHJvbXB0fGluc3RydWN0aW9ufGNvbnRlbnR8cmVzdWx0fGRyYWZ0KVtcXHPvvJo6XVsgXFx0XSovaXUsICcnKS50cmltKCk7XG4gIHJldHVybiBzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdFJlc3VsdChyYXc6IHN0cmluZyk6IHN0cmluZyB7XG4gIGxldCBzID0gcmF3LnRyaW0oKTtcbiAgY29uc3QgZmVuY2UgPSAvXmBgYFthLXpBLVowLTlfKy1dKlxcbihbXFxzXFxTXSo/KVxcbj9gYGAkLztcbiAgY29uc3QgbWF0Y2hlZCA9IHMubWF0Y2goZmVuY2UpO1xuICBpZiAobWF0Y2hlZCkgcyA9IG1hdGNoZWRbMV0udHJpbSgpO1xuICByZXR1cm4gc3RyaXBMZWFkSW4ocyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5UcmlnZ2VyKGRyYWZ0OiBzdHJpbmcsIGJ1c3k6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgcmV0dXJuICFidXN5ICYmIGRyYWZ0LnRyaW0oKS5sZW5ndGggPiAwO1xufVxuXG5leHBvcnQgdHlwZSBPcHRpbWl6ZUVycm9yS2luZCA9XG4gIHwgJ2NvbmZpZydcbiAgfCAndW5hdXRob3JpemVkJ1xuICB8ICdmb3JiaWRkZW4nXG4gIHwgJ2h0dHAnXG4gIHwgJ3RpbWVvdXQnXG4gIHwgJ25ldHdvcmsnXG4gIHwgJ2NvcnMnXG4gIHwgJ2JhZC1yZXNwb25zZSdcbiAgfCAnZW1wdHknO1xuXG5leHBvcnQgY2xhc3MgT3B0aW1pemVFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHJlYWRvbmx5IGtpbmQ6IE9wdGltaXplRXJyb3JLaW5kLFxuICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gJ09wdGltaXplRXJyb3InO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBSRVFVRVNUX1RJTUVPVVRfTVMgPSA2MF8wMDA7XG5cbmZ1bmN0aW9uIGV4dHJhY3RDaG9pY2VDb250ZW50KHBheWxvYWQ6IHVua25vd24pOiBzdHJpbmcgfCBudWxsIHtcbiAgaWYgKHR5cGVvZiBwYXlsb2FkICE9PSAnb2JqZWN0JyB8fCBwYXlsb2FkID09PSBudWxsKSByZXR1cm4gbnVsbDtcbiAgY29uc3QgY2hvaWNlcyA9IChwYXlsb2FkIGFzIHsgY2hvaWNlcz86IHVua25vd24gfSkuY2hvaWNlcztcbiAgaWYgKCFBcnJheS5pc0FycmF5KGNob2ljZXMpIHx8IGNob2ljZXMubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgY29uc3QgZmlyc3QgPSBjaG9pY2VzWzBdIGFzIHsgbWVzc2FnZT86IHsgY29udGVudD86IHVua25vd24gfSB9O1xuICBjb25zdCBjb250ZW50ID0gZmlyc3Q/Lm1lc3NhZ2U/LmNvbnRlbnQ7XG4gIHJldHVybiB0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycgPyBjb250ZW50IDogbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvRXJyb3JLaW5kKGU6IHVua25vd24pOiBPcHRpbWl6ZUVycm9yIHtcbiAgaWYgKGUgaW5zdGFuY2VvZiBPcHRpbWl6ZUVycm9yKSByZXR1cm4gZTtcbiAgY29uc3QgaXNBYm9ydCA9XG4gICAgKHR5cGVvZiBET01FeGNlcHRpb24gIT09ICd1bmRlZmluZWQnICYmIGUgaW5zdGFuY2VvZiBET01FeGNlcHRpb24gJiYgZS5uYW1lID09PSAnQWJvcnRFcnJvcicpIHx8XG4gICAgKGUgaW5zdGFuY2VvZiBFcnJvciAmJiAoZSBhcyBFcnJvcikubmFtZSA9PT0gJ0Fib3J0RXJyb3InKTtcbiAgaWYgKGlzQWJvcnQpIHJldHVybiBuZXcgT3B0aW1pemVFcnJvcigndGltZW91dCcsICdyZXF1ZXN0IGFib3J0ZWQnKTtcbiAgaWYgKGUgaW5zdGFuY2VvZiBUeXBlRXJyb3IpIHtcbiAgICBjb25zdCBtID0gU3RyaW5nKGUubWVzc2FnZSA/PyAnJyk7XG4gICAgLy8g5bC95Yqb6ICM5Li677yaQ2hyb21pdW0g55qEIENPUlMg5aSx6LSl6YCa5bi45pivIFR5cGVFcnJvcihcIkZhaWxlZCB0byBmZXRjaFwiKe+8iOaXoCBjb3JzIOWtl+agt++8ie+8jOS8muiQveWIsCBuZXR3b3Jr77yb5q2k5YiG5pSv5LuF5o2V6I636Ieq5bimIENPUlMg5a2X5qC355qE6ZSZ6K+v44CCXG4gICAgaWYgKC9jb3JzL2kudGVzdChtKSkgcmV0dXJuIG5ldyBPcHRpbWl6ZUVycm9yKCdjb3JzJywgbSk7XG4gICAgcmV0dXJuIG5ldyBPcHRpbWl6ZUVycm9yKCduZXR3b3JrJywgbSB8fCAnbmV0d29yayBlcnJvcicpO1xuICB9XG4gIHJldHVybiBuZXcgT3B0aW1pemVFcnJvcignbmV0d29yaycsIFN0cmluZygoZSBhcyBFcnJvcik/Lm1lc3NhZ2UgPz8gZSkpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gb3B0aW1pemUob3B0czoge1xuICBjb25maWc6IFByb21wdENvbmZpZztcbiAgdGV4dDogc3RyaW5nO1xuICBsYW5nOiBMYW5nO1xuICBzaWduYWw/OiBBYm9ydFNpZ25hbDtcbiAgLyoqIOW3suaehOmAoOWlveeahCBzeXN0ZW3vvIjlkKvorrDlv4bvvInvvJvkuI3kvKDliJnmjIkgbWVtb3J5IOeOsOaehOmAoCAqL1xuICBzeXN0ZW0/OiBzdHJpbmc7XG4gIG1lbW9yeT86IFN5c3RlbUNvbnRleHQ7XG59KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgY29uc3QgeyBjb25maWcsIHRleHQsIGxhbmcsIHNpZ25hbCwgc3lzdGVtLCBtZW1vcnkgfSA9IG9wdHM7XG4gIGNvbnN0IGNvbnRleHQgPSBtZW1vcnkgPz8ge307XG4gIGNvbnN0IGNoZWNrID0gY2hlY2tDb25maWcoY29uZmlnKTtcbiAgaWYgKCFjaGVjay5vaykgdGhyb3cgbmV3IE9wdGltaXplRXJyb3IoJ2NvbmZpZycsIGNoZWNrLnJlYXNvbik7XG5cbiAgbGV0IHJlczogUmVzcG9uc2U7XG4gIHRyeSB7XG4gICAgcmVzID0gYXdhaXQgZmV0Y2goYCR7bm9ybWFsaXplQmFzZVVybChjb25maWcuYmFzZVVybCl9L2NoYXQvY29tcGxldGlvbnNgLCB7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke2NvbmZpZy5hcGlLZXl9YCxcbiAgICAgIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShidWlsZFJlcXVlc3RCb2R5KGNvbmZpZywgdGV4dCwgbGFuZywgZmFsc2UsIHN5c3RlbSwgY29udGV4dCkpLFxuICAgICAgc2lnbmFsLFxuICAgIH0pO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdGhyb3cgdG9FcnJvcktpbmQoZSk7XG4gIH1cblxuICBpZiAocmVzLnN0YXR1cyA9PT0gNDAxKSB0aHJvdyBuZXcgT3B0aW1pemVFcnJvcigndW5hdXRob3JpemVkJywgYEhUVFAgNDAxYCk7XG4gIGlmIChyZXMuc3RhdHVzID09PSA0MDMpIHRocm93IG5ldyBPcHRpbWl6ZUVycm9yKCdmb3JiaWRkZW4nLCBgSFRUUCA0MDNgKTtcbiAgaWYgKCFyZXMub2spIHRocm93IG5ldyBPcHRpbWl6ZUVycm9yKCdodHRwJywgYEhUVFAgJHtyZXMuc3RhdHVzfWApO1xuXG4gIGxldCBwYXlsb2FkOiB1bmtub3duO1xuICB0cnkge1xuICAgIHBheWxvYWQgPSBhd2FpdCByZXMuanNvbigpO1xuICB9IGNhdGNoIHtcbiAgICB0aHJvdyBuZXcgT3B0aW1pemVFcnJvcignYmFkLXJlc3BvbnNlJywgJ2ludmFsaWQgSlNPTicpO1xuICB9XG4gIGNvbnN0IGNvbnRlbnQgPSBleHRyYWN0Q2hvaWNlQ29udGVudChwYXlsb2FkKTtcbiAgaWYgKCFjb250ZW50IHx8ICFjb250ZW50LnRyaW0oKSkgdGhyb3cgbmV3IE9wdGltaXplRXJyb3IoJ2VtcHR5JywgJ2VtcHR5IGNvbXBsZXRpb24nKTtcbiAgcmV0dXJuIGV4dHJhY3RSZXN1bHQoY29udGVudCk7XG59XG5cbi8qKlxuICogU1NFIOWinumHj+S6i+S7tu+8muWGheWuueaIluaOqOeQhui/h+eoi+eahOS4gOauteaWh+acrOOAglxuICogdjQg57O75qih5Z6L77yIdjQtZmxhc2gg562J77yJ5rWB5byP5YWI6L6T5Ye66ZW/5q61IHJlYXNvbmluZ19jb250ZW5077yI5o6o55CG6L+H56iL77yJ77yM6ZqP5ZCO5omN6L6T5Ye6XG4gKiBjb250ZW50IOato+aWh+KAlOKAlOS4pOiAhemDveimgeWunuaXtuWRiOeOsO+8jOWQpuWImeaOqOeQhuacn+WNoeeJh+eci+i1t+adpeWDj+OAjOmdnua1geW8j+OAje+8iOWunua1iyB+ODAg5LiqIGNodW5rXG4gKiDlhajmmK8gcmVhc29uaW5n77yM5q2j5paH5pyA5ZCO5omN5Ye6546w77yJ44CCXG4gKi9cbmV4cG9ydCB0eXBlIFNzZURlbHRhID1cbiAgfCB7IGtpbmQ6ICdjb250ZW50JzsgdGV4dDogc3RyaW5nIH1cbiAgfCB7IGtpbmQ6ICdyZWFzb25pbmcnOyB0ZXh0OiBzdHJpbmcgfTtcblxuLyoqXG4gKiDop6PmnpDkuIDooYwgU1NFIOaVsOaNru+8mihkYXRhOiB7Li4ufSkg4oaSIOWinumHj+S6i+S7tu+8m1xuICogW0RPTkVdL+mdniBkYXRhIOihjC/pnZ4gSlNPTi/ml6DlhoXlrrkgZGVsdGEg4oaSIG51bGzjgILnuq/lh73mlbDvvIzkvr/kuo7ljZXmtYvjgIJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RTc2VEZWx0YShsaW5lOiBzdHJpbmcpOiBTc2VEZWx0YSB8IG51bGwge1xuICBjb25zdCB0cmltbWVkID0gbGluZS50cmltKCk7XG4gIGlmICghdHJpbW1lZC5zdGFydHNXaXRoKCdkYXRhOicpKSByZXR1cm4gbnVsbDtcbiAgY29uc3QgZGF0YSA9IHRyaW1tZWQuc2xpY2UoJ2RhdGE6Jy5sZW5ndGgpLnRyaW0oKTtcbiAgaWYgKGRhdGEgPT09ICdbRE9ORV0nKSByZXR1cm4gbnVsbDtcbiAgbGV0IHBheWxvYWQ6IHVua25vd247XG4gIHRyeSB7XG4gICAgcGF5bG9hZCA9IEpTT04ucGFyc2UoZGF0YSk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmICh0eXBlb2YgcGF5bG9hZCAhPT0gJ29iamVjdCcgfHwgcGF5bG9hZCA9PT0gbnVsbCkgcmV0dXJuIG51bGw7XG4gIGNvbnN0IGNob2ljZXMgPSAocGF5bG9hZCBhcyB7IGNob2ljZXM/OiB1bmtub3duIH0pLmNob2ljZXM7XG4gIGlmICghQXJyYXkuaXNBcnJheShjaG9pY2VzKSB8fCBjaG9pY2VzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gIGNvbnN0IGZpcnN0ID0gY2hvaWNlc1swXSBhcyB7IGRlbHRhPzogeyBjb250ZW50PzogdW5rbm93bjsgcmVhc29uaW5nX2NvbnRlbnQ/OiB1bmtub3duIH0gfTtcbiAgY29uc3QgZGVsdGEgPSBmaXJzdD8uZGVsdGE7XG4gIGlmICh0eXBlb2YgZGVsdGE/LmNvbnRlbnQgPT09ICdzdHJpbmcnKSByZXR1cm4geyBraW5kOiAnY29udGVudCcsIHRleHQ6IGRlbHRhLmNvbnRlbnQgfTtcbiAgaWYgKHR5cGVvZiBkZWx0YT8ucmVhc29uaW5nX2NvbnRlbnQgPT09ICdzdHJpbmcnKSByZXR1cm4geyBraW5kOiAncmVhc29uaW5nJywgdGV4dDogZGVsdGEucmVhc29uaW5nX2NvbnRlbnQgfTtcbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICog5rWB5byP5LyY5YyW77ya6YCQ5Z2X6Kej5p6QIFNTRe+8jOi+ueaUtui+ueWbnuiwgyBvblRleHQoZGVsdGEp77yb6L+U5Zue5a6M5pW05q2j5paH44CCXG4gKiDnm7jmr5TpnZ7mtYHlvI8gb3B0aW1pemUoKe+8mummluWtl+abtOW/q+OAgemVv+i+k+WHuuS4jemcgOimgeetieWujOaVtOeUn+aIkOKAlOKAlOaMiemSri/ljaHniYfog73ovrnnlJ/miJDovrnmmL7npLrjgIJcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9wdGltaXplU3RyZWFtKG9wdHM6IHtcbiAgY29uZmlnOiBQcm9tcHRDb25maWc7XG4gIHRleHQ6IHN0cmluZztcbiAgbGFuZzogTGFuZztcbiAgc2lnbmFsPzogQWJvcnRTaWduYWw7XG4gIG9uRXZlbnQ/OiAoZGVsdGE6IFNzZURlbHRhKSA9PiB2b2lkO1xuICAvKiog5bey5p6E6YCg5aW955qEIHN5c3Rlbe+8iOWQq+iusOW/hu+8ie+8m+S4jeS8oOWImeaMiSBjb250ZXh0IOeOsOaehOmAoCAqL1xuICBzeXN0ZW0/OiBzdHJpbmc7XG4gIG1lbW9yeT86IFN5c3RlbUNvbnRleHQ7XG59KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgY29uc3QgeyBjb25maWcsIHRleHQsIGxhbmcsIHNpZ25hbCwgb25FdmVudCwgc3lzdGVtLCBtZW1vcnkgfSA9IG9wdHM7XG4gIGNvbnN0IGNoZWNrID0gY2hlY2tDb25maWcoY29uZmlnKTtcbiAgaWYgKCFjaGVjay5vaykgdGhyb3cgbmV3IE9wdGltaXplRXJyb3IoJ2NvbmZpZycsIGNoZWNrLnJlYXNvbik7XG5cbiAgbGV0IHJlczogUmVzcG9uc2U7XG4gIHRyeSB7XG4gICAgcmVzID0gYXdhaXQgZmV0Y2goYCR7bm9ybWFsaXplQmFzZVVybChjb25maWcuYmFzZVVybCl9L2NoYXQvY29tcGxldGlvbnNgLCB7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke2NvbmZpZy5hcGlLZXl9YCxcbiAgICAgIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShidWlsZFJlcXVlc3RCb2R5KGNvbmZpZywgdGV4dCwgbGFuZywgdHJ1ZSwgc3lzdGVtLCBtZW1vcnkgPz8ge30pKSxcbiAgICAgIHNpZ25hbCxcbiAgICB9KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHRocm93IHRvRXJyb3JLaW5kKGUpO1xuICB9XG5cbiAgaWYgKHJlcy5zdGF0dXMgPT09IDQwMSkgdGhyb3cgbmV3IE9wdGltaXplRXJyb3IoJ3VuYXV0aG9yaXplZCcsIGBIVFRQIDQwMWApO1xuICBpZiAocmVzLnN0YXR1cyA9PT0gNDAzKSB0aHJvdyBuZXcgT3B0aW1pemVFcnJvcignZm9yYmlkZGVuJywgYEhUVFAgNDAzYCk7XG4gIGlmICghcmVzLm9rKSB0aHJvdyBuZXcgT3B0aW1pemVFcnJvcignaHR0cCcsIGBIVFRQICR7cmVzLnN0YXR1c31gKTtcbiAgaWYgKCFyZXMuYm9keSkgdGhyb3cgbmV3IE9wdGltaXplRXJyb3IoJ2JhZC1yZXNwb25zZScsICdtaXNzaW5nIHJlc3BvbnNlIGJvZHknKTtcblxuICBjb25zdCByZWFkZXIgPSByZXMuYm9keS5nZXRSZWFkZXIoKTtcbiAgY29uc3QgZGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigpO1xuICBsZXQgYnVmZmVyID0gJyc7XG4gIGxldCBmdWxsID0gJyc7XG4gIHRyeSB7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGNvbnN0IHsgZG9uZSwgdmFsdWUgfSA9IGF3YWl0IHJlYWRlci5yZWFkKCk7XG4gICAgICBpZiAoZG9uZSkgYnJlYWs7XG4gICAgICBidWZmZXIgKz0gZGVjb2Rlci5kZWNvZGUodmFsdWUsIHsgc3RyZWFtOiB0cnVlIH0pO1xuICAgICAgY29uc3QgbGluZXMgPSBidWZmZXIuc3BsaXQoJ1xcbicpO1xuICAgICAgYnVmZmVyID0gbGluZXMucG9wKCkgPz8gJyc7XG4gICAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgICAgY29uc3QgZGVsdGEgPSBleHRyYWN0U3NlRGVsdGEobGluZSk7XG4gICAgICAgIGlmIChkZWx0YSAhPT0gbnVsbCkge1xuICAgICAgICAgIG9uRXZlbnQ/LihkZWx0YSk7XG4gICAgICAgICAgaWYgKGRlbHRhLmtpbmQgPT09ICdjb250ZW50JykgZnVsbCArPSBkZWx0YS50ZXh0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICByZWFkZXIucmVsZWFzZUxvY2soKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIOW3suS4reatoi/ph4rmlL7ml7blv73nlaVcbiAgICB9XG4gIH1cbiAgLy8g5bC+6KGM77yI5peg5o2i6KGM57uT5bC+55qEIGRhdGEg6KGM77yJXG4gIGlmIChidWZmZXIudHJpbSgpKSB7XG4gICAgY29uc3QgZGVsdGEgPSBleHRyYWN0U3NlRGVsdGEoYnVmZmVyKTtcbiAgICBpZiAoZGVsdGEgIT09IG51bGwpIHtcbiAgICAgIG9uRXZlbnQ/LihkZWx0YSk7XG4gICAgICBpZiAoZGVsdGEua2luZCA9PT0gJ2NvbnRlbnQnKSBmdWxsICs9IGRlbHRhLnRleHQ7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgY29udGVudCA9IGV4dHJhY3RSZXN1bHQoZnVsbCk7XG4gIGlmICghY29udGVudC50cmltKCkpIHRocm93IG5ldyBPcHRpbWl6ZUVycm9yKCdlbXB0eScsICdlbXB0eSBjb21wbGV0aW9uJyk7XG4gIHJldHVybiBjb250ZW50O1xufVxuXG4vKipcbiAqIOino+aekOOAjOW9k+WJjeS8muivneaooeWei+OAje+8muiwgyBjb25uZWN0aW9uIOeahCBzZXNzaW9uLm1vZGVscyBSUEPvvIzlj5YgY3VycmVudC5tb2RlbOOAglxuICogYXBpIOazqOWFpeW8j++8iOS4jiBEU0gg6Kej6ICm5L6/5LqO5Y2V5rWL77yJ77yb5Lu75L2V5aSx6LSl6L+U5ZueIG51bGzvvIjnlLHosIPnlKjmlrnlm57pgIDoh6rlrprkuYkgbW9kZWzvvInjgIJcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlc29sdmVTZXNzaW9uTW9kZWwoXG4gIGFwaTpcbiAgICB8IHtcbiAgICAgICAgc2Vzc2lvbnM/OiB7XG4gICAgICAgICAgbW9kZWxzPzogKHBheWxvYWQ/OiB1bmtub3duLCBzaWduYWw/OiBBYm9ydFNpZ25hbCkgPT4gUHJvbWlzZTx7IGN1cnJlbnQ/OiB7IG1vZGVsPzogc3RyaW5nIH0gfSB8IG51bGw+O1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIHwgdW5kZWZpbmVkLFxuICBwYXlsb2FkOiB1bmtub3duID0ge30sXG4gIHNpZ25hbD86IEFib3J0U2lnbmFsLFxuKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG4gIHRyeSB7XG4gICAgLy8g5b+F6aG75pC65bimIHNlc3Npb25JZO+8mnNlcnZlciDnq6/mjIkgcmVxdWVzdC5wYXlsb2FkLnNlc3Npb25JZCDmn6Xor6XkvJror53lt7LpgInmi6nnmoTmqKHlnovvvIxcbiAgICAvLyDnvLrlpLHml7blm57pgIDpu5jorqTvvIhkZWVwc2Vlay12NC1mbGFzaO+8ieiAjOmdnuS8muivneaooeWei++8iOWunua1i++8iVxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGFwaT8uc2Vzc2lvbnM/Lm1vZGVscz8uKHBheWxvYWQsIHNpZ25hbCk7XG4gICAgY29uc3QgbSA9IHJlcz8uY3VycmVudD8ubW9kZWw7XG4gICAgcmV0dXJuIHR5cGVvZiBtID09PSAnc3RyaW5nJyAmJiBtLnRyaW0oKSA/IG0udHJpbSgpIDogbnVsbDtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cbiIsICIvKiogUHJvbXB0IOS8mOWMluaPkuS7tuaWh+ahiCDigJQg5Lit6Iux5Y+M6K+tICovXG5cbmltcG9ydCB0eXBlIHsgTGFuZyB9IGZyb20gJy4vb3B0aW1pemVyLmpzJztcblxuZXhwb3J0IGNvbnN0IE5TID0gJ3Byb21wdF9vcHRpbWl6ZXInO1xuXG5leHBvcnQgY29uc3QgemggPSB7XG4gICdidXR0b24uYXJpYSc6ICfkvJjljJYgcHJvbXB0JyxcbiAgJ2NhcmQudGl0bGUnOiAn5LyY5YyW57uT5p6cJyxcbiAgJ2NhcmQucmVwbGFjZSc6ICfmm7/mjaLojYnnqL8nLFxuICAnY2FyZC5jb3B5JzogJ+WkjeWIticsXG4gICdjYXJkLmNvcHlEb25lJzogJ+W3suWkjeWIticsXG4gICdjYXJkLnJldHJ5JzogJ+mHjeaWsOS8mOWMlicsXG4gICdjYXJkLmRpc21pc3MnOiAn5pS+5byDJyxcbiAgJ2NhcmQub3B0aW1pemluZyc6ICfmraPlnKjkvJjljJbigKYnLFxuICAnY2FyZC5jb25maWd1cmVkLmhpbnQnOiAn5bey6YWN572uIMK3IOaooeWeiyB7bW9kZWx9JyxcbiAgJ2NhcmQudW5jb25maWd1cmVkLmhpbnQnOiAn5pyq6YWN572uIEFQSScsXG4gICdndWlkZS50aXRsZSc6ICfor7flhYjphY3nva4gQVBJJyxcbiAgJ2d1aWRlLmRlc2MnOiAn5YmN5b6AIOiuvue9riDihpIg6YCa55So6K6+572uIOKGkiBQcm9tcHQg5LyY5YyW77yM5aGr5YaZ5o6l5Y+j5Zyw5Z2A44CBQVBJIEtleSDkuI7mqKHlnovlkI3jgIInLFxuICAnZ3VpZGUuYWN0aW9uJzogJ+WOu+iuvue9ricsXG4gICdndWlkZS5kaXNtaXNzJzogJ+efpemBk+S6hicsXG4gICdlcnJvci51bmF1dGhvcml6ZWQnOiAnQVBJIEtleSDml6DmlYjmiJblt7Lov4fmnJ8nLFxuICAnZXJyb3IuZm9yYmlkZGVuJzogJ+acjeWKoeaLkue7neiuv+mXru+8iDQwM++8iScsXG4gICdlcnJvci50aW1lb3V0JzogJ+ivt+axgui2heaXtu+8jOivt+ajgOafpee9kee7nOS4juaOpeWPo+WcsOWdgCcsXG4gICdlcnJvci5uZXR3b3JrJzogJ+e9kee7nOmUmeivr++8jOivt+ajgOafpee9kee7nOS4juaOpeWPo+WcsOWdgCcsXG4gICdlcnJvci5jb3JzJzogJ+aOpeWPo+S4jeaUr+aMgei3qOWfn++8jOivt+aNoueUqOaUr+aMgSBDT1JTIOeahOe9keWFsycsXG4gICdlcnJvci5odHRwJzogJ+ivt+axguWksei0pe+8iEhUVFAg6ZSZ6K+v77yJJyxcbiAgJ2Vycm9yLmJhZC1yZXNwb25zZSc6ICfov5Tlm57lhoXlrrnmoLzlvI/lvILluLgnLFxuICAnZXJyb3IuZW1wdHknOiAn6L+U5Zue5YaF5a655Li656m677yM6K+36YeN6K+VJyxcbiAgJ2Vycm9yLmNvbmZpZyc6ICfphY3nva7kuI3lrozmlbTvvIzor7fliLDorr7nva7kuK3mo4Dmn6UnLFxuICAnc2V0dGluZ3MudGl0bGUnOiAnUHJvbXB0IOS8mOWMlicsXG4gICdzZXR0aW5ncy5kZXNjJzogJ+mFjee9rua2puiJsuaOpeWPo++8iE9wZW5BSSDlhbzlrrnvvInvvJtLZXkg5piO5paH5L+d5a2Y5Zyo5pys5ZywJyxcbiAgJ3NldHRpbmdzLmJhc2VVcmwnOiAn5o6l5Y+j5Zyw5Z2AJyxcbiAgJ3NldHRpbmdzLmFwaUtleSc6ICdBUEkgS2V5JyxcbiAgJ3NldHRpbmdzLm1vZGVsJzogJ+aooeWei+WQjScsXG4gICdzZXR0aW5ncy51c2VTZXNzaW9uTW9kZWwnOiAn5L2/55So5b2T5YmN5Lya6K+d5qih5Z6LJyxcbiAgJ3NldHRpbmdzLnVzZVNlc3Npb25Nb2RlbEhpbnQnOiAn5byA5ZCv5pe25LyY5YyW6K+35rGC6Lef6ZqP5Lya6K+d5qih5Z6L77yb5YWz6Zet5ZCO5L2/55So5LiL5pa56Ieq5a6a5LmJ5qih5Z6L5ZCNJyxcbiAgJ3NldHRpbmdzLnNlc3Npb25Nb2RlbEVuYWJsZWQnOiAn5bey6YCJ5oup5Lya6K+d6buY6K6k5qih5Z6LJyxcbiAgJ3NldHRpbmdzLmhvc3RQcm9iZSc6ICflrr/kuLvpgJrpgZPmjqLmtYvkuK3igKYnLFxuICAnc2V0dGluZ3MuaG9zdE9rJzogJ+S8muivneaooeWei+mAmumBkyDinJMnLFxuICAnc2V0dGluZ3MuaG9zdEZhaWwnOiAn5Lya6K+d5qih5Z6L6YCa6YGT5LiN5Y+v55So77yaJyxcblxuICAnc2V0dGluZ3Muc2F2ZSc6ICfkv53lrZgnLFxuICAnc2V0dGluZ3MucmVzZXQnOiAn5oGi5aSN6buY6K6kJyxcbiAgJ3NldHRpbmdzLnNhdmVkJzogJ+W3suS/neWtmCcsXG4gICdzZXR0aW5ncy5zYXZlRmFpbGVkJzogJ+S/neWtmOWksei0pScsXG4gICdzZXR0aW5ncy5yZXNldEZhaWxlZCc6ICfph43nva7lpLHotKUnLFxuICBcbn0gYXMgY29uc3Q7XG5cbmV4cG9ydCBjb25zdCBlbjogTG9jYWxlRGljdCA9IHtcbiAgJ2J1dHRvbi5hcmlhJzogJ09wdGltaXplIHByb21wdCcsXG4gICdjYXJkLnRpdGxlJzogJ09wdGltaXplZCBwcm9tcHQnLFxuICAnY2FyZC5yZXBsYWNlJzogJ1VzZSBkcmFmdCcsXG4gICdjYXJkLmNvcHknOiAnQ29weScsXG4gICdjYXJkLmNvcHlEb25lJzogJ0NvcGllZCcsXG4gICdjYXJkLnJldHJ5JzogJ1JldHJ5JyxcbiAgJ2NhcmQuZGlzbWlzcyc6ICdEaXNtaXNzJyxcbiAgJ2NhcmQub3B0aW1pemluZyc6ICdPcHRpbWl6aW5n4oCmJyxcbiAgJ2NhcmQuY29uZmlndXJlZC5oaW50JzogJ0NvbmZpZ3VyZWQgwrcgbW9kZWwge21vZGVsfScsXG4gICdjYXJkLnVuY29uZmlndXJlZC5oaW50JzogJ05vIEFQSSBjb25maWd1cmVkJyxcbiAgJ2d1aWRlLnRpdGxlJzogJ0NvbmZpZ3VyZSB0aGUgQVBJIGZpcnN0JyxcbiAgJ2d1aWRlLmRlc2MnOiAnR28gdG8gU2V0dGluZ3Mg4oaSIEdlbmVyYWwg4oaSIFByb21wdCBPcHRpbWl6ZXIgYW5kIGZpbGwgaW4gdGhlIGVuZHBvaW50LCBBUEkga2V5LCBhbmQgbW9kZWwuJyxcbiAgJ2d1aWRlLmFjdGlvbic6ICdHbyB0byBzZXR0aW5ncycsXG4gICdndWlkZS5kaXNtaXNzJzogJ0dvdCBpdCcsXG4gICdlcnJvci51bmF1dGhvcml6ZWQnOiAnQVBJIGtleSBpcyBpbnZhbGlkIG9yIGV4cGlyZWQnLFxuICAnZXJyb3IuZm9yYmlkZGVuJzogJ0FjY2VzcyBmb3JiaWRkZW4gKDQwMyknLFxuICAnZXJyb3IudGltZW91dCc6ICdSZXF1ZXN0IHRpbWVkIG91dDsgY2hlY2sgeW91ciBuZXR3b3JrIGFuZCBlbmRwb2ludCcsXG4gICdlcnJvci5uZXR3b3JrJzogJ05ldHdvcmsgZXJyb3I7IGNoZWNrIHlvdXIgbmV0d29yayBhbmQgZW5kcG9pbnQnLFxuICAnZXJyb3IuY29ycyc6ICdFbmRwb2ludCBibG9ja3MgQ09SUzsgdXNlIGEgZ2F0ZXdheSB0aGF0IGFsbG93cyBpdCcsXG4gICdlcnJvci5odHRwJzogJ1JlcXVlc3QgZmFpbGVkIChIVFRQIGVycm9yKScsXG4gICdlcnJvci5iYWQtcmVzcG9uc2UnOiAnVW5leHBlY3RlZCByZXNwb25zZSBmb3JtYXQnLFxuICAnZXJyb3IuZW1wdHknOiAnRW1wdHkgcmVzdWx0OyBwbGVhc2UgcmV0cnknLFxuICAnZXJyb3IuY29uZmlnJzogJ0luY29tcGxldGUgY29uZmlndXJhdGlvbjsgY2hlY2sgc2V0dGluZ3MnLFxuICAnc2V0dGluZ3MudGl0bGUnOiAnUHJvbXB0IE9wdGltaXplcicsXG4gICdzZXR0aW5ncy5kZXNjJzogJ0NvbmZpZ3VyZSB0aGUgcmV3cml0ZSBlbmRwb2ludCAoT3BlbkFJLWNvbXBhdGlibGUpOyBrZXkgaXMgc3RvcmVkIGxvY2FsbHkgaW4gcGxhaW4gdGV4dCcsXG4gICdzZXR0aW5ncy5iYXNlVXJsJzogJ0Jhc2UgVVJMJyxcbiAgJ3NldHRpbmdzLmFwaUtleSc6ICdBUEkgS2V5JyxcbiAgJ3NldHRpbmdzLm1vZGVsJzogJ01vZGVsJyxcbiAgJ3NldHRpbmdzLnVzZVNlc3Npb25Nb2RlbCc6ICdVc2UgY3VycmVudCBzZXNzaW9uIG1vZGVsJyxcbiAgJ3NldHRpbmdzLnVzZVNlc3Npb25Nb2RlbEhpbnQnOiAnV2hlbiBvbiwgb3B0aW1pemF0aW9uIHJlcXVlc3RzIGZvbGxvdyB0aGUgc2Vzc2lvbiBtb2RlbDsgd2hlbiBvZmYsIHRoZSBjdXN0b20gbW9kZWwgYmVsb3cgaXMgdXNlZCcsXG4gICdzZXR0aW5ncy5zZXNzaW9uTW9kZWxFbmFibGVkJzogJ1Nlc3Npb24gZGVmYXVsdCBtb2RlbCBzZWxlY3RlZCcsXG4gICdzZXR0aW5ncy5ob3N0UHJvYmUnOiAncHJvYmluZyBob3N0IGNoYW5uZWzigKYnLFxuICAnc2V0dGluZ3MuaG9zdE9rJzogJ3Nlc3Npb24gbW9kZWwgY2hhbm5lbCDinJMnLFxuICAnc2V0dGluZ3MuaG9zdEZhaWwnOiAnc2Vzc2lvbiBtb2RlbCBjaGFubmVsIHVuYXZhaWxhYmxlOiAnLFxuXG4gICdzZXR0aW5ncy5zYXZlJzogJ1NhdmUnLFxuICAnc2V0dGluZ3MucmVzZXQnOiAnUmVzZXQgdG8gZGVmYXVsdHMnLFxuICAnc2V0dGluZ3Muc2F2ZWQnOiAnU2F2ZWQnLFxuICAnc2V0dGluZ3Muc2F2ZUZhaWxlZCc6ICdTYXZlIGZhaWxlZCcsXG4gICdzZXR0aW5ncy5yZXNldEZhaWxlZCc6ICdSZXNldCBmYWlsZWQnLFxuICBcbn0gYXMgY29uc3Q7XG5cbmV4cG9ydCB0eXBlIExvY2FsZUtleSA9IGtleW9mIHR5cGVvZiB6aDtcbmV4cG9ydCB0eXBlIExvY2FsZURpY3QgPSB7IFtLIGluIExvY2FsZUtleV06IHN0cmluZyB9O1xuXG4vKiog5r+A5rS7IGxvY2FsZSDihpIg55WM6Z2i6K+t6KiA77yIemgg5YmN57yA5b2SIHpo77yM5YW25L2Z5b2SIGVu77yJICovXG5leHBvcnQgZnVuY3Rpb24gbGFuZ09mKGFjdGl2ZTogc3RyaW5nKTogTGFuZyB7XG4gIHJldHVybiB0eXBlb2YgYWN0aXZlID09PSAnc3RyaW5nJyAmJiBhY3RpdmUudG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoKCd6aCcpID8gJ3poJyA6ICdlbic7XG59XG4iLCAiLyoqIOaPkuS7tuWGhemDqOS6i+S7tuaAu+e6v++8iOaooeWdl+e6p++8m+mBv+WFjSBpbmRleCDihpQg57uE5Lu25b6q546v5L6d6LWW77yJ77yaXG4gKiAgLSBvcHRpbWl6ZVJlcXVlc3TvvJrlv6vmjbfplK4gQWx0K08g4oaSIOS8mOWMluaMiemSruinpuWPkVxuICogIC0gb3BlblNldHRpbmdzUmVxdWVzdO+8mumihOiniOWNoeOAjOWOu+iuvue9ruOAjeKGkiDorr7nva7ooYzoh6rliqjlsZXlvIAgKi9cblxuY29uc3Qgb3B0aW1pemVSZXF1ZXN0TGlzdGVuZXJzID0gbmV3IFNldDwoKSA9PiB2b2lkPigpO1xuXG5leHBvcnQgZnVuY3Rpb24gb25PcHRpbWl6ZVJlcXVlc3QoZm46ICgpID0+IHZvaWQpOiAoKSA9PiB2b2lkIHtcbiAgb3B0aW1pemVSZXF1ZXN0TGlzdGVuZXJzLmFkZChmbik7XG4gIHJldHVybiAoKSA9PiBvcHRpbWl6ZVJlcXVlc3RMaXN0ZW5lcnMuZGVsZXRlKGZuKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVtaXRPcHRpbWl6ZVJlcXVlc3QoKTogdm9pZCB7XG4gIGZvciAoY29uc3QgZm4gb2Ygb3B0aW1pemVSZXF1ZXN0TGlzdGVuZXJzKSBmbigpO1xufVxuXG5jb25zdCBvcGVuU2V0dGluZ3NMaXN0ZW5lcnMgPSBuZXcgU2V0PCgpID0+IHZvaWQ+KCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBvbk9wZW5TZXR0aW5nc1JlcXVlc3QoZm46ICgpID0+IHZvaWQpOiAoKSA9PiB2b2lkIHtcbiAgb3BlblNldHRpbmdzTGlzdGVuZXJzLmFkZChmbik7XG4gIHJldHVybiAoKSA9PiBvcGVuU2V0dGluZ3NMaXN0ZW5lcnMuZGVsZXRlKGZuKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVtaXRPcGVuU2V0dGluZ3NSZXF1ZXN0KCk6IHZvaWQge1xuICBmb3IgKGNvbnN0IGZuIG9mIG9wZW5TZXR0aW5nc0xpc3RlbmVycykgZm4oKTtcbn1cbiIsICIvKiog6L6T5YWl5qCP5Y+z5L6n44CM5LyY5YyW44CN5oyJ6ZKuIOKAlOKAlCDkuI3kvp3otZbkvJror50gc3RvcmUvaG9vayBwcm9wc++8jOeKtuaAgei1sOaooeWdl+e6p+mihOiniOaAu+e6vyAqL1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlQ2FsbGJhY2ssIHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgdHlwZSB7IExhbmcsIFByb21wdENvbmZpZyB9IGZyb20gJy4vb3B0aW1pemVyLmpzJztcbmltcG9ydCB7IHJ1bk9wdGltaXplIH0gZnJvbSAnLi9vcHRpbWl6ZXItc3RvcmUuanMnO1xuaW1wb3J0IHsgZ2V0UHJldmlld0J1c1N0YXRlLCBzdWJzY3JpYmVQcmV2aWV3QnVzIH0gZnJvbSAnLi9wcmV2aWV3LWJ1cy5qcyc7XG5pbXBvcnQgeyBvbk9wdGltaXplUmVxdWVzdCB9IGZyb20gJy4vZXZlbnRzLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBPcHRpbWl6ZUJ1dHRvblByb3BzIHtcbiAgdDogKGtleTogc3RyaW5nKSA9PiBzdHJpbmc7XG4gIGdldENvbmZpZzogKCkgPT4gUHJvbXB0Q29uZmlnO1xuICBnZXRMYW5nOiAoKSA9PiBMYW5nO1xuICBnZXRTZXNzaW9uTW9kZWw/OiAoKSA9PiBQcm9taXNlPHsgcHJvdmlkZXI6IHN0cmluZzsgbW9kZWw6IHN0cmluZyB9IHwgbnVsbD47XG4gIGdldEhvc3Q/OiAoKSA9PiB7IHJwYzogeyBjYWxsOiAoZTogc3RyaW5nLCBwPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IFByb21pc2U8eyBvazogYm9vbGVhbjsgdmFsdWU/OiB1bmtub3duOyBlcnJvcj86IHsgY29kZT86IHN0cmluZyB9IH0+IH0gfSB8IG51bGw7XG4gIGdldFNlc3Npb25JZD86ICgpID0+IHN0cmluZyB8IG51bGw7XG59XG5cbmNvbnN0IENTU19JRCA9ICdkc2gtcHJvbXB0LW9wdGltaXplci9idXR0b24uY3NzJztcbmZ1bmN0aW9uIGluamVjdENzcygpIHtcbiAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcgfHwgZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihgc3R5bGVbZGF0YS1wbHVnaW4tY3NzPVwiJHtDU1NfSUR9XCJdYCkpIHJldHVybjtcbiAgY29uc3Qgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICBzdHlsZS5kYXRhc2V0LnBsdWdpbkNzcyA9IENTU19JRDtcbiAgc3R5bGUudGV4dENvbnRlbnQgPSBgXG4uZHNoLXBvLWJ0biB7XG4gIGJvcmRlcjogMDtcbiAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgcGFkZGluZzogMnB4IDZweDtcbiAgZm9udC1zaXplOiAxNHB4O1xuICBsaW5lLWhlaWdodDogMTtcbiAgb3BhY2l0eTogMC44NTtcbiAgYm9yZGVyLXJhZGl1czogNnB4O1xufVxuLmRzaC1wby1idG46aG92ZXI6bm90KDpkaXNhYmxlZCkge1xuICBvcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIsIHJnYmEoMTI4LDEyOCwxMjgsMC4xMikpO1xufVxuLmRzaC1wby1idG46ZGlzYWJsZWQge1xuICBvcGFjaXR5OiAwLjM1O1xuICBjdXJzb3I6IGRlZmF1bHQ7XG59XG5gO1xuICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cblxuLyoqXG4gKiDor7vlj5blvZPliY3ojYnnqL/vvJrkvJjlhYjlj5bnhKbngrnovpPlhaXmjqfku7bvvIh0ZXh0YXJlYSDmiJYgRFNIIGNvbXBvc2VyIOeahFxuICogY29udGVudGVkaXRhYmxlIGRpdu+8jOWQjuiAheaYryBkc2gtd2ViID49IDAuMS4wLXJjLjYg55qE5a6e6ZmF6L6T5YWl6Z2i4oCU4oCUXG4gKiBMZXhpY2FsIOe8lui+keWZqOa4suafk+S4uiA8ZGl2IGNvbnRlbnRlZGl0YWJsZSBkYXRhLWNvbXBvc2VyLWlucHV0Pu+8jOmhtemdouS4ilxuICog5qC55pys5rKh5pyJIHRleHRhcmVh77yM6ICB5a6e546w5Y+q6K6kIHRleHRhcmVhIOWvvOiHtOiNieeov+awuOi/nOS4uuepuuOAgeeCueWHu+mdmem7mOi/lOWbnu+8jFxuICog6KGo546w5Li644CM5oyJ6ZKu54K55LqG5peg5Y+N5bqU44CN77yJ77yb5ZCm5YiZ5Zue6YCA5Yiw6aG16Z2i5Lit44CM5YC86Z2e56m644CN55qE6L6T5YWl5o6n5Lu2XG4gKiDvvIjnlKjmiLflnKjovpPlhaXnmoTljbPlvZPliY3ojYnnqL/vvInjgILkuI3kvp3otZbkvJror53moIflh4Yga2l0IOeahCBpbnB1dCBob29r4oCU4oCU5a6e5rWLXG4gKiBpbnB1dC5yaWdodCDmuLLmn5Pml7bor6XmoIflh4YgcHJvcHMg5pyq5o+Q5L6b77yM57uE5Lu25Lya5Zug6LCD55SoIHVuZGVmaW5lZCBob29rXG4gKiDltKnmuoPooqvplJnor6/ovrnnlYzlkJ7mjonvvIhQTy1SSUdIVC1PSyDmjqLpkojlj6/op4HogIwg4pyoIOS4jeWPr+inge+8ieOAglxuICovXG5cbi8qKiDku47ljZXkuKrovpPlhaXmjqfku7bor7vmlofmnKzvvJp0ZXh0YXJlYSDnlKggLnZhbHVl77yMY29udGVudGVkaXRhYmxlIOeUqCBpbm5lclRleHTjgIIgKi9cbmZ1bmN0aW9uIHRleHRPZklucHV0KGVsOiBFbGVtZW50KTogc3RyaW5nIHtcbiAgaWYgKGVsIGluc3RhbmNlb2YgSFRNTFRleHRBcmVhRWxlbWVudCkgcmV0dXJuIGVsLnZhbHVlO1xuICBpZiAoZWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiBlbC5pc0NvbnRlbnRFZGl0YWJsZSkgcmV0dXJuIGVsLmlubmVyVGV4dCB8fCAnJztcbiAgcmV0dXJuICcnO1xufVxuXG4vKiog5piv5ZCmIERTSCDkvJror53ovpPlhaXmjqfku7bvvJp0ZXh0YXJlYe+8jOaIliBjb21wb3NlciDnmoQgY29udGVudGVkaXRhYmxlIOWuv+S4u+OAgiAqL1xuZnVuY3Rpb24gaXNTZXNzaW9uSW5wdXQoZWw6IEVsZW1lbnQgfCBudWxsKTogYm9vbGVhbiB7XG4gIGlmIChlbCA9PT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICBpZiAoZWwgaW5zdGFuY2VvZiBIVE1MVGV4dEFyZWFFbGVtZW50KSByZXR1cm4gdHJ1ZTtcbiAgY29uc3QgZWRpdGFibGUgPSBlbCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICYmIGVsLmlzQ29udGVudEVkaXRhYmxlO1xuICBjb25zdCBjb21wb3NlciA9IGVsIGluc3RhbmNlb2YgRWxlbWVudCAmJiBlbC5jbG9zZXN0KCdbZGF0YS1jb21wb3Nlci1pbnB1dF0nKSAhPT0gbnVsbDtcbiAgcmV0dXJuIGVkaXRhYmxlIHx8IGNvbXBvc2VyO1xufVxuXG5mdW5jdGlvbiByZWFkRHJhZnQoKTogc3RyaW5nIHtcbiAgLy8gMS4g54Sm54K55o6n5Lu277yI55So5oi35Zyo6L6T5YWl55qE6YKj5Liq77yJ77yadGV4dGFyZWEg5oiWIGNvbnRlbnRlZGl0YWJsZSBjb21wb3NlcuOAglxuICAvLyAgICBtb3VzZWRvd24g5pe254Sm54K55bCa5pyq5YiH6LWw77yMYWN0aXZlRWxlbWVudCDku43mmK/ovpPlhaXmoYbvvIznm7TmjqXlkb3kuK3jgIJcbiAgY29uc3QgYWN0aXZlID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcbiAgaWYgKGlzU2Vzc2lvbklucHV0KGFjdGl2ZSkpIHtcbiAgICBjb25zdCB0ZXh0ID0gdGV4dE9mSW5wdXQoYWN0aXZlKTtcbiAgICBpZiAodGV4dC50cmltKCkpIHJldHVybiB0ZXh0O1xuICB9XG4gIC8vIDIuIOmhtemdouS4reeahCBjb21wb3NlciDlrr/kuLvvvIjngrnlh7vmjInpkq7ml7bnhKbngrnlt7Lnp7vliLDmjInpkq7vvIxhY3RpdmVFbGVtZW50IOS4jeWGjeaYr1xuICAvLyAgICDovpPlhaXmoYbvvJtjb21wb3NlciDmmK/lhajlsYDllK/kuIDnmoQgcmVzaWRlbnQgZGl277yM55u05o6l5oyJIGRhdGEg5bGe5oCn5om+77yJ44CCXG4gIGNvbnN0IGNvbXBvc2VyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJ1tkYXRhLWNvbXBvc2VyLWlucHV0XScpO1xuICBpZiAoY29tcG9zZXIgIT09IG51bGwgJiYgaXNTZXNzaW9uSW5wdXQoY29tcG9zZXIpKSB7XG4gICAgY29uc3QgdGV4dCA9IHRleHRPZklucHV0KGNvbXBvc2VyKTtcbiAgICBpZiAodGV4dC50cmltKCkpIHJldHVybiB0ZXh0O1xuICB9XG4gIC8vIDMuIOWbnumAgO+8muS7u+aEj+OAjOWAvOmdnuepuuOAjeeahCB0ZXh0YXJlYe+8iOWFvOWuueaXp+eJiOWuv+S4uy/lhbbku5bmlofmnKzovpPlhaXpnaLvvInjgIJcbiAgY29uc3QgYWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbDxIVE1MVGV4dEFyZWFFbGVtZW50PigndGV4dGFyZWEnKTtcbiAgZm9yIChjb25zdCB0YSBvZiBhbGwpIHtcbiAgICBpZiAodGEudmFsdWUudHJpbSgpKSByZXR1cm4gdGEudmFsdWU7XG4gIH1cbiAgcmV0dXJuICcnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gT3B0aW1pemVCdXR0b24ocHJvcHM6IE9wdGltaXplQnV0dG9uUHJvcHMpIHtcbiAgY29uc3QgeyB0LCBnZXRDb25maWcsIGdldExhbmcsIGdldFNlc3Npb25Nb2RlbCwgZ2V0SG9zdCwgZ2V0U2Vzc2lvbklkIH0gPSBwcm9wcztcblxuICAvLyDnuYHlv5nmgIHvvJrorqLpmIXmqKHlnZfnuqfpooTop4jmgLvnur/vvIjmm7/ku6PkvJror50gc3RvcmUgcHJvcHPvvInvvJtcbiAgLy8g6aKE6KeI56qX5Y+j57uR5a6a5Y+R6LW35Lya6K+d4oCU4oCU5YiH5Yiw5Yir55qE5Lya6K+d5pe25oyJ6ZKu5LiN5YaNIGJ1c3nvvIjlkITkvJror53lj6/ni6znq4vlj5HotbfkvJjljJbvvIlcbiAgY29uc3QgYnVzeUZvciA9ICgpID0+IHtcbiAgICBjb25zdCBzdCA9IGdldFByZXZpZXdCdXNTdGF0ZSgpO1xuICAgIGlmIChzdC5zdGF0dXMgIT09ICdvcHRpbWl6aW5nJykgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IHNpZCA9IGdldFNlc3Npb25JZD8uKCk7XG4gICAgcmV0dXJuIHN0LnNlc3Npb25JZCA9PT0gbnVsbCB8fCBzdC5zZXNzaW9uSWQgPT09IHNpZDtcbiAgfTtcbiAgY29uc3QgW2J1c3ksIHNldEJ1c3ldID0gdXNlU3RhdGUoYnVzeUZvcik7XG4gIHVzZUVmZmVjdChcbiAgICAoKSA9PiBzdWJzY3JpYmVQcmV2aWV3QnVzKCgpID0+IHNldEJ1c3koYnVzeUZvcigpKSksXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICAgIFtdLFxuICApO1xuXG4gIC8vIG1vdXNlZG93biDpooTor7vojYnnqL/vvJrngrnlh7vmjInpkq7nnqzpl7TnhKbngrnkvJrliIfliLDmjInpkq7vvIhhY3RpdmVFbGVtZW50IOS4jeWGjeaYryB0ZXh0YXJlYe+8ie+8jFxuICAvLyDkvYYgbW91c2Vkb3duIOaXqeS6jueEpueCueWIh+aNouKAlOKAlOatpOWIu+ivu+WIsOeahCBhY3RpdmVFbGVtZW50IOS7jeaYr+i+k+WFpeahhuOAglxuICBjb25zdCBkcmFmdFJlZiA9IFJlYWN0LnVzZVJlZignJyk7XG4gIGNvbnN0IHN5bmNEcmFmdCA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBkcmFmdFJlZi5jdXJyZW50ID0gcmVhZERyYWZ0KCk7XG4gIH0sIFtdKTtcblxuICB1c2VFZmZlY3QoKCkgPT4gaW5qZWN0Q3NzKCksIFtdKTtcblxuICBjb25zdCBoYW5kbGVDbGljayA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBpZiAoYnVzeSkgcmV0dXJuO1xuICAgIGNvbnN0IGRyYWZ0ID0gZHJhZnRSZWYuY3VycmVudCB8fCByZWFkRHJhZnQoKTtcbiAgICBpZiAoIWRyYWZ0LnRyaW0oKSkgcmV0dXJuO1xuICAgIHZvaWQgcnVuT3B0aW1pemUoe1xuICAgICAgZ2V0Q29uZmlnLFxuICAgICAgZ2V0TGFuZyxcbiAgICAgIGdldERyYWZ0OiAoKSA9PiBkcmFmdCxcbiAgICAgIGdldFNlc3Npb25Nb2RlbCxcbiAgICAgIGhvc3Q6IGdldEhvc3Q/LigpLFxuICAgICAgZ2V0U2Vzc2lvbklkLFxuICAgIH0pO1xuICB9LCBbYnVzeSwgZ2V0Q29uZmlnLCBnZXRMYW5nXSk7XG5cbiAgLy8gQWx0K08g5b+r5o236ZSu77yIaW5kZXgudHMg5YWo5bGA55uR5ZCs77yJ4oaSIOetieaViOeCueWHu+aMiemSrlxuICB1c2VFZmZlY3QoKCkgPT4gb25PcHRpbWl6ZVJlcXVlc3QoaGFuZGxlQ2xpY2spLCBbaGFuZGxlQ2xpY2tdKTtcblxuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgY2xhc3NOYW1lPVwiZHNoLXBvLWJ0blwiXG4gICAgICBhcmlhLWxhYmVsPXt0KCdidXR0b24uYXJpYScpfVxuICAgICAgdGl0bGU9e3QoJ2J1dHRvbi5hcmlhJyl9XG4gICAgICBhcmlhLWJ1c3k9e2J1c3l9XG4gICAgICBkaXNhYmxlZD17YnVzeX1cbiAgICAgIGRhdGEtYnVzeT17YnVzeX1cbiAgICAgIG9uTW91c2VEb3duPXtzeW5jRHJhZnR9XG4gICAgICBvbkZvY3VzPXtzeW5jRHJhZnR9XG4gICAgICBvbkNsaWNrPXtoYW5kbGVDbGlja31cbiAgICA+XG4gICAgICB7YnVzeSA/ICfij7MnIDogJ+KcqCd9XG4gICAgPC9idXR0b24+XG4gICk7XG59IiwgIi8qKlxuICog5a6/5Li76YCa6YGT5LyY5YyW77yI6Zu26YWN572u77yac2VydmVyIGhhbGYg55SoIGFnZW50RGVmYXVsdE1vZGVsICsgbGxtLnN0cmVhbSDnnJ/mtYHlvI/vvInjgIJcbiAqXG4gKiDmuLLmn5Pov5vnqIvmsqHmnInjgIzkuIDmrKHmgKfnlJ/miJDmi7/nu5PmnpzjgI3nmoQgUlBD77yM5Lmf5LiN6K+l55SoIHNlc3Npb24uY3JlYXRlL2Zvcmsg5Yib5bu65ZCO5Y+w5Lya6K+dXG4gKiDvvIjlkI7lj7DkvJror53kuI3lnKjliY3lj7DkuI3op6blj5HmqKHlnovmiafooYzvvIzlrp7mtYvjgIzmsLjov5zmraPlnKjkvJjljJbjgI3vvInjgILmraPop6Plj5boh6ogZHNoLWVsZiDnmoTlrr/kuLtcbiAqIOacjeWKoemdou+8mnNlcnZlciBoYWxm77yIbGliL2luZGV4Lmpz77yJ5oyB5pyJIGxsbSDkuI4gYWdlbnREZWZhdWx0TW9kZWwg5pyN5Yqh4oCU4oCUXG4gKiAgIHNlc3Npb25Nb2RlbCAgICAgICDihpIg5b2T5YmN5Lya6K+dL2FnZW50IOm7mOiupOaooeWei++8iHByb3ZpZGVyICsgbW9kZWzvvIlcbiAqICAgb3B0aW1pemUuc3RyZWFtICAgIOKGkiBTU0Ug55yf5rWB5byP77yabGxtLnN0cmVhbSDmr4/kuKogdGV4dC1kZWx0YSDljbPml7bmjqjpgIHvvIjpgJAgdG9rZW7vvIlcbiAqICAgb3B0aW1pemUuc3RhcnQgICAgIOKGkiDlkI7lj7DmtYHlvI/ntK/np6/vvIjpmY3nuqfmlrnmoYjvvIlcbiAqICAgb3B0aW1pemUucG9sbCAgICAgIOKGkiDlj5YgeyBkb25lLCB0ZXh0IH3vvIjpmY3nuqfmlrnmoYjvvIlcbiAqIGNsaWVudCDnu48gSFRUUCBTU0XvvIgvZHNoLXByb21wdC1vcHRpbWl6ZXIvYXBpL29wdGltaXplLnN0cmVhbe+8iemAkCB0b2tlbiDlkYjnjrDjgIJcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IExhbmcgfSBmcm9tICcuL29wdGltaXplci5qcyc7XG5cbi8qKiDoh6rmnInpgJrpgZPnmoTmnIDlsI/pnaLvvIjms6jlhaXlvI/vvIzkvr/kuo7ljZXmtYvvvInjgIIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgSG9zdFJwYyB7XG4gIGNhbGwoZW5kcG9pbnQ6IHN0cmluZywgcGF5bG9hZD86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogUHJvbWlzZTx7XG4gICAgb2s6IGJvb2xlYW47XG4gICAgdmFsdWU/OiB1bmtub3duO1xuICAgIGVycm9yPzogeyBjb2RlPzogc3RyaW5nOyBkZXRhaWxzPzogdW5rbm93biB9O1xuICB9Pjtcbn1cblxuLyoqXG4gKiBIVFRQIEpTT04gQVBJIOmAmumBk++8iGRzaC1lbGYg5pa55byP77yJ77ya5riy5p+T6L+b56iL6aG16Z2i55Sx5a6/5Li7IHdlYlNlcnZlciDmj5DkvpvvvIznm7jlr7not6/lvoQgZmV0Y2hcbiAqIOebtOi+viBgL2RzaC1wcm9tcHQtb3B0aW1pemVyL2FwaS88bWV0aG9kPmDvvIzlrozlhajnu5XlvIAgY29ubmVjdGlvbi5ycGMuY2FsbOKAlOKAlFxuICogZGVza3RvcCDnmoQgcnBjLmNhbGwg5Zyo5ZCM5LiA5rWB56iL56ys5LqM5qyh6LCD55So5Lya5oyC5q2777yI5a6e5rWLIHNlc3Npb25Nb2RlbCDmiJDlip/jgIHnrKzkuozmrKHmsLjkuI3ovr7vvInjgIJcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNhbGxIb3N0PFIgPSB1bmtub3duPihcbiAgbWV0aG9kOiBzdHJpbmcsXG4gIGFyZ3M6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuKTogUHJvbWlzZTx7IG9rOiBib29sZWFuOyB2YWx1ZT86IFI7IGVycm9yPzogeyBjb2RlPzogc3RyaW5nOyBkZXRhaWxzPzogdW5rbm93biB9IH0+IHtcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgL2RzaC1wcm9tcHQtb3B0aW1pemVyL2FwaS8ke2VuY29kZVVSSUNvbXBvbmVudChtZXRob2QpfWAsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeShhcmdzKSxcbiAgfSk7XG4gIHJldHVybiAoYXdhaXQgcmVzcG9uc2UuanNvbigpKSBhcyB7IG9rOiBib29sZWFuOyB2YWx1ZT86IFI7IGVycm9yPzogeyBjb2RlPzogc3RyaW5nOyBkZXRhaWxzPzogdW5rbm93biB9IH07XG59XG5cbi8qKiDnu5nmjILotbfnmoQgUlBDIOiwg+eUqOWKoOi2heaXtu+8iOWuv+S4u+mAmumBk+S7u+S9leS4gOatpemDveS4jeWFgeiuuOaXoOmZkOmYu+WhniDihpLjgIzkuIDnm7TmraPlnKjkvJjljJbjgI3vvInjgIIgKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoVGltZW91dDxUPihwcm9taXNlOiBQcm9taXNlPFQ+LCBtczogbnVtYmVyLCBsYWJlbDogc3RyaW5nKTogUHJvbWlzZTxUPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZTxUPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHJlamVjdChuZXcgRXJyb3IoYCR7bGFiZWx9LXRpbWVvdXRgKSksIG1zKTtcbiAgICBwcm9taXNlLnRoZW4oXG4gICAgICAodikgPT4ge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICByZXNvbHZlKHYpO1xuICAgICAgfSxcbiAgICAgIChlKSA9PiB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgIHJlamVjdChlKTtcbiAgICAgIH0sXG4gICAgKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSG9zdFNlc3Npb25JbmZvIHtcbiAgcHJvdmlkZXI6IHN0cmluZztcbiAgbW9kZWw6IHN0cmluZztcbiAgcmVhc29uaW5nRWZmb3J0Pzogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJ1bkhvc3RPcHRpbWl6ZU9wdGlvbnMge1xuICBycGM6IEhvc3RScGM7XG4gIGxhbmc6IExhbmc7XG4gIHRleHQ6IHN0cmluZztcbiAgc3lzdGVtOiBzdHJpbmc7XG4gIHNpZ25hbDogQWJvcnRTaWduYWw7XG4gIG9uRGVsdGE6ICh0ZXh0OiBzdHJpbmcpID0+IHZvaWQ7XG4gIC8qKiDlrr/kuLvpgJrpgZPmraXpqqTov5vluqbvvIjljaHniYfmmL7npLrvvIzlrprkvY3ljaHngrnvvIkgKi9cbiAgb25TdGVwPzogKHN0ZXA6ICdtb2RlbCcgfCAnc3RhcnQnIHwgJ3BvbGwnKSA9PiB2b2lkO1xuICBpbnRlcnZhbE1zPzogbnVtYmVyO1xuICB0aW1lb3V0TXM/OiBudW1iZXI7XG4gIHJwY1RpbWVvdXRNcz86IG51bWJlcjtcbn1cblxuY29uc3QgREVGQVVMVF9JTlRFUlZBTF9NUyA9IDEwMDtcbmNvbnN0IERFRkFVTFRfVElNRU9VVF9NUyA9IDEyMF8wMDA7XG5jb25zdCBERUZBVUxUX1JQQ19USU1FT1VUX01TID0gNV8wMDA7XG5cbmZ1bmN0aW9uIGNhbGxScGM8UiA9IG5ldmVyPihcbiAgcnBjOiBIb3N0UnBjLFxuICBlbmRwb2ludDogc3RyaW5nLFxuICBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbiAgbXM6IG51bWJlcixcbik6IFByb21pc2U8eyBvazogdHJ1ZTsgdmFsdWU6IFIgfSB8IHsgb2s6IGZhbHNlOyBlcnJvcj86IHsgY29kZT86IHN0cmluZzsgZGV0YWlscz86IHVua25vd24gfSB9PiB7XG4gIHJldHVybiB3aXRoVGltZW91dChcbiAgICBycGMuY2FsbChlbmRwb2ludCwgcGF5bG9hZCksXG4gICAgbXMsXG4gICAgZW5kcG9pbnQsXG4gICkgYXMgUHJvbWlzZTx7IG9rOiB0cnVlOyB2YWx1ZTogUiB9IHwgeyBvazogZmFsc2U7IGVycm9yPzogeyBjb2RlPzogc3RyaW5nOyBkZXRhaWxzPzogdW5rbm93biB9IH0+O1xufVxuXG4vKiog5Y+W5b2T5YmN5Lya6K+dL2FnZW50IOm7mOiupOaooeWei++8iOmbtumFjee9ru+8ieOAguS4jeWPr+W+l+aXtui/lOWbniBudWxs44CCICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzb2x2ZUhvc3RTZXNzaW9uTW9kZWwoXG4gIHJwYzogSG9zdFJwYyxcbiAgcnBjVGltZW91dE1zID0gREVGQVVMVF9SUENfVElNRU9VVF9NUyxcbik6IFByb21pc2U8SG9zdFNlc3Npb25JbmZvIHwgbnVsbD4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBjYWxsUnBjKHJwYywgJ3Nlc3Npb25Nb2RlbCcsIHt9LCBycGNUaW1lb3V0TXMpO1xuICBpZiAoIXJlcy5vayB8fCAhcmVzLnZhbHVlIHx8IHR5cGVvZiByZXMudmFsdWUgIT09ICdvYmplY3QnKSByZXR1cm4gbnVsbDtcbiAgY29uc3QgdiA9IHJlcy52YWx1ZSBhcyB7IHByb3ZpZGVyPzogdW5rbm93bjsgbW9kZWw/OiB1bmtub3duIH07XG4gIGlmICh0eXBlb2Ygdi5wcm92aWRlciAhPT0gJ3N0cmluZycgfHwgdHlwZW9mIHYubW9kZWwgIT09ICdzdHJpbmcnKSByZXR1cm4gbnVsbDtcbiAgY29uc3QgaW5mbzogSG9zdFNlc3Npb25JbmZvID0geyBwcm92aWRlcjogdi5wcm92aWRlciwgbW9kZWw6IHYubW9kZWwgfTtcbiAgaWYgKHR5cGVvZiAocmVzLnZhbHVlIGFzIHsgcmVhc29uaW5nRWZmb3J0PzogdW5rbm93biB9KS5yZWFzb25pbmdFZmZvcnQgPT09ICdzdHJpbmcnKSB7XG4gICAgaW5mby5yZWFzb25pbmdFZmZvcnQgPSAocmVzLnZhbHVlIGFzIHsgcmVhc29uaW5nRWZmb3J0Pzogc3RyaW5nIH0pLnJlYXNvbmluZ0VmZm9ydDtcbiAgfVxuICByZXR1cm4gaW5mbztcbn1cblxuLyoqIOaWh+acrOWinumHj++8iOWtl+espuWJjee8gOavlOi+g++8m+i9ruivoui/keS8vOa1geW8j+eUqO+8ieOAgiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByZWZpeERlbHRhKHByZXY6IHN0cmluZywgbmV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgbiA9IE1hdGgubWluKHByZXYubGVuZ3RoLCBuZXh0Lmxlbmd0aCk7XG4gIGxldCBpID0gMDtcbiAgd2hpbGUgKGkgPCBuICYmIHByZXYuY2hhckNvZGVBdChpKSA9PT0gbmV4dC5jaGFyQ29kZUF0KGkpKSBpICs9IDE7XG4gIHJldHVybiBuZXh0LnNsaWNlKGkpO1xufVxuXG4vKipcbiAqIOWuv+S4u+mAmumBk+WFqOa1geeoi++8iOWNleasoSBSUEMg5Lqk5LuY77yJ77yac2VydmVyIGhhbGYg6Kej5p6Q5Lya6K+d6buY6K6k5qih5Z6LIOKGkiBsbG0uc3RyZWFtIOi3keWujFxuICog4oaSIOS4gOasoeaAp+i/lOWbnuWFqOaWh+OAguS4jeeUqOOAjHN0YXJ0ICsg6L2u6K+iIHBvbGzjgI3nmoTliIbmraXljY/orq7vvJpkZXNrdG9wIOa4suafk+i/m+eoi+eahFxuICogcnBjLmNhbGwg5Zyo5ZCM5LiA5rWB56iL55qE56ys5LqM5qyh6LCD55So5Lya5oyC5q2777yI5a6e5rWLIHNlc3Npb25Nb2RlbCDmiJDlip/jgIFzdGFydCDmsLjkuI3ovr7vvInvvIxcbiAqIOWNleasoeiwg+eUqOe7leW8gOivpemZkOWItuOAguWNoeeJh+aXoOmAkOWtl+a7muWKqO+8iOa1geW8j+iDveWKm+S/neeVmeWcqCBmZXRjaCDpgJrpgZPvvInjgIJcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTdHJlYW1Ib3N0T3B0aW1pemVPcHRpb25zIHtcbiAgcnBjOiBIb3N0UnBjO1xuICB0ZXh0OiBzdHJpbmc7XG4gIHN5c3RlbTogc3RyaW5nO1xuICBzaWduYWw6IEFib3J0U2lnbmFsO1xuICBvbkRlbHRhKHRleHQ6IHN0cmluZyk6IHZvaWQ7XG4gIG9uUmVhc29uaW5nPyh0ZXh0OiBzdHJpbmcpOiB2b2lkO1xuICBvblN0ZXA/KHN0ZXA6ICdtb2RlbCcgfCAnc3RhcnQnIHwgJ3BvbGwnKTogdm9pZDtcbiAgdGltZW91dE1zPzogbnVtYmVyO1xufVxuXG4vKiog6Kej5p6QIFNTRSDluKfvvJrov5Tlm54geyBldmVudCwgZGF0YSB977yIXFxuXFxuIOWIhuW4p++8ieOAgiAqL1xuYXN5bmMgZnVuY3Rpb24gcmVhZFNzZUZyYW1lcyhcbiAgcmVzcG9uc2U6IFJlc3BvbnNlLFxuICBvbkZyYW1lOiAoZXZlbnQ6IHN0cmluZywgZGF0YTogc3RyaW5nKSA9PiB2b2lkLFxuKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHJlYWRlciA9IHJlc3BvbnNlLmJvZHk/LmdldFJlYWRlcigpO1xuICBpZiAoIXJlYWRlcikgdGhyb3cgbmV3IEVycm9yKCduby1zdHJlYW0nKTtcbiAgY29uc3QgZGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigpO1xuICBsZXQgYnVmZmVyID0gJyc7XG4gIGZvciAoOzspIHtcbiAgICBjb25zdCB7IGRvbmUsIHZhbHVlIH0gPSBhd2FpdCByZWFkZXIucmVhZCgpO1xuICAgIGlmIChkb25lKSBicmVhaztcbiAgICBidWZmZXIgKz0gZGVjb2Rlci5kZWNvZGUodmFsdWUsIHsgc3RyZWFtOiB0cnVlIH0pO1xuICAgIGZvciAoOzspIHtcbiAgICAgIGNvbnN0IGlkeCA9IGJ1ZmZlci5pbmRleE9mKCdcXG5cXG4nKTtcbiAgICAgIGlmIChpZHggPT09IC0xKSBicmVhaztcbiAgICAgIGNvbnN0IGZyYW1lID0gYnVmZmVyLnNsaWNlKDAsIGlkeCk7XG4gICAgICBidWZmZXIgPSBidWZmZXIuc2xpY2UoaWR4ICsgMik7XG4gICAgICBsZXQgZXZlbnQgPSAnbWVzc2FnZSc7XG4gICAgICBsZXQgZGF0YSA9ICcnO1xuICAgICAgZm9yIChjb25zdCBsaW5lIG9mIGZyYW1lLnNwbGl0KCdcXG4nKSkge1xuICAgICAgICBpZiAobGluZS5zdGFydHNXaXRoKCdldmVudDonKSkgZXZlbnQgPSBsaW5lLnNsaWNlKDYpLnRyaW0oKTtcbiAgICAgICAgZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKCdkYXRhOicpKSBkYXRhID0gbGluZS5zbGljZSg1KS50cmltKCk7XG4gICAgICB9XG4gICAgICBvbkZyYW1lKGV2ZW50LCBkYXRhKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiDlrr/kuLvpgJrpgZPnnJ/mtYHlvI/vvJpmZXRjaCBTU0XvvIzpgJAgdG9rZW4gb25EZWx0YeOAgue7leW8gCBycGMuY2FsbO+8iGRlc2t0b3Ag5LqM5qyh6LCD55So5oyC5q2777yJ77yMXG4gKiDkuZ/nu5XlvIDova7or6Llv6vnhafvvIjlv6vmqKHlnovku43mmL7kuIDmrKHmgKfvvInjgIJhYm9ydCA9IHNpZ25hbCArIGZldGNoIGFib3J044CCXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdHJlYW1Ib3N0T3B0aW1pemUob3B0czogU3RyZWFtSG9zdE9wdGltaXplT3B0aW9ucyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnN0IHsgcnBjLCB0ZXh0LCBzeXN0ZW0sIHNpZ25hbCwgb25EZWx0YSwgb25SZWFzb25pbmcsIG9uU3RlcCB9ID0gb3B0cztcbiAgY29uc3QgdGltZW91dE1zID0gb3B0cy50aW1lb3V0TXMgPz8gREVGQVVMVF9USU1FT1VUX01TO1xuICBpZiAoc2lnbmFsLmFib3J0ZWQpIHRocm93IG5ldyBFcnJvcignYWJvcnRlZCcpO1xuICBvblN0ZXA/LignbW9kZWwnKTtcbiAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IHJlc29sdmVIb3N0U2Vzc2lvbk1vZGVsKHJwYywgb3B0cy5ycGNUaW1lb3V0TXMgPz8gREVGQVVMVF9SUENfVElNRU9VVF9NUyk7XG4gIGlmICghc2Vzc2lvbikgdGhyb3cgbmV3IEVycm9yKCdob3N0LXVuYXZhaWxhYmxlJyk7XG4gIG9uU3RlcD8uKCdzdGFydCcpO1xuXG4gIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gIGNvbnN0IG9uQWJvcnQgPSAoKSA9PiBjb250cm9sbGVyLmFib3J0KCk7XG4gIHNpZ25hbC5hZGRFdmVudExpc3RlbmVyKCdhYm9ydCcsIG9uQWJvcnQpO1xuICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiBjb250cm9sbGVyLmFib3J0KCksIHRpbWVvdXRNcyk7XG4gIGxldCBvdXQgPSAnJztcbiAgdHJ5IHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKCcvZHNoLXByb21wdC1vcHRpbWl6ZXIvYXBpL29wdGltaXplLnN0cmVhbScsIHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgaGVhZGVyczogeyAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHByb3ZpZGVyOiBzZXNzaW9uLnByb3ZpZGVyLFxuICAgICAgICBtb2RlbDogc2Vzc2lvbi5tb2RlbCxcbiAgICAgICAgdGV4dCxcbiAgICAgICAgc3lzdGVtLFxuICAgICAgICAuLi4oc2Vzc2lvbi5yZWFzb25pbmdFZmZvcnQgPyB7IHJlYXNvbmluZ0VmZm9ydDogc2Vzc2lvbi5yZWFzb25pbmdFZmZvcnQgfSA6IHt9KSxcbiAgICAgIH0pLFxuICAgICAgc2lnbmFsOiBjb250cm9sbGVyLnNpZ25hbCxcbiAgICB9KTtcbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYGh0dHAtJHtyZXNwb25zZS5zdGF0dXN9YCk7XG4gICAgb25TdGVwPy4oJ3BvbGwnKTtcbiAgICBsZXQgcmVhc29uaW5nID0gJyc7XG4gICAgYXdhaXQgcmVhZFNzZUZyYW1lcyhyZXNwb25zZSwgKGV2ZW50LCBkYXRhKSA9PiB7XG4gICAgICBpZiAoZGF0YSA9PT0gJ3t9JyB8fCBkYXRhID09PSAnW0RPTkVdJykgcmV0dXJuO1xuICAgICAgaWYgKGV2ZW50ID09PSAncmVhc29uaW5nJykge1xuICAgICAgICByZWFzb25pbmcgKz0gZGF0YTtcbiAgICAgICAgb25SZWFzb25pbmc/LihyZWFzb25pbmcpO1xuICAgICAgfSBlbHNlIGlmIChldmVudCA9PT0gJ2RlbHRhJykge1xuICAgICAgICBvdXQgKz0gZGF0YTtcbiAgICAgICAgb25EZWx0YShvdXQpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIC8vIOacjeWKoeerr+Wni+e7iOS7pSBldmVudDpkb25lIOaUtuWwvu+8jOaXoOaYvuW8j+mUmeivr+W4p+WNs+aIkOWKn1xuICAgIGlmIChzaWduYWwuYWJvcnRlZCkgdGhyb3cgbmV3IEVycm9yKCdhYm9ydGVkJyk7XG4gICAgcmV0dXJuIG91dDtcbiAgfSBmaW5hbGx5IHtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgc2lnbmFsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Fib3J0Jywgb25BYm9ydCk7XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bkhvc3RPcHRpbWl6ZShvcHRzOiBSdW5Ib3N0T3B0aW1pemVPcHRpb25zKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgY29uc3QgeyBycGMsIGxhbmc6IF9sYW5nLCB0ZXh0LCBzeXN0ZW0sIHNpZ25hbCwgb25EZWx0YSwgb25TdGVwIH0gPSBvcHRzO1xuICBjb25zdCBpbnRlcnZhbE1zID0gb3B0cy5pbnRlcnZhbE1zID8/IERFRkFVTFRfSU5URVJWQUxfTVM7XG4gIGNvbnN0IHRpbWVvdXRNcyA9IG9wdHMudGltZW91dE1zID8/IERFRkFVTFRfVElNRU9VVF9NUztcbiAgY29uc3QgcnBjVGltZW91dE1zID0gb3B0cy5ycGNUaW1lb3V0TXMgPz8gREVGQVVMVF9SUENfVElNRU9VVF9NUztcbiAgaWYgKHNpZ25hbC5hYm9ydGVkKSB0aHJvdyBuZXcgRXJyb3IoJ2Fib3J0ZWQnKTtcblxuICAvLyAxLiDkvJror53pu5jorqTmqKHlnovvvIjpm7bphY3nva7vvIlcbiAgb25TdGVwPy4oJ21vZGVsJyk7XG4gIGNvbnN0IHNlc3Npb24gPSBhd2FpdCByZXNvbHZlSG9zdFNlc3Npb25Nb2RlbChycGMsIHJwY1RpbWVvdXRNcyk7XG4gIGlmICghc2Vzc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcignaG9zdC11bmF2YWlsYWJsZScpO1xuICB9XG5cbiAgLy8gMi4g5ZCv5Yqo5ZCO5Y+w5rWB5byPXG4gIG9uU3RlcD8uKCdzdGFydCcpO1xuICBjb25zdCBzdGFydFBheWxvYWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge1xuICAgIHByb3ZpZGVyOiBzZXNzaW9uLnByb3ZpZGVyLFxuICAgIG1vZGVsOiBzZXNzaW9uLm1vZGVsLFxuICAgIHRleHQsXG4gICAgc3lzdGVtLFxuICB9O1xuICBpZiAoc2Vzc2lvbi5yZWFzb25pbmdFZmZvcnQpIHN0YXJ0UGF5bG9hZC5yZWFzb25pbmdFZmZvcnQgPSBzZXNzaW9uLnJlYXNvbmluZ0VmZm9ydDtcbiAgY29uc3Qgc3RhcnQgPSBhd2FpdCBjYWxsUnBjPHsgdGFza0lkPzogc3RyaW5nIH0+KHJwYywgJ29wdGltaXplLnN0YXJ0Jywgc3RhcnRQYXlsb2FkLCBycGNUaW1lb3V0TXMpO1xuICBpZiAoIXN0YXJ0Lm9rIHx8ICFzdGFydC52YWx1ZSB8fCB0eXBlb2Ygc3RhcnQudmFsdWUudGFza0lkICE9PSAnc3RyaW5nJykge1xuICAgIGNvbnN0IGNvZGUgPSAoIXN0YXJ0Lm9rICYmIHN0YXJ0LmVycm9yICYmIHN0YXJ0LmVycm9yLmNvZGUpIHx8ICcnO1xuICAgIGNvbnN0IGRldGFpbHMgPSAoIXN0YXJ0Lm9rICYmIHN0YXJ0LmVycm9yICYmIHN0YXJ0LmVycm9yLmRldGFpbHMpIHx8ICcnO1xuICAgIHRocm93IG5ldyBFcnJvcihgaG9zdC1zdGFydC1yZWplY3RlZCR7Y29kZSA/IGA6ICR7Y29kZX0gJHtkZXRhaWxzIHx8ICcnfWAudHJpbSgpIDogJyd9YCk7XG4gIH1cbiAgY29uc3QgdGFza0lkID0gc3RhcnQudmFsdWUudGFza0lkO1xuXG4gIC8vIDMuIOi9ruivouWinumHj+ebtOiHsyBkb25l77yI5pyN5Yqh56uv5pi+5byP5a6M5oiQ5L+h5Y+377yM5pegIHNldHRsZSDlhZzlupXvvIlcbiAgb25TdGVwPy4oJ3BvbGwnKTtcbiAgY29uc3Qgc3RhcnRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgbGV0IGxhc3QgPSAnJztcbiAgdHJ5IHtcbiAgICBmb3IgKDs7KSB7XG4gICAgICBpZiAoc2lnbmFsLmFib3J0ZWQpIHRocm93IG5ldyBFcnJvcignYWJvcnRlZCcpO1xuICAgICAgaWYgKERhdGUubm93KCkgLSBzdGFydGVkQXQgPiB0aW1lb3V0TXMpIHRocm93IG5ldyBFcnJvcigndGltZW91dCcpO1xuICAgICAgbGV0IHBvbGw6IHsgZG9uZT86IGJvb2xlYW47IHRleHQ/OiBzdHJpbmc7IGVycm9yPzogc3RyaW5nIHwgbnVsbCB9IHwgbnVsbCA9IG51bGw7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBjYWxsUnBjPHsgZG9uZT86IGJvb2xlYW47IHRleHQ/OiBzdHJpbmc7IGVycm9yPzogc3RyaW5nIHwgbnVsbCB9PihcbiAgICAgICAgICBycGMsXG4gICAgICAgICAgJ29wdGltaXplLnBvbGwnLFxuICAgICAgICAgIHsgdGFza0lkIH0sXG4gICAgICAgICAgcnBjVGltZW91dE1zLFxuICAgICAgICApO1xuICAgICAgICBpZiAocmVzLm9rICYmIHJlcy52YWx1ZSkgcG9sbCA9IHJlcy52YWx1ZTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICAvLyDljZXmrKHova7or6LlpLHotKXkuI3oh7Tlkb3vvIzkuIvkuIDova7lho3or5VcbiAgICAgIH1cbiAgICAgIGlmIChwb2xsKSB7XG4gICAgICAgIGlmIChwb2xsLmVycm9yKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHBvbGwuZXJyb3IpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRleHROb3cgPSBwb2xsLnRleHQgPz8gJyc7XG4gICAgICAgIGlmICh0ZXh0Tm93ICE9PSBsYXN0KSB7XG4gICAgICAgICAgb25EZWx0YSh0ZXh0Tm93KTtcbiAgICAgICAgICBpZiAoc2lnbmFsLmFib3J0ZWQpIHRocm93IG5ldyBFcnJvcignYWJvcnRlZCcpO1xuICAgICAgICAgIGxhc3QgPSB0ZXh0Tm93O1xuICAgICAgICB9XG4gICAgICAgIGlmIChwb2xsLmRvbmUpIHtcbiAgICAgICAgICByZXR1cm4gdGV4dE5vdztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgaW50ZXJ2YWxNcykpO1xuICAgIH1cbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgcnBjLmNhbGwoJ29wdGltaXplLmFib3J0JywgeyB0YXNrSWQgfSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyDlsL3liptcbiAgICB9XG4gIH1cbn1cbiIsICIvKipcbiAqIG1lbW9yeS50cyDigJTigJQg5Lya6K+d6K6w5b+GICsg5YGP5aW96Ieq5a2m5Lmg77yI57qv5YmN56uv77yMbG9jYWxTdG9yYWdlIOaMgeS5heWMlu+8iVxuICpcbiAqIOiuvuiuoeWPluiIje+8iOS4uuS7gOS5iOS4jeeUqOWuv+S4u+aWh+S7tu+8ie+8mlxuICogICDlrr/kuLvnmoQgYHN5c3RlbWAg5Y+C5pWw5a6M5YWo55Sx5a6i5oi356uv5ou86KOF5ZCO5Lyg57uZIGxsbS5zdHJlYW3vvIzlm6DmraTorrDlv4blj6ropoHlnKjlrqLmiLfnq69cbiAqICAg57uE6KOF5Y2z5Y+v77yM5LiN6ZyA6KaB5paw5aKeIGhvc3QgQVBJ44CB5LiN6ZyA6KaB5pS5IGxpYi9pbmRleC5qcyDigJTigJQg5pS55Yqo6Z2i5pyA5bCP44CB5pyA5LiN5a655piTXG4gKiAgIOaKiuaPkuS7tuaQnuaMguOAglxuICpcbiAqIOS4ieWxguiusOW/hu+8iOWvuem9kCBXb3JrQnVkZHkg55qE5YiG5bGC5oCd6Lev77yM5L2G6IyD5Zu05pS256qE5Yiw44CM5o+Q56S66K+N5YGP5aW944CN77yJ77yaXG4gKiAgIEwxIOS8muivneiusOW/hiAgIHNlc3Npb25EcmFmdHNbc2Vzc2lvbklkXSAg4oCU4oCUIOacrOS8muivneacgOi/kSAxMCDmnaHojYnnqL/vvIznlKjkuo7nkIbop6PlvZPliY3or63looNcbiAqICAgTDIg5qC35L6L6K6w5b+GICAgYWNjZXB0ZWRbXSAgICAgICAgICAgICAgICDigJTigJQg5pyA6L+R6KKr6YeH57qz55qE44CM6I2J56i/IOKGkiDnu5PmnpzjgI3lr7nvvIzkvZwgZmV3LXNob3RcbiAqICAgTDMg5YGP5aW955S75YOPICAgcHJvZmlsZSAgICAgICAgICAgICAgICAgICDigJTigJQg55Sx6YeH57qzL+aUvuW8g+iusOW9leWPjeaAneWHuueahOeos+WumuWBj+Wlve+8iOKJpDYwMCDlrZfvvIlcbiAqXG4gKiDoh6rlrabkuaDpl63njq/vvIjlgJ/pibQgTGFuZ01lbSBtZXRhcHJvbXB0ICsgU2tpbGxPcHQg55qE44CM5pyJ55WM57yW6L6RICsg6aqM6K+B6Ze46Zeo44CN77yJ77yaXG4gKiAgIOmHh+e6syA9IOato+agt+acrO+8iOmqjOivgemAmui/h++8iSAvIOaUvuW8g+aIlumHjeivlSA9IOi0n+agt+acrFxuICogICDihpIg5q+P57Sv6K6hIDMg5Liq5paw5q2j5qC35pys6Kem5Y+R5LiA5qyh5Y+N5oCd77yIMSDmrKEgTExNIOiwg+eUqO+8iVxuICogICDihpIg5Y+N5oCd5Lqn5Ye655qE5pivKirmnInnlYzmm7/mjaIqKueahCBwcm9maWxl77yI5LiN5piv5peg6ZmQ6L+95Yqg77yJ77yM5pen55S75YOP6KKr6KaG55uWXG4gKiAgIOKGkiDlj43mgJ3lpLHotKXpnZnpu5jlv73nlaXvvIznu53kuI3lvbHlk43kuLvmtYHnqItcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IEludGVuc2l0eSwgU3lzdGVtQ29udGV4dCB9IGZyb20gJy4vb3B0aW1pemVyLmpzJztcbmltcG9ydCB7IERFRkFVTFRfSU5URU5TSVRZIH0gZnJvbSAnLi9vcHRpbWl6ZXIuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNhbXBsZSB7XG4gIGRyYWZ0OiBzdHJpbmc7XG4gIHJlc3VsdDogc3RyaW5nO1xuICBhdDogbnVtYmVyO1xuICBzZXNzaW9uSWQ6IHN0cmluZyB8IG51bGw7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWVtb3J5U3RhdGUge1xuICB2ZXJzaW9uOiAxO1xuICBwcm9maWxlOiBzdHJpbmc7XG4gIGFjY2VwdGVkOiBTYW1wbGVbXTtcbiAgcmVqZWN0ZWQ6IFNhbXBsZVtdO1xuICBzZXNzaW9uRHJhZnRzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT47XG4gIHN0YXRzOiB7IGFjY2VwdGVkOiBudW1iZXI7IHJlamVjdGVkOiBudW1iZXI7IGFjY2VwdGVkU2luY2VSZWZsZWN0OiBudW1iZXIgfTtcbn1cblxuY29uc3QgS0VZID0gJ2RzaC1wcm9tcHQtb3B0aW1pemVyLm1lbW9yeS52MSc7XG5jb25zdCBNQVhfQUNDRVBURUQgPSAxMjtcbmNvbnN0IE1BWF9SRUpFQ1RFRCA9IDg7XG5jb25zdCBNQVhfU0VTU0lPTl9EUkFGVFMgPSAxMDtcbmNvbnN0IFJFRkxFQ1RfRVZFUlkgPSAzO1xuXG5mdW5jdGlvbiBlbXB0eSgpOiBNZW1vcnlTdGF0ZSB7XG4gIHJldHVybiB7XG4gICAgdmVyc2lvbjogMSxcbiAgICBwcm9maWxlOiAnJyxcbiAgICBhY2NlcHRlZDogW10sXG4gICAgcmVqZWN0ZWQ6IFtdLFxuICAgIHNlc3Npb25EcmFmdHM6IHt9LFxuICAgIHN0YXRzOiB7IGFjY2VwdGVkOiAwLCByZWplY3RlZDogMCwgYWNjZXB0ZWRTaW5jZVJlZmxlY3Q6IDAgfSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3RvcmFnZSgpOiBTdG9yYWdlIHwgbnVsbCB7XG4gIHRyeSB7XG4gICAgaWYgKHR5cGVvZiBsb2NhbFN0b3JhZ2UgPT09ICd1bmRlZmluZWQnKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZE1lbW9yeSgpOiBNZW1vcnlTdGF0ZSB7XG4gIGNvbnN0IHMgPSBzdG9yYWdlKCk7XG4gIGlmICghcykgcmV0dXJuIGVtcHR5KCk7XG4gIHRyeSB7XG4gICAgY29uc3QgcmF3ID0gcy5nZXRJdGVtKEtFWSk7XG4gICAgaWYgKCFyYXcpIHJldHVybiBlbXB0eSgpO1xuICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UocmF3KSBhcyBQYXJ0aWFsPE1lbW9yeVN0YXRlPjtcbiAgICBjb25zdCBiYXNlID0gZW1wdHkoKTtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uYmFzZSxcbiAgICAgIHByb2ZpbGU6IHR5cGVvZiBwYXJzZWQucHJvZmlsZSA9PT0gJ3N0cmluZycgPyBwYXJzZWQucHJvZmlsZSA6ICcnLFxuICAgICAgYWNjZXB0ZWQ6IEFycmF5LmlzQXJyYXkocGFyc2VkLmFjY2VwdGVkKSA/IHBhcnNlZC5hY2NlcHRlZC5zbGljZSgwLCBNQVhfQUNDRVBURUQpIDogW10sXG4gICAgICByZWplY3RlZDogQXJyYXkuaXNBcnJheShwYXJzZWQucmVqZWN0ZWQpID8gcGFyc2VkLnJlamVjdGVkLnNsaWNlKDAsIE1BWF9SRUpFQ1RFRCkgOiBbXSxcbiAgICAgIHNlc3Npb25EcmFmdHM6XG4gICAgICAgIHBhcnNlZC5zZXNzaW9uRHJhZnRzICYmIHR5cGVvZiBwYXJzZWQuc2Vzc2lvbkRyYWZ0cyA9PT0gJ29iamVjdCcgPyBwYXJzZWQuc2Vzc2lvbkRyYWZ0cyA6IHt9LFxuICAgICAgc3RhdHM6IHtcbiAgICAgICAgYWNjZXB0ZWQ6IE51bWJlcihwYXJzZWQuc3RhdHM/LmFjY2VwdGVkKSB8fCAwLFxuICAgICAgICByZWplY3RlZDogTnVtYmVyKHBhcnNlZC5zdGF0cz8ucmVqZWN0ZWQpIHx8IDAsXG4gICAgICAgIGFjY2VwdGVkU2luY2VSZWZsZWN0OiBOdW1iZXIocGFyc2VkLnN0YXRzPy5hY2NlcHRlZFNpbmNlUmVmbGVjdCkgfHwgMCxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGVtcHR5KCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhdmVNZW1vcnkobTogTWVtb3J5U3RhdGUpOiB2b2lkIHtcbiAgY29uc3QgcyA9IHN0b3JhZ2UoKTtcbiAgaWYgKCFzKSByZXR1cm47XG4gIHRyeSB7XG4gICAgcy5zZXRJdGVtKEtFWSwgSlNPTi5zdHJpbmdpZnkobSkpO1xuICB9IGNhdGNoIHtcbiAgICAvLyDphY3pop3mu6EgLyDpmpDnp4HmqKHlvI/vvJrpnZnpu5jpmY3nuqfkuLrjgIzml6DorrDlv4bjgI1cbiAgfVxufVxuXG4vKiog562J5b6F55So5oi36KOB5Yaz55qE5pyA6L+R5LiA5qyh5LyY5YyW57uT5p6cICovXG5sZXQgcGVuZGluZzogU2FtcGxlIHwgbnVsbCA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1lbWJlckRyYWZ0KHNlc3Npb25JZDogc3RyaW5nIHwgbnVsbCwgZHJhZnQ6IHN0cmluZyk6IHZvaWQge1xuICBjb25zdCBtID0gbG9hZE1lbW9yeSgpO1xuICBjb25zdCBrZXkgPSBzZXNzaW9uSWQgPz8gJ18nO1xuICBjb25zdCBsaXN0ID0gKG0uc2Vzc2lvbkRyYWZ0c1trZXldID8/IFtdKS5maWx0ZXIoKGQpID0+IGQgIT09IGRyYWZ0KTtcbiAgbGlzdC5wdXNoKGRyYWZ0LnNsaWNlKDAsIDUwMCkpO1xuICBtLnNlc3Npb25EcmFmdHNba2V5XSA9IGxpc3Quc2xpY2UoLU1BWF9TRVNTSU9OX0RSQUZUUyk7XG4gIC8vIOS8muivneadoeebruS5n+WIq+aXoOmZkOWinumVv++8muacgOWkmuS/neeVmSAyMCDkuKrkvJror51cbiAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKG0uc2Vzc2lvbkRyYWZ0cyk7XG4gIGlmIChrZXlzLmxlbmd0aCA+IDIwKSB7XG4gICAgZm9yIChjb25zdCBrIG9mIGtleXMuc2xpY2UoMCwga2V5cy5sZW5ndGggLSAyMCkpIGRlbGV0ZSBtLnNlc3Npb25EcmFmdHNba107XG4gIH1cbiAgc2F2ZU1lbW9yeShtKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFBlbmRpbmcoc2Vzc2lvbklkOiBzdHJpbmcgfCBudWxsLCBkcmFmdDogc3RyaW5nLCByZXN1bHQ6IHN0cmluZyk6IHZvaWQge1xuICBwZW5kaW5nID0geyBkcmFmdCwgcmVzdWx0LCBhdDogRGF0ZS5ub3coKSwgc2Vzc2lvbklkIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNQZW5kaW5nKCk6IGJvb2xlYW4ge1xuICByZXR1cm4gcGVuZGluZyAhPT0gbnVsbDtcbn1cblxuLyoqXG4gKiDorrDlvZXoo4HlhrPnu5PmnpzjgIJcbiAqIGFjY2VwdGVkIOKGkiDov5vlhaUgZmV3LXNob3Qg5qC35L6L5rGg77yM5bm26K6h5YWl5Y+N5oCd6K6h5pWwXG4gKiByZWplY3RlZCDihpIg5Y+q6K6w5YWl6LSf5qC35pys5rGg77yI55So5LqO5Y+N5oCd5pe26YG/5Z2R77yJ77yM5LiN5b2x5ZON5Y+v55So5qC35L6LXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWNvcmRPdXRjb21lKGtpbmQ6ICdhY2NlcHRlZCcgfCAncmVqZWN0ZWQnKTogYm9vbGVhbiB7XG4gIGlmICghcGVuZGluZykgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBzYW1wbGUgPSBwZW5kaW5nO1xuICBwZW5kaW5nID0gbnVsbDtcblxuICBjb25zdCBtID0gbG9hZE1lbW9yeSgpO1xuICBpZiAoa2luZCA9PT0gJ2FjY2VwdGVkJykge1xuICAgIG0uYWNjZXB0ZWQgPSBbXG4gICAgICBzYW1wbGUsXG4gICAgICAuLi5tLmFjY2VwdGVkLmZpbHRlcigoeCkgPT4gISh4LmRyYWZ0ID09PSBzYW1wbGUuZHJhZnQgJiYgeC5yZXN1bHQgPT09IHNhbXBsZS5yZXN1bHQpKSxcbiAgICBdLnNsaWNlKDAsIE1BWF9BQ0NFUFRFRCk7XG4gICAgbS5zdGF0cy5hY2NlcHRlZCArPSAxO1xuICAgIG0uc3RhdHMuYWNjZXB0ZWRTaW5jZVJlZmxlY3QgKz0gMTtcbiAgfSBlbHNlIHtcbiAgICBtLnJlamVjdGVkID0gW3NhbXBsZSwgLi4ubS5yZWplY3RlZC5maWx0ZXIoKHgpID0+IHguZHJhZnQgIT09IHNhbXBsZS5kcmFmdCldLnNsaWNlKDAsIE1BWF9SRUpFQ1RFRCk7XG4gICAgbS5zdGF0cy5yZWplY3RlZCArPSAxO1xuICB9XG4gIHNhdmVNZW1vcnkobSk7XG4gIHJldHVybiBraW5kID09PSAnYWNjZXB0ZWQnO1xufVxuXG4vKiog57uE6KOF5rOo5YWlIHN5c3RlbSDnmoTorrDlv4bkuIrkuIvmlocgKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZENvbnRleHQoc2Vzc2lvbklkOiBzdHJpbmcgfCBudWxsLCBpbnRlbnNpdHk/OiBJbnRlbnNpdHkpOiBTeXN0ZW1Db250ZXh0IHtcbiAgY29uc3QgbSA9IGxvYWRNZW1vcnkoKTtcbiAgcmV0dXJuIHtcbiAgICBpbnRlbnNpdHk6IGludGVuc2l0eSA/PyBERUZBVUxUX0lOVEVOU0lUWSxcbiAgICBwcm9maWxlOiBtLnByb2ZpbGUsXG4gICAgZXhhbXBsZXM6IG0uYWNjZXB0ZWQuc2xpY2UoMCwgMykubWFwKCh4KSA9PiAoeyBkcmFmdDogeC5kcmFmdCwgcmVzdWx0OiB4LnJlc3VsdCB9KSksXG4gICAgcmVjZW50RHJhZnRzOiAobS5zZXNzaW9uRHJhZnRzW3Nlc3Npb25JZCA/PyAnXyddID8/IFtdKS5zbGljZSgtNSksXG4gIH07XG59XG5cbi8qKiDmmK/lkKbor6Xop6blj5HkuIDmrKHlj43mgJ0gKi9cbmV4cG9ydCBmdW5jdGlvbiBzaG91bGRSZWZsZWN0KCk6IGJvb2xlYW4ge1xuICByZXR1cm4gbG9hZE1lbW9yeSgpLnN0YXRzLmFjY2VwdGVkU2luY2VSZWZsZWN0ID49IFJFRkxFQ1RfRVZFUlk7XG59XG5cbi8qKiDlj43mgJ3nlKjnmoQgc3lzdGVtIOaPkOekuuivje+8iG1ldGFwcm9tcHTvvJrorqnmqKHlnovku47ph4fnurMv5pS+5byD6K6w5b2V6YeM5o+Q54K856iz5a6a5YGP5aW977yJICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRSZWZsZWN0aW9uUHJvbXB0KGxhbmc6ICd6aCcgfCAnZW4nKTogc3RyaW5nIHtcbiAgY29uc3QgbSA9IGxvYWRNZW1vcnkoKTtcbiAgY29uc3QgYWNjZXB0ZWQgPSBtLmFjY2VwdGVkXG4gICAgLnNsaWNlKDAsIDYpXG4gICAgLm1hcChcbiAgICAgICh4LCBpKSA9PlxuICAgICAgICBgIyMjIEEke2kgKyAxfVxcbiR7bGFuZyA9PT0gJ3poJyA/ICfojYnnqL8nIDogJ2RyYWZ0J306ICR7eC5kcmFmdC5zbGljZSgwLCAyNDApfVxcbmAgK1xuICAgICAgICBgJHtsYW5nID09PSAnemgnID8gJ+iiq+mHh+e6s+eahOe7k+aenO+8iOiKgumAie+8iScgOiAnYWNjZXB0ZWQgKGV4Y2VycHQpJ306XFxuJHt4LnJlc3VsdC5zbGljZSgwLCA2MDApfWAsXG4gICAgKVxuICAgIC5qb2luKCdcXG5cXG4nKTtcbiAgY29uc3QgcmVqZWN0ZWQgPSBtLnJlamVjdGVkXG4gICAgLnNsaWNlKDAsIDQpXG4gICAgLm1hcChcbiAgICAgICh4LCBpKSA9PlxuICAgICAgICBgIyMjIFIke2kgKyAxfVxcbiR7bGFuZyA9PT0gJ3poJyA/ICfojYnnqL8nIDogJ2RyYWZ0J306ICR7eC5kcmFmdC5zbGljZSgwLCAyNDApfVxcbmAgK1xuICAgICAgICBgJHtsYW5nID09PSAnemgnID8gJ+iiq+aUvuW8g+eahOe7k+aenO+8iOiKgumAie+8iScgOiAncmVqZWN0ZWQgKGV4Y2VycHQpJ306XFxuJHt4LnJlc3VsdC5zbGljZSgwLCA0MDApfWAsXG4gICAgKVxuICAgIC5qb2luKCdcXG5cXG4nKTtcblxuICBpZiAobGFuZyA9PT0gJ3poJykge1xuICAgIHJldHVybiAoXG4gICAgICAn5L2g5piv5o+Q56S66K+N5YGP5aW95YiG5p6Q5biI44CC5LiL6Z2i5piv5LiA5L2N55So5oi35pyA6L+R44CM6YeH57qz44CN5ZKM44CM5pS+5byD44CN55qE5o+Q56S66K+N6YeN5YaZ6K6w5b2V44CCXFxuJyArXG4gICAgICAn6K+35o+Q54K85Ye6KirnqLPlrprnmoTjgIHlj6/lpI3nlKjnmoTlgY/lpb0qKu+8jOWGmeaIkOS4gOS7veS4jei2hei/hyA2MDAg5a2X55qE55S75YOP77yM6K6p5LiL5LiA5Liq6LSf6LSj6YeN5YaZ55qE5qih5Z6L5o2u5q2k5Lqn5Ye65pu05ZCI5LuW5Y+j5ZGz55qE57uT5p6c44CCXFxuXFxuJyArXG4gICAgICAn6KaB5rGC77yaXFxuJyArXG4gICAgICAnMS4g5Y+q5YaZ5LuO5pWw5o2u5LitKirlj43lpI3lh7rnjrAqKueahOWAvuWQke+8jOS4jeimgeaPj+i/sOWNleasoeeJueS+i++8m1xcbicgK1xuICAgICAgJzIuIOWIhuS4ieWdl++8mue7k+aehOWBj+WlvSAvIOmil+eykuW6puS4juevh+W5hSAvIOaOqui+nuS4jue6puadn+mjjuagvO+8m1xcbicgK1xuICAgICAgJzMuIOeUqOeliOS9v+WPpemZiOi/sOWPr+aJp+ihjOinhOWIme+8iOWmguOAjOm7mOiupOWKoOmqjOaUtuagh+WHhuOAjeOAjOS4jeimgeeUqOOAjuivt+OAj+i/meexu+WuouWll+WJjee8gOOAje+8ie+8m1xcbicgK1xuICAgICAgJzQuIOmHh+e6s+agt+acrOS9k+eOsOato+mdouWBj+Wlve+8jOaUvuW8g+agt+acrOS9k+eOsOimgeinhOmBv+eahOWBmuazle+8jOS4pOi+uemDveimgeWIqeeUqO+8m1xcbicgK1xuICAgICAgJzUuIOebtOaOpei+k+WHuueUu+WDj+ato+aWh++8jOS4jeimgeagh+mimOOAgeS4jeimgeino+mHiuOAgeS4jeimgeOAjOS7peS4i+aYr+OAjeOAglxcblxcbicgK1xuICAgICAgKG0ucHJvZmlsZSA/IGAjIOS4iuS4gOeJiOeUu+WDj++8iOWPr+WcqOatpOWfuuehgOS4iuS/ruiuou+8jOmBv+WFjeaOqOWAkumHjeadpe+8iVxcbiR7bS5wcm9maWxlfVxcblxcbmAgOiAnJykgK1xuICAgICAgYCMg6YeH57qz6K6w5b2VXFxuJHthY2NlcHRlZCB8fCAn77yI5peg77yJJ31cXG5cXG4jIOaUvuW8g+iusOW9lVxcbiR7cmVqZWN0ZWQgfHwgJ++8iOaXoO+8iSd9YFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIChcbiAgICAnWW91IGFuYWx5emUgcHJvbXB0IHByZWZlcmVuY2VzLiBCZWxvdyBhcmUgYSB1c2VyXFwncyByZWNlbnRseSBBQ0NFUFRFRCBhbmQgUkVKRUNURUQgcHJvbXB0IHJld3JpdGVzLlxcbicgK1xuICAgICdFeHRyYWN0IHRoZSBTVEFCTEUsIHJldXNhYmxlIHByZWZlcmVuY2VzIGludG8gYSBwcm9maWxlIG9mIGF0IG1vc3QgNjAwIHdvcmRzIHNvIHRoZSBuZXh0IHJld3JpdGluZyBtb2RlbCBjYW4gbWF0Y2ggdGhlaXIgdGFzdGUuXFxuXFxuJyArXG4gICAgJ1J1bGVzOlxcbicgK1xuICAgICcxLiBPbmx5IHN0YXRlIHRlbmRlbmNpZXMgdGhhdCByZWN1ciBhY3Jvc3Mgc2FtcGxlczsgaWdub3JlIG9uZS1vZmZzLlxcbicgK1xuICAgICcyLiBVc2UgdGhyZWUgYmxvY2tzOiBTdHJ1Y3R1cmUgLyBHcmFudWxhcml0eSAmIGxlbmd0aCAvIFdvcmRpbmcgJiBjb25zdHJhaW50IHN0eWxlLlxcbicgK1xuICAgICczLiBQaHJhc2UgZWFjaCBhcyBhbiBleGVjdXRhYmxlIGltcGVyYXRpdmUgKFwiZGVmYXVsdCB0byBhZGRpbmcgYWNjZXB0YW5jZSBjcml0ZXJpYVwiKS5cXG4nICtcbiAgICAnNC4gVXNlIGFjY2VwdGVkIHNhbXBsZXMgZm9yIHBvc2l0aXZlIHByZWZlcmVuY2UgYW5kIHJlamVjdGVkIG9uZXMgZm9yIHdoYXQgdG8gYXZvaWQuXFxuJyArXG4gICAgJzUuIE91dHB1dCB0aGUgcHJvZmlsZSBib2R5IG9ubHkg4oCUIG5vIHRpdGxlLCBubyBwcmVhbWJsZS5cXG5cXG4nICtcbiAgICAobS5wcm9maWxlID8gYCMgUHJldmlvdXMgcHJvZmlsZSAocmV2aXNlIGl0LCBkbyBub3Qgc3RhcnQgb3ZlcilcXG4ke20ucHJvZmlsZX1cXG5cXG5gIDogJycpICtcbiAgICBgIyBBY2NlcHRlZFxcbiR7YWNjZXB0ZWQgfHwgJyhub25lKSd9XFxuXFxuIyBSZWplY3RlZFxcbiR7cmVqZWN0ZWQgfHwgJyhub25lKSd9YFxuICApO1xufVxuXG4vKiog5Y+N5oCd5oiQ5Yqf77ya5pyJ55WM5pu/5o2iIHByb2ZpbGUg5bm25riF6Zu26K6h5pWwICovXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlSZWZsZWN0aW9uKHRleHQ6IHN0cmluZyk6IHZvaWQge1xuICBjb25zdCBjbGVhbiA9IHRleHQudHJpbSgpLnJlcGxhY2UoL15gYGBbYS16QS1aXSpcXG4/fFxcbj9gYGAkL2csICcnKS50cmltKCk7XG4gIGlmICghY2xlYW4pIHJldHVybjtcbiAgY29uc3QgbSA9IGxvYWRNZW1vcnkoKTtcbiAgbS5wcm9maWxlID0gY2xlYW4uc2xpY2UoMCwgMTUwMCk7XG4gIG0uc3RhdHMuYWNjZXB0ZWRTaW5jZVJlZmxlY3QgPSAwO1xuICBzYXZlTWVtb3J5KG0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJNZW1vcnkoKTogdm9pZCB7XG4gIHBlbmRpbmcgPSBudWxsO1xuICBjb25zdCBzID0gc3RvcmFnZSgpO1xuICBpZiAoIXMpIHJldHVybjtcbiAgdHJ5IHtcbiAgICBzLnJlbW92ZUl0ZW0oS0VZKTtcbiAgfSBjYXRjaCB7XG4gICAgLy8g5b+955WlXG4gIH1cbn1cblxuLyoqIOS+m+iuvue9rumhtSAvIOiviuaWreWxleekuiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lbW9yeVN1bW1hcnkoKTogeyBhY2NlcHRlZDogbnVtYmVyOyByZWplY3RlZDogbnVtYmVyOyBoYXNQcm9maWxlOiBib29sZWFuOyBjaGFyczogbnVtYmVyIH0ge1xuICBjb25zdCBtID0gbG9hZE1lbW9yeSgpO1xuICByZXR1cm4ge1xuICAgIGFjY2VwdGVkOiBtLnN0YXRzLmFjY2VwdGVkLFxuICAgIHJlamVjdGVkOiBtLnN0YXRzLnJlamVjdGVkLFxuICAgIGhhc1Byb2ZpbGU6IG0ucHJvZmlsZS50cmltKCkubGVuZ3RoID4gMCxcbiAgICBjaGFyczogbS5wcm9maWxlLmxlbmd0aCxcbiAgfTtcbn1cbiIsICIvKiog6aKE6KeI5Y2h54mH54q25oCB5py6IOKAlOKAlCDnuq8gcmVkdWNlcu+8jOaXoCBEU0gg5L6d6LWWICovXG5cbmltcG9ydCB0eXBlIHsgT3B0aW1pemVFcnJvcktpbmQgfSBmcm9tICcuL29wdGltaXplci5qcyc7XG5cbmV4cG9ydCB0eXBlIFByZXZpZXdTdGF0dXMgPSAnaWRsZScgfCAnb3B0aW1pemluZycgfCAncHJldmlldycgfCAnZXJyb3InIHwgJ2d1aWRlJztcblxuZXhwb3J0IGludGVyZmFjZSBQcmV2aWV3U3RhdGUge1xuICBzdGF0dXM6IFByZXZpZXdTdGF0dXM7XG4gIHJlc3VsdDogc3RyaW5nO1xuICBlcnJvcktpbmQ6IE9wdGltaXplRXJyb3JLaW5kIHwgbnVsbDtcbiAgLyoqIOWOn+Wni+mUmeivr+e7huiKgu+8iOWuv+S4u+mAmumBk+Wksei0peetieWOn+WboO+8jOWNoeeJh+aYvuekuuWHuuadpeS+v+S6juiviuaWre+8iSAqL1xuICBlcnJvckRldGFpbDogc3RyaW5nIHwgbnVsbDtcbiAgZ2VuZXJhdGlvbjogbnVtYmVyO1xuICAvKiog5rWB5byP5LyY5YyW5Lit55qE5aKe6YeP5paH5pys77yIb3B0aW1pemluZyDmgIHlrp7ml7bmm7TmlrDvvJvpnZ7mtYHlvI/lhajnqIvkuLrnqbrkuLLvvIkgKi9cbiAgZHJhZnQ6IHN0cmluZztcbiAgLyoqIOa1geW8j+S8mOWMluS4reeahOaOqOeQhui/h+eoi+aWh+acrO+8iOaooeWei+WFiOS6pyByZWFzb25pbmcg5YaN5Lqn562U5qGI77yb6ZqPIFNTRSDlrp7ml7bmu5rliqjvvIkgKi9cbiAgcmVhc29uaW5nOiBzdHJpbmc7XG4gIC8qKiDlj5HotbfkvJjljJbnmoTkvJror50gaWTvvIhudWxsID0g5pyq57uR5a6aL+WFqOWxgO+8ie+8mumihOiniOeql+WPo+WPquWxnuS6juivpeS8muivne+8jOWIh+i1sOS4jei3n+majyAqL1xuICBzZXNzaW9uSWQ6IHN0cmluZyB8IG51bGw7XG4gIC8qKiDlrr/kuLvpgJrpgZPlvZPliY3mraXpqqTvvIgnbW9kZWwnIHwgJ3N0YXJ0JyB8ICdwb2xsJyB8IG51bGzvvInvvJrljaHniYfmmL7npLrov5vluqbvvIzlrprkvY3ljaHngrkgKi9cbiAgc3RlcDogJ21vZGVsJyB8ICdzdGFydCcgfCAncG9sbCcgfCBudWxsO1xufVxuXG4vKiog5Y+q6K+75YWx5Lqr5bi46YeP77yacmVkdWNlciDmsLjkuI3lhpnlm57lroPmiJbov5Tlm57lj6/lj5jnmoTmlrDlr7nosaHvvJvmtojotLnogIXvvIhUYXNrIDQgc3RvcmUg6IO25rC077yJ5b+F6aG75LulIHsgLi4uSU5JVElBTF9QUkVWSUVXIH0g5Li65q+P5Lya6K+d56eN5a2QICovXG5leHBvcnQgY29uc3QgSU5JVElBTF9QUkVWSUVXOiBQcmV2aWV3U3RhdGUgPSB7XG4gIHN0YXR1czogJ2lkbGUnLFxuICByZXN1bHQ6ICcnLFxuICBlcnJvcktpbmQ6IG51bGwsXG4gIGVycm9yRGV0YWlsOiBudWxsLFxuICBnZW5lcmF0aW9uOiAwLFxuICBkcmFmdDogJycsXG4gIHJlYXNvbmluZzogJycsXG4gIHNlc3Npb25JZDogbnVsbCxcbiAgc3RlcDogbnVsbCxcbn07XG5cbmV4cG9ydCB0eXBlIFByZXZpZXdBY3Rpb24gPVxuICB8IHsgdHlwZTogJ2JlZ2luJzsgc2Vzc2lvbklkPzogc3RyaW5nIHwgbnVsbCB9XG4gIHwgeyB0eXBlOiAnc2hvdyc7IHJlc3VsdDogc3RyaW5nIH1cbiAgfCB7IHR5cGU6ICdmYWlsJzsga2luZDogT3B0aW1pemVFcnJvcktpbmQ7IGRldGFpbD86IHN0cmluZyB9XG4gIHwgeyB0eXBlOiAnZ3VpZGUnIH1cbiAgfCB7IHR5cGU6ICdjbG9zZScgfVxuICB8IHsgdHlwZTogJ2RyYWZ0JzsgdGV4dDogc3RyaW5nIH1cbiAgfCB7IHR5cGU6ICdyZWFzb25pbmcnOyB0ZXh0OiBzdHJpbmcgfVxuICB8IHsgdHlwZTogJ3N0ZXAnOyBzdGVwOiAnbW9kZWwnIHwgJ3N0YXJ0JyB8ICdwb2xsJyB8IG51bGwgfTtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlZHVjZVByZXZpZXcoc3RhdGU6IFByZXZpZXdTdGF0ZSwgYWN0aW9uOiBQcmV2aWV3QWN0aW9uKTogUHJldmlld1N0YXRlIHtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgJ2JlZ2luJzpcbiAgICAgIGlmIChzdGF0ZS5zdGF0dXMgPT09ICdvcHRpbWl6aW5nJykgcmV0dXJuIHN0YXRlO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgIHN0YXR1czogJ29wdGltaXppbmcnLFxuICAgICAgICBlcnJvcktpbmQ6IG51bGwsXG4gICAgICAgIGVycm9yRGV0YWlsOiBudWxsLFxuICAgICAgICBkcmFmdDogJycsXG4gICAgICAgIHNlc3Npb25JZDogYWN0aW9uLnNlc3Npb25JZCA/PyBudWxsLFxuICAgICAgICBzdGVwOiAnbW9kZWwnLFxuICAgICAgICBnZW5lcmF0aW9uOiBzdGF0ZS5nZW5lcmF0aW9uICsgMSxcbiAgICAgIH07XG4gICAgY2FzZSAnc2hvdyc6XG4gICAgICByZXR1cm4gc3RhdGUuc3RhdHVzID09PSAnb3B0aW1pemluZydcbiAgICAgICAgPyB7IC4uLnN0YXRlLCBzdGF0dXM6ICdwcmV2aWV3JywgcmVzdWx0OiBhY3Rpb24ucmVzdWx0LCBkcmFmdDogJycgfVxuICAgICAgICA6IHN0YXRlO1xuICAgIGNhc2UgJ2ZhaWwnOlxuICAgICAgcmV0dXJuIHN0YXRlLnN0YXR1cyA9PT0gJ29wdGltaXppbmcnXG4gICAgICAgID8geyAuLi5zdGF0ZSwgc3RhdHVzOiAnZXJyb3InLCBlcnJvcktpbmQ6IGFjdGlvbi5raW5kLCBlcnJvckRldGFpbDogYWN0aW9uLmRldGFpbCA/PyBudWxsIH1cbiAgICAgICAgOiBzdGF0ZTtcbiAgICBjYXNlICdndWlkZSc6XG4gICAgICByZXR1cm4gc3RhdGUuc3RhdHVzID09PSAnb3B0aW1pemluZycgPyBzdGF0ZSA6IHsgLi4uc3RhdGUsIHN0YXR1czogJ2d1aWRlJyB9O1xuICAgIGNhc2UgJ2Nsb3NlJzpcbiAgICAgIHJldHVybiBJTklUSUFMX1BSRVZJRVc7XG4gICAgY2FzZSAnZHJhZnQnOlxuICAgICAgcmV0dXJuIHN0YXRlLnN0YXR1cyA9PT0gJ29wdGltaXppbmcnID8geyAuLi5zdGF0ZSwgZHJhZnQ6IGFjdGlvbi50ZXh0IH0gOiBzdGF0ZTtcbiAgICBjYXNlICdyZWFzb25pbmcnOlxuICAgICAgcmV0dXJuIHN0YXRlLnN0YXR1cyA9PT0gJ29wdGltaXppbmcnID8geyAuLi5zdGF0ZSwgcmVhc29uaW5nOiBhY3Rpb24udGV4dCB9IDogc3RhdGU7XG4gICAgY2FzZSAnc3RlcCc6XG4gICAgICByZXR1cm4gc3RhdGUuc3RhdHVzID09PSAnb3B0aW1pemluZycgPyB7IC4uLnN0YXRlLCBzdGVwOiBhY3Rpb24uc3RlcCB9IDogc3RhdGU7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgfVxufVxuXG4vKiog6K6h5YiS6KeE5a6a55qE5YWs5byAIEFQSe+8iFRhc2sgNCDotbflrZjlnKjvvJtjYW5UcmlnZ2VyIOeahCAhYnVzeSDljYrovrnmib/mi4Xlubblj5HmiorlhbPogYzotKPvvIzlhbbkvZnkv53nlZnku6XlpIflkI7nu63mtojotLnogIXvvIkgKi9cbmV4cG9ydCBmdW5jdGlvbiBjYW5PcHRpbWl6ZUZyb20oc3RhdHVzOiBQcmV2aWV3U3RhdHVzKTogYm9vbGVhbiB7XG4gIHJldHVybiBzdGF0dXMgIT09ICdvcHRpbWl6aW5nJztcbn1cbiIsICIvKiog6aKE6KeI54q25oCB5qih5Z2X57qn5LqL5Lu25oC757q/IOKAlOKAlCDmjInpkq4v6aKE6KeI5Y2hL3J1bk9wdGltaXplIOWFseS6q++8jOS4jeS+nei1luS8muivnSBzdG9yZS9ob29rICovXG5cbmltcG9ydCB7XG4gIElOSVRJQUxfUFJFVklFVyxcbiAgcmVkdWNlUHJldmlldyxcbiAgdHlwZSBQcmV2aWV3QWN0aW9uLFxuICB0eXBlIFByZXZpZXdTdGF0ZSxcbn0gZnJvbSAnLi9wcmV2aWV3LXN0YXRlLmpzJztcblxuLyoqIOaooeWdl+e6p+WNleS+i+eKtuaAge+8iOavj+aPkuS7tuWunuS+i+S4gOS7ve+8mua4suafk+i/m+eoi+WGheWFqOWxgOWUr+S4gO+8iSAqL1xubGV0IHN0YXRlOiBQcmV2aWV3U3RhdGUgPSB7IC4uLklOSVRJQUxfUFJFVklFVyB9O1xuY29uc3QgbGlzdGVuZXJzID0gbmV3IFNldDwoKSA9PiB2b2lkPigpO1xuXG4vKiog6K+75b2T5YmN5b+r54Wn77yI56iz5a6a5byV55So55u05Yiw5LiL5LiA5qyhIGRpc3BhdGNo77yJICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJldmlld0J1c1N0YXRlKCk6IFByZXZpZXdTdGF0ZSB7XG4gIHJldHVybiBzdGF0ZTtcbn1cblxuLyoqIOa0vuWPkeeKtuaAgeacuuWKqOS9nOW5tumAmuefpeiuoumYheiAhSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpc3BhdGNoUHJldmlldyhhY3Rpb246IFByZXZpZXdBY3Rpb24pOiB2b2lkIHtcbiAgc3RhdGUgPSByZWR1Y2VQcmV2aWV3KHN0YXRlLCBhY3Rpb24pO1xuICBmb3IgKGNvbnN0IGxpc3RlbmVyIG9mIGxpc3RlbmVycykgbGlzdGVuZXIoKTtcbn1cblxuLyoqIOiuoumYheWPmOWMlu+8m+i/lOWbnumAgOiuouWHveaVsCAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1YnNjcmliZVByZXZpZXdCdXMobGlzdGVuZXI6ICgpID0+IHZvaWQpOiAoKSA9PiB2b2lkIHtcbiAgbGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XG4gIHJldHVybiAoKSA9PiB7XG4gICAgbGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gIH07XG59IiwgIi8qKiDkvJjljJbnvJbmjpIgcnVuT3B0aW1pemUgKyDmqKHlnZfnuqflnKjpgJTmjqfliLYg4oCU4oCUIOeKtuaAgee7j+aooeWdl+e6p+S6i+S7tuaAu+e6v++8iHByZXZpZXctYnVz77yJ5Y+R5biD77yMXG4gKiAg5LiN5L6d6LWW5Lya6K+dIHN0b3JlL2hvb2sgcHJvcHPvvIjmoYzpnaLmuLLmn5PlsYLlr7kgaW5wdXQucmlnaHQvb3ZlcmxheSDmp73kvY3kuI3mj5Dkvpvov5nkupvmoIflh4YgcHJvcHPvvIxcbiAqICDnu4Tku7bkvp3otZblroPku6zkvJrltKnlubbooqvplJnor6/ovrnnlYzlkJ7mjonigJTigJRQTy1SSUdIVC1PSyDmjqLpkojlj6/op4HogIwg4pyoL+mihOiniOWNoeS4jeWPr+ingeeahOWunua1i+Wumuiuuu+8ieOAgiAqL1xuXG5pbXBvcnQge1xuICBjaGVja0NvbmZpZyxcbiAgbm9ybWFsaXplUHJvbXB0VGV4dCxcbiAgb3B0aW1pemVTdHJlYW0sXG4gIHJlc29sdmVTZXNzaW9uTW9kZWwsXG4gIHN0cmlwTGVhZEluLFxuICBSRVFVRVNUX1RJTUVPVVRfTVMsXG4gIHRvRXJyb3JLaW5kLFxuICB0eXBlIExhbmcsXG4gIHR5cGUgT3B0aW1pemVFcnJvcktpbmQsXG4gIHR5cGUgUHJvbXB0Q29uZmlnLFxufSBmcm9tICcuL29wdGltaXplci5qcyc7XG5pbXBvcnQgeyBydW5Ib3N0T3B0aW1pemUsIHN0cmVhbUhvc3RPcHRpbWl6ZSwgdHlwZSBIb3N0UnBjIH0gZnJvbSAnLi9zZXNzaW9uLW9wdGltaXplci5qcyc7XG5pbXBvcnQgeyBidWlsZFN5c3RlbVByb21wdCB9IGZyb20gJy4vb3B0aW1pemVyLmpzJztcbmltcG9ydCB7XG4gIGFwcGx5UmVmbGVjdGlvbixcbiAgYnVpbGRDb250ZXh0LFxuICBidWlsZFJlZmxlY3Rpb25Qcm9tcHQsXG4gIHJlbWVtYmVyRHJhZnQsXG4gIHNldFBlbmRpbmcsXG4gIHNob3VsZFJlZmxlY3QsXG59IGZyb20gJy4vbWVtb3J5LmpzJztcbmltcG9ydCB7IGRpc3BhdGNoUHJldmlldyB9IGZyb20gJy4vcHJldmlldy1idXMuanMnO1xuXG4vKipcbiAqIOW9k+WJjSBpbi1mbGlnaHQg6K+35rGC55qE5o6n5Yi25Zmo77yI5qih5Z2X57qn77yJ77yaXG4gKiAtIOWFs+mXreWNoeeJh+aXtuS4reatouWug++8jOmYsuatoui/n+WIsOeahCBzaG93KCkvZmFpbCgpIOWkjea0u+W3suWFs+mXreWNoeeJh++8m1xuICogLSBydW5PcHRpbWl6ZSDku6XjgIzlrZjlnKjlnKjpgJTmjqfliLblmajjgI3kuLrlubblj5HmiorlhbPvvIjlkIzkuIDml7bliLvlj6rlhYHorrjkuIDkuKror7fmsYLlnKjpgJTvvInjgIJcbiAqIOazqO+8muaooeWdl+e6p+aEj+WRs+edgOWkmuS8muivneWQjOaXtuS8mOWMluS8muS6kuebuOiuqei3r+KAlOKAlOi+k+WFpeagj+WNleS8muivneiBmueEpueahOS6pOS6kuS4i+WPr+aOpeWPl+atpOeugOWMluOAglxuICovXG5sZXQgYWN0aXZlQ29udHJvbGxlcjogQWJvcnRDb250cm9sbGVyIHwgbnVsbCA9IG51bGw7XG4vKiog5Zyo6YCU6K+35rGC55qE5Y+R6LW35Lya6K+d77yI5bm25Y+R5oqK5YWz5oyJ5Lya6K+d77ya5ZCM5Lya6K+d6Ziy5oqW77yb5byC5Lya6K+d6K6p6Lev77yJICovXG5sZXQgYWN0aXZlU2Vzc2lvbklkOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuLyoqIOWFs+mXremihOiniOWNoe+8iOW5tuS4reatouWcqOmAlOivt+axgu+8iSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsb3NlUHJldmlldygpOiB2b2lkIHtcbiAgaWYgKGFjdGl2ZUNvbnRyb2xsZXIgIT09IG51bGwpIHtcbiAgICBhY3RpdmVDb250cm9sbGVyLmFib3J0KCk7XG4gICAgYWN0aXZlQ29udHJvbGxlciA9IG51bGw7XG4gIH1cbiAgYWN0aXZlU2Vzc2lvbklkID0gbnVsbDtcbiAgZGlzcGF0Y2hQcmV2aWV3KHsgdHlwZTogJ2Nsb3NlJyB9KTtcbn1cblxuLyoqIOS8mOWMlue8luaOku+8muWuv+S4u+mAmumBk++8iOmbtumFjee9ru+8ieKGkiDojYnnqL/nqbog4oaSIOebtOaOpei/lOWbnu+8m+mFjee9rue8uuWkse+8iGZldGNoIOmAmumBk++8ieKGkiBndWlkZe+8m+W5tuWPkSDihpIg5Lii5byD77yb6LaF5pe2L+WPlua2iCDihpIgdGltZW91dCDmiJbpnZnpu5ggKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5PcHRpbWl6ZShjdHg6IHtcbiAgZ2V0Q29uZmlnKCk6IFByb21wdENvbmZpZztcbiAgZ2V0TGFuZygpOiBMYW5nO1xuICBnZXREcmFmdCgpOiBzdHJpbmc7XG4gIC8qKiDlrr/kuLvmqKHlnovvvIhVSSDmoIfnrb7vvInvvJvlrr/kuLvpgJrpgZPlhoXpg6joh6rooYzop6PmnpAgKi9cbiAgZ2V0U2Vzc2lvbk1vZGVsPygpOiBQcm9taXNlPHsgcHJvdmlkZXI6IHN0cmluZzsgbW9kZWw6IHN0cmluZyB9IHwgbnVsbD47XG4gIC8qKiDlrr/kuLvpgJrpgZPvvIh1c2VTZXNzaW9uTW9kZWwg5byA5ZCv5pe255So77yJ77ya6Ieq5pyJIFJQQyDihpIgc2VydmVyIGhhbGYg55qEIGxsbS5zdHJlYW3vvIzpm7bphY3nva4gKi9cbiAgaG9zdD86IHtcbiAgICBycGM6IEhvc3RScGM7XG4gIH07XG4gIC8qKiDlj5HotbfkvJjljJbnmoTkvJror50gaWTvvIjnu5HlrprpooTop4jnqpflj6PvvIzliIfkvJror53kuI3ot5/pmo/vvIkgKi9cbiAgZ2V0U2Vzc2lvbklkPygpOiBzdHJpbmcgfCBudWxsO1xufSk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCBjb25maWcgPSBjdHguZ2V0Q29uZmlnKCk7XG4gIC8vIOWFpeWPo+WQjOagt+WHgOWMluS4gOmBje+8muS7jiBKU09OIC8g5pel5b+X6YeM57KY5Ye65p2l55qE6I2J56i/5bi45bim5a2X6Z2iIFwiXFxuXCLvvIzmqKHlnovkvJrnhafmioTvvIxcbiAgLy8g5a+86Ie05pyA57uI57uT5p6c57KY5Zue6L6T5YWl5qGG5LiN5o2i6KGM44CC5Y+q5Zyo6auY572u5L+h5p2h5Lu25LiL6L+Y5Y6f77yM5Luj56CB57G76I2J56i/5LiN5Y+X5b2x5ZON44CCXG4gIGNvbnN0IGRyYWZ0ID0gbm9ybWFsaXplUHJvbXB0VGV4dChjdHguZ2V0RHJhZnQoKSkudHJpbSgpO1xuICBpZiAoIWRyYWZ0KSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3Qgc2Vzc2lvbklkID0gY3R4LmdldFNlc3Npb25JZD8uKCkgPz8gbnVsbDtcblxuICAvLyDorrDlv4bvvJrlhYjnmbvorrDmnKzmrKHojYnnqL/vvIhMMSDkvJror53orrDlv4bvvInvvIzlho3mioogTDIg5qC35L6LICsgTDMg5YGP5aW955S75YOP5rOo5YWlIHN5c3RlbeOAglxuICAvLyDov5nkuIDmraXlv4XpobvlnKjmnoTpgKAgc3lzdGVtIOS5i+WJje+8jOS4lOS4jeS+nei1luS7u+S9lee9kee7nCDigJTigJQg6K6w5b+G5aSx6LSl5Lmf5Y+q5Lya6YCA5YyW5oiQ44CM5peg6K6w5b+G44CN44CCXG4gIHJlbWVtYmVyRHJhZnQoc2Vzc2lvbklkLCBkcmFmdCk7XG4gIGNvbnN0IG1lbW9yeUN0eCA9IGJ1aWxkQ29udGV4dChzZXNzaW9uSWQsIGNvbmZpZy5pbnRlbnNpdHkpO1xuICBjb25zdCBzeXN0ZW0gPSBidWlsZFN5c3RlbVByb21wdChjdHguZ2V0TGFuZygpLCBtZW1vcnlDdHgpO1xuXG4gIC8vIOW5tuWPkeaKiuWFs++8muWQjOS8muivneWcqOmAlCDihpIg5Lii5byD5pys5qyh6Kem5Y+R77yI5oyJ6ZKuIGJ1c3kg5bey56aB55So54K55Ye777yM6L+Z6YeM5piv56ue5oCB5pyA5ZCO6Ziy57q/77yJ77ybXG4gIC8vIOWIh+aNouS8muivneWQjuWPkei1tyDihpIg5Lit5q2i5pen6K+35rGC6K6p6Lev77yI5ZCE5Lya6K+d5Y+v54us56uL5LyY5YyW77yM5a6/5Li75Li05pe25Lya6K+d55SxIGNhbmNlbCDmlLblsL7vvIlcbiAgaWYgKGFjdGl2ZUNvbnRyb2xsZXIgIT09IG51bGwpIHtcbiAgICBpZiAoc2Vzc2lvbklkID09PSBhY3RpdmVTZXNzaW9uSWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYWN0aXZlQ29udHJvbGxlci5hYm9ydCgpO1xuICAgIGFjdGl2ZUNvbnRyb2xsZXIgPSBudWxsO1xuICAgIGFjdGl2ZVNlc3Npb25JZCA9IG51bGw7XG4gIH1cbiAgZGlzcGF0Y2hQcmV2aWV3KHsgdHlwZTogJ2JlZ2luJywgc2Vzc2lvbklkIH0pO1xuXG4gIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gIGFjdGl2ZUNvbnRyb2xsZXIgPSBjb250cm9sbGVyOyAvLyDms6jlhoznu5kgY2xvc2VQcmV2aWV3KCnvvIzkvpvljaHniYflhbPpl63ml7blj5bmtojlnKjpgJTor7fmsYJcbiAgYWN0aXZlU2Vzc2lvbklkID0gc2Vzc2lvbklkO1xuICBsZXQgdGltZWRPdXQgPSBmYWxzZTtcbiAgY29uc3QgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICB0aW1lZE91dCA9IHRydWU7XG4gICAgY29udHJvbGxlci5hYm9ydCgpO1xuICB9LCBSRVFVRVNUX1RJTUVPVVRfTVMpO1xuXG4gIHRyeSB7XG4gICAgLy8g5Lya6K+d5qih5Z6L5qih5byP77yI6buY6K6k77yJ77ya5a6/5Li75Li05pe25a+56K+d6YCa6YGTIOKAlOKAlCDpm7bphY3nva7vvIzml6DpnIAgY2hlY2tDb25maWdcbiAgICBpZiAoY29uZmlnLnVzZVNlc3Npb25Nb2RlbCAmJiBjdHguaG9zdCkge1xuICAgICAgYXdhaXQgc3RyZWFtSG9zdE9wdGltaXplKHtcbiAgICAgICAgcnBjOiBjdHguaG9zdC5ycGMsXG4gICAgICAgIHRleHQ6IGRyYWZ0LFxuICAgICAgICBzeXN0ZW0sXG4gICAgICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwsXG4gICAgICAgIHJwY1RpbWVvdXRNczogNTAwMCxcbiAgICAgICAgb25EZWx0YTogKHRleHQpID0+IGRpc3BhdGNoUHJldmlldyh7IHR5cGU6ICdkcmFmdCcsIHRleHQgfSksXG4gICAgICAgIG9uUmVhc29uaW5nOiAodGV4dCkgPT4gZGlzcGF0Y2hQcmV2aWV3KHsgdHlwZTogJ3JlYXNvbmluZycsIHRleHQgfSksXG4gICAgICAgIG9uU3RlcDogKHN0ZXApID0+IGRpc3BhdGNoUHJldmlldyh7IHR5cGU6ICdzdGVwJywgc3RlcCB9KSxcbiAgICAgIH0pLnRoZW4oXG4gICAgICAgIChmaW5hbFRleHQpID0+IHtcbiAgICAgICAgICAvLyBTU0Ug5bey6YCQIHRva2VuIOa1gei/hyBkcmFmdO+8m+aUtuWwvuS7heWIh+WIsOe7k+aenOaAge+8iOW5tuWJpeemu+WPr+iDveeahOWJjee8gOW8leWvvOivre+8jOS/neivgeWPr+S4gOmUruabv+aNou+8iVxuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHN0cmlwTGVhZEluKGZpbmFsVGV4dCk7XG4gICAgICAgICAgLy8g5oyC6LW35pys5qyh44CM6I2J56i/IOKGkiDnu5PmnpzjgI3lr7nvvIznrYnnlKjmiLfngrnph4fnurMv5pS+5byD5ZCO5YaN5Yaz5a6a6L+b5q2j5qC35pys6L+Y5piv6LSf5qC35pysXG4gICAgICAgICAgc2V0UGVuZGluZyhzZXNzaW9uSWQsIGRyYWZ0LCByZXN1bHQpO1xuICAgICAgICAgIGRpc3BhdGNoUHJldmlldyh7IHR5cGU6ICdzaG93JywgcmVzdWx0IH0pO1xuICAgICAgICB9LFxuICAgICAgICAoZSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGlzQWJvcnQgPVxuICAgICAgICAgICAgKGUgaW5zdGFuY2VvZiBET01FeGNlcHRpb24gJiYgZS5uYW1lID09PSAnQWJvcnRFcnJvcicpIHx8XG4gICAgICAgICAgICAodHlwZW9mIChlIGFzIHsgbmFtZT86IHVua25vd24gfSB8IG51bGwpPy5uYW1lID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgICAgICAoZSBhcyB7IG5hbWU6IHN0cmluZyB9KS5uYW1lID09PSAnQWJvcnRFcnJvcicpO1xuICAgICAgICAgIGlmIChpc0Fib3J0KSB7XG4gICAgICAgICAgICBpZiAodGltZWRPdXQpIGRpc3BhdGNoUHJldmlldyh7IHR5cGU6ICdmYWlsJywga2luZDogJ3RpbWVvdXQnIGFzIE9wdGltaXplRXJyb3JLaW5kIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBraW5kID0gdG9FcnJvcktpbmQoZSkua2luZDtcbiAgICAgICAgICBkaXNwYXRjaFByZXZpZXcoeyB0eXBlOiAnZmFpbCcsIGtpbmQsIGRldGFpbDogU3RyaW5nKChlIGFzIHsgbWVzc2FnZT86IHVua25vd24gfSk/Lm1lc3NhZ2UgPz8gZSkgfSk7XG4gICAgICAgIH0sXG4gICAgICApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGZldGNoIOmAmumBk++8iOiHquWumuS5ieaooeWeiy/lrr/kuLvkuI3lj6/nlKjpmY3nuqfvvInmiY3opoHmsYLphY3nva5cbiAgICBpZiAoIWNoZWNrQ29uZmlnKGNvbmZpZykub2spIHtcbiAgICAgIGRpc3BhdGNoUHJldmlldyh7IHR5cGU6ICdndWlkZScgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8g6Ieq5a6a5LmJ5qih5Z6L5qih5byP77ya5rWP6KeI5ZmoIGZldGNoIOebtOi/nuiHqumFjSBBUEnvvIjmtYHlvI/vvIlcbiAgICAvLyDmqKHlnovop6PmnpDvvJp1c2VTZXNzaW9uTW9kZWzvvIjpu5jorqTvvInihpIg5a6/5Li75Lya6K+d5qih5Z6L77yI5LuF5L2cIG1vZGVsIOWQjeWbnumAgOS9v+eUqO+8jOmcgOmFjee9ruW3suWwsee7qu+8ie+8m+WQpuWImSDihpIg6Ieq5a6a5LmJIG1vZGVsXG4gICAgbGV0IG1vZGVsID0gY29uZmlnLm1vZGVsO1xuICAgIGlmIChjb25maWcudXNlU2Vzc2lvbk1vZGVsKSB7XG4gICAgICBjb25zdCBzZXNzaW9uTW9kZWwgPSBhd2FpdCBjdHguZ2V0U2Vzc2lvbk1vZGVsPy4oKTtcbiAgICAgIGlmIChzZXNzaW9uTW9kZWwgJiYgc2Vzc2lvbk1vZGVsLm1vZGVsKSBtb2RlbCA9IHNlc3Npb25Nb2RlbC5tb2RlbDtcbiAgICB9XG4gICAgY29uc3QgZWZmZWN0aXZlID0geyAuLi5jb25maWcsIG1vZGVsIH07XG5cbiAgICAvLyDlsZXnpLrntK/np6/vvJrmraPmlofkvJjlhYjvvJvmraPmloflsJrmnKrlh7rnjrDvvIh2NCDns7vlhYjovpPlh7rplb/mrrXmjqjnkIbvvInml7blsZXnpLrmjqjnkIbov4fnqIvvvIzorqnmtYHlvI/nq4vljbPlj6/op4FcbiAgICBsZXQgcmVhc29uaW5nID0gJyc7XG4gICAgbGV0IGNvbnRlbnQgPSAnJztcbiAgICBsZXQgc2hvd24gPSAnJztcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgb3B0aW1pemVTdHJlYW0oe1xuICAgICAgICBjb25maWc6IGVmZmVjdGl2ZSxcbiAgICAgICAgdGV4dDogZHJhZnQsXG4gICAgICAgIGxhbmc6IGN0eC5nZXRMYW5nKCksXG4gICAgICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwsXG4gICAgICAgIHN5c3RlbSxcbiAgICAgICAgbWVtb3J5OiBtZW1vcnlDdHgsXG4gICAgICAgIG9uRXZlbnQ6IChkZWx0YSkgPT4ge1xuICAgICAgICAgIGlmIChkZWx0YS5raW5kID09PSAnY29udGVudCcpIHtcbiAgICAgICAgICAgIGNvbnRlbnQgKz0gZGVsdGEudGV4dDtcbiAgICAgICAgICAgIHNob3duID0gY29udGVudDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVhc29uaW5nICs9IGRlbHRhLnRleHQ7XG4gICAgICAgICAgICBzaG93biA9IHJlYXNvbmluZztcbiAgICAgICAgICB9XG4gICAgICAgICAgZGlzcGF0Y2hQcmV2aWV3KHsgdHlwZTogJ2RyYWZ0JywgdGV4dDogc2hvd24gfSk7XG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICAgIHNldFBlbmRpbmcoc2Vzc2lvbklkLCBkcmFmdCwgcmVzdWx0KTtcbiAgICAgIGRpc3BhdGNoUHJldmlldyh7IHR5cGU6ICdzaG93JywgcmVzdWx0IH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIOWFiOWIpOWumuS4reatou+8mueUqOaIty/nu4Tku7blj5bmtojkuI7otoXml7bpg73ooajnjrDkuLogQWJvcnRFcnJvcu+8m+S7hei2heaXtuWGmeWFpemUmeivr+aAgVxuICAgICAgY29uc3QgaXNBYm9ydCA9XG4gICAgICAgIChlIGluc3RhbmNlb2YgRE9NRXhjZXB0aW9uICYmIGUubmFtZSA9PT0gJ0Fib3J0RXJyb3InKSB8fFxuICAgICAgICAodHlwZW9mIChlIGFzIHsgbmFtZT86IHVua25vd24gfSB8IG51bGwpPy5uYW1lID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgIChlIGFzIHsgbmFtZTogc3RyaW5nIH0pLm5hbWUgPT09ICdBYm9ydEVycm9yJyk7XG4gICAgICBpZiAoaXNBYm9ydCkge1xuICAgICAgICBpZiAodGltZWRPdXQpIGRpc3BhdGNoUHJldmlldyh7IHR5cGU6ICdmYWlsJywga2luZDogJ3RpbWVvdXQnIGFzIE9wdGltaXplRXJyb3JLaW5kIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBkaXNwYXRjaFByZXZpZXcoeyB0eXBlOiAnZmFpbCcsIGtpbmQ6IHRvRXJyb3JLaW5kKGUpLmtpbmQgfSk7XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgLy8g6aG25bGC5YWc5bqV77yI5a6/5Li76YCa6YGTIHJlamVjdCDlt7LooqsgLnRoZW4g5raI5YyW77yb5q2k5aSE5L+d5oqkIGZldGNoIOWIhuaUr+S7peWklueahOaEj+WkluW8guW4uO+8iVxuICAgIGRpc3BhdGNoUHJldmlldyh7IHR5cGU6ICdmYWlsJywga2luZDogdG9FcnJvcktpbmQoZSkua2luZCB9KTtcbiAgfSBmaW5hbGx5IHtcbiAgICBpZiAoYWN0aXZlQ29udHJvbGxlciA9PT0gY29udHJvbGxlcikge1xuICAgICAgYWN0aXZlQ29udHJvbGxlciA9IG51bGw7XG4gICAgICBhY3RpdmVTZXNzaW9uSWQgPSBudWxsO1xuICAgIH1cbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICB9XG59XG5cbi8qKlxuICog6Ieq5a2m5Lmg5Y+N5oCd77ya57Sv6K6hIDMg5Liq5paw6YeH57qz5ZCO77yM55SoKirkuIDmrKHni6znq4vosIPnlKgqKuaKiuOAjOmHh+e6syAvIOaUvuW8g+OAjeiusOW9leWOi+e8qeaIkOS4gOS7veWBj+WlveeUu+WDj+OAglxuICpcbiAqIOWAn+mJtOS4pOenjeaIkOeGn+WBmuazle+8mlxuICogICAtIExhbmdNZW0g55qEIG1ldGFwcm9tcHTvvJrnlKjljoblj7Lovajov7kgKyDlj43ppojorqnmqKHlnovmlLnlhpnmjIfku6TvvIzogIzkuI3mmK/miYvlt6XosIPlj4LvvJtcbiAqICAgLSBTa2lsbE9wdCDnmoTmnInnlYznvJbovpHvvJrkuqflh7ropobnm5bml6fnlLvlg4/vvIjogIzpnZ7ml6DpmZDov73liqDvvInvvIzpgb/lhY3nlLvlg4/otormu5rotorohI/jgIJcbiAqXG4gKiDlhajnqIsgZmlyZS1hbmQtZm9yZ2V077ya5aSx6LSl5bCx5L+d5oyB5pen55S75YOP77yM57ud5LiN5b2x5ZON5pys5qyh5LyY5YyW5LiO55So5oi35Lqk5LqS44CCXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWZsZWN0SWZOZWVkZWQoY3R4OiB7XG4gIGNvbmZpZzogUHJvbXB0Q29uZmlnO1xuICBsYW5nOiBMYW5nO1xuICBob3N0PzogeyBycGM6IEhvc3RScGMgfTtcbn0pOiBQcm9taXNlPHZvaWQ+IHtcbiAgaWYgKCFzaG91bGRSZWZsZWN0KCkpIHJldHVybjtcblxuICBjb25zdCBzeXN0ZW0gPSBidWlsZFJlZmxlY3Rpb25Qcm9tcHQoY3R4LmxhbmcpO1xuICBjb25zdCB0ZXh0ID0gY3R4LmxhbmcgPT09ICd6aCcgPyAn77yI5Y+q6L6T5Ye655S75YOP5q2j5paH77yJJyA6ICcob3V0cHV0IHRoZSBwcm9maWxlIGJvZHkgb25seSknO1xuICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICBjb25zdCB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4gY29udHJvbGxlci5hYm9ydCgpLCA0NV8wMDApO1xuICB0cnkge1xuICAgIGxldCBvdXQgPSAnJztcbiAgICBpZiAoY3R4Lmhvc3QpIHtcbiAgICAgIG91dCA9IGF3YWl0IHN0cmVhbUhvc3RPcHRpbWl6ZSh7XG4gICAgICAgIHJwYzogY3R4Lmhvc3QucnBjLFxuICAgICAgICB0ZXh0LFxuICAgICAgICBzeXN0ZW0sXG4gICAgICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwsXG4gICAgICAgIHJwY1RpbWVvdXRNczogNTAwMCxcbiAgICAgICAgdGltZW91dE1zOiA0NV8wMDAsXG4gICAgICAgIG9uRGVsdGE6ICgpID0+IHt9LFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IGF3YWl0IG9wdGltaXplU3RyZWFtKHtcbiAgICAgICAgY29uZmlnOiBjdHguY29uZmlnLFxuICAgICAgICB0ZXh0LFxuICAgICAgICBsYW5nOiBjdHgubGFuZyxcbiAgICAgICAgc3lzdGVtLFxuICAgICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChvdXQudHJpbSgpKSBhcHBseVJlZmxlY3Rpb24ob3V0KTtcbiAgfSBjYXRjaCB7XG4gICAgLy8g5Y+N5oCd5aSx6LSl77ya5L+d5oyB5pen55S75YOP77yM562J5LiL5LiA5qyh6YeH57qz5YaN6Kem5Y+RXG4gIH0gZmluYWxseSB7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgfVxufSIsICIvKiog6L6T5YWl5Yy65rWu5bGC6aKE6KeI5Y2h54mH77yaZ3VpZGUgLyBvcHRpbWl6aW5nIC8gcHJldmlldyAvIGVycm9yIOWbm+enjeWGheWuueaAgVxuICogIOeKtuaAgeadpeiHquaooeWdl+e6p+mihOiniOaAu+e6v++8iHByZXZpZXctYnVz77yJ77yM5LiN5L6d6LWW5Lya6K+dIHN0b3JlL2hvb2sgcHJvcHMgKi9cblxuaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB0eXBlIHsgTGFuZywgUHJvbXB0Q29uZmlnIH0gZnJvbSAnLi9vcHRpbWl6ZXIuanMnO1xuaW1wb3J0IHsgcnVuT3B0aW1pemUsIGNsb3NlUHJldmlldywgcmVmbGVjdElmTmVlZGVkIH0gZnJvbSAnLi9vcHRpbWl6ZXItc3RvcmUuanMnO1xuaW1wb3J0IHsgcmVjb3JkT3V0Y29tZSB9IGZyb20gJy4vbWVtb3J5LmpzJztcbmltcG9ydCB7IGdldFByZXZpZXdCdXNTdGF0ZSwgc3Vic2NyaWJlUHJldmlld0J1cyB9IGZyb20gJy4vcHJldmlldy1idXMuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFByZXZpZXdDYXJkUHJvcHMge1xuICB0OiAoa2V5OiBzdHJpbmcpID0+IHN0cmluZztcbiAgZ2V0Q29uZmlnOiAoKSA9PiBQcm9tcHRDb25maWc7XG4gIGdldExhbmc6ICgpID0+IExhbmc7XG4gIG9wZW5TZXR0aW5nczogKCkgPT4gdm9pZDtcbiAgZ2V0U2Vzc2lvbk1vZGVsPzogKCkgPT4gUHJvbWlzZTx7IHByb3ZpZGVyOiBzdHJpbmc7IG1vZGVsOiBzdHJpbmcgfSB8IG51bGw+O1xuICBnZXRIb3N0PzogKCkgPT4geyBycGM6IHsgY2FsbDogKGU6IHN0cmluZywgcD86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBQcm9taXNlPHsgb2s6IGJvb2xlYW47IHZhbHVlPzogdW5rbm93bjsgZXJyb3I/OiB7IGNvZGU/OiBzdHJpbmcgfSB9PiB9IH0gfCBudWxsO1xuICBnZXRTZXNzaW9uSWQ/OiAoKSA9PiBzdHJpbmcgfCBudWxsO1xufVxuXG5jb25zdCBDU1NfSUQgPSAnZHNoLXByb21wdC1vcHRpbWl6ZXIvY2FyZC5jc3MnO1xuZnVuY3Rpb24gaW5qZWN0Q3NzKCkge1xuICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJyB8fCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBzdHlsZVtkYXRhLXBsdWdpbi1jc3M9XCIke0NTU19JRH1cIl1gKSkgcmV0dXJuO1xuICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gIHN0eWxlLmRhdGFzZXQucGx1Z2luQ3NzID0gQ1NTX0lEO1xuICBzdHlsZS50ZXh0Q29udGVudCA9IGBcbi5kc2gtcG8tY2FyZCB7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgbGVmdDogMTJweDtcbiAgcmlnaHQ6IDEycHg7XG4gIGJvdHRvbTogY2FsYygxMDAlICsgOHB4KTtcbiAgei1pbmRleDogNDA7XG4gIGJhY2tncm91bmQ6IHZhcigtLWRzdy1hbGlhcy1iZy1vdmVybGF5LCAjZmZmKTtcbiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMiwgcmdiYSgxMjgsMTI4LDEyOCwwLjMpKTtcbiAgYm9yZGVyLXJhZGl1czogMTBweDtcbiAgYm94LXNoYWRvdzogMCA4cHggMjRweCByZ2JhKDAsIDAsIDAsIDAuMTYpO1xuICBwYWRkaW5nOiAxMnB4IDE0cHg7XG4gIG1heC1oZWlnaHQ6IDMyMHB4O1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICBnYXA6IDhweDtcbn1cbi5kc2gtcG8tY2FyZC1oZWFkIHtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICBjb2xvcjogdmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnksICMyMjIpO1xuICBmb250LXNpemU6IDEzcHg7XG4gIGZvbnQtd2VpZ2h0OiA2MDA7XG59XG4uZHNoLXBvLWNhcmQtYm9keSB7XG4gIG92ZXJmbG93OiBhdXRvO1xuICB3aGl0ZS1zcGFjZTogcHJlLXdyYXA7XG4gIHdvcmQtYnJlYWs6IGJyZWFrLXdvcmQ7XG4gIGNvbG9yOiB2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5LCAjNDQ0KTtcbiAgZm9udC1zaXplOiAxM3B4O1xuICBsaW5lLWhlaWdodDogMS42O1xuICBtYXgtaGVpZ2h0OiAyMDBweDtcbn1cbi5kc2gtcG8tY2FyZC1lcnIge1xuICBjb2xvcjogdmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnksICNkMDMwNTApO1xuICBmb250LXNpemU6IDEzcHg7XG59XG4uZHNoLXBvLWNhcmQtc3RlcCB7XG4gIGNvbG9yOiB2YXIoLS1kc3ctYWxpYXMtdGV4dC1zZWNvbmRhcnksICM4YzkzYTEpO1xuICBmb250LXNpemU6IDEycHg7XG4gIG1hcmdpbi1sZWZ0OiA0cHg7XG59XG4uZHNoLXBvLWNhcmQtZXJyLWRldGFpbCB7XG4gIG1hcmdpbi10b3A6IDRweDtcbiAgY29sb3I6IHZhcigtLWRzdy1hbGlhcy10ZXh0LXNlY29uZGFyeSwgIzhjOTNhMSk7XG4gIGZvbnQtc2l6ZTogMTJweDtcbiAgd29yZC1icmVhazogYnJlYWstYWxsO1xufVxuLmRzaC1wby1jYXJkLXJvdyB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGdhcDogOHB4O1xuICBmbGV4LXdyYXA6IHdyYXA7XG59XG4uZHNoLXBvLWNhcmQtYnRuIHtcbiAgYm9yZGVyOiAwO1xuICBib3JkZXItcmFkaXVzOiA2cHg7XG4gIHBhZGRpbmc6IDRweCAxMHB4O1xuICBmb250LXNpemU6IDEycHg7XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgY29sb3I6IHZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5LCAjMjIyKTtcbiAgYmFja2dyb3VuZDogdmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyLCByZ2JhKDEyOCwxMjgsMTI4LDAuMTQpKTtcbn1cbi5kc2gtcG8tY2FyZC1idG4ucHJpbWFyeSB7XG4gIC8qIOWGmeatu+S4u+iJsu+8mi0tZHN3LWFsaWFzLWJyYW5kLXByaW1hcnkg5Zyo5rex5aSc5qih5byP6Kej5p6Q5Li65rWF6ImyIOKGkiDnmb3lupXnmb3lrZfkuI3lj6/or7vvvIjnlKjmiLflrp7mtYvvvIkgKi9cbiAgY29sb3I6ICNmZmY7XG4gIGJhY2tncm91bmQ6ICMxNjc3ZmY7XG59XG5gO1xuICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cblxuLyoqIHRleHRhcmVhIOeUqCAudmFsdWXvvJtjb250ZW50ZWRpdGFibGXvvIhEU0ggY29tcG9zZXLvvIxMZXhpY2FsIGRpdu+8ieeUqCBpbm5lclRleHTjgIIgKi9cbmZ1bmN0aW9uIHRleHRPZklucHV0KGVsOiBFbGVtZW50KTogc3RyaW5nIHtcbiAgaWYgKGVsIGluc3RhbmNlb2YgSFRNTFRleHRBcmVhRWxlbWVudCkgcmV0dXJuIGVsLnZhbHVlO1xuICBpZiAoZWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiBlbC5pc0NvbnRlbnRFZGl0YWJsZSkgcmV0dXJuIGVsLmlubmVyVGV4dCB8fCAnJztcbiAgcmV0dXJuICcnO1xufVxuXG4vKiog5piv5ZCmIERTSCDkvJror53ovpPlhaXmjqfku7bvvJp0ZXh0YXJlYe+8jOaIliBjb21wb3NlciDnmoQgY29udGVudGVkaXRhYmxlIOWuv+S4u+OAgiAqL1xuZnVuY3Rpb24gaXNTZXNzaW9uSW5wdXQoZWw6IEVsZW1lbnQgfCBudWxsKTogYm9vbGVhbiB7XG4gIGlmIChlbCA9PT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICBpZiAoZWwgaW5zdGFuY2VvZiBIVE1MVGV4dEFyZWFFbGVtZW50KSByZXR1cm4gdHJ1ZTtcbiAgY29uc3QgZWRpdGFibGUgPSBlbCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICYmIGVsLmlzQ29udGVudEVkaXRhYmxlO1xuICBjb25zdCBjb21wb3NlciA9IGVsIGluc3RhbmNlb2YgRWxlbWVudCAmJiBlbC5jbG9zZXN0KCdbZGF0YS1jb21wb3Nlci1pbnB1dF0nKSAhPT0gbnVsbDtcbiAgcmV0dXJuIGVkaXRhYmxlIHx8IGNvbXBvc2VyO1xufVxuXG4vKiog5om+IGNvbXBvc2VyIOi+k+WFpeahhu+8muS8mOWFiOeEpueCue+8jOWQpuWImeWbnumAgOWIsOmhtemdouS4reeahCBjb21wb3NlciDlrr/kuLsgLyDnrKzkuIDkuKrlj6/nlKjovpPlhaXmjqfku7YgKi9cbmZ1bmN0aW9uIGZpbmRDb21wb3NlcigpOiBFbGVtZW50IHwgbnVsbCB7XG4gIGNvbnN0IGFjdGl2ZSA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gIGlmIChhY3RpdmUgJiYgaXNTZXNzaW9uSW5wdXQoYWN0aXZlKSkgcmV0dXJuIGFjdGl2ZTtcbiAgY29uc3QgY29tcG9zZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1jb21wb3Nlci1pbnB1dF0nKTtcbiAgaWYgKGNvbXBvc2VyICYmIGlzU2Vzc2lvbklucHV0KGNvbXBvc2VyKSkgcmV0dXJuIGNvbXBvc2VyO1xuICBjb25zdCBhbGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxUZXh0QXJlYUVsZW1lbnQ+KCd0ZXh0YXJlYScpO1xuICBmb3IgKGNvbnN0IHRhIG9mIGFsbCkge1xuICAgIGlmICghdGEuZGlzYWJsZWQpIHJldHVybiB0YTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gcmVhZENvbXBvc2VyVGV4dCgpOiBzdHJpbmcge1xuICBjb25zdCBlbCA9IGZpbmRDb21wb3NlcigpO1xuICByZXR1cm4gZWwgPyB0ZXh0T2ZJbnB1dChlbCkgOiAnJztcbn1cblxuLyoqXG4gKiDlhpnlm54gY29tcG9zZXLjgIJ0ZXh0YXJlYSDnlKjljp/nlJ8gdmFsdWUgc2V0dGVyICsgaW5wdXQg5LqL5Lu277yI6K6pIFJlYWN0IOWPl+aOp+e7hOS7tuaEn+efpe+8ie+8m1xuICogY29udGVudGVkaXRhYmxl77yITGV4aWNhbO+8ieeUqCBzZWxlY3QtYWxsICsgZXhlY0NvbW1hbmQoJ2luc2VydFRleHQnKeKAlOKAlGxleGljYWwg55uR5ZCs5Y6f55SfXG4gKiBpbnB1dO+8jGV4ZWNDb21tYW5kIOS8muinpuWPkeato+ehrueahOe8lui+keS6i+S7tuW5tuaKiiBET00g5ZCM5q2l5Zue57yW6L6R5ZmoIHN0YXRl44CCXG4gKi9cbmZ1bmN0aW9uIHdyaXRlQ29tcG9zZXJUZXh0KHRleHQ6IHN0cmluZyk6IHZvaWQge1xuICBjb25zdCBlbCA9IGZpbmRDb21wb3NlcigpO1xuICBpZiAoIWVsKSByZXR1cm47XG4gIGlmIChlbCBpbnN0YW5jZW9mIEhUTUxUZXh0QXJlYUVsZW1lbnQpIHtcbiAgICBjb25zdCBzZXR0ZXIgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKEhUTUxUZXh0QXJlYUVsZW1lbnQucHJvdG90eXBlLCAndmFsdWUnKT8uc2V0O1xuICAgIGlmIChzZXR0ZXIpIHtcbiAgICAgIHNldHRlci5jYWxsKGVsLCB0ZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWwudmFsdWUgPSB0ZXh0O1xuICAgIH1cbiAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnaW5wdXQnLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgIGVsLmZvY3VzKCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIGNvbnRlbnRlZGl0YWJsZSBjb21wb3NlclxuICBpZiAoZWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiBlbC5pc0NvbnRlbnRFZGl0YWJsZSkge1xuICAgIGVsLmZvY3VzKCk7XG4gICAgaWYgKGRvY3VtZW50LmV4ZWNDb21tYW5kKSB7XG4gICAgICBjb25zdCBzZWwgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICBjb25zdCByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgICByYW5nZS5zZWxlY3ROb2RlQ29udGVudHMoZWwpO1xuICAgICAgc2VsPy5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgICAgIHNlbD8uYWRkUmFuZ2UocmFuZ2UpO1xuICAgICAgLy8g5Y6f55SfIGlucHV0IOS6i+S7tu+8iGluc2VydFRleHQg6ZyA6KaB56ys5LqM5Liq5Y+C5pWwIG5vbmNlIOS7pea7oei2s+afkOS6m+a1j+iniOWZqOWuieWFqOajgOafpe+8iVxuICAgICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoJ2luc2VydFRleHQnLCBmYWxzZSwgdGV4dCk7XG4gICAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnaW5wdXQnLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbC5pbm5lclRleHQgPSB0ZXh0O1xuICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2lucHV0JywgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZXJyb3JLZXkoa2luZDogc3RyaW5nIHwgbnVsbCk6IHN0cmluZyB7XG4gIHN3aXRjaCAoa2luZCkge1xuICAgIC8vIGtpbmQg4oaSIGxvY2FsZSBrZXnvvJsnY29uZmlnJyDlnKggVUkg5LiK5LiN5Y+v6L6+77yIcnVuT3B0aW1pemUg5YWI6LWwIGd1aWRl77yJ77yMQWJvcnRFcnJvcuKGknRpbWVvdXQg55SxIHJ1bk9wdGltaXplIOWFiOihjOaLpuaIqu+8jOS/neeVmeWPjOS/nemZqVxuICAgIGNhc2UgJ3VuYXV0aG9yaXplZCc6IGNhc2UgJ2ZvcmJpZGRlbic6IGNhc2UgJ3RpbWVvdXQnOiBjYXNlICduZXR3b3JrJzogY2FzZSAnY29ycyc6IGNhc2UgJ2h0dHAnOiBjYXNlICdiYWQtcmVzcG9uc2UnOiBjYXNlICdlbXB0eSc6IGNhc2UgJ2NvbmZpZyc6XG4gICAgICByZXR1cm4gYGVycm9yLiR7a2luZH1gO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gJ2Vycm9yLm5ldHdvcmsnO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBQcmV2aWV3Q2FyZChwcm9wczogUHJldmlld0NhcmRQcm9wcykge1xuICBjb25zdCB7IHQsIGdldENvbmZpZywgZ2V0TGFuZywgb3BlblNldHRpbmdzLCBnZXRTZXNzaW9uTW9kZWwsIGdldEhvc3QsIGdldFNlc3Npb25JZCB9ID0gcHJvcHM7XG5cbiAgLy8g6K6i6ZiF5qih5Z2X57qn6aKE6KeI5oC757q/77yI5pu/5Luj5Lya6K+dIHN0b3JlIHByb3Bz77yJXG4gIGNvbnN0IFtzdGF0ZSwgc2V0U3RhdGVdID0gdXNlU3RhdGUoKCkgPT4gZ2V0UHJldmlld0J1c1N0YXRlKCkpO1xuICB1c2VFZmZlY3QoXG4gICAgKCkgPT4gc3Vic2NyaWJlUHJldmlld0J1cygoKSA9PiBzZXRTdGF0ZShnZXRQcmV2aWV3QnVzU3RhdGUoKSkpLFxuICAgIFtdLFxuICApO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiBpbmplY3RDc3MoKSwgW10pO1xuXG4gIC8vIOWNuOi9veaXtua4heeQhu+8mua4hemZpOaMgui1t+eahCBjb3BpZWQg5aSN5L2N5a6a5pe25Zmo77yM5bm25qCH6K6w5pyq5oyC6L2977yMXG4gIC8vIOmYsuatoui/n+WIsOeahCBzZXRDb3BpZWQodHJ1ZSnvvIhjb3B5IOeahCBhd2FpdCDmnJ/pl7Tljbjovb3vvInlnKjljbjovb3lkI7op6blj5HjgIJcbiAgY29uc3QgbW91bnRlZFJlZiA9IHVzZVJlZih0cnVlKTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBtb3VudGVkUmVmLmN1cnJlbnQgPSB0cnVlO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBtb3VudGVkUmVmLmN1cnJlbnQgPSBmYWxzZTtcbiAgICAgIGlmIChjb3B5VGltZXJSZWYuY3VycmVudCAhPT0gbnVsbCkge1xuICAgICAgICBjbGVhclRpbWVvdXQoY29weVRpbWVyUmVmLmN1cnJlbnQpO1xuICAgICAgICBjb3B5VGltZXJSZWYuY3VycmVudCA9IG51bGw7XG4gICAgICB9XG4gICAgfTtcbiAgfSwgW10pO1xuXG4gIGNvbnN0IHsgc3RhdHVzLCByZXN1bHQsIGVycm9yS2luZCB9ID0gc3RhdGU7XG4gIGNvbnN0IFtjb3BpZWQsIHNldENvcGllZF0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IGNvcHlUaW1lclJlZiA9IHVzZVJlZjxudW1iZXIgfCBudWxsPihudWxsKTtcblxuICAvLyDpooTop4jnqpflj6Pnu5Hlrprlj5HotbfkvJror53vvJrliIfmjaLliLDliKvnmoTkvJror53ml7bkuI3ot5/pmo/mmL7npLrvvIjliIflm57lj5HotbfkvJror53mgaLlpI3vvIlcbiAgaWYgKHN0YXR1cyAhPT0gJ2lkbGUnICYmIHN0YXRlLnNlc3Npb25JZCAhPT0gbnVsbCkge1xuICAgIGNvbnN0IHNpZCA9IGdldFNlc3Npb25JZD8uKCk7XG4gICAgaWYgKHNpZCAhPT0gbnVsbCAmJiBzdGF0ZS5zZXNzaW9uSWQgIT09IHNpZCkgcmV0dXJuIG51bGw7XG4gIH1cbiAgaWYgKHN0YXR1cyA9PT0gJ2lkbGUnKSByZXR1cm4gbnVsbDtcblxuICBjb25zdCByZXRyeSA9ICgpID0+IHtcbiAgICAvLyDph43or5UgPSDlkKblhrPmnKzmrKHnu5PmnpzvvIjotJ/moLfmnKzvvInvvIzorqnlj43mgJ3nn6XpgZPjgIzov5nnsbvkuqflh7rkuI3lkIjlj6PlkbPjgI1cbiAgICByZWNvcmRPdXRjb21lKCdyZWplY3RlZCcpO1xuICAgIHZvaWQgcnVuT3B0aW1pemUoe1xuICAgICAgZ2V0Q29uZmlnLFxuICAgICAgZ2V0TGFuZyxcbiAgICAgIGdldERyYWZ0OiAoKSA9PiByZWFkQ29tcG9zZXJUZXh0KCksXG4gICAgICBnZXRTZXNzaW9uTW9kZWwsXG4gICAgICBob3N0OiBnZXRIb3N0Py4oKSA/PyB1bmRlZmluZWQsXG4gICAgICBnZXRTZXNzaW9uSWQsXG4gICAgfSk7XG4gIH07XG5cbiAgY29uc3QgcmVwbGFjZSA9ICgpID0+IHtcbiAgICB3cml0ZUNvbXBvc2VyVGV4dChyZXN1bHQpO1xuICAgIC8vIOmHh+e6syA9IOato+agt+acrO+8m+e0r+iuoeWIsOmYiOWAvOWQjuW8guatpeWIt+aWsOWBj+WlveeUu+WDj++8iOWksei0pemdmem7mO+8iVxuICAgIGNvbnN0IGFjY2VwdGVkID0gcmVjb3JkT3V0Y29tZSgnYWNjZXB0ZWQnKTtcbiAgICBjbG9zZVByZXZpZXcoKTtcbiAgICBpZiAoYWNjZXB0ZWQpIHtcbiAgICAgIHZvaWQgcmVmbGVjdElmTmVlZGVkKHsgY29uZmlnOiBnZXRDb25maWcoKSwgbGFuZzogZ2V0TGFuZygpLCBob3N0OiBnZXRIb3N0Py4oKSA/PyB1bmRlZmluZWQgfSk7XG4gICAgfVxuICB9O1xuXG4gIC8qKiDlhbPpl60gPSDmnKrph4fnurPvvIjlj6rmnInlnKjlrZjlnKjmjILotbfnu5Pmnpzml7bmiY3orqHlhaXotJ/moLfmnKzvvIkgKi9cbiAgY29uc3QgZGlzbWlzcyA9ICgpID0+IHtcbiAgICByZWNvcmRPdXRjb21lKCdyZWplY3RlZCcpO1xuICAgIGNsb3NlUHJldmlldygpO1xuICB9O1xuXG4gIGNvbnN0IGNvcHkgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKCFuYXZpZ2F0b3IuY2xpcGJvYXJkKSByZXR1cm47IC8vIOmdnuWuieWFqOS4iuS4i+aWh++8iGh0dHAg562J77yJ77ya5LiN57+76L2sIGNvcGllZO+8jOS/neaMgeWPr+mHjeivlVxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChyZXN1bHQpO1xuICAgICAgaWYgKCFtb3VudGVkUmVmLmN1cnJlbnQpIHJldHVybjsgLy8gYXdhaXQg5pyf6Ze057uE5Lu25bey5Y246L2977ya5LiN5YaNIHNldFN0YXRlXG4gICAgICBzZXRDb3BpZWQodHJ1ZSk7XG4gICAgICBpZiAoY29weVRpbWVyUmVmLmN1cnJlbnQgIT09IG51bGwpIGNsZWFyVGltZW91dChjb3B5VGltZXJSZWYuY3VycmVudCk7XG4gICAgICBjb3B5VGltZXJSZWYuY3VycmVudCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgc2V0Q29waWVkKGZhbHNlKTtcbiAgICAgICAgY29weVRpbWVyUmVmLmN1cnJlbnQgPSBudWxsO1xuICAgICAgfSwgMTIwMCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyDliarotLTmnb/lhpnlhaXlpLHotKXvvJrpnZnpu5jvvIjkuI3nv7vovawgY29waWVk77yJXG4gICAgfVxuICB9O1xuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2gtcG8tY2FyZFwiIHJvbGU9XCJzdGF0dXNcIj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNoLXBvLWNhcmQtaGVhZFwiPlxuICAgICAgICA8c3Bhbj57dCgnY2FyZC50aXRsZScpfTwvc3Bhbj5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNoLXBvLWNhcmQtYnRuXCIgb25DbGljaz17ZGlzbWlzc30+XG4gICAgICAgICAg4pyVXG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG5cbiAgICAgIHtzdGF0dXMgPT09ICdndWlkZScgJiYgKFxuICAgICAgICA8PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNoLXBvLWNhcmQtYm9keVwiPnt0KCdndWlkZS50aXRsZScpfTwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNoLXBvLWNhcmQtYm9keVwiPnt0KCdndWlkZS5kZXNjJyl9PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2gtcG8tY2FyZC1yb3dcIj5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzaC1wby1jYXJkLWJ0biBwcmltYXJ5XCIgb25DbGljaz17KCkgPT4geyBjbG9zZVByZXZpZXcoKTsgb3BlblNldHRpbmdzKCk7IH19PlxuICAgICAgICAgICAgICB7dCgnZ3VpZGUuYWN0aW9uJyl9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzaC1wby1jYXJkLWJ0blwiIG9uQ2xpY2s9eygpID0+IGNsb3NlUHJldmlldygpfT5cbiAgICAgICAgICAgICAge3QoJ2d1aWRlLmRpc21pc3MnKX1cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8Lz5cbiAgICAgICl9XG5cbiAgICAgIHtzdGF0dXMgPT09ICdvcHRpbWl6aW5nJyAmJiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNoLXBvLWNhcmQtYm9keVwiPlxuICAgICAgICAgIHtzdGF0ZS5yZWFzb25pbmcgJiYgIXN0YXRlLmRyYWZ0ID8gKFxuICAgICAgICAgICAgPHNwYW5cbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICB3aGl0ZVNwYWNlOiAncHJlLXdyYXAnLFxuICAgICAgICAgICAgICAgIGNvbG9yOiAndmFyKC0tZHN3LWFsaWFzLXRleHQtc2Vjb25kYXJ5LCAjOGM5M2ExKScsXG4gICAgICAgICAgICAgICAgZm9udFNpemU6ICcxMnB4JyxcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge3N0YXRlLnJlYXNvbmluZ31cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICB7c3RhdGUuZHJhZnQgPyA8c3BhbiBzdHlsZT17eyB3aGl0ZVNwYWNlOiAncHJlLXdyYXAnIH19PntzdGF0ZS5kcmFmdH08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICB7IXN0YXRlLmRyYWZ0ICYmICFzdGF0ZS5yZWFzb25pbmcgPyB0KCdjYXJkLm9wdGltaXppbmcnKSA6IG51bGx9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKX1cblxuICAgICAge3N0YXR1cyA9PT0gJ3ByZXZpZXcnICYmIChcbiAgICAgICAgPD5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzaC1wby1jYXJkLWJvZHlcIj57cmVzdWx0fTwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNoLXBvLWNhcmQtcm93XCI+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2gtcG8tY2FyZC1idG4gcHJpbWFyeVwiIG9uQ2xpY2s9e3JlcGxhY2V9PlxuICAgICAgICAgICAgICB7dCgnY2FyZC5yZXBsYWNlJyl9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzaC1wby1jYXJkLWJ0blwiIG9uQ2xpY2s9eygpID0+IHZvaWQgY29weSgpfT5cbiAgICAgICAgICAgICAge2NvcGllZCA/IHQoJ2NhcmQuY29weURvbmUnKSA6IHQoJ2NhcmQuY29weScpfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2gtcG8tY2FyZC1idG5cIiBvbkNsaWNrPXtyZXRyeX0+XG4gICAgICAgICAgICAgIHt0KCdjYXJkLnJldHJ5Jyl9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzaC1wby1jYXJkLWJ0blwiIG9uQ2xpY2s9e2Rpc21pc3N9PlxuICAgICAgICAgICAgICB7dCgnY2FyZC5kaXNtaXNzJyl9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC8+XG4gICAgICApfVxuXG4gICAgICB7c3RhdHVzID09PSAnZXJyb3InICYmIChcbiAgICAgICAgPD5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzaC1wby1jYXJkLWVyclwiPnt0KGVycm9yS2V5KGVycm9yS2luZCkpfTwvZGl2PlxuICAgICAgICAgIHtlcnJvckRldGFpbCA/IDxkaXYgY2xhc3NOYW1lPVwiZHNoLXBvLWNhcmQtZXJyLWRldGFpbFwiPntlcnJvckRldGFpbH08L2Rpdj4gOiBudWxsfVxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNoLXBvLWNhcmQtcm93XCI+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2gtcG8tY2FyZC1idG4gcHJpbWFyeVwiIG9uQ2xpY2s9e3JldHJ5fT5cbiAgICAgICAgICAgICAge3QoJ2NhcmQucmV0cnknKX1cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNoLXBvLWNhcmQtYnRuXCIgb25DbGljaz17ZGlzbWlzc30+XG4gICAgICAgICAgICAgIHt0KCdjYXJkLmRpc21pc3MnKX1cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8Lz5cbiAgICAgICl9XG4gICAgPC9kaXY+XG4gICk7XG59IiwgIi8qKiDorr7nva4g4oaSIEdlbmVyYWwg5Yy644CMUHJvbXB0IOS8mOWMluOAjeiuvue9ruihjO+8muagh+mimOaRmOimgSArIOWxleW8gOihqOWNlSAqL1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB0eXBlIHsgUHJvbXB0Q29uZmlnIH0gZnJvbSAnLi9vcHRpbWl6ZXIuanMnO1xuaW1wb3J0IHsgREVGQVVMVFMgfSBmcm9tICcuL29wdGltaXplci5qcyc7XG5pbXBvcnQgdHlwZSB7IFNldHRpbmdzRm9ybVN0YXRlLCBTZXR0aW5nc0Zvcm1WYWx1ZXMgfSBmcm9tICcuL3NldHRpbmdzLWZvcm0tc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgeyBTZXR0aW5nc0Zvcm1BY3Rpb25zIH0gZnJvbSAnLi9zZXR0aW5ncy1zdG9yZS5qcyc7XG5pbXBvcnQgeyBvbk9wZW5TZXR0aW5nc1JlcXVlc3QgfSBmcm9tICcuL2V2ZW50cy5qcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2V0dGluZ3NSb3dQcm9wcyB7XG4gIHQ6IChrZXk6IHN0cmluZykgPT4gc3RyaW5nO1xuICB1c2VTdG9yZTogPFQ+KHNlbGVjdG9yOiAoczogU2V0dGluZ3NGb3JtU3RhdGUpID0+IFQpID0+IFQ7XG4gIGFjdGlvbnM6IFNldHRpbmdzRm9ybUFjdGlvbnM7XG4gIGdldENvbmZpZzogKCkgPT4gUHJvbXB0Q29uZmlnO1xuICBzYXZlQ29uZmlnOiAodmFsdWVzOiBTZXR0aW5nc0Zvcm1WYWx1ZXMpID0+IFByb21pc2U8dm9pZD47XG4gIHJlc2V0Q29uZmlnOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xuICBnZXRFcG9jaDogKCkgPT4gbnVtYmVyO1xuICAvKiog5a6/5Li76YCa6YGT6Ieq5qOA77ya5b2T5YmN5Lya6K+d5qih5Z6L5piv5ZCm5Y+v57uPIHNlcnZlciBoYWxmIOiOt+WPlu+8iOmbtumFjee9rumAmumBk+eahOWBpeW6t+aOoumSiO+8iSAqL1xuICBnZXRIb3N0U3RhdHVzPzogKCkgPT4gUHJvbWlzZTx7IGF2YWlsYWJsZTogYm9vbGVhbjsgcHJvdmlkZXI/OiBzdHJpbmc7IG1vZGVsPzogc3RyaW5nOyBlcnJvcj86IHN0cmluZyB9IHwgbnVsbD47XG59XG5cblxuY29uc3QgQ1NTX0lEID0gJ2RzaC1wcm9tcHQtb3B0aW1pemVyL3NldHRpbmdzLmNzcyc7XG5mdW5jdGlvbiBpbmplY3RDc3MoKSB7XG4gIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnIHx8IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYHN0eWxlW2RhdGEtcGx1Z2luLWNzcz1cIiR7Q1NTX0lEfVwiXWApKSByZXR1cm47XG4gIGNvbnN0IHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgc3R5bGUuZGF0YXNldC5wbHVnaW5Dc3MgPSBDU1NfSUQ7XG4gIHN0eWxlLnRleHRDb250ZW50ID0gYFxuLm9wdGlTZXR0aW5ncyB7XG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtcbiAgcGFkZGluZzogMTZweCAwO1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICBnYXA6IDhweDtcbn1cbi5vcHRpU2V0dGluZ3NUaXRsZSB7XG4gIGNvbG9yOiB2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7XG4gIGZvbnQtc2l6ZTogMTRweDtcbiAgbGluZS1oZWlnaHQ6IDIycHg7XG59XG4ub3B0aVNldHRpbmdzSGludCB7XG4gIGNvbG9yOiB2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO1xuICBmb250LXNpemU6IDEycHg7XG59XG4ub3B0aVNldHRpbmdzRm9ybSB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIGdhcDogOHB4O1xuICBtYXJnaW4tdG9wOiA0cHg7XG59XG4ub3B0aVNldHRpbmdzRmllbGQge1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICBnYXA6IDRweDtcbn1cbi5vcHRpU2V0dGluZ3NMYWJlbCB7XG4gIGNvbG9yOiB2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTtcbiAgZm9udC1zaXplOiAxMnB4O1xufVxuLm9wdGlTZXR0aW5nc0lucHV0IHtcbiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7XG4gIGJvcmRlci1yYWRpdXM6IDZweDtcbiAgYmFja2dyb3VuZDogdmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTIpO1xuICBjb2xvcjogdmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO1xuICBwYWRkaW5nOiA2cHggOHB4O1xuICBmb250LXNpemU6IDEzcHg7XG59XG4ub3B0aVNldHRpbmdzUm93IHtcbiAgZGlzcGxheTogZmxleDtcbiAgZ2FwOiA4cHg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG59XG4ub3B0aVNldHRpbmdzQnRuIHtcbiAgYm9yZGVyOiAwO1xuICBib3JkZXItcmFkaXVzOiA2cHg7XG4gIHBhZGRpbmc6IDRweCAxMnB4O1xuICBmb250LXNpemU6IDEycHg7XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgYmFja2dyb3VuZDogdmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyLCByZ2JhKDEyOCwxMjgsMTI4LDAuMTQpKTtcbiAgY29sb3I6IHZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtcbn1cbi5vcHRpU2V0dGluZ3NCdG4ucHJpbWFyeSB7XG4gIC8qIOWGmeatu+S4u+iJsu+8muS4u+mimOWPmOmHj+WcqOa3seWknOaooeW8j+S8muino+aekOS4uua1hS/mt7HmnoHnq6/oibLvvIjpu5HlupXpu5HlrZfjgIHnmb3lupXnmb3lrZflnYfooqvnlKjmiLflrp7mtYvvvInvvIxcbiAgICAg5Zu65a6a5ZOB54mM6JOdICsg55m95a2X5L+d6K+B5Lu75L2V5Li76aKY5Y+v6K+7ICovXG4gIGNvbG9yOiAjZmZmO1xuICBiYWNrZ3JvdW5kOiAjMTY3N2ZmO1xufVxuLm9wdGlTZXR0aW5nc0VyciB7XG4gIGNvbG9yOiB2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSwgI2QwMzA1MCk7XG4gIGZvbnQtc2l6ZTogMTJweDtcbn1cbmA7XG4gIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gU2V0dGluZ3NSb3cocHJvcHM6IFNldHRpbmdzUm93UHJvcHMpIHtcbiAgY29uc3QgeyB0LCB1c2VTdG9yZSwgYWN0aW9ucywgZ2V0Q29uZmlnLCBzYXZlQ29uZmlnLCByZXNldENvbmZpZywgZ2V0RXBvY2gsIGdldEhvc3RTdGF0dXMgfSA9IHByb3BzO1xuICBjb25zdCBbaG9zdFN0YXR1cywgc2V0SG9zdFN0YXR1c10gPSB1c2VTdGF0ZTx7IGF2YWlsYWJsZTogYm9vbGVhbjsgcHJvdmlkZXI/OiBzdHJpbmc7IG1vZGVsPzogc3RyaW5nOyBlcnJvcj86IHN0cmluZyB9IHwgbnVsbD4obnVsbCk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIWdldEhvc3RTdGF0dXMpIHJldHVybjtcbiAgICBsZXQgYWxpdmUgPSB0cnVlO1xuICAgIGdldEhvc3RTdGF0dXMoKS50aGVuKChzdCkgPT4geyBpZiAoYWxpdmUpIHNldEhvc3RTdGF0dXMoc3QpOyB9KS5jYXRjaCgoKSA9PiB7IGlmIChhbGl2ZSkgc2V0SG9zdFN0YXR1cyh7IGF2YWlsYWJsZTogZmFsc2UsIGVycm9yOiAncnBjLWZhaWxlZCcgfSk7IH0pO1xuICAgIHJldHVybiAoKSA9PiB7IGFsaXZlID0gZmFsc2U7IH07XG4gIH0sIFtnZXRIb3N0U3RhdHVzXSk7XG4gIGNvbnN0IFtleHBhbmRlZCwgc2V0RXhwYW5kZWRdID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbc3VibWl0UmV2aXNpb24sIHNldFN1Ym1pdFJldmlzaW9uXSA9IHVzZVN0YXRlKDApO1xuXG4gIGNvbnN0IHZhbHVlcyA9IHVzZVN0b3JlKChzKSA9PiBzLnZhbHVlcyk7XG4gIGNvbnN0IHNhdmVkID0gdXNlU3RvcmUoKHMpID0+IHMuc2F2ZWQpO1xuICBjb25zdCBlcnJvciA9IHVzZVN0b3JlKChzKSA9PiBzLmVycm9yKTtcbiAgLy8g5L+d5a2YL+mHjee9riBSUEMg5aSx6LSl5pe25pi+56S655qE5Y6f5aeL6ZSZ6K+v77yI5LiN5YaN6Z2Z6buY5aSx6LSl77yac2V0dGluZ3Mg5YaZ5YWl5Ye66ZSZ5b+F6aG76K6p55So5oi355yL5b6X5Yiw77yJXG4gIGNvbnN0IFtycGNFcnJvciwgc2V0UnBjRXJyb3JdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbCk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IGluamVjdENzcygpLCBbXSk7XG5cbiAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKCk7XG4gIGNvbnN0IG1vZGVsTGFiZWwgPSBjb25maWcubW9kZWwgPyBjb25maWcubW9kZWwgOiAn4oCUJztcblxuICAvLyDpppbmrKHmjILovb0gLyDphY3nva7lj5jljJbml7bmiorlvZPliY3phY3nva7mkq3np43ov5vooajljZXjgIJcbiAgLy8gc2VlZCDkv67orqLlj7cgPSDmnKzlnLDmj5DkuqTluo/lj7cgc3VibWl0UmV2aXNpb24gKyBjb25maWdFcG9jaO+8iOWklumDqOmFjee9ruWPmOWMlue6quWFg++8ie+8mlxuICAvLyAgLSDlpJbpg6jphY3nva7lj5jljJbvvIjot6jmoIfnrb7pobUv5aSW6YOo5YaZ5YWlIOKGkiBpbmRleC50cyByZWZyZXNoQ29uZmlnIOeahOe6quWFg+mAkuWinu+8ieS7pOS/ruiuouWPt+i2hei/h1xuICAvLyAgICBzdGF0ZS5yZXZpc2lvbu+8jOmHjeaSreenjeeUn+aViO+8jOihqOWNlei3n+S4iuW9kuS4gOWMluWQjueahOmVnOWDj++8m1xuICAvLyAgLSDkv53lrZgv6YeN572u5bey6YCa6L+HIGNvbW1pdC9zZWVkIOWGmeWFpeOAjOaWsOacrOWcsOW6j+WPtyArIOW9k+aXtue6quWFg+OAjeeahOS/ruiuouWPt++8jOe0p+aOpeeahOacrOasoeaViOW6lFxuICAvLyAgICDlm57ot5HvvIjnuqrlhYPmnKrlj5jvvInkv67orqLlj7fnm7jnrYnooqsgcmVkdWNlciDmipHliLYg4oaSIOS/neS9j+eUqOaIt+WOn+Wni+i+k+WFpeS4juOAjOW3suS/neWtmOOAjeaPkOekuu+8m1xuICAvLyAgICDkuIvmrKHmnKzlnLDliqjkvZzvvIhlZGl0L2NvbW1pdO+8ieWGjeaKiiBzdGF0ZS5yZXZpc2lvbiDmiqzliLDkuI7nuqrlhYPkuIDoh7TjgIJcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBhY3Rpb25zLnNlZWQoXG4gICAgICB7IGJhc2VVcmw6IGNvbmZpZy5iYXNlVXJsLCBhcGlLZXk6IGNvbmZpZy5hcGlLZXksIG1vZGVsOiBjb25maWcubW9kZWwsIHVzZVNlc3Npb25Nb2RlbDogY29uZmlnLnVzZVNlc3Npb25Nb2RlbCB9LFxuICAgICAgc3VibWl0UmV2aXNpb24gKyBnZXRFcG9jaCgpLFxuICAgICk7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICB9LCBbY29uZmlnLmJhc2VVcmwsIGNvbmZpZy5hcGlLZXksIGNvbmZpZy5tb2RlbCwgY29uZmlnLnVzZVNlc3Npb25Nb2RlbCwgZ2V0RXBvY2hdKTtcblxuICAvLyDjgIzljrvorr7nva7jgI3vvIjpooTop4jljaHmnKrphY3nva7lvJXlr7zvvInihpIg6Ieq5Yqo5bGV5byA6KGo5Y2VXG4gIHVzZUVmZmVjdCgoKSA9PiBvbk9wZW5TZXR0aW5nc1JlcXVlc3QoKCkgPT4gc2V0RXhwYW5kZWQodHJ1ZSkpLCBbXSk7XG5cbiAgY29uc3QgaGFuZGxlU2F2ZSA9IGFzeW5jICgpID0+IHtcbiAgICBzZXRScGNFcnJvcihudWxsKTtcbiAgICBjb25zdCBlcnJvcnMgPSBhY3Rpb25zLnZhbGlkYXRlKHZhbHVlcyk7XG4gICAgaWYgKGVycm9ycykge1xuICAgICAgYWN0aW9ucy5mYWlsKE9iamVjdC52YWx1ZXMoZXJyb3JzKVswXSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBzYXZlQ29uZmlnKHZhbHVlcyk7XG4gICAgICBzZXRTdWJtaXRSZXZpc2lvbigocikgPT4gciArIDEpO1xuICAgICAgLy8g5LiO5pWI5bqU5Zue6LeR55qEIHNlZWQg5L+u6K6i5Y+377yI5paw5pys5Zyw5bqP5Y+3ICsg57qq5YWD77yJ5a+56b2Q77yM5L2/5L+d5a2Y5ZCO55qE6YeN5pKt56eN6KKr5oqR5Yi2XG4gICAgICBhY3Rpb25zLmNvbW1pdChzdWJtaXRSZXZpc2lvbiArIDEgKyBnZXRFcG9jaCgpKTtcbiAgICB9IGNhdGNoIChvdXRlcikge1xuICAgICAgc2V0UnBjRXJyb3IoYCR7dCgnc2V0dGluZ3Muc2F2ZUZhaWxlZCcpfe+8miR7b3V0ZXIgaW5zdGFuY2VvZiBFcnJvciA/IG91dGVyLm1lc3NhZ2UgOiBTdHJpbmcob3V0ZXIpfWApO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBoYW5kbGVSZXNldCA9IGFzeW5jICgpID0+IHtcbiAgICBzZXRScGNFcnJvcihudWxsKTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgcmVzZXRDb25maWcoKTtcbiAgICAgIGFjdGlvbnMuc2VlZChcbiAgICAgICAgeyBiYXNlVXJsOiBERUZBVUxUUy5iYXNlVXJsLCBhcGlLZXk6IERFRkFVTFRTLmFwaUtleSwgbW9kZWw6IERFRkFVTFRTLm1vZGVsIH0sXG4gICAgICAgIHN1Ym1pdFJldmlzaW9uICsgMSArIGdldEVwb2NoKCksXG4gICAgICApO1xuICAgICAgc2V0U3VibWl0UmV2aXNpb24oKHIpID0+IHIgKyAxKTtcbiAgICB9IGNhdGNoIChvdXRlcikge1xuICAgICAgc2V0UnBjRXJyb3IoYCR7dCgnc2V0dGluZ3MucmVzZXRGYWlsZWQnKX3vvJoke291dGVyIGluc3RhbmNlb2YgRXJyb3IgPyBvdXRlci5tZXNzYWdlIDogU3RyaW5nKG91dGVyKX1gKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc1wiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJvcHRpU2V0dGluZ3NUaXRsZVwiIG9uQ2xpY2s9eygpID0+IHNldEV4cGFuZGVkKCh2KSA9PiAhdil9IHN0eWxlPXt7IGN1cnNvcjogJ3BvaW50ZXInIH19PlxuICAgICAgICB7dCgnc2V0dGluZ3MudGl0bGUnKX1cbiAgICAgICAgeyFleHBhbmRlZCAmJlxuICAgICAgICAgICh2YWx1ZXMudXNlU2Vzc2lvbk1vZGVsID8gKFxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzSGludFwiPiDCtyB7dCgnc2V0dGluZ3Muc2Vzc2lvbk1vZGVsRW5hYmxlZCcpfTwvc3Bhbj5cbiAgICAgICAgICApIDogKFxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzSGludFwiPiDCtyB7dCh2YWx1ZXMuYXBpS2V5ID8gJ2NhcmQuY29uZmlndXJlZC5oaW50JyA6ICdjYXJkLnVuY29uZmlndXJlZC5oaW50JykucmVwbGFjZSgne21vZGVsfScsIG1vZGVsTGFiZWwpfTwvc3Bhbj5cbiAgICAgICAgICApKX1cbiAgICAgIDwvZGl2PlxuXG4gICAgICB7ZXhwYW5kZWQgJiYgKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc0Zvcm1cIj5cbiAgICAgICAgICB7Z2V0SG9zdFN0YXR1cyAmJiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc0ZpZWxkXCIgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogJ3JvdycgfX0+XG4gICAgICAgICAgICAgIDxzcGFuXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzSGludFwiXG4gICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiBob3N0U3RhdHVzPy5hdmFpbGFibGUgPyAndmFyKC0tZHN3LWFsaWFzLXN0YXRlLXN1Y2Nlc3MtcHJpbWFyeSwgIzJmOWU2MyknIDogJ3ZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5LCAjZDAzMDUwKScsXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtob3N0U3RhdHVzID09PSBudWxsXG4gICAgICAgICAgICAgICAgICA/IHQoJ3NldHRpbmdzLmhvc3RQcm9iZScpXG4gICAgICAgICAgICAgICAgICA6IGhvc3RTdGF0dXMuYXZhaWxhYmxlXG4gICAgICAgICAgICAgICAgICAgID8gYCR7dCgnc2V0dGluZ3MuaG9zdE9rJyl9ICR7aG9zdFN0YXR1cy5wcm92aWRlcn0vJHtob3N0U3RhdHVzLm1vZGVsfWBcbiAgICAgICAgICAgICAgICAgICAgOiBgJHt0KCdzZXR0aW5ncy5ob3N0RmFpbCcpfSAke2hvc3RTdGF0dXMuZXJyb3IgPz8gJyd9YH1cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKX1cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc0ZpZWxkXCI+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzTGFiZWxcIj5cbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgICAgICAgICBjaGVja2VkPXt2YWx1ZXMudXNlU2Vzc2lvbk1vZGVsfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gYWN0aW9ucy5lZGl0KCd1c2VTZXNzaW9uTW9kZWwnLCBlLnRhcmdldC5jaGVja2VkKX1cbiAgICAgICAgICAgICAgLz57JyAnfVxuICAgICAgICAgICAgICB7dCgnc2V0dGluZ3MudXNlU2Vzc2lvbk1vZGVsJyl9XG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzSGludFwiPnt0KCdzZXR0aW5ncy51c2VTZXNzaW9uTW9kZWxIaW50Jyl9PC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzRmllbGRcIj5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJvcHRpU2V0dGluZ3NMYWJlbFwiIGh0bWxGb3I9XCJvcHRpLWJhc2UtdXJsXCI+e3QoJ3NldHRpbmdzLmJhc2VVcmwnKX08L2xhYmVsPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGlkPVwib3B0aS1iYXNlLXVybFwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc0lucHV0XCJcbiAgICAgICAgICAgICAgdmFsdWU9e3ZhbHVlcy5iYXNlVXJsfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17REVGQVVMVFMuYmFzZVVybH1cbiAgICAgICAgICAgICAgZGlzYWJsZWQ9e3ZhbHVlcy51c2VTZXNzaW9uTW9kZWx9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gYWN0aW9ucy5lZGl0KCdiYXNlVXJsJywgZS50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc0ZpZWxkXCI+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzTGFiZWxcIiBodG1sRm9yPVwib3B0aS1hcGkta2V5XCI+e3QoJ3NldHRpbmdzLmFwaUtleScpfTwvbGFiZWw+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgaWQ9XCJvcHRpLWFwaS1rZXlcIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJvcHRpU2V0dGluZ3NJbnB1dFwiXG4gICAgICAgICAgICAgIHR5cGU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgIHZhbHVlPXt2YWx1ZXMuYXBpS2V5fVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cInNrLeKAplwiXG4gICAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cIm9mZlwiXG4gICAgICAgICAgICAgIGRpc2FibGVkPXt2YWx1ZXMudXNlU2Vzc2lvbk1vZGVsfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IGFjdGlvbnMuZWRpdCgnYXBpS2V5JywgZS50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc0ZpZWxkXCI+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzTGFiZWxcIiBodG1sRm9yPVwib3B0aS1tb2RlbFwiPnt0KCdzZXR0aW5ncy5tb2RlbCcpfTwvbGFiZWw+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgaWQ9XCJvcHRpLW1vZGVsXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzSW5wdXRcIlxuICAgICAgICAgICAgICB2YWx1ZT17dmFsdWVzLm1vZGVsfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17dmFsdWVzLnVzZVNlc3Npb25Nb2RlbCA/ICfigJQnIDogREVGQVVMVFMubW9kZWx9XG4gICAgICAgICAgICAgIGRpc2FibGVkPXt2YWx1ZXMudXNlU2Vzc2lvbk1vZGVsfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IGFjdGlvbnMuZWRpdCgnbW9kZWwnLCBlLnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzUm93XCI+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJvcHRpU2V0dGluZ3NCdG4gcHJpbWFyeVwiIG9uQ2xpY2s9e2hhbmRsZVNhdmV9PlxuICAgICAgICAgICAgICB7dCgnc2V0dGluZ3Muc2F2ZScpfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJvcHRpU2V0dGluZ3NCdG5cIiBvbkNsaWNrPXtoYW5kbGVSZXNldH0+XG4gICAgICAgICAgICAgIHt0KCdzZXR0aW5ncy5yZXNldCcpfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICB7c2F2ZWQgJiYgPHNwYW4gY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzSGludFwiPnt0KCdzZXR0aW5ncy5zYXZlZCcpfTwvc3Bhbj59XG4gICAgICAgICAgICB7cnBjRXJyb3IgJiYgPHNwYW4gY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzRXJyXCI+e3JwY0Vycm9yfTwvc3Bhbj59XG4gICAgICAgICAgICB7IXJwY0Vycm9yICYmIGVycm9yICYmIDxzcGFuIGNsYXNzTmFtZT1cIm9wdGlTZXR0aW5nc0VyclwiPnt0KGVycm9yKX08L3NwYW4+fVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwib3B0aVNldHRpbmdzSGludFwiPnt0KCdzZXR0aW5ncy5kZXNjJyl9PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKX1cbiAgICA8L2Rpdj5cbiAgKTtcbn1cbiIsICIvKiog6K6+572u6KGo5Y2V5qCh6aqMIOKAlOKAlCDnuq/lh73mlbDvvIzml6AgRFNIIOS+nei1liAqL1xuXG5leHBvcnQgaW50ZXJmYWNlIFNldHRpbmdzRm9ybVZhbHVlcyB7XG4gIGJhc2VVcmw6IHN0cmluZztcbiAgYXBpS2V5OiBzdHJpbmc7XG4gIG1vZGVsOiBzdHJpbmc7XG4gIC8qKiB0cnVl77ya5LyY5YyW5L2/55So5b2T5YmN5Lya6K+d5qih5Z6L77ybZmFsc2XvvJrkvb/nlKggbW9kZWwgKi9cbiAgdXNlU2Vzc2lvbk1vZGVsOiBib29sZWFuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVTZXR0aW5nc0Zvcm0odmFsdWVzOiBTZXR0aW5nc0Zvcm1WYWx1ZXMpOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHtcbiAgY29uc3QgZXJyb3JzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG5cbiAgY29uc3QgdXJsID0gdmFsdWVzLmJhc2VVcmwudHJpbSgpO1xuICBpZiAoIXVybCkge1xuICAgIGVycm9ycy5iYXNlVXJsID0gJ3NldHRpbmdzLmJhc2VVcmwnO1xuICB9IGVsc2Uge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB1ID0gbmV3IFVSTCh1cmwpO1xuICAgICAgaWYgKHUucHJvdG9jb2wgIT09ICdodHRwczonICYmIHUucHJvdG9jb2wgIT09ICdodHRwOicpIHRocm93IG5ldyBFcnJvcigncHJvdG9jb2wnKTtcbiAgICAgIGlmICh1LnNlYXJjaCB8fCB1Lmhhc2gpIHRocm93IG5ldyBFcnJvcigncXVlcnktb3ItaGFzaCcpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgZXJyb3JzLmJhc2VVcmwgPSAnc2V0dGluZ3MuYmFzZVVybCc7XG4gICAgfVxuICB9XG5cbiAgaWYgKCF2YWx1ZXMuYXBpS2V5LnRyaW0oKSkgZXJyb3JzLmFwaUtleSA9ICdzZXR0aW5ncy5hcGlLZXknO1xuICBpZiAoIXZhbHVlcy51c2VTZXNzaW9uTW9kZWwgJiYgIXZhbHVlcy5tb2RlbC50cmltKCkpIGVycm9ycy5tb2RlbCA9ICdzZXR0aW5ncy5tb2RlbCc7XG5cbiAgcmV0dXJuIGVycm9ycztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTZXR0aW5nc0Zvcm1TdGF0ZSB7XG4gIHZhbHVlczogU2V0dGluZ3NGb3JtVmFsdWVzO1xuICBkaXJ0eTogYm9vbGVhbjtcbiAgc2F2ZWQ6IGJvb2xlYW47XG4gIGVycm9yOiBzdHJpbmcgfCBudWxsO1xuICByZXZpc2lvbjogbnVtYmVyO1xufVxuXG5leHBvcnQgY29uc3QgSU5JVElBTF9TRVRUSU5HU19GT1JNOiBTZXR0aW5nc0Zvcm1TdGF0ZSA9IHtcbiAgdmFsdWVzOiB7IGJhc2VVcmw6ICcnLCBhcGlLZXk6ICcnLCBtb2RlbDogJycsIHVzZVNlc3Npb25Nb2RlbDogdHJ1ZSB9LFxuICBkaXJ0eTogZmFsc2UsXG4gIHNhdmVkOiBmYWxzZSxcbiAgZXJyb3I6IG51bGwsXG4gIHJldmlzaW9uOiAtMSxcbn07XG5cbmV4cG9ydCB0eXBlIFNldHRpbmdzRm9ybUFjdGlvbiA9XG4gIHwgeyB0eXBlOiAnc2VlZCc7IHZhbHVlczogU2V0dGluZ3NGb3JtVmFsdWVzOyByZXZpc2lvbjogbnVtYmVyIH1cbiAgfCB7IHR5cGU6ICdlZGl0JzsgZmllbGQ6IGtleW9mIFNldHRpbmdzRm9ybVZhbHVlczsgdmFsdWU6IHN0cmluZyB8IGJvb2xlYW4gfVxuICB8IHsgdHlwZTogJ2NvbW1pdCc7IHJldmlzaW9uOiBudW1iZXIgfVxuICB8IHsgdHlwZTogJ2ZhaWwnOyBtZXNzYWdlOiBzdHJpbmcgfTtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlZHVjZVNldHRpbmdzRm9ybShzdGF0ZTogU2V0dGluZ3NGb3JtU3RhdGUsIGFjdGlvbjogU2V0dGluZ3NGb3JtQWN0aW9uKTogU2V0dGluZ3NGb3JtU3RhdGUge1xuICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgY2FzZSAnc2VlZCc6XG4gICAgICByZXR1cm4gYWN0aW9uLnJldmlzaW9uIDw9IHN0YXRlLnJldmlzaW9uXG4gICAgICAgID8gc3RhdGVcbiAgICAgICAgOiB7IC4uLnN0YXRlLCB2YWx1ZXM6IHsgLi4uYWN0aW9uLnZhbHVlcyB9LCBkaXJ0eTogZmFsc2UsIHNhdmVkOiBmYWxzZSwgZXJyb3I6IG51bGwsIHJldmlzaW9uOiBhY3Rpb24ucmV2aXNpb24gfTtcbiAgICBjYXNlICdlZGl0JzpcbiAgICAgIHJldHVybiB7IC4uLnN0YXRlLCB2YWx1ZXM6IHsgLi4uc3RhdGUudmFsdWVzLCBbYWN0aW9uLmZpZWxkXTogYWN0aW9uLnZhbHVlIH0sIGRpcnR5OiB0cnVlLCBzYXZlZDogZmFsc2UsIGVycm9yOiBudWxsIH07XG4gICAgY2FzZSAnY29tbWl0JzpcbiAgICAgIHJldHVybiB7IC4uLnN0YXRlLCBkaXJ0eTogZmFsc2UsIHNhdmVkOiB0cnVlLCBlcnJvcjogbnVsbCwgcmV2aXNpb246IGFjdGlvbi5yZXZpc2lvbiB9O1xuICAgIGNhc2UgJ2ZhaWwnOlxuICAgICAgcmV0dXJuIHsgLi4uc3RhdGUsIGVycm9yOiBhY3Rpb24ubWVzc2FnZSB9O1xuICB9XG59XG4iLCAiLyoqIOiuvue9ruihqOWNlSBzdG9yZe+8muiHquWunueOsCBkZWZpbmVTdG9yZe+8jOmbtiBAZGVlcHNlZWstYWkg6L+Q6KGM5pe25L6d6LWW77yI5qGM6Z2i5riy5p+T5Zmo5YW85a6577yJICovXG5pbXBvcnQge1xuICBJTklUSUFMX1NFVFRJTkdTX0ZPUk0sXG4gIHJlZHVjZVNldHRpbmdzRm9ybSxcbiAgdmFsaWRhdGVTZXR0aW5nc0Zvcm0sXG4gIHR5cGUgU2V0dGluZ3NGb3JtU3RhdGUsXG4gIHR5cGUgU2V0dGluZ3NGb3JtVmFsdWVzLFxufSBmcm9tICcuL3NldHRpbmdzLWZvcm0tc3RhdGUuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNldHRpbmdzRm9ybUFjdGlvbnMge1xuICBzZWVkKHZhbHVlczogU2V0dGluZ3NGb3JtVmFsdWVzLCByZXZpc2lvbjogbnVtYmVyKTogdm9pZDtcbiAgZWRpdChmaWVsZDoga2V5b2YgU2V0dGluZ3NGb3JtVmFsdWVzLCB2YWx1ZTogc3RyaW5nKTogdm9pZDtcbiAgY29tbWl0KHJldmlzaW9uOiBudW1iZXIpOiB2b2lkO1xuICBmYWlsKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQ7XG4gIC8qKiDkv53lrZjliY3moKHpqozvvJvov5Tlm57plJnor6/lrZflhbjvvJvml6DplJnor6/ml7bov5Tlm54gbnVsbCAqL1xuICB2YWxpZGF0ZSh2YWx1ZXM6IFNldHRpbmdzRm9ybVZhbHVlcyk6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gfCBudWxsO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNldHRpbmdzRm9ybVN0b3JlSGFuZGxlIHtcbiAgc3BlYzoge1xuICAgIGluaXQ6ICgpID0+IFNldHRpbmdzRm9ybVN0YXRlO1xuICAgIGFjdGlvbnM6IFJlY29yZDxzdHJpbmcsIChkOiBTZXR0aW5nc0Zvcm1TdGF0ZSwgLi4uYXJnczogYW55W10pID0+IHZvaWQ+O1xuICB9O1xuICBjcmVhdGUoc2NvcGVLZXk/OiBzdHJpbmcpOiB7XG4gICAgYWN0aW9uczogU2V0dGluZ3NGb3JtQWN0aW9ucztcbiAgICBnZXRTbmFwc2hvdDogKCkgPT4gU2V0dGluZ3NGb3JtU3RhdGU7XG4gICAgc3Vic2NyaWJlOiAoZm46ICgpID0+IHZvaWQpID0+ICgpID0+IHZvaWQ7XG4gICAgc3RvcmU6IHVua25vd247XG4gICAgY2xlYXJQZXJzaXN0ZWQ6ICgpID0+IHZvaWQ7XG4gIH07XG59XG5cbi8qKiDoh6rlrp7njrAgZGVmaW5lU3RvcmUg4oCU4oCUIOmBv+WFjSBAZGVlcHNlZWstYWkvZHNoLWNsaWVudC1ydW50aW1lL2NsaWVudCDnmoQgcmVxdWlyZSDlnKjmoYzpnaLmuLLmn5Plmajml6Dms5Xop6PmnpAgKi9cbmZ1bmN0aW9uIGRlZmluZVN0b3JlKGRlY2w6IHtcbiAgaW5pdDogKCkgPT4gU2V0dGluZ3NGb3JtU3RhdGU7XG4gIGFjdGlvbnM6IFJlY29yZDxzdHJpbmcsIChkOiBTZXR0aW5nc0Zvcm1TdGF0ZSwgLi4uYXJnczogYW55W10pID0+IHZvaWQ+O1xufSkge1xuICByZXR1cm4ge1xuICAgIHNwZWM6IGRlY2wsXG4gICAgY3JlYXRlKF9zY29wZUtleT86IHN0cmluZyk6IHtcbiAgICAgIGFjdGlvbnM6IFNldHRpbmdzRm9ybUFjdGlvbnM7XG4gICAgICBnZXRTbmFwc2hvdDogKCkgPT4gU2V0dGluZ3NGb3JtU3RhdGU7XG4gICAgICBzdWJzY3JpYmU6IChmbjogKCkgPT4gdm9pZCkgPT4gKCkgPT4gdm9pZDtcbiAgICAgIHN0b3JlOiB1bmtub3duO1xuICAgICAgY2xlYXJQZXJzaXN0ZWQ6ICgpID0+IHZvaWQ7XG4gICAgfSB7XG4gICAgICBsZXQgc3RhdGUgPSBkZWNsLmluaXQoKTtcbiAgICAgIGNvbnN0IGxpc3RlbmVycyA9IG5ldyBTZXQ8KCkgPT4gdm9pZD4oKTtcbiAgICAgIGNvbnN0IG5vdGlmeSA9ICgpID0+IHsgZm9yIChjb25zdCBmbiBvZiBsaXN0ZW5lcnMpIGZuKCk7IH07XG4gICAgICBjb25zdCBzdG9yZSA9IHtcbiAgICAgICAgZ2V0U25hcHNob3Q6ICgpID0+IHN0YXRlLFxuICAgICAgICBzdWJzY3JpYmU6IChmbjogKCkgPT4gdm9pZCkgPT4geyBsaXN0ZW5lcnMuYWRkKGZuKTsgcmV0dXJuICgpID0+IHZvaWQgbGlzdGVuZXJzLmRlbGV0ZShmbik7IH0sXG4gICAgICAgIHVwZGF0ZTogKG11dGF0b3I6IChkcmFmdDogU2V0dGluZ3NGb3JtU3RhdGUpID0+IHZvaWQpID0+IHtcbiAgICAgICAgICBjb25zdCBkcmFmdCA9IHsgLi4uc3RhdGUsIHZhbHVlczogeyAuLi5zdGF0ZS52YWx1ZXMgfSB9O1xuICAgICAgICAgIG11dGF0b3IoZHJhZnQpO1xuICAgICAgICAgIHN0YXRlID0gZHJhZnQ7XG4gICAgICAgICAgbm90aWZ5KCk7XG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgICAgY29uc3QgYWN0aW9uczogUmVjb3JkPHN0cmluZywgKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkPiA9IHt9O1xuICAgICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoZGVjbC5hY3Rpb25zKSkge1xuICAgICAgICBjb25zdCBtdXRhdGUgPSBkZWNsLmFjdGlvbnNba2V5XTtcbiAgICAgICAgYWN0aW9uc1trZXldID0gKC4uLnBhcmFtczogYW55W10pID0+IHtcbiAgICAgICAgICBzdG9yZS51cGRhdGUoKGRyYWZ0OiBTZXR0aW5nc0Zvcm1TdGF0ZSkgPT4geyBtdXRhdGUoZHJhZnQsIC4uLnBhcmFtcyk7IH0pO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYWN0aW9uczogYWN0aW9ucyBhcyB1bmtub3duIGFzIFNldHRpbmdzRm9ybUFjdGlvbnMsXG4gICAgICAgIGdldFNuYXBzaG90OiBzdG9yZS5nZXRTbmFwc2hvdCxcbiAgICAgICAgc3Vic2NyaWJlOiBzdG9yZS5zdWJzY3JpYmUsXG4gICAgICAgIHN0b3JlLFxuICAgICAgICBjbGVhclBlcnNpc3RlZDogKCkgPT4ge1xuICAgICAgICAgIGlmICh0eXBlb2YgbG9jYWxTdG9yYWdlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdHJ5IHsgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2RzaC1wcm9tcHQtb3B0aW1pemVyL3NldHRpbmdzJyk7IH0gY2F0Y2gge31cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH0sXG4gIH07XG59XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVTZXR0aW5nc0Zvcm1TdG9yZSA9ICgpOiBTZXR0aW5nc0Zvcm1TdG9yZUhhbmRsZSA9PiB7XG4gIHJldHVybiBkZWZpbmVTdG9yZSh7XG4gICAgaW5pdDogKCk6IFNldHRpbmdzRm9ybVN0YXRlID0+ICh7XG4gICAgICAuLi5JTklUSUFMX1NFVFRJTkdTX0ZPUk0sXG4gICAgICB2YWx1ZXM6IHsgLi4uSU5JVElBTF9TRVRUSU5HU19GT1JNLnZhbHVlcyB9LFxuICAgIH0pLFxuICAgIGFjdGlvbnM6IHtcbiAgICAgIHNlZWQ6IChkOiBTZXR0aW5nc0Zvcm1TdGF0ZSwgdmFsdWVzOiBTZXR0aW5nc0Zvcm1WYWx1ZXMsIHJldmlzaW9uOiBudW1iZXIpID0+XG4gICAgICAgIE9iamVjdC5hc3NpZ24oZCwgcmVkdWNlU2V0dGluZ3NGb3JtKGQsIHsgdHlwZTogJ3NlZWQnLCB2YWx1ZXMsIHJldmlzaW9uIH0pKSxcbiAgICAgIGVkaXQ6IChkOiBTZXR0aW5nc0Zvcm1TdGF0ZSwgZmllbGQ6IGtleW9mIFNldHRpbmdzRm9ybVZhbHVlcywgdmFsdWU6IHN0cmluZykgPT5cbiAgICAgICAgT2JqZWN0LmFzc2lnbihkLCByZWR1Y2VTZXR0aW5nc0Zvcm0oZCwgeyB0eXBlOiAnZWRpdCcsIGZpZWxkLCB2YWx1ZSB9KSksXG4gICAgICBjb21taXQ6IChkOiBTZXR0aW5nc0Zvcm1TdGF0ZSwgcmV2aXNpb246IG51bWJlcikgPT5cbiAgICAgICAgT2JqZWN0LmFzc2lnbihkLCByZWR1Y2VTZXR0aW5nc0Zvcm0oZCwgeyB0eXBlOiAnY29tbWl0JywgcmV2aXNpb24gfSkpLFxuICAgICAgZmFpbDogKGQ6IFNldHRpbmdzRm9ybVN0YXRlLCBtZXNzYWdlOiBzdHJpbmcpID0+XG4gICAgICAgIE9iamVjdC5hc3NpZ24oZCwgcmVkdWNlU2V0dGluZ3NGb3JtKGQsIHsgdHlwZTogJ2ZhaWwnLCBtZXNzYWdlIH0pKSxcbiAgICAgIHZhbGlkYXRlOiAoX2Q6IFNldHRpbmdzRm9ybVN0YXRlLCB2YWx1ZXM6IFNldHRpbmdzRm9ybVZhbHVlcykgPT4ge1xuICAgICAgICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0ZVNldHRpbmdzRm9ybSh2YWx1ZXMpO1xuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMoZXJyb3JzKS5sZW5ndGggPT09IDAgPyBudWxsIDogZXJyb3JzO1xuICAgICAgfSxcbiAgICB9LFxuICB9KTtcbn07Il0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FDY08sSUFBTSxvQkFBK0I7QUFFNUMsSUFBTSxjQUFvQyxDQUFDLFNBQVMsWUFBWSxNQUFNO0FBQ3RFLFNBQVMsWUFBWSxHQUF1QjtBQUMxQyxTQUFPLE9BQU8sTUFBTSxZQUFhLFlBQWtDLFNBQVMsQ0FBQyxJQUN4RSxJQUNEO0FBQ047QUFFTyxJQUFNLFdBQXlCO0FBQUEsRUFDcEMsU0FBUztBQUFBLEVBQ1QsUUFBUTtBQUFBLEVBQ1IsT0FBTztBQUFBLEVBQ1AsaUJBQWlCO0FBQUEsRUFDakIsV0FBVztBQUNiO0FBSU8sU0FBUyxpQkFBaUIsS0FBcUI7QUFDcEQsU0FBTyxJQUFJLEtBQUssRUFBRSxRQUFRLFFBQVEsRUFBRTtBQUN0QztBQUVPLFNBQVMsWUFBWSxLQUE2RDtBQUN2RixRQUFNLFVBQVUsT0FBTyxLQUFLLFlBQVksWUFB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QUFDQSx1QkFBTyxFQUFFLFdBQVcsT0FBTyxPQUFRLElBQUksVUFBVSxJQUFJLE1BQU0sV0FBVyxJQUFJLE1BQU0sU0FBVSxhQUFhO0FBQUEsY0FDekcsU0FBUyxHQUFHO0FBQ1YsdUJBQU8sRUFBRSxXQUFXLE9BQU8sT0FBTyxPQUFRLEdBQTZCLFdBQVcsQ0FBQyxFQUFFO0FBQUEsY0FDdkY7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGLENBQUM7QUFHRCxRQUFNLFlBQVksQ0FBQyxNQUFxQjtBQUN0QyxRQUFJLENBQUMsRUFBRSxVQUFVLEVBQUUsU0FBUyxPQUFRO0FBQ3BDLFVBQU0sS0FBSyxTQUFTO0FBQ3BCLFVBQU0sVUFDSixjQUFjLHVCQUNiLGNBQWMsZ0JBQWdCLEdBQUcscUJBQXFCLEdBQUcsUUFBUSx1QkFBdUIsTUFBTTtBQUNqRyxRQUFJLENBQUMsUUFBUztBQUNkLE1BQUUsZUFBZTtBQUNqQix3QkFBb0I7QUFBQSxFQUN0QjtBQUNBLFdBQVMsaUJBQWlCLFdBQVcsU0FBUztBQUNoRDsiLAogICJuYW1lcyI6IFsic3RhdGUiLCAiUmVhY3QiLCAiaW1wb3J0X3JlYWN0IiwgImltcG9ydF9qc3hfcnVudGltZSIsICJDU1NfSUQiLCAiaW5qZWN0Q3NzIiwgInRleHRPZklucHV0IiwgImlzU2Vzc2lvbklucHV0IiwgInN0YXRlIiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfanN4X3J1bnRpbWUiLCAiQ1NTX0lEIiwgImluamVjdENzcyIsICJzdGF0ZSIsICJzdGF0ZSIsICJsaXN0ZW5lcnMiXQp9Cg==

    return module.exports;
  }
});
