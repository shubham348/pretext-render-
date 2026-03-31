export function PdfUploader({
  metadata,
  error,
  isExtracting,
  mediaUrl,
  onMediaUrlChange,
  sourceUrl,
}) {
  return (
    <section className="rounded-[24px] border border-stone-300/80 bg-white/85 p-4 shadow-[0_16px_40px_rgba(120,53,15,0.06)] backdrop-blur">
      <label className="mt-3 block">
        <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
          Media URL (Add an image, GIF, or video URL to extract text from the media ,Play with the extracted text in the canvas preview below. )
        </span>
        <input
          type="url"
          value={mediaUrl}
          onChange={(event) => onMediaUrlChange(event.target.value)}
          placeholder="Paste an image, GIF, or video URL"
          className="w-full rounded-[20px] border border-stone-300 bg-stone-50 px-4 py-2.5 text-[13px] text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
        />
      </label>
    </section>
  )
}
