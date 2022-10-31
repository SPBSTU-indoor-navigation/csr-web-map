<template>
  <div class="line">
    <p class="mini-title">{{ title }}</p>
    <a v-if="type == 'email'" class="link" :href="`mailto: ${content}`">{{ content }}</a>
    <a v-else-if="type == 'phone'" class="link"
      :href="`tel:${content.replaceAll(new RegExp('(\\()|(\\))|(-)|( )', 'g'), '')}`">{{ content
      }}</a>
    <a v-else-if="type == 'url'" class="link" :href="content" target="_blank" rel="noopener noreferrer">{{
        content
    }}</a>
    <p v-else style="white-space: pre-line">{{ content }}</p>
  </div>
</template>


<script setup lang="ts">

const props = defineProps<{ title: string, content: string, type?: string }>()

</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

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
