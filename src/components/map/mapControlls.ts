import { Animator } from "@/core/animator/animator";
import Building from "@/core/imdf/building";
import { geoToVector, meterPerLongitudeAtLatitude, metersInLatDegree, vectorToGeo } from "@/core/imdf/geoUtils";
import { geometryIMDF2Three } from "@/core/imdf/utils";
import Venue from "@/core/imdf/venue";
import { Annotation, annotationIsIndoor, IAnnotation, Shape2D } from "@/core/map/overlayDrawing/annotations/annotation";
import { PathNode, PathResult } from "@/core/pathFinder";
import { Easing } from "@tweenjs/tween.js";
import { Box2, Object3D, Vector2, Vector3 } from "three";
import { Ref, ShallowRef } from "vue";
import { AmenityAnnotation } from "./annotations/renders/amenity";
import { AttractionAnnotation } from "./annotations/renders/attraction";
import { OccupantAnnotation } from "./annotations/renders/occupant";

export const INDOOR_SHOW_ZOOM = 4;
export const INDOOR_HIDE_ZOOM = 3.9;

export enum FocusVariant {
  none,
  center,
  safeArea
}

export interface IMap {
  addOverlay(...object: Object3D[]): void
  removeOverlay(...object: Object3D[]): void

  addAnnotation(annotation: IAnnotation | IAnnotation[]): void
  removeAnnotation(annotation: IAnnotation | IAnnotation[]): void

  addPath(path: PathNode[]): string
  removePath(id: string): void
}

export interface IMapDelegate {
  selectedAnnotation: ShallowRef<IAnnotation | null>;
  pinnedAnnotations: ShallowRef<IAnnotation[]>;
  preventSelection: Ref<boolean>;
  venue: ShallowRef<Venue | null>;

  selectAnnotation?(params: { annotation: IAnnotation, focusVariant: FocusVariant, insets?: Insets, animated?: boolean }): void;
  deselectAnnotation?(annotation: IAnnotation): void;

  addPath?: (path: PathResult) => string;
  removePath?: (id: string) => void;

  pinAnnotation?: (...annotation: IAnnotation[]) => void;
  unpinAnnotation?: (...annotation: IAnnotation[]) => void;

  focusOnBuilding?: (building: Building, insets?: Insets) => void;
}

export declare type Insets = {
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
}

export function regionWorldSize(region: mapkit.CoordinateRegion): Vector2 {
  const t = geoToVector(region.center, {
    latitude: region.center.latitude + region.span.latitudeDelta / 2,
    longitude: region.center.longitude + region.span.longitudeDelta / 2
  })

  return new Vector2(t.x, t.y)
}

export function zoomCalculate(map: mapkit.Map) {
  const delta = regionWorldSize(map.region)
  return map.element.clientWidth / delta.x
}

declare type CameraParams = {
  center: mapkit.Coordinate,
  rotation: number,
  cameraDistance: number
}

let currentAnimation: Animator | null = null

function applyCamera(map: mapkit.Map & { cameraDistance: number }, camera: CameraParams, animated: boolean = false, onCompleate?: () => void): void {
  const { center, rotation, cameraDistance } = camera

  function angleLerp(a0: number, a1: number, t: number) {
    function shortAngleDist(a0: number, a1: number) {
      var max = 360;
      var da = (a1 - a0) % max;
      return 2 * da % max - da;
    }

    return a0 + shortAngleDist(a0, a1) * t;
  }

  if (animated) {
    const currentCamera = cameraParams(map)

    const vector = geoToVector(center, currentCamera.center)
    const distance = new Vector2(vector.x, vector.y).length()
    const regionDistance = regionWorldSize(map.region).length()

    const shouldFast = distance / regionDistance < 0.3 && Math.abs(rotation - currentCamera.rotation) < 0.1 && Math.abs(cameraDistance - currentCamera.cameraDistance) < 0.1

    currentAnimation?.stop()
    currentAnimation = new Animator()
      .animate({
        value: { ...currentCamera, progress: 0 }, to: { ...camera, progress: 1 },
        duration: shouldFast ? 300 : 600,
        easing: Easing.Cubic.Out,
        onUpdate: (val) => {
          map.center = val.center
          map.rotation = angleLerp(currentCamera.rotation, camera.rotation, val.progress)
          map.cameraDistance = val.cameraDistance
        }
      })
      .onEnd(() => onCompleate?.())
      .start(true)
  } else {
    map.center = center
    map.rotation = rotation
    map.cameraDistance = cameraDistance
  }
}

