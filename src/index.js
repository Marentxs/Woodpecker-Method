import { Chess } from 'chess.js';
import { Chessboard } from '@alepot55/chessboardjs';
import '@alepot55/chessboardjs/dist/chessboard.css';
import { Auth } from './modules/login.js';
import './styles.css';

const chess = new Chess();
const pgnUI = document.getElementById('pgn');
const solutionUI = document.getElementById('solution');

const numberOfPuzzles = 1;
const numberOfRuns = 1;

let batchData;
let batchPuzzles;
let solvedRuns = 0;
let isRefreshing = false;
let puzzleIds;
let puzzleObjects;
let lowestTheme;

// Make moves from pgn

function pgnHelper(pgn) {
  chess.reset();
  const moves = pgn.split(' ');

  for (const move of moves) {
    const result = chess.move(move);
  }
}

// initialization setup

async function initializePuzzles() {
  lowestTheme = await getLowestTheme();

  let data = await getPuzzle(lowestTheme);

  batchData = data;
  batchPuzzles = data.puzzles;

  puzzleIds = batchPuzzles.map((puzzle) => puzzle.puzzle.id);

  puzzleObjects = puzzleIds.map((id) => ({
    id: id,
    win: true,
    rated: true,
  }));

  solvedRuns = 0;
  isRefreshing = false;

  loadPuzzle(0);
}

// Handle login and auth

const auth = new Auth();

auth.init().then(() => {
  if (auth.me) {
    showAuthenticated();
  } else {
    showUnauthenticated();
  }
});

document.getElementById('loginBtn').addEventListener('click', async () => {
  await auth.login();
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await auth.logout();
});

function showAuthenticated() {
  document.getElementById('unauthenticated').style.display = 'none';
  document.getElementById('authenticated').style.display = 'block';

  initializePuzzles();
}

function showUnauthenticated() {
  document.getElementById('unauthenticated').style.display = 'block';
  document.getElementById('authenticated').style.display = 'none';
}

// API endpoint

async function getPuzzle(angle) {
  const nb = numberOfPuzzles;
  const angleFormatted = encodeURIComponent(angle);

  return auth.fetchResponse(`/api/puzzle/batch/${angleFormatted}?nb=${nb}`).then((response) => {
    if (!response.ok) {
      throw new Error('Request failed');
    }
    return response.json();
  });
}

async function solvePuzzle(solutions) {
  console.log('Submitting solutions:', solutions);

  return auth
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

async function getLowestTheme() {
  const days = 30;

  const response = await auth.fetchResponse(`/api/puzzle/dashboard/${days}`);

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

// Main game loop

async function batchCompletion(index) {
  if (isRefreshing) {
    return;
  }

  if (index >= batchPuzzles.length) {
    isRefreshing = true;

    if (solvedRuns === numberOfRuns) {
      await solvePuzzle(puzzleObjects);
      lowestTheme = await getLowestTheme();
      batchData = await getPuzzle(lowestTheme);
      batchPuzzles = batchData.puzzles;
      puzzleIds = batchPuzzles.map((puzzle) => puzzle.puzzle.id);
      puzzleObjects = puzzleIds.map((id) => ({
        id: id,
        win: true,
        rated: true,
      }));
      solvedRuns = 0;
    } else {
      solvedRuns++;
    }
    isRefreshing = false;
    loadPuzzle(0);
    return;
  }
}

function loadPuzzle(index) {
  if (index >= batchPuzzles.length) {
    batchCompletion(index);
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
        loadPuzzle(index + 1);
      }
    },
  };

  // Create board with logic
  const board = Chessboard('chessboard', config);
}
