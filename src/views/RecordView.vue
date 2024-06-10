<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

import VideoForm from "../components/VideoForm.vue";
</script>

<template>
  <VideoForm></VideoForm>
  <a 
    href="" 
    id="actionSecondary"
    @click="(event) => {
      event.preventDefault();
      router.push('/')
    }"
  >
    Go back to list...
  </a>
</template>

<style lang="scss" scoped>
</style>