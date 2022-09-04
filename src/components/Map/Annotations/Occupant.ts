import { Annotation, IGeoPosition } from '@/core/Map/Annotations/annotation'
import { Vector2 } from 'three'
import { Easing, Tween } from '@tweenjs/tween.js'


export class OccupantAnnotation extends Annotation {

  size = new Vector2(50, 50);
  pivot = new Vector2(0.5, 1)

  constructor(geoPosition: IGeoPosition, localPosition: Vector2, data: Object) {
    super(geoPosition, localPosition, data)
    new Tween(this.pivot)
      .to({ x: 0.5, y: 0 }, 1000)
      .easing(Easing.Quadratic.InOut)
      .repeat(Infinity)
      .repeatDelay(1000)
      .yoyo(true)
      .onUpdate(t => {
        this.isDirty = true
      })
    // .start()

    new Tween(this.size)
      .to({ x: 10, y: 10 }, 1000)
      .easing(Easing.Quadratic.InOut)
      .repeat(Infinity)
      .repeatDelay(1000)
      .yoyo(true)
      .onUpdate(t => {
        this.isDirty = true
      })
    // .start()
  }

  draw(ctx: CanvasRenderingContext2D): void {
    super.draw(ctx)

  }
}
