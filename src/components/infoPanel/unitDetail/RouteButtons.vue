<template>
  <div class="multy-line flex" v-if="props.fromToPlan.to && props.fromToPlan.from && props.fromToPlan.plan">
    <div class="line1 flex">
      <button v-if="props.fromToPlan.to" class="to" @click="$emit('setTo')">
        {{ props.fromToPlan.from ? "Отсюда" : "Маршрут" }}
      </button>
      <button v-if="props.fromToPlan.from" class="from" @click="$emit('setFrom')">Маршрут</button>
    </div>
    <div class="line2 flex">
      <button v-if="props.fromToPlan.plan" class="plan" @click="$emit('setPlan')">Планировка</button>
    </div>
  </div>
  <div class="single-line flex" v-else>
    <button v-if="props.fromToPlan.from" class="from" @click="$emit('setFrom')">Отсюда</button>
    <button v-if="props.fromToPlan.to" class="to" @click="$emit('setTo')">
      {{ props.fromToPlan.from ? "Сюда" : "Маршрут" }}
    </button>
    <button v-if="props.fromToPlan.plan" class="plan" @click="$emit('setPlan')">Планировка</button>
  </div>
</template>

<script setup lang="ts">
import { FromToPlan } from './data'

const props = defineProps<{ fromToPlan: FromToPlan }>()
const emit = defineEmits(['setFrom', 'setTo', 'openPlan'])

</script>


<style lang="scss" scoped>
@import '@/styles/variables.scss';

.multy-line {
  flex-direction: column;

  .plan {
    flex-grow: 5;
  }
}

.multy-line,
.single-line {
  gap: 5px;

  .from,
  .to {
    flex-grow: 5;
  }
}

.line1,
.line2 {
  gap: 5px;
}

.from,
.to,
.plan {
  height: 45px;
  font-size: 0.9em;
  border-radius: 10px;
  padding: 10px;

  @media (min-width: $phone-width) {
    height: 40px;
  }
}

.from,
.to {
  background-color: var(--accent-color);
  font-weight: 600;
  color: white;

  &:hover {
    background-color: #2e993e
  }
}

.plan {
  color: var(--accent-color);
  background-color: #E2E2E2;

  &:hover {
    background-color: #d5d5d5;
  }
}
</style>
