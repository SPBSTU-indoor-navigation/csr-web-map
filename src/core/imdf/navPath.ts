import { IFeature } from "./feature"

export enum Tag {
  dirt = 'dirt',
  service = 'service',
}

export interface INavPath extends IFeature<{
  builing_id?: string
  level_id?: string
  neighbours: [string]
  weight: number
  tags: [Tag]
}> { }


export interface INavPathAssocieted extends IFeature<{
  pathNode_id: string
  associeted_id: string
}> { }
