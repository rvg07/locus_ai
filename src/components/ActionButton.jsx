import React from 'react'

export default function ActionButton({ icon: Icon, label, tone = 'zinc', onClick }) {
  const tones = {
    red: {
      icon: 'text-rose-600',
      ring: 'focus-visible:ring-rose-400'
    },
    green: {
      icon: 'text-emerald-600',
      ring: 'focus-visible:ring-emerald-400'
    },
    blue: {
      icon: 'text-sky-600',
      ring: 'focus-visible:ring-sky-400'
    },
    zinc: {
      icon: 'text-zinc-600',
      ring: 'focus-visible:ring-zinc-400'
    }
  }

  const t = tones[tone] ?? tones.zinc

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full h-28 sm:h-32 rounded-2xl border border-white/60 ring-1 ring-inset ring-white/40 bg-white/60 supports-[backdrop-filter]:bg-white/50 backdrop-blur-md backdrop-saturate-150 shadow-lg hover:shadow-xl transition-all focus-ring ${t.ring} grid place-items-center text-center px-4`}
      aria-label={label}
    >
      <div className="flex flex-col items-center gap-3">
        <div className={`h-14 w-14 grid place-items-center rounded-xl bg-white/60 border border-white/60 ring-1 ring-inset ring-white/40 ${t.icon}`}>
          <Icon className="h-9 w-9" aria-hidden />
        </div>
        <span className="text-xs font-semibold tracking-wide text-zinc-700">{label.toUpperCase()}</span>
      </div>
    </button>
  )
}
