// server/api/transactions.post.js
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp, doc, getDoc, query, where, getDocs } from 'firebase/firestore'
import { readBody } from 'h3'

// Initialize Firebase safely (prevents re-initialization on hot reloads)
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

/**
 * Send transaction notifications to driver and company managers
 */
async function sendTransactionNotifications(transaction) {
  try {
    // Send to driver if phone number exists
    if (transaction.phone) {
      const driverMessage = `Transaction Recorded!\nItem: ${transaction.itemName}\nQty: ${transaction.quantity} ${transaction.itemUnit || 'L'}\nAmount: GHS ${parseFloat(transaction.cost).toFixed(2)}\nPoints: ${transaction.pointsEarned || 0}\nCompany: ${transaction.company}`
      await sendViaNalo(transaction.phone, driverMessage)
    }

    // Get company managers' phone numbers
    if (transaction.companyId) {
      const usersQuery = query(
        collection(db, 'users'),
        where('companyId', '==', transaction.companyId),
        where('role', '==', 'company-manager')
      )
      
      const managersSnapshot = await getDocs(usersQuery)
      
      for (const managerDoc of managersSnapshot.docs) {
        const manager = managerDoc.data()
        if (manager.phone) {
          // Only send SMS if phone number exists
          const managerMessage = `New Transaction\nDriver: ${transaction.driverName}\nCar: ${transaction.carNumber || 'N/A'}\nItem: ${transaction.itemName}\nQty: ${transaction.quantity}\nAmount: GHS ${parseFloat(transaction.cost).toFixed(2)}\nServed by: ${transaction.servedBy || 'Staff'}`
          await sendViaNalo(manager.phone, managerMessage)
        }
      }
    }
  } catch (error) {
    console.error('Error sending transaction notifications:', error)
    // Don't fail the transaction if SMS fails
  }
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Validate minimal fields (quick guard)
    if (!body.company || !body.driverName) {
      event.node.res.statusCode = 400
      return { error: "Missing required fields: company or driverName" }
    }

    // Build document, use server timestamp for createdAt
    const doc = {
      companyId: body.companyId,   
      company: body.company,
      driverId: body.driverId || "",
      driverName: body.driverName,
      phone: body.phone || "",
      carNumber: body.carNumber || "",
      itemId: body.itemId || "",
      itemName: body.itemName || "",
      itemUnit: body.itemUnit || "",
      quantity: body.quantity || body.fuelQuantity || 0,
      fuelQuantity: body.fuelQuantity || body.quantity || 0, // Keep for backward compatibility
      cost: body.cost || 0,
      pointsEarned: body.pointsEarned || 0,
      couponNumber: body.couponNumber || "",
      photoURL: body.photoURL || "",
      paid: !!body.paid,
      servedBy: body.servedBy || "",
      servedById: body.servedById || "",
      createdAt: serverTimestamp()
    }

    const ref = await addDoc(collection(db, "transactions"), doc)
    
    // Send SMS notifications asynchronously (don't wait for it)
    const transactionWithId = { id: ref.id, ...doc, createdAt: new Date().toISOString() }
    sendTransactionNotifications(transactionWithId).catch(err => 
      console.error('Failed to send SMS notifications:', err)
    )
    
    // Return with ISO string for immediate display
    return transactionWithId
  } catch (error) {
    console.error('Error adding transaction:', error)
    event.node.res.statusCode = 500
    return { error: 'Failed to add transaction', message: error.message }
  }
})

