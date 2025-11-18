// middleware/auth.js
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip on server to avoid hydration issues
  if (process.server) return
  
  const { initAuth, isAuthenticated } = useAuth()

  // Initialize auth state on client
  await initAuth()

  // If not authenticated, redirect to login (but not if already on login page)
  if (!isAuthenticated.value && to.path !== '/login') {
    return navigateTo('/login', { replace: true })
  }
})
