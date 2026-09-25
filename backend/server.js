import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "data");
const notesFile = path.join(dataDir, "notes.json");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

function ensureStorage() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(notesFile)) {
    fs.writeFileSync(notesFile, JSON.stringify([], null, 2));
  }
}

function readNotes() {
  ensureStorage();
  const raw = fs.readFileSync(notesFile, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeNotes(notes) {
  ensureStorage();
  fs.writeFileSync(notesFile, JSON.stringify(notes, null, 2));
}

app.get("/api/health", (_, res) => {
  res.json({ ok: true, message: "NoteKeeper backend is running" });
});

app.get("/api/notes", (_, res) => {
  const notes = readNotes();
  res.json(notes);
});

app.post("/api/notes", (req, res) => {
  const { title, content } = req.body || {};

  if (!title || !content || !title.trim() || !content.trim()) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  const notes = readNotes();
  const newNote = {
    id: crypto.randomUUID(),
    title: title.trim(),
    content: content.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  notes.unshift(newNote);
  writeNotes(notes);

  res.status(201).json(newNote);
});

app.put("/api/notes/:id", (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body || {};

  if (!title || !content || !title.trim() || !content.trim()) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  const notes = readNotes();
  const index = notes.findIndex((note) => note.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Note not found" });
  }

  notes[index] = {
    ...notes[index],
    title: title.trim(),
    content: content.trim(),
    updatedAt: new Date().toISOString(),
  };

  writeNotes(notes);
  res.json(notes[index]);
});

app.delete("/api/notes/:id", (req, res) => {
  const { id } = req.params;
  const notes = readNotes();
  const filtered = notes.filter((note) => note.id !== id);

  if (filtered.length === notes.length) {
    return res.status(404).json({ message: "Note not found" });
  }

  writeNotes(filtered);
  res.json({ message: "Note deleted successfully" });
});

app.listen(PORT, () => {
  console.log(`NoteKeeper backend running on http://localhost:${PORT}`);
});
