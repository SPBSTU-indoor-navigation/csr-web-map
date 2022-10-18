<template>
  <div>
    <div v-for="group, i in categories">
      <div>
        <p class="section-title secondary-label" :class="i == 0 ? '' : 'space'">{{group.title}}</p>
        <hr class="separator small" />
      </div>

      <div v-for="info in group.annotations">
        <AnnotationInfoLineVue :info="info" @click="$emit('select', info)" class="clickable-line-button" />
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

defineEmits<{
  select: (info: IAnnotationInfo) => void
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

</script>


<style lang="scss" scoped>
.section-title.space {
  margin-top: 30px;
}

.clickable-line-button {
  cursor: pointer;

  &:active {
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -5px;
      right: -5px;
      bottom: 0;
      background-color: #86868624;
      border-radius: 10px;
      z-index: -1;
    }
  }
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
