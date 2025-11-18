<template>
  <div class="layout">
    <!-- Mobile menu toggle -->
    <button class="mobile-toggle" @click="mobileOpen = !mobileOpen" v-if="isMobile">
      <span>☰</span>
      Menu
    </button>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ open: mobileOpen }" @click.self="mobileOpen=false">
      <div class="brand">
        <div class="logo">R</div>
        <h2>Rigel Records</h2>
      </div>

      <ClientOnly placeholder="Loading navigation...">
        <template #default>
          <nav class="nav">
            <!-- Admin Navigation -->
            <template v-if="isAdmin">
              <NuxtLink to="/admin/companies" :class="{ active: isActive('/admin/companies') }">Companies</NuxtLink>
              <NuxtLink to="/admin/reports" :class="{ active: isActive('/admin/reports') }">Entry Reports</NuxtLink>
              <NuxtLink to="/admin/users" :class="{ active: isActive('/admin/users') }">Users</NuxtLink>
              <NuxtLink to="/" :class="{ active: isActive('/') }">Attendant View</NuxtLink>
            </template>
            
            <!-- Attendant Navigation -->
            <template v-else>
              <NuxtLink to="/" :class="{ active: isActive('/') }">Dashboard</NuxtLink>
            </template>
          </nav>

          <div class="footer">
            <div class="user-info">
              <span class="user-email">{{ user?.displayName || user?.email }}</span>
              <span class="user-role">{{ isAdmin ? 'Admin' : 'Attendant' }}</span>
            </div>
            <button class="btn-logout" @click="handleLogout">Logout</button>
          </div>
        </template>
      </ClientOnly>
    </aside>

    <!-- Content slot -->
     <div style="width: 100%; padding: 20px;"> 
    <slot /></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAuth } from "~/composables/useAuth";
import { useNotification } from "~/composables/useNotification";

const mobileOpen = ref(false);
const isMobile = ref(false);
const { user, isAdmin, logout } = useAuth();
const { success } = useNotification();
const router = useRouter();
const route = useRoute();

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 880;
  if (!isMobile.value) {
    mobileOpen.value = false;
  }
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});

function isActive(path) {
  return route.path === path;
}

async function handleLogout() {
  const result = await logout();
  if (result.success) {
    success('Logged out successfully');
    router.push('/login');
  }
}
</script>

<style scoped>
.mobile-toggle {
  display: none;
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 51;
  background: var(--panel);
  border: 1px solid var(--soft);
  border-radius: 10px;
  padding: 8px 12px;
  cursor: pointer;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

@media (max-width: 880px) {
  .mobile-toggle {
    display: flex;
  }
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: rgba(255,255,255,0.1);
  border-radius: 8px;
  margin-bottom: 12px;
}

.user-email {
  font-size: 13px;
  font-weight: 600;
  color: white;
}

.user-role {
  font-size: 11px;
  color: rgba(255,255,255,0.7);
}

.btn-logout {
  width: 100%;
  padding: 10px;
  background: rgba(255,255,255,0.2);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: rgba(255,255,255,0.3);
}
</style>
