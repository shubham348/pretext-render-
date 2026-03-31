export function PretextEditorialExample() {
  const codeSnippet = `import { prepareWithSegments, layoutNextLine } from "@chenglou/pretext"

const prepared = prepareWithSegments(text, font, {
  whiteSpace: "pre-wrap",
})

let cursor = { segmentIndex: 0, graphemeIndex: 0 }
let y = 0
const rows = []

while (true) {
  const blocked = getBlockedInterval(y, obstacle)
  const width = blocked ? blocked.availableWidth : containerWidth
  const offsetX = blocked ? blocked.offsetX : 0
  const line = layoutNextLine(prepared, cursor, width)

  if (line === null) break

  rows.push({
    text: line.text,
    x: offsetX,
    y,
  })

  cursor = line.nextCursor ?? line.end
  y += lineHeight
}

rows.forEach((row) => {
  context.fillText(row.text, row.x, row.y)
})`

  return (
    <section className="rounded-[28px] border border-[#d6c39a] bg-white/72 p-5 shadow-[0_24px_80px_rgba(108,73,37,0.08)]">
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Full Example
        </span>
      </div>

      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
        Real Canvas Wrap Flow
      </h2>
      <p className="mt-3 max-w-5xl text-lg leading-8 text-slate-600">
        This is the practical Pretext pattern used by the reader above: prepare
        once, then call
        <code className="mx-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-sm text-emerald-700">
          layoutNextLine()
        </code>
        in a top-to-bottom loop and draw each line onto canvas with its own
        offset.
      </p>

      <div className="mt-6 rounded-[20px] border border-emerald-100 bg-emerald-50/60 px-5 py-4 text-sm leading-7 text-slate-700">
        <p>
          Use this pattern when you need deterministic canvas layout for:
          editorial wrap, moving objects, custom page composition, or non-DOM
          renderers.
        </p>
        <p className="mt-3">
          The important part is that each frame starts from the top again with a
          fresh cursor, so the same text and obstacle position always produce the
          same result.
        </p>
      </div>

      <pre className="mt-8 overflow-auto rounded-[20px] bg-[#13211f] px-5 py-5 text-[14px] leading-7 text-emerald-100">
        <code>{codeSnippet}</code>
      </pre>
    </section>
  )
}
