import { Animator } from "@/core/animator/animator";
import { geoToVector, meterPerLongitudeAtLatitude, metersInLatDegree } from "@/core/imdf/geoUtils";
import Venue from "@/core/imdf/venue";
import { annotationIsIndoor, IAnnotation } from "@/core/map/overlayDrawing/annotations/annotation";
import { PathNode } from "@/core/pathFinder";
import { Easing } from "@tweenjs/tween.js";
import { Object3D, Vector2 } from "three";
import { ShallowRef } from "vue";
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
  venue: ShallowRef<Venue | null>;

  selectAnnotation?(annotation: IAnnotation, focusVariant: FocusVariant): void;
  deselectAnnotation?(annotation: IAnnotation): void;

  addPath?: (path: PathNode[]) => string;
  removePath?: (id: string) => void;

  pinAnnotation?: (...annotation: IAnnotation[]) => void;
  unpinAnnotation?: (...annotation: IAnnotation[]) => void;
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

function applyCamera(map: mapkit.Map & { cameraDistance: number }, camera: CameraParams, animated: boolean = false, onCompleate?: () => void): void {
  const { center, rotation, cameraDistance } = camera

  if (animated) {
    const currentCamera = cameraParams(map)

    const vector = geoToVector(center, currentCamera.center)
    const distance = new Vector2(vector.x, vector.y).length()
    const regionDistance = regionWorldSize(map.region).length()

    const shouldFast = distance / regionDistance < 0.3 && Math.abs(rotation - currentCamera.rotation) < 0.1 && Math.abs(cameraDistance - currentCamera.cameraDistance) < 0.1

    new Animator()
      .animate({
        value: currentCamera, to: camera,
        duration: shouldFast ? 300 : 600,
        easing: shouldFast ? Easing.Cubic.Out : Easing.Cubic.InOut,
        onUpdate: (camera) => applyCamera(map, camera)
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


export function focusMap(params: {
  annotation: IAnnotation,
  map: mapkit.Map & { cameraDistance: number },
  insets: Insets,
  inverse: (pos: Vector2) => mapkit.Coordinate,
  onEnd?: () => void
}): void {
  const { annotation, map, insets, inverse, onEnd } = params;

  if (annotationIsIndoor(annotation)) {
    annotation.building.ChangeOrdinal(annotation.level.ordinal)
  }

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
  applyCamera(map, lastMap)

  applyCamera(map, targetMap, true, onEnd)
}

function insetsMapCenter(map: mapkit.Map, insets: Insets): mapkit.Coordinate {
  const { top, left, bottom, right } = insets
  const width = map.element.clientWidth
  const height = map.element.clientHeight

  return map.convertPointOnPageToCoordinate(new DOMPoint(
    width / 2 - (left + right) / 2,
    height / 2 - (top + bottom) / 2)
  )
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
