import { useWindowSize } from "@vueuse/core"
import { ref, watch } from "vue"

export function useFullscreenViewport() {
  const viewport = ref<HTMLElement | null>(null)
  const height = ref(0)
  const width = ref(0)
  let keyboardIsOpen = false

  viewport.value = document.querySelector("meta[name=viewport]") as HTMLElement

  const { width: windowWidth, height: windowHeight } = useWindowSize()

  height.value = windowHeight.value
  width.value = windowWidth.value

  watch(() => ({ w: windowWidth.value, h: windowHeight.value }), (val, old) => {
    if (old.w == val.w && Math.abs(old.h - val.h) > 100) {
      if (keyboardIsOpen && val.h == height.value) {
        keyboardIsOpen = false
        viewport.value.setAttribute("content", `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`)
        // console.log("FIX ON KEYBOARD CLOSE");
        return;
      } else if (!keyboardIsOpen && val.h < height.value) {
        keyboardIsOpen = true
        viewport.value.setAttribute("content", `width=device-width, height=${height.value}, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`)
        // console.log("FIX ON KEYBOARD OPEN");
        return;
      }
    }


    if (keyboardIsOpen) {
      keyboardIsOpen = false
      viewport.value.setAttribute("content", `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`)
      // console.log("FIX MISS KEYBOARD OPEN");
    }

    height.value = val.h
    width.value = val.w
  })
}
