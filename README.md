# Locus AI

Interfaccia semplice (stile ChatGPT) pensata per un hackathon sulla neurodivergenza. Tech stack: React + Vite + Tailwind CSS.

## Requisiti

- Node.js 18+

## Setup

1. Installa le dipendenze:

   ```bash
   npm install
   ```

2. Avvia in sviluppo:

   ```bash
   npm run dev
   ```

3. Apri il browser sull'URL mostrato da Vite (es. http://localhost:5173).

### Logo personalizzato

- Metti il tuo PNG in `public/locus-logo.png`.
- La navbar lo mostrerà automaticamente; se il file manca, viene usato un logo SVG di fallback.

## Build

```bash
npm run build
npm run preview
```

## Note di design

- Navbar con icona app a sinistra e avatar utente a destra.
- Nel contenuto principale: titolo "Locus AI", etichetta + textarea per parlare con l'LLM, 3 pulsanti grandi per Gmail, Google Chat e Google Calendar (icone minimal integrate).
- Palette scura non pesante (zinc/blue), alti contrasti e focus ring ben visibile per accessibilità.

## In‑App Inbox / Notifiche

- Il Bell nella navbar apre un pannello inbox vetroso con blur e ombre.
- Stato centralizzato in `src/notifications/NotificationsProvider.jsx` (persistenza in `localStorage`).
- API disponibili via hook `useNotifications()`:
  - `add({ title, body, kind })`
  - `markRead(id)`, `markAllRead()`
  - `unreadCount`, `openInbox()`, `closeInbox()`, `toggleInbox()`
- Test rapido: in console, chiama `window.locusNotify('Titolo', 'Messaggio', 'chat')`.

### Integrazione con provider (es. SuprSend)

1. Inizializza l’SDK del provider al login dell’utente (userId + apiKey/identifier).
2. Sottoscrivi gli eventi/stream di in‑app messages e, per ogni notifica ricevuta, chiama `add({ title, body, kind, id, ts })`.
3. Quando l’utente apre/legge una notifica, invia l’ack al provider (map a `markRead`).
4. In `NotificationsProvider` puoi sostituire il seed e la persistenza con il fetch iniziale delle notifiche.

Componenti principali:
- Pannello inbox: `src/components/InboxPanel.jsx`
- Badge su campanella: `src/components/Navbar.jsx`
- Polling automatico (15 min) + alert:
  - Config endpoint: `VITE_NOTIF_API_URL` (GET, risponde con array di `{ id, title, body, kind, ts }`)
  - Intervallo (ms) opzionale: `VITE_NOTIF_POLL_MS` (default 900000; in dev default 15000 per test)
  - Implementazione polling: `src/notifications/NotificationsProvider.jsx`
  - Modale alert per nuova notifica: `src/components/NotificationAlert.jsx`
  - Azioni nei messaggi: supporta `actionUrl`/`actionLabel` o `actions: [{label,url}]` (massimo 3 mostrati).

Demo rapida (senza backend):
- In console: `window.locusNotify('Nuovo evento', 'Clicca per aprire', 'info', { actionUrl: 'https://calendar.google.com', actionLabel: 'Apri Calendar' })`
- Oppure imposta in `.env.local`: `VITE_NOTIF_DEMO_SECS=5` per mostrare un alert demo dopo 5s all’avvio.

## Integrazione LLM / API

- La chat chiama un endpoint HTTP POST configurabile via env:
  - `VITE_CHAT_API_URL` (default `/api/chat`)
  - `VITE_CHAT_API_KEY` (opzionale, inviato come `Authorization: Bearer <key>`)
- Client: `src/lib/api.js` (funzione `postChatMessage(message, { history })`)
- Vista chat: `src/components/ChatView.jsx` — invia il messaggio e mostra la risposta. In caso di errore visualizza un messaggio di fallback.
- Esempio di payload inviato:
  `{ "message": "Ciao", "history": [{"role":"user","content":"..."}] }`

Imposta un file `.env.local` nella root del progetto, ad esempio:

```
VITE_CHAT_API_URL=https://tuo-backend.example.com/api/chat
VITE_CHAT_API_KEY=sk_...
```
