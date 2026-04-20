## Tooling log

### Cursor (IDE)

- **Problem solved**: Implemented Task 1 UI behavior (search + empty state) and ensured the project still linted cleanly.
- **Usage / key steps**: Opened relevant Vue components (`App.vue`, `SearchBar.vue`, `Sidebar.vue`), updated TypeScript types, and ran `npm run lint` to verify quality.

### Cursor Agent (GPT-5.2)

- **Problem solved**: Assisted with code changes and ensuring the required behaviors matched the task description.
- **Usage / key steps**: Iterated on filtering logic, empty-state UI, and TypeScript typing while keeping ESLint passing.

### Node.js + npm (package manager & scripts)

- **Problem solved**: Verified the category filter fix and ensured the project still builds successfully after changes.
- **Usage / key steps**:
  - Install: `npm install`
  - Dev: `npm run dev` (manual UI verification)
  - Lint: `npm run lint`
  - Format: `npm run format`
  - Test: `npm run test` / `npm run test:watch`
  - Build: `npm run build`
  - Preview: `npm run preview` (validate production build output)

### Vite (dev server & bundler)

- **Problem solved**: Provides fast dev server (HMR) and production bundling/preview for the Vue app.
- **Usage / key steps**: Used via npm scripts (`vite`, `vite build`, `vite preview`); test configuration lives in `vite.config.ts`.

### Vue 3 (framework)

- **Problem solved**: Component model and reactive rendering for the app UI.
- **Usage / key steps**: Implemented and updated Vue SFCs (e.g. `src/App.vue` and components under `src/components/`).

### TypeScript (static typing)

- **Problem solved**: Enforced type-safety for core data structures and reduced runtime risks during refactors.
- **Usage / key steps**: Updated types (e.g. `src/types/resource.ts`) and tightened generics/guards in hooks (e.g. `src/hooks/useLocalStorage.ts`) under strict `tsconfig.json` settings.

### Tailwind CSS (utility-first styling)

- **Problem solved**: Rapid UI styling and responsive layout without writing much bespoke CSS.
- **Usage / key steps**: Used Tailwind utility classes across Vue components (per project stack in `README.md`).

### PostCSS + Autoprefixer (CSS toolchain)

- **Problem solved**: Processes CSS and adds vendor prefixes for broader browser compatibility.
- **Usage / key steps**: Runs as part of the Vite/Tailwind build pipeline (declared in `package.json` devDependencies).

### ESLint + TypeScript ESLint + eslint-plugin-vue (linting)

- **Problem solved**: Catches common JavaScript/TypeScript/Vue issues early and keeps code quality consistent.
- **Usage / key steps**: Configured in `.eslintrc.cjs`; verified with `npm run lint`.

### Prettier + eslint-config-prettier (formatting)

- **Problem solved**: Enforced consistent formatting and avoided rule conflicts with ESLint.
- **Usage / key steps**: Ran `npm run format`; ESLint extends `prettier` to disable conflicting stylistic rules.

### Vitest (test runner)

- **Problem solved**: Provides fast unit/behavior tests for TypeScript/Vue code.
- **Usage / key steps**: `npm run test` / `npm run test:watch`; uses `jsdom` environment configured in `vite.config.ts`.

### JSDOM (test DOM environment)

- **Problem solved**: Simulates a browser DOM in Node.js so component logic can be tested.
- **Usage / key steps**: Used as Vitest test environment (`environment: 'jsdom'`).

### Vue Test Utils (`@vue/test-utils`) (component testing utilities)

- **Problem solved**: Mounts Vue components and simulates interactions for assertions in tests.
- **Usage / key steps**: Used in tests (e.g. under `src/**/*.test.ts`).

### Chrome (local browser)

- **Problem solved**: Manual verification of UI behavior and regression checks in a real browser runtime.
- **Usage / key steps**: Opened the app served by `npm run dev` / `npm run preview`, reproduced issues, and validated fixes.

### Chrome DevTools Performance (via MCP: `user-chrome-devtools`)

- **Problem solved**: Captured performance traces and network/console evidence to diagnose the ORB/CORB font issue and establish production baselines.
- **Usage / key steps**: Recorded traces (cold load + key interaction), inspected Network/Console, and documented artifacts and results in `docs/Performance.md`.

### Lighthouse (A11y / Best Practices / SEO)

- **Problem solved**: Generated quality signals for accessibility and best-practice compliance.
- **Usage / key steps**: Ran Lighthouse audits and saved reports under `docs/perf/lighthouse/` (see `docs/Performance.md`).

### Yuanbao (search)

- **Problem solved**: Quickly looked up references and troubleshooting ideas related to browser performance analysis workflows/tools.
- **Usage / key steps**: Used during the performance investigation phase to find relevant concepts and suggested diagnostic steps, then validated findings via Chrome DevTools traces.

### Vue DevTools (not used)

- **Problem solved**: (N/A in this submission) Would help inspect component updates and reactive state during debugging.
- **Usage / key steps**: Not used.

### Git + GitHub (version control & submission)

- **Problem solved**: Version control for changes and publishing the fork/submission repository per `TASK.md`.
- **Usage / key steps**: Committed incremental changes and kept the repo in a runnable state (`npm run dev`) for submission.
