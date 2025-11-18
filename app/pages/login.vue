<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo-large">R</div>
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
    
    console.log("result:",result.user?.role)
    if (result.success) {
      success(`Welcome back, ${result.user.displayName}!`)
      
      // Let the auth middleware handle the redirect automatically
      // Just trigger a navigation to trigger the middleware
      window.location.href = result.user.role === 'admin' ? '/admin/companies' : '/'
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
  background: linear-gradient(135deg, var(--accent) 0%, var(--secondary) 100%);
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
  background: linear-gradient(135deg, var(--accent), var(--secondary));
  color: white;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: 900;
  margin-bottom: 16px;
  box-shadow: 0 8px 24px rgba(214, 40, 40, 0.3);
}

.login-header h1 {
  margin: 0 0 8px 0;
  color: var(--secondary);
  font-size: 28px;
}

.login-header .subtitle {
  color: var(--muted);
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
  color: var(--primary);
  font-size: 14px;
}

.login-form input {
  padding: 12px 16px;
  border: 2px solid var(--soft);
  border-radius: var(--radius);
  font-size: 15px;
  transition: all 0.2s;
}

.login-form input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(214, 40, 40, 0.1);
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent), #c41e1e);
  color: white;
  font-weight: 600;
  font-size: 16px;
  padding: 14px;
  border-radius: var(--radius);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(214, 40, 40, 0.4);
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
  color: var(--muted);
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
