<template>
  <BottomSheetPageVue @close="onClose">
    <template #header>
      <h1>Маршрут</h1>
    </template>

    <template #content>
      <p>{{ fromUnitInfo.title }}</p>
      <p>{{ toUnitInfo.title }}</p>

      <DetailInfoVue title="Информация о маршруте" :lines="pathDetailInfo" />

      <div class="info-panel-section-group">
        <h2 class="info-panel-section-title">Параметры</h2>
        <div class="info-panel-section">
          <SectionCellVue title="По асфальтированным дорогам" :clickable="true"
            @click="prefereAsphalt = !prefereAsphalt">
            <template #right>
              <input type="checkbox" v-model="prefereAsphalt" class="controll-checkbox">
            </template>
          </SectionCellVue>
          <hr class="separator small" />
          <SectionCellVue title="Разрешить служебные проходы" :clickable="true" @click="allowService = !allowService">
            <template #right>
              <input type="checkbox" v-model="allowService" class="controll-checkbox">
            </template>
          </SectionCellVue>
        </div>
      </div>

      <div class="info-panel-section info-panel-section-group">
        <SectionCellVue title="Поделиться" :clickable="true">
          <template #right>
            <IconVue img="share" class="controll-image" />
          </template>
        </SectionCellVue>
      </div>
    </template>
  </BottomSheetPageVue>
</template>

<script setup lang="ts">
import BottomSheetPageVue from "@/components/bottomSheet/BottomSheetPage.vue";
import IconVue from "@/components/icon/index.vue";
import { usePageStore, useStorageComptuted } from "@/components/bottomSheet/usePageStore";
import { IMapDelegate } from "@/components/map/mapControlls";
import { IAnnotation } from "@/core/map/overlayDrawing/annotations/annotation";
import { PathFinder, PathResult } from "@/core/pathFinder";

import { computed, inject, onMounted, Ref, ref, ShallowRef, watch } from "vue";
import { IInfoPanelDelegate } from "../infoPanelControlls";
import { unitInfoFromAnnotation } from "../unitDetail/data";

import DetailInfoVue from '../shared/DetailInfo.vue'
import SectionCellVue from "../shared/SectionCell.vue";
import { distanceFormatter } from "@/core/formatter/distance";
import { timeFormatter } from "@/core/formatter/time";
import { useStorage } from "@vueuse/core";

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

const prefereAsphalt = useStorage('prefereAsphalt', false, localStorage)
const allowService = useStorage('allowService', true, localStorage)

const fromUnitInfo = computed(() => unitInfoFromAnnotation(props.data.from))
const toUnitInfo = computed(() => unitInfoFromAnnotation(props.data.to))
const mapDelegate = inject<ShallowRef<IMapDelegate>>('mapDelegate')


const pathDetailInfo = computed(() => {
  let content: { title: string, content: string }[] = []
  const append = (t: string, c: string) => { content.push({ title: t, content: c }) }

  append('Дистанция', distanceFormatter(pathResult.value.totalDistance))

  const time = timeFormatter(pathResult.value.time)
  const fastTime = timeFormatter(pathResult.value.fastTime)

  append('Время', time)
  if (time != fastTime) append('Быстрым шагом', fastTime)
  if (pathResult.value.indoorDistance > 0 && pathResult.value.outdoorDistance > 0) {
    append('Внутри помещения', distanceFormatter(pathResult.value.indoorDistance))
    append('По улице', distanceFormatter(pathResult.value.outdoorDistance))
  }

  return content
})

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

<style scoped>
.separator {
  margin: 10px -10px 10px 10px;
}

.controll-image {
  fill: var(--accent-color);

  min-width: 22px;
  min-height: 22px;
  max-width: 22px;
  max-height: 22px;
}

.controll-checkbox {
  min-width: 15px;
  min-height: 15px;
  max-width: 15px;
  max-height: 15px;

  margin-right: 3px;

  cursor: pointer;
}
</style>
