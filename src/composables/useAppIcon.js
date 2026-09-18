import { ref } from 'vue'

export function useAppIcon() {
  const appIcon = ref(null)
  const appIcons = ref([])
  const isLoaded = ref(false)

  function getRandomItem(array) {
    const randomItem = Math.floor(Math.random() * array.length)
    return array[randomItem]
  }

  async function loadAppIcons() {
    if (isLoaded.value) return

    try {
      const response = await fetch('/data/appicons.json')
      const data = await response.json()
      appIcons.value = data.APPICONS
      isLoaded.value = true
    } catch (error) {
      console.error('Erreur fetch appicons.json:', error)
    }
  }

  function assignIcon() {
    appIcon.value = getRandomItem(appIcons.value)
  }

  return { appIcon, loadAppIcons, assignIcon }
}
