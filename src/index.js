function getPuzzle(angle) {
  const nb = 1;

  return fetch(`https://lichess.org/api/puzzle/batch/${angle}?nb=${nb}`).then((response) => {
    if (!response.ok) {
      throw new Error('Request failed');
    }
    return response.json();
  });
}

getPuzzle('mix').then((data) => {
  console.log(data.puzzles[0]);
});

let result = '';

while (result !== 'yes') {
  result = prompt('Did you solved the puzzle mentally?');

  if (result === null) {
    alert('You must answer to proceed');
  }
}
