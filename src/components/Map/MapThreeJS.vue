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
import useMapAnnotations from './Annotations/useMapAnnotations'
import MapKitVue from './MapKit/MapKit.vue'
import useMapOverlay from './useMapOverlay'

import { Box2, Vector2, Vector3 } from 'three'
import { defineComponent, ref, shallowRef, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

import { nearestBuiling } from './utils'
import { Annotation } from './Annotations/annotation'

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

/** @type {ReturnType<typeof useMapAnnotations>} */
let mapAnnotations

const SHOW_ZOOM = 4
const HIDE_ZOOM = 3.9

function onMapReady(map) {
  mkMap.value = map
}

function onAnimate() {
  mapAnnotations.render({ cam: camera })
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

  mapAnnotations = useMapAnnotations({})

  scene = mapOverlay.scene
  camera = mapOverlay.camera
  renderer = mapOverlay.renderer

  watchEffect(() => {
    zoom.value = mapOverlay.zoom.value
  })

  var factory = function (coordinate, options) {

    function getNode(n, v) {
      n = document.createElementNS("http://www.w3.org/2000/svg", n);
      for (var p in v)
        n.setAttributeNS(null, p, v[p]);
      return n
    }

    const div = document.createElement("div")
    const name = options.title

    const svg = getNode('svg', {
      'viewBox': "0 0 100 100"
    })

    const text = getNode('text', {})

    const cirlce = getNode('circle', {
      'cx': 50,
      'cy': 50,
      'r': 3,
    })

    text.textContent = name
    text.className.baseVal = "annotation-text"

    svg.appendChild(text)
    svg.appendChild(cirlce)



    div.appendChild(svg)

    // div.className = "circle-annotation";

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext('2d')

    canvas.width = 100
    canvas.height = 100

    if (window.devicePixelRatio > 1) {
      var canvasWidth = canvas.width;
      var canvasHeight = canvas.height;

      canvas.width = canvasWidth * window.devicePixelRatio;
      canvas.height = canvasHeight * window.devicePixelRatio;
      canvas.style.width = canvasWidth + "px";
      canvas.style.height = canvasHeight + "px";

      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    ctx.imageSmoothingEnabled = true

    ctx.translate(50, 50)
    // ctx.fillRect(10, 10, 80, 80)
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.font = "bold 10px sans-serif"
    ctx.fillStyle = "black"

    ctx.lineWidth = 2
    ctx.strokeStyle = "white"
    ctx.strokeText(name, 0, 10)
    ctx.fillText(name, 0, 10)


    ctx.beginPath()
    ctx.arc(0, 0, 2, 0, 2 * Math.PI);
    ctx.fill();

    return canvas;
  };

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


  mapAnnotations.add(new Annotation({}, new Vector2(0, 0), {}))
  mapAnnotations.add(new Annotation({}, new Vector2(-600, -300), {}))

  const annotations = archive.imdf.occupant
    // .filter(t => levelById[unitById[t.properties.anchor.properties.unit_id].properties.level_id].properties.ordinal == 0)
    .map(t => {
      const coordArray = t.properties.anchor.geometry.coordinates
      const coord = new mapkit.Coordinate(coordArray[1], coordArray[0])

      var annotation = new mapkit.Annotation(coord, factory, {
        title: t.properties.shortName.ru,
      });

      const pos = venue.value.Translate(coord)

      // mapAnnotations.add(new Annotation({}, new Vector2(pos.x, pos.y), {}))

      annotation.calloutEnabled = false
      annotation.anchorOffset = new DOMPoint(0, -50)
      // mkMap.value.addAnnotation(annotation)
      return {
        coord,
        localCoord: venue.value.Translate(coord),
        name: t.properties.shortName.ru,
      }


      // var options = {
      //     title: person.title,
      //     data: { role: person.role, building: person.building }
      // };
      // var annotation = new mapkit.Annotation(person.coordinate, factory, options);
      // map.addAnnotation(annotation);
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
  window.onMapkitUpdate?.()
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
