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
  
  // If authenticated and on login page, redirect to appropriate home
  if (isAuthenticated.value && to.path === '/login') {
    const redirectPath = user.value?.role === 'admin' ? '/admin/companies' : '/'
    return navigateTo(redirectPath, { replace: true })
  }
})
