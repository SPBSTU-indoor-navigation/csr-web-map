<template>
  <div class="info-panel-section-group">
    <h2 class="info-panel-section-title">Информация</h2>
    <div class="info-panel-section">
      <div v-for="line, i in lines">
        <DetailLineVue :title="line.title" :content="line.content" :type="line.type" />
        <hr v-if="i < lines.length - 1" class="separator small" />
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import DetailLineVue from '../shared/DetailLine.vue'
defineProps<{ title: string, lines: { title: string, content: string, type?: string }[] }>()
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.separator {
  margin: 10px -10px 10px 0;
}
</style>
