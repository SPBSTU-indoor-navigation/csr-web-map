const metersInLatDegree = 111194.92664
const Deg2Rad = Math.PI / 180.0

declare type Location = {
  longitude: number;
  latitude: number;
}

declare type Vector2 = {
  x: number;
  y: number;
}

export function geoToVector(pivot: Location, position: Location): Vector2 {
  return {
    x: (position.longitude - pivot.longitude) * metersInLatDegree * Math.cos(Deg2Rad * (pivot.latitude + position.latitude) / 2),
    y: (position.latitude - pivot.latitude) * metersInLatDegree
  }
}


export function vectorToGeo(pivot: Location, position: Vector2): Location {
  const lat = position.y / metersInLatDegree + pivot.latitude
  return {
    latitude: lat,
    longitude: position.x / (metersInLatDegree * Math.cos(Deg2Rad * (pivot.latitude + lat) / 2.0)) + pivot.longitude
  }
}
