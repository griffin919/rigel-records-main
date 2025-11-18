import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore'

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

export default defineEventHandler(async () => {
  const snap = await getDocs(collection(db, "companies"))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
})

