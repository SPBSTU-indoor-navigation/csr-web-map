import { ref } from 'vue'

export const showBackedOutline = ref(false)
export const showBackedCanvas = ref(false)
export const showAnnotationBBox = ref(false)
export const currentZoom = ref(0)
export const renderAnnotationCount = ref(0)

export const showDebugPanel = ref(false)

window.showDebugPanel = () => showDebugPanel.value = true
