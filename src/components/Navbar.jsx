import React from 'react'
import LocusLogo from '../icons/LocusLogo.jsx'
import { useNotifications } from '../notifications/NotificationsProvider.jsx'
import SettingsMenu from './SettingsMenu.jsx'

function IconButton({ label, children, onClick }) {
  return (
    <button
      className="h-9 w-9 grid place-items-center rounded-full text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 focus-ring"
      aria-label={label}
      title={label}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function UserIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function CogIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.33 1.82V22a2 2 0 0 1-4 0v-.18A1.65 1.65 0 0 0 9 20a1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1.82-.33H2a2 2 0 0 1 0-4h.18A1.65 1.65 0 0 0 4 9c.22-.38.31-.82.26-1.26a1.65 1.65 0 0 0-.6-1L3.6 6.7A2 2 0 1 1 6.43 3.9l.06.06c.5.5 1.17.74 1.82.6A1.65 1.65 0 0 0 9 4.6c.38-.22.82-.31 1.26-.26A1.65 1.65 0 0 0 11 4V3.82A2 2 0 0 1 15 3.82V4c0 .5.2.98.54 1.34.36.35.84.56 1.34.54.44-.04.88.04 1.26.26.38.22.68.52.9.9.22.38.31.82.26 1.26-.02.5.19.98.54 1.34.36.34.84.54 1.34.54H22a2 2 0 0 1 0 4h-.18c-.45 0-.88.2-1.26.54-.35.36-.56.84-.54 1.34.05.44-.04.88-.26 1.26-.22.38-.52.68-.9.9-.38.22-.82.31-1.26.26-.5-.02-.98.19-1.34.54A1.65 1.65 0 0 0 19.4 15z" />
    </svg>
  )
}

function BellIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

export default function Navbar() {
  const { unreadCount, toggleInbox } = useNotifications()
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const toggleSettings = () => setSettingsOpen(v => !v)
  const closeSettings = () => setSettingsOpen(false)
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeSettings() }
    if (settingsOpen) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [settingsOpen])
  return (
    <header className="sticky top-0 z-10 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-zinc-200">
      <nav className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Brand />

        <div className="flex items-center gap-1.5">
          <IconButton label="Profilo">
            <UserIcon className="h-5 w-5" />
          </IconButton>
          <div className="relative">
            <IconButton label="Impostazioni" onClick={toggleSettings}>
              <CogIcon className="h-5 w-5" />
            </IconButton>
            {settingsOpen && (
              <SettingsMenu variant="overlay" onClose={closeSettings} />
            )}
          </div>
          <div className="relative">
            <IconButton label="Notifiche" >
              <BellIcon className="h-5 w-5" onClick={toggleInbox} />
            </IconButton>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-semibold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}

function Brand() {
  const [imgError, setImgError] = React.useState(false)
  const logoSrc = React.useMemo(() => (
    import.meta?.env?.DEV ? `/locus-logo.png?t=${Date.now()}` : '/locus-logo.png'
  ), [])
  return (
    <div className="flex items-center gap-0">
      {!imgError ? (
        <img
          src={logoSrc}
          alt="Logo Locus AI"
          className="h-8 w-auto"
          onError={() => setImgError(true)}
        />
      ) : (
        <LocusLogo />
      )}
      <span className="text-2xl font-semibold tracking-tight text-zinc-900">ocus AI</span>
    </div>
  )
}
