<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-27 | Updated: 2026-03-27 -->

# src

## Purpose
Next.js 应用源代码根目录。采用 Pages Router 架构，包含页面、API 路由、React 组件、工具函数、全局样式和 TypeScript 类型定义。

## Subdirectories

| 目录 | 说明 |
|------|------|
| `components/` | 可复用 React UI 组件（见 `components/AGENTS.md`） |
| `pages/` | Next.js 页面与 API 路由（见 `pages/AGENTS.md`） |
| `styles/` | 全局 CSS 样式（见 `styles/AGENTS.md`） |
| `types/` | 全局 TypeScript 类型定义（见 `types/AGENTS.md`） |
| `utils/` | 工具函数与自定义 hooks（见 `utils/AGENTS.md`） |

## For AI Agents

### Working In This Directory
- 新建文件须使用 TypeScript（`.ts`/`.tsx`），启用 strict 模式
- 组件文件放 `components/`，工具函数放 `utils/`，不要混用
- API 路由仅在 `pages/api/` 下创建

### Testing Requirements
- `pnpm build` 是唯一验证手段，TypeScript 编译错误等同于测试失败

### Common Patterns
- 客户端数据获取用 SWR（`fetchWithSWR`）
- 国际化用 `useTranslation()` hook，key 提取后放 `public/locales/`
- Tailwind 工具类排序由 prettier-plugin-tailwindcss 自动处理

<!-- MANUAL: -->
