import { ref, computed} from "vue";


const allowRecord = computed(() => {
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