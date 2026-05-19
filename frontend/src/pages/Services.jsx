import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import {
  sectionHomeServices,
  sectionRepairMaintenance,
  sectionProfessionalServices,
  servicePlumbing,
  serviceElectrician,
  serviceHandyman,
  serviceAcRepair,
  serviceGenerator,
  serviceAppliance,
  serviceItSupport,
  serviceCctv,
  serviceSmartHome,
} from '../assets/images'

const serviceSections = [
  {
    title: 'Home Services',
    subtitle: 'Skilled pros for everyday fixes',
    image: sectionHomeServices,
    items: [
      {
        name: 'Plumbing',
        description: 'Leak fixes, pipe installs, and quick diagnostics.',
        image: servicePlumbing,
      },
      {
        name: 'Electrician',
        description: 'Safe wiring, panel checks, and power restoration.',
        image: serviceElectrician,
      },
      {
        name: 'Handyman',
        description: 'Small repairs, mounting, and general maintenance.',
        image: serviceHandyman,
      },
    ],
  },
  {
    title: 'Repair & Maintenance',
    subtitle: 'Keep critical systems running smoothly',
    image: sectionRepairMaintenance,
    items: [
      {
        name: 'AC Repair',
        description: 'Cooling tune-ups, filter changes, and urgent repairs.',
        image: serviceAcRepair,
      },
      {
        name: 'Generator Repair',
        description: 'Load testing, servicing, and backup readiness.',
        image: serviceGenerator,
      },
      {
        name: 'Appliance Care',
        description: 'Trusted support for fridges, washers, and more.',
        image: serviceAppliance,
      },
    ],
  },
  {
    title: 'Professional Services',
    subtitle: 'Specialized expertise on demand',
    image: sectionProfessionalServices,
    items: [
      {
        name: 'IT Support',
        description: 'Network setup, device troubleshooting, and backups.',
        image: serviceItSupport,
      },
      {
        name: 'CCTV Installation',
        description: 'Site planning, secure installs, and monitoring.',
        image: serviceCctv,
      },
      {
        name: 'Smart Home Setup',
        description: 'Seamless automation for comfort and safety.',
        image: serviceSmartHome,
      },
    ],
  },
]

export default function Services() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
        <section className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-sky-600 via-sky-500 to-sky-700 px-4 sm:px-8 py-8 sm:py-12 text-white shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Services</p>
          <h1 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight">Our Services</h1>
          <p className="mt-4 max-w-3xl text-sm sm:text-base md:text-lg text-white/85">
            A curated network of trusted professionals for every home, repair, and professional
            need—delivered with transparent communication and reliable follow-through.
          </p>
        </section>

        <section className="mt-8 sm:mt-12 space-y-8 sm:space-y-12">
          {serviceSections.map((section) => (
            <div key={section.title} className="rounded-xl sm:rounded-2xl bg-white p-4 sm:p-6 shadow-sm ring-1 ring-slate-200/70">
              <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">{section.title}</h2>
                  <p className="text-xs sm:text-sm text-slate-600">{section.subtitle}</p>
                </div>
                <img
                  src={section.image}
                  alt={`${section.title} visual`}
                  className="w-full md:w-auto md:max-w-xs h-48 object-cover rounded-lg shadow"
                  loading="lazy"
                />
              </div>

              <div className="mt-6 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {section.items.map((item) => (
                  <div
                    key={item.name}
                    className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-5 shadow-sm transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-md"
                  >
                    <div className="overflow-hidden rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-48 object-cover rounded-lg"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  )
}

