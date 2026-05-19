import { Link } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import {
  heroElectrician,
  servicePlumbing,
  serviceElectrician,
  serviceAcRepair,
} from '../../assets/images'

const featureColumns = [
  {
    title: 'Intelligent intake',
    bullets: [
      'Guided complaint wizard with smart defaults',
      'Automatic category tagging and prioritization',
      'File uploads with progress tracking',
    ],
  },
  {
    title: 'Operational excellence',
    bullets: [
      'Role-aware dashboards for every persona',
      'Real-time chat and activity timelines',
      'Vendor marketplace with quality scoring',
    ],
  },
  {
    title: 'Insights & control',
    bullets: [
      'Advanced filtering across complaints & jobs',
      'Exportable reports and SLA alerts',
      'Audit-ready logs for every decision',
    ],
  },
]

const steps = [
  {
    title: 'Log the issue',
    detail: 'Customers submit structured complaints with photos, receipts, and preferred timelines.',
  },
  {
    title: 'Match the right vendor',
    detail: 'ResolveIt scores available vendors based on skills, proximity, and past performance.',
  },
  {
    title: 'Collaborate & resolve',
    detail: 'In-app chat, status updates, and payment confirmations keep every stakeholder aligned.',
  },
]

const testimonials = [
  {
    quote:
      'ResolveIt replaced four different tools for our ops team. Ticket backlogs dropped by 43% in the first month.',
    author: 'Marisa Huerta',
    role: 'Director of Customer Operations, FreshNest',
  },
  {
    quote:
      'As a vendor, having context and direct chat makes it easy to delight customers. Payments land on time, every time.',
    author: 'Ray Ajayi',
    role: 'Founder, FixIt Pro Services',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Primary hero: modern two-column layout (moved to top) */}
        <section className="relative overflow-hidden bg-gradient-to-br from-sky-800 via-sky-700 to-slate-900 text-white">
          <div className="absolute inset-0 opacity-20 mix-blend-overlay">
            <div className="h-full w-full bg-[radial-gradient(circle_at_top,_#fff_0,_transparent_55%)]" />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pb-12 sm:pb-16 pt-8 sm:pt-12">
            <div className="grid gap-8 sm:gap-10 items-center lg:grid-cols-2">
              {/* LEFT */}
              <div className="space-y-4 sm:space-y-6 max-w-xl animate-fade-up">
                <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-white/70">Trusted services, delivered</p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-white">
                  Book trusted services instantly
                </h1>
                <p className="text-base sm:text-lg text-white/85">
                  Find vetted vendors, schedule jobs in minutes, and pay securely with escrow — all from one clean dashboard.
                </p>

                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
                  <Link to="/auth/register?selectRole=true" className="inline-block w-full sm:w-auto">
                    <Button
                      className="w-full sm:w-auto rounded-full px-6 py-3 font-bold bg-sky-600 text-white hover:bg-sky-500 shadow-lg transition"
                      aria-label="Get started"
                    >
                      Get Started
                    </Button>
                  </Link>

                  <Link to="/services" className="inline-block w-full sm:w-auto">
                    <Button
                      variant="secondary"
                      className="w-full sm:w-auto rounded-full px-5 py-3 border-white/30 text-white bg-white/5 hover:bg-white/10 transition"
                      aria-label="Book a service"
                    >
                      Services
                    </Button>
                  </Link>
                </div>
              </div>

              {/* RIGHT */}
              <div className="relative flex items-center justify-center mt-8 lg:mt-0">
                <div className="w-full max-w-md transform rounded-2xl sm:rounded-3xl bg-white/5 p-4 sm:p-6 backdrop-blur-lg shadow-2xl animate-fade-up">
                  <img
                    src={heroElectrician}
                    alt="Electrician working"
                    className="w-full h-auto rounded-xl sm:rounded-2xl object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Floating stats */}
                <div className="absolute -left-2 sm:-left-6 top-4 sm:top-6 flex flex-col gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-slate-900 shadow-md">
                    <span className="inline-flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs sm:text-sm">✓</span>
                    <span className="hidden sm:inline">500+ Vendors</span>
                    <span className="sm:hidden">500+</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-slate-900 shadow-md">
                    <span className="inline-flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-xs sm:text-sm">⚡</span>
                    <span className="hidden sm:inline">Fast Booking</span>
                    <span className="sm:hidden">Fast</span>
                  </div>
                </div>

                <div className="absolute -right-2 sm:-right-6 bottom-4 sm:bottom-6 hidden sm:flex flex-col gap-3">
                  <div className="rounded-lg sm:rounded-xl bg-white/90 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-slate-900 shadow-lg">4.9 ★ Customer rating</div>
                </div>
              </div>
            </div>
          </div>
        </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">Popular services</h2>
          <Link to="/services" className="text-sm font-semibold text-sky-700 hover:text-sky-800">
            View all services
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: 'Plumbing',
              description: 'Leak fixes, pipe installs, and urgent repairs.',
              image: servicePlumbing,
            },
            {
              name: 'Electrician',
              description: 'Safe wiring, fittings, and power issue diagnostics.',
              image: serviceElectrician,
            },
            {
              name: 'AC Repair',
              description: 'Cooling checks, servicing and gas refills.',
              image: serviceAcRepair,
            },
          ].map((service) => (
            <Card
              key={service.name}
              className="group overflow-hidden border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
            >
              <div className="overflow-hidden rounded-xl">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-48 object-cover rounded-lg transition duration-300 group-hover:scale-105"
                />
              </div>
              <div className="mt-4 space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">{service.name}</h3>
                <p className="text-sm text-slate-600">{service.description}</p>
                <Button className="mt-2 w-full" variant="secondary">
                  Book {service.name}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-sky-600">Platform</p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold text-slate-900">
              Built for teams that never let a complaint slip through the cracks.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-600">
              From intake to insights, ResolveIt eliminates manual triage while keeping customers in the loop.
            </p>
          </div>
          <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featureColumns.map((column) => (
              <div key={column.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900">{column.title}</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  {column.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-500" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
            How it works
          </p>
          <h2 className="mt-3 text-2xl sm:text-3xl font-semibold text-slate-900">
            From request to resolved in three simple steps.
          </h2>
        </div>
        <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-lg font-semibold text-emerald-600">
                {index + 1}
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 py-12 sm:py-16 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
            {testimonials.map((testimonial) => (
              <div key={testimonial.author} className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                <p className="text-lg leading-relaxed text-white/90">“{testimonial.quote}”</p>
                <div className="mt-6 text-sm font-medium text-white/80">
                  <p>{testimonial.author}</p>
                  <p className="text-white/60">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-sky-600">Get started</p>
          <h2 className="mt-4 text-2xl sm:text-3xl font-semibold text-slate-900">
            Launch your complaint resolution workspace in under 10 minutes.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-600">
            Onboard your team, invite trusted vendors, and start delivering delightful outcomes with a single source of truth.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/auth/register">
              <Button>Open an account</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}


