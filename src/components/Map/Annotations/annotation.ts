import { Box2, Vector2 } from 'three'

interface IGeoPosition {
  latitude: number
  longitude: number
}

export interface IAnnotation { 
  rect: Box2
  position: Vector2

  isDirty: boolean

  updatePosition(pos: Vector2): void
  draw(ctx: CanvasRenderingContext2D): void
  animationUpdate(): void
}

export class Annotation implements IAnnotation {
  rect = new Box2()
  position: Vector2
  isDirty = true


  data = { }
  size = new Vector2(100, 100)

  constructor(geoPosition: IGeoPosition, localPosition: Vector2, data: Object) {
    this.position = localPosition
    this.data = data
    this.updatePosition(localPosition)
  }

  updatePosition(pos: Vector2): void {
    this.rect.setFromCenterAndSize(pos, this.size)
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = '#f0f'
    ctx.strokeRect(this.rect.min.x, this.rect.min.y, this.size.x, this.size.y)
  }

  animationUpdate(): void {
    
  }
}
