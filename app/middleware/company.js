// middleware/company.js
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip on server to avoid hydration issues
  if (process.server) return

  const { initAuth, isAuthenticated, user } = useAuth()

  // Wait for auth to initialize
  await initAuth()

  // If not authenticated, redirect to login
  if (!isAuthenticated.value) {
    return navigateTo('/login', { replace: true })
  }

  // Only company and company-manager roles can access this page
  if (user.value?.role !== 'company' && user.value?.role !== 'company-manager') {
    return navigateTo('/', { replace: true })
  }
})
