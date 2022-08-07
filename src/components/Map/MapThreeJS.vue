<template>
  <div>
    <MapKitVue @map-ready="onMapReady" />
    <div class="abs-full container-map-ui">

      <Transition name="slide-fade">
        <LevelSwitcherVue v-if="showIndoor && currentBuilding" :levels="currentBuilding.levels"
          v-model:level="currentOrdinal" />
      </Transition>
    </div>
  </div>
</template>

<script setup>
import Venue from '@/imdf/venue'
import lightTheme from '@/styles/imdf/light.js'
import LevelSwitcherVue from '../Controlls/LevelSwitcher/index.vue'
import MapKitVue from './MapKit/MapKit.vue'
import useMapOverlay from './useMapOverlay'

import { Box2, Vector2 } from 'three'
import { defineComponent, ref, shallowRef, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

import { nearestBuiling } from './utils'

const mkMap = shallowRef()
/** @type {import('vue').ShallowRef<Venue>} */
const venue = shallowRef()
const styleSheet = shallowRef(lightTheme)
const zoom = ref(0)
const currentBuilding = ref()
const showIndoor = ref(false)
const currentOrdinal = ref(0)


let scene
/** @type {import('three').Camera} */
let camera
let renderer

const SHOW_ZOOM = 4
const HIDE_ZOOM = 3.9

function onMapReady(map) {
  mkMap.value = map
}

function onAnimate() {
  const nearest = nearestBuiling(new Box2(new Vector2(-1, -1), new Vector2(1, 1)).expandByScalar(-0.1), camera, venue.value)
  currentBuilding.value = nearest

}

async function load() {
  const router = useRoute()
  const url = `https://dev.mapstorage.polymap.ru/api/map/${router.params.mapID}`
  const archive = await (await fetch(url)).json()

  while (!mkMap.value) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  venue.value = new Venue(archive.imdf)

  const mapOverlay = useMapOverlay({
    venue,
    mkMap: mkMap.value,
    styleSheet,
    onAnimate,
  })

  scene = mapOverlay.scene
  camera = mapOverlay.camera
  renderer = mapOverlay.renderer

  watchEffect(() => {
    zoom.value = mapOverlay.zoom.value
  })

}

load()

watch(zoom, zoom => {
  if (currentBuilding.value) {
    if (zoom > SHOW_ZOOM) {
      currentBuilding.value.ShowIndoor()
      showIndoor.value = true
    } else if (zoom < HIDE_ZOOM) {
      currentBuilding.value.HideIndoor()
      showIndoor.value = false
    }
  }
})

watch(currentBuilding, (building, old) => {
  if (old) old.HideIndoor()
  if (building) {
    currentOrdinal.value = building.currentOrdinal
    if (zoom.value > HIDE_ZOOM) {
      building.ShowIndoor()
      showIndoor.value = true
    }
  }
})

watch(currentOrdinal, ordinal => {
  currentBuilding.value.ChangeOrdinal(ordinal)
  window.onMapkitUpdate?.()
})

defineComponent([MapKitVue, LevelSwitcherVue])
</script>

<style scoped lang="scss">
.container-map-ui {
  pointer-events: none;
  overflow: hidden;

  >* {
    pointer-events: auto;
  }
}

.slider {
  width: 300px;
}

.point {
  position: absolute;
  width: 3px;
  height: 3px;
  background-color: red;
  border-radius: 50%;
  top: 50%;
  left: 50%;
}

.slide-fade-enter-active {
  transition: all 0.15s ease-in;
}

.slide-fade-leave-active {
  transition: all 0.15s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(4rem);
}
</style>
