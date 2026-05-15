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
  const nb = 2;

  return fetch(`https://lichess.org/api/puzzle/batch/${angle}?nb=${nb}`).then((response) => {
    if (!response.ok) {
      throw new Error('Request failed');
    }
    return response.json();
  });
}

(async () => {
  let batchData = await getPuzzle('mix');
  let batchArray = batchData.puzzles;
  let counter = 0;

  async function printPuzzle() {
    for (const puzzle of batchArray) {
      let solved = false;
      while (solved === false) {
        console.log(puzzle);
        pgnUI.innerHTML = `PGN: ${puzzle.game.pgn}`;

        pgnHelper(puzzle.game.pgn);
        console.log(chess.ascii());
        let result = prompt('Did you solve the puzzle? (type "solved" when done)');

        if (result === 'solved') {
          solved = true;
          console.log(`Solution: ${puzzle.puzzle.solution}`);
          solutionUI.innerHTML = `Solution: ${puzzle.puzzle.solution}`;
        }
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    counter++;

    if (counter === 10) {
      let batchData = await getPuzzle('mix');
      let batchArray = batchData.puzzles;
      counter = 0;
      await printPuzzle();
    }
  }

  await printPuzzle();
})();

//
