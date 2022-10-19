import { Path, Vector2 } from "three"
import Building from "../imdf/building"
import Level from "../imdf/level"
import { INavPath, INavPathAssocieted, Tag } from "../imdf/navPath"
import { IAnnotation } from "../map/annotations/annotation"
import { Node, Node2D, totalCost } from "./aStar"

export interface IPathResultNode {
  coordinate: { x: number, y: number }
  building: Building | null
  level: Level | null

  get isIndoor(): boolean
}

export class PathResult {

}


export class PathNode extends Node2D {
  building?: Building
  level?: Level
  weight: number
  tags: Tag[]

  extraWeight = 0

  constructor(pos: { x: number, y: number }, building?: Building, level?: Level, weight: number = 1, tags: Tag[] = []) {
    super(pos)
    this.building = building
    this.level = level
    this.weight = weight
    this.tags = tags
  }

  applyDenyTags(tags: Tag[]) {
    this.extraWeight = this.tags.some(tag => tags.includes(tag)) ? 1000 : 0
  }
}

export class PathFinder {
  private nodes: PathNode[] = []
  private associeted: Map<IAnnotation, PathNode[]> = new Map()

  constructor(navPath: INavPath[], associeted: INavPathAssocieted[], buildings: Map<string, Building>, levels: Map<string, Level>, annotations: IAnnotation[]) {
    const converted: Map<string, [INavPath, PathNode]> = new Map(
      navPath.map(t => [
        t.id,
        [t, new PathNode(t.geometry.coordinates, buildings.get(t.properties.builing_id), levels.get(t.properties.level_id), t.properties.weight, t.properties.tags)]
      ])
    )

    converted.forEach((val, id) => {
      val[1].addConnections(val[0].properties.neighbours.map(t => converted.get(t)![1]), false)
    })

    const annotationsMap: Map<string, IAnnotation> = new Map(annotations.map(t => [t.id, t]))
    associeted.forEach(t => {
      const annotation = annotationsMap.get(t.properties.associeted_id)
      const pathNode = converted.get(t.properties.pathNode_id)![1]

      if (this.associeted.has(annotation)) {
        this.associeted.get(annotation).push(pathNode)
      } else {
        this.associeted.set(annotation, [pathNode])
      }
    })

    this.nodes = Array.from(converted.values()).map(t => t[1])
  }

  nearestPathNode(to: IAnnotation): PathNode {
    let nearest: PathNode | null = null
    let nearestDistance = Infinity

    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i]

      const distance = to.scenePosition.distanceTo(new Vector2(node.position.x, node.position.y))
      if (distance < nearestDistance) {
        nearest = node
        nearestDistance = distance
      }
    }

    return nearest
  }

  findPath(from: IAnnotation, to: IAnnotation, denyTags: Tag[]): PathResult | null {
    let fromAssociated = this.associeted.get(from)
    let toAssociated = this.associeted.get(to)

    if (fromAssociated.length === 0) fromAssociated = [this.nearestPathNode(from)]
    if (toAssociated.length === 0) toAssociated = [this.nearestPathNode(to)]

    if (fromAssociated.length === 0 || toAssociated.length === 0) return null


    this.nodes.forEach(t => t.applyDenyTags(denyTags))

    let bestPath: Node[] | null = null
    let bestPathDistance = Infinity

    for (const from of fromAssociated) {
      for (const to of toAssociated) {
        const path = from.findPath(to)
        if (path.length == 0) continue

        const cost = totalCost(path)

        if (cost < bestPathDistance) {
          bestPath = path
          bestPathDistance = cost
        }
      }
    }

    return bestPath
  }
}
