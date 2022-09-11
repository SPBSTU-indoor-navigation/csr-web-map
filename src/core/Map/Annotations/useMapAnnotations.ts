import { Vector2, Vector3, Camera } from 'three';
import { Ref, ref, watchEffect } from 'vue';
import { MapController } from '../mapController';
import { Annotation, IAnnotation } from './annotation';
import Tween from '@tweenjs/tween.js'

export interface IMapAnnotations {
  selected: Ref<IAnnotation | null>
  add(annotation: IAnnotation | IAnnotation[]): void
  remove(annotation: IAnnotation | IAnnotation[]): void
  select(annotation: IAnnotation | null): void

  render(options: { cam: Camera }): void
  click(pos: Vector2, e: PointerEvent): void
}

export default function useMapAnnotations(options: { mapController: MapController }): IMapAnnotations {

  let canvasSize: Vector2
  const selected = ref<IAnnotation | null>(null)

  const screenSize = ref({ width: window.innerWidth, height: window.innerHeight })
  window.addEventListener('resize', () => { screenSize.value = { width: window.innerWidth, height: window.innerHeight } }, false);

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  document.querySelector('.mk-map-view')!.insertBefore(canvas, document.querySelector(".mk-map-view>.mk-map-node-element"))

  watchEffect(() => {
    const { width, height } = screenSize.value
    canvas.width = width * window.devicePixelRatio
    canvas.height = height * window.devicePixelRatio
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    canvasSize = new Vector2(width, height)
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
  })

  let annotations: IAnnotation[] = []

  const addAnotation = (annotation: IAnnotation | IAnnotation[]) => {
    if (Array.isArray(annotation)) {
      annotations.push(...annotation)
    } else {
      annotations.push(annotation)
    }
  }

  const removeAnotation = (annotation: IAnnotation | IAnnotation[]) => {
    // @ts-ignore: ES6 Set
    const toRemove = new Set(annotation)

    if (toRemove.has(selected.value)) {
      select(null, false)
    }

    annotations = annotations.filter(t => !toRemove.has(t))
  }

  const render = (options: {
    cam: Camera
  }) => {
    const { cam } = options

    const project = (pos: Vector2) => {
      const v = new Vector3(pos.x, pos.y, 0)
      v.project(cam)
      v.x = ((v.x + 1) / 2)
      v.y = ((-v.y + 1) / 2)


      return new Vector2(v.x * canvasSize.x, v.y * canvasSize.y)
    }

    const draw = (annotation) => {
      ctx.save()
      ctx.translate(annotation.screenPosition.x, annotation.screenPosition.y)

      annotation.annotation.draw(ctx)

      ctx.restore()
    }


    const annotationsToRender = annotations.map(t => {
      const pos = project(t.position).add(new Vector2(-t.size.x * t.pivot.x, -t.size.y * t.pivot.y))
      t.updateScreenPosition(pos)
      return {
        annotation: t,
        screenPosition: pos
      }
    })

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    let renderQueue = []
    for (let i = 0; i < annotationsToRender.length; i++) {
      const annotation = annotationsToRender[i]

      if (annotation.annotation.isSelected) {
        renderQueue.push(annotationsToRender[i])
      } else {
        draw(annotation)
      }
    }

    renderQueue.forEach(t => draw(t))
  }

  const select = (annotation: IAnnotation | null, animated: boolean = true) => {
    selected.value?.setSelected(false, animated)

    selected.value = annotation

    selected.value?.setSelected(true, animated)
  }

  const click = (pos: Vector2, e: PointerEvent) => {
    let selected = false

    const isTouch = e.pointerType === 'touch'
    let touchDistance = Number.MAX_VALUE;
    let touchAnnotation = null;

    for (let i = 0; i < annotations.length; i++) {
      const annotation = annotations[i];

      if (annotation.isSelected) continue

      if (annotation.pointInside(pos)) {
        selected = true
        select(annotation)
        break;
      }

      if (isTouch) {
        let distance = annotation.rect.distanceToPoint(pos)
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

  const updateEveryFrame = () => {
    Tween.update()

    requestAnimationFrame(updateEveryFrame)
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
    select,
    selected
  }

}
