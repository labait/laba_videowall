<script setup>
import { ref, onMounted, computed, toRaw } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
const router = useRouter()
import VideoItem from '../components/VideoItem.vue'
import { gsap } from 'gsap'

const data = ref({results: []})
const state = ref("loaded")
const message = ref('')
const instructions = ref('click again to record')
const currentItem = ref(null)
const currentVideo = ref(null)
const animDuration = 0.5

const loadData = async () => {
  message.value = "loading"
  const url = '/api/list'
  const response = await axios.get(url)
  data.value = response.data
  message.value = ""
}



const showItem = () => {
  if(data.value.results.length == 0) {
    state.value = "empty"
    return
  }
  message.value = ""
  console.log(currentVideo?.value?.id)
  if(currentVideo?.value?.id) {
    gsap.to(currentVideo.value, {...currentVideo.value.attributes.data, duration: animDuration})
    currentVideo.value.style.zIndex = data.zIndex
  }
  const choosableItems = data.value.results.filter(item => item.id != (currentVideo.value ? currentVideo.value.id : null))
  console.log("choosableItems", toRaw(choosableItems))
  currentItem.value = choosableItems[Math.floor(Math.random() * choosableItems.length)]
  const id = currentItem.value.id
  currentVideo.value = document.getElementById(id)
  const anim = gsap.timeline()
  currentVideo.value.style.zIndex = 100
  gsap.to(
    currentVideo.value, {
      x: 0, 
      y: 0, 
      scale: 1.3, 
      rotate: 0, 
      opacity: 1,
      duration: animDuration,
      onComplete: () => {
        message.value = currentItem.value.properties.message.rich_text[0].plain_text;
        // get video element with id
        const id = currentVideo.value.getAttribute('id');
        const video = document.getElementById(id)
        video.play()
        // execute when video ends
        video.onended = () => {
          showItem()
        }

      }
    }
  )  
  // setTimeout(() => {
  //   showItem()
  // }, animDuration * 1000 * 3); // todo
}

onMounted(async () => {
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
    gsap.to(item, { x, y, scale, rotate, stagger: 0.2, duration: .4, opacity: .8, onComplete: () => {
      message.value = "click to start"
    }})
  })
})

const handleClick = () => {
  switch (state.value) {
    case "loaded":
      state.value = "started"
      showItem()
      break;
    case "started": 
    case "empty": 
      router.push("/record")
    default:
      break;
  }
}

</script>

<template>
  <div id="list">
    <a 
      id="message" 
      href="#"
      class="block w-7/12 text-center"
      @click="handleClick"
    >{{ message }}</a>
    <VideoItem class="item" :id="item.id" v-for="item in data.results" :key="item.id" :item="item" />
  </div>
  <a 
    v-if="currentItem || data.results.length == 0" 
    id="instructions"
    href="#"
    @click="handleClick"
  >
    {{ instructions }}
  </a>
</template>

<style lang="scss" scoped>

  #list {
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
      box-shadow: 20px 30px 10px rgba(0, 0, 0, .3);
    }
  }
</style>