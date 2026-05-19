// Shared utility functions can be exported from this barrel file.

/**
 * Converts USD amount to PKR (Pakistani Rupees)
 * Uses fixed conversion rate: 1 USD = 280 PKR
 * 
 * @param {number} usdAmount - Amount in USD
 * @returns {string} Formatted string with "Rs" prefix and comma separators (e.g., "Rs 56,000")
 */
export function convertUSDToPKR(usdAmount) {
  if (typeof usdAmount !== 'number' || isNaN(usdAmount)) {
    return 'Rs 0'
  }
  
  // Convert USD to PKR (1 USD = 280 PKR)
  const pkrAmount = Math.round(usdAmount * 280)
  
  // Format with comma separators
  return `Rs ${pkrAmount.toLocaleString('en-US')}`
}

export default {
  convertUSDToPKR,
}


