// composables/useSMS.js
export const useSMS = () => {
  /**
   * Send transaction notification via SMS
   * @param {Object} transaction - Transaction details
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} recipientType - 'driver' or 'company-manager'
   */
  const sendTransactionSMS = async (transaction, phoneNumber, recipientType = 'driver') => {
    try {
      const response = await $fetch('/api/sms/transaction', {
        method: 'POST',
        body: {
          transaction,
          phoneNumber,
          recipientType
        }
      })
      
      return response
    } catch (error) {
      console.error('Error sending transaction SMS:', error)
      throw error
    }
  }

  /**
   * Send payment confirmation SMS
   * @param {Object} transaction - Transaction details
   * @param {string} phoneNumber - Recipient phone number
   */
  const sendPaymentConfirmationSMS = async (transaction, phoneNumber) => {
    try {
      const response = await $fetch('/api/sms/payment', {
        method: 'POST',
        body: {
          transaction,
          phoneNumber
        }
      })
      
      return response
    } catch (error) {
      console.error('Error sending payment SMS:', error)
      throw error
    }
  }

  /**
   * Send daily summary SMS to company manager
   * @param {string} phoneNumber - Company manager phone number
   * @param {Object} summary - Daily summary data
   */
  const sendDailySummarySMS = async (phoneNumber, summary) => {
    try {
      const response = await $fetch('/api/sms/daily-summary', {
        method: 'POST',
        body: {
          phoneNumber,
          summary
        }
      })
      
      return response
    } catch (error) {
      console.error('Error sending daily summary SMS:', error)
      throw error
    }
  }

  return {
    sendTransactionSMS,
    sendPaymentConfirmationSMS,
    sendDailySummarySMS
  }
}
