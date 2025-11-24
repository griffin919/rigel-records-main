// middleware/manager.js
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

  // Allow manager and admin roles to access admin pages
  if (user.value?.role !== 'manager' && user.value?.role !== 'admin') {
    return navigateTo('/', { replace: true })
  }
})
