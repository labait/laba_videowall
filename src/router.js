import { createWebHistory, createRouter } from 'vue-router'

import ListView from './views/ListView.vue'
import RecordView from './views/RecordView.vue'


const routes = [
  { path: '/', component: ListView, name: "list", },
  { path: '/record', component: RecordView, name: "record", },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router