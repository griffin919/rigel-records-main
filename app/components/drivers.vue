<template>
  <div class="drivers-container">
    <!-- Header -->
    <div class="drivers-header">
      <div class="header-content">
        <h1>Manage Drivers</h1>
        <p class="header-subtitle">Add and manage drivers for your company</p>
      </div>
      <button class="add-driver-btn" @click="showForm = true">
        <PlusIcon class="icon" />
        <span>Add Driver</span>
      </button>
    </div>

    <!-- Main Content -->
    <div class="drivers-main">
      <!-- Drivers Grid -->
      <div v-if="drivers.length > 0" class="drivers-grid">
        <div v-for="driver in drivers" :key="driver.id" class="driver-card">
          <div class="driver-card-header">
            <div class="driver-avatar">{{ driver.name.charAt(0).toUpperCase() }}</div>
            <div class="driver-info">
              <h3>{{ driver.name }}</h3>
              <p class="driver-email">{{ driver.email }}</p>
            </div>
          </div>

          <div class="driver-details">
            <div class="detail-row">
              <span class="label">Phone:</span>
              <span class="value">{{ driver.phone }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Car Number:</span>
              <span class="value">{{ driver.carNumber }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Status:</span>
              <span :class="['status-badge', driver.active ? 'active' : 'inactive']">
                {{ driver.active ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="detail-row">
              <span class="label">Joined:</span>
              <span class="value">{{ formatDate(driver.createdAt) }}</span>
            </div>
          </div>

          <div class="driver-actions">
            <button class="action-btn edit" @click="editDriver(driver)" title="Edit">
              <PencilIcon class="icon" />
            </button>
            <button 
              class="action-btn toggle" 
              @click="toggleDriverStatus(driver)" 
              :title="driver.active ? 'Deactivate' : 'Activate'"
            >
              <PowerIcon class="icon" />
            </button>
            <button class="action-btn delete" @click="deleteDriver(driver.id)" title="Delete">
              <TrashIcon class="icon" />
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <UserGroupIcon class="empty-icon" />
        <p>No drivers yet. Create your first driver to get started.</p>
        <button class="empty-action-btn" @click="showForm = true">
          <PlusIcon class="icon" />
          Add First Driver
        </button>
      </div>
    </div>

    <!-- Add/Edit Driver Modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingDriver ? 'Edit Driver' : 'Add New Driver' }}</h2>
          <button class="close-btn" @click="closeForm">
            <XMarkIcon class="icon" />
          </button>
        </div>

        <form @submit.prevent="submitForm" class="modal-form">
          <div class="form-group">
            <label>Full Name *</label>
            <input 
              v-model="form.name" 
              type="text" 
              placeholder="Enter driver name"
              required
              :disabled="isSubmitting"
            />
          </div>

          <div class="form-group">
            <label>Email *</label>
            <input 
              v-model="form.email" 
              type="email" 
              placeholder="Enter email address"
              required
              :disabled="isSubmitting"
            />
            <small v-if="!editingDriver">This will be used for login</small>
          </div>

          <div class="form-group" v-if="!editingDriver">
            <label>Password *</label>
            <input 
              v-model="form.password" 
              type="password" 
              placeholder="Enter password"
              required
              :disabled="isSubmitting"
            />
            <small>Minimum 6 characters</small>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Phone Number *</label>
              <input 
                v-model="form.phone" 
                type="tel" 
                placeholder="0241234567"
                required
                :disabled="isSubmitting"
              />
            </div>

            <div class="form-group">
              <label>Car Number *</label>
              <input 
                v-model="form.carNumber" 
                type="text" 
                placeholder="GW-1234-20"
                required
                :disabled="isSubmitting"
              />
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="closeForm" :disabled="isSubmitting">
              Cancel
            </button>
            <button type="submit" class="btn-submit" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="spinner"></span>
              {{ isSubmitting ? 'Saving...' : (editingDriver ? 'Update Driver' : 'Create Driver') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useNotification } from '~/composables/useNotification'
import { doc, collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore'
import {
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PowerIcon,
  XMarkIcon,
  UserGroupIcon
} from '@heroicons/vue/24/outline'

const { user } = useAuth()
const { success, error } = useNotification()
const { $auth, $db } = useNuxtApp()

const drivers = ref([])
const showForm = ref(false)
const isSubmitting = ref(false)
const editingDriver = ref(null)
const isLoading = ref(true)

const form = ref({
  name: '',
  email: '',
  password: '',
  phone: '',
  carNumber: ''
})

onMounted(async () => {
  try {
    await loadDrivers()
  } catch (err) {
    console.error(err)
    error('Failed to load drivers')
  } finally {
    isLoading.value = false
  }
})

async function loadDrivers() {
  if (!user.value?.uid) {
    console.log('No user UID found')
    return
  }

  try {
    console.log('Loading drivers for company:', user.value.uid)
    
    // Check users collection with driver role
    const usersQuery = query(
      collection($db, 'users'),
      where('role', '==', 'driver'),
      where('companyId', '==', user.value.uid)
    )
    const usersSnapshot = await getDocs(usersQuery)
    console.log('Found driver users:', usersSnapshot.docs.length)
    
    if (usersSnapshot.docs.length > 0) {
      // Load from users collection
      drivers.value = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().displayName || doc.data().email,
        email: doc.data().email,
        phone: doc.data().phone || '',
        carNumber: doc.data().carNumber || '',
        active: doc.data().active !== false,
        createdAt: doc.data().createdAt,
        ...doc.data()
      }))
    } else {
      // Fallback to drivers collection
      const q = query(
        collection($db, 'drivers'),
        where('companyId', '==', user.value.uid)
      )
      const snapshot = await getDocs(q)
      drivers.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    }
    
    console.log('Drivers loaded:', drivers.value)
  } catch (err) {
    console.error('Error loading drivers:', err)
    error('Failed to load drivers')
  }
}

function editDriver(driver) {
  editingDriver.value = driver
  form.value = {
    name: driver.name,
    email: driver.email,
    password: '',
    phone: driver.phone,
    carNumber: driver.carNumber
  }
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingDriver.value = null
  resetForm()
}

function resetForm() {
  form.value = {
    name: '',
    email: '',
    password: '',
    phone: '',
    carNumber: ''
  }
}

async function submitForm() {
  // Validate
  if (!form.value.name || !form.value.email || !form.value.phone || !form.value.carNumber) {
    error('Please fill in all required fields')
    return
  }

  if (!editingDriver.value && !form.value.password) {
    error('Password is required for new drivers')
    return
  }

  if (form.value.password && form.value.password.length < 6) {
    error('Password must be at least 6 characters')
    return
  }

  isSubmitting.value = true
  try {
    if (editingDriver.value) {
      // Update existing driver
      await updateDoc(doc($db, 'drivers', editingDriver.value.id), {
        name: form.value.name,
        phone: form.value.phone,
        carNumber: form.value.carNumber,
        updatedAt: new Date().toISOString()
      })
      success('Driver updated successfully')
    } else {
      // Create new driver
      const authResult = await createUserWithEmailAndPassword(
        $auth,
        form.value.email,
        form.value.password
      )

      // Create driver document
      await setDoc(doc($db, 'drivers', authResult.user.uid), {
        name: form.value.name,
        email: form.value.email,
        phone: form.value.phone,
        carNumber: form.value.carNumber,
        companyId: user.value.uid,
        active: true,
        createdAt: new Date().toISOString(),
        createdBy: user.value.uid
      })

      // Also create a user record with driver role
      await setDoc(doc($db, 'users', authResult.user.uid), {
        email: form.value.email,
        displayName: form.value.name,
        role: 'driver',
        companyId: user.value.uid,
        createdAt: new Date().toISOString()
      })

      success('Driver created successfully')
    }

    closeForm()
    await loadDrivers()
  } catch (err) {
    console.error('Error saving driver:', err)
    if (err.code === 'auth/email-already-in-use') {
      error('This email is already registered')
    } else {
      error(err.message || 'Failed to save driver')
    }
  } finally {
    isSubmitting.value = false
  }
}

async function toggleDriverStatus(driver) {
  try {
    await updateDoc(doc($db, 'drivers', driver.id), {
      active: !driver.active,
      updatedAt: new Date().toISOString()
    })
    success(`Driver ${!driver.active ? 'activated' : 'deactivated'}`)
    await loadDrivers()
  } catch (err) {
    console.error('Error toggling driver status:', err)
    error('Failed to update driver status')
  }
}

async function deleteDriver(driverId) {
  if (!confirm('Are you sure you want to delete this driver?')) return

  try {
    await deleteDoc(doc($db, 'drivers', driverId))
    success('Driver deleted successfully')
    await loadDrivers()
  } catch (err) {
    console.error('Error deleting driver:', err)
    error('Failed to delete driver')
  }
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString()
}
</script>

<style scoped>
.drivers-container {
  min-height: 100vh;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
}

/* Header */
.drivers-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 30;
}

