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
<<<<<<< Updated upstream
          <div class="avatar" @click="handleLogout">

           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M5 3h6a3 3 0 0 1 3 3v4h-1V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-4h1v4a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3m3 9h11.25L16 8.75l.66-.75l4.5 4.5l-4.5 4.5l-.66-.75L19.25 13H8z" stroke-width="0.5" stroke="#fff"/></svg>
          </div>

       
=======
          <div class="avatar" @click="toggleDropdown">
            <!-- <span>{{ userInitial }}</span> -->
           <svg
  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="20" fill="none" 
  stroke="currentColor" stroke-width="2.5" stroke-linecap="round"stroke-linejoin="round">
  <path d="M12 4v16" /> <path d="m6 12 6 6 6-6" />
</svg>         
          </div>

          <!-- Dropdown Menu -->
          <div v-if="showDropdown" class="dropdown-menu">
            <button v-if="userRole === 'admin'" class="dropdown-item admin-item" @click="navigateToAdmin">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="dropdown-icon">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                
              </svg>
              Admin  
            </button>
            <button class="dropdown-item logout-item" @click="handleLogout">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" class="dropdown-icon">
                <path fill="currentColor" d="M5 3h6a3 3 0 0 1 3 3v4h-1V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-4h1v4a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3m3 9h11.25L16 8.75l.66-.75l4.5 4.5l-4.5 4.5l-.66-.75L19.25 13H8z"/>
              </svg>
              Logout
            </button>
          </div>
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
  cursor: pointer;
  transition: transform 0.2s;
  padding: 0 0.75rem;
}
.avatar-icon {
  margin-left: auto; /* pushes icon to far right */
}

.avatar:hover {
  transform: scale(1.05);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  min-width: 12rem;
  overflow: hidden;
  z-index: 1000;
  border: 1px solid #e5e7eb;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  width: 100%;
  border: none;
  background: none;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 0.9375rem;
  text-align: left;
  color: #374151;
}

.dropdown-item:hover {
  background: #f9fafb;
}

.dropdown-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.admin-item {
  color: #3b82f6;
  border-bottom: 1px solid #f3f4f6;
}

.admin-item:hover {
  background: rgba(59, 130, 246, 0.05);
}

.logout-item {
  color: #dc2626;
}

.logout-item:hover {
  background: rgba(220, 38, 38, 0.05);
>>>>>>> Stashed changes
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
