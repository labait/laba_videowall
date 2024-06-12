<script setup>
import { ref, onMounted, computed, toRaw } from 'vue'

import { useGlobal } from './global.js'
const global = useGlobal()

import { useRouter, RouterLink } from 'vue-router'
import QrCode from './components/QrCode.vue'

</script>

<template>
  <template v-if="global.maintenance.value">
    <div id="maintenance">
      <QrCode />
      visit us in the next future :-)
    </div>
  </template>
  <template v-else>
    <video v-show="true" autoplay="" loop="" muted="" webkit-playsinline playsinline id="background-video">
      <!-- video esportati con codec mp4 e webm -->
      <source src="/videos/background.mp4" type="video/mp4">
      <source src="/videos/background.webm" type="video/webm">
      <!-- fallback image in formato gif nel caso non sia supportato il markup video -->
      <img src="/videos/background-fallback.gif" title="Your browser does not support the video tag">
    </video>
    <main class=" flex flex-col items-center h-screen">
      <RouterView />
    </main>
  </template>
  
</template>


<style scoped>



</style>

<style >
:root {
  --menu-height: 50px;
}

#maintenance {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 2rem;
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

#actionPrimary, #actionSecondary {
  padding: 1rem;
  /* border-radius: 0.5rem; */
  color: white;
  letter-spacing:-0.05em;
  text-align: center; 
  line-height: 0.9em;
  cursor: pointer;
  &:hover {
    /* background-color: rgba(0, 0, 0, 0.6); */
    text-shadow: 1px 1px 16px rgba(0, 0, 0, 0.7);
  }
}

#actionPrimary {
  overflow-wrap: break-word;
  font-size: 8vw;
  letter-spacing:-0.05em;
  text-align: center;
  z-index: 101;
}

#actionSecondary {
  font-size: 4vw;
  position: absolute;
  bottom: 3rem;

  @media screen and (max-width: 768px) {
    font-size: 1.4rem;
    z-index: 100;
  }
}
</style>

