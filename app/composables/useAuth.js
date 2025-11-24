// composables/useAuth.js
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword 
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export const useAuth = () => {
  const user = useState('auth-user', () => null)
  const userRole = useState('auth-role', () => null)
  const authInitialized = useState('auth-initialized', () => false)
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => userRole.value === 'admin')
  const isAttendant = computed(() => userRole.value === 'attendant')

  // Initialize auth state
  const initAuth = async () => {
    // Prevent multiple initializations
    if (authInitialized.value) {
      return user.value
    }
    
    const { $auth, $db } = useNuxtApp()
    
    return new Promise((resolve) => {
      onAuthStateChanged($auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Get user role from Firestore
          const userDoc = await getDoc(doc($db, 'users', firebaseUser.uid))
          const userData = userDoc.data()
          
          user.value = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: userData?.displayName || firebaseUser.email,
            role: userData?.role || 'attendant'
          }
          userRole.value = userData?.role || 'attendant'
        } else {
          user.value = null
          userRole.value = null
        }
        authInitialized.value = true
        resolve(firebaseUser)
      })
    })
  }

  // Login
  const login = async (email, password) => {
    const { $auth, $db } = useNuxtApp()
    
    try {
      const result = await signInWithEmailAndPassword($auth, email, password)
      
      // Get user role
      const userDoc = await getDoc(doc($db, 'users', result.user.uid))
      const userData = userDoc.data()
      
      if (!userData) {
        await signOut($auth)
        throw new Error('User profile not found')
      }
      
      user.value = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: userData.displayName || result.user.email,
        role: userData.role
      }
      userRole.value = userData.role
      
      return { success: true, user: user.value }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    }
  }

  // Logout
  const logout = async () => {
    const { $auth } = useNuxtApp()
    
    try {
      await signOut($auth)
      user.value = null
      userRole.value = null
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false, error: error.message }
    }
  }

  // Register new user (admin only)
  const registerUser = async (email, password, displayName, role, companyId = null) => {
    const { $auth, $db } = useNuxtApp()
    
    try {
      const result = await createUserWithEmailAndPassword($auth, email, password)
      
      // Create user document in Firestore
      const userDoc = {
        email,
        displayName,
        role,
        createdAt: new Date().toISOString(),
        createdBy: user.value?.uid || 'system'
      }
      
      // Add companyId for company-manager and driver roles
      if (companyId && (role === 'company-manager' || role === 'driver')) {
        userDoc.companyId = companyId
      }
      
      await setDoc(doc($db, 'users', result.user.uid), userDoc)
      
      // Sign out the newly created user (don't switch to their account)
      await signOut($auth)
      
      // Re-login the admin
      await initAuth()
      
      return { success: true, uid: result.user.uid }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, error: error.message, message: error.message }
    }
  }

  return {
    user,
    userRole,
    isAuthenticated,
    isAdmin,
    isAttendant,
    initAuth,
    login,
    logout,
    registerUser
  }
}
