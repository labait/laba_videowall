<script setup>
import { ref, onMounted, computed, defineModel, watch } from "vue";
import { useGlobal } from '../global.js'
const global = useGlobal()
import { useRouter } from 'vue-router'
const router = useRouter()

import VideoForm from "../components/VideoForm.vue";
import Action from '../components/Action.vue';


onMounted(() => {
  if(!global.allowRecord.value) router.push('/')
})

</script>

<template>
  <VideoForm></VideoForm>
  <Action id="actionSecondary" text="back to list" @click="() => router.push('/')"/>
</template>

<style lang="scss" scoped>
</style>