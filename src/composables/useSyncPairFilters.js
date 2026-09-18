import { ref, computed } from 'vue'

export const tagFilters = [
  {
    id: 'terrain',
    tags: ['Terrain', 'Weather', 'Wish Zone'],
    icon: 'icon_terrain.png',
    label: 'Terrain',
  },
  {
    id: 'terrainEX',
    tags: ['TerrainEX', 'WeatherEX', 'Wish ZoneEX'],
    icon: 'icon_terrainEX.png',
    label: 'Terrain EX',
  },
  { id: 'circle', tags: ['Region Circle'], icon: 'icon_circle.png', label: 'Cercle' },
  { id: 'rebuff', tags: ['Rebuff'], icon: 'icon_rebuff.png', label: 'Rebuff' },
]

export const roleFilters = [
  {
    id: 'striker',
    roles: ['Strike (Special)', 'Strike (Physical)'],
    label: 'Striker',
    icon: 'role_strike.png',
  },
  { id: 'support', roles: ['Support'], label: 'Support', icon: 'role_support.png' },
  { id: 'tech', roles: ['Tech'], label: 'Tech', icon: 'role_tech.png' },
  { id: 'field', roles: ['Field'], label: 'Field', icon: 'role_field.png' },
  { id: 'sprint', roles: ['Sprint'], label: 'Sprint', icon: 'role_sprint.png' },
  { id: 'multi', roles: ['Multi'], label: 'Multi', icon: 'role_multi.png' },
]

export const rarityFilters = [
  { id: '3', label: '3 étoiles', icon: 'star3.png' },
  { id: '4', label: '4 étoiles', icon: 'star4.png' },
  { id: '5', label: '5 étoiles', icon: 'star5.png' },
]

export function useSyncPairFilters(pairs) {
  const selectedType = ref(null)
  const selectedTags = ref([])
  const selectedRole = ref(null)
  const selectedRarity = ref(null)

  const typeOrder = [
    'Normal',
    'Fire',
    'Water',
    'Electric',
    'Grass',
    'Ice',
    'Fighting',
    'Poison',
    'Ground',
    'Flying',
    'Psychic',
    'Bug',
    'Rock',
    'Ghost',
    'Dragon',
    'Dark',
    'Steel',
    'Fairy',
  ]

  const availableTypes = computed(() => {
    const types = new Set(pairs.value.map((pair) => pair.pokemonType))
    return [...types].sort((a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b))
  })

  function toggleType(type) {
    selectedType.value = selectedType.value === type ? null : type
  }

  function toggleTag(filterId) {
    if (selectedTags.value.includes(filterId)) {
      selectedTags.value = selectedTags.value.filter((id) => id !== filterId)
    } else {
      selectedTags.value = [...selectedTags.value, filterId]
    }
  }

  function toggleRole(roleId) {
    selectedRole.value = selectedRole.value === roleId ? null : roleId
  }

  function toggleRarity(rarity) {
    selectedRarity.value = selectedRarity.value === rarity ? null : rarity
  }

  const filteredPairs = computed(() => {
    return pairs.value.filter((pair) => {
      const matchesType = !selectedType.value || pair.pokemonType === selectedType.value
      const matchesRarity = !selectedRarity.value || pair.syncPairRarity === selectedRarity.value

      const matchesTags = selectedTags.value.every((filterId) => {
        const filter = tagFilters.find((f) => f.id === filterId)
        return filter.tags.some((tag) => pair.tags.includes(tag))
      })

      const roleFilter = roleFilters.find((f) => f.id === selectedRole.value)
      const matchesRole = !selectedRole.value || roleFilter.roles.includes(pair.syncPairRole)

      return matchesType && matchesRarity && matchesTags && matchesRole
    })
  })

  return {
    selectedType,
    selectedRole,
    selectedRarity,
    filteredPairs,
    availableTypes,
    toggleType,
    toggleTag,
    toggleRole,
    toggleRarity,
    selectedTags,
  }
}
