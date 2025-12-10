// server/api/transactions.get.js
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, collection, getDocs, query, orderBy, where } from 'firebase/firestore'

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

export default defineEventHandler(async (event) => {
  try {
    // Get userId, userRole, and companyId from query parameters
    const queryParams = getQuery(event)
    const userId = queryParams.userId
    const userRole = queryParams.userRole || 'attendant'
    const companyId = queryParams.companyId
    
    // Build query based on role
    let q
    
    if (userRole === 'admin' || userRole === 'manager') {
      // Admins and managers see all transactions
      q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'))
    } else if (userRole === 'company' || userRole === 'company-manager') {
      // Company and company-managers only see transactions for their company
      if (!companyId) {
        return []
      }
      q = query(
        collection(db, 'transactions'), 
        where('companyId', '==', companyId),
        orderBy('createdAt', 'desc')
      )
    } else if (userRole === 'driver') {
      // Drivers only see their own transactions
      if (!userId) {
        return []
      }
      q = query(
        collection(db, 'transactions'), 
        where('driverId', '==', userId),
        orderBy('createdAt', 'desc')
      )
    } else if (userRole === 'attendant') {
      // Attendants see transactions they served
      if (!userId) {
        return []
      }
      q = query(
        collection(db, 'transactions'), 
        where('servedById', '==', userId),
        orderBy('createdAt', 'desc')
      )
    } else {
      // Unknown role, return empty array
      return []
    }
    
    const snap = await getDocs(q)
    return snap.docs.map(d => {
      const data = d.data()
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null
      }
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return []
  }
})

