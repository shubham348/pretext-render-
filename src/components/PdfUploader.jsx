export function PdfUploader({
  metadata,
  error,
  isExtracting,
  mediaUrl,
  onFileChange,
  onMediaUrlChange,
}) {
  return (
    <section className="rounded-[24px] border border-stone-300/80 bg-white/85 p-4 shadow-[0_16px_40px_rgba(120,53,15,0.06)] backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700">
            PDF Input
          </p>
          <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-stone-900">
            Upload and render
          </h2>
          <p className="mt-1.5 max-w-3xl text-[13px] leading-6 text-stone-600">
            Extract readable PDF text and flow it around the Pretext dragon in
            one continuous page.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center rounded-full border border-amber-600/70 bg-amber-50 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-amber-900 transition hover:border-amber-700 hover:bg-amber-100">
          {isExtracting ? 'Loading...' : metadata ? 'Change PDF' : 'Upload PDF'}
          <input
            className="sr-only"
            type="file"
            accept="application/pdf,.pdf"
            onChange={onFileChange}
          />
        </label>
      </div>

      <label className="mt-3 block">
        <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
          Media URL
        </span>
        <input
          type="url"
          value={mediaUrl}
          onChange={(event) => onMediaUrlChange(event.target.value)}
          placeholder="Paste an image, GIF, or video URL"
          className="w-full rounded-[20px] border border-stone-300 bg-stone-50 px-4 py-2.5 text-[13px] text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
        />
      </label>

      {metadata ? (
        <p className="mt-2 text-[12px] text-stone-600">
          {metadata.name}
          {metadata.pageCount ? ` • ${metadata.pageCount} pages` : ''}
          {metadata.sizeLabel ? ` • ${metadata.sizeLabel}` : ''}
        </p>
      ) : null}

      {isExtracting ? (
        <p className="mt-2 text-[12px] text-amber-800">Extracting text...</p>
      ) : null}

      {error ? (
        <p className="mt-3 rounded-[18px] border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] text-red-700">
          {error}
        </p>
      ) : null}
    </section>
  )
}
