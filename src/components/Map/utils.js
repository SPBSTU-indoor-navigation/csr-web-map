import { Box2, Plane, Raycaster, Vector2, Vector3 } from "three"

/** @param {Box2} bbox */
export function nearestBuiling(bbox, camera, venue) {
  const raycaster = new Raycaster()
  const plane = new Plane(new Vector3(0, 0, 1))

  const worldPoint = (screen) => {
    raycaster.setFromCamera(screen.clone(), camera)
    const point = raycaster.ray.intersectPlane(plane, new Vector3())

    if (!point) return null

    return new Vector2(point.x, point.y)
  }

  const center = worldPoint(bbox.getCenter(new Vector2(0, 0)))

  if (!center) return

  let buildings = venue.buildings.filter(t => t.levels.length > 0)

  for (let i = 0; i < buildings.length; i++) {
    if (buildings[i].IsInside(center))
      return buildings[i]
  }

  const topLeft = worldPoint(bbox.min)
  const topRight = worldPoint(new Vector2(bbox.max.x, bbox.min.y))
  const bottomLeft = worldPoint(new Vector2(bbox.min.x, bbox.max.y))
  const bottomRight = worldPoint(bbox.max)

  const screenBbox = (new Box2()).setFromPoints([topLeft, bottomRight, topRight, bottomLeft])
  buildings = buildings.filter(t => t.bbox.intersectsBox(screenBbox))


  let nearest = null
  let nearestDistance = Infinity

  for (let i = 0; i < buildings.length; i++) {
    for (let j = 0; j < buildings[i].points.length; j++) {
      const point = buildings[i].points[j];

      const distance = center.distanceToSquared(point)

      if (distance < nearestDistance && bbox.containsPoint(new Vector3(point.x, point.y, 0).project(camera))) {
        nearest = buildings[i]
        nearestDistance = distance
      }
    }
  }

  if (nearest)
    return nearest

  const diags = [[topLeft, bottomRight], [topRight, bottomLeft]]

  for (let i = 0; i < buildings.length; i++) {
    if (buildings[i].IsIntersectByLine({ start: diags[0][0], end: diags[0][1] })) return buildings[i]
    if (buildings[i].IsIntersectByLine({ start: diags[1][0], end: diags[1][1] })) return buildings[i]
  }

}
