import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchNotifications } from '../lib/api.js'

const NotificationsContext = createContext(null)

const seed = () => ([
  {
    id: 'n1',
    title: 'Nuovo commento su Calendar',
    body: 'Marco ha aggiunto un commento all’evento di venerdì.',
    ts: Date.now() - 1000 * 60 * 10,
    read: false,
    kind: 'calendar',
  },
  {
    id: 'n2',
    title: 'Email importante',
    body: 'Oggetto: Contratto — in attesa della tua revisione.',
    ts: Date.now() - 1000 * 60 * 60,
    read: false,
    kind: 'mail',
  },
  {
    id: 'n3',
    title: 'Nuovo messaggio in Chat',
    body: 'Marta: “Puoi rivedere la nota?”',
    ts: Date.now() - 1000 * 60 * 120,
    read: true,
    kind: 'chat',
  },
])

export function NotificationsProvider({ children }) {
  const [inboxOpen, setInboxOpen] = useState(false)
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem('locus.notifications')
      return raw ? JSON.parse(raw) : seed()
    } catch { return seed() }
  })

  useEffect(() => {
    try { localStorage.setItem('locus.notifications', JSON.stringify(items)) } catch {}
  }, [items])

  const unreadCount = useMemo(() => items.filter(i => !i.read).length, [items])
  const [alertItem, setAlertItem] = useState(null)

  const add = useCallback((n) => {
    setItems(prev => [{ ...n, id: n.id ?? crypto.randomUUID(), ts: n.ts ?? Date.now(), read: !!n.read }, ...prev])
  }, [])

  const markRead = useCallback((id) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, read: true } : i))
  }, [])

  const markAllRead = useCallback(() => {
    setItems(prev => prev.map(i => ({ ...i, read: true })))
  }, [])

  const toggleInbox = useCallback(() => setInboxOpen(v => !v), [])
  const openInbox = useCallback(() => setInboxOpen(true), [])
  const closeInbox = useCallback(() => setInboxOpen(false), [])

  const showAlertFor = useCallback((notif) => {
    setAlertItem(notif)
  }, [])
  const closeAlert = useCallback(() => setAlertItem(null), [])

  // Demo: expose a helper to quickly push a notification from console
  useEffect(() => {
    window.locusNotify = (title, body, kind = 'info', extras = {}) => {
      const notif = { title, body, kind, ...extras }
      add(notif)
      showAlertFor(notif)
    }
  }, [add, showAlertFor])

  // Poll for notifications every 15 minutes (configurable via env VITE_NOTIF_POLL_MS)
  useEffect(() => {
    let alive = true
    const defaultMs = import.meta.env.DEV ? 15 * 1000 : 15 * 60 * 1000
    const intervalMs = Number(import.meta.env.VITE_NOTIF_POLL_MS ?? defaultMs)
    let timer
    const known = new Set(items.map(i => i.id))

    const poll = async () => {
      try {
        const list = await fetchNotifications()
        if (!alive || !Array.isArray(list)) return
        // Add new notifications only
        let newest = null
        for (const n of list) {
          const id = n.id ?? `${n.title ?? 'n'}-${n.ts ?? ''}`
          if (!known.has(id)) {
            known.add(id)
            const notif = { ...n, id, ts: n.ts ?? Date.now(), read: false }
            add(notif)
            newest = newest ?? notif
          }
        }
        if (newest) {
          showAlertFor(newest)
        }
      } catch {
        // ignore polling errors
      } finally {
        timer = setTimeout(poll, intervalMs)
      }
    }

    // initial delayed poll
    timer = setTimeout(poll, 2000)
    return () => { alive = false; clearTimeout(timer) }
  }, [add, items, showAlertFor])

  // Optional demo notification after a short delay for quick testing
  useEffect(() => {
    const secs = Number(import.meta.env.VITE_NOTIF_DEMO_SECS ?? 0)
    if (!secs) return
    const t = setTimeout(() => {
      const demo = {
        id: 'demo-' + Date.now(),
        title: 'Demo: Azione disponibile',
        body: 'Questa è una notifica di prova con un\'azione rapida.',
        kind: 'info',
        actions: [
          { label: 'Apri Calendar', url: 'https://calendar.google.com' },
          { label: 'Apri Gmail', url: 'https://mail.google.com' }
        ],
        ts: Date.now(),
        read: false,
      }
      add(demo)
      showAlertFor(demo)
    }, secs * 1000)
    return () => clearTimeout(t)
  }, [add, showAlertFor])

  const value = {
    items,
    unreadCount,
    add,
    markRead,
    markAllRead,
    inboxOpen,
    toggleInbox,
    openInbox,
    closeInbox,
    alertItem,
    showAlertFor,
    closeAlert,
  }

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}
