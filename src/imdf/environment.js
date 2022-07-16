import "core-js/actual/array/group-by"
import { createPolygon, createMKStyle, createLine } from '../components/MapKit/utils'

const order = [
  'forest',
  'grass',
  'grass.stadion',
  'water',
  'sand',
  'tree',
  'road.dirt',
  'road.pedestrian.second',
  'road.pedestrian.main',
  'road.pedestrian.treadmill',
  'road.main',
  'fence.main',
  'fence.second',
]


export default class Environment {
  constructor(environment, details) {
    this.geometry = {
      sorted: []
    }

    this.data = environment


    const grouped = this.data.groupBy(t => t.properties.category)
    order.forEach(category => this.Polygon(category, grouped[category]))
    Object.keys(grouped).filter(t => !order.includes(t)).forEach(category => this.Polygon(category, grouped[category]))


    const groupedDetail = details.groupBy(t => t.properties.category)
    order.forEach(category => this.Line(category, groupedDetail[category]))
    Object.keys(groupedDetail).filter(t => !order.includes(t)).forEach(category => this.Line(category, groupedDetail[category]))
  }

  Polygon(category, features) {
    if (!features) return
    this.geometry[category] = createPolygon(features)
    this.geometry.sorted.push(category)
  }

  Line(category, features) {
    if (!features) return
    this.geometry[category] = createLine(features)
    this.geometry.sorted.push(category)
  }

  Add(map) {
    map.addOverlays(this.geometry.sorted.flatMap(t => this.geometry[t]))
  }

  Remove(map) {
    map.removeOverlays(this.geometry.sorted.flatMap(t => this.geometry[t]))
  }

  Style(styleSheet) {
    this.geometry.sorted.forEach(t => {
      if (styleSheet.environment[t]) {
        if (this.geometry[t].style) {
          this.geometry[t].style = createMKStyle(styleSheet.environment[t])
        } else {
          this.geometry[t].forEach(s => s.style = createMKStyle(styleSheet.environment[t]))
        }
      }
    })
  }
}
