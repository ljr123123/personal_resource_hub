## AI Log (unedited transcript)

### 2026-04-18

User:
`完成 @README.md 中任务1`

Assistant:
`我先快速读一下 README.md 里的“任务1”具体要求，以及仓库里和提交规范相关的规则文件；然后定位对应代码位置（大概率在 src/），完成实现并本地跑一下（你这边 npm run dev 已在跑，我会尽量复用并做必要的检查）。`

Assistant:
`我已经确认 README.md 的任务1是：补齐缺失的 UI 行为（搜索与空状态）。接下来我会查看相关组件（SearchBar/Sidebar/ResourceCard）和数据结构，然后在 App.vue 里把过滤逻辑补全，并在列表为空时渲染一个友好的空结果提示。`

Assistant:
`接下来我会做两件事：先把 ResourceItem 的类型补齐到和现有 UI/数据一致（否则搜索/渲染会有 TS 隐患），再在 App.vue 里实现“按标题/标签搜索 + 无结果空状态”的 UI，并顺手修掉当前分类过滤不随点击更新的问题（它会直接影响任务1的体验）。`

Assistant:
`我现在开始落地实现：先把 src/types/resource.ts 补齐字段（让“按标签搜索/渲染标签”有类型依据），然后改 src/App.vue 的过滤逻辑为“分类 + 搜索词”共同生效，并在结果为 0 时展示空状态（含清空搜索/返回 All 的快捷操作）。`

Assistant:
`核心 UI 行为已经补上了：搜索会同时匹配标题与标签，且和分类过滤叠加生效；当没有结果时会显示空状态并提供“一键清空/重置”。接下来我会跑一下当前改动的类型检查/lint，确保 npm run dev 不会被 TS 或 ESLint 卡住，然后把工具清单和 AI 记录按要求补齐到 docs/TOOL.md、docs/AI_LOG.md。`

User:
`完成 @README.md 中任务2`

Assistant:
`我先读一下 README.md 里“任务2”的具体要求与验收标准，同时读取提交规范（.cursor/rules/take-home-submission.mdc），然后在代码里完成对应功能并本地跑起来验证。`

Assistant:
`我接下来会定位“分类筛选不生效/不更新列表”的触发链路（Sidebar 选中分类 → 状态存储 → 资源列表过滤），复现后把数据流改成单向、可追踪的方式（通常是把选中分类提升到 App.vue 并用 props/emit 传递），然后在 npm run dev 下手动验证。`

Assistant:
`我看到当前 App.vue/Sidebar.vue 的数据流表面上是对的，所以这个“分类筛选不更新列表”的 bug 很可能出在：useLocalStorage 返回值不够响应式、或资源的 tags/category 字段实际不匹配（比如大小写/字段名）。我先把本地存储 hook 和 mock 数据读出来，确认真实数据结构与响应式链路。`

Assistant:
`我会用一个“低风险但很可能就是根因”的修复：把侧边栏分类按钮明确设为 type="button"，避免在任何表单/容器场景下被当成 submit 导致状态更新后又被刷新/重置，从而表现为“选了分类但列表没变”。改完后我再跑一下本地构建/类型检查，确保没有副作用。`
