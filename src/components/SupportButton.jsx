import React from 'react'

function LifeBuoyIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <path d="M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24" />
    </svg>
  )
}

export default function SupportButton() {
  const [open, setOpen] = React.useState(false)
  const toggle = () => setOpen(v => !v)
  const close = () => setOpen(false)

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') close() }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="fixed left-4 bottom-4 z-40">
      <button
        type="button"
        onClick={toggle}
        className="h-12 w-12 grid place-items-center rounded-full border border-white/60 ring-1 ring-inset ring-white/40 bg-white/60 supports-[backdrop-filter]:bg-white/50 backdrop-blur-md backdrop-saturate-150 shadow-lg hover:shadow-xl text-zinc-700 hover:text-zinc-900 focus-ring"
        aria-label="Assistenza tecnica"
        title="Assistenza tecnica"
      >
        <LifeBuoyIcon className="h-6 w-6" aria-hidden />
      </button>

      {open && (
        <div className="absolute left-0 bottom-16 w-80 rounded-2xl border border-white/60 ring-1 ring-inset ring-white/40 bg-white/60 supports-[backdrop-filter]:bg-white/50 backdrop-blur-md backdrop-saturate-150 shadow-2xl overflow-hidden">
          <header className="px-4 py-3 border-b border-white/60">
            <h3 className="text-sm font-semibold text-zinc-800">Assistenza tecnica</h3>
          </header>
          <div className="p-3 space-y-2 text-sm">
            <button
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/70 focus-ring"
              onClick={() => window.open('mailto:support@locus.ai?subject=Supporto%20Locus%20AI','_self')}
            >
              Invia email a support@locus.ai
            </button>
            <button
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/70 focus-ring"
              onClick={() => window.open('https://chat.google.com','_blank','noopener')}
            >
              Apri Google Chat di supporto
            </button>
            <button
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/70 focus-ring"
              onClick={() => window.open('https://calendar.google.com','_blank','noopener')}
            >
              Prenota un meeting
            </button>
          </div>
          <footer className="px-4 py-2 border-t border-white/60 text-right">
            <button onClick={close} className="text-xs px-3 py-1.5 rounded-md text-zinc-700 hover:text-zinc-900 focus-ring">Chiudi</button>
          </footer>
        </div>
      )}
    </div>
  )
}

