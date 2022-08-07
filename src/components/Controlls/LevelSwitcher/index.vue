
<template>

  <div class="level-switcher">
    <div class="levels">
      <div v-for="level in levels" class="level" @click="$emit('update:level', level.ordinal)">{{ level.name.ru }}
      </div>
    </div>

    <div class="current" :style="`top: ${offset}px`"></div>
  </div>
</template>

<script setup>
import { computed } from '@vue/reactivity';

const props = defineProps(['levels', 'level'])
const emit = defineEmits(['update:level'])

const levels = computed(() => {
  return props.levels.map(t => ({ ordinal: t.ordinal, name: t.data.properties.short_name })).sort((a, b) => a.ordinal - b.ordinal)
})

const offset = computed(() => levels.value.map(t => t.ordinal).indexOf(props.level) * 40)

</script>

<style lang="scss">
$level-size: 40px;

.level-switcher {
  position: absolute;
  right: 5px;
  top: 5px;
  user-select: none;

  .levels {
    background-color: rgba(255, 255, 255, .75);
    -webkit-backdrop-filter: blur(30px);
    backdrop-filter: blur(30px);
    box-shadow: 0 0 4px 2px rgb(0 0 0 / 5%);
    border-radius: 10px;

    .level {
      display: flex;
      align-items: center;
      justify-content: center;

      font-weight: bold;
      font-size: 14px;
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
    $offset: 5px;

    position: absolute;
    width: $level-size;
    height: $level-size;

    transition: 0.15s ease-in-out;


    &:after {
      content: '';
      display: inline-block;
      border-radius: 10px;
      background: #6e6f6c42;

      margin-left: calc($offset / 2);
      margin-top: calc($offset / 2);

      width: calc($level-size - $offset);
      height: calc($level-size - $offset);
    }
  }
}
</style>
