<template>
  <BottomSheetPageVue :showHeader="true" :cloaseble="true" @close="onClose">
    <template #header>
      <h1>{{props.data.annotation.data.properties.name.ru}}</h1>
      <button @click="emit('push', {component: 'occupantDetail'})">next</button>
    </template>

    <template #content>
      <h2></h2>
      <div class="block">
        <p>Буквы</p>
        <p>Буквы</p>
        <p>Буквы</p>
        <p>Буквы</p>
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
import { toRaw, watchEffect } from "vue";

type Emits = {
  (e: 'pop'): void
  (e: 'push', value: {
    component: string,
  }): void
}

const props = defineProps(['title', 'data'])

const emit = defineEmits<Emits>()

const onClose = () => {
  emit('pop')
}

watchEffect(() => {
  console.log(props.data)
})

</script>

<style lang="scss" scoped>
@import '../style.scss';
</style>
