import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const SettingsContext = createContext(null)

const DEFAULTS = {
  language: 'it',
  productive_hours_start: '09:00',
  productive_hours_end: '17:00',
  focus_block_duration: 25,
  pause_after_meetings: false,
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem('locus.settings')
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS
    } catch {
      return DEFAULTS
    }
  })

  useEffect(() => {
    try { localStorage.setItem('locus.settings', JSON.stringify(settings)) } catch {}
  }, [settings])

  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }))
  const reset = () => setSettings(DEFAULTS)

  const value = useMemo(() => ({ settings, update, reset, DEFAULTS }), [settings])

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
