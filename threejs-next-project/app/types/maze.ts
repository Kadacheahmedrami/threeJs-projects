export type MazeCell = 0 | 1 | 2 | 3 // Empty, Wall, Start, End
export type MazeGrid = MazeCell[][]

export interface MazeProps {
  grid: MazeGrid
  cellSize?: number
}

