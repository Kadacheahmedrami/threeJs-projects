// app/utils/search-algorithms.ts
export interface QueueNode {
    x: number
    z: number
    distance: number
    parent: QueueNode | null
    cost?: number // For uniform cost search
    heuristic?: number // For A* search
    f?: number // For A* search (f = g + h)
  }
  
  export interface ExpansionNode {
    x: number
    z: number
    distance: number
  }
  
  // BFS - Breadth-First Search
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
  
  // DFS - Depth-First Search - Fixed implementation
  export function calculateDfsExpansionPath(grid: number[][], startPos: { x: number; z: number }): ExpansionNode[] {
    const height = grid.length
    const width = grid[0].length
  
    const visited: boolean[][] = Array(height)
      .fill(0)
      .map(() => Array(width).fill(false))
    const expansionNodes: ExpansionNode[] = []
    let nodeCounter = 0
  
    // DFS recursive implementation with sequential distance assignment
    function dfs(x: number, z: number, distance: number) {
      if (x < 0 || x >= width || z < 0 || z >= height || grid[z][x] === 1 || visited[z][x]) {
        return false
      }
  
      visited[z][x] = true
  
      expansionNodes.push({
        x,
        z,
        distance: nodeCounter++,
      })
  
      if (grid[z][x] === 3) {
        return true
      }
  
      // Try all four directions (in a specific order for DFS)
      if (dfs(x + 1, z, distance + 1)) return true // Right
      if (dfs(x, z + 1, distance + 1)) return true // Down
      if (dfs(x - 1, z, distance + 1)) return true // Left
      if (dfs(x, z - 1, distance + 1)) return true // Up
  
      return false
    }
  
    dfs(startPos.x, startPos.z, 0)
    return expansionNodes
  }
  
  // Uniform Cost Search
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
  
  // A* Search
  export function calculateAStarExpansionPath(grid: number[][], startPos: { x: number; z: number }): ExpansionNode[] {
    const height = grid.length
    const width = grid[0].length
  
    // Find goal position
    let goalPos = { x: 0, z: 0 }
    for (let z = 0; z < height; z++) {
      for (let x = 0; x < width; x++) {
        if (grid[z][x] === 3) {
          goalPos = { x, z }
        }
      }
    }
  
    // Manhattan distance heuristic
    const heuristic = (x: number, z: number) => {
      return Math.abs(x - goalPos.x) + Math.abs(z - goalPos.z)
    }
  
    const visited: boolean[][] = Array(height)
      .fill(0)
      .map(() => Array(width).fill(false))
    const openSet: QueueNode[] = []
    const expansionNodes: ExpansionNode[] = []
    let nodeCounter = 0
  
    const startHeuristic = heuristic(startPos.x, startPos.z)
    openSet.push({
      x: startPos.x,
      z: startPos.z,
      distance: 0,
      parent: null,
      cost: 0, // g score
      heuristic: startHeuristic, // h score
      f: startHeuristic, // f = g + h
    })
  
    const dx = [1, 0, -1, 0]
    const dz = [0, 1, 0, -1]
  
    while (openSet.length > 0) {
      // Sort by f score (f = g + h) and take the lowest
      openSet.sort((a, b) => (a.f || 0) - (b.f || 0))
      const current = openSet.shift()!
  
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
          const newCost = (current.cost || 0) + 1 // g score
          const newHeuristic = heuristic(newX, newZ) // h score
          const newF = newCost + newHeuristic // f score
  
          openSet.push({
            x: newX,
            z: newZ,
            distance: current.distance + 1,
            parent: current,
            cost: newCost,
            heuristic: newHeuristic,
            f: newF,
          })
        }
      }
    }
    return expansionNodes
  }
  
  