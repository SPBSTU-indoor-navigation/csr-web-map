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

import { defineComponent, ref, shallowRef, watch, watchEffect } from 'vue';
import { useRoute } from 'vue-router';

const mkMap = shallowRef()
/** @type {import('vue').ShallowRef<Venue>} */
const venue = shallowRef()
const styleSheet = shallowRef(lightTheme)
const zoom = ref(0)

function onMapReady(map) {
  mkMap.value = map
}

function onAnimate() {
  console.log('animate');
}

async function load() {
  const router = useRoute()
  const url = `https://dev.mapstorage.polymap.ru/api/map/${router.params.mapID}`
  const archive = await (await fetch(url)).json()

  while (!mkMap.value) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  venue.value = new Venue(archive.imdf)

  const { zoom: zoomOverlay } = useMapOverlay({
    venue,
    mkMap: mkMap.value,
    styleSheet,
    onAnimate
  })

  watchEffect(() => {
    zoom.value = zoomOverlay.value
  })

  // venue.value = new Venue((await (await fetch('https://dev.mapstorage.polymap.ru/api/map/test2')).json()).imdf)
}

load()

watch(zoom, (zoom) => {
  venue.value.buildings.forEach(building => {

    if (zoom > 4) {
      building.ShowIndoor()
    } else {
      building.HideIndoor()
    }
  })
})

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
