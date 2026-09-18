import { ref } from 'vue'

export function useMonthly() {
  const events = ref([])
  const banners = ref([])
  const isLoaded = ref(false)

  async function loadMonthlyData() {
    if (isLoaded.value) return

    try {
      const response = await fetch('/data/monthly.json')
      const data = await response.json()
      events.value = data.EVENTS
      banners.value = data.BANNERS
      isLoaded.value = true
    } catch (error) {
      console.error('Erreur fetch monthly.json:', error)
    }
  }

  return { events, banners, loadMonthlyData }
}
