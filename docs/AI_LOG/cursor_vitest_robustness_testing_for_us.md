# Vitest robustness testing for useLocalStorage
_Exported on 2026/4/20 at GMT+8 17:10:56 from Cursor (3.1.15)_

---

**User**

使用vitest对 @src/hooks/useLocalStorage.ts 的导出函数进行稳健性测试

---

**Cursor**

正在阅读 `useLocalStorage.ts` 与项目的测试配置，以便用 Vitest 编写稳健测试。



正在为仅导出的 `useLocalStorage` 配置 Vitest（含 jsdom），并编写覆盖读写、边界与错误的测试。



升级 `@vitejs/plugin-vue` 以匹配 Vite 8，并重新安装 Vitest。



正在更新 `vite.config.ts` 与 `package.json`，并添加测试文件。



正在简化测试：`withScope` 实现有误，改为使用 `effectScope` 与清晰的辅助函数。



正在移除对未导出的 `DecodedValue` 的引用，并修复 `localStorage` 拦截测试的清理逻辑。



## 已完成内容

`useLocalStorage.ts` 只导出了 **`useLocalStorage`**，因此测试全部围绕该组合式函数在 **jsdom + `effectScope`** 下的行为展开（保证 `watch` 在有效作用域内注册）。

### 依赖与配置

- 安装 **Vitest、jsdom、`@vue/test-utils`**；将 **`@vitejs/plugin-vue` 升到 ^6**，以消除与 **Vite 8** 的 peer 冲突。
- 在 `vite.config.ts` 中增加 `test.environment: 'jsdom'` 与 `include`。
- 在 `package.json` 中增加脚本：`test`（`vitest run`）、`test:watch`（`vitest`）。

### 测试文件

新建 **`src/hooks/useLocalStorage.test.ts`**，共 **18** 条用例，覆盖：

| 类别 | 内容 |
|------|------|
| 读取 | 无 key、空字符串、非法 JSON、合法原始值 |
| 序列化/反序列化 | `Date`、`Map`、`Set`、带 flags 的 `RegExp`、`Error`、`NaN`/`±Infinity`、`bigint` |
| 边界 | 根节点为 `Undefined` 标签时不覆盖初始值 |
| 响应式 | `deep: true` 下嵌套属性变更会写入 |
| 容错 | `setItem` 抛错不向外抛；`localStorage` getter 抛错时仍能初始化 |
| 其它 | 多 key 隔离；循环引用序列化含 `Circular` 且不崩溃 |

辅助逻辑：`settle()` = `nextTick` + `flushPromises`，避免 watcher 未刷完就断言。

本地可执行：

```bash
npm run test
npm run test:watch
```

当前 **`npm run test`** 与 **`npm run lint`** 均已通过。

