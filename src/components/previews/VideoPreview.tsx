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
import {
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
      const flv = mpegts.createPlayer({ url: videoUrl, type: 'flv' })
      flv.attachMediaElement(video)
      flv.load()
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

  const thumbnail = `/api/thumbnail/?path=${asPath}&size=large${hashedToken ? `&odpt=${hashedToken}` : ''}`

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
    let cancelled = false
    const currentUrls: string[] = []
    objectUrlsRef.current = currentUrls

    async function loadSubtitles() {
      const candidates = buildSubtitleCandidates(asPath)
const tokenSuffix = hashedToken ? `&odpt=${hashedToken}` : ''

      const results = await Promise.allSettled(
        candidates.map(async candidate => {
          const url = rawUrl(candidate.path)
          const resp = await axios.get<string>(url, { responseType: 'text' })
          return { candidate, text: resp.data }
        })
      )

      if (cancelled) {
        // 组件已卸载或 asPath 已变更 → 清理已创建的 Object URL
        for (const url of currentUrls) {
          URL.revokeObjectURL(url)
        }
        return
      }

      const loadedTracks: SubtitleTrack[] = []
      for (const result of results) {
        if (result.status !== 'fulfilled') {
          // 404 或其他网络错误 → 静默跳过，不报错
          continue
        }
        const { candidate, text } = result.value
        const vttContent = convertToVtt(text, candidate.extension)
        if (!vttContent) {
          // 密码保护页返回的非字幕内容 → 跳过
          continue
        }

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
      // 顶层异常也静默吞掉，不影响视频播放
      console.error('Subtitle loading failed:', err)
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
        ) : (
          <VideoPlayer
            key={tracksReady ? 'tracks-loaded' : 'tracks-loading'}
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
