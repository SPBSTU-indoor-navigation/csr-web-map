<template>
  <div class="container non-block" :class="fullHeight ? 'fullHeight':''">
    <Search />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from '@vue/reactivity';
import Search from './search/index.vue'


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

  @media (max-width: $phone-width) {
    width: 100%;
  }

  &.fullHeight {
    height: 100%;
  }
}
</style>
