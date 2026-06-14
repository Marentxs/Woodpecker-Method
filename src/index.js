import { Chess } from 'chess.js';
import { Chessboard } from '@alepot55/chessboardjs';
import '@alepot55/chessboardjs/dist/chessboard.css';

import { Auth } from './modules/login.js';
import { PuzzleManager } from './modules/puzzleManager.js';
import { BatchController } from './modules/batchController.js';
import './styles.css';

const numberOfPuzzles = 1;
const numberOfRuns = 1;

// Handle login and auth

const auth = new Auth();
const puzzleManager = new PuzzleManager(auth, numberOfPuzzles);
const batchController = new BatchController(puzzleManager, numberOfPuzzles, numberOfRuns);

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

  batchController.initializePuzzles();

  document.getElementById('currentCycle').textContent = batchController.solvedRuns;
}

function showUnauthenticated() {
  document.getElementById('authenticated').style.display = 'none';
  document.getElementById('logoutBtn').style.display = 'none';
  document.getElementById('app').style.flexDirection = 'column';
  document.getElementById('chessboardContainer').style.display = 'none';
}
