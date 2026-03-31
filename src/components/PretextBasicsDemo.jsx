import { useMemo, useState } from 'react'
import { DemoAccordion } from './DemoAccordion'
import { usePretextLayout } from '../hooks/usePretextLayout'
import { PRETEXT_LINE_HEIGHT } from '../lib/pretext'

const DEMO_TEXT = `AGI 春天到了. بدأت الرحلة. and this is a long paragraph demonstrating how Pretext measures text height without any DOM interaction. Try resizing the width below or editing this text!`

const MIN_WIDTH = 180
const MAX_WIDTH = 420

function buildCodeSnippet(width) {
  return `import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext"

const prepared = prepareWithSegments(text, font, {
  whiteSpace: "pre-wrap",
})

const result = layoutWithLines(prepared, ${width}, ${PRETEXT_LINE_HEIGHT})

console.log(result.height)
console.log(result.lines.length)`
}

export function PretextBasicsDemo() {
  const [width, setWidth] = useState(248)
  const [text, setText] = useState(DEMO_TEXT)
  const { getLines } = usePretextLayout(text)
  const measured = useMemo(
    () => getLines(width, PRETEXT_LINE_HEIGHT),
    [getLines, width],
  )
  const lines = measured?.lines ?? []
  const height = measured?.height ?? 0
  const codeSnippet = useMemo(() => buildCodeSnippet(width), [width])

  return (
    <DemoAccordion
      badge="Demo 1"
      title="Height Without DOM"
      summary="Measure text height using pure arithmetic, no DOM layout and no reflow. prepareWithSegments() caches once, and layoutWithLines() is the cheap hot path."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:gap-8">
        <div>
          <div>
            <p className="text-base font-semibold text-slate-900 sm:text-lg">Width</p>
            <p className="mt-2 text-2xl font-semibold text-indigo-600 sm:text-3xl">{width}px</p>
            <input
              type="range"
              min={MIN_WIDTH}
              max={MAX_WIDTH}
              value={width}
              onChange={(event) => setWidth(Number(event.target.value))}
              className="mt-4 h-2 w-full accent-indigo-500"
            />
          </div>

          <label className="mt-6 block">
            <span className="text-base font-semibold text-slate-900 sm:text-lg">Text</span>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={5}
              className="mt-3 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 text-base leading-7 text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white sm:text-lg sm:leading-8"
            />
          </label>
        </div>

        <div className="min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div
              className="w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 text-[16px] text-slate-900 sm:text-[18px]"
              style={{
                maxWidth: `${width}px`,
                lineHeight: `${PRETEXT_LINE_HEIGHT}px`,
              }}
            >
              {lines.map((line, index) => (
                <div key={`${index}-${line.text}`}>{line.text}</div>
              ))}
            </div>
            <div className="flex h-12 w-full items-center justify-center rounded-[14px] bg-indigo-500 px-2 text-center text-sm font-semibold text-white sm:min-h-[120px] sm:w-11">
              <span className="sm:hidden">{height}px tall</span>
              <span className="hidden [writing-mode:vertical-rl] rotate-180 sm:block">{height}px</span>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <StatCard label="Lines" value={String(lines.length)} />
            <StatCard label="Height" value={`${height}px`} />
            <StatCard label="Max-width" value={`${width}px`} />
          </div>
        </div>
      </div>

      <pre className="mt-8 overflow-hidden rounded-[20px] bg-[#1f1b46] px-4 py-4 text-[12px] leading-6 text-indigo-100 sm:px-5 sm:py-5 sm:text-[14px] sm:leading-7">
        <code className="whitespace-pre-wrap break-all">{codeSnippet}</code>
      </pre>
    </DemoAccordion>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-[18px] bg-slate-100 px-4 py-3 text-center">
      <p className="text-2xl font-semibold text-indigo-600">{value}</p>
      <p className="mt-1 text-sm uppercase tracking-[0.16em] text-slate-500">{label}</p>
    </div>
  )
}
