<template>
  <div class="home">
    <!-- <MapVue /> -->
    <div class="abs-full non-block" @wheel="onScroll">
      <InfoPanelVue />
    </div>
  </div>
</template>

<script setup>
import MapVue from "../components/map/MapThreeJS.vue";
import InfoPanelVue from "@/components/infoPanel/index.vue";
import { useFullscreenScrollFix } from "@/core/shared/composition/useFullscreenScrollFix";

const onScroll = (e) => {
  if (e.ctrlKey) {
    e.preventDefault()
    e.stopPropagation()
  }
};

useFullscreenScrollFix()
</script>

<style scoped>
.abs-full {

  background-color: #343434;
}
</style>
