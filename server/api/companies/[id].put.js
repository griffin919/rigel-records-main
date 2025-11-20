import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, doc, updateDoc } from 'firebase/firestore'
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
  try {
    const id = event.context.params.id
    const body = await readBody(event)

    if (!id) {
      event.node.res.statusCode = 400
      return { error: "Missing company ID" }
    }

    // Update company document
    const companyRef = doc(db, "companies", id)
    await updateDoc(companyRef, body)

    return { success: true }
  } catch (error) {
    console.error('Error updating company:', error)
    event.node.res.statusCode = 500
    return { error: 'Failed to update company', message: error.message }
  }
})
