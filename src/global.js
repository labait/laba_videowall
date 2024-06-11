import { ref, computed} from "vue";

const allowRecord = computed(() => {
  return (import.meta.env.VITE_ALLOW_RECORD === 'true')
})


export function useGlobal() {
  return {
    allowRecord
  }
}