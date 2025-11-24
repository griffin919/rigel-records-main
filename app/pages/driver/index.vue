<template>
  <div class="driver-container">
    <!-- Header -->
    <div class="driver-header">
      <div class="header-content">
        <h1>Driver Dashboard</h1>
        <p class="driver-info" v-if="driverName">{{ driverName }}</p>
      </div>
      <button class="logout-btn" @click="logout">
        <ArrowRightOnRectangleIcon class="icon" />
      </button>
    </div>

    <!-- Main Content -->
    <div class="driver-main">
      <!-- Welcome Card -->
      <div class="welcome-card">
        <div class="welcome-icon">
          <TruckIcon class="icon-large" />
        </div>
        <h2>{{ greetingMessage }}</h2>
        <p>Track your daily transactions and earnings</p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <CurrencyDollarIcon class="icon" />
          </div>
          <div class="stat-content">
            <p class="stat-label">Today's Earnings</p>
            <p class="stat-value">GHS {{ driverStats.todayEarnings }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <DocumentCheckIcon class="icon" />
          </div>
          <div class="stat-content">
            <p class="stat-label">Transactions</p>
            <p class="stat-value">{{ driverStats.transactions }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <CheckCircleIcon class="icon" />
          </div>
          <div class="stat-content">
            <p class="stat-label">Paid</p>
            <p class="stat-value">GHS {{ driverStats.paidAmount }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <ClockIcon class="icon" />
          </div>
          <div class="stat-content">
            <p class="stat-label">Pending</p>
            <p class="stat-value">GHS {{ driverStats.pendingAmount }}</p>
          </div>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="transactions-section">
        <h3>Your Recent Transactions</h3>
        <CompactTable 
          :columns="transactionColumns" 
          :items="driverTransactions"
          empty-message="No transactions yet">
          <template #cell-amount="{ item }">
            <span class="amount-badge">GHS {{ item.cost }}</span>
          </template>

          <template #cell-status="{ item }">
            <span :class="['status-badge', item.paid ? 'paid' : 'pending']">
              {{ item.paid ? 'Paid' : 'Pending' }}
            </span>
          </template>

          <template #cell-date="{ item }">
            <div class="date-cell">{{ formatDate(item.createdAt) }}</div>
          </template>
        </CompactTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useTransactions } from '~/composables/useTransactions'
import { useNotification } from '~/composables/useNotification'
import CompactTable from '~/components/CompactTable.vue'
import {
  TruckIcon,
  CurrencyDollarIcon,
  DocumentCheckIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'default',
  middleware: ['driver']
})

const { user, logout } = useAuth()
const { getTransactions } = useTransactions()
const { error } = useNotification()

const driverName = ref('')
const driverTransactions = ref([])
const isLoading = ref(true)

const greetingMessage = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
})

const driverStats = computed(() => {
  const today = new Date().toDateString()
  const todayTransactions = driverTransactions.value.filter(t => {
    const transactionDate = new Date(t.createdAt).toDateString()
    return transactionDate === today
  })

  const paidTransactions = todayTransactions.filter(t => t.paid)
  const pendingTransactions = todayTransactions.filter(t => !t.paid)

  return {
    transactions: todayTransactions.length,
    todayEarnings: todayTransactions.reduce((sum, t) => sum + parseFloat(t.cost || 0), 0).toFixed(2),
    paidAmount: paidTransactions.reduce((sum, t) => sum + parseFloat(t.cost || 0), 0).toFixed(2),
    pendingAmount: pendingTransactions.reduce((sum, t) => sum + parseFloat(t.cost || 0), 0).toFixed(2)
  }
})

const transactionColumns = computed(() => [
  { key: 'itemName', label: 'Item', width: '1.2' },
  { key: 'quantity', label: 'Qty', width: '0.8' },
  { key: 'cost', label: 'Amount', width: '1' },
  { key: 'status', label: 'Status', width: '1' },
  { key: 'date', label: 'Date', width: '1.2' },
])

onMounted(async () => {
  try {
    if (user.value) {
      driverName.value = user.value.displayName || user.value.email || 'Driver'
    }
    driverTransactions.value = await getTransactions()
  } catch (err) {
    console.error(err)
    error('Failed to load transactions')
  } finally {
    isLoading.value = false
  }
})

function formatDate(dt) {
  if (!dt) return '-'
  const date = new Date(dt)
  return date.toLocaleDateString() + ' • ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.driver-container {
  min-height: 100vh;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
}

/* Header */
.driver-header {
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

.driver-info {
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
.driver-main {
  flex: 1;
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding-bottom: 3rem;
}

/* Welcome Card */
.welcome-card {
  background: linear-gradient(135deg, #FFC800, #DD1D21);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  color: white;
  box-shadow: 0 4px 12px rgba(221, 29, 33, 0.2);
}

.welcome-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.icon-large {
  width: 3rem;
  height: 3rem;
}

.welcome-card h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.875rem;
  font-weight: 700;
}

.welcome-card p {
  margin: 0;
  font-size: 1rem;
  opacity: 0.95;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
  transition: all 0.2s;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #FFC800 0%, #DD1D21 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon .icon {
  width: 1.5rem;
  height: 1.5rem;
  color: white;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

/* Transactions Section */
.transactions-section {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
}

.transactions-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

/* Badges */
.amount-badge {
  background: linear-gradient(135deg, #FFC800, #DD1D21);
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  display: inline-block;
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

/* Responsive */
@media (max-width: 768px) {
  .driver-header {
    padding: 1rem;
  }

  .header-content h1 {
    font-size: 1.5rem;
  }

  .driver-main {
    padding: 1rem;
  }

  .welcome-card {
    padding: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .welcome-card h2 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .welcome-card {
    padding: 1rem;
  }
}
</style>
