import { Animator } from '@/core/animator/animator'
import Building from '@/core/imdf/building'
import Level from '@/core/imdf/level'
import { AnnotationBakery, TextBakery } from '@/core/map/annotations/bakery'
import { DetailLevelProcessor, DetailLevelState } from '@/core/map/annotations/detailLevelProcessor'
import { Color } from '@/core/shared/color'
import { LocalizedString } from '@/core/shared/localizedString'
import { applyTextParams, drawTextWithCurrentParams, modify, multiLineText, TextParams } from '@/core/shared/utils'
import { Easing } from '@tweenjs/tween.js'
import { Box2, Vector2 } from 'three'
import { clamp } from 'three/src/math/MathUtils'
import { AnimatedAnnotation } from '../animatedAnnotation'
import { AnnotationImages } from '../annotationImages'

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
  declare data: {
    properties?: {
      name: LocalizedString
      shortName: LocalizedString
      category: string,
      email: string,
      phone: string,
      website: string,
      address: any
    }
  }

  building: Building
  level: Level

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
      scale: 1,
    }
  }

  currentStyle = {
    pointFill: new Color('#ffae00'),
    pointStroke: new Color('#ffffff'),
    labelColor: new Color('#D6862F'),
    labelStroke: new Color('#ffffff'),
    pointStrokeWidth: 0.7,
    font: '700 11px apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    labelBBox: undefined
  }

  img: HTMLImageElement | null = null

  updateTargetBBox() {
    if (!this.currentStyle.labelBBox) return

    const h = this.currentStyle.labelBBox.height
    const s = this.isSelected ? 70 : 20
    const bubble = new Box2().setFromCenterAndSize(new Vector2(0, this.isSelected ? -s / 2 : 0), new Vector2(s, s))
    const label = new Box2().setFromCenterAndSize(new Vector2(0, h / 2 + 3), new Vector2(this.currentStyle.labelBBox.width, h))

    if (this.target.labelOpacity().opacity != 0) bubble.union(label)
    const center = bubble.getCenter(new Vector2())
    const size = bubble.getSize(new Vector2())
    this.updateBBox(size.width, size.height, center)
  }

  constructor(localPosition: Vector2, data: any, level: Level) {
    data.properties.name = new LocalizedString(data.properties.name)
    data.properties.shortName = new LocalizedString(data.properties.shortName)

    super(localPosition, data, detailLevelByCategory(data.properties.category), levelProcessor)
    this.level = level

    const target = this.target

    this.selectAnimation = new Animator(this.onAnim)
      .animateSpring(0.4, 0.4, { value: this.annotationParams.point, to: () => target.mainPoint(), duration: 1000 })
      .animateSpring(0.6, 0.4, { value: this.annotationParams.label, to: () => target.labelTransform(), duration: 1000 })
      .animateSpring(0.7, 0.3, { value: this.annotationParams.miniPoint, to: () => target.miniPoint(), duration: 1000, delay: 250 })
      .animate({ value: this.annotationParams.point, to: () => target.borderOpacity(), duration: 100, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.shape, to: () => target.shapeProgress(), duration: 200, delay: 50, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.label, to: () => target.labelOpacity(), duration: 200, delay: 50, easing: Easing.Quadratic.InOut })
      .onStart(() => { this.updateTargetBBox() })

    this.deSelectAnimation = new Animator(this.onAnim, [this.selectAnimation])
      .animateSpring(0.7, 0.3, { value: this.annotationParams.point, to: () => target.mainPoint(), duration: 1000 })
      .animate({ value: this.annotationParams.point, to: () => target.borderOpacity(), duration: 300, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.miniPoint, to: () => target.miniPoint(), duration: 300, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.shape, to: () => target.shapeProgress(), duration: 300, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.label, to: () => ({ ...target.labelOpacity(), ...target.labelTransform() }), duration: 100, easing: Easing.Quadratic.In })
      .onEnd(() => { this.updateTargetBBox() })

    this.selectAnimation.addDependent(this.deSelectAnimation)

    modify(this.annotationParams.point, target.mainPoint())
    modify(this.annotationParams.label, target.labelTransform())
    modify(this.annotationParams.label, target.labelOpacity())

    this.img = AnnotationImages.instance.getImage(data.properties.category)
  }

  override changeState(state: DetailLevelState, animated: boolean): void {
    super.changeState(state, animated)
    const target = this.target

    const labelOpacity = target.labelOpacity()

    this.animateChangeState(new Animator(this.onAnim)
      .animate({ value: this.annotationParams.point, to: () => ({ ...target.mainPoint(), ...target.borderOpacity() }), duration: 100, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.miniPoint, to: () => target.miniPoint(), duration: 300, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.label, to: () => ({ ...labelOpacity, ...target.labelTransform() }), duration: 100, easing: Easing.Quadratic.InOut })
      .onEnd(() => { if (labelOpacity.opacity == 0) this.updateTargetBBox() })
      .onStart(() => { if (labelOpacity.opacity != 0) this.updateTargetBBox() }),
      animated
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

  measureText(ctx: CanvasRenderingContext2D) {
    if (this.currentStyle.labelBBox) return;

    const params = this.textParams()
    applyTextParams(params, ctx)
    ctx.lineJoin = 'round'
    ctx.textBaseline = 'top'
    const text = multiLineText(this.data.properties.shortName.bestLocalizedValue, 80, ctx)

    const hasSpacing = ctx['letterSpacing'] != undefined && params.letterSpacing != 0

    this.currentStyle.labelBBox = {
      width: text.width + params.strokeWidth - (hasSpacing ? params.letterSpacing : 0),
      height: params.textLineHeight * text.lineCount + params.strokeWidth
    }

    this.updateTargetBBox()
  }

  override draw(ctx: CanvasRenderingContext2D): void {
    const { point, miniPoint, label, shape } = this.annotationParams

    const drawImage = (ctx: CanvasRenderingContext2D) => {
      if (point.imageOpacity > 0 && this.img) {
        ctx.globalAlpha = clamp(point.imageOpacity, 0, 1)

        const aspect = this.img.width / this.img.height
        const size = 6
        const width = this.img.width > this.img.height ? size : size * aspect
        const height = this.img.width > this.img.height ? size / aspect : size

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(this.img, -width / 2, -height / 2, width, height)
      }
    }

    const drawPoint = (ctx: CanvasRenderingContext2D) => {
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
        ctx.moveTo(-10, -15)
        ctx.lineTo(-10, -10)
        ctx.bezierCurveTo(-5, -8, -3, -4, -2, -2)
        ctx.bezierCurveTo(0, 0, 0, 0, 2, -2)
        ctx.bezierCurveTo(3, -4, 5, -8, 10, -10)
        ctx.lineTo(10, -15)
        ctx.fill()
      }

      ctx.restore()

      drawImage(ctx)

      ctx.restore()

      if (point.strokeOpacity > 0) {
        ctx.strokeStyle = this.currentStyle.pointStroke.withAlphaComponent(point.strokeOpacity).hex
        ctx.lineWidth = this.currentStyle.pointStrokeWidth
        ctx.stroke()
      }
    }

    const drawMiniPoint = (ctx: CanvasRenderingContext2D) => {
      if (miniPoint.size > 0) {
        ctx.beginPath()
        ctx.arc(0, 0, miniPoint.size, 0, 2 * Math.PI)
        ctx.fillStyle = this.currentStyle.pointFill.hex
        ctx.fill()
      }
    }

    const drawLabel = (ctx: CanvasRenderingContext2D) => {
      if (label.opacity == 0) return

      applyTextParams(this.textParams(), ctx)
      ctx.lineJoin = 'round'
      ctx.textBaseline = 'top'
      const text = multiLineText(this.data.properties.shortName.bestLocalizedValue, 80, ctx)

      ctx.save()
      ctx.scale(label.scale, label.scale)
      ctx.translate(0, label.offsetY + 5)
      drawTextWithCurrentParams(text.text, ctx)
      ctx.restore()
    }

    const isAnim = this.isSelected || this.selectAnimation.isPlaying || this.deSelectAnimation.isPlaying || this.chaneStateAnimator?.isPlaying
    drawMiniPoint(ctx)

    if (isAnim) {
      drawPoint(ctx)
    } else {
      AnnotationBakery.instance.bakeAndRender({
        name: `point_${this.currentStyle.pointFill.hex}_${Math.round(point.size * 1000) / 1000}_${this.data.properties.category}`,
        size: { width: DEFAULT_RADIUS * point.size * 2, height: DEFAULT_RADIUS * point.size * 2 },
        draw: drawPoint,
        ctx
      })
    }

    if (isAnim || label.opacity != 1) {
      drawLabel(ctx)
    } else {
      const text = this.data.properties.shortName.bestLocalizedValue
      TextBakery.instance.bakeAndRender({
        name: `label_${text}_${this.currentStyle.labelColor.hex}`,
        text, ctx, maxWidth: 80,
        params: { fill: label.color.hex, },
        offsetY: label.offsetY + 5 - 3
      })
    }

    this.measureText(ctx)

    super.draw(ctx)
  }

  private textParams(): TextParams {
    return {
      font: this.currentStyle.font,
      fill: this.annotationParams.label.color.withAlphaComponent(this.annotationParams.label.opacity).hex,
      stroke: this.currentStyle.labelStroke.withAlphaComponent(this.annotationParams.label.opacity).hex,
      align: 'center',
      strokeWidth: 3,
      letterSpacing: -0.3,
      textLineHeight: 11
    }
  }

  private target = {
    mainPoint: () => {
      let scale = () => {
        if (this.isSelected) return 5.5
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
        offsetY: this.isSelected ? -38 : 0,
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
