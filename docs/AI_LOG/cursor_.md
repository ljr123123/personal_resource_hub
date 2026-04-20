# 软件与工具使用列表
_Exported on 2026/4/20 at GMT+8 17:12:04 from Cursor (3.1.15)_

---

**User**

列出所有使用过的软件与工具（例如：IDE、AI 工具、搜索引擎、代码引用的外部依赖包）
- 每个工具对应说明：
- 解决了什么问题
- 使用场景或关键步骤
结合项目内容自行查找使用的工具，查找完毕后我再补充一些

---

**Cursor**

我先在仓库里快速扫一遍：从 `package.json`/配置文件/文档里把**实际用到的工具链、依赖包、测试与构建工具**都找出来；再按你要的格式（解决什么问题/使用场景或关键步骤）逐条整理成清单，最后留出你补充的空位。

已确认这项目的核心工具链是 **Vue 3 + Vite + TypeScript**，并且配了 **ESLint/Prettier/Vitest/@vue/test-utils**。接下来我会把 `docs/TOOL.md`、`docs/WORK.md`、`TASK.md`、`vite.config.ts`、`.eslintrc.cjs` 这些文件读出来，补全“工具如何用在本项目里”的关键步骤与用途。

### 本项目中已使用的软件与工具清单（基于仓库内容自查）

#### IDE / AI 工具
- **Cursor（IDE）**
  - **解决了什么问题**：编辑与重构 Vue/TS 代码、定位问题、保证改动可运行。
  - **使用场景或关键步骤**：打开并修改核心文件（如 `src/App.vue`、组件与 hooks）；配合运行脚本做验证（见下方 npm scripts）。

- **Cursor Agent（GPT-5.2）**
  - **解决了什么问题**：辅助实现需求/修复 bug、补全类型与逻辑、对齐任务描述。
  - **使用场景或关键步骤**：围绕过滤逻辑、空状态、TypeScript 类型与 ESLint 约束迭代实现（仓库里 `docs/TOOL.md` 有记录）。

#### 运行与构建（Node 工具链）
- **Node.js + npm（包管理与脚本）**
  - **解决了什么问题**：安装依赖、启动开发服务器、构建与预览产物、跑测试/格式化/检查。
  - **使用场景或关键步骤**：
    - `npm install`
    - `npm run dev`（开发验证）
    - `npm run build`、`npm run preview`（产物验证）
    - `npm run lint`、`npm run format`、`npm run test`（质量与回归）

- **Vite（开发服务器/构建工具）**
  - **解决了什么问题**：本地开发热更新、生产构建与预览。
  - **使用场景或关键步骤**：通过 `package.json` scripts 调用；测试配置在 `vite.config.ts`（Vitest 集成）。

#### 前端框架与语言
- **Vue 3（`vue`）**
  - **解决了什么问题**：组件化 UI 与状态/渲染。
  - **使用场景或关键步骤**：用于页面与组件实现（如 `src/App.vue` 等）。

- **TypeScript（`typescript`）**
  - **解决了什么问题**：类型约束与可维护性，减少 `any` 带来的运行期风险。
  - **使用场景或关键步骤**：`tsconfig.json` 开启严格模式；在资源类型与 `useLocalStorage` 等处做类型建模（`REFLECTION.md` 有总结）。

#### 样式与 CSS 工具链
- **Tailwind CSS（`tailwindcss`）**
  - **解决了什么问题**：快速构建 UI 样式与响应式布局。
  - **使用场景或关键步骤**：作为项目样式体系的一部分（`README.md`/`docs/WORK.md` 标注技术栈）。

- **PostCSS（`postcss`）+ Autoprefixer（`autoprefixer`）**
  - **解决了什么问题**：CSS 构建处理与自动补齐浏览器前缀。
  - **使用场景或关键步骤**：作为 Tailwind/Vite 的 CSS 构建链路依赖参与打包。

#### 代码规范与格式化
- **ESLint（`eslint`）**
  - **解决了什么问题**：静态检查常见错误与坏味道，保证提交质量。
  - **使用场景或关键步骤**：`npm run lint`；配置在 `.eslintrc.cjs`。

- **TypeScript ESLint（`@typescript-eslint/parser` / `@typescript-eslint/eslint-plugin`）**
  - **解决了什么问题**：让 ESLint 理解 TS 语法并提供 TS 规则。
  - **使用场景或关键步骤**：作为 ESLint 配置的 parser/规则集启用（`.eslintrc.cjs`）。

- **eslint-plugin-vue（`eslint-plugin-vue`）**
  - **解决了什么问题**：Vue SFC（`.vue`）的模板/脚本规则检查。
  - **使用场景或关键步骤**：启用 `plugin:vue/vue3-recommended`（`.eslintrc.cjs`）。

