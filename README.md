# MERNChess

MERNChess is a full-stack online chess platform with account-based authentication, AI games, real-time human matchmaking, private friendly games, in-game chat, match history, player stats, draw offers, resign handling, and 25-minute chess clocks across every game mode.

The app uses a React + Vite frontend, an Express backend, PostgreSQL with Drizzle ORM, JWT authentication, WebSockets for real-time multiplayer updates, and chess.js for legal chess move validation.

## Features

- User signup and login with JWT authentication.
- Play vs Computer with selectable AI difficulty.
- Play vs Human with online matchmaking.
- Friendly private games using shareable game codes.
- Real-time multiplayer move sync through WebSockets.
- In-game chat for human and friendly games.
- 25-minute chess clocks for both sides in every mode.
- Automatic timeout wins when a player runs out of time.
- Resign flow with winner and loser stat updates.
- Draw offer flow for human games: opponent must accept before the game is drawn.
- Direct draw support for AI games.
- Match history and recent games.
- Player profile with overall and mode-specific stats.
- Responsive dashboard and game UI.

## Tech Stack

### Frontend

- React 18
- Vite
- TypeScript
- Tailwind CSS
- Radix UI primitives
- TanStack Query
- Wouter routing
- Framer Motion
- Lucide icons

### Backend

- Node.js
- Express
- TypeScript
- WebSocket server using `ws`
- JWT authentication
- bcrypt password hashing
- chess.js move validation

### Database

- PostgreSQL
- Drizzle ORM
- Drizzle Kit schema push
- Neon serverless PostgreSQL compatible setup

## Project Structure

```text
MERNChess/
  client/             React frontend
  server/             Express API and WebSocket server
  shared/             Shared database schema and TypeScript types
  attached_assets/    Static/project assets
  dist/               Production build output
  package.json        Scripts and dependencies
  drizzle.config.ts   Drizzle database configuration
  render.yaml         Render deployment configuration
  vite.config.ts      Vite configuration
```

## Requirements

- Node.js 20 or newer recommended.
- npm
- PostgreSQL database URL.
- A strong session secret for JWT signing.

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
SESSION_SECRET=replace-with-a-long-random-secret
NODE_ENV=development
```

Do not commit `.env`. This repository should keep `.env` ignored because it contains secrets.

## Local Setup

Install dependencies:

```bash
npm install
```

Push the database schema:

```bash
npm run db:push
```

Start the development server:

```bash
npm run dev
```

The app runs as a single Express server that serves the API, WebSocket endpoint, and Vite-powered frontend in development.

## Available Scripts

```bash
npm run dev
```

Starts the development server using `.env`.

```bash
npm run build
```

Builds the React frontend and bundles the Express server into `dist/`.

```bash
npm run start
```

Runs the production build from `dist/index.js`.

```bash
npm run check
```

Runs TypeScript checking.

```bash
npm run db:push
```

Pushes the Drizzle schema to the configured PostgreSQL database.

## Gameplay Modes

### Play vs Computer

Players can choose AI difficulty and play against the built-in AI move generator. The player uses white, the AI responds automatically, and the 25-minute clock applies to both sides.

### Play vs Human

The matchmaking system only pairs players with currently online waiting opponents. Stale waiting games are ignored so users are not matched with offline players.

### Friendly Game

Players can create a private game code and share it with a friend. The second player joins using the code, then moves and chat sync in real time.

## Chess Clock

Every game starts with:

```text
White: 25:00
Black: 25:00
```

The active side's clock counts down. When a move is made, the server records the remaining time and switches the active turn. If a clock reaches zero, the server finishes the game and awards the win to the opponent.

## Draws and Resignation

- Human and friendly games use a proper draw offer system.
- A player can offer a draw.
- The opponent receives a notification with an accept action.
- The game is drawn only after the opponent accepts.
- AI games can be drawn directly because there is no real opponent to accept.
- Resigning immediately finishes the game and awards the win to the opponent.

## Real-Time Flow

WebSockets are used for:

- Player joined notifications.
- Move broadcasts.
- Chat messages.
- Game-over refresh events.
- Draw offer notifications.
- Opponent abandoned events.

TanStack Query is used alongside WebSockets to refetch authoritative game state from the server.

## Database Schema

The main tables are:

- `users`: accounts, passwords, overall stats, and mode-specific stats.
- `games`: players, game mode, FEN, PGN, result, winner, status, current turn, and chess clock values.
- `chat_messages`: game chat history with user references.

Schema source:

```text
shared/schema.ts
```

After changing schema fields, run:

```bash
npm run db:push
```

## Deployment

The project includes `render.yaml` for Render deployment.

Render configuration:

- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Required environment variables:
  - `DATABASE_URL`
  - `SESSION_SECRET`
  - `NODE_ENV=production`

Before deploying, make sure the production database schema is up to date.

## Security Notes

- Never commit `.env`.
- If secrets were ever pushed to GitHub, rotate them immediately.
- Use a long random `SESSION_SECRET`.
- Keep database credentials in your hosting provider's environment variable settings.
- `.local/`, build outputs, and local tool state should not be committed.

## Git Hygiene

Recommended ignored files:

```gitignore
node_modules
dist
.env
.local/
*.tar.gz
```

If `.env` or `.local` were already tracked, remove them from git tracking while keeping local files as needed:

```bash
git rm --cached .env
git rm --cached -r .local
git commit -m "Remove env and local state files"
git push
```

## Production Checklist

- Set `DATABASE_URL` in the host.
- Set `SESSION_SECRET` in the host.
- Run or apply database schema updates.
- Build successfully with `npm run build`.
- Confirm WebSocket support is enabled by the host.
- Test signup/login, AI game, online matchmaking, friendly game, chat, draw offers, resignation, timer timeout, and match history.

## License

This project is licensed under the MIT License.
