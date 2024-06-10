<script setup>
import { ref, onMounted, computed, toRaw } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
const router = useRouter()
import VideoItem from '../components/VideoItem.vue'
import { gsap } from 'gsap'

const data = ref({results: []})
const state = ref("loaded")
const actionPrimary = ref('')
const actionSecondary = ref('click to record')
const currentItem = ref(null)
const currentVideo = ref(null)
const animDuration = 0.5

const loadData = async () => {
  actionPrimary.value = "loading"
  const url = '/api/list'
  const response = await axios.get(url)
  data.value = response.data
  actionPrimary.value = ""
}



const showItem = () => {
  if(data.value.results.length == 0) {
    state.value = "empty"
    return
  }
  actionPrimary.value = ""
  console.log(currentVideo?.value?.id)
  if(currentVideo?.value?.id) {
    gsap.to(currentVideo.value, {...currentVideo.value.attributes.data, duration: animDuration})
    currentVideo.value.style.zIndex = data.zIndex
    document.getElementById(currentVideo.value.getAttribute('id')).pause()
  }
  const choosableItems = data.value.results.filter(item => item.id != (currentVideo.value ? currentVideo.value.id : null))
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
        actionPrimary.value = currentItem.value.properties.message.rich_text[0].plain_text;
        const video = document.getElementById(currentVideo.value.getAttribute('id'))
        video.play()
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
      actionPrimary.value = "click to start"
    }})
  })
})

const handleClickPrimary = () => {
  switch (state.value) {
    case "loaded":
      state.value = "started"
      showItem()
      break;
    case "started": 
      showItem()
      break;
    case "empty": 
      router.push("/record")
    default:
      break;
  }
}


const handleClickSecondary = () => {
  router.push("/record")
}

</script>

<template>
  <div id="list">
    <a 
      id="actionPrimary" 
      href="#"
      class="block w-7/12 text-center"
      @click="handleClickPrimary"
    >{{ actionPrimary }}</a>
    <VideoItem class="item" :id="item.id" v-for="item in data.results" :key="item.id" :item="item" />
  </div>
  <a 
    v-if="currentItem || data.results.length == 0" 
    id="actionSecondary"
    href="#"
    @click="handleClickSecondary"
  >
    {{ actionSecondary }}
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