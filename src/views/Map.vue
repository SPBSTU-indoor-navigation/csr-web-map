<template>
  <div class="home">
    <MapVue @mapDelegate="e => mapDelegate = e" />
    <div class="abs-full non-block" @wheel="onScroll">
      <InfoPanelVue />
    </div>
  </div>
</template>

<script setup lang="ts">
import MapVue from "../components/map/MapThreeJS.vue";
import InfoPanelVue from "@/components/infoPanel/index.vue";
import { useFullscreenScrollFix } from "@/core/shared/composition/useFullscreenScrollFix";
import { provide, ShallowRef, shallowRef, watchEffect } from "vue";
import { IMapDelegate } from "@/components/map/mapControlls";

const mapDelegate: ShallowRef<IMapDelegate | null> = shallowRef(null)

useFullscreenScrollFix()

const onScroll = (e) => {
  if (e.ctrlKey) {
    e.preventDefault()
    e.stopPropagation()
  }
};

const props = defineProps(['mapDelegate'])
provide('mapDelegate', mapDelegate)


</script>

<style scoped>
.abs-full {
  /* 
  background-color: #343434; */
}
</style>
