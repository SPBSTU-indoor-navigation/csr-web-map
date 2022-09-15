import { DetailLevelAnnotation, IGeoPosition } from '@/core/Map/Annotations/annotation'
import { Vector2 } from 'three'
import { Easing, Tween } from '@tweenjs/tween.js'
import { DetailLevelProcessor, DetailLevelState } from '@/core/Map/Annotations/detailLevelProcessor'
import { Animator } from '@/core/animator/animator'

enum DetailLevel {
  circlePrimary,
  circleSecondary,
  circleWithoutLabel,
  pointPrimary,
  pointSecondary,
}

const levelProcessor = new DetailLevelProcessor<DetailLevel, DetailLevelState>()
  .addLevel(DetailLevel.circleWithoutLabel, [
    { state: DetailLevelState.min, size: 0 },
    { state: DetailLevelState.normal, size: 1 },
    { state: DetailLevelState.big, size: 20 },
  ])
  .addLevel(DetailLevel.pointPrimary, [
    { state: DetailLevelState.min, size: 19.6 },
    { state: DetailLevelState.normal, size: 20.2 },
    { state: DetailLevelState.big, size: 21.5 },
  ])
  .addLevel(DetailLevel.pointSecondary, [
    { state: DetailLevelState.hide, size: 1 },
    { state: DetailLevelState.min, size: 2 },
    { state: DetailLevelState.normal, size: 7 },
    { state: DetailLevelState.big, size: 20 },
  ])


const DEFAULT_RADIUS = 10

export class OccupantAnnotation extends DetailLevelAnnotation<DetailLevel, DetailLevelState> {
  size = new Vector2(DEFAULT_RADIUS, DEFAULT_RADIUS);
  pivot = new Vector2(0.5, 0.5)

  selectAnimation = new Animator(() => this.isDirty = true)
    .animate({ value: this.size, to: () => this.targetSize(), duration: 500 })
    .animate({ value: this.pivot, to: { x: 0.5, y: 1 }, duration: 200, delay: 300 })

  deSelectAnimation = new Animator(() => this.isDirty = true)
    .animate({ value: this.size, to: () => this.targetSize(), duration: 500, easing: Easing.Quadratic.Out })
    .animate({ value: this.pivot, to: { x: 0.5, y: 0.5 }, duration: 200, easing: Easing.Quadratic.Out })

  constructor(localPosition: Vector2, data: any) {
    super(localPosition, detailLevelByCategory(data.properties?.category), data)
    this.evaluteDetailLevel = (detailLevel: DetailLevel, mapSize: number) => levelProcessor.evaluate(detailLevel, mapSize)
  }

  override setSelected(selected: boolean, animated: boolean): void {
    super.setSelected(selected, animated)

    if (selected) {
      this.selectAnimation.start()
    }
    else {
      this.deSelectAnimation.start()
    }
  }

  override changeState(state: DetailLevelState): void {
    super.changeState(state)
    this.isDirty = true
  }

  override draw(ctx: CanvasRenderingContext2D): void {
    if (this.isSelected) {
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, this.size.x, this.size.y)
    }

    ctx.fillStyle = '#000'
    ctx.fillText(DetailLevelState[this.state], 0, 24)
    super.draw(ctx)
  }


  private targetSize = () => {
    let scale = () => {
      if ([DetailLevel.circleWithoutLabel].includes(this.detailLevel)) {
        switch (this.state) {
          case DetailLevelState.big: return 2
          default: return 1.6
        }
      } else {
        switch (this.state) {
          case DetailLevelState.big: case DetailLevelState.normal: case DetailLevelState.min: return 0.8
          default: return 0.6
        }
      }
    }

    if (this.isSelected) return { x: DEFAULT_RADIUS * 7, y: DEFAULT_RADIUS * 7 }

    const m = scale()
    return { x: DEFAULT_RADIUS * m, y: DEFAULT_RADIUS * m }
  }
}




const detailLevelByCategory = (category: string): DetailLevel => {
  switch (category) {
    case 'restroom':
    case 'restroomMale':
    case 'restroomFemale':
    case 'security':
      return DetailLevel.circleWithoutLabel
    case 'administration':
    case 'wardrobe':
    case 'ticket':
      return DetailLevel.circleWithoutLabel
    case 'souvenirs':
    case 'foodserviceСoffee':
    case 'foodservice':
      return DetailLevel.circleWithoutLabel
    case 'auditorium':
    case 'classroom':
      return DetailLevel.pointSecondary
    default:
      return DetailLevel.pointSecondary
  }
}