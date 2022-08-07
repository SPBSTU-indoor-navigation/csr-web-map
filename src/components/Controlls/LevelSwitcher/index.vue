
<template>

  <div class="level-switcher">
    <div class="levels">
      <div v-for="level in levels" class="level" @click="$emit('update:level', level.ordinal)">{{ level.name.ru }}
      </div>
    </div>

    <div @click.prevent class="current" :style="`top: ${offset}rem`"></div>
  </div>
</template>

<script setup>
import { computed } from '@vue/reactivity';

const props = defineProps(['levels', 'level'])
const emit = defineEmits(['update:level'])

const levels = computed(() => {
  return props.levels.map(t => ({ ordinal: t.ordinal, name: t.data.properties.short_name })).sort((a, b) => b.ordinal - a.ordinal)
})

const offset = computed(() => levels.value.map(t => t.ordinal).indexOf(props.level) * 3)

</script>

<style lang="scss">
$level-size: 3rem;

.level-switcher {
  position: absolute;
  right: 5px;
  top: 5px;
  user-select: none;
  touch-action: none;

  -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
  -webkit-tap-highlight-color: transparent;

  .levels {
    background-color: rgba(255, 255, 255, .75);
    -webkit-backdrop-filter: blur(30px);
    backdrop-filter: blur(30px);
    box-shadow: 0 0 4px 2px rgb(0 0 0 / 5%);
    border-radius: 0.5rem;

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
      border-radius: 0.5rem;

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


    &:after {
      content: '';
      display: inline-block;
      border-radius: 0.5rem;
      background: #6e6f6c42;

      margin-left: calc($offset / 2);
      margin-top: calc($offset / 2);

      width: calc($level-size - $offset);
      height: calc($level-size - $offset);
    }
  }
}
</style>
