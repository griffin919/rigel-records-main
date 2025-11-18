<template>
  <main class="content">
    <div v-if="loadError" class="error-state">
      <strong>Error:</strong> {{ loadError }}
    </div>
    
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading reports...</p>
    </div>
    
    <template v-else>
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold tracking-tight mb-2">Entry Reports</h1>
        <p class="text-muted-foreground">View and analyze fuel transaction reports</p>
      </div>

      <!-- Filters Card -->
      <section class="card mb-6">
        <div class="mb-4">
          <h3 class="text-lg font-semibold mb-1">Filters</h3>
          <p class="text-sm text-muted-foreground">Filter entries by date range or company</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div class="field">
            <label>From</label>
            <input type="date" v-model="from" />
          </div>
          <div class="field">
            <label>To</label>
            <input type="date" v-model="to" />
          </div>
          <div class="field">
            <label>Company</label>
            <select v-model="filterCompany">
              <option value="">All companies</option>
              <option v-for="c in companies" :key="c.id" :value="c.name">
                {{ c.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex gap-3 flex-wrap">
          <button class="btn apply" @click="applyFilter">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
            </svg>
            Apply Filters
          </button>
          <button class="btn reset" @click="resetFilter">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Reset
          </button>
          <button class="btn download" @click="downloadCSV">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Download CSV
          </button>
        </div>
      </section>

      <!-- Company Summary Table -->
      <section class="card">
        <h3 class="text-lg font-semibold mb-4">Company Summary</h3>
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Amount Owed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in filteredCompanySummary" :key="c.company">
                <td class="font-medium">{{ c.company }}</td>
                <td class="font-semibold text-lg">GHS {{ c.amountOwed.toFixed(2) }}</td>
                <td>
                  <button class="btn ghost" @click="openCompanyDetails(c)">
                    View Details
                  </button>
                </td>
              </tr>
              <tr v-if="!filteredCompanySummary.length">
                <td colspan="3" class="text-center text-muted-foreground">No records found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Details Modal -->
      <div v-if="detailsItem" class="modal-backdrop" @click.self="detailsItem = null">
        <div class="modal max-w-4xl">
          <h3 class="text-xl font-semibold mb-4">{{ detailsItem.company }} — Full Report</h3>
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>Driver</th>
                  <th>Phone</th>
                  <th>Car</th>
                  <th>Qty</th>
                  <th>Cost</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="t in detailsItem.transactions" :key="t.id">
                  <td class="font-medium">{{ t.driverName }}</td>
                  <td>{{ t.phone }}</td>
                  <td>{{ t.carNumber }}</td>
                  <td>{{ t.fuelQuantity }}L</td>
                  <td class="font-semibold">GHS {{ t.cost }}</td>
                  <td class="text-muted-foreground">{{ formatDate(t.createdAt) }}</td>
                  <td>
                    <span :class="['status-badge', t.paid ? 'status-paid' : 'status-unpaid']">
                      {{ t.paid ? "Paid" : "Unpaid" }}
                    </span>
                  </td>
                  <td>
                    <button 
                      class="btn-small" 
                      :class="t.paid ? 'btn-warning' : 'btn-success'"
                      @click="togglePaidStatus(t)"
                    >
                      {{ t.paid ? 'Mark Unpaid' : 'Mark Paid' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="flex justify-end mt-6">
            <button class="btn" @click="detailsItem = null">Close</button>
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
  layout: 'default',
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
    "FuelQuantity",
    "Cost",
    "CreatedAt",
    "Paid",
  ];
  const csvRows = rows.map((r) =>
    [
      `"${r.company}"`,
      `"${r.driverName}"`,
      `"${r.phone}"`,
      `"${r.carNumber}"`,
      r.fuelQuantity,
      r.cost,
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
