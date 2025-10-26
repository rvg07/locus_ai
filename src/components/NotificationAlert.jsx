import React from 'react'
import { createPortal } from 'react-dom'
import { useNotifications } from '../notifications/NotificationsProvider.jsx'

export default function NotificationAlert() {
  const { alertItem, closeAlert, markRead, openInbox, removeNotification } = useNotifications()
  if (!alertItem) return null

  const onOpenInbox = () => { closeAlert(); openInbox(); }
  const onClose = () => { markRead(alertItem.id); closeAlert() }
  const onRemove = () => { removeNotification(alertItem.id) }

  const actions = Array.isArray(alertItem.actions) ? alertItem.actions : []
  const singleAction = alertItem.actionUrl ? [{ label: alertItem.actionLabel || 'Apri', url: alertItem.actionUrl }] : []
  const allActions = [...singleAction, ...actions]

  // Minimal Markdown -> React renderer for bold/italic, paragraphs and lists
  const renderInline = (text) => {
    if (typeof text !== 'string') return text
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
    return parts.map((part, i) => {
      if (/^\*\*[^*]+\*\*$/.test(part)) {
        return <strong key={`b-${i}`}>{part.slice(2, -2)}</strong>
      }
      if (/^\*[^*]+\*$/.test(part)) {
        return <em key={`i-${i}`}>{part.slice(1, -1)}</em>
      }
      return part
    })
  }

  const renderMarkdown = (md) => {
    const lines = String(md || '').split(/\r?\n/)
    const out = []
    let paragraph = []
    let ol = []
    let ul = []

    const flushParagraph = () => {
      if (paragraph.length) {
        out.push(<p key={`p-${out.length}`} className="leading-relaxed">{renderInline(paragraph.join(' '))}</p>)
        paragraph = []
      }
    }
    const flushOl = () => {
      if (ol.length) {
        out.push(
          <ol key={`ol-${out.length}`} className="list-decimal pl-5 space-y-1">
            {ol.map((t, idx) => <li key={idx} className="leading-relaxed">{renderInline(t)}</li>)}
          </ol>
        )
        ol = []
      }
    }
    const flushUl = () => {
      if (ul.length) {
        out.push(
          <ul key={`ul-${out.length}`} className="list-disc pl-5 space-y-1">
            {ul.map((t, idx) => <li key={idx} className="leading-relaxed">{renderInline(t)}</li>)}
          </ul>
        )
        ul = []
      }
    }

    for (const raw of lines) {
      const line = raw.trimEnd()
      if (!line.trim()) {
        flushParagraph(); flushOl(); flushUl();
        continue
      }
      // horizontal rule ---
      if (/^\s*---+\s*$/.test(line)) {
        flushParagraph(); flushOl(); flushUl();
        out.push(<hr key={`hr-${out.length}`} className="my-3 border-zinc-200/80" />)
        continue
      }
      // headings like ### Title
      const mH = line.match(/^\s*#{1,6}\s+(.+)/)
      if (mH) {
        flushParagraph(); flushOl(); flushUl();
        out.push(
          <h3 key={`h-${out.length}`} className="text-[15px] font-semibold text-zinc-900 mt-1">
            {renderInline(mH[1])}
          </h3>
        )
        continue
      }
      const mOl = line.match(/^\s*(\d+)\.\s+(.+)/)
      if (mOl) {
        flushParagraph(); flushUl();
        ol.push(mOl[2])
        continue
      }
      const mUl = line.match(/^\s*[-•]\s+(.+)/)
      if (mUl) {
        flushParagraph(); flushOl();
        ul.push(mUl[1])
        continue
      }
      paragraph.push(line)
    }
    flushParagraph(); flushOl(); flushUl();
    return out.length ? out : [renderInline(md)]
  }

  return createPortal(
    <div className="fixed top-20 right-4 z-50 w-[360px] sm:w-[420px]" role="alert" aria-live="assertive">
      <div className="rounded-2xl border-2 border-zinc-300/70 ring-1 ring-inset ring-white/50 bg-white/80 supports-[backdrop-filter]:bg-white/60 backdrop-blur-xl backdrop-saturate-150 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.3)] overflow-hidden grid grid-rows-[auto,1fr,auto] max-h-[70vh]">
        <header className="px-5 py-3 border-b border-zinc-200/80 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900 truncate pr-4">{alertItem.title || 'Notifica'}</h3>
          <button onClick={onRemove} className="h-9 w-9 grid place-items-center rounded-full text-red-600 hover:text-red-700 hover:bg-red-50 focus-ring" aria-label="Elimina notifica" title="Elimina">×</button>
        </header>
        <div className="px-5 py-4 text-sm text-zinc-800 overflow-y-auto min-h-0 flex flex-col space-y-3">
          {renderMarkdown(alertItem.body || 'Hai una nuova notifica.')}
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
