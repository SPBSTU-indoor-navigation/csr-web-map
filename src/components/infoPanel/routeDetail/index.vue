<template>
  <BottomSheetPageVue @close="onClose">
    <template #header>
      <h1>Маршрут</h1>
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
import { usePageStore, useStorageComptuted } from "@/components/bottomSheet/usePageStore";
import { IMapDelegate } from "@/components/map/mapControlls";
import { IAnnotation } from "@/core/map/overlayDrawing/annotations/annotation";
import { PathFinder, PathResult } from "@/core/pathFinder";
import { Node2D } from "@/core/pathFinder/aStar";
import { computed, inject, onMounted, Ref, ref, ShallowRef, watch } from "vue";
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

const { currentRouteId, lastAnnotations, lastPath } = usePageStore(`route_${props.page}`, () => ({
  currentRouteId: ref<string>(null),
  lastAnnotations: ref([]) as Ref<IAnnotation[]>,
  lastPath: ref(null) as Ref<PathResult>,
}))


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
    currentRouteId.value = null
  }
  mapDelegate.value.unpinAnnotation(...lastAnnotations.value)
  lastAnnotations.value = []
  lastPath.value = null
  emit('pop')
}

function createPath(result: PathResult) {
  if (result != null) {
    mapDelegate.value.removePath(currentRouteId.value)
  }

  currentRouteId.value = mapDelegate.value.addPath(result)

  const targetPin = [props.data.from, props.data.to]
  mapDelegate.value.unpinAnnotation(...lastAnnotations.value.filter(a => !targetPin.includes(a)))
  mapDelegate.value.pinAnnotation(...targetPin.filter(a => !lastAnnotations.value.includes(a)))

  lastAnnotations.value = targetPin
}

watch(pathResult, (result, old) => {
  if (!(lastPath.value && result && lastPath.value.equals(result))) {
    lastPath.value = result
    createPath(result)
  }
}, { immediate: true })

</script>
