import { useWindowSize } from "@vueuse/core"
import { watchEffect } from "vue"

export function useFullscreenScrollFix() {
  const { height } = useWindowSize()
  watchEffect(() => {
    if (height.value != 0) {
      window.scrollTo(0, 0)
    }
  })
}
