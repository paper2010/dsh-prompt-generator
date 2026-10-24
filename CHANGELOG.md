# Changelog

本仓库从 `winditer/dsh-prompt-optimizer@2.0.3` 衍生，以下只记录衍生后的改动。

> 本项目由 AI 辅助优化完成，标注位置与统一措辞见 README 的「AI 辅助说明」。

## 0.4.0

### 改名（不兼容）

- 项目与包名 `dsh-prompt-optimize` → **`dsh-prompt-generator`**，展示名统一为 **dsh Prompt Generator**（README 标题、设置页标题、包描述、截图 alt）。包名不带空格是因为 npm / dsh 的包标识不允许空格，展示名保留空格写法。
- 连带改动：client bundle 的 load id、`cordis.patch.yml` 的 insert id（`prompt-generator`）与 name、HTTP 前缀 `/dsh-prompt-generator/api`、配置文件 `~/.dsh/prompt-generator-config.json`、调试日志 `prompt-generator-debug.log`、localStorage 键 `dsh-prompt-generator.memory.v1`、组件与 CSS 注入 id、locale 命名空间 `prompt_generator`。
- **升级注意**：包名变化，dsh 不会自动替换旧包。需从 profile 的 `dependencies` 与 `dsh.profile.bundles` 移除 `dsh-prompt-optimize`，再安装本包，否则会出现两个 ✨ 按钮。
- **数据迁移**：配置按 `prompt-generator-config.json` → `prompt-optimize-config.json` → `prompt-architect-config.json` → `prompt-optimizer-config.json` 顺序回退读取，首次保存后落到新路径；学习记录按新到旧尝试旧键，读到即迁移并删除旧键，不丢偏好。

## 0.3.1

### 修复

- 修复预览卡进入优化态即崩溃（React #310「Rendered more hooks than during the previous render」）：`hasCopiedRef` 原声明在 `status === 'idle'` 的提前 return 之后，属于条件 hook。表现为点 ✨ 后按钮变成沙漏、上方始终不出现卡片与思考过程，模型其实已在后台正常流式生成。
- 思考过程独立成块并常驻等待期（不再只在正文为空时显示），宿主通道步骤细化为「正在获取会话模型 / 正在建立流式请求 / 模型正在生成」，沙漏期间有明确进度。

### 测试

- 单测增至 67 项：新增组件静态守卫，扫描 `PreviewCard` 源码确保所有 hooks 均位于提前 return 之前。

## 0.3.0

### 改名（不兼容，最终定名）

- 包名 `dsh-prompt-architect` → **`dsh-prompt-optimize`**。0.2.0 那次改名方向正确（脱离与上游同名的 `dsh-prompt-optimizer`），但新名字偏离了插件本来的定位，本次定为 `dsh-prompt-optimize`。
- 连带改动：`dist/client.js` 的 `__ModuleLoader__` load id、`cordis.patch.yml` 的 insert id（`prompt-optimize`）与 name、HTTP/RPC 前缀 `/dsh-prompt-optimize/api`、配置文件 `~/.dsh/prompt-optimize-config.json`、调试日志 `prompt-optimize-debug.log`、localStorage 键 `dsh-prompt-optimize.memory.v1`、组件 id 与 CSS 注入 id。
- **升级注意**：包名再次变化，旧包同样不会被自动替换。需从 profile 的 `dependencies` 与 `dsh.profile.bundles` 移除旧条目（`dsh-prompt-optimizer` / `dsh-prompt-architect`），再安装本包，否则会出现多个 ✨ 按钮。
- **数据迁移**：学习记录的旧键改为数组，按新到旧尝试 `dsh-prompt-architect.memory.v1` → `dsh-prompt-optimizer.memory.v1`，读到即写入新键并删除旧键。

## 0.2.0

### 功能变更

- 设置页新增「优化强度」三档（轻改 / 标准 / 深度），可保存并生效。
- 输出被长度上限截断时给出明确提示，不再返回不完整结果。
- 包名与上游脱钩（不兼容）：load id、bundle 入口、HTTP 前缀、配置文件、localStorage 键与组件 id 同步更名，学习记录一次性迁移；最终定名见 0.3.0。

### 修复

- 宿主流式通道改用 JSON 帧载荷，修复英文/代码草稿的空格丢失与换行不还原。
- 宿主流式错误不再被忽略，空结果按失败处理。
- 修复配置缺失时预览卡卡在「正在优化」。
- 修复会话模型模式下设置无法保存。
- 修复复制结果后关闭被误记为负样本。
- 修复记忆数据异常导致优化入口无响应。
- 修复宿主任务常驻内存、调试日志无限增长。

### 重要调整

- 设置校验只在自定义模式要求接口地址、API Key 与模型名。
- 宿主流式超时由 60 秒调整为 120 秒。
- 抽取共享的输入框读写模块，合并宿主端重复的 RPC/HTTP 实现，删除未使用的代码。
- 测试覆盖 66 项单测与 37 项冒烟。

### 文档

- README 新增「上游与授权」章节。

## 0.1.1

### 标注（AI 辅助）

- 全项目统一「AI 辅助优化」标注，三处一致：README 页首提示 + 独立章节（写明 AI 参与范围、人工把关环节、全部标注位置与统一措辞）；源文件头注释（`src/index.ts`、`src/optimizer.ts`、`src/memory.ts`、`lib/index.js`、`scripts/build.mjs`）；插件设置页常驻提示文案（`settings.aiNotice`，中英文各一条）。
- 英文侧统一用「AI-assisted」，不使用 "AI-generated" / "fully automatic" 这类夸大或掩盖人工审阅的说法。

### 文档

- README 新增「使用示例」：一个与本项目无关的通用示例（内部活动排期），含背景、输入草稿与预期结果对照表，并说明该草稿属「稀疏型」、走补齐路径。
- 修正设置项描述里的旧措辞（「润色接口」→「重写接口」）。

## 0.1.0

### 提示词内核重写（行为变化）

- **角色定位**：从「prompt 润色器」改为「提示词架构师」。旧版 system prompt 明确禁止扩写、禁止添加要求与输出格式，导致产出只是把原句换个说法；新版按九段骨架重建，并给出 R1–R7 七条硬规则。
- **幅度改为密度自适应**（替代旧版固定 3–6 倍规则）：先判定草稿信息密度——已含「任务目标 / 范围 / 约束条件 / 期望输出」三项及以上判为密集型，以精简去冗为主，**产出可以短于原文**；只有一两句意图判为稀疏型，才适度补齐，缺失事实一律留占位。
- **信息守恒**：四类关键信息必须完整保留且可定位（任务目标、范围、约束条件、期望输出），丢失任一项即判失败；反模式增加「信息已足够却继续堆砌」一例。
- **输出形态约束**：真实换行，禁止字面 `\n`/`\t`/`\r`；分节用短标签或编号，不用 `#` 标题；不堆 `**` 加粗。
- **生成参数**：`temperature` 0.7 → 0.35（减少措辞漂移与凭空补事实），`max_tokens` 2048 → 4096。
- **记忆与自学习**：记录采纳 / 否决信号，每 3 次采纳触发一次复盘，把偏好画像注入下一轮 system prompt；数据仅存本地 `localStorage`（`dsh-prompt-optimize.memory.v1`）。
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
