# NoteKeeper

A lightweight note-taking app built with React, Vite, Express, and Node.js. Notes are stored in a local JSON file so they persist without needing a database.

## Features

- Create, edit, and delete notes
- Fast local API backed by Express
- Persistent note storage in a JSON file
- Clean React interface for managing notes

## Project structure

- frontend/: React frontend with Vite
- backend/: Express API and file-based storage
- backend/data/notes.json: note data file

## Installation

```bash
cd /workspaces/mern-note
npm install
npm --prefix backend install
npm --prefix frontend install
```

## Run the app

```bash
cd /workspaces/mern-note
npm run dev
```

Then open:

- Frontend: http://localhost:5173/
- Backend API: http://localhost:5001

## API endpoints

- GET /api/health
- GET /api/notes
- POST /api/notes
- PUT /api/notes/:id
- DELETE /api/notes/:id

## Data persistence

Notes are saved in:

- backend/data/notes.json

The file is updated whenever a note is created, edited, or deleted.
