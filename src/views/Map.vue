<template>
  <div class="home">
    <MapVue @mapDelegate="onMapDelegate" />
    <div class="abs-full non-block" @wheel="onScroll">
      <InfoPanelVue />
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
import { nextFrame } from "@/core/shared/utils";

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
  mapDelegate.value = delegate

  if (route.query?.annotation) {
    const annotation = mapDelegate.value.venue.value.annotations.find(a => a.annotationId === route.query.annotation)
    if (annotation) {
      nextFrame(() => {
        nextFrame(() => {
          mapDelegate.value.selectAnnotation({ annotation: annotation.annotation, focusVariant: FocusVariant.center, animated: false })
        })
      })
    }
    router.replace({ query: { ...route.query, annotation: undefined } })
  }

}

</script>

<style scoped>
.abs-full {
  /* 
  background-color: #343434; */
}
</style>
