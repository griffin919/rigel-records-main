<template>
  <ClientOnly>
     <nav>
        <HeaderBar/>
      </nav>
    <div class="admin-layout">
      <!-- Desktop Sidebar -->
      <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-icon">
            <FireIcon class="icon" />
          </span>
          <span class="logo-text">Rigel</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <NuxtLink to="/" class="nav-item" :class="{ active: currentRoute === '/' }">
          <HomeIcon class="nav-icon" />
          <span class="nav-label">Sales </span>
        </NuxtLink>
        <NuxtLink to="/reports" class="nav-item" :class="{ active: currentRoute === '/reports' }">
          <ChartBarIcon class="nav-icon" />
          <span class="nav-label">Reports</span>
        </NuxtLink>
        <NuxtLink to="/admin/companies" class="nav-item" :class="{ active: currentRoute.startsWith('/admin/companies') }">
          <BuildingOfficeIcon class="nav-icon" />
          <span class="nav-label">Companies</span>
        </NuxtLink>
        <NuxtLink to="/admin/settings" class="nav-item" :class="{ active: currentRoute.startsWith('/admin/settings') }">
          <CogIcon class="nav-icon" />
          <span class="nav-label">Settings</span>
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <button class="nav-item logout-btn" @click="handleLogout">
          <ArrowRightOnRectangleIcon class="nav-icon" />
          <span class="nav-label">Logout</span>
        </button>
      </div>
    </aside>

    <!-- Mobile Bottom Navigation -->
    <nav class="bottom-nav">
      <NuxtLink to="/" class="bottom-nav-item" :class="{ active: currentRoute === '/' }">
        <HomeIcon class="bottom-nav-icon" />
        <span class="bottom-nav-label">Home</span>
      </NuxtLink>
      <NuxtLink to="/reports" class="bottom-nav-item" :class="{ active: currentRoute === '/reports' }">
        <ChartBarIcon class="bottom-nav-icon" />
        <span class="bottom-nav-label">Reports</span>
      </NuxtLink>
      <div class="bottom-nav-item add-button" @click="$emit('add')">
        <span class="bottom-nav-icon-wrapper">
          <img src="/shell_logo.svg" width="50px"/>
        </span>
      </div>
      <NuxtLink to="/admin/companies" class="bottom-nav-item" :class="{ active: currentRoute.startsWith('/admin/companies') }">
        <BuildingOfficeIcon class="bottom-nav-icon" />
        <span class="bottom-nav-label">Companies</span>
      </NuxtLink>
      <NuxtLink to="/admin/settings" class="bottom-nav-item" :class="{ active: currentRoute.startsWith('/admin/settings') }">
        <CogIcon class="bottom-nav-icon" />
        <span class="bottom-nav-label">Settings</span>
      </NuxtLink>
    </nav>

    <!-- Main Content Wrapper -->
    <div class="content-wrapper">
      <slot />
    </div>

    <!-- Floating Add Button (Desktop) -->
    <button v-if="showFloatingButton" class="floating-btn" @click="$emit('add')">
      <PlusIcon class="plus-icon" />
    </button>
    </div>
  </ClientOnly>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  HomeIcon, 
  ChartBarIcon, 
  BuildingOfficeIcon, 
  FireIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
  CogIcon
} from '@heroicons/vue/24/outline'

defineProps({
  showFloatingButton: {
    type: Boolean,
    default: true
  }
})

defineEmits(['add'])

const route = useRoute()
const router = useRouter()

const currentRoute = computed(() => route.path)

function handleLogout() {
  router.push('/login')
}
</script>

<style scoped>
/* Admin Layout Styles */
.admin-layout {
  min-height: 100vh;
  background: #f9fafb;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
}

/* Desktop Sidebar */
.sidebar {
  display: none;
  width: 16rem;
  background: white;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  border-right: 1px solid #e5e7eb;
  flex-direction: column;
  z-index: 50;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #FFC800, #DD1D21);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(221, 29, 33, 0.2);
}

.logo-icon .icon {
  width: 1.5rem;
  height: 1.5rem;
  color: white;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #FFC800, #DD1D21);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: 0.75rem;
  color: #6b7280;
  text-decoration: none;
  transition: all 0.2s;
  margin-bottom: 0.5rem;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  font-size: 0.9375rem;
}

.nav-item:hover {
  background: #f9fafb;
  color: #111827;
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(255, 200, 0, 0.1), rgba(221, 29, 33, 0.1));
  color: #DD1D21;
  font-weight: 600;
}

.nav-icon {
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
}

.nav-label {
  flex: 1;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #f3f4f6;
}

.logout-btn {
  color: #dc2626;
}

.logout-btn:hover {
  background: rgba(220, 38, 38, 0.1);
}

/* Bottom Navigation (Mobile) */
.bottom-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: white;
  border-top: 1px solid #e5e7eb;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.5rem;
  z-index: 100;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  color: #9ca3af;
  text-decoration: none;
  transition: all 0.2s;
  flex: 1;
  max-width: 5rem;
  background: none;
  border: none;
  cursor: pointer;
}

.bottom-nav-item.active {
  color: #DD1D21;
}

.bottom-nav-item:not(.add-button):active {
  transform: scale(0.95);
}

.bottom-nav-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.bottom-nav-label {
  font-size: 0.625rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.add-button {
  position: relative;
  margin-top: -1.5rem;
}

.bottom-nav-icon-wrapper {
  width: 3.5rem;
  height: 3.5rem;
  background: #FFC800;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(221, 29, 33, 0.4);
}

.plus-icon {
  width: 2rem;
  height: 2rem;
  color: white;
  stroke-width: 2.5;
}

.add-button:active .bottom-nav-icon-wrapper {
  transform: scale(0.95);
}

/* Content Wrapper */
.content-wrapper {
  flex: 1;
  width: 100%;
  min-height: 100vh;
  padding-bottom: 5rem;
}

/* Floating Button (Desktop) */
.floating-btn {
  display: none;
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #FFC800, #DD1D21);
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  border: none;
  box-shadow: 0 8px 16px rgba(221, 29, 33, 0.4);
  transition: all 0.3s;
  z-index: 50;
}

.floating-btn .plus-icon {
  width: 2rem;
  height: 2rem;
}

.floating-btn:hover {
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 12px 24px rgba(221, 29, 33, 0.5);
}

.floating-btn:active {
  transform: scale(0.95) rotate(90deg);
}

/* Responsive */
@media (min-width: 768px) {
  .sidebar {
    display: flex;
  }

  .bottom-nav {
    display: none;
  }

  .floating-btn {
    display: flex;
  }

  .content-wrapper {
    margin-left: 16rem;
    padding-bottom: 2rem;
  }
}
</style>
