<template>
  <div>
    <MapKitVue @map-ready="onMapReady" />
    <div class="abs-full container-map-ui">
      <input @input="sliderChange" type="range" min="0" max="0.00004" step="1e-10" value="0" class="slider">
    </div>
  </div>
</template>

<script>
import MapKitVue from './MapKit/MapKit.vue'
import { importGeoJSON } from './MapKit/utils.js'
import Venue from '../imdf/venue.js'

import simplify from 'simplify-js'
import lightTheme from '../styles/imdf/light.js'

export default {
  data() {
    return {
      // archive: null,
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
      venue.Add(this.map)
      venue.Style(lightTheme)

      this.map.region = venue.geometry.region()
      this.map.setCameraBoundaryAnimated(this.map.region)
      this.map.cameraZoomRange = new mapkit.CameraZoomRange(100, 3000)
      return;
      // log

      const imdf = this.archive.imdf
      console.log("imdf", imdf);
      console.log(simplify);

      const styleForOverlay = (overlay, geoJson) => {
        overlay.style.fillColor = this.color
        overlay.style.fillOpacity = 1
        return overlay.style
      }

      this.venue = await importGeoJSON({
        type: "FeatureCollection",
        features: imdf.venue
      }, {
        styleForOverlay,
        itemForPolygon(item) {
          item.enabled = false
          return item
        }
      })

      const building = await importGeoJSON({
        type: "FeatureCollection",
        features: imdf.building
      }, {})

      const level = await importGeoJSON({
        type: "FeatureCollection",
        features: imdf.level
      }, {})

      const enviroment = await importGeoJSON({
        type: "FeatureCollection",
        features: imdf.enviroment
      }, {
        itemForFeature(item, geoJson) {
          item.data.xyPoints = item.points.map(c => c.map(t => ({ x: t.latitude, y: t.longitude })))
          return item
        },
        styleForOverlay(overlay, geoJson) {
          overlay.style.fillColor = "rgb(0,255,0)"
          overlay.style.strokeOpacity = 1

          return overlay.style
        }
      })

      const unit = await importGeoJSON({
        type: "FeatureCollection",
        features: imdf.unit
      }, {})

      this.enviroment = enviroment

      // this.enviroment.items.forEach(e => {
      //   let min = []
      //   e.data.xyPoints.forEach(p => {
      //     const simplified = simplify(p, 0.00004, false)

      //     // if (simplified.length > 5 || p.length < 5) {
      //     min.push(simplified.map(t => new mapkit.Coordinate(t.x, t.y)))
      //     // }
      //   })

      //   e.points = min
      // })

      console.log("COUNT", this.enviroment.items.flatMap(t => t.points.map(t => t.length)).reduce((a, v) => a + v, 0));

      console.log("enviroment", enviroment.items);
      console.log("building", building.items);

      enviroment.items[0].points = enviroment.items.flatMap(t => t.points)

      console.log("map", this.map);
      console.log("venue", this.venue);
      this.map.addOverlays(this.venue.items)
      // this.map.addOverlay(enviroment.items[0])
      this.map.addOverlays(this.enviroment.items)
      this.map.addOverlays(building.items)
      this.map.addOverlays(level.items)
      // this.map.addOverlays(unit.items)


      this.map.region = this.venue.items[0].region()
      this.map.setCameraBoundaryAnimated(this.map.region)
      this.map.cameraZoomRange = new mapkit.CameraZoomRange(100, 3000)
      this.map.colorScheme = this.colorScheme

      // this.map.region = new mapkit.CoordinateRegion(
      //   new mapkit.Coordinate(levels[0].geometry.coordinates[0][0][1], levels[0].geometry.coordinates[0][0][0]),
      //   new mapkit.CoordinateSpan(0.004, 0.004)
      // );
    },
    sliderChange(e) {

      const val = e.target.value

      this.enviroment.items.forEach(e => {
        let min = []
        e.data.xyPoints.forEach(p => {
          const simplified = simplify(p, val, false)

          // if (simplified.length > 5 || p.length < 5) {
          min.push(simplified.map(t => new mapkit.Coordinate(t.x, t.y)))
          // }
        })

        e.points = min
      })

      console.log("COUNT", this.enviroment.items.flatMap(t => t.points.map(t => t.length)).reduce((a, v) => a + v, 0));
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