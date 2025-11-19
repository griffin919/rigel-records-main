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
            <div class="flex gap-3 mt-6 justify-end">
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
      <section class="card">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold">All Companies</h3>
          <div class="text-sm text-muted-foreground">{{ companies.length }} companies</div>
        </div>

        <div class="divide-y">
          <div v-for="c in companies" :key="c.id" class="py-4 flex justify-between items-center">
            <div class="flex-1">
              <div class="font-semibold text-base">{{ c.name }}</div>
              <div class="text-sm text-muted-foreground mt-1">
                {{ c.contactPerson }} · {{ c.location }} · {{ c.phone }}
              </div>
              <div class="text-sm text-muted-foreground mt-1">
                Drivers: {{ (c.drivers || []).length }}
              </div>
            </div>
            <div class="flex gap-2">
              <button class="btn secondary" @click="openManageDrivers(c)">
                Manage Drivers
              </button>
              <button class="btn secondary" @click="showCompanyDetails(c)">
                View Transactions
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Manage Drivers Modal -->
      <div v-if="showDriversModal" class="modal-backdrop" @click.self="closeDriversModal">
        <div class="modal max-w-2xl">
          <h3 class="text-xl font-semibold mb-4">Manage Drivers — {{ currentCompany?.name }}</h3>
          
          <!-- Add Driver Form -->
          <form @submit.prevent="handleAddDriver" class="mb-6">
            <div class="flex gap-3">
              <div class="field flex-1">
                <label>Driver Name</label>
                <input v-model="newDriverName" type="text" placeholder="Enter driver name" required />
              </div>
              <div class="field flex-1">
                <label>Phone Number</label>
                <input v-model="newDriverPhone" type="tel" placeholder="0241234567" required />
              </div>
              <div class="field flex-1">
                <label>Car Number</label>
                <input v-model="newDriverCar" type="text" placeholder="GW-1234-20" required />
              </div>
              <div class="field" style="padding-top: 26px;">
                <button class="btn" type="submit" :disabled="isSubmitting">
                  Add Driver
                </button>
              </div>
            </div>
          </form>

          <!-- Drivers List -->
          <div class="mb-4">
            <h4 class="font-semibold mb-3">Current Drivers ({{ (currentCompany?.drivers || []).length }})</h4>
            <div class="divide-y border rounded-lg">
              <div 
                v-for="(driver, index) in (currentCompany?.drivers || [])" 
                :key="index" 
                class="py-3 px-4 flex justify-between items-center"
              >
                <div>
                  <div class="font-medium">{{ driver.name }}</div>
                  <div class="text-sm text-muted-foreground">{{ driver.phone }} · {{ driver.carNumber }}</div>
                </div>
                <button 
                  class="btn secondary" 
                  @click="removeDriver(index)"
                  :disabled="isSubmitting"
                >
                  Remove
                </button>
              </div>
              <div v-if="!(currentCompany?.drivers || []).length" class="py-4 px-4 text-center text-muted-foreground">
                No drivers added yet
              </div>
            </div>
          </div>

          <div class="flex justify-end mt-6">
            <button class="btn" @click="closeDriversModal">Close</button>
          </div>
        </div>
      </div>

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
                  <th>Item</th>
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
                  <td>{{ t.itemName || 'Fuel' }}</td>
                  <td>{{ t.quantity || t.fuelQuantity }} {{ t.itemUnit || 'L' }}</td>
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
                <tr v-if="!detailsItem.transactions.length">
                  <td colspan="9" class="text-center text-muted-foreground">No transactions yet</td>
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
const { getCompanies, addCompany, updateCompany } = useCompanies();
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
const showDriversModal = ref(false);
const currentCompany = ref(null);
const newDriverName = ref('');
const newDriverPhone = ref('');
const newDriverCar = ref('');

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

function openManageDrivers(company) {
  currentCompany.value = { ...company };
  if (!currentCompany.value.drivers) {
    currentCompany.value.drivers = [];
  }
  newDriverName.value = '';
  newDriverPhone.value = '';
  newDriverCar.value = '';
  showDriversModal.value = true;
}

function closeDriversModal() {
  showDriversModal.value = false;
  currentCompany.value = null;
  newDriverName.value = '';
  newDriverPhone.value = '';
  newDriverCar.value = '';
}

async function handleAddDriver() {
  if (!newDriverName.value.trim() || !newDriverPhone.value.trim() || !newDriverCar.value.trim()) {
    error('Please enter driver name, phone number, and car number');
    return;
  }

  isSubmitting.value = true;
  try {
    const updatedDrivers = [
      ...(currentCompany.value.drivers || []),
      { 
        name: newDriverName.value.trim(), 
        phone: newDriverPhone.value.trim(),
        carNumber: newDriverCar.value.trim()
      }
    ];

    await updateCompany(currentCompany.value.id, { drivers: updatedDrivers });

    // Update local state
    const companyIndex = companies.value.findIndex(c => c.id === currentCompany.value.id);
    if (companyIndex > -1) {
      companies.value[companyIndex].drivers = updatedDrivers;
    }
    currentCompany.value.drivers = updatedDrivers;

    newDriverName.value = '';
    newDriverPhone.value = '';
    newDriverCar.value = '';
    success('Driver added successfully!');
  } catch (err) {
    console.error(err);
    error('Failed to add driver');
  } finally {
    isSubmitting.value = false;
  }
}

async function removeDriver(index) {
  isSubmitting.value = true;
  try {
    const updatedDrivers = [...currentCompany.value.drivers];
    updatedDrivers.splice(index, 1);

    await updateCompany(currentCompany.value.id, { drivers: updatedDrivers });

    // Update local state
    const companyIndex = companies.value.findIndex(c => c.id === currentCompany.value.id);
    if (companyIndex > -1) {
      companies.value[companyIndex].drivers = updatedDrivers;
    }
    currentCompany.value.drivers = updatedDrivers;

    success('Driver removed successfully!');
  } catch (err) {
    console.error(err);
    error('Failed to remove driver');
  } finally {
    isSubmitting.value = false;
  }
}
</script>
