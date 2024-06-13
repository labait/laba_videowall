<script setup>
import { ref, onMounted, computed, toRaw } from 'vue'

const props = defineProps({
  text: String,
  iconClass: String
})  

const emits = defineEmits(['click'])
</script>

<template>
  <a 
    href="#"
    class="block text-center"
    @click="(event) => {
      event.preventDefault();
      emits('click', event)
    }"
  >
  <slot/>
  {{ text }}
  </a>
</template>

<style scoped lang="scss">
</style>
