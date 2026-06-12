/**
 * Formats any date string, Date object, or timestamp to DD/MM/YYYY format (e.g. 11/06/2026).
 * 
 * @param {string|Date|number} dateInput - The date to format
 * @returns {string} Formatted date string or 'N/A'
 */
export function formatDate(dateInput) {
  if (!dateInput) return 'N/A'
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) return String(dateInput)
  
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  
  return `${day}/${month}/${year}`
}

/**
 * Formats any date string, Date object, or timestamp to DD/MM/YYYY, HH:MM:SS format.
 * 
 * @param {string|Date|number} dateInput - The date to format
 * @returns {string} Formatted date-time string or 'N/A'
 */
export function formatDateTime(dateInput) {
  if (!dateInput) return 'N/A'
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) return String(dateInput)
  
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  return `${day}/${month}/${year}, ${timeStr}`
}

/**
 * Formats a date to YYYY-MM-DD format, required for HTML date input values.
 * 
 * @param {string|Date|number} dateInput - The date to format
 * @returns {string} Formatted date string or ''
 */
export function formatDateForInput(dateInput) {
  if (!dateInput) return ''
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) return ''
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

export function formatDateDDMMYYYY(dateInput) {
  return formatDate(dateInput)
}

export default {
  formatDate,
  formatDateTime,
  formatDateForInput,
  formatDateDDMMYYYY,
}
