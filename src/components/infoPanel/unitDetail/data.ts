import { AttractionAnnotation } from '@/components/map/annotations/renders/attraction';
import { OccupantAnnotation } from '@/components/map/annotations/renders/occupant'
import { AmenityAnnotation } from '@/components/map/annotations/renders/amenity'
import { IAnnotation } from '@/core/map/overlayDrawing/annotations/annotation';



export declare type Detail = {
  phone?: string,
  email?: string,
  website?: string,
  address?: string
}

export declare type FromToPlan = {
  from: boolean,
  to: boolean,
  plan: boolean
}

export declare type UnitInfoData = {
  title: string;
  fromToPlan?: FromToPlan,
  detail?: Detail,
  share?: {

  }
}

function addressToString(address: any): string {
  var result = ""

  const unit = address.properties.unit
  const main = address.properties.address
  const postalCode = address.properties.postal_code

  if (unit) result += `${unit}`
  if (main) result += `\n${main}`
  if (postalCode) result += `\n${postalCode}`

  return result
}

function fromAmenityAnnotation(annotation: AmenityAnnotation, allowFrom: boolean) {
  const prop = annotation.data.properties

  return {
    title: prop.name.bestLocalizedValue,
    allowFocusPlan: false
  }
}

function fromOccupantAnnotation(annotation: OccupantAnnotation, allowFrom: boolean) {
  const prop = annotation.data.properties

  return {
    title: prop.name.bestLocalizedValue,
    detail: {
      phone: prop.phone,
      email: prop.email,
      website: prop.website,
      address: addressToString(prop.address)
    },
    allowFocusPlan: false
  }
}

function fromAttractionAnnotation(annotation: AttractionAnnotation, allowFrom: boolean) {
  const prop = annotation.data.properties

  return {
    title: prop.name.bestLocalizedValue,
    allowFocusPlan: true
  }
}

export function unitInfoFromAnnotation(annotation: IAnnotation, allowFrom: boolean, allowTo: boolean): UnitInfoData {

  const titleDetail = (): { title: string, allowFocusPlan: boolean, detail?: Detail } => {
    if (annotation instanceof OccupantAnnotation) return fromOccupantAnnotation(annotation, allowFrom)
    if (annotation instanceof AttractionAnnotation) return fromAttractionAnnotation(annotation, allowFrom)
    if (annotation instanceof AmenityAnnotation) return fromAmenityAnnotation(annotation, allowFrom)

    return { title: '----', allowFocusPlan: false }
  }

  const t = titleDetail()
  return {
    title: t.title,
    detail: t.detail,
    fromToPlan: {
      from: allowFrom,
      to: allowTo,
      plan: t.allowFocusPlan
    }
  }

}
