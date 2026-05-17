import { Chess } from 'chess.js';
const chess = new Chess();

import { Chessboard } from '@alepot55/chessboardjs';
import '@alepot55/chessboardjs/dist/chessboard.css';

const config = {
  draggable: true,
  position: chess.fen(),
  onDragStart: (source, piece) => {
    /* your validation logic */
  },
  onDrop: (source, target) => {
    /* check move against solution */
  },
};

const board = Chessboard('chessboard', config);

//

//

const pgnUI = document.getElementById('pgn');
const solutionUI = document.getElementById('solution');

//

function pgnHelper(pgn) {
  chess.reset();
  const moves = pgn.split(' ');

  for (const move of moves) {
    const result = chess.move(move);
  }
}

async function getPuzzle(angle) {
  const nb = 1;

  return fetch(`https://lichess.org/api/puzzle/batch/${angle}?nb=${nb}`).then((response) => {
    if (!response.ok) {
      throw new Error('Request failed');
    }
    return response.json();
  });
}

(async () => {
  let batchData = await getPuzzle('mix');
  let batchPuzzles = batchData.puzzles;
  let counter = 0;

  async function printPuzzle() {
    for (const puzzle of batchPuzzles) {
      let currentMoveIndex = 0;
      let ownMoves = puzzle.puzzle.solution.filter((move, index) => index % 2 === 0);
      let opponentMoves = puzzle.puzzle.solution.filter((move, index) => index % 2 !== 0);

      pgnHelper(puzzle.game.pgn);
      const currentFEN = chess.fen();
      board.setPosition(currentFEN);
    }

    counter++;

    if (counter === 10) {
      batchData = await getPuzzle('mix');
      batchPuzzles = batchData.puzzles;
      counter = 0;
      await printPuzzle();
    }
  }

  await printPuzzle();
})();

//
