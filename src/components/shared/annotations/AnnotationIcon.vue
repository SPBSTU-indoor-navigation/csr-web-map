<template>
  <div class="annotation-icon">
    <!-- <p>{{props.annotation.sprite?.src}}</p> -->
    <!-- <img :src="props.annotation.sprite.src" v-if="props.annotation.sprite"> -->
  </div>
</template>

<script setup lang="ts">
import { IAnnotationInfo } from '@/components/map/annotations/annotationInfo';
import { watch, watchEffect } from 'vue';

const props = defineProps<{ annotation: IAnnotationInfo }>()


console.log(props.annotation.sprite?.src);

watch(() => props.annotation.sprite?.src, (sprite) => {
  console.log('sprite changed', sprite)
})

// setTimeout(() => {
//   console.log('sprite changed', props.annotation.sprite?.src)
// }, 10);

// watch(() => props.annotation.sprite && props.annotation.sprite.src, (sprite) => {
//   console.log('sprite changed', props.annotation.sprite.src)
// })

</script>
