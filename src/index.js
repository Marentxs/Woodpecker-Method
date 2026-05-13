async function getPuzzle(angle) {
  const nb = 2;

  return fetch(`https://lichess.org/api/puzzle/batch/${angle}?nb=${nb}`).then((response) => {
    if (!response.ok) {
      throw new Error('Request failed');
    }
    return response.json();
  });
}

let batchArray = await getPuzzle('mix');
let counter = 0;

async function printPuzzle() {
  for (const puzzle of batchArray) {
    let solved = false;
    while (solved === false) {
      console.log(puzzle);
      let result = prompt('Did you solved the puzzle ?');

      if (result === 'solved') {
        solved = true;
      }
    }
  }

  counter++;

  if (counter === 10) {
    batchArray = await getPuzzle('mix');
    counter = 0;
    printPuzzle();
  }
}
