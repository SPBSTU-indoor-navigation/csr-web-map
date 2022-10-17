<template>
  <div>
    <div v-for="group, i in categories">
      <div>
        <p class="section-title secondary-label" :class="i == 0 ? '' : 'space'">{{group.title}}</p>
        <hr class="separator small" />
      </div>

      <div v-for="info in group.annotations">
        <AnnotationInfoLineVue :info="info" />
        <hr class="separator small info-line" />
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { IAnnotationInfo } from '@/components/map/annotations/annotationInfo';
import { AmenityAnnotation } from '@/components/map/annotations/renders/amenity';
import { AttractionAnnotation } from '@/components/map/annotations/renders/attraction';
import { LocalizedString, localCompare } from '@/core/shared/localizedString';
import { groupBy } from '@/core/shared/utils';
import { computed, readonly, ShallowRef } from 'vue';
import AnnotationInfoLineVue from './AnnotationInfoLine.vue';

const props = defineProps<{
  annotations: IAnnotationInfo[],
  filter?: (info: IAnnotationInfo) => boolean,
  searchText?: string
}>()

const filtered = computed(() => {
  let res = props.annotations
  if (props.filter) res = res.filter(props.filter)
  if (props.searchText) res = res.filter(info => info.title.bestLocalizedValue.toLowerCase().includes(props.searchText.toLowerCase()))

  return res
})

const categories = computed(() => {
  const annotations = filtered.value.filter(t => !(t.annotation instanceof AmenityAnnotation))

  const attractions = annotations.filter(t => t.annotation instanceof AttractionAnnotation)
  const other = annotations.filter(t => !(t.annotation instanceof AttractionAnnotation))

  const groupped = groupBy(other, (a) => a.place)

  let res: { title: string, annotations: IAnnotationInfo[] }[] = []

  if (attractions.length > 0) res.push({ title: 'Здания', annotations: attractions })

  Array.from(groupped.keys()).sort(localCompare).forEach((key) => {
    const annotations = groupped.get(key)
    res.push({ title: key?.bestLocalizedValue, annotations: annotations })
  })

  return res
})


// const list = computed(() => {
//   const annotations = props.annotations.filter(t => !(t.annotation instanceof AmenityAnnotation))

//   const attractions = annotations.filter(t => t.annotation instanceof AttractionAnnotation)
//   const other = annotations.filter(t => !(t.annotation instanceof AttractionAnnotation))

//   const groupped = groupBy(other, (a) => a.place)

//   let res: {
//     id?: number,
//     size: number,
//     title?: string
//     info?: IAnnotationInfo
//   }[] = []

//   res.push({ size: 40, title: 'Здания' })

//   res.push(...attractions.map(info => ({ size: 50, info })))

//   Array.from(groupped.keys()).forEach((key) => {
//     res.push({ size: 40, title: key.bestLocalizedValue })
//     res.push(...groupped.get(key).map(info => ({ size: 50, info })))
//   })

//   res.forEach((t, i) => t.id = i)

//   return res
// })

</script>


<style lang="scss" scoped>
.section-title.space {
  margin-top: 30px;
}

.separator {

  &.info-line {
    margin-left: 50px;
  }
}

.section-title {
  font-size: smaller;
  font-weight: 600;
  margin-bottom: 5px;
}
</style>
