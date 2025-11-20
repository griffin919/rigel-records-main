<template>
  <main class="content">
    <div v-if="loadError" class="error-state">
      <strong>Error:</strong> {{ loadError }}
    </div>
    
    <div v-if="isLoading" class="loading-state">
      <img src="/shell_logo.svg" alt="Loading" class="loading-logo" />
      <p class="loading-text">Loading...</p>
    </div>
    
    <template v-else>
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold tracking-tight mb-2">Entry Reports</h1>
        <p class="text-muted-foreground">View and analyze fuel transaction reports</p>
      </div>

      <!-- Filters Card -->
      <section class="filters-card">
        <div class="filters-header">
          <div>
            <h3 class="filters-title">Filters</h3>
            <p class="filters-subtitle">Filter entries by date range or company</p>
          </div>
        </div>

        <div class="filters-grid">
          <div class="date-fields">
            <div class="filter-field">
              <label>From Date</label>
              <input type="date" v-model="from" />
            </div>
            <div class="filter-field">
              <label>To Date</label>
              <input type="date" v-model="to" />
            </div>
          </div>
          <div class="filter-field">
            <label>Company</label>
            <select v-model="filterCompany">
              <option value="">All companies</option>
              <option v-for="c in companies" :key="c.id" :value="c.name">
                {{ c.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="filters-actions">
          <button class="filter-btn filter-btn-apply" @click="applyFilter">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
            </svg>
            <span>Apply</span>
          </button>
          <button class="filter-btn filter-btn-reset" @click="resetFilter">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <span>Reset</span>
          </button>
          <button class="filter-btn filter-btn-download" @click="downloadCSV">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span>CSV</span>
          </button>
        </div>
      </section>

      <!-- Company Summary -->
      <section class="card">
        <h3 class="text-lg font-semibold mb-4">Company Summary</h3>
        <div v-if="filteredCompanySummary.length" class="responsive-table">
          <div v-for="c in filteredCompanySummary" :key="c.company" class="table-row">
            <div class="table-cell">
              <div class="cell-label">Company</div>
              <div class="cell-value font-medium">{{ c.company }}</div>
            </div>
            <div class="table-cell">
              <div class="cell-label">Amount Owed</div>
              <div class="cell-value font-semibold text-lg">GHS {{ c.amountOwed.toFixed(2) }}</div>
            </div>
            <div class="table-cell">
              <div class="cell-label">Action</div>
              <div class="cell-value">
                <button class="btn ghost" @click="openCompanyDetails(c)">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center text-muted-foreground py-8">No records found</div>
      </section>

      <!-- Details Modal -->
      <div v-if="detailsItem" class="modal-backdrop" @click.self="detailsItem = null">
        <div class="mobile-view"> 
        <div class="modal max-w-6xl">
          <h3 class="text-xl font-semibold mb-4">{{ detailsItem.company }} — Full Report</h3>
          <div class="responsive-table">
            <div v-for="t in detailsItem.transactions" :key="t.id" class="table-row">
              <div class="table-cell">
                <div class="cell-label">Driver</div>
                <div class="cell-value font-medium">{{ t.driverName }}</div>
              </div>
              <div class="table-cell">
                <div class="cell-label">Phone</div>
                <div class="cell-value">{{ t.phone }}</div>
              </div>
              <div class="table-cell">
                <div class="cell-label">Car</div>
                <div class="cell-value">{{ t.carNumber }}</div>
              </div>
              <div class="table-cell">
                <div class="cell-label">Item</div>
                <div class="cell-value">{{ t.itemName || 'Fuel' }}</div>
              </div>
              <div class="table-cell">
                <div class="cell-label">Qty</div>
                <div class="cell-value">{{ t.quantity || t.fuelQuantity }} {{ t.itemUnit || 'L' }}</div>
              </div>
              <div class="table-cell">
                <div class="cell-label">Cost</div>
                <div class="cell-value font-semibold">GHS {{ t.cost }}</div>
              </div>
              <div class="table-cell">
                <div class="cell-label">Coupon</div>
                <div class="cell-value">{{ t.couponNumber || '-' }}</div>
              </div>
              <div class="table-cell">
                <div class="cell-label">Photo</div>
                <div class="cell-value">
                  <a v-if="t.photoURL" :href="t.photoURL" target="_blank" class="text-blue-600 hover:underline text-sm">
                    View Photo
                  </a>
                  <span v-else class="text-muted-foreground">-</span>
                </div>
              </div>
              <div class="table-cell">
                <div class="cell-label">Date</div>
                <div class="cell-value text-muted-foreground text-sm">{{ formatDate(t.createdAt) }}</div>
              </div>
              <div class="table-cell">
                <div class="cell-label">Status</div>
                <div class="cell-value">
                  <span :class="['status-badge', t.paid ? 'status-paid' : 'status-unpaid']">
                    {{ t.paid ? "Paid" : "Unpaid" }}
                  </span>
                </div>
              </div>
              <div class="table-cell">
                <div class="cell-label">Action</div>
                <div class="cell-value">
                  <button 
                    class="btn-small" 
                    :class="t.paid ? 'btn-warning' : 'btn-success'"
                    @click="togglePaidStatus(t)"
                  >
                    {{ t.paid ? 'Mark Unpaid' : 'Mark Paid' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-end mt-6">
            <button class="btn" @click="detailsItem = null">Close</button>
          </div>
        </div>
        </div>
      </div>
    </template>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useTransactions } from "~/composables/useTransactions";
import { useCompanies } from "~/composables/useCompanies";
import { useNotification } from "~/composables/useNotification";

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
});

const { getTransactions, updateTransaction } = useTransactions();
const { getCompanies } = useCompanies();
const { success, error } = useNotification();

const transactions = ref([])
const companies = ref([])
const isLoading = ref(false)
const loadError = ref('')

onMounted(async () => {
  isLoading.value = true
  loadError.value = ''
  try {
    transactions.value = (await getTransactions()) || []
    companies.value = (await getCompanies()) || []
  } catch (err) {
    console.error('Load error:', err)
    loadError.value = err?.message || 'Failed to load data'
    error('Failed to load data')
  } finally {
    isLoading.value = false
  }
})

const detailsItem = ref(null);
const from = ref("");
const to = ref("");
const filterCompany = ref("");

async function togglePaidStatus(transaction) {
  try {
    await updateTransaction(transaction.id, { paid: !transaction.paid });
    
    // Update local state
    const index = transactions.value.findIndex(t => t.id === transaction.id);
    if (index > -1) {
      transactions.value[index].paid = !transaction.paid;
    }
    
    // Update in details modal if open
    if (detailsItem.value) {
      const modalIndex = detailsItem.value.transactions.findIndex(t => t.id === transaction.id);
      if (modalIndex > -1) {
        detailsItem.value.transactions[modalIndex].paid = !transaction.paid;
      }
    }
    
    success(`Transaction marked as ${!transaction.paid ? 'paid' : 'unpaid'}`);
  } catch (err) {
    console.error(err);
    error('Failed to update transaction status');
  }
}

function applyFilter() {
  /* handled by computed */
}

function resetFilter() {
  from.value = "";
  to.value = "";
  filterCompany.value = "";
}

function formatDate(dt) {
  return dt ? new Date(dt).toLocaleString() : "-";
}

// --- Company Summary Computed ---
const companySummary = computed(() => {
  const summary = {};
  transactions.value.forEach((t) => {
    if (!summary[t.company])
      summary[t.company] = {
        company: t.company,
        amountOwed: 0,
        transactions: [],
      };
    if (!t.paid) summary[t.company].amountOwed += Number(t.cost) || 0;
    summary[t.company].transactions.push(t);
  });
  return Object.values(summary);
});

const filteredCompanySummary = computed(() => {
  let list = companySummary.value;
  
  // Apply company filter
  if (filterCompany.value) {
    list = list.filter((c) => c.company === filterCompany.value);
  }
  
  // Apply date filters - need to recalculate based on filtered transactions
  if (from.value || to.value) {
    const fromDate = from.value ? new Date(from.value) : null;
    const toDate = to.value ? new Date(to.value) : null;
    
    if (fromDate) fromDate.setHours(0, 0, 0, 0);
    if (toDate) toDate.setHours(23, 59, 59, 999);
    
    list = list.map((c) => {
      // Filter transactions by date
      const filteredTransactions = c.transactions.filter((t) => {
        const tDate = new Date(t.createdAt);
        if (fromDate && tDate < fromDate) return false;
        if (toDate && tDate > toDate) return false;
        return true;
      });
      
      // Recalculate amount owed based on filtered transactions
      const amountOwed = filteredTransactions
        .filter((t) => !t.paid)
        .reduce((sum, t) => sum + (Number(t.cost) || 0), 0);
      
      return {
        ...c,
        transactions: filteredTransactions,
        amountOwed: amountOwed,
      };
    }).filter(c => c.transactions.length > 0); // Remove companies with no transactions in range
  }
  
  return list;
});

// --- Show Company Details in Modal ---
function openCompanyDetails(c) {
  if (!c.transactions.length) {
    error("No entries for this company");
    return;
  }
  detailsItem.value = { company: c.company, transactions: c.transactions };
}

// --- CSV download ---
function downloadCSV() {
  const rows = filteredCompanySummary.value.flatMap((c) => c.transactions);
  if (!rows.length) {
    error("No records to download");
    return;
  }
  exportCSV(rows, `rigel_report_${Date.now()}.csv`);
  success("CSV downloaded successfully");
}

function exportCSV(rows, filename) {
  const header = [
    "Company",
    "Driver",
    "Phone",
    "CarNumber",
    "Item",
    "Quantity",
    "Unit",
    "Cost",
    "CouponNumber",
    "PhotoURL",
    "CreatedAt",
    "Paid",
  ];
  const csvRows = rows.map((r) =>
    [
      `"${r.company}"`,
      `"${r.driverName}"`,
      `"${r.phone}"`,
      `"${r.carNumber}"`,
      `"${r.itemName || 'Fuel'}"`,
      r.quantity || r.fuelQuantity,
      `"${r.itemUnit || 'L'}"`,
      r.cost,
      `"${r.couponNumber || ''}"`,
      `"${r.photoURL || ''}"`,
      `"${r.createdAt || ''}"`,
      r.paid ? "Paid" : "Unpaid",
    ].join(",")
  );
  const csv = [header.join(",")].concat(csvRows).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<style scoped>
/* Filters Card */
.filters-card {
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  padding: 1.75rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.filters-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;
}

.filters-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.025em;
}

.filters-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
}

