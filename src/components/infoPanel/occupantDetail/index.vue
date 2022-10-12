<template>
  <BottomSheetPageVue :showHeader="true" :cloaseble="true" @close="onClose">
    <template #header>
      <h1>{{props.data.annotation.data.properties.name.ru}}</h1>
      <button @click="createRoute">next</button>
    </template>

    <template #content>
      <h2></h2>
      <div class="block">
        <p>Буквы</p>
        <p>Буквы</p>
        <input type="range" min="0" max="100" v-model="sliderValue">
        <p>{{sliderValue}}</p>
        <p>Буквы</p>
      </div>
      <button @click="emit('push', {component: 'occupantDetail'})">next</button>
      <h2>Описание2</h2>
      <div class="info-panel-group">
        <p>Буквы</p>
        <p>Буквы</p>
        <p>Буквы</p>
        <p>Буквы</p>
        <p>Буквы</p>
      </div>
      <h2>Описание2</h2>
      <div class="info-panel-group">
        <p>Буквы</p>
        <p>Буквы</p>
        <p>Буквы</p>
        <p>Буквы</p>
        <p>Буквы</p>
      </div>
      <h2>Описание2</h2>
      <div class="info-panel-group">
        <p>Буквы</p>
        <p>Буквы</p>
        <p>Буквы</p>
        <p>Буквы</p>
        <p>Буквы</p>
      </div>
      <h2>Описание2</h2>
      <div class="info-panel-group">
        <p>Буквы</p>
        <p>Буквы</p>
        <p>Буквы</p>
        <p>Буквы</p>
        <p>Буквы</p>
      </div>
      <h2>Описание2</h2>
      <div class="info-panel-group">
        <p>Буквы</p>
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
import RouteDetailVue from "@/components/infoPanel/routeDetail/index.vue";
import { IMapDelegate } from "@/components/map/mapControlls";
import { inject, onMounted, ref, ShallowRef, toRaw, watchEffect } from "vue";

const props = defineProps(['title', 'data'])
const emit = defineEmits(['pop', 'push'])

const mapDelegate = inject('mapDelegate') as ShallowRef<IMapDelegate>

function createRoute() {
  emit('push', { component: RouteDetailVue })
}

const sliderValue = ref(0)

const onClose = () => {
  if (mapDelegate.value.selectedAnnotation.value === props.data.annotation) {
    mapDelegate.value.deselectAnnotation(props.data.annotation)
  } else {
    emit('pop')
  }
}

onMounted(() => {
  if (mapDelegate.value.selectedAnnotation.value !== props.data.annotation) {
    mapDelegate.value.selectAnnotation(props.data.annotation)
  }
})

watchEffect(() => {
  console.log(props.data)
})

</script>

<style lang="scss" scoped>
@import '../style.scss';
</style>
