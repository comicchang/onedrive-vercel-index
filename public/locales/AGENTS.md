<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-27 | Updated: 2026-03-27 -->

# public/locales

## Purpose
i18next 多语言翻译文件。每个语言子目录下有一个 `common.json`，包含所有界面字符串的键值对。

## Subdirectories

| 目录 | 语言 |
|------|------|
| `de-DE/` | 德语 |
| `en/` | 英语（基准语言） |
| `es/` | 西班牙语 |
| `hi/` | 印地语 |
| `id/` | 印度尼西亚语 |
| `tr-TR/` | 土耳其语 |
| `zh-CN/` | 简体中文 |
| `zh-TW/` | 繁体中文 |

## For AI Agents

### Working In This Directory
- 新增翻译 key 时，先在 `en/common.json` 中添加英文原文，再同步到其他语言文件
- 运行 `pnpm extract` 可从源码自动提取 key（会覆盖文件，手动翻译注意备份）
- key 命名使用语义化英文字符串，与 `useTranslation()` 中的调用保持一致

### Common Patterns
- 所有语言文件结构相同：单一 `common.json` 扁平键值对
- `next-i18next.config.js` 中配置了默认语言和支持语言列表

<!-- MANUAL: -->
