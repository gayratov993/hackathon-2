import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Bugun', icon: 'M12 3v1m0 16v1M3 12h1m16 0h1M5.6 5.6l.7.7m11.4 11.4l.7.7M18.4 5.6l-.7.7M6.3 17.7l-.7.7M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  { to: '/week', label: 'Hafta', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
  { to: '/settings', label: 'Sozlamalar', icon: 'M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.9 2.9l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.6 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.9-2.9l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.6-1.1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.9-2.9l.1.1a1.7 1.7 0 001.9.3h.1a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.9 2.9l-.1.1a1.7 1.7 0 00-.3 1.9v.1a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z' },
]

export function Nav() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-10">
      <div className="dock max-w-md mx-auto border-t border-base-200 bg-base-100/95 backdrop-blur-md">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `group tap relative ${isActive ? 'dock-active text-primary' : 'text-base-content/60'}`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  aria-hidden="true"
                  className={`absolute top-0 h-0.5 rounded-full bg-primary transition-all duration-300 ease-out ${
                    isActive ? 'w-8 opacity-100' : 'w-0 opacity-0'
                  }`}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 transition-transform duration-300 ease-out ${
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                </svg>
                <span className={`dock-label transition-all duration-300 ${isActive ? 'font-semibold' : ''}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  )
}