.header-content h1 {
  margin: 0;
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
}

.header-subtitle {
  margin: 0.5rem 0 0 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.add-driver-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, #FFC800, #DD1D21);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9375rem;
  transition: all 0.2s;
}

.add-driver-btn:hover {
  box-shadow: 0 4px 12px rgba(221, 29, 33, 0.3);
  transform: translateY(-2px);
}

.add-driver-btn .icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Main Content */
.drivers-main {
  flex: 1;
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Drivers Grid */
.drivers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.driver-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.driver-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.driver-card-header {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.driver-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFC800, #DD1D21);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.driver-card-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.driver-email {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.driver-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 0;
  border-top: 1px solid #f3f4f6;
  border-bottom: 1px solid #f3f4f6;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.detail-row .label {
  color: #6b7280;
  font-weight: 500;
}

.detail-row .value {
  color: #111827;
  font-weight: 600;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.driver-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.action-btn {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 0;
}

.action-btn .icon {
  width: 1.25rem;
  height: 1.25rem;
}

.action-btn.edit {
  background: #dbeafe;
  color: #0c4a6e;
}

.action-btn.edit:hover {
  background: #bfdbfe;
}

.action-btn.toggle {
  background: #fef3c7;
  color: #92400e;
}

.action-btn.toggle:hover {
  background: #fde68a;
}

.action-btn.delete {
  background: #fee2e2;
  color: #991b1b;
}

.action-btn.delete:hover {
  background: #fecaca;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 1rem;
  border: 2px dashed #e5e7eb;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1rem;
  color: #d1d5db;
  opacity: 0.5;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
  color: #6b7280;
  font-size: 1rem;
}

.empty-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #FFC800, #DD1D21);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
}

.empty-action-btn:hover {
  box-shadow: 0 4px 12px rgba(221, 29, 33, 0.3);
}

.empty-action-btn .icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Modal */
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
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  background: white;
  width: 100%;
  max-width: 500px;
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
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #111827;
}

