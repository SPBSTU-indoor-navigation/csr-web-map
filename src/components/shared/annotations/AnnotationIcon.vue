<template>
  <div class="icon-background">
    <img :src="src" v-if="src" class="icon">
  </div>
</template>

<script setup lang="ts">
import { IAnnotationInfo } from '@/components/map/annotations/annotationInfo';
import { ref } from 'vue';

const props = defineProps<{ annotation: IAnnotationInfo }>()

const src = ref('')

async function waitImage() {
  while (!props.annotation.sprite?.src) {
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  src.value = props.annotation.sprite.src
}

if (props.annotation.sprite)
  waitImage()

</script>

<style lang="scss" scoped>
.icon-background {
  width: 100%;
  height: 100%;
}

.icon {
  width: 55%;
  height: 55%;
  transform: translate(40%, 40%);
  object-fit: contain;
}
</style>
