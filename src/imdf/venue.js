import Environments from "./environment";
import { createPolygon } from '../components/MapKit/utils'
import { processGeometryCoordinates, meshForFeatureCollection, outlineMeshForFeatureCollection, geoToVector, LineMeshMaterialStorage } from './utils'
import { unwrapBy } from './utils'
import Building from "./building";
import Level from "./level";


export default class Venue {
  constructor(archive) {
    this.lineMeshMaterialStorage = new LineMeshMaterialStorage()
    this.data = archive.venue
    this.mkGeometry = createPolygon(this.data)
    this.mkGeometry.style = new mapkit.Style({ fillOpacity: 0, strokeOpacity: 0 })

    this.pivot = this.mkGeometry.region().center

    const addressById = unwrapBy(archive.address, t => t.id)
    const anchorById = unwrapBy(archive.anchor, t => t.id)

    Object.keys(archive).forEach(featureCollection => {
      archive[featureCollection].forEach(feature => {
        feature.geometry = processGeometryCoordinates(feature.geometry, this.pivot)
        const address_id = feature.properties.address_id
        const anchor_id = feature.properties.anchor_id

        if (address_id) feature.properties.address = addressById[address_id]
        if (anchor_id) feature.properties.anchor = anchorById[anchor_id]
      })
    })


    console.log(archive);


    this.buildings = archive.building.map(building => {

      const levels = archive.level
        .filter(t => t.properties.building_ids.includes(building.id))
        .map(level => {

          const units = archive.unit.filter(t => t.properties.level_id == level.id)

          const unitsIds = new Set(units.map(t => t.id))

          const openings = archive.opening.filter(t => t.properties.level_id == level.id)
          const details = archive.detail.filter(t => t.properties.level_id == level.id)
          const amenitys = archive.amenity.filter(t => t.properties.unit_ids.filter(Set.prototype.has, unitsIds).size != 0)
          const occupants = archive.occupant.filter(t => unitsIds.has(t.properties.anchor.properties.unit_id))

          return new Level(level, units, openings, details, amenitys, occupants, this.lineMeshMaterialStorage)
        })


      return new Building(building,
        levels,
        archive.attraction.filter(t => t.properties.building_id == building.id))
    })

    // console.log('buildings', buildings);

    this.environments = new Environments(archive.enviroment, archive.detail, this.lineMeshMaterialStorage)
    this.mesh = meshForFeatureCollection(archive.venue, -2)
    this.buildingFootprintMesh = meshForFeatureCollection(archive.building)

    this.buildingFootprintOutlineMesh = outlineMeshForFeatureCollection(archive.building, 1, this.lineMeshMaterialStorage)



  }

  /** @param { import('three').Scene } scene */
  Add(scene) {
    [this.mesh, this.buildingFootprintMesh, this.buildingFootprintOutlineMesh]
      .forEach(mesh => scene.add(mesh))

    this.environments.Add(scene)

    this.buildings.forEach(building => building.Add(scene))
  }

  /** @param { import('three').Scene } scene */
  Remove(scene) {
    [this.mesh, this.buildingFootprintMesh]
      .forEach(mesh => scene.remove(mesh))
    this.environments.Remove(scene)
  }

  Style(styleSheet) {
    this.mesh.material.color.set(styleSheet.venue.fillColor)
    this.buildingFootprintMesh.material.color.set(styleSheet['building.footprint'].fillColor)
    this.buildingFootprintOutlineMesh.material.color.set(styleSheet['building.footprint'].strokeColor)

    this.buildingFootprintOutlineMesh.material.lineWidth = styleSheet['building.footprint'].lineWidth
    this.environments.Style(styleSheet)

    this.buildings.forEach(building => building.Style(styleSheet))
  }

  Translate(position) {
    return geoToVector(this.pivot, position)
  }

  OnResolutionChange(resolution) {
    this.lineMeshMaterialStorage.UpdateResolution({ x: resolution.width, y: resolution.height })
  }
}
