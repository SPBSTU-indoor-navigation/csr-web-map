import { DetailLevelAnnotation, IGeoPosition } from '@/core/map/annotations/annotation'
import { Vector2 } from 'three'
import { Easing, Tween } from '@tweenjs/tween.js'
import { DetailLevelProcessor, DetailLevelState } from '@/core/map/annotations/detailLevelProcessor'
import { Animator } from '@/core/animator/animator'
import { modify, Color } from '@/core/shared/utils'
import { AnimatedAnnotation } from './animatedAnnotation'
import { clamp } from 'three/src/math/MathUtils'

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
    { state: DetailLevelState.big, size: 13 },
  ])

const detailLevelByCategory = (category: string): DetailLevel => {
  switch (category) {
    case 'restroom':
    case 'restroom.male':
    case 'restroom.female':
    case 'security':
      return DetailLevel.circleWithoutLabel
    case 'administration':
    case 'wardrobe':
    case 'ticket':
      return DetailLevel.circleWithoutLabel
    case 'souvenirs':
    case 'foodservice.coffee':
    case 'foodservice':
      return DetailLevel.circleWithoutLabel
    case 'auditorium':
    case 'classroom':
      return DetailLevel.pointSecondary
    default:
      return DetailLevel.pointSecondary
  }
}

const DEFAULT_RADIUS = 5

export class OccupantAnnotation extends AnimatedAnnotation<DetailLevel, DetailLevelState> {
  annotationParams = {
    point: {
      size: 1,
      offsetY: 0,
      strokeOpacity: 1,
      imageOpacity: 0
    },
    shape: {
      progress: 0,
    },
    miniPoint: {
      size: 0,
    },
    label: {
      offsetY: 0,
      opacity: 1,
      color: new Color('#D6862F'),
      scale: 1
    }
  }

