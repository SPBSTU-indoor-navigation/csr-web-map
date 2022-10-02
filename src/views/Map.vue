<template>
  <div class="home">
    <MapVue />
    <div class="abs-full non-block" @wheel.prevent>
      <InfoPanelVue />
    </div>
  </div>
</template>

<script setup>
import MapVue from "../components/map/MapThreeJS.vue";
import InfoPanelVue from "@/components/infoPanel/index.vue";
</script>

<style scoped>
.abs-full {

  /* background-color: #343434; */
}
</style>
