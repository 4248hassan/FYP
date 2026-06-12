import React from 'react'
import { formatDateDDMMYYYY } from '../../utils'
import { STATUS, STATUS_BADGE, STATUS_LABEL } from '../../constants/status'

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
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {order.serviceId?.name || order.selectedService || 'Service'}
                </p>
                <p className="text-xs text-slate-500">
                  {formatDateDDMMYYYY(order.date || order.bookingDate)} • {order.location?.city || order.city || ''}
                </p>
                {/* Workflow status helper messages */}
                {order.status === STATUS.VENDOR_ASSIGNED && (
                  <p className="mt-0.5 text-xs font-semibold text-blue-600">
                    👍 Vendor assigned — secure payment
                  </p>
                )}
                {order.status === STATUS.WORK_IN_PROGRESS && (
                  <p className="mt-0.5 text-xs font-semibold text-indigo-600">
                    🛠️ Work in progress
                  </p>
                )}
                {order.status === STATUS.AWAITING_APPROVAL && (
                  <p className="mt-0.5 text-xs font-semibold text-orange-600">
                    📸 Review vendor's proof
                  </p>
                )}
                {order.status === STATUS.REVISION_REQUESTED && (
                  <p className="mt-0.5 text-xs font-semibold text-yellow-700">
                    🔄 Revision requested
                  </p>
                )}
                {order.status === STATUS.PAYMENT_PENDING && (
                  <p className="mt-0.5 text-xs font-semibold text-emerald-600">
                    💳 Payment pending
                  </p>
                )}
                {order.status === STATUS.DISPUTED && (
                  <p className="mt-0.5 text-xs font-semibold text-red-600">
                    ⚠️ Dispute in review
                  </p>
                )}
                {order.status === STATUS.COMPLETED && (
                  <p className="mt-0.5 text-xs font-semibold text-green-600">
                    🎉 Completed
                  </p>
                )}
              </div>
              <div className={`text-xs px-2 py-1 rounded font-semibold whitespace-nowrap ${
                STATUS_BADGE[order.status] || 'bg-slate-100 text-slate-600'
              }`}>
                {STATUS_LABEL[order.status] || (order.status ? order.status.replace(/_/g, ' ') : '')}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
