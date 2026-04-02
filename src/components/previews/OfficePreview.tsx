import type { OdFileObject } from '../../types'
import { FC, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

import DownloadButtonGroup from '../DownloadBtnGroup'
import { DownloadBtnContainer } from './Containers'
import { getBaseUrl } from '../../utils/getBaseUrl'
import { useRawUrl } from '../../utils/useRawUrl'

const Preview = dynamic(() => import('preview-office-docs').then(mod => mod.default), {
  ssr: false,
  loading: () => <div>Loading office preview...</div>
}) as any

const OfficePreview: FC<{ file: OdFileObject }> = () => {
  const { rawUrl } = useRawUrl()

  const docContainer = useRef<HTMLDivElement>(null)
  const [docContainerWidth, setDocContainerWidth] = useState(600)

  const docUrl = encodeURIComponent(`${getBaseUrl()}${rawUrl()}`)

  useEffect(() => {
    setDocContainerWidth(docContainer.current ? docContainer.current.offsetWidth : 600)
  }, [])

  return (
    <div>
      <div className="overflow-scroll" ref={docContainer} style={{ maxHeight: '90vh' }}>
        <Preview url={docUrl} width={docContainerWidth.toString()} height="600" />
      </div>
      <DownloadBtnContainer>
        <DownloadButtonGroup />
      </DownloadBtnContainer>
    </div>
  )
}

export default OfficePreview
