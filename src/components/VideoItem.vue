<script setup>
import { ref, onMounted } from 'vue'
const props = defineProps(['item'])
</script>

<template>
  <div 
    class="item" 
    :id="item.id"
    :style="{
      backgroundImage: `url(https://source.unsplash.com/random/?bw&${item.id})`,
    }"
  >
  </div>
</template>

<style lang="scss" scoped>
  .item {
    width: 500px;
    height: 500px;
    border-radius: 5px;
    background-position: center;
    background-size: cover;
    border-radius: 50%;
  }
</style>