import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useSettings } from '../settings/SettingsProvider.jsx'

export default function SettingsMenu({ onClose, variant = 'dropdown' }) {
  const { settings, update, reset } = useSettings()
  const ref = useRef(null)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Close on outside click (only for dropdown variant)
  useEffect(() => {
    if (variant !== 'dropdown') return
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose?.() }
    setTimeout(() => document.addEventListener('mousedown', onDown), 0)
    return () => document.removeEventListener('mousedown', onDown)
  }, [onClose, variant])

  const containerClass = variant === 'overlay'
    ? 'fixed z-50 top-20 right-4 w-[360px] sm:w-[420px] max-h-[70vh] overflow-auto rounded-2xl border border-white/60 ring-1 ring-inset ring-white/40 bg-white/60 supports-[backdrop-filter]:bg-white/50 backdrop-blur-md backdrop-saturate-150 shadow-2xl'
    : 'absolute right-0 mt-2 w-80 rounded-2xl border border-white/60 ring-1 ring-inset ring-white/40 bg-white/60 supports-[backdrop-filter]:bg-white/50 backdrop-blur-md backdrop-saturate-150 shadow-2xl overflow-hidden'

  const panel = (
    <div ref={ref} className={containerClass} role="dialog" aria-label="Impostazioni">
      <header className="px-4 py-3 border-b border-white/60">
        <h3 className="text-sm font-semibold text-zinc-800">Impostazioni</h3>
      </header>
      <div className="p-4 space-y-4 text-sm">
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Lingua</label>
          <select
            value={settings.language}
            onChange={(e) => update('language', e.target.value)}
            className="w-full rounded-lg border border-white/60 bg-white/70 focus-ring px-2 py-1.5 text-sm"
          >
            <option value="it">Italiano</option>
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">Inizio produttività</label>
            <input
              type="time"
              step="900"
              value={settings.productive_hours_start}
              onChange={(e) => update('productive_hours_start', e.target.value)}
              className="w-full rounded-lg border border-white/60 bg-white/70 focus-ring px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">Fine produttività</label>
            <input
              type="time"
              step="900"
              value={settings.productive_hours_end}
              onChange={(e) => update('productive_hours_end', e.target.value)}
              className="w-full rounded-lg border border-white/60 bg-white/70 focus-ring px-2 py-1.5 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Durata blocco focus (minuti)</label>
          <input
            type="number"
            min={5}
            step={5}
            value={settings.focus_block_duration}
            onChange={(e) => update('focus_block_duration', Math.max(5, Number(e.target.value || 0)))}
            className="w-full rounded-lg border border-white/60 bg-white/70 focus-ring px-2 py-1.5 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="pause-after-meetings"
            type="checkbox"
            checked={settings.pause_after_meetings}
            onChange={(e) => update('pause_after_meetings', e.target.checked)}
            className="h-4 w-4 rounded border-white/60 text-blue-600 focus-ring"
          />
          <label htmlFor="pause-after-meetings" className="text-sm text-zinc-700">Pausa dopo i meeting</label>
        </div>
      </div>
      <footer className="px-4 py-3 border-t border-white/60 flex items-center justify-end gap-2">
        <button onClick={reset} className="text-xs text-zinc-600 hover:text-zinc-800 px-3 py-1.5 rounded-md focus-ring">Reimposta</button>
        <button onClick={onClose} className="text-xs bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-md focus-ring">Chiudi</button>
      </footer>
    </div>
  )

  if (variant === 'overlay') {
    return createPortal(
      <>
        <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
        {panel}
      </>,
      document.body
    )
  }

  return panel
}
