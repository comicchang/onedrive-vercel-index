<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-27 | Updated: 2026-03-27 -->

# src/components

## Purpose
应用所有可复用 React 组件。包括布局组件（导航栏、页脚）、文件浏览（列表/网格布局）、功能组件（搜索、认证、下载）以及所有文件预览组件。

## Key Files

| 文件 | 说明 |
|------|------|
| `Auth.tsx` | 密码保护目录的认证表单组件 |
| `Breadcrumb.tsx` | 路径面包屑导航 |
| `CustomEmbedLinkMenu.tsx` | 自定义嵌入链接菜单（用于生成直链/嵌入代码） |
| `DownloadBtnGtoup.tsx` | 下载按钮组（单文件下载、直链等） |
| `FileListing.tsx` | 核心文件列表组件，负责渲染目录内容并分发预览 |
| `FolderGridLayout.tsx` | 文件夹网格视图布局 |
| `FolderListLayout.tsx` | 文件夹列表视图布局 |
| `Footer.tsx` | 页脚组件，内容来自 `site.config.js` |
| `FourOhFour.tsx` | 404 错误页组件 |
| `Loading.tsx` | 全局加载状态组件 |
| `MultiFileDownloader.tsx` | 多文件批量下载（ZIP 打包）组件 |
| `Navbar.tsx` | 顶部导航栏（含 logo、搜索入口、语言切换） |
| `SearchModal.tsx` | 全局文件搜索弹窗 |
| `SwitchLang.tsx` | 语言切换下拉菜单 |
| `SwitchLayout.tsx` | 列表/网格视图切换按钮 |

## Subdirectories

| 目录 | 说明 |
|------|------|
| `previews/` | 各类文件格式的预览组件（见 `previews/AGENTS.md`） |

## For AI Agents

### Working In This Directory
- `FileListing.tsx` 是核心入口，修改文件展示逻辑时优先看这里
- 所有组件使用 Tailwind CSS，暗色模式通过 `dark:` 前缀支持
- 国际化文本必须用 `useTranslation()` 包裹，不允许硬编码中英文字符串

### Testing Requirements
- 修改后运行 `pnpm build` 验证编译无误
- 暗色/亮色模式、移动端响应式需手动验证

### Common Patterns
- 函数式组件 + TypeScript props interface
- Tailwind 工具类由 prettier 自动排序
- 图标使用 `@fortawesome/react-fontawesome`

## Dependencies

### Internal
- `src/utils/` — 工具函数（文件图标、预览类型判断、认证等）
- `src/types/` — 共享类型定义

### External
- `@headlessui/react` — 无障碍弹窗/下拉组件
- `@fortawesome/react-fontawesome` — 图标库
- `swr` — 数据获取
- `react-hot-toast` — Toast 通知
- `jszip` — ZIP 打包下载

<!-- MANUAL: -->
