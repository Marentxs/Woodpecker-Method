import { Chess } from 'chess.js';
const chess = new Chess();

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

      while (currentMoveIndex < ownMoves.length) {
        console.log(chess.ascii());
        pgnUI.innerHTML = `PGN: ${puzzle.game.pgn}`;

        let input = prompt(`Enter your move (e.g.,"b3d5")`);

        if (input === ownMoves[currentMoveIndex]) {
          chess.move(ownMoves[currentMoveIndex]);
          if (opponentMoves[currentMoveIndex]) {
            chess.move(opponentMoves[currentMoveIndex]);
          }
          currentMoveIndex++;

          if (currentMoveIndex === ownMoves.length) {
            console.log('Puzzle solved');
          }
        } else {
          console.log('Wrong move, try again');
        }
      }
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
