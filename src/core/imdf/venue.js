import Building from "./building";
import Environments from "./environment";
import Level from "./level";
import {
  createPolygon, geoToVector,
  LineMeshMaterialStorage,
  meshForFeatureCollection, outlineMeshForFeatureCollection, processGeometryCoordinates,
  unwrapBy, createSvgPathFromFeature, createSvgPathFromFeatureCollection
} from './utils';


export default class Venue {

  /** @type {Building[]} */
  buildings = []
  archive = {}

  constructor(archive) {
    this.lineMeshMaterialStorage = new LineMeshMaterialStorage()
    this.data = archive.venue
    this.archive = archive
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

    console.log('archive', archive);

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

          return new Level(level, units, openings, details, amenitys, occupants, this.lineMeshMaterialStorage, (p) => geoToVector(this.pivot, p))
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

  /** @param { import('../map/mapController').MapController } map */
  Add(map) {
    [this.mesh, this.buildingFootprintMesh, this.buildingFootprintOutlineMesh]
      .forEach(mesh => map.addOverlay(mesh))

    this.environments.Add(map)

    this.buildings.forEach(building => building.Add(map))
  }

  /** @param { import('../map/mapController').MapController } map */
  Remove(map) {
    [this.mesh, this.buildingFootprintMesh, this.buildingFootprintOutlineMesh]
      .forEach(mesh => map.removeOverlay(mesh))

    this.environments.Remove(map)
    this.buildings.forEach(building => building.Remove(map))
  }

  Style(styleSheet) {
    this.mesh.material.color.set(styleSheet.venue.fillColor)
    this.buildingFootprintMesh.material.color.set(styleSheet['building.footprint'].fillColor)
    this.buildingFootprintOutlineMesh.material.color.set(styleSheet['building.footprint'].strokeColor)

    this.buildingFootprintOutlineMesh.material.lineWidth = styleSheet['building.footprint'].lineWidth
    this.environments.Style(styleSheet)

    this.buildings.forEach(building => building.Style(styleSheet))
  }

  CrateSVG() {
    const archive = this.archive
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

    const points = archive.venue[0].geometry.coordinates[0]
    const minX = Math.min(...points.map(t => t.x))
    const minY = Math.min(...points.map(t => t.y))

    svg.setAttribute('viewBox', `${minX} ${minY} ${Math.max(...points.map(t => t.x)) - Math.min(...points.map(t => t.x))} ${Math.max(...points.map(t => t.y)) - Math.min(...points.map(t => t.y))}`)

    const venue = createSvgPathFromFeature(archive.venue[0], this.mesh.material.color.getHexString())
    svg.appendChild(venue)

    svg.appendChild(this.environments.CrateSVG())

    const footprint = createSvgPathFromFeatureCollection(archive.building, this.buildingFootprintMesh.material.color.getHexString())
    footprint.setAttribute('stroke', '#' + this.buildingFootprintOutlineMesh.material.color.getHexString())
    footprint.setAttribute('stroke-width', this.buildingFootprintOutlineMesh.material.lineWidth)
    svg.appendChild(footprint)


    console.log('svg', svg);
  }

  Translate(position) {
    return geoToVector(this.pivot, position)
  }

  OnZoom(zoom) {
    this.buildings.forEach(building => building.OnZoom(zoom))
  }

  OnResolutionChange(resolution) {
    this.lineMeshMaterialStorage.UpdateResolution({ x: resolution.width, y: resolution.height })
  }
}
