<template>
  <div class="abs-full non-block info-panel">
    <BottomSheetVue :delegate="delegate" :initPage="initPage" />
  </div>
</template>

<script setup lang="ts">
import BottomSheetVue from '../bottomSheet/BottomSheet.vue';
import OccupantDetailVue from './occupantDetail/index.vue';
import SearchVue from './search/index.vue';

const initPage = {
  component: SearchVue,
  data: {}
};

const delegate = {
  push: (params) => { },
  pop: () => { },
  selectOccupant: selectOccupant
};

function selectOccupant() {
  console.log('selectOccupant');

  delegate.push({
    component: OccupantDetailVue,
    data: {}
  });
}

</script>

<style lang="scss">
@import '@/styles/variables.scss';
</style>
