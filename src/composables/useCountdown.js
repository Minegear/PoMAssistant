import { ref } from 'vue'
import { onMounted, onUnmounted } from 'vue'

export function useCountdown(startDate, endDate) {
  const hasStarted = ref(false)
  const remainingTime = ref('')
  let timeInterval

  function calculateCountdown() {
    const now = new Date()
    const start = new Date(startDate)
    hasStarted.value = now >= start

    const target = hasStarted.value ? endDate : startDate

    const diff = new Date(target).getTime() - now.getTime()

    const totalSeconds = Math.floor(diff / 1000)

    const hours = Math.floor(totalSeconds / 3600)

    const minutes = Math.floor((totalSeconds - 3600 * hours) / 60)

    const seconds = totalSeconds - 3600 * hours - 60 * minutes

    const formatedHours = String(hours).padStart(2, '0')
    const formatedMinutes = String(minutes).padStart(2, '0')
    const formatedSeconds = String(seconds).padStart(2, '0')

    remainingTime.value = `${formatedHours}:${formatedMinutes}:${formatedSeconds}`
  }

  onMounted(() => {
    calculateCountdown()
    timeInterval = setInterval(calculateCountdown, 1000)
  })

  onUnmounted(() => {
    clearInterval(timeInterval)
  })

  return { hasStarted, remainingTime }
}
