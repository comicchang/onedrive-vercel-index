<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-27 | Updated: 2026-03-27 -->

# src/components/previews

## Purpose
各类文件格式的预览组件。由 `FileListing.tsx` 根据 `getPreviewType()` 的返回值动态选择渲染。每个预览组件接收文件元数据并展示对应内容。

## Key Files

| 文件 | 说明 |
|------|------|
| `AudioPreview.tsx` | 音频文件预览，使用 Plyr 播放器 |
| `CodePreview.tsx` | 代码文件预览，语法高亮（react-syntax-highlighter） |
| `Containers.tsx` | 预览页共享布局容器组件（卡片、页面包裹等） |
| `DefaultPreview.tsx` | 无专属预览的文件类型兜底展示 |
| `EPUBPreview.tsx` | EPUB 电子书预览（react-reader） |
| `ImagePreview.tsx` | 图片预览，支持缩放 |
| `MarkdownPreview.tsx` | Markdown 渲染（react-markdown + remark-gfm + KaTeX） |
| `OfficePreview.tsx` | Office 文档预览（preview-office-docs，微软在线预览服务） |
| `PDFPreview.tsx` | PDF 文件预览 |
| `TextPreview.tsx` | 纯文本文件预览 |
| `URLPreview.tsx` | `.url` 快捷方式文件解析与跳转 |
| `VideoPreview.tsx` | 视频预览，支持 Plyr（MP4 等）和 mpegts.js（FLV/TS 流） |

## For AI Agents

### Working In This Directory
- 新增文件格式支持时：①在此创建新预览组件，②在 `src/utils/getPreviewType.ts` 中注册扩展名，③在 `FileListing.tsx` 中添加分支
- `Containers.tsx` 提供统一的预览页布局，新组件应复用它
- 外部播放器（IINA、PotPlayer）图标在 `public/players/` 中

### Testing Requirements
- 每种预览组件需用对应格式文件手动验证
- `OfficePreview` 依赖微软在线服务，本地开发无法完整测试

### Common Patterns
- 各预览组件通过 API 路由 `/api/raw` 获取文件原始内容
- 使用 `useTranslation()` 处理所有界面文字

## Dependencies

### Internal
- `src/utils/getPreviewType.ts` — 文件类型判断
- `src/utils/fetchWithSWR.ts` — 数据获取

### External
- `plyr-react` — 视频/音频播放器
- `mpegts.js` — FLV/TS 流播放
- `react-syntax-highlighter` — 代码高亮
- `react-markdown` + `remark-gfm` + `rehype-katex` — Markdown 渲染
- `react-reader` — EPUB 阅读
- `katex` — 数学公式渲染
- `preview-office-docs` — Office 文档预览

<!-- MANUAL: -->
