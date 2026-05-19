import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import {
  solutionSmartVendor,
  solutionEscrow,
  solutionGeoFencing,
  solutionAnonymousChat,
} from '../assets/images'

const solutions = [
  {
    title: 'Smart Vendor Matching',
    icon: '🎯',
    description:
      'Pair every request with the best-fit vendor using skills, proximity, and track record to drive faster resolutions.',
    image: solutionSmartVendor,
  },
  {
    title: 'Escrow Secure Payments',
    icon: '🔒',
    description:
      'Protect customers and vendors with milestone-based releases, transparent receipts, and payment status visibility.',
    image: solutionEscrow,
  },
  {
    title: 'Geo-Fencing Verification',
    icon: '📍',
    description:
      'Validate on-site presence, reduce no-shows, and keep stakeholders informed with trusted location checks.',
    image: solutionGeoFencing,
  },
  {
    title: 'Anonymous Chat',
    icon: '💬',
    description:
      'Enable safe, real-time collaboration without exposing personal contact details or sacrificing speed.',
    image: solutionAnonymousChat,
  },
]

export default function Solutions() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
        <section className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-4 sm:px-8 py-8 sm:py-12 text-white shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Solutions</p>
          <h1 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight">Smart Solutions for Modern Service Problems</h1>
          <p className="mt-4 max-w-3xl text-sm sm:text-base md:text-lg text-white/85">
            ResolveIt combines intelligent routing, secure payments, and verified collaboration to keep every job on
            track—whether you are managing vendors or supporting customers at scale.
          </p>
        </section>

        <section className="mt-8 sm:mt-12 grid gap-6 sm:gap-8 lg:grid-cols-2">
          {solutions.map((solution) => (
            <div
              key={solution.title}
              className="flex flex-col gap-4 rounded-xl sm:rounded-2xl bg-white p-4 sm:p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-sky-100 text-lg sm:text-xl shrink-0">
                  {solution.icon}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900">{solution.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600">{solution.description}</p>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg bg-slate-100">
                <img
                  src={solution.image}
                  alt={solution.title}
                  className="w-full h-auto object-contain rounded-lg"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  )
}

