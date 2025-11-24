<template>
  <div class="company-container">
    <!-- Header -->
    <div class="company-header">
      <div class="header-content">
        <h1>Company Dashboard</h1>
        <p class="company-info" v-if="companyName">{{ companyName }}</p>
      </div>
   
    </div>

    <!-- Main Content -->
    <div class="company-main">
      <!-- Navigation Tabs -->
      <div class="nav-tabs">
        <button 
          :class="['nav-tab', { active: activeTab === 'dashboard' }]"
          @click="activeTab = 'dashboard'"
        >
          <ChartBarIcon class="icon" />
          Dashboard
        </button>
        <button 
          :class="['nav-tab', { active: activeTab === 'drivers' }]"
          @click="activeTab = 'drivers'"
        >
          <UserGroupIcon class="icon" />
          Drivers
        </button>
      </div>

      <!-- Dashboard Tab -->
      <div v-show="activeTab === 'dashboard'">
        <!-- Overview Cards -->
        <div class="overview-grid">
          <div class="overview-card">
            <div class="card-icon">
              <BanknotesIcon class="icon" />
            </div>
            <div class="card-content">
              <p class="card-label">Total Revenue</p>
              <p class="card-value">GHS {{ companyStats.totalRevenue }}</p>
              <p class="card-detail">{{ companyStats.totalTransactions }} transactions</p>
            </div>
          </div>

          <div class="overview-card">
            <div class="card-icon">
              <UserGroupIcon class="icon" />
            </div>
            <div class="card-content">
              <p class="card-label">Active Drivers</p>
              <p class="card-value">{{ companyStats.activeDrivers }}</p>
              <p class="card-detail">{{ companyStats.driverTransactions }} today</p>
            </div>
          </div>

          <div class="overview-card">
            <div class="card-icon">
              <CheckCircleIcon class="icon" />
            </div>
            <div class="card-content">
              <p class="card-label">Paid Out</p>
              <p class="card-value">GHS {{ companyStats.paidOut }}</p>
              <p class="card-detail">{{ companyStats.paidTransactions }} settled</p>
            </div>
          </div>

          <div class="overview-card">
            <div class="card-icon">
              <ExclamationCircleIcon class="icon" />
            </div>
            <div class="card-content">
              <p class="card-label">Outstanding</p>
              <p class="card-value">GHS {{ companyStats.outstanding }}</p>
              <p class="card-detail">{{ companyStats.pendingTransactions }} pending</p>
            </div>
          </div>
        </div>

        <!-- Search and Filter -->
        <div class="controls-section">
          <div class="search-bar">
            <MagnifyingGlassIcon class="search-icon" />
            <input type="text" v-model="searchQuery" placeholder="Search by driver or vehicle..." />
          </div>

          <select v-model="filterStatus" class="filter-select">
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <!-- Transactions Table -->
        <div class="transactions-section">
          <h3>Transaction History</h3>
          <CompactTable 
            :columns="transactionColumns" 
            :items="filteredTransactions"
            empty-message="No transactions found">
          <template #cell-driver="{ item }">
            <div class="driver-cell">
              <div class="driver-avatar">{{ item.driverName.charAt(0).toUpperCase() }}</div>
              <div class="driver-info">
                <p class="driver-name">{{ item.driverName }}</p>
                <p class="driver-phone">{{ item.phone }}</p>
              </div>
            </div>
          </template>

          <template #cell-item="{ item }">
            <div class="item-cell">
              <span class="item-color" :style="{ backgroundColor: '#FFC800' }"></span>
              <span>{{ item.itemName }}</span>
            </div>
          </template>

          <template #cell-amount="{ item }">
            <span class="amount-value">GHS {{ item.cost }}</span>
          </template>

          <template #cell-status="{ item }">
            <span :class="['status-badge', item.paid ? 'paid' : 'pending']">
              {{ item.paid ? 'Paid' : 'Pending' }}
            </span>
          </template>

          <template #cell-date="{ item }">
            <div class="date-cell">{{ formatDate(item.createdAt) }}</div>
          </template>

          <template #row-actions="{ item }">
            <button v-if="!item.paid" class="action-btn mark-paid" @click="markAsPaid(item.id)" :disabled="isProcessing">
              Mark Paid
            </button>
          </template>
        </CompactTable>
      </div>
      </div>

    
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useTransactions } from '~/composables/useTransactions'
import { useCompanies } from '~/composables/useCompanies'
import { useNotification } from '~/composables/useNotification'
import CompactTable from '~/components/CompactTable.vue'
import {
  BanknotesIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'default',
  middleware: ['company']
})

