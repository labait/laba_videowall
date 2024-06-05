<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
const router = useRouter()
import VideoItem from '../components/VideoItem.vue'
import { gsap } from 'gsap'

const data = ref([])
const isLoading = ref(false)
const currentItem = ref({})
const animDuration = 0.4

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

const showItem = () => {
  if(currentItem.value.id) {
    gsap.to(currentItem.value, {...currentItem.value.attributes.data, duration: animDuration})
    currentItem.value.style.zIndex = data.zIndex
  }
  const choosableItems = data.value.results.filter(item => item.id != currentItem.value.id)
  const id = choosableItems[Math.floor(Math.random() * choosableItems.length)].id
  currentItem.value = document.getElementById(id)
  const anim = gsap.timeline()
  currentItem.value.style.zIndex = 100
  gsap.to(
    currentItem.value, {
      x: 0, 
      y: 0, 
      scale: 1.3, 
      rotate: 0, 
      duration: animDuration,
    }
  )
  setTimeout(() => {
    showItem()
  }, 1000);
}

const onLoad = () => {
  console.log("loaded")
}


onMounted(async () => {
  window.addEventListener("load", onLoad);
  await loadData()
  const wrapper = document.getElementById('list')
  const items = document.querySelectorAll('.item');
  items.forEach((item, index) => {
    const safeArea = .7
    const x = -wrapper.clientWidth*safeArea/2 + Math.random() * wrapper.clientWidth*safeArea
    const y = -wrapper.clientHeight*safeArea/2 + Math.random() * wrapper.clientHeight*safeArea
    const scale = 0.3 + Math.random() * 0.3
    const rotate = Math.random() * 90 - 45
    const zIndex = index
    item.attributes.data = { x, y, scale, rotate, zIndex } // save initial position
    gsap.to(item, { x, y, scale, rotate, stagger: 0.2, duration: .4 })
  })
  setTimeout(() => {
    showItem()
  }, 1000);
})

</script>

<template>
  <div id="list">
    <div v-if="isLoading" id="loading">loading</div>
    <VideoItem class="item" :id="item.id" v-for="item in data.results" :key="item.id" :item="item" />
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
      transform-origin: center;
      position: absolute;
      width: 500px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    }
  }
</style>