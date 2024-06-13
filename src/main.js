import { createApp } from 'vue'
import router from './router'
import { BootstrapIconsPlugin } from "bootstrap-icons-vue";

import './style.css'
import App from './App.vue'

createApp(App)
.use(BootstrapIconsPlugin)
.use(router)

.mount('#app')
