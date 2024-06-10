<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

import VideoForm from "../components/VideoForm.vue";
import Action from '../components/Action.vue';

</script>

<template>
  <VideoForm></VideoForm>
  <Action id="actionSecondary" text="Go back to list..." @click="() => router.push('/')"/>
</template>

<style lang="scss" scoped>
</style>