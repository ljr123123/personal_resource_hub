# Performance Analysis Report (ORB font fix + production baseline)

Date: 2026-04-20  
Target (dev): `http://localhost:5173/`  
Target (prod/preview): `http://localhost:4173/`  
Tools: `user-chrome-devtools` MCP (Performance Trace / Insights / Network / Console), Lighthouse (A11y / Best Practices / SEO)  

## 1. Environment & Method

- **Environment**:
  - Dev: Vite dev server (no CPU/network throttling)
  - Prod: `vite build` + `vite preview` (`http://localhost:4173/`)
- **Trace scenarios**:
  - Dev cold start: reload and measure initial render
  - Prod cold start (desktop): reload and measure initial render
  - Prod cold start (mobile + throttled): viewport=390x844x3 + Fast 3G + CPU 4x
  - Prod key interaction: type “performance” in Search (used as an INP proxy)
- **Evidence artifacts**:
  - Trace (dev/cold): `docs/perf/trace-cold.json.gz`
  - Trace (prod/desktop): `docs/perf/trace-prod-desktop.json.gz`
  - Trace (prod/mobile-throttled): `docs/perf/trace-prod-mobile-throttled.json.gz`
  - Trace (prod/interaction-search): `docs/perf/trace-prod-interaction-search.json.gz`
  - Lighthouse reports (non-Performance categories):
    - `docs/perf/lighthouse/report.html`
    - `docs/perf/lighthouse/report.json`

## 2. Key Findings (High Priority)

- **ORB/CORB root cause fixed**: fonts were switched from external loading to **self-hosted woff2**. `fonts.googleapis.com` no longer appears in Network; production requests are limited to local JS/CSS/fonts.
- **Dev LCP (lab)**: ~**103ms** (text LCP; most time is render delay ≈99ms).
- **Prod LCP (lab, desktop)**: ~**86ms**, CLS **0.00**; max critical chain latency ~**18ms** (JS/CSS).
- **Prod LCP (lab, mobile + Fast 3G + CPU 4x)**: ~**1252ms**, dominated by **render delay**; Insights flags render-blocking CSS totaling ~**585ms** under throttling (amplified by the test conditions).
- **Prod INP (lab, Search typing)**: **34ms** (keypress), rated “Good”.

## 3. Observations (Performance Insights)

### 3.1 Dev: LCP breakdown (pre-fix baseline)

- **LCP**: 103ms
- **TTFB**: 4ms (4.1%)
- **Element render delay**: 99ms (95.9%)

### 3.2 Dev: Network dependency tree (pre-fix baseline)

- **Max critical path latency**: 101ms
- The **longest chain** included `https://fonts.googleapis.com/css2?...` and showed `net::ERR_BLOCKED_BY_ORB`

### 3.3 Prod (desktop) cold start (`http://localhost:4173/`)

- **LCP**: 86ms (TTFB 4ms / render delay 82ms)
- **Network**: 6 requests, including self-hosted fonts:
  - `/assets/index-*.js`, `/assets/index-*.css`
  - `/fonts/space-grotesk-latin.woff2`, `/fonts/fraunces-latin.woff2`
- **Critical chain**: max critical path latency ~**18ms** (longest chain is JS/CSS)

### 3.4 Prod (mobile + throttled) cold start

- **LCP**: 1252ms (TTFB 2ms / render delay 1250ms)
- **RenderBlocking Insight**: `/assets/index-*.css` render-blocking total ~**585ms** (estimated savings for FCP/LCP: 585ms)
- **Note**: throttling significantly amplifies the impact of critical resources (especially CSS) on initial render.

### 3.5 Prod key interaction (Search typing)

- **INP**: 34ms (keypress)
  - input delay 0.7ms / processing 14ms / presentation 19ms

## 4. Network & Console Evidence

### 4.1 Before the fix (dev)

- `GET https://fonts.googleapis.com/css2?...` → **`net::ERR_BLOCKED_BY_ORB`**
- Console issue: CORB / “Verify stylesheet URLs”

### 4.2 After the fix (prod/preview)

- Network only shows local resources and fonts: `/fonts/*.woff2` (no external font requests)
- Console: no errors/issues

## 5. Lighthouse Results (Non-performance categories)

> Note: this Lighthouse run does not include the Performance category. Results below are for A11y / Best Practices / SEO only.

- **Accessibility**: 96
- **Best Practices**: 100
- **SEO**: 82
- Report: `docs/perf/lighthouse/report.html`

## 6. Implemented Fixes (Code Changes)

- **Removed external fonts**: deleted `@import fonts.googleapis.com` from `src/style.css`.
- **Self-hosted fonts**:
  - Files: `public/fonts/space-grotesk-latin.woff2`, `public/fonts/fraunces-latin.woff2`
  - Styles: `@font-face` in `src/style.css` (`font-display: swap`, with latin-only `unicode-range`)
- **Preload**: `index.html` adds `rel=preload as=font` for both font files.

## 7. Optional Next Steps (CSS render-blocking under throttling)

**Symptom**: under mobile + Fast 3G + CPU 4x, Insights reports ~585ms total render-blocking time from `index-*.css`.  
**Potential approaches** (ordered by cost/benefit):

- **Reduce above-the-fold critical CSS**: ensure Tailwind content scanning is accurate and purge unused styles; avoid expensive above-the-fold styles (heavy shadows, large animations).
- **Split non-critical CSS**: lazy-load non-above-the-fold styles (limited payoff for a small app; adds complexity—tradeoff required).
- **Re-sample to confirm**: repeat traces under a throttling setup closer to target users and real network conditions to confirm stability and expected gains.

## 8. MCP Coverage & Limitations

- **Used**: `user-chrome-devtools` (trace + insights + network + console), Lighthouse (A11y / Best Practices / SEO)
- **Not used**: `user-browser-tools-mcp` `runPerformanceAudit`
  - Error: requires a navigated browser tab with the browser-tool extension context, which was not available in this automation environment.
