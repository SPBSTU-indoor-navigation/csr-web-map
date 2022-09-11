import { Annotation, IGeoPosition } from '@/core/Map/Annotations/annotation'
import { Vector2 } from 'three'
import { Easing, Tween } from '@tweenjs/tween.js'


export class OccupantAnnotation extends Annotation {

  size = new Vector2(15, 15);
  pivot = new Vector2(0.5, 0.5)

  constructor(geoPosition: IGeoPosition, localPosition: Vector2, data: Object) {
    super(geoPosition, localPosition, data)
  }

  override setSelected(selected: boolean, animated: boolean): void {
    super.setSelected(selected, animated)

    new Tween(this.size)
      .to(selected ? { x: 50, y: 50 } : { x: 15, y: 15 }, 150)
      .easing(Easing.Quadratic.InOut)
      .onUpdate(t => {
        this.isDirty = true
      })
      .start()
  }

  override draw(ctx: CanvasRenderingContext2D): void {

    if (this.isSelected) {
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, this.size.x, this.size.y)
    }


    super.draw(ctx)
  }
}