- **Prettier（`prettier`）+ eslint-config-prettier（`eslint-config-prettier`）**
  - **解决了什么问题**：统一代码格式；避免 ESLint 与 Prettier 规则冲突。
  - **使用场景或关键步骤**：`npm run format`；ESLint extends 里包含 `prettier`（`.eslintrc.cjs`）。

#### 测试工具
- **Vitest（`vitest`）**
  - **解决了什么问题**：单元/组件测试与回归验证。
  - **使用场景或关键步骤**：`npm run test` / `npm run test:watch`；测试环境配置在 `vite.config.ts`（`jsdom`）。

- **JSDOM（`jsdom`）**
  - **解决了什么问题**：在 Node 环境模拟浏览器 DOM，支撑前端测试。
  - **使用场景或关键步骤**：作为 Vitest 的 `environment: 'jsdom'`。

- **Vue Test Utils（`@vue/test-utils`）**
  - **解决了什么问题**：挂载组件、触发交互、断言渲染/行为。
  - **使用场景或关键步骤**：用于 Vue 组件测试（依赖已在 `package.json` 中声明）。

#### 性能与质量分析（浏览器工具）
- **Chrome DevTools（Performance/Insights/Network/Console）**
  - **解决了什么问题**：定位 ORB/CORB 字体请求问题；采集性能基线（LCP/CLS/INP 等）。
  - **使用场景或关键步骤**：按 `docs/Performance.md` 的方法录制 trace、比对 dev vs preview、查看关键请求链与控制台报错。

- **Lighthouse（A11y / Best Practices / SEO）**
  - **解决了什么问题**：对可访问性与最佳实践做基线评估。
  - **使用场景或关键步骤**：生成报告并保存到 `docs/perf/lighthouse/`（见 `docs/Performance.md`）。

- **Vue DevTools（可选，文档里列为方法）**
  - **解决了什么问题**：观察组件更新、props/状态变化，排查不必要渲染。
  - **使用场景或关键步骤**：在 `docs/WORK.md` 的“Performance Analysis Plan”里作为可用工具列出（是否实际安装/使用可由你补充）。

#### 外部依赖/服务（在项目中出现过）
- **Google Fonts（外部字体服务，已移除出关键链路）**
  - **解决了什么问题**：原本用于加载字体资源。
  - **使用场景或关键步骤**：`REFLECTION.md` 与 `docs/Performance.md` 记录了将其从 `src/style.css` 的 `@import` 移除，并改为自托管 `public/fonts/*.woff2` + `index.html` preload，以避免 `net::ERR_BLOCKED_BY_ORB`/CORB 与关键链路风险。

#### 版本控制/交付（任务要求中明确）
- **Git / GitHub（提交与 fork）**
  - **解决了什么问题**：版本管理与按要求提交作业材料。
  - **使用场景或关键步骤**：`TASK.md` 要求 fork 仓库并提交可访问的仓库链接（你可补充具体使用方式：分支策略、PR 与否等）。

---

### 你可以补充的工具位（我先留空，等你补完我再合并）
- **AI 工具（除 Cursor Agent 外）**：例如 ChatGPT / Claude / Copilot（`TASK.md` 允许，但仓库未写明你是否实际使用）
- **搜索引擎**：Google / Bing / Perplexity 等（仓库目前没有具体使用记录）
- **其他本地软件**：例如 Chrome/Edge、截图工具、记笔记工具等（如你确实用过也应计入）

---

**User**

Vue DevTools未使用，还使用了yuanbao搜索浏览器性能MCP，本地软件Chrome，将上文合并到TOOL.md

---

**Cursor**

我会把你补充的三点（**未使用 Vue DevTools**、**使用元宝搜索**、**用 Chrome 做本地验证**，以及 **Chrome DevTools 性能 MCP**）合并进 `docs/TOOL.md`，并顺手把当前项目里已出现的工具链补全成一份更完整、符合 `TASK.md` 要求的“Problem solved / Usage”清单。

`docs/TOOL.md` 已合并你补充的内容，并把项目里实际出现的工具链按“Problem solved / Usage”补全到可直接交付的程度；同时明确标注 **Vue DevTools 未使用**。我接下来会快速复读一遍文件，确认格式与内容无误、且不与 `TASK.md` 要求冲突。

### 已合并到 `docs/TOOL.md`
已按你的补充把以下内容写入并补全清单：

- **Vue DevTools**：明确标注 **Not used**
- **Yuanbao（元宝搜索）**：补充为搜索/资料查找工具（性能排查相关）
- **Chrome（本地软件）**：补充为手动验证与回归的浏览器
- 同时把与之对应的 **Chrome DevTools 性能（MCP：`user-chrome-devtools`）** 也写入，并指向 `docs/Performance.md` 作为证据来源

更新后的文件在：`c:\Users\14227\Desktop\personal_resource_hub\docs\TOOL.md`

