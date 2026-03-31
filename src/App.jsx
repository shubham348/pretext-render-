import { useMemo, useState } from 'react'
import { CanvasTextPreview } from './components/CanvasTextPreview'
import { PretextEditorialExample } from './components/PretextEditorialExample'
import { PretextBasicsDemo } from './components/PretextBasicsDemo'
import { PretextFlowBallDemo } from './components/PretextFlowBallDemo'
import { PdfUploader } from './components/PdfUploader'
import { usePdfUpload } from './hooks/usePdfUpload'
import { extractDropCapContent, getDropCapInset } from './lib/bookLayout'
import { usePretextLayout } from './hooks/usePretextLayout'
import {
  PRETEXT_FONT,
  PRETEXT_LINE_HEIGHT,
  PRETEXT_MAX_WIDTH,
} from './lib/pretext'

function App() {
  const [mediaUrl, setMediaUrl] = useState('https://media.tenor.com/KeqbuC5yrgUAAAAi/deal-with-it-trailblazer.gif')
  const { metadata, fullText, error, isExtracting, sourceUrl } = usePdfUpload()
  const { dropCap, bodyText } = useMemo(
    () => extractDropCapContent(fullText ?? ''),
    [fullText],
  )
  const width = PRETEXT_MAX_WIDTH
  const { prepared, getLines, getNextLine } = usePretextLayout(bodyText)
  const previewParagraph = useMemo(() => getLines(width, PRETEXT_LINE_HEIGHT), [getLines, width])
  const layoutData = useMemo(
    () => ({
      prepared,
      width,
      font: PRETEXT_FONT,
      lineHeight: PRETEXT_LINE_HEIGHT,
      getNextLine,
      estimatedHeight: previewParagraph.height,
      dropCap: {
        letter: dropCap,
        inset: getDropCapInset(),
      },
    }),
    [dropCap, getNextLine, prepared, previewParagraph.height, width],
  )

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.24),_transparent_32%),linear-gradient(180deg,_#f8f4ec_0%,_#efe6d5_100%)] text-stone-900">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-6">
        <section className="rounded-[36px] border border-stone-300/70 bg-white/60 p-5 shadow-[0_24px_90px_rgba(120,53,15,0.12)] backdrop-blur sm:p-6">
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
            <PretextEditorialExample />
            <PretextBasicsDemo />
            <PretextFlowBallDemo />
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
