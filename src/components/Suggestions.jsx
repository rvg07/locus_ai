import React from 'react'

export default function Suggestions({ items = [], onPick }) {
  if (!items?.length) return null
  return (
    <section aria-label="Suggerimenti" className="mt-8 sm:mt-10">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.slice(0, 3).map((text, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onPick?.(text)}
            className="rounded-2xl border border-white/60 ring-1 ring-inset ring-white/40 bg-white/60 supports-[backdrop-filter]:bg-white/50 backdrop-blur-md backdrop-saturate-150 shadow-lg hover:shadow-xl focus-ring px-4 h-28 sm:h-32 grid place-items-center text-center"
            aria-label={`Suggerimento: ${text}`}
          >
            <span className="text-sm text-zinc-700/90">
              {text}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
