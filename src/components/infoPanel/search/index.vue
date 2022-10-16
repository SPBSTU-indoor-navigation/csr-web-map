<template>
  <BottomSheetPageVue :showHeader="true" :cloaseble="false">
    <template #header>
      <SearchBarVue class="search-bar" :focusDelay="focusDelay" @focus="onFocus" v-model:searchText="searchText" />
    </template>

    <template #content>
      <AnnotationInfoListVue :annotations="annotations" :search-text="searchText" />
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
import { IMapDelegate } from "@/components/map/mapControlls";
import { IAnnotationInfo } from "@/components/map/annotations/annotationInfo";
import AnnotationInfoListVue from "@/components/shared/annotations/AnnotationInfoList.vue";


const { page } = defineProps(['page'])
const state: Ref = inject('state')
const mapDelegate = inject('mapDelegate') as ShallowRef<IMapDelegate>
const annotations: ShallowRef<IAnnotationInfo[]> = shallowRef([]);

const searchText = usePageStore(`search_${page.value}`, 'searchText', '')

const focusDelay = computed(() => state.value == State.big ? 0 : 500)

watchEffect(() => {
  if (!mapDelegate.value.venue) return
  annotations.value = mapDelegate.value.venue.value.annotations.sort((a, b) => a.title.localCompare(b.title))

  console.log(annotations.value);

})

function onFocus() {
  state.value = 2;
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
</style>
