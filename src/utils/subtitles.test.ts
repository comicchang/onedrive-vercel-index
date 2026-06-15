import { describe, it, expect } from 'vitest'
import {
  getVideoBasePath,
  buildSubtitleCandidates,
  getSubtitleLabel,
  convertToVtt,
  SUBTITLE_EXTENSIONS,
  SUBTITLE_LANGUAGE_SUFFIXES,
  MAX_SUBTITLE_CANDIDATES,
} from './subtitles'

// ============================================================
// getVideoBasePath
// ============================================================

describe('getVideoBasePath', () => {
  it(' strips last extension from dotted filename', () => {
    expect(getVideoBasePath('/Videos/movie.2024.cut.mkv')).toBe('/Videos/movie.2024.cut')
  })

  it(' strips extension from root path', () => {
    expect(getVideoBasePath('/movie.mp4')).toBe('/movie')
  })

  it(' handles bare filename without directory', () => {
    expect(getVideoBasePath('movie.mkv')).toBe('movie')
  })

  it(' handles multiple dots before final extension', () => {
    expect(getVideoBasePath('/Videos/my.video.file.2024.mkv')).toBe('/Videos/my.video.file.2024')
  })

  it(' returns path unchanged when no extension exists', () => {
    expect(getVideoBasePath('/Videos/movie')).toBe('/Videos/movie')
  })

  it(' handles path with dots in directory names', () => {
    expect(getVideoBasePath('/Vid.eos/movie.mkv')).toBe('/Vid.eos/movie')
  })
})

// ============================================================
// buildSubtitleCandidates
// ============================================================

describe('buildSubtitleCandidates', () => {
  const candidates = buildSubtitleCandidates('/Videos/movie.mkv')

  it(' returns at most MAX_SUBTITLE_CANDIDATES (21)', () => {
    expect(candidates.length).toBeLessThanOrEqual(MAX_SUBTITLE_CANDIDATES)
    expect(candidates.length).toBe(21) // exact: 3 exact + 6 languages × 3 extensions
  })

  it(' first three candidates are exact matches (no language suffix) in correct extension order', () => {
    expect(candidates[0]).toEqual({ path: '/Videos/movie.vtt', language: undefined, extension: 'vtt' })
    expect(candidates[1]).toEqual({ path: '/Videos/movie.srt', language: undefined, extension: 'srt' })
    expect(candidates[2]).toEqual({ path: '/Videos/movie.ass', language: undefined, extension: 'ass' })
  })

  it(' exact candidates come before any language-suffix candidates', () => {
    // All first 3 should have no language
    for (let i = 0; i < 3; i++) {
      expect(candidates[i].language).toBeUndefined()
    }
  })

  it(' language suffix candidates appear in SUBTITLE_LANGUAGE_SUFFIXES order', () => {
    // First language suffix batch should be 'en' (index 0 of LANG_SUFFIXES)
    expect(candidates[3].language).toBe('en')
    expect(candidates[3].extension).toBe('vtt')

    expect(candidates[4].language).toBe('en')
    expect(candidates[4].extension).toBe('srt')

    expect(candidates[5].language).toBe('en')
    expect(candidates[5].extension).toBe('ass')

    // Next language: 'zh'
    expect(candidates[6].language).toBe('zh')
    expect(candidates[6].extension).toBe('vtt')
  })

  it(' each candidate has correct path, language, and extension fields', () => {
    for (const c of candidates) {
      expect(c).toHaveProperty('path')
      expect(c).toHaveProperty('extension')
      expect(typeof c.path).toBe('string')
      expect(typeof c.extension).toBe('string')
      // language may be undefined
      if (c.language !== undefined) {
        expect(typeof c.language).toBe('string')
      }
    }
  })

  it(' builds correct paths for language suffix candidates', () => {
    // Spot-check zh-CN candidates
    const zhcnStart = 3 + 3 * 2 // skip 'en'(3) + 'zh'(3)
    expect(candidates[zhcnStart]).toEqual({
      path: '/Videos/movie.zh-CN.vtt',
      language: 'zh-CN',
      extension: 'vtt',
    })
    expect(candidates[zhcnStart + 1]).toEqual({
      path: '/Videos/movie.zh-CN.srt',
      language: 'zh-CN',
      extension: 'srt',
    })
    expect(candidates[zhcnStart + 2]).toEqual({
      path: '/Videos/movie.zh-CN.ass',
      language: 'zh-CN',
      extension: 'ass',
    })
  })

  it(' handles path with no directory', () => {
    const bareCands = buildSubtitleCandidates('video.mp4')
    expect(bareCands[0]).toEqual({ path: 'video.vtt', language: undefined, extension: 'vtt' })
    expect(bareCands[1]).toEqual({ path: 'video.srt', language: undefined, extension: 'srt' })
  })

  it(' extension priority is vtt > srt > ass within each language group', () => {
    // Within 'ko' (index 5 in suffixes), extensions should be vtt, srt, ass
    const koStart = 3 + 3 * 5 // exact(3) + en(3) + zh(3) + zh-CN(3) + zh-TW(3) + ja(3)
    expect(candidates[koStart].extension).toBe('vtt')
    expect(candidates[koStart].language).toBe('ko')
    expect(candidates[koStart + 1].extension).toBe('srt')
    expect(candidates[koStart + 1].language).toBe('ko')
    expect(candidates[koStart + 2].extension).toBe('ass')
    expect(candidates[koStart + 2].language).toBe('ko')
  })
})

