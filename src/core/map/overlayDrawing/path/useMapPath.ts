import { PathFinder, PathNode } from "@/core/pathFinder"
import { Vector2 } from "three"
import { v4 } from "uuid"
import { IOverlayDrawing } from "../useOverlayDrawing"

import { showDebugPath } from '@/store/debugParams'
import Level from "@/core/imdf/level"
import Building from "@/core/imdf/building"
import { groupBy } from "@/core/shared/utils"

class Route {
  isDirty = false
  private outdoor: (PathNode[])[] = []

  private indoor: {
    building: Building
    level: Level,
    path: PathNode[]
  }[] = []

  constructor(public path: PathNode[]) {
    if (path.length <= 1) return

    let temp: PathNode[] = path[0].isIndoor ? [] : [path[0]]
    for (let i = 1; i < path.length - 1; i++) {
      if (path[i - 1].isIndoor && path[i].isIndoor && path[i + 1].isIndoor) {
        if (temp.length > 0) {
          this.outdoor.push(temp)
        }
        temp = []
      } else {
        temp.push(path[i])
      }
    }

    if (path.length >= 2) {
      if (!(path[path.length - 2].isIndoor && path[path.length - 1].isIndoor)) {
        temp.push(path[path.length - 1])
        this.outdoor.push(temp)
      }
    }

    groupBy(path, p => p.building).forEach((path, building) => {
      if (building == null) return

      let splitByLevel: PathNode[][] = []

      let currentPath: PathNode[] = [path[0]]
      for (let i = 1; i < path.length; i++) {
        if (path[i - 1].level != path[i].level) {

          let isUp = path[i - 1].level!.ordinal < path[i].level!.ordinal
          splitByLevel.push(currentPath)
          currentPath = [path[i]]
        } else {
          currentPath.push(path[i])
        }
      }
      splitByLevel.push(currentPath)

      splitByLevel = splitByLevel.filter(p => p.length >= 2)
      this.indoor.push(...splitByLevel.map(t => ({ path: t, building, level: t[0].level })))
    })
  }

  draw(ctx: CanvasRenderingContext2D, project: (pos: { x: number, y: number }) => Vector2) {
    this.isDirty = false

    const drawPath = (path: PathNode[]) => {
      const start = project(path[0].position)
      ctx.beginPath()
      ctx.moveTo(start.x, start.y)

      for (let i = 0; i < path.length; i++) {
        const pos = project(path[i].position)
        ctx.lineTo(pos.x, pos.y)
      }

      ctx.stroke()
    }

    this.outdoor.forEach(path => {
      drawPath(path)
    })

    this.indoor.forEach(t => {
      if (t.level.isShow) {
        drawPath(t.path)
      }
    })
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
    ctx.strokeStyle = '#007afd'
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
