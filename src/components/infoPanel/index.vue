<template>
  <div class="abs-full non-block info-panel">
    <BottomSheetVue :delegate="delegate" :initPage="initPage" />
  </div>
</template>

<script setup lang="ts">
import { inject, markRaw, provide, ref, ShallowRef, shallowRef, watch, watchEffect } from 'vue';
import BottomSheetVue from '../bottomSheet/BottomSheet.vue';
import RouteDetailVue from "@/components/infoPanel/routeDetail/index.vue";
import UnitDetailVue from './unitDetail/index.vue';
import SearchVue from './search/index.vue';
import { IMapDelegate } from '../map/mapControlls';
import { IAnnotation } from '@/core/map/overlayDrawing/annotations/annotation';
import { useDefineControlls, IInfoPanelDelegate } from './infoPanelControlls';

const initPage = {
  component: SearchVue,
  data: null
};

const delegate: IInfoPanelDelegate = {};

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

function setRoute(annotation: IAnnotation, isFrom = false) {
  console.log('setRoute', annotation, isFrom);

  const pages = delegate.pages();
  const pathFinder = mapDelegate.value.venue.value.pathFinder
  const defaultStart = mapDelegate.value.venue.value.navpathBegin

  const routeDetailIndex = pages.findIndex((page) => page.component == RouteDetailVue);
  if (routeDetailIndex != -1) {
    delegate.popTo(routeDetailIndex);
    const lastPage = pages[routeDetailIndex];
    if (isFrom) {
      lastPage.data.from = annotation
    } else {
      lastPage.data.to = annotation
    }

  } else {
    delegate.push({
      component: RouteDetailVue,
      data: {
        from: isFrom ? annotation : markRaw(defaultStart),
        to: isFrom ? null : annotation,
        pathFinder
      },
    });
  }
}

useDefineControlls({
  setFrom: a => setRoute(a, true),
  setTo: a => setRoute(a, false),
})

</script>

<style lang="scss">
@import '@/styles/variables.scss';
</style>
