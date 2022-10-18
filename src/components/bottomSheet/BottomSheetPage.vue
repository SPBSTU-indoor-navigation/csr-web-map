<template>
  <div class="page-container non-block" ref="pageContainer">
    <div class="page card" ref="page" :style="{transform: `translateY(${offsetY}px)`}">
      <div class="header" v-if="showHeader" :class="cloaseble ? 'cloaseble' : ''">
        <div class="line"></div>
        <CloseButtonVue v-if="cloaseble" class="close" @close="$emit('close')" />
        <slot name="header"></slot>
      </div>
      <hr v-if="showHeader" class="separator" :style="{opacity: hrOpacity}">
      <div class="content-container" ref="scrollElement" :style="{opacity: contentOpacity}" @scroll="onScroll">
        <div class="content">
          <slot name="content"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from '@vue/reactivity';
import { useElementSize, useMediaQuery } from '@vueuse/core';
import { phoneWidth } from '@/styles/variables.ts';
import CloseButtonVue from '../shared/closeButton.vue';

import { useBottomSheetGesture } from './useBottomSheetGesture'
import { watch, inject, watchEffect } from 'vue';
import { clamp } from '@/core/shared/utils';

const page = ref(null)
const scrollElement = ref(null)
const pageContainer = ref(null)
const scrollTop = ref(0)
const isPhone = useMediaQuery(`(max-width: ${phoneWidth})`)
const { height } = useElementSize(pageContainer)

const { cloaseble, showHeader } = defineProps({
  cloaseble: {
    type: Boolean,
    required: false,
    default: true
  },
  showHeader: {
    type: Boolean,
    required: false,
    default: true
  }
})

const emit = defineEmits(['close', 'move', 'progress'])

const state = inject('state')
const { contentOpacity, offsetY, progress, reset } = useBottomSheetGesture(page, scrollElement, height, isPhone, state)
const hrOpacity = computed(() => clamp(scrollTop.value / 20, 0, 1) * contentOpacity.value)

watch(offsetY, (val) => emit('move', val))
watch(progress, val => emit('progress', val))

watch(isPhone, (isPhone) => {
  if (!isPhone) {
    reset()
  }
})

function onScroll({ target: { scrollTop: y } }) {
  scrollTop.value = y;
}

</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page-container {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  will-change: transform;
  margin-top: 20px;

  @supports(margin-bottom: max(0px)) {
    margin-bottom: max(10px, env(safe-area-inset-bottom));
  }

  @media (max-width: $phone-width) {
    margin-top: 30px;
    margin-bottom: 0;
  }
}

.page {
  margin: 0 10px;
  height: 100%;
  will-change: transform;

  .content-container,
  .header {
    padding: 0 12px;
  }


  display: flex;
  flex-direction: column;

  @media (max-width: $phone-width) {
    margin: 0px;
    padding-bottom: 50px;
  }

  .header {
    padding-top: 13px;
    position: relative;
    min-height: 42.5px;

    &.cloaseble {
      padding-right: 30px;
    }

    .line {
      position: fixed;
      left: calc(50% - 20px);
      top: 5px;
      width: 40px;
      height: 5px;
      border-radius: 2.5px;
      background-color: $gray2;
    }

    @media (min-width: $phone-width) {
      padding-top: 5px;

      .line {
        background-color: #0000;
      }
    }

    .close {
      position: absolute;
      top: 15px;
      right: 12px;

      @media (min-width: $phone-width) {
        top: 10px;
      }
    }
  }

  .content-container {
    overflow-y: scroll;
    padding-bottom: 12px;

    &::-webkit-scrollbar {
      display: none;
    }

    -ms-overflow-style: none;
    scrollbar-width: none;

    .content {
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
