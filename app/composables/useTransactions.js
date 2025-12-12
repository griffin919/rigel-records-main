// composables/useTransactions.js
export const useTransactions = () => {
  const getTransactions = async () => {
    try {
      // Get current user info
      const { user, userRole } = useAuth()
      const params = {}
      
      if (user.value?.uid) {
        params.userId = user.value.uid
        params.userRole = userRole.value || 'attendant'
        
        // Include companyId for company and company-manager roles
        if (userRole.value === 'company' || userRole.value === 'company-manager') {
          // For company role, use their own UID as companyId
          // For company-manager role, use the companyId from their profile
          params.companyId = userRole.value === 'company' ? user.value.uid : user.value.companyId
        }
      }
      
      return await $fetch('/api/transactions', { 
        params 
      })
    } catch (err) {
      console.error('Error fetching transactions:', err)
      throw err
    }
  }

  const addTransaction = async (transaction) => {
    try {
      return await $fetch('/api/transactions', {
        method: 'POST',
        body: transaction
      })
    } catch (err) {
      console.error('Error adding transaction:', err)
      throw err
    }
  }

  const updateTransaction = async (id, updates) => {
    try {
      return await $fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        body: updates
      })
    } catch (err) {
      console.error('Error updating transaction:', err)
      throw err
    }
  }

  return { getTransactions, addTransaction, updateTransaction }
}