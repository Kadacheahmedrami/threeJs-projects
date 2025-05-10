// Game board representation and core mechanics
class ConnectFour {
  constructor() {
    this.ROWS = 6
    this.COLS = 7
    this.EMPTY = 0
    this.PLAYER = 1
    this.AI = 2
    this.board = Array(this.ROWS)
      .fill()
      .map(() => Array(this.COLS).fill(this.EMPTY))
    this.currentPlayer = this.PLAYER // Player always starts
    this.gameOver = false
    this.winner = null
  }

  // Reset the game
  resetGame() {
    this.board = Array(this.ROWS)
      .fill()
      .map(() => Array(this.COLS).fill(this.EMPTY))
    this.currentPlayer = this.PLAYER
    this.gameOver = false
    this.winner = null
    return this.board
  }

  // Check if a column is valid for a move (not full)
  isValidMove(col) {
    return this.board[0][col] === this.EMPTY
  }

  // Get all valid moves (all non-full columns)
  getValidMoves() {
    const validMoves = []
    for (let col = 0; col < this.COLS; col++) {
      if (this.isValidMove(col)) {
        validMoves.push(col)
      }
    }
    return validMoves
  }

  // Make a move: place a disc in the specified column
  makeMove(col, player) {
    if (!this.isValidMove(col) || this.gameOver) {
      return false
    }

    // Find the lowest empty row in the selected column
    let row
    for (row = this.ROWS - 1; row >= 0; row--) {
      if (this.board[row][col] === this.EMPTY) {
        break
      }
    }

    // Place the disc
    this.board[row][col] = player

    // Check if this move results in a win
    if (this.checkWin(row, col, player)) {
      this.gameOver = true
      this.winner = player
    }
    // Check for a draw
    else if (this.isBoardFull()) {
      this.gameOver = true
    }

    return true
  }

  // Make a temporary move (for AI simulation)
  simulateMove(col, player, boardCopy) {
    if (boardCopy[0][col] !== this.EMPTY) {
      return false
    }

    // Find the lowest empty row in the selected column
    let row
    for (row = this.ROWS - 1; row >= 0; row--) {
      if (boardCopy[row][col] === this.EMPTY) {
        break
      }
    }

    // Place the disc
    boardCopy[row][col] = player
    return { row, col }
  }

  // Undo a simulated move
  undoMove(row, col, boardCopy) {
    boardCopy[row][col] = this.EMPTY
  }

  // Check if the board is full (draw condition)
  isBoardFull() {
    for (let col = 0; col < this.COLS; col++) {
      if (this.board[0][col] === this.EMPTY) {
        return false
      }
    }
    return true
  }

  // Check if the last move at (row, col) results in a win for the player
  checkWin(row, col, player) {
    const directions = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // diagonal \
      [1, -1], // diagonal /
    ]

    for (const [dRow, dCol] of directions) {
      let count = 1 // Start with 1 (the piece just placed)

      // Check in positive direction
      for (let i = 1; i <= 3; i++) {
        const newRow = row + dRow * i
        const newCol = col + dCol * i

        if (
          newRow >= 0 &&
          newRow < this.ROWS &&
          newCol >= 0 &&
          newCol < this.COLS &&
          this.board[newRow][newCol] === player
        ) {
          count++
        } else {
          break
        }
      }

      // Check in negative direction
      for (let i = 1; i <= 3; i++) {
        const newRow = row - dRow * i
        const newCol = col - dCol * i

        if (
          newRow >= 0 &&
          newRow < this.ROWS &&
          newCol >= 0 &&
          newCol < this.COLS &&
          this.board[newRow][newCol] === player
        ) {
          count++
        } else {
          break
        }
      }

      if (count >= 4) {
        return true
      }
    }

