import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { NotificationsProvider } from './notifications/NotificationsProvider.jsx'
import { SettingsProvider } from './settings/SettingsProvider.jsx'

const container = document.getElementById('root')
const root = createRoot(container)
root.render(
  <React.StrictMode>
    <SettingsProvider>
      <NotificationsProvider>
        <App />
      </NotificationsProvider>
    </SettingsProvider>
  </React.StrictMode>
)
