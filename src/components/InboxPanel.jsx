import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNotifications } from '../notifications/NotificationsProvider.jsx'

function classNames(...s) { return s.filter(Boolean).join(' ') }

function TimeAgo({ ts }) {
  const diff = Date.now() - ts
  const m = Math.round(diff / 60000)
  if (m < 1) return 'ora'
  if (m < 60) return `${m}m`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.round(h / 24)
  return `${d}g`
}

function KindBadge({ kind = 'info' }) {
  const map = {
    mail: 'text-rose-600 bg-rose-50',
    chat: 'text-emerald-700 bg-emerald-50',
    calendar: 'text-sky-700 bg-sky-50',
    info: 'text-zinc-700 bg-zinc-100',
  }
  const cls = map[kind] || map.info
  return <span className={classNames('text-[10px] font-semibold px-2 py-0.5 rounded-full', cls)}>{kind.toUpperCase()}</span>
}

export default function InboxPanel() {
  const { items, inboxOpen, closeInbox, markRead, markAllRead } = useNotifications()
  const [tab, setTab] = useState('all') // 'all' | 'unread'
  const list = useMemo(() => tab === 'unread' ? items.filter(i => !i.read) : items, [tab, items])
  const overlayRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeInbox() }
    if (inboxOpen) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [inboxOpen, closeInbox])

  if (!inboxOpen) return null

  return (
    <div aria-hidden={!inboxOpen}>
      <div ref={overlayRef} className="fixed inset-0 z-40 bg-black/20" onClick={closeInbox} />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="inbox-title"
        className="fixed z-50 top-20 right-4 w-[360px] sm:w-[420px] max-h-[70vh] overflow-hidden rounded-2xl border border-white/60 ring-1 ring-inset ring-white/40 bg-white/60 supports-[backdrop-filter]:bg-white/50 backdrop-blur-md backdrop-saturate-150 shadow-2xl"
      >
        <header className="flex items-center justify-between px-4 py-3 border-b border-white/60">
          <div className="flex items-center gap-3">
            <h2 id="inbox-title" className="text-sm font-semibold text-zinc-800">Notifiche</h2>
            <nav className="flex items-center gap-1 bg-white/50 rounded-full p-0.5 border border-white/60">
              <button onClick={() => setTab('all')} className={classNames('text-xs px-2.5 h-7 rounded-full focus-ring', tab==='all' ? 'bg-white shadow text-zinc-900' : 'text-zinc-600')}>Tutte</button>
              <button onClick={() => setTab('unread')} className={classNames('text-xs px-2.5 h-7 rounded-full focus-ring', tab==='unread' ? 'bg-white shadow text-zinc-900' : 'text-zinc-600')}>Non lette</button>
            </nav>
          </div>
          <button onClick={markAllRead} className="text-xs text-blue-700 hover:text-blue-800 focus-ring rounded-md px-2 py-1">Segna tutto come letto</button>
        </header>
        <div className="overflow-auto max-h-[calc(70vh-52px)] p-2">
          {list.length === 0 ? (
            <div className="p-8 text-center text-sm text-zinc-500">Nessuna notifica</div>
          ) : (
            <ul className="space-y-2">
              {list.map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => markRead(item.id)}
                    className={classNames('w-full text-left rounded-xl border border-white/60 ring-1 ring-inset ring-white/40 bg-white/60 supports-[backdrop-filter]:bg-white/50 backdrop-blur-md backdrop-saturate-150 shadow-lg hover:shadow-xl focus-ring px-3 py-3')}
                    aria-label={`Apri notifica: ${item.title}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="pt-0.5">
                        <KindBadge kind={item.kind} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm text-zinc-900 truncate">{item.title}</p>
                          {!item.read && <span className="inline-block h-2 w-2 rounded-full bg-blue-600" aria-hidden />}
                        </div>
                        <p className="text-sm text-zinc-600 line-clamp-2">{item.body}</p>
                        <div className="mt-1 text-[11px] text-zinc-500"><TimeAgo ts={item.ts} /></div>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
