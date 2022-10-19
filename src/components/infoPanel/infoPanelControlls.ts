import { IAnnotation } from "@/core/map/annotations/annotation";

let setFrom: (info: IAnnotation) => void;
let setTo: (info: IAnnotation) => void;

export function useInfoPanel() {
  return {
    setFrom,
    setTo,
  }
}

export function useDefineControlls(params: {
  setFrom: typeof setFrom;
  setTo: typeof setTo;
}) {
  setFrom = params.setFrom;
  setTo = params.setTo;
}
