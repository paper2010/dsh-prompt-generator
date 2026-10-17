// 本项目由 AI 辅助优化完成（提示词内核、测试与文档），发布前经人工审阅。
/** Prompt 优化核心：配置校验、OpenAI 兼容调用、结果提取 —— 纯函数，零 DSH 依赖 */

export interface PromptConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  /** true（默认）：优化请求使用当前会话的模型；false：使用下方自定义 model */
  useSessionModel: boolean;
  /** 优化强度：light 轻改 / standard 九段骨架（默认） / deep 深度 */
  intensity: Intensity;
}

/** 优化强度：light = 轻改（保留原句式）；standard = 九段骨架（默认）；deep = 骨架 + 步骤判据 + 失败模式 + 示例 */
export type Intensity = 'light' | 'standard' | 'deep';
export const DEFAULT_INTENSITY: Intensity = 'standard';

const INTENSITIES: readonly Intensity[] = ['light', 'standard', 'deep'];
function asIntensity(v: unknown): Intensity {
  return typeof v === 'string' && (INTENSITIES as readonly string[]).includes(v)
    ? (v as Intensity)
    : DEFAULT_INTENSITY;
}

export const DEFAULTS: PromptConfig = {
  baseUrl: 'https://api.deepseek.com',
  apiKey: '',
  model: 'deepseek-v4-flash',
  useSessionModel: true,
  intensity: DEFAULT_INTENSITY,
};

export type Lang = 'zh' | 'en';

export function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

export function mergeConfig(raw: Partial<PromptConfig> | null | undefined): PromptConfig {
  const baseUrl = typeof raw?.baseUrl === 'string' && raw.baseUrl.trim() ? raw.baseUrl.trim() : DEFAULTS.baseUrl;
  const apiKey = typeof raw?.apiKey === 'string' ? raw.apiKey : DEFAULTS.apiKey;
  // 旧默认迁移：默认 baseUrl 下残留的 deepseek-chat（v1 默认）视为未设置，落到新默认 deepseek-v4-flash；
  // 自定义过 baseUrl（显式选择）则保留原模型名
  const rawModel = typeof raw?.model === 'string' && raw.model.trim() ? raw.model.trim() : DEFAULTS.model;
  const migratedDefault =
    rawModel === 'deepseek-chat' && normalizeBaseUrl(baseUrl) === DEFAULTS.baseUrl ? DEFAULTS.model : rawModel;
  const model = migratedDefault;
  const useSessionModel = typeof raw?.useSessionModel === 'boolean' ? raw.useSessionModel : DEFAULTS.useSessionModel;
  const intensity = asIntensity(raw?.intensity);
  return { baseUrl: normalizeBaseUrl(baseUrl), apiKey, model, useSessionModel, intensity };
}

export type ConfigProblem = 'missing-key' | 'missing-model' | 'bad-url';
export type ConfigCheck = { ok: true; config: PromptConfig } | { ok: false; reason: ConfigProblem };

export function checkConfig(config: PromptConfig): ConfigCheck {
  if (!config.apiKey.trim()) return { ok: false, reason: 'missing-key' };
  // 使用当前会话模型时无需自定义 model；仅自定义模式要求 model 非空
  if (!config.useSessionModel && !config.model.trim()) return { ok: false, reason: 'missing-model' };
  try {
    const u = new URL(normalizeBaseUrl(config.baseUrl));
    if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new Error('protocol');
    if (u.search || u.hash) throw new Error('query-or-hash');
  } catch {
    return { ok: false, reason: 'bad-url' };
  }
  return { ok: true, config };
}

/** 注入到 system 的记忆上下文（全部可选；缺省时退化为「无记忆」的纯结构重写） */
export interface SystemContext {
  /** 长期偏好画像（由采纳记录反思得到，≤600 字） */
  profile?: string;
  /** 最近被采纳的样例（学习结构颗粒度，不照抄内容） */
  examples?: { draft: string; result: string }[];
  /** 本会话最近的草稿（了解当前话题语境） */
  recentDrafts?: string[];
  intensity?: Intensity;
}

