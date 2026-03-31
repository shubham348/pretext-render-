export function PretextIntroSection() {
  return (
    <section className="min-w-0 rounded-[24px] border border-[#d6c39a] bg-white/72 p-4 shadow-[0_24px_80px_rgba(108,73,37,0.08)] sm:rounded-[28px] sm:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700">
        Pretext Guide
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        What Pretext Is And When To Use It
      </h1>

      <div className="mt-4 grid gap-5 lg:grid-cols-3">
        <InfoCard
          title="What It Is"
          text="Pretext is a text measurement and layout library by Cheng Lou. It helps you prepare text once, then measure and lay out lines without relying on DOM reflow."
        />
        <InfoCard
          title="When To Use It"
          text="Use it for canvas apps, games, editors, animated layouts, custom readers, design tools, and any UI where text must respond to motion or constraints outside normal HTML layout."
        />
        <InfoCard
          title="Simple Flow"
          text="Prepare the text, call layoutWithLines() for block measurement, or layoutNextLine() inside a loop when you want custom line-by-line placement around moving objects."
        />
      </div>

      <div className="mt-6 rounded-[18px] border border-emerald-100 bg-emerald-50/70 px-4 py-4 text-sm leading-7 text-slate-700 sm:rounded-[20px] sm:px-5">
        <p className="font-semibold text-slate-900">Common use cases</p>
        <p className="mt-2">
          Editorial text wrap, canvas readers, draggable obstacles, animated
          labels, custom page composition, multilingual text measurement,
          low-reflow interfaces, and rendering text in environments where DOM
          layout is too expensive or too limiting.
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-[18px] bg-[#13211f] px-4 py-4 text-[12px] leading-6 text-emerald-100 sm:rounded-[20px] sm:px-5 sm:py-5 sm:text-[14px] sm:leading-7">
        <code className="block whitespace-pre-wrap break-all">{`import { prepareWithSegments, layoutNextLine } from "@chenglou/pretext"

const prepared = prepareWithSegments(text, font, {
  whiteSpace: "pre-wrap",
})

let cursor = { segmentIndex: 0, graphemeIndex: 0 }
let y = 0

while (true) {
  const line = layoutNextLine(prepared, cursor, width)
  if (line === null) break
  drawText(line.text, x, y)
  cursor = line.nextCursor ?? line.end
  y += lineHeight
}`}</code>
      </div>

      <div className="mt-6 rounded-[18px] border border-stone-200 bg-stone-50 px-4 py-4 sm:rounded-[20px] sm:px-5 sm:py-5">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
          Full API Reference
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <ApiCard
            title="Use Case 1 - DOM height prediction"
            lines={[
              `prepare(text: string, font: string, options?: { whiteSpace?: 'normal' | 'pre-wrap' }): PreparedText`,
              `layout(prepared: PreparedText, maxWidth: number, lineHeight: number): { height: number, lineCount: number }`,
            ]}
          />
          <ApiCard
            title="Use Case 2 - Manual line layout"
            lines={[
              `prepareWithSegments(text, font, options?): PreparedTextWithSegments`,
              `layoutWithLines(prepared, maxWidth, lineHeight): { height, lineCount, lines: LayoutLine[] }`,
              `walkLineRanges(prepared, maxWidth, onLine: (line: LayoutLineRange) => void): number`,
              `layoutNextLine(prepared, start: LayoutCursor, maxWidth): LayoutLine | null`,
            ]}
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <ApiCard
            title="Helpers"
            lines={[
              `clearCache(): void`,
              `setLocale(locale?): void`,
            ]}
          />
          <ApiCard
            title="pre-wrap support for textareas"
            lines={[
              `const prepared = prepare(textareaValue, '16px Inter', { whiteSpace: 'pre-wrap' })`,
              `const { height } = layout(prepared, textareaWidth, 20)`,
              `Tabs, spaces, and newlines are preserved like a textarea.`,
            ]}
          />
        </div>

        <div className="mt-4 rounded-[18px] border border-amber-100 bg-amber-50 px-4 py-4">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-900">
            Known Caveats
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-700">
            Pretext targets the most common CSS text setup:
          </p>
          <div className="mt-3 rounded-[16px] bg-white/80 px-4 py-4 text-[13px] leading-7 text-slate-700">
            <code>{`white-space: normal | pre-wrap
word-break: normal
overflow-wrap: break-word
line-break: auto`}</code>
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            Watch out when your layout depends on uncommon CSS text rules outside
            this default model.
          </p>
        </div>
      </div>

    </section>
  )
}

function InfoCard({ title, text }) {
  return (
    <div className="min-w-0 rounded-[18px] border border-stone-200 bg-stone-50 px-4 py-4">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-900">
        {title}
      </p>
      <p className="mt-2 text-sm leading-7 break-words text-slate-600">{text}</p>
    </div>
  )
}

function ApiCard({ title, lines }) {
  return (
    <div className="min-w-0 rounded-[18px] border border-stone-200 bg-white px-4 py-4">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-900">
        {title}
      </p>
      <div className="mt-3 overflow-hidden rounded-[16px] bg-slate-50 px-4 py-4 text-[12px] leading-6 text-slate-700 sm:text-[13px] sm:leading-7">
        {lines.map((line) => (
          <div key={line}>
            <code className="break-all">{line}</code>
          </div>
        ))}
      </div>
    </div>
  )
}

