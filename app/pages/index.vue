<template>
  <div class="app-container">
    <!-- Main Content Wrapper -->
    <div class="content-wrapper">


      <!-- Main Content -->
      <div class="main">

        <!-- Today's Summary -->
        <div class="summary-card">
          <div class="todays-sales">
            <div class="sales-label">
              <h2>Today's Sales</h2>
            </div>
            <div class="sales-amount">
              <p class="amount-value"> {{ todaySummary.amount }}</p>
            </div>
          </div>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-icon-wrapper">
                <BuildingOfficeIcon class="summary-icon" />
              </div>
              <p class="number">{{ todaySummary.companies }}</p>
              <p class="label">Companies</p>
            </div>
            <div class="summary-item">
              <div class="summary-icon-wrapper">
                <TruckIcon class="summary-icon" />
              </div>
              <p class="number">{{ todaySummary.vehicles }}</p>
              <p class="label">Vehicles</p>
            </div>
          </div>
        </div>

        <!-- Search -->
        <div class="search-bar">
          <MagnifyingGlassIcon class="search-icon" />
          <input type="text" v-model="searchQuery" placeholder="Search transactions..." />
        </div>

        <!-- Transactions Table -->
        <ResponsiveTable :columns="tableColumns" :items="filteredTransactions"
          empty-message="No transactions yet. Tap the + button to add one.">
          <template #cell-company="{ item }">
            <div class="company-cell">
              <div class="company-badge" :style="{ backgroundColor: getItemColor(item.itemName) }">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M5 20V5.616q0-.691.463-1.153T6.616 4h4.769q.69 0 1.153.463T13 5.616v6h.923q.667 0 1.141.474t.475 1.14v4.578q0 .54.383.924q.384.384.924.384t.924-.384t.384-.924v-6.816q-.225.144-.475.211q-.25.066-.525.066q-.792 0-1.338-.546t-.547-1.339q0-.684.409-1.206t1.076-.644l-2.408-2.407l.627-.627l3.43 3.408q.299.298.467.684t.168.792v8.424q0 .92-.634 1.556q-.635.636-1.554.636t-1.558-.636t-.638-1.556v-4.692q0-.27-.173-.443t-.442-.173H13V20zm1-9.5h6V5.616q0-.231-.192-.424T11.385 5h-4.77q-.23 0-.423.192T6 5.616zm11.154-.115q.425 0 .712-.288t.288-.712t-.288-.713t-.712-.288t-.713.288t-.287.712t.287.713t.713.288" />
                </svg>
              </div>
              <span>{{ item.company }}</span>
            </div>
          </template>

          <template #cell-driverName="{ item }">
            <div class="driver-info">
              <div class="driver-name">{{ item.driverName }}</div>
              <div class="driver-phone">{{ item.phone }}</div>
            </div>
          </template>

          <template #cell-item="{ item }">
            <div class="item-cell">
              <span class="item-color" :style="{ backgroundColor: getItemColor(item.itemName) }"></span>
              <span>{{ item.itemName || 'Fuel' }}</span>
            </div>
          </template>

          <template #cell-quantity="{ item }">
            {{ item.quantity }} {{ item.itemUnit || 'L' }}
          </template>

          <template #cell-cost="{ item }">
            <span>GHS {{ item.cost }}</span>
          </template>

          <template #cell-photo="{ item }">
            <a v-if="item.photoURL" :href="item.photoURL" target="_blank" class="photo-link">
              <img :src="item.photoURL" alt="Transaction photo" class="transaction-photo" />
            </a>
            <span v-else class="text-muted">-</span>
          </template>

          <template #cell-date="{ item }">
            <div class="date-cell">{{ formatDate(item.createdAt) }}</div>
          </template>
        </ResponsiveTable>
      </div>

      <!-- Floating Add Button -->
 


      <button class="floating-btn" @click="showForm = true">+</button>


      <!-- Form Modal -->
      <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
        <div class="modal">
          <div class="modal-header">
            <h2>New Transaction</h2>
            <button class="close-btn" @click="showForm = false">
              <XMarkIcon class="close-icon" />
            </button>
          </div>

          <div class="modal-content">
            <div v-if="isLoading" class="loading-state">
              <img src="/shell_logo.svg" alt="Loading" class="loading-logo" />
              <p class="loading-text">Loading...</p>
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
                  <option v-for="(driver, index) in availableDrivers" :key="index" :value="driver">{{ driver.name }} ({{
                    driver.phone }}) - {{ driver.carNumber }}</option>
                </select>
                <small v-if="!form.company"
                  style="display: block; margin-top: 0.25rem; font-size: 0.75rem; color: #6b7280;">Select a company
                  first</small>
                <small v-else-if="!availableDrivers.length"
                  style="display: block; margin-top: 0.25rem; font-size: 0.75rem; color: #f59e0b;">
                  No drivers available. Contact admin to add drivers to this company.
                </small>
              </div>

              <div class="form-group">
                <label>Car Number</label>
                <input v-model="form.carNumber" type="text" placeholder="GW-1234-20" required :disabled="isSubmitting"
                  readonly />
                <small style="display: block; margin-top: 0.25rem; font-size: 0.75rem; color: #6b7280;">Auto-filled from
                  selected driver</small>
              </div>

              <div class="form-group">
                <label>Select Item</label>
                <select v-model="form.selectedItem" required :disabled="isSubmitting">
                  <option value="">-- Select item --</option>
                  <option v-for="item in items" :key="item.id" :value="item">
                    {{ item.name }} ({{ item.unit }})
                  </option>
                </select>
                <div v-if="form.selectedItem"
                  style="margin-top: 0.5rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem;">
                  <span style="width: 1rem; height: 1rem; border-radius: 0.25rem; border: 1px solid #e5e7eb;"
                    :style="{ backgroundColor: form.selectedItem.color }"></span>
                  <span style="font-weight: 500;">{{ form.selectedItem.name }}</span>
                </div>
                <small v-if="!items.length"
                  style="display: block; margin-top: 0.25rem; font-size: 0.75rem; color: #f59e0b;">
                  No items available. Contact admin to add items.
                </small>
              </div>

              <div class="form-group">
                <label>Quantity</label>
                <input v-model.number="form.quantity" type="number" step="0.1" min="0.1" required
                  :disabled="isSubmitting"
                  :placeholder="form.selectedItem ? `Enter quantity in ${form.selectedItem.unit}` : 'Select item first'" />
                <small v-if="form.selectedItem"
                  style="display: block; margin-top: 0.25rem; font-size: 0.75rem; color: #6b7280;">Unit: {{
                    form.selectedItem.unit }}</small>
              </div>

              <div class="form-group">
                <label>Cost (GHS)</label>
                <input v-model.number="form.cost" type="number" step="0.01" min="0.01" required :disabled="isSubmitting"
                  placeholder="Enter cost in GHS" />
              </div>

              <div class="form-group">
                <label>Coupon Number (Optional)</label>
                <input v-model="form.couponNumber" type="text" placeholder="Enter coupon number"
                  :disabled="isSubmitting" />
                <small style="display: block; margin-top: 0.25rem; font-size: 0.75rem; color: #6b7280;">Some companies
                  provide coupons to drivers</small>
              </div>

              <div class="form-group">
                <label>Photo Evidence (Optional)</label>
                <input type="file" accept="image/*" @change="handlePhotoUpload"
                  :disabled="isSubmitting || isUploadingPhoto" ref="photoInput" />
                <small style="display: block; margin-top: 0.25rem; font-size: 0.75rem; color: #6b7280;">Upload photo of
                  pump
                  price and car presence</small>
                <div v-if="isUploadingPhoto" style="margin-top: 0.5rem; font-size: 0.875rem; color: #3b82f6;">
                  <span class="btn-spinner" style="display: inline-block;"></span>
                  Uploading photo...
                </div>
                <div v-if="form.photoURL" style="margin-top: 0.5rem;">
                  <img :src="form.photoURL" alt="Evidence photo"
                    style="max-width: 16rem; border-radius: 0.5rem; border: 1px solid #e5e7eb;" />
                  <button type="button"
                    style="font-size: 0.875rem; color: #dc2626; margin-top: 0.25rem; background: none; border: none; cursor: pointer; padding: 0.25rem;"
                    @click="removePhoto" :disabled="isSubmitting">
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
    </div> <!-- Close content-wrapper -->
  </div> <!-- Close app-container -->
