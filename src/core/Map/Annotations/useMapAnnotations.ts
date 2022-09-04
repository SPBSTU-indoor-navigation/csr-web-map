import { Vector2, Vector3, Camera } from 'three';
import { ref, watchEffect } from 'vue';
import { Annotation, IAnnotation } from './annotation';

export default function useMapAnnotations(options) {
  
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
      annotation.forEach(t => annotations.push(t))
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
      const pos = project(t.position)
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

      // ctx.fillRect(0, 0, 10, 10)
      t.annotation.draw(ctx)

      ctx.restore()
    })
  }


  return {
    add: addAnotation,
    render
  }

}
