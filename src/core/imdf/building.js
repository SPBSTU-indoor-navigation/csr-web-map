import { Box2, Vector2 } from 'three'
import { polygonIntersection } from './utils'


export default class Building {

  currentOrdinal = 0
  showLevel = false

  /** @type { import('three').Scene } */
  map = null

  bbox = null
  points = []

  constructor(data, levels, attractions) {
    this.data = data
    this.levels = levels
    this.attractions = attractions

    this.levelByOrdinal = levels.reduce((acc, level) => {
      acc[level.ordinal] = level
      return acc
    }, {})

    this.currentOrdinal = Math.min(...levels.map(t => t.ordinal))



    const toVector = (coordinates) => coordinates[0].map(point => new Vector2(point.x, point.y))

    this.points = data.geometry.type === 'MultiPolygon' ? data.geometry.coordinates.flatMap(toVector) : toVector(data.geometry.coordinates)

    this.bbox = (new Box2()).setFromPoints(data.geometry.coordinates.flatMap(t => t))
  }

  IsInside(point) {
    if (!this.bbox.containsPoint(point)) return false

    const points = this.data.geometry.coordinates[0]

    let isInside = false
    let i = 0, j = points.length - 1;
    for (i, j; i < points.length; j = i++) {
      if ((points[i].y > point.y) != (points[j].y > point.y) &&
        point.x < (points[j].x - points[i].x) * (point.y - points[i].y) / (points[j].y - points[i].y) + points[i].x) {
        isInside = !isInside;
      }
    }

    return isInside;
  }

  IsIntersectByLine(line) {
    if (this.data.geometry.type === 'MultiPolygon') {
      for (let i = 0; i < this.data.geometry.coordinates.length; i++) {
        const intersect = polygonIntersection(this.data.geometry.coordinates[i], line)
        if (intersect) return true
      }
    } else {
      return polygonIntersection(this.data.geometry.coordinates[0], line)
    }

    return false
  }

  /** @param { import('../Map/mapController').MapController } map */
  Add(map) {
    this.map = map
  }

  /** @param { import('../Map/mapController').MapController } map */
  Remove(map) {
    this.HideIndoor()
  }

  ShowIndoor(ordinal) {
    if (this.showLevel) return

    this.currentOrdinal = ordinal == undefined ? this.currentOrdinal : ordinal;
    if (!this.levelByOrdinal[this.currentOrdinal]) return

    this.levelByOrdinal[this.currentOrdinal].Add(this.map)

    this.showLevel = true;
  }

  HideIndoor() {
    if (!this.showLevel) return
    if (!this.levelByOrdinal[this.currentOrdinal]) return

    this.levelByOrdinal[this.currentOrdinal].Remove(this.map)
    this.showLevel = false


  }

  ChangeOrdinal(ordinal) {
    if (this.showLevel) {
      this.HideIndoor()
      this.ShowIndoor(ordinal)
    } else {
      this.currentOrdinal = ordinal
    }
  }

  Style(styleSheet) {
    this.levels.forEach(level => level.Style(styleSheet));
  }

  OnZoom(zoom) {
    this.levels.forEach(level => level.OnZoom(zoom));
  }

}