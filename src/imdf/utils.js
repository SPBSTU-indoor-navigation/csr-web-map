import { Shape, Path, ShapeGeometry, Mesh, MeshBasicMaterial, BufferGeometry } from 'three'
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

const metersInLatDegree = 111194.92664
const Deg2Rad = Math.PI / 180.0
export function geoToVector(pivot, position) {
  return {
    x: (position.longitude - pivot.longitude) * metersInLatDegree * Math.cos(Deg2Rad * (pivot.latitude + position.latitude) / 2),
    y: (position.latitude - pivot.latitude) * metersInLatDegree
  }
}

export function processGeometryCoordinates(geometry, pivot) {

  function processPointAttay(points) {
    return points.map(point => geoToVector(pivot, { latitude: point[1], longitude: point[0] }))
  }

  if (!geometry) return null


  let coordinates = geometry.coordinates

  switch (geometry.type) {
    case 'Polygon':
      coordinates = coordinates.map(cicle => processPointAttay(cicle))
      break;
    case 'MultiPolygon':
      coordinates = coordinates.map(polygon => polygon.map(cicle => processPointAttay(cicle)))
      break;

    default: break;
  }

  return {
    type: geometry.type,
    coordinates: coordinates
  }
}


function createPolygonGeometry(coordinates) {
  const shape = new Shape()

  coordinates.forEach((points, i) => {
    const path = new Path().setFromPoints(points)

    if (i == 0) {
      shape.add(path)
    } else {
      shape.holes.push(path)
    }

  })

  return new ShapeGeometry(shape)
}

export function geometryIMDF2Three(geometry) {
  if (geometry.type === 'Polygon') return createPolygonGeometry(geometry.coordinates)
  if (geometry.type === 'MultiPolygon') return mergeBufferGeometries(geometry.coordinates.map(createPolygonGeometry))

  console.warn('Unsupported geometry type: ' + geometry.type)
  return new BufferGeometry()
}

export function featureCollectionGeometryThree(collection) {
  return mergeGeometrys(collection.map(t => geometryIMDF2Three(t.geometry)))
}

export function mergeGeometrys(geometrys) {
  return mergeBufferGeometries(geometrys, false)
}

/** @return { Mesh } */
export function meshForFeatureCollection(collection, color, order = 0) {
  const matertial = new MeshBasicMaterial({ color: color, wireframe: false })
  const mesh = new Mesh(featureCollectionGeometryThree(collection), matertial);
  mesh.translateZ(order)
  mesh.updateMatrixWorld()
  mesh.matrixAutoUpdate = false
  return mesh
}