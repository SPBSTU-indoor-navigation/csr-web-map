<template>
  <component :is=components[props.img] />
</template>

<script setup>
import { defineAsyncComponent } from 'vue';

const star = defineAsyncComponent(() => import('./icons/Star.vue'))
const starFill = defineAsyncComponent(() => import('./icons/StarFill.vue'))
const share = defineAsyncComponent(() => import('./icons/Share.vue'))
const report = defineAsyncComponent(() => import('./icons/Report.vue'))
const arrowUpArrowDown = defineAsyncComponent(() => import('./icons/ArrowUpArrowDown.vue'))
const mail = defineAsyncComponent(() => import('./icons/Mail.vue'))

const components = {
  star,
  report,
  share,
  'star.fill': starFill,
  'arrow.up.arrow.down': arrowUpArrowDown,
  'mail': mail
}

const props = defineProps({
  img: String
})
</script>
