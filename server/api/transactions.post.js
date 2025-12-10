// server/api/transactions.post.js
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'
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
    
    // Return with ISO string for immediate display
    return { id: ref.id, ...doc, createdAt: new Date().toISOString() }
  } catch (error) {
    console.error('Error adding transaction:', error)
    event.node.res.statusCode = 500
    return { error: 'Failed to add transaction', message: error.message }
  }
})

