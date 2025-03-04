import type { ExpansionNode } from "@/app/types/search-types"

export function calculateDfsExpansionPath(
  grid: number[][],
  startPos: { x: number; z: number }
): ExpansionNode[] {
  const height = grid.length
  const width = grid[0].length

  // Create a 2D array for visited flags
  const visited = Array.from({ length: height }, () => Array(width).fill(false))
  const expansionNodes: ExpansionNode[] = []
  let nodeCounter = 0

  // Simple recursive DFS implementation
  function dfs(x: number, z: number) {
    // Stop if out of bounds, at a wall, or already visited
    if (x < 0 || x >= width || z < 0 || z >= height || grid[z][x] === 1 || visited[z][x]) {
      return
    }

    visited[z][x] = true
    expansionNodes.push({ x, z, distance: nodeCounter++ })

    // Explore neighbors in order: right, down, left, up
    dfs(x + 1, z)
    dfs(x, z + 1)
    dfs(x - 1, z)
    dfs(x, z - 1)
  }

  dfs(startPos.x, startPos.z)
  return expansionNodes
}
