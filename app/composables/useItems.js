// composables/useItems.js
export const useItems = () => {
  const getItems = async () => {
    try {
      return await $fetch('/api/items')
    } catch (err) {
      console.error('Error fetching items:', err)
      throw err
    }
  }

  const addItem = async (item) => {
    try {
      return await $fetch('/api/items', {
        method: 'POST',
        body: item
      })
    } catch (err) {
      console.error('Error adding item:', err)
      throw err
    }
  }

  const updateItem = async (id, updates) => {
    try {
      return await $fetch(`/api/items/${id}`, {
        method: 'PUT',
        body: updates
      })
    } catch (err) {
      console.error('Error updating item:', err)
      throw err
    }
  }

  const deleteItem = async (id) => {
    try {
      return await $fetch(`/api/items/${id}`, {
        method: 'DELETE'
      })
    } catch (err) {
      console.error('Error deleting item:', err)
      throw err
    }
  }

  return { getItems, addItem, updateItem, deleteItem }
}
