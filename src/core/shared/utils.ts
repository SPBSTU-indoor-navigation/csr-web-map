
export function modify(obj: Object, newObj: Object, deleteOld: boolean = true) {
    if (deleteOld) {
        Object.keys(obj).forEach(function (key) {
            delete obj[key];
        });
    }

    Object.keys(newObj).forEach(function (key) {
        obj[key] = newObj[key];
    });
}

export class Color {
    r: number
    g: number
    b: number
    a: number

    constructor(color: string) {
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
        function componentToHex(c: number) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }

        return `#${componentToHex(this.r)}${componentToHex(this.g)}${componentToHex(this.b)}${componentToHex(this.a)}`
    }

    get rgba() {
        return this.toRgba()
    }

    toRgba() {
        return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.a + ')'
    }

    withAlphaComponent(alpha: number) {
        const color = new Color(this.toRgba())
        color.a = Math.min(Math.max(Math.round(alpha * 255), 0), 255)

        return color
    }
}
