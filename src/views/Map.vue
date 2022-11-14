<template>
  <div class="home abs-full">
    <MapVue @mapDelegate="onMapDelegate" />
    <div class="abs-full non-block" @wheel="onScroll">
      <InfoPanelVue ref="infoPanel" :style="{ display: showUI ? '' : 'none' }" />
    </div>

    <div class="watermark" v-if="!showUI" @click="onClickWatermark">
      <img src="@/assets/umap-watermark.png">
    </div>
    <Transition name="loading">
      <div class="loading abs-full" v-if="loading">
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import MapVue from "../components/map/MapThreeJS.vue";
import InfoPanelVue from "@/components/infoPanel/index.vue";
import { useFullscreenScrollFix } from "@/core/shared/composition/useFullscreenScrollFix";
import { provide, ref, ShallowRef, shallowRef, watch, watchEffect } from "vue";
import { FocusVariant, IMapDelegate } from "@/components/map/mapControlls";
import { useRoute, useRouter } from "vue-router";
import { skipOffset } from "@/components/infoPanel/infoPanelControlls";

const infoPanel = shallowRef<InstanceType<typeof InfoPanelVue>>(null);
const loading = ref(true)

const route = useRoute()
const router = useRouter()

const showUI = ref(true)

// @ts-ignore
const mapDelegate: ShallowRef<IMapDelegate> = shallowRef({
  selectedAnnotation: shallowRef(null),
  pinnedAnnotations: shallowRef([]),
  venue: shallowRef(null),
})

function onClickWatermark() {
  let url = `${import.meta.env.VITE_BASE_URL}/${route.params.mapID}`

  const variant = route.params.shareVariant

  if (variant) {
    url += `/share/${variant}?`
    if (variant == 'route') {
      url += `from=${route.query.from}&to=${route.query.to}`
      if (route.query.asphalt === 'true') url += `&asphalt=${route.query.asphalt}`
      if (route.query.serviceRoute === 'true') url += `&serviceRoute=${route.query.serviceRoute}`
    } else if (variant == 'annotation') {
      url += `id=${route.query.id}`
    }
  }

  window.open(url, '_blank').focus();
}

provide('mapDelegate', mapDelegate)
useFullscreenScrollFix()

function onScroll(e) {
  if (e.ctrlKey) {
    e.preventDefault()
    e.stopPropagation()
  }
};

function onMapDelegate(delegate: IMapDelegate) {

  function annotationById(id: string | string[]) {
    if (id && typeof id === 'string') {
      return mapDelegate.value.venue.value.mapAnnotations.get(id.toLowerCase())
    }
    return null
  }

  mapDelegate.value = delegate

  showUI.value = !route.query.hideui
  skipOffset.value = !showUI.value


  delegate.preventSelection.value = !!route.query.preventselection

  const variant = route.params.shareVariant

  let delay = 100

  if (variant) {
    if (variant == 'route') {
      const from = annotationById(route.query.from)
      const to = annotationById(route.query.to)

      if (from && to) {
        const asphalt = route.query.asphalt === 'true'
        const allowService = route.query.serviceRoute === 'true'
        delay = 700

        setTimeout(() => {
          infoPanel.value.setRouteWithOptions({ from, to, asphalt, allowService })
        }, 500) // задержка чтоб аннотации успели инициализироваться, если сразу зумиться картинок нет
      }

    } else if (variant == 'annotation') {
      const annotation = annotationById(route.query.id)
      if (annotation) {
        delay = 700
        setTimeout(() => {
          mapDelegate.value.selectAnnotation({ annotation, focusVariant: FocusVariant.center, animated: route.query.animated ? true : false })
        }, 500)
      }
    }

    if (!route.query.b) {
      router.replace({
        query: { ...route.query, id: undefined, from: undefined, to: undefined, asphalt: undefined, serviceRoute: undefined },
        params: { ...route.params, shareVariant: undefined }
      })
    }
  }

  setTimeout(() => {
    loading.value = false
  }, delay)
}

</script>

<style scoped lang="scss">
.abs-full {
  /* 
  background-color: #343434; */
}

.loading {
  background-color: #f7f3ea;
}

.watermark {
  position: absolute;
  cursor: pointer;
  filter: drop-shadow(0 0 15px rgba(0, 0, 0, 0.237));

  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  padding: auto;

  img {
    width: 75px;
  }
}


.loading-enter-active,
.loading-leave-active {
  transition: opacity 0.2s ease;
}

.loading-enter-from,
.loading-leave-to {
  opacity: 0;
}
</style>

