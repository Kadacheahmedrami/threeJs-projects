import { QueueNode, ExpansionNode } from "@/app/types/search-types";

export function calculateGreedySearchExpansionPath(
  grid: number[][],
  startPos: { x: number; z: number }
): ExpansionNode[] {
  const height = grid.length;
  const width = grid[0].length;

  // Find goal position
  let goalPos = { x: 0, z: 0 };
  for (let z = 0; z < height; z++) {
    for (let x = 0; x < width; x++) {
      if (grid[z][x] === 3) {
        goalPos = { x, z };
      }
    }
  }

  // Manhattan distance heuristic
  const heuristic = (x: number, z: number) => {
    return Math.abs(x - goalPos.x) + Math.abs(z - goalPos.z);
  };

  const visited: boolean[][] = Array(height).fill(0).map(() => Array(width).fill(false));
  const openSet: QueueNode[] = [];
  const expansionNodes: ExpansionNode[] = [];
  let nodeCounter = 0;

  openSet.push({
    x: startPos.x,
    z: startPos.z,
    distance: 0,
    parent: null,
    heuristic: heuristic(startPos.x, startPos.z)
  });

  const dx = [1, 0, -1, 0];
  const dz = [0, 1, 0, -1];

  while (openSet.length > 0) {
    // Use default value for heuristic comparison
    openSet.sort((a, b) => (a.heuristic ?? 0) - (b.heuristic ?? 0));
    const current = openSet.shift()!;

    if (visited[current.z][current.x]) continue;

    visited[current.z][current.x] = true;
    expansionNodes.push({
      x: current.x,
      z: current.z,
      distance: nodeCounter++,
    });

    if (grid[current.z][current.x] === 3) {
      break;
    }

    for (let i = 0; i < 4; i++) {
      const newX = current.x + dx[i];
      const newZ = current.z + dz[i];
      if (
        newX >= 0 && newX < width &&
        newZ >= 0 && newZ < height &&
        grid[newZ][newX] !== 1 &&
        !visited[newZ][newX]
      ) {
        openSet.push({
          x: newX,
          z: newZ,
          distance: current.distance + 1,
          parent: current,
          heuristic: heuristic(newX, newZ)
        });
      }
    }
  }

  console.log(expansionNodes);
  return expansionNodes;
}
