<template>
  <main class="content">
    <div v-if="loadError" class="error-state">
      <strong>Error:</strong> {{ loadError }}
    </div>
    
    <div v-if="isLoading" class="loading-state">
      <img src="/shell_logo.svg" alt="Loading" class="loading-logo" />
      <p class="loading-text">Loading...</p>
    </div>
    
    <template v-else-if="currentCompany">
      <!-- Header -->
      <div class="mb-6">
        <button class="btn-back" @click="$router.push('/admin/companies')">
          <ArrowLeftIcon class="icon" />
          Back to Companies
        </button>
        <h1 class="text-3xl font-bold tracking-tight mb-2 mt-4">{{ currentCompany.name }}</h1>
        <p class="text-muted-foreground">{{ currentCompany.location }} • {{ currentCompany.phone }}</p>
        
        <!-- Points Badge -->
        <div class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
          <span class="text-lg font-bold text-yellow-600">{{ totalPoints.toFixed(0) }} Loyalty Points</span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs-container">
        <div class="tabs">
          <button 
            class="tab" 
            :class="{ active: activeTab === 'transactions' }"
            @click="activeTab = 'transactions'"
          >
            <DocumentTextIcon class="tab-icon" />
            Transactions
            <span class="tab-badge">{{ companyTransactions.length }}</span>
          </button>
          <button 
            class="tab" 
            :class="{ active: activeTab === 'drivers' }"
            @click="activeTab = 'drivers'"
          >
            <TruckIcon class="tab-icon" />
            Manage Drivers
            <span class="tab-badge">{{ companyDrivers.length }}</span>
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Transactions Tab -->
        <div v-if="activeTab === 'transactions'" class="tab-panel">
          <section class="card">
            <div class="flex justify-between items-center mb-4">
              <h2 class="section-title">Transaction History</h2>
              <div class="summary-badge">
                Total Owed: <strong>GHS {{ totalOwed.toFixed(2) }}</strong>
              </div>
            </div>

            <div v-if="companyTransactions.length" class="responsive-table-wrapper">
              <ResponsiveTable
                :columns="transactionColumns"
                :items="companyTransactions"
                empty-message="No transactions yet for this company">
                <template #cell-itemName="{ item }">
                  {{ item.itemName || 'Fuel' }}
                </template>

                <template #cell-quantity="{ item }">
                  {{ item.quantity || item.fuelQuantity }} {{ item.itemUnit || 'L' }}
                </template>

                <template #cell-cost="{ item }">
                  <span class="font-semibold">GHS {{ item.cost }}</span>
                </template>

                <template #cell-pointsEarned="{ item }">
                  <span class="font-bold text-yellow-600">{{ item.pointsEarned || 0 }} pts</span>
                </template>

                <template #cell-photoURL="{ item }">
                  <a v-if="item.photoURL" :href="item.photoURL" target="_blank" class="photo-link">
                    <img :src="item.photoURL" alt="Transaction photo" class="transaction-photo" />
                  </a>
                  <span v-else class="text-muted-foreground text-sm">-</span>
                </template>

                <template #cell-createdAt="{ item }">
                  <span class="text-muted-foreground text-sm">{{ formatDate(item.createdAt) }}</span>
                </template>

                <template #cell-paid="{ item }">
                  <span :class="['status-badge', item.paid ? 'status-paid' : 'status-unpaid']">
                    {{ item.paid ? 'Paid' : 'Unpaid' }}
                  </span>
                </template>

                <template #row-actions="{ item }">
                  <button 
                    class="btn-small" 
                    :class="item.paid ? 'btn-warning' : 'btn-success'"
                    @click="togglePaidStatus(item)"
                  >
                    {{ item.paid ? 'Mark Unpaid' : 'Mark Paid' }}
                  </button>
                </template>
              </ResponsiveTable>
            </div>

            <div v-else class="empty-state">
              <DocumentTextIcon class="empty-icon" />
              <p>No transactions yet for this company</p>
            </div>
          </section>
        </div>

        <!-- Drivers Tab -->
        <div v-if="activeTab === 'drivers'" class="tab-panel">
          <section class="card">
            <h2 class="section-title">Manage Drivers</h2>
            <div style="padding: 1rem; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 0.5rem; margin-bottom: 1.5rem;">
              <p style="font-size: 0.875rem; color: #92400e; margin: 0;">
                <strong>ℹ️ How to add drivers:</strong> Navigate to <strong>Settings → Create Account</strong> 
                and create a new user account with the role "Driver" and assign them to this company.
              </p>
            </div>
          </section>

          <section class="card">
            <h2 class="section-title">Current Drivers ({{ companyDrivers.length }})</h2>
            
            <div v-if="companyDrivers.length" class="drivers-list">
              <div 
                v-for="driver in companyDrivers" 
                :key="driver.id" 
                class="driver-card"
              >
                <div class="driver-avatar">
                  <UserIcon class="avatar-icon" />
                </div>
                <div class="driver-info">
                  <div class="driver-name">{{ driver.displayName || driver.email }}</div>
                  <div class="driver-details">
                    <PhoneIcon class="detail-icon" />
                    {{ driver.contact || driver.phone || 'N/A' }}
                  </div>
                  <div class="driver-details" v-if="driver.carNumber">
                    <TruckIcon class="detail-icon" />
                    {{ driver.carNumber }}
                  </div>
                </div>
                <button 
                  class="btn-danger-small" 
                  @click="removeDriver(driver.id)"
                  :disabled="isSubmitting"
                >
                  <TrashIcon class="icon-sm" />
                  Remove
                </button>
              </div>
            </div>

            <div v-else class="empty-state">
              <TruckIcon class="empty-icon" />
              <p>No drivers added yet</p>
              <small>Add drivers using the form above</small>
            </div>
          </section>
        </div>
      </div>
    </template>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTransactions } from "~/composables/useTransactions";
