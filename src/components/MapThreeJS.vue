<template>
  <div>
    <MapKitVue @map-ready="onMapReady" />
    <div class="abs-full container-map-ui">
    </div>
  </div>
</template>

<script setup>
import MapKitVue from './MapKit/MapKit.vue'
import Venue from '../imdf/venue.js'
import lightTheme from '../styles/imdf/light.js'
import useMapOverlay from './useMapOverlay'

import { defineComponent, shallowRef } from 'vue';
import { useRoute } from 'vue-router';

const mkMap = shallowRef()
const venue = shallowRef()
const styleSheet = shallowRef(lightTheme)

function onMapReady(map) {
  mkMap.value = map
}

async function load() {
  const router = useRoute()
  const url = `https://dev.mapstorage.polymap.ru/api/map/${router.params.mapID}`
  const archive = await (await fetch(url)).json()

  while (!mkMap.value) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  venue.value = new Venue(archive.imdf)

  useMapOverlay({
    venue,
    mkMap: mkMap.value,
    styleSheet
  })

  // venue.value = new Venue((await (await fetch('https://dev.mapstorage.polymap.ru/api/map/test2')).json()).imdf)
}

load()

defineComponent([MapKitVue])

</script>


<style scoped lang="scss">
.container-map-ui {
  pointer-events: none;

  >* {
    pointer-events: auto;
  }
}

.slider {
  width: 300px;
}
</style>
