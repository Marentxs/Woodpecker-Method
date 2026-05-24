import { Chess } from 'chess.js';
import { Chessboard } from '@alepot55/chessboardjs';
import '@alepot55/chessboardjs/dist/chessboard.css';

const chess = new Chess();
const pgnUI = document.getElementById('pgn');
const solutionUI = document.getElementById('solution');

const numberOfPuzzles = 2;
const numberOfRuns = 2;

//

function pgnHelper(pgn) {
  chess.reset();
  const moves = pgn.split(' ');

  for (const move of moves) {
    const result = chess.move(move);
  }
}

async function getPuzzle(angle) {
  const nb = numberOfPuzzles;

  return fetch(`https://lichess.org/api/puzzle/batch/${angle}?nb=${nb}`).then((response) => {
    if (!response.ok) {
      throw new Error('Request failed');
    }
    return response.json();
  });
}

async function solvePuzzle(angle) {
  const nb = numberOfPuzzles;

  return fetch(`https://lichess.org/api/puzzle/batch/${angle}?nb=${nb}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      solutions: solutions,
    }),
  }).then((response) => {
    if (!response.ok) {
      throw new Error('Request failed');
    }
    return response.json();
  });
}

// Variables for logic

let batchData = await getPuzzle('mix');
let batchPuzzles = batchData.puzzles;
let solvedRuns = 0;

//

function checkRuns(solvedRuns) {
  if (solvedRuns === numberOfRuns) {
  }
}

//

function loadPuzzle(index) {
  if (index >= batchPuzzles.length) {
    console.log('Completed full batch, Starting again');
    solvedRuns++;
    loadPuzzle(0);
    return;
  }

  let puzzle = batchPuzzles[index];

  let ownMoves = puzzle.puzzle.solution.filter((move, index) => index % 2 === 0);
  let opponentMoves = puzzle.puzzle.solution.filter((move, index) => index % 2 !== 0);
  let currentMoveIndex = 0;

  pgnHelper(puzzle.game.pgn);

  const config = {
    draggable: true,
    position: chess.fen(),
    onMove: (move) => {
      const moveString = move.from.id + move.to.id;

      if (moveString === ownMoves[currentMoveIndex]) {
        console.log('Correct move');
        return true;
      } else {
        console.log(ownMoves[currentMoveIndex]);
        console.log(moveString);
        console.log('Wrong move');
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
        loadPuzzle(index + 1);
      }
    },
  };

  // Create board with logic

  const board = Chessboard('chessboard', config);
}

// Initialize from first puzzle

loadPuzzle(0);
