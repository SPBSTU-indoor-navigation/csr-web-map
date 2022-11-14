<template>
  <div class="abs-full non-block info-panel">
    <BottomSheetVue :delegate="delegate" :initPage="initPage" @state-change="onStateChange" />
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
import { computed, toRaw } from '@vue/reactivity';

const initPage = {
  component: SearchVue,
  data: null
};

const delegate: IInfoPanelDelegate = {};

const mapDelegate = inject('mapDelegate') as ShallowRef<IMapDelegate>

const safeArea = computed(() => {

})

watch(() => mapDelegate.value.selectedAnnotation.value, (annotation) => {
  if (!delegate.pages) return

  const routePage = getRoutePage()

  const allowFrom = () => {
    if (!routePage) return false
    if (routePage.data.to === annotation) return false
    return true
  }

  const allowTo = () => {
    if (!routePage) return true
    if (routePage.data.from === annotation) return false
    return true
  }

  const pages = delegate.pages();
  const lastPage = pages[pages.length - 1];
  if (annotation && lastPage.component != UnitDetailVue) {
    delegate.push({
      component: UnitDetailVue,
      data: { annotation: toRaw(markRaw(annotation)), allowFrom: allowFrom(), allowTo: allowTo() }
    });
  } else if (annotation && lastPage.component == UnitDetailVue) {
    lastPage.data = { annotation: markRaw(annotation), allowFrom: allowFrom(), allowTo: allowTo() };
  } else if (!annotation && lastPage.component == UnitDetailVue) {
    delegate.pop();
  }
});

function setRouteWithOptions(params: {
  from: IAnnotation,
  to: IAnnotation,
  asphalt: boolean,
  allowService: boolean,
}) {
  const pages = delegate.pages();

  const data = {
    from: markRaw(params.from),
    to: markRaw(params.to),
    asphalt: params.asphalt,
    allowService: params.allowService,
  }

  let routePage = getRoutePage()
  if (routePage) {
    delegate.popTo(pages.indexOf(routePage))
    routePage.data = { ...routePage.data, ...data }
  } else {
    delegate.push({
      component: RouteDetailVue,
      data: {
        ...data,
        pathFinder: mapDelegate.value.venue.value.pathFinder
      }
    })
  }

}

function setRoute(annotation: IAnnotation, isFrom = false) {
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

function getRoutePage() {
  const pages = delegate.pages();
  const routeDetailIndex = pages.findIndex((page) => page.component == RouteDetailVue);
  if (routeDetailIndex != -1) {
    return pages[routeDetailIndex];
  }
  return null;
}

function onStateChange(state) {
  // console.log('onStateChange', state);
}


useDefineControlls({
  setFrom: a => setRoute(a, true),
  setTo: a => setRoute(a, false),
})

defineExpose({
  setRouteWithOptions
})

</script>

<style lang="scss">
@import '@/styles/variables.scss';
</style>
