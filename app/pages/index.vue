<template>
  <main class="content">
    <!-- Header with title -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold tracking-tight mb-2">Attendant Dashboard</h1>
      <p class="text-muted-foreground">Record fuel purchases — select company and submit entry</p>
    </div>

    <!-- Form card -->
    <section class="card">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading companies...</p>
      </div>
      
      <form v-else @submit.prevent="submitEntry">
        <div class="grid">
          <div class="field">
            <label>Select Company</label>
            <select v-model="form.company" required :disabled="isSubmitting" @change="onCompanyChange">
              <option value="">-- Select company --</option>
              <option v-for="c in companies" :key="c.id" :value="c">{{ c.name }}</option>
            </select>
          </div>

          <div class="field">
            <label>Select Driver</label>
            <select v-model="selectedDriver" required :disabled="isSubmitting || !form.company">
              <option value="">-- Select driver --</option>
              <option v-for="(driver, index) in availableDrivers" :key="index" :value="driver">
                {{ driver.name }} ({{ driver.phone }}) - {{ driver.carNumber }}
              </option>
            </select>
            <small class="field-hint" v-if="!form.company">Select a company first</small>
            <small class="field-hint" v-else-if="!availableDrivers.length" style="color: #f59e0b;">
              No drivers available. Contact admin to add drivers to this company.
            </small>
          </div>

          <div class="field">
            <label>Car Number</label>
            <input v-model="form.carNumber" type="text" placeholder="GW-1234-20" required :disabled="isSubmitting" readonly />
            <small class="field-hint">Auto-filled from selected driver</small>
          </div>

          <div class="field">
            <label>Select Item</label>
            <select v-model="form.selectedItem" required :disabled="isSubmitting">
              <option value="">-- Select item --</option>
              <option v-for="item in items" :key="item.id" :value="item">
                {{ item.name }} ({{ item.unit }})
              </option>
            </select>
            <div v-if="form.selectedItem" class="mt-2 inline-flex items-center gap-2 text-sm">
              <span class="w-4 h-4 rounded border" :style="{ backgroundColor: form.selectedItem.color }"></span>
              <span class="font-medium">{{ form.selectedItem.name }}</span>
            </div>
            <small class="field-hint" v-if="!items.length" style="color: #f59e0b;">
              No items available. Contact admin to add items.
            </small>
          </div>

          <div class="field">
            <label>Quantity</label>
            <input v-model.number="form.quantity" type="number" step="0.1" min="0.1" required :disabled="isSubmitting" :placeholder="form.selectedItem ? `Enter quantity in ${form.selectedItem.unit}` : 'Select item first'" />
            <small class="field-hint" v-if="form.selectedItem">Unit: {{ form.selectedItem.unit }}</small>
          </div>

          <div class="field">
            <label>Cost (GHS)</label>
            <input v-model.number="form.cost" type="number" step="0.01" min="0.01" required :disabled="isSubmitting" />
          </div>

          <div class="field">
            <label>Coupon Number (Optional)</label>
            <input v-model="form.couponNumber" type="text" placeholder="Enter coupon number" :disabled="isSubmitting" />
            <small class="field-hint">Some companies provide coupons to drivers</small>
          </div>

          <div class="field">
            <label>Photo Evidence (Optional)</label>
            <input 
              type="file" 
              accept="image/*" 
              @change="handlePhotoUpload" 
              :disabled="isSubmitting || isUploadingPhoto"
              ref="photoInput"
            />
            <small class="field-hint">Upload photo of pump price and car presence</small>
            <div v-if="isUploadingPhoto" class="mt-2 text-sm text-blue-600">
              <span class="btn-spinner inline-block"></span>
              Uploading photo...
            </div>
            <div v-if="form.photoURL" class="mt-2">
              <img :src="form.photoURL" alt="Evidence photo" class="max-w-xs rounded border" />
              <button 
                type="button" 
                class="text-sm text-red-600 mt-1" 
                @click="removePhoto"
                :disabled="isSubmitting"
              >
                Remove photo
              </button>
            </div>
          </div>
        </div>

        <div class="flex gap-3 mt-6 justify-end">
          <button class="btn secondary" type="button" @click="clearForm" :disabled="isSubmitting">Clear Form</button>
          <button class="btn" type="submit" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="btn-spinner"></span>
            {{ isSubmitting ? 'Submitting...' : 'Submit Entry' }}
          </button>
        </div>
      </form>
    </section>

    <!-- Recent entries card -->
    <section class="card">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h3 class="text-xl font-semibold mb-1">Recent Entries</h3>
          <p class="text-sm text-muted-foreground">{{ filteredTransactions.length }} of {{ transactions.length }} entries</p>
        </div>
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search entries..." 
            class="search-input"
          />
        </div>
      </div>
      
      <table class="table" v-if="recent.length">
        <thead>
          <tr>
            <th>Company</th>
            <th>Driver</th>
            <th>Item</th>
            <th>Quantity</th>
            <th>Cost</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in recent" :key="t.id">
            <td class="font-medium">{{ t.company }}</td>
            <td>{{ t.driverName }}</td>
            <td>{{ t.itemName || 'Fuel' }}</td>
            <td>{{ t.quantity || t.fuelQuantity }} {{ t.itemUnit || 'L' }}</td>
            <td class="font-semibold">GHS {{ t.cost }}</td>
            <td class="text-muted-foreground">{{ formatDate(t.createdAt) }}</td>
          </tr>
        </tbody>
      </table>

      <div v-else class="text-center py-8 text-muted-foreground">
        {{ searchQuery ? 'No matching entries found.' : 'No entries yet.' }}
      </div>
    </section>
  </main>
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
const availableDrivers = computed(() => {
  if (!form.company || !form.company.drivers) return [];
  return form.company.drivers || [];
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
// ✅ Add this right below clearForm()
function formatDate(dt) {
  return dt ? new Date(dt).toLocaleString() : '-'
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

const recent = computed(() => filteredTransactions.value.slice(-8).reverse())

</script>