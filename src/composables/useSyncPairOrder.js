import { computed } from 'vue'

export function useSyncPairOrder(pairs) {
  const sortedList = computed(() => {
    return pairs.value.toSorted((a, b) => -a.releaseDate.localeCompare(b.releaseDate))
  })
  return sortedList
}