import { useCompanies } from "~/composables/useCompanies";
import { useDrivers } from "~/composables/useDrivers";
import { useNotification } from "~/composables/useNotification";
import ResponsiveTable from "~/components/ResponsiveTable.vue";
import { 
  ArrowLeftIcon,
  DocumentTextIcon,
  TruckIcon,
  PlusIcon,
  UserIcon,
  PhoneIcon,
  TrashIcon,
  StarIcon
} from '@heroicons/vue/24/outline';

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
});

const route = useRoute();
const router = useRouter();
const { getTransactions, updateTransaction } = useTransactions();
const { getCompanies, updateCompany } = useCompanies();
const { getCompanyDrivers, updateDriver, deleteDriver } = useDrivers();
const { success, error } = useNotification();

const transactions = ref([]);
const companies = ref([]);
const currentCompany = ref(null);
const companyDrivers = ref([]);
const isLoading = ref(false);
const isSubmitting = ref(false);
const loadError = ref('');
const activeTab = ref('transactions');

const companyTransactions = computed(() => {
  if (!currentCompany.value) return [];
  return transactions.value.filter((t) => t.companyId === currentCompany.value.id);
});

const totalOwed = computed(() => {
  return companyTransactions.value
    .filter((t) => !t.paid)
    .reduce((sum, t) => sum + (Number(t.cost) || 0), 0);
});

const totalPoints = computed(() => {
  return companyTransactions.value
    .reduce((sum, t) => sum + (Number(t.pointsEarned) || 0), 0);
});

const transactionColumns = computed(() => [
  { key: 'driverName', label: 'Driver', width: '1.2' },
  { key: 'phone', label: 'Phone', width: '1' },
  { key: 'carNumber', label: 'Car', width: '1' },
  { key: 'itemName', label: 'Item', width: '1' },
  { key: 'quantity', label: 'Qty', width: '0.8' },
  { key: 'cost', label: 'Cost', width: '1' },
  { key: 'pointsEarned', label: 'Points', width: '0.8' },
  { key: 'photoURL', label: 'Photo', width: '0.8' },
  { key: 'createdAt', label: 'Date', width: '1.2' },
  { key: 'paid', label: 'Status', width: '1' },
]);

onMounted(async () => {
  isLoading.value = true;
  loadError.value = '';
  try {
    transactions.value = (await getTransactions()) || [];
    companies.value = (await getCompanies()) || [];
    
    const companyId = route.params.id;
    currentCompany.value = companies.value.find(c => c.id === companyId);
    
    if (!currentCompany.value) {
      loadError.value = 'Company not found';
      error('Company not found');
      router.push('/admin/companies');
      return;
    }
    
    // Fetch drivers for this company from users collection
    companyDrivers.value = (await getCompanyDrivers(companyId)) || [];
  } catch (err) {
    console.error('Load error:', err);
    loadError.value = err?.message || 'Failed to load data';
    error('Failed to load data');
  } finally {
    isLoading.value = false;
  }
});

