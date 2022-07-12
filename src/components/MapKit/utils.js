
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