</template>

<script setup>
import { useCompanies } from '~/composables/useCompanies'
import { useTransactions } from '~/composables/useTransactions'
import { useNotification } from '~/composables/useNotification'
import { useItems } from '~/composables/useItems'
import { useAuth } from '~/composables/useAuth'
import { useDrivers } from '~/composables/useDrivers'
import { usePhoneValidation } from '~/composables/usePhoneValidation'
import { useFirebaseErrors } from '~/composables/useFirebaseErrors'
import ResponsiveTable from '~/components/ResponsiveTable.vue'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { getStorage } from 'firebase/storage'
// Heroicons
import {
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
  CreditCardIcon,
  TruckIcon,
  BuildingOfficeIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'attendant']
})

const { getTransactions, addTransaction } = useTransactions()
const { success, error } = useNotification()
const { user, userRole } = useAuth()
const { getCompanyDrivers } = useDrivers()
const { validateGhanaPhone, formatForStorage } = usePhoneValidation()
const { getErrorMessage } = useFirebaseErrors()

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
const companyDrivers = ref([])

const availableDrivers = computed(() => {
  return companyDrivers.value.map(driver => ({
    uid: driver.id,
    name: driver.displayName || driver.email,
    phone: driver.contact || driver.phone || '',
    carNumber: driver.carNumber || ''
  }))
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
    error(getErrorMessage(err))
  } finally {
    isLoading.value = false
  }
})

