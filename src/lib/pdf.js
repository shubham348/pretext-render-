import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'

GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString()

function cleanLineText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([([{])\s+/g, '$1')
    .replace(/\s+(\)|\]|\})/g, '$1')
    .replace(/-\s+([a-z])/g, '-$1')
    .replace(/\b([A-Za-z])\s+([A-Za-z])\b/g, '$1$2')
    .trim()
}

function joinLineItems(items) {
  const orderedItems = [...items].sort((a, b) => a.x - b.x)
  const parts = []

  orderedItems.forEach((item, index) => {
    const previous = orderedItems[index - 1]

    if (previous) {
      const previousRight = previous.x + previous.width
      const gap = item.x - previousRight

      if (gap > 1.5) {
        parts.push(' ')
      }
    }

    parts.push(item.text)
  })

  return cleanLineText(parts.join(''))
}

export function formatPDFText(items, options = {}) {
  const yThreshold = options.yThreshold ?? 5
  const paragraphGap = options.paragraphGap ?? 22
  const positioned = items
    .filter((item) => 'str' in item && item.str && item.str.trim())
    .map((item) => ({
      text: item.str,
      x: item.transform?.[4] ?? 0,
      y: item.transform?.[5] ?? 0,
      width: item.width ?? 0,
    }))

  const lines = []

  for (const item of positioned) {
    const existingLine = lines.find((line) => Math.abs(line.y - item.y) <= yThreshold)

    if (existingLine) {
      existingLine.items.push(item)
    } else {
      lines.push({
        y: item.y,
        items: [item],
      })
    }
  }

  const normalizedLines = lines
    .sort((a, b) => b.y - a.y)
    .map((line) => ({
      y: line.y,
      text: joinLineItems(line.items),
    }))
    .filter((line) => line.text)

  const paragraphs = []
  let currentParagraph = []

  normalizedLines.forEach((line, index) => {
    const previous = normalizedLines[index - 1]
    const gap = previous ? Math.abs(previous.y - line.y) : 0
    const shouldBreak = previous && gap > paragraphGap

    if (shouldBreak && currentParagraph.length > 0) {
      paragraphs.push(currentParagraph.join(' ').trim())
      currentParagraph = []
    }

    currentParagraph.push(line.text)
  })

  if (currentParagraph.length > 0) {
    paragraphs.push(currentParagraph.join(' ').trim())
  }

  return paragraphs
    .map((paragraph) =>
      paragraph
        .replace(/\s+/g, ' ')
        .replace(/\s+([,.;:!?])/g, '$1')
        .replace(/([([{])\s+/g, '$1')
        .replace(/\s+(\)|\]|\})/g, '$1')
        .trim(),
    )
    .filter(Boolean)
}

export async function extractPdfTextByPage(file) {
  const buffer = await file.arrayBuffer()
  return extractPdfTextFromBuffer(buffer)
}

export async function extractPdfTextByUrl(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to load PDF: ${response.status}`)
  }

  const buffer = await response.arrayBuffer()
  const pages = await extractPdfTextFromBuffer(buffer)

  return {
    pages,
    size: Number(response.headers.get('content-length') || 0),
  }
}

async function extractPdfTextFromBuffer(buffer) {
  const loadingTask = getDocument({ data: buffer })
  const document = await loadingTask.promise

  try {
    const pages = []

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber)
      const textContent = await page.getTextContent()
      const paragraphs = formatPDFText(textContent.items)

      pages.push({
        pageNumber,
        paragraphs,
        text: paragraphs.join('\n'),
      })
    }

    return pages
  } finally {
    await document.destroy()
  }
}

export function combinePdfPages(pages) {
  return pages
    .map((page) => page.text.trim())
    .filter(Boolean)
    .join('\n\n\n\n')
    .trim()
}
