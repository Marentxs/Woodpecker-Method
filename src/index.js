function getPuzzle(angle) {
  const nb = 1;

  return fetch(`https://lichess.org/api/puzzle/batch/${angle}?nb=${nb}`).then((response) => {
    if (!response.ok) {
      throw new Error('Request failed');
    }
    return response.json();
  });
}

function printPuzzle() {
  return getPuzzle('mix').then((data) => {
    const puzzle = data.puzzles[0];
    console.log('PGN:', puzzle.game.pgn);
  });
}

async function puzzleLoop() {
  await printPuzzle();

  let result = prompt('Did you solved the puzzle ?');

  if (result === 'failed') {
    await puzzleLoop();
  } else if (result === 'solved') {
    console.log('well done');
  }
}

puzzleLoop();
