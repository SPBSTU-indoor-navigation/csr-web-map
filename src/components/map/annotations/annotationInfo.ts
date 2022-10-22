
// var annotation: MKAnnotation { get }
// var annotationSprite: UIImage? { get }
// var backgroundSpriteColor: UIColor { get }
import { IAnnotation } from "@/core/map/overlayDrawing/annotations/annotation"
import { LocalizedString } from "@/core/shared/localizedString"
import { AmenityAnnotation } from "./renders/amenity"
import { AttractionAnnotation } from "./renders/attraction"
import { OccupantAnnotation } from "./renders/occupant"

export class IAnnotationInfo {
  readonly annotation?: IAnnotation

  readonly annotationId: string

  readonly sprite?: HTMLImageElement
  readonly backgroundClass?: string

  readonly annotationType: 'occupant' | 'amenity' | 'attraction'
  readonly title: LocalizedString
  readonly additionalTitle?: LocalizedString
  readonly place?: LocalizedString | null
  readonly floor?: LocalizedString | null
}

export function convert(annotation: AttractionAnnotation | OccupantAnnotation | AmenityAnnotation): IAnnotationInfo {
  if (annotation instanceof AttractionAnnotation) {
    return {
      annotation: annotation,
      annotationId: annotation.id,
      annotationType: 'attraction',
      title: annotation.data.properties.name,
      additionalTitle: annotation.data.properties.short_name,
      sprite: annotation.contentImg,
    }
  } else if (annotation instanceof OccupantAnnotation) {
    return {
      annotation: annotation,
      annotationId: annotation.id,
      annotationType: 'occupant',
      title: annotation.data.properties.name,
      place: annotation.building?.data.properties.name,
      floor: annotation.level?.data.properties.name,
      sprite: annotation.img,
      backgroundClass: `background-color-occupant-${annotation.data.properties.category.replace('.', '-')}`,
    }
  } else if (annotation instanceof AmenityAnnotation) {
    return {
      annotation: annotation,
      annotationId: annotation.id,
      annotationType: 'amenity',
      title: annotation.data.properties.alt_name,
      place: annotation.building?.data.properties.name,
      floor: annotation.level?.data.properties.name,
    }
  }
}
