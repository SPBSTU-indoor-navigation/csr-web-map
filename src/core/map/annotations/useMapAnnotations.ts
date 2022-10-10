import { Vector2, Vector3, Camera, Box2 } from 'three';
import { Ref, ref, shallowRef, UnwrapRef, watchEffect } from 'vue';
import { MapController } from '../mapController';
import { IAnnotation, Shape2D } from './annotation';
import Tween from '@tweenjs/tween.js';
import { currentZoom, renderAnnotationCount, showAnnotationBBox } from '@/store/debugParams';
import { groupBy } from '../../shared/utils';
import { useElementSize } from '@vueuse/core';
import { onAnnotationDeSelect, onAnnotationSelect } from '@/store/mapInfoPanel';

declare type Annotation = (IAnnotation & Shape2D);

export interface IMapAnnotations {
  selected: Ref<UnwrapRef<IAnnotation | null>>
  add(annotation: IAnnotation | IAnnotation[]): void
  remove(annotation: IAnnotation | IAnnotation[]): void
  select(annotation: IAnnotation | null): void

  render(options: { cam: Camera }): void
  click(pos: Vector2, e: PointerEvent): void
  zoom(zoom: number)
}


export default function useMapAnnotations(options: {
  mapController: MapController,
  styleSheet: Ref<UnwrapRef<any>>,
  mapContainer: Ref<UnwrapRef<HTMLElement>>
}): IMapAnnotations {

  let canvasSize: Vector2
  let lastZoom: number = 0
  const selected = shallowRef<IAnnotation | null>(null)

  const screenSize = useElementSize(options.mapContainer)

  const canvas = document.createElement('canvas')
  canvas.classList.add('map-annotations')
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  document.querySelector('.mk-map-view')!.insertBefore(canvas, document.querySelector(".mk-map-view>.mk-map-node-element"))

  watchEffect(() => {
    const width = screenSize.width.value
    const height = screenSize.height.value

    canvas.width = width * window.devicePixelRatio
    canvas.height = height * window.devicePixelRatio
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    canvasSize = new Vector2(width, height)
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
  })

  let annotations: Annotation[] = []

  watchEffect(() => {
    annotations.forEach(a => a.style(options.styleSheet.value.annotations))
  })

  const addAnotation = (annotation: Annotation | Annotation[]) => {
    const toAdd = Array.isArray(annotation) ? annotation : [annotation]
    annotations.push(...toAdd)
    toAdd.forEach(a => {
      a.style(options.styleSheet.value.annotation)
      a.zoom(lastZoom, false)
    })
  }

  const removeAnotation = (annotation: IAnnotation | IAnnotation[]) => {
    const toRemove = new Set((Array.isArray(annotation) ? annotation : [annotation]).map(t => t.id))

    if (toRemove.has(selected.value?.id)) {
      select(null, false)
    }

    annotations = annotations.filter(t => !toRemove.has(t.id))
  }

  const render = (options: {
    cam: Camera
  }) => {
    const { cam } = options

    const debugDraw = (annotation: { screenPosition: Vector2, annotation: Annotation }) => {
      if (!showAnnotationBBox.value) return
      ctx.save()
      ctx.translate(annotation.screenPosition.x, annotation.screenPosition.y)
      const bounds = annotation.annotation.bounds
      ctx.lineWidth = 1
      ctx.strokeStyle = '#f0f'
      ctx.strokeRect(bounds.rect.min.x, bounds.rect.min.y, bounds.size.width, bounds.size.height)

      ctx.beginPath()
      ctx.arc(0, 0, 2, 0, Math.PI * 2)
      ctx.stroke()


      ctx.lineWidth = 1
      ctx.strokeStyle = 'yellow'
      ctx.strokeRect(annotation.annotation.boundingBox.min.x,
        annotation.annotation.boundingBox.min.y,
        annotation.annotation.boundingBox.max.x - annotation.annotation.boundingBox.min.x,
        annotation.annotation.boundingBox.max.y - annotation.annotation.boundingBox.min.y)
      ctx.restore()
    }

    const project = (pos: Vector2) => {
      const v = new Vector3(pos.x, pos.y, 0)
      v.project(cam)
      v.x = ((v.x + 1) / 2)
      v.y = ((-v.y + 1) / 2)
      return new Vector2(v.x * canvasSize.x, v.y * canvasSize.y)
    }

    const draw = (annotation: { screenPosition: Vector2, annotation: Annotation }) => {
      ctx.save()
      ctx.translate(annotation.screenPosition.x, annotation.screenPosition.y)
      annotation.annotation.draw(ctx)
      ctx.restore()
      debugDraw(annotation)
    }

    const renderWithOrder = (annotations: { screenPosition: Vector2, annotation: Annotation }[]) => {
      const grouped = groupBy(annotations, a => a.annotation.renderOrder)
      Array.from(grouped.keys()).sort().forEach(key => {
        grouped.get(key)!.forEach(draw)
      })
    }

    const screen = new Box2(new Vector2(0, 0), canvasSize.clone())
    const annotationsToRender = annotations
      .map(t => {
        const pos = project(t.scenePosition)
        t.updateScreenPosition(pos)
        t.isDirty = false
        return {
          annotation: t,
          screenPosition: pos
        }
      })
      .filter(t => t.annotation.shouldDraw(screen))

    renderAnnotationCount.value = annotationsToRender.length
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    let renderQueue = []
    renderQueue.push(...annotationsToRender.filter(t => t.annotation.isSelected))

    const renderQueueSet = new Set(renderQueue.map(t => t.annotation.id))

    renderWithOrder(annotationsToRender.filter(t => !renderQueueSet.has(t.annotation.id)))
    renderWithOrder(renderQueue)

  }

  const select = (annotation: Annotation | null, animated: boolean = true) => {
    if (selected.value) {
      annotations = annotations.filter(t => t.id !== selected.value.id)
      annotations.push(selected.value as Annotation)
    }

    selected.value?.setSelected(false, animated)
    onAnnotationDeSelect.dispatch({ annotation: selected.value, annotationID: selected.value?.id })

    selected.value = annotation

    if (selected.value) {
      selected.value.setSelected(true, animated)
      onAnnotationSelect.dispatch({ annotation: selected.value, annotationID: selected.value?.id })
    }
  }

  const click = (pos: Vector2, e: PointerEvent) => {
    let selected = false

    const isTouch = e.pointerType === 'touch'
    let touchDistance = Number.MAX_VALUE;
    let touchAnnotation = null;

    for (let i = 0; i < annotations.length; i++) {
      const annotation = annotations[i];

      if (annotation.isSelected) continue
      if (!annotation.shouldSelectOnTap) continue

      if (annotation.pointInside(pos)) {
        selected = true
        select(annotation)
        break;
      }

      if (isTouch) {
        let distance = annotation.frame.distanceToPoint(pos)
        if (distance < touchDistance) {
          touchDistance = distance
          touchAnnotation = annotation
        }
      }

    }

    if (!selected && touchAnnotation && touchDistance < 15) {
      selected = true;
      select(touchAnnotation)
    }

    if (!selected) {
      select(null)
    }

  }

  const zoom = (zoom: number) => {
    currentZoom.value = zoom
    lastZoom = zoom
    annotations.forEach(t => t.zoom(zoom))
  }

  const updateEveryFrame = () => {
    Tween.update()

    // setTimeout(() => requestAnimationFrame(updateEveryFrame), 1000 / 60)
    setTimeout(updateEveryFrame, 1000 / 60)

    // requestAnimationFrame(updateEveryFrame)
    const isDirty = annotations.some(t => t.isDirty)
    if (isDirty) {
      options.mapController.scheduleUpdate()
    }
  }

  updateEveryFrame()


  return {
    add: addAnotation,
    remove: removeAnotation,
    render,
    click,
    zoom,
    select,
    selected
  }

}