const ZH_RULES = `你是「提示词架构师」，不是润色器。

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

const ZH_MEMORY_HEAD = `## 用户长期偏好（来自历史采纳记录，优先遵守）`;
const ZH_EXAMPLES_HEAD = `## 最近被采纳的样例（学习结构与颗粒度，禁止照抄内容）`;
const ZH_SESSION_HEAD = `## 本会话最近草稿（仅用于理解当前语境，不要直接引用其措辞）`;
const ZH_LIGHT = `\n\n## 本次强度：轻改\n只做最小必要改动，保持草稿原有的句式与体量。若原文已详实：删冗余、把含糊处量化，不新增小节。若原文过简：只补「输出格式」与「一条验收标准」，不要展开成多段骨架。任何情况下都不许丢信息。`;
const ZH_DEEP = `\n\n## 本次强度：深度\n深度不等于更长，别用篇幅冒充充分。①稀疏型：任务分解每一步标注 输入 / 产出 / 通过判据；②密集型：**不增节**，改为在末尾输出一张「信息核对表」，逐条确认 目标 / 范围 / 约束 / 期望输出 是否都还在、落在哪一节；③失败模式至少 3 条，每条给出对应自检动作；④不为了显得完整而加示例——只有当示例能消除歧义时才加。`;

const EN_RULES = `You are a PROMPT ARCHITECT, not a polisher.

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

const EN_MEMORY_HEAD = `## Long-term user preferences (learned from accepted history — obey first)`;
const EN_EXAMPLES_HEAD = `## Recently accepted samples (learn their structure and granularity; never copy the content)`;
const EN_SESSION_HEAD = `## Recent drafts in this session (context only — do not quote their wording)`;
const EN_LIGHT = `\n\n## Intensity for this run: light\nMake the minimum necessary change and keep the draft's own sentence shape and size. If the draft is already detailed: cut redundancy and quantify vague wording — add no new sections. If the draft is thin: add only "Output Format" and one acceptance criterion; do not expand into the full skeleton. Never lose information either way.`;
const EN_DEEP = `\n\n## Intensity for this run: deep\nDeep does not mean longer — never use length as a stand-in for rigour. (1) Sparse drafts: every step in "Task Breakdown" states input / output / pass criterion. (2) Dense drafts: **add no sections**; instead append an "Information Check" table confirming that goal / scope / constraints / expected output all survived and where each now lives. (3) At least 3 failure modes, each with a matching self-check action. (4) Never add examples just to look complete — only when an example removes real ambiguity.`;

function memoryBlock(lang: Lang, ctx: SystemContext): string {
  const parts: string[] = [];
  const profile = (ctx.profile ?? '').trim();
  if (profile) parts.push(`${lang === 'zh' ? ZH_MEMORY_HEAD : EN_MEMORY_HEAD}\n${profile.slice(0, 1200)}`);

  const examples = (ctx.examples ?? []).filter((e) => e && e.draft && e.result).slice(0, 3);
  if (examples.length) {
    const blocks = examples.map(
      (e, i) =>
        `### ${lang === 'zh' ? `样例 ${i + 1}` : `Sample ${i + 1}`}\n` +
        `${lang === 'zh' ? '草稿' : 'Draft'}: ${e.draft.slice(0, 300)}\n` +
        `${lang === 'zh' ? '采纳结果（节选）' : 'Accepted result (excerpt)'}:\n${e.result.slice(0, 700)}`,
    );
    parts.push(`${lang === 'zh' ? ZH_EXAMPLES_HEAD : EN_EXAMPLES_HEAD}\n${blocks.join('\n\n')}`);
  }

  const drafts = (ctx.recentDrafts ?? []).filter(Boolean).slice(-5);
  if (drafts.length) {
    parts.push(
      `${lang === 'zh' ? ZH_SESSION_HEAD : EN_SESSION_HEAD}\n` +
        drafts.map((d) => `- ${d.slice(0, 160)}`).join('\n'),
    );
  }
  return parts.join('\n\n');
}

/**
 * 构造 system 提示词：静态规则（与语言、强度相关）+ 动态记忆块。
 * 记忆块放在末尾并显式标注「来自历史记录」——模型对末段权重更高，
 * 同时避免记忆内容污染前面的铁律。
 */
