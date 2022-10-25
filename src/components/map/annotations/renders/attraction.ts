import { Animator } from "@/core/animator/animator";
import { AnnotationBakery, TextBakery } from "@/core/map/overlayDrawing/annotations/bakery";
import { Size } from "@/core/map/overlayDrawing/annotations/bounds";
import { DetailLevelProcessor, DetailLevelState } from "@/core/map/overlayDrawing/annotations/detailLevelProcessor";
import { Color } from "@/core/shared/color";
import { LocalizedString } from "@/core/shared/localizedString";
import { applyTextParams, clamp, drawTextWithCurrentParams, modify, multiLineText, TextParams } from "@/core/shared/utils";
import { Easing } from "@tweenjs/tween.js";
import { Box2, Vector2 } from "three";
import { AnimatedAnnotation } from "../animatedAnnotation";

const levelProcessor = new DetailLevelProcessor<0, DetailLevelState>()
  .addLevel(0, [
    { state: DetailLevelState.hide, size: 0 },
    { state: DetailLevelState.min, size: 0.5 },
    { state: DetailLevelState.normal, size: 1 },
    { state: DetailLevelState.big, size: 2.5 },
  ])


const DEFAULT_RADIUS = 15

export class AttractionAnnotation extends AnimatedAnnotation<0, DetailLevelState> {

  declare data: {
    properties?: {
      short_name: LocalizedString
      alt_name: LocalizedString
      name: LocalizedString
      category: string,
      image: string
    }
  }

  annotationParams = {
    point: {
      size: 1,
      offsetY: 0,
      contentOpacity: 1,
    },
    miniPoint: {
      size: 0,
    },
    shape: {
      progress: 0,
    },
    label: {
      offsetY: 0,
      opacity: 1,
      color: new Color('#D6862F'),
      scale: 1,
    }
  }

  currentStyle = {
    pointFill: new Color('#4593CF'),
    pointStroke: new Color('#ffffff'),
    labelColor: new Color('#434343'),
    labelStroke: new Color('#ffffff'),
    font: '700 11px apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    inlineFont: '800 14px apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    labelBBox: undefined
  }

  updateTargetBBox() {
    if (!this.currentStyle.labelBBox) return

    const h = this.currentStyle.labelBBox.height

    const s = (() => {
      if (this.isSelected) return 70
      if (this.isPinned) return 60
      return this.target.mainPointScale() * DEFAULT_RADIUS * 2
    })()
    const bubble = new Box2().setFromCenterAndSize(new Vector2(0, (this.isSelected || this.isPinned) ? -s / 2 : 0), new Vector2(s, s))
    const label = new Box2().setFromCenterAndSize(new Vector2(0, (h + 3) / 2 + 20), new Vector2(this.currentStyle.labelBBox.width, h))

    if (this.target.labelOpacity().opacity != 0) bubble.union(label)
    const center = bubble.getCenter(new Vector2())
    const size = bubble.getSize(new Vector2())
    this.updateBBox(size.width, size.height, center)
  }

  protected override onPinSelect() {
    this.bounds.set(this.target.bounds())
  }

  contentImg: HTMLImageElement | null = null

  constructor(localPosition: Vector2, data: any) {
    data.properties.short_name = new LocalizedString(data.properties.short_name)
    data.properties.alt_name = new LocalizedString(data.properties.alt_name)
    data.properties.name = new LocalizedString(data.properties.name)


    super(localPosition, data, 0, levelProcessor)

    const target = this.target

    this.selectAnimation = new Animator(this.onAnim)
      .animateSpring(0.4, 0.4, { value: this.annotationParams.point, to: () => target.point(), duration: 1000 })
      .animateSpring(0.4, 0.4, { value: this.annotationParams.label, to: () => target.labelTransform(), duration: 1000 })
      .animateSpring(0.7, 0.3, { value: this.annotationParams.miniPoint, to: () => target.miniPoint(), duration: 1000, delay: 250 })
      .animate({ value: this.annotationParams.point, to: () => target.contentOpacity(), duration: 200, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.shape, to: () => target.shapeProgress(), duration: 200, delay: 50, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.label, to: () => target.labelOpacity(), duration: 200, delay: 50, easing: Easing.Quadratic.InOut })
      .onStart(() => { this.updateTargetBBox() })

    this.deSelectAnimation = new Animator(this.onAnim, [this.selectAnimation])
      .animateSpring(0.7, 0.3, { value: this.annotationParams.point, to: () => target.point(), duration: 1000 })
      .animateSpring(0.7, 0.3, { value: this.annotationParams.label, to: () => target.labelTransform(), duration: 1000 })
      .animate({ value: this.annotationParams.point, to: () => target.contentOpacity(), duration: 200, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.miniPoint, to: () => target.miniPoint(), duration: 300, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.shape, to: () => target.shapeProgress(), duration: 100, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.label, to: () => target.labelOpacity(), duration: 150, easing: Easing.Quadratic.In })
      .onEnd(() => { this.updateTargetBBox() })

    this.selectAnimation.addDependent(this.deSelectAnimation)

    modify(this.annotationParams.point, target.point())

    if (this.data.properties.image) {
      this.contentImg = new Image()
      this.contentImg.src = `https://via.placeholder.com/256x256/${Math.floor(Math.random() * 16777215).toString(16)}`
    }

  }

