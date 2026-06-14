import { Chessboard } from '@alepot55/chessboardjs';
import '@alepot55/chessboardjs/dist/chessboard.css';
import { Chess } from 'chess.js';
import { PuzzleManager } from './puzzleManager.js';

const chess = new Chess();

export class BatchController {
  batchData;
  batchPuzzles;
  solvedRuns = 0;
  isRefreshing = false;
  puzzleIds;
  puzzleObjects;
  lowestTheme;

  constructor(puzzleManager, numberOfPuzzles, numberOfRuns) {
    this.puzzleManager = puzzleManager;
    this.numberOfPuzzles = numberOfPuzzles;
    this.numberOfRuns = numberOfRuns;
  }

  pgnHelper(pgn) {
    chess.reset();
    const moves = pgn.split(' ');
    for (const move of moves) {
      chess.move(move);
    }
  }

  async initializePuzzles() {
    this.lowestTheme = await this.puzzleManager.getLowestTheme();
    document.getElementById('themeName').textContent = this.lowestTheme;

    let data = await this.puzzleManager.getPuzzle(this.lowestTheme);
    this.batchData = data;
    this.batchPuzzles = data.puzzles;

    this.puzzleIds = this.batchPuzzles.map((puzzle) => puzzle.puzzle.id);
    this.puzzleObjects = this.puzzleIds.map((id) => ({
      id: id,
      win: true,
      rated: true,
    }));

    this.solvedRuns = 0;
    this.isRefreshing = false;
    this.loadPuzzle(0);
  }

  async batchCompletion(index) {
    if (this.isRefreshing) {
      return;
    }

    if (index >= this.batchPuzzles.length) {
      this.isRefreshing = true;

      if (this.solvedRuns === this.numberOfRuns) {
        await this.puzzleManager.solvePuzzle(this.puzzleObjects);
        this.lowestTheme = await this.puzzleManager.getLowestTheme();
        document.getElementById('themeName').textContent = this.lowestTheme;

        this.batchData = await this.puzzleManager.getPuzzle(this.lowestTheme);
        this.batchPuzzles = this.batchData.puzzles;
        this.puzzleIds = this.batchPuzzles.map((puzzle) => puzzle.puzzle.id);
        this.puzzleObjects = this.puzzleIds.map((id) => ({
          id: id,
          win: true,
          rated: true,
        }));
        this.solvedRuns = 0;
      } else {
        this.solvedRuns++;
        document.getElementById('currentCycle').textContent = this.solvedRuns;
      }
      this.isRefreshing = false;
      this.loadPuzzle(0);
      return;
    }
  }

  loadPuzzle(index) {
    if (index >= this.batchPuzzles.length) {
      this.batchCompletion(index);
      return;
    }

    let puzzle = this.batchPuzzles[index];

    let ownMoves = puzzle.puzzle.solution.filter((move, index) => index % 2 === 0);
    let opponentMoves = puzzle.puzzle.solution.filter((move, index) => index % 2 !== 0);

    let currentMoveIndex = 0;

    this.pgnHelper(puzzle.game.pgn);

    const config = {
      draggable: true,
      position: chess.fen(),
      onMove: (move) => {
        const moveString = move.from.id + move.to.id;

        if (moveString === ownMoves[currentMoveIndex]) {
          return true;
        } else {
          return false;
        }
      },

      onMoveEnd: (move) => {
        chess.move(ownMoves[currentMoveIndex]);

        if (opponentMoves[currentMoveIndex]) {
          chess.move(opponentMoves[currentMoveIndex]);
          board.setPosition(chess.fen());
        }

        currentMoveIndex++;

        if (currentMoveIndex === ownMoves.length) {
          this.loadPuzzle(index + 1);
        }
      },
    };

    const board = Chessboard('chessboard', config);
  }
}
