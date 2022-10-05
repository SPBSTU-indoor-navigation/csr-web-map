<template>
  <div class="page-container non-block" ref="pageContainer">
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
import { useElementSize, useMediaQuery } from '@vueuse/core';
import { phoneWidth } from '@/styles/variables.ts';

import { useBottomSheetGesture } from './useBottomSheetGesture'
import { watch } from 'vue';

const page = ref(null)
const scrollElement = ref(null)
const pageContainer = ref(null)
const isPhone = useMediaQuery(`(max-width: ${phoneWidth})`)
const { height } = useElementSize(pageContainer)

const { offsetY, contentOpacity, progress, reset } = useBottomSheetGesture(page, scrollElement, height, isPhone)

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
    padding-top: 3px;

    .line {
      position: fixed;
      left: calc(50% - 20px);
      top: 3px;
      width: 40px;
      height: 6px;
      border-radius: 3px;
      background-color: $gray;
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
