<template>
  <div class="relative">
    <div class="lines">
      <div class="from">
        <span class="secondary-label line-from" @click="onClickFrom">От:
          <span class="label">{{ from.title }}</span>
        </span>
      </div>
      <hr class="separator small" />
      <div class="to">
        <span class="secondary-label line-to" @click="onClickTo">К:
          <span class="label">{{ to.title }}</span>
        </span>
      </div>
    </div>

    <div class="change background flex" @click="onClick">
      <IconVue img="arrow.up.arrow.down" class="controll-image" :class="rot ? 'rotate-up' : ''" />
    </div>
  </div>
</template>


<script setup lang="ts">
import { UnitInfoData } from '../unitDetail/data';
import IconVue from "@/components/icon/index.vue";
import { ref } from 'vue';

const props = defineProps<{
  from: UnitInfoData,
  to: UnitInfoData
}>()

const emit = defineEmits<{
  (e: 'swap'): void,
}>()

const rot = ref(false)

function onClick() {
  rot.value = !rot.value
  emit('swap')
}

function onClickTo() {
  onClickFrom()
}

function onClickFrom() {
  alert("Для изменения точек назначения, выберите аннотацию на карте")
}

</script>


<style scoped lang="scss">
@import '@/styles/variables.scss';

.from,
.to {
  margin-right: 42px;
}

.line-from,
.line-to {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  display: block;
}

.lines {
  padding: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
  margin-right: -15px;
  border-radius: 10px;
  background-color: $search-bar-background;
}

.separator.small {
  margin: 5px -10px 5px -10px;
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
</style>
