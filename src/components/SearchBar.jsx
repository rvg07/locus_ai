import React from 'react'

function SearchIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-3.6-3.6" />
    </svg>
  )
}

function PaperPlaneIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22 11 13 2 9 22 2z" />
    </svg>
  )
}

function PaperClipIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05 12 20.5a6 6 0 0 1-8.49-8.49l10-10a4 4 0 1 1 5.66 5.66l-10 10a2 2 0 1 1-2.83-2.83l9.19-9.19" />
    </svg>
  )
}

function MicIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0M12 19v3" />
    </svg>
  )
}

export default function SearchBar({ value, onChange, onSubmit }) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit?.(e); }}
      className="mx-auto w-full"
      role="search"
      aria-label="Cerca o chiedi a Locus AI"
    >
      <div className="w-full flex items-center gap-2 rounded-full bg-white/60 supports-[backdrop-filter]:bg-white/50 backdrop-blur-md backdrop-saturate-150 border border-white/60 ring-1 ring-inset ring-white/40 shadow-lg px-6 py-3.5 transition-shadow">
        <SearchIcon className="h-5 w-5 text-zinc-400" aria-hidden />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Search..."
          className="flex-1 bg-transparent outline-none text-[16px] placeholder:text-zinc-400"
        />
        <div className="flex items-center gap-1.5">
          <button type="button" className="h-8 w-8 grid place-items-center rounded-full text-zinc-600 hover:text-zinc-800 hover:bg-white/60 focus-ring" aria-label="Allega">
            <PaperClipIcon className="h-5 w-5" aria-hidden />
          </button>
          <button type="button" className="h-8 w-8 grid place-items-center rounded-full text-zinc-600 hover:text-zinc-800 hover:bg-white/60 focus-ring" aria-label="Microfono">
            <MicIcon className="h-5 w-5" aria-hidden />
          </button>
          <button type="submit" className="h-8 w-8 grid place-items-center rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-50/70 focus-ring" aria-label="Invia">
            <PaperPlaneIcon className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>
    </form>
  )
}
