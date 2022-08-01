import { Group } from 'three'
import { meshForFeatureCollection, outlineMeshForFeatureCollection } from './utils'


export default class Level {

  constructor(data, units, openings, details, amenitys, occupants, lineMeshMaterialStorage) {



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

    console.log(groupedUnits);
    this.geometry = {}

    Object.keys(groupedUnits).forEach(category => {
      this.geometry[category] = meshForFeatureCollection(groupedUnits[category], 2)
    })

    this.geometry.outline = outlineMeshForFeatureCollection(units, 3, lineMeshMaterialStorage)
    // this.geometry.outline.material.sizeAttenuation = true

    console.log(this.geometry);



    this.groupMesh = new Group()
    Object.values(this.geometry).forEach(mesh => this.groupMesh.add(mesh))
  }

  /** @param { import('three').Scene } scene */
  Add(scene) {
    scene.add(this.groupMesh);
    console.log(this.groupMesh);
  }

  /** @param { import('three').Scene } scene */
  Remove(scene) {
    scene.remove(this.groupMesh);
  }

  Style(styleSheet) {
    Object.keys(this.geometry).forEach(category => {
      let styleCategory = category

      if (['restroom', 'restroom.female', 'restroom.male'].includes(styleCategory)) {
        styleCategory = 'restroom'
      }

      if (styleCategory.includes('restricted')) {
        styleCategory = 'restricted'
      }

      const style = styleSheet.indoor[styleCategory] || styleSheet.indoor.default
      const material = this.geometry[category].material

      material.color.set(style.fillColor)
    })

    this.geometry.outline.material.color.set(styleSheet.indoor.outline.strokeColor)
    this.geometry.outline.material.lineWidth = styleSheet.indoor.outline.lineWidth
  }
}
