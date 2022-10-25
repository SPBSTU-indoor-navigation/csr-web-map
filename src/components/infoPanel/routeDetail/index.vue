<template>
  <BottomSheetPageVue @close="onClose">
    <template #header>
      <h1>Route</h1>
    </template>

    <template #content>
      <p>{{ fromUnitInfo.title }}</p>
      <p>{{ toUnitInfo.title }}</p>
      <p>{{ pathResult.indoorDistance }}</p>
      <p>{{ pathResult.outdoorDistance }}</p>
    </template>
  </BottomSheetPageVue>
</template>

<script setup lang="ts">
import BottomSheetPageVue from "@/components/bottomSheet/BottomSheetPage.vue";
import { usePageStore } from "@/components/bottomSheet/usePageStore";
import { IMapDelegate } from "@/components/map/mapControlls";
import { IAnnotation } from "@/core/map/overlayDrawing/annotations/annotation";
import { PathFinder } from "@/core/pathFinder";
import { Node2D } from "@/core/pathFinder/aStar";
import { computed, inject, ShallowRef, watch } from "vue";
import { IInfoPanelDelegate } from "../infoPanelControlls";
import { unitInfoFromAnnotation } from "../unitDetail/data";

const props = defineProps<{
  delegate: IInfoPanelDelegate,
  page: number
  data: {
    from: IAnnotation,
    to: IAnnotation
    pathFinder: PathFinder,
  }
}>()

const emit = defineEmits<{
  (event: 'pop'): void
}>()

const currentRouteId = usePageStore<string>(`route_${props.page}`, 'currentRouteId', null)
const lastAnnotations = usePageStore<IAnnotation[]>(`route_${props.page}`, 'lastAnnotations', [])

const fromUnitInfo = computed(() => unitInfoFromAnnotation(props.data.from))
const toUnitInfo = computed(() => unitInfoFromAnnotation(props.data.to))
const mapDelegate = inject<ShallowRef<IMapDelegate>>('mapDelegate')

const pathResult = computed(() => {
  if (!props.data.from || !props.data.to) return null
  return props.data.pathFinder.findPath(props.data.from, props.data.to)
})

function onClose() {
  if (pathResult.value != null) {
    mapDelegate.value.removePath(currentRouteId.value)
  }
  mapDelegate.value.unpinAnnotation(...lastAnnotations.value)
  emit('pop')
}

watch(pathResult, result => {
  if (result != null) {
    mapDelegate.value.removePath(currentRouteId.value)
  }

  currentRouteId.value = mapDelegate.value.addPath(result.path)

  const targetPin = [props.data.from, props.data.to]
  mapDelegate.value.unpinAnnotation(...lastAnnotations.value.filter(a => !targetPin.includes(a)))
  mapDelegate.value.pinAnnotation(...targetPin.filter(a => !lastAnnotations.value.includes(a)))

  lastAnnotations.value = targetPin

}, { immediate: true })



</script>