export function buildSystemPrompt(lang: Lang, ctx: SystemContext = {}): string {
  const intensity = ctx.intensity ?? DEFAULT_INTENSITY;
  const base = lang === 'zh' ? ZH_RULES : EN_RULES;
  const tail = intensity === 'light' ? (lang === 'zh' ? ZH_LIGHT : EN_LIGHT) : intensity === 'deep' ? (lang === 'zh' ? ZH_DEEP : EN_DEEP) : '';
  const memory = memoryBlock(lang, ctx);
  return memory ? `${base}${tail}\n\n---\n\n${memory}` : `${base}${tail}`;
}

export function buildRequestBody(
  config: PromptConfig,
  text: string,
  lang: Lang,
  stream = false,
  system?: string,
  ctx: SystemContext = {},
): object {
  return {
    model: config.model,
    messages: [
      { role: 'system', content: system ?? buildSystemPrompt(lang, ctx) },
      { role: 'user', content: text },
    ],
    // 重写任务需要稳定复现：0.7 会引入不必要的措辞漂移，且容易「自由发挥」补事实
    temperature: 0.35,
    max_tokens: 4096,
    stream,
  };
}

/** 剥离常见引导前缀：model 偶尔在正文前输出「优化后的提示词：」「优化后的 Prompt：」
 *  「优化结果如下：」等，让结果无法一键替换。带冒号/「如下」才剥，避免误伤正文本身
 *  （如一段正文恰好以「优化结果」开头但无冒号）。 */
/** 输出形态兜底清洗（不替代提示词规则，只兜住模型手误）：
 *  1. 字面转义还原 —— 草稿从 JSON / 日志 / 聊天记录里粘出来时，换行往往是字面的两个字符
 *     「反斜杠 + n」，模型会照抄，最终粘进输入框不会换行。仅在「几乎没有真实换行，
 *     但字面换行出现 ≥3 次」时还原，避免破坏本就是代码或 JSON 的正文。
 *  2. 畸形标题去符号 —— 「##角色」把 # 与文字直接粘住，不符合 Markdown 规范，是手误；
 *     带空格的规范标题（「## 角色」）保持原样，交由提示词规则约束。
 */
export function normalizePromptText(raw: string): string {
  let s = raw ?? '';
  const realBreaks = (s.match(/\n/g) ?? []).length;
  const literalBreaks = (s.match(/\\r\\n|\\n/g) ?? []).length;
  if (literalBreaks >= 3 && realBreaks <= literalBreaks / 4) {
    s = s.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\\t/g, '  ');
  }
  // 先去转义，再处理标题：转义还原后标题才真正位于行首。
  // 用 (?=[^\s#]) 而非 (?=\S)：否则 "## 角色" 会回溯成匹配单个 "#"，把规范标题也改坏。
  s = s.replace(/^#+(?=[^\s#])/gm, '');
  return s;
}

export function stripLeadIn(text: string): string {
  let s = normalizePromptText(text).trim();
  // 中：「优化后的提示词：」「优化结果：」「优化后的 Prompt：」—— 必须带冒号或「如下」
  s = s.replace(/^优化(?:后|过的|后的)?[ \t]*(?:提示词|Prompt|prompt|内容|结果|指令)(?:如下)?[ \t]*[\s：:][ \t]*/u, '').trim();
  // 英："Optimized prompt:" "Rewritten result:" —— 必须带冒号
  s = s.replace(/^(?:Optimized|Rewritten|Refined)\s+(?:prompt|instruction|content|result|draft)[\s：:][ \t]*/iu, '').trim();
  return s;
}

export function extractResult(raw: string): string {
  let s = raw.trim();
  const fence = /^```[a-zA-Z0-9_+-]*\n([\s\S]*?)\n?```$/;
  const matched = s.match(fence);
  if (matched) s = matched[1].trim();
  return stripLeadIn(s);
}

export function canTrigger(draft: string, busy: boolean): boolean {
  return !busy && draft.trim().length > 0;
}

export type OptimizeErrorKind =
  | 'config'
  | 'unauthorized'
  | 'forbidden'
  | 'http'
  | 'timeout'
  | 'network'
  | 'cors'
  | 'bad-response'
  | 'empty'
  | 'truncated';

