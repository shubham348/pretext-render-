import { useMemo, useState } from 'react'
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
    <section className="rounded-[28px] border border-[#d6c39a] bg-white/72 p-5 shadow-[0_24px_80px_rgba(108,73,37,0.08)]">
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-indigo-700">
          Demo 1
        </span>
      </div>

      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
        Height Without DOM
      </h2>
      <p className="mt-3 max-w-5xl text-lg leading-8 text-slate-600">
        Measure text height using pure arithmetic, no DOM layout and no reflow.
        <code className="mx-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-sm text-indigo-700">
          prepareWithSegments()
        </code>
        caches the text once, and
        <code className="mx-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-sm text-indigo-700">
          layoutWithLines()
        </code>
        is the cheap hot path.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div>
          <div>
            <p className="text-lg font-semibold text-slate-900">Width</p>
            <p className="mt-2 text-3xl font-semibold text-indigo-600">{width}px</p>
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
            <span className="text-lg font-semibold text-slate-900">Text</span>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={5}
              className="mt-3 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 text-lg leading-8 text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white"
            />
          </label>
        </div>

        <div>
          <div className="flex items-end gap-3">
            <div
              className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 text-[18px] leading-12 text-slate-900"
              style={{ width: `${width}px`, lineHeight: `${PRETEXT_LINE_HEIGHT}px` }}
            >
              {lines.map((line, index) => (
                <div key={`${index}-${line.text}`}>{line.text}</div>
              ))}
            </div>
            <div className="flex min-h-[120px] w-11 items-center justify-center rounded-[14px] bg-indigo-500 px-2 text-center text-sm font-semibold text-white">
              <span className="[writing-mode:vertical-rl] rotate-180">{height}px</span>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <StatCard label="Lines" value={String(lines.length)} />
            <StatCard label="Height" value={`${height}px`} />
            <StatCard label="Max-width" value={`${width}px`} />
          </div>
        </div>
      </div>

      <pre className="mt-8 overflow-auto rounded-[20px] bg-[#1f1b46] px-5 py-5 text-[14px] leading-7 text-indigo-100">
        <code>{codeSnippet}</code>
      </pre>
    </section>
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
