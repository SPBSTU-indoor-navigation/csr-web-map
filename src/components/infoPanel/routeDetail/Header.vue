<template>
  <div class="relative">
    <div v-if="!showSearch">
      <div class="lines">
        <div class="from" @click="onClickFrom">
          <span class="secondary-label line-from">От:
            <span class="label">{{ from.title }}</span>
          </span>
        </div>
        <hr class="separator small" />
        <div class="to" @click="onClickTo">
          <span class="secondary-label line-to">К:
            <span class="label">{{ to.title }}</span>
          </span>
        </div>
      </div>

      <div class="change background flex" @click="onClick">
        <IconVue img="arrow.up.arrow.down" class="controll-image" :class="rot ? 'rotate-up' : ''" />
      </div>
    </div>
    <div v-else>
      <div class="search-container">

        <SearchBarVue :show-icon="false" ref="search" :search-text="searchText"
          @update:search-text="e => emit('update:searchText', e)" @focus="onFocus" />
        <button @click="emit('update:showSearch', '')">Отменить</button>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { UnitInfoData } from '../unitDetail/data';
import IconVue from "@/components/icon/index.vue";
import { inject, Ref, ref, watch } from 'vue';
import SearchBarVue from "@/components/shared/searchBar/index.vue";
import { nextFrame } from '@/core/shared/utils';
import { State } from '@/components/bottomSheet/useBottomSheetGesture';

const state = inject<Ref<State>>('state')
const search = ref(null);

const props = defineProps<{
  from: UnitInfoData,
  to: UnitInfoData,
  showSearch: string,
  searchText: string
}>()

const emit = defineEmits<{
  (e: 'swap'): void,
  (e: 'update:showSearch', v: 'from' | 'to'): void,
  (e: 'update:searchText', v: string): void
}>()

watch(() => props.showSearch, (v) => {
  if (v) {
    nextFrame(() => {
      search.value.focusInput()
    })
  }

})

function onFocus() {
  state.value = State.big;
}

const rot = ref(false)

function onClick() {
  rot.value = !rot.value
  emit('swap')
}

function onClickTo() {
  emit('update:searchText', '')
  emit('update:showSearch', 'to')
}

function onClickFrom() {
  emit('update:searchText', '')
  emit('update:showSearch', 'from')
}

</script>


<style scoped lang="scss">
@import '@/styles/variables.scss';

.from,
.to {
  margin-right: 42px;
  padding: 5px 0;
}

.to {
  padding: 5px 0 10px 0;
}

.from {
  padding: 10px 0 5px 0;
}

.line-from,
.line-to {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  display: block;
}

.lines {
  padding: 0 10px;
  margin-top: 10px;
  margin-bottom: 10px;
  margin-right: -15px;
  border-radius: 10px;
  background-color: $search-bar-background;
}

.separator.small {
  margin: 0px -10px 0px -10px;
}

.support {
  color: gray;
}

.change {
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: absolute;
  height: 45px;
  width: 45px;

  border-radius: 50%;

  right: -5px;
  top: 11px;

  .controll-image {
    fill: var(--accent-color);
    min-width: 19px;
    min-height: 19px;
    max-width: 19px;
    max-height: 19px;

    transition: 0.3s ease-in-out;

    &.rotate-up {
      transform: rotate(180deg);
    }
  }
}

.search-container {
  display: flex;
  margin: 10px -20px 5px 0;

  .search {
    flex: 1;
    border-radius: 10px;
  }

  button {
    padding-left: 4px;
    background-color: rgba(255, 255, 255, 0);
    color: var(--accent-color);
    font-size: 14px;
    font-weight: 500;
  }
}
</style>
