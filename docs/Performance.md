# Performance 分析报告（ORB 字体修复 + 生产性能基线）

日期：2026-04-20  
目标页面（dev）：`http://localhost:5173/`  
目标页面（prod/preview）：`http://localhost:4173/`  
分析工具：`user-chrome-devtools` MCP（Performance Trace / Insights / Network / Console）、Lighthouse（A11y/Best Practices/SEO）  

## 1. 测试环境与方法

- **环境**：
  - Dev：Vite 开发服务（无 CPU/网络节流）
  - Prod：`vite build` + `vite preview`（`http://localhost:4173/`）
- **Trace 场景**：
  - Dev 冷启动：页面 reload 后首屏加载
  - Prod 冷启动（desktop）：页面 reload 后首屏加载
  - Prod 冷启动（mobile + 节流）：viewport=390x844x3 + Fast 3G + CPU 4x
  - Prod 关键交互：Search 输入 “performance”（用于 INP 近似）
- **证据产物**：
  - Trace（dev/cold）：`docs/perf/trace-cold.json.gz`
  - Trace（prod/desktop）：`docs/perf/trace-prod-desktop.json.gz`
  - Trace（prod/mobile-throttled）：`docs/perf/trace-prod-mobile-throttled.json.gz`
  - Trace（prod/interaction-search）：`docs/perf/trace-prod-interaction-search.json.gz`
  - Lighthouse 报告（非 Performance 类别）：
    - `docs/perf/lighthouse/report.html`
    - `docs/perf/lighthouse/report.json`

## 2. 关键结论（高优先级）

- **ORB/CORB 根因已修复**：字体由外链改为 **自托管 woff2**，Network 中不再出现 `fonts.googleapis.com`；生产环境网络请求仅剩本地 JS/CSS/字体。
- **Dev LCP（实验室）**：约 **103ms**（LCP 为文本；主要耗时在 render delay ≈99ms）。
- **Prod LCP（实验室，desktop）**：约 **86ms**，CLS **0.00**；关键链路最大约 **18ms**（JS/CSS）。
- **Prod LCP（实验室，mobile + Fast 3G + CPU 4x）**：约 **1252ms**，主要为 **render delay**；Insights 指向 render-blocking 的 CSS 在该条件下总耗时约 **585ms**（节流环境下放大）。
- **Prod INP（实验室，Search 输入）**：**34ms**（keypress），属于 “Good”。

## 3. 观测数据（来自 Performance Insights）

### 3.1 Dev：LCP Breakdown（修复前基线）

- **LCP**：103ms
- **TTFB**：4ms（4.1%）
- **Element render delay**：99ms（95.9%）

### 3.2 Dev：Network Dependency Tree（修复前基线）

- **Max critical path latency**：101ms
- **最长链路**包含：`https://fonts.googleapis.com/css2?...`（并出现 `net::ERR_BLOCKED_BY_ORB`）

### 3.3 Prod（desktop）冷启动（`http://localhost:4173/`）

- **LCP**：86ms（TTFB 4ms / render delay 82ms）
- **Network**：6 个请求，包含自托管字体：
  - `/assets/index-*.js`、`/assets/index-*.css`
  - `/fonts/space-grotesk-latin.woff2`、`/fonts/fraunces-latin.woff2`
- **关键链路**：最大关键路径延迟约 **18ms**（最长链路为 JS/CSS）

### 3.4 Prod（mobile + 节流）冷启动

- **LCP**：1252ms（TTFB 2ms / render delay 1250ms）
- **RenderBlocking Insight**：`/assets/index-*.css` render-blocking 总耗时约 **585ms**（估算可节省 FCP/LCP 585ms）
- **说明**：节流条件会显著放大关键资源（尤其 CSS）加载/处理对首屏的影响。

### 3.5 Prod 关键交互（Search 输入）

- **INP**：34ms（keypress）
  - input delay 0.7ms / processing 14ms / presentation 19ms

## 4. 网络与控制台证据

### 4.1 修复前（dev）

- `GET https://fonts.googleapis.com/css2?...` → **`net::ERR_BLOCKED_BY_ORB`**
- Console issue：CORB / Verify stylesheet URLs

### 4.2 修复后（prod/preview）

- Network 中仅出现本地资源与字体：`/fonts/*.woff2`（无外链）
- Console：无报错/issue

