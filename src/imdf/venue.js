import Environments from "./environment";
import { createPolygon } from '../components/MapKit/utils'
import { processGeometryCoordinates, meshForFeatureCollection, outlineMeshForFeatureCollection, geoToVector, createPolygonOutlineGeometry, LineMeshMaterialStorage } from './utils'

export default class Venue {
  constructor(archive) {
    this.lineMeshMaterialStorage = new LineMeshMaterialStorage()
    this.data = archive.venue
    this.mkGeometry = createPolygon(this.data)
    this.mkGeometry.style = new mapkit.Style({ fillOpacity: 0, strokeOpacity: 0 })


    this.pivot = this.mkGeometry.region().center
    Object.keys(archive).forEach(featureCollection => {
      archive[featureCollection].forEach(feature => {
        feature.geometry = processGeometryCoordinates(feature.geometry, this.pivot)
      })
    })


    console.log(archive);
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
  }

  Translate(position) {
    return geoToVector(this.pivot, position)
  }

  OnResolutionChange(resolution) {
    this.lineMeshMaterialStorage.UpdateResolution({ x: resolution.width, y: resolution.height })
  }
}
