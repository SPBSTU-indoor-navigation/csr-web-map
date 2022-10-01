import { Box2, Vector2 } from 'three'
import { DetailLevelProcessor, DetailLevelState } from './detailLevelProcessor'
import { Bounds, Size } from './bounds'
import { v4 as uuidv4 } from 'uuid';

export interface IGeoPosition {
  latitude: number
  longitude: number
}

export interface IAnnotation {
  id: string

  scenePosition: Vector2
  isDirty: boolean
  isSelected: boolean

  frame: Box2
  bounds: Bounds

  zoom(zoom: number, animated?: boolean): void
  setSelected(selected: boolean, animated: boolean): void
  updateScreenPosition(pos: Vector2): void

  pointInside(pos: Vector2): boolean
  intersect(rect: Box2): boolean

  draw(ctx: CanvasRenderingContext2D): void
  shouldDraw(screen: Box2): boolean
  style(styleSheet: any): void

  get renderOrder(): number
  get shouldSelectOnTap(): boolean
}

export class Shape2D {
  frame = new Box2()
  bounds = new Bounds()
  boundingBox = new Box2(new Vector2(-10, -10), new Vector2(10, 10))
  screenPosition = new Vector2()

  constructor(width: number = 50, height: number = 50, pivot: Vector2 = new Vector2(0.5, 0.5)) {
    this.bounds = new Bounds(new Size(width, height), pivot)
  }

  updateScreenPosition(pos: Vector2) {
    const rect = this.bounds.rect
    this.frame.set(new Vector2(rect.min.x + pos.x, rect.min.y + pos.y), new Vector2(rect.max.x + pos.x, rect.max.y + pos.y))
    this.screenPosition = pos
  }

  updateBBox(width: number, height: number, offset: { x: number, y: number } = { x: 0, y: 0 }) {
    this.boundingBox.set(
      new Vector2(-width / 2 + offset.x, -height / 2 + offset.y),
      new Vector2(width / 2 + offset.x, height / 2 + offset.y))
  }
}

export class Annotation extends Shape2D implements IAnnotation {
  id: string
  scenePosition: Vector2

  isDirty = true
  isSelected = false

  protected currentZoom: number = 0
  protected data: any = {}

  constructor(localPosition: Vector2, data: any) {
    super()
    this.id = uuidv4()
    this.scenePosition = localPosition
    this.data = data
  }

  get renderOrder(): number {
    return 0
  }

  get shouldSelectOnTap(): boolean {
    return true
  }

  setSelected(selected: boolean, animated: boolean): void {
    this.isSelected = selected
  }

  zoom(zoom: number, animated: boolean = true) {
    this.currentZoom = zoom
  }

  pointInside(pos: Vector2): boolean {
    return this.frame.containsPoint(pos)
  }

  intersect(rect: Box2): boolean {
    return this.frame.intersectsBox(rect)
  }

  shouldDraw(screen: Box2): boolean {
    const bounding = new Box2(
      new Vector2(this.boundingBox.min.x + this.screenPosition.x, this.boundingBox.min.y + this.screenPosition.y),
      new Vector2(this.boundingBox.max.x + this.screenPosition.x, this.boundingBox.max.y + this.screenPosition.y));
    return screen.intersectsBox(bounding)
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.isDirty = false
  }

  style(styleSheet: any): void { }

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

  override zoom(zoom: number, animated: boolean) {
    this.currentZoom = zoom
    const state = this.evaluteDetailLevel(this.detailLevel, zoom)
    if (state != this.state) {
      this.changeState(state, animated)
    }
  }

  protected changeState(state: State, animated: boolean) {
    this.state = state
  }
}
