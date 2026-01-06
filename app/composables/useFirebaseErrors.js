/**
 * Composable for translating Firebase errors to user-friendly messages
 */

export const useFirebaseErrors = () => {
  const errorMessages = {
    // Auth errors
    'auth/email-already-in-use': 'This email address is already registered. Please use a different email or try logging in.',
    'auth/email-already-exists': 'This email address is already registered. Please use a different email or try logging in.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/invalid-password': 'Password must be at least 6 characters long.',
    'auth/weak-password': 'Password is too weak. Please use at least 6 characters with a mix of letters and numbers.',
    'auth/user-not-found': 'No account found with this email address. Please check and try again.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/operation-not-allowed': 'This operation is not allowed. Please contact support.',
    'auth/invalid-credential': 'Invalid login credentials. Please check your email and password.',
    'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.',
    'auth/requires-recent-login': 'Please log out and log back in to perform this action.',
    'auth/network-request-failed': 'Network error. Please check your internet connection and try again.',
    
    // Firestore errors
    'permission-denied': 'You do not have permission to perform this action.',
    'not-found': 'The requested data was not found.',
    'already-exists': 'This record already exists.',
    'resource-exhausted': 'Too many requests. Please try again later.',
    'failed-precondition': 'Unable to complete this action. Please refresh and try again.',
    'aborted': 'The operation was cancelled. Please try again.',
    'out-of-range': 'Invalid input value.',
    'unimplemented': 'This feature is not available yet.',
    'internal': 'An internal error occurred. Please try again.',
    'unavailable': 'Service temporarily unavailable. Please try again.',
    'data-loss': 'Data error occurred. Please contact support.',
    'unauthenticated': 'Please log in to continue.',
    'invalid-argument': 'Invalid information provided. Please check your input.',
    'deadline-exceeded': 'Request timed out. Please try again.',
    'cancelled': 'Operation was cancelled.',
    
    // Storage errors
    'storage/unauthorized': 'You do not have permission to access this file.',
    'storage/canceled': 'File upload was cancelled.',
    'storage/unknown': 'An unknown error occurred while uploading the file.',
    'storage/object-not-found': 'File not found.',
    'storage/bucket-not-found': 'Storage location not found.',
    'storage/project-not-found': 'Project configuration error.',
    'storage/quota-exceeded': 'Storage quota exceeded.',
    'storage/unauthenticated': 'Please log in to upload files.',
    'storage/retry-limit-exceeded': 'Upload failed after multiple attempts. Please try again.',
    'storage/invalid-checksum': 'File upload verification failed. Please try again.',
    'storage/canceled': 'Upload was cancelled.',
    
    // Network errors
    'network-request-failed': 'Network error. Please check your internet connection.',
    'timeout': 'Request timed out. Please check your connection and try again.',
    
    // Custom app errors
    'invalid-phone': 'Please enter a valid Ghana phone number (e.g., 0241234567).',
    'missing-required-fields': 'Please fill in all required fields.',
  }

  /**
   * Get user-friendly error message from Firebase error
   */
  const getErrorMessage = (error) => {
    if (!error) return 'An unexpected error occurred. Please try again.'

    // Check for error code
    const errorCode = error.code || error.error?.code || ''
    
    // Look up the error message
    if (errorCode && errorMessages[errorCode]) {
      return errorMessages[errorCode]
    }

    // Check if error has a message property
    if (error.message) {
      // Clean up technical Firebase messages
      const message = error.message
      
      // Remove "Firebase: " prefix
      const cleanMessage = message.replace(/^Firebase:\s*/i, '')
      
      // Remove error codes in parentheses at the end
      const withoutCode = cleanMessage.replace(/\s*\([^)]*\)\s*\.?$/, '')
      
      // If we have a cleaned message that's readable, return it
      if (withoutCode.length > 10 && !withoutCode.includes('Error:')) {
        return withoutCode + '.'
      }
    }

    // Check for data.error (API response errors)
    if (error.data?.error) {
      return error.data.error
    }

    // Default message
    return 'Something went wrong. Please try again.'
  }

  /**
   * Check if error is a network error
   */
  const isNetworkError = (error) => {
    const errorCode = error?.code || ''
    return errorCode === 'network-request-failed' || 
           errorCode === 'unavailable' ||
           error?.message?.includes('network') ||
           error?.message?.includes('offline')
  }

  /**
   * Check if error is an authentication error
   */
  const isAuthError = (error) => {
    const errorCode = error?.code || ''
    return errorCode.startsWith('auth/')
  }

  /**
   * Check if error is a permission error
   */
  const isPermissionError = (error) => {
    const errorCode = error?.code || ''
    return errorCode === 'permission-denied' || 
           errorCode === 'unauthenticated'
  }

  return {
    getErrorMessage,
    isNetworkError,
    isAuthError,
    isPermissionError
  }
}
