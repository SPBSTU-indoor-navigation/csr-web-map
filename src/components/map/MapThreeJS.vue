<template>
  <div class="abs-full" ref="mapContainer">
    <MapKitVue @map-ready="onMapReady" @singleClick="mapClick" />
    <div class="abs-full container-map-ui non-block" @wheel.prevent>
      <Transition name="slide-fade">
        <LevelSwitcherVue v-if="showIndoor && currentBuilding" :levels="currentBuilding.levels"
          v-model:level="currentOrdinal" />
      </Transition>
      <div class="debugContoll" v-if="showDebugPanel">
        <div>
          <input type="checkbox" v-model="showBackedOutline" id="checkbox">
          <label for="checkbox">outline</label>
        </div>
        <div>
          <input type="checkbox" v-model="showBackedCanvas" id="checkbox2">
          <label for="checkbox2">canvas</label>
        </div>
        <div>
          <input type="checkbox" v-model="showAnnotationBBox" id="checkbox3">
          <label for="checkbox3">bbox</label>
        </div>
        <p>annotation c: {{renderAnnotationCount}}</p>
        <p>zoom: {{currentZoom.toFixed(4)}}</p>
        <p>fps: {{fps}}</p>
        <p>fps2: {{fps2}}</p>
        <hr>
        <button @click="showDebugPanel=false">close</button>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Venue from '@/core/imdf/venue';
import lightTheme from '@/styles/map/light.js';
import LevelSwitcherVue from '../controlls/levelSwitcher/index.vue';
import useMapAnnotations from '@/core/map/annotations/useMapAnnotations';
import MapKitVue from '@/core/map/mapKit/MapKit.vue';
import useMapOverlay from '@/core/map/overlays/useMapOverlay';

import { Box2, Vector2 } from 'three';
import { defineComponent, ref, shallowRef, watch, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { useFps } from '@vueuse/core'

import { nearestBuiling } from '@/core/map/utils';
import { MapController } from '@/core/map/mapController';

import { showBackedCanvas, showBackedOutline, renderAnnotationCount, currentZoom, showAnnotationBBox, showDebugPanel } from '@/store/debugParams'

import { FocusVariant, IMapDelegate } from './mapControlls';

const mapContainer = ref(null)

const mkMap = shallowRef();
/** @type {import('vue').ShallowRef<Venue>} */
const venue = shallowRef();
const styleSheet = shallowRef(lightTheme);
const zoom = ref(0);
const currentBuilding = ref();
const showIndoor = ref(false);
const currentOrdinal = ref(0);

/** @type {MapController} */
let mapController;


const SHOW_ZOOM = 4;
const HIDE_ZOOM = 3.9;

let lastAnimateTime = 0
let fps = ref("0")
const fps2 = useFps()

const emit = defineEmits(['mapDelegate'])

function mapClick(e) {
  mapController.mapAnnotations.click(new Vector2(e.clientX, e.clientY), e);
}

function onMapReady(map) {
  mkMap.value = map;
}

function onAnimate() {
  const time = performance.now()
  const delta = time - lastAnimateTime
  const t = Math.round(1000 / delta)
  fps.value = t < 10 ? '-' : t.toFixed(0)
  lastAnimateTime = time

  mapController.render();
  const nearest = nearestBuiling(
    new Box2(new Vector2(-1, -1), new Vector2(1, 1)).expandByScalar(-0.1),
    mapController.camera,
    venue.value
  );
  currentBuilding.value = nearest;
}

async function load() {
  const router = useRoute();
  const url = `https://dev.mapstorage.polymap.ru/api/map/${router.params.mapID}`;
  const archive = await (await fetch(url)).json();

  while (!mkMap.value) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  venue.value = new Venue(archive.imdf);
  mapController = new MapController(venue.value.mkGeometry);

  const mapAnnotations = useMapAnnotations({ mapController, styleSheet, mapContainer });
  mapController.mapAnnotations = mapAnnotations

  const mapOverlay = useMapOverlay({
    venue,
    mkMap: mkMap.value,
    styleSheet,
    onAnimate,
    mapController,
    mapContainer
  });


  watchEffect(() => {
    zoom.value = mapOverlay.zoom.value;
    mapAnnotations.zoom(zoom.value);
  });

  const delegate: IMapDelegate = {
    selectedAnnotation: mapAnnotations.selected,
    venue,
    selectAnnotation: (a, focusVariant) => {
      mapAnnotations.select(a)
    },
    deselectAnnotation: (a) => {
      if (mapAnnotations.selected.value == a) {
        mapAnnotations.select(null)
      }
    },
  }

  emit('mapDelegate', delegate)
}

load();

watch(zoom, (zoom) => {
  if (currentBuilding.value) {
    if (zoom > SHOW_ZOOM) {
      currentBuilding.value.ShowIndoor();
      showIndoor.value = true;
    } else if (zoom < HIDE_ZOOM) {
      currentBuilding.value.HideIndoor();
      showIndoor.value = false;
    }
  }
});

watch(currentBuilding, (building, old) => {
  if (old) old.HideIndoor();
  if (building) {
    currentOrdinal.value = building.currentOrdinal;
    if (zoom.value > HIDE_ZOOM) {
      building.ShowIndoor();
      showIndoor.value = true;
    }
  }
});

watch(currentOrdinal, (ordinal) => {
  currentBuilding.value.ChangeOrdinal(ordinal);
  mapController.scheduleUpdate();
});

defineComponent([MapKitVue, LevelSwitcherVue]);
</script>

<style lang="scss">
.debugContoll {
  position: absolute;
  bottom: 100px;
  right: 10px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  width: 150px;
}

.container-map-ui {
  overflow: hidden;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.15s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(4rem);
}
</style>
