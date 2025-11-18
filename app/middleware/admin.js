// middleware/admin.js
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip on server to avoid hydration issues
  if (process.server) return
  
  const { isAdmin, userRole } = useAuth()

  // Check if user has a role set
  if (userRole.value === null) {
    return navigateTo('/login', { replace: true })
  }

  // Redirect to home if not admin
  if (!isAdmin.value) {
    return navigateTo('/', { replace: true })
  }
})
