# Changelog

本仓库从 `winditer/dsh-prompt-optimizer@2.0.3` 衍生，以下只记录衍生后的改动。

> 本项目由 AI 辅助优化完成，标注位置与统一措辞见 README 的「AI 辅助说明」。

## 2.3.0

### 改名（不兼容，最终定名）

- 包名 `dsh-prompt-architect` → **`dsh-prompt-optimize`**。2.2.0 那次改名方向正确（脱离与上游同名的 `dsh-prompt-optimizer`），但新名字偏离了插件本来的定位，本次定为 `dsh-prompt-optimize`。
- 连带改动：`dist/client.js` 的 `__ModuleLoader__` load id、`cordis.patch.yml` 的 insert id（`prompt-optimize`）与 name、HTTP/RPC 前缀 `/dsh-prompt-optimize/api`、配置文件 `~/.dsh/prompt-optimize-config.json`、调试日志 `prompt-optimize-debug.log`、localStorage 键 `dsh-prompt-optimize.memory.v1`、组件 id 与 CSS 注入 id。
- **升级注意**：包名再次变化，旧包同样不会被自动替换。需从 profile 的 `dependencies` 与 `dsh.profile.bundles` 移除旧条目（`dsh-prompt-optimizer` / `dsh-prompt-architect`），再安装本包，否则会出现多个 ✨ 按钮。
- **数据迁移**：学习记录的旧键改为数组，按新到旧尝试 `dsh-prompt-architect.memory.v1` → `dsh-prompt-optimizer.memory.v1`，读到即写入新键并删除旧键。

## 2.2.0

### 改名（不兼容）

- 包名 `dsh-prompt-optimizer` → `dsh-prompt-optimize`。原名与上游完全相同，装进 dsh 后市场与已安装列表无法区分，容易被误认为官方版本；MIT 授权的是代码版权，不涉及名称与身份标识，所以改名是必要的自我保护。
- 连带改动：`dist/client.js` 的 `__ModuleLoader__` load id、`cordis.patch.yml` 的 insert id（`prompt-optimize`）与 name、HTTP/RPC 前缀 `/dsh-prompt-optimize/api`、配置文件 `~/.dsh/prompt-optimize-config.json`、调试日志 `prompt-optimize-debug.log`、localStorage 键 `dsh-prompt-optimize.memory.v1`、组件 id 与 CSS 注入 id。
- **升级注意**：两个包名不同，旧包不会被自动替换。需先从 profile 的 `dependencies` 与 `dsh.profile.bundles` 移除 `dsh-prompt-optimizer`，再安装本包，否则会同时出现两个 ✨ 按钮。
- **数据迁移**：localStorage 学习记录做了一次性迁移（读到旧键后写入新键并删除旧键）；配置文件因改名重新生成（此前为空配置，不影响使用）。

### 文档

- README 新增「上游与授权」章节：写明 MIT 授权依据、与上游无隶属与背书关系、发布前未与原作者沟通、对方有异议时的处理方式（改名／加强声明／下架）。

### 修复（正确性）

- **SSE 帧载荷改为 JSON**（`event: delta/reasoning` 的 `data` 从裸文本改为 `{"t":…}`、`event: error` 改为 `{"kind","m"}`）。旧实现「服务端手工把 `\n` 转义成字面 `\\n` + 客户端 `trim()`」会吃掉英文 token 首尾空格（"The goal" → "Thegoal"）、且从不反转义——英文/代码草稿的优化结果是实际损坏的。JSON 自带转义，空格、换行、字面反斜杠全部无损。
- **客户端不再忽略 `error` 帧**：宿主侧生成失败此前被静默吞掉、空/半截结果被当作成功展示（点「替换草稿」可能把草稿清空）。现在 error/truncated 帧会浮出为明确的失败态。
- **修复配置缺失时预览卡卡死**：`runOptimize` 先 `begin` 再 `guide`，而 reducer 在 `optimizing` 态直接忽略 `guide`，导致引导卡永不出现、按钮永久 busy。现在 `guide` 能从任意状态进入。
- **补齐 intensity 三档的 UI 与持久化通路**：`light/standard/deep` 此前只在内核支持、设置表单既没有选择器、`saveConfig` 也不写 `intensity`——普通用户永远用不到。现已加入设置项选择器并写入配置文件。
- **设置校验只在自定义模式生效**：旧版无条件要求 API Key 非空，与「零配置默认」定位冲突——只想用会话模型的用户在设置页根本保存不了。
- **截断检测**：OpenAI 兼容路径检测 `finish_reason === 'length'`（宿主路径检测 finish 帧的 `kind === 'length'`），被 `max_tokens` 切断的半截结果不再静默返回，而是报「输出被长度上限截断」。
- **记忆数据形状校验**：`localStorage` 是共享空间，手改/其他脚本/旧版本写入的脏数据此前会让 `buildContext` 的 `.slice()` 抛异常——而调用点在 `runOptimize` 的 try 之外，导致优化入口永久无响应。现在 `loadMemory` 逐项过滤非法样例与会话草稿。

### 修复（健壮性）

- **宿主任务 Map 清理**：`optimize.start` 的条目在 `done` 且被 poll 取走后立即删除，并对长期无人 poll 的僵尸条目兜底清扫——旧版只增不减，长驻桌面进程内存无限累积。
- **调试日志轮转**：超过 2MB 自动轮转一份 `.1`，`DSH_PO_DEBUG=0` 可完全关闭（旧版无上限、每请求多次磁盘 IO）。
- **宿主通道超时对齐 120s**：v4 系模型先输出长段推理，旧版外层 60s 会提前 abort 掉本可完成的流式。
- **`resolveHostSessionModel` 契约修复**：注释承诺「不可得返回 null」，旧版无 try/catch，网络错误会直接 reject；现在任何失败都返回 null 由调用方回退。
- **快捷键监听随插件卸载移除** + `e.repeat` 防抖（旧版热重载后监听器累积、按住 Alt+O 连发）。
- **copy 语义修正**：复制走结果后再关闭，不再被误记成负样本污染反思画像。

### 重构

- **抽取 `src/composer.ts`**：输入框读写在 OptimizeButton 与 PreviewCard 里各复制了一份且已分叉，现统一为一个共享模块。
- **`lib/index.js` 去重**：RPC 与 HTTP 两个面此前各复制一份 start/poll/abort/sessionModel（行为已漂移），现共用 `createTask`/`pollTask`/`abortTask`/`currentSessionModel`；删除无人调用的 `optimize.run` 死代码。
- **删除死模块 `src/settings-epoch.ts`**（`classifyRefresh` 无生产调用方）。
- **HTTP 路由先校验方法再读 body**（旧版 405 也先把请求体读完）。

## 2.1.1

### 标注（AI 辅助）

- 全项目统一「AI 辅助优化」标注，三处一致：README 页首提示 + 独立章节（写明 AI 参与范围、人工把关环节、全部标注位置与统一措辞）；源文件头注释（`src/index.ts`、`src/optimizer.ts`、`src/memory.ts`、`lib/index.js`、`scripts/build.mjs`）；插件设置页常驻提示文案（`settings.aiNotice`，中英文各一条）。
- 英文侧统一用「AI-assisted」，不使用 "AI-generated" / "fully automatic" 这类夸大或掩盖人工审阅的说法。

### 文档

- README 新增「使用示例」：一个与本项目无关的通用示例（内部活动排期），含背景、输入草稿与预期结果对照表，并说明该草稿属「稀疏型」、走补齐路径。
- 修正设置项描述里的旧措辞（「润色接口」→「重写接口」）。

## 2.1.0

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
