import React from 'react'

function ChevronLeftIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

export default function BackButton({ onClick, label = 'Torna indietro' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-10 w-10 grid place-items-center rounded-full border border-white/60 ring-1 ring-inset ring-white/40 bg-white/60 supports-[backdrop-filter]:bg-white/50 backdrop-blur-md backdrop-saturate-150 text-zinc-700 hover:text-zinc-900 hover:bg-white/70 shadow-md focus-ring"
      aria-label={label}
      title={label}
    >
      <ChevronLeftIcon className="h-5 w-5" aria-hidden />
    </button>
  )
}

