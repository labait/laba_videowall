<script setup>
import { useRouter, RouterLink } from 'vue-router'

//const router = useRouter();
//router.push('/flipbook') // redirect to flipbook view
</script>

<template>
  <nav class="mb-2">
    <RouterLink to="/">List</RouterLink>
    <RouterLink to="/record">Record</RouterLink>
  </nav>
  <main class=" flex flex-col items-center">
    <RouterView />
  </main>
</template>

<style scoped>
main {

}

nav {
  display: flex;
  justify-content: center;
  gap: 1rem;
}
</style>

