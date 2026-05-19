import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'

export default function TopNav() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  return (
    <header className="flex items-center justify-between gap-4 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <button className="text-slate-600 hover:text-slate-800 md:hidden">☰</button>
        <Link to="/" className="text-lg font-semibold text-slate-900">ResolveIt</Link>
      </div>

      <div className="flex items-center gap-3">
        <Link to="/customer" className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-sky-300 hover:text-sky-700">Dashboard</Link>
        <Button variant="ghost" onClick={handleLogout} className="text-sm">Logout</Button>
      </div>
    </header>
  )
}
