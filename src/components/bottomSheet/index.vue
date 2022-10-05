<template>
  <div class="page-container non-block">
    <div class="page card" ref="page" :style="{transform: `translateY(${offsetY}px)`}">
      <div class="header">
        <div class="line"></div>
        <slot name="header"></slot>
      </div>
      <hr>
      <div class="content-container" ref="scrollElement" :style="{opacity: contentOpacity}">
        <div class="content">
          <slot name="content"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from '@vue/reactivity';
import { useMediaQuery } from '@vueuse/core';
import { useGesture } from '@vueuse/gesture';
import { phoneWidth } from '@/styles/variables.ts';

import { useBottomSheetGesture } from './useBottomSheetGesture'
import { watch, watchEffect } from 'vue';

const page = ref(null)
const scrollElement = ref(null)
const isPhone = useMediaQuery(`(max-width: ${phoneWidth})`)

const { offsetY, contentOpacity, progress, reset } = useBottomSheetGesture(page, scrollElement, isPhone)

watch(isPhone, (isPhone) => {
  if (!isPhone) {
    reset()
  }
})


</script>

<style lang="scss">
@import '@/styles/variables.scss';

.page-container {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  will-change: transform;
  margin-top: 10px;

  @media (max-width: $phone-width) {
    margin-top: 30px;
  }
}

.page {
  margin: 0 10px;
  height: calc(100vh - 20px);
  padding: 0 10px;
  will-change: transform;

  display: flex;
  flex-direction: column;

  @media (max-width: $phone-width) {
    margin: 0px;
    padding-bottom: 50px;
    height: calc(100vh - 30px);
  }

  .header {
    padding-top: 2px;

    .line {
      position: fixed;
      left: calc(50% - 20px);
      top: 2px;
      width: 40px;
      height: 4px;
      border-radius: 2px;
      background-color: $gray5;
    }
  }

  .content-container {
    overflow-y: scroll;

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
