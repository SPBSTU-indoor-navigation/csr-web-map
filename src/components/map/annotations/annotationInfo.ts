
// var annotation: MKAnnotation { get }
// var annotationSprite: UIImage? { get }
// var backgroundSpriteColor: UIColor { get }

import { IAnnotation } from "@/core/map/annotations/annotation"


export class IAnnotationInfo {
  readonly annotation: IAnnotation

  readonly title: string
  readonly additionalTitle: string
  readonly place: string | null
  readonly floor: string | null
}