## 5. Lighthouse（非性能项）结果

> 说明：该 Lighthouse 工具不包含 Performance 类别，这里仅提供 A11y/Best Practices/SEO。

- **Accessibility**：96
- **Best Practices**：100
- **SEO**：82
- 报告：`docs/perf/lighthouse/report.html`

## 6. 已实施修复（代码层）

- **移除外链字体**：删除 `src/style.css` 内 `@import fonts.googleapis.com`。
- **字体自托管**：
  - 文件：`public/fonts/space-grotesk-latin.woff2`、`public/fonts/fraunces-latin.woff2`
  - 样式：`src/style.css` 使用 `@font-face`（`font-display: swap`，并限定 latin `unicode-range`）
- **预加载**：`index.html` 对两份字体做 `rel=preload as=font`。

## 7. 下一步可选优化（针对节流场景的 CSS render-blocking）

**现象**：在 mobile + Fast 3G + CPU 4x 下，Insights 显示 `index-*.css` render-blocking 总耗时约 585ms。  
**可选方向**（按性价比排序）：

- **减少首屏关键 CSS**：确保 Tailwind 内容扫描覆盖准确、删除未使用样式，避免首屏引入不必要的昂贵样式（复杂阴影/大范围动画）。
- **拆分非关键 CSS**：将非首屏样式延迟加载（小项目收益有限，增加复杂度，需权衡）。
- **再次采样确认**：在更贴近目标用户的节流组合与真实网络下重复采样，确认是否稳定复现与收益。

## 8. MCP 覆盖情况与限制说明

- **已使用**：`user-chrome-devtools`（trace + insights + network + console）、Lighthouse（A11y/Best Practices/SEO）
- **未能使用**：`user-browser-tools-mcp` 的 `runPerformanceAudit`
  - 返回错误：需要浏览器中已导航且 browser-tool 扩展 tab 打开（该扩展上下文在本次自动化环境中不可用）

# Performance 分析报告（ORB 字体修复 + 生产性能基线）

日期：2026-04-20  
目标页面（dev）：`http://localhost:5173/`  
目标页面（prod/preview）：`http://localhost:4173/`  
分析工具：`user-chrome-devtools` MCP（Performance Trace / Insights / Network / Console）、Lighthouse（A11y/Best Practices/SEO）  

## 1. 测试环境与方法

- **环境**：
  - Dev：Vite 开发服务（无 CPU/网络节流）
  - Prod：`vite build` + `vite preview`（`http://localhost:4173/`）
- **Trace 场景**：
  - Dev 冷启动：页面 reload 后首屏加载
  - Prod 冷启动（desktop）：页面 reload 后首屏加载
  - Prod 冷启动（mobile + 节流）：viewport=390x844x3 + Fast 3G + CPU 4x
  - Prod 关键交互：Search 输入 “performance”（用于 INP 近似）
- **证据产物**：
  - Trace（dev/cold）：`docs/perf/trace-cold.json.gz`
  - Trace（prod/desktop）：`docs/perf/trace-prod-desktop.json.gz`
  - Trace（prod/mobile-throttled）：`docs/perf/trace-prod-mobile-throttled.json.gz`
  - Trace（prod/interaction-search）：`docs/perf/trace-prod-interaction-search.json.gz`
  - Lighthouse 报告（非 Performance 类别）：
    - `docs/perf/lighthouse/report.html`
    - `docs/perf/lighthouse/report.json`

## 2. 关键结论（高优先级）

