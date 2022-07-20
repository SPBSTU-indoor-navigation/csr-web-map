import "core-js/actual/array/group-by"
import { Group } from "three"
import { createPolygon, createMKStyle, createLine } from '../components/MapKit/utils'

import { meshForFeatureCollection } from './utils'

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
  constructor(environment, detail) {
    this.geometry = {}

    this.environment = environment
    this.detail = detail


    const groupedEnvironment = environment.groupBy(t => t.properties.category)
    const groupedDetail = detail.groupBy(t => t.properties.category)

    order.forEach((category, i) => {
      const features = groupedEnvironment[category] || groupedDetail[category]
      if (!features) return

      this.geometry[category] = meshForFeatureCollection(features, 0xffff00, -1 + (i * 0.01))
    })

    this.groupMesh = new Group()
    Object.values(this.geometry).forEach(mesh => this.groupMesh.add(mesh))
  }

  /** @param { import('three').Scene } scene */
  Add(scene) {
    scene.add(this.groupMesh)
  }

  /** @param { import('three').Scene } scene */
  Remove(scene) {
    scene.remove(this.groupMesh)
  }

  Style(styleSheet) {
    Object.keys(this.geometry).forEach(category => {
      this.geometry[category].material.color.set(styleSheet.environment[category].fillColor)
    })
  }
}
