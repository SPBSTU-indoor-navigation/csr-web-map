<template>

  <div>
    <div v-for="group in categories">
      <p class="section-title secondary-label">{{group.title}}</p>
      <AnnotationInfoLineVue v-for="info in group.annotations" :info="info" />
    </div>
  </div>
</template>


<script setup lang="ts">
import { IAnnotationInfo } from '@/components/map/annotations/annotationInfo';
import { AmenityAnnotation } from '@/components/map/annotations/renders/amenity';
import { AttractionAnnotation } from '@/components/map/annotations/renders/attraction';
import { groupBy } from '@/core/shared/utils';
import { computed, readonly, ShallowRef } from 'vue';
import AnnotationInfoLineVue from './AnnotationInfoLine.vue';

const props = defineProps<{ annotations: IAnnotationInfo[] }>()


const categories = computed(() => {
  const annotations = props.annotations.filter(t => !(t.annotation instanceof AmenityAnnotation))


  const attractions = annotations.filter(t => t.annotation instanceof AttractionAnnotation)
  const other = annotations.filter(t => !(t.annotation instanceof AttractionAnnotation))

  const groupped = groupBy(other, (a) => a.place)


  let res: { title: string, annotations: IAnnotationInfo[] }[] = [{ title: 'Корпуса', annotations: attractions }]
  Array.from(groupped.keys()).forEach((key) => {
    const annotations = groupped.get(key)
    if (annotations) {
      res.push({ title: key?.bestLocalizedValue, annotations })
    }
  })

  return res
})

</script>


<style lang="scss" scoped>
.section-title {
  margin-top: 20px;
  font-size: smaller;
  font-weight: 600;
}
</style>
