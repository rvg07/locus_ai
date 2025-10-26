import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchNotifications } from '../lib/api.js'

const NotificationsContext = createContext(null)

const seed = () => ([
  {
    id: 'n0',
    title: 'Email importante da Matteo',
    body: 'Oggetto: Agile sull`Hackaton.',
    ts: Date.now() - 1000 * 60 * 60,
    read: false,
    kind: 'mail',
  },
  {
    id: 'n1',
    title: 'Nuovo commento su Calendar',
    body: 'Stefano ha aggiunto un commento all’evento di venerdì.',
    ts: Date.now() - 1000 * 60 * 10,
    read: false,
    kind: 'calendar',
  },
  {
    id: 'n2',
    title: 'Email importante',
    body: 'Oggetto: Hackaton AI & Neurodivergenza - in attesa della tua revisione.',
    ts: Date.now() - 1000 * 60 * 60,
    read: false,
    kind: 'mail',
  },
  {
    id: 'n3',
    title: 'Nuovo messaggio in Chat',
    body: 'James: “Puoi effettuare il pull su git della nuova funzione?”',
    ts: Date.now() - 1000 * 60 * 120,
    read: false,
    kind: 'chat',
  },
  {
    id: 'n4',
    title: 'Nuovo messaggio in Chat',
    body: 'Edoardo: “Ho concluso l`addestramento del modello AI!!!”',
    ts: Date.now() - 1000 * 60 * 120,
    read: false,
    kind: 'chat',
  },
])

// Bump this to forzare il refresh delle notifiche seed nel localStorage
const SEED_VERSION = '3'

