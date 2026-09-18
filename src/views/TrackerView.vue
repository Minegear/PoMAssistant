<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/userStore';
import { useSyncPairs } from '@/composables/useSyncPairs'
import { useTrackedPairs } from '@/composables/useTrackedPairs';
import { useCuratedPairs } from '@/composables/useCuratedPairs';
import { getDuoKey } from '@/utils/duoKey'
import { useSyncPairFilters, tagFilters, roleFilters } from '@/composables/useSyncPairFilters'
import { useSyncPairOrder } from '@/composables/useSyncPairOrder';
import { useHistory } from '@/composables/useHistory';
import { useArenas } from '@/composables/useArenas';

const userStore = useUserStore()
const { trackedPairs, loadTrackedPairs, saveTrackedPairs, clearTrackedPairs } = useTrackedPairs()
const { saveHistory } = useHistory()
const { syncPairs, loadSyncPairs } = useSyncPairs()
const { curatedPairs, loadCuratedPairs } = useCuratedPairs()
const { loadArenas, defaultArenaId } = useArenas()


const modifiedDuoKeys = ref(new Set())
const duoDetails = ref({})

function initDuoDetails() {
    const byDuo = curatedList.value.reduce((acc, pair) => {
        acc[pair.duo_key] = {
            investment_level: pair.investment_level,
            has_ex_role: pair.has_ex_role
        }
        return acc
    }, {})
    duoDetails.value = byDuo
}

function updateInvestment(duo) {
    if (!userStore.currentUserId) { return }
    const currentLevel = duoDetails.value[duo.duo_key].investment_level
    const max = duo.syncPairSuperawakening ? 10 : 5
    const newLevel = currentLevel === max ? 0 : currentLevel + 1
    duoDetails.value[duo.duo_key].investment_level = newLevel

    const newSet = new Set(modifiedDuoKeys.value)
    newSet.add(duo.duo_key)
    modifiedDuoKeys.value = newSet
}

function toggleExRole(duo) {
    if (!userStore.currentUserId) { return }
    const currentExRole = duoDetails.value[duo.duo_key].has_ex_role
    const newExRole = !currentExRole
    duoDetails.value[duo.duo_key].has_ex_role = newExRole

    const newSet = new Set(modifiedDuoKeys.value)
    newSet.add(duo.duo_key)
    modifiedDuoKeys.value = newSet
}

onMounted(async () => {
    const callTab = [loadSyncPairs(), loadArenas()]
    await Promise.all(callTab)
    const usedArena = userStore.currentArenaId ?? defaultArenaId.value
    const callTabDependant = [loadCuratedPairs(usedArena)]
    if (userStore.currentUserId) { callTabDependant.push(loadTrackedPairs(userStore.currentUserId)) }
    await Promise.all(callTabDependant)
    initDuoDetails()
})

const curatedList = computed(() => {
    return curatedPairs.value.map((curatedPair) => {

        const fullPair = syncPairs.value.find(pair => getDuoKey(pair) === curatedPair.duo_key)
        const personalPair = trackedPairs.value.find(tracked => tracked.duo_key === curatedPair.duo_key)

        return {
            ...fullPair,
            duo_key: curatedPair.duo_key,
            is_owned: personalPair?.is_owned ?? false,
            investment_level: personalPair?.investment_level ?? 0,
            has_ex_role: personalPair?.has_ex_role ?? false
        }
    })
})

const {
    selectedType,
    selectedTags,
    selectedRole,
    availableTypes,
    filteredPairs,
    toggleType,
    toggleTag,
    toggleRole
} = useSyncPairFilters(curatedList)

const sortedList = useSyncPairOrder(filteredPairs)

function getRoleIcon(duo) {
    const roleFilter = roleFilters.find((role) => role.roles.includes(duo.syncPairRoleEX))
    if (!roleFilter) return null

    if (duoDetails.value[duo.duo_key]?.has_ex_role) {
        return roleFilter.icon.replace("role_", "role_ex_")
    } else {
        return roleFilter.icon
    }
}

async function handleValidate() {
    const tableKeys = [...modifiedDuoKeys.value]
    const rows = tableKeys.map((duo_key) => {
        return { user_id: userStore.currentUserId, duo_key, investment_level: duoDetails.value[duo_key]?.investment_level, has_ex_role: duoDetails.value[duo_key]?.has_ex_role }
    })

    const historyEntries = tableKeys.map((duo_key) => {
        const originalPair = curatedList.value.find((pair) => pair.duo_key === duo_key)
        return {
            user_id: userStore.currentUserId,
            duo_key,
            old_investment_level: originalPair.investment_level,
            new_investment_level: duoDetails.value[duo_key].investment_level,
            old_has_ex_role: originalPair.has_ex_role,
            new_has_ex_role: duoDetails.value[duo_key].has_ex_role
        }
    })

    const wasSaved = await saveTrackedPairs(userStore.currentUserId, rows)
    if (wasSaved === true) {
        await saveHistory(historyEntries)
    }
    modifiedDuoKeys.value = new Set()
}

