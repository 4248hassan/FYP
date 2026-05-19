import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'
import {
  servicePlumbing,
  serviceCarpenter,
  serviceElectrician,
  serviceAcRepair,
  servicePainter,
  serviceCleaning,
} from '../assets/images'

const services = [
  {
    name: 'Plumbing',
    price: 'PKR 800',
    description: 'Professional plumbing repair & installation.',
    image: servicePlumbing,
  },
  {
    name: 'Carpenter',
    price: 'PKR 1,800',
    description: 'Furniture repair, woodwork & customization.',
    image: serviceCarpenter,
  },
  {
    name: 'Electrician',
    price: 'PKR 1,000',
    description: 'Wiring, appliances repair & electrical fixes.',
    image: serviceElectrician,
  },
  {
    name: 'AC Repair',
    price: 'PKR 1,200',
    description: 'AC servicing, gas refill & cooling problem fix.',
    image: serviceAcRepair,
  },
  {
    name: 'Painter',
    price: 'PKR 1,500',
    description: 'Indoor & outdoor painting services.',
    image: servicePainter,
  },
  {
    name: 'Cleaning Services',
    price: 'PKR 1,000',
    description: 'Deep cleaning for homes & offices.',
    image: serviceCleaning,
  },
]

export default function Pricing() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
        <section className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-sky-700 via-sky-600 to-sky-800 px-4 sm:px-8 py-8 sm:py-12 text-white shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Pricing</p>
          <h1 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight">Transparent & Affordable Service Pricing</h1>
          <p className="mt-4 max-w-3xl text-sm sm:text-base md:text-lg text-white/85">
            Choose from our trusted home services with fixed, reliable rates.
          </p>
        </section>

        <section className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.name}
              className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="overflow-hidden rounded-lg">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{service.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{service.description}</p>
                </div>
                <p className="text-sm font-bold text-sky-700">{service.price}</p>
              </div>
              <Button className="mt-auto w-full">Book Now</Button>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  )
}

