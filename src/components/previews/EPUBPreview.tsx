import type { OdFileObject } from '../../types'
import { FC, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'

import Loading from '../Loading'
import DownloadButtonGroup from '../DownloadBtnGtoup'
import { DownloadBtnContainer } from './Containers'
import { getStoredToken } from '../../utils/protectedRouteHandler'
import type Book from '@intity/epub-js/types/book'
import type { BookOptions } from '@intity/epub-js/types/book'
import type Rendition from '@intity/epub-js/types/rendition'
import type { RenditionOptions } from '@intity/epub-js/types/rendition'

type BookWithSpine = Book & {
  spine?: {
    get: (target: string) => unknown
  }
}

const EPUBPreview: FC<{ file: OdFileObject }> = () => {
  const { asPath } = useRouter()
  const hashedToken = getStoredToken(asPath)
  const { t } = useTranslation()
  const epubContainer = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let rendition: Rendition | null = null
    let book: Book | null = null

    const renderBook = async () => {
      if (!epubContainer.current) return

      try {
        const module = await import('@intity/epub-js')
        const ePub = (module.default ?? module) as unknown as (url?: string, options?: BookOptions) => Book
        const url = `/api/raw/?path=${asPath}${hashedToken ? `&odpt=${hashedToken}` : ''}`
        const renditionOptions: Partial<RenditionOptions> = {
          width: '100%',
          height: '100%',
          manager: 'continuous',
          flow: 'scrolled'
        }

        book = ePub(url, { openAs: 'epub' })
        const bookWithSpine = book as BookWithSpine

        if (bookWithSpine.spine?.get) {
          const spineGet = bookWithSpine.spine.get.bind(bookWithSpine.spine)
          bookWithSpine.spine.get = (target: string) => {
            let resolvedTarget = target
            let section = spineGet(resolvedTarget)

            while (section == null && resolvedTarget.startsWith('../')) {
              resolvedTarget = resolvedTarget.substring(3)
              section = spineGet(resolvedTarget)
            }

            return section
          }
        }

        rendition = book.renderTo(epubContainer.current, renditionOptions as RenditionOptions)

        await rendition.display()

        if (!cancelled) {
          setLoading(false)
          setLoadError(null)
        }
      } catch (error) {
        if (!cancelled) {
          setLoading(false)
          setLoadError(error instanceof Error ? error.message : t('Cannot preview {{path}}', { path: asPath }))
        }
      }
    }

    renderBook()

    return () => {
      cancelled = true
      rendition?.destroy?.()
      book?.destroy?.()
    }
  }, [asPath, hashedToken, t])

  return (
    <div>
      <div
        className="no-scrollbar flex w-full flex-col overflow-scroll rounded bg-white dark:bg-gray-900 md:p-3"
        style={{ maxHeight: '90vh' }}
      >
        {loading && <Loading loadingText={t('Loading EPUB ...')} />}
        {loadError && !loading ? (
          <div className="p-3 text-sm text-red-500">{loadError}</div>
        ) : (
          <div className="no-scrollbar w-full flex-1 overflow-scroll" ref={epubContainer} style={{ minHeight: '70vh' }} />
        )}
      </div>
      <DownloadBtnContainer>
        <DownloadButtonGroup />
      </DownloadBtnContainer>
    </div>
  )
}

export default EPUBPreview
