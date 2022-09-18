<template>
  <div id="mapKitContainer" @pointerdown="pointerdown" @pointerup="pointerup"></div>
</template>

<script>
import useMapKit from './useMapKit'
import { useUtils } from './utils'

export default {
  data: () => ({
    downEvent: null,
  }),
  props: {
    showsPointsOfInterest: {
      type: Boolean,
      default: false,
    },
    showsMapTypeControl: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    showsPointsOfInterest(newValue) {
      this.map.showsPointsOfInterest = newValue
    },
  },
  methods: {
    pointerdown(e) {
      this.downEvent = e
    },
    pointerup(e) {
      if (!this.downEvent) return
      const delta = e.timeStamp - this.downEvent.timeStamp
      if (delta > 300) return

      const screenX = e.screenX - this.downEvent.screenX
      const screenY = e.screenY - this.downEvent.screenY

      if (Math.abs(screenX) > 10 || Math.abs(screenY) > 10) return

      this.$emit('singleClick', e)
    },
  },
  async mounted() {
    await useMapKit('https://dev.mapstorage.polymap.ru/api/token')

    const m = new mapkit.Map('mapKitContainer', {
      showsPointsOfInterest: this.showsPointsOfInterest,
      showsMapTypeControl: this.showsMapTypeControl,
    })
    useUtils(m)
    this.map = m
    console.log(m)
    this.$emit('map-ready', this.map)
  },
}
</script>

<style scoped>
#mapKitContainer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
