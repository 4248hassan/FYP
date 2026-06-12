import { useState, useRef, useEffect } from 'react'
import { formatDateDDMMYYYY, formatDateForInput } from '../../utils'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

export default function DatePicker({
  label,
  name,
  value, // YYYY-MM-DD
  onChange,
  min, // YYYY-MM-DD
  className = '',
  error,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Parse currently selected date
  const selectedDate = value ? new Date(value + 'T00:00:00') : null
  
  // viewDate controls which month/year the calendar popover displays
  const [viewDate, setViewDate] = useState(() => {
    return selectedDate && !isNaN(selectedDate.getTime()) ? new Date(selectedDate) : new Date()
  })

  const containerRef = useRef(null)

  // Sync viewDate when popover opens or selected date changes
  useEffect(() => {
    if (isOpen && selectedDate && !isNaN(selectedDate.getTime())) {
      setViewDate(new Date(selectedDate))
    }
  }, [isOpen, value])

  // Click outside detection
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Month navigation helpers
  const handlePrevMonth = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  // Date selection helper
  const handleSelectDay = (dayDate) => {
    if (!dayDate) return
    
    // Format selected date back to YYYY-MM-DD for the parent form state
    const formatted = formatDateForInput(dayDate)
    
    // Trigger parent onChange callback using standard target structure
    if (onChange) {
      onChange({
        target: {
          name,
          value: formatted
        }
      })
    }
    setIsOpen(false)
  }

  // Calendar rendering logic
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  // First day of the current month
  const firstDayOfMonth = new Date(year, month, 1)
  
  // Day of the week for the 1st of the month (0 = Sun, 1 = Mon, ..., 6 = Sat)
  let startDayOfWeek = firstDayOfMonth.getDay()
  // Shift to start week on Monday: (0 = Mon, 1 = Tue, ..., 6 = Sun)
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1

  // Total days in the current month
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Build grid items: padding days from previous month, then active days
  const calendarCells = []
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarCells.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(new Date(year, month, d))
  }

  const minDate = min ? new Date(min + 'T00:00:00') : null

  const isBeforeMin = (dateToCheck) => {
    if (!minDate || !dateToCheck) return false
    // Compare only year, month, date
    const d1 = new Date(dateToCheck.getFullYear(), dateToCheck.getMonth(), dateToCheck.getDate()).getTime()
    const d2 = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()).getTime()
    return d1 < d2
  }

  const isToday = (dateToCheck) => {
    if (!dateToCheck) return false
    const today = new Date()
    return dateToCheck.getDate() === today.getDate() &&
      dateToCheck.getMonth() === today.getMonth() &&
      dateToCheck.getFullYear() === today.getFullYear()
  }

  const isSelected = (dateToCheck) => {
    if (!selectedDate || !dateToCheck) return false
    return dateToCheck.getDate() === selectedDate.getDate() &&
      dateToCheck.getMonth() === selectedDate.getMonth() &&
      dateToCheck.getFullYear() === selectedDate.getFullYear()
  }

  // Display value in input field (formatted as DD/MM/YYYY)
  const displayValue = selectedDate && !isNaN(selectedDate.getTime()) 
    ? formatDateDDMMYYYY(selectedDate) 
    : ''

  return (
    <div ref={containerRef} className="relative w-full space-y-1">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          type="text"
          name={name}
          value={displayValue}
          readOnly
          onClick={() => setIsOpen(prev => !prev)}
          placeholder="DD/MM/YYYY"
          className={`block w-full cursor-pointer rounded-md border border-slate-300 bg-white pl-3 pr-10 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 ${className}`}
          {...props}
        />
        
        {/* Calendar Icon */}
        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
        >
          <svg className="h-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-1 w-[280px] rounded-xl border border-slate-200 bg-white p-4 shadow-xl z-50 animate-scale-up">
          {/* Header Controls */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-sm font-bold text-slate-900">
              {MONTH_NAMES[month]} {year}
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAYS.map(day => (
              <span key={day} className="text-[11px] font-semibold text-slate-400 select-none py-1">
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((cell, idx) => {
              if (cell === null) {
                return <div key={`empty-${idx}`} />
              }

              const disabled = isBeforeMin(cell)
              const selected = isSelected(cell)
              const current = isToday(cell)

              return (
                <button
                  key={`day-${cell.getTime()}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelectDay(cell)}
                  className={`h-8 w-8 rounded-full text-xs flex items-center justify-center transition-all ${
                    selected
                      ? 'bg-sky-600 text-white font-bold shadow-md hover:bg-sky-700'
                      : disabled
                      ? 'text-slate-300 cursor-not-allowed hover:bg-transparent'
                      : current
                      ? 'border border-sky-500 text-sky-600 font-semibold hover:bg-sky-50'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cell.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
