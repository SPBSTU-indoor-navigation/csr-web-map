<template>
  <BottomSheetPageVue @close="$emit('pop')">
    <template #header>
      <h1>Route</h1>
    </template>

    <template #content>
      <p>{{fromUnitInfo.title}}</p>
      <p>{{toUnitInfo.title}}</p>
      <p>{{pathResult.indoorDistance}}</p>
      <p>{{pathResult.outdoorDistance}}</p>
      <p>{{fullPath}}</p>
    </template>
  </BottomSheetPageVue>
</template>

<script setup lang="ts">
import BottomSheetPageVue from "@/components/bottomSheet/BottomSheetPage.vue";
import { IAnnotation } from "@/core/map/annotations/annotation";
import { PathFinder } from "@/core/pathFinder";
import { Node2D } from "@/core/pathFinder/aStar";
import { computed } from "vue";
import { unitInfoFromAnnotation } from "../unitDetail/data";

const props = defineProps<{
  delegate: any,
  data: {
    from: IAnnotation,
    to: IAnnotation
    pathFinder: PathFinder,
  }
}>()

const fromUnitInfo = computed(() => unitInfoFromAnnotation(props.data.from))
const toUnitInfo = computed(() => unitInfoFromAnnotation(props.data.to))


const pathResult = computed(() => {
  if (!props.data.from || !props.data.to) return null
  return props.data.pathFinder.findPath(props.data.from, props.data.to)
})

const fullPath = computed(() => {
  return pathResult.value.path.map(t => `(${(t as Node2D).position.x.toFixed(1)}; ${(t as Node2D).position.y.toFixed(1)})`).join(' -> ')
})
</script>
