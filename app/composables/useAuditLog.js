// composables/useAuditLog.js
export const useAuditLog = () => {
  const { $db } = useNuxtApp()
  const { user } = useAuth()

  /**
   * Log an action to the audit log
   * @param {string} action - The action being performed (e.g., 'user_created', 'user_deleted', 'transaction_updated')
   * @param {object} details - Additional details about the action
   */
  const logAction = async (action, details = {}) => {
    if (!user.value) {
      console.warn('Cannot log action: No authenticated user')
      return
    }

    try {
      const { collection, addDoc } = await import('firebase/firestore')
      
      const logEntry = {
        action,
        performedBy: user.value.uid,
        performedByEmail: user.value.email,
        performedByRole: user.value.role,
        timestamp: new Date().toISOString(),
        ...details
      }

      await addDoc(collection($db, 'audit_logs'), logEntry)
    } catch (error) {
      console.error('Failed to log action:', error)
      // Don't throw error - logging failure shouldn't break functionality
    }
  }

  /**
   * Get audit logs with optional filtering
   * @param {object} filters - Filter options
   * @param {string} filters.action - Filter by action type
   * @param {string} filters.performedBy - Filter by user ID
   * @param {string} filters.targetUserId - Filter by target user
   * @param {Date} filters.startDate - Filter logs after this date
   * @param {Date} filters.endDate - Filter logs before this date
   * @param {number} filters.limit - Limit number of results (default 100)
   */
  const getAuditLogs = async (filters = {}) => {
    try {
      const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore')
      
      let q = collection($db, 'audit_logs')
      const constraints = []

      if (filters.action) {
        constraints.push(where('action', '==', filters.action))
      }

      if (filters.performedBy) {
        constraints.push(where('performedBy', '==', filters.performedBy))
      }

      if (filters.targetUserId) {
        constraints.push(where('targetUserId', '==', filters.targetUserId))
      }

      if (filters.startDate) {
        constraints.push(where('timestamp', '>=', filters.startDate.toISOString()))
      }

      if (filters.endDate) {
        constraints.push(where('timestamp', '<=', filters.endDate.toISOString()))
      }

      // Always order by timestamp descending (newest first)
      constraints.push(orderBy('timestamp', 'desc'))

      // Apply limit (default 100)
      constraints.push(limit(filters.limit || 100))

      q = query(q, ...constraints)

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Failed to get audit logs:', error)
      return []
    }
  }

  /**
   * Get recent audit logs for current user
   * @param {number} limit - Number of logs to retrieve
   */
  const getMyRecentLogs = async (limit = 50) => {
    if (!user.value) return []
    
    return getAuditLogs({
      performedBy: user.value.uid,
      limit
    })
  }

  /**
   * Get audit logs for a specific user (target)
   * @param {string} userId - The user ID to get logs for
   * @param {number} limit - Number of logs to retrieve
   */
  const getUserLogs = async (userId, limit = 50) => {
    return getAuditLogs({
      targetUserId: userId,
      limit
    })
  }

  return {
    logAction,
    getAuditLogs,
    getMyRecentLogs,
    getUserLogs
  }
}
