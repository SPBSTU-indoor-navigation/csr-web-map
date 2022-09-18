import { Box2, Vector2 } from 'three'

export class Size {
    width: number
    height: number

    constructor(width: number, height: number) {
        this.width = width
        this.height = height
    }
}

export class Bounds {
    private _rect: Box2 = new Box2()

    size: Size = new Size(50, 50)
    pivot: Vector2 = new Vector2(0.5, 0.5)

    constructor(size: Size = new Size(50, 50), pivot: Vector2 = new Vector2(0.5, 0.5)) {
        this.size = size
        this.pivot = pivot
        this.updateRect()
    }

    public get rect(): Box2 {
        return this._rect
    }

    public set(bounds: { size: Size, pivot: Vector2 }) {
        this.size = bounds.size
        this.pivot = bounds.pivot
        this.updateRect()
    }

    public setPivot(pivot: Vector2) {
        this.pivot = pivot
        this.updateRect()
    }

    public setSize(size: Size) {
        this.size = size
        this.updateRect()
    }

    public updateRect() {
        this.rect.set(
            new Vector2(-this.size.width * this.pivot.x, -this.size.height * this.pivot.y),
            new Vector2(this.size.width * (1 - this.pivot.x), this.size.height * (1 - this.pivot.y)))
    }
}
