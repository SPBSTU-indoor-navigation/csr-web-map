import { meterPerLongitudeAtLatitude, metersInLatDegree } from "@/core/imdf/geoUtils";
import Venue from "@/core/imdf/venue";
import { annotationIsIndoor, IAnnotation } from "@/core/map/overlayDrawing/annotations/annotation";
import { PathNode } from "@/core/pathFinder";
import { Object3D, Vector2 } from "three";
import { ShallowRef } from "vue";
import { AmenityAnnotation } from "./annotations/renders/amenity";
import { AttractionAnnotation } from "./annotations/renders/attraction";
import { OccupantAnnotation } from "./annotations/renders/occupant";


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


export function focusMap(params: {
  annotation: IAnnotation,
  map: mapkit.Map & { cameraDistance: number },
  variant: FocusVariant,
  insets: Insets,
  translate: (location: mapkit.Coordinate) => Vector2,
  inverse: (pos: Vector2) => mapkit.Coordinate,
  project: (pos: Vector2) => DOMPoint,
  unproject: (pos: DOMPoint) => Vector2,
  onEnd?: () => void
}): void {
  const { annotation, map, variant, insets, translate, inverse, unproject, onEnd } = params;

  let deltaLat = map.region.span.latitudeDelta
  if (annotationIsIndoor(annotation)) {
    annotation.building.ChangeOrdinal(annotation.level.ordinal);
    deltaLat = 0.001
  } else {
    deltaLat = 0.006
  }

  // let targetZoom = map.cameraDistance
  // if (annotation instanceof OccupantAnnotation) {
  //   targetZoom = 150
  // } else if (annotation instanceof AmenityAnnotation) {
  //   if (annotationIsIndoor(annotation)) {
  //     targetZoom = 200
  //   } else {
  //     if (500 < targetZoom || targetZoom < 200) {
  //       targetZoom = 400
  //     }
  //   }
  // } else if (annotation instanceof AttractionAnnotation) {
  //   if (targetZoom > 1000) {
  //     targetZoom = 800
  //   }
  // }

  const scenePosition = inverse(annotation.scenePosition)
  const center = new mapkit.Coordinate(scenePosition.latitude, scenePosition.longitude)

  const region = regionWithInsets(map, insets, new mapkit.CoordinateRegion(center, new mapkit.CoordinateSpan(deltaLat, 0)))
  // map.center = region.center
  // map.cameraDistance = targetZoom
  map.region = new mapkit.CoordinateRegion(region.center, new mapkit.CoordinateSpan(deltaLat, 0))
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
