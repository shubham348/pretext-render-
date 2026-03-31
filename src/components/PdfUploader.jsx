export function PdfUploader({
  mediaUrl,
  onMediaUrlChange,
}) {
  return (
    <section className="min-w-0 rounded-[22px] border border-stone-300/80 bg-white/85 p-3 shadow-[0_16px_40px_rgba(120,53,15,0.06)] backdrop-blur sm:rounded-[24px] sm:p-4">
      <label className="mt-3 block">
        <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
          Media URL
        </span>
        <span className="mb-2 block text-xs leading-6 text-stone-500">
          Add an image, GIF, or video URL and preview how the extracted PDF text
          flows around it.
        </span>
        <input
          type="url"
          value={mediaUrl}
          onChange={(event) => onMediaUrlChange(event.target.value)}
          placeholder="Paste an image, GIF, or video URL"
          className="w-full min-w-0 rounded-[16px] border border-stone-300 bg-stone-50 px-3 py-2.5 text-[13px] text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white sm:rounded-[20px] sm:px-4"
        />
      </label>
    </section>
  )
}
