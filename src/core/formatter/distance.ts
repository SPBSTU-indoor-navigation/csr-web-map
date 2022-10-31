
export function distanceFormatter(distance: number): string {
  let unit = 'meter'
  if (distance < 1000) {
    distance = Math.round(distance)
    unit = 'meter'
  } else {
    distance = Math.round(distance / 1000)
    unit = 'kilometer'
  }

  return new Intl.NumberFormat('ru-RU', { style: 'unit', unit }).format(distance)
}
