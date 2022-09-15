import { Box2, Vector2 } from 'three'

export class Bounds {
    private _rect: Box2 = new Box2()
    private _width = 0
    private _height = 0

    private _pivot: Vector2 = new Vector2(0.5, 0.5)

    constructor(width: number = 50, height: number = 50, pivot: Vector2 = new Vector2(0.5, 0.5)) {
        this._width = width
        this._height = height
        this._pivot = pivot
        this.updateRect()
    }

    public get rect(): Box2 {
        return this._rect
    }

    public get width(): number {
        return this._width
    }

    public get height(): number {
        return this._height
    }

    public get pivot(): Vector2 {
        return this._pivot
    }

    public set pivot(pivot: Vector2) {
        this.pivot = pivot
        this.updateRect()
    }

    public set width(width: number) {
        this._width = width
        this.updateRect()
    }

    public set height(height: number) {
        this._height = height
        this.updateRect()
    }

    private updateRect() {
        this._rect.set(
            new Vector2(-this._width * this._pivot.x, -this._height * this._pivot.y),
            new Vector2(this._width * (1 - this._pivot.x), this._height * (1 - this._pivot.y)))
    }
}
