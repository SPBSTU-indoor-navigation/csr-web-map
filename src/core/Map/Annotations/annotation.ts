import { Box2, Vector2 } from 'three'
import { DetailLevelProcessor, DetailLevelState } from './detailLevelProcessor'
import { Bounds, Size } from './bounds'

export interface IGeoPosition {
  latitude: number
  longitude: number
}

export interface IAnnotation {
  scenePosition: Vector2
  isDirty: boolean
  isSelected: boolean

  frame: Box2
  bounds: Bounds

  zoom(zoom: number): void
  setSelected(selected: boolean, animated: boolean): void
  updateScreenPosition(pos: Vector2): void

  pointInside(pos: Vector2): boolean
  intersect(rect: Box2): boolean

  draw(ctx: CanvasRenderingContext2D): void
}

class Shape2D {
  frame = new Box2()
  bounds = new Bounds()

  constructor(width: number = 50, height: number = 50, pivot: Vector2 = new Vector2(0.5, 0.5)) {
    this.bounds = new Bounds(new Size(width, height), pivot)
  }

  updateScreenPosition(pos: Vector2) {
    const rect = this.bounds.rect
    this.frame.set(new Vector2(rect.min.x + pos.x, rect.min.y + pos.y), new Vector2(rect.max.x + pos.x, rect.max.y + pos.y))
  }
}

export class Annotation extends Shape2D implements IAnnotation {
  scenePosition: Vector2

  isDirty = true
  isSelected = false

  protected currentZoom: number = 0
  protected data = {}

  constructor(localPosition: Vector2, data: any) {
    super()
    this.scenePosition = localPosition
    this.data = data
  }

  setSelected(selected: boolean, animated: boolean): void {
    this.isSelected = selected
  }

  zoom(zoom: number) {
    this.currentZoom = zoom
  }

  pointInside(pos: Vector2): boolean {
    return this.frame.containsPoint(pos)
  }

  intersect(rect: Box2): boolean {
    return this.frame.intersectsBox(rect)
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // this.drawDebug(ctx)
    this.isDirty = false
  }

  private drawDebug(ctx: CanvasRenderingContext2D): void {
    const bounds = this.bounds
    ctx.strokeStyle = '#f0f'
    ctx.strokeRect(bounds.rect.min.x, bounds.rect.min.y, bounds.size.width, bounds.size.height)

    ctx.beginPath()
    ctx.arc(0, 0, 2, 0, Math.PI * 2)
    ctx.stroke()
  }

}

export class DetailLevelAnnotation<DetailLevel, State> extends Annotation {
  protected detailLevel: DetailLevel;
  protected state: State
  protected evaluteDetailLevel: (detailLevel: DetailLevel, mapSize: number) => State

  constructor(localPosition: Vector2, detailLevel: DetailLevel, data: any, evaluteDetailLevel: (detailLevel: DetailLevel, mapSize: number) => State) {
    super(localPosition, data)
    this.detailLevel = detailLevel
    this.evaluteDetailLevel = evaluteDetailLevel
  }

  override zoom(zoom: number) {
    this.currentZoom = zoom
    const state = this.evaluteDetailLevel(this.detailLevel, zoom)
    if (state != this.state) {
      this.changeState(state)
    }
  }

  protected changeState(state: State) {
    this.state = state
  }
}
