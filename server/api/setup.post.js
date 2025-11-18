// server/api/setup.post.js
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, setDoc, collection, getDocs } from 'firebase/firestore'
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

const auth = getAuth(app)
const db = getFirestore(app)

export default defineEventHandler(async (event) => {
  try {
    // Check if any users already exist
    const usersSnapshot = await getDocs(collection(db, 'users'))
    if (!usersSnapshot.empty) {
      event.node.res.statusCode = 400
      return { error: 'Setup already completed. Users already exist.' }
    }

    const body = await readBody(event)
    const { email, password, displayName } = body

    if (!email || !password || !displayName) {
      event.node.res.statusCode = 400
      return { error: 'Email, password, and display name are required' }
    }

    // Create the admin user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      displayName: displayName,
      role: 'admin',
      createdAt: new Date().toISOString(),
      createdBy: 'system'
    })

    return {
      success: true,
      message: 'Admin user created successfully',
      user: {
        uid: user.uid,
        email: user.email,
        displayName: displayName
      }
    }
  } catch (error) {
    console.error('Setup error:', error)
    event.node.res.statusCode = 500
    return { error: error.message || 'Failed to create admin user' }
  }
})