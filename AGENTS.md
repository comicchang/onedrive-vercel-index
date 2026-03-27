<!-- Generated: 2026-03-27 | Updated: 2026-03-27 -->

# onedrive-vercel-index

## Purpose
将 OneDrive 文件夹通过 Next.js + Vercel 部署为可公开浏览的文件索引站点。支持文件预览（视频、音频、PDF、图片、代码、Office 文档等）、密码保护目录、多语言界面、Redis 令牌缓存。

## Key Files

| 文件 | 说明 |
|------|------|
| `package.json` | 依赖声明与 npm scripts（dev/build/lint/format/extract） |
| `tsconfig.json` | TypeScript 配置（strict 模式） |
| `next.config.js` | Next.js 构建配置 |
| `tailwind.config.js` | Tailwind CSS 配置 |
| `postcss.config.js` | PostCSS 配置 |
| `next-i18next.config.js` | i18next 国际化配置 |
| `i18next-parser.config.js` | i18next 翻译字符串提取配置 |
| `i18next.d.ts` | i18next TypeScript 类型扩展 |
| `next-env.d.ts` | Next.js 环境类型声明 |
| `renovate.json` | Renovate 自动依赖更新配置 |

## Subdirectories

| 目录 | 说明 |
|------|------|
| `config/` | 站点与 API 配置（见 `config/AGENTS.md`） |
| `public/` | 静态资源：图标、图片、本地化文件（见 `public/AGENTS.md`） |
| `src/` | 应用源代码（见 `src/AGENTS.md`） |

## For AI Agents

### Working In This Directory
- 修改依赖后需运行 `pnpm install`
- 构建命令：`pnpm build`
- 开发服务器：`pnpm dev`
- 代码格式化：`pnpm format`（作用于 `src/**`）
- 翻译字符串提取：`pnpm extract`

### Testing Requirements
- 交付前必须验证 `pnpm build` 通过
- 无自动测试套件，依赖 TypeScript 编译检查

### Common Patterns
- 使用 pnpm 作为包管理器（`.npmrc` 限制）
- TypeScript strict 模式，所有新文件须有完整类型
- Prettier 格式：单引号、无分号、120 字符宽度、tailwind 插件排序

## Dependencies

### External
- `next` ^16 — 框架（App Router 未使用，采用 Pages Router）
- `react` ^19 — UI 框架
- `typescript` 6.x — 类型系统
- `tailwindcss` ^4 — 样式
- `i18next` / `next-i18next` — 国际化
- `ioredis` — Redis 客户端，用于 token 缓存
- `axios` — HTTP 请求
- `swr` — 客户端数据获取

<!-- MANUAL: -->
