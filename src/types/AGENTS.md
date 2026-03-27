<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-27 | Updated: 2026-03-27 -->

# src/types

## Purpose
全局 TypeScript 类型定义。集中管理跨模块共享的接口和类型，避免类型散落在各业务文件中。

## Key Files

| 文件 | 说明 |
|------|------|
| `index.d.ts` | 全局类型声明：OneDrive 文件/目录响应结构、API 请求/响应类型、共享接口 |

## For AI Agents

### Working In This Directory
- 新增跨多个模块使用的类型时放在此处
- 单模块私有类型直接定义在对应文件中，不需要放这里
- 修改已有类型前检查所有引用方（用 LSP `lsp_find_references`）

<!-- MANUAL: -->
