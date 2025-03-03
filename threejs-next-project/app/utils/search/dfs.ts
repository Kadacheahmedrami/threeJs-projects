// Depth-First Search implementation
import type { ExpansionNode } from "@/app/types/search-types"

export function calculateDfsExpansionPath(grid: number[][], startPos: { x: number; z: number }): ExpansionNode[] {
  const height = grid.length
  const width = grid[0].length

  const visited: boolean[][] = Array(height)
    .fill(0)
    .map(() => Array(width).fill(false))
  const expansionNodes: ExpansionNode[] = []
  let nodeCounter = 0
  let goalFound = false

  // DFS recursive implementation with sequential distance assignment
  function dfs(x: number, z: number) {
    if (x < 0 || x >= width || z < 0 || z >= height || grid[z][x] === 1 || visited[z][x] || goalFound) {
      return
    }

    visited[z][x] = true

    expansionNodes.push({
      x,
      z,
      distance: nodeCounter++,
    })

    if (grid[z][x] === 3) {
      goalFound = true
      return
    }

    // Try all four directions (in a specific order for DFS)
    dfs(x + 1, z) // Right
    dfs(x, z + 1) // Down
    dfs(x - 1, z) // Left
    dfs(x, z - 1) // Up
  }

  dfs(startPos.x, startPos.z)
  return expansionNodes
}

