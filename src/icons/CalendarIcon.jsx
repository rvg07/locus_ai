import React from 'react'

export default function CalendarIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <rect x="7" y="14" width="3" height="3" rx=".5" />
      <rect x="12" y="14" width="3" height="3" rx=".5" />
    </svg>
  )
}

