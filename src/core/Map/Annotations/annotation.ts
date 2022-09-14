import { Box2, Vector2 } from 'three'
import { DetailLevelProcessor, DetailLevelState } from './detailLevelProcessor'

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
  isSelected: boolean

  setSelected(selected: boolean, animated: boolean): void

  updateScreenPosition(pos: Vector2): void
  zoom(zoom: Number)
  draw(ctx: CanvasRenderingContext2D): void

  pointInside(pos: Vector2): boolean
  intersect(rect: Box2): boolean
}

export class Annotation<DetailLevel, State> implements IAnnotation {
  rect = new Box2()
  position: Vector2
  isDirty = true
  isSelected = false

  data = {}
  size = new Vector2(100, 100)
  pivot = new Vector2(0.5, 0.5)

  currentZoom: Number = 0

  detailLevel: DetailLevel;
  state: State
  evaluteDetailLevel: (detailLevel: DetailLevel, mapSize: Number) => State

  constructor(localPosition: Vector2, detailLevel: DetailLevel, data: any) {
    this.position = localPosition
    this.data = data
    this.detailLevel = detailLevel
  }

  setSelected(selected: boolean, animated: boolean): void {
    this.isSelected = selected
  }

  updateScreenPosition(pos: Vector2): void {
    this.rect.set({ x: pos.x, y: pos.y }, { x: pos.x + this.size.x, y: pos.y + this.size.y })
  }

  zoom(zoom: Number) {
    this.currentZoom = zoom
    const state = this.evaluteDetailLevel(this.detailLevel, zoom)
    if (state != this.state) {
      this.changeState(state)
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.drawDebug(ctx)
    this.isDirty = false
  }

  pointInside(pos: Vector2): boolean {
    return this.rect.containsPoint(pos)
  }

  intersect(rect: Box2): boolean {
    return this.rect.intersectsBox(rect)
  }

  changeState(state: State) {
    this.state = state
  }

  private drawDebug(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = '#f0f'
    ctx.strokeRect(0, 0, this.size.x, this.size.y)

    ctx.beginPath()
    ctx.arc(this.size.x * this.pivot.x, this.size.y * this.pivot.y, 2, 0, Math.PI * 2)
    ctx.stroke()
  }
}
