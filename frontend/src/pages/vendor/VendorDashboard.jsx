import React from 'react'

export default function VendorDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Vendor Dashboard</h1>
        <p className="text-sm text-slate-600">Overview of your vendor activity (demo)</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">Active Jobs</h3>
          <p className="mt-2 text-2xl font-bold text-slate-900">8</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">Pending Complaints</h3>
          <p className="mt-2 text-2xl font-bold text-slate-900">3</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">Earnings (this month) (PKR)</h3>
          <p className="mt-2 text-2xl font-bold text-slate-900">Rs 347,200</p>
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h3 className="text-sm font-semibold text-slate-700">Recent Activity</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          <li>Job B-4019 marked as Completed</li>
          <li>Complaint C-3011 assigned to you</li>
          <li>New booking request B-4025</li>
        </ul>
      </div>
    </div>
  )
}
