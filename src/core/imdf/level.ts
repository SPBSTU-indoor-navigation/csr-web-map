import { AmenityAnnotation } from '@/components/map/annotations/renders/amenity'
import { OccupantAnnotation } from '@/components/map/annotations/renders/occupant'
import { IMap } from '@/components/map/mapControlls'
import { Group, Mesh, MeshBasicMaterial, Vector2 } from 'three'
import { Annotation } from '../map/overlayDrawing/annotations/annotation'
import { LocalizedString } from '../shared/localizedString'
import { meshForFeatureCollection, outlineMeshForFeatureCollection } from './utils'


export default class Level {
  annotations: Annotation[] = []
  data: {
    id: string,
    properties: {
      name: LocalizedString
      short_name: LocalizedString
    }
  }

  ordinal: number
  isShow = false

  private units
  private openings
  private details
  private amenitys
  private occupants

  private geometrys: { [key: string]: Mesh }
  private groupMesh: Group

  constructor(data, units, openings, details, amenitys, occupants, lineMeshMaterialStorage) {
    data.properties.name = new LocalizedString(data.properties.name)
    data.properties.short_name = new LocalizedString(data.properties.short_name)

    this.ordinal = data.properties.ordinal

    this.data = data
    this.units = units
    this.openings = openings
    this.details = details
    this.amenitys = amenitys
    this.occupants = occupants

    this.annotations = occupants.map(t => {
      const pos = t.properties.anchor.geometry.coordinates
      return new OccupantAnnotation(new Vector2(pos.x, pos.y), t, this)
    })

    this.annotations.push(...amenitys.map(t => {
      const pos = t.geometry.coordinates
      return new AmenityAnnotation(new Vector2(pos.x, pos.y), t, this)
    }))

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

  Add(map: IMap) {
    map.addOverlay(this.groupMesh)
    map.addAnnotation(this.annotations)
    this.isShow = true
  }

  Remove(map: IMap) {
    map.removeOverlay(this.groupMesh)
    map.removeAnnotation(this.annotations)
    this.isShow = false
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
      const material = this.geometrys[category].material as MeshBasicMaterial

      material.color.set(style.fillColor)
    })

    // @ts-ignore material.color
    this.geometrys.outline.material.color.set(styleSheet.indoor.outline.strokeColor)
    // @ts-ignore material.color
    this.geometrys.levelOutline.material.color.set(styleSheet.indoor.outline.strokeColor)
  }

  OnZoom(zoom) {
    // @ts-ignore lineWidth
    this.geometrys.outline.material.lineWidth = Math.max(zoom / 15, 2)
    // @ts-ignore lineWidth
    this.geometrys.levelOutline.material.lineWidth = Math.max(zoom / 10, 5)
  }
}
