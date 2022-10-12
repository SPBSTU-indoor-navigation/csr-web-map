import { Animator } from "@/core/animator/animator";
import { DetailLevelProcessor, DetailLevelState } from "@/core/map/annotations/detailLevelProcessor";
import { Color } from "@/core/shared/color";
import { applyTextParams, clamp, drawTextWithCurrentParams, multiLineText, TextParams } from "@/core/shared/utils";
import { Easing } from "@tweenjs/tween.js";
import { Box2, Vector2 } from "three";
import { AnimatedAnnotation } from "../animatedAnnotation";
import { AnnotationImages } from "../annotationImages";
import { AnnotationBakery } from '@/core/map/annotations/bakery'
import { LocalizedString } from "@/core/shared/localizedString";

enum DetailLevel {
  alwaysShowBig = 0,
  alwaysShow = 1,
  min = 2,
  hiddenMin = 3,
  alwaysShowMin = 4,
}


const levelProcessor = new DetailLevelProcessor<DetailLevel, DetailLevelState>()
  .addLevel(DetailLevel.alwaysShowBig, [
    { state: DetailLevelState.min, size: 0 },
    { state: DetailLevelState.normal, size: 1 },
    { state: DetailLevelState.big, size: 3 },
  ])
  .addLevel(DetailLevel.alwaysShow, [
    { state: DetailLevelState.hide, size: 0 },
    { state: DetailLevelState.min, size: 1.5 },
    { state: DetailLevelState.normal, size: 2 },
    { state: DetailLevelState.big, size: 5 },
  ])
  .addLevel(DetailLevel.min, [
    { state: DetailLevelState.hide, size: 0 },
    { state: DetailLevelState.min, size: 1.8 },
    { state: DetailLevelState.normal, size: 5 },
    { state: DetailLevelState.big, size: 10 },
  ])
  .addLevel(DetailLevel.hiddenMin, [
    { state: DetailLevelState.hide, size: 0 },
    { state: DetailLevelState.min, size: 5 },
    { state: DetailLevelState.normal, size: 8 },
    { state: DetailLevelState.big, size: 20 },
  ])
  .addLevel(DetailLevel.alwaysShowMin, [
    { state: DetailLevelState.normal, size: 0 },
  ])

const DEFAULT_RADIUS = 10

declare type Data = {
  properties?: {
    alt_name: LocalizedString
    name: LocalizedString
    detailLevel: number
    category: string
  }
}

export class AmenityAnnotation extends AnimatedAnnotation<DetailLevel, DetailLevelState> {
  declare data: Data

  annotationParams = {
    point: {
      size: 1,
      offsetY: 0,
      contentOpacity: 1,
      opacity: 1,
      cornerRadius: 0.3
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
      scale: 1,
    }
  }

  currentStyle = {
    pointFill: new Color('#007AFF'),
    labelColor: new Color('#000000'),
    labelStroke: new Color('#ffffff'),
    font: '700 11px apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    labelBBox: undefined
  }

  img: HTMLImageElement | null = null

  updateTargetBBox() {
    if (!this.currentStyle.labelBBox) return;

    const h = this.currentStyle.labelBBox.height
    const s = this.isSelected ? 55 : 25
    const bubble = new Box2().setFromCenterAndSize(new Vector2(0, this.isSelected ? -s / 2 : 0), new Vector2(s, s))
    const label = new Box2().setFromCenterAndSize(new Vector2(0, h / 2 + 3), new Vector2(this.currentStyle.labelBBox.width, h))

    if (this.target.labelOpacity().opacity != 0) bubble.union(label)
    const center = bubble.getCenter(new Vector2())
    const size = bubble.getSize(new Vector2())
    this.updateBBox(size.width, size.height, center)
  }

