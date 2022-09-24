<template>
  <div>
    <MapKitVue @map-ready="onMapReady" @singleClick="mapClick" />
    <div class="abs-full container-map-ui">
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
        <hr>
        <button @click="showDebugPanel=false">close</button>

      </div>
    </div>
  </div>
</template>

<script setup>
import Venue from '@/core/imdf/venue';
import lightTheme from '@/styles/map/light.js';
import LevelSwitcherVue from '../controlls/levelSwitcher/index.vue';
import useMapAnnotations from '@/core/map/annotations/useMapAnnotations';
import MapKitVue from '@/core/map/mapKit/MapKit.vue';
import useMapOverlay from '@/core/map/overlays/useMapOverlay';

import { Box2, Vector2 } from 'three';
import { defineComponent, ref, shallowRef, watch, watchEffect } from 'vue';
import { useRoute } from 'vue-router';

import { nearestBuiling } from '@/core/map/utils';
import { MapController } from '@/core/map/mapController';

import { showBackedCanvas, showBackedOutline, renderAnnotationCount, currentZoom, showAnnotationBBox, showDebugPanel } from '@/store/debugParams'

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

function mapClick(e) {
  mapController.mapAnnotations.click(new Vector2(e.clientX, e.clientY), e);
}

function onMapReady(map) {
  mkMap.value = map;
}

function onAnimate() {
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

  const mapOverlay = useMapOverlay({
    venue,
    mkMap: mkMap.value,
    styleSheet,
    onAnimate,
    mapController,
  });

  mapController.mapAnnotations = useMapAnnotations({ mapController, styleSheet });

  watchEffect(() => {
    zoom.value = mapOverlay.zoom.value;
    mapController.mapAnnotations.zoom(zoom.value);
  });
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
svg {
  width: 100px;
  height: 100px;
}

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
