<template>
  <div class="app-container">
    <!-- Header -->
    <div class="header">
      <div class="header-top">
        <button class="icon-btn">
          <span class="menu-icon">☰</span>
        </button>
        <div class="avatar">{{ userInitial }}</div>
      </div>
      <h1 class="greeting">Hi {{ userName }}!</h1>
      <p class="sub-greeting">{{ greetingMessage }}</p>
    </div>

    <!-- Main Content -->
    <div class="main">
      <!-- Today's Summary -->
      <div class="summary-card">
        <h2>Today's Summary</h2>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="icon">🏢</span>
            <p class="number">{{ todaySummary.companies }}</p>
            <p class="label">Companies</p>
          </div>
          <div class="summary-item">
            <span class="icon">🚚</span>
            <p class="number">{{ todaySummary.vehicles }}</p>
            <p class="label">Vehicles</p>
          </div>
          <div class="summary-item">
            <span class="icon">💵</span>
            <p class="number">{{ todaySummary.amount }}</p>
            <p class="label">GHS</p>
          </div>
        </div>
      </div>

      <!-- Search -->
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search transactions..." 
        />
      </div>

      <!-- Transactions List -->
      <div class="transactions-list">
        <div v-for="transaction in filteredTransactions" :key="transaction.id" class="transaction-card">
          <div class="transaction-flex">
            <div class="fuel-icon" :style="{ backgroundColor: getItemColor(transaction.itemName) }">⛽</div>
            <div class="transaction-details">
              <h3>{{ transaction.company }}</h3>
              <div class="transaction-grid">
                <div>
                  <p>Driver</p>
                  <p>{{ transaction.driverName }}</p>
                </div>
                <div>
                  <p>Item Type</p>
                  <p>{{ transaction.itemName || 'Fuel' }}</p>
                </div>
                <div>
                  <p>Quantity</p>
                  <p>{{ transaction.quantity }} {{ transaction.itemUnit || 'L' }}</p>
                </div>
                <div>
                  <p>Cost</p>
                  <p>GHS {{ transaction.cost }}</p>
                </div>
                <div class="col-span-2">
                  <p>Date & Time</p>
                  <p>{{ formatDate(transaction.createdAt) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredTransactions.length === 0" class="no-transactions">
          <span class="icon-large">⛽</span>
          <p>No transactions yet</p>
          <p>Tap the + button to add a transaction</p>
        </div>
      </div>
    </div>

    <!-- Floating Add Button -->
    <button class="floating-btn" @click="showForm = true">+</button>

    <!-- Form Modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal">
        <div class="modal-header">
          <h2>New Transaction</h2>
          <button class="close-btn" @click="showForm = false">×</button>
        </div>

        <div class="modal-content">
          <div v-if="isLoading" class="loading-state">
            <div class="spinner"></div>
            <p>Loading companies...</p>
          </div>

          <form v-else @submit.prevent="submitEntry">
            <div class="form-group">
              <label>Select Company</label>
              <select v-model="form.company" required :disabled="isSubmitting" @change="onCompanyChange">
                <option value="">-- Select company --</option>
                <option v-for="c in companies" :key="c.id" :value="c">{{ c.name }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>Select Driver</label>
              <select v-model="selectedDriver" required :disabled="isSubmitting || !form.company">
                <option value="">
                  {{ form.company ? '-- Select driver --' : 'Select a company first' }}
                </option>
                <option 
                  v-for="(driver, index) in availableDrivers" 
                  :key="index" 
                  :value="driver"
                >{{ driver.name }} ({{ driver.phone }}) - {{ driver.carNumber }}</option>
              </select>
              <small v-if="!form.company" style="display: block; margin-top: 0.25rem; font-size: 0.75rem; color: #6b7280;">Select a company first</small>
              <small v-else-if="!availableDrivers.length" style="display: block; margin-top: 0.25rem; font-size: 0.75rem; color: #f59e0b;">
                No drivers available. Contact admin to add drivers to this company.
              </small>
            </div>

            <div class="form-group">
              <label>Car Number</label>
              <input v-model="form.carNumber" type="text" placeholder="GW-1234-20" required :disabled="isSubmitting" readonly />
              <small style="display: block; margin-top: 0.25rem; font-size: 0.75rem; color: #6b7280;">Auto-filled from selected driver</small>
            </div>

            <div class="form-group">
              <label>Select Item</label>
              <select v-model="form.selectedItem" required :disabled="isSubmitting">
                <option value="">-- Select item --</option>
                <option v-for="item in items" :key="item.id" :value="item">
                  {{ item.name }} ({{ item.unit }})
                </option>
              </select>
              <div v-if="form.selectedItem" style="margin-top: 0.5rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem;">
                <span style="width: 1rem; height: 1rem; border-radius: 0.25rem; border: 1px solid #e5e7eb;" :style="{ backgroundColor: form.selectedItem.color }"></span>
                <span style="font-weight: 500;">{{ form.selectedItem.name }}</span>
              </div>
              <small v-if="!items.length" style="display: block; margin-top: 0.25rem; font-size: 0.75rem; color: #f59e0b;">
                No items available. Contact admin to add items.
              </small>
            </div>

            <div class="form-group">
              <label>Quantity</label>
              <input 
                v-model.number="form.quantity" 
                type="number" 
                step="0.1" 
                min="0.1" 
                required 
                :disabled="isSubmitting" 
                :placeholder="form.selectedItem ? `Enter quantity in ${form.selectedItem.unit}` : 'Select item first'" 
              />
              <small v-if="form.selectedItem" style="display: block; margin-top: 0.25rem; font-size: 0.75rem; color: #6b7280;">Unit: {{ form.selectedItem.unit }}</small>
            </div>

            <div class="form-group">
              <label>Cost (GHS)</label>
              <input v-model.number="form.cost" type="number" step="0.01" min="0.01" required :disabled="isSubmitting" placeholder="Enter cost in GHS" />
            </div>

            <div class="form-group">
              <label>Coupon Number (Optional)</label>
              <input v-model="form.couponNumber" type="text" placeholder="Enter coupon number" :disabled="isSubmitting" />
              <small style="display: block; margin-top: 0.25rem; font-size: 0.75rem; color: #6b7280;">Some companies provide coupons to drivers</small>
            </div>

            <div class="form-group">
              <label>Photo Evidence (Optional)</label>
              <input 
                type="file" 
                accept="image/*" 
                @change="handlePhotoUpload" 
                :disabled="isSubmitting || isUploadingPhoto"
                ref="photoInput"
              />
              <small style="display: block; margin-top: 0.25rem; font-size: 0.75rem; color: #6b7280;">Upload photo of pump price and car presence</small>
              <div v-if="isUploadingPhoto" style="margin-top: 0.5rem; font-size: 0.875rem; color: #3b82f6;">
                <span class="btn-spinner" style="display: inline-block;"></span>
                Uploading photo...
              </div>
              <div v-if="form.photoURL" style="margin-top: 0.5rem;">
                <img :src="form.photoURL" alt="Evidence photo" style="max-width: 16rem; border-radius: 0.5rem; border: 1px solid #e5e7eb;" />
                <button 
                  type="button" 
                  style="font-size: 0.875rem; color: #dc2626; margin-top: 0.25rem; background: none; border: none; cursor: pointer; padding: 0.25rem;" 
                  @click="removePhoto"
                  :disabled="isSubmitting"
                >
                  Remove photo
                </button>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" @click="clearForm" :disabled="isSubmitting">Clear Form</button>
              <button type="submit" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="btn-spinner"></span>
                {{ isSubmitting ? 'Submitting...' : 'Submit Entry' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCompanies } from '~/composables/useCompanies'
import { useTransactions } from '~/composables/useTransactions'
import { useNotification } from '~/composables/useNotification'
import { useItems } from '~/composables/useItems'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { getStorage } from 'firebase/storage'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const { getTransactions, addTransaction } = useTransactions()
const { success, error } = useNotification()

/* shared state */
const companies = ref([])
const { getCompanies } = useCompanies()
const items = ref([])
const { getItems } = useItems()

const transactions = ref([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const isUploadingPhoto = ref(false)
const searchQuery = ref('')
const selectedDriver = ref('')
const photoInput = ref(null)
const showForm = ref(false)

const availableDrivers = computed(() => {
  if (!form.company || !form.company.drivers) return [];
  return form.company.drivers || [];
})

// User info
const userName = ref('Attendant')
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())
const greetingMessage = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
})

onMounted(async () => {
  isLoading.value = true
  try {
    companies.value = await getCompanies()
    items.value = await getItems()
    transactions.value = await getTransactions()
  } catch (err) {
    console.error(err)
    error('Failed to load data')
  } finally {
    isLoading.value = false
  }
})

const form = reactive({
  company: '',
  driverName: '',
  phone: '',
  carNumber: '',
  selectedItem: '',
  quantity: null,
  cost: null,
  couponNumber: '',
  photoURL: ''
})

// Watch for driver selection changes
watch(selectedDriver, (driver) => {
  if (driver) {
    form.driverName = driver.name;
    form.phone = driver.phone;
    form.carNumber = driver.carNumber || '';
  } else {
    form.driverName = '';
    form.phone = '';
    form.carNumber = '';
  }
})

function onCompanyChange() {
  // Reset driver selection when company changes
  selectedDriver.value = '';
  form.driverName = '';
  form.phone = '';
  form.carNumber = '';
}

// Photo upload handler
async function handlePhotoUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    error('Please upload an image file')
    return
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    error('Image size must be less than 5MB')
    return
  }

  isUploadingPhoto.value = true
  try {
    const storage = getStorage()
    const timestamp = Date.now()
    const filename = `transaction-photos/${timestamp}-${file.name}`
    const fileRef = storageRef(storage, filename)
    
    await uploadBytes(fileRef, file)
    const downloadURL = await getDownloadURL(fileRef)
    
    form.photoURL = downloadURL
    success('Photo uploaded successfully!')
  } catch (err) {
    console.error('Upload error:', err)
    error('Failed to upload photo. Please try again.')
  } finally {
    isUploadingPhoto.value = false
  }
}

function removePhoto() {
  form.photoURL = ''
  if (photoInput.value) {
    photoInput.value.value = ''
  }
}

// Validation
const validatePhone = (phone) => {
  // Ghana phone format: 10 digits starting with 0, or with country code
  const pattern = /^(\+233|0)[0-9]{9}$/
  return pattern.test(phone.replace(/\s/g, ''))
}

const validateForm = () => {
  if (!form.company) {
    error('Please select a company')
    return false
  }
  if (!form.driverName.trim()) {
    error('Please enter driver name')
    return false
  }
  if (!form.phone.trim()) {
    error('Please enter phone number')
    return false
  }
  if (!validatePhone(form.phone)) {
    error('Invalid phone number format. Use Ghana format (e.g., 0241234567)')
    return false
  }
  if (!form.selectedItem) {
    error('Please select an item')
    return false
  }
  if (!form.quantity || form.quantity <= 0) {
    error('Quantity must be greater than 0')
    return false
  }
  if (!form.cost || form.cost <= 0) {
    error('Cost must be greater than 0')
    return false
  }
  return true
}

async function submitEntry() {
  if (!validateForm()) return

  isSubmitting.value = true
  try {
    // Submit transaction
    await addTransaction({
      companyId: form.company.id,
      company: form.company.name,
      driverName: form.driverName,
      phone: form.phone,
      carNumber: form.carNumber,
      itemId: form.selectedItem.id,
      itemName: form.selectedItem.name,
      itemUnit: form.selectedItem.unit,
      quantity: form.quantity,
      cost: form.cost,
      couponNumber: form.couponNumber || '',
      photoURL: form.photoURL || '',
      paid: false
    })

    // Refresh transactions immediately
    transactions.value = await getTransactions()

    success('Entry recorded successfully!')
    clearForm()
    showForm.value = false
  } catch (err) {
    console.error(err)
    error('Failed to record entry. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

function clearForm() {
  form.company = ''
  form.driverName = ''
  form.phone = ''
  form.carNumber = ''
  form.selectedItem = ''
  form.quantity = null
  form.cost = null
  form.couponNumber = ''
  form.photoURL = ''
  selectedDriver.value = ''
  if (photoInput.value) {
    photoInput.value.value = ''
  }
}

function formatDate(dt) {
  if (!dt) return '-'
  const date = new Date(dt)
  return date.toLocaleDateString() + ' • ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function getItemColor(itemName) {
  const item = items.value.find(i => i.name === itemName)
  return item?.color || '#FFC800'
}

const filteredTransactions = computed(() => {
  if (!searchQuery.value.trim()) {
    return transactions.value
  }
  const query = searchQuery.value.toLowerCase()
  return transactions.value.filter(t => 
    t.company?.toLowerCase().includes(query) ||
    t.driverName?.toLowerCase().includes(query) ||
    t.phone?.includes(query) ||
    t.carNumber?.toLowerCase().includes(query)
  )
})

const todaySummary = computed(() => {
  const today = new Date().toDateString()
  const todayTransactions = transactions.value.filter(t => {
    const transactionDate = new Date(t.createdAt).toDateString()
    return transactionDate === today
  })
  
  return {
    companies: new Set(todayTransactions.map(t => t.company)).size,
    vehicles: todayTransactions.length,
    amount: todayTransactions.reduce((sum, t) => sum + parseFloat(t.cost || 0), 0).toFixed(2)
  }
})

</script>