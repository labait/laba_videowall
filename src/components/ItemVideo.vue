<script setup>
import { ref, onMounted, computed } from 'vue'
const props = defineProps(['item'])

const videoUrl = computed(() => {
  return props.item.properties.media.files[0].external.url
})

</script>

<template>
  <video 
    class="item" 
    :id="item.id"
    :src="videoUrl"
    webkit-playsinline 
    playsinline
  >
  </video>
</template>

<style lang="scss" scoped>
  .item {
    min-width: 500px;
    width: 350px;
    height: 500px;
    border-radius: 5px;
    background-position: center;
    background-size: cover;
    border-radius: 50%;
    object-fit: cover;
  }
</style>

