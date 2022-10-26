import { inversePath } from '@/store/debugParams'

interface INode {
  connectedNodes: Node[]
  estimatedCost(goal: Node): number
  cost(node: Node): number
  findPath(goal: Node): Node[]
}

export class Node {
  connectedNodes: Node[] = []

  addConnections(nodes: Node[], bidirectional = true) {
    this.connectedNodes.push(...nodes)
    if (bidirectional) nodes.forEach(node => node.addConnections([this], false))
  }

  removeConnections(nodes: Node[], bidirectional = true) {
    this.connectedNodes = this.connectedNodes.filter(node => !nodes.includes(node))
    if (bidirectional) nodes.forEach(node => node.removeConnections([this], false))
  }

  estimatedCost(goal: Node) {
    return 0
  }

  cost(node: Node) {
    return 0
  }

  findPath(goal: Node): Node[] {
    const openSet: Node[] = [this]
    const cameFrom: Map<Node, Node> = new Map()
    const gScore: Map<Node, number> = new Map()

    gScore.set(this, 0)

    const fScore: Map<Node, number> = new Map()
    fScore.set(this, this.estimatedCost(goal))

    let compare = (prev: Node, curr: Node) => (fScore.get(curr) ?? Infinity) < (fScore.get(prev) ?? Infinity) ? curr : prev

    if (inversePath.value) {
      compare = (prev: Node, curr: Node) => (fScore.get(curr) ?? Infinity) > (fScore.get(prev) ?? Infinity) ? curr : prev
    }

    while (openSet.length > 0) {
      let current = openSet.reduce(compare)

      if (current == goal) {
        const totalPath = [current]
        while (cameFrom.has(current)) {
          current = cameFrom.get(current)!
          totalPath.unshift(current)
        }
        return totalPath
      }

      openSet.splice(openSet.indexOf(current), 1)

      current.connectedNodes.forEach(neighbour => {
        const tentativeGScore = (gScore.get(current) ?? Infinity) + current.cost(neighbour)

        if (tentativeGScore < (gScore.get(neighbour) ?? Infinity)) {
          cameFrom.set(neighbour, current)
          gScore.set(neighbour, tentativeGScore)
          fScore.set(neighbour, tentativeGScore + neighbour.estimatedCost(goal))
          if (!openSet.includes(neighbour)) openSet.push(neighbour)
        }
      })
    }

    return []
  }

  findPathFrom(start: Node): Node[] {
    return start.findPath(this)
  }
}

export function totalCost(nodes: Node[]): number {
  if (nodes.length === 0) return 0

  let total = 0
  for (let i = 1; i < nodes.length - 1; i++) {
    total += nodes[i - 1].cost(nodes[i])
  }
  return total
}

export class Node2D extends Node {

  position: { x: number, y: number } = { x: 0, y: 0 }

  constructor(position: { x: number, y: number }) {
    super()
    this.position = position
  }

  override estimatedCost(goal: Node2D) {
    return Math.abs(this.position.x - goal.position.x) + Math.abs(this.position.y - goal.position.y)
  }

  cost(node: Node2D) {
    return Math.sqrt(Math.pow(this.position.x - node.position.x, 2) + Math.pow(this.position.y - node.position.y, 2))
  }
}
