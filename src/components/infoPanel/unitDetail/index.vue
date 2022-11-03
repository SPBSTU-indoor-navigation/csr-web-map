<template>
  <BottomSheetPageVue :showHeader="true" :cloaseble="true" @close="onClose">
    <template #header>
      <h1 class="title">{{ unitInfo.title }}</h1>
    </template>

    <template #content>
      <RouteButtonsVue :fromToPlan="unitInfo.fromToPlan" v-if="unitInfo.fromToPlan" @setTo="onSetTo"
        @setFrom="onSetFrom" @openPlan="onOpenPlan" />
      <DetailVue :detail="unitInfo.detail" v-if="unitInfo.detail" />
      <div class="info-panel-section info-panel-section-group">
        <SectionCellVue title="Поделиться" :clickable="true" @click="onShareClick">
          <template #right>
            <div ref="shareIcon">
              <IconVue img="share" class="controll-image" />
            </div>
          </template>
        </SectionCellVue>

        <AlertVue text="Скопировано" :pos="{ x: shareTooltipParams?.left, y: shareTooltipParams?.top }"
          :show="shareTooltipParams != null" />
      </div>

      <div class="info-panel-section info-panel-section-group">
        <SectionCellVue title="Добавить в Закладки" :clickable="true">
          <template #left>
            <IconVue img="star.fill" class="controll-image" />
          </template>
        </SectionCellVue>
        <hr class="separator small" />
        <SectionCellVue title="Сообщить об ошибке" :clickable="true">
          <template #left>
            <IconVue img="report" class="controll-image" />
          </template>
        </SectionCellVue>
      </div>
    </template>
  </BottomSheetPageVue>
</template>

<script setup lang="ts">
import BottomSheetPageVue from "@/components/bottomSheet/BottomSheetPage.vue";
import DetailVue from './Detail.vue'
import RouteButtonsVue from './RouteButtons.vue'
import { FocusVariant, IMapDelegate } from "@/components/map/mapControlls";
import { computed } from "@vue/reactivity";
import { inject, onMounted, ref, ShallowRef, Ref, toRaw, watchEffect, watch } from "vue";
import { unitInfoFromAnnotation } from "./data";
import SectionCellVue from "../shared/SectionCell.vue";
import IconVue from "@/components/icon/index.vue";
import AlertVue from "@/components/shared/alert/index.vue";
import { useInfoPanel } from "../infoPanelControlls";
import { IAnnotation } from "@/core/map/overlayDrawing/annotations/annotation";

const props = defineProps<{ data: { annotation: IAnnotation, allowFrom: boolean, allowTo: boolean }, delegate: any }>()
const emit = defineEmits(['pop', 'push'])
const { setFrom, setTo } = useInfoPanel()

const shareIcon = ref(null) as Ref<HTMLElement>

const mapDelegate = inject('mapDelegate') as ShallowRef<IMapDelegate>

const unitInfo = computed(() => unitInfoFromAnnotation(props.data.annotation, props.data.allowFrom, props.data.allowTo))

const onClose = () => {
  if (mapDelegate.value.selectedAnnotation.value === props.data.annotation) {
    mapDelegate.value.deselectAnnotation(props.data.annotation)
  } else {
    emit('pop')
  }
}

onMounted(() => {
  if (mapDelegate.value.selectedAnnotation.value !== props.data.annotation) {
    mapDelegate.value.selectAnnotation({ annotation: props.data.annotation, focusVariant: FocusVariant.safeArea })
  }
})

watchEffect(() => {
  console.log('unitInfo', toRaw(unitInfo.value));
})

function onSetTo() {
  mapDelegate.value.deselectAnnotation(props.data.annotation)
  setTo(props.data.annotation)
}

function onSetFrom() {
  mapDelegate.value.deselectAnnotation(props.data.annotation)
  setFrom(props.data.annotation)
}

function onOpenPlan() {
  const target = unitInfo.value.fromToPlan.planTarget
  if (target) {
    if (target.levels.length > 0 || true) {
      mapDelegate.value.focusOnBuilding(target)
    } else {
      alert("У этого здания нет планировки")
    }
  }
}


const shareTooltipParams = ref(null) as Ref<{ top: number, left: number }>
function onShareClick() {
  navigator.clipboard.writeText(`https://dev.polymap.ru/spbstu?annotation=${props.data.annotation.id}`)
  const rect = shareIcon.value.getBoundingClientRect()
  shareTooltipParams.value = {
    top: rect.top,
    left: rect.left + rect.width / 2
  }

  setTimeout(() => {
    shareTooltipParams.value = null
  }, 1000)
}

</script>

<style lang="scss" scoped>
@import '../style.scss';
@import '@/styles/variables.scss';

.title {
  font-size: 1.7em;
  line-height: 1;
  font-weight: bold;
  word-wrap: break-word;
  margin-top: 0px;
  margin-bottom: 10px;

  @media (min-width: $phone-width) {
    margin-top: 3px;
  }
}

.separator {
  margin: 10px -10px 10px 32px;
}

.controll-image {
  fill: var(--accent-color);

  min-width: 22px;
  min-height: 22px;
  max-width: 22px;
  max-height: 22px;
}
</style>
