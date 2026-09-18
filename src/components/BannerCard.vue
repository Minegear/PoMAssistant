<script setup>
import { ref, computed } from 'vue';
import { useCountdown } from '@/composables/useCountdown';

const props = defineProps({
    image: String,
    name: String,
    duos: Array,
    startDate: String,
    endDate: String,
    isPaid: Boolean,
    dailyRate: Number,
    hasSteps: Boolean,
    steps: Array
})

const showSteps = ref(false)

function toggleSteps() {
    showSteps.value = !showSteps.value
}

const { hasStarted, remainingTime } = useCountdown(props.startDate, props.endDate)

const cumulativeRateDisplay = computed(() => {
    if (props.dailyRate === null) {
        return null
    } else {
        const startDay = new Date(props.startDate.split('T')[0])
        const endDay = new Date(props.endDate.split('T')[0])
        const diffDays = Math.floor((endDay - startDay) / (1000 * 60 * 60 * 24))
        const p = props.dailyRate / 100
        const finalProba = 1 - (1 - p) ** diffDays
        const getPercent = finalProba * 100
        const rateNumber = Math.round(getPercent * 10) / 10
        const rateDisplay = `${rateNumber}%`
        return rateDisplay
    }
})

const startingDay = props.startDate.split('T')[0]
const endingDay = props.endDate.split('T')[0]
</script>

<template>
    <div class="banner-card">
        <span>{{ props.name }}</span>
        <img :src="`/assets/${props.image}`" :alt="'Bannière'">
        <div class="duos" v-for="item in props.duos" :key="item.name">
            <img :src="`/assets/${item.image}`" :alt="item.name">
            <a :href="item.kitLink" target="_blank" rel="noopener noreferrer">{{ item.name }}</a>
        </div>
        <div class="free-paid">
            <span v-if="isPaid">Portail payant</span>
            <span v-else>Portail non payant</span>
        </div>
        <div class="daily">
            <span v-if="cumulativeRateDisplay !== null">Proba de daily le duo : {{ cumulativeRateDisplay }}</span>
            <span v-else>Pas de daily sur le portail</span>
        </div>
        <span>{{ startingDay }}, {{ endingDay }}</span>
        <span class="countdown" v-if="!hasStarted">Bannière dans {{ remainingTime }}</span>
        <span class="countdown" v-else>Se termine dans {{ remainingTime }}</span>
        <div class="steps" v-if="hasSteps">
            <button @click="toggleSteps()">
                <img :src="showSteps ? '/assets/images/view1.png' : '/assets/images/view2.png'"
                    :alt="showSteps ? 'Fermer' : 'Ouvrir'">
                Voir les détails
            </button>
            <div class="steps-details" v-if="showSteps">
                <div v-for="item in props.steps" :key="item.step">
                    <span>Step {{ item.step }}: {{ item.cout }} diamants payants. Récompense : {{ item.present }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.banner-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
    background-color: var(--color-background-soft);
    border-radius: 8px;
    align-items: center;
    text-align: center
}

.banner-card img.banner-image {
    width: 100%;
    aspect-ratio: 512 / 94;
    object-fit: cover;
    border-radius: 4px;
}

.duos {
    display: flex;
    align-items: center;
    gap: 8px;
}

.duos img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 6px;
    flex-shrink: 0;
}

.duos a {
    line-height: 1;
}

.countdown {
    font-weight: bold;
}

.free-paid,
.daily {
    font-size: 14px;
}

.steps {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.steps button {
    padding: 6px 12px;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: none;
    color: var(--color-text);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
}

.steps button img {
    width: 16px;
    height: 16px;
}

.steps-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 14px;
}
</style>