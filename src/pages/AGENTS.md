<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-27 | Updated: 2026-03-27 -->

# src/pages

## Purpose
Next.js Pages Router 的页面与 API 路由入口。所有用户可访问的页面和服务端 API 端点均在此定义。

## Key Files

| 文件 | 说明 |
|------|------|
| `_app.tsx` | 全局 App 包裹：注入 i18n Provider、进度条、Analytics |
| `_document.tsx` | 自定义 HTML Document：Google Fonts、meta 标签 |
| `index.tsx` | 首页，重定向到根目录的文件列表 |
| `[...path].tsx` | 动态路由，处理所有文件/目录浏览路径，渲染 `FileListing` 组件 |
| `500.tsx` | 500 服务器错误页 |

## Subdirectories

| 目录 | 说明 |
|------|------|
| `api/` | Next.js API 路由（OneDrive 数据代理）（见 `api/AGENTS.md`） |
| `onedrive-vercel-index-oauth/` | OAuth 授权流程步骤页面（见 `onedrive-vercel-index-oauth/AGENTS.md`） |

## For AI Agents

### Working In This Directory
- `[...path].tsx` 是主要入口，处理所有非 API 的路径请求
- `_app.tsx` 修改会影响全局，需特别谨慎
- 新增页面遵循 Next.js Pages Router 约定（文件名即路由）

### Testing Requirements
- 修改后运行 `pnpm build` 验证静态生成/SSR 无误
- 路由变更需验证 `[...path].tsx` 的动态捕获逻辑

## Dependencies

### Internal
- `src/components/` — 页面渲染所用组件
- `src/utils/` — 数据获取与工具函数

### External
- `next-i18next` — 服务端翻译注入（`serverSideTranslations`）
- `@vercel/analytics` — 页面访问统计

<!-- MANUAL: -->
