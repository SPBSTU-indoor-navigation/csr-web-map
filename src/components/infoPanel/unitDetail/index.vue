<template>
  <BottomSheetPageVue :showHeader="true" :cloaseble="true" @close="onClose">
    <template #header>
      <h1 class="title">{{unitInfo.title}}</h1>
    </template>

    <template #content>
      <RouteButtonsVue :fromToPlan="unitInfo.fromToPlan" v-if="unitInfo.fromToPlan" />
      <DetailVue :detail="unitInfo.detail" v-if="unitInfo.detail" />
      <div class="info-panel-section share-section">
        <SectionCellVue title="Поделиться" :clickable="true">
          <template #right>
            <IconVue img="share" class="controll-image" />
          </template>
        </SectionCellVue>
      </div>

      <div class="info-panel-section share-section">
        <SectionCellVue title="Добавить в Закладки" :clickable="true">
          <template #left>
            <IconVue img="star.fill" class="controll-image" />
          </template>
        </SectionCellVue>
        <hr class="separator" />
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
import RouteDetailVue from "@/components/infoPanel/routeDetail/index.vue";
import DetailVue from './Detail.vue'
import RouteButtonsVue from './RouteButtons.vue'
import { FocusVariant, IMapDelegate } from "@/components/map/mapControlls";
import { computed } from "@vue/reactivity";
import { inject, onMounted, ref, ShallowRef, toRaw, watchEffect } from "vue";
import { unitInfoFromAnnotation } from "./data";
import SectionCellVue from "../shared/SectionCell.vue";



import IconVue from "@/components/icon/index.vue";

const props = defineProps(['data'])
const emit = defineEmits(['pop', 'push'])

const mapDelegate = inject('mapDelegate') as ShallowRef<IMapDelegate>

const unitInfo = computed(() => unitInfoFromAnnotation(props.data.annotation))

function createRoute() {
  emit('push', { component: RouteDetailVue })
}

const onClose = () => {
  if (mapDelegate.value.selectedAnnotation.value === props.data.annotation) {
    mapDelegate.value.deselectAnnotation(props.data.annotation)
  } else {
    emit('pop')
  }
}

onMounted(() => {
  if (mapDelegate.value.selectedAnnotation.value !== props.data.annotation) {
    mapDelegate.value.selectAnnotation(props.data.annotation, FocusVariant.none)
  }
})

watchEffect(() => {
  console.log('unitInfo', toRaw(unitInfo.value));

})


</script>

<style lang="scss" scoped>
@import '../style.scss';
@import '@/styles/variables.scss';

.share-section {
  margin-top: 15px;
}

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
  margin: 10px 0;
  height: 1px;
}

.controll-image {
  fill: var(--accent-color);

  min-width: 22px;
  min-height: 22px;
  max-width: 22px;
  max-height: 22px;
}
</style>
