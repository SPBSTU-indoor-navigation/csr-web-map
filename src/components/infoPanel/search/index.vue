<template>
  <BottomSheetPageVue :showHeader="true" :cloaseble="false">
    <template #header>
      <SearchBarVue class="search-bar" :focusDelay="focusDelay" @focus="onFocus" v-model:searchText="searchText" />
    </template>

    <template #content>
      <h2>{{searchText}}</h2>
      <button @click="select">Selct</button>
      <button @click="state=2">Selct</button>
      <div class="info-panel-group">
        <p>{{page}}v</p>
        <p>Буквы</p>
        <p>Буквы</p>
        <p>Буквы</p>
        <p>Буквы</p>
      </div>
    </template>
  </BottomSheetPageVue>
</template>

<script setup lang="ts">
import BottomSheetPageVue from "@/components/bottomSheet/BottomSheetPage.vue";
import { usePageStore } from "@/components/bottomSheet/usePageStore";
import { State } from "@/components/bottomSheet/useBottomSheetGesture";
import SearchBarVue from "@/components/shared/searchBar/index.vue";
import { computed, ref } from "@vue/reactivity";
import { inject, Ref } from "vue";

const { delegate: { selectOccupant }, page } = defineProps(['delegate', 'page'])
const emit = defineEmits(['push', 'pop'])
const state: Ref = inject('state')

const searchText = usePageStore(`search_${page.value}`, 'searchText', '')

const focusDelay = computed(() => state.value == State.big ? 0 : 500)

function select() {
  selectOccupant();
}

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
