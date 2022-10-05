<template>
  <div class="container non-block" :class="fullHeight ? 'fullHeight':''">
    <button @click="toggle()">{{state}}</button>
    <input type="checkbox" class="toggle" v-model="pop" />
    <!-- <SearchVue /> -->
    <!-- <OccupantDetailVue /> -->

    <!-- <OccupantDetailVue title="title21" />
    <OccupantDetailVue title="title2s" /> -->
    <Transition :name="animType">
      <OccupantDetailVue v-if="state" title="title21" />
      <OccupantDetailVue v-else-if="!state" title="title2s" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from '@vue/reactivity';
import SearchVue from './search/index.vue'
import OccupantDetailVue from './occupantDetail/index.vue'
import { useToggle } from '@vueuse/shared';

const [state, toggle] = useToggle()
const pop = ref(false)

const animType = computed(() => pop.value ? 'pop' : 'push')

let tabs = [
  {
    data: 'title1'
  },
  {
    data: 'title2'
  }
]

const pages = ref([])

const fullHeight = computed(() => {
  return pages.value.length != 0
})

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

  input {

    position: absolute;
    top: 0;
    left: 40px;
    z-index: 3;
  }

  button {
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
