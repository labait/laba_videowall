<script setup>
import { useRouter, RouterLink } from 'vue-router'

//const router = useRouter();
//router.push('/flipbook') // redirect to flipbook view
</script>

<template>
  <video autoplay="" loop="" muted="" playsinline="" id="background-video">
      <!-- video esportati con codec mp4 e webm -->
      <source src="/videos/background.mp4" type="video/mp4">
      <source src="/videos/background.webm" type="video/webm">
      <!-- fallback image in formato gif nel caso non sia supportato il markup video -->
      <img src="/videos/background-fallback.gif" title="Your browser does not support the video tag">
  </video>
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

#background-video {
    position: fixed;
    bottom: 0;
    min-width: 100%;
    min-height: 100%;
    z-index: -1;
    object-fit: cover;
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