  constructor(localPosition: Vector2, data: any) {
    data.properties.name = new LocalizedString(data.properties.name)
    data.properties.alt_name = new LocalizedString(data.properties.alt_name)

    super(localPosition, data, (data as Data).properties.detailLevel, levelProcessor)

    const target = this.target
    this.selectAnimation = new Animator(this.onAnim)
      .animateSpring(0.4, 0.4, { value: this.annotationParams.point, to: () => target.point(), duration: 1000 })
      .animate({ value: this.annotationParams.point, to: () => target.pointOpacity(), duration: 200, delay: 0, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.point, to: () => target.contentOpacity(), duration: 200, delay: 0, easing: Easing.Quadratic.InOut })
      .animateSpring(0.6, 0.4, { value: this.annotationParams.label, to: () => target.labelTransform(), duration: 1000 })
      .animateSpring(0.7, 0.3, { value: this.annotationParams.miniPoint, to: () => target.miniPoint(), duration: 1000, delay: 250 })
      .animate({ value: this.annotationParams.shape, to: () => target.shapeProgress(), duration: 200, delay: 50, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.label, to: () => target.labelOpacity(), duration: 200, delay: 50, easing: Easing.Quadratic.InOut })
      .onStart(() => { this.updateTargetBBox() })

    this.deSelectAnimation = new Animator(this.onAnim, [this.selectAnimation])
      .animateSpring(0.7, 0.3, { value: this.annotationParams.point, to: () => target.point(), duration: 1000 })
      .animate({ value: this.annotationParams.point, to: () => target.contentOpacity(), duration: 300, delay: 0, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.point, to: () => target.pointOpacity(), duration: 150, delay: 50, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.miniPoint, to: () => target.miniPoint(), duration: 300, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.shape, to: () => target.shapeProgress(), duration: 100, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.label, to: () => target.labelTransform(), duration: 150, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.label, to: () => target.labelOpacity(), duration: 100, easing: Easing.Quadratic.In })
      .onEnd(() => { this.updateTargetBBox() })

    this.img = AnnotationImages.instance.getImage(data.properties.category)
  }

  override get shouldSelectOnTap(): boolean {
    const isAnim = this.selectAnimation.isPlaying || this.deSelectAnimation.isPlaying || this.chaneStateAnimator.isPlaying
    return (this.state != DetailLevelState.hide || isAnim || this.isSelected) && super.shouldSelectOnTap
  }

  override shouldDraw(screen: Box2): boolean {
    const isAnim = this.selectAnimation.isPlaying || this.deSelectAnimation.isPlaying || this.chaneStateAnimator.isPlaying
    return (this.state != DetailLevelState.hide || isAnim || this.isSelected) && super.shouldDraw(screen)
  }

  override changeState(state: DetailLevelState, animated: boolean): void {
    super.changeState(state, animated)
    const target = this.target

    const size = Math.max(15, this.target.mainPointScale() * DEFAULT_RADIUS * 2)
    this.bounds.setSize({ width: size, height: size })

    this.animateChangeState(new Animator(this.onAnim)
      .animate({ value: this.annotationParams.point, to: () => ({ ...target.point(), ...target.contentOpacity() }), duration: 300, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.label, to: () => ({ ...target.labelOpacity(), ...target.labelTransform() }), duration: 100, easing: Easing.Quadratic.InOut })
      .onEnd(() => this.updateTargetBBox())
      .onStart(() => this.updateTargetBBox()),
      animated)
  }

