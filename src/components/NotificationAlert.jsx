import React from 'react'
import { createPortal } from 'react-dom'
import { useNotifications } from '../notifications/NotificationsProvider.jsx'

export default function NotificationAlert() {
  const { alertItem, closeAlert, markRead, openInbox } = useNotifications()
  if (!alertItem) return null

  const onOpenInbox = () => { closeAlert(); openInbox(); }
  const onClose = () => { markRead(alertItem.id); closeAlert() }

  const actions = Array.isArray(alertItem.actions) ? alertItem.actions : []
  const singleAction = alertItem.actionUrl ? [{ label: alertItem.actionLabel || 'Apri', url: alertItem.actionUrl }] : []
  const allActions = [...singleAction, ...actions]

  return createPortal(
    <div className="fixed top-20 right-4 z-50 w-[360px] sm:w-[420px]" role="alert" aria-live="assertive">
      <div className="rounded-2xl border-2 border-zinc-300/70 ring-1 ring-inset ring-white/50 bg-white/80 supports-[backdrop-filter]:bg-white/60 backdrop-blur-xl backdrop-saturate-150 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.3)] overflow-hidden">
        <header className="px-5 py-3 border-b border-zinc-200/80 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900 truncate pr-4">{alertItem.title || 'Notifica'}</h3>
          <button onClick={onClose} className="h-9 w-9 grid place-items-center rounded-full text-red-600 hover:text-red-700 hover:bg-red-50 focus-ring" aria-label="Chiudi">X</button>
        </header>
        <div className="px-5 py-4 text-sm text-zinc-800 whitespace-pre-wrap">
          {alertItem.body || 'Hai una nuova notifica.'}
        </div>
        <footer className="px-5 py-3 border-t border-zinc-200/80 flex items-center justify-end gap-2 flex-wrap">
          {allActions.slice(0, 3).map((a, idx) => (
            <button
              key={idx}
              onClick={() => { window.open(a.url, a.target || '_blank', 'noopener'); onClose() }}
              className="text-xs px-3.5 py-2 rounded-full bg-white/90 border border-zinc-200/70 text-zinc-800 font-medium shadow-sm hover:shadow-md hover:bg-white focus-ring"
            >
              {a.label || 'Apri'}
            </button>
          ))}
          <button onClick={onOpenInbox} className="text-xs px-3.5 py-2 rounded-full bg-white/90 border border-zinc-200/70 text-zinc-800 font-medium shadow-sm hover:shadow-md hover:bg-white focus-ring">Apri Inbox</button>
          <button onClick={onClose} className="text-xs px-4 py-2 rounded-full bg-blue-600 text-white font-medium shadow-md hover:bg-blue-700 focus-ring">OK</button>
        </footer>
      </div>
    </div>,
    document.body
  )
}

