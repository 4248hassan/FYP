import React from 'react'
import { Link } from 'react-router-dom'

const items = [
  { to: '/dashboard', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/bookings', label: 'Bookings' },
  { to: '/payments', label: 'Payments' },
  { to: '/history', label: 'History' },
  { to: '/support', label: 'Support' },
]

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 space-y-4 md:block">
      <div className="p-4">
        <div className="text-sm font-semibold text-slate-700">Customer</div>
      </div>
      <nav className="space-y-1 p-4">
        {items.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            {it.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
