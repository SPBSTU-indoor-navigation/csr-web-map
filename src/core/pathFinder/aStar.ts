
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
    const open: Node[] = []
    const closed: Node[] = []
    const cameFrom: Map<Node, Node> = new Map()

    open.push(this)

    while (open.length > 0) {
      const current = open.sort((a, b) => a.estimatedCost(goal) - b.estimatedCost(goal))[0]

      if (current === goal) {
        const path: Node[] = []
        let current = goal
        while (current !== this) {
          path.unshift(current)
          current = cameFrom.get(current)
        }
        return path
      }

      open.splice(open.indexOf(current), 1)
      closed.push(current)

      for (const neighbor of current.connectedNodes) {
        if (closed.includes(neighbor)) continue
        const tentativeGScore = current.cost(neighbor)
        if (!open.includes(neighbor)) open.push(neighbor)
        else if (tentativeGScore >= current.cost(neighbor)) continue

        cameFrom.set(neighbor, current)
      }
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
