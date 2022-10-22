import { PathFinder, PathNode } from "@/core/pathFinder"
import { Vector2 } from "three"
import { v4 } from "uuid"
import { IOverlayDrawing } from "../useOverlayDrawing"

import { showDebugPath } from '@/store/debugParams'

class Route {
  isDirty = false

  constructor(public path: PathNode[]) { }

  draw(ctx: CanvasRenderingContext2D, project: (pos: { x: number, y: number }) => Vector2) {
    this.isDirty = false

    const start = project(this.path[0].position)

    ctx.beginPath()
    ctx.moveTo(start.x, start.y)

    for (let i = 0; i < this.path.length; i++) {
      const pos = project(this.path[i].position)
      ctx.lineTo(pos.x, pos.y)
    }

    ctx.stroke()
  }
}

export default function useMapPath(options: { pathFinder: PathFinder }) {
  let project: (pos: { x: number, y: number }) => Vector2
  let routes: Map<string, Route> = new Map()
  let dirty = false

  function setup(options: { project: (pos: { x: number, y: number }) => Vector2 }) {
    project = options.project
  }

  function add(path: PathNode[]): string {
    const id = v4()
    routes.set(id, new Route(path))
    dirty = true
    return id
  }

  function remove(id: string) {
    routes.delete(id)
    dirty = true
  }

  function draw(ctx: CanvasRenderingContext2D, canvasSize: Vector2) {
    dirty = false
    ctx.save()

    ctx.lineWidth = 7
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#106BFF'
    ctx.lineJoin = 'round'

    routes.forEach(route => route.draw(ctx, project))

    ctx.restore();

    if (showDebugPath.value)
      (options.pathFinder as any).nodes.forEach(node => {
        const t = (node as PathNode)
        const pos = project(t.position)

        const lerp = (t) => {
          const R = (255 * t) / 100
          const G = (255 * (100 - t)) / 100
          const B = 0

          return `rgb(${R}, ${G}, ${B})`
        }

        t.connectedNodes.forEach(n => {
          const pos2 = project((n as PathNode).position)

          ctx.beginPath()
          ctx.moveTo(pos.x, pos.y)
          ctx.lineTo(pos2.x, pos2.y)
          ctx.strokeStyle = lerp((t.weight - 1) * 50)
          ctx.stroke()
        })

        ctx.fillStyle = 'yellow'
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 2, 0, 2 * Math.PI)
        ctx.fill()
      })
  }

  function isDirty() {
    return dirty || Array.from(routes.values()).some(r => r.isDirty)
  }

  return {
    overlayDrawing: {
      isDirty,
      setup,
      draw,
    } as IOverlayDrawing,
    add,
    remove
  }
}
