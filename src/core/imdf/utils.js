import { BufferGeometry, Mesh, MeshBasicMaterial, Path, Shape, ShapeGeometry, Vector3 } from 'three';
import { MeshLine, MeshLineMaterial } from './MeshLineESM.js';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

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
    case 'MultiLineString':
      coordinates = coordinates.map(lines => processPointAttay(lines))
      break;

    default: break;
  }

  return {
    type: geometry.type,
    coordinates: coordinates
  }
}

export class LineMeshMaterialStorage {
  constructor() {
    this.materials = []
  }

  AddMateril(material) {
    this.materials.push(material)
  }

  UpdateResolution(resolution) {
    this.materials.forEach(material => material.resolution = resolution)
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

function createPolygonOutlineGeometry(coordinates) {
  const lines = coordinates.map(points => {
    const line = new MeshLine();
    const venuePoints = points.map(t => new Vector3(t.x, t.y, 0))
    venuePoints.push(venuePoints[1])
    line.setPoints(venuePoints.flatMap(t => [t]))
    return line
  })

  return mergeGeometrys(lines)
}

function createPolylineGeometry(coordinates) {
  const line = new MeshLine();
  const points = coordinates.map(p => new Vector3(p.x, p.y, 0)).flatMap(t => [t, t])
  // points.push(points[points.length - 1])
  // points.unshift(new Vector3(points[0].x + 1, points[0].y, 0))
  line.setPoints(points)
  return line
}

export function geometryIMDF2Three(geometry) {
  if (geometry.type === 'Polygon') return createPolygonGeometry(geometry.coordinates)
  if (geometry.type === 'MultiPolygon') return mergeBufferGeometries(geometry.coordinates.map(createPolygonGeometry))
  if (geometry.type === 'MultiLineString') return mergeBufferGeometries(geometry.coordinates.map(createPolylineGeometry))

  console.warn('Unsupported geometry type: ' + geometry.type)
  return new BufferGeometry()
}

export function outlineIMDF2Three(geometry) {
  if (geometry.type === 'Polygon') return createPolygonOutlineGeometry(geometry.coordinates)
  if (geometry.type === 'MultiPolygon') return mergeBufferGeometries(geometry.coordinates.map(createPolygonOutlineGeometry))

  console.warn('Unsupported geometry type: ' + geometry.type)
  return new BufferGeometry()
}

export function featureCollectionGeometry(collection) {
  return mergeGeometrys(collection.map(t => geometryIMDF2Three(t.geometry)))
}

export function featureCollectionOutlineGeometry(collection) {
  return mergeGeometrys(collection.map(t => outlineIMDF2Three(t.geometry)))
}

export function mergeGeometrys(geometrys) {
  return mergeBufferGeometries(geometrys, false)
}

/** @param { LineMeshMaterialStorage } materialStorage  @return { Mesh } */
export function outlineMeshForFeatureCollection(collection, order = 0, materialStorage) {

  const material = new MeshLineMaterial({ sizeAttenuation: false });

  materialStorage.AddMateril(material)

  const mesh = new Mesh(featureCollectionOutlineGeometry(collection), material);
  mesh.translateZ(order)
  mesh.updateMatrixWorld()
  mesh.matrixAutoUpdate = false
  return mesh
}

/** @param { LineMeshMaterialStorage } materialStorage @return { Mesh } */
export function meshForFeatureCollection(collection, order = 0, materialStorage) {
  let matertial
  if (materialStorage) {
    matertial = new MeshLineMaterial()
    materialStorage.AddMateril(matertial)
  } else {
    matertial = new MeshBasicMaterial({ wireframe: false })
  }

  const mesh = new Mesh(featureCollectionGeometry(collection), matertial);
  mesh.translateZ(order)
  mesh.updateMatrixWorld()
  mesh.matrixAutoUpdate = false
  return mesh
}




function polygon2Coordinate(polygon) {
  return polygon.map(cicle =>
    cicle.map(point => new mapkit.Coordinate(point[1], point[0]))
  )
}

function multiPolygon2Coordinate(multiPolygon) {
  return multiPolygon.flatMap(t => polygon2Coordinate(t))
}

export function createPolygon(feature) {

  let data = feature
  if (!Array.isArray(feature)) {
    data = [feature]
  }

  const geom = data.flatMap(feature => {
    if (feature.geometry.type === 'Polygon') {
      return polygon2Coordinate(feature.geometry.coordinates)
    } else if (feature.geometry.type === 'MultiPolygon') {
      return multiPolygon2Coordinate(feature.geometry.coordinates)
    }
  })

  const res = new mapkit.PolygonOverlay(geom)
  res.enabled = false
  return res

}

export function createLine(feature) {

  let data = feature
  if (!Array.isArray(feature)) {
    data = [feature]
  }

  const geom = data.flatMap(feature =>
    feature.geometry.coordinates.map(segment =>
      segment.map(point => new mapkit.Coordinate(point[1], point[0]))
    )
  )

  return geom.map(t => {
    const res = new mapkit.PolylineOverlay(t)

    res.enabled = false
    return res
  })
}


//IMDF

export function unwrapBy(array, by) {
  return array.reduce((acc, value) => {
    const key = by(value)
    acc[key] = value
    return acc
  }, {})
}



class SVGPath {

  path = ''

  constructor() { }

  moveTo(x, y) {
    this.path += ` M${x} ${y}`
  }

  lineTo(x, y) {
    this.path += ` L${x} ${y}`
  }

  close() {
    this.path += ` Z`
  }

}

//SVG
export function createSvgPathFromFeature(imdf, fill = null) {
  const path = new SVGPath()
  const { coordinates } = imdf.geometry

  const processPolygon = (polygon, close = false) => {
    polygon.forEach((points, i) => {
      points.forEach((point, j) => {
        if (j == 0) {
          path.moveTo(point.x, -point.y)
        } else {
          path.lineTo(point.x, -point.y)
        }
      })
      if (close) path.close()
    })
  }

  if (imdf.geometry.type === 'MultiPolygon') {
    coordinates.forEach((polygon, i) => {
      processPolygon(polygon, true)
    })
  } else if (imdf.geometry.type === 'Polygon') {
    processPolygon(coordinates, true)
  } else {
    processPolygon(coordinates)
  }
  const element = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  element.setAttribute('d', path.path)
  if (fill)
    element.setAttribute('fill', `#${fill}`)

  return element
}

export function createSvgPathFromFeatureCollection(imdf, fill = null) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', 'g')

  imdf.forEach(feature => {
    element.appendChild(createSvgPathFromFeature(feature, null))
  })

  if (fill)
    element.setAttribute('fill', `#${fill}`)

  return element
}

// Help

/** @param {import("three").Vector2} p0 */
/** @param {import("three").Vector2} p1 */
export function polygonIntersection(points, line) {
  function intersection(p0, p1, p2, p3) {
    var denominator = (p3.x - p2.x) * (p1.y - p0.y) - (p3.y - p2.y) * (p1.x - p0.x)
    var ua = (p3.y - p2.y) * (p0.x - p2.x) - (p3.x - p2.x) * (p0.y - p2.y)
    var ub = (p1.y - p0.y) * (p0.x - p2.x) - (p1.x - p0.x) * (p0.y - p2.y)

    if (denominator < 0) {
      ua = -ua; ub = -ub; denominator = -denominator
    }

    return ua >= 0.0 && ua <= denominator && ub >= 0.0 && ub <= denominator && denominator != 0
  }

  if (points.length <= 2) return false

  const { start: p0, end: p1 } = line

  if (intersection(p0, p1, points[0], points[points.length - 1])) return true

  for (let i = 1; i < points.length; i++) {
    if (intersection(p0, p1, points[i - 1], points[i])) return true
  }

  return false
}
