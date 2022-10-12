import { IAnnotation } from "@/core/map/annotations/annotation";
import { ShallowRef } from "vue";


export interface IMapDelegate {
  selectedAnnotation: ShallowRef<IAnnotation | null>;

  selectAnnotation(annotation: IAnnotation): void;
  deselectAnnotation(annotation: IAnnotation): void;
  // selectedAnnotation(): IAnnotation;
}
