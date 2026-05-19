// TopNav removed to keep header minimal per design
import Navbar from '../layout/Navbar'
import VendorSidebar from './Sidebar'

export default function VendorLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto flex max-w-7xl gap-4 sm:gap-6 px-4 py-4 sm:py-6 lg:px-0">
        <VendorSidebar />

        <main className="flex-1 space-y-4 sm:space-y-6">{children}</main>
      </div>
    </div>
  )
}
