import Environments from "./environment";
import { createPolygon } from '../components/MapKit/utils'
import { processGeometryCoordinates, meshForFeatureCollection, geoToVector } from './utils'

import { Mesh, Color, Vector3 } from 'three';
import { MeshLine, MeshLineMaterial } from 'three.meshline';

import * as THREE from 'three'

export default class Venue {
  constructor(archive) {
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
    this.environments = new Environments(archive.enviroment, archive.detail)
    this.mesh = meshForFeatureCollection(archive.venue, 0xffff00, -2)
    this.buildingFootprintMesh = meshForFeatureCollection(archive.building, 0x00ffff)

  }

  /** @param { import('three').Scene } scene */
  Add(scene) {
    [this.mesh, this.buildingFootprintMesh]
      .forEach(mesh => scene.add(mesh))

    this.environments.Add(scene)



    const line = new MeshLine();
    line.setPoints(this.data[0].geometry.coordinates[0].map(t => new Vector3(t.x, t.y, 0)));
    const material = new MeshLineMaterial({
      color: 0xff0000,
      lineWidth: 0.005,
      sizeAttenuation: false
    });

    const mesh = new Mesh(line, material);
    scene.add(mesh);
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
    this.environments.Style(styleSheet)
  }

  Translate(position) {
    return geoToVector(this.pivot, position)
  }
}
