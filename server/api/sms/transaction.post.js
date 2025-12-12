// server/api/sms/transaction.post.js
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'

// Initialize Firebase safely
const app = getApps().length
  ? getApp()
  : initializeApp({
      apiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    })

const db = getFirestore(app)

// Nalo Solutions Configuration
const NALO_USERNAME = process.env.NALO_USERNAME || 'Rigelis'
const NALO_PASSWORD = process.env.NALO_PASSWORD || 'Maestro1985@'
const NALO_SOURCE = process.env.NALO_SOURCE || 'RigelOS'

/**
 * Format phone number to international format (233XXXXXXXXX)
 */
function formatPhoneNumber(phone) {
  if (!phone) return null
  
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '')
  
  // If it starts with 0, replace with 233
  if (cleaned.startsWith('0')) {
    cleaned = '233' + cleaned.substring(1)
  }
  
  // If it doesn't start with 233, add it
  if (!cleaned.startsWith('233')) {
    cleaned = '233' + cleaned
  }
  
  // Should be 12 digits (233 + 9 digits)
  if (cleaned.length !== 12) {
    return null
  }
  
  return cleaned
}

/**
 * Send SMS via Nalo Solutions API
 */
async function sendViaNalo(phoneNumber, message) {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber)
    
    if (!formattedPhone) {
      throw new Error('Invalid phone number format')
    }

    const url = `https://sms.nalosolutions.com/smsbackend/clientapi/Resl_Nalo/send-message/?username=${encodeURIComponent(NALO_USERNAME)}&password=${encodeURIComponent(NALO_PASSWORD)}&type=0&destination=${encodeURIComponent(formattedPhone)}&dlr=1&source=${encodeURIComponent(NALO_SOURCE)}&message=${encodeURIComponent(message)}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Nalo SMS API error: ${response.status} - ${errorText}`)
    }

    const responseData = await response.text()
    
    // Check for Nalo error codes
    if (responseData.includes(':')) {
      const [code] = responseData.split(':')
      const errorCode = parseInt(code)
      
      if (errorCode !== 1000 && errorCode >= 1001) {
        throw new Error(`Nalo SMS error (${errorCode})`)
      }
    }

    return {
      success: true,
      provider: 'nalo',
      messageId: responseData.split(':')[1]?.trim() || null
    }
  } catch (error) {
    console.error('Error sending SMS via Nalo:', error)
    throw error
  }
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { transaction, phoneNumber, recipientType } = body

    if (!transaction || !phoneNumber) {
      return {
        success: false,
        error: 'Missing required fields'
      }
    }

    // Build message based on recipient type
    let message = ''
    
    if (recipientType === 'driver') {
      // Driver notification: transaction recorded
      const itemName = transaction.itemName || 'Fuel'
      const quantity = parseFloat(transaction.quantity).toFixed(2)
      const cost = parseFloat(transaction.cost).toFixed(2)
      const carNumber = transaction.carNumber || 'N/A'
      const couponNumber = transaction.couponNumber || 'N/A'
      const points = transaction.pointsEarned || 0
      
      message = `Dear Client, thank you for your purchase of GHS ${cost} of ${itemName} at Ejisu-Krapa Shell.\nCar No: ${carNumber}.\nCoupon No: ${couponNumber}.\nLoyalty points: ${points}\n#0240431219`
    } else if (recipientType === 'company-manager') {
      // Company manager notification: new transaction
      message = `New Transaction\nDriver: ${transaction.driverName}\nCar: ${transaction.carNumber || 'N/A'}\nItem: ${transaction.itemName}\nQty: ${transaction.quantity} ${transaction.itemUnit || 'L'}\nAmount: GHS ${parseFloat(transaction.cost).toFixed(2)}\nServed by: ${transaction.servedBy || 'Staff'}`
    } else {
      return {
        success: false,
        error: 'Invalid recipient type'
      }
    }

    // Send SMS via Nalo
    const result = await sendViaNalo(phoneNumber, message)

    return {
      success: true,
      message: 'SMS sent successfully',
      ...result
    }
  } catch (error) {
    console.error('Error in transaction SMS endpoint:', error)
    return {
      success: false,
      error: error.message || 'Failed to send SMS'
    }
  }
})
