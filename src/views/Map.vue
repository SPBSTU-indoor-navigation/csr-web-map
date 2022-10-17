<template>
  <div class="home">
    <MapVue @mapDelegate="onMapDelegate" />
    <div class="abs-full non-block" @wheel="onScroll">
      <InfoPanelVue />
    </div>
  </div>
</template>

<script setup lang="ts">
import MapVue from "../components/map/MapThreeJS.vue";
import InfoPanelVue from "@/components/infoPanel/index.vue";
import { useFullscreenScrollFix } from "@/core/shared/composition/useFullscreenScrollFix";
import { onMounted, provide, ShallowRef, shallowRef, watch, watchEffect } from "vue";
import { IMapDelegate } from "@/components/map/mapControlls";

const mapDelegate: ShallowRef<IMapDelegate> = shallowRef({
  selectedAnnotation: shallowRef(null),
  venue: shallowRef(null),
})

provide('mapDelegate', mapDelegate)
useFullscreenScrollFix()

const onScroll = (e) => {
  if (e.ctrlKey) {
    e.preventDefault()
    e.stopPropagation()
  }
};

function onMapDelegate(delegate) {
  mapDelegate.value = delegate
}

</script>

<style scoped>
.abs-full {
  /* 
  background-color: #343434; */
}
</style>
