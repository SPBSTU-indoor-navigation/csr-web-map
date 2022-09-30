
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

  text.split('\n').forEach((line, i) => {
    let resLine = ''
    line
      .split(' ').map(t => ({ word: t, space: '' }))
      .flatMap(t => t.word.split('-').length > 1 ? t.word.split('-').map(w => ({ word: w, space: '-' })) : [t])
      .forEach(word => {
        if (resLine == '') {
          resLine = word.word
          totalWidth = Math.max(totalWidth, ctx.measureText(resLine).width)
        } else {
          const w = ctx.measureText(resLine + word.space + word.word).width
          if (w <= maxWidth) {
            resLine += (word.space || ' ') + word.word
            totalWidth = Math.max(totalWidth, w)
          } else {
            resLine += word.space + '\n' + word.word
            totalWidth = Math.max(totalWidth + ctx.measureText(word.space).width, ctx.measureText(word.word).width)
          }
        }
      })
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
