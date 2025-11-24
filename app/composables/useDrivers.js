// composables/useDrivers.js
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, setDoc, doc } from 'firebase/firestore'

export const useDrivers = () => {
  const { $db } = useNuxtApp()

  // Get drivers for a company
  const getCompanyDrivers = async (companyId) => {
    try {
      const q = query(
        collection($db, 'drivers'),
        where('companyId', '==', companyId)
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
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
      const docSnap = await getDoc(doc($db, 'drivers', driverId))
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        }
      }
      return null
    } catch (error) {
      console.error('Error fetching driver:', error)
      throw error
    }
  }

  // Add driver
  const addDriver = async (driverData) => {
    try {
      const docRef = await addDoc(collection($db, 'drivers'), {
        ...driverData,
        createdAt: new Date().toISOString()
      })
      return docRef.id
    } catch (error) {
      console.error('Error adding driver:', error)
      throw error
    }
  }

  // Update driver
  const updateDriver = async (driverId, driverData) => {
    try {
      await updateDoc(doc($db, 'drivers', driverId), {
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
      await deleteDoc(doc($db, 'drivers', driverId))
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
