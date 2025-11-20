<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo-large">
          <img src="/shell_logo.png"/>
        </div>
        <h1>Rigel Records</h1>
        <p class="subtitle">Fuel Management System</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="field">
          <label>Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="user@example.com"
            required
            :disabled="isLoading"
            autofocus
          />
        </div>

        <div class="field">
          <label>Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
            :disabled="isLoading"
          />
        </div>

        <button class="btn btn-primary btn-block" type="submit" :disabled="isLoading">
          <span v-if="isLoading" class="btn-spinner"></span>
          {{ isLoading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <div class="login-footer">
        <p class="hint">Contact your administrator for login credentials</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '~/composables/useAuth'
import { useNotification } from '~/composables/useNotification'
import { FireIcon } from '@heroicons/vue/24/outline'

definePageMeta({
  layout: false,
})

const { login } = useAuth()
const { success, error } = useNotification()

const email = ref('')
const password = ref('')
const isLoading = ref(false)

async function handleLogin() {
  if (!email.value || !password.value) {
    error('Please enter email and password')
    return
  }

  isLoading.value = true
  
  try {
    const result = await login(email.value, password.value)
    
    if (result.success) {
      success(`Welcome back, ${result.user.displayName}!`)
      
      // Redirect based on role
      const redirectPath = result.user.role === 'admin' ? '/admin/companies' : '/'
      await navigateTo(redirectPath, { replace: true })
    } else {
      error(result.error || 'Login failed. Please check your credentials.')
    }
  } catch (err) {
    console.error('Login error:', err)
    error('An error occurred during login')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FFC800 0%, #DD1D21 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 40px;
  width: 100%;
  max-width: 420px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-large {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #FFC800, #DD1D21);
  color: white;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 8px 24px rgba(221, 29, 33, 0.3);
}

.logo-icon {
  width: 3rem;
  height: 3rem;
  color: white;
}

.login-header h1 {
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #FFC800, #DD1D21);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 28px;
}

.login-header .subtitle {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login-form .field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.login-form label {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.login-form input {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 15px;
  transition: all 0.2s;
}

.login-form input:focus {
  outline: none;
  border-color: #DD1D21;
  box-shadow: 0 0 0 3px rgba(221, 29, 33, 0.1);
}

.btn-primary {
  background: linear-gradient(135deg, #FFC800, #DD1D21);
  color: white;
  font-weight: 600;
  font-size: 16px;
  padding: 14px;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(221, 29, 33, 0.4);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-block {
  width: 100%;
}

.login-footer {
  margin-top: 24px;
  text-align: center;
}

.hint {
  color: #6b7280;
  font-size: 13px;
  margin: 0;
}

@media (max-width: 480px) {
  .login-card {
    padding: 32px 24px;
  }
  
  .login-header h1 {
    font-size: 24px;
  }
}
</style>