const form = reactive({
  company: '',
  driverId: '',
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
    form.driverId = driver.uid || driver.id || '';
    form.driverName = driver.name;
    form.phone = driver.phone;
    form.carNumber = driver.carNumber || '';
  } else {
    form.driverId = '';
    form.driverName = '';
    form.phone = '';
    form.carNumber = '';
  }
})

async function onCompanyChange() {
  // Reset driver selection when company changes
  selectedDriver.value = '';
  form.driverId = '';
  form.driverName = '';
  form.phone = '';
  form.carNumber = '';
  
  // Load drivers for the selected company
  if (form.company && form.company.id) {
    try {
      companyDrivers.value = await getCompanyDrivers(form.company.id)
    } catch (err) {
      console.error('Failed to load drivers:', err)
      companyDrivers.value = []
    }
  } else {
    companyDrivers.value = []
  }
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
    error(getErrorMessage(err))
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
  
  // Validate phone using Ghana phone validation
  const phoneValidation = validateGhanaPhone(form.phone)
  if (!phoneValidation.valid) {
    error(phoneValidation.message)
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
    // Format phone number for storage
    const formattedPhone = formatForStorage(form.phone)
    
    // Calculate points earned: item points × quantity
    const pointsEarned = (form.selectedItem.points || 0) * form.quantity

    const transactionData = {
      companyId: form.company.id,
      company: form.company.name,
      driverId: form.driverId || '',
      driverName: form.driverName,
      phone: formattedPhone,
      carNumber: form.carNumber,
      itemId: form.selectedItem.id,
      itemName: form.selectedItem.name,
      itemUnit: form.selectedItem.unit,
      quantity: form.quantity,
      cost: form.cost,
      pointsEarned: pointsEarned,
      couponNumber: form.couponNumber || '',
      photoURL: form.photoURL || '',
      paid: false,
      servedBy: user.value?.displayName || user.value?.email || 'Attendant',
      servedById: user.value?.uid || ''
    }
    
    console.log('Creating transaction with driverId:', transactionData.driverId)

    // Submit transaction
    await addTransaction(transactionData)

    // Refresh transactions immediately
    transactions.value = await getTransactions()

    success('Entry recorded successfully!')
    clearForm()
    showForm.value = false
  } catch (err) {
    console.error(err)
    error(getErrorMessage(err))
  } finally {
    isSubmitting.value = false
  }
}

