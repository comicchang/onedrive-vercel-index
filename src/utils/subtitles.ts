/**
 * 视频字幕候选项生成工具
 *
 * 根据视频文件路径，确定性生成可能存在的同名字幕文件路径，
 * 用于客户端对候选字幕进行盲探（blind probe）加载。
 *
 * 不依赖文件系统或网络请求——纯字符串操作，可安全在浏览器中使用。
 */

/** 字幕候选类型的扩展名（按优先级降序） */
export const SUBTITLE_EXTENSIONS = ['vtt', 'srt', 'ass'] as const

/** 字幕语言后缀（按常见度降序） */
export const SUBTITLE_LANGUAGE_SUFFIXES = ['en', 'zh', 'zh-CN', 'zh-TW', 'ja', 'ko'] as const

/** 最大字幕候选项数量（3 精确 + 6 语言后缀 × 3 扩展名） */
export const MAX_SUBTITLE_CANDIDATES = 21 as const

/** 字幕候选项 */
export interface SubtitleCandidate {
  /** 候选字幕文件的完整路径 */
  path: string
  /** 语言标签（如 'zh-CN'），无语言后缀时为 undefined */
  language?: string
  /** 文件扩展名（无前导点，如 'vtt'） */
  extension: string
}

/**
 * 从视频文件路径中剥离最后一个扩展名，得到基础路径。
 *
 * 只在最后一个 `/` 后的最后一个 `.` 处截断，支持带多段点的文件名：
 *
 * - `getVideoBasePath('/Videos/movie.2024.cut.mkv')` → `'/Videos/movie.2024.cut'`
 * - `getVideoBasePath('/movie.mp4')` → `'/movie'`
 * - `getVideoBasePath('movie.mkv')` → `'movie'`
 */
export function getVideoBasePath(videoPath: string): string {
  const lastSlash = videoPath.lastIndexOf('/')
  const afterSlash = videoPath.slice(lastSlash + 1)
  const lastDot = afterSlash.lastIndexOf('.')

  if (lastDot === -1) {
    // 无扩展名，直接返回原路径
    return videoPath
  }

  return videoPath.slice(0, lastSlash + 1 + lastDot)
}

/**
 * 构建所有可能的字幕候选项，按照优先顺序排列：
 *
 * 1. 精确匹配（无语言后缀）：vtt > srt > ass
 * 2. 语言后缀匹配：按 `SUBTITLE_LANGUAGE_SUFFIXES` 顺序，每个语言内按 `SUBTITLE_EXTENSIONS` 顺序
 *
 * 最多返回 `MAX_SUBTITLE_CANDIDATES`（21）个候选项。
 *
 * @param videoPath - 视频文件的完整路径
 * @returns 按优先级降序排列的字幕候选项数组
 *
 * @example
 * buildSubtitleCandidates('/Videos/movie.mkv')
 * // → [
 * //   { path: '/Videos/movie.vtt',    language: undefined, extension: 'vtt' },
 * //   { path: '/Videos/movie.srt',    language: undefined, extension: 'srt' },
 * //   { path: '/Videos/movie.ass',    language: undefined, extension: 'ass' },
 * //   { path: '/Videos/movie.en.vtt', language: 'en',      extension: 'vtt' },
 * //   { path: '/Videos/movie.en.srt', language: 'en',      extension: 'srt' },
 * //   ...
 * // ]
 */
export function buildSubtitleCandidates(videoPath: string): SubtitleCandidate[] {
  const basePath = getVideoBasePath(videoPath)
  const candidates: SubtitleCandidate[] = []

  // 1. 精确匹配（无语言后缀）：按扩展名优先级
  for (const ext of SUBTITLE_EXTENSIONS) {
    if (candidates.length >= MAX_SUBTITLE_CANDIDATES) {
      return candidates
    }
    candidates.push({
      path: `${basePath}.${ext}`,
      extension: ext,
    })
  }

  // 2. 语言后缀匹配：按语言顺序，每个语言内按扩展名顺序
  for (const lang of SUBTITLE_LANGUAGE_SUFFIXES) {
    for (const ext of SUBTITLE_EXTENSIONS) {
      if (candidates.length >= MAX_SUBTITLE_CANDIDATES) {
        return candidates
      }
      candidates.push({
        path: `${basePath}.${lang}.${ext}`,
        language: lang,
        extension: ext,
      })
    }
  }

  return candidates
}

/**
 * 获取字幕候选项的显示标签。
 *
 * - 有语言后缀时返回语言标签（如 `'zh-CN'`）
 * - 无语言后缀时返回 `'Default'`
 *
 * @param candidate - 字幕候选项
 * @returns 显示用标签
 *
 * @example
 * getSubtitleLabel({ path: '/Videos/movie.vtt',  language: undefined, extension: 'vtt' })
 * // → 'Default'
 *
 * getSubtitleLabel({ path: '/Videos/movie.zh-CN.vtt', language: 'zh-CN', extension: 'vtt' })
 * // → 'zh-CN'
 */
export function getSubtitleLabel(candidate: SubtitleCandidate): string {
  return candidate.language ?? 'Default'
}

