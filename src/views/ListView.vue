<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
const router = useRouter()

import VideoItem from '../components/VideoItem.vue'

const data = ref([])
const isLoading = ref(false)

const loadData = async () => {
  isLoading.value = true
  /* test data
  const response = await fetch('https://jsonplaceholder.typicode.com/posts')
  const json = await response.json()
  items.value = json
  data.value = Array.from(
    { length: 10 }, 
    (_, i) => ({ 
      id: i, 
      title: `title ${i}`,
      img: `https://picsum.photos/500/500?i=${i}`
    })
  )
  return
  */
  const url = '/api/fetchNotion'
  const response = await axios.get(url)
  console.log(response.data)
  data.value = response.data
  isLoading.value = false
}

const displayItems = () => {
  console.log("data", data.value)
}


onMounted(async () => {
  await loadData()
  const wrapper = document.getElementById('list')
  const safeAreaPercentage = 0.7
  const safeWidth = wrapper.clientWidth*safeAreaPercentage
  const safeHeight = wrapper.clientHeight*safeAreaPercentage
  const items = document.querySelectorAll('.item');
  console.log("safeWidth", safeWidth, "safeHeight", safeHeight, "items", items.length)
  // place items randomly inside the wrapper
  items.forEach(item => {
    const x = (wrapper.clientWidth - safeWidth)/2 + Math.random() * (safeWidth/2)
    const y = (wrapper.clientHeight - safeHeight)/2 + Math.random() * (safeHeight/2)
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
  <div id="list">
    <div v-if="isLoading" id="loading">loading</div>
    <VideoItem class="item" v-for="item in data.results" :key="item.id" :item="item" />
  </div>
</template>

<style lang="scss" scoped>
  #loading {
    font-size: 6em;
  }

  #list {
    border: 1px solid #ccc; 
    height: 100%;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    position: relative;
    
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