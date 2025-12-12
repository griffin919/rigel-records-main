<template>
  <main class="overall-itemspage">
    <div v-if="loadError" class="error-state">
      <strong>Error:</strong> {{ loadError }}
    </div>
    
    <div v-if="isLoading" class="loading-state">
      <img src="/shell_logo.svg" alt="Loading" class="loading-logo" />
      <p class="loading-text">Loading...</p>
    </div>
    
    <template v-else>
      <!-- Header -->
        <div class="inventory-card">
          <h1 class="text-3xl font-bold tracking-tight mb-2">Inventory Items</h1>
          <p class="text-muted-foreground">Manage sellable items and their units</p>
        
        <button class="btn" @click="openAddItem">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Add Item
        </button>
    </div>

      <!-- Add/Edit Item Modal -->
      <div v-if="showItemModal" class="modal-backdrop" @click.self="closeItemModal">
        <div class="modal max-w-md">
          <h3 class="text-xl font-semibold mb-4">{{ editingItem ? 'Edit Item' : 'Add Item' }}</h3>
          <form @submit.prevent="handleSaveItem">
            <div class="flex flex-col gap-4">
              <div class="field">
                <label>Item Name</label>
                <input v-model="itemForm.name" required placeholder="e.g., Diesel, Gasoline, Lubricant" />
              </div>
              <div class="field">
                <label>Unit of Measurement</label>
                <input v-model="itemForm.unit" required placeholder="e.g., Liters, Gallons, Bottles" />
                <small class="field-hint">How this item is measured</small>
              </div>
              <div class="field">
                <label>Color</label>
                <input v-model="itemForm.color" type="color" required />
                <small class="field-hint">Visual identifier for this item</small>
              </div>
              <div class="field">
                <label>Price per Unit (GHS) - Optional</label>
                <input v-model.number="itemForm.price" type="number" step="0.01" min="0" placeholder="0.00" />
                <small class="field-hint">Leave blank if price varies</small>
              </div>
              <div class="field">
                <label>Points per Unit</label>
                <input v-model.number="itemForm.points" type="number" step="1" min="0" placeholder="0" required />
                <small class="field-hint">Loyalty points earned per unit purchased</small>
              </div>
              <div class="field">
                <label>Description - Optional</label>
                <textarea v-model="itemForm.description" rows="3" placeholder="Additional details about this item"></textarea>
              </div>
            </div>
            <div class="flex gap-3 mt-6 justify-end">
              <button class="btn secondary" type="button" @click="closeItemModal">
                Cancel
              </button>
              <button class="btn" type="submit" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="btn-spinner"></span>
                {{ isSubmitting ? 'Saving...' : 'Save Item' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Items List -->
      <section class="items-section">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold">All Items</h3>
          <div class="text-sm text-muted-foreground">{{ items.length }} items</div>
        </div>

        <ResponsiveTable 
          :columns="itemColumns" 
          :items="items"
          empty-message="No items yet. Click 'Add Item' to create your first item.">
          <template #cell-name="{ item }">
            <div class="item-cell">
              <span class="w-4 h-4 rounded" :style="{ backgroundColor: item.color || '#666' }"></span>
              <span class="font-semibold">{{ item.name }}</span>
            </div>
          </template>

          <template #cell-color="{ item }">
            <span class="inline-flex items-center gap-2">
              <span class="w-6 h-6 rounded border" :style="{ backgroundColor: item.color || '#666' }"></span>
              {{ item.color || '-' }}
            </span>
          </template>

          <template #cell-price="{ item }">
            <span>{{ item.price ? `GHS ${item.price.toFixed(2)}` : 'Variable' }}</span>
          </template>

          <template #cell-points="{ item }">
            <span class="font-semibold text-yellow-600">{{ item.points || 0 }} pts</span>
          </template>

          <template #cell-description="{ item }">
            <span class="text-muted-foreground">{{ item.description || '-' }}</span>
          </template>

          <template #row-actions="{ item }">
            <div class="flex gap-2">
              <button class="btn-small" @click="openEditItem(item)">
                Edit
              </button>
              <button class="btn-small btn-danger" @click="handleDeleteItem(item)">
                Delete
              </button>
            </div>
          </template>
        </ResponsiveTable>
      </section>
    </template>
  </main>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useItems } from "~/composables/useItems";
import { useNotification } from "~/composables/useNotification";
import ResponsiveTable from "~/components/ResponsiveTable.vue";

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
});

const { getItems, addItem, updateItem, deleteItem } = useItems();
const { success, error } = useNotification();

const items = ref([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const loadError = ref('')
const showItemModal = ref(false)
const editingItem = ref(null)

const itemColumns = computed(() => [
  { key: 'name', label: 'Item Name', width: '1.5' },
  { key: 'unit', label: 'Unit', width: '1' },
  { key: 'color', label: 'Color', width: '1' },
  { key: 'price', label: 'Price (GHS)', width: '1.2' },
  { key: 'points', label: 'Points', width: '0.8' },
  { key: 'description', label: 'Description', width: '1.5' },
])

const itemForm = reactive({
  name: "",
  unit: "",
  color: "#3b82f6",
  price: null,
  points: 0,
  description: ""
});

onMounted(async () => {
  isLoading.value = true
  loadError.value = ''
  try {
    items.value = (await getItems()) || []
  } catch (err) {
    console.error('Load error:', err)
    loadError.value = err?.message || 'Failed to load items'
    error('Failed to load items')
  } finally {
    isLoading.value = false
  }
})

function openAddItem() {
  editingItem.value = null
  resetForm()
  showItemModal.value = true
}

function openEditItem(item) {
  editingItem.value = item
  itemForm.name = item.name
  itemForm.unit = item.unit
  itemForm.color = item.color || "#3b82f6"
  itemForm.price = item.price || null
  itemForm.points = item.points || 0
  itemForm.description = item.description || ""
  showItemModal.value = true
}

function closeItemModal() {
  showItemModal.value = false
  editingItem.value = null
  resetForm()
}

function resetForm() {
  itemForm.name = ""
  itemForm.unit = ""
  itemForm.color = "#3b82f6"
  itemForm.price = null
  itemForm.points = 0
  itemForm.description = ""
}

async function handleSaveItem() {
  if (!itemForm.name.trim() || !itemForm.unit.trim() || !itemForm.color.trim()) {
    error('Please enter item name, unit, and color')
    return
  }

  isSubmitting.value = true
  try {
    const itemData = {
      name: itemForm.name.trim(),
      unit: itemForm.unit.trim(),
      color: itemForm.color.trim(),
      price: itemForm.price || 0,
      points: itemForm.points || 0,
      description: itemForm.description.trim()
    }

    if (editingItem.value) {
      // Update existing item
      await updateItem(editingItem.value.id, itemData)
      const index = items.value.findIndex(i => i.id === editingItem.value.id)
      if (index > -1) {
        items.value[index] = { ...items.value[index], ...itemData }
      }
      success('Item updated successfully!')
    } else {
      // Add new item
      const newItem = await addItem(itemData)
      items.value.push(newItem)
      success('Item added successfully!')
    }

    closeItemModal()
  } catch (err) {
    console.error(err)
    error('Failed to save item')
  } finally {
    isSubmitting.value = false
  }
}

async function handleDeleteItem(item) {
  if (!confirm(`Are you sure you want to delete "${item.name}"?`)) {
    return
  }

  try {
    await deleteItem(item.id)
    items.value = items.value.filter(i => i.id !== item.id)
    success('Item deleted successfully!')
  } catch (err) {
    console.error(err)
    error('Failed to delete item')
  }
}
</script>