function cameraParams(map: mapkit.Map & { cameraDistance: number }): CameraParams {
  return {
    center: map.center,
    rotation: map.rotation,
    cameraDistance: map.cameraDistance
  }
}

export function focusMapOnBuilding(params: {
  building: Building,
  map: mapkit.Map & { cameraDistance: number },
  insets: Insets,
  inverse: (pos: Vector2) => mapkit.Coordinate,
}) {
  const { building, map, insets, inverse } = params

  const rotation = building.data.properties.rotation ?? params.map.rotation

  const geometry = geometryIMDF2Three(building.data.geometry)
  geometry.computeBoundingBox()


  const delta = geometry.boundingBox.getCenter(new Vector3())
  const center = inverse(new Vector2(delta.x, delta.y))

  geometry.translate(-delta.x, -delta.y, 0)
  geometry.rotateZ(rotation * Math.PI / 180);
  geometry.translate(delta.x, delta.y, 0)

  geometry.computeBoundingBox()

  const bbox = new Box2(new Vector2(geometry.boundingBox.min.x, geometry.boundingBox.min.y), new Vector2(geometry.boundingBox.max.x, geometry.boundingBox.max.y))

  const size = vectorToGeo(center, bbox.max.add(bbox.min.negate()))

  const region = new mapkit.CoordinateRegion(center, new mapkit.CoordinateSpan(size.latitude - center.latitude, size.longitude - center.longitude))
  const target = regionWithInsets(map, {
    top: insets.top ?? 0,
    left: insets.left ?? 0,
    bottom: insets.bottom ?? 0,
    right: insets.right ?? 0
  }, region)

  const lastMap = cameraParams(map)
  map.region = target

  const targetMap: CameraParams = {
    center: map.center,
    rotation: -rotation,
    cameraDistance: map.cameraDistance
  }

  applyCamera(map, lastMap)
  applyCamera(map, targetMap, true)
}

export function focusMapOnPath(params: {
  path: PathResult,
  map: mapkit.Map & { cameraDistance: number },
  insets: Insets,
  inverse: (pos: Vector2) => mapkit.Coordinate,
}) {
  const { path, map, insets, inverse } = params

  const bbox = new Box2().setFromPoints(path.path.map(t => new Vector2(t.position.x, t.position.y)))
  bbox
    .expandByPoint(path.from.scenePosition)
    .expandByPoint(path.to.scenePosition)


  const center = inverse(bbox.getCenter(new Vector2()))
  const size = vectorToGeo(center, bbox.max.add(bbox.min.negate()))

  const region = new mapkit.CoordinateRegion(center, new mapkit.CoordinateSpan(size.latitude - center.latitude, size.longitude - center.longitude))


  const fromBbox = (path.from as Annotation).boundingBox.getSize(new Vector2())
  const toBbox = (path.to as Annotation).boundingBox.getSize(new Vector2())

  const addInsetsVertical = Math.max(fromBbox.y, toBbox.y) / 2 + 10
  const addInsetsHorizontal = Math.max(fromBbox.x, toBbox.x) / 2 + 10

  const target = regionWithInsets(map, {
    top: (insets.top ?? 0) + addInsetsVertical,
    left: (insets.left ?? 0) + addInsetsHorizontal,
    bottom: (insets.bottom ?? 0) + addInsetsVertical,
    right: (insets.right ?? 0) + addInsetsHorizontal
  }, region)


  const lastMap = cameraParams(map)
  map.region = target

  const targetMap: CameraParams = {
    center: map.center,
    rotation: map.rotation,
    cameraDistance: Math.max(80, map.cameraDistance)
  }

  applyCamera(map, lastMap)
  applyCamera(map, targetMap, true)
}

