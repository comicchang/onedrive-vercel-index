import type { OdFileObject } from '../../types'

import { FC } from 'react'

import { PreviewContainer, DownloadBtnContainer } from './Containers'
import DownloadButtonGroup from '../DownloadBtnGroup'
import { useRawUrl } from '../../utils/useRawUrl'

const ImagePreview: FC<{ file: OdFileObject }> = ({ file }) => {
  const { rawUrl } = useRawUrl()

  return (
    <>
      <PreviewContainer>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="mx-auto"
          src={rawUrl()}
          alt={file.name}
          width={file.image?.width}
          height={file.image?.height}
        />
      </PreviewContainer>
      <DownloadBtnContainer>
        <DownloadButtonGroup />
      </DownloadBtnContainer>
    </>
  )
}

export default ImagePreview
