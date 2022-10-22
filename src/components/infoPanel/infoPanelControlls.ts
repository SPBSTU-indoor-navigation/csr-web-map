import { IAnnotation } from "@/core/map/overlayDrawing/annotations/annotation";

let setFrom: (info: IAnnotation) => void;
let setTo: (info: IAnnotation) => void;

export interface IInfoPanelDelegate {
  pages?: () => { component: any; data: any; key: number }[],
  push?: (params: { component: any; data: any, collapse?: boolean }) => void,
  pop?: () => void,
  popTo?: (index: number) => void,
}

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
