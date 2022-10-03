
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

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export declare type TextParams = {
  font?: string,
  letterSpacing?: number,
  textLineHeight?: number
  fill?: string,
  stroke?: string,
  strokeWidth?: number,
  align?: CanvasTextAlign,
}

export function applyTextParams(params: TextParams, ctx: CanvasRenderingContext2D) {
  if (params.font) ctx.font = params.font
  if (params.letterSpacing) useLetterSpacing(ctx, params.letterSpacing)
  if (params.fill) ctx.fillStyle = params.fill
  if (params.stroke) ctx.strokeStyle = params.stroke
  if (params.strokeWidth) ctx.lineWidth = params.strokeWidth
  if (params.textLineHeight) ctx['textLineHeight'] = params.textLineHeight
  if (params.align) ctx.textAlign = params.align
}

export function useLetterSpacing(ctx: CanvasRenderingContext2D, letterSpacing: number) {
  if (ctx['letterSpacing'] != undefined) {
    ctx['letterSpacing'] = `${letterSpacing}px`
    ctx['letterSpacing_value'] = letterSpacing
  }
}

export function drawText(text: string, params: TextParams, ctx: CanvasRenderingContext2D) {
  applyTextParams(params, ctx)
  drawTextWithCurrentParams(text, ctx)
}

export function multiLineText(text: string, maxWidth: number, ctx: CanvasRenderingContext2D) {
  let result = ''
  let totalWidth = 0

  text.split('\n').forEach((txt, i) => {
    const splitted = txt.replaceAll('-', '- ').split(' ')
    //TODO: вот тут надо починить алгоримт, чтоб не было костыля с line.at(-1)
    let resLine = ''
    let line = ''
    splitted.forEach(word => {
      if (line == '') {
        line = word
        totalWidth = Math.max(totalWidth, ctx.measureText(line).width)
      } else {
        const w = ctx.measureText(line + ' ' + word).width
        if (w <= maxWidth || w <= totalWidth) {
          line += (line[line.length - 1] == '-' ? '' : ' ') + word
          totalWidth = Math.max(totalWidth, w)
        } else {
          resLine += (resLine == '' ? '' : '\n') + line
          line = word
          totalWidth = Math.max(totalWidth, ctx.measureText(word).width)
        }
      }
    })
    resLine += (resLine == '' ? '' : '\n') + line
    result += (result == '' ? '' : '\n') + resLine
  })
  return { text: result, width: totalWidth, lineCount: result.split('\n').length }
}

export function drawTextWithCurrentParams(text: string, ctx: CanvasRenderingContext2D) {
  const textLineHeight = ctx['textLineHeight'] || 12

  const offset = ctx['letterSpacing_value'] != undefined ? Number.parseFloat(ctx['letterSpacing_value']) / 2 : 0
  if (offset) {
    ctx.save()
    ctx.translate(offset, 0)
  }

  const lines = text.split('\n')

  lines.forEach((t, i) => {
    ctx.strokeText(t, 0, i * textLineHeight)
  })

  lines.forEach((t, i) => {
    ctx.fillText(t, 0, i * textLineHeight)
  })

  if (offset) ctx.restore()
}


export function groupBy<K, V>(list: Array<V>, keyGetter: (input: V) => K): Map<K, Array<V>> {
  const map = new Map<K, Array<V>>();
  list.forEach((item) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
}
