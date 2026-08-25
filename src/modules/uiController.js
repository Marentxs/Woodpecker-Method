import { BatchController } from './batchController.js';

export class UIController {
  constructor(auth, batchController) {
    this.auth = auth;
    this.batchController = batchController;
  }

  showAuthenticated() {
    document.getElementById('unauthenticated').style.display = 'none';
    document.getElementById('authenticated').style.display = 'flex';
    document.getElementById('logoutBtn').style.display = 'block';
    document.getElementById('app').style.flexDirection = 'row';
    document.getElementById('chessboardContainer').style.display = 'block';

    this.batchController.initializePuzzles();

    document.getElementById('currentCycle').textContent = this.batchController.solvedRuns;
  }

  showUnauthenticated() {
    document.getElementById('authenticated').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('app').style.flexDirection = 'column';
    document.getElementById('chessboardContainer').style.display = 'none';
  }

  setupEventListeners() {
    document.getElementById('loginBtn').addEventListener('click', async () => {
      await this.auth.login();
    });

    document.getElementById('logoutBtn').addEventListener('click', async () => {
      await this.auth.logout();
      location.reload();
    });
  }
}
