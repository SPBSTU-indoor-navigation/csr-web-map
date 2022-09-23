
declare type Rect = {
  x: number,
  y: number,
  width: number,
  height: number
}
declare type Size = { width: number, height: number }
declare type Space = { canvas: CanvasForBake, rect: Rect }
declare type Baked = { canvas: HTMLCanvasElement, rect: Rect }

const SIZE = 128
const PADDING = 1

class CanvasForBake {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  scale: number

  private lines: { height: number, width: number }[] = []

  constructor() {
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

    this.canvas = canvas
    this.context = ctx

    document.querySelector('#mapKitContainer')!.appendChild(this.canvas)
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
  private canvases: CanvasForBake[] = []

  private baked: {
    [key: string]: Baked
  } = {}

  constructor() {
  }

  private requestSpace(size: Size): Space {
    for (let i = 0; i < this.canvases.length; i++) {
      const canvas = this.canvases[i];
      const space = canvas.requestCanvasSpace(size)
      if (space) return space
    }

    if (size.height + 2 * PADDING > SIZE || size.width + 2 * PADDING > SIZE) return null

    const nextCanvas = new CanvasForBake()
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
    // ctx.strokeStyle = 'red'
    // ctx.lineWidth = 1
    // ctx.strokeRect(0, 0, space.rect.width, space.rect.height)
    ctx.restore()

    this.baked[name] = {
      canvas: ctx.canvas,
      rect: {
        x: space.rect.x * scale,
        y: space.rect.y * scale,
        width: space.rect.width * scale,
        height: space.rect.height * scale
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
}

export class TextBakery extends Bakery {
  private static _instance: TextBakery;
  static get instance() {
    return this._instance || (this._instance = new this());
  }

  constructor() {
    super()
  }
}
