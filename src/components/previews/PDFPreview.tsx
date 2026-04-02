import { getBaseUrl } from '../../utils/getBaseUrl'
import { useRawUrl } from '../../utils/useRawUrl'
import DownloadButtonGroup from '../DownloadBtnGroup'
import { DownloadBtnContainer } from './Containers'

const PDFEmbedPreview: React.FC<{ file: unknown }> = () => {
  const { rawUrl } = useRawUrl()

  const pdfPath = encodeURIComponent(`${getBaseUrl()}${rawUrl()}`)
  const url = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${pdfPath}`

  return (
    <div>
      <div className="w-full overflow-hidden rounded" style={{ height: '90vh' }}>
        <iframe src={url} frameBorder="0" width="100%" height="100%"></iframe>
      </div>
      <DownloadBtnContainer>
        <DownloadButtonGroup />
      </DownloadBtnContainer>
    </div>
  )
}

export default PDFEmbedPreview
