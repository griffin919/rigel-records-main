// composables/useTransactions.js
export const useTransactions = () => {
  const getTransactions = async () => {
    try {
      return await $fetch('/api/transactions')
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