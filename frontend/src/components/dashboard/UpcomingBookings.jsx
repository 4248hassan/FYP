import React from 'react'

export default function UpcomingBookings({ orders = [] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">Upcoming Bookings</h3>
      <div className="mt-3 space-y-3">
        {orders.length === 0 ? (
          <p className="text-sm text-slate-500">No upcoming bookings</p>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{order.serviceId?.name || 'Service'}</p>
                <p className="text-xs text-slate-500">{new Date(order.date).toLocaleDateString()} • {order.city}</p>
              </div>
              <div className={`text-sm px-2 py-1 rounded ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : order.status === 'accepted' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                {order.status}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
