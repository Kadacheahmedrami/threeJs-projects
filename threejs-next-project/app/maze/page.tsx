import MazeRenderer from "@/components/maze-renderer"
import type { MazeGrid } from "@/app/types/maze"

// Example maze layout:
// 0: Empty space
// 1: Wall
// 2: Start point
// 3: End point
const exampleMaze: MazeGrid = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [2, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 0, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 3, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]

export default function Home() {
  return (
    <main>
        <div className="h-screen w-screen bg-red-50"></div>
      <MazeRenderer grid={exampleMaze} cellSize={1.2} />
      
    </main>
  )
}

