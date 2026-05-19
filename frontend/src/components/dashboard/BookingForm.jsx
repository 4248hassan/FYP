import React from 'react'
import Button from '../ui/Button'

const services = ['Plumbing', 'Electrician', 'AC Repair', 'Carpenter']

export default function BookingForm({ onBook = () => {} }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Quick Booking</h3>
          <p className="text-xs text-slate-500">Select a service, date and time slot.</p>
        </div>
      </div>

      <form
        className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault()
          onBook()
        }}
      >
        <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          {services.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input type="date" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option>09:00</option>
          <option>11:00</option>
          <option>14:00</option>
          <option>16:00</option>
        </select>
        <div className="flex items-center">
          <Button type="submit" className="w-full">Book Now</Button>
        </div>
      </form>
    </div>
  )
}
