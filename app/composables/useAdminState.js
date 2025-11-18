// composables/useAdminState.js
// Shared state for admin page and admin layout
export const useAdminState = () => {
  const showReport = useState('admin-showReport', () => true)
  const mobileOpen = useState('admin-mobileOpen', () => false)

  return {
    showReport,
    mobileOpen
  }
}