export function NotificationsProvider({ children }) {
  const [inboxOpen, setInboxOpen] = useState(false)
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem('locus.notifications')
      const savedVersion = localStorage.getItem('locus.notifications.version')
      if (!raw || savedVersion !== SEED_VERSION) {
        // Reset alle seed quando cambia la versione
        localStorage.setItem('locus.notifications.version', SEED_VERSION)
        return seed()
      }
      return JSON.parse(raw)
    } catch { return seed() }
  })

  useEffect(() => {
    try {
      localStorage.setItem('locus.notifications', JSON.stringify(items))
      localStorage.setItem('locus.notifications.version', SEED_VERSION)
    } catch {}
  }, [items])

  // Ensure seed updates apply even during HMR without full reload
  useEffect(() => {
    try {
      const savedVersion = localStorage.getItem('locus.notifications.version')
      if (savedVersion !== SEED_VERSION) {
        const fresh = seed()
        setItems(fresh)
        localStorage.setItem('locus.notifications', JSON.stringify(fresh))
        localStorage.setItem('locus.notifications.version', SEED_VERSION)
      }
    } catch {}
  }, [])

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
  const planShownRef = React.useRef(false)

  // Remove a notification entirely
  const removeNotification = useCallback((id) => {
    setItems(prev => prev.filter(i => i.id !== id))
    setAlertItem(curr => (curr && curr.id === id ? null : curr))
  }, [])

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

  // Demo notification disabled per request
  useEffect(() => {
    const secs = 0
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

  // Inject a "Piano d'azione" alert with long, scrollable content
  // Always shows on load; avoids duplicate list entries if it already exists.
  useEffect(() => {
    try {
      if (planShownRef.current) return
      const existing = items.find(i => i.id === 'daily-plan-alert')
      const body = `**Piano d'azione per oggi  

La tua giornata presenta un unico evento impegnativo: un **meeting di categoria "meeting" alle 14:30 con carico medio**. Poiché non hai task ad alta priorità da completare, puoi concentrarti su una gestione equilibrata del tempo, sfruttando le tue ore di massima produttività (9:00-12:00) per attività strutturate e riservando flessibilità per il resto della giornata.  

**Strategia per ottimizzare il carico cognitivo:**  
1. **Periodo 9:00-12:00**: Dedica le tue ore più produttive a compiti che richiedono focus, come la preparazione per il meeting alle 14:30 o qualsiasi attività strutturata che preferisci affrontare in modo mirato. Questo ti permetterà di avviare la giornata con senso di controllo.  
2. **Dopo il meeting (14:30)**: Segui la tua abitudine di inserire una **breve pausa (5-10 minuti)** per ricaricare l'attenzione, specialmente se il meeting sarà particolarmente lungo o interattivo.  
3. **Pomeriggio**: Sfrutta il resto della giornata per attività leggere (es. risposte di routine, organizzazione) o per fare una pausa rigenerante, mantenendo un ritmo rilassato.  

**Notifica chiave:**  
- Non ci sono eventi a carico "alto" consecutivi, quindi non è necessario intercalare pause strategiche. Tuttavia, attenersi alla breve pausa dopo il meeting ti aiuterà a preservare l'energia mentale.  

**Suggerimento aggiuntivo:**  
Se il meeting richiederà preparazione, anticipa i dettagli di discussione entro il periodo 9:00-12:00. Questo ti eviterà di accumulare cognitivamente carico residuo nel pomeriggio.  

**Conclusione:**  
La tua giornata sembra gestibile grazie all'unico evento di medio carico. Usa le tue ore di massima concentrazione per pianificare con ordine, concediti la pausa dopo il meeting e lascia il resto del pomeriggio per attività di bassa intensità. Fidati delle tue abitudini: hai costruito un ritmo che ti permette di bilanciare efficienza e benessere. Sebbene non ci siano compiti urgenti, ricorda che anche il semplice fatto di mantenere un'agenda chiara riduce lo stress. Hai scelto di dare priorità alla chiarezza mentale — oggi puoi navigare la giornata con fiducia.  

**Incentivo personale:**  
Oggi non è un giorno pieno di richieste complesse, quindi goditi il momento di struttura senza sentirne il peso. La tua capacità di prevedere e organizzare ti renderà più disponibile per rispondere a eventuali imprevisti con serenità.`

      const notif = existing || {
        id: 'daily-plan-alert',
        title: "Piano d'azione per oggi",
        body: `**Piano d'azione per oggi**  

La tua giornata richiede una gestione strategica per evitare sovraccarico. Ecco un piano strutturato per ottimizzare la produttività e il recupero:  

---

### **Mattina: Focalizzati su task ad alta priorità**  
- **09:00–11:00**: Dedica il tuo periodo più produttivo (09:00–12:00) alle **dimostrazioni per il cliente Oracle** e alla **preparazione delle slide per l’Hackathon 2025**. Inizia con le attività che richiedono creatività e attenzione, come la struttura del pitch e il contenuto delle slide.  
- **11:00–12:00**: Continua con la **prova tecnica delle presentazioni** (11:15) e la **discussione del budget Q8/Q5** (09:00–11:00). Se i meeting consecutivi ti sembrano pesanti, fai una breve pausa di 5–10 minuti tra una discussione e l’altra per ricaricare.  

---

### **Mezzogiorno: Strizza un occhio al recupero**  
- **12:00–13:00**: Pranzo e pausa obbligata. Usa il pranzo per staccare mentalmente. Se hai tempo extra, riguarda velocemente i punti chiave delle slide o della demo per fissarli in mente.  

---

### **Pomeriggio: Gestisci i meeting e integra pause**  
- **12:30–13:00**: I meeting consecutivi sui budget (Q25, Q4, Q10) potrebbero essere faticosi. **Dedica 5 minuti di pausa tra l’ultimo meeting del pranzo (12:30) e il primo dell’ora di cena (13:00)** per respirare e riorganizzare le priorità.  
- **13:00–14:00**: Concentrati sui meeting che richiedono interazione diretta (es. preparazione del pitch) e sulla **prova tecnica finale** (13:15). Se ti senti rallentare, chiedi di anticipare di 10 minuti la prossima attività per guadagnare spazio.  
- **14:00–15:00**: Se hai completato le slide e le demo, dedica questo slot a rispondere a email o a rivedere i punti critici dell’Hackathon. Se i meeting ti stanno esaurendo, fai una pausa di 10 minuti prima dell’incontro su Q10 alle 15:00.  

---

### **Fine giornata: Chiudi con ordine**  
- **15:00–16:00**: Valuta i feedback dal focus group e organizza il lavoro da completare a casa (es. ultimare le slide).  
- **16:30–17:00**: Dedicati all’annuncio dei finalisti. Se hai energia, usa il tempo per un breve resoconto su cosa hai concluso oggi.  

---

### **Consigli chiave**  
1. **Ottimizza il focus**: Se i meeting ti distraggono, blocca 15 minuti al mattino e 15 al pomeriggio per avanzare su task critici (es. Oracle demo).  
2. **Pausa obbligata**: Tra i meeting 12:30–13:00, prendi 5 minuti di camminata o di stretching.  
3. **Priorità alle slide**: Se rimani indietro, concentra energia sull’Hackathon 2025_v1, poiché hanno tag “urgentemente”.  

---

**Ricorda**: La tua energia si rigenera quando sei consapevole del tuo ritmo. Ogni task completato ti avvicina al successo. Ce la farai, un passo alla volta. 💪`,
        kind: 'calendar',
        ts: Date.now(),
        read: false,
      }
      if (!existing) {
        add(notif)
      } else {
        setItems(prev => prev.map(i => i.id === 'daily-plan-alert' ? {
          ...i,
          body: `**Piano d'azione per oggi**  

La tua giornata richiede una gestione strategica per evitare sovraccarico. Ecco un piano strutturato per ottimizzare la produttività e il recupero:  

---

### **Mattina: Focalizzati su task ad alta priorità**  
- **09:00–11:00**: Dedica il tuo periodo più produttivo (09:00–12:00) alle **dimostrazioni per il cliente Oracle** e alla **preparazione delle slide per l’Hackathon 2025**. Inizia con le attività che richiedono creatività e attenzione, come la struttura del pitch e il contenuto delle slide.  
- **11:00–12:00**: Continua con la **prova tecnica delle presentazioni** (11:15) e la **discussione del budget Q8/Q5** (09:00–11:00). Se i meeting consecutivi ti sembrano pesanti, fai una breve pausa di 5–10 minuti tra una discussione e l’altra per ricaricare.  

---

### **Mezzogiorno: Strizza un occhio al recupero**  
- **12:00–13:00**: Pranzo e pausa obbligata. Usa il pranzo per staccare mentalmente. Se hai tempo extra, riguarda velocemente i punti chiave delle slide o della demo per fissarli in mente.  

---

### **Pomeriggio: Gestisci i meeting e integra pause**  
- **12:30–13:00**: I meeting consecutivi sui budget (Q25, Q4, Q10) potrebbero essere faticosi. **Dedica 5 minuti di pausa tra l’ultimo meeting del pranzo (12:30) e il primo dell’ora di cena (13:00)** per respirare e riorganizzare le priorità.  
- **13:00–14:00**: Concentrati sui meeting che richiedono interazione diretta (es. preparazione del pitch) e sulla **prova tecnica finale** (13:15). Se ti senti rallentare, chiedi di anticipare di 10 minuti la prossima attività per guadagnare spazio.  
- **14:00–15:00**: Se hai completato le slide e le demo, dedica questo slot a rispondere a email o a rivedere i punti critici dell’Hackathon. Se i meeting ti stanno esaurendo, fai una pausa di 10 minuti prima dell’incontro su Q10 alle 15:00.  

---

### **Fine giornata: Chiudi con ordine**  
- **15:00–16:00**: Valuta i feedback dal focus group e organizza il lavoro da completare a casa (es. ultimare le slide).  
- **16:30–17:00**: Dedicati all’annuncio dei finalisti. Se hai energia, usa il tempo per un breve resoconto su cosa hai concluso oggi.  

---

### **Consigli chiave**  
1. **Ottimizza il focus**: Se i meeting ti distraggono, blocca 15 minuti al mattino e 15 al pomeriggio per avanzare su task critici (es. Oracle demo).  
2. **Pausa obbligata**: Tra i meeting 12:30–13:00, prendi 5 minuti di camminata o di stretching.  
3. **Priorità alle slide**: Se rimani indietro, concentra energia sull’Hackathon 2025_v1, poiché hanno tag “urgentemente”.  

---

**Ricorda**: La tua energia si rigenera quando sei consapevole del tuo ritmo. Ogni task completato ti avvicina al successo. Ce la farai, un passo alla volta. 💪`,
        } : i))
      }
      // Delay a tick to ensure the portal is mounted
      setTimeout(() => showAlertFor(notif), 50)
      planShownRef.current = true
    } catch {}
  }, [items, add, showAlertFor])

  const value = {
    items,
    unreadCount,
    add,
    markRead,
    markAllRead,
    removeNotification,
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
