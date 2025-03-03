// Uniform Cost Search implementation
import type { QueueNode, ExpansionNode } from "@/app/types/search-types"

export function calculateUniformCostExpansionPath(
  grid: number[][],
  startPos: { x: number; z: number },
): ExpansionNode[] {
  const height = grid.length
  const width = grid[0].length

  const visited: boolean[][] = Array(height)
    .fill(0)
    .map(() => Array(width).fill(false))
  const priorityQueue: QueueNode[] = []
  const expansionNodes: ExpansionNode[] = []
  let nodeCounter = 0

  priorityQueue.push({
    x: startPos.x,
    z: startPos.z,
    distance: 0,
    parent: null,
    cost: 0,
  })

  const dx = [1, 0, -1, 0]
  const dz = [0, 1, 0, -1]

  while (priorityQueue.length > 0) {
    // Sort by cost and take the lowest cost node
    priorityQueue.sort((a, b) => (a.cost || 0) - (b.cost || 0))
    const current = priorityQueue.shift()!

    if (visited[current.z][current.x]) continue

    visited[current.z][current.x] = true
    expansionNodes.push({
      x: current.x,
      z: current.z,
      distance: nodeCounter++,
    })

    if (grid[current.z][current.x] === 3) {
      break
    }

    for (let i = 0; i < 4; i++) {
      const newX = current.x + dx[i]
      const newZ = current.z + dz[i]
      if (newX >= 0 && newX < width && newZ >= 0 && newZ < height && grid[newZ][newX] !== 1 && !visited[newZ][newX]) {
        // In a real UCS, cost would vary based on terrain, but here we use 1 for all moves
        const newCost = (current.cost || 0) + 1
        priorityQueue.push({
          x: newX,
          z: newZ,
          distance: current.distance + 1,
          parent: current,
          cost: newCost,
        })
      }
    }
  }

  return expansionNodes
}

