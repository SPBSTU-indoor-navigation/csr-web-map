import { useStorage } from '@vueuse/core'
import { ref } from 'vue'

export const showBackedOutline = useStorage('showBackedOutline', false)
export const showBackedCanvas = useStorage('showBackedCanvas', false)
export const showAnnotationBBox = useStorage('showAnnotationBBox', false)
export const showDebugPath = useStorage('showDebugPath', false)
export const inversePath = useStorage('inversePath', false)
export const renderAnnotationCount = ref(0)

export const showDebugPanel = useStorage('showDebugPanel', false)

window.showDebugPanel = () => showDebugPanel.value = true
window.inverePathFinder = () => inversePath.value = !inversePath.value
