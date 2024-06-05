<script setup>
import { useRouter, RouterLink } from 'vue-router'

//const router = useRouter();
//router.push('/flipbook') // redirect to flipbook view
</script>

<template>
  <nav>
    <RouterLink to="/">List</RouterLink>
    <RouterLink to="/record">Record</RouterLink>
  </nav>
  <main class=" flex flex-col items-center">
    <RouterView />
  </main>
</template>

<style >
:root {
  --menu-height: 50px;
}
nav {
  display: flex;
  justify-content: center;
  align-items: center;
  height: var(--menu-height);
  gap: 1rem;
}
main {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: calc(100vh - var(--menu-height));
}
</style>

