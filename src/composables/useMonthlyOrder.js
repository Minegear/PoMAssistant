import { computed } from 'vue'

export function useMonthlyOrder(table) {
  const orderedTable = computed(() => {
    const now = new Date()
    return table.value.toSorted((a, b) => {
      const aHasStarted = now >= new Date(a.startDate)
      const bHasStarted = now >= new Date(b.startDate)
      if (aHasStarted - bHasStarted === 0) {
        if (aHasStarted) {
          return new Date(a.endDate) - new Date(b.endDate)
        } else {
          return new Date(a.startDate) - new Date(b.startDate)
        }
      } else {
        return aHasStarted - bHasStarted
      }
    })
  })
  return orderedTable
}
