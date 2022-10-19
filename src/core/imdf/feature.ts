
declare type Point = { x: number, y: number }

export declare type PointGeometry = {
  type: "Point",
  coordinates: Point
}

export interface IFeature<Properties> {
  id: string
  properties: Properties
  geometry: PointGeometry
}
