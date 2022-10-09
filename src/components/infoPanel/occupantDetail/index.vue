<template>
  <BottomSheetPageVue :showHeader="true" :cloaseble="true" @close="onClose">
    <template #header>
      <h1>T{{title}}</h1>
      <button @click="emit('push', {component: 'occupantDetail'})">next</button>
    </template>

    <template #content>
      <h2>Описание2</h2>
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

type Emits = {
  (e: 'pop'): void
  (e: 'push', value: {
    component: string,
  }): void
}

const { title } = defineProps(['title'])

const emit = defineEmits<Emits>()

const onClose = () => {
  emit('pop')
}

</script>

<style lang="scss" scoped>
@import '../style.scss';
</style>
