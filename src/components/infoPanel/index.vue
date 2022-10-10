<template>
  <div class="abs-full non-block info-panel">
    <BottomSheetVue :delegate="delegate" :initPage="initPage" />
  </div>
</template>

<script setup lang="ts">
import { onAnnotationSelect, onAnnotationDeSelect } from '@/store/mapInfoPanel';
import { markRaw, ref, ShallowRef, shallowRef } from 'vue';
import BottomSheetVue from '../bottomSheet/BottomSheet.vue';
import OccupantDetailVue from './occupantDetail/index.vue';
import SearchVue from './search/index.vue';

const initPage = {
  component: SearchVue,
  data: ref(null)
};

const delegate: {
  pages?: () => { component: any; data: any; key: number }[],
  push?: (params: { component: any; data: any }) => void,
  pop?: () => void,
  selectOccupant: (occupant: any) => void
} = {
  selectOccupant
};


let lastSelected = null;
onAnnotationDeSelect.addEventListener((annotation) => {
  lastSelected = null;
  setTimeout(() => {
    if (lastSelected) return;
    const lastPage = delegate.pages()[delegate.pages().length - 1];
    if (lastPage.component === OccupantDetailVue) {
      delegate.pop();
    }
  }, 0);
});

onAnnotationSelect.addEventListener((annotation) => {
  const pages = delegate.pages();
  const lastPage = pages[pages.length - 1];
  lastSelected = annotation;

  if (lastPage.component === OccupantDetailVue) {
    lastPage.data = markRaw(annotation);

  } else {
    delegate.push({
      component: OccupantDetailVue,
      data: markRaw(annotation)
    });
  }
});



function selectOccupant() {
  console.log('select occupant');

}

</script>

<style lang="scss">
@import '@/styles/variables.scss';
</style>
