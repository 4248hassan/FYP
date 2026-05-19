import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

export default function CustomerSupport() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:px-0">
        <Sidebar />
        <main className="flex-1">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">Support</h1>
            <p className="mt-2 text-sm text-slate-600">Open a ticket or view support resources.</p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Card>
                <h3 className="font-semibold text-slate-900">Open a ticket</h3>
                <p className="mt-2 text-sm text-slate-600">Submit a support ticket and attach any files.</p>
                <div className="mt-4">
                  <Button onClick={() => navigate('/contact')}>Open Ticket</Button>
                </div>
              </Card>
              <Card>
                <h3 className="font-semibold text-slate-900">Help Center</h3>
                <p className="mt-2 text-sm text-slate-600">Browse FAQs and guides to resolve common issues.</p>
                <div className="mt-4">
                  <Button variant="secondary" onClick={() => navigate('/support')}>View Help Center</Button>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
