<template>
  <div class="page card" ref="page" :style="{transform: `translateY(${clampedOffsetY}px)`}">
    <div class="header">
      <div class="line"></div>
      <h1>Title</h1>
    </div>
    <hr>
    <div class="content-container">
      <div class="scroll" ref="scrollElement">
        <div class="content flex">
          <h2>{{scrollPage}}</h2>
          <div class="block">
            <p>Буквы</p>
            <p>Буквы</p>
            <p>Буквы</p>
            <p>Буквы</p>
            <p>Буквы</p>
          </div>
          <h2>Описание2</h2>
          <div class="block">
            <p>Буквы</p>
            <p>Буквы</p>
            <p>Буквы</p>
            <p>Буквы</p>
            <p>Буквы</p>
          </div>
          <h2>Описание2</h2>
          <div class="block">
            <p>Буквы</p>
            <p>Буквы</p>
            <p>Буквы</p>
            <p>Буквы</p>
            <p>Буквы</p>
          </div>
          <h2>Описание2</h2>
          <div class="block">
            <p>Буквы</p>
            <p>Буквы</p>
            <p>Буквы</p>
            <p>Буквы</p>
            <p>Буквы</p>
          </div>
          <h2>Описание2</h2>
          <div class="block">
            <p>Буквы</p>
            <p>Буквы</p>
            <p>Буквы</p>
            <p>Буквы</p>
            <p>Буквы</p>
          </div>
          <h2>Описание2</h2>
          <div class="block">
            <p>Буквы</p>
            <p>Буквы</p>
            <p>Буквы</p>
            <p>Буквы</p>
            <p>Буквы</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { SpringEasing } from '@/core/animator/springAnimation';
import { Easing, Group, Tween } from '@tweenjs/tween.js'
import { useScroll } from '@vueuse/core';
import { useDrag, useGesture } from '@vueuse/gesture'
import { ref, computed, watchEffect } from 'vue';

const page = ref(null)
const scrollElement = ref(null)
const offsetY = ref(0)
const group = new Group()
const scrollPage = ref(false)

const clampedOffsetY = computed(() => {
  const h = document.querySelector('.abs-full')?.clientHeight
  return Math.max(Math.min(offsetY.value, h - 120), 0)
})

const endAnimation = (y) => {
  const h = document.querySelector('.abs-full').clientHeight

  let target = 0;
  if (h / 2 - y * 200 > offsetY.value) {
    target = 0
  } else {
    target = h - 120
  }

  const t = new Tween({ y: offsetY.value }, group)
    .to({ y: target }, 200)
    .easing(Easing.Quadratic.Out)
    .onUpdate(({ y }) => {
      offsetY.value = y
    })
    .onComplete(() => {
      group.remove(t)
    })
    .start()
}

const moveTo = (dy) => {
  offsetY.value += dy
}

const pageDrag = ({ delta: [dx, dy] }) => {
  moveTo(dy)
}
const pageDragEnd = ({ velocities: [x, y] }) => {
  endAnimation(y)
}

let isBegin = false
const dragHandler = ({ event, delta: [dx, dy] }) => {
  if (isBegin) {
    if (dy != 0) {
      isBegin = false
      scrollPage.value = Math.abs(scrollElement.value.scrollTop) < 5 && dy > 0
    }
  }

  if (scrollPage.value) {
    moveTo(dy)
    event.preventDefault()
  }

  event.stopPropagation()
}

const endDragHandler = ({ velocities: [x, y] }) => {
  if (scrollPage.value) {
    scrollPage.value = false
    endAnimation(y)
  }
}

const dragStartHandler = () => {
  isBegin = true
}

useGesture({
  onDrag: pageDrag,
  onDragEnd: pageDragEnd,
}, {
  domTarget: page,
  eventOptions: {
    passive: false
  }
})

useGesture({
  onDrag: dragHandler,
  onDragStart: dragStartHandler,
  onDragEnd: endDragHandler
}, {
  domTarget: scrollElement,
  eventOptions: {
    passive: false
  }
})


const update = () => {
  requestAnimationFrame(update)
  group.update()
}
update()

</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page {
  margin: 10px;
  height: 3000px;
  padding: 10px;
  will-change: transform;

  @media (max-width: $phone-width) {
    margin: 0px;
  }

  .line {
    width: 50px;
    margin: -5px auto 0 auto;
    height: 4px;
    border-radius: 2px;
    background-color: $gray4;
  }

  hr {
    margin: 10px 0;
  }

  .content-container {
    max-height: calc(100vh - 120px);

    .scroll {
      overflow-y: scroll;
      max-height: calc(100vh - 120px);

      &::-webkit-scrollbar {
        display: none;
      }

      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  }



  .content {
    flex-direction: column;
  }
}



.block {
  border-radius: 10px;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #ffffff;
}
</style>
