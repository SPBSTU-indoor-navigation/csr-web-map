<template>
  <div class="card" ref="cardHandler" :style="{transform: `translateY(${offsetY}px)`}">
    <div class="line"></div>
    <h1>Title</h1>
    <hr>
    <h2>Описание</h2>
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
    <h2>Горизонтальный скролл</h2>
    <div class="block">
      <div class="scroll">
        <div class="content flex">
          <div class="mincard"></div>
          <div class="mincard"></div>
          <div class="mincard"></div>
          <div class="mincard"></div>
          <div class="mincard"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { SpringEasing } from '@/core/animator/springAnimation';
import { Easing, Group, Tween } from '@tweenjs/tween.js'
import { useDrag, useGesture } from '@vueuse/gesture'
import { ref, computed } from 'vue';


const cardHandler = ref(null)
const offsetY = ref(0)
const group = new Group()

const dragHandler = ({ delta: [x, y] }) => {
  offsetY.value += y
}
const endDragHandler = ({ velocities: [x, y] }) => {
  const h = document.querySelector('.abs-full').clientHeight

  let target = 0;
  if (h / 2 - y * 200 > offsetY.value) {
    target = 0
  } else {
    target = h - 120
  }

  new Tween({ y: offsetY.value }, group)
    .to({ y: target }, 200)
    .easing(Easing.Quadratic.Out)
    .onUpdate(({ y }) => {
      offsetY.value = y
    })
    .start()
}

const update = () => {
  requestAnimationFrame(update)
  group.update()
}

update()
// useDrag(dragHandler, {
//   domTarget: cardHandler,
// })
useGesture({
  onDrag: dragHandler,
  onDragEnd: endDragHandler
}, {
  domTarget: cardHandler,
})

</script>

<style lang="scss">
@import '@/styles/variables.scss';

.card {
  margin: 10px;
  height: 3000px;
  padding: 10px;
  will-change: transform;

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

  .block {
    border-radius: 10px;
    margin-bottom: 20px;
    padding: 10px;
    background-color: #ffffff;

    .scroll {
      overflow-x: scroll;
    }
  }

  .content {
    flex-direction: row;

    .mincard {
      min-width: 80px;
      min-height: 80px;
      margin: 20px;
      background-color: antiquewhite;
      border-radius: 5px;
    }
  }
}
</style>
