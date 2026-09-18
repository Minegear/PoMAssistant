import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore ('Theme', () => {
    const theme = ref(localStorage.getItem('theme') || 'light')
    
    function setTheme(newTheme) {
        theme.value = newTheme
    }

    watch(theme, (newTheme) => {
        localStorage.setItem('theme', newTheme)
        document.documentElement.setAttribute('data-theme', newTheme)
    }, { immediate: true })

    return { theme, setTheme }
})