function cancelChanges() {
    initDuoDetails()
    modifiedDuoKeys.value = new Set()
}

watch(() => userStore.currentArenaId, async (new_id) => {
    const usedArena = new_id ?? defaultArenaId.value
    await loadCuratedPairs(usedArena)
    cancelChanges()
})

watch(() => userStore.currentUserId, (new_id) => {
    if (new_id === null) {
        clearTrackedPairs()
        cancelChanges()
    }
})

</script>

<template>
    <div class="tracker">
        <aside class="filters">
            <div class="validate-buttons">
                <div class="confirmation-button">
                    <button v-if="modifiedDuoKeys.size !== 0" @click="handleValidate()">
                        <span>Valider</span>
                    </button>
                </div>
                <div class="cancel-button">
                    <button v-if="modifiedDuoKeys.size !== 0" @click="cancelChanges()">
                        <span>Annuler</span>
                    </button>
                </div>
            </div>
            <div class="filter-group">
                <h3>Rôle</h3>
                <div class="filter-buttons">
                    <button v-for="filter in roleFilters" :key="filter.id"
                        :class="{ active: selectedRole === filter.id }" @click="toggleRole(filter.id)"
                        :title="filter.label">
                        <img :src="`/assets/images/${filter.icon}`" :alt="filter.label">
                    </button>
                </div>
            </div>
            <div class="filter-group">
                <h3>Filtre</h3>
                <div class="filter-buttons">
                    <button v-for="type in availableTypes" :key="type" :class="{ active: selectedType === type }"
                        @click="toggleType(type)" :title="type">
                        <img :src="`/assets/images/type_${type.toLowerCase()}.png`" :alt="type">
                    </button>
                </div>
            </div>
            <div class="filter-group">
                <div class="filter-buttons">
                    <div class="filter-buttons">
                        <button v-for="filter in tagFilters" :key="filter.id"
                            :class="{ active: selectedTags.includes(filter.id) }" @click="toggleTag(filter.id)"
                            :title="filter.label">
                            <img :src="`/assets/images/${filter.icon}`" :alt="filter.label">
                        </button>
                    </div>
                </div>
            </div>
        </aside>
        <div class="results">
            <div class="grid">
                <div v-for="duo in sortedList" :key="duo.duo_key" class="card">
                    <div class="image-wrapper">
                        <img :src="`/assets/${duo.images[duoDetails[duo.duo_key]?.investment_level > 0 ? 1 : 0]}`"
                            :alt="duo.pokemonName" @click="updateInvestment(duo)">
                        <div class="investment">
                            <img :src="`/assets/images/${duoDetails[duo.duo_key]?.investment_level ?? 0}.png`"
                                :alt="`investment : ${duoDetails[duo.duo_key]?.investment_level ?? 0}`"
                                @click="updateInvestment(duo)">
                        </div>
                    </div>
                    <div class="exrole" v-if="duo.syncPairRoleEX">
                        <img :src="`/assets/images/${duoDetails[duo.duo_key]?.has_ex_role ? 'icon_role_ex.png'
                            : 'icon_role_ex_2.png'}`" @click="toggleExRole(duo)" :alt="`Icon EX`" class="role-icon">
                        <img v-if="getRoleIcon(duo)" :src="`/assets/images/${getRoleIcon(duo)}`" @click="toggleExRole(duo)"
                            :alt="`Icon EX Role`" class="role-icon">
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.tracker {
    display: flex;
    gap: 24px;
    height: 100%;
}

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
    flex: 1;
    overflow-y: auto;
    align-content: start;
}

@media (max-width: 768px) {
    .grid {
        grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
    }
}

.filters {
    flex: 0 0 33%;
    overflow-y: auto;
    min-height: 0;
}

@media (max-width: 768px) {
    .filters {
        flex: 0 0 25%;
    }
}

.results {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.card {
    text-align: center;
    position: relative;
}

.card img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: contain;
}

.card p {
    font-size: 12px;
    margin-top: 4px;
}

.filter-group {
    margin-bottom: 24px;
}

.filter-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.filter-buttons button {
    padding: 6px 12px;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: none;
    color: var(--color-text);
    cursor: pointer;
}

.filter-buttons button.active {
    background-color: var(--color-heading);
    color: var(--color-background);
}

.validate-buttons {
    display: flex;
    flex-direction: row;
}

.validate-buttons button {
    border-radius: 12px;
    padding: 6px 12px;
    color: var(--color-background);
    background-color: var(--color-text);
}

.image-wrapper {
    position: relative;
}

.investment {
    position: absolute;
    width: 35%;
    height: 35%;
    bottom: 5%;
    left: -2%;
}

.exrole {
    display: flex;
    flex-direction: row;
    width: 100%;
}

.role-icon {
    width: 50%;
    aspect-ratio: 1;
    min-width: 0;
}

.tracker h3 {
    text-align: center;
    font-size: 1.2rem;
    font-weight: bold;
    color: rgb(26, 94, 196)
}
</style>