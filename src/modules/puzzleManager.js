export class PuzzleManager {
  constructor(auth, numberOfPuzzles) {
    this.auth = auth;
    this.numberOfPuzzles = numberOfPuzzles;
  }

  async getPuzzle(angle) {
    const nb = this.numberOfPuzzles;
    const angleFormatted = encodeURIComponent(angle);

    return this.auth
      .fetchResponse(`/api/puzzle/batch/${angleFormatted}?nb=${nb}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Request failed');
        }
        return response.json();
      });
  }

  async solvePuzzle(solutions) {
    console.log('Submitting solutions:', solutions);

    return this.auth
      .fetchResponse(`/api/puzzle/batch/mix?nb=0`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          solutions: solutions,
        }),
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Request failed');
        }
        console.log('Solutions submitted successfully');
        return response.json();
      })
      .then((data) => {
        console.log('Updated rating:', data);
      });
  }

  async getLowestTheme() {
    const days = 30;
    const response = await this.auth.fetchResponse(`/api/puzzle/dashboard/${days}`);
    const data = await response.json();

    let lowestPerformance = Infinity;
    let lowestTheme;

    for (const [key, value] of Object.entries(data.themes)) {
      let currentPerformance = value.results.performance;
      if (currentPerformance < lowestPerformance) {
        lowestPerformance = value.results.performance;
        lowestTheme = key;
      }
    }
    return lowestTheme;
  }
}