  measureText(ctx: CanvasRenderingContext2D) {
    if (this.currentStyle.labelBBox) return;

    const params = this.textParams()
    applyTextParams(params, ctx)
    ctx.lineJoin = 'round'
    ctx.textBaseline = 'top'
    const text = multiLineText(this.data.properties.alt_name.bestLocalizedValue, 100, ctx)

    const hasSpacing = ctx['letterSpacing'] != undefined && params.letterSpacing != 0

    this.currentStyle.labelBBox = {
      width: text.width + params.strokeWidth - (hasSpacing ? params.letterSpacing : 0),
      height: params.textLineHeight * text.lineCount + params.strokeWidth
    }

    this.updateTargetBBox()
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const { point, shape, miniPoint, label } = this.annotationParams

    const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
      if (w < 2 * r) r = w / 2;
      if (h < 2 * r) r = h / 2;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    const drawImage = (ctx: CanvasRenderingContext2D) => {
      if (point.contentOpacity > 0 && this.img) {
        ctx.globalAlpha = clamp(point.contentOpacity, 0, 1)

        const aspect = this.img.width / this.img.height
        const size = 12
        const width = this.img.width > this.img.height ? size : size * aspect
        const height = this.img.width > this.img.height ? size / aspect : size

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(this.img, -width / 2, -height / 2, width, height)
      }
    }

    const drawPoint = (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = this.currentStyle.pointFill.hex
      if (point.size < 0) return;

      ctx.save()
      ctx.translate(0, point.offsetY)
      ctx.scale(point.size, point.size)
      ctx.globalAlpha = clamp(point.opacity, 0, 1)

      ctx.save()
      roundRect(ctx, -DEFAULT_RADIUS, -DEFAULT_RADIUS, DEFAULT_RADIUS * 2, DEFAULT_RADIUS * 2, DEFAULT_RADIUS * 2 * point.cornerRadius)
      ctx.fill()

      if (shape.progress > 0) {
        ctx.save()
        // ctx.translate(0, -4.9)
        ctx.scale(2.5, 2.5)
        ctx.beginPath()
        ctx.translate(0, 5 - (1 - shape.progress))
        ctx.scale(1 / 8, 1 / 8 * shape.progress)
        ctx.moveTo(-10, -15)
        ctx.lineTo(-10, -10)
        ctx.bezierCurveTo(-5, -8, -3, -4, -2, -2)
        ctx.bezierCurveTo(0, 0, 0, 0, 2, -2)
        ctx.bezierCurveTo(3, -4, 5, -8, 10, -10)
        ctx.lineTo(10, -15)
        // ctx.fillStyle = '#fff'
        ctx.fill()
        ctx.restore()
      }

      ctx.restore()

      drawImage(ctx)

      ctx.restore()

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
      const text = multiLineText(this.data.properties.alt_name.bestLocalizedValue, 100, ctx)

      ctx.save()
      ctx.scale(label.scale, label.scale)
      ctx.translate(0, label.offsetY + 5)
      drawTextWithCurrentParams(text.text, ctx)
      ctx.restore()
    }

    drawMiniPoint(ctx)
    drawLabel(ctx)

    const isAnim = this.isSelected || this.selectAnimation.isPlaying || this.deSelectAnimation.isPlaying || this.chaneStateAnimator?.isPlaying
    if (isAnim) {
      drawPoint(ctx)
    } else {
      const imgKey = (point.contentOpacity > 0 && this.img && this.img.complete && this.img.width > 0) ? this.data.properties.category : ''

      AnnotationBakery.instance.bakeAndRender({
        name: `amenity_${this.currentStyle.pointFill.hex}_${Math.round(point.size * 1000) / 1000}_${imgKey}`,
        size: { width: DEFAULT_RADIUS * point.size * 2, height: DEFAULT_RADIUS * point.size * 2 },
        draw: drawPoint,
        ctx
      })
    }

    this.measureText(ctx)
    super.draw(ctx)
  }

  private textParams(): TextParams {
    return {
      font: this.currentStyle.font,
      fill: this.currentStyle.labelColor.withAlphaComponent(this.annotationParams.label.opacity).hex,
      stroke: this.currentStyle.labelStroke.withAlphaComponent(this.annotationParams.label.opacity).hex,
      align: 'center',
      strokeWidth: 3,
      letterSpacing: -0.3,
      textLineHeight: 11
    }
  }

  private target = {
    mainPointScale: () => {
      switch (this.state) {
        case DetailLevelState.big: return 1
        case DetailLevelState.normal: return 0.7
        case DetailLevelState.min: return 0.2
        case DetailLevelState.hide: return 0
      }
    },
    point: () => {
      const scale = () => {
        if (this.isSelected) return 2.2
        return this.target.mainPointScale()
      }

      const cornerRadius = () => {
        if (this.isSelected) return 0.25
        switch (this.state) {
          case DetailLevelState.min: return 0.5
          default: return 0.25
        }
      }

      return {
        size: scale(),
        offsetY: this.isSelected ? -31.5 : 0,
        cornerRadius: cornerRadius(),
      }
    },
    pointOpacity: () => {
      const opacity = () => {
        if (this.isSelected) return 1
        switch (this.state) {
          case DetailLevelState.hide: return 0
          default: return 1
        }
      }

      return {
        opacity: opacity(),
      }
    },
    miniPoint: () => {
      const size = () => {
        if (this.isSelected) return 2
        return 0
      }

      return { size: size() }
    },
    shapeProgress: () => ({ progress: this.isSelected ? 1 : 0 }),
    contentOpacity: () => {
      const opacity = () => {
        if (this.isSelected) return 1
        switch (this.state) {
          case DetailLevelState.big:
          case DetailLevelState.normal: return 1
          case DetailLevelState.min:
          case DetailLevelState.hide: return 0
        }
      }
      return { contentOpacity: opacity() }
    },
    labelTransform: () => {
      const offset = () => {
        if (this.isSelected) return -1
        return -3
      }

      const scale = () => {
        if (this.isSelected) return 1
        return 0.5
      }

      return {
        offsetY: offset(),
        scale: scale()
      }
    },
    labelOpacity: () => {
      const opacity = () => {
        if (this.isSelected) return 1
        return 0
      }

      return {
        opacity: opacity(),
      }
    }
  }
}