const { user, logout } = useAuth()
const { getTransactions } = useTransactions()
const { success, error } = useNotification()

const companyName = ref('')
const transactions = ref([])
const searchQuery = ref('')
const filterStatus = ref('')
const isProcessing = ref(false)
const activeTab = ref('dashboard')
const driverCount = ref(0)

const transactionColumns = computed(() => [
  { key: 'driver', label: 'Driver', width: '1.5' },
  { key: 'item', label: 'Item', width: '1' },
  { key: 'quantity', label: 'Qty', width: '0.8' },
  { key: 'amount', label: 'Amount', width: '1' },
  { key: 'status', label: 'Status', width: '1' },
  { key: 'date', label: 'Date', width: '1.2' },
])

onMounted(async () => {
  try {
    if (user.value) {
      companyName.value = user.value.displayName || user.value.email || 'Company'
    }
    transactions.value = await getTransactions()
  } catch (err) {
    console.error(err)
    error('Failed to load transactions')
  }
})

const filteredTransactions = computed(() => {
  let filtered = transactions.value

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(t =>
      t.driverName?.toLowerCase().includes(query) ||
      t.phone?.includes(query) ||
      t.carNumber?.toLowerCase().includes(query)
    )
  }

  // Filter by status
  if (filterStatus.value) {
    filtered = filtered.filter(t => {
      if (filterStatus.value === 'paid') return t.paid
      if (filterStatus.value === 'pending') return !t.paid
      return true
    })
  }

  return filtered
})

const companyStats = computed(() => {
  const today = new Date().toDateString()
  const todayTransactions = transactions.value.filter(t => {
    const transactionDate = new Date(t.createdAt).toDateString()
    return transactionDate === today
  })

  const paidTransactions = todayTransactions.filter(t => t.paid)
  const pendingTransactions = todayTransactions.filter(t => !t.paid)
  const uniqueDrivers = new Set(todayTransactions.map(t => t.driverName))

  return {
    totalRevenue: transactions.value.reduce((sum, t) => sum + parseFloat(t.cost || 0), 0).toFixed(2),
    totalTransactions: transactions.value.length,
    activeDrivers: uniqueDrivers.size,
    driverTransactions: todayTransactions.length,
    paidOut: paidTransactions.reduce((sum, t) => sum + parseFloat(t.cost || 0), 0).toFixed(2),
    paidTransactions: paidTransactions.length,
    outstanding: pendingTransactions.reduce((sum, t) => sum + parseFloat(t.cost || 0), 0).toFixed(2),
    pendingTransactions: pendingTransactions.length
  }
})

const driverBreakdown = computed(() => {
  const driverMap = new Map()

  transactions.value.forEach(t => {
    if (!driverMap.has(t.driverName)) {
      driverMap.set(t.driverName, {
        name: t.driverName,
        total: 0,
        count: 0,
        paidCount: 0
      })
    }

    const driver = driverMap.get(t.driverName)
    driver.total += parseFloat(t.cost || 0)
    driver.count += 1
    if (t.paid) driver.paidCount += 1
  })

  return Array.from(driverMap.values()).sort((a, b) => b.total - a.total)
})

function formatDate(dt) {
  if (!dt) return '-'
  const date = new Date(dt)
  return date.toLocaleDateString() + ' • ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

async function markAsPaid(transactionId) {
  // This would typically call an API to update the transaction
  isProcessing.value = true
  try {
    // TODO: Implement API call to update transaction status
    success('Transaction marked as paid')
  } catch (err) {
    error('Failed to update transaction')
  } finally {
    isProcessing.value = false
  }
}

function navigateToDrivers() {
  navigateTo('/company/drivers')
}
</script>

<style scoped>
.company-container {
  min-height: 100vh;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
}

/* Header */
.company-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 40;
}

.header-content h1 {
  margin: 0;
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
}

