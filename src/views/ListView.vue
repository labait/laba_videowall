<script setup>
import { ref, onMounted } from 'vue'

import { useRouter } from 'vue-router'
const router = useRouter()

import VideoItem from '../components/VideoItem.vue'

const items = ref([])

const loadItems = async () => {
  // const response = await fetch('https://jsonplaceholder.typicode.com/posts')
  // const json = await response.json()
  // items.value = json
  items.value = Array.from(
    { length: 10 }, 
    (_, i) => ({ 
      id: i, 
      title: `title ${i}`,
      img: `https://picsum.photos/500/500?i=${i}`
    })
  )
}

onMounted(async () => {
  await loadItems()
  //console.log(items.value)
  const wrapper = document.getElementById('items-wrapper')
  const width = wrapper.clientWidth
  const height = wrapper.clientHeight
  const items = document.querySelectorAll('.item');
  console.log("width", width, "height", height, "items", items.length)
  // place items randomly inside the wrapper
  items.forEach(item => {
    const x = Math.random() * (width - item.clientWidth)
    const y = Math.random() * (height - item.clientHeight)
    const scale = Math.random() * 0.5 + 0.5
    // randomly rotate between -45 and 45 degrees
    const rotate = Math.random() * 90 - 45
    item.style.left = `${x}px`
    item.style.top = `${y}px`
    item.style.transform = `scale(${scale}) rotate(${rotate}deg)`
  })
})

</script>

<template>
  <div id="items-wrapper">
    <VideoItem class="item" v-for="item in items" :key="item.id" :item="item" />
  </div>

</template>

<style lang="scss" scoped>
  #items-wrapper {
    position: relative;
    width: 800px;
    background-color: #fafafa;
    height: 600px;
    .item {
      position: absolute;
      width: 500px;
      img {
        width: 100%;
        object-fit: cover;
      }
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    }
  }
</style>