// ============================================================
// getSubtitleLabel
// ============================================================

describe('getSubtitleLabel', () => {
  it(' returns "Default" when language is undefined', () => {
    expect(getSubtitleLabel({ path: '/Videos/movie.vtt', language: undefined, extension: 'vtt' })).toBe('Default')
  })

  it(' returns language tag when present', () => {
    expect(getSubtitleLabel({ path: '/Videos/movie.zh-CN.vtt', language: 'zh-CN', extension: 'vtt' })).toBe('zh-CN')
    expect(getSubtitleLabel({ path: '/Videos/movie.en.srt', language: 'en', extension: 'srt' })).toBe('en')
    expect(getSubtitleLabel({ path: '/Videos/movie.ja.ass', language: 'ja', extension: 'ass' })).toBe('ja')
  })
})

// ============================================================
// convertToVtt
// ============================================================

describe('convertToVtt', () => {
  // --------------- empty / invalid ---------------

  it(' returns null for empty string', () => {
    expect(convertToVtt('', 'srt')).toBeNull()
    expect(convertToVtt('', 'vtt')).toBeNull()
    expect(convertToVtt('', 'ass')).toBeNull()
  })

  it(' returns null for whitespace-only content', () => {
    expect(convertToVtt('   \n  \t  ', 'srt')).toBeNull()
    expect(convertToVtt('   \n  \t  ', 'vtt')).toBeNull()
    expect(convertToVtt('   \n  \t  ', 'ass')).toBeNull()
  })

  it(' returns null for invalid extension', () => {
    expect(convertToVtt('some content', 'txt')).toBeNull()
    expect(convertToVtt('some content', '')).toBeNull()
    expect(convertToVtt('some content', 'mkv')).toBeNull()
  })

  // --------------- SRT → VTT ---------------

  it(' converts SRT timestamps: comma → period', () => {
    const srt = [
      '1',
      '00:00:01,000 --> 00:00:04,000',
      'Hello world',
      '',
      '2',
      '00:00:05,500 --> 00:00:08,250',
      'Second line',
      '',
    ].join('\n')

    const result = convertToVtt(srt, 'srt')
    expect(result).not.toBeNull()
    expect(result!).toContain('WEBVTT')
    expect(result!).toContain('00:00:01.000 --> 00:00:04.000')
    expect(result!).toContain('00:00:05.500 --> 00:00:08.250')
    expect(result!).toContain('Hello world')
    expect(result!).toContain('Second line')
  })

  it(' SRT output starts with WEBVTT header', () => {
    const srt = '1\n00:00:01,000 --> 00:00:04,000\nHello\n'
    const result = convertToVtt(srt, 'srt')
    expect(result!).toMatch(/^WEBVTT\n/)
  })

  it(' returns null for SRT without any timestamp line', () => {
    const srt = '1\nHello world\n'
    expect(convertToVtt(srt, 'srt')).toBeNull()
  })

  it(' normalises \\r\\n line endings in SRT', () => {
    const srt = '1\r\n00:00:01,000 --> 00:00:04,000\r\nHello\r\n'
    const result = convertToVtt(srt, 'srt')
    expect(result).not.toBeNull()
    expect(result!).toContain('00:00:01.000 --> 00:00:04.000')
  })

  // --------------- ASS → VTT ---------------

  it(' converts basic ASS Dialogue to VTT', () => {
    const ass = [
      '[Script Info]',
      'Title: Test',
      '',
      '[Events]',
      'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
      'Dialogue: 0,0:00:01.00,0:00:04.00,Default,,0,0,0,,Hello world',
    ].join('\n')

    const result = convertToVtt(ass, 'ass')
    expect(result).not.toBeNull()
    expect(result!).toMatch(/^WEBVTT\n/)
    expect(result!).toContain('00:00:01.000 --> 00:00:04.000')
    expect(result!).toContain('Hello world')
  })

  it(' strips ASS override tags like {\\an8}', () => {
    const ass = [
      '[Events]',
      'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
      'Dialogue: 0,0:00:01.00,0:00:04.00,Default,,0,0,0,,{\\an8}Hello',
    ].join('\n')

    const result = convertToVtt(ass, 'ass')
    expect(result).not.toBeNull()
    expect(result!).toContain('Hello')
    expect(result!).not.toContain('{\\an8}')
    expect(result!).not.toContain('{')
  })

  it(' strips multiple ASS override tags', () => {
    const ass = [
      '[Events]',
      'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
      'Dialogue: 0,0:00:01.00,0:00:04.00,Default,,0,0,0,,{\\b1}{\\i1}Hello{\\b0}{\\i0} world',
    ].join('\n')

    const result = convertToVtt(ass, 'ass')
    expect(result).not.toBeNull()
    expect(result!).toContain('Hello world')
    expect(result!).not.toContain('{')
  })

  it(' handles ASS \\N forced line breaks', () => {
    const ass = [
      '[Events]',
      'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
      'Dialogue: 0,0:00:01.00,0:00:04.00,Default,,0,0,0,,Line one\\NLine two',
    ].join('\n')

    const result = convertToVtt(ass, 'ass')
    expect(result).not.toBeNull()
    expect(result!).toContain('Line one')
    expect(result!).toContain('Line two')
  })

  it(' handles ASS text with embedded commas (Text field after index 9)', () => {
    const ass = [
      '[Events]',
      'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
      'Dialogue: 0,0:00:01.00,0:00:04.00,Default,,0,0,0,,Hello, world, and more',
    ].join('\n')

    const result = convertToVtt(ass, 'ass')
    expect(result).not.toBeNull()
    expect(result!).toContain('Hello, world, and more')
  })

  it(' returns null for ASS with no Dialogue lines', () => {
    const ass = [
      '[Script Info]',
      'Title: Test',
      '',
      '[Events]',
      'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
    ].join('\n')

    expect(convertToVtt(ass, 'ass')).toBeNull()
  })

  it(' skips ASS Dialogue lines where text is empty after tag stripping', () => {
    const ass = [
      '[Events]',
      'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
      'Dialogue: 0,0:00:01.00,0:00:04.00,Default,,0,0,0,,{\\an8}',
    ].join('\n')

    expect(convertToVtt(ass, 'ass')).toBeNull()
  })

  it(' converts ASS time format h:mm:ss.cs → hh:mm:ss.mmm', () => {
    const ass = [
      '[Events]',
      'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
      // 1:23:45.67 → 01:23:45.670
      'Dialogue: 0,1:23:45.67,2:34:56.78,Default,,0,0,0,,Test',
    ].join('\n')

    const result = convertToVtt(ass, 'ass')
    expect(result).not.toBeNull()
    expect(result!).toContain('01:23:45.670 --> 02:34:56.780')
  })

  it(' numbers VTT cues sequentially starting at 1', () => {
    const ass = [
      '[Events]',
      'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
      'Dialogue: 0,0:00:01.00,0:00:04.00,Default,,0,0,0,,First',
      'Dialogue: 0,0:00:05.00,0:00:08.00,Default,,0,0,0,,Second',
    ].join('\n')

    const result = convertToVtt(ass, 'ass')
    expect(result).not.toBeNull()
    const lines = result!.split('\n')
    const cue1Idx = lines.indexOf('1')
    const cue2Idx = lines.indexOf('2')
    expect(cue1Idx).toBeGreaterThan(-1)
    expect(cue2Idx).toBeGreaterThan(-1)
    expect(cue1Idx).toBeLessThan(cue2Idx)
  })

  // --------------- VTT passthrough ---------------

  it(' passes through valid WEBVTT content', () => {
    const vtt = [
      'WEBVTT',
      '',
      '1',
      '00:00:01.000 --> 00:00:04.000',
      'Hello',
    ].join('\n')

    const result = convertToVtt(vtt, 'vtt')
    expect(result).not.toBeNull()
    expect(result!).toContain('WEBVTT')
    expect(result!).toContain('00:00:01.000 --> 00:00:04.000')
  })

  it(' returns null for VTT without WEBVTT header', () => {
    const vtt = '1\n00:00:01.000 --> 00:00:04.000\nHello\n'
    expect(convertToVtt(vtt, 'vtt')).toBeNull()
  })

  it(' normalises \\r\\n in VTT passthrough', () => {
    const vtt = 'WEBVTT\r\n\r\n1\r\n00:00:01.000 --> 00:00:04.000\r\nHello\r\n'
    const result = convertToVtt(vtt, 'vtt')
    expect(result).not.toBeNull()
    expect(result!).not.toContain('\r')
    expect(result!).toContain('\n')
  })
})

// ============================================================
// Constants
// ============================================================

describe('constants', () => {
  it(' SUBTITLE_EXTENSIONS has vtt, srt, ass in that order', () => {
    expect(SUBTITLE_EXTENSIONS).toEqual(['vtt', 'srt', 'ass'])
  })

  it(' SUBTITLE_LANGUAGE_SUFFIXES starts with common languages', () => {
    expect(SUBTITLE_LANGUAGE_SUFFIXES[0]).toBe('en')
    expect(SUBTITLE_LANGUAGE_SUFFIXES).toContain('zh-CN')
    expect(SUBTITLE_LANGUAGE_SUFFIXES).toContain('ja')
    expect(SUBTITLE_LANGUAGE_SUFFIXES).toContain('ko')
  })

  it(' MAX_SUBTITLE_CANDIDATES equals 3 exact + languages × extensions', () => {
    const expected = 3 + SUBTITLE_LANGUAGE_SUFFIXES.length * SUBTITLE_EXTENSIONS.length
    expect(MAX_SUBTITLE_CANDIDATES).toBe(expected)
  })
})
