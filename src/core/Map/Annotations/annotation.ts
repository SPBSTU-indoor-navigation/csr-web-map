import { Box2, Vector2 } from 'three'

export interface IGeoPosition {
  latitude: number
  longitude: number
}

export interface IAnnotation {
  rect: Box2
  position: Vector2
  size: Vector2
  pivot: Vector2

  isDirty: boolean

  updatePosition(pos: Vector2): void
  draw(ctx: CanvasRenderingContext2D): void
  animationUpdate(): void
}

export class Annotation implements IAnnotation {
  rect = new Box2()
  position: Vector2
  isDirty = true


  data = {}
  size = new Vector2(100, 100)
  pivot = new Vector2(0.5, 0.5)

  constructor(geoPosition: IGeoPosition, localPosition: Vector2, data: Object) {
    this.position = localPosition
    this.data = data
  }

  updatePosition(pos: Vector2): void {
    this.rect.setFromCenterAndSize(pos, this.size)
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.drawDebug(ctx)
    this.isDirty = false
  }

  animationUpdate(): void {

  }


  private drawDebug(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = '#f0f'
    ctx.strokeRect(0, 0, this.size.x, this.size.y)

    ctx.beginPath()
    ctx.arc(this.size.x * this.pivot.x, this.size.y * this.pivot.y, 2, 0, Math.PI * 2)
    ctx.stroke()
  }
}
