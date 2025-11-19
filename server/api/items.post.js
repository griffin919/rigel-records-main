// server/api/items.post.js
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'
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
  const body = await readBody(event)

  // Validate minimal fields
  if (!body.name || !body.unit) {
    event.res.statusCode = 400
    return { error: "Missing required fields: name or unit" }
  }

  // Build document
  const doc = {
    name: body.name,
    unit: body.unit,
    color: body.color || "#3b82f6",
    price: body.price || 0,
    description: body.description || "",
    createdAt: serverTimestamp()
  }

  const ref = await addDoc(collection(db, "items"), doc)
  
  // Return with ISO string for immediate display
  return { id: ref.id, ...doc, createdAt: new Date().toISOString() }
})
