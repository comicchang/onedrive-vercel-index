<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-27 | Updated: 2026-03-27 -->

# src/pages/api

## Purpose
Next.js API 路由，作为前端与 Microsoft Graph API 之间的服务端代理。负责令牌获取/刷新、目录列表、文件元数据、原始文件流、缩略图代理和全文搜索。所有 OneDrive 请求必须经过此层（避免 CORS 和 token 泄漏）。

## Key Files

| 文件 | 说明 |
|------|------|
| `index.ts` | 目录列表接口，返回指定路径下的文件/文件夹列表（支持分页） |
| `item.ts` | 单文件元数据接口，返回文件详情（大小、修改时间、下载链接等） |
| `raw.ts` | 原始文件流代理，将 OneDrive 直链转发给客户端（供预览组件使用） |
| `search.ts` | OneDrive 全文搜索接口 |
| `thumbnail.ts` | 文件缩略图代理接口 |

## Subdirectories

| 目录 | 说明 |
|------|------|
| `name/` | 按文件名查找接口（见 `name/AGENTS.md`） |

## For AI Agents

### Working In This Directory
- 每个接口都需要有效的 access token，通过 `src/utils/odAuthTokenStore.ts` 从 Redis 读取
- 密码保护目录验证逻辑在 `src/utils/protectedRouteHandler.ts`
- Cache-Control 头由 `config/api.config.js` 的 `cacheControlHeader` 控制
- 错误统一返回 JSON `{ error: string }`，HTTP 状态码语义明确

### Testing Requirements
- API 路由需要有效的 OneDrive token 才能完整测试
- 本地开发需在 `.env.local` 中配置 Redis 连接和 KV 存储

### Common Patterns
- 所有接口为 Next.js API handler（`NextApiRequest` / `NextApiResponse`）
- 认证失败返回 401，路径不存在返回 404

## Dependencies

### Internal
- `src/utils/oAuthHandler.ts` — token 获取与刷新
- `src/utils/odAuthTokenStore.ts` — Redis token 存储
- `src/utils/protectedRouteHandler.ts` — 密码保护验证
- `config/api.config.js` — API 端点与缓存配置

### External
- `axios` — 转发 Graph API 请求
- `ioredis` — Redis 连接（通过 token store）

<!-- MANUAL: -->
