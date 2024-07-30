<template>
  <div class="abs-full non-block info-panel">
    <BottomSheetVue :delegate="delegate" :initPage="initPage" @state-change="onStateChange" />
  </div>
</template>

<script setup lang="ts">
import { inject, markRaw, provide, ref, ShallowRef, shallowRef, watch, watchEffect } from 'vue';
import BottomSheetVue from '../bottomSheet/BottomSheet.vue';
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


});

function onStateChange(state) {
  console.log('onStateChange', state);
}

</script>

<style lang="scss">
@import '@/styles/variables.scss';
</style>
