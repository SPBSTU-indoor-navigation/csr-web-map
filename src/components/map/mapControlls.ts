import { IAnnotation } from "@/core/map/annotations/annotation";
import { ShallowRef } from "vue";


export enum FocusVariant {
  none,
  center,
  safeArea
}

export interface IMapDelegate {
  selectedAnnotation: ShallowRef<IAnnotation | null>;

  selectAnnotation?(annotation: IAnnotation, focusVariant: FocusVariant): void;
  deselectAnnotation?(annotation: IAnnotation): void;
  // selectedAnnotation(): IAnnotation;
}
