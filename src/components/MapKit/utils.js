
export function useUtils(map) {
  mapkit.PolygonOverlay.prototype.region = function () {
    const lat = this.points.flatMap(t => t).map(t => t.latitude)
    const lon = this.points.flatMap(t => t).map(t => t.longitude)
    const minLat = Math.min(...lat)
    const minLon = Math.min(...lon)
    const maxLat = Math.max(...lat)
    const maxLon = Math.max(...lon)

    const middle = (a, b) => (a + b) / 2

    return new mapkit.CoordinateRegion(
      new mapkit.Coordinate(middle(minLat, maxLat), middle(minLon, maxLon)),
      new mapkit.CoordinateSpan(maxLat - minLat, maxLon - minLon)
    );
  };
}

export async function importGeoJSON(collection, delegate) {
  return await new Promise((resolve) => {
    mapkit.importGeoJSON(collection, {
      ...delegate,
      geoJSONDidComplete(result) {
        resolve(result)
      }
    })
  })
}

export function createMKStyle(style) {

  const t = { ...style }
  t.fillOpacity = t.fillOpacity || 1
  t.fillColor = (t.fillColor || '#000')
  t.strokeOpacity = t.strokeOpacity || 0

  return new mapkit.Style(t)
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