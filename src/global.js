import { ref, computed} from "vue";


const isLocalhost = computed(() => {
  return window.location.hostname === 'localhost'
})

const allowRecord = computed(() => {
  if(isLocalhost.value) return true;
  return (import.meta.env.VITE_ALLOW_RECORD === 'true')
})

const maintenance = computed(() => {
  let maintenance = (import.meta.env.VITE_MAINTENANCE === 'true')
  if (window.location.hostname === 'localhost') maintenance = false
  if (window.location.search.includes('debug=1')) maintenance = false
  return maintenance
})


export function useGlobal() {
  return {
    allowRecord,
    maintenance,
  }
}