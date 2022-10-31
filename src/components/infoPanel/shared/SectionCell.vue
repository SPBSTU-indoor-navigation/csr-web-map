<template>
  <div class="cell flex" :class="props.clickable ? 'clickable' : ''">
    <div class="left flex" v-if="slots.left">
      <slot name="left"></slot>
    </div>
    <p>{{ props.title }}</p>
    <div class="right flex" v-if="slots.right">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script setup>
import { useSlots } from 'vue';


const props = defineProps({
  clickable: {
    type: Boolean,
    default: false
  },
  title: String
})

const slots = useSlots()

</script>

<style lang="scss" scoped>
.cell {
  align-items: center;

  p {
    flex-grow: 5;
  }

  .right {
    margin-left: 10px;
  }

  .left {
    margin-right: 10px;
  }

  &.clickable {
    cursor: pointer;
    padding: 10px;
    margin: -10px;
    border-radius: 10px;

    &:active {
      background-color: rgb(235, 235, 235);
    }
  }
}
</style>
