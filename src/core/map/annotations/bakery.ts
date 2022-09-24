import { applyTextParams, drawTextWithCurrentParams, modify, multiLineText, TextParams, useLetterSpacing } from '@/core/shared/utils';
import { showBackedCanvas, showBackedOutline } from '@/store/debugParams'
import { watchEffect, } from 'vue';


declare type Rect = {
  x: number,
  y: number,
  width: number,
  height: number
}
declare type Size = { width: number, height: number }
declare type Space = { canvas: CanvasForBake, rect: Rect }
declare type Baked = { canvas: HTMLCanvasElement, rect: Rect, size: Size }

const SIZE = 256
const PADDING = 1

class CanvasForBake {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  scale: number

  private lines: { height: number, width: number }[] = []

  constructor(canvasProcessor: (canvas: CanvasForBake) => void) {
    this.scale = window.devicePixelRatio
    const canvas = document.createElement('canvas')
    canvas.width = SIZE * this.scale
    canvas.height = SIZE * this.scale
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.width = SIZE + 'px'
    canvas.style.height = SIZE + 'px'
    canvas.style.pointerEvents = 'none'
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.scale(this.scale, this.scale)
    ctx.strokeRect(0, 0, SIZE, SIZE)

    this.canvas = canvas
    this.context = ctx

    document.querySelector('#mapKitContainer')!.appendChild(this.canvas)

    canvasProcessor(this)
  }

  requestCanvasSpace(size: Size): Space {
    let yOffset = 0
    const height = (size.height + 2 * PADDING)
    const width = (size.width + 2 * PADDING)

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i]
      if (line.height - height >= 0 && line.height - height < 1) {
        if (line.width + width < SIZE) {
          line.width += width
          return {
            canvas: this,
            rect: { x: line.width - width + PADDING, y: yOffset + PADDING, width: size.width, height: size.height }
          }
        }
      }

      yOffset += line.height
    }

    if (yOffset + height < SIZE) {
      this.lines.push({ height, width })
      return {
        canvas: this,
        rect: { x: PADDING, y: yOffset + PADDING, width: size.width, height: size.height }
      }
    }

    return null
  }
}

export class Bakery {
  protected canvases: CanvasForBake[] = []

  protected baked: {
    [key: string]: Baked
  } = {}

  constructor() {
    this.canvases.push(new CanvasForBake(this.canvasProcessor))

    watchEffect(() => {
      this.canvases.forEach(c => {
        c.canvas.style.display = showBackedCanvas.value ? 'block' : 'none'
      })
    })
  }

  protected requestSpace(size: Size): Space {
    for (let i = 0; i < this.canvases.length; i++) {
      const canvas = this.canvases[i];
      const space = canvas.requestCanvasSpace(size)
      if (space) return space
    }

    if (size.height + 2 * PADDING > SIZE || size.width + 2 * PADDING > SIZE) return null

    const nextCanvas = new CanvasForBake((c) => this.canvasProcessor(c))
    this.canvases.push(nextCanvas)

    return nextCanvas.requestCanvasSpace(size)
  }

  bake(name: string, size: Size, draw: (ctx: CanvasRenderingContext2D) => void) {
    const space = this.requestSpace(size)
    if (!space) return
    const ctx = space.canvas.context
    const scale = space.canvas.scale

    ctx.save()
    ctx.translate(space.rect.x, space.rect.y)
    ctx.save()
    draw(ctx)
    ctx.restore()
    if (showBackedOutline.value) {
      ctx.strokeStyle = 'red'
      ctx.lineWidth = 1
      ctx.strokeRect(0, 0, space.rect.width, space.rect.height)
    }
    ctx.restore()

    this.baked[name] = {
      canvas: ctx.canvas,
      rect: {
        x: space.rect.x * scale,
        y: space.rect.y * scale,
        width: space.rect.width * scale,
        height: space.rect.height * scale
      },
      size: {
        width: space.rect.width,
        height: space.rect.height
      }
    }
  }

  bakeAndReturn(name: string, size: Size, draw: (ctx: CanvasRenderingContext2D) => void): Baked {
    if (this.get(name)) return this.get(name)
    this.bake(name, size, draw)
    return this.get(name)
  }

  get(name: string): Baked {
    return this.baked[name]
  }

  protected canvasProcessor(canvas: CanvasForBake) { }
}

export class AnnotationBakery extends Bakery {
  private static _instance: AnnotationBakery;
  static get instance() {
    return this._instance || (this._instance = new this());
  }

  constructor() {
    super()
  }

