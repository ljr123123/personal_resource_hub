# Importing MCP from GitHub
_Exported on 2026/4/20 at GMT+8 17:11:09 from Cursor (3.1.15)_

---

**User**

https://github.com/AgentDeskAI/browser-tools-mcp 在 @c:\Users\14227\.cursor\mcp.json 中引入该MCP

---

**Cursor**

我先读取你当前的 `c:\Users\14227\.cursor\mcp.json`，确认现有 MCP 配置结构，然后把 `browser-tools-mcp` 以正确的命令与参数加进去（不破坏你已有的其它 MCP）。

我看到了：你当前的 `mcp.json` 末尾花括号不匹配，导致 **JSON 本身是无效的**（Cursor 可能无法正确加载任何 MCP）。我会先把结构修正为合法 JSON，然后在 `mcpServers` 里新增 `browser-tools-mcp`，使用官方的 `npx @agentdeskai/browser-tools-mcp@latest` 启动方式。

我刚才的补丁没能匹配到文件里的原始缩进/括号（你这个文件末尾结构有点乱），我先重新读取一遍当前 `mcp.json` 的实际内容，再用精确上下文把它修成合法 JSON 并加入 `browser-tools-mcp`。

### 已完成：在 `c:\Users\14227\.cursor\mcp.json` 引入 `browser-tools-mcp`

- **已修复**：你原来的 `mcp.json` 末尾括号不匹配，导致 JSON 无效；我已修正为合法 JSON。
- **已新增**：在 `mcpServers` 中加入：

```json
"browser-tools-mcp": {
  "command": "npx",
  "args": ["@agentdeskai/browser-tools-mcp@latest"]
}
```

### 你接下来要做的两步（这个 MCP 的必要运行方式）
- **重启 Cursor**（或至少重载窗口），让新的 `mcp.json` 生效
- **另外开一个终端长期运行**（这是它的“中间件 Node Server”，不写在 mcp.json 里）：

```bash
npx @agentdeskai/browser-tools-server@latest
```

需要我顺手也帮你把 `github` 里的 `Authorization` token 从配置里移走（避免泄露风险）的话，告诉我你想用哪种方式存放（环境变量/单独 secrets 文件/系统凭据）。

