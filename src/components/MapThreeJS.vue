<template>
  <div>
    <MapKitVue @map-ready="onMapReady" />
    <div class="abs-full container-map-ui">
    </div>
  </div>
</template>

<script>
import MapKitVue from './MapKit/MapKit.vue'
import Venue from '../imdf/venue.js'

import lightTheme from '../styles/imdf/light.js'

import { Scene, OrthographicCamera, WebGLRenderer } from 'three';
import { Vector2 } from 'three';

import { geoToVector } from '../imdf/utils'

const size = new Vector2()

export default {
  data() {
    return {
      theme: 'l',
      zoom: 0
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

      this.venue = new Venue(this.archive.imdf)
      this.map.addOverlay(this.venue.mkGeometry)
      this.map.region = this.venue.mkGeometry.region()
      this.map.setCameraBoundaryAnimated(this.map.region)
      this.map.cameraZoomRange = new mapkit.CameraZoomRange(0, 3000)


      this.scene = new Scene()
      this.camera = new OrthographicCamera(-100, 100, 100, -100, 0.1, 1000)


      this.renderer = new WebGLRenderer({ alpha: true, antialias: true })
      this.renderer.setClearColor(0x000000, 0);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(window.devicePixelRatio)
      document.querySelector('.mk-map-view').insertBefore(this.renderer.domElement, document.querySelector(".mk-map-view>.mk-map-node-element"))

      window.onMapkitUpdate = this.animate
      this.onWindowResize()
      window.addEventListener('resize', this.onWindowResize, false);

      this.venue.Style(lightTheme)
      this.venue.Add(this.scene)
    },
    animate() {
      const region = this.map.region
      const delta = geoToVector(region.center,
        {
          latitude: region.center.latitude + region.span.latitudeDelta / 2,
          longitude: region.center.longitude + region.span.longitudeDelta / 2
        })


      this.camera.left = -delta.x
      this.camera.right = delta.x
      this.camera.top = delta.y
      this.camera.bottom = -delta.y


      const center = this.venue.Translate(this.map.center)
      this.camera.position.set(center.x, center.y, 10)
      this.camera.rotation.set(0, 0, this.map.rotation * Math.PI / 180)

      this.camera.updateProjectionMatrix()


      this.renderer.getSize(size)
      this.zoom = size.x / delta.x
      this.venue.OnZoom(this.zoom)


      this.renderer.render(this.scene, this.camera);
    },
    onWindowResize() {

      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.venue.OnResolutionChange({
        width: window.innerWidth,
        height: window.innerHeight
      })

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
