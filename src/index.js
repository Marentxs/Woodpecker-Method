//

const pgn = document.getElementById('pgn');
const solution = document.getElementById('solution');

//

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
        console.log(`PGN: ${puzzle.game.pgn}`);
        pgn.innerHTML = `PGN: ${puzzle.game.pgn}`;
        let result = prompt('Did you solve the puzzle? (type "solved" when done)');

        if (result === 'solved') {
          solved = true;
          console.log(`Solution: ${puzzle.puzzle.solution}`);
          solution.innerHTML = `Solution: ${puzzle.puzzle.solution}`;
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
