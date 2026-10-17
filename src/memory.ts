/**
 * memory.ts —— 会话记忆 + 偏好自学习（纯前端，localStorage 持久化）
 *
 * 设计取舍（为什么不用宿主文件）：
 *   宿主的 `system` 参数完全由客户端拼装后传给 llm.stream，因此记忆只要在客户端
 *   组装即可，不需要新增 host API、不需要改 lib/index.js —— 改动面最小、最不容易
 *   把插件搞挂。
 *
 * 三层记忆（对齐 WorkBuddy 的分层思路，但范围收窄到「提示词偏好」）：
 *   L1 会话记忆   sessionDrafts[sessionId]  —— 本会话最近 10 条草稿，用于理解当前语境
 *   L2 样例记忆   accepted[]                —— 最近被采纳的「草稿 → 结果」对，作 few-shot
 *   L3 偏好画像   profile                   —— 由采纳/放弃记录反思出的稳定偏好（≤600 字）
 *
 * 自学习闭环（借鉴 LangMem metaprompt + SkillOpt 的「有界编辑 + 验证闸门」）：
 *   采纳 = 正样本（验证通过） / 放弃或重试 = 负样本
 *   → 每累计 3 个新正样本触发一次反思（1 次 LLM 调用）
 *   → 反思产出的是**有界替换**的 profile（不是无限追加），旧画像被覆盖
 *   → 反思失败静默忽略，绝不影响主流程
 */

import type { Intensity, SystemContext } from './optimizer.js';
import { DEFAULT_INTENSITY } from './optimizer.js';

export interface Sample {
  draft: string;
  result: string;
  at: number;
  sessionId: string | null;
}

export interface MemoryState {
  version: 1;
  profile: string;
  accepted: Sample[];
  rejected: Sample[];
  sessionDrafts: Record<string, string[]>;
  stats: { accepted: number; rejected: number; acceptedSinceReflect: number };
}

const KEY = 'dsh-prompt-optimizer.memory.v1';
const MAX_ACCEPTED = 12;
const MAX_REJECTED = 8;
const MAX_SESSION_DRAFTS = 10;
const REFLECT_EVERY = 3;

function empty(): MemoryState {
  return {
    version: 1,
    profile: '',
    accepted: [],
    rejected: [],
    sessionDrafts: {},
    stats: { accepted: 0, rejected: 0, acceptedSinceReflect: 0 },
  };
}

function storage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage;
  } catch {
    return null;
  }
}

export function loadMemory(): MemoryState {
  const s = storage();
  if (!s) return empty();
  try {
    const raw = s.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Partial<MemoryState>;
    const base = empty();
    return {
      ...base,
      profile: typeof parsed.profile === 'string' ? parsed.profile : '',
      accepted: Array.isArray(parsed.accepted) ? parsed.accepted.slice(0, MAX_ACCEPTED) : [],
      rejected: Array.isArray(parsed.rejected) ? parsed.rejected.slice(0, MAX_REJECTED) : [],
      sessionDrafts:
        parsed.sessionDrafts && typeof parsed.sessionDrafts === 'object' ? parsed.sessionDrafts : {},
      stats: {
        accepted: Number(parsed.stats?.accepted) || 0,
        rejected: Number(parsed.stats?.rejected) || 0,
        acceptedSinceReflect: Number(parsed.stats?.acceptedSinceReflect) || 0,
      },
    };
  } catch {
    return empty();
  }
}

export function saveMemory(m: MemoryState): void {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(KEY, JSON.stringify(m));
  } catch {
    // 配额满 / 隐私模式：静默降级为「无记忆」
  }
}

/** 等待用户裁决的最近一次优化结果 */
let pending: Sample | null = null;

export function rememberDraft(sessionId: string | null, draft: string): void {
  const m = loadMemory();
  const key = sessionId ?? '_';
  const list = (m.sessionDrafts[key] ?? []).filter((d) => d !== draft);
  list.push(draft.slice(0, 500));
  m.sessionDrafts[key] = list.slice(-MAX_SESSION_DRAFTS);
  // 会话条目也别无限增长：最多保留 20 个会话
  const keys = Object.keys(m.sessionDrafts);
  if (keys.length > 20) {
    for (const k of keys.slice(0, keys.length - 20)) delete m.sessionDrafts[k];
  }
  saveMemory(m);
}

export function setPending(sessionId: string | null, draft: string, result: string): void {
  pending = { draft, result, at: Date.now(), sessionId };
}

export function hasPending(): boolean {
  return pending !== null;
}

/**
 * 记录裁决结果。
 * accepted → 进入 few-shot 样例池，并计入反思计数
 * rejected → 只记入负样本池（用于反思时避坑），不影响可用样例
 */
export function recordOutcome(kind: 'accepted' | 'rejected'): boolean {
  if (!pending) return false;
  const sample = pending;
  pending = null;

  const m = loadMemory();
  if (kind === 'accepted') {
    m.accepted = [
      sample,
      ...m.accepted.filter((x) => !(x.draft === sample.draft && x.result === sample.result)),
    ].slice(0, MAX_ACCEPTED);
    m.stats.accepted += 1;
    m.stats.acceptedSinceReflect += 1;
  } else {
    m.rejected = [sample, ...m.rejected.filter((x) => x.draft !== sample.draft)].slice(0, MAX_REJECTED);
    m.stats.rejected += 1;
  }
  saveMemory(m);
  return kind === 'accepted';
}

