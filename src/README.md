# Chess Puzzle Trainer (Woodpecker Method)

🔗 **Live Demo**:

A dynamic chess puzzle training application that integrates with the Lichess API.  
It identifies your weakest puzzle theme and presents a batch of puzzles from that theme. You solve the same batch repeatedly over multiple runs – following the **Woodpecker Method** – to build pattern recognition, then the app submits your results to Lichess and automatically rotates to the next weakest theme.

## Features

- **Automatic Weakest Theme Detection** – Pulls your dashboard data and finds the theme with the lowest performance.
- **Batch Puzzle Training** – Fetches a configurable number of puzzles (default: 10) for that theme.
- **Woodpecker Method Repetition** – Repeats the same batch for a configurable number of runs (default: 10) before submitting all as solved.
- **Interactive Chessboard** – Drag‑and‑drop moves; only the correct solution move is accepted; opponent responses are played automatically.
- **Progress Tracking** – Displays current theme, run number, and cycle count.
- **Automatic Submission** – After completing the required runs, the app submits the puzzles to Lichess, updates your puzzle rating, and fetches a new batch for the new weakest theme.
- **Lichess OAuth2 PKCE Authentication** – Securely log in with your Lichess account (requests only `puzzle:read` and `puzzle:write` scopes).

## Built With

- Vanilla JavaScript (ES6+)
- HTML5 & CSS3
- [chess.js](https://github.com/jhlywa/chess.js) – Chess move generation & validation
- [@alepot55/chessboardjs](https://github.com/alepot55/chessboardjs) – Chessboard UI
- [@bity/oauth2-auth-code-pkce](https://github.com/bity/nestjs-oauth2-client) – OAuth2 PKCE flow
- Lichess API (REST)

## Setup / Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Marentxs/chess-puzzle-trainer.git
   cd chess-puzzle-trainer
   ```
