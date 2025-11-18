<template>
  <main class="content">
    <div v-if="loadError" class="error-state">
      <strong>Error:</strong> {{ loadError }}
    </div>
    
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading companies...</p>
    </div>
    
    <template v-else>
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold tracking-tight mb-2">Companies</h1>
          <p class="text-muted-foreground">Manage your client companies</p>
        </div>
        <button class="btn" @click="openAddCompany">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Add Company
        </button>
      </div>

      <!-- Add Company Modal -->
      <div v-if="showAddCompany" class="modal-backdrop" @click.self="closeAddCompany">
        <div class="modal max-w-md">
          <h3 class="text-xl font-semibold mb-4">Add Company</h3>
          <form @submit.prevent="handleAddCompany">
            <div class="flex flex-col gap-4">
              <div class="field">
                <label>Company name</label>
                <input v-model="company.name" required />
              </div>
              <div class="field">
                <label>Contact person</label>
                <input v-model="company.contactPerson" required />
              </div>
              <div class="field">
                <label>Location</label>
                <input v-model="company.location" required />
              </div>
              <div class="field">
                <label>Contact phone</label>
                <input v-model="company.phone" required />
              </div>
            </div>
            <div class="form-actions">
              <button class="btn secondary" type="button" @click="closeAddCompany">
                Cancel
              </button>
              <button class="btn" type="submit" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="btn-spinner"></span>
                {{ isSubmitting ? 'Saving...' : 'Save Company' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Companies List -->
      <section class="card companies-mobile">
  <h3 class="text-xl font-semibold">All Companies ({{ companies.length }})</h3>

  <table class="table">
    <thead>
      <tr>
        <th>Company Name</th>
        <th>Contact Person</th>
        <th>Location</th>
        <th>Phone</th>
        <th>Action</th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="c in companies" :key="c.id">
        <td data-label="Company">{{ c.name }}</td>
        <td data-label="Contact">{{ c.contactPerson }}</td>
        <td data-label="Location">{{ c.location }}</td>
        <td data-label="Phone">{{ c.phone }}</td>

        <td data-label="Action">
          <button class="btn secondary" @click="showCompanyDetails(c)">
            View Transactions
          </button>
        </td>
      </tr>

      <tr v-if="!companies.length">
        <td colspan="5" class="text-center text-muted-foreground">
          No companies found
        </td>
      </tr>
    </tbody>
  </table>
</section>

      <!-- Details Modal -->
<div v-if="detailsItem" class="modal-backdrop" @click.self="detailsItem = null">
  <div class="modal max-w-4xl">
    <h3 class="text-xl font-semibold mb-4">{{ detailsItem.company }} — Full Report</h3>

    <div class="mobile-view">
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
            <td data-label="Driver" class="font-medium">{{ t.driverName }}</td>
            <td data-label="Phone">{{ t.phone }}</td>
            <td data-label="Car">{{ t.carNumber }}</td>
            <td data-label="Qty">{{ t.fuelQuantity }}L</td>
            <td data-label="Cost" class="font-semibold">GHS {{ t.cost }}</td>
            <td data-label="Date">{{ formatDate(t.createdAt) }}</td>
            <td data-label="Status">
              <span :class="['status-badge', t.paid ? 'status-paid' : 'status-unpaid']">
                {{ t.paid ? "Paid" : "Unpaid" }}
              </span>
            </td>
            <td data-label="Action">
              <button 
                class="btn-small" 
                :class="t.paid ? 'btn-warning' : 'btn-success'"
                @click="togglePaidStatus(t)"
              >
                {{ t.paid ? 'Mark Unpaid' : 'Mark Paid' }}
              </button>
            </td>
          </tr>

          <tr v-if="!detailsItem.transactions.length">
            <td colspan="8" class="text-center text-muted-foreground">No transactions yet</td>
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
import { ref, reactive, onMounted } from "vue";
import { useTransactions } from "~/composables/useTransactions";
import { useCompanies } from "~/composables/useCompanies";
import { useNotification } from "~/composables/useNotification";

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'admin']
});

const { getTransactions, updateTransaction } = useTransactions();
const { getCompanies, addCompany } = useCompanies();
const { success, error } = useNotification();

const transactions = ref([])
const companies = ref([])
const isLoading = ref(false)
const isSubmitting = ref(false)
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

const showAddCompany = ref(false);
const detailsItem = ref(null);

const company = reactive({
  name: "",
  contactPerson: "",
  location: "",
  phone: "",
});

function openAddCompany() {
  showAddCompany.value = true;
}

function closeAddCompany() {
  showAddCompany.value = false;
}

async function handleAddCompany() {
  if (
    !company.name ||
    !company.contactPerson ||
    !company.location ||
    !company.phone
  ) {
    error("Please fill all company fields");
    return;
  }

  isSubmitting.value = true;
  try {
    const newId = await addCompany({
      name: company.name,
      contactPerson: company.contactPerson,
      location: company.location,
      phone: company.phone,
    });

    companies.value.push({ id: newId, ...company });
    Object.keys(company).forEach((k) => (company[k] = ""));
    showAddCompany.value = false;
    success("Company added successfully!");
  } catch (err) {
    console.error(err);
    error("Failed to add company.");
  } finally {
    isSubmitting.value = false;
  }
}

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

function formatDate(dt) {
  return dt ? new Date(dt).toLocaleString() : "-";
}

function showCompanyDetails(c) {
  const companyTransactions = transactions.value.filter((t) => t.companyId === c.id);
  detailsItem.value = { 
    company: c.name, 
    transactions: companyTransactions 
  };
}
</script>
