<script setup>
import { onMounted, computed } from 'vue'
import { useMonthly } from '@/composables/useMonthly';
import EventCard from '@/components/EventCard.vue';
import BannerCard from '@/components/BannerCard.vue';
import { useMonthlyOrder } from '@/composables/useMonthlyOrder';

const { events, banners, loadMonthlyData } = useMonthly()

const visibleEvents = computed(() => {
  const now = new Date()
  return events.value.filter((item) => new Date(item.endDate) > now)
})

const orderedEvents = useMonthlyOrder(visibleEvents)

const visibleBanners = computed(() => {
  const now = new Date()
  return banners.value.filter((item) => new Date(item.endDate) > now)
})

const usefulLinks = [
  { name: "GDoc des tours", image: "/assets/images/towers.png", link: "https://docs.google.com/spreadsheets/d/1-U9uLAUcKaXQcf45YAxcxzP7mFoY6N2wSZQN06gy2hk/edit?usp=sharing" },
  { name: "Youtube de Geeki", image: "/assets/images/geeki.png", link: "https://www.youtube.com/@Geeki_Masters" },
  { name: "Site de Brybry", image: "/assets/images/brybry.png", link: "https://pokemon.brybry.ch/masters/programme.html" },
  { name: "Détails des combats d'arène par Brybry", image: "/assets/images/arene.png", link: "https://pokemon.brybry.ch/masters/gvg-data.html" },
  { name: "Liste des duos", image: "/assets/images/pokekalos.png", link: "https://www.pokekalos.fr/jeux/mobile/pokemonmasters/duos/index.html" },
  { name: "Sync Pair Tracker", image: "/assets/images/syncpairtracker.png", link: "https://pomasters.github.io/SyncPairsTracker/" }
]

onMounted(() => {
  loadMonthlyData()
})
</script>

<template>
  <div class="colonnes">
    <div class="events">
      <span>Evènements</span>
      <div v-for="item in orderedEvents" :key="item.id">
        <EventCard :name="item.name" :image="item.image" :startDate="item.startDate" :endDate="item.endDate" />
      </div>
    </div>
    <div class="banners">
      <span>Bannières</span>
      <div v-for="item in visibleBanners" :key="item.id">
        <BannerCard :name="item.name" :image="item.image" :duos="item.duos" :startDate="item.startDate"
          :endDate="item.endDate" :isPaid="item.isPaid" :dailyRate="item.dailyRate" :hasSteps="item.hasSteps"
          :steps="item.steps" />
      </div>
    </div>
    <div class="links">
      <span>Liens utiles</span>
      <div v-for="item in usefulLinks" :key="item.name">
        <img :src="`${item.image}`" :alt="item.name">
        <a :href="item.link" target="_blank" rel="noopener noreferrer">{{ item.name }}</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.colonnes {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  padding: 0 24px;
}

.events {
  flex: 35;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.banners {
  flex: 35;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.links {
  flex: 20;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.links>div {
  display: flex;
  align-items: center;
  gap: 12px;
}

.links img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  flex-shrink: 0;
}

.links a {
  line-height: 1;
}

.events>span,
.banners>span,
.links>span {
  display: block;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  color: var(--color-heading);
}
</style>