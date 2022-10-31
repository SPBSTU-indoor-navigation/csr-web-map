export function timeFormatter(seconds: number): string {
  const min = Math.floor(seconds / 60)

  return `${min > 0 ? `${min} мин ` : '1 мин'}`
}
