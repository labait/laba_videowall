<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps(['item'])
</script>

<template>
  <img :src="`https://picsum.photos/500/500?i=${item.id}`" alt="">
</template>

<style lang="scss" scoped>

</style>