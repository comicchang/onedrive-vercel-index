import type { OfficeFileViewerProps } from 'office-file-viewer'
import type { OdFileObject } from '../../types'
import { type FC, useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import DownloadButtonGroup from '../DownloadBtnGroup'
import { DownloadBtnContainer } from './Containers'
import { useRawUrl } from '../../utils/useRawUrl'

const OfficeViewer = dynamic<OfficeFileViewerProps>(
  () =>
    import('office-file-viewer').then(({ OfficeFileViewer }) => {
      const OfficeViewerWrapper = (props: OfficeFileViewerProps) => <OfficeFileViewer {...props} />
      return OfficeViewerWrapper
    }),
  {
    ssr: false,
    loading: () => <div>Loading office preview...</div>,
  },
)

const OfficePreview: FC<{ file: OdFileObject }> = ({ file }) => {
  const { locale } = useRouter()
  const { rawUrl } = useRawUrl()
  const docContainer = useRef<HTMLDivElement>(null)
  const [docContainerWidth, setDocContainerWidth] = useState(600)

  const loadOfficeFile = useCallback(
    async (signal?: AbortSignal) => {
      const response = await fetch(rawUrl(), {
        signal,
        credentials: 'same-origin',
      })

      if (!response.ok) {
        throw new Error(`Failed to load office file "${file.name}": ${response.status} ${response.statusText}`)
      }

      const contentType =
        response.headers.get('content-type')?.split(';', 1)[0] || file.file.mimeType || 'application/octet-stream'
      const blob = await response.blob()

      return new File([blob], file.name, { type: contentType })
    },
    [file.file.mimeType, file.name, rawUrl],
  )

  useEffect(() => {
    setDocContainerWidth(docContainer.current ? docContainer.current.offsetWidth : 600)
  }, [])

  return (
    <div>
      <div className="overflow-scroll" ref={docContainer} style={{ maxHeight: '90vh' }}>
        <OfficeViewer
          uri={loadOfficeFile}
          defaultFileName={file.name}
          height="600px"
          style={{ width: docContainerWidth }}
          locale={locale?.startsWith('zh') ? 'zh-CN' : 'en-US'}
          parseOptions={{ worker: 'auto' }}
        />
      </div>
      <DownloadBtnContainer>
        <DownloadButtonGroup />
      </DownloadBtnContainer>
    </div>
  )
}

export default OfficePreview
