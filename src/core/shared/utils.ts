
export function modify(obj: Object, newObj: Object, deleteOld: boolean = false) {
    if (deleteOld) {
        Object.keys(obj).forEach(function (key) {
            delete obj[key];
        });
    }

    Object.keys(newObj).forEach(function (key) {
        obj[key] = newObj[key];
    });
}

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

export class Color {
    private _r: number
    private _g: number
    private _b: number
    private _a: number

    private _hex = ''
    private _hexDirty = true

    constructor(color?: string) {
        if (color)
            this.set(color)
    }

    static fromRGBA(r: number, g: number, b: number, a: number): Color {
        const c = new Color()
        c.r = r
        c.g = g
        c.b = b
        c.a = a
        return c
    }

    copy() {
        return Color.fromRGBA(this.r, this.g, this.b, this.a)
    }

    set(color: string) {
        if (color[0] == '#') {
            this.r = parseInt(color.slice(1, 3), 16)
            this.g = parseInt(color.slice(3, 5), 16)
            this.b = parseInt(color.slice(5, 7), 16)
            this.a = color.length == 9 ? parseInt(color.slice(7, 9), 16) : 255
        } else if (color.slice(0, 4) == 'rgba') {
            const rgba = color.slice(5, color.length - 1).split(',')
            this.r = parseInt(rgba[0])
            this.g = parseInt(rgba[1])
            this.b = parseInt(rgba[2])
            this.a = parseInt(rgba[3])
        } else if (color.slice(0, 3) == 'rgb') {
            const rgb = color.slice(4, color.length - 1).split(',')
            this.r = parseInt(rgb[0])
            this.g = parseInt(rgb[1])
            this.b = parseInt(rgb[2])
            this.a = 255
        }
    }

    get hex() {
        return this.toHex()
    }

    toHex() {

        if (!this._hexDirty) {
            return this._hex
        }

        function componentToHex(c: number) {
            var hex = clamp(Math.round(c), 0, 255).toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }

        this._hex = `#${componentToHex(this.r)}${componentToHex(this.g)}${componentToHex(this.b)}${componentToHex(this.a)}`
        this._hexDirty = false
        return this._hex
    }

    get rgba() {
        return this.toRgba()
    }

    toRgba() {
        return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.a + ')'
    }

    withAlphaComponent(alpha: number) {
        const color = this.copy()
        color.a = clamp(Math.round(alpha * 255), 0, 255)

        return color
    }



    set r(value) {
        this._r = value
        this._hexDirty = true
    }
    get r() {
        return this._r
    }

    set g(value) {
        this._g = value
        this._hexDirty = true
    }
    get g() {
        return this._g
    }

    set b(value) {
        this._b = value
        this._hexDirty = true
    }
    get b() {
        return this._b
    }

    set a(value) {
        this._a = value
        this._hexDirty = true
    }
    get a() {
        return this._a
    }

}
