/**
 * Centralized pricing configuration for all service types in PKR.
 */
export const servicePricing = {
  Plumbing: 1500,
  Electrical: 1500,
  'AC Repair': 2500,
  'Appliance Repair': 2000,
  'CCTV Installation': 5000,
  Carpenter: 2000,
  Painter: 3000,
  'Cleaning Service': 2500,
  'Generator Repair': 3500,
  'IT Support': 2000,
  'Smart Home Setup': 5000,
  'Home Maintenance': 3000,
  Handyman: 1500,
  Other: 2000,
}

/**
 * Gets the price of a service by name.
 * 
 * @param {string} serviceName - The name of the service
 * @returns {number} The price of the service in PKR
 */
export function getServicePrice(serviceName) {
  return servicePricing[serviceName] || servicePricing['Other']
}

/**
 * Formats a PKR price with commas and "PKR" currency suffix.
 * 
 * @param {number} amount - The numeric amount in PKR
 * @returns {string} Formatted price string (e.g. "1,500 PKR")
 */
export function formatPKR(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0 PKR'
  }
  return `${amount.toLocaleString('en-US')} PKR`
}

export default {
  servicePricing,
  getServicePrice,
  formatPKR,
}
