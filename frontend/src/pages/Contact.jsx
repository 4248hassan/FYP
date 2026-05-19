import { useState } from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState(null)

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }))

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Name is required.'
    if (!form.email.trim()) next.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email.'
    if (!form.message.trim()) next.message = 'Please enter a message.'
    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus(null)
    const next = validate()
    if (Object.keys(next).length) return setErrors(next)
    setErrors({})
    try {
      // Placeholder: wire to real API when available
      await new Promise((r) => setTimeout(r, 700))
      setStatus({ ok: true, message: 'Message sent — we will reply shortly.' })
      setForm({ name: '', email: '', message: '' })
    } catch {
      setStatus({ ok: false, message: 'Failed to send message. Try again later.' })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Contact Us</h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Have a question or need help? Send us a message and our support team will get back to you.
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
          <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">Send us a message</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <Input label="Name" name="name" value={form.name} onChange={handleChange} />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>

              <div>
                <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={6}
                  className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
              </div>

              <div>
                <Button type="submit" className="w-full">Send message</Button>
              </div>

              {status && (
                <div className={`mt-2 rounded-md p-3 text-sm ${status.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>
                  {status.message}
                </div>
              )}
            </form>
          </div>

          <aside className="space-y-4 sm:space-y-6">
            <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm sm:text-base font-semibold text-slate-900">Contact Details</h3>
                <span className="text-xs text-slate-500">🇵🇰</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mb-4">
                Support available from Karachi, Pakistan
              </p>
              
              <div className="rounded-lg bg-gradient-to-br from-sky-50 to-sky-100 p-4 border border-sky-200 space-y-3">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-sky-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 mb-1">Office Address</p>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      Office #12, 3rd Floor,<br />
                      Tech Plaza, Shahrah-e-Faisal,<br />
                      Karachi, Pakistan
                    </p>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-sky-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-sky-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <p className="text-xs sm:text-sm text-slate-700"><strong>Phone:</strong> +92 300 1234567</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-sky-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs sm:text-sm text-slate-700"><strong>Email:</strong> support@resolveit.pk</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
              <h3 className="text-sm sm:text-base font-semibold text-slate-900">Support Hours</h3>
              <div className="mt-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs sm:text-sm text-slate-600">Mon–Fri: 9:00 AM — 6:00 PM PKT</p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  )
}
