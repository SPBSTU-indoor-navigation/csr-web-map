import { DetailLevelAnnotation, IGeoPosition } from '@/core/Map/Annotations/annotation'
import { Vector2 } from 'three'
import { Easing, Tween } from '@tweenjs/tween.js'
import { DetailLevelProcessor, DetailLevelState } from '@/core/Map/Annotations/detailLevelProcessor'
import { Animator } from '@/core/animator/animator'
import { Size } from '@/core/Map/Annotations/bounds'
import { modify, Color } from '@/core/shared/utils'

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


const DEFAULT_RADIUS = 5

export class OccupantAnnotation extends DetailLevelAnnotation<DetailLevel, DetailLevelState> {
  selectAnimation: Animator
  deSelectAnimation: Animator

  annotationParams = {
    point: {
      size: 1,
      offsetY: 0,
      strokeOpacity: 1,
    },
    shape: {
      progress: 0,
    },
    miniPoint: {
      size: 0,
    },
    label: {
      offsetY: 0,
      opacity: 0,
      color: new Color('#ffab00')
    }
  }

  style = {
    pointFill: new Color('#ffae00'),
    pointStroke: new Color('#ffffff'),
    pointStrokeWidth: 0.7,
  }

  onAnim = () => {
    this.isDirty = true
    this.bounds.updateRect()
  }

  constructor(localPosition: Vector2, data: any) {
    super(localPosition, detailLevelByCategory(data.properties?.category), data, (detailLevel: DetailLevel, mapSize: number) => levelProcessor.evaluate(detailLevel, mapSize))
    this.bounds.set({ size: new Size(15, 15), pivot: new Vector2(0.5, 0.5) })

    const target = this.target

    this.selectAnimation = new Animator(this.onAnim)
      .animateSpring(0.4, 0.4, { value: this.annotationParams.point, to: () => target.mainPoint(), duration: 1000 })
      .animateSpring(0.7, 0.3, { value: this.annotationParams.miniPoint, to: () => ({ size: target.miniPoint() }), duration: 1000, delay: 250 })
      .animate({ value: this.annotationParams.point, to: () => ({ strokeOpacity: target.borderOpacity() }), duration: 100, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.shape, to: () => ({ progress: target.shapeProgress() }), duration: 200, delay: 50, easing: Easing.Quadratic.InOut })

    this.deSelectAnimation = new Animator(this.onAnim, [this.selectAnimation])
      .animateSpring(0.7, 0.3, { value: this.annotationParams.point, to: () => target.mainPoint(), duration: 1000 })
      .animate({ value: this.annotationParams.point, to: () => ({ strokeOpacity: target.borderOpacity() }), duration: 300, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.miniPoint, to: () => ({ size: target.miniPoint() }), duration: 300, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.shape, to: () => ({ progress: target.shapeProgress() }), duration: 300, easing: Easing.Quadratic.InOut })

    this.selectAnimation.addDependent(this.deSelectAnimation)

    modify(this.annotationParams.point, target.mainPoint(), false)
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

    const change = new Animator(this.onAnim)
      .animate({ value: this.annotationParams.point, to: () => this.target.mainPoint(), duration: 100, easing: Easing.Quadratic.InOut })

    if (this.selectAnimation.isPlaying) {
      this.selectAnimation.onEnd(() => change.start())
    } else if (this.deSelectAnimation.isPlaying) {
      this.deSelectAnimation.onEnd(() => change.start())
    } else {
      change.start()
    }

    this.isDirty = true
  }


  override draw(ctx: CanvasRenderingContext2D): void {
    const { point, miniPoint, label, shape } = this.annotationParams

    if (miniPoint.size > 0) {
      ctx.beginPath()
      ctx.arc(0, 0, miniPoint.size, 0, 2 * Math.PI)
      ctx.fillStyle = this.style.pointFill.hex
      ctx.fill()
    }

    ctx.fillStyle = this.style.pointFill.hex

    {
      ctx.save()
      ctx.translate(0, point.offsetY)
      ctx.scale(point.size, point.size)

      ctx.beginPath()
      ctx.arc(0, 0, DEFAULT_RADIUS, 0, 2 * Math.PI)
      ctx.fill()

      if (shape.progress > 0) {
        ctx.translate(0, 6.1 - (1 - shape.progress))
        ctx.scale(1 / 8, 1 / 8 * shape.progress)
        ctx.moveTo(-10, -10)
        ctx.bezierCurveTo(-5, -8, -3, -4, -1.5, -2)
        ctx.bezierCurveTo(0, 0, 0, 0, 1.5, -2)
        ctx.bezierCurveTo(3, -4, 5, -8, 10, -10)
        ctx.fill()
      }

      ctx.restore()
    }

    if (point.strokeOpacity > 0) {
      ctx.strokeStyle = this.style.pointStroke.withAlphaComponent(point.strokeOpacity).hex
      ctx.lineWidth = this.style.pointStrokeWidth
      ctx.stroke()
    }

    super.draw(ctx)
  }

  private target = {
    mainPoint: () => {
      let scale = () => {
        if ([DetailLevel.circleWithoutLabel].includes(this.detailLevel)) {
          switch (this.state) {
            case DetailLevelState.big: return 1.5
            default: return 1.2
          }
        } else {
          switch (this.state) {
            case DetailLevelState.big: case DetailLevelState.normal: return 0.7
            default: return 0.5
          }
        }
      }

      if (this.isSelected) return {
        size: 5,
        offsetY: -35
      }

      return {
        size: scale(),
        offsetY: 0
      }
    },
    borderOpacity: () => this.isSelected ? 0 : 1,
    shapeProgress: () => this.isSelected ? 1 : 0,
    miniPoint: () => {
      const size = () => {
        if (this.isSelected) return 2
        return 0
      }

      return size()
    }
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
