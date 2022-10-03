<template>
  <div class="search card flex">
    <MagnifyingGlassIcon class="icon" />
    <input type="text" class="label highlight-disable" placeholder="Поиск" ref="input" enterkeyhint="search"
      @keydown.enter="search" v-model="searchText" />
    <div v-if="showClose" class="clear-container highlight-disable" @click="clearContainer">
      <XCircleIcon class="clear" @click="clear" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { XCircleIcon } from '@heroicons/vue/24/solid'
import { ref, computed } from 'vue'

const searchText = ref(null)
const input = ref(null)

const showClose = computed(() => {
  return searchText.value != null && searchText.value.length > 0
})

const clear = () => {
  searchText.value = null
}

const clearContainer = (e: PointerEvent) => {
  if (e.pointerType !== 'mouse') {
    e.preventDefault()
    e.stopPropagation()
    clear()
  }
}

const search = () => {
  input.value?.blur()
}

</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.search {
  margin: 10px;
  padding: 0 10px;
  height: 2.5rem;

  @media (max-width: $phone-width) {
    height: 3rem;
  }

  align-items: center;
  position: relative;

  .icon {
    stroke-width: 2px;
    color: #2c2c3163;
  }

  .clear-container {
    position: absolute;
    right: 0px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;

    .clear {
      width: 18px;
      height: 18px;

      cursor: pointer;
      color: $gray;
    }
  }

  input {
    width: 100%;
    height: 100%;
    border: none;
    background-color: rgba(255, 255, 255, 0);
    font-family: $font-family;
    font-weight: 400;
    font-size: medium;

    margin: 0 10px;

    &::placeholder {
      color: $placeholder;
    }
  }

}
</style>
