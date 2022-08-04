import { Group } from 'three'
import { meshForFeatureCollection, outlineMeshForFeatureCollection } from './utils'


export default class Level {

  constructor(data, units, openings, details, amenitys, occupants, lineMeshMaterialStorage) {

    this.ordinal = data.properties.ordinal

    this.data = data
    this.units = units
    this.openings = openings
    this.details = details
    this.amenitys = amenitys
    this.occupants = occupants


    const groupedUnits = units.groupBy(t => {
      const restriction = t.properties.restriction

      return !restriction ? t.properties.category : t.properties.category + '.' + restriction
    })

    this.geometrys = {}

    Object.keys(groupedUnits).forEach(category => {
      this.geometrys[category] = meshForFeatureCollection(groupedUnits[category], 2)
    })

    this.geometrys.outline = outlineMeshForFeatureCollection(units, 3, lineMeshMaterialStorage)
    this.geometrys.levelOutline = outlineMeshForFeatureCollection([data], 3.5, lineMeshMaterialStorage)


    this.groupMesh = new Group()
    Object.values(this.geometrys).forEach(mesh => this.groupMesh.add(mesh))
  }

  /** @param { import('three').Scene } scene */
  Add(scene) {
    scene.add(this.groupMesh);
  }

  /** @param { import('three').Scene } scene */
  Remove(scene) {
    scene.remove(this.groupMesh);
  }

  Style(styleSheet) {
    Object.keys(this.geometrys).forEach(category => {
      let styleCategory = category

      if (['restroom', 'restroom.female', 'restroom.male'].includes(styleCategory)) {
        styleCategory = 'restroom'
      }

      if (styleCategory.includes('restricted')) {
        styleCategory = 'restricted'
      }

      const style = styleSheet.indoor[styleCategory] || styleSheet.indoor.default
      const material = this.geometrys[category].material

      material.color.set(style.fillColor)
    })

    this.geometrys.outline.material.color.set(styleSheet.indoor.outline.strokeColor)
    this.geometrys.levelOutline.material.color.set(styleSheet.indoor.outline.strokeColor)
  }

  OnZoom(zoom) {
    this.geometrys.outline.material.lineWidth = Math.max(zoom / 15, 2)
    this.geometrys.levelOutline.material.lineWidth = Math.max(zoom / 10, 7)
  }
}
