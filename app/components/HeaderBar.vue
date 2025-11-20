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
          <div class="avatar">{{ userInitial }}</div>
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
