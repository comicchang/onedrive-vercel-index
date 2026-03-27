<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-27 | Updated: 2026-03-27 -->

# src/styles

## Purpose
全局 CSS 样式文件。Tailwind CSS 基础样式在此引入，自定义全局样式和 Markdown 渲染样式也在此定义。

## Key Files

| 文件 | 说明 |
|------|------|
| `globals.css` | 全局样式入口：引入 Tailwind 指令（`@tailwind base/components/utilities`），定义少量全局自定义样式 |
| `markdown-github.css` | GitHub 风格 Markdown 渲染样式，被 `MarkdownPreview.tsx` 引用 |

## For AI Agents

### Working In This Directory
- 尽量通过 Tailwind 工具类在组件层处理样式，避免在此新增全局 CSS
- `markdown-github.css` 专用于 Markdown 预览，修改时注意暗色模式适配

## Dependencies

### External
- `tailwindcss` — 工具类样式框架，配置在根目录 `tailwind.config.js`

<!-- MANUAL: -->
