import React, { useState } from 'react'
import Navbar from './components/Navbar.jsx'
import SearchBar from './components/SearchBar.jsx'
import Suggestions from './components/Suggestions.jsx'
import ActionButton from './components/ActionButton.jsx'
import MailIcon from './icons/MailIcon.jsx'
import ChatIcon from './icons/ChatIcon.jsx'
import CalendarIcon from './icons/CalendarIcon.jsx'
import InboxPanel from './components/InboxPanel.jsx'
import ChatView from './components/ChatView.jsx'
import SupportButton from './components/SupportButton.jsx'
import NotificationAlert from './components/NotificationAlert.jsx'

export default function App() {
  const [message, setMessage] = useState('')
  const [chatOpen, setChatOpen] = useState(false)
  const [chatInitialMessage, setChatInitialMessage] = useState('')

  const send = (text) => {
    const content = (text ?? message).trim()
    if (!content) return
    setChatInitialMessage(content)
    setChatOpen(true)
    setMessage('')
  }

  const handleSubmit = (e) => {
    try { e?.preventDefault?.() } catch {}
    send()
  }

  const suggestions = [
    'Riassumi le email di oggi',
    'Pianifica una riunione domani alle 10',
    'Scrivi a Marta su Google Chat'
  ]

  return (
    <div className="min-h-full flex flex-col">
      <Navbar />
      <InboxPanel />
      <NotificationAlert />

      <main className="flex-1">
        {chatOpen ? (
          <ChatView initialMessage={chatInitialMessage} />
        ) : (
          <div className="mx-auto max-w-5xl px-4 pt-28 sm:pt-44 pb-16 sm:pb-20">
            <p className="text-center text-lg sm:text-2xl font-medium text-zinc-600 mb-8 sm:mb-12">
              Il tuo partner affianco a te!
            </p>
            <SearchBar
              value={message}
              onChange={setMessage}
              onSubmit={handleSubmit}
            />

            <section className="mt-10 sm:mt-12">
              <h2 className="sr-only">Azioni rapide</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ActionButton
                  icon={MailIcon}
                  label="Email"
                  tone="red"
                  onClick={() => window.open('https://mail.google.com', '_blank', 'noopener')}
                />
                <ActionButton
                  icon={ChatIcon}
                  label="Chat"
                  tone="green"
                  onClick={() => window.open('https://chat.google.com', '_blank', 'noopener')}
                />
                <ActionButton
                  icon={CalendarIcon}
                  label="Calendar"
                  tone="blue"
                  onClick={() => window.open('https://calendar.google.com', '_blank', 'noopener')}
                />
              </div>
            </section>

            <Suggestions items={suggestions} onPick={send} />
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-500">
        Progetto per hackaton: interfaccia semplice e accessibile.
      </footer>
      <SupportButton />
    </div>
  )
}
