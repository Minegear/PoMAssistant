<script setup>
import { useCountdown } from '@/composables/useCountdown';

const props = defineProps({
    name: String,
    image: String,
    startDate: String,
    endDate: String
})

const { hasStarted, remainingTime } = useCountdown(props.startDate, props.endDate)

const startingDay = props.startDate.split('T')[0]
const endingDay = props.endDate.split('T')[0]
</script>

<template>
    <div class="event-card">
        <img :src="`/assets/${props.image}`" :alt="props.name">
        <span>{{ props.name }}</span>
        <span>{{ startingDay }}, {{ endingDay }}</span>
        <span class="countdown" v-if="!hasStarted">Event dans {{ remainingTime }}</span>
        <span class="countdown" v-else>Se termine dans {{ remainingTime }}</span>
    </div>
</template>

<style scoped>
.event-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px;
    background-color: var(--color-background-soft);
    border-radius: 8px;
    text-align: center;
}

.event-card img {
    width: 100%;
    aspect-ratio: 512 / 94;
    object-fit: cover;
    border-radius: 4px;
}

.countdown {
    font-weight: bold;
}
</style>