.close-btn .icon {
  width: 1.5rem;
  height: 1.5rem;
}

/* Form */
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.form-group input {
  padding: 0.875rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  font-size: 0.9375rem;
  outline: none;
  transition: all 0.2s;
}

.form-group input:focus {
  border-color: #FFC800;
  box-shadow: 0 0 0 3px rgba(255, 200, 0, 0.1);
}

.form-group input:disabled {
  background: #f9fafb;
  cursor: not-allowed;
  opacity: 0.6;
}

.form-group small {
  font-size: 0.75rem;
  color: #6b7280;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}

.btn-cancel,
.btn-submit {
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

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-submit {
  background: linear-gradient(135deg, #FFC800, #DD1D21);
  color: white;
  box-shadow: 0 2px 4px rgba(221, 29, 33, 0.3);
}

.btn-submit:hover:not(:disabled) {
  box-shadow: 0 4px 8px rgba(221, 29, 33, 0.4);
  transform: translateY(-1px);
}

.btn-cancel:disabled,
.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (min-width: 768px) {
  .modal {
    border-radius: 1.5rem;
    max-height: 85vh;
  }

  .drivers-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
}

@media (max-width: 480px) {
  .drivers-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .add-driver-btn {
    width: 100%;
    justify-content: center;
  }

  .drivers-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
