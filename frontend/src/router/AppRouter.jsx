import { Routes, Route, Navigate } from 'react-router-dom'
import App from '../App'
import LandingPage from '../pages/landing'
import AuthPage from '../pages/auth'
import Contact from '../pages/Contact'
import Services from '../pages/Services'
import Solutions from '../pages/Solutions'
import Pricing from '../pages/Pricing'
import Support from '../pages/Support'
import ProtectedRoute from '../components/layout/ProtectedRoute'

// Customer pages
import CustomerDashboard from '../pages/customer/Dashboard'
import CreateComplaint from '../pages/customer/CreateComplaint'
import ComplaintDetail from '../pages/customer/ComplaintDetail'
import ComplaintChat from '../pages/customer/Chat'
import CustomerProfile from '../pages/customer/Profile'
import BookService from '../pages/customer/BookService'
import Bookings from '../pages/customer/Bookings'
import Payments from '../pages/customer/Payments'
import CustomerSupport from '../pages/customer/Support'
import CustomerBookingDetail from '../pages/customer/BookingDetail'

// Vendor pages
import VendorDashboard from '../pages/vendor/Dashboard'
import JobList from '../pages/vendor/JobList'
import JobDetail from '../pages/vendor/JobDetail'
import VendorProfile from '../pages/vendor/Profile'

// Admin pages
import AdminDashboard from '../pages/admin/Dashboard'
import AdminBookings from '../pages/admin/Bookings'
import AdminUsers from '../pages/admin/Users'
import AdminVendors from '../pages/admin/Vendors'
import AdminComplaints from '../pages/admin/Complaints'
import AdminProfile from '../pages/admin/Profile'
import EscrowManagement from '../pages/admin/EscrowManagement'
import AdminWallet from '../pages/admin/Wallet'

// Vendor extra pages
import VendorWallet from '../pages/vendor/Wallet'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/services" element={<Services />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/solutions" element={<Solutions />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/support" element={<Support />} />

      {/* Auth routes */}
      <Route path="/auth/login" element={<AuthPage />} />
      <Route path="/auth/register" element={<AuthPage />} />

      {/* Customer area */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/customer/book-service" element={<ProtectedRoute allowedRoles={["customer"]}><BookService /></ProtectedRoute>} />
      <Route path="/customer/bookings" element={<ProtectedRoute allowedRoles={["customer"]}><Bookings /></ProtectedRoute>} />
      <Route path="/customer/bookings/:id" element={<ProtectedRoute allowedRoles={["customer"]}><CustomerBookingDetail /></ProtectedRoute>} />
      <Route path="/customer/payments" element={<ProtectedRoute allowedRoles={["customer"]}><Payments /></ProtectedRoute>} />
      <Route path="/customer/support" element={<ProtectedRoute allowedRoles={["customer"]}><CustomerSupport /></ProtectedRoute>} />
      <Route
        path="/customer/complaints/new"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CreateComplaint />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/complaints/:id"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <ComplaintDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/complaints/:id/chat"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <ComplaintChat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/profile"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerProfile />
          </ProtectedRoute>
        }
      />

      {/* Vendor area */}
      <Route
        path="/vendor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['vendor']}>
            <VendorDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/vendor" element={<Navigate to="/vendor/dashboard" replace />} />
      <Route path="/vendor/requests" element={<Navigate to="/vendor/dashboard" replace />} />
      <Route path="/vendor/earnings" element={<Navigate to="/vendor/dashboard" replace />} />
      <Route path="/vendor/support" element={<Navigate to="/vendor/dashboard" replace />} />
      
      <Route
        path="/vendor/jobs"
        element={
          <ProtectedRoute allowedRoles={['vendor']}>
            <JobList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/jobs/:id"
        element={
          <ProtectedRoute allowedRoles={['vendor']}>
            <JobDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/wallet"
        element={
          <ProtectedRoute allowedRoles={['vendor']}>
            <VendorWallet />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/profile"
        element={
          <ProtectedRoute allowedRoles={['vendor']}>
            <VendorProfile />
          </ProtectedRoute>
        }
      />

      {/* Admin area */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/vendors"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminVendors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/complaints"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminComplaints />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/escrow"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <EscrowManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/wallet"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminWallet />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminProfile />
          </ProtectedRoute>
        }
      />

      {/* Fallback route for unknown paths */}
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  )
}
