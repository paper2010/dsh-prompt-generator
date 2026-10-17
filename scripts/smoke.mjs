/** 装配冒烟测试运行器：esbuild 打包 tests/smoke.ts → 子进程执行 → 透传退出码 */

import { build } from 'esbuild';
import { mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const outDir = resolve(ROOT, '.tmp');
const outFile = resolve(outDir, 'smoke.cjs');

mkdirSync(outDir, { recursive: true });

await build({
  entryPoints: [resolve(ROOT, 'tests/smoke.ts')],
  bundle: true,
  format: 'cjs',
  platform: 'node',
  target: 'es2022',
  outfile: outFile,
  sourcemap: false,
});

// smoke.ts 自己 process.exit，用子进程跑才能拿到真实退出码且不打断运行器
const r = spawnSync(process.execPath, [outFile], { stdio: 'inherit' });
process.exitCode = r.status ?? 1;
