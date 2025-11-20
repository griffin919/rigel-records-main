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
        <h1 class="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p class="text-muted-foreground">Manage users and inventory items</p>
      </div>

      <!-- Tabs -->
      <div class="tabs-container">
        <div class="tabs">
          <button 
            class="tab" 
            :class="{ active: activeTab === 'users' }"
            @click="activeTab = 'users'"
          >
            <UsersIcon class="tab-icon" />
            User Management
          </button>
          <button 
            class="tab" 
            :class="{ active: activeTab === 'items' }"
            @click="activeTab = 'items'"
          >
            <CubeIcon class="tab-icon" />
            Inventory Items
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Users Tab -->
        <div v-if="activeTab === 'users'" class="tab-panel">
          <!-- Add New User Form -->
          <section class="card">
            <h2 class="section-title">Add New User</h2>
            <form @submit.prevent="handleAddUser" class="user-form">
              <div class="form-row">
                <div class="field">
                  <label>Email *</label>
                  <input 
                    v-model="newUser.email" 
                    type="email" 
                    required 
                    placeholder="user@example.com"
                  />
                </div>
                <div class="field">
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
                <div class="field">
                  <label>Password *</label>
                  <input 
                    v-model="newUser.password" 
                    type="password" 
                    required 
                    minlength="6"
                    placeholder="Minimum 6 characters"
                  />
                </div>
                <div class="field">
                  <label>Role *</label>
                  <select v-model="newUser.role" required>
                    <option value="attendant">Attendant</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <button type="submit" class="btn" :disabled="submittingUser">
                <span v-if="submittingUser" class="btn-spinner"></span>
                {{ submittingUser ? 'Adding User...' : 'Add User' }}
              </button>
            </form>
          </section>

          <!-- Users List -->
          <section class="card">
            <h2 class="section-title">Existing Users ({{ users.length }})</h2>
            
            <!-- Search Bar -->
            <div class="search-bar">
              <MagnifyingGlassIcon class="search-icon" />
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Search by email or name..."
              />
            </div>

            <div v-if="filteredUsers.length === 0" class="empty-state">
              <p>No users found</p>
            </div>

            <div v-else class="overflow-x-auto">
              <table class="table users-mobile">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Display Name</th>
                    <th>Role</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in filteredUsers" :key="user.id">
                    <td data-label="Email">{{ user.email }}</td>
                    <td data-label="Name">{{ user.displayName }}</td>
                    <td data-label="Role">
                      <span class="badge" :class="user.role">{{ user.role }}</span>
                    </td>
                    <td data-label="Created">{{ formatDate(user.createdAt) }}</td>
                    <td data-label="Action">
                      <button 
                        @click="handleDeleteUser(user)" 
                        class="btn-small btn-danger"
                        :disabled="user.id === currentUserId"
                        title="Delete user"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <!-- Items Tab -->
        <div v-if="activeTab === 'items'" class="tab-panel">
          <!-- Add/Edit Item Modal -->
          <div v-if="showItemModal" class="modal-backdrop" @click.self="closeItemModal">
            <div class="modal max-w-md">
              <h3 class="text-xl font-semibold mb-4">{{ editingItem ? 'Edit Item' : 'Add Item' }}</h3>
              <form @submit.prevent="handleSaveItem">
                <div class="flex flex-col gap-4">
                  <div class="field">
                    <label>Item Name</label>
                    <input v-model="itemForm.name" required placeholder="e.g., Diesel, Gasoline, Lubricant" />
                  </div>
                  <div class="field">
                    <label>Unit of Measurement</label>
                    <input v-model="itemForm.unit" required placeholder="e.g., Liters, Gallons, Bottles" />
                    <small class="field-hint">How this item is measured</small>
                  </div>
                  <div class="field">
                    <label>Color</label>
                    <input v-model="itemForm.color" type="color" required />
                    <small class="field-hint">Visual identifier for this item</small>
                  </div>
                  <div class="field">
                    <label>Price per Unit (GHS) - Optional</label>
                    <input v-model.number="itemForm.price" type="number" step="0.01" min="0" placeholder="0.00" />
                    <small class="field-hint">Leave blank if price varies</small>
                  </div>
                  <div class="field">
                    <label>Description - Optional</label>
                    <textarea v-model="itemForm.description" rows="3" placeholder="Additional details about this item"></textarea>
                  </div>
                </div>
                <div class="flex gap-3 mt-6 justify-end">
                  <button class="btn secondary" type="button" @click="closeItemModal">
                    Cancel
                  </button>
                  <button class="btn" type="submit" :disabled="submittingItem">
                    <span v-if="submittingItem" class="btn-spinner"></span>
                    {{ submittingItem ? 'Saving...' : 'Save Item' }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Items List -->
          <section class="card">
            <Items />
          </section>
        </div>
      </div>
    </template>
  </main>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useItems } from "~/composables/useItems";
import { useAuth } from '~/composables/useAuth';
import { useNotification } from "~/composables/useNotification";
import { 
  UsersIcon, 
  CubeIcon, 
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/vue/24/outline';

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
});

const { $db, $auth } = useNuxtApp();
const { getItems, addItem, updateItem, deleteItem } = useItems();
const { registerUser, user: currentUser } = useAuth();
const { success, error } = useNotification();
const { collection, getDocs, doc, deleteDoc } = await import('firebase/firestore');

// General
const isLoading = ref(false);
const loadError = ref('');
const activeTab = ref('users');

// Users
const users = ref([]);
const searchQuery = ref('');
const submittingUser = ref(false);
const newUser = ref({
  email: '',
  displayName: '',
  password: '',
  role: 'attendant'
});

