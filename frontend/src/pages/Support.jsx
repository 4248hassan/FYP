import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'
import {
  supportProductHelp,
  supportVendors,
  supportAccountAccess,
  supportPayments,
} from '../assets/images'

const faqs = [
  {
    question: 'How do I submit a support request?',
    answer: 'Choose your category, add details and attachments, and submit. A specialist will respond quickly.',
  },
  {
    question: 'Do I need an account to get help?',
    answer: 'General support and pre-sales questions are public. Dashboard features require an account.',
  },
  {
    question: 'How fast do you respond?',
    answer: 'Most questions receive a first response within one business hour during support hours.',
  },
]

// Exactly 4 support categories with specific images
const categories = [
  {
    name: 'Product Help',
    description: 'Help related to using the platform, booking services, and tracking requests.',
    image: supportProductHelp,
  },
  {
    name: 'Vendors',
    description: 'Support related to vendors, service providers, job handling, reviews.',
    image: supportVendors,
  },
  {
    name: 'Account & Access',
    description: 'Login issues, password recovery, account security.',
    image: supportAccountAccess,
  },
  {
    name: 'Payments',
    description: 'Payments, escrow, refunds, billing issues.',
    image: supportPayments,
  },
]

export default function Support() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
        <section className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-4 sm:px-8 py-8 sm:py-12 text-white shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Support</p>
          <h1 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight">Support & Help Center</h1>
          <p className="mt-4 max-w-3xl text-sm sm:text-base md:text-lg text-white/85">
            Get answers, connect with our team, and find resources to keep your services running without friction.
          </p>
        </section>

        <section className="mt-8 sm:mt-10">
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
            {/* Left Side: Support Categories - 2x2 Grid */}
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-4 sm:mb-6">Support Categories</h2>
              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
              {categories.map((category) => (
                  <div
                    key={category.name}
                    className="group rounded-xl sm:rounded-2xl bg-white p-4 sm:p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="overflow-hidden rounded-lg mb-4">
                  <img
                        src={category.image}
                    alt={category.name}
                        className="w-full h-48 sm:h-56 object-contain rounded-lg transition-transform group-hover:scale-105 bg-slate-100"
                        loading="lazy"
                  />
                </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900">{category.name}</h3>
                    <p className="mt-2 text-sm sm:text-base text-slate-600">{category.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: Contact Details */}
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

          {/* FAQs Section - Below the grid */}
          <div className="mt-8 sm:mt-10 rounded-xl sm:rounded-2xl bg-white p-4 sm:p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Frequently Asked Questions</h2>
            <div className="mt-4 space-y-3 sm:space-y-4">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-lg sm:rounded-xl border border-slate-100 bg-slate-50/70 p-3 sm:p-4">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900">{faq.question}</p>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

