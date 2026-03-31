import { useMemo, useState } from 'react'
import { combinePdfPages, extractPdfTextByPage } from '../lib/pdf'

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
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [pages, setPages] = useState([])
  const [isExtracting, setIsExtracting] = useState(false)

  const metadata = useMemo(() => {
    if (!file) return null

    return {
      name: file.name,
      sizeLabel: formatSize(file.size),
      lastModifiedLabel: new Date(file.lastModified).toLocaleString(),
      pageCount: pages.length,
    }
  }, [file, pages.length])

  const fullText = useMemo(() => combinePdfPages(pages), [pages])

  const onFileChange = (event) => {
    void handleFileChange(event)
  }

  const handleFileChange = async (event) => {
    const nextFile = event.target.files?.[0] ?? null

    if (!nextFile) {
      setFile(null)
      setError('')
      setPages([])
      setIsExtracting(false)
      return
    }

    const isPdf =
      nextFile.type === 'application/pdf' ||
      nextFile.name.toLowerCase().endsWith('.pdf')

    if (!isPdf) {
      setFile(null)
      setError('Please choose a PDF file.')
      setPages([])
      setIsExtracting(false)
      event.target.value = ''
      return
    }

    setFile(nextFile)
    setError('')
    setPages([])
    setIsExtracting(true)

    try {
      const extractedPages = await extractPdfTextByPage(nextFile)
      setPages(extractedPages)
    } catch {
      setPages([])
      setError('Failed to extract text from that PDF.')
    } finally {
      setIsExtracting(false)
    }
  }

  return {
    file,
    metadata,
    fullText,
    pages,
    isExtracting,
    error,
    onFileChange,
  }
}
