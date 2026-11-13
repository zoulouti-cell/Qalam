import type { CSSProperties, ReactNode } from 'react'

type IconProps = {
  name?: string
  className?: string
  style?: CSSProperties
}

function drawing(name: string): ReactNode {
  switch (name) {
    case 'timeline': return <><path d="M3 18 9 11l6 3 6-9"/><circle cx="3" cy="18" r="1.5"/><circle cx="9" cy="11" r="1.5"/><circle cx="15" cy="14" r="1.5"/><circle cx="21" cy="5" r="1.5"/></>
    case 'home': return <><path d="m3.5 10 8.5-7 8.5 7"/><path d="M5.5 9v11h13V9M9.5 20v-6h5v6"/></>
    case 'route': return <><circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8.5 18h2a3 3 0 0 0 3-3v-6a3 3 0 0 1 3-3h1"/></>
    case 'travel_explore': return <><circle cx="10.5" cy="10.5" r="7"/><path d="M15.7 15.7 21 21M3.8 10.5h13.4M10.5 3.5c2 2 2.8 4.3 2.8 7s-.8 5-2.8 7M10.5 3.5c-2 2-2.8 4.3-2.8 7s.8 5 2.8 7"/></>
    case 'science': case 'atom': return <><circle cx="12" cy="12" r="1.5"/><ellipse cx="12" cy="12" rx="9" ry="4.2"/><ellipse cx="12" cy="12" rx="9" ry="4.2" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="4.2" transform="rotate(120 12 12)"/></>
    case 'library_books': case 'menu_book': case 'auto_stories': return <><path d="M3.5 5.5A3 3 0 0 1 6.5 3H11a3 3 0 0 1 3 3v15a3 3 0 0 0-3-3H6.5a3 3 0 0 0-3 1z"/><path d="M20.5 5.5A3 3 0 0 0 17.5 3H14v18a3 3 0 0 1 3-3h3.5zM6.5 7H10M6.5 10H10M16 7h2M16 10h2"/></>
    case 'smart_toy': return <><rect x="4" y="7" width="16" height="13" rx="4"/><path d="M12 3v4M9 13h.01M15 13h.01M9 17h6M2 12h2M20 12h2"/><circle cx="12" cy="3" r="1"/></>
    case 'auto_awesome': return <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1zM5 3l.7 1.8L7.5 5.5l-1.8.7L5 8l-.7-1.8-1.8-.7 1.8-.7z"/></>
    case 'edit_note': case 'ink_pen': return <><path d="m4 16.5 9.7-9.7a2.1 2.1 0 0 1 3 3L7 19.5l-4 1zM12.5 7.8l3 3M4 4h5M4 8h3"/></>
    case 'person': return <><circle cx="12" cy="8" r="3.5"/><path d="M5 21v-1.5a7 7 0 0 1 14 0V21z"/></>
    case 'water_drop': return <><path d="M12 2.8S5.5 10 5.5 14.2a6.5 6.5 0 0 0 13 0C18.5 10 12 2.8 12 2.8Z"/><path d="M9 15.5a3.2 3.2 0 0 0 3.2 3.2"/></>
    case 'child_care': return <><circle cx="12" cy="8" r="3"/><path d="M5 20a7 7 0 0 1 14 0M4 8c1.4-3.4 4.2-5 8-5s6.6 1.6 8 5"/><path d="M8 9h.01M16 9h.01"/></>
    case 'volume_up': return <><path d="M4 9v6h4l5 4V5L8 9zM17 9a5 5 0 0 1 0 6M19.5 6.5a8.5 8.5 0 0 1 0 11"/></>
    case 'volume_off': return <><path d="M4 9v6h4l5 4V5L8 9zM17 9l5 6M22 9l-5 6"/></>
    case 'search': return <><circle cx="10.8" cy="10.8" r="6.7"/><path d="m16 16 5 5"/></>
    case 'arrow_forward': case 'arrow_back': return name === 'arrow_back' ? <><path d="M19 12H5M11 6l-6 6 6 6"/></> : <><path d="M5 12h14M13 6l6 6-6 6"/></>
    case 'chevron_left': return <path d="m14.5 5-7 7 7 7"/>
    case 'expand_more': return <path d="m5 9 7 7 7-7"/>
    case 'expand_less': return <path d="m5 15 7-7 7 7"/>
    case 'close': return <path d="m6 6 12 12M18 6 6 18"/>
    case 'lightbulb': return <><path d="M9 18h6M10 21h4M8 14a6 6 0 1 1 8 0c-.8.7-1.2 1.4-1.3 2H9.3c-.1-.6-.5-1.3-1.3-2Z"/><path d="M12 1v2M3.5 4.5 5 6M20.5 4.5 19 6"/></>
    case 'refresh': case 'progress_activity': return <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.5 9a7 7 0 0 1 12-2L20 9M4 15l2.5 2a7 7 0 0 0 12-2"/></>
    case 'grid_view': case 'category': return <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></>
    case 'translate': case 'public': return <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9M12 3c-2.5 2.5-3.5 5.5-3.5 9s1 6.5 3.5 9"/></>
    case 'present_to_all': return <><rect x="3" y="4" width="18" height="13" rx="2"/><path d="m8 11 4-3 4 3M12 8v9M8 21h8"/></>
    case 'stop': return <rect x="6" y="6" width="12" height="12" rx="2"/>
    case 'forum': return <><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/></>
    case 'extension': return <><path d="M9 4a2.5 2.5 0 1 1 5 0v2h4a2 2 0 0 1 2 2v4h-2a2.5 2.5 0 1 0 0 5h2v1a2 2 0 0 1-2 2h-5v-2a2.5 2.5 0 1 0-5 0v2H6a2 2 0 0 1-2-2v-5h2a2.5 2.5 0 1 0 0-5H4V8a2 2 0 0 1 2-2h3z"/></>
    case 'view_in_ar': return <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9zM12 12 4 7.5M12 12l8-4.5M12 12v9"/></>
    case 'hub': return <><circle cx="12" cy="12" r="3"/><circle cx="5" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="m7 7 3 3m7-3-3 3m-7 7 3-3m7 3-3-3"/></>
    case 'monitoring': return <><path d="M3 19V5M3 19h18M6 15l4-4 3 2 6-7"/><path d="M16 6h3v3"/></>
    case 'blur_on': return <><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></>
    case 'sunny': return <><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12m9.9 9.9 2.12 2.12M2 12h3m14 0h3M4.93 19.07l2.12-2.12m9.9-9.9 2.12-2.12"/></>
    case 'dark_mode': return <><path d="M20 15.2A8.4 8.4 0 0 1 8.8 4 8.5 8.5 0 1 0 20 15.2Z"/><path d="M16.5 4.5h.01M19.5 7.5h.01"/></>
    case 'telescope': return <><path d="m4 7 11-4 3 8-11 4zM9 13l4 8M6 21h12M15 5l2 6M3 17l5-2"/></>
    case 'cloud': return <><path d="M7 18h10a4 4 0 0 0 .4-8A6 6 0 0 0 6 9a4.5 4.5 0 0 0 1 9Z"/><path d="M8 21v-2M12 21v-2M16 21v-2"/></>
    case 'terrain': return <><path d="m2 20 7-12 4 6 3-4 6 10z"/><path d="m7 12 2 2 2-1M14 13l2 2 2-1"/></>
    case 'monitor_heart': return <><rect x="3" y="4" width="18" height="15" rx="2"/><path d="M7 12h3l2-4 3 8 2-4h2M9 22h6"/></>
    case 'medical_services': return <><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M9 7V4h6v3M12 10v8M8 14h8"/></>
    case 'accessibility_new': return <><circle cx="12" cy="4" r="2"/><path d="m8 9 4-2 4 2 3 4M8 9l-2 5 5 2 2 5M15 12l-2 4 4 2 2 3"/></>
    case 'biotech': return <><path d="M7 3c10 4 10 14 0 18M17 3C7 7 7 17 17 21M8 6h8M6.5 10h11M6.5 14h11M8 18h8"/></>
    case 'eco': return <><path d="M20 4C11 4 5 7 5 13a5 5 0 0 0 5 5c6 0 9-6 10-14Z"/><path d="M4 21c2-5 6-8 12-11"/></>
    case 'functions': return <><path d="M19 4H9l-2 6h9M7 10l-3 10M14 10l-3 10M5 15h9"/></>
    case 'experiment': return <><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M8 15h8"/><circle cx="10" cy="17" r=".7" fill="currentColor"/><circle cx="14" cy="18" r=".7" fill="currentColor"/></>
    case 'commute': return <><path d="M5 4h14v12H5zM8 16l-2 4M16 16l2 4M7 8h10M7 12h10"/><circle cx="8" cy="18" r="1"/><circle cx="16" cy="18" r="1"/></>
    case 'handshake': return <><path d="m3 11 4-4 4 1 2-1 4 1 4 4-3 3-3-2-3 3-3-2-2 2-4-5Z"/><path d="m7 7 3-3 4 1 3-1 3 3M9 13l4 3M12 11l4 3"/></>
    case 'military_tech': return <><circle cx="12" cy="8" r="5"/><path d="m9 13-2 8 5-3 5 3-2-8M10 8l1.3 1.3L14 6.5"/></>
    case 'sports_score': return <><path d="M4 4h16v16H4zM4 12h16M12 4v16"/><path d="m4 4 8 8 8-8M4 20l8-8 8 8"/></>
    case 'payments': return <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18M7 14h4M16 14h1"/></>
    case 'palette': return <><path d="M12 3a9 9 0 1 0 0 18h1.3a2.2 2.2 0 0 0 1.5-3.8 1.7 1.7 0 0 1 1.2-2.9H18a3 3 0 0 0 3-3c0-4.6-4-8.3-9-8.3Z"/><circle cx="7.5" cy="11" r=".8"/><circle cx="10" cy="7.5" r=".8"/><circle cx="15" cy="8" r=".8"/></>
    case 'quiz': return <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.6 2.6 0 1 1 4.7 1.5c-1.1 1.1-2.2 1.3-2.2 3M12 17.5h.01"/></>
    case 'flag': return <><path d="M5 21V4M5 5c5-4 9 4 14 0v10c-5 4-9-4-14 0"/></>
    case 'fact_check': return <><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5h6M8.5 10l1.5 1.5 3-3M8.5 16H16"/></>
    case 'emoji_events': return <><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 13v5M8 21h8M9 18h6"/></>
    case 'pause': return <><path d="M8 5v14M16 5v14"/></>
    case 'play_arrow': return <path d="m8 5 11 7-11 7z"/>
    case 'open_in_new': return <><path d="M13 5h6v6M19 5l-9 9"/><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/></>
    case 'graphic_eq': return <><path d="M4 10v4M8 6v12M12 3v18M16 7v10M20 10v4"/></>
    case 'mic': return <><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6"/></>
    case 'hearing': return <><path d="M5 12V9a7 7 0 0 1 14 0c0 4-3 5-4 7-1 2-1 4-3 4s-3-1-3-3"/><path d="M9 11a3 3 0 0 1 6 0c0 2-2 2-2 4"/></>
    case 'settings': return <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.3 1-1.3 2.3-1.6-.6a8 8 0 0 1-1.7 1l-.3 1.7h-2.7l-.3-1.7a8 8 0 0 1-1.7-1l-1.6.6-1.3-2.3 1.3-1a8 8 0 0 1 0-2l-1.3-1 1.3-2.3 1.6.6a8 8 0 0 1 1.7-1l.3-1.7h2.7l.3 1.7a8 8 0 0 1 1.7 1l1.6-.6 1.3 2.3-1.3 1a8 8 0 0 1-.1 2Z"/></>
    case 'account_balance': return <><path d="m3 8 9-5 9 5M4 9h16M5 9v10M9.5 9v10M14.5 9v10M19 9v10M3 20h18"/></>
    case 'history_edu': return <><path d="M4 5h16v14H4zM8 9h7M8 12h4M8 15h3"/><path d="m16 15 3-3 2 2-3 3-3 1z"/><path d="M2.5 8v9M6 21h12"/></>
    case 'gavel': return <><path d="m14 5 5 5M11 8l5-5 6 6-5 5zM3 21l11-11M4 15l5 5M2 21h10"/></>
    case 'rocket_launch': return <><path d="M14 5c2-2 4.5-2.5 6-2-.5 1.5-1 4-3 6l-5 5-4-4zM8 10l-4 1-1 4 5-1M14 16l-1 4 4 1 1-5"/><circle cx="15.5" cy="7.5" r="1"/><path d="m5 19 3-3M4 20l2-1-1-1z"/></>
    case 'mosque': return <><path d="M4 20V11h16v9M3 21h18M7 11a5 5 0 0 1 10 0M12 3v3M6 7V4M18 7V4M9 20v-5h6v5"/></>
    case 'memory': return <><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4M10 10h4v4h-4z"/></>
    case 'psychology': return <><path d="M12 4a4 4 0 0 0-7 2 4 4 0 0 0-1 7 4 4 0 0 0 3 6h5zM12 4a4 4 0 0 1 7 2 4 4 0 0 1 1 7 4 4 0 0 1-3 6h-5"/><path d="M8 9a2 2 0 0 1 2 2M16 9a2 2 0 0 0-2 2M8 15h2M16 15h-2"/></>
    case 'groups': return <><circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 20v-1a6 6 0 0 1 12 0v1M15 16a5 5 0 0 1 6 4"/></>
    case 'explore': return <><circle cx="12" cy="12" r="9"/><path d="m15.8 8.2-2.2 5.4-5.4 2.2 2.2-5.4z"/></>
    case 'download': return <><path d="M12 3v12M7 10l5 5 5-5M4 19v2h16v-2"/></>
    case 'school': return <><path d="m2.5 9 9.5-5 9.5 5-9.5 5zM6 11v5c3.5 2.8 8.5 2.8 12 0v-5M21.5 9v7"/></>
    case 'tune': return <><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></>
    default: return <><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="8"/></>
  }
}

export default function Mi({ name = 'auto_awesome', className = '', style }: IconProps) {
  return (
    <svg
      className={`mi ${className}`.trim()}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {drawing(name)}
    </svg>
  )
}
