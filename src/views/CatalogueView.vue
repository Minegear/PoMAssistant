<script setup>
import { onMounted } from 'vue'
import { useSyncPairs } from '@/composables/useSyncPairs'
import { useSyncPairFilters, tagFilters, roleFilters, rarityFilters } from '@/composables/useSyncPairFilters'
import { useCuratedPairs } from '@/composables/useCuratedPairs'
import { ref, computed } from 'vue'
import { getDuoKey } from '@/utils/duoKey'
import { useAdminStore } from '@/stores/adminStore'
import { useUserStore } from '@/stores/userStore'
import { useSyncPairOrder } from '@/composables/useSyncPairOrder';
import { useArenas } from '@/composables/useArenas'


const { syncPairs, loadSyncPairs } = useSyncPairs()
const {
  selectedType,
  selectedTags,
  selectedRole,
  selectedRarity,
  availableTypes,
  filteredPairs,
  toggleType,
  toggleTag,
  toggleRole,
  toggleRarity
} = useSyncPairFilters(syncPairs)

const { curatedPairs, loadCuratedPairs, insertCuratedPairs, deleteCuratedPairs } = useCuratedPairs()

const selectionMode = ref(null)

const adminStore = useAdminStore()

const userStore = useUserStore()

const selectedDuoKeys = ref(new Set())

const showConfirmModal = ref(false)

const { loadArenas, defaultArenaId } = useArenas()



onMounted(async () => {
  loadSyncPairs()
  await loadArenas()
  const usedArena = userStore.currentArenaId ?? defaultArenaId.value
  await loadCuratedPairs(usedArena)
})

const curatedKeysSet = computed(() => new Set(curatedPairs.value.map(cp => cp.duo_key)))

function setSelectionMode(mode) {
  selectedDuoKeys.value = new Set()
  selectionMode.value = mode
}

function handleCardCLick(pair) {
  if (selectionMode.value === null) return

  const key = getDuoKey(pair)
  const newSet = new Set(selectedDuoKeys.value)

  if (newSet.has(key)) {
    newSet.delete(key)
  } else {
    newSet.add(key)
  }
  selectedDuoKeys.value = newSet

}

const visiblePairs = computed(() => {
  if (selectionMode.value !== 'remove') return filteredPairs.value
  else return filteredPairs.value.filter(pair => curatedKeysSet.value.has(getDuoKey(pair)))
})

const sortedList = useSyncPairOrder(visiblePairs)

const selectedPairsDetails = computed(() => {
  return syncPairs.value.filter(pair => selectedDuoKeys.value.has(getDuoKey(pair)))
})

const sortedSelectedPairs = useSyncPairOrder(selectedPairsDetails)

async function confirmSelection() {
  const tableKeys = [...selectedDuoKeys.value]

  if (selectionMode.value === 'add') {
    await insertCuratedPairs(tableKeys, userStore.currentUserId, userStore.currentArenaId)
  } else if (selectionMode.value === 'remove') {
    await deleteCuratedPairs(tableKeys, userStore.currentArenaId)
  }
  showConfirmModal.value = false
  setSelectionMode(null)
}

</script>

