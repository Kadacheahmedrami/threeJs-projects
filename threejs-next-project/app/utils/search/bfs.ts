// Breadth-First Search implementation
import type { QueueNode, ExpansionNode } from "@/app/types/search-types"

export function calculateBfsExpansionPath(grid: number[][], startPos: { x: number; z: number }): ExpansionNode[] {
  const height = grid.length
  const width = grid[0].length

  const visited: boolean[][] = Array(height)
    .fill(0)
    .map(() => Array(width).fill(false))
  const queue: QueueNode[] = []
  const expansionNodes: ExpansionNode[] = []

  queue.push({ x: startPos.x, z: startPos.z, distance: 0, parent: null })
  visited[startPos.z][startPos.x] = true

  const dx = [1, 0, -1, 0]
  const dz = [0, 1, 0, -1]

  while (queue.length > 0) {
    const current = queue.shift()!
    expansionNodes.push({
      x: current.x,
      z: current.z,
      distance: current.distance,
    })

    if (grid[current.z][current.x] === 3) {
      break
    }

    for (let i = 0; i < 4; i++) {
      const newX = current.x + dx[i]
      const newZ = current.z + dz[i]
      if (newX >= 0 && newX < width && newZ >= 0 && newZ < height && grid[newZ][newX] !== 1 && !visited[newZ][newX]) {
        visited[newZ][newX] = true
        queue.push({
          x: newX,
          z: newZ,
          distance: current.distance + 1,
          parent: current,
        })
      }
    }
  }

  return expansionNodes
}

