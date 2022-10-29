import Tween from '@tweenjs/tween.js';
import { useElementSize } from "@vueuse/core";
import { Camera, Vector2, Vector3 } from "three";
import { Ref, shallowRef, watchEffect } from "vue";


export interface IOverlayDrawing {
  isDirty(): boolean
  setup(options: {
    project: (pos: Vector2) => DOMPoint
  }): void
  draw(ctx: CanvasRenderingContext2D, canvasSize: Vector2): void
  click?(pos: Vector2, e: PointerEvent): void
}

function useCanvas(container: Ref<HTMLElement>, onResize: (size: Vector2) => void) {
  let canvasSize = shallowRef(new Vector2(0, 0))
  const screenSize = useElementSize(container)

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  canvas.classList.add('map-annotations')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  document.querySelector('.mk-map-view>.map-geometry').after(canvas)

  watchEffect(() => {
    const width = screenSize.width.value
    const height = screenSize.height.value

    canvas.width = width * window.devicePixelRatio
    canvas.height = height * window.devicePixelRatio
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    canvasSize.value = new Vector2(width, height)
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    onResize(canvasSize.value)
  })

  return {
    canvasSize,
    canvas,
    ctx
  }

}

export default function useOverlayDrawing(options: {
  scheduleUpdate: () => void,
  threeJsCamera: Camera,
  container: Ref<HTMLElement>,
  mapZoom: Readonly<Ref<number>>
}) {

  let overlays: IOverlayDrawing[] = []
  let initFinished = false

  const { ctx, canvasSize } = useCanvas(options.container, t => { if (initFinished) draw() })

  function project(pos: Vector2) {
    const v = new Vector3(pos.x, pos.y, 0)
    v.project(options.threeJsCamera)
    v.x = ((v.x + 1) / 2)
    v.y = ((-v.y + 1) / 2)
    return new DOMPoint(v.x * canvasSize.value.x, v.y * canvasSize.value.y)
  }

  function unproject(pos: { x: number, y: number }) {
    const v = new Vector3(pos.x, pos.y, 0)
    v.unproject(options.threeJsCamera)
    return new Vector2(v.x, v.y)
  }

  function unprojectScreenPoint(pos: DOMPoint) {
    return unproject({ x: (pos.x / canvasSize.value.x - 0.5) * 2, y: (0.5 - (pos.y / canvasSize.value.y)) * 2 })
  }

  function addOverlay(overlay: IOverlayDrawing) {
    overlays.push(overlay)
    overlay.setup({
      project
    })
  }

  function draw() {
    ctx.clearRect(0, 0, canvasSize.value.x, canvasSize.value.y)
    overlays.forEach(o => o.draw(ctx, canvasSize.value))
  }

  function click(pos: Vector2, e: PointerEvent) {
    overlays.forEach(o => o.click?.(pos, e))
  }



  const updateEveryFrame = () => {
    Tween.update()
    setTimeout(updateEveryFrame, 1000 / 60)

    const isDirty = overlays.some(t => t.isDirty())
    if (isDirty) {
      options.scheduleUpdate()
    }
  }
  updateEveryFrame()

  initFinished = true
  return {
    draw,
    addOverlay,
    click,
    project,
    unprojectScreenPoint
  }

}