.company-info {
  margin: 0.5rem 0 0 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.logout-btn {
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-btn:hover {
  background: #e5e7eb;
  color: #111827;
}

.logout-btn .icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Main Content */
.company-main {
  flex: 1;
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding-bottom: 3rem;
}

/* Navigation Tabs */
.nav-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e5e7eb;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #6b7280;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
  position: relative;
}

.nav-tab .icon {
  width: 1.25rem;
  height: 1.25rem;
}

.nav-tab:hover {
  color: #374151;
}

.nav-tab.active {
  color: #FFC800;
  border-bottom-color: #FFC800;
}

/* Drivers Tab Content */
.drivers-tab-content {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  min-height: 200px;
  justify-content: center;
}

.drivers-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #FFC800, #DD1D21);
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.9375rem;
  transition: all 0.2s;
  cursor: pointer;
}

.drivers-link-btn:hover {
  box-shadow: 0 4px 12px rgba(221, 29, 33, 0.3);
  transform: translateY(-2px);
}

.drivers-header-inline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.drivers-header-inline h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.add-driver-btn-inline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, #FFC800, #DD1D21);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.add-driver-btn-inline:hover {
  box-shadow: 0 4px 12px rgba(221, 29, 33, 0.3);
  transform: translateY(-2px);
}

.add-driver-btn-inline .icon {
  width: 1.25rem;
  height: 1.25rem;
}

.drivers-count {
  margin: 0;
  font-size: 1rem;
  color: #6b7280;
  font-weight: 500;
}

/* Overview Cards */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.overview-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
  transition: all 0.2s;
}

.overview-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #FFC800 0%, #DD1D21 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon .icon {
  width: 1.75rem;
  height: 1.75rem;
  color: white;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.card-label {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-value {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
}

.card-detail {
  margin: 0.25rem 0 0 0;
  font-size: 0.8125rem;
  color: #9ca3af;
}

/* Controls Section */
.controls-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
}

.search-bar {
  position: relative;
  flex: 1;
}

.search-bar .search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
  pointer-events: none;
}

.search-bar input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  outline: none;
  font-size: 0.9375rem;
  background: white;
  transition: all 0.2s;
}

.search-bar input:focus {
  border-color: #FFC800;
  box-shadow: 0 0 0 3px rgba(255, 200, 0, 0.1);
}

.filter-select {
  padding: 0.875rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  background: white;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 150px;
}

.filter-select:focus {
  border-color: #FFC800;
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 200, 0, 0.1);
}

/* Transactions Section */
.transactions-section {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
}

.transactions-section h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

/* Driver Cell */
.driver-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.driver-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFC800, #DD1D21);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.driver-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.driver-name {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}

.driver-phone {
  margin: 0;
  font-size: 0.75rem;
  color: #9ca3af;
}

/* Item Cell */
.item-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.item-color {
  width: 1rem;
  height: 1rem;
  border-radius: 0.375rem;
  flex-shrink: 0;
}

/* Amount and Status */
.amount-value {
  font-weight: 600;
  color: #111827;
}

.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.paid {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.date-cell {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Action Button */
.action-btn {
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  border: none;
  background: linear-gradient(135deg, #FFC800, #DD1D21);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
}

.action-btn:hover:not(:disabled) {
  box-shadow: 0 2px 4px rgba(221, 29, 33, 0.3);
  transform: translateY(-1px);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Driver Breakdown */
.driver-breakdown {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
}

.driver-breakdown h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.driver-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.driver-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.driver-item:last-child {
  border-bottom: none;
}

.driver-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.driver-item .driver-name {
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.driver-stats {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.stat-badge {
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
}

.progress-bar {
  width: 100%;
  height: 0.5rem;
  background: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FFC800, #DD1D21);
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.progress-label {
  font-size: 0.75rem;
  color: #6b7280;
}

/* Responsive */
@media (max-width: 768px) {
  .company-header {
    padding: 1rem;
  }

  .header-content h1 {
    font-size: 1.5rem;
  }

  .company-main {
    padding: 1rem;
  }

  .overview-grid {
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .controls-section {
    flex-direction: column;
  }

  .filter-select {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }

  .card-value {
    font-size: 1.25rem;
  }
}
</style>
