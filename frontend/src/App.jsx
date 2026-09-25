import { useEffect, useState } from 'react';

const emptyForm = { title: '', content: '' };

function App() {
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadNotes = async () => {
    try {
      const response = await fetch('/api/notes');
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.content.trim()) {
      alert('Please fill in both title and content.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
    };

    const url = editingId ? `/api/notes/${editingId}` : '/api/notes';
    const method = editingId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json();
      alert(data.message || 'Failed to save note');
      return;
    }

    const savedNote = await response.json();

    setNotes((currentNotes) => {
      if (editingId) {
        return currentNotes.map((note) => (note.id === editingId ? savedNote : note));
      }

      return [savedNote, ...currentNotes];
    });

    setForm(emptyForm);
    setEditingId(null);
    await loadNotes();
  };

  const handleEdit = (note) => {
    setForm({ title: note.title, content: note.content });
    setEditingId(note.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this note?');
    if (!confirmed) return;

    const response = await fetch(`/api/notes/${id}`, { method: 'DELETE' });

    if (response.ok) {
      setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      await loadNotes();
    } else {
      const data = await response.json();
      alert(data.message || 'Failed to delete note');
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Personal workspace</p>
          <h1>NoteKeeper</h1>
        </div>
      </header>

      <main className="layout">
        <section className="panel form-panel">
          <h2>{editingId ? 'Edit note' : 'Create a note'}</h2>
          <form onSubmit={handleSubmit} className="note-form">
            <label>
              <span>Title</span>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="My idea"
              />
            </label>

            <label>
              <span>Content</span>
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder="Write your thoughts here..."
                rows={6}
              />
            </label>

            <div className="actions">
              <button type="submit" className="primary-btn">
                {editingId ? 'Save changes' : 'Add note'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="panel list-panel">
          <h2>Your notes</h2>
          {loading ? (
            <p>Loading notes...</p>
          ) : notes.length === 0 ? (
            <p className="empty-state">No notes yet. Add one to get started.</p>
          ) : (
            <div className="notes-grid">
              {notes.map((note) => (
                <article key={note.id} className="note-card">
                  <div className="note-header">
                    <h3>{note.title}</h3>
                    <div className="note-actions">
                      <button type="button" onClick={() => handleEdit(note)}>Edit</button>
                      <button type="button" className="danger" onClick={() => handleDelete(note.id)}>Delete</button>
                    </div>
                  </div>
                  <p>{note.content}</p>
                  <small>{new Date(note.updatedAt || note.createdAt).toLocaleString()}</small>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
