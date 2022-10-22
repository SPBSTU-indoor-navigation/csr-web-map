import Venue from "@/core/imdf/venue";
import { IAnnotation } from "@/core/map/overlayDrawing/annotations/annotation";
import { Object3D } from "three";
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
}

export interface IMapDelegate {
  selectedAnnotation: ShallowRef<IAnnotation | null>;
  venue: ShallowRef<Venue | null>;

  selectAnnotation?(annotation: IAnnotation, focusVariant: FocusVariant): void;
  deselectAnnotation?(annotation: IAnnotation): void;
  // selectedAnnotation(): IAnnotation;
}
