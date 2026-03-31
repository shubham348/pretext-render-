import { useEffect, useMemo, useState } from 'react'
import { CanvasTextPreview } from './components/CanvasTextPreview'
import { PretextEditorialExample } from './components/PretextEditorialExample'
import { PretextBasicsDemo } from './components/PretextBasicsDemo'
import { PretextIntroSection } from './components/PretextIntroSection'
import { PretextLinksSection } from './components/PretextLinksSection'
import { PdfUploader } from './components/PdfUploader'
import { usePdfUpload } from './hooks/usePdfUpload'
import { extractDropCapContent, getResponsiveDropCapInset } from './lib/bookLayout'
import { usePretextLayout } from './hooks/usePretextLayout'
import {
  PRETEXT_LINE_HEIGHT,
  PRETEXT_MAX_WIDTH,
} from './lib/pretext'

function getResponsiveBookTypography(windowWidth) {
  if (windowWidth < 540) {
    return {
      font: '400 15px "MedievalSharp", "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif',
      lineHeight: 20,
      width: Math.min(PRETEXT_MAX_WIDTH, 284),
      compact: true,
      dropCapSize: 58,
    }
  }

  if (windowWidth < 900) {
    return {
      font: '400 16px "MedievalSharp", "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif',
      lineHeight: 22,
      width: Math.min(PRETEXT_MAX_WIDTH, 420),
      compact: true,
      dropCapSize: 64,
    }
  }

  return {
    font: '400 19px "MedievalSharp", "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif',
    lineHeight: PRETEXT_LINE_HEIGHT,
    width: PRETEXT_MAX_WIDTH,
    compact: false,
    dropCapSize: 74,
  }
}

function App() {
  const [mediaUrl, setMediaUrl] = useState('https://media.tenor.com/KeqbuC5yrgUAAAAi/deal-with-it-trailblazer.gif')
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280,
  )
  const { metadata, fullText, error, isExtracting, sourceUrl } = usePdfUpload()
  const { dropCap, bodyText } = useMemo(
    () => extractDropCapContent(fullText ?? ''),
    [fullText],
  )
  const typography = useMemo(() => getResponsiveBookTypography(windowWidth), [windowWidth])
  const { prepared, getLines, getNextLine } = usePretextLayout(bodyText, typography.font)
  const previewParagraph = useMemo(
    () => getLines(typography.width, typography.lineHeight),
    [getLines, typography.lineHeight, typography.width],
  )

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const layoutData = useMemo(
    () => ({
      prepared,
      width: typography.width,
      font: typography.font,
      lineHeight: typography.lineHeight,
      getNextLine,
      estimatedHeight: previewParagraph.height,
      dropCap: {
        letter: dropCap,
        inset: getResponsiveDropCapInset(typography.compact),
        size: typography.dropCapSize,
      },
    }),
    [dropCap, getNextLine, prepared, previewParagraph.height, typography],
  )

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.24),_transparent_32%),linear-gradient(180deg,_#f8f4ec_0%,_#efe6d5_100%)] text-stone-900">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-3 py-4 sm:px-6 sm:py-8">
        <header className="mb-4 rounded-[24px] border border-stone-300/70 bg-white/70 px-4 py-4 shadow-[0_20px_60px_rgba(120,53,15,0.08)] backdrop-blur sm:mb-6 sm:rounded-[30px] sm:px-6 sm:py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-700">
            Pretext
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            Pretext Library Demo
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600 sm:text-base sm:leading-7">
            Interactive examples and a PDF reader showing how Pretext layout
            text without relying on traditional DOM flow.
          </p>
        </header>
        <section className="rounded-[28px] border border-stone-300/70 bg-white/60 p-3 shadow-[0_24px_90px_rgba(120,53,15,0.12)] backdrop-blur sm:rounded-[36px] sm:p-6">
          <div className="grid gap-5">
            <PdfUploader
              metadata={metadata}
              error={error}
              isExtracting={isExtracting}
              mediaUrl={mediaUrl}
              onMediaUrlChange={setMediaUrl}
              sourceUrl={sourceUrl}
            />
            <CanvasTextPreview
              layoutData={layoutData}
              mediaUrl={mediaUrl}
              hasContent={Boolean(bodyText || dropCap)}
            />
            <PretextIntroSection />
            <PretextEditorialExample />
            <PretextBasicsDemo />
            <PretextLinksSection />
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