  override get renderOrder(): number {
    return 100
  }

  override changeState(state: DetailLevelState, animated: boolean): void {
    super.changeState(state, animated)
    const target = this.target

    this.bounds.set(this.target.bounds())

    this.animateChangeState(new Animator(this.onAnim)
      .animate({ value: this.annotationParams.point, to: () => ({ ...target.point(), ...target.contentOpacity() }), duration: 200, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.label, to: () => ({ ...target.labelOpacity(), ...target.labelTransform() }), duration: 100, easing: Easing.Quadratic.InOut })
      .onEnd(() => this.updateTargetBBox())
      .onStart(() => this.updateTargetBBox()),
      animated
    )
  }

  measureText(ctx: CanvasRenderingContext2D) {
    if (this.currentStyle.labelBBox) return;

    const params = this.textParams()
    applyTextParams(params, ctx)
    ctx.lineJoin = 'round'
    ctx.textBaseline = 'top'
    const text = multiLineText(this.data.properties.name.bestLocalizedValue, 100, ctx)

    const hasSpacing = ctx['letterSpacing'] != undefined && params.letterSpacing != 0

    this.currentStyle.labelBBox = {
      width: text.width + params.strokeWidth - (hasSpacing ? params.letterSpacing : 0),
      height: params.textLineHeight * text.lineCount + params.strokeWidth
    }

    this.updateTargetBBox()
  }