function clearForm() {
  form.company = ''
  form.driverId = ''
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

function navigateToAdmin() {
  navigateTo('/admin/reports')
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

const tableColumns = computed(() => [
  { key: 'company', label: 'Company', width: '1.2' },
  { key: 'driverName', label: 'Driver', width: '1.2' },
  { key: 'item', label: 'Item', width: '1' },
  { key: 'quantity', label: 'Quantity', width: '1' },
  { key: 'cost', label: 'Cost', width: '0.8' },
  { key: 'photo', label: 'Photo', width: '0.8' },
  { key: 'date', label: 'Date & Time', width: '1.2' },
])

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

<style scoped>
/* Modern mobile-first design */
.app-container {
  min-height: 100vh;
  background: #f9fafb;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
}

/* Content Wrapper */
.content-wrapper {
  flex: 1;
  width: 100%;
  min-height: 100vh;
  padding-bottom: 5rem;
}

.header {
  background: white;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 40;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.icon-btn {
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  background: none;
  border: none;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: #f3f4f6;
}

.menu-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #374151;
}

.mobile-only {
  display: block;
}

.avatar {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(to bottom right, #FFC800, #DD1D21);
  color: white;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.125rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.greeting {
  font-size: 1.875rem;
  font-weight: bold;
  color: #111827;
  margin: 0;
}

.sub-greeting {
  color: #6b7280;
  margin-top: 0.25rem;
  font-size: 0.875rem;
}

.main {
  margin: auto;
  padding: 1.5rem;
  padding-bottom: 5rem;
}

.admin-access-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  width: 100%;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #FFC800, #DD1D21);
  color: white;
  border: none;
  border-radius: 1rem;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
  transition: all 0.3s ease;
  letter-spacing: 0.01em;
}

.admin-access-btn svg {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.admin-access-btn:hover {
  background: linear-gradient(135deg, #7e22ce 0%, #6b21a8 50%, #581c87 100%);
  box-shadow: 0 6px 16px rgba(147, 51, 234, 0.4);
  transform: translateY(-2px);
}

.admin-access-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
}

.summary-card {
  border-radius: 1.5rem;
  margin-bottom: 1.5rem;
  color: white;
}

.summary-card h2 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  opacity: 0.95;
}

.summary-grid {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}

.summary-item {
  background: white;
  width: 48%;
  border-radius: 1rem;
  padding: 1.25rem 1rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.summary-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.summary-item .icon {
  font-size: 1.5rem;
  display: block;
  margin-bottom: 0.5rem;
}

.summary-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #FFC800 0%, #DD1D21 100%);
  margin: 0 auto 0.75rem;
}

.summary-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: white;
}

.summary-item .number {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #111827;
}

.summary-item .label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
  font-weight: 600;
}

.summary-info {
  background: linear-gradient(135deg, #FFC800 0%, #DD1D21 100%);
}

.search-bar {
  position: relative;
  margin-bottom: 1.5rem;
}

.search-bar .search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
  pointer-events: none;
}

.search-bar input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  outline: none;
  font-size: 0.9375rem;
  background: white;
  transition: all 0.2s;
}

.search-bar input:focus {
  border-color: #FFC800;
  box-shadow: 0 0 0 3px rgba(255, 200, 0, 0.1);
}

/* Compact Table Integration */
.company-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #111827;
}

.company-badge {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.company-badge svg {
  width: 1rem;
  height: 1rem;
}

.driver-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.driver-name {
  font-weight: 500;
  color: #111827;
}

.driver-phone {
  font-size: 0.8125rem;
  color: #9ca3af;
}

.item-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #111827;
  font-weight: 500;
}

