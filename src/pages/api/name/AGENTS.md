<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-27 | Updated: 2026-03-27 -->

# src/pages/api/name

## Purpose
按文件名动态查询 OneDrive 文件的 API 路由，路径参数为文件名。用于通过文件名直接获取文件元数据或下载链接。

## Key Files

| 文件 | 说明 |
|------|------|
| `[name].ts` | 动态路由，接收 `name` 参数，查询 OneDrive 中匹配文件名的文件 |

## For AI Agents

### Working In This Directory
- 遵循与 `src/pages/api/` 相同的认证和错误处理模式
- `[name]` 路由参数通过 `req.query.name` 获取

<!-- MANUAL: -->