  override draw(ctx: CanvasRenderingContext2D): void {
    const { point, miniPoint, shape, label } = this.annotationParams

    const drawPoint = (ctx: CanvasRenderingContext2D) => {

      ctx.save()
      ctx.translate(0, point.offsetY)
      ctx.scale(point.size, point.size)
      ctx.beginPath()
      ctx.fillStyle = this.currentStyle.pointStroke.hex
      ctx.arc(0, 0, DEFAULT_RADIUS, 0, 2 * Math.PI)
      ctx.fill()

      if (shape.progress > 0) {
        ctx.save()
        ctx.scale(3, 3)
        ctx.beginPath()
        ctx.translate(0, 6.1 - (1 - shape.progress))
        ctx.scale(1 / 8, 1 / 8 * shape.progress)
        ctx.moveTo(-10, -15)
        ctx.lineTo(-10, -10)
        ctx.bezierCurveTo(-5, -8, -3, -4, -2, -2)
        ctx.bezierCurveTo(0, 0, 0, 0, 2, -2)
        ctx.bezierCurveTo(3, -4, 5, -8, 10, -10)
        ctx.lineTo(10, -15)
        ctx.fill()
        ctx.restore()
      }

      ctx.beginPath()
      ctx.fillStyle = this.currentStyle.pointFill.hex
      ctx.arc(0, 0, (DEFAULT_RADIUS - 2), 0, 2 * Math.PI)

      if (point.contentOpacity < 0.95 || !this.contentImg?.complete) {
        ctx.fill()
      }

      if (point.contentOpacity > 0) {
        ctx.fillStyle = this.currentStyle.pointStroke.withAlphaComponent(point.contentOpacity).hex
        ctx.font = this.currentStyle.inlineFont
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        if (this.data.properties.short_name?.bestLocalizedValue) {
          ctx.fillText(this.data.properties.short_name.bestLocalizedValue, 0, 0)
        } else {
          ctx.clip()
          ctx.globalAlpha = clamp(point.contentOpacity, 0, 1)
          ctx.drawImage(this.contentImg, -DEFAULT_RADIUS, -DEFAULT_RADIUS, DEFAULT_RADIUS * 2, DEFAULT_RADIUS * 2)
        }
      }
      ctx.restore()
    }

    const drawMiniPoint = (ctx: CanvasRenderingContext2D) => {
      if (miniPoint.size > 0) {
        ctx.beginPath()
        ctx.arc(0, 0, miniPoint.size, 0, 2 * Math.PI)
        ctx.fillStyle = this.currentStyle.pointStroke.hex
        ctx.fill()
      }
    }

    const drawLabel = (ctx: CanvasRenderingContext2D) => {
      if (label.opacity == 0) return

      applyTextParams(this.textParams(), ctx)
      ctx.lineJoin = 'round'
      ctx.textBaseline = 'top'
      const text = multiLineText(this.data.properties.name.bestLocalizedValue, 100, ctx)

      ctx.save()
      ctx.translate(0, label.offsetY + 20)
      drawTextWithCurrentParams(text.text, ctx)
      ctx.restore()
    }

    const isAnim = this.isSelected || this.isPinned || this.selectAnimation.isPlaying || this.deSelectAnimation.isPlaying || this.changeStateAnimator?.isPlaying
    drawMiniPoint(ctx)

    if (isAnim) {
      drawPoint(ctx)
    } else {
      const text = this.data.properties.short_name?.bestLocalizedValue || (this.contentImg?.complete ? this.contentImg.src : '-')
      AnnotationBakery.instance.bakeAndRender({
        name: `point_${point.contentOpacity <= Number.MIN_VALUE ? '' : text}_${this.currentStyle.pointFill.hex}_${Math.round(point.size * 1000) / 1000}`,
        size: { width: DEFAULT_RADIUS * point.size * 2, height: DEFAULT_RADIUS * point.size * 2 },
        draw: drawPoint,
        ctx
      })
    }

    if (isAnim || label.opacity != 1) {
      drawLabel(ctx)
    } else {
      const text = this.data.properties.name.bestLocalizedValue
      TextBakery.instance.bakeAndRender({
        name: `label_${text}_${this.currentStyle.labelColor.hex}`,
        text, ctx, maxWidth: 100,
        params: { fill: label.color.hex, },
        offsetY: label.offsetY + 20 - 3
      })
    }

    this.measureText(ctx)
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
    bounds: () => {
      const shouldPin = !this.isSelected && this.isPinned
      const size = (() => {
        if (shouldPin) return 60
        return Math.max(15, this.target.mainPointScale() * DEFAULT_RADIUS * 2)
      })()

      return { size: new Size(shouldPin ? size * 0.7 : size, size), pivot: new Vector2(0.5, shouldPin ? 0.8 : 0.5) }
    },
    mainPointScale: () => {
      switch (this.state) {
        case DetailLevelState.hide: return 0.2
        case DetailLevelState.min: return 0.2
        case DetailLevelState.normal: return 1
        case DetailLevelState.big: return 1.2
      }
    },
    point: () => {
      let scale = () => {
        if (this.isSelected) return 1.8
        if (this.isPinned) return 1.3
        return this.target.mainPointScale()
      }

      return {
        size: scale(),
        offsetY: (() => {
          if (this.isSelected) return -38
          if (this.isPinned) return -27
          return 0
        })()
      }
    },
    contentOpacity: () => ({
      contentOpacity: this.isSelected
        || this.isPinned
        || this.state == DetailLevelState.normal
        || this.state == DetailLevelState.big ? 1 : 0
    }),
    miniPoint: () => {
      const size = () => {
        if (this.isSelected) return 2
        if (this.isPinned) return 1.6
        return 0
      }

      return { size: size() }
    },
    shapeProgress: () => ({ progress: (this.isSelected || this.isPinned) ? 1 : 0 }),
    labelTransform: () => {
      const color = () => {
        if (this.isSelected) return new Color('#000000')
        return new Color(this.currentStyle.labelColor.hex)
      }

      const offset = () => {
        if (this.isSelected) return -15
        if (this.isPinned) return -16
        return -(1 - this.target.mainPointScale()) * DEFAULT_RADIUS
      }

      return {
        offsetY: offset(),
        color: color(),
      }
    },
    labelOpacity: () => {
      const opacity = () => {
        if (this.isSelected) return 1
        if (this.isPinned) return 1
        return [DetailLevelState.big].includes(this.state) ? 1 : 0
      }

      return {
        opacity: opacity(),
      }
    }
  }
}