/**
 * 将字幕文本转换为标准 WebVTT 格式。
 *
 * - VTT: 如果内容以 `WEBVTT` 开头，经换行规范化后原样返回
 * - SRT: 添加 WEBVTT 头部，将时间戳中的 `,` 替换为 `.`
 * - ASS: 提取 `Dialogue:` 行，转换为纯文本 VTT（丢失样式/字体/定位/karaoke/drawing）
 *
 * 纯客户端转换，不依赖任何外部库或 WASM。
 *
 * @param textContent - 字幕文件原始文本内容
 * @param extension - 字幕扩展名（'vtt'、'srt' 或 'ass'）
 * @returns 标准 WebVTT 字符串；内容为空或无法解析时返回 null
 *
 * @example
 * convertToVtt(srtContent, 'srt')
 * // → WEBVTT\n\n1\n00:00:01.000 --> 00:00:04.000\nHello\n
 */
export function convertToVtt(textContent: string, extension: string): string | null {
  if (!textContent || !textContent.trim()) {
    return null
  }

  switch (extension) {
    case 'vtt':
      return convertVttPassthrough(textContent)
    case 'srt':
      return convertSrtToVtt(textContent)
    case 'ass':
      return convertAssToVtt(textContent)
    default:
      return null
  }
}

/**
 * VTT 直通：换行规范化后验证 WEBVTT 头部。
 */
function convertVttPassthrough(content: string): string | null {
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()
  if (!normalized.startsWith('WEBVTT')) {
    return null
  }
  // 多平台兼容：确保有尾部换行
  return normalized.endsWith('\n') ? normalized : normalized + '\n'
}

/**
 * SRT → VTT：添加 WEBVTT 头部，将时间戳中的 `,` 替换为 `.`。
 */
function convertSrtToVtt(content: string): string | null {
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()
  if (!normalized) return null

  const lines = normalized.split('\n')
  const vttLines: string[] = ['WEBVTT', '']
  let foundTimestamp = false

  for (const line of lines) {
    if (line.includes('-->')) {
      foundTimestamp = true
      vttLines.push(line.replace(/,/g, '.'))
    } else {
      vttLines.push(line)
    }
  }

  if (!foundTimestamp) return null

  return vttLines.join('\n') + '\n'
}

/**
 * ASS → VTT（纯文本降级）：仅提取 Dialogue 行的时间与文字，丢弃所有样式。
 *
 * ASS Dialogue 格式（前缀已剥离后按逗号分割）：
 *   [0]=Layer, [1]=Start, [2]=End, [3]=Style, [4]=Name,
 *   [5]=MarginL, [6]=MarginR, [7]=MarginV, [8]=Effect, [9+]=Text
 */
function convertAssToVtt(content: string): string | null {
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = normalized.split('\n')

  const vttLines: string[] = ['WEBVTT', '']
  let cueIndex = 0

  for (const line of lines) {
    if (!line.startsWith('Dialogue:')) continue

    // 剥离 "Dialogue:" 前缀后按逗号分割（Text 字段可能含逗号，slice(9) 处理）
    const parts = line.substring('Dialogue:'.length).split(',')
    if (parts.length < 10) continue

    const start = parts[1].trim()
    const end = parts[2].trim()

    // 重拼接 Text 字段（索引 9 起），防止内嵌逗号导致截断
    let text = parts.slice(9).join(',').trim()

    // 剥离所有 {\...} 样式覆写标签
    text = text.replace(/\{[^}]*\}/g, '').trim()
    if (!text) continue

    // ASS 时间 h:mm:ss.cs → VTT 时间 hh:mm:ss.mmm
    const vttStart = convertAssTime(start)
    const vttEnd = convertAssTime(end)
    if (!vttStart || !vttEnd) continue

    // 只在非第一条 cue 前插入空行（VTT 分隔符）
    if (cueIndex > 0) {
      vttLines.push('')
    }
    cueIndex++
    vttLines.push(`${cueIndex}`)
    vttLines.push(`${vttStart} --> ${vttEnd}`)
    // ASS 的 \\N 是强制换行，转换为 VTT 的多行字幕
    vttLines.push(...text.split('\\N').map(s => s.trim()))
  }

  if (cueIndex === 0) return null

  return vttLines.join('\n') + '\n'
}

/**
 * 将 ASS 时间格式转换为 VTT 时间格式。
 *
 * ASS: h:mm:ss.cs  → 小时无前导零、秒后是 2 位百分秒
 * VTT: hh:mm:ss.mmm → 小时 2 位前导零、秒后是 3 位毫秒
 *
 * @returns VTT 时间字符串，或输入格式不匹配时返回 null
 */
function convertAssTime(assTime: string): string | null {
  const match = assTime.match(/^(\d+):(\d{2}):(\d{2})\.(\d{2})$/)
  if (!match) return null

  const hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const seconds = parseInt(match[3], 10)
  const cs = parseInt(match[4], 10)

  const ms = cs * 10
  const hh = String(hours).padStart(2, '0')
  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  const mmm = String(ms).padStart(3, '0')

  return `${hh}:${mm}:${ss}.${mmm}`
}
