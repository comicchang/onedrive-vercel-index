<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-27 | Updated: 2026-03-27 -->

# public

## Purpose
Next.js 静态资源目录，所有文件直接以根路径 `/` 对外提供服务。包含 PWA 图标、favicon、Web App Manifest、SEO 图片、媒体播放器图标和多语言翻译文件。

## Key Files

| 文件 | 说明 |
|------|------|
| `favicon.ico` | 浏览器标签图标 |
| `favicon-16x16.png` / `favicon-32x32.png` | 不同尺寸 favicon |
| `apple-touch-icon.png` | iOS 主屏图标 |
| `android-chrome-192x192.png` / `android-chrome-512x512.png` | Android PWA 图标 |
| `safari-pinned-tab.svg` | Safari 固定标签图标 |
| `site.webmanifest` | PWA Web App Manifest |
| `browserconfig.xml` | Windows 磁贴配置 |
| `mstile-150x150.png` | Windows 磁贴图标 |

## Subdirectories

| 目录 | 说明 |
|------|------|
| `icons/` | 应用图标（64/128/256/512px PNG，用于导航栏）（见 `icons/AGENTS.md`） |
| `images/` | 错误页与空状态插图（见 `images/AGENTS.md`） |
| `players/` | 媒体播放器品牌图标（见 `players/AGENTS.md`） |
| `locales/` | i18next 翻译文件，按语言分目录（见 `locales/AGENTS.md`） |

## For AI Agents

### Working In This Directory
- 图标文件由 `config/site.config.js` 的 `icon` 字段引用，默认指向 `/icons/128.png`
- 翻译文件通过 `pnpm extract` 自动从源码提取，手动修改后需注意不被覆盖
- 不要直接在此目录创建 JS/TS 文件，所有逻辑在 `src/` 中

### Common Patterns
- 多语言文件结构：`locales/{lang}/common.json`

<!-- MANUAL: -->
