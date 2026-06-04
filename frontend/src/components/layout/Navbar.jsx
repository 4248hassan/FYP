import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getAvatarUrl } from '../../assets/images'
import Button from '../ui/Button'

const publicNavLinks = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'Solutions', to: '/solutions' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Support', to: '/support' },
  { label: 'Contact', to: '/contact' },
]

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const dropdownRef = useRef(null)

  const handleLogout = () => {
    logout()
    setProfileMenuOpen(false)
    setMobileMenuOpen(false)
    navigate('/auth/login', { replace: true })
  }

  const profileAvatar = user?.profileImage || getAvatarUrl(user?.email)
  const displayName = user?.name || user?.email || 'User'
  const displayEmail = user?.email || ''

  const profileOptions = []
  if (user?.role === 'customer') {
    profileOptions.push({ label: 'My Bookings', to: '/customer/bookings' })
  }
  if (user?.role === 'vendor') {
    profileOptions.push({ label: 'Assigned Jobs', to: '/vendor/jobs' })
  }
  const profileRoute =
    (user?.role === 'customer' && '/customer/profile') ||
    (user?.role === 'vendor' && '/vendor/profile') ||
    (user?.role === 'admin' && '/admin/profile') ||
    '/auth/login'
  if (profileRoute) {
    profileOptions.push({ label: 'Profile', to: profileRoute })
  }
  profileOptions.push({ label: 'Logout', onClick: handleLogout })

  useEffect(() => {
    if (!profileMenuOpen) return

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [profileMenuOpen])

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <a
        href="#main-content"
        className="sr-only absolute left-4 top-4 z-50 rounded-md bg-sky-600 px-3 py-2 text-xs font-semibold text-white focus:not-sr-only"
      >
        Skip to main content
      </a>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-lg font-semibold tracking-tight text-slate-900" aria-label="ResolveIt home">
          ResolveIt
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-700 md:flex" aria-label="Main navigation">
          {!isAuthenticated && (
            <ul className="flex items-center gap-6">
              {publicNavLinks.map((link) => {
                const isActive = link.to === '/' ? location.pathname === '/' : location.pathname.startsWith(link.to)
                return (
                  <li key={link.to} className="list-none">
                    <Link
                      to={link.to}
                      aria-current={isActive ? 'page' : undefined}
                      className={`pb-1 text-sm transition hover:text-sky-700 inline-block cursor-pointer pointer-events-auto ${
                        isActive ? 'border-b-2 border-sky-600 text-sky-700' : ''
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}

          <div className="flex items-center gap-3">
            {!isAuthenticated && (
              <>
                <Link
                  to="/auth/login"
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
                >
                  Login
                </Link>
                <Link to="/auth/register">
                  <Button className="h-9 rounded-full px-4 text-sm">Register</Button>
                </Link>
              </>
            )}
          </div>
        </nav>

        {isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white transition hover:shadow-sm"
              aria-label="Open profile menu"
              aria-expanded={profileMenuOpen}
            >
              <img src={profileAvatar} alt="Profile" className="h-full w-full object-cover" />
            </button>

            <div
              className={`absolute right-0 top-full z-50 mt-3 w-72 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-xl transition duration-200 ease-out ${
                profileMenuOpen ? 'visible opacity-100 scale-100' : 'invisible opacity-0 scale-95'
              }`}
            >
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <div className="h-14 w-14 overflow-hidden rounded-full border border-slate-200">
                  <img src={profileAvatar} alt="Profile" className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                  <p className="text-xs text-slate-500">{displayEmail}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {profileOptions.map((item) =>
                  item.onClick ? (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.onClick}
                      className="w-full rounded-2xl px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setProfileMenuOpen(false)}
                      className="block rounded-2xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      {item.label}
                    </Link>
                  ),
                )}
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      {!isAuthenticated && mobileMenuOpen && (
        <div className="border-t bg-white md:hidden">
          <nav className="mx-auto max-w-7xl px-4 py-4" aria-label="Mobile navigation">
            <ul className="space-y-3">
              {publicNavLinks.map((link) => {
                const isActive = link.to === '/' ? location.pathname === '/' : location.pathname.startsWith(link.to)
                return (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`block rounded-md px-3 py-2 text-sm font-medium transition ${
                        isActive
                          ? 'bg-sky-50 text-sky-700'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-sky-700'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              })}

              <li>
                <Link
                  to="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-md border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link to="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Register</Button>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  )
}