const currentUserId = computed(() => currentUser.value?.uid);

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(u => 
    u.email.toLowerCase().includes(query) || 
    u.displayName.toLowerCase().includes(query)
  );
});

// Items
const items = ref([]);
const submittingItem = ref(false);
const showItemModal = ref(false);
const editingItem = ref(null);

const itemForm = reactive({
  name: "",
  unit: "",
  color: "#3b82f6",
  price: null,
  description: ""
});

onMounted(async () => {
  isLoading.value = true;
  loadError.value = '';
  try {
    await Promise.all([
      fetchUsers(),
      fetchItems()
    ]);
  } catch (err) {
    console.error('Load error:', err);
    loadError.value = err?.message || 'Failed to load data';
    error('Failed to load data');
  } finally {
    isLoading.value = false;
  }
});

// User Functions
async function fetchUsers() {
  try {
    const usersCol = collection($db, 'users');
    const snapshot = await getDocs(usersCol);
    users.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (err) {
    console.error('Error fetching users:', err);
    throw err;
  }
}

async function handleAddUser() {
  submittingUser.value = true;
  try {
    const result = await registerUser(
      newUser.value.email,
      newUser.value.password,
      newUser.value.displayName,
      newUser.value.role
    );
    
    if (result.success) {
      success('User added successfully');
      newUser.value = {
        email: '',
        displayName: '',
        password: '',
        role: 'attendant'
      };
      await fetchUsers();
    } else {
      error(result.message || 'Failed to add user');
    }
  } catch (err) {
    console.error('Error adding user:', err);
    error('An error occurred while adding the user');
  } finally {
    submittingUser.value = false;
  }
}

async function handleDeleteUser(user) {
  if (user.id === currentUserId.value) {
    error('You cannot delete your own account');
    return;
  }

  if (!confirm(`Are you sure you want to delete ${user.email}?`)) {
    return;
  }

  try {
    const userDoc = doc($db, 'users', user.id);
    await deleteDoc(userDoc);
    success('User deleted successfully');
    await fetchUsers();
  } catch (err) {
    console.error('Error deleting user:', err);
    error('Failed to delete user');
  }
}

function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

// Item Functions
async function fetchItems() {
  try {
    items.value = (await getItems()) || [];
  } catch (err) {
    console.error('Error fetching items:', err);
    throw err;
  }
}

function openAddItem() {
  editingItem.value = null;
  resetForm();
  showItemModal.value = true;
}

function openEditItem(item) {
  editingItem.value = item;
  itemForm.name = item.name;
  itemForm.unit = item.unit;
  itemForm.color = item.color || "#3b82f6";
  itemForm.price = item.price || null;
  itemForm.description = item.description || "";
  showItemModal.value = true;
}

function closeItemModal() {
  showItemModal.value = false;
  editingItem.value = null;
  resetForm();
}

function resetForm() {
  itemForm.name = "";
  itemForm.unit = "";
  itemForm.color = "#3b82f6";
  itemForm.price = null;
  itemForm.description = "";
}

async function handleSaveItem() {
  if (!itemForm.name.trim() || !itemForm.unit.trim() || !itemForm.color.trim()) {
    error('Please enter item name, unit, and color');
    return;
  }

  submittingItem.value = true;
  try {
    const itemData = {
      name: itemForm.name.trim(),
      unit: itemForm.unit.trim(),
      color: itemForm.color.trim(),
      price: itemForm.price || 0,
      description: itemForm.description.trim()
    };

    if (editingItem.value) {
      await updateItem(editingItem.value.id, itemData);
      const index = items.value.findIndex(i => i.id === editingItem.value.id);
      if (index > -1) {
        items.value[index] = { ...items.value[index], ...itemData };
      }
      success('Item updated successfully!');
    } else {
      const newItem = await addItem(itemData);
      items.value.push(newItem);
      success('Item added successfully!');
    }

    closeItemModal();
  } catch (err) {
    console.error(err);
    error('Failed to save item');
  } finally {
    submittingItem.value = false;
  }
}

async function handleDeleteItem(item) {
  if (!confirm(`Are you sure you want to delete "${item.name}"?`)) {
    return;
  }

  try {
    await deleteItem(item.id);
    items.value = items.value.filter(i => i.id !== item.id);
    success('Item deleted successfully!');
  } catch (err) {
    console.error(err);
    error('Failed to delete item');
  }
}
</script>

<style scoped>
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

.tab-content {
  width: 100%;
}

.tab-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Sections */
.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

/* User Form */
.user-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* Search Bar */
.search-bar {
  position: relative;
  margin-bottom: 1rem;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
  pointer-events: none;
}

.search-bar input {
  width: 100%;
  padding-left: 2.5rem;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.badge.admin {
  background: #dbeafe;
  color: #1e40af;
}

.badge.attendant {
  background: #f3e8ff;
  color: #6b21a8;
}

/* Button Icon */
.btn-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
}

/* Mobile responsive */
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
  }

  .tab-icon {
    width: 1rem;
    height: 1rem;
  }

  /* Mobile view for users table */
  .users-mobile thead {
    display: none;
  }

  .users-mobile tbody tr {
    display: block;
    background: #ffffff;
    margin-bottom: 1rem;
    padding: 1rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    border: 1px solid #e5e7eb;
  }

  .users-mobile tbody td {
    display: flex;
    justify-content: space-between;
    padding: 0.6rem 0 !important;
    font-size: 14px;
    border-bottom: 1px solid #f3f4f6;
  }

  .users-mobile tbody td:last-child {
    border-bottom: none;
    padding-top: 1rem !important;
  }

  .users-mobile tbody td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #6b7280;
  }
}
</style>
