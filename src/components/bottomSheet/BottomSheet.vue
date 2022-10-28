<template>
  <div class="container non-block" :class="fullHeight ? 'fullHeight' : ''"
    :style="{backgroundColor: `rgba(0,0,0,${backgroundOpacity})`, pointerEvents }">
    <Transition :name="animType" @before-leave="onBeforeLeave">
      <component :is="currentPage.component" :key="currentPage.key" :data="currentPage.data" :page="currentPage.key"
        :delegate="delegate" @pop="onPop" @push="onPush" @move="onMove" @pointerdown="onPointerDown"
        :class="State[state]" ref="pageContainer" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, markRaw, shallowRef } from '@vue/reactivity';
import { provide, watchEffect } from 'vue'
import { watch, } from 'vue';
import { State } from './useBottomSheetGesture';
import { clamp, lerp, nextFrame } from '@/core/shared/utils';
import { useElementSize, useMediaQuery } from '@vueuse/core';
import { middleOffset, phoneWidth } from '@/styles/variables';
import { Easing, Group, Tween } from '@tweenjs/tween.js';
import { IInfoPanelDelegate } from '../infoPanel/infoPanelControlls';

const { delegate, initPage } = defineProps<{
  delegate: IInfoPanelDelegate,
  initPage: any
}>()

const emit = defineEmits<{
  (e: 'stateChange', state: State): void,
}>()

const pages = ref([{
  component: markRaw(initPage.component),
  data: initPage.data,
  key: 1
}])

const tweenGroup = new Group()

const pageContainer = ref(null)
const state = ref(State.small)
const pop = ref(false)
const pushPopProrgress = ref(0)
const offsetY = ref(0)
const isPhone = useMediaQuery(`(max-width: ${phoneWidth})`)
const { height } = useElementSize(pageContainer)


delegate.push = (params) => onPush(params)
delegate.pop = () => onPop()
delegate.pages = () => pages.value
delegate.popTo = (index) => onPopTo(index)

provide('state', state)

const animType = computed(() => pop.value ? 'pop' : 'push')
const fullHeight = computed(() => pages.value.length != 0)
const currentPage = computed(() => pages.value[pages.value.length - 1])
const backgroundOpacity = computed(() => {
  if (!isPhone.value) return 0
  const progress = clamp(1 - offsetY.value / (height.value - middleOffset), 0, 1)
  return lerp(0, 0.3, Math.max(pushPopProrgress.value, progress))
})
const pointerEvents = computed(() => (1 - offsetY.value / (height.value - middleOffset)) < 0.1 ? 'none' : 'auto')

function onBeforeLeave(el: HTMLElement) {
  el.classList.add(`to-${State[state.value]}`)
}

function onPointerDown({ target: { className } }) {
  if (!(className.includes && className.includes('prevent-pointer-event-blur'))) {
    // @ts-ignore
    document.activeElement.blur()
  }
}

function onMove(value: number) {
  offsetY.value = value
}

watch(() => pages.value.length, (current, last) => {
  pop.value = current < last
})

watchEffect(() => {
  emit('stateChange', state.value)
})

function animPushPopProrgress() {
  pushPopProrgress.value = 1

  nextFrame(() => {
    new Tween({ progress: 1 }, tweenGroup)
      .to({ progress: 0 }, 300)
      .easing(Easing.Quartic.Out)
      .onUpdate((obj) => pushPopProrgress.value = obj.progress)
      .onComplete(() => pushPopProrgress.value = -1)
      .start()
  })
}

const onPop = () => {
  if (pages.value.length > 1) {
    pages.value.pop()

    if (state.value == State.big) {
      animPushPopProrgress()
      state.value = State.middle
    }
  }
}

const onPopTo = (index: number) => {
  if (pages.value.length > index) {
    pages.value = pages.value.slice(0, index + 1)

    if (state.value == State.big) {
      animPushPopProrgress()
      state.value = State.middle
    }
  }
}

const onPush = (params: { component: any, data: any, collapse?: boolean }) => {
  pages.value.push({
    component: markRaw(params.component),
    data: params.data,
    key: pages.value.length + 1
  })

  if (params.collapse === true || params.collapse === undefined) {
    if (state.value == State.big) {
      animPushPopProrgress()
    }

    state.value = State.middle
  }
}

const update = () => {
  requestAnimationFrame(update)
  tweenGroup.update()
}
update()
</script>

<style lang="scss">
@import '@/styles/variables.scss';

/*#region Animation*/
$duration: 0.3s;
$page-color: rgb(239, 239, 239);

.pop-enter-active,
.pop-leave-active {
  transition: all $duration ease-in-out;

  @media (max-width: $phone-width) {
    transition: all $duration ease-in;
  }
}

.push-enter-active,
.push-leave-active {
  transition: all $duration ease-in-out;

  @media (max-width: $phone-width) {
    transition: all $duration ease-out;
  }
}

.pop-leave-active,
.push-enter-active {
  z-index: 5;
}

.push-leave-active,
.pop-enter-active {
  z-index: 1;
}

.pop-enter-from,
.push-leave-to {
  transform: translateX(0) scale(0.98);

  @media (max-width: $phone-width) {
    transform: translateY(0);

    &.big {
      &.to-middle {
        transform: translateY(calc(100% - $middleOffset));
      }

      &.to-small {
        transform: translateY(calc(100% - $smallOffset));
      }
    }

    &.middle.to-small {
      transform: translateY(calc(100% - $middleOffset - $smallOffset));
    }
  }

}

.pop-leave-to,
.push-enter-from {
  transform: translateX(-100%);

  @media (max-width: $phone-width) {
    transform: translateY(100%);

    &.small {
      transform: translateY($smallOffset);
    }

    &.middle {
      transform: translateY($middleOffset);
    }
  }
}

.pop-leave-active {
  .page {
    background-color: $page-color;
  }
}

.push-enter-active {
  animation-duration: calc($duration + 1s);

  .page {
    animation: pop-opacity calc($duration + 1s);

    @keyframes pop-opacity {
      0% {
        background-color: $page-color;
      }

      30% {
        background-color: $page-color;
      }

      100% {
        background-color: rgba(248, 248, 248, 0.75);
      }
    }
  }
}

/*#endregion Animation*/

.container {
  width: 400px;
  height: 100%;
  touch-action: none;
  overflow: hidden;
  position: relative;

  @media (max-width: 1200px) {
    width: 330px;
  }

  @media (max-width: $phone-width) {
    width: 100%;
  }

  >input {
    position: absolute;
    top: 0;
    left: 40px;
    z-index: 3;
  }

  >button {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 3;
  }

  &.fullHeight {
    height: 100%;
  }
}
</style>
