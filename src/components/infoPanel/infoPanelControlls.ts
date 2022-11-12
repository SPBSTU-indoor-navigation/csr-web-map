import { IAnnotation } from "@/core/map/overlayDrawing/annotations/annotation";
import { bottomSheet, phoneWidth } from "@/styles/variables";
import { useMediaQuery } from "@vueuse/core";
import { computed, ref } from "vue";

let setFrom: (info: IAnnotation) => void;
let setTo: (info: IAnnotation) => void;

export interface IInfoPanelDelegate {
  pages?: () => { component: any; data: any; key: number }[],
  push?: (params: { component: any; data: any, collapse?: boolean }) => void,
  pop?: () => void,
  popTo?: (index: number) => void,
}

export function useInfoPanel() {
  return {
    setFrom,
    setTo,
  }
}

export function useDefineControlls(params: {
  setFrom: typeof setFrom;
  setTo: typeof setTo;
}) {
  setFrom = params.setFrom;
  setTo = params.setTo;
}

export const isPhoneLayout = useMediaQuery(`(max-width: ${phoneWidth}px)`)
export const isLargeDesktopLayout = useMediaQuery(`(min-width: 1200px)`)

export let skipOffset = ref(false)

export const selectAnnotationInsets = computed(() => {
  const insets = { top: 10, left: 10, bottom: 10, right: 10 }
  if (skipOffset.value) return insets
  if (isPhoneLayout.value) {
    insets.bottom = bottomSheet.vertical.middleOffset
  } else {
    if (isLargeDesktopLayout.value) {
      insets.left = bottomSheet.horizontal.regularWidth
    } else {
      insets.left = bottomSheet.horizontal.smallWidth
    }
  }

  return insets
})
