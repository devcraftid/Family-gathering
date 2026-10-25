/**
 * SVG Icons Library for Family Gathering Kampoeng Waringin
 * Clean, consistent, modern Lucide-style vector icons & HD Bus and CS Headset icons.
 */
const ICONS = {
  // Headset Agent Icon (Hubungi Admin - exact match to requested icon)
  cs: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 100 100" fill="currentColor">
    <defs>
      <mask id="csIconMask">
        <rect width="100" height="100" fill="white"/>
        <path d="M 72 43 C 72 54 66 58 54 58 L 50 58 C 46 58 44 54 44 51 C 44 47 46 44 50 44 L 56 44 C 63 44 67 40 67 36" fill="none" stroke="black" stroke-width="5" stroke-linecap="round"/>
        <rect x="47" y="47" width="14" height="10" rx="5" fill="black"/>
        <path d="M 32 55 C 32 66 40 70 50 70 C 60 70 68 66 68 55 Z" fill="black"/>
      </mask>
    </defs>
    <!-- Headband -->
    <path d="M 28 38 C 28 20 38 9 50 9 C 62 9 72 20 72 38" fill="none" stroke="currentColor" stroke-width="6.5" stroke-linecap="round"/>
    <!-- Earcups -->
    <rect x="21" y="29" width="9" height="17" rx="4.5"/>
    <rect x="70" y="29" width="9" height="17" rx="4.5"/>
    <!-- Head with Negative Space Mask -->
    <circle cx="50" cy="35" r="19" mask="url(#csIconMask)"/>
    <!-- Mic Boom & Capsule -->
    <path d="M 72 43 C 72 52 66 55 56 55 L 53 55" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <rect x="49" y="52" width="9" height="6" rx="3"/>
    <!-- Bust / Shoulders -->
    <path d="M 11 82 C 11 63 25 54 37 52.5 C 41 60 45 63 50 63 C 55 63 59 60 63 52.5 C 75 54 89 63 89 82 Z"/>
  </svg>`,

  // HD Luxury Tour Bus (Bus Pariwisata High Decker HD)
  bus: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 100 100" fill="currentColor">
    <!-- Spion Tanduk (Side Mirrors) -->
    <path d="M18 24 C11 20 8 28 12 36 C14 40 17 41 18 39 L18 34 C16 34 14 31 15 28 C16 25 18 26 21 27 L21 24 Z" />
    <path d="M82 24 C89 20 92 28 88 36 C86 40 83 41 82 39 L82 34 C84 34 86 31 85 28 C84 25 82 26 79 27 L79 24 Z" />
    <!-- Bus Body High Decker -->
    <path d="M25 14 C25 10 29 8 34 8 L66 8 C71 8 75 10 75 14 L77 74 C77 78 74 80 70 80 L30 80 C26 80 23 78 23 74 Z" />
    <!-- AC Roof Pod -->
    <rect x="36" y="5.5" width="28" height="3.5" rx="1.7" fill="currentColor" opacity="0.85" />
    <!-- Upper Panoramic Windshield HD -->
    <path d="M28 15.5 C28 14 29.5 12.5 33 12.5 L67 12.5 C70.5 12.5 72 14 72 15.5 L72.5 30 L27.5 30 Z" fill="#ffffff" opacity="0.95" />
    <!-- Bando Divider with Gold Accent -->
    <rect x="26" y="31" width="48" height="4.5" rx="1.5" fill="currentColor" />
    <rect x="38" y="32.5" width="24" height="1.8" rx="0.9" fill="#e9b85b" />
    <!-- Lower Windshield -->
    <path d="M27 37 L73 37 L74 55 C74 56.5 73 57.5 71 57.5 L29 57.5 C27 57.5 26 56.5 26 55 Z" fill="#ffffff" opacity="0.95" />
    <!-- Wipers -->
    <line x1="37" y1="55" x2="48" y2="46" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    <line x1="57" y1="55" x2="68" y2="46" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    <!-- Eagle Eye Headlights -->
    <path d="M26 59.5 L33 59.5 L32 65.5 L25 63.5 Z" fill="#e9b85b" />
    <path d="M74 59.5 L67 59.5 L68 65.5 L75 63.5 Z" fill="#e9b85b" />
    <circle cx="28.5" cy="62" r="1.4" fill="#ffffff" />
    <circle cx="71.5" cy="62" r="1.4" fill="#ffffff" />
    <!-- Grille & Tour Emblem -->
    <rect x="36" y="60.5" width="28" height="5.5" rx="2" fill="#ffffff" opacity="0.92" />
    <line x1="40" y1="63.2" x2="60" y2="63.2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
    <circle cx="50" cy="63.2" r="2.2" fill="#e9b85b" />
    <!-- Bumper & Foglamps -->
    <rect x="25.5" y="68.5" width="49" height="8" rx="4" fill="currentColor" />
    <circle cx="30" cy="72.5" r="1.8" fill="#ffffff" />
    <circle cx="70" cy="72.5" r="1.8" fill="#ffffff" />
    <rect x="42" y="70.5" width="16" height="4" rx="1.2" fill="#142944" />
    <!-- Wheels -->
    <rect x="24" y="80" width="7" height="5" rx="1.5" fill="#1e293b" />
    <rect x="69" y="80" width="7" height="5" rx="1.5" fill="#1e293b" />
  </svg>`,

  busHd: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 100 100" fill="currentColor">
    <!-- Spion Tanduk (Side Mirrors) -->
    <path d="M18 24 C11 20 8 28 12 36 C14 40 17 41 18 39 L18 34 C16 34 14 31 15 28 C16 25 18 26 21 27 L21 24 Z" />
    <path d="M82 24 C89 20 92 28 88 36 C86 40 83 41 82 39 L82 34 C84 34 86 31 85 28 C84 25 82 26 79 27 L79 24 Z" />
    <!-- Bus Body High Decker -->
    <path d="M25 14 C25 10 29 8 34 8 L66 8 C71 8 75 10 75 14 L77 74 C77 78 74 80 70 80 L30 80 C26 80 23 78 23 74 Z" />
    <!-- AC Roof Pod -->
    <rect x="36" y="5.5" width="28" height="3.5" rx="1.7" fill="currentColor" opacity="0.85" />
    <!-- Upper Panoramic Windshield HD -->
    <path d="M28 15.5 C28 14 29.5 12.5 33 12.5 L67 12.5 C70.5 12.5 72 14 72 15.5 L72.5 30 L27.5 30 Z" fill="#ffffff" opacity="0.95" />
    <!-- Bando Divider with Gold Accent -->
    <rect x="26" y="31" width="48" height="4.5" rx="1.5" fill="currentColor" />
    <rect x="38" y="32.5" width="24" height="1.8" rx="0.9" fill="#e9b85b" />
    <!-- Lower Windshield -->
    <path d="M27 37 L73 37 L74 55 C74 56.5 73 57.5 71 57.5 L29 57.5 C27 57.5 26 56.5 26 55 Z" fill="#ffffff" opacity="0.95" />
    <!-- Wipers -->
    <line x1="37" y1="55" x2="48" y2="46" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    <line x1="57" y1="55" x2="68" y2="46" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    <!-- Eagle Eye Headlights -->
    <path d="M26 59.5 L33 59.5 L32 65.5 L25 63.5 Z" fill="#e9b85b" />
    <path d="M74 59.5 L67 59.5 L68 65.5 L75 63.5 Z" fill="#e9b85b" />
    <circle cx="28.5" cy="62" r="1.4" fill="#ffffff" />
    <circle cx="71.5" cy="62" r="1.4" fill="#ffffff" />
    <!-- Grille & Tour Emblem -->
    <rect x="36" y="60.5" width="28" height="5.5" rx="2" fill="#ffffff" opacity="0.92" />
    <line x1="40" y1="63.2" x2="60" y2="63.2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
    <circle cx="50" cy="63.2" r="2.2" fill="#e9b85b" />
    <!-- Bumper & Foglamps -->
    <rect x="25.5" y="68.5" width="49" height="8" rx="4" fill="currentColor" />
    <circle cx="30" cy="72.5" r="1.8" fill="#ffffff" />
    <circle cx="70" cy="72.5" r="1.8" fill="#ffffff" />
    <rect x="42" y="70.5" width="16" height="4" rx="1.2" fill="#142944" />
    <!-- Wheels -->
    <rect x="24" y="80" width="7" height="5" rx="1.5" fill="#1e293b" />
    <rect x="69" y="80" width="7" height="5" rx="1.5" fill="#1e293b" />
  </svg>`,

  home: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  
  seat: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 13h10"/><path d="M5 21v-4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/><path d="M6 15V7a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v8"/><path d="M4 11a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2"/><path d="M20 11a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2"/></svg>`,
  
  qr: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>`,
  
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M12 14v4"/><path d="M10 16h4"/></svg>`,
  
  payment: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/><path d="M6 15h2"/><path d="M12 15h4"/></svg>`,
  
  info: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
  
  // Profile / User Avatar Icon (Exact match to requested avatar)
  profile: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 100 100" fill="currentColor">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M 50 11 C 28.5 11 11 28.5 11 50 C 11 71.5 28.5 89 50 89 C 71.5 89 89 71.5 89 50 C 89 28.5 71.5 11 50 11 Z M 50 25 C 57.7 25 64 31.3 64 39 C 64 46.7 57.7 53 50 53 C 42.3 53 36 46.7 36 39 C 36 31.3 42.3 25 50 25 Z M 23.3 74.2 C 29.5 63.8 38.8 59 50 59 C 61.2 59 70.5 63.8 76.7 74.2 C 69.8 82 59.9 86.5 50 86.5 C 40.1 86.5 30.2 82 23.3 74.2 Z"/>
  </svg>`,

  admin: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 100 100" fill="currentColor">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M 50 11 C 28.5 11 11 28.5 11 50 C 11 71.5 28.5 89 50 89 C 71.5 89 89 71.5 89 50 C 89 28.5 71.5 11 50 11 Z M 50 25 C 57.7 25 64 31.3 64 39 C 64 46.7 57.7 53 50 53 C 42.3 53 36 46.7 36 39 C 36 31.3 42.3 25 50 25 Z M 23.3 74.2 C 29.5 63.8 38.8 59 50 59 C 61.2 59 70.5 63.8 76.7 74.2 C 69.8 82 59.9 86.5 50 86.5 C 40.1 86.5 30.2 82 23.3 74.2 Z"/>
  </svg>`,
  
  more: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="14" rx="1.5"/><rect width="7" height="7" x="3" y="14" rx="1.5"/></svg>`,
  
  dashboard: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
  
  users: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  
  tools: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 15 6 6m-6-6v4.5a1.5 1.5 0 0 1-3 0V15m3 0h-4.5a1.5 1.5 0 0 1 0-3H15m0 0V7.5a1.5 1.5 0 0 1 3 0V12m-3 0h4.5a1.5 1.5 0 0 1 0 3Z"/><circle cx="6" cy="6" r="3"/><path d="m9 9 3 3"/></svg>`,
  
  reports: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  
  backup: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>`,
  
  settings: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  
  logout: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>`,
  
  chevronRight: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
  
  close: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  
  pin: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  
  clock: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
  
  arrowLeft: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`,

  whatsapp: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
  
  phone: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`
};

function getIcon(name, customClass = '') {
  const svg = ICONS[name] || '';
  if (!svg || !customClass) return svg;
  return svg.replace('<svg ', `<svg class="${customClass}" `);
}

// Automatically populate elements with data-icon attribute
function initIcons() {
  document.querySelectorAll('[data-icon]').forEach(el => {
    const iconName = el.dataset.icon;
    const cls = el.dataset.iconClass || '';
    if (ICONS[iconName]) {
      el.innerHTML = getIcon(iconName, cls);
    }
  });
}

document.addEventListener('DOMContentLoaded', initIcons);
