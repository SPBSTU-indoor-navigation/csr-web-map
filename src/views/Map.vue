<template>
  <div class="home">
    <MapVue @mapDelegate="onMapDelegate" />
    <div class="abs-full non-block" @wheel="onScroll">
      <InfoPanelVue ref="infoPanel" />
    </div>
  </div>
</template>

<script setup lang="ts">
import MapVue from "../components/map/MapThreeJS.vue";
import InfoPanelVue from "@/components/infoPanel/index.vue";
import { useFullscreenScrollFix } from "@/core/shared/composition/useFullscreenScrollFix";
import { provide, ShallowRef, shallowRef, watch, watchEffect } from "vue";
import { FocusVariant, IMapDelegate } from "@/components/map/mapControlls";
import { useRoute, useRouter } from "vue-router";

const infoPanel = shallowRef<InstanceType<typeof InfoPanelVue>>(null);

const route = useRoute()
const router = useRouter()

// @ts-ignore
const mapDelegate: ShallowRef<IMapDelegate> = shallowRef({
  selectedAnnotation: shallowRef(null),
  pinnedAnnotations: shallowRef([]),
  venue: shallowRef(null),
})

provide('mapDelegate', mapDelegate)
useFullscreenScrollFix()

function onScroll(e) {
  if (e.ctrlKey) {
    e.preventDefault()
    e.stopPropagation()
  }
};

function onMapDelegate(delegate: IMapDelegate) {

  function annotationById(id: string | string[]) {
    if (id && typeof id === 'string') {
      return mapDelegate.value.venue.value.mapAnnotations.get(id)
    }
    return null
  }

  mapDelegate.value = delegate

  const variant = route.params.shareVariant
  if (variant) {
    if (variant == 'route') {
      const from = annotationById(route.query.from)
      const to = annotationById(route.query.to)

      if (from && to) {
        const asphalt = route.query.asphalt === 'true'
        const allowService = route.query.serviceRoute === 'true'

        setTimeout(() => {
          infoPanel.value.setRouteWithOptions({ from, to, asphalt, allowService })
        }, 500)
      }

    } else if (variant == 'annotation') {
      const annotation = annotationById(route.query.id)
      if (annotation) {
        setTimeout(() => {
          mapDelegate.value.selectAnnotation({ annotation, focusVariant: FocusVariant.center, animated: route.query.animated ? true : false })
        }, 500)
      }
    }

    if (!route.query.b) {
      router.replace({
        query: { ...route.query, id: undefined, from: undefined, to: undefined, asphalt: undefined, serviceRoute: undefined },
        params: { ...route.params, shareVariant: undefined }
      })
    }
  }
}

</script>

<style scoped>
.abs-full {
  /* 
  background-color: #343434; */
}
</style>
