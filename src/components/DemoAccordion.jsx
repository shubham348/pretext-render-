export function DemoAccordion({
  badge,
  title,
  summary,
  defaultOpen = false,
  children,
  tone = 'light',
}) {
  const isDark = tone === 'dark'

  return (
    <details
      className={`group min-w-0 rounded-[24px] border shadow-[0_24px_80px_rgba(108,73,37,0.08)] sm:rounded-[28px] ${
        isDark
          ? 'border-[#1c3454] bg-[#071220]'
          : 'border-[#d6c39a] bg-white/72'
      }`}
      open={defaultOpen}
    >
      <summary
        className={`flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-4 sm:gap-4 sm:px-5 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}
      >
        <div className="min-w-0">
          <span
            className={`rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.16em] ${
              isDark
                ? 'bg-cyan-500/12 text-cyan-300'
                : 'bg-indigo-100 text-indigo-700'
            }`}
          >
            {badge}
          </span>
          <h2 className="mt-3 break-words text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
          <p className={`mt-2 break-words text-sm leading-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {summary}
          </p>
        </div>
        <span
          className={`mt-1 text-2xl transition-transform group-open:rotate-45 ${
            isDark ? 'text-cyan-300' : 'text-indigo-600'
          }`}
        >
          +
        </span>
      </summary>
      <div className="min-w-0 px-4 pb-4 sm:px-5 sm:pb-5">{children}</div>
    </details>
  )
}
