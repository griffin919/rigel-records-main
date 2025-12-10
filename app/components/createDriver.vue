<template>
  <div>
    <div class="container">
      <h1>User Management</h1>
      <p class="subtitle">Manage existing drivers and add new drivers</p>

      <!-- Add New User Form (Admin Only) -->
      <section class="card">
        <h2>Add New Driver</h2>
        <form @submit.prevent="handleAddUser" class="user-form">
          <div class="form-row">
            <div class="form-group">
              <label>Email *</label>
              <input
                v-model="newUser.email"
                type="email"
                required
                placeholder="user@example.com"
              />
            </div>
            <div class="form-group">
              <label>Display Name *</label>
              <input
                v-model="newUser.displayName"
                type="text"
                required
                placeholder="John Doe"
              />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Password *</label>
              <input
                v-model="newUser.password"
                type="password"
                required
                minlength="6"
                placeholder="Minimum 6 characters"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Role *</label>
            <select v-model="newUser.role" required>
              <option value="company-manager">Company Manager</option>
              <option value="driver">Driver</option>
            </select>
          </div>

          <button type="submit" class="btn-primary" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? "Adding User..." : "Add User" }}
          </button>
        </form>
      </section>

      <!-- Users List -->
      <section class="card">
        <h2>Existing Users</h2>

        <!-- Search Bar -->
        <div class="search-bar">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by email or name..."
          />
        </div>

        <!-- Users Table -->
         <div v-if="loadingUsers" class="loading-state">
          <span class="spinner"></span>
          <p>Loading users...</p>
        </div>
        
        <CompactTable class="user-table"
          v-else
          :columns="userColumns"
          :items="filteredUsers"
          empty-message="No users found">
          <template #cell-role="{ item }">
            <span class="badge" :class="item.role">{{ item.role }}</span>
          </template>
          <template #cell-createdAt="{ item }">
            {{ formatDate(item.createdAt) }}
          </template>
          <template #row-actions="{ item }">
            <button 
              @click="handleStatus(item)" 
              class="btn-delete"
            :disabled="item.id==user.uid"
            >
            <!-- :disabled="item.id === currentUserId || item.role === 'admin' || !isAdmin"
              :title="item.role === 'admin' ? 'Cannot delete admin accounts' : !isAdmin ? 'Only admins can delete' : 'Delete user'" -->
              Delete
            </button>
          </template>
        </CompactTable>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuth } from "~/composables/useAuth";
import { useCompanies } from "~/composables/useCompanies";
import { useNotification } from "~/composables/useNotification";
import CompactTable from "~/components/CompactTable.vue";
import { doc, updateDoc } from "firebase/firestore";

definePageMeta({
  layout: "admin",
  middleware: ["auth", "company"],
});

const { $db, $auth } = useNuxtApp();
const { registerUser, user: currentUser, initAuth } = useAuth();
const { getCompanies } = useCompanies();
const { getCompanyDrivers } = useDrivers();
const { success, error: showError } = useNotification();
// const { collection, getDocs, doc, deleteDoc } = await import(
//   "firebase/firestore"
// );
const { user } = useAuth();

const loading = ref(false);
const loadingUsers = ref(false);
const users = ref([]);
const companies = ref([]);
const searchQuery = ref("");

const newUser = ref({
  email: "",
  displayName: "",
  password: "",
  role: "driver",
  companyId: "",
  active: false,
});

const currentUserId = computed(() => currentUser.value?.uid);
const currentUserRole = computed(() => currentUser.value?.role);
const isAdmin = computed(() => currentUserRole.value === "admin");

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(
    (u) =>
      u.email.toLowerCase().includes(query) ||
      u.displayName.toLowerCase().includes(query)
  );
});

const handleStatus = async (item) => {
  let isActive = item.active;

  if (isActive) {

     if (user.uid === item.id) {
      showError("You cannot delete your own account");
      return;
    }

    if (user.value?.role != "company-manager") {
      showError("Only company managers can change account status");
      return;
    }

   
    try {
      const userDoc = doc($db, "users", user.id);

      // Get a reference to the document

      // Update the specific fields
      await updateDoc(userDoc, {
        active: true,
      });
      success("Status successfully");

      await fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      showError("Failed to delete user");
    }
  }
};


// async function handleDeleteUser(user) {
//   if (!isAdmin.value) {
//     showError('Only admins can delete users');
//     return;
//   }

//   if (user.role === 'admin') {
//     showError('Admin accounts cannot be deleted');
//     return;
//   }

//   if (user.id === currentUserId.value) {
//     showError('You cannot delete your own account');
//     return;
//   }

