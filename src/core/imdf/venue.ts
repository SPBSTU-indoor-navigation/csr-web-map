import { convert, IAnnotationInfo } from "@/components/map/annotations/annotationInfo";
import { AmenityAnnotation } from "@/components/map/annotations/renders/amenity";
import { OccupantAnnotation } from "@/components/map/annotations/renders/occupant";
import { BufferGeometry, Mesh, MeshBasicMaterial, Vector2 } from "three";
import { MapController } from "../map/mapController";
import Building from "./building";
import Environments from "./environment";
import Level from "./level";
import { MeshLineMaterial } from "./MeshLineESM";
import {
  createPolygon, geoToVector,
  LineMeshMaterialStorage,
  meshForFeatureCollection, outlineMeshForFeatureCollection, processGeometryCoordinates,
  unwrapBy, createSvgPathFromFeature, createSvgPathFromFeatureCollection
} from './utils';

import { PathFinder } from '@/core/pathFinder'
import { IAnnotation } from "../map/annotations/annotation";

export default class Venue {
  archive: {
    building: any[];
    venue: any[];
  }
  data = {}

  buildings: Building[] = []
  environments: Environments
  enviromentAmenity: AmenityAnnotation[] = []

  annotations: IAnnotationInfo[] = []
  pathFinder: PathFinder
  navpathBegin: IAnnotation


  private lineMeshMaterialStorage: LineMeshMaterialStorage
  private mkGeometry: any
  private pivot: { latitude: number, longitude: number }

  private mesh: Mesh<BufferGeometry, MeshBasicMaterial>
  private buildingFootprintMesh: Mesh<BufferGeometry, MeshBasicMaterial>
  private buildingFootprintOutlineMesh: Mesh<BufferGeometry, MeshLineMaterial>

  constructor(archive) {
    this.lineMeshMaterialStorage = new LineMeshMaterialStorage()
    this.data = archive.venue
    this.archive = archive
    this.mkGeometry = createPolygon(this.data)

    // @ts-ignore
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
        if (anchor_id) {
          feature.properties.anchor = anchorById[anchor_id]
          if (anchorById[anchor_id]?.properties?.address) feature.properties.address = anchorById[anchor_id].properties.address
        }
      })
    })

    console.log('archive', archive);

    const annotations = []
    this.buildings = archive.building.map(building => {

      const levels = archive.level
        .filter(t => t.properties.building_ids.includes(building.id))
        .map(level => {

          const units = archive.unit.filter(t => t.properties.level_id == level.id)

          const unitsIds = new Set(units.map(t => t.id))

          const openings = archive.opening.filter(t => t.properties.level_id == level.id)
          const details = archive.detail.filter(t => t.properties.level_id == level.id)
          const amenitys = archive.amenity.filter(t => t.properties.unit_ids.filter(Set.prototype.has, unitsIds).length != 0)
          const occupants = archive.occupant.filter(t => unitsIds.has(t.properties.anchor.properties.unit_id))

          return new Level(level, units, openings, details, amenitys, occupants, this.lineMeshMaterialStorage)
        })

      annotations.push(...levels.flatMap(t => t.annotations))

      return new Building(building, levels, archive.attraction.filter(t => t.properties.building_id == building.id))
    })

    this.buildings.forEach(building => {
      building.levels.forEach(level => {
        level.annotations.forEach(annotation => {
          if (annotation instanceof AmenityAnnotation || annotation instanceof OccupantAnnotation) {
            annotation.building = building
          }
        })
      })
    })


    this.enviromentAmenity = archive.enviromentAmenity.map(t => {
      const pos = t.geometry.coordinates
      return new AmenityAnnotation(new Vector2(pos.x, pos.y), t)
    })

    this.environments = new Environments(archive.enviroment, archive.detail, this.lineMeshMaterialStorage)
    this.mesh = meshForFeatureCollection(archive.venue, -2) as Mesh<BufferGeometry, MeshBasicMaterial>
    this.buildingFootprintMesh = meshForFeatureCollection(archive.building) as Mesh<BufferGeometry, MeshBasicMaterial>

    this.buildingFootprintOutlineMesh = outlineMeshForFeatureCollection(archive.building, 1, this.lineMeshMaterialStorage)


    annotations.push(...this.buildings.flatMap(t => t.attractions))
    annotations.push(...this.enviromentAmenity)

    this.annotations = annotations.map(convert)
    console.log('annotations', this.annotations);

    this.navpathBegin = annotations.find(t => t.id == this.data[0].properties.navpath_begin_id)

    this.pathFinder = new PathFinder(archive.navPath,
      archive.navPathAssocieted,
      new Map(this.buildings.map(t => [t.data.id, t])),
      new Map(this.buildings.flatMap(t => t.levels).map(t => [t.data.id, t])),
      this.annotations.map(t => t.annotation))
  }

  Add(map: MapController) {
    [this.mesh, this.buildingFootprintMesh, this.buildingFootprintOutlineMesh]
      .forEach(mesh => map.addOverlay(mesh))

    this.environments.Add(map)
    this.buildings.forEach(building => building.Add(map))
    setTimeout(() => map.addAnnotation(this.enviromentAmenity), 0)
  }

  Remove(map: MapController) {
    [this.mesh, this.buildingFootprintMesh, this.buildingFootprintOutlineMesh]
      .forEach(mesh => map.removeOverlay(mesh))

    this.environments.Remove(map)
    this.buildings.forEach(building => building.Remove(map))
  }

  Style(styleSheet) {
    this.mesh.material.color.set(styleSheet.venue.fillColor)
    this.buildingFootprintMesh.material.color.set(styleSheet['building.footprint'].fillColor)

    // @ts-ignore material.color
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

    // @ts-ignore material.color
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
