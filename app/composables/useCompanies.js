// composables/useCompanies.js
import { collection, getDocs, addDoc, serverTimestamp, query, where } from 'firebase/firestore'

export const useCompanies = () => {
  const { $db } = useNuxtApp() // called inside composable — safe

  const getCompanies = async () => {
    const snap = await getDocs(collection($db, 'companies'))
    const companies = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    
    // Fetch all drivers from drivers collection
    const driversSnap = await getDocs(collection($db, 'drivers'))
    const allDrivers = driversSnap.docs.map(d => ({ 
      id: d.id, 
      uid: d.id, // Include uid for compatibility
      ...d.data() 
    }))
    
    // Merge drivers into their respective companies
    return companies.map(company => {
      const companyDrivers = allDrivers.filter(d => d.companyId === company.id)
      
      // Combine legacy drivers array with drivers collection
      // Drivers from drivers collection take precedence
      const legacyDrivers = company.drivers || []
      const mergedDrivers = [
        ...companyDrivers.map(d => ({
          uid: d.uid,
          id: d.id,
          name: d.name,
          phone: d.phone,
          carNumber: d.carNumber,
          email: d.email
        })),
        // Include legacy drivers that don't have user accounts
        ...legacyDrivers.filter(ld => 
          !companyDrivers.some(cd => cd.name === ld.name && cd.phone === ld.phone)
        )
      ]
      
      return {
        ...company,
        drivers: mergedDrivers
      }
    })
  }

  const addCompany = async (company) => {
    const ref = await addDoc(collection($db, 'companies'), { 
      ...company, 
      drivers: company.drivers || [],
      createdAt: serverTimestamp() 
    })
    return ref.id
  }

  const updateCompany = async (id, updates) => {
    const response = await $fetch(`/api/companies/${id}`, {
      method: 'PUT',
      body: updates
    })
    return response
  }

  return { getCompanies, addCompany, updateCompany }
}