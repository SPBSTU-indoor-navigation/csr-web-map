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

function fromToPlan(plan: boolean) {
  return {
    from: true,
    to: true,
    plan
  }
}

function fromAmenityAnnotation(annotation: AmenityAnnotation): UnitInfoData {
  const prop = annotation.data.properties

  return {
    title: prop.name.bestLocalizedValue,
    fromToPlan: fromToPlan(false)
  }
}

function fromOccupantAnnotation(annotation: OccupantAnnotation): UnitInfoData {
  const prop = annotation.data.properties

  return {
    title: prop.name.bestLocalizedValue,
    detail: {
      phone: prop.phone,
      email: prop.email,
      website: prop.website,
      address: addressToString(prop.address)
    },
    fromToPlan: fromToPlan(false)
  }
}

function fromAttractionAnnotation(annotation: AttractionAnnotation): UnitInfoData {
  const prop = annotation.data.properties
  return {
    title: prop.name.bestLocalizedValue,

    fromToPlan: fromToPlan(true)
  }
}

export function unitInfoFromAnnotation(annotation: IAnnotation): UnitInfoData {

  if (annotation instanceof OccupantAnnotation) return fromOccupantAnnotation(annotation)
  if (annotation instanceof AttractionAnnotation) return fromAttractionAnnotation(annotation)
  if (annotation instanceof AmenityAnnotation) return fromAmenityAnnotation(annotation)


  return {
    title: '----',
  }
}
