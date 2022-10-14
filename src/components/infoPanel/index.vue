<template>
  <div class="abs-full non-block info-panel">
    <BottomSheetVue :delegate="delegate" :initPage="initPage" />
  </div>
</template>

<script setup lang="ts">
import { inject, markRaw, provide, ref, ShallowRef, shallowRef, watch, watchEffect } from 'vue';
import BottomSheetVue from '../bottomSheet/BottomSheet.vue';
import UnitDetailVue from './unitDetail/index.vue';
import SearchVue from './search/index.vue';
import { IMapDelegate } from '../map/mapControlls';

const initPage = {
  component: SearchVue,
  data: null
};

const delegate: {
  pages?: () => { component: any; data: any; key: number }[],
  push?: (params: { component: any; data: any }) => void,
  pop?: () => void
} = {};

const mapDelegate = inject('mapDelegate') as ShallowRef<IMapDelegate>

watch(() => mapDelegate.value.selectedAnnotation.value, (annotation) => {
  if (!delegate.pages) return

  const pages = delegate.pages();
  const lastPage = pages[pages.length - 1];
  if (annotation && lastPage.component != UnitDetailVue) {
    delegate.push({
      component: UnitDetailVue,
      data: { annotation: markRaw(annotation) }
    });
  } else if (annotation && lastPage.component == UnitDetailVue) {
    lastPage.data = { annotation: markRaw(annotation) };
  } else if (!annotation && lastPage.component == UnitDetailVue) {
    delegate.pop();
  }
});

</script>

<style lang="scss">
@import '@/styles/variables.scss';
</style>
