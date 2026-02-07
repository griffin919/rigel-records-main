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
      <div class="flex items-center justify-between mb-6">
        <div>
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
                <input v-model="company.phone" type="tel" placeholder="0241234567" pattern="^(0|\+?233)?[2-5][0-9]{8}$"
                  title="Enter a valid Ghana phone number (e.g., 0241234567)" required @blur="validatePhone"
                  :class="{ 'error-field': phoneError }" />
                <small v-if="phoneError" class="error-text">{{ phoneError }}</small>
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
      <section>
        <h3 class="text-xl font-semibold mb-4">All Companies ({{ companies.length }})</h3>

        <ResponsiveTable :columns="companyColumns" :items="companies" empty-message="No companies found">
          <template #cell-totalPoints="{ item }">
            <span class="font-bold text-yellow-600">{{ item.totalPoints || 0 }} pts</span>
          </template>

          <template #row-actions="{ item }">
            <button class="btn secondary" @click="router.push(`/admin/companies/${item.id}`)">
              <EyeIcon class="btn-icon-sm" />
              View Details
            </button>
          </template>
        </ResponsiveTable>
      </section>

    </template>
  </main>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useTransactions } from "~/composables/useTransactions";
import { useCompanies } from "~/composables/useCompanies";
import { useNotification } from "~/composables/useNotification";
import { usePhoneValidation } from "~/composables/usePhoneValidation";
import { useFirebaseErrors } from "~/composables/useFirebaseErrors";
import ResponsiveTable from "~/components/ResponsiveTable.vue";
import { PlusIcon, EyeIcon } from '@heroicons/vue/24/outline';

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
});

const router = useRouter();
const { getTransactions, updateTransaction } = useTransactions();
const { getCompanies, addCompany, updateCompany } = useCompanies();
const { success, error } = useNotification();
const { validateGhanaPhone, formatForStorage } = usePhoneValidation();
const { getErrorMessage } = useFirebaseErrors();

const transactions = ref([])
const companies = ref([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const loadError = ref('')
const phoneError = ref('')

const companyColumns = computed(() => [
  { key: 'name', label: 'Company Name', width: '1.5' },
  { key: 'contactPerson', label: 'Contact Person', width: '1.2' },
  { key: 'location', label: 'Location', width: '1.2' },
  { key: 'phone', label: 'Phone', width: '1' },
  { key: 'totalPoints', label: 'Total Points', width: '1' },
])

onMounted(async () => {
  isLoading.value = true
  loadError.value = ''
  try {
    transactions.value = (await getTransactions()) || []
    companies.value = (await getCompanies()) || []

    // Calculate total points for each company
    companies.value = companies.value.map(company => {
      const companyTransactions = transactions.value.filter(t => t.companyId === company.id)
      const totalPoints = companyTransactions.reduce((sum, t) => sum + (t.pointsEarned || 0), 0)
      return { ...company, totalPoints }
    })
  } catch (err) {
    console.error('Load error:', err)
    const errorMsg = getErrorMessage(err)
    loadError.value = errorMsg
    error(errorMsg)
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
  phoneError.value = '';
}

function closeAddCompany() {
  showAddCompany.value = false;
  phoneError.value = '';
}

function validatePhone() {
  if (!company.phone) {
    phoneError.value = ''
    return
  }
  const validation = validateGhanaPhone(company.phone)
  if (!validation.valid) {
    phoneError.value = validation.message
  } else {
    phoneError.value = ''
    // Auto-format to international format
    company.phone = validation.formatted
  }
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

  // Validate phone
  validatePhone()
  if (phoneError.value) {
    error('Please fix the phone number')
    return
  }

  const formattedPhone = formatForStorage(company.phone)
  if (!formattedPhone) {
    error('Invalid phone number')
    return
  }

  isSubmitting.value = true;
  try {
    const newId = await addCompany({
      name: company.name,
      contactPerson: company.contactPerson,
      location: company.location,
      phone: formattedPhone,
    });

    companies.value.push({ id: newId, ...company, phone: formattedPhone });
    Object.keys(company).forEach((k) => (company[k] = ""));
    phoneError.value = '';
    showAddCompany.value = false;
    success("Company added successfully!");
  } catch (err) {
    console.error(err);
    error(getErrorMessage(err));
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.error-field {
  border-color: #dc2626 !important;
}

.error-field:focus {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
}

.error-text {
  color: #dc2626;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
}
</style>

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
