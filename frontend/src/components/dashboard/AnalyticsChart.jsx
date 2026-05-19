import React from 'react'

// Simple sparkline-like SVG chart for analytics (no external deps)
export default function AnalyticsChart({ data = [4, 8, 6, 10, 9, 12, 11] }) {
  const width = 300
  const height = 80
  const max = Math.max(...data)
  const points = data
    .map((d, i) => `${(i / (data.length - 1)) * width},${height - (d / max) * height}`)
    .join(' ')

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">Analytics</h3>
      <svg className="mt-3 w-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <polyline fill="none" stroke="#0ea5e9" strokeWidth="3" points={points} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
