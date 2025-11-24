<template>
  <ClientOnly>
     <nav>
        <HeaderBar/>
      </nav>
    <div class="layout">
      
   

    <!-- Content slot -->
     <div style="width: 100%;"> 
      <slot />
    </div>
    </div>
  </ClientOnly>
</template>

<script setup>
import { useAuth } from "~/composables/useAuth";
import { useNotification } from "~/composables/useNotification";
import { 
  FireIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon,
  CogIcon
} from '@heroicons/vue/24/outline'

const { user, isAdmin, logout } = useAuth();
const { success } = useNotification();
const router = useRouter();
const route = useRoute();

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
.logo {
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #FFC800, #DD1D21);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(221, 29, 33, 0.2);
}

.logo-icon {
  width: 1.75rem;
  height: 1.75rem;
  color: white;
}

.brand h2 {
  background: linear-gradient(135deg, #FFC800, #DD1D21);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav a {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nav-icon {
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
}

.nav a.active {
  background: linear-gradient(135deg, rgba(255, 200, 0, 0.1), rgba(221, 29, 33, 0.1));
  color: #DD1D21;
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

</style>
