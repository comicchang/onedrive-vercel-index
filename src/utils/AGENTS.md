<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-27 | Updated: 2026-03-27 -->

# src/utils

## Purpose
工具函数与自定义 React Hooks 集合。涵盖 OneDrive OAuth 认证、token 持久化、文件元数据处理、数据获取、路由保护等核心逻辑。

## Key Files

| 文件 | 说明 |
|------|------|
| `oAuthHandler.ts` | Microsoft OAuth 流程：授权码换 token、token 刷新、Graph API 请求封装 |
| `odAuthTokenStore.ts` | Redis/KV token 持久化：读写 access token 和 refresh token |
| `protectedRouteHandler.ts` | 密码保护路由验证：检查请求中的 token 是否匹配目录密码 |
| `fetchWithSWR.ts` | SWR 数据获取 hook 封装，供客户端组件使用 |
| `fetchOnMount.ts` | 组件挂载时一次性数据获取 hook |
| `fileDetails.ts` | 文件元数据处理：格式化文件大小、解析 MIME 类型等 |
| `getBaseUrl.ts` | 获取应用 base URL（区分开发/生产环境） |
| `getFileIcon.ts` | 根据文件扩展名返回对应的 FontAwesome 图标 |
| `getPreviewType.ts` | 根据文件扩展名判断应使用哪种预览组件 |
| `getReadablePath.ts` | 将 URL 编码路径转换为可读路径字符串 |
| `useDeviceOS.ts` | 检测用户操作系统的 React hook（用于外链播放器适配） |
| `useLocalStorage.ts` | 带 SSR 兼容的 localStorage 操作 hook |

## For AI Agents

### Working In This Directory
- `oAuthHandler.ts` 和 `odAuthTokenStore.ts` 是认证核心，改动需特别谨慎
- 新增文件格式支持时修改 `getPreviewType.ts`（注册扩展名）和 `getFileIcon.ts`（注册图标）
- `protectedRouteHandler.ts` 的密码验证逻辑变更会影响所有受保护目录

### Testing Requirements
- `oAuthHandler.ts` 涉及外部 API，需要有效凭据才能完整测试
- 工具函数修改后通过 `pnpm build` 验证 TypeScript 类型正确

### Common Patterns
- 自定义 Hook 文件名以 `use` 开头
- 纯工具函数（无 React 依赖）用 `.ts`，含 Hook 的用 `.ts`（不需要 `.tsx`）

## Dependencies

### Internal
- `config/api.config.js` — API 端点、clientId/secret
- `config/site.config.js` — kvPrefix、protectedRoutes

### External
- `ioredis` — Redis 客户端（token store）
- `axios` — HTTP 请求（Graph API）
- `crypto-js` — clientSecret 解密
- `swr` — 客户端数据获取

<!-- MANUAL: -->
