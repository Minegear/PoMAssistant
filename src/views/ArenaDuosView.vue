<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useArenaTrackedPairs } from '@/composables/useArenaTrackedPairs';
import { useUsers } from '@/composables/useUsers';
import { useUserStore } from '@/stores/userStore';
import { useSyncPairs } from '@/composables/useSyncPairs';
import { useCuratedPairs } from '@/composables/useCuratedPairs';
import { getDuoKey } from '@/utils/duoKey'
import { useRouter } from 'vue-router';
import { useSyncPairFilters, roleFilters } from '@/composables/useSyncPairFilters';


const { arenaTrackedPairs, loadArenaTrackedPairs } = useArenaTrackedPairs()
const { users, loadUsers } = useUsers()
const userStore = useUserStore()
const { syncPairs, loadSyncPairs } = useSyncPairs()
const { curatedPairs, loadCuratedPairs } = useCuratedPairs()
const router = useRouter()

const selectedMembers = ref(new Set())
const selectedType = ref('Normal')

const arenaMembers = computed(() => {
    const userTable = users.value.filter((user) => user.arena_id === userStore.currentArenaId)
    return userTable
})

const curatedList = computed(() => {
    return curatedPairs.value.map((curatedPair) => {

        const fullPair = syncPairs.value.find(pair => getDuoKey(pair) === curatedPair.duo_key)

        return {
            ...fullPair,
            duo_key: curatedPair.duo_key,
        }
    })
})

const { availableTypes } = useSyncPairFilters(curatedList)

function toggleMember(userId) {
    const key = userId
    const newSet = new Set(selectedMembers.value)

    if (newSet.has(key)) {
        newSet.delete(key)
    } else {
        newSet.add(key)
    }
    selectedMembers.value = newSet
}

const memberDuos = computed(() => {
    const filteredMembers = arenaMembers.value.filter((member) =>
        selectedMembers.value.size === 0 || selectedMembers.value.has(member.id)
    )

    return filteredMembers.map((member) => {
        const investedRows = arenaTrackedPairs.value.filter((row) => row.user_id === member.id)
        const duos = investedRows.map((row) => {
            return {
                ...curatedList.value.find(tracked => tracked.duo_key === row.duo_key),
                duo_key: row.duo_key,
                investment_level: row.investment_level,
                has_ex_role: row.has_ex_role,
            }
        }).filter((duo) => duo.pokemonType === selectedType.value && duo.investment_level > 0)
        return { member, duos }
    })
})

const sortedMembers = computed(() => {
    const sorted = memberDuos.value.toSorted((a, b) => {
        return b.duos.reduce((acc, row) => acc + row.investment_level, 0) - a.duos.reduce((acc, row) => acc + row.investment_level, 0)
    })
    return sorted
})

onMounted(async () => {
    await loadUsers()
    await loadArenaTrackedPairs(arenaMembers.value.map(m => m.id))
    loadSyncPairs()
    await loadCuratedPairs(userStore.currentArenaId)
})

function selectType(type) {
    selectedType.value = selectedType.value === type ? selectedType.value : type
}

watch(() => userStore.currentUserId, (new_id) => {
    if (new_id === null) {
        router.push('/')
    }
})

function getRoleIcon(duo) {
    const roleFilter = roleFilters.find((role) => role.roles.includes(duo.syncPairRoleEX))
    if (duo.has_ex_role) {
        return roleFilter.icon.replace("role_", "role_ex_")
    } else {
        return roleFilter.icon
    }
}
</script>

<template>
    <div class="arena-duos">
        <aside class="filters">
            <div class="filter-group">
                <h3>Filtre</h3>
                <div class="filter-buttons">
                    <button v-for="type in availableTypes" :key="type" :class="{ active: selectedType === type }"
                        @click="selectType(type)" :title="type">
                        <img :src="`/assets/images/type_${type.toLowerCase()}.png`" :alt="type">
                    </button>
                </div>
            </div>
            <div class="filter-group">
                <h3>Membres</h3>
                <div class="member-buttons">
                    <button v-for="member in arenaMembers" :key="member.id"
                        :class="{ active: selectedMembers.has(member.id) }" @click="toggleMember(member.id)">
                        {{ member.username }}
                    </button>
                </div>
            </div>
        </aside>
        <div class="member-lines">
            <div v-for="entry in sortedMembers" :key="entry.member.id">
                <span>{{ entry.member.username }}</span>
                <div class="duo-row">
                    <div v-for="duo in entry.duos" :key="duo.duo_key" class="card">
                        <div class="image-wrapper">
                            <img :src="`/assets/${duo.images[duo.investment_level > 0 ? 1 : 0]}`"
                                :alt="duo.pokemonName">
                            <div class="investment">
                                <img :src="`/assets/images/${duo.investment_level}.png`"
                                    :alt="`investment : ${duo.investment_level}`">
                            </div>
                        </div>
                        <div class="exrole" v-if="duo.syncPairRoleEX">
                            <img :src="`/assets/images/${duo?.has_ex_role ? 'icon_role_ex.png'
                                : 'icon_role_ex_2.png'}`" :alt="`Icon EX`" class="role-icon">
                            <img :src="`/assets/images/${getRoleIcon(duo)}`" :alt="`Icon EX Role`" class="role-icon">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.arena-duos {
    display: flex;
    gap: 24px;
    height: 100%;
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

.member-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.member-buttons button {
    padding: 12px 16px;
    font-size: 1.1rem;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: none;
    color: var(--color-text);
    cursor: pointer;
}

.member-buttons button.active {
    background-color: var(--color-heading);
    color: var(--color-background);
}

.image-wrapper {
    position: relative;
}

.card img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: contain;
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

.member-lines {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.member-lines>div {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.member-lines>div>span {
    font-size: 1.1rem;
    font-weight: bold;
    color: var(--color-heading);
}

.member-lines .card {
    width: 100px;
    flex-shrink: 0;
}

.duo-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.arena-duos h3 {
    text-align: center;
    font-size: 1.2rem;
    font-weight: bold;
    color: rgb(26, 94, 196)
}
</style>