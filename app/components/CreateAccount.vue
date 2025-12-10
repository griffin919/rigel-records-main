<template>
  <div class="create-account-card">
    <h2>{{ title }}</h2>
    <form @submit.prevent="handleSubmit" class="account-form">
      <div class="form-row">
        <div class="form-group">
          <label>Email *</label>
          <input 
            v-model="formData.email" 
            type="email" 
            required 
            placeholder="user@example.com"
            :disabled="isSubmitting"
          />
        </div>
        <div class="form-group">
          <label>Display Name *</label>
          <input 
            v-model="formData.displayName" 
            type="text" 
            required 
            placeholder="John Doe"
            :disabled="isSubmitting"
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Password *</label>
          <input 
            v-model="formData.password" 
            type="password" 
            required 
            minlength="6"
            placeholder="Minimum 6 characters"
            :disabled="isSubmitting"
          />
        </div>
        <div class="form-group">
          <label>Contact *</label>
          <input 
            v-model="formData.contact" 
            type="tel" 
            required 
            placeholder="Phone number"
            :disabled="isSubmitting"
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Role *</label>
          <select v-model="formData.role" required :disabled="isSubmitting">
            <option value="">Select role</option>
            <option 
              v-for="role in availableRoles" 
              :key="role.value" 
              :value="role.value"
            >
              {{ role.label }}
            </option>
          </select>
        </div>
        <div v-if="formData.role === 'driver'" class="form-group">
          <label>Car Number *</label>
          <input 
            v-model="formData.carNumber" 
            type="text" 
            :required="formData.role === 'driver'"
            placeholder="Vehicle registration number"
            :disabled="isSubmitting"
          />
        </div>
      </div>

      <!-- Company Selection (for company-manager and driver roles) -->
      <div v-if="requiresCompany" class="form-row">
        <div class="form-group full-width">
          <label>Company *</label>
          <select 
            v-model="formData.companyId" 
            required 
            :disabled="isSubmitting || isCompanyFixed"
          >
            <option value="">Select a company</option>
            <option 
              v-for="company in availableCompanies" 
              :key="company.id" 
              :value="company.id"
            >
              {{ company.name }}
            </option>
          </select>
        </div>
      </div>

      <button 
        type="submit" 
        class="btn-submit" 
        :disabled="isSubmitting || !isFormValid"
      >
        <span v-if="isSubmitting" class="spinner"></span>
        {{ isSubmitting ? 'Creating Account...' : 'Create Account' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useCompanies } from '~/composables/useCompanies'
import { useNotification } from '~/composables/useNotification'
import { useAuditLog } from '~/composables/useAuditLog'

const props = defineProps({
  title: {
    type: String,
    default: 'Create New Account'
  }
})

const emit = defineEmits(['account-created'])

const { user, userRole } = useAuth()
const { getCompanies } = useCompanies()
const { success, error } = useNotification()
const { logAction } = useAuditLog()

const isSubmitting = ref(false)
const companies = ref([])

const formData = ref({
  email: '',
  displayName: '',
  password: '',
  contact: '',
  role: '',
  companyId: '',
  carNumber: ''
})

// Role definitions with labels
const roleDefinitions = [
  { value: 'admin', label: 'Admin', requiresCompany: false },
  { value: 'manager', label: 'Manager', requiresCompany: false },
  { value: 'attendant', label: 'Attendant', requiresCompany: false },
  { value: 'company', label: 'Company', requiresCompany: false },
  { value: 'company-manager', label: 'Company Manager', requiresCompany: true },
  { value: 'driver', label: 'Driver', requiresCompany: true }
]

// Permission matrix: which roles can create which roles
const permissionMatrix = {
  admin: ['admin', 'manager', 'attendant', 'company', 'company-manager', 'driver'],
  manager: ['manager', 'attendant', 'company', 'company-manager', 'driver'],
  'company-manager': ['company-manager', 'driver'],
  // Other roles cannot create accounts
  attendant: [],
  company: [],
  driver: []
}

// Available roles based on current user's permissions
const availableRoles = computed(() => {
  const allowedRoleValues = permissionMatrix[userRole.value] || []
  return roleDefinitions.filter(role => allowedRoleValues.includes(role.value))
})

// Check if selected role requires company
const requiresCompany = computed(() => {
  const selectedRole = roleDefinitions.find(r => r.value === formData.value.role)
  return selectedRole?.requiresCompany || false
})

// Check if company is fixed (for company-manager creating accounts)
const isCompanyFixed = computed(() => {
  return userRole.value === 'company-manager' && user.value?.companyId
})

// Available companies based on user role
const availableCompanies = computed(() => {
  // Company-managers can only assign to their own company
  if (userRole.value === 'company-manager' && user.value?.companyId) {
    return companies.value.filter(c => c.id === user.value.companyId)
  }
  // Admins and managers can assign to any company
  return companies.value
})

// Form validation
const isFormValid = computed(() => {
  const basic = formData.value.email && 
                formData.value.displayName && 
                formData.value.password.length >= 6 && 
                formData.value.contact &&
                formData.value.role
  
  if (requiresCompany.value) {
    return basic && formData.value.companyId
  }
  
  // Driver role requires car number
  if (formData.value.role === 'driver') {
    return basic && formData.value.carNumber
  }
  
  return basic
})

// Auto-set company for company-managers
watch(() => formData.value.role, (newRole) => {
  if (requiresCompany.value && isCompanyFixed.value) {
    formData.value.companyId = user.value.companyId
  } else if (!requiresCompany.value) {
    formData.value.companyId = ''
  }
})

onMounted(async () => {
  try {
    companies.value = await getCompanies()
    
    // Pre-select company for company-managers
    if (isCompanyFixed.value) {
      formData.value.companyId = user.value.companyId
    }
  } catch (err) {
    console.error('Failed to load companies:', err)
    error('Failed to load companies')
  }
})

const handleSubmit = async () => {
  if (!isFormValid.value || isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    // Call API to create user
    const response = await $fetch('/api/users', {
      method: 'POST',
      headers: {
        'X-User-Id': user.value?.uid || ''
      },
      body: {
        email: formData.value.email,
        displayName: formData.value.displayName,
        password: formData.value.password,
        contact: formData.value.contact,
        role: formData.value.role,
        companyId: formData.value.companyId || null,
        carNumber: formData.value.carNumber || null,
        active: true // New accounts start as active
      }
    })
    
    if (response.success) {
      // Log the action
      await logAction('user_created', {
        targetUserId: response.uid,
        targetUserEmail: formData.value.email,
        targetUserRole: formData.value.role,
        companyId: formData.value.companyId || null
      })
      
      success(`Account created successfully for ${formData.value.email}`)
      
      // Reset form
      formData.value = {
        email: '',
        displayName: '',
        password: '',
        contact: '',
        role: '',
        companyId: isCompanyFixed.value ? user.value.companyId : '',
        carNumber: ''
      }
      
      // Emit event for parent component
      emit('account-created', response)
    } else {
      error(response.error || 'Failed to create account')
    }
  } catch (err) {
    console.error('Account creation error:', err)
    error(err.data?.error || 'Failed to create account')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.create-account-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
  margin-bottom: 2rem;
}

.create-account-card h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.account-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  transition: all 0.2s;
  background: white;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #FFC800;
  box-shadow: 0 0 0 3px rgba(255, 200, 0, 0.1);
}

.form-group input:disabled,
.form-group select:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-submit {
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #FFC800, #DD1D21);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-submit:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(221, 29, 33, 0.3);
  transform: translateY(-2px);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .create-account-card {
    padding: 1.5rem;
  }
}
</style>
