// server/api/transactions/[id].put.js
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore'
import { readBody } from 'h3'

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
const NALO_SOURCE = process.env.NALO_SOURCE || 'KrapaShell'

/**
 * Format phone number to international format
 */
function formatPhoneNumber(phone) {
  if (!phone) return null
  let cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('0')) {
    cleaned = '233' + cleaned.substring(1)
  }
  if (!cleaned.startsWith('233')) {
    cleaned = '233' + cleaned
  }
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
    if (!formattedPhone) return null

    const url = `https://sms.nalosolutions.com/smsbackend/clientapi/Resl_Nalo/send-message/?username=${encodeURIComponent(NALO_USERNAME)}&password=${encodeURIComponent(NALO_PASSWORD)}&type=0&destination=${encodeURIComponent(formattedPhone)}&dlr=1&source=${encodeURIComponent(NALO_SOURCE)}&message=${encodeURIComponent(message)}`

    const response = await fetch(url, { method: 'GET' })
    if (!response.ok) return null

    const responseData = await response.text()
    if (responseData.includes(':')) {
      const [code] = responseData.split(':')
      if (parseInt(code) !== 1000 && parseInt(code) >= 1001) return null
    }

    return true
  } catch (error) {
    console.error('SMS send error:', error)
    return null
  }
}

export default defineEventHandler(async (event) => {
  const id = event.context.params.id
  const body = await readBody(event)

  if (!id) {
    event.node.res.statusCode = 400
    return { error: "Transaction ID is required" }
  }

  try {
    const docRef = doc(db, "transactions", id)

    // Check if document exists
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      event.node.res.statusCode = 404
      return { error: "Transaction not found" }
    }

    // Update only allowed fields
    const updates = {}
    if (body.paid !== undefined) updates.paid = !!body.paid
    if (body.driverName) updates.driverName = body.driverName
    if (body.phone !== undefined) updates.phone = body.phone
    if (body.carNumber !== undefined) updates.carNumber = body.carNumber
    if (body.fuelQuantity !== undefined) updates.fuelQuantity = body.fuelQuantity
    if (body.cost !== undefined) updates.cost = body.cost

    await updateDoc(docRef, updates)

    // If transaction was marked as paid, send payment confirmation SMS
    if (body.paid === true && docSnap.data().phone) {
      const transaction = { id, ...docSnap.data(), ...updates }
      const paymentMessage = `Payment Confirmed!\nDriver: ${transaction.driverName}\nAmount: GHS ${parseFloat(transaction.cost).toFixed(2)}\nItem: ${transaction.itemName}\nQty: ${transaction.quantity || transaction.fuelQuantity}\nStatus: PAID\nThank you!`

      sendViaNalo(transaction.phone, paymentMessage).catch(err =>
        console.error('Failed to send payment confirmation SMS:', err)
      )
    }

    return { success: true, id, updates }
  } catch (error) {
    console.error('Error updating transaction:', error)
    event.node.res.statusCode = 500
    return { error: "Failed to update transaction", message: error.message }
  }
})
