import { Chess } from 'chess.js';
import { Chessboard } from '@alepot55/chessboardjs';
import '@alepot55/chessboardjs/dist/chessboard.css';

import { Auth } from './modules/login.js';
import { PuzzleManager } from './modules/puzzleManager.js';
import { BatchController } from './modules/batchController.js';
import { UIController } from './modules/uiController.js';
import './styles.css';

const numberOfPuzzles = 10;
const numberOfRuns = 10;

const auth = new Auth();
const puzzleManager = new PuzzleManager(auth, numberOfPuzzles);
const batchController = new BatchController(puzzleManager, numberOfPuzzles, numberOfRuns);
const uiController = new UIController(auth, batchController);

uiController.setupEventListeners();

auth.init().then(() => {
  if (auth.me) {
    uiController.showAuthenticated();
  } else {
    uiController.showUnauthenticated();
  }
});
