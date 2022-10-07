<template>
  <div class="container non-block" :class="fullHeight ? 'fullHeight':''">
    <input type="checkbox" class="toggle" v-model="pop" />
    <p>{{offsetY}}</p>
    <Transition :name="animType">
      <component :is="currentPage.component" :key="currentPage.key" @pop="onPop" @push="onPush" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, markRaw } from '@vue/reactivity';
import { provide } from 'vue'
import OccupantDetailVue from '../infoPanel/occupantDetail/index.vue';
import { watch, } from 'vue';
import { State } from './useBottomSheetGesture';

const pages = ref([{
  component: markRaw(OccupantDetailVue),
  key: 1
}])

const offsetY = ref(0)
const state = ref(State.middle)
const pop = ref(false)
const animType = computed(() => pop.value ? 'pop' : 'push')


provide('offsetY', offsetY)
provide('state', state)

const fullHeight = computed(() => pages.value.length != 0)
const currentPage = computed(() => pages.value[pages.value.length - 1])


watch(() => pages.value.length, (current, last) => {
  pop.value = current < last
})

const onPop = () => {
  if (pages.value.length > 1) pages.value.pop()
}

const onPush = (e) => {
  state.value = State.middle
  pages.value.push({
    component: OccupantDetailVue,
    key: currentPage.value.key == 0 ? 1 : 0
  })
}

</script>

<style lang="scss">
@import '@/styles/variables.scss';

/*#region Animation*/
$duration: 0.4s;

.pop-enter-active,
.pop-leave-active {
  transition: all $duration ease-in;
}

.push-enter-active,
.push-leave-active {
  transition: all $duration ease-out;
}

.pop-leave-active,
.push-enter-active {
  z-index: 1;
}

.pop-enter-from,
.push-leave-to {
  transform: translateX(0) scale(0.98);

  @media (max-width: $phone-width) {
    transform: translateY(0) scale(0.98);
  }
}

.pop-leave-to,
.push-enter-from {
  transform: translateX(-100%);

  @media (max-width: $phone-width) {
    transform: translateY(100%);
  }
}


.push-enter-active {
  animation-duration: calc($duration + 1s);

  .page {
    animation: pop-opacity calc($duration + 1s);

    @keyframes pop-opacity {
      0% {
        background-color: rgba(248, 248, 248, 1);
      }

      30% {
        background-color: rgba(248, 248, 248, 1);
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

  @media (max-width: 1100px) {
    width: 300px;
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
