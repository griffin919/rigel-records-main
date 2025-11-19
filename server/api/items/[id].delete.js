// server/api/items/[id].delete.js
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, doc, deleteDoc } from 'firebase/firestore'

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

  const itemRef = doc(db, 'items', id)
  await deleteDoc(itemRef)

  return { success: true }
})