//   if (!confirm(`Are you sure you want to delete ${user.email}?`)) {
//     return;
//   }

//   try {
//     const userDoc = doc($db, 'users', user.id);
//     await deleteDoc(userDoc);
//     success('User deleted successfully');
//     await fetchUsers();
//   } catch (err) {
//     console.error('Error deleting user:', err);
//     showError('Failed to delete user');
//   }
// }


const userColumns = computed(() => [
  { key: "email", label: "Email", width: "1.5" },
  { key: "displayName", label: "Display Name", width: "1.5" },
  { key: "role", label: "Role", width: "1" },
  { key: "createdAt", label: "Created", width: "1.2" },
]);

async function fetchUsers() {
  loadingUsers.value = true;
  try {
    users.value = await getCompanyDrivers(user.value.companyId);
    // users.value = snapshot.docs.map(doc => ({
    //   id: doc.id,
    //   ...doc.data()
    // }));
  } catch (err) {
    console.error("Error fetching users:", err);
    showError("Failed to load users");
  } finally {
    loadingUsers.value = false;
  }
}

async function fetchCompanies() {
  try {
    companies.value = await getCompanies();
  } catch (err) {
    console.error("Error fetching companies:", err);
    showError("Failed to load companies");
  }
}

async function handleAddUser() {
  loading.value = true;
  try {
    // Make sure the newUser has the current company's ID and role driver
    newUser.value.companyId = currentUser.value.companyId;
    // newUser.value.role = 'driver';   // Cause of all the registered company managers still appearing as driver role

    const result = await registerUser(
      newUser.value.email,
      newUser.value.password,
      newUser.value.displayName,
      newUser.value.role,
      newUser.value.companyId
    );

    if (result.success) {
      success("Driver added successfully");

      // Reset form for next entry
      newUser.value = {
        email: "",
        displayName: "",
        password: "",
        role: "driver", // keep default role as driver
        companyId: currentUser.value.companyId, // reset to current company
      };

      // Refresh drivers list
      await fetchUsers();
    } else {
      showError(result.message || "Failed to add driver");
    }
  } catch (err) {
    console.error("Error adding driver:", err);
    showError("An error occurred while adding the driver");
  } finally {
    loading.value = false;
  }
}

async function handleAddStatus(user) {
  if (!isAdmin.value) {
    showError("Only admins can delete users");
    return;
  }

  if (user.role === "admin") {
    showError("Admin accounts cannot be deleted");
    return;
  }

  if (user.id === currentUserId.value) {
    showError("You cannot delete your own account");
    return;
  }

  if (!confirm(`Are you sure you want to delete ${user.email}?`)) {
    return;
  }

  try {
    const userDoc = doc($db, "users", user.id);
    await deleteDoc(userDoc);
    success("User deleted successfully");
    await fetchUsers();
  } catch (err) {
    console.error("Error deleting user:", err);
    showError("Failed to delete user");
  }
}

function formatDate(timestamp) {
  if (!timestamp) return "N/A";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

onMounted(() => {
  fetchUsers();
  fetchCompanies();
});
</script>

<style scoped>
.container {
  width: 100%;
}
.subtitle {
  color: #6b7280;
  margin-top: -8px;
  margin-bottom: 24px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card.card-restricted {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
}

.restricted-message {
  color: #6b7280;
  margin: 0;
}

.card h2 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 20px;
}

.user-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 600;
  font-size: 14px;
  color: #111827;
}

.form-group input,
.form-group select {
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #dd1d21;
}

.btn-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, #ffc800, #dd1d21);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  align-self: flex-start;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-bar {
  margin-bottom: 16px;
}

.search-bar input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  text-align: left;
  padding: 12px;
  background: #f9fafb;
  font-weight: 600;
  border-bottom: 2px solid #e5e7eb;
}

.users-table td {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.badge.admin {
  background: #e3f2fd;
  color: #1976d2;
}

.badge.attendant {
  background: #f3e5f5;
  color: #7b1fa2;
}

.badge.company {
  background: #fff3e0;
  color: #e65100;
}

.badge.company-manager {
  background: #e0f2f1;
  color: #00695c;
}

.badge.driver {
  background: #e8f5e9;
  color: #2e7d32;
}

.badge.manager {
  background: #fce4ec;
  color: #c2185b;
}

.btn-delete {
  padding: 6px 12px;
  background: #ffebee;
  color: #c62828;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-delete:hover:not(:disabled) {
  background: #ef5350;
  color: white;
}

.btn-delete:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
