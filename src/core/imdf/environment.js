import "core-js/actual/array/group-by"
import { Group } from "three"

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
  'steps',
  'fence.second',
  'fence.heigth',
  'crosswalk',
  'road.marking.main',
  'parking.marking',
  'parking.big',
  'stadion.grass.marking',
  'treadmill.marking'
]

const geometryBatchType = {
  'fence.main': 'line',
  'fence.second': 'line',
  'fence.heigth': 'line',
  crosswalk: 'line',
  'road.marking.main': 'line',
  'parking.marking': 'line',
  'parking.big': 'line',
  steps: 'line',
  'stadion.grass.marking': 'line',
  'treadmill.marking': 'line',
}


export default class Environment {
  constructor(environment, detail, lineMeshMaterialStorage) {
    this.geometry = {}

    this.environment = environment
    this.detail = detail


    const groupedEnvironment = environment.groupBy(t => t.properties.category)
    const groupedDetail = detail.groupBy(t => t.properties.category)

    order.forEach((category, i) => {
      const features = groupedEnvironment[category] || groupedDetail[category]
      if (!features) return

      const isLine = geometryBatchType[category] === 'line'
      this.geometry[category] = meshForFeatureCollection(features, -1 + (i * 0.01), isLine ? lineMeshMaterialStorage : undefined)
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
      const style = styleSheet.environment[category]
      const material = this.geometry[category].material

      if (geometryBatchType[category] === 'line') {
        material.color.set(style.strokeColor)
        material.lineWidth = style.lineWidth
        material.opacity = style.strokeOpacity || 1
        material.transparent = material.opacity == 1 ? false : true
        material.sizeAttenuation = style.screenSpace == undefined ? false : style.screenSpace
      } else {
        material.color.set(style.fillColor)
      }
    })
  }
}
