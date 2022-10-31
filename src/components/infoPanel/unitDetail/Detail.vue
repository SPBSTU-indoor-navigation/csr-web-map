<template>
  <DetailInfoVue title="Информация" :lines="lines" />
</template>

<script setup lang="ts">
import { computed } from '@vue/reactivity';
import { Detail } from './data'

import DetailInfoVue from '../shared/DetailInfo.vue'

const props = defineProps<{ detail: Detail }>()

const lines = computed(() => {
  return [
    { title: 'Телефон', content: props.detail.phone, type: 'phone' },
    { title: 'Электронная почта', content: props.detail.email, type: 'email' },
    { title: 'Вебсайт', content: props.detail.website, type: 'url' },
    { title: 'Адрес', content: props.detail.address, type: '' }
  ].filter(t => t.content != null)
})

</script>