/** 组装注入 system 的记忆上下文 */
export function buildContext(sessionId: string | null, intensity?: Intensity): SystemContext {
  const m = loadMemory();
  return {
    intensity: intensity ?? DEFAULT_INTENSITY,
    profile: m.profile,
    examples: m.accepted.slice(0, 3).map((x) => ({ draft: x.draft, result: x.result })),
    recentDrafts: (m.sessionDrafts[sessionId ?? '_'] ?? []).slice(-5),
  };
}

/** 是否该触发一次反思 */
export function shouldReflect(): boolean {
  return loadMemory().stats.acceptedSinceReflect >= REFLECT_EVERY;
}

/** 反思用的 system 提示词（metaprompt：让模型从采纳/放弃记录里提炼稳定偏好） */
export function buildReflectionPrompt(lang: 'zh' | 'en'): string {
  const m = loadMemory();
  const accepted = m.accepted
    .slice(0, 6)
    .map(
      (x, i) =>
        `### A${i + 1}\n${lang === 'zh' ? '草稿' : 'draft'}: ${x.draft.slice(0, 240)}\n` +
        `${lang === 'zh' ? '被采纳的结果（节选）' : 'accepted (excerpt)'}:\n${x.result.slice(0, 600)}`,
    )
    .join('\n\n');
  const rejected = m.rejected
    .slice(0, 4)
    .map(
      (x, i) =>
        `### R${i + 1}\n${lang === 'zh' ? '草稿' : 'draft'}: ${x.draft.slice(0, 240)}\n` +
        `${lang === 'zh' ? '被放弃的结果（节选）' : 'rejected (excerpt)'}:\n${x.result.slice(0, 400)}`,
    )
    .join('\n\n');

  if (lang === 'zh') {
    return (
      '你是提示词偏好分析师。下面是一位用户最近「采纳」和「放弃」的提示词重写记录。\n' +
      '请提炼出**稳定的、可复用的偏好**，写成一份不超过 600 字的画像，让下一个负责重写的模型据此产出更合他口味的结果。\n\n' +
      '要求：\n' +
      '1. 只写从数据中**反复出现**的倾向，不要描述单次特例；\n' +
      '2. 分三块：结构偏好 / 颗粒度与篇幅 / 措辞与约束风格；\n' +
      '3. 用祈使句陈述可执行规则（如「默认加验收标准」「不要用『请』这类客套前缀」）；\n' +
      '4. 采纳样本体现正面偏好，放弃样本体现要规避的做法，两边都要利用；\n' +
      '5. 直接输出画像正文，不要标题、不要解释、不要「以下是」。\n\n' +
      (m.profile ? `# 上一版画像（可在此基础上修订，避免推倒重来）\n${m.profile}\n\n` : '') +
      `# 采纳记录\n${accepted || '（无）'}\n\n# 放弃记录\n${rejected || '（无）'}`
    );
  }
  return (
    'You analyze prompt preferences. Below are a user\'s recently ACCEPTED and REJECTED prompt rewrites.\n' +
    'Extract the STABLE, reusable preferences into a profile of at most 600 words so the next rewriting model can match their taste.\n\n' +
    'Rules:\n' +
    '1. Only state tendencies that recur across samples; ignore one-offs.\n' +
    '2. Use three blocks: Structure / Granularity & length / Wording & constraint style.\n' +
    '3. Phrase each as an executable imperative ("default to adding acceptance criteria").\n' +
    '4. Use accepted samples for positive preference and rejected ones for what to avoid.\n' +
    '5. Output the profile body only — no title, no preamble.\n\n' +
    (m.profile ? `# Previous profile (revise it, do not start over)\n${m.profile}\n\n` : '') +
    `# Accepted\n${accepted || '(none)'}\n\n# Rejected\n${rejected || '(none)'}`
  );
}

/** 反思成功：有界替换 profile 并清零计数 */
export function applyReflection(text: string): void {
  const clean = text.trim().replace(/^```[a-zA-Z]*\n?|\n?```$/g, '').trim();
  if (!clean) return;
  const m = loadMemory();
  m.profile = clean.slice(0, 1500);
  m.stats.acceptedSinceReflect = 0;
  saveMemory(m);
}

export function clearMemory(): void {
  pending = null;
  const s = storage();
  if (!s) return;
  try {
    s.removeItem(KEY);
  } catch {
    // 忽略
  }
}

/** 供设置页 / 诊断展示 */
export function memorySummary(): { accepted: number; rejected: number; hasProfile: boolean; chars: number } {
  const m = loadMemory();
  return {
    accepted: m.stats.accepted,
    rejected: m.stats.rejected,
    hasProfile: m.profile.trim().length > 0,
    chars: m.profile.length,
  };
}