  bakeAndRender(params: {
    name: string,
    size: Size,
    ctx: CanvasRenderingContext2D,
    draw: (ctx: CanvasRenderingContext2D) => void,
    fromCenter?: boolean,
  }) {
    const { name, size, draw, fromCenter, ctx } = params
    const img = this.bakeAndReturn(name, size, ctx => {
      if (fromCenter == undefined || fromCenter) {
        ctx.translate(size.width / 2, size.height / 2)
      }
      draw(ctx)
    })

    const imageSmoothingEnabled = ctx.imageSmoothingEnabled
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(img.canvas, img.rect.x, img.rect.y, img.rect.width, img.rect.height,
      -img.size.width / 2, -img.size.height / 2, img.size.width, img.size.height)
    ctx.imageSmoothingEnabled = imageSmoothingEnabled
  }
}

export class TextBakery extends Bakery {
  private static _instance: TextBakery;
  static get instance() {
    return this._instance || (this._instance = new this());
  }

  private defaultParams: TextParams = {
    font: '700 11px apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    letterSpacing: -0.3,
    fill: 'black',
    stroke: 'white',
    strokeWidth: 3,
    align: 'center',
    textLineHeight: 11
  }
  private currentParams: TextParams = {}

  private defaultParamsDirty = true

  constructor() {
    super()
    this.canvases.forEach(canvas => {
      canvas.canvas.style.top = '256px'
    })
    this.applyDefaultParams()
  }

  applyParams(params: TextParams) {
    const c = this.currentParams
    const { font, letterSpacing, textLineHeight, fill, stroke, strokeWidth, align } = params

    this.canvases.forEach(canvas => {
      const ctx = canvas.context
      if (font && font != c.font) ctx.font = font
      if (fill && fill != c.fill) ctx.fillStyle = fill
      if (stroke && stroke != c.stroke) ctx.strokeStyle = stroke
      if (strokeWidth && strokeWidth != c.strokeWidth) ctx.lineWidth = strokeWidth
      if (align && align != c.align) ctx.textAlign = align
      if (textLineHeight && textLineHeight != c.textLineHeight) ctx['textLineHeight'] = textLineHeight
      if (letterSpacing && letterSpacing != c.letterSpacing) useLetterSpacing(ctx, letterSpacing)
    })

    this.defaultParamsDirty = true
    this.currentParams = { ...this.currentParams, ...params }
  }

  applyDefaultParams() {
    if (!this.defaultParamsDirty) return
    this.applyParams(this.defaultParams)
    this.defaultParamsDirty = false
  }

  setDefaultTextParams(params: TextParams) {
    this.defaultParams = params
    this.applyDefaultParams()
  }

  bakeTextAndReturn(params: {
    text: string,
    maxWidth?: number,
    name?: string,
    params?: TextParams
  }): Baked {

    const { text, maxWidth, params: textParams } = params
    const name = params.name || (text + maxWidth + Object.values(params).map(t => t.toString()).join(''))
    if (this.get(name)) return this.get(name)

    if (textParams) {
      this.applyParams(textParams)
    } else {
      this.applyDefaultParams()
    }
    const hasSpacing = this.canvases[0].context['letterSpacing'] != undefined && this.currentParams.letterSpacing != 0
    const size = multiLineText(text, maxWidth, this.canvases[0].context)
    const height = (this.currentParams.textLineHeight || 12) * size.lineCount + (this.currentParams.strokeWidth || 0)
    const width = size.width + (this.currentParams.strokeWidth || 0) - (hasSpacing ? this.currentParams.letterSpacing : 0)

    return this.bakeAndReturn(name, { width, height }, ctx => {
      let xOffset = 0
      switch (ctx.textAlign) {
        case 'center': xOffset = 0.5; break;
        case 'right': xOffset = 1; break;
      }

      ctx.translate(width * xOffset, ctx.lineWidth / 2)
      drawTextWithCurrentParams(size.text, ctx)
    })
  }

  bakeAndRender(params: {
    name: string,
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth?: number,
    params?: TextParams,
    offsetY: number
  }) {
    const b = this.bakeTextAndReturn({
      text: params.text,
      maxWidth: params.maxWidth,
      name: params.name,
      params: params.params
    })
    const ctx = params.ctx
    ctx.translate(0, params.offsetY)
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(b.canvas, b.rect.x, b.rect.y, b.rect.width, b.rect.height,
      -b.size.width / 2, 1.5, b.size.width, b.size.height)
    ctx.imageSmoothingEnabled = true

    return b
  }

  protected override canvasProcessor(canvas: CanvasForBake): void {
    canvas.context.lineJoin = 'round'
    canvas.context.textBaseline = 'top'
    canvas.context.imageSmoothingEnabled = false
    canvas.context.imageSmoothingQuality = 'high'

    // canvas.canvas.style.width = 1024 + 'px'
    // canvas.canvas.style.height = 1024 + 'px'

    if (!this) return

    const ctx = canvas.context
    applyTextParams(this.currentParams, ctx)
    canvas.canvas.style.left = `${this.canvases.length * 256}px`


  }
}

