// composables/useCompanies.js
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'

export const useCompanies = () => {
  const { $db } = useNuxtApp() // called inside composable — safe

  const getCompanies = async () => {
    const snap = await getDocs(collection($db, 'companies'))
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  }

  const addCompany = async (company) => {
    const ref = await addDoc(collection($db, 'companies'), { ...company, createdAt: serverTimestamp() })
    return ref.id
  }

  return { getCompanies, addCompany }
}