export class OptimizeError extends Error {
  constructor(
    public readonly kind: OptimizeErrorKind,
    message: string,
  ) {
    super(message);
    this.name = 'OptimizeError';
  }
}

export const REQUEST_TIMEOUT_MS = 60_000;

function extractChoiceContent(payload: unknown): string | null {
  if (typeof payload !== 'object' || payload === null) return null;
  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;
  const first = choices[0] as { message?: { content?: unknown } };
  const content = first?.message?.content;
  return typeof content === 'string' ? content : null;
}

/** 非流式响应的 finish_reason（'length' = 被 max_tokens 截断）。 */
function extractFinishReason(payload: unknown): string | null {
  if (typeof payload !== 'object' || payload === null) return null;
  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;
  const fr = (choices[0] as { finish_reason?: unknown }).finish_reason;
  return typeof fr === 'string' ? fr : null;
}

/** 流式 SSE 行里的 finish_reason；非 data 行 / 无该字段 → null。纯函数，便于单测。 */
export function extractSseFinishReason(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith('data:')) return null;
  const data = trimmed.slice('data:'.length).trim();
  if (data === '[DONE]') return null;
  let payload: unknown;
  try {
    payload = JSON.parse(data);
  } catch {
    return null;
  }
  if (typeof payload !== 'object' || payload === null) return null;
  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;
  const fr = (choices[0] as { finish_reason?: unknown }).finish_reason;
  return typeof fr === 'string' ? fr : null;
}

export function toErrorKind(e: unknown): OptimizeError {
  if (e instanceof OptimizeError) return e;
  const isAbort =
    (typeof DOMException !== 'undefined' && e instanceof DOMException && e.name === 'AbortError') ||
    (e instanceof Error && (e as Error).name === 'AbortError');
  if (isAbort) return new OptimizeError('timeout', 'request aborted');
  if (e instanceof TypeError) {
    const m = String(e.message ?? '');
    // 尽力而为：Chromium 的 CORS 失败通常是 TypeError("Failed to fetch")（无 cors 字样），会落到 network；此分支仅捕获自带 CORS 字样的错误。
    if (/cors/i.test(m)) return new OptimizeError('cors', m);
    return new OptimizeError('network', m || 'network error');
  }
  return new OptimizeError('network', String((e as Error)?.message ?? e));
}

