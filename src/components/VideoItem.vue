<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps(['item'])
</script>

<template>
  <img :src="item.img" alt="">
</template>

<style lang="scss" scoped>

</style>