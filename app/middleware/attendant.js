// middleware/attendant.js
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

  // Only admin, manager, and attendant can access the attendant dashboard
  const allowedRoles = ['admin', 'manager', 'attendant']
  if (!allowedRoles.includes(user.value?.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.value?.role === 'company' || user.value?.role === 'company-manager') {
      return navigateTo('/company', { replace: true })
    } else if (user.value?.role === 'driver') {
      return navigateTo('/driver', { replace: true })
    }
    return navigateTo('/login', { replace: true })
  }
})