export async function optimize(opts: {
  config: PromptConfig;
  text: string;
  lang: Lang;
  signal?: AbortSignal;
  /** 已构造好的 system（含记忆）；不传则按 memory 现构造 */
  system?: string;
  memory?: SystemContext;
}): Promise<string> {
  const { config, text, lang, signal, system, memory } = opts;
  const context = memory ?? {};
  const check = checkConfig(config);
  if (!check.ok) throw new OptimizeError('config', check.reason);

  let res: Response;
  try {
    res = await fetch(`${normalizeBaseUrl(config.baseUrl)}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(buildRequestBody(config, text, lang, false, system, context)),
      signal,
    });
  } catch (e) {
    throw toErrorKind(e);
  }

  if (res.status === 401) throw new OptimizeError('unauthorized', `HTTP 401`);
  if (res.status === 403) throw new OptimizeError('forbidden', `HTTP 403`);
  if (!res.ok) throw new OptimizeError('http', `HTTP ${res.status}`);

  let payload: unknown;
  try {
    payload = await res.json();
  } catch {
    throw new OptimizeError('bad-response', 'invalid JSON');
  }
  const content = extractChoiceContent(payload);
  if (!content || !content.trim()) throw new OptimizeError('empty', 'empty completion');
  // 截断检测：被 max_tokens 切断的结果是半截产物，静默返回会违反 R7 信息守恒——
  // 明确报错，让用户缩短草稿后重试，而不是拿到一份看起来完整的残次品
  if (extractFinishReason(payload) === 'length') {
    throw new OptimizeError('truncated', 'output truncated by max_tokens');
  }
  return extractResult(content);
}

/**
 * SSE 增量事件：内容或推理过程的一段文本。
 * v4 系模型（v4-flash 等）流式先输出长段 reasoning_content（推理过程），随后才输出
 * content 正文——两者都要实时呈现，否则推理期卡片看起来像「非流式」（实测 ~80 个 chunk
 * 全是 reasoning，正文最后才出现）。
 */
export type SseDelta =
  | { kind: 'content'; text: string }
  | { kind: 'reasoning'; text: string };

/**
 * 解析一行 SSE 数据：(data: {...}) → 增量事件；
 * [DONE]/非 data 行/非 JSON/无内容 delta → null。纯函数，便于单测。
 */
export function extractSseDelta(line: string): SseDelta | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith('data:')) return null;
  const data = trimmed.slice('data:'.length).trim();
  if (data === '[DONE]') return null;
  let payload: unknown;
  try {
    payload = JSON.parse(data);
  } catch {
    return null;
  }
  if (typeof payload !== 'object' || payload === null) return null;
  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;
  const first = choices[0] as { delta?: { content?: unknown; reasoning_content?: unknown } };
  const delta = first?.delta;
  if (typeof delta?.content === 'string') return { kind: 'content', text: delta.content };
  if (typeof delta?.reasoning_content === 'string') return { kind: 'reasoning', text: delta.reasoning_content };
  return null;
}

/**
 * 流式优化：逐块解析 SSE，边收边回调 onText(delta)；返回完整正文。
 * 相比非流式 optimize()：首字更快、长输出不需要等完整生成——按钮/卡片能边生成边显示。
 */
export async function optimizeStream(opts: {
  config: PromptConfig;
  text: string;
  lang: Lang;
  signal?: AbortSignal;
  onEvent?: (delta: SseDelta) => void;
  /** 已构造好的 system（含记忆）；不传则按 context 现构造 */
  system?: string;
  memory?: SystemContext;
}): Promise<string> {
  const { config, text, lang, signal, onEvent, system, memory } = opts;
  const check = checkConfig(config);
  if (!check.ok) throw new OptimizeError('config', check.reason);

  let res: Response;
  try {
    res = await fetch(`${normalizeBaseUrl(config.baseUrl)}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(buildRequestBody(config, text, lang, true, system, memory ?? {})),
      signal,
    });
  } catch (e) {
    throw toErrorKind(e);
  }

  if (res.status === 401) throw new OptimizeError('unauthorized', `HTTP 401`);
  if (res.status === 403) throw new OptimizeError('forbidden', `HTTP 403`);
  if (!res.ok) throw new OptimizeError('http', `HTTP ${res.status}`);
  if (!res.body) throw new OptimizeError('bad-response', 'missing response body');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';
  let truncated = false;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const delta = extractSseDelta(line);
        if (delta !== null) {
          onEvent?.(delta);
          if (delta.kind === 'content') full += delta.text;
        }
        if (extractSseFinishReason(line) === 'length') truncated = true;
      }
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // 已中止/释放时忽略
    }
  }
  // 尾行（无换行结尾的 data 行）
  if (buffer.trim()) {
    const delta = extractSseDelta(buffer);
    if (delta !== null) {
      onEvent?.(delta);
      if (delta.kind === 'content') full += delta.text;
    }
    if (extractSseFinishReason(buffer) === 'length') truncated = true;
  }

  if (truncated) throw new OptimizeError('truncated', 'output truncated by max_tokens');
  const content = extractResult(full);
  if (!content.trim()) throw new OptimizeError('empty', 'empty completion');
  return content;
}

/**
 * 解析「当前会话模型」：调 connection 的 session.models RPC，取 current.model。
 * api 注入式（与 DSH 解耦便于单测）；任何失败返回 null（由调用方回退自定义 model）。
 */
export async function resolveSessionModel(
  api:
    | {
        sessions?: {
          models?: (payload?: unknown, signal?: AbortSignal) => Promise<{ current?: { model?: string } } | null>;
        };
      }
    | undefined,
  payload: unknown = {},
  signal?: AbortSignal,
): Promise<string | null> {
  try {
    // 必须携带 sessionId：server 端按 request.payload.sessionId 查该会话已选择的模型，
    // 缺失时回退默认（deepseek-v4-flash）而非会话模型（实测）
    const res = await api?.sessions?.models?.(payload, signal);
    const m = res?.current?.model;
    return typeof m === 'string' && m.trim() ? m.trim() : null;
  } catch {
    return null;
  }
}
