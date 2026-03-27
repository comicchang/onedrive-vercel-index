<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-27 | Updated: 2026-03-27 -->

# src/pages/onedrive-vercel-index-oauth

## Purpose
首次部署时的 OAuth 授权向导，分三步引导用户完成 Microsoft 账号授权并将 refresh token 存储到 Redis/KV。授权完成后正常使用不再访问此路径。

## Key Files

| 文件 | 说明 |
|------|------|
| `step-1.tsx` | 第一步：引导用户跳转 Microsoft 授权页面 |
| `step-2.tsx` | 第二步：接收授权码（code），换取 access/refresh token |
| `step-3.tsx` | 第三步：确认 token 写入成功，完成授权流程 |

## For AI Agents

### Working In This Directory
- 这是一次性初始化流程，不参与日常文件浏览
- OAuth 参数（clientId、redirectUri、scope）来自 `config/api.config.js`
- token 持久化逻辑在 `src/utils/odAuthTokenStore.ts`

### Common Patterns
- 三个步骤页面通过 URL query 参数传递 OAuth state/code

## Dependencies

### Internal
- `src/utils/oAuthHandler.ts` — 授权码换 token 逻辑
- `src/utils/odAuthTokenStore.ts` — token 存储
- `config/api.config.js` — OAuth 配置

<!-- MANUAL: -->
