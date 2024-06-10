<script setup>
import { useRouter, RouterLink } from 'vue-router'

//const router = useRouter();
//router.push('/flipbook') // redirect to flipbook view
</script>

<template>
  <video v-show="true" autoplay="" loop="" muted="" playsinline="" id="background-video">
      <!-- video esportati con codec mp4 e webm -->
      <source src="/videos/background.mp4" type="video/mp4">
      <source src="/videos/background.webm" type="video/webm">
      <!-- fallback image in formato gif nel caso non sia supportato il markup video -->
      <img src="/videos/background-fallback.gif" title="Your browser does not support the video tag">
  </video>
  <nav v-if="false">
    <RouterLink to="/">List</RouterLink>
    <RouterLink to="/record">Record</RouterLink>
  </nav>
  <main class=" flex flex-col items-center h-screen">
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
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: calc(100vh - var(--menu-height));
}

#message, #instructions {
  color: white;
  letter-spacing:-0.05em;
  text-align: center; 
  line-height: 0.9em;
  cursor: pointer;
}

#message {
  overflow-wrap: break-word;
  font-size: 8vw;
  color: white;
  letter-spacing:-0.05em;
  text-align: center;
  z-index: 101;
}

#instructions {
  font-size: 4vw;
  position: absolute;
  bottom: 3rem;
}
</style>

