import Venue from "@/core/imdf/venue";
import { IAnnotation, annotationIsIndoor } from "@/core/map/overlayDrawing/annotations/annotation";
import { PathNode } from "@/core/pathFinder";
import { Object3D, Vector2 } from "three";
import { ShallowRef } from "vue";


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
  top: number;
  left: number;
  bottom: number;
  right: number;
}


export namespace MapKit {

  export interface Coordinate {
    latitude: number;
    longitude: number;
  }

  export function Coordinate(latitude: number, longitude: number): Coordinate {
    // @ts-ignore
    return new mapkit.Coordinate(latitude, longitude) as Coordinate;
  }

  export interface IMap {
    center: Coordinate
    cameraDistance: number
  }
}

export function focusMap(params: {
  annotation: IAnnotation,
  map: MapKit.IMap,
  variant: FocusVariant,
  insets: Insets,
  translate: (location: MapKit.Coordinate) => Vector2,
  inverse: (pos: Vector2) => MapKit.Coordinate,
  project: (pos: Vector2) => Vector2,
  onEnd?: () => void
}): void {
  const { annotation, map, variant, insets, translate, inverse, onEnd } = params;
  const location = inverse(annotation.scenePosition);

  const center = MapKit.Coordinate(location.latitude, location.longitude);


  let distance = 0;
  if (annotationIsIndoor(annotation)) {
    annotation.building.ChangeOrdinal(annotation.level.ordinal);
    distance = 140
  } else {
    distance = 1000;
  }


  map.center = center;
  map.cameraDistance = distance;
}
