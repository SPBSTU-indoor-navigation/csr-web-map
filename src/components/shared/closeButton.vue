<template>
  <button class="close" @click="$emit('close')">
    <XMarkIcon />
  </button>
</template>

<script setup>
import { XMarkIcon } from '@heroicons/vue/24/outline'

</script>


<style lang="scss" scoped>
@import '@/styles/variables.scss';

.close {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  padding: 5px;
  background-color: rgb(0 0 0 / 9%);
  cursor: pointer;

  &:active {
    &>svg {
      opacity: 0.5;
    }
  }

  &>svg {
    stroke-width: 3px;
    color: $secondary-label;
  }
}
</style>
