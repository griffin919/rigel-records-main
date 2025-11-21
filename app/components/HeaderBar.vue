<template>
  <div>
      <div class="header">
        <div class="header-top">
          <span>
            <img src="/shell_logo.svg" width="45px" />
          </span>
          <span>
            <h1 class="greeting">Hi {{ userName }}!</h1>
            <p class="sub-greeting">{{ greetingMessage }}</p>
          </span>
          <div class="sidebar-footer">
          <div class="avatar" @click="handleLogout">

           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M5 3h6a3 3 0 0 1 3 3v4h-1V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-4h1v4a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3m3 9h11.25L16 8.75l.66-.75l4.5 4.5l-4.5 4.5l-.66-.75L19.25 13H8z" stroke-width="0.5" stroke="#fff"/></svg>
          </div>

       
      </div>
        </div>
      </div>
  </div>
  </template>


<script setup>
import { useAuth } from '~/composables/useAuth'

const { user } = useAuth()

// User info
const userName = computed(() => {
  if (user.value?.displayName) {
    return user.value.displayName
  }
  if (user.value?.email) {
    return user.value.email.split('@')[0]
  }
  return 'Attendant'
})

// Logout
 const { isAdmin, logout } = useAuth();
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

const userInitial = computed(() => userName.value.charAt(0).toUpperCase());

const greetingMessage = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
});
</script>

<style scoped>

.greeting {
  font-size: 1.875rem;
  font-weight: bold;
  color: #111827;
  margin: 0;
  text-align: center;
}

.sub-greeting {
  color: #6b7280;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  text-align: center;
}


.avatar {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(to bottom right, #ffc800, #dd1d21);
  color: white;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.125rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}


.header {
  background: white;
  padding: 1rem 1.5rem 0.5rem 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 40;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}


@media (max-width: 480px) {
  .greeting {
    font-size: 1.5rem;
  }

  .summary-item .number {
    font-size: 1.2rem;
  }
}
.logout-btn {
  color: #dc2626;
}

.logout-btn:hover {
  background: rgba(220, 38, 38, 0.1);
}
.nav-item{
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-logout:hover {
  background: rgba(255,255,255,0.3);
}

.logout-icon {
  width: 1.25rem;
  height: 1.25rem;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-logout:hover {
  background: rgba(255,255,255,0.3);
}

.logout-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* --------------------------------------------- */
/* DESKTOP VIEW (Large Screens)                  */
/* --------------------------------------------- */
@media (min-width: 1024px) {
  
  /* Header looks cleaner on desktop */
  .header {
    padding: 1.25rem 2rem;
  }

  /* Remove mobile-only elements */
  .mobile-only {
    display: none !important;
  }

}

@media (min-width: 1024px) {
  

  /* FIX 3: Reduce header padding too if you want tighter layout */
  .header {
    padding: 1rem 2rem;
  }
}
</style>
