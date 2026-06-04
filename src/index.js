import { Chess } from 'chess.js';
import { Chessboard } from '@alepot55/chessboardjs';
import '@alepot55/chessboardjs/dist/chessboard.css';
import { Auth } from './modules/login.js';

const chess = new Chess();
const pgnUI = document.getElementById('pgn');
const solutionUI = document.getElementById('solution');

const numberOfPuzzles = 2;
const numberOfRuns = 2;

// Make moves from pgn

function pgnHelper(pgn) {
  chess.reset();
  const moves = pgn.split(' ');

  for (const move of moves) {
    const result = chess.move(move);
  }
}

// Handle login and auth

const auth = new Auth();
const app = document.getElementById('app');

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

  // functions to fetch dashboard, get lowest, and generate puzzles
}

function showUnauthenticated() {
  document.getElementById('unauthenticated').style.display = 'block';
  document.getElementById('authenticated').style.display = 'none';
}

// API endpoint

async function getPuzzle(angle) {
  const nb = numberOfPuzzles;

  return auth.fetchResponse(`/api/puzzle/batch/${angle}?nb=${nb}`).then((response) => {
    if (!response.ok) {
      throw new Error('Request failed');
    }
    return response.json();
  });
}

async function solvePuzzle(solutions) {
  return auth
    .fetchResponse(`/api/puzzle/batch/mix?nb=0`, {
      method: 'POST',
      body: JSON.stringify({
        solutions: solutions,
      }),
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Request failed');
      }
      return response.json();
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
      lowestTheme = value.theme;
    }
  }
  return lowestTheme;
}

lowestTheme = await getLowestTheme();

// Variables for logic

let batchData = await getPuzzle(lowestTheme);
let batchPuzzles = batchData.puzzles;
let solvedRuns = 0;
let isRefreshing = false;

// Extract puzzle ids

let puzzleIds = batchPuzzles.map((puzzle) => puzzle.puzzle.id);
let puzzleObjects = puzzleIds.map((id) => ({
  id: id,
  win: true,
  rated: true,
}));

// Main game loop

async function batchCompletion(index) {
  if (isRefreshing) return;
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
