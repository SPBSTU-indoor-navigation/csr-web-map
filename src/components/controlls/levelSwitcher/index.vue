
<template>

  <div class="level-switcher highlight-disable">
    <div class="levels card-blur card-shadow">
      <div v-for="level in levels" class="level" @click="$emit('update:level', level.ordinal)">{{ level.name.ru }}
      </div>
    </div>

    <div @click.prevent class="current" :class="changed ? 'non-anim' : ''" :style="`top: ${offset}rem`"></div>
  </div>
</template>

<script setup>
import { computed, ref } from '@vue/reactivity';
import { watchEffect } from 'vue';
import { useMediaQuery } from '@vueuse/core';
import { phoneWidth } from '@/styles/variables';


const props = defineProps(['levels', 'level'])
const emit = defineEmits(['update:level'])
const changed = ref(false)

const levels = computed(() => {
  return props.levels.map(t => ({ ordinal: t.ordinal, name: t.data.properties.short_name })).sort((a, b) => b.ordinal - a.ordinal)
})

const isPhone = useMediaQuery(`(max-width: ${phoneWidth})`)

const offset = computed(() => levels.value.map(t => t.ordinal).indexOf(props.level) * (isPhone.value ? 3 : 2.5))

watchEffect(async () => {
  props.levels
  changed.value = true
  await new Promise(resolve => setTimeout(resolve, 0))
  changed.value = false
})

</script>

<style lang="scss">
@import '@/styles/variables.scss';

@mixin styling($level-size) {
  .level-switcher {
    position: absolute;
    right: 10px;
    top: 10px;
    user-select: none;
    touch-action: none;

    .levels {
      // background-color: rgba(255, 255, 255, .75);
      // -webkit-backdrop-filter: blur(30px);
      // backdrop-filter: blur(30px);
      // box-shadow: 0 0 4px 2px rgb(0 0 0 / 5%);
      border-radius: 10px;

      .level {
        display: flex;
        align-items: center;
        justify-content: center;

        font-weight: bold;
        font-size: 0.8rem;
        color: #6e6f6c;

        width: $level-size;
        height: $level-size;

        cursor: pointer;
        border-radius: 10px;

        &:hover {
          background-color: #6e6f6c0f;
        }
      }
    }

    .current {
      $offset: 0.3rem;

      position: absolute;
      width: $level-size;
      height: $level-size;

      transition: 0.15s ease-in-out;

      &.non-anim {
        transition: 0s !important
      }

      &:after {
        content: '';
        display: inline-block;
        border-radius: calc(10px - $offset/2);
        background: #6e6f6c42;

        margin-left: calc($offset / 2);
        margin-top: calc($offset / 2);

        width: calc($level-size - $offset);
        height: calc($level-size - $offset);
      }
    }
  }
}

@include styling($level-size: 2.5rem);

@media (max-width: $phone-width) {
  @include styling($level-size: 3rem);
}
</style>