    return false
  }

  // Check if a sequence results in a win (for simulated board)
  checkWinForPosition(row, col, player, boardCopy) {
    const directions = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // diagonal \
      [1, -1], // diagonal /
    ]

    for (const [dRow, dCol] of directions) {
      let count = 1 // Start with 1 (the piece just placed)

      // Check in positive direction
      for (let i = 1; i <= 3; i++) {
        const newRow = row + dRow * i
        const newCol = col + dCol * i

        if (
          newRow >= 0 &&
          newRow < this.ROWS &&
          newCol >= 0 &&
          newCol < this.COLS &&
          boardCopy[newRow][newCol] === player
        ) {
          count++
        } else {
          break
        }
      }

      // Check in negative direction
      for (let i = 1; i <= 3; i++) {
        const newRow = row - dRow * i
        const newCol = col - dCol * i

        if (
          newRow >= 0 &&
          newRow < this.ROWS &&
          newCol >= 0 &&
          newCol < this.COLS &&
          boardCopy[newRow][newCol] === player
        ) {
          count++
        } else {
          break
        }
      }

      if (count >= 4) {
        return true
      }
    }

    return false
  }

  // Check if board is full in simulation
  isSimulatedBoardFull(boardCopy) {
    for (let col = 0; col < this.COLS; col++) {
      if (boardCopy[0][col] === this.EMPTY) {
        return false
      }
    }
    return true
  }

  // AI brain: evaluate board position
  evaluateBoard(boardCopy) {
    // Scoring constants
    const WIN_SCORE = 1000000
    const THREE_IN_ROW = 100
    const TWO_IN_ROW = 10
    const CENTER_COLUMN_VALUE = 3

    let score = 0

    // Center column control is valuable
    for (let row = 0; row < this.ROWS; row++) {
      if (boardCopy[row][3] === this.AI) {
        score += CENTER_COLUMN_VALUE
      } else if (boardCopy[row][3] === this.PLAYER) {
        score -= CENTER_COLUMN_VALUE
      }
    }

    // Evaluate horizonal, vertical, and diagonal sequences
    // Horizontal check
    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS - 3; col++) {
        score += this.evaluateWindow(
          [boardCopy[row][col], boardCopy[row][col + 1], boardCopy[row][col + 2], boardCopy[row][col + 3]],
          THREE_IN_ROW,
          TWO_IN_ROW,
          WIN_SCORE,
        )
      }
    }

    // Vertical check
    for (let col = 0; col < this.COLS; col++) {
      for (let row = 0; row < this.ROWS - 3; row++) {
        score += this.evaluateWindow(
          [boardCopy[row][col], boardCopy[row + 1][col], boardCopy[row + 2][col], boardCopy[row + 3][col]],
          THREE_IN_ROW,
          TWO_IN_ROW,
          WIN_SCORE,
        )
      }
    }

    // Diagonal check (positive slope)
    for (let row = 0; row < this.ROWS - 3; row++) {
      for (let col = 0; col < this.COLS - 3; col++) {
        score += this.evaluateWindow(
          [boardCopy[row][col], boardCopy[row + 1][col + 1], boardCopy[row + 2][col + 2], boardCopy[row + 3][col + 3]],
          THREE_IN_ROW,
          TWO_IN_ROW,
          WIN_SCORE,
        )
      }
    }

    // Diagonal check (negative slope)
    for (let row = 3; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS - 3; col++) {
        score += this.evaluateWindow(
          [boardCopy[row][col], boardCopy[row - 1][col + 1], boardCopy[row - 2][col + 2], boardCopy[row - 3][col + 3]],
          THREE_IN_ROW,
          TWO_IN_ROW,
          WIN_SCORE,
        )
      }
    }

    return score
  }

  // Helper function to evaluate a window of 4 positions
  evaluateWindow(window, threeScore, twoScore, winScore) {
    let score = 0
    const aiCount = window.filter((cell) => cell === this.AI).length
    const playerCount = window.filter((cell) => cell === this.PLAYER).length
    const emptyCount = window.filter((cell) => cell === this.EMPTY).length

    // AI winning possibility
    if (aiCount === 4) {
      score += winScore
    } else if (aiCount === 3 && emptyCount === 1) {
      score += threeScore
    } else if (aiCount === 2 && emptyCount === 2) {
      score += twoScore
    }

    // Block player winning possibility
    if (playerCount === 3 && emptyCount === 1) {
      score -= threeScore * 2 // Prioritize blocking player wins
    }

    return score
  }

  // Minimax algorithm with Alpha-Beta pruning
  minimax(depth, alpha, beta, isMaximizing, boardCopy) {
    const validMoves = this.getValidMovesForBoard(boardCopy)

    // Terminal conditions
    if (depth === 0 || validMoves.length === 0) {
      return { score: this.evaluateBoard(boardCopy), column: null }
    }

    // Check for immediate winning/losing positions
    for (const col of validMoves) {
      const moveInfo = this.simulateMove(col, isMaximizing ? this.AI : this.PLAYER, boardCopy)
      if (moveInfo) {
        const { row } = moveInfo
        if (this.checkWinForPosition(row, col, isMaximizing ? this.AI : this.PLAYER, boardCopy)) {
          this.undoMove(row, col, boardCopy)
          return {
            score: isMaximizing ? 1000000 : -1000000,
            column: col,
          }
        }
        this.undoMove(row, col, boardCopy)
      }
    }

    if (isMaximizing) {
      let maxScore = Number.NEGATIVE_INFINITY
      let bestColumn = validMoves[0] // Default to first valid move

      for (const col of validMoves) {
        const moveInfo = this.simulateMove(col, this.AI, boardCopy)
        if (moveInfo) {
          const { row } = moveInfo
          const result = this.minimax(depth - 1, alpha, beta, false, boardCopy)
          this.undoMove(row, col, boardCopy)

          if (result.score > maxScore) {
            maxScore = result.score
            bestColumn = col
          }

          alpha = Math.max(alpha, maxScore)
          if (alpha >= beta) break // Beta cutoff
        }
      }

      return { score: maxScore, column: bestColumn }
    } else {
      let minScore = Number.POSITIVE_INFINITY
      let bestColumn = validMoves[0] // Default to first valid move

      for (const col of validMoves) {
        const moveInfo = this.simulateMove(col, this.PLAYER, boardCopy)
        if (moveInfo) {
          const { row } = moveInfo
          const result = this.minimax(depth - 1, alpha, beta, true, boardCopy)
          this.undoMove(row, col, boardCopy)

          if (result.score < minScore) {
            minScore = result.score
            bestColumn = col
          }

          beta = Math.min(beta, minScore)
          if (beta <= alpha) break // Alpha cutoff
        }
      }

      return { score: minScore, column: bestColumn }
    }
  }

  // Get valid moves for simulated board
  getValidMovesForBoard(boardCopy) {
    const validMoves = []
    for (let col = 0; col < this.COLS; col++) {
      if (boardCopy[0][col] === this.EMPTY) {
        validMoves.push(col)
      }
    }
    return validMoves
  }

  // Let AI make the best move
  makeAIMove() {
    if (this.gameOver) return null

    // Create a deep copy of the board for simulation
    const boardCopy = JSON.parse(JSON.stringify(this.board))

    // Use iterative deepening with time limit
    const MAX_DEPTH = 7
    let bestMove = null

    // Start with depth 3 and increase
    for (let depth = 3; depth <= MAX_DEPTH; depth++) {
      const result = this.minimax(depth, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, true, boardCopy)
      bestMove = result.column

      // If we found a winning move, no need to search deeper
      if (result.score >= 1000000) {
        break
      }
    }

    // Make the best move
    if (bestMove !== null && this.makeMove(bestMove, this.AI)) {
      return bestMove
    }

    return null
  }

  // Switch player turns
  switchTurn() {
    this.currentPlayer = this.currentPlayer === this.PLAYER ? this.AI : this.PLAYER
  }

  // Get game status for frontend
  getGameStatus() {
    return {
      board: this.board,
      currentPlayer: this.currentPlayer,
      gameOver: this.gameOver,
      winner: this.winner,
      validMoves: this.getValidMoves(),
    }
  }
}

export default ConnectFour
