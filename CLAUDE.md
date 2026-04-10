# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

```bash
pnpm dev        # 启动开发服务器（localhost:3000）
pnpm build      # 生产构建
pnpm lint       # Biome linting（src/, config/, *.config.js）
pnpm format     # Prettier 格式化
pnpm extract    # 提取 i18next 翻译字符串
```

## 架构概览

这是一个基于 Next.js + TypeScript 的 OneDrive 文件共享应用，部署在 Vercel 上，通过 Microsoft Graph API 访问 OneDrive 文件。

### 路由层

- `src/pages/index.tsx` — 重定向至 `config/site.config.js` 中配置的根路径
- `src/pages/[...path].tsx` — 捕获所有路径，渲染 `FileListing` 组件

### API 层（`src/pages/api/`）

- `index.ts` — 核心端点，调用 Graph API 获取文件/目录列表，支持 `next` cursor 分页
- `search.ts` — 全文搜索
- `raw.ts` — 原始文件下载（支持 CORS、Range 请求）
- `thumbnail.ts` — 文件缩略图代理
- `item.ts` — 获取单个项目详情

### 认证与 Token

- `src/utils/oAuthHandler.ts` — OAuth 2.0 授权码流程
- `src/utils/odAuthTokenStore.ts` — 用 ioredis 缓存 access/refresh token（AES-256 加密，密钥 `'onedrive-vercel-index'`）
- OAuth 回调路由：`src/pages/onedrive-vercel-index-oauth/`

### 数据获取

- `src/utils/fetchWithSWR.ts` — `useProtectedSWRInfinite` hook，处理密码保护表单 + 无限滚动分页

### 文件预览系统

- `src/utils/getPreviewType.ts` — 将文件扩展名映射到预览类型
- `src/components/previews/` — 各预览组件：PDF、EPUB、Office（docx/xlsx/pptx）、Markdown（含 KaTeX 数学公式）、Code（语法高亮）、Video/Audio（plyr）、Image

### 配置文件

- `config/site.config.js` — 站点标题、`baseDirectory`（共享根目录）、`maxItems`（分页大小）、`protectedRoutes`（密码保护路径列表）
- `config/api.config.js` — `clientId`、`obfuscatedClientSecret`、Graph API 端点、`cacheControlHeader`

## 安全注意事项

- 定期检查 Dependabot 安全警报（GitHub → Security → Dependabot alerts）
- 传递依赖漏洞通过 `package.json` 的 `pnpm.overrides` 强制升级版本修复，无需替换上游包
- 修复后确认 `pnpm-lock.yaml` 中目标包已升级至安全版本

## Git 提交者信息

提交前确认 git 作者为 `Comic Chang <comicchang@gmail.com>`：

```bash
git config user.name   # 应输出 Comic Chang
git config user.email  # 应输出 comicchang@gmail.com
```

若输出有误，在仓库根目录执行以下命令（仅对当前 repo 生效）：

```bash
git config user.name "Comic Chang"
git config user.email "comicchang@gmail.com"
```

## 关键约束

- `next.config.js` 中 `trailingSlash: true`，API 路由调用时需带末尾斜杠
- i18n 默认语言 `zh-CN`，翻译文件在 `public/locales/`，8 种语言
- 密码保护路由通过 `src/utils/protectedRouteHandler.ts` 实现（bcrypt hash 验证）
- 批量下载通过 JSZip 压缩后下载（`src/components/MultiFileDownloader.tsx`）