/* Filters Grid */
.filters-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.date-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.filter-field {
  display: flex;
  flex-direction: column;
}

.filter-field label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  letter-spacing: 0.01em;
}

.filter-field input,
.filter-field select {
  width: 100%;
  height: 2.75rem;
  padding: 0.625rem 1rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.625rem;
  font-size: 0.9375rem;
  color: #111827;
  background: white;
  transition: all 0.2s ease;
  font-weight: 500;
}

.filter-field input:focus,
.filter-field select:focus {
  outline: none;
  border-color: #9333ea;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
  background: white;
}

.filter-field input:hover,
.filter-field select:hover {
  border-color: #d1d5db;
}

/* Filter Actions */
.filters-actions {
  display: flex;
}

.filter-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: 0.625rem;
  font-size: 0.9375rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.01em;
}

.filter-btn svg {
  width: 1.125rem;
  height: 1.125rem;
  flex-shrink: 0;
}

.filter-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.filter-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Apply Button - Blue Gradient */
.filter-btn-apply {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 50%, #dc2626 100%);
  color: white;
  flex: 1;
  min-width: 100px;
}

.filter-btn-apply:hover {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 50%, #dc2626 100%);
}

/* Reset Button - Red Gradient */
.filter-btn-reset {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 50%, #dc2626 100%);
  color: white;
  flex: 1;
  min-width: 100px;
}

.filter-btn-reset:hover {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%);
}

/* Download Button - Purple Gradient */
.filter-btn-download {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 50%, #dc2626 100%);
  color: white;
  flex: 1;
  min-width: 120px;
}

.filter-btn-download:hover {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 50%, #dc2626 100%);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .filters-card {
    padding: 1.25rem;
  }
  
  .filters-header {
    margin-bottom: 1.25rem;
  }
  
  .filters-title {
    font-size: 1.125rem;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }
  
  .date-fields {
    grid-template-columns: 1fr;
  }
  
  .filter-field input,
  .filter-field select {
    height: 3rem;
    font-size: 1rem;
  }
  
  .filters-actions {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .filter-btn {
    width: 100%;
    min-width: unset;
    padding: 0.875rem 1.25rem;
    font-size: 1rem;
  }
}

/* Tablet Responsive */
@media (min-width: 769px) and (max-width: 1024px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .date-fields {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
