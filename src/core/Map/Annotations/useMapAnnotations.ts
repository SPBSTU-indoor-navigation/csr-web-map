import { Vector2, Vector3, Camera } from 'three';
import { ref, watchEffect } from 'vue';
import { MapController } from '../mapController';
import { Annotation, IAnnotation } from './annotation';
import Tween from '@tweenjs/tween.js'

export interface IMapAnnotations {
  add(annotation: IAnnotation | IAnnotation[]): void
  render(options: { cam: Camera }): void
}

export default function useMapAnnotations(options: { mapController: MapController }): IMapAnnotations {

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
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
  })

  const annotations: IAnnotation[] = []

  const addAnotation = (annotation: IAnnotation | IAnnotation[]) => {
    if (Array.isArray(annotation)) {
      annotations.push(...annotation)
    } else {
      annotations.push(annotation)
    }
  }

  const render = (options: {
    cam: Camera
  }) => {
    const { cam } = options

    const project = (pos: Vector2) => {
      const v = new Vector3(pos.x, pos.y, 0)
      v.project(cam)
      return new Vector2(((v.x + 1) / 2) * canvas.width / 2, ((-v.y + 1) / 2) * canvas.height / 2)
    }

    const annotationsToRender = annotations.map(t => {
      const pos = project(t.position).add(new Vector2(-t.size.x * t.pivot.x, -t.size.y * t.pivot.y))
      t.updatePosition(pos)
      return {
        annotation: t,
        screenPosition: pos
      }
    })


    ctx.clearRect(0, 0, canvas.width, canvas.height)

    annotationsToRender.forEach(t => {
      ctx.save()
      ctx.translate(t.screenPosition.x, t.screenPosition.y)

      t.annotation.draw(ctx)

      ctx.restore()
    })
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
    render,
  }

}
