<template>
  <div class="container non-block" :class="fullHeight ? 'fullHeight':''">
    <SearchVue />
    <OccupantDetailVue />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from '@vue/reactivity';
import SearchVue from './search/index.vue'
import OccupantDetailVue from './occupantDetail/index.vue'


const pages = ref([])

const fullHeight = computed(() => {
  return pages.value.length != 0
})

</script>

<style lang="scss">
@import '@/styles/variables.scss';

.container {
  width: 300px;
  touch-action: none;
  overflow: hidden;
  max-height: 100%;

  @media (max-width: $phone-width) {
    width: 100%;
  }

  &.fullHeight {
    height: 100%;
  }
}
</style>
