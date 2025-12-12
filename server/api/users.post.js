import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore'

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

const auth = getAuth(app)
const db = getFirestore(app)

// Permission matrix: which roles can create which roles
const permissionMatrix = {
  admin: ['admin', 'manager', 'attendant', 'company', 'company-manager', 'driver'],
  manager: ['manager', 'attendant', 'company', 'company-manager', 'driver'],
  'company-manager': ['company-manager', 'driver'],
  attendant: [],
  company: [],
  driver: []
}

export default defineEventHandler(async (event) => {
  try {
    // Get request body
    const body = await readBody(event)
    const { email, displayName, password, role, companyId, contact, carNumber, active = true } = body

    // Validate required fields
    if (!email || !displayName || !password || !role) {
      return {
        success: false,
        error: 'Missing required fields'
      }
    }

    // Get the requesting user's ID from headers
    const requestingUserId = event.node.req.headers['x-user-id']
    
    if (!requestingUserId) {
      return {
        success: false,
        error: 'Unauthorized: No user context'
      }
    }

    // Get requesting user's role from Firestore
    const requestingUserDoc = await getDoc(doc(db, 'users', requestingUserId))
    
    if (!requestingUserDoc.exists()) {
      return {
        success: false,
        error: 'Unauthorized: User not found'
      }
    }

    const requestingUserData = requestingUserDoc.data()
    const requestingUserRole = requestingUserData.role

    // Check if requesting user has permission to create this role
    const allowedRoles = permissionMatrix[requestingUserRole] || []
    
    if (!allowedRoles.includes(role)) {
      return {
        success: false,
        error: `Unauthorized: ${requestingUserRole} cannot create ${role} accounts`
      }
    }

    // Validate company assignment
    if (role === 'company-manager' || role === 'driver') {
      if (!companyId) {
        return {
          success: false,
          error: `Company ID is required for ${role} role`
        }
      }

      // If requesting user is company-manager, they can only create accounts for their company
      if (requestingUserRole === 'company-manager') {
        if (requestingUserData.companyId !== companyId) {
          return {
            success: false,
            error: 'Unauthorized: You can only create accounts for your own company'
          }
        }
      }

      // Verify company exists
      const companyDoc = await getDoc(doc(db, 'companies', companyId))
      if (!companyDoc.exists()) {
        return {
          success: false,
          error: 'Company not found'
        }
      }
    }

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const userRecord = userCredential.user

    // Create Firestore user document
    const userDoc = {
      email,
      displayName,
      role,
      active,
      contact: contact || '',
      phone: contact || '',
      createdAt: new Date().toISOString(),
      createdBy: requestingUserId
    }

    // Add carNumber for drivers
    if (role === 'driver' && carNumber) {
      userDoc.carNumber = carNumber
    }

    // Add companyId for company-manager and driver roles
    if (companyId && (role === 'company-manager' || role === 'driver')) {
      userDoc.companyId = companyId
    }

    await setDoc(doc(db, 'users', userRecord.uid), userDoc)

    // Sign out the newly created user
    await signOut(auth)

    // Log the action in audit log
    await addDoc(collection(db, 'audit_logs'), {
      action: 'user_created',
      performedBy: requestingUserId,
      performedByRole: requestingUserRole,
      targetUserId: userRecord.uid,
      targetUserEmail: email,
      targetUserRole: role,
      companyId: companyId || null,
      timestamp: new Date().toISOString(),
      details: {
        displayName,
        active
      }
    })

    return {
      success: true,
      uid: userRecord.uid,
      message: 'User created successfully'
    }
  } catch (error) {
    console.error('Error creating user:', error)
    
    const errorCode = error.code || ''
    
    if (errorCode === 'auth/email-already-in-use' || errorCode === 'auth/email-already-exists') {
      return {
        success: false,
        error: 'Email address is already in use'
      }
    }
    
    if (errorCode === 'auth/invalid-email') {
      return {
        success: false,
        error: 'Invalid email address'
      }
    }
    
    if (errorCode === 'auth/weak-password') {
      return {
        success: false,
        error: 'Password is too weak (minimum 6 characters)'
      }
    }

    return {
      success: false,
      error: error.message || 'Failed to create user'
    }
  }
})
