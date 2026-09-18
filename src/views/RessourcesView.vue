<script setup>
import { computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore';
import { useUserResources } from '@/composables/useUserResources';
import { resourceCategories } from '@/data/resourceCategories';

const userStore = useUserStore()
const { resourceCounts, loadUserResources, updateResourceCount } = useUserResources()

onMounted(async () => {
    await loadUserResources(userStore.currentUserId)
    initMissingResources()
})

function initMissingResources() {
    const flatRessTab = resourceCategories.flatMap((row) => row.items)
    const filteredTab = flatRessTab.filter((item) => item.mode !== 'readonly')
    filteredTab.forEach((item) => {
        if (resourceCounts.value[item.id] === undefined) {
            resourceCounts.value[item.id] = 0
        }
    })
}

const cakeMultiCount = computed(() => {
    const total = (resourceCounts.value?.medaille_role ?? 0) + Math.floor((resourceCounts.value?.bon_quoti ?? 0) / 5)
    return Math.floor(total / 20)
})

function incrementResource(resourceId, delta) {
    const newCount = (resourceCounts.value[resourceId] + delta < 0) ? 0 : resourceCounts.value[resourceId] + delta
    updateResourceCount(userStore.currentUserId, resourceId, newCount)
}

function updateInputResource(event, resourceId) {
    const inputValue = event.target.value
    let numberValue = Number(inputValue)
    numberValue = (Number.isNaN(numberValue) || (Number(numberValue) < 0)) ? 0 : Number(numberValue)
    updateResourceCount(userStore.currentUserId, resourceId, numberValue)
}
</script>

<template>
    <div class="ressources">
        <div v-for="section in resourceCategories" :key="section.title" class="section-ressource">
            <p>{{ section.title }}</p>
            <div class="items-container">
                <template v-for="item in section.items" :key="item.id">
                    <div class="item-card">
                        <img :src="item.src" :alt="item.alt" width="100" height="100" />
                        <div class="counter">
                            <div v-if="item.mode === 'buttons'">
                                <button @click="incrementResource(item.id, -1)">-</button>
                                <span>{{ resourceCounts[item.id] }}</span>
                                <button @click="incrementResource(item.id, +1)">+</button>
                            </div>
                            <div v-else-if="item.mode === 'input'" class="mode-input">
                                <input type="number" :value="resourceCounts[item.id]"
                                    @blur="updateInputResource($event, item.id)"
                                    @keyup.enter="updateInputResource($event, item.id)" />
                            </div>
                            <div v-else>
                                <span>{{ cakeMultiCount }}</span>
                            </div>
                        </div>
                    </div>
                    <span v-if="item.id === 'medaille_role'" class="arrow">→</span>
                </template>
            </div>
        </div>
    </div>
</template>

<style scoped>
.items-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
    padding-bottom: 10px;
}

.item-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px
}

.item-card img {
    width: 100px;
    aspect-ratio: 1;
    object-fit: contain;
}

.counter {
    display: flex;
    align-items: center;
    gap: 6px;
}

.counter button {
    padding: 6px 12px;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background-color: var(--color-background-soft);
    color: var(--color-text);
    cursor: pointer;
}

.counter span {
    padding: 6px;
    min-width: 2ch;
    text-align: center;
    display: inline-block;
}

.mode-input input {
    padding: 6px 12px;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background-color: var(--color-background-soft);
    color: var(--color-text);
    width: 80px;
    text-align: center;
}

.arrow {
    font-size: 36px;
    color: var(--color-text);
    display: flex;
    align-items: center;
}
</style>