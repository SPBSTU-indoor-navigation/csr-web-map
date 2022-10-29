import { Vector2, Box2 } from 'three';
import { Ref, shallowRef, watch, watchEffect } from 'vue';
import { IAnnotation, Shape2D } from './annotation';
import { renderAnnotationCount, showAnnotationBBox } from '@/store/debugParams';
import { groupBy } from '../../../shared/utils';

import { IOverlayDrawing } from '../useOverlayDrawing';

declare type Annotation = (IAnnotation & Shape2D);

export default function useMapAnnotations(options: {
  styleSheet: Readonly<Ref<any>>,
  mapZoom: Readonly<Ref<number>>,
}) {
  const mapZoom = options.mapZoom;
  const selected = shallowRef<IAnnotation | null>(null)
  const pinned = shallowRef<IAnnotation[]>([])

  let annotations: Annotation[] = []
  let project: (pos: Vector2) => DOMPoint

  function setup(options: {
    project: (pos: Vector2) => DOMPoint
  }) {
    project = options.project
  }

  function isDirty() {
    return annotations.some(a => a.isDirty)
  }

  function addAnotation(annotation: Annotation | Annotation[]) {
    const toAdd = Array.isArray(annotation) ? annotation : [annotation]
    annotations.push(...toAdd)
    toAdd.forEach(a => {
      a.style(options.styleSheet.value.annotation)
      a.zoom(mapZoom.value, false)
    })
  }

  function removeAnotation(annotation: IAnnotation | IAnnotation[]) {
    const toRemove = new Set((Array.isArray(annotation) ? annotation : [annotation]).map(t => t.id))

    if (toRemove.has(selected.value?.id)) {
      selected.value.setSelected(false, false)
      selected.value = null
    }

    annotations = annotations.filter(t => !toRemove.has(t.id))
  }

  function draw(ctx: CanvasRenderingContext2D, canvasSize: Vector2) {
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
        const projection = project(t.scenePosition)
        const pos = new Vector2(projection.x, projection.y)
        t.updateScreenPosition(pos)
        t.isDirty = false
        return {
          annotation: t,
          screenPosition: pos
        }
      })
      .filter(t => t.annotation.shouldDraw(screen))

    renderAnnotationCount.value = annotationsToRender.length

    let renderQueue = []
    renderQueue.push(...annotationsToRender.filter(t => t.annotation.isPinned))
    renderQueue.push(...annotationsToRender.filter(t => t.annotation.isSelected))

    const renderQueueSet = new Set(renderQueue.map(t => t.annotation.id))

    renderWithOrder(annotationsToRender.filter(t => !renderQueueSet.has(t.annotation.id)))
    renderWithOrder(renderQueue)

  }

  function click(pos: Vector2, e: PointerEvent) {
    let isSelect = false

    const isTouch = e.pointerType === 'touch'
    let touchDistance = Number.MAX_VALUE;
    let touchAnnotation = null;

    for (let i = 0; i < annotations.length; i++) {
      const annotation = annotations[i];

      if (annotation.isSelected) continue
      if (!annotation.shouldSelectOnTap) continue

      if (annotation.pointInside(pos)) {
        isSelect = true
        selected.value = annotation
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

    if (!isSelect && touchAnnotation && touchDistance < 15) {
      isSelect = true;
      selected.value = touchAnnotation
    }

    if (!isSelect) {
      selected.value = null
    }

  }

  watchEffect(() => {
    annotations.forEach(a => a.style(options.styleSheet.value.annotations))
  })

  watch(selected, (value, old) => {
    if (old != null) old.setSelected(false, true)
    if (value != null) value.setSelected(true, true)
  })

  watch(pinned, (value, old) => {
    old.forEach(a => a.setPinned(false, true))
    value.forEach(a => a.setPinned(true, true))
  })

  watch(mapZoom, zoom => {
    annotations.forEach(a => a.zoom(zoom))
  })

  return {
    overlayDrawing: {
      isDirty,
      setup,
      draw,
      click,
    } as IOverlayDrawing,
    add: addAnotation,
    remove: removeAnotation,
    selected,
    pinned
  }

}
