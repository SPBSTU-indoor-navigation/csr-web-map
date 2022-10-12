<template>
  <component :is=components[props.img] cl />
</template>

<script setup>
import { defineAsyncComponent } from 'vue';

const star = defineAsyncComponent(() => import('./icons/Star.vue'))
const starFill = defineAsyncComponent(() => import('./icons/StarFill.vue'))
const share = defineAsyncComponent(() => import('./icons/Share.vue'))
const report = defineAsyncComponent(() => import('./icons/Report.vue'))

const components = {
  star,
  report,
  share,
  'star.fill': starFill
}

const props = defineProps({
  img: String
})
</script>