  currentStyle = {
    pointFill: new Color('#ffae00'),
    pointStroke: new Color('#ffffff'),
    labelColor: new Color('#D6862F'),
    labelStroke: new Color('#ffffff'),
    pointStrokeWidth: 0.7,
    font: '700 11px apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  }

  constructor(localPosition: Vector2, data: any) {
    super(localPosition, data, detailLevelByCategory(data.properties.category), levelProcessor)

    const target = this.target
    this.loadImg()

    this.selectAnimation = new Animator(this.onAnim)
      .animateSpring(0.4, 0.4, { value: this.annotationParams.point, to: () => target.mainPoint(), duration: 1000 })
      .animateSpring(0.6, 0.4, { value: this.annotationParams.label, to: () => target.labelTransform(), duration: 1000 })
      .animateSpring(0.7, 0.3, { value: this.annotationParams.miniPoint, to: () => target.miniPoint(), duration: 1000, delay: 250 })
      .animate({ value: this.annotationParams.point, to: () => target.borderOpacity(), duration: 100, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.shape, to: () => target.shapeProgress(), duration: 200, delay: 50, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.label, to: () => target.labelOpacity(), duration: 200, delay: 50, easing: Easing.Quadratic.InOut })

    this.deSelectAnimation = new Animator(this.onAnim, [this.selectAnimation])
      .animateSpring(0.7, 0.3, { value: this.annotationParams.point, to: () => target.mainPoint(), duration: 1000 })
      .animate({ value: this.annotationParams.point, to: () => target.borderOpacity(), duration: 300, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.miniPoint, to: () => target.miniPoint(), duration: 300, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.shape, to: () => target.shapeProgress(), duration: 300, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.label, to: () => ({ ...target.labelOpacity(), ...target.labelTransform() }), duration: 100, easing: Easing.Quadratic.In })

    this.selectAnimation.addDependent(this.deSelectAnimation)

    modify(this.annotationParams.point, target.mainPoint())
    modify(this.annotationParams.label, target.labelTransform())
    modify(this.annotationParams.label, target.labelOpacity())
  }

  override changeState(state: DetailLevelState): void {
    super.changeState(state)
    const target = this.target

    this.animateChangeState(new Animator(this.onAnim)
      .animate({ value: this.annotationParams.point, to: () => ({ ...target.mainPoint(), ...target.borderOpacity() }), duration: 100, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.miniPoint, to: () => target.miniPoint(), duration: 300, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.label, to: () => ({ ...target.labelOpacity(), ...target.labelTransform() }), duration: 100, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.label, to: () => ({ ...target.labelOpacity(), ...target.labelTransform() }), duration: 100, easing: Easing.Quadratic.InOut })
    )
  }

  override style(styleSheet: any): void {
    const s = styleSheet.occupant
    const style = this.currentStyle
    const defaultStyle: { pointFill: string, labelFill: string, strokeColor: string } = s.default
    const annotation = s[this.data.properties.category] ?? defaultStyle

    const pointFill = annotation.pointFill ?? defaultStyle.pointFill

    style.pointFill.set(pointFill)
    style.labelColor.set(annotation.labelFill ?? pointFill)
    style.pointStroke.set(annotation.strokeColor ?? defaultStyle.strokeColor)
  }

  img: any

  async loadImg() {
    this.img = new Image()
    // @ts-ignore
    this.img.src = (await import('@/assets/annotations/administration.png')).default
  }

  override draw(ctx: CanvasRenderingContext2D): void {
    const { point, miniPoint, label, shape } = this.annotationParams

    const drawPoint = () => {
      ctx.fillStyle = this.currentStyle.pointFill.hex

      ctx.save()
      ctx.translate(0, point.offsetY)
      ctx.scale(point.size, point.size)

      ctx.save()
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


      if (point.imageOpacity > 0) {
        ctx.globalAlpha = clamp(point.imageOpacity, 0, 1)
        const aspect = this.img.height / this.img.width
        const size = 7
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        ctx.drawImage(this.img, -size / 2, -size * aspect / 2, size, size * aspect)

        ctx.imageSmoothingEnabled = false
      }

      ctx.restore()

      if (point.strokeOpacity > 0) {
        ctx.strokeStyle = this.currentStyle.pointStroke.withAlphaComponent(point.strokeOpacity).hex
        ctx.lineWidth = this.currentStyle.pointStrokeWidth
        ctx.stroke()
      }
    }

    const drawMiniPoint = () => {
      if (miniPoint.size > 0) {
        ctx.beginPath()
        ctx.arc(0, 0, miniPoint.size, 0, 2 * Math.PI)
        ctx.fillStyle = this.currentStyle.pointFill.hex
        ctx.fill()
      }
    }

    const drawLabel = () => {
      if (label.opacity == 0) return

      ctx.canvas.style.letterSpacing = '-0.3px';

      ctx.fillStyle = label.color.withAlphaComponent(label.opacity).hex
      ctx.font = this.currentStyle.font
      ctx.textAlign = 'center'
      ctx.lineWidth = 3
      ctx.textBaseline = 'top'
      ctx.strokeStyle = this.currentStyle.labelStroke.withAlphaComponent(label.opacity).hex

      ctx.lineJoin = 'round'

      const text = this.data.properties.shortName['ru']
      ctx.save()
      ctx.scale(label.scale, label.scale)
      ctx.strokeText(text, 0, label.offsetY + 5)
      ctx.fillText(text, 0, label.offsetY + 5)
      ctx.restore()

      ctx.canvas.style.letterSpacing = '0';
    }

    drawMiniPoint()
    drawPoint()
    drawLabel()



    super.draw(ctx)
  }

  private target = {
    mainPoint: () => {
      let scale = () => {
        if (this.isSelected) return 5
        if ([DetailLevel.circleWithoutLabel].includes(this.detailLevel)) {
          switch (this.state) {
            case DetailLevelState.big: return 1.7
            default: return 1.4
          }
        } else {
          switch (this.state) {
            case DetailLevelState.big: case DetailLevelState.normal: return 0.7
            default: return 0.5
          }
        }
      }

      let imageOpacity = () => {
        if (this.isSelected) return 1
        if ([DetailLevel.circleWithoutLabel].includes(this.detailLevel)) return 1
        return 0
      }


      return {
        size: scale(),
        offsetY: this.isSelected ? -35 : 0,
        imageOpacity: imageOpacity()
      }
    },
    borderOpacity: () => ({ strokeOpacity: this.isSelected ? 0 : 1 }),
    shapeProgress: () => ({ progress: this.isSelected ? 1 : 0 }),
    miniPoint: () => {
      const size = () => {
        if (this.isSelected) return 2
        return 0
      }

      return { size: size() }
    },
    labelTransform: () => {
      const color = () => {
        if (this.isSelected) return new Color('#000000')
        return new Color(this.currentStyle.labelColor.hex)
      }

      const offset = () => {
        if (this.isSelected) return -1
        return 0
      }

      const scale = () => {
        if (this.isSelected) return 1
        if ([DetailLevel.circleWithoutLabel].includes(this.detailLevel)) return 0.5
        return 1
      }

      return {
        offsetY: offset(),
        color: color(),
        scale: scale()
      }
    },
    labelOpacity: () => {
      const opacity = () => {
        if (this.isSelected) return 1
        if ([DetailLevel.circleWithoutLabel].includes(this.detailLevel)) return 0
        return [DetailLevelState.big].includes(this.state) ? 1 : 0
      }

      return {
        opacity: opacity(),
      }
    }
  }
}
