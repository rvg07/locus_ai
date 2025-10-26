import React, { useEffect, useRef, useState } from 'react'
import { postChatMessage } from '../lib/api.js'

function UserBubble({ children }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-blue-600 text-white shadow-lg px-4 py-3 text-sm">
        {children}
      </div>
    </div>
  )
}

function AssistantBubble({ children }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-white/60 ring-1 ring-inset ring-white/40 bg-white/60 supports-[backdrop-filter]:bg-white/50 backdrop-blur-md backdrop-saturate-150 shadow-lg px-4 py-3 text-sm text-zinc-800">
        {children}
      </div>
    </div>
  )
}

export default function ChatView({ initialMessage, onExit }) {
  const [messages, setMessages] = useState(() => (
    initialMessage ? [{ role: 'user', content: initialMessage }] : []
  ))
  const [input, setInput] = useState('')
  const listRef = useRef(null)
  const [typing, setTyping] = useState(false)
  const [pending, setPending] = useState(false)
  const [inputBarSpace, setInputBarSpace] = useState(0)
  const inputBarRef = useRef(null)
  const isEmpty = messages.length === 0 && !typing

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages.length, typing])

  // On each user message, call API for assistant reply
  useEffect(() => {
    const last = messages[messages.length - 1]
    if (!last || last.role !== 'user') return
    let abort = new AbortController()
    const run = async () => {
      try {
        setTyping(true)
        setPending(true)
        const history = messages
        const reply = await postChatMessage(last.content, { history, signal: abort.signal })
        setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      } catch (err) {
        if (abort.signal.aborted) return
        setMessages(prev => [...prev, { role: 'assistant', content: `Si è verificato un errore: ${err.message}` }])
      } finally {
        setTyping(false)
        setPending(false)
      }
    }
    run()
    return () => abort.abort()
  }, [messages])

  // Measure sticky input bar height so the empty-state can sit just above it
  useEffect(() => {
    const measure = () => {
      const h = inputBarRef?.current ? Math.ceil(inputBarRef.current.getBoundingClientRect().height) : 0
      setInputBarSpace(h)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const send = (text) => {
    const content = (text ?? input).trim()
    if (!content) return
    if (pending) return
    setMessages(prev => [...prev, { role: 'user', content }])
    setInput('')
  }

  const handleSubmit = (e) => { e.preventDefault(); send() }

  return (
    <section className="flex-1 flex flex-col">
      <div ref={listRef} className="flex-1 overflow-y-auto px-4">
        <div
          className="mx-auto max-w-3xl min-h-full flex flex-col justify-end pt-6"
          style={{ paddingBottom: inputBarSpace }}
        >
          <div className="space-y-4">
          {isEmpty && (
            <div className="text-center text-zinc-500 text-sm">Inizia una conversazione per vedere i messaggi qui.</div>
          )}
          {messages.map((m, idx) => (
            <div key={idx}>
              {m.role === 'user' ? (
                <UserBubble>{m.content}</UserBubble>
              ) : (
                <AssistantBubble>{m.content}</AssistantBubble>
              )}
            </div>
          ))}
          {typing && (
            <div>
              <AssistantBubble>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce" />
                  <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
                </div>
              </AssistantBubble>
            </div>
          )}
          {/* Footer spacer removed (footer no longer present) */}
          </div>
        </div>
      </div>

      <form ref={inputBarRef} onSubmit={handleSubmit} className="fixed bottom-0 inset-x-0 z-30 bg-gradient-to-t from-white/80 to-white/20 pt-0 pb-0 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="w-full flex items-center gap-2 rounded-full bg-white/60 supports-[backdrop-filter]:bg-white/50 backdrop-blur-md backdrop-saturate-150 border border-white/60 ring-1 ring-inset ring-white/40 shadow-lg px-5 py-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Scrivi un messaggio..."
              className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-zinc-400"
            />
            <button type="submit" disabled={pending} className="h-9 px-4 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus-ring">
              {pending ? 'Invio...' : 'Invia'}
            </button>
          </div>
        </div>
      </form>
    </section>
  )
}
