<template>
  <div class="search flex">
    <MagnifyingGlassIcon class="icon" />
    <input type="text" class="label highlight-disable prevent-pointer-event-blur" placeholder="Поиск" ref="input"
      enterkeyhint="search" @keydown.enter="search" v-model="searchText" @focus="focus" @dragStart.prevent
      :style="{marginRight: showClose ? '20px' : undefined}" />
    <div v-if="showClose" class="clear-container highlight-disable" @click="clearContainer">
      <XCircleIcon class="clear" @click="clear" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePhoneInputFix } from '@/core/shared/composition/usePhoneInputFix';
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { XCircleIcon } from '@heroicons/vue/24/solid'
import { ref, computed, watchEffect } from 'vue'

const searchText = ref("")
const input = ref(null)

const props = defineProps({
  focusDelay: {
    type: Number,
    default: 0
  },
  searchText: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['focus', 'update:searchText'])

watchEffect(() => {
  searchText.value = props.searchText
})

watchEffect(() => {
  emit('update:searchText', searchText.value)
})



const showClose = computed(() => {
  return searchText.value != null && searchText.value.length > 0
})

const clear = () => {
  searchText.value = null
}

let skipNextFocus = false
function focus(e) {
  emit('focus')
  if (skipNextFocus) {
    skipNextFocus = false
  } else {
    skipNextFocus = true
    usePhoneInputFix({
      inputText: searchText,
      sourceElement: e.target,
      delay: props.focusDelay
    })
  }
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
  padding: 0 10px;
  height: 2.5rem;

  background-color: $search-bar-background;

  @media (max-width: $phone-width) {
    height: 3rem;
  }

  align-items: center;
  position: relative;

  .icon {
    min-width: 20px;
    max-width: 20px;
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

    margin: 0 5px;

    &::placeholder {
      color: $placeholder;
    }
  }

}
</style>
