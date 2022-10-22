import Venue from "@/core/imdf/venue";
import { IAnnotation } from "@/core/map/overlayDrawing/annotations/annotation";
import { ShallowRef } from "vue";


export enum FocusVariant {
  none,
  center,
  safeArea
}

export interface IMapDelegate {
  selectedAnnotation: ShallowRef<IAnnotation | null>;
  venue: ShallowRef<Venue | null>;

  selectAnnotation?(annotation: IAnnotation, focusVariant: FocusVariant): void;
  deselectAnnotation?(annotation: IAnnotation): void;
  // selectedAnnotation(): IAnnotation;
}