.item-color {
  width: 1rem;
  height: 1rem;
  border-radius: 0.375rem;
  flex-shrink: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.cost-badge {
  background: linear-gradient(135deg, #FFC800, #DD1D21);
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.8125rem;
  display: inline-block;
  box-shadow: 0 2px 4px rgba(221, 29, 33, 0.2);
}

.date-cell {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Transaction Photo */
.photo-link {
  display: inline-block;
  cursor: pointer;
  transition: transform 0.2s;
}

.photo-link:hover {
  transform: scale(1.05);
}

.transaction-photo {
  width: 3rem;
  height: 3rem;
  object-fit: cover;
  border-radius: 0.5rem;
  border: 2px solid #e5e7eb;
  transition: all 0.2s;
}

.transaction-photo:hover {
  border-color: #FFC800;
  box-shadow: 0 2px 8px rgba(255, 200, 0, 0.3);
}

.text-muted {
  color: #9ca3af;
  font-size: 0.75rem;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.transaction-card {
  background: white;
  padding: 1rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
  transition: all 0.2s;
}

.transaction-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.transaction-flex {
  display: flex;
  gap: 1rem;
}

.fuel-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  font-size: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.transaction-details {
  flex: 1;
  min-width: 0;
}

.transaction-details h3 {
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #111827;
  font-size: 1rem;
}

.transaction-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  font-size: 0.875rem;
}

.transaction-grid div p:first-child {
  color: #6b7280;
  margin: 0;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.transaction-grid div p:last-child {
  color: #111827;
  margin: 0.125rem 0 0 0;
  font-weight: 600;
}

.col-span-2 {
  grid-column: span 2;
}

.no-transactions {
  text-align: center;
  padding: 4rem 2rem;
  color: #9ca3af;
  background: white;
  border-radius: 1rem;
  border: 2px dashed #e5e7eb;
}

.no-transactions .icon-large {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
  opacity: 0.3;
}

.no-transactions .icon-large svg {
  width: 3rem;
  height: 3rem;
}

.no-transactions p {
  margin: 0.5rem 0;
  font-size: 0.9375rem;
}

.no-transactions p:first-of-type {
  font-weight: 600;
  color: #6b7280;
  font-size: 1.125rem;
}

.floating-btn {
  display: flex;
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #FFC800, #DD1D21);
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  cursor: pointer;
  border: none;
  box-shadow: 0 8px 16px rgba(221, 29, 33, 0.4);
  transition: all 0.3s;
  z-index: 50;
  font-weight: 300;
  line-height: 1;
}

.floating-btn-left {
  display: flex;
  position: fixed;
  bottom: 6rem;
  right: 1.5rem;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #FFC800, #DD1D21);
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  cursor: pointer;
  border: none;
  box-shadow: 0 8px 16px rgba(221, 29, 33, 0.4);
  transition: all 0.3s;
  z-index: 50;
  font-weight: 300;
  line-height: 1;
}


.floating-btn:hover {
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 12px 24px rgba(221, 29, 33, 0.5);
}

.floating-btn:active {
  transform: scale(0.95) rotate(90deg);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.modal {
  background: white;
  width: 100%;
  max-width: 40rem;
  border-radius: 1.5rem 1.5rem 0 0;
  padding: 1.5rem;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.close-btn {
  padding: 0.5rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  background: #f3f4f6;
  color: #6b7280;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #111827;
  transform: rotate(90deg);
}

.modal-content .form-group {
  margin-bottom: 1.25rem;
}

.modal-content label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.todays-sales {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #FFC800, #DD1D21);
  border-radius: 1rem;
  margin-bottom: 1rem;
  padding: 0.75rem 1.5rem;
  box-shadow: 0 4px 12px rgba(221, 29, 33, 0.2);
}

.sales-label h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  opacity: 0.95;
}

.sales-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.amount-value {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.modal-content select,
.modal-content input[type="text"],
.modal-content input[type="number"] {
  width: 100%;
  padding: 0.875rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  outline: none;
  font-size: 0.9375rem;
  background: white;
  transition: all 0.2s;
}

.modal-content select:focus,
.modal-content input:focus {
  border-color: #FFC800;
  box-shadow: 0 0 0 3px rgba(255, 200, 0, 0.1);
}

.modal-content input:disabled,
.modal-content select:disabled {
  background: #f9fafb;
  cursor: not-allowed;
  opacity: 0.6;
}

.modal-content input[type="file"] {
  padding: 0.5rem;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}

.form-actions button {
  flex: 1;
  padding: 0.875rem 1.5rem;
  border-radius: 0.75rem;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9375rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.form-actions button:first-child {
  background: #f3f4f6;
  color: #374151;
}

.form-actions button:first-child:hover {
  background: #e5e7eb;
}

.form-actions button:last-child {
  background: linear-gradient(135deg, #FFC800, #DD1D21);
  color: white;
  box-shadow: 0 2px 4px rgba(221, 29, 33, 0.3);
}

.form-actions button:last-child:hover {
  box-shadow: 0 4px 8px rgba(221, 29, 33, 0.4);
  transform: translateY(-1px);
}

.form-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.loading-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid #f3f4f6;
  border-top-color: #FFC800;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.btn-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .modal {
    border-radius: 1.5rem;
    max-height: 85vh;
  }

  .content-wrapper {
    padding-bottom: 2rem;
  }
}

@media (max-width: 767px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .transaction-grid {
    grid-template-columns: 1fr;
  }

  .main {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .greeting {
    font-size: 1.5rem;
  }

  .summary-item .number {
    font-size: 1.2rem;
  }
}
</style>
