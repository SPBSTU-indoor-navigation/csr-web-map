import { AttractionAnnotation } from '@/components/map/annotations/renders/attraction'
import { Box2, Vector2 } from 'three'
import { MapController } from '../map/mapController'
import { LocalizedString } from '../shared/localizedString'
import Level from './level'
import { polygonIntersection } from './utils'


export default class Building {

  data: {
    geometry: any,
    properties: {
      name: LocalizedString,
      alt_name: LocalizedString,
    }
  }

  levels: Level[]

  attractions: AttractionAnnotation[] = []
  currentOrdinal = 0

  private map: MapController = null

  private bbox = null
  private points = []
  private showLevel = false
  private levelByOrdinal: { [key: number]: Level } = {}

  constructor(data, levels: Level[], attractions, translate) {
    data.properties.name = new LocalizedString(data.properties.name)
    data.properties.alt_name = new LocalizedString(data.properties.alt_name)

    this.data = data
    this.levels = levels
    this.attractions = attractions.map(t => {
      const coordArray = t.geometry.coordinates
      const pos = translate({ latitude: coordArray[1], longitude: coordArray[0] })
      return new AttractionAnnotation(new Vector2(pos.x, pos.y), t)
    })

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
    // @ts-ignore
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

  Add(map: MapController) {
    this.map = map
    setTimeout(() => map.addAnnotation(this.attractions), 0)
  }

  Remove(map: MapController) {
    this.HideIndoor()
  }

  ShowIndoor(ordinal) {
    if (this.showLevel) return

    this.currentOrdinal = ordinal == undefined ? this.currentOrdinal : ordinal;
    if (!this.levelByOrdinal[this.currentOrdinal]) return

    this.levelByOrdinal[this.currentOrdinal].Add(this.map)

    this.showLevel = true;
    this.map.removeAnnotation(this.attractions)
  }

  HideIndoor() {
    if (!this.showLevel) return
    if (!this.levelByOrdinal[this.currentOrdinal]) return

    this.levelByOrdinal[this.currentOrdinal].Remove(this.map)
    this.showLevel = false

    this.map.addAnnotation(this.attractions)
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
