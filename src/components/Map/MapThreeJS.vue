<template>
  <div>
    <MapKitVue @map-ready="onMapReady" @singleClick="mapClick" />
    <div class="abs-full container-map-ui">
      <Transition name="slide-fade">
        <LevelSwitcherVue v-if="showIndoor && currentBuilding" :levels="currentBuilding.levels"
          v-model:level="currentOrdinal" />
      </Transition>
    </div>
  </div>
</template>

<script setup>
import Venue from '@/core/imdf/venue'
import lightTheme from '@/styles/imdf/light.js'
import LevelSwitcherVue from '../Controlls/LevelSwitcher/index.vue'
import useMapAnnotations from '@/core/Map/Annotations/useMapAnnotations'
import MapKitVue from '@/core/Map/MapKit/MapKit.vue'
import useMapOverlay from '@/core/Map/Overlays/useMapOverlay'

import { Box2, Vector2, Vector3 } from 'three'
import { defineComponent, ref, shallowRef, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

import { nearestBuiling } from '@/core/Map/utils'
import { Annotation } from '@/core/Map/Annotations/annotation'
import { OccupantAnnotation } from './Annotations/Occupant'
import { MapController } from '@/core/Map/mapController'


const mkMap = shallowRef()
/** @type {import('vue').ShallowRef<Venue>} */
const venue = shallowRef()
const styleSheet = shallowRef(lightTheme)
const zoom = ref(0)
const currentBuilding = ref()
const showIndoor = ref(false)
const currentOrdinal = ref(0)

/** @type {MapController} */
let mapController

const SHOW_ZOOM = 4
const HIDE_ZOOM = 3.9

function mapClick(e) {
  mapController.mapAnnotations.click(new Vector2(e.clientX, e.clientY))
}

function onMapReady(map) {
  mkMap.value = map
}

function onAnimate() {
  mapController.render()
  const nearest = nearestBuiling(new Box2(new Vector2(-1, -1), new Vector2(1, 1)).expandByScalar(-0.1), mapController.camera, venue.value)
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

  mapController = new MapController(mapOverlay.scene, mapOverlay.camera, undefined, venue.value.mkGeometry)
  mapController.mapAnnotations = useMapAnnotations({ mapController })

  watchEffect(() => {
    zoom.value = mapOverlay.zoom.value
  })

  console.log(archive.imdf);
  console.log(archive.imdf.occupant.map(t => t.properties.anchor.properties.unit_id));

  const levelById = archive.imdf.level.reduce((acc, cur) => {
    acc[cur.id] = cur
    return acc
  }, {})


  const unitById = archive.imdf.unit.reduce((acc, cur) => {
    acc[cur.id] = cur
    return acc
  }, {})

  console.log(unitById);


  const annotations = archive.imdf.occupant
    // .filter(t => levelById[unitById[t.properties.anchor.properties.unit_id].properties.level_id].properties.ordinal == 0)
    .map(t => {
      const coordArray = t.properties.anchor.geometry.coordinates
      const coord = new mapkit.Coordinate(coordArray[1], coordArray[0])

      const pos = venue.value.Translate(coord)

      mapController.addAnnotation(new OccupantAnnotation({}, new Vector2(pos.x, pos.y), {}))


      return {
        coord,
        localCoord: venue.value.Translate(coord),
        name: t.properties.shortName.ru,
      }
    });

  console.log(annotations);

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
  mapController.scheduleUpdate()
})

defineComponent([MapKitVue, LevelSwitcherVue])
</script>

<style lang="scss">
svg {
  width: 100px;
  height: 100px;
}

.annotation-text {
  text-anchor: middle;
  dominant-baseline: hanging;
  fill: #000;
  stroke-width: 2;
  stroke: #fff;
  paint-order: stroke;
  transform: translate(50px, 55px);
  color: #000;

  font-size: 10px;
  font-weight: bold;
}


.circle-annotation {
  width: 100px;
  height: 100px;

  // background: rgba(204, 204, 204, 0.209);
  // border-radius: 50px;
  transform: translateY(50px);
  cursor: default !important;
}

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
