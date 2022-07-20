<template>
  <div>
    <MapKitVue @map-ready="onMapReady" />
    <div class="abs-full container-map-ui">
    </div>
  </div>
</template>

<script>
import MapKitVue from './MapKit/MapKit.vue'
import { importGeoJSON } from './MapKit/utils.js'
import Venue from '../imdf/venue.js'

import simplify from 'simplify-js'
import lightTheme from '../styles/imdf/light.js'

import { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight } from 'three';
import { BoxGeometry, MeshBasicMaterial, Mesh } from 'three';
import * as THREE from 'three'
import { Stats } from "three-stats";
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'


const metersInLatDegree = 111194.92664
function GeoToVector(pivot, position) {

  const Deg2Rad = Math.PI / 180.0

  const x = (position.longitude - pivot.longitude) * metersInLatDegree * Math.cos(Deg2Rad * (pivot.latitude + position.latitude) / 2);
  const y = (position.latitude - pivot.latitude) * metersInLatDegree;
  return { x, y }
}


export default {
  data() {
    return {
      theme: 'l'
    }
  },
  methods: {
    onMapReady(map) {
      this.map = map
      this.loadIMDF(this.$route.params.mapID)
    },
    async loadIMDF(mapID) {
      const url = `https://dev.mapstorage.polymap.ru/api/map/${mapID}`
      this.archive = await (await fetch(url)).json()

      const venue = new Venue(this.archive.imdf)

      this.venuePivot = venue.geometry.region().center
      console.log(this.venuePivot);
      // venue.Add(this.map)
      venue.geometry.style = new mapkit.Style({
        fillColor: lightTheme.venue.fillColor,
        strokeOpacity: 0
      })
      // this.map.addOverlay(venue.geometry)
      // venue.Style(lightTheme)

      this.map.region = venue.geometry.region()
      // this.map.setCameraBoundaryAnimated(this.map.region)
      // this.map.cameraZoomRange = new mapkit.CameraZoomRange(100, 3000)

      const scene = new Scene();

      const camera = new THREE.OrthographicCamera(-100, 100, 100, -100, 0.1, 1000);
      camera.position.z = 2;

      const renderer = new WebGLRenderer({ alpha: true, antialias: true });
      renderer.setClearColor(0x000000, 0);
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.querySelector('.mk-map-view').insertBefore(renderer.domElement, document.querySelector(".mk-map-view>.mk-map-node-element"))





      this.camera = camera
      this.scene = scene
      this.renderer = renderer

      console.log(scene);

      renderer.setPixelRatio(window.devicePixelRatio)

      this.addPolygon(venue.geometry, lightTheme.venue.fillColor)

      console.log(venue);
      venue.enviroment.geometry.sorted.forEach(key => {
        this.addPolygon(venue.enviroment.geometry[key], lightTheme.environment[key].fillColor)
      })
      this.addPolygon(venue.building, lightTheme['building.footprint'].fillColor)

      console.log(this.camera);


      // window.onMapkitUpdate = this.animate

      this.stats = new Stats()
      document.querySelector('.home').appendChild(this.stats.dom)

      this.animate()

    },
    animate() {
      requestAnimationFrame(this.animate);


      const region = this.map.region
      const delta = GeoToVector(region.center,
        {
          latitude: region.center.latitude + region.span.latitudeDelta / 2,
          longitude: region.center.longitude + region.span.longitudeDelta / 2
        })


      this.camera.left = -delta.x
      this.camera.right = delta.x
      this.camera.top = delta.y
      this.camera.bottom = -delta.y

      const center = this.vector(this.map.center)


      this.camera.position.set(center.x, center.y, 2)
      this.camera.rotation.set(0, 0, this.map.rotation * Math.PI / 180)

      this.camera.updateProjectionMatrix()

      this.renderer.render(this.scene, this.camera);

      // console.log("position", this.camera.position);
      this.stats.update()


    },
    addPolygon(polygon, color) {
      console.log(color);

      if (Array.isArray(polygon)) return;

      let geometrys = []

      polygon.points.forEach(polygon => {
        const shape = new THREE.Shape()
        const points = polygon.flatMap(p => this.vector(p))

        shape.add(new THREE.Path().setFromPoints(points))

        const geometry = (new THREE.ShapeGeometry(shape))
        geometrys.push(geometry)
      })


      const merged = BufferGeometryUtils.mergeBufferGeometries(geometrys, false)
      const matertial = new THREE.MeshBasicMaterial({ color: color, wireframe: false })
      const mesh = new THREE.Mesh(merged, matertial);
      mesh.matrixAutoUpdate = false
      this.scene.add(mesh);

    },
    vector(pos) {
      return GeoToVector(this.venuePivot, pos)
    }
  },
  computed: {
    color() {
      return this.theme == 'l' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 255)'
    },
    colorScheme() {
      return this.theme == 'l' ? mapkit.Map.ColorSchemes.Light : mapkit.Map.ColorSchemes.Dark
    }
  },
  components: {
    MapKitVue
  }
}
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