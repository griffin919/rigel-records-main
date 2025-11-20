<template>
  <div class="app-container">
    <!-- Main Content Wrapper -->
    <div class="content-wrapper">
     

      <!-- Main Content -->
      <div class="main">
      <!-- Admin Button (only for admins) -->
      <button v-if="userRole === 'admin'" class="admin-access-btn" @click="navigateToAdmin">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>Admin Panel</span>
      </button>
      
      <!-- Today's Summary -->
      <div class="summary-card">
        <div class="todays-sales">
          <span>
            <h2>Today's Sales </h2>
          </span>
            <span>
           <h2>{{ todaySummary.amount }}</h2> 
          </span>
        </div>
        <div class="summary-grid">
          <div class="summary-item">
            <BuildingOfficeIcon class="summary-icon" />
            <span class="nav-label"></span>
            <p class="number">{{ todaySummary.companies }}</p>
            <p class="label">Companies</p>
          </div>
          <div class="summary-item">
            <TruckIcon class="summary-icon" />
            <span class="nav-label"></span>
            <p class="number">{{ todaySummary.vehicles }}</p>
            <p class="label">Vehicles</p>
          </div>
        </div>
      </div>

      <!-- Search -->
      <div class="search-bar">
        <MagnifyingGlassIcon class="search-icon" />
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
            <div class="fuel-icon" :style="{ backgroundColor: getItemColor(transaction.itemName) }"> <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M5 20V5.616q0-.691.463-1.153T6.616 4h4.769q.69 0 1.153.463T13 5.616v6h.923q.667 0 1.141.474t.475 1.14v4.578q0 .54.383.924q.384.384.924.384t.924-.384t.384-.924v-6.816q-.225.144-.475.211q-.25.066-.525.066q-.792 0-1.338-.546t-.547-1.339q0-.684.409-1.206t1.076-.644l-2.408-2.407l.627-.627l3.43 3.408q.299.298.467.684t.168.792v8.424q0 .92-.634 1.556q-.635.636-1.554.636t-1.558-.636t-.638-1.556v-4.692q0-.27-.173-.443t-.442-.173H13V20zm1-9.5h6V5.616q0-.231-.192-.424T11.385 5h-4.77q-.23 0-.423.192T6 5.616zm11.154-.115q.425 0 .712-.288t.288-.712t-.288-.713t-.712-.288t-.713.288t-.287.712t.287.713t.713.288"/></svg></div>
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
                <div>
                  <p>Served By</p>
                  <p>{{ transaction.servedBy || 'Attendant' }}</p>
                </div>
                <div>
                  <p>Date & Time</p>
                  <p>{{ formatDate(transaction.createdAt) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredTransactions.length === 0" class="no-transactions">
          <span class="icon-large"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M5 20V5.616q0-.691.463-1.153T6.616 4h4.769q.69 0 1.153.463T13 5.616v6h.923q.667 0 1.141.474t.475 1.14v4.578q0 .54.383.924q.384.384.924.384t.924-.384t.384-.924v-6.816q-.225.144-.475.211q-.25.066-.525.066q-.792 0-1.338-.546t-.547-1.339q0-.684.409-1.206t1.076-.644l-2.408-2.407l.627-.627l3.43 3.408q.299.298.467.684t.168.792v8.424q0 .92-.634 1.556q-.635.636-1.554.636t-1.558-.636t-.638-1.556v-4.692q0-.27-.173-.443t-.442-.173H13V20zm1-9.5h6V5.616q0-.231-.192-.424T11.385 5h-4.77q-.23 0-.423.192T6 5.616zm11.154-.115q.425 0 .712-.288t.288-.712t-.288-.713t-.712-.288t-.713.288t-.287.712t.287.713t.713.288"/></svg></span>
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
          <button class="close-btn" @click="showForm = false">
            <XMarkIcon class="close-icon" />
          </button>
        </div>

        <div class="modal-content">
        <div v-if="isLoading" class="loading-state">
          <img src="/shell_logo.svg" alt="Loading" class="loading-logo" />
          <p class="loading-text">Loading...</p>
        </div>          <form v-else @submit.prevent="submitEntry">
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
    </div> <!-- Close content-wrapper -->
  </div> <!-- Close app-container -->
</template>

<script setup>
import { useCompanies } from '~/composables/useCompanies'
import { useTransactions } from '~/composables/useTransactions'
import { useNotification } from '~/composables/useNotification'
import { useItems } from '~/composables/useItems'
import { useAuth } from '~/composables/useAuth'
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
  middleware: ['auth']
})

const { getTransactions, addTransaction } = useTransactions()
const { success, error } = useNotification()
const { user, userRole } = useAuth()

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
      paid: false,
      servedBy: user.value?.displayName || user.value?.email || 'Attendant',
      servedById: user.value?.uid || ''
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
  box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
  max-width: 40rem; 
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
  background: linear-gradient(135deg, #9333ea 0%, #7e22ce 50%, #6b21a8 100%);
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
  background: linear-gradient(135deg, #FFC800 0%, #DD1D21 100%); 
  padding: 1.5rem; 
  border-radius: 1.5rem; 
  margin-bottom: 1.5rem; 
  color: white; 
  box-shadow: 0 10px 25px rgba(221, 29, 33, 0.3);
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
  background: rgba(255,255,255,0.2); 
  width:48%;
  border-radius: 1rem; 
  padding: 0.5rem; 
  backdrop-filter: blur(10px); 
  text-align: center;
  border: 1px solid rgba(255,255,255,0.3);
}

.summary-item .icon { 
  font-size: 1.5rem; 
  display: block; 
  margin-bottom: 0.5rem; 
}

.summary-icon {
  width: 1.5rem;
  height: 1.5rem;
  margin: 0 auto 0.5rem;
  color: white;
  opacity: 0.9;
}

.summary-item .number { 
  font-size: 0.7rem; 
  font-weight: bold; 
  margin: 0.25rem 0;
}

.summary-item .label { 
  font-size: 0.65rem; 
  opacity: 0.9; 
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
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

.transactions-list { 
  display: flex; 
  flex-direction: column; 
  gap: 1rem; 
}

.transaction-card { 
  background: white; 
  padding: 1rem; 
  border-radius: 1rem; 
  box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
  border: 1px solid #f3f4f6;
  transition: all 0.2s;
}

.transaction-card:hover {
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
  background: rgba(0,0,0,0.5); 
  display: flex; 
  align-items: flex-end; 
  justify-content: center; 
  z-index: 100;
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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

.todays-sales{
  display: flex;
  justify-content: space-between;
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
  to { transform: rotate(360deg); }
}

.btn-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255,255,255,0.3);
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
