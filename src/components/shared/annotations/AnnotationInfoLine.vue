<template>
  <div class="flex line">
    <div class="annotation-icon">

    </div>

    <div class="content">
      <p class="label">{{props.info.title.bestLocalizedValue}}</p>
      <p class="secondary-label" v-if="subtitle">{{subtitle}}</p>


    </div>
  </div>
</template>

<script setup lang="ts">
import { IAnnotationInfo } from '@/components/map/annotations/annotationInfo';
import { computed } from 'vue';

const props = defineProps<{ info: IAnnotationInfo }>()

const subtitle = computed(() => {
  if (!props.info.floor && !props.info.place) return null

  if (props.info.floor && props.info.place) return `${props.info.place.bestLocalizedValue} • ${props.info.floor.bestLocalizedValue}`
  if (props.info.floor) return `${props.info.floor.bestLocalizedValue}`
  if (props.info.place) return props.info.place.bestLocalizedValue
})

</script>

<style lang="scss" scoped>
.line {
  height: 55px;
  align-items: center;
  min-width: 0;
  gap: 10px;

  .content {

    min-width: 0;
  }

  .annotation-icon {
    min-width: 40px;
    max-width: 40px;
    border-radius: 20px;
    height: 40px;
    background-color: #007aff;
  }

  p {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .secondary-label {
    margin-top: 2px;
    font-size: smaller;
  }
}
</style>
