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

export default defineEventHandler(async (event) => {
  const id = event.context.params.id
  const body = await readBody(event)

  if (!id) {
    event.res.statusCode = 400
    return { error: "Transaction ID is required" }
  }

  try {
    const docRef = doc(db, "transactions", id)
    
    // Check if document exists
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      event.res.statusCode = 404
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

    return { success: true, id, updates }
  } catch (error) {
    console.error('Error updating transaction:', error)
    event.res.statusCode = 500
    return { error: "Failed to update transaction" }
  }
})
