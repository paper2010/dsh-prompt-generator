# Changelog

本仓库从 `winditer/dsh-prompt-optimizer@2.0.3` 衍生，以下只记录衍生后的改动。

## 2.1.0

### 提示词内核重写（行为变化）

- **角色定位**：从「prompt 润色器」改为「提示词架构师」。旧版 system prompt 明确禁止扩写、禁止添加要求与输出格式，导致产出只是把原句换个说法；新版按九段骨架重建，并给出 R1–R7 七条硬规则。
- **幅度改为密度自适应**（替代旧版固定 3–6 倍规则）：先判定草稿信息密度——已含「任务目标 / 范围 / 约束条件 / 期望输出」三项及以上判为密集型，以精简去冗为主，**产出可以短于原文**；只有一两句意图判为稀疏型，才适度补齐，缺失事实一律留占位。
- **信息守恒**：四类关键信息必须完整保留且可定位（任务目标、范围、约束条件、期望输出），丢失任一项即判失败；反模式增加「信息已足够却继续堆砌」一例。
- **输出形态约束**：真实换行，禁止字面 `\n`/`\t`/`\r`；分节用短标签或编号，不用 `#` 标题；不堆 `**` 加粗。
- **生成参数**：`temperature` 0.7 → 0.35（减少措辞漂移与凭空补事实），`max_tokens` 2048 → 4096。
- **记忆与自学习**：记录采纳 / 否决信号，每 3 次采纳触发一次复盘，把偏好画像注入下一轮 system prompt；数据仅存本地 `localStorage`（`dsh-prompt-optimizer.memory.v1`）。
- **强度档位**：新增 `light / standard / deep` 三档，深度档对密集型输入改为输出「信息核对表」而非增加小节。

### 修复

- `normalizePromptText()`：兜底还原字面 `\n` 与 `##角色` 这类粘连标题；接入 `stripLeadIn()`，覆盖自配 API、流式与宿主流式三条路径，并对入口草稿同样生效。
- `scripts/build.mjs` 增加 `charset: 'utf8'`——esbuild 默认 `ascii` 会把中文规则转成 `\uXXXX`，产物无法用文本检索核对。
- `scripts/test.mjs` 改用 `pathToFileURL()` 动态导入——Windows 下传绝对路径会抛 `ERR_UNSUPPORTED_ESM_URL_SCHEME`。

### 工程

- **依赖精简**：移除 110 个未使用的 `@deepseek-ai/*` devDependencies（仓库无 `tsconfig`，构建走 esbuild 外部化），`devDependencies` 仅保留 `esbuild`；宿主侧 `lib/index.js` 只依赖 Node 内置模块，**运行时零依赖**。
- 测试：62 项单测 + 37 项装配冒烟断言，新增 `npm run test:smoke`。
- 文档：中英文 README 更新定位与安装方式，新增本 CHANGELOG。

## 2.0.3

上游基线版本（`winditer/dsh-prompt-optimizer`）。
