# Use local storage test error
_Exported on 2026/4/20 at GMT+8 17:11:18 from Cursor (3.1.15)_

---

**User**

@src/hooks/useLocalStorage.test.ts 报错修复一下

---

**Cursor**

我先定位 `useLocalStorage` 的实现和这份测试里失败的断言/Mock（通常是 JSDOM 的 `localStorage`、`watch` 异步刷新、或 TS 类型不匹配），然后针对性改测试/实现，最后跑一遍测试确保绿。

我已经读到测试和实现了：实现里 `watch` 写入会把值 `JSON.stringify(toJsonSafe(value))` 存进去（即便是 number 也会变成 `"2"` 带引号），而测试里对原始字符串期望是 `'2'`。我先跑一遍测试拿到确切失败点，然后按实现的“统一 JSON 序列化”规则修正测试断言即可。

测试跑是全绿（`vitest run` 18/18 通过），所以你看到的“报错”更像是 IDE 里的 TypeScript/ESLint 诊断。我现在去读一下 `useLocalStorage.test.ts` 的 lints/类型错误，并直接把它们修掉。

我已经复现到是 **TypeScript 类型层面** 的报错（不是 vitest 失败）：主要是 `Set` 的泛型丢失变成 `Set<unknown>`，以及 `useLocalStorage('ka', 1)` 让 TS 推断成字面量类型 `1` 导致后续赋值 `10` 报错。接下来我会只改测试里的类型标注/初始值写法，不改业务实现。

### 已修复内容（`src/hooks/useLocalStorage.test.ts`）
- **修复 `Set<unknown>` 导致的 TS 深度实例化/类型不兼容**：把 `new Set()` 改成 `new Set<number>()`
- **修复字面量类型 `1`/`2` 导致无法再赋值 `10`/`20`**：把初始值改成 `1 as number`、`2 as number`

### 验证结果
- **该文件已无 TS/Lint 报错**
- **`npm test`（vitest）全绿：18/18 通过**

