<template>
  <div>
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="show" class="tooltip" :style="tooltipStyle" ref="tooltip"> {{ props.text }} </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useElementBounding } from '@vueuse/core';
import { computed, ref, Ref } from 'vue';

const props = defineProps<{ show: boolean, text: string, pos: { x: number, y: number } }>()
const tooltip = ref(null) as Ref<HTMLElement>

const { width } = useElementBounding(tooltip)

const tooltipStyle = computed(() => {

  console.log('width', width.value);

  return {
    left: props.pos.x - width.value / 2 + 'px',
    top: props.pos.y - 40 + 'px'
  }
})

</script>

<style lang="scss" scoped>
.tooltip {
  position: absolute;

  background-color: white;
  padding: 5px 10px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);

  z-index: 100;

  transition: all 0.1s ease-out;
  transition-property: transform, opacity;

}
</style>

<style lang="scss">
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: translateY(20px)
}
</style>
