// middleware/driver.js
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

  // Only driver role can access this page
  if (user.value?.role !== 'driver' && user.value?.role !== 'admin') {
    return navigateTo('/login', { replace: true })
  }
})
