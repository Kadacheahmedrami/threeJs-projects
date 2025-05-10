import type { ExpansionNode } from "@/app/types/search-types"

export function calculateDfsExpansionPath(
  grid: number[][],
  startPos: { x: number; z: number }
): ExpansionNode[] {
  const height = grid.length
  const width = grid[0].length

  const visited = Array.from({ length: height }, () => Array(width).fill(false))
  const expansionNodes: ExpansionNode[] = []
  let nodeCounter = 0
  let found = false

  // Use a stack for DFS; each item is a node with x and z coordinates.
  type Node = { x: number; z: number }
  const stack: Node[] = [{ x: startPos.x, z: startPos.z }]

  while (stack.length > 0 && !found) {
    const { x, z } = stack.pop()!
    


    if (x < 0 || x >= width || z < 0 || z >= height || grid[z][x] === 1 || visited[z][x]) {
      continue
    }


    visited[z][x] = true

    // 
    expansionNodes.push({ x, z, distance: nodeCounter++ })

    if (grid[z][x] === 3) {
      found = true
      break
    }

    // Push neighbors in reverse order so that they are processed in the order:
    // right, down, left, up (similar to a recursive DFS)
    stack.push({ x: x, z: z - 1 }) // Up
    stack.push({ x: x - 1, z: z }) // Left
    stack.push({ x: x, z: z + 1 }) // Down
    stack.push({ x: x + 1, z: z }) // Right
  }

  return expansionNodes
}
