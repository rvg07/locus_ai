export async function postChatMessage(message, { history = [], signal } = {}) {
  const url = import.meta.env.VITE_CHAT_API_URL || '/api/chat'
  const apiKey = import.meta.env.VITE_CHAT_API_KEY

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({ message, history }),
    signal,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
  }

  const data = await res.json().catch(() => ({}))
  // Expecting shape: { reply: string }
  if (typeof data.reply !== 'string') {
    throw new Error('Invalid API response: missing reply')
  }
  return data.reply
}

export async function fetchNotifications({ signal } = {}) {
  const url = import.meta.env.VITE_NOTIF_API_URL || '/api/notifications'
  const apiKey = import.meta.env.VITE_CHAT_API_KEY
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    signal,
  })
  if (!res.ok) {
    // Fail silently; polling should not crash app
    return []
  }
  const data = await res.json().catch(() => [])
  // Expect array of { id, title, body, kind, ts }
  if (!Array.isArray(data)) return []
  return data
}
