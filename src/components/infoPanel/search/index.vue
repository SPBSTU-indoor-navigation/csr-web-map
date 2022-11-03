<template>
  <BottomSheetPageVue :showHeader="true" :cloaseble="false" class="search-page">
    <template #header>
      <SearchBarVue class="search-bar" :focusDelay="focusDelay" @focus="onFocus" v-model:searchText="searchText" />
    </template>

    <template #content>
      <AnnotationInfoListVue :annotations="annotations" :search-text="searchText" @select="onSelectAnnotation" />
    </template>
  </BottomSheetPageVue>
</template>

<script setup lang="ts">
import BottomSheetPageVue from "@/components/bottomSheet/BottomSheetPage.vue";
import { usePageStore } from "@/components/bottomSheet/usePageStore";
import { State } from "@/components/bottomSheet/useBottomSheetGesture";
import SearchBarVue from "@/components/shared/searchBar/index.vue";
import { computed, ref, ShallowRef, shallowRef } from "@vue/reactivity";
import { inject, Ref, watchEffect } from "vue";
import { FocusVariant, IMapDelegate } from "@/components/map/mapControlls";
import { IAnnotationInfo } from "@/components/map/annotations/annotationInfo";
import AnnotationInfoListVue from "@/components/shared/annotations/AnnotationInfoList.vue";


const props = defineProps(['delegate', 'page'])
const state = inject<Ref<State>>('state')

const mapDelegate = inject<ShallowRef<IMapDelegate>>('mapDelegate')
const annotations: ShallowRef<IAnnotationInfo[]> = shallowRef([]);

const { searchText } = usePageStore(`search_${props.page}`, () => ({ searchText: ref('') }))

const focusDelay = computed(() => state.value == State.big ? 0 : 500)

watchEffect(() => {
  if (!mapDelegate.value.venue.value) return
  annotations.value = mapDelegate.value.venue.value.annotations.sort((a, b) => a.title.localCompare(b.title))
})

function onFocus() {
  state.value = State.big;
}

function onSelectAnnotation(info: IAnnotationInfo) {
  console.log(info);

  mapDelegate.value.selectAnnotation({ annotation: info.annotation, focusVariant: FocusVariant.center })
}
</script>

<style lang="scss">
@import "@/styles/variables.scss";
@import '../style.scss';

.modal {
  position: absolute;
  z-index: 1000;
  top: 47px;
  height: 43px;
  width: 100%;
  background-color: rgba(208, 0, 255, 0.143);

  input {
    // width: 100%;
    height: 100%;
    border: none;
    background-color: transparent;
    font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu;
    font-weight: 400;
    font-size: medium;
    margin: 0 0 0 53px;
  }
}

.search-bar {
  margin: 6px 0px 15px 0px;

  border-radius: 10px;
}

.search-page {
  .header {
    min-height: auto !important;
  }
}
</style>