async function togglePaidStatus(transaction) {
  try {
    await updateTransaction(transaction.id, { paid: !transaction.paid });
    
    const index = transactions.value.findIndex(t => t.id === transaction.id);
    if (index > -1) {
      transactions.value[index].paid = !transaction.paid;
    }
    
    success(`Transaction marked as ${!transaction.paid ? 'paid' : 'unpaid'}`);
  } catch (err) {
    console.error(err);
    error('Failed to update transaction status');
  }
}

function formatDate(dt) {
  return dt ? new Date(dt).toLocaleString() : "-";
}

async function handleAddDriver() {
  error('Please use the Create Account component to add drivers. Navigate to the company page or use the admin settings.');
}

async function removeDriver(driverId) {
  if (!confirm('Are you sure you want to remove this driver? This will delete their account.')) {
    return;
  }

  isSubmitting.value = true;
  try {
    await deleteDriver(driverId);
    
    // Refresh the drivers list
    companyDrivers.value = await getCompanyDrivers(currentCompany.value.id);

    success('Driver removed successfully!');
  } catch (err) {
    console.error(err);
    error('Failed to remove driver');
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
/* Back Button */
.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #f9fafb;
  color: #111827;
}

.btn-back .icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Tabs */
.tabs-container {
  margin-bottom: 1.5rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
  overflow-x: auto;
}

.tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  color: #6b7280;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab:hover {
  color: #111827;
  background: #f9fafb;
}

.tab.active {
  color: #DD1D21;
  border-bottom-color: #DD1D21;
}

.tab-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.tab-badge {
  background: #e5e7eb;
  color: #6b7280;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.tab.active .tab-badge {
  background: rgba(221, 29, 33, 0.1);
  color: #DD1D21;
}

/* Tab Content */
.tab-content {
  width: 100%;
}

.tab-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Section */
.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.summary-badge {
  background: linear-gradient(135deg, rgba(255, 200, 0, 0.1), rgba(221, 29, 33, 0.1));
  color: #DD1D21;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
}

/* Driver Form */
.driver-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

/* Drivers List */
.drivers-list {
  display: grid;
  gap: 1rem;
}

.driver-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  transition: all 0.2s;
}

.driver-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.driver-avatar {
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #FFC800, #DD1D21);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-icon {
  width: 1.75rem;
  height: 1.75rem;
  color: white;
}

.driver-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.driver-name {
  font-weight: 600;
  font-size: 1rem;
  color: #111827;
}

.driver-details {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.detail-icon {
  width: 1rem;
  height: 1rem;
}

.btn-danger-small {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fee2e2;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-danger-small:hover:not(:disabled) {
  background: #dc2626;
  color: white;
}

.btn-danger-small:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon-sm {
  width: 1rem;
  height: 1rem;
}

/* Button Icon */
.btn-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #9ca3af;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1rem;
  color: #d1d5db;
}

.empty-state p {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.empty-state small {
  font-size: 0.875rem;
  color: #9ca3af;
}

/* Transaction Photo */
.photo-link {
  display: inline-block;
  cursor: pointer;
  transition: transform 0.2s;
}

.photo-link:hover {
  transform: scale(1.05);
}

.transaction-photo {
  width: 3rem;
  height: 3rem;
  object-fit: cover;
  border-radius: 0.5rem;
  border: 2px solid #e5e7eb;
  transition: all 0.2s;
}

.transaction-photo:hover {
  border-color: #FFC800;
  box-shadow: 0 2px 8px rgba(255, 200, 0, 0.3);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .tabs {
    gap: 0;
  }

  .tab {
    flex: 1;
    justify-content: center;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }

  .tab-icon {
    width: 1rem;
    height: 1rem;
  }

  .driver-card {
    flex-direction: column;
    text-align: center;
  }

  .driver-info {
    align-items: center;
  }

  .btn-danger-small {
    width: 100%;
    justify-content: center;
  }
}
</style>
