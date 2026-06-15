import type { OdFileObject } from '../../types'

import { FC, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import dynamic from 'next/dynamic'

import axios from 'axios'
import toast from 'react-hot-toast'
import { useAsync } from 'react-async-hook'
import { useClipboard } from '../../utils/useClipboard'

import { getBaseUrl } from '../../utils/getBaseUrl'
import { getExtension } from '../../utils/getFileIcon'
import { useRawUrl } from '../../utils/useRawUrl'
import type { SubtitleCandidate } from '../../utils/subtitles'
import {
  SUBTITLE_EXTENSIONS,
  SUBTITLE_LANGUAGE_SUFFIXES,
  buildSubtitleCandidates,
  getSubtitleLabel,
  convertToVtt,
} from '../../utils/subtitles'

import { DownloadButton } from '../DownloadBtnGroup'
import { DownloadBtnContainer, PreviewContainer } from './Containers'
import FourOhFour from '../FourOhFour'
import Loading from '../Loading'
import CustomEmbedLinkMenu from '../CustomEmbedLinkMenu'

import 'plyr-react/plyr.css'

const Plyr = dynamic(() => import('plyr-react').then(mod => mod.Plyr), {
  ssr: false,
  loading: () => <div>Loading video player...</div>
})

/** 字幕轨道描述，直接映射到 Plyr 的 tracks 数组元素 */
export interface SubtitleTrack {
  kind: string
  label: string
  src: string
  default?: boolean
  srclang?: string
}

const VideoPlayer: FC<{
  videoName: string
  videoUrl: string
  width?: number
  height?: number
  thumbnail: string
  tracks: SubtitleTrack[]
  isFlv: boolean
  mpegts: any
}> = ({ videoName, videoUrl, width, height, thumbnail, tracks, isFlv, mpegts }) => {
  useEffect(() => {
    if (isFlv) {
      const video = document.getElementById('plyr')
      const player = mpegts.createPlayer({ url: videoUrl, type: 'flv' })
      player.attachMediaElement(video)
      player.load()
      return () => { player.destroy() }
    }
  }, [videoUrl, isFlv, mpegts])

  // Common plyr configs, including the video source and plyr options
  const plyrSource: Record<string, unknown> = {
    type: 'video',
    title: videoName,
    poster: thumbnail,
    tracks: tracks.map(t => ({ ...t })),
  }
  const plyrOptions: Plyr.Options = {
    ratio: `${width ?? 16}:${height ?? 9}`,
    fullscreen: { iosNative: true },
  }
  if (!isFlv) {
    plyrSource['sources'] = [{ src: videoUrl }]
  }
  return <Plyr id="plyr" source={plyrSource as unknown as Plyr.SourceInfo} options={plyrOptions} />
}

const VideoPreview: FC<{ file: OdFileObject }> = ({ file }) => {
  const { asPath, hashedToken, rawUrl } = useRawUrl()
  const clipboard = useClipboard()

  const [menuOpen, setMenuOpen] = useState(false)
  const [tracks, setTracks] = useState<SubtitleTrack[]>([])
  const [tracksReady, setTracksReady] = useState(false)
  const objectUrlsRef = useRef<string[]>([])
  const { t } = useTranslation()

  const thumbnail = `/api/thumbnail/?path=${encodeURIComponent(asPath)}&size=large${hashedToken ? `&odpt=${hashedToken}` : ''}`

  const videoUrl = rawUrl()

  const isFlv = getExtension(file.name) === 'flv'
  const {
    loading,
    error,
    result: mpegts,
  } = useAsync(async () => {
    if (isFlv) {
      return (await import('mpegts.js')).default
    }
  }, [isFlv])

  // 多轨道字幕发现与加载：构造 21 个候选、并行盲探 fetch → 转换 VTT → Object URL
  useEffect(() => {
    setTracks([])
    setTracksReady(false)
    let cancelled = false
    const currentUrls: string[] = []
    objectUrlsRef.current = currentUrls

    async function loadSubtitles() {
      const basePath = asPath.substring(0, asPath.lastIndexOf('/')) || '/'
      const videoName = asPath.substring(asPath.lastIndexOf('/') + 1)
      const lastDot = videoName.lastIndexOf('.')
      const videoStem = lastDot === -1 ? videoName : videoName.substring(0, lastDot)

      let existingCandidates: SubtitleCandidate[] | null = null

      // Phase 1a: 通过父目录文件列表精确定位字幕文件（避免盲探 21 个 HEAD 请求）
      try {
        const queryParts = [`path=${encodeURIComponent(basePath)}`]
        if (hashedToken) queryParts.push(`odpt=${hashedToken}`)
        const { data } = await axios.get(`/api/?${queryParts.join('&')}`, {
          headers: hashedToken ? { 'od-protected-token': hashedToken } : {},
        })
        const siblings: string[] = data?.folder?.value?.map((f: any) => f.name) ?? []

        if (siblings.length > 0) {
          // 从实际文件列表中匹配同名字幕
          const subtitleNames = siblings.filter(name => {
            const dot = name.lastIndexOf('.')
            if (dot === -1) return false
            const ext = name.substring(dot + 1).toLowerCase()
            const stem = name.substring(0, dot)
            return (SUBTITLE_EXTENSIONS as readonly string[]).includes(ext) && (
              stem === videoStem ||
              (SUBTITLE_LANGUAGE_SUFFIXES as readonly string[]).some(lang => stem === `${videoStem}.${lang}`)
            )
          })

          if (subtitleNames.length > 0) {
            existingCandidates = subtitleNames.map(name => {
              const dot = name.lastIndexOf('.')
              const ext = name.substring(dot + 1).toLowerCase()
              const stem = name.substring(0, dot)
              const langSuffix = (SUBTITLE_LANGUAGE_SUFFIXES as readonly string[]).find(
                lang => stem === `${videoStem}.${lang}`
              )
              return {
                path: `${basePath === '/' ? '' : basePath}/${name}`,
                extension: ext,
                language: langSuffix,
              }
            })

            // 按优先级排序：精确匹配优先 → 语言后缀 → 扩展名按 SUBTITLE_EXTENSIONS 顺序
            existingCandidates.sort((a, b) => {
              if (!a.language && b.language) return -1
              if (a.language && !b.language) return 1
              const extA = (SUBTITLE_EXTENSIONS as readonly string[]).indexOf(a.extension)
              const extB = (SUBTITLE_EXTENSIONS as readonly string[]).indexOf(b.extension)
              if (extA !== extB) return extA - extB
              if (a.language && b.language) {
                const langA = (SUBTITLE_LANGUAGE_SUFFIXES as readonly string[]).indexOf(a.language)
                const langB = (SUBTITLE_LANGUAGE_SUFFIXES as readonly string[]).indexOf(b.language)
                return langA - langB
              }
              return 0
            })
          }
        }
      } catch {
        // API 不可用 → 回退到 HEAD 盲探
      }

      // Phase 1b: 文件列表匹配失败时回退到 HEAD 盲探
      if (!existingCandidates) {
        const candidates = buildSubtitleCandidates(asPath)
        const probeResults = await Promise.allSettled(
          candidates.map(async candidate => {
            const url = rawUrl(candidate.path)
            await axios.head(url)
            return candidate
          })
        )
        existingCandidates = probeResults
          .filter((r): r is PromiseFulfilledResult<SubtitleCandidate> => r.status === 'fulfilled')
          .map(r => r.value)
      }

      // Phase 2: 只 GET 实际存在的字幕文件
      const results = await Promise.allSettled(
        existingCandidates.map(async candidate => {
          const url = rawUrl(candidate.path)
          const resp = await axios.get<string>(url, { responseType: 'text' })
          return { candidate, text: resp.data }
        })
      )

      if (cancelled) {
        for (const url of currentUrls) {
          URL.revokeObjectURL(url)
        }
        return
      }

      const loadedTracks: SubtitleTrack[] = []
      for (const result of results) {
        if (result.status !== 'fulfilled') continue
        const { candidate, text } = result.value
        const vttContent = convertToVtt(text, candidate.extension)
        if (!vttContent) continue

        const blob = new Blob([vttContent], { type: 'text/vtt' })
        const objectUrl = URL.createObjectURL(blob)
        currentUrls.push(objectUrl)

        loadedTracks.push({
          kind: 'captions',
          label: getSubtitleLabel(candidate),
          src: objectUrl,
          default: loadedTracks.length === 0,
          srclang: candidate.language ?? '',
        })
      }

      if (!cancelled) {
        setTracks(loadedTracks)
        setTracksReady(true)
      } else {
        for (const url of currentUrls) {
          URL.revokeObjectURL(url)
        }
      }
    }

    loadSubtitles().catch(err => {
      console.error('Subtitle loading failed:', err)
      if (!cancelled) {
        setTracks([])
        setTracksReady(true)
      }
    })

    return () => {
      cancelled = true
      for (const url of objectUrlsRef.current) {
        URL.revokeObjectURL(url)
      }
    }
  }, [asPath, hashedToken, rawUrl])

  return (
    <>
      <CustomEmbedLinkMenu path={asPath} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <PreviewContainer>
        {error ? (
          <FourOhFour errorMsg={error.message} />
        ) : loading && isFlv ? (
          <Loading loadingText={t('Loading FLV extension...')} />
        ) : !tracksReady ? (
          <Loading loadingText={t('Loading')} />
        ) : (
          <VideoPlayer
            key={asPath}
            videoName={file.name}
            videoUrl={videoUrl}
            width={file.video?.width}
            height={file.video?.height}
            thumbnail={thumbnail}
            tracks={tracks}
            isFlv={isFlv}
            mpegts={mpegts}
          />
        )}
      </PreviewContainer>

      <DownloadBtnContainer>
        <div className="flex flex-wrap justify-center gap-2">
          <DownloadButton
            onClickCallback={() => window.open(videoUrl)}
            btnColor="blue"
            btnText={t('Download')}
            btnIcon="file-download"
          />
          <DownloadButton
            onClickCallback={() => {
              clipboard.copy(`${getBaseUrl()}${rawUrl()}`)
              toast.success(t('Copied direct link to clipboard.'))
            }}
            btnColor="pink"
            btnText={t('Copy direct link')}
            btnIcon="copy"
          />
          <DownloadButton
            onClickCallback={() => setMenuOpen(true)}
            btnColor="teal"
            btnText={t('Customise link')}
            btnIcon="pen"
          />

          <DownloadButton
            onClickCallback={() => window.open(`iina://weblink?url=${getBaseUrl()}${videoUrl}`)}
            btnText="IINA"
            btnImage="/players/iina.png"
          />
          <DownloadButton
            onClickCallback={() => window.open(`vlc://${getBaseUrl()}${videoUrl}`)}
            btnText="VLC"
            btnImage="/players/vlc.png"
          />
          <DownloadButton
            onClickCallback={() => window.open(`potplayer://${getBaseUrl()}${videoUrl}`)}
            btnText="PotPlayer"
            btnImage="/players/potplayer.png"
          />
          <DownloadButton
            onClickCallback={() => window.open(`nplayer-http://${window?.location.hostname ?? ''}${videoUrl}`)}
            btnText="nPlayer"
            btnImage="/players/nplayer.png"
          />
        </div>
      </DownloadBtnContainer>
    </>
  )
}

export default VideoPreview
