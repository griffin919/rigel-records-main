/**
 * Composable for Ghana phone number validation
 * Validates and formats phone numbers according to Ghana standards
 */

export const usePhoneValidation = () => {
  /**
   * Validate Ghana phone number
   * Accepts formats: 0241234567, 233241234567, +233241234567
   * Valid prefixes: 020, 023, 024, 025, 026, 027, 028, 050, 053, 054, 055, 056, 057, 059
   */
  const validateGhanaPhone = (phone) => {
    if (!phone) return { valid: false, message: 'Phone number is required' }

    // Remove all spaces, dashes, and parentheses
    const cleaned = phone.replace(/[\s\-()]/g, '')

    // Remove + if present
    const number = cleaned.replace(/^\+/, '')

    // Valid Ghana phone prefixes (without leading 0)
    const validPrefixes = [
      '20', '23', '24', '25', '26', '27', '28', // Vodafone, AirtelTigo
      '50', '53', '54', '55', '56', '57', '59'  // MTN
    ]

    // Check if starts with 233 (country code)
    if (number.startsWith('233')) {
      const localNumber = number.substring(3)
      if (localNumber.length !== 9) {
        return { valid: false, message: 'Phone number must be 9 digits after country code' }
      }
      const prefix = localNumber.substring(0, 2)
      if (!validPrefixes.includes(prefix)) {
        return { valid: false, message: 'Invalid phone number prefix' }
      }
      return { valid: true, formatted: number }
    }

    // Check if starts with 0 (local format)
    if (number.startsWith('0')) {
      if (number.length !== 10) {
        return { valid: false, message: 'Phone number must be 10 digits (e.g., 0241234567)' }
      }
      const prefix = number.substring(1, 3)
      if (!validPrefixes.includes(prefix)) {
        return { valid: false, message: 'Invalid phone number prefix' }
      }
      // Return with country code
      return { valid: true, formatted: '233' + number.substring(1) }
    }

    // Check if it's 9 digits without prefix
    if (number.length === 9) {
      const prefix = number.substring(0, 2)
      if (!validPrefixes.includes(prefix)) {
        return { valid: false, message: 'Invalid phone number prefix' }
      }
      return { valid: true, formatted: '233' + number }
    }

    return { valid: false, message: 'Invalid phone number format. Use: 0241234567' }
  }

  /**
   * Format phone number for display (local format)
   */
  const formatForDisplay = (phone) => {
    const validation = validateGhanaPhone(phone)
    if (!validation.valid) return phone

    // Convert to local format (0XXXXXXXXX)
    if (validation.formatted.startsWith('233')) {
      return '0' + validation.formatted.substring(3)
    }
    return validation.formatted
  }

  /**
   * Format phone number for storage/API (international format)
   */
  const formatForStorage = (phone) => {
    const validation = validateGhanaPhone(phone)
    if (!validation.valid) return null
    return validation.formatted
  }

  return {
    validateGhanaPhone,
    formatForDisplay,
    formatForStorage
  }
}
