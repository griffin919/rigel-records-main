<template>
  <main class="content">
    <div v-if="loadError" class="error-state">
      <strong>Error:</strong> {{ loadError }}
    </div>
    
    <div v-if="isLoading" class="loading-state">
      <img src="/shell_logo.png" alt="Loading" class="loading-logo" />
      <p class="loading-text">Loading...</p>
    </div>
    
    <template v-else>
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold tracking-tight mb-2">Companies</h1>
          <p class="text-muted-foreground">Manage your client companies</p>
        </div>
        <button class="btn" @click="openAddCompany">
          <PlusIcon class="btn-icon" />
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
                <button class="btn secondary" @click="router.push(`/admin/companies/${c.id}`)">
                  <EyeIcon class="btn-icon-sm" />
                  View Details
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

    </template>
  </main>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useTransactions } from "~/composables/useTransactions";
import { useCompanies } from "~/composables/useCompanies";
import { useNotification } from "~/composables/useNotification";
import { PlusIcon, EyeIcon } from '@heroicons/vue/24/outline';

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
});

const router = useRouter();
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
</script>

<style scoped>
.btn-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
}

.btn-icon-sm {
  width: 1rem;
  height: 1rem;
  margin-right: 0.375rem;
}
</style>
