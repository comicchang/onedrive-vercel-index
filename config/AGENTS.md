<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-27 | Updated: 2026-03-27 -->

# config

## Purpose
站点与 Microsoft Graph API 的配置入口。部署新实例时只需修改这两个文件，无需改动业务代码。

## Key Files

| 文件 | 说明 |
|------|------|
| `site.config.js` | 站点外观与行为配置：标题、图标、共享目录、字体、页脚、密码保护路径、社交链接、时间格式 |
| `api.config.js` | Microsoft OAuth 配置：clientId、加密的 clientSecret、redirectUri、API 端点、权限 scope、缓存头 |

## For AI Agents

### Working In This Directory
- `site.config.js` 中的敏感字段（`userPrincipalName`）应通过环境变量 `NEXT_PUBLIC_USER_PRINCIPLE_NAME` 注入
- `api.config.js` 中的 `obfuscatedClientSecret` 是 AES 加密值，不是明文密钥
- `kvPrefix` 用于 Redis KV 存储的键前缀隔离，多实例部署时需设置
- `protectedRoutes` 数组中的路径对应 OneDrive 中存放 `.password` 文件的目录

### Testing Requirements
- 修改后需重启开发服务器使配置生效
- `site.config.js` 修改影响前端渲染；`api.config.js` 修改影响 API 路由认证

### Common Patterns
- 两个文件均使用 CommonJS `module.exports`（非 ESM），供 Next.js 配置系统直接 require

## Dependencies

### Internal
- 被 `src/utils/oAuthHandler.ts` 引用（api.config）
- 被 `src/utils/odAuthTokenStore.ts` 引用（kvPrefix）
- 被多个组件引用（site.config）

<!-- MANUAL: -->
