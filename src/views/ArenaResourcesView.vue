<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useArenaUserResources } from '@/composables/useArenaUserResources';
import { useUsers } from '@/composables/useUsers';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';
import { resourceCategories } from '@/data/resourceCategories';


const { users, loadUsers } = useUsers()
const userStore = useUserStore()
const { arenaUserResources, loadArenaUserResources } = useArenaUserResources()
const router = useRouter()

const selectedMembers = ref(new Set())
const selectedCategory = ref(null)

const arenaMembers = computed(() => {
    const userTable = users.value.filter((user) => user.arena_id === userStore.currentArenaId)
    return userTable
})

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

const memberResources = computed(() => {
    const flatResources = resourceCategories
        .filter((row) => selectedCategory.value === null || row.title === selectedCategory.value)
        .flatMap((row) => row.items)
    const filteredMembers = arenaMembers.value.filter((member) =>
        selectedMembers.value.size === 0 || selectedMembers.value.has(member.id)
    )

    return filteredMembers.map((member) => {
        const resources = flatResources
            .filter((item) => item.id !== 'bon_quoti' && item.id !== 'medaille_role')
            .map((item) => {
                const found = arenaUserResources.value.find(
                    (tracked) => tracked.user_id === member.id && tracked.resource_id === item.id
                )
                const bonQuoti = arenaUserResources.value.find((tracked) => tracked.user_id === member.id && tracked.resource_id === 'bon_quoti')
                const medailleRole = arenaUserResources.value.find((tracked) => tracked.user_id === member.id && tracked.resource_id === 'medaille_role')
                const added = (medailleRole?.count ?? 0) + Math.floor((bonQuoti?.count ?? 0) / 5)
                const cakeMulti = Math.floor(added / 20)
                return {
                    ...item,
                    count: (item.id === 'cake_multi') ? cakeMulti : (found?.count ?? 0)
                }
            })
        return { member, resources }
    })
})

function toggleCategory(category) {
    selectedCategory.value = selectedCategory.value === category ? null : category
}

onMounted(async () => {
    await loadUsers()
    await loadArenaUserResources(arenaMembers.value.map(m => m.id))
})

watch(() => userStore.currentUserId, (new_id) => {
    if (new_id === null) {
        router.push('/')
    }
})
</script>

<template>
    <div class="arena-resources">
        <aside class="filters">
            <div class="filter-group">
                <h3>Catégories</h3>
                <div class="category-buttons">
                    <button v-for="category in resourceCategories" :key="category.title"
                        :class="{ active: selectedCategory === category.title }"
                        @click="toggleCategory(category.title)">
                        {{ category.title }}
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
            <div v-for="entry in memberResources" :key="entry.member.id">
                <span>{{ entry.member.username }}</span>
                <div class="resource-row">
                    <div v-for="item in entry.resources" :key="item.id" class="item-card">
                        <div class="resource-display">
                            <img :src="`${item.src}`" :alt="item.alt">
                            <span>{{ item.count }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.arena-resources {
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

.category-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.category-buttons button {
    padding: 12px 16px;
    font-size: 1.1rem;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: none;
    color: var(--color-text);
    cursor: pointer;
}

.category-buttons button.active {
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

.resource-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.item-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    text-align: center;
}

.item-card img {
    width: 60px;
    aspect-ratio: 1;
    object-fit: contain;
}

.item-card span {
    font-size: 14px;
}

.item-card {
    text-align: center;
}

.resource-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.resource-display img {
    width: 80px;
    aspect-ratio: 1;
    object-fit: contain;
}

.resource-display span {
    font-size: 14px;
}

.arena-resources h3 {
    text-align: center;
    font-size: 1.2rem;
    font-weight: bold;
    color: rgb(26, 94, 196)
}
</style>