- **ORB/CORB 根因已修复**：字体由外链改为 **自托管 woff2**，Network 中不再出现 `fonts.googleapis.com`；生产环境网络请求仅剩本地 JS/CSS/字体。
- **Dev LCP（实验室）**：约 **103ms**（LCP 为文本；主要耗时在 render delay ≈99ms）。
- **Prod LCP（实验室，desktop）**：约 **86ms**，CLS **0.00**；关键链路最大约 **18ms**（JS/CSS）。
- **Prod LCP（实验室，mobile + Fast 3G + CPU 4x）**：约 **1252ms**，主要为 **render delay**；Insights 指向 render-blocking 的 CSS 在该条件下总耗时约 **585ms**（节流环境下放大）。
- **Prod INP（实验室，Search 输入）**：**34ms**（keypress），属于“Good”。\n+\n+## 3. 观测数据（来自 Performance Insights）\n+\n+### 3.1 Dev：LCP Breakdown（修复前基线）\n+\n+- **LCP**：103ms\n+- **TTFB**：4ms（4.1%）\n+- **Element render delay**：99ms（95.9%）\n+\n+### 3.2 Dev：Network Dependency Tree（修复前基线）\n+\n+- **Max critical path latency**：101ms\n+- **最长链路**包含：`https://fonts.googleapis.com/css2?...`（并出现 `net::ERR_BLOCKED_BY_ORB`）\n+\n+### 3.3 Prod（desktop）冷启动（`http://localhost:4173/`）\n+\n+- **LCP**：86ms（TTFB 4ms / render delay 82ms）\n+- **Network**：6 个请求，包含自托管字体：\n+  - `/assets/index-*.js`、`/assets/index-*.css`\n+  - `/fonts/space-grotesk-latin.woff2`、`/fonts/fraunces-latin.woff2`\n+- **关键链路**：最大关键路径延迟约 **18ms**（最长链路为 JS/CSS）\n+\n+### 3.4 Prod（mobile + 节流）冷启动\n+\n+- **LCP**：1252ms（TTFB 2ms / render delay 1250ms）\n+- **RenderBlocking Insight**：`/assets/index-*.css` render-blocking 总耗时约 **585ms**（估算可节省 FCP/LCP 585ms）\n+- **说明**：节流条件会显著放大关键资源（尤其 CSS）加载/处理对首屏的影响。\n+\n+### 3.5 Prod 关键交互（Search 输入）\n+\n+- **INP**：34ms（keypress）\n+  - input delay 0.7ms / processing 14ms / presentation 19ms\n+\n+## 4. 网络与控制台证据\n+\n+### 4.1 修复前（dev）\n+\n+- `GET https://fonts.googleapis.com/css2?...` → **`net::ERR_BLOCKED_BY_ORB`**\n+- Console issue：CORB / Verify stylesheet URLs\n+\n+### 4.2 修复后（prod/preview）\n+\n+- Network 中仅出现本地资源与字体：`/fonts/*.woff2`（无外链）\n+- Console：无报错/issue\n+\n+## 5. Lighthouse（非性能项）结果\n+\n+> 说明：该 Lighthouse 工具不包含 Performance 类别，这里仅提供 A11y/Best Practices/SEO。\n+\n+- **Accessibility**：96\n+- **Best Practices**：100\n+- **SEO**：82\n+- 报告：`docs/perf/lighthouse/report.html`\n+\n+## 6. 已实施修复（代码层）\n+\n+- **移除外链字体**：删除 `src/style.css` 内 `@import fonts.googleapis.com`。\n+- **字体自托管**：\n+  - 文件：`public/fonts/space-grotesk-latin.woff2`、`public/fonts/fraunces-latin.woff2`\n+  - 样式：`src/style.css` 使用 `@font-face`（`font-display: swap`，并限定 latin `unicode-range`）\n+- **预加载**：`index.html` 对两份字体做 `rel=preload as=font`。\n+\n+## 7. 下一步可选优化（针对节流场景的 CSS render-blocking）\n+\n+**现象**：在 mobile + Fast 3G + CPU 4x 下，Insights 显示 `index-*.css` render-blocking 总耗时约 585ms。  \n+**可选方向**（按性价比排序）：\n+\n+- **减少首屏关键 CSS**：确保 Tailwind 内容扫描覆盖准确、删除未使用样式，避免首屏引入不必要的昂贵样式（复杂阴影/大范围动画）。\n+- **拆分非关键 CSS**：将非首屏样式延迟加载（小项目收益有限，增加复杂度，需权衡）。\n+- **再次采样确认**：在更贴近目标用户的节流组合与真实网络下重复采样，确认是否稳定复现与收益。\n+\n+## 8. MCP 覆盖情况与限制说明\n+\n+- **已使用**：`user-chrome-devtools`（trace + insights + network + console）、Lighthouse（A11y/Best Practices/SEO）\n+- **未能使用**：`user-browser-tools-mcp` 的 `runPerformanceAudit`\n+  - 返回错误：需要浏览器中已导航且 browser-tool 扩展 tab 打开（该扩展上下文在本次自动化环境中不可用）\n*** End Patch"}Oops ApplyPatch needs freeform not json. We'll correct."}}]} 
