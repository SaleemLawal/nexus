# Nexus — Collaborative Event Planning Platform

Nexus is a full-featured collaborative event planning app that combines Pinterest-style visual boards, real-time chat, polls/voting, and a shared calendar into one organized space. Plan trips, parties, and events with your group without switching between apps.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| State | Zustand + Supabase Realtime subscriptions |
| Backend | Go 1.22+, Chi router |
| Database | Supabase (PostgreSQL) |
| File Storage | Supabase Storage |
| Real-time | Supabase Realtime (Postgres CDC + Broadcast) |

## Features

- **Spaces** — Create a collaborative workspace for any event; share an invite link
- **Boards & Pins** — Pinterest-style masonry boards with image, note, link, and checklist pin types
- **Real-time Chat** — Instant messaging with typing indicators and media sharing
- **Polls & Voting** — Create polls with animated live vote results
- **Calendar** — Shared event calendar with month view and event modals
- **Presence** — See who's online in a space in real-time

## Project Structure

```
nexus/
├── frontend/   # Next.js 15 app
├── backend/    # Go API server
```

## Getting Started

### Prerequisites

- Node.js 20+
- Go 1.22+
- A [Supabase](https://supabase.com) project

### 2. Backend

```bash
cd backend
# fill in SUPABASE_DB_URL from your Supabase project settings (direct connection string)
go run ./cmd/server
```

The API runs on `http://localhost:8080`.

### 3. Frontend

```bash
cd frontend
# fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
# fill in NEXT_PUBLIC_API_URL=http://localhost:8080
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `SUPABASE_DB_URL` | PostgreSQL direct connection string from Supabase |
| `PORT` | HTTP port (default: `8080`) |
| `CORS_ORIGIN` | Allowed CORS origin (default: `http://localhost:3000`) |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `NEXT_PUBLIC_API_URL` | Go backend URL (default: `http://localhost:8080`) |
