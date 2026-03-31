import { useEffect, useMemo, useState } from 'react'
import { combinePdfPages, extractPdfTextByUrl } from '../lib/pdf'
import { HARDCODED_PDF_URL } from '../lib/pdfSource'

function formatSize(size) {
  if (!Number.isFinite(size) || size <= 0) return '0 KB'
  const units = ['B', 'KB', 'MB', 'GB']
  let value = size
  let index = 0

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024
    index += 1
  }

  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}

export function usePdfUpload() {
  const [error, setError] = useState('')
  const [pages, setPages] = useState([])
  const [isExtracting, setIsExtracting] = useState(false)
  const [fileInfo, setFileInfo] = useState(null)

  const metadata = useMemo(() => {
    if (!fileInfo) return null

    return {
      name: fileInfo.name,
      sizeLabel: formatSize(fileInfo.size),
      pageCount: pages.length,
    }
  }, [fileInfo, pages.length])

  const fullText = useMemo(() => combinePdfPages(pages), [pages])
  const sourceUrl = HARDCODED_PDF_URL

  useEffect(() => {
    let isCancelled = false

    const loadPdf = async () => {
      if (!sourceUrl) {
        setFileInfo(null)
        setPages([])
        setError('Add a PDF URL in src/lib/pdfSource.js.')
        setIsExtracting(false)
        return
      }

      setError('')
      setPages([])
      setIsExtracting(true)

      try {
        const result = await extractPdfTextByUrl(sourceUrl)

        if (isCancelled) return

        const name = sourceUrl.split('/').pop() || 'document.pdf'
        setFileInfo({
          name,
          size: result.size,
        })
        setPages(result.pages)
      } catch {
        if (isCancelled) return
        setFileInfo(null)
        setPages([])
        setError('Failed to load the hardcoded PDF source.')
      } finally {
        if (!isCancelled) {
          setIsExtracting(false)
        }
      }
    }

    void loadPdf()

    return () => {
      isCancelled = true
    }
  }, [sourceUrl])

  return {
    metadata,
    fullText,
    pages,
    isExtracting,
    error,
    sourceUrl,
  }
}