export function focusMapOnAnnotation(params: {
  annotation: IAnnotation,
  map: mapkit.Map & { cameraDistance: number },
  insets: Insets,
  animated: boolean
  inverse: (pos: Vector2) => mapkit.Coordinate,
  onEnd?: () => void
}): void {
  const { annotation, map, insets, animated, inverse, onEnd } = params;

  let targetZoom = map.cameraDistance
  if (annotation instanceof OccupantAnnotation) {
    targetZoom = 150
  } else if (annotation instanceof AmenityAnnotation) {
    if (annotationIsIndoor(annotation)) {
      targetZoom = 200
    } else {
      if (500 < targetZoom || targetZoom < 200) {
        targetZoom = 400
      }
    }
  } else if (annotation instanceof AttractionAnnotation) {
    if (targetZoom > 1000 || zoomCalculate(map) > INDOOR_SHOW_ZOOM) {
      targetZoom = 800
    }
  }

  const scenePosition = inverse(annotation.scenePosition)
  const center = new mapkit.Coordinate(scenePosition.latitude, scenePosition.longitude)

  const lastMap = cameraParams(map)
  const targetMap: CameraParams = {
    center: center,
    rotation: map.rotation,
    cameraDistance: targetZoom
  }

  applyCamera(map, targetMap)
  targetMap.center = insetsMapCenter(map, insets)

  if (animated) {
    applyCamera(map, lastMap)
    applyCamera(map, targetMap, true, onEnd)
  } else {
    applyCamera(map, targetMap, false, onEnd)
  }
}

function insetsMapCenter(map: mapkit.Map, insets: Insets): mapkit.Coordinate {
  const { top, left, bottom, right } = insets
  const width = map.element.clientWidth
  const height = map.element.clientHeight

  return map.convertPointOnPageToCoordinate(new DOMPoint(
    width / 2 - (left - right) / 2,
    height / 2 + (bottom - top) / 2
  ))
}

function regionWithInsets(map: mapkit.Map, insets: Insets, region: mapkit.CoordinateRegion): mapkit.CoordinateRegion {
  const mapSize = { width: map.element.clientWidth, height: map.element.clientHeight }
  const insetsAreaSize = { width: mapSize.width - insets.left - insets.right, height: mapSize.height - insets.top - insets.bottom }
  const { latitudeDelta, longitudeDelta } = region.span

  const screenAspect = insetsAreaSize.width / insetsAreaSize.height
  const geoAspect = (longitudeDelta * meterPerLongitudeAtLatitude(region.center.latitude) / metersInLatDegree) / latitudeDelta

  let kY = 0
  let kX = 0

  if (screenAspect > geoAspect) {
    kY = region.span.latitudeDelta / insetsAreaSize.height
    kX = kY * metersInLatDegree / meterPerLongitudeAtLatitude(region.center.latitude)
  } else {
    kX = region.span.longitudeDelta / insetsAreaSize.width
    kY = kX * meterPerLongitudeAtLatitude(region.center.latitude) / metersInLatDegree
  }

  const geoInsets = {
    top: insets.top * kY,
    left: insets.left * kX,
    bottom: insets.bottom * kY,
    right: insets.right * kX
  }

  const insetsSpan = new mapkit.CoordinateSpan(
    latitudeDelta + geoInsets.top + geoInsets.bottom,
    longitudeDelta + geoInsets.left + geoInsets.right
  )

  const center = new mapkit.Coordinate(
    region.center.latitude + geoInsets.top / 2 - geoInsets.bottom / 2,
    region.center.longitude - geoInsets.left / 2 + geoInsets.right / 2
  )

  return new mapkit.CoordinateRegion(center, insetsSpan)
}
