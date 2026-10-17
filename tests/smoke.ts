/** 提示词装配的冒烟测试：验证骨架、铁律、记忆注入与强度分支 */
import { buildSystemPrompt, mergeConfig, DEFAULT_INTENSITY, normalizePromptText } from '../src/optimizer.js';

const zh = buildSystemPrompt('zh', {
  intensity: 'standard',
  profile: '偏好：默认加验收标准；禁止客套前缀。',
  examples: [{ draft: '写个报告', result: '## 目标\n交付一份季度复盘' }],
  recentDrafts: ['帮我优化下这段'],
});

const zhDense = buildSystemPrompt('zh', { intensity: 'standard' });
const zhDeepDense = buildSystemPrompt('zh', { intensity: 'deep' });
const enStd = buildSystemPrompt('en', { intensity: 'standard' });
const enLight = buildSystemPrompt('en', { intensity: 'light' });
const enDeep = buildSystemPrompt('en', { intensity: 'deep' });

const cases: [string, boolean][] = [
  ['新角色（架构师）', zh.includes('提示词架构师')],
  ['九段骨架', zh.includes('输出骨架') && zh.includes('验收标准')],
  ['铁律 R1-R7', zh.includes('R1 意图保真') && zh.includes('R7 信息守恒')],
  ['反模式 BAD/GOOD', zh.includes('BAD（') && zh.includes('GOOD：')],
  ['注入长期画像', zh.includes('偏好：默认加验收标准')],
  ['注入采纳样例', zh.includes('样例 1')],
  ['注入会话草稿', zh.includes('帮我优化下这段')],
  ['light 强度分支', buildSystemPrompt('zh', { intensity: 'light' }).includes('本次强度：轻改')],
  ['deep 强度分支', buildSystemPrompt('zh', { intensity: 'deep' }).includes('本次强度：深度')],
  ['英文分支可用', enStd.includes('PROMPT ARCHITECT')],
  ['无记忆时不含记忆段', !buildSystemPrompt('zh', {}).includes('用户长期偏好')],
  ['intensity 默认值', mergeConfig({}).intensity === DEFAULT_INTENSITY],
  ['intensity 非法值回落', mergeConfig({ intensity: 'xxx' as never }).intensity === DEFAULT_INTENSITY],
  ['intensity 合法值保留', mergeConfig({ intensity: 'deep' }).intensity === 'deep'],

  // ── 密度自适应（替代旧的固定 3~6 倍规则）──
  ['中文：密度判定段存在', zhDense.includes('先判断信息密度')],
  ['中文：密集/稀疏两类', zhDense.includes('密集型') && zhDense.includes('稀疏型')],
  ['中文：允许短于原文', zhDense.includes('可以短于原文')],
  ['中文：R3 随密度而非固定倍数', zhDense.includes('R3 幅度随密度') && zhDense.includes('不设固定扩写倍数')],
  ['中文：四类关键信息守恒', ['任务目标', '范围', '约束条件', '期望输出'].every((k) => zhDense.includes(k))],
  ['中文：骨架按密度裁剪', zhDense.includes('按密度裁剪') && zhDense.includes('不是强制清单')],
  ['中文：反向反模式（已详实仍堆砌）', zhDense.includes('信息已足够却继续堆砌')],
  ['中文：深度对密集型要求核对而非增节', zhDeepDense.includes('信息核对表') && zhDeepDense.includes('不增节')],
  ['中文：轻改不强制新增小节', zhDeepDense.length > 0 && buildSystemPrompt('zh', { intensity: 'light' }).includes('不新增小节')],
  ['全文不含固定倍数表述', !/3\s*[-~～–—]\s*6|三到六|三至六|3\s*to\s*6/i.test(zhDense + enStd + enLight + enDeep)],
  ['英文：同步密度判定段', enStd.includes('judge information density') || enStd.includes('information density')],
  ['英文：同步信息守恒', enStd.includes('INFORMATION CONSERVATION') && enStd.includes('AMPLITUDE FOLLOWS DENSITY')],
  ['英文：light 不再固定句数', !/3-5 sentences/.test(enLight) && enLight.includes('light')],
  ['英文：deep 不再强制加示例', !/append one short example/.test(enDeep) && enDeep.includes('Information Check')],
  ['中英一致：都不含固定倍数', !/\d+\s*[-~～]\s*\d+\s*x/i.test(zhDense + enStd)],

  // ── 输出形态：字面转义与标题符号 ──
  ['中文：R6 要求真实换行', zhDense.includes('换行用真实换行') && zhDense.includes('# 标题符号')],
  ['英文：R6 要求 real newlines', enStd.includes('real newlines') && enStd.includes('not # headings')],
  ['字面 \\n 还原为真实换行', normalizePromptText('##角色\\n\\n你是一名执行员\\n##目标\\n做两件事').includes('\n目标')],
  ['字面 \\n 还原后不留反斜杠', !normalizePromptText('a\\nb\\nc\\nd').includes('\\n')],
  ['真实换行不受影响', normalizePromptText('第一行\n第二行').includes('\n第二行')],
  ['粘连标题去符号', normalizePromptText('##角色\n内容').startsWith('角色')],
  ['规范标题（带空格）保留', normalizePromptText('## 角色\n内容').startsWith('## 角色')],
  ['代码正文不被误改（真实换行多）', normalizePromptText('const a = "x\\ny"\nconst b = 1\nconst c = 2\nline4').includes('"x\\ny"')],
];

let fail = 0;
for (const [name, ok] of cases) {
  if (!ok) fail++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}`);
}
console.log(`\n${cases.length - fail} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
