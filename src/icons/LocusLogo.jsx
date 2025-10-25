import React from 'react'

// Green "L" logo as pure SVG (gradient + subtle shadow)
export default function LocusLogo(props) {
  const uid = React.useId()
  const gradId = `locus-grad-${uid}`
  const shadowId = `locus-shadow-${uid}`

  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable="false"
      {...props}
    >
      <defs>
        <linearGradient id={gradId} x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22C55E"/>
          <stop offset="100%" stopColor="#16A34A"/>
        </linearGradient>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.2"/>
        </filter>
      </defs>

      <g filter={`url(#${shadowId})`} fill={`url(#${gradId})`}>
        {/* vertical bar */}
        <rect x="14" y="6" width="16" height="52" rx="8" />
        {/* foot */}
        <rect x="14" y="44" width="36" height="14" rx="8" />
      </g>
    </svg>
  )
}
