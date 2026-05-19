import { Outlet } from 'react-router-dom'

function App() {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-sky-700 text-white shadow">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold tracking-tight">
            ResolveIt
          </h1>
          <nav className="space-x-4 text-sm font-medium">
            <a href="#" className="hover:text-sky-200">
              Dashboard
            </a>
            <a href="#" className="hover:text-sky-200">
              Tickets
            </a>
            <a href="#" className="hover:text-sky-200">
              Settings
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <Outlet />
      </main>
    </div>
  )
}

export default App
