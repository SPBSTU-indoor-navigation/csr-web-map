<template>
  <BottomSheetPageVue @close="$emit('pop')">
    <template #header>
      <h1>Route</h1>
    </template>

    <template #content>
      <p>11</p>
    </template>
  </BottomSheetPageVue>
</template>

<script setup lang="ts">
import BottomSheetPageVue from "@/components/bottomSheet/BottomSheetPage.vue";

defineProps(['delegate', 'data'])
</script>
