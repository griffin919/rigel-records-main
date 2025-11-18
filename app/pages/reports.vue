<script setup>
definePageMeta({
  middleware: ['auth', 'admin']
});

const router = useRouter();

onMounted(() => {
  router.push('/admin/reports');
});
</script>

<template>
  <div></div>
</template>
