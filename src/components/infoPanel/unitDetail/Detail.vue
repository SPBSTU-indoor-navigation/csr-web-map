<template>
  <div class="detail-info">
    <h2 class="info-panel-section-title">Информация</h2>
    <div class="info-panel-section">
      <div class="line" v-for="line, i in lines">
        <p class="mini-title">{{line.title}}</p>
        <a v-if="line.type == 'email'" class="link" :href="`mailto: ${line.content}`">{{line.content}}</a>
        <a v-else-if="line.type == 'phone'" class="link"
          :href="`tel:${line.content.replaceAll(new RegExp('(\\()|(\\))|(-)|( )', 'g'), '')}`">{{line.content}}</a>
        <a v-else-if="line.type == 'url'" class="link" :href="line.content" target="_blank"
          rel="noopener noreferrer">{{line.content}}</a>
        <p v-else style="white-space: pre-line">{{line.content}}</p>
        <hr v-if="i < lines.length - 1" class="separator small">
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from '@vue/reactivity';
import { Detail } from './data'

const props = defineProps<{ detail: Detail }>()

const lines = computed(() => {
  return [
    { title: 'Телефон', content: props.detail.phone, type: 'phone' },
    { title: 'Электронная почта', content: props.detail.email, type: 'email' },
    { title: 'Вебсайт', content: props.detail.website, type: 'url' },
    { title: 'Адрес', content: props.detail.address }
  ].filter(t => t.content != null)
})

</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.detail-info {
  margin-top: 15px;
}

.mini-title {
  font-weight: 600;
  font-size: 0.8em;
  color: $secondary-label;
}

.separator {
  margin: 10px -10px 10px 0;
}

.line {
  word-break: break-all;
}
</style>
