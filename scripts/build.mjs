// 本项目由 AI 辅助优化完成（提示词内核、测试与文档），发布前经人工审阅。
/** dsh-prompt-optimizer 构建脚本 — esbuild 打包为官方 client.js 格式 */

import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const entry = resolve(ROOT, 'src/index.ts');
const outDir = resolve(ROOT, 'dist');
const outRaw = resolve(outDir, '_bundle.js');
const outFinal = resolve(outDir, 'client.js');

mkdirSync(outDir, { recursive: true });

await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2020',
  jsx: 'automatic',
  jsxImportSource: 'react',
  external: [
    'react',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
    'clsx',
  ],
  outfile: outRaw,
  sourcemap: 'inline',
  // 必须保留 UTF-8 原文：esbuild 默认 charset=ascii 会把中文规则整段转成 \uXXXX 转义，
  // 虽然仍能运行，但产物不可读、无法用文本检索核对提示词内容。
  charset: 'utf8',
});

const bundle = readFileSync(outRaw, 'utf8');

// 运行时约束（Task 6 实证）：bundle 的 load id 必须等于安装包名（图行 id = entry.options.name），
// 否则 arrive() 抛出 "bundle loaded without registering <id>"。包名即 dsh-prompt-optimizer。
const wrapped = `window.__ModuleLoader__.load({
  id: "dsh-prompt-optimizer",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
${bundle}
    return module.exports;
  }
});
`;

writeFileSync(outFinal, wrapped, 'utf8');
rmSync(outRaw, { force: true });

console.log(`✓ Built: ${outFinal} (${(wrapped.length / 1024).toFixed(1)} KB)`);