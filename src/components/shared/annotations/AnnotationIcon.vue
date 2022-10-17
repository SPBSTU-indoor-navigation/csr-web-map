<template>
  <div class="attraction-icon-container attraction-stroke" v-if="props.annotation.annotationType == 'attraction'">
    <img :src="src" v-if="src" class="attraction-icon" />
    <div class="attraction-background attraction-fill" ref="attraction" v-else>
      <p :style="{ fontSize }">{{props.annotation.additionalTitle.bestLocalizedValue}}</p>
    </div>
  </div>
  <div class="occupant-background background-color-occupant-default"
    v-else-if="props.annotation.annotationType == 'occupant'" :class="props.annotation.backgroundClass">
    <img :src="src" v-if="src" class="icon">
  </div>
  <div class="amenity-background background-color-occupant-default" v-else :class="props.annotation.backgroundClass">
    <img :src="src" v-if="src" class="icon">
  </div>
</template>

<script setup lang="ts">
import { IAnnotationInfo } from '@/components/map/annotations/annotationInfo';
import { useElementSize } from '@vueuse/core';
import { computed, ref, watchEffect } from 'vue';

const props = defineProps<{ annotation: IAnnotationInfo }>()

const src = ref('')
const attraction = ref(null)
let loading = false

const { height } = useElementSize(attraction)

const fontSize = computed(() => {
  return `${height.value / 2}px`
})


async function waitImage() {
  loading = true
  while (!props.annotation.sprite?.src) {
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  src.value = props.annotation.sprite.src
  loading = false
}

watchEffect(() => {
  src.value = ''
  if (props.annotation.sprite && !loading) {
    waitImage()
  }
})

</script>

<style lang="scss" scoped>
.attraction-icon-container,
.occupant-background,
.amenity-background {
  width: 100%;
  height: 100%;
}

.attraction-icon,
.attraction-background {
  width: calc(100% - 4px);
  height: calc(100% - 4px);
  margin: 1px;
}

.attraction-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
}

.occupant-background {
  border-radius: 50%;
}

.amenity-background {
  border-radius: 25%;
}

.attraction-icon {
  object-fit: contain;
  border-radius: 50%;
}

.attraction-background {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;

  p {
    font-weight: 700;
    color: white;
  }
}

.icon {
  width: 55%;
  height: 55%;
  transform: translate(40%, 40%);
  object-fit: contain;
}
</style>
