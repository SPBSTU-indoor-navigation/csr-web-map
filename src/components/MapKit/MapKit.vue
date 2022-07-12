<template>
  <div id="mapKitContainer"></div>
</template>

<script>
import useMapKit from './useMapKit'
import { useUtils } from './utils'
let map = null

export default {
  data: () => ({
  }),
  props: {
    showsPointsOfInterest: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    showsPointsOfInterest(newValue) {
      this.map.showsPointsOfInterest = newValue
    }
  },
  async mounted() {
    await useMapKit("http://localhost:11000/api/token")

    const m = new mapkit.Map('mapKitContainer', {
      showsPointsOfInterest: this.showsPointsOfInterest
    })
    useUtils(m)
    this.map = m
    console.log(m);
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