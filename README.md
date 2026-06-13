# ♟️ Real-Time Multiplayer Chess Platform

A full-stack chess application that supports AI games, online matchmaking, and private games with real-time gameplay, chat, and chess clocks.

Built with modern web technologies to deliver a smooth and engaging multiplayer chess experience.

---

## 🚀 Features

### 🎮 Multiple Game Modes

#### 🤖 Play vs AI
- Challenge an AI opponent instantly.
- Moves are validated server-side.
- Games are automatically saved to match history.

#### 🌍 Online Matchmaking
- Players enter a matchmaking queue.
- The system only pairs users with currently online waiting opponents.
- Stale waiting entries are ignored to prevent matching with offline users.
- Match creation happens automatically once an opponent is found.

#### 👥 Friendly Games
- Create private games using unique invite codes.
- Share the code with friends.
- Friends can join instantly using the code.
- Moves and chat synchronize in real time.

---

## ⏱️ Chess Clock

Every game starts with:

```text
White: 25:00
Black: 25:00
```

### Timer Behaviour

- Only the active player's clock counts down.
- After every move:
  - The server records the player's remaining time.
  - The turn switches to the opponent.
- If a player's clock reaches zero:
  - The game immediately ends.
  - The opponent is declared the winner.

---

## 🤝 Draws & Resignation

### Draw Offers

Human and friendly games use a proper draw-offer workflow.

- A player can offer a draw.
- The opponent receives a notification.
- The game is declared a draw only after the opponent accepts.

### AI Games

- Draws can be executed immediately since there is no human opponent.

### Resignation

- A player can resign at any point.
- The game instantly ends.
- The opponent is awarded the win.

---

## ⚡ Real-Time Experience

WebSockets power all live interactions.

### WebSocket Events

- Player joined notifications
- Move broadcasts
- Chat messages
- Draw offer notifications
- Opponent abandoned events
- Game-over refresh events

### State Synchronization

TanStack Query works alongside WebSockets to keep the client synchronized with the server by refetching authoritative game state when necessary.

---

## 💬 In-Game Chat

Players can communicate during active matches.

Features include:

- Real-time messaging
- Persistent chat history
- User-linked chat records
- Synchronization after reconnects

---

## 📊 User Statistics

Player statistics are tracked and stored, including:

- Total games played
- Wins
- Losses
- Draws
- Mode-specific statistics
- Match history

---

## 🛠 Tech Stack

### Frontend
- React
- TypeScript
- TanStack Query

### Backend
- Node.js
- Express
- WebSockets

### Database
- PostgreSQL

### ORM
- Drizzle ORM

### Chess Engine
- chess.js

---

## 🗄 Database Schema

### `users`
Stores:

- User accounts
- Passwords
- Overall statistics
- Mode-specific statistics

### `games`
Stores:

- White player
- Black player
- Game mode
- Current FEN position
- PGN notation
- Current turn
- Game status
- Result
- Winner
- Chess clock values
- Timestamps

### `chat_messages`
Stores:

- Message content
- Associated game
- Sender information
- Creation timestamps

Schema source:

```text
shared/schema.ts
```

After modifying schema fields, update the database:

```bash
npm run db:push
```

---

## 📁 Project Structure

```text
├── client/              # Frontend application
├── server/              # Backend APIs and WebSocket logic
├── shared/              # Shared types and database schema
│   └── schema.ts
├── render.yaml          # Render deployment configuration
├── package.json
└── README.md
```

---

## ⚙️ Getting Started

### Clone the Repository

```bash
git clone https://github.com/your-username/your-repository.git
cd your-repository
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=your_database_url
SESSION_SECRET=your_session_secret
NODE_ENV=development
```

### Apply Database Schema

```bash
npm run db:push
```

### Start Development Server

```bash
npm run dev
```

---

## 🚢 Deployment

The project includes `render.yaml` for deployment on Render.

### Build Command

```bash
npm install && npm run build
```

### Start Command

```bash
npm run start
```

### Required Environment Variables

```env
DATABASE_URL=
SESSION_SECRET=
NODE_ENV=production
```

Before deploying:

- Ensure the production database schema is up to date.
- Verify all environment variables are configured.
- Confirm that WebSocket support is enabled.

---

## ✅ Production Checklist

Before going live, verify the following:

- [ ] DATABASE_URL configured
- [ ] SESSION_SECRET configured
- [ ] Database schema updated
- [ ] Application builds successfully
- [ ] WebSocket functionality verified
- [ ] Signup/Login tested
- [ ] AI games tested
- [ ] Online matchmaking tested
- [ ] Friendly games tested
- [ ] Real-time chat tested
- [ ] Draw offers tested
- [ ] Resignation tested
- [ ] Timer timeout tested
- [ ] Match history verified

---

## 🔒 Security Notes

- Never commit `.env` files.
- Rotate secrets immediately if they are exposed.
- Use a strong random `SESSION_SECRET`.
- Store credentials using your hosting provider's environment variables.
- Keep local state files out of version control.

---