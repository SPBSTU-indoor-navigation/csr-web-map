<template>
  <BottomSheetPageVue @close="$emit('pop')">
    <template #header>
      <h1>Route</h1>
    </template>

    <template #content>
      <p>{{fromUnitInfo.title}}</p>
      <p>{{toUnitInfo.title}}</p>
      <!-- <p>{{props.data.from}}</p> -->
    </template>
  </BottomSheetPageVue>
</template>

<script setup lang="ts">
import BottomSheetPageVue from "@/components/bottomSheet/BottomSheetPage.vue";
import { computed } from "vue";
import { unitInfoFromAnnotation } from "../unitDetail/data";

const props = defineProps(['delegate', 'data'])

const fromUnitInfo = computed(() => unitInfoFromAnnotation(props.data.from))
const toUnitInfo = computed(() => unitInfoFromAnnotation(props.data.to))

</script>
