// middleware/auth.js
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip on server to avoid hydration issues
  if (process.server) return
  
  const { initAuth, isAuthenticated, user } = useAuth()

  // Wait for auth to initialize
  await initAuth()

  // If not authenticated, redirect to login (but not if already on login page)
  if (!isAuthenticated.value && to.path !== '/login') {
    return navigateTo('/login', { replace: true })
  }
  
  // If authenticated and on login page, redirect to appropriate dashboard
  if (isAuthenticated.value && to.path === '/login') {
    let redirectPath = '/'
    if (user.value?.role === 'admin') {
      redirectPath = '/admin/companies'
    } else if (user.value?.role === 'manager') {
      redirectPath = '/admin/companies'
    } else if (user.value?.role === 'company' || user.value?.role === 'company-manager') {
      redirectPath = '/company'
    } else if (user.value?.role === 'driver') {
      redirectPath = '/driver'
    }
    return navigateTo(redirectPath, { replace: true })
  }
})
