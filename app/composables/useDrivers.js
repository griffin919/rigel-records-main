// composables/useDrivers.js
import { collection, query, where, getDocs, getDoc, addDoc, updateDoc, deleteDoc, setDoc, doc } from 'firebase/firestore'

export const useDrivers = () => {
  const { $db } = useNuxtApp()

  // Get drivers for a company
  const getCompanyDrivers = async (companyId) => {
    try {
      const q = query(
        collection($db, 'users'),
        where('companyId', '==', companyId),
        where('role', '==', 'driver')
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().displayName || doc.data().email,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error fetching drivers:', error)
      throw error
    }
  }

  // Get single driver
  const getDriver = async (driverId) => {
    try {
      const docSnap = await getDoc(doc($db, 'users', driverId))
      if (docSnap.exists() && docSnap.data().role === 'driver') {
        return {
          id: docSnap.id,
          name: docSnap.data().displayName || docSnap.data().email,
          ...docSnap.data()
        }
      }
      return null
    } catch (error) {
      console.error('Error fetching driver:', error)
      throw error
    }
  }

  // Add driver (deprecated - use CreateAccount component instead)
  const addDriver = async (driverData) => {
    try {
      // This function is deprecated. Use the CreateAccount component or /api/users endpoint instead.
      console.warn('addDriver is deprecated. Use CreateAccount component or /api/users endpoint.')
      throw new Error('addDriver is deprecated. Use CreateAccount component.')
    } catch (error) {
      console.error('Error adding driver:', error)
      throw error
    }
  }

  // Update driver
  const updateDriver = async (driverId, driverData) => {
    try {
      await updateDoc(doc($db, 'users', driverId), {
        ...driverData,
        updatedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error updating driver:', error)
      throw error
    }
  }

  // Delete driver
  const deleteDriver = async (driverId) => {
    try {
      await deleteDoc(doc($db, 'users', driverId))
    } catch (error) {
      console.error('Error deleting driver:', error)
      throw error
    }
  }

  return {
    getCompanyDrivers,
    getDriver,
    addDriver,
    updateDriver,
    deleteDriver
  }
}