<template>
  <div class="catalogue">
    <aside class="filters">
      <div class="admin-buttons" v-if="adminStore.isAdmin">
        <div class="pre-select">
          <div class="add-button">
            <button @click="setSelectionMode('add')">
              <span>Ajouter des duos</span>
            </button>
          </div>
          <div class="remove-button">
            <button @click="setSelectionMode('remove')">
              <span>Retirer des duos</span>
            </button>
          </div>
        </div>
        <div class="pre-confirm">
          <div class="validate-button">
            <button v-if="selectionMode" @click="showConfirmModal = true">
              <span>Valider</span>
            </button>
          </div>
          <div class="cancel-button">
            <button v-if="selectionMode" @click="setSelectionMode(null)">
              <span>Annuler</span>
            </button>
          </div>
        </div>
      </div>

      <div class="filter-group">
        <h3>Rôle</h3>
        <div class="filter-buttons">
          <button v-for="filter in roleFilters" :key="filter.id" :class="{ active: selectedRole === filter.id }"
            @click="toggleRole(filter.id)" :title="filter.label">
            <img :src="`/assets/images/${filter.icon}`" :alt="filter.label">
          </button>
        </div>
      </div>
      <div class="filter-group">
        <h3>Rareté</h3>
        <div class="filter-buttons">
          <button v-for="rarity in rarityFilters" :key="rarity.id" :class="{ active: selectedRarity === rarity.id }"
            @click="toggleRarity(rarity.id)" :title="rarity.label">
            <img :src="`/assets/images/${rarity.icon}`" :alt="rarity.label">
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
            <button v-for="filter in tagFilters" :key="filter.id" :class="{ active: selectedTags.includes(filter.id) }"
              @click="toggleTag(filter.id)" :title="filter.label">
              <img :src="`/assets/images/${filter.icon}`" :alt="filter.label">
            </button>
          </div>
        </div>
      </div>

    </aside>

    <div class="results">
      <p>{{ sortedList.length }} duos affichés</p>
      <div class="grid">
        <div v-for="pair in sortedList" :key="getDuoKey(pair)" class="card" @click="handleCardCLick(pair)"
          :class="{ selected: selectedDuoKeys.has(getDuoKey(pair)) }">
          <img :src="`/assets/${pair.images[0]}`" :alt="pair.pokemonName">
          <p>{{ pair.trainerName }} & {{ pair.pokemonName }}</p>
          <img v-if="curatedKeysSet.has(getDuoKey(pair))" src="/assets/images/favorite1.png" alt="Curated"
            class="curated-badge">
        </div>
      </div>
    </div>

  </div>
  <div class="modal-overlay" v-if="showConfirmModal">
    <div class="confirmation">

      <h2>{{ selectionMode === 'add' ? "Valider l'ajout de ces duos" : "Valider le retrait de ces duos" }}</h2>
      <div class="confirm-grid">
        <div v-for="pair in sortedSelectedPairs" :key="getDuoKey(pair)" class="card-confirm">
          <img :src="`/assets/${pair.images[0]}`" :alt="pair.pokemonName">
          <p>{{ pair.trainerName }} & {{ pair.pokemonName }}</p>
        </div>
      </div>
      <div class="confirm-buttons">
        <button @click="confirmSelection()" class="btn-confirm">
          <span>Confirmer</span>
        </button>
        <button @click="showConfirmModal = false" class="btn-cancel">
          <span>Annuler</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.catalogue {
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

.results {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
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

.admin-buttons {
  display: flex;
  flex-direction: column;
}

.pre-select {
  display: flex;
  flex-direction: row;
}

.pre-confirm {
  display: flex;
  flex-direction: row;
}

.admin-buttons button {
  border-radius: 12px;
  padding: 6px 12px;
  color: var(--color-background);
  background-color: var(--color-text);
}

.curated-badge {
  position: absolute;
  top: 10px;
  left: 20px;
  height: 30%;
  width: auto;
}

.selected {
  border: 1px solid rgba(252, 0, 0, 0.8);
}

.modal-overlay {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  backdrop-filter: blur(8px);
  display: flex;
  background-color: rgba(0, 0, 0, 0.4);
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirmation {
  background-color: var(--color-background-soft);
  opacity: 1;
  padding: 1em;
  border-radius: 8px;
  width: 85%;
  max-height: 80vh;
  text-align: center;
  display: flex;
  flex-direction: column;
}

.confirm-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
  overflow-y: auto;
  flex: 1;
}

.card-confirm img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: contain;
}

.confirm-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.confirm-buttons button {
  border-radius: 12px;
  padding: 6px 12px;
  color: var(--color-text);
}

.btn-confirm {
  background-color: rgb(32, 172, 44);
}

.btn-cancel {
  background-color: rgb(172, 32, 32);
}

.catalogue h3 {
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: rgb(26, 94, 196)
}
</style>