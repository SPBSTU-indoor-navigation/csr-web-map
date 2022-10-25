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
        <div>
          <input type="checkbox" v-model="showDebugPath" id="checkbox4">
          <label for="checkbox4">navpath</label>
        </div>
        <p>annotation c: {{ renderAnnotationCount }}</p>
        <p>zoom: {{ zoom.toFixed(4) }}</p>
        <p>fps: {{ fps }}</p>
        <p>fps2: {{ fps2 }}</p>
        <hr>
        <button @click="showDebugPanel = false">close</button>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Venue from '@/core/imdf/venue';
import Building from '@/core/imdf/building';
import lightTheme from '@/styles/map/light.js';
import LevelSwitcherVue from '../controlls/levelSwitcher/index.vue';
import MapKitVue from '@/core/map/mapKit/MapKit.vue';

import { Box2, Vector2 } from 'three';
import { defineComponent, markRaw, readonly, ref, shallowRef, watch, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { useFps } from '@vueuse/core'

import { nearestBuiling } from '@/core/map/utils';

import { showBackedCanvas, showBackedOutline, renderAnnotationCount, showAnnotationBBox, showDebugPanel, showDebugPath } from '@/store/debugParams'

import { FocusVariant, IMap, IMapDelegate } from './mapControlls';
import useOverlayDrawing from '@/core/map/overlayDrawing/useOverlayDrawing';
import useMapAnnotations from '@/core/map/overlayDrawing/annotations/useMapAnnotations';
import useOverlayGeometry from '@/core/map/overlayGeometry/useOverlayGeometry';
import useMapPath from '@/core/map/overlayDrawing/path/useMapPath';

const mapContainer = ref(null)

const mkMap = shallowRef();

const venue = shallowRef<Venue>(null);
const styleSheet = shallowRef(lightTheme);
const zoom = ref(0);
const currentBuilding = shallowRef<Building>();
const showIndoor = ref(false);
const currentOrdinal = ref(0);

let overlayDrawing: ReturnType<typeof useOverlayDrawing>;
let overlayGeometry: ReturnType<typeof useOverlayGeometry>;
let mapAnnotations: ReturnType<typeof useMapAnnotations>;
let mapPath: ReturnType<typeof useMapPath>;

let map: IMap = null;


const SHOW_ZOOM = 4;
const HIDE_ZOOM = 3.9;

let lastAnimateTime = 0
let fps = ref("0")
const fps2 = useFps()

const emit = defineEmits(['mapDelegate'])

function mapClick(e: PointerEvent) {
  overlayDrawing.click(new Vector2(e.clientX, e.clientY), e)
}

function onMapReady(map) {
  mkMap.value = map;
}

function debugFPS() {
  const time = performance.now()
  const delta = time - lastAnimateTime
  const t = Math.round(1000 / delta)
  fps.value = t < 10 ? '-' : t.toFixed(0)
  lastAnimateTime = time
}

function onAnimate() {
  debugFPS()

  if (!map) return

  overlayGeometry.render()
  overlayDrawing.draw()
  const nearest = nearestBuiling(
    new Box2(new Vector2(-1, -1), new Vector2(1, 1)).expandByScalar(-0.1),
    overlayGeometry.camera,
    venue.value
  );
  currentBuilding.value = nearest;
}

function scheduleUpdate() {
  venue.value.ScheduleUpdate()
}

//@ts-ignore
window.onMapkitUpdate = () => onAnimate()


async function load() {
  const router = useRoute();
  const url = `https://dev.mapstorage.polymap.ru/api/map/${router.params.mapID}`;
  const archive = await (await fetch(url)).json();

  while (!mkMap.value) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  venue.value = new Venue(archive.imdf)

  overlayGeometry = useOverlayGeometry({
    venue,
    mapZoom: zoom,
    mkMap: mkMap.value,
    mapContainer,
    scheduleUpdate
  })

  overlayDrawing = useOverlayDrawing({
    mapZoom: readonly(zoom),
    container: mapContainer,
    threeJsCamera: overlayGeometry.camera,
    scheduleUpdate,
  })

  mapPath = useMapPath({ pathFinder: venue.value.pathFinder })
  mapAnnotations = useMapAnnotations({ styleSheet, mapZoom: readonly(zoom) })

  overlayDrawing.addOverlay(mapPath.overlayDrawing)
  overlayDrawing.addOverlay(mapAnnotations.overlayDrawing)

  map = {
    addAnnotation: mapAnnotations.add,
    removeAnnotation: mapAnnotations.remove,

    addOverlay: t => overlayGeometry.scene.add(t),
    removeOverlay: t => overlayGeometry.scene.remove(t),

    addPath: mapPath.add,
    removePath: mapPath.remove,
  }


  const delegate: IMapDelegate = {
    selectedAnnotation: mapAnnotations.selected,
    pinnedAnnotations: mapAnnotations.pinned,
    venue,
    selectAnnotation: (a, focusVariant) => {
      mapAnnotations.selected.value = a
    },
    deselectAnnotation: (a) => {
      if (mapAnnotations.selected.value == a) {
        mapAnnotations.selected.value = null
      }
    },
    addPath: mapPath.add,
    removePath: mapPath.remove,
    pinAnnotation: (...a) => {
      mapAnnotations.pinned.value.push(...a)
    },
    unpinAnnotation: (...a) => {
      const target = Array.from(a)
      mapAnnotations.pinned.value = mapAnnotations.pinned.value.filter(x => !target.includes(x))
    },
  }

  emit('mapDelegate', delegate)
}

load();


watchEffect(() => {
  venue.value?.Style(styleSheet.value.imdf)
})

watch(venue, (newValue, oldValue) => {
  newValue.Add(map)
  oldValue?.Remove(map)
})

watch(zoom, (zoom) => {
  if (currentBuilding.value) {
    if (zoom > SHOW_ZOOM) {
      currentBuilding.value.ShowIndoor(undefined);
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
      building.ShowIndoor(undefined);
      showIndoor.value = true;
    }
  }
});

watch(currentOrdinal, (ordinal) => {
  currentBuilding.value.ChangeOrdinal(ordinal);
  scheduleUpdate();
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
