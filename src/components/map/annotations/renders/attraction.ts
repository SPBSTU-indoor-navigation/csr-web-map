import { Animator } from "@/core/animator/animator";
import { DetailLevelProcessor, DetailLevelState } from "@/core/map/annotations/detailLevelProcessor";
import { Color } from "@/core/shared/color";
import { drawText, modify } from "@/core/shared/utils";
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
      short_name: {}
      alt_name: {}
      name: {}
      category: string
    }
  }

  annotationParams = {
    point: {
      size: 1,
      offsetY: 0,
      contentOpacity: 1,
    },
    shape: {
      progress: 0,
    },
  }

  currentStyle = {
    pointFill: new Color('#4593CF'),
    pointStroke: new Color('#ffffff'),
    labelColor: new Color('#D6862F'),
    labelStroke: new Color('#ffffff'),
    font: '700 11px apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    inlineFont: '800 14px apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    labelBBox: undefined
  }

  updateTargetBBox() {
    // if (!this.currentStyle.labelBBox) return

    // const h = this.currentStyle.labelBBox.height

    const s = this.isSelected ? 70 : this.target.mainPointScale() * DEFAULT_RADIUS * 2
    const bubble = new Box2().setFromCenterAndSize(new Vector2(0, this.isSelected ? -s / 2 : 0), new Vector2(s, s))
    // const label = new Box2().setFromCenterAndSize(new Vector2(0, h / 2 + 3), new Vector2(this.currentStyle.labelBBox.width, h))

    // if (this.target.labelOpacity().opacity != 0) bubble.union(label)
    const center = bubble.getCenter(new Vector2())
    const size = bubble.getSize(new Vector2())
    this.updateBBox(size.width, size.height, center)
  }

  constructor(localPosition: Vector2, data: any) {
    super(localPosition, data, 0, levelProcessor)

    const target = this.target

    this.selectAnimation = new Animator(this.onAnim)
      .animateSpring(0.4, 0.4, { value: this.annotationParams.point, to: () => target.point(), duration: 1000 })
      // .animateSpring(0.6, 0.4, { value: this.annotationParams.label, to: () => target.labelTransform(), duration: 1000 })
      // .animateSpring(0.7, 0.3, { value: this.annotationParams.miniPoint, to: () => target.miniPoint(), duration: 1000, delay: 250 })
      // .animate({ value: this.annotationParams.point, to: () => target.borderOpacity(), duration: 100, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.shape, to: () => target.shapeProgress(), duration: 200, delay: 50, easing: Easing.Quadratic.InOut })
      // .animate({ value: this.annotationParams.label, to: () => target.labelOpacity(), duration: 200, delay: 50, easing: Easing.Quadratic.InOut })
      .onStart(() => { this.updateTargetBBox() })

    this.deSelectAnimation = new Animator(this.onAnim, [this.selectAnimation])
      .animateSpring(0.7, 0.3, { value: this.annotationParams.point, to: () => target.point(), duration: 1000 })
      // .animate({ value: this.annotationParams.point, to: () => target.borderOpacity(), duration: 300, easing: Easing.Quadratic.InOut })
      // .animate({ value: this.annotationParams.miniPoint, to: () => target.miniPoint(), duration: 300, easing: Easing.Quadratic.InOut })
      .animate({ value: this.annotationParams.shape, to: () => target.shapeProgress(), duration: 100, easing: Easing.Quadratic.InOut })
      // .animate({ value: this.annotationParams.label, to: () => ({ ...target.labelOpacity(), ...target.labelTransform() }), duration: 100, easing: Easing.Quadratic.In })
      .onEnd(() => { this.updateTargetBBox() })

    this.selectAnimation.addDependent(this.deSelectAnimation)

    modify(this.annotationParams.point, target.point())
  }

  override changeState(state: DetailLevelState, animated: boolean): void {
    super.changeState(state, animated)
    const target = this.target


    const size = Math.max(15, this.target.mainPointScale() * DEFAULT_RADIUS * 2)
    this.bounds.setSize({ width: size, height: size })

    this.animateChangeState(new Animator(this.onAnim)
      .animate({ value: this.annotationParams.point, to: () => ({ ...target.point() }), duration: 200, easing: Easing.Quadratic.InOut })
      .onEnd(() => this.updateTargetBBox())
      .onStart(() => this.updateTargetBBox()),
      animated
    )
  }

  override draw(ctx: CanvasRenderingContext2D): void {
    const { point, shape } = this.annotationParams

    const drawPoint = (ctx: CanvasRenderingContext2D) => {

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
      ctx.fill()

      if (point.contentOpacity > 0) {
        ctx.fillStyle = this.currentStyle.pointStroke.withAlphaComponent(point.contentOpacity).hex
        ctx.font = this.currentStyle.inlineFont
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        if (this.data.properties.short_name?.['ru']) {
          ctx.fillText(this.data.properties.short_name['ru'], 0, 0)
        }
      }
    }

    drawPoint(ctx)
  }

  private target = {
    mainPointScale: () => {
      switch (this.state) {
        case DetailLevelState.hide: return 0
        case DetailLevelState.min: return 0.2
        case DetailLevelState.normal: return 1
        case DetailLevelState.big: return 1.2
      }
    },
    point: () => {
      let scale = () => {
        if (this.isSelected) return 1.8
        return this.target.mainPointScale()
      }

      return {
        size: scale(),
        contentOpacity: this.isSelected || this.state == DetailLevelState.normal || this.state == DetailLevelState.big ? 1 : 0,
        offsetY: this.isSelected ? -38 : 0
      }
    },
    shapeProgress: () => ({ progress: this.isSelected ? 1 : 0 }),
  }
}
