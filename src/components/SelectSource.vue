<script setup>
//https://vuejs.org/guide/components/v-model

import { ref, onMounted, defineProps } from "vue";

const props = defineProps({
  "sources": {
    type: Array,
    required: true,
  },
});
const source = defineModel();

</script>

<template>
  <select 
    class="bg-gray-200 border-2 border-gray-200 rounded w-full py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-gray-200" 
    v-model="source" 
  >
    <option value="" disabled selected>Select a source</option>
    <option v-for="source in sources" :key="source.deviceId" :value="source.deviceId">
      {{ source.label }}
    </option> 
  </select>
</template>

<style scope lang="scss">
</style>