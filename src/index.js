import { Chess } from 'chess.js';
import { Chessboard } from '@alepot55/chessboardjs';
import '@alepot55/chessboardjs/dist/chessboard.css';

import { Auth } from './modules/login.js';
import { PuzzleManager } from './modules/puzzleManager.js';
import './styles.css';

const chess = new Chess();

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
  lowestTheme = await puzzleManager.getLowestTheme();

  document.getElementById('themeName').textContent = lowestTheme;

  let data = await puzzleManager.getPuzzle(lowestTheme);

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
const puzzleManager = new PuzzleManager(auth, numberOfPuzzles);

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
  document.getElementById('authenticated').style.display = 'flex';
  document.getElementById('logoutBtn').style.display = 'block';
  document.getElementById('app').style.flexDirection = 'row';
  document.getElementById('chessboardContainer').style.display = 'block';

  initializePuzzles();

  document.getElementById('currentCycle').textContent = solvedRuns;
}

function showUnauthenticated() {
  document.getElementById('authenticated').style.display = 'none';
  document.getElementById('logoutBtn').style.display = 'none';
  document.getElementById('app').style.flexDirection = 'column';
  document.getElementById('chessboardContainer').style.display = 'none';
}

// Main game loop

async function batchCompletion(index) {
  if (isRefreshing) {
    return;
  }

  if (index >= batchPuzzles.length) {
    isRefreshing = true;

    if (solvedRuns === numberOfRuns) {
      await puzzleManager.solvePuzzle(puzzleObjects);
      lowestTheme = await puzzleManager.getLowestTheme();
      document.getElementById('themeName').textContent = lowestTheme;

      batchData = await puzzleManager.getPuzzle(lowestTheme);
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
      document.getElementById('currentCycle').textContent = solvedRuns;
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
