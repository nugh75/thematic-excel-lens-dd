import React, { useEffect, useState } from "react";

interface Label {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function LabelSelectTest() {
  const [labels, setLabels] = useState<Label[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Stato per il form di nuova etichetta
  const [newLabel, setNewLabel] = useState({ name: "", description: "", color: "" });
  const [creating, setCreating] = useState(false);
  // Stato per modifica etichetta
  const [editLabel, setEditLabel] = useState<Label | null>(null);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch etichette
  const fetchLabels = () => {
    setLoading(true);
    fetch(`${API_URL}/api/labels`)
      .then((res) => {
        if (!res.ok) throw new Error("Errore nella fetch delle etichette");
        return res.json();
      })
      .then((data) => {
        setLabels(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setLabels([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLabels();
  }, []);

  // Handler submit nuova etichetta
  const handleAddLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.name) return;
    setCreating(true);
    fetch(`${API_URL}/api/labels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLabel),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Errore creazione etichetta");
        return res.json();
      })
      .then(() => {
        setNewLabel({ name: "", description: "", color: "" });
        fetchLabels();
      })
      .catch((err) => setError(err.message))
      .finally(() => setCreating(false));
  };

  // Handler modifica etichetta
  const handleEditLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLabel) return;
    setEditing(true);
    fetch(`${API_URL}/api/labels/${editLabel.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editLabel.name,
        description: editLabel.description,
        color: editLabel.color,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Errore modifica etichetta");
        return res.json();
      })
      .then(() => {
        setEditLabel(null);
        fetchLabels();
      })
      .catch((err) => setError(err.message))
      .finally(() => setEditing(false));
  };

  // Handler cancella etichetta
  const handleDeleteLabel = (id: string) => {
    if (!window.confirm("Sei sicuro di voler cancellare questa etichetta?")) return;
    setDeleting(true);
    fetch(`${API_URL}/api/labels/${id}`, {
      method: "DELETE"
    })
      .then((res) => {
        if (!res.ok) throw new Error("Errore cancellazione etichetta");
        return res.json();
      })
      .then(() => {
        if (selected === id) setSelected("");
        fetchLabels();
      })
      .catch((err) => setError(err.message))
      .finally(() => setDeleting(false));
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Test Select Etichette da API</h2>
      {/* Form nuova etichetta */}
      <form onSubmit={handleAddLabel} style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Nome etichetta"
          value={newLabel.name}
          onChange={e => setNewLabel(l => ({ ...l, name: e.target.value }))}
          required
          style={{ marginRight: 8 }}
        />
        <input
          type="text"
          placeholder="Descrizione"
          value={newLabel.description}
          onChange={e => setNewLabel(l => ({ ...l, description: e.target.value }))}
          style={{ marginRight: 8 }}
        />
        <input
          type="text"
          placeholder="Colore (es: #ff0000)"
          value={newLabel.color}
          onChange={e => setNewLabel(l => ({ ...l, color: e.target.value }))}
          style={{ marginRight: 8, width: 120 }}
        />
        <button type="submit" disabled={creating}>
          {creating ? "Aggiungo..." : "Aggiungi etichetta"}
        </button>
      </form>
      {/* Form modifica etichetta */}
      {editLabel && (
        <form onSubmit={handleEditLabel} style={{ marginBottom: 24, background: '#f7f7f7', padding: 12 }}>
          <b>Modifica etichetta</b><br />
          <input
            type="text"
            placeholder="Nome etichetta"
            value={editLabel.name}
            onChange={e => setEditLabel(l => l ? { ...l, name: e.target.value } : null)}
            required
            style={{ marginRight: 8 }}
          />
          <input
            type="text"
            placeholder="Descrizione"
            value={editLabel.description || ""}
            onChange={e => setEditLabel(l => l ? { ...l, description: e.target.value } : null)}
            style={{ marginRight: 8 }}
          />
          <input
            type="text"
            placeholder="Colore (es: #ff0000)"
            value={editLabel.color || ""}
            onChange={e => setEditLabel(l => l ? { ...l, color: e.target.value } : null)}
            style={{ marginRight: 8, width: 120 }}
          />
          <button type="submit" disabled={editing}>
            {editing ? "Salvo..." : "Salva modifiche"}
          </button>
          <button type="button" onClick={() => setEditLabel(null)} style={{ marginLeft: 8 }}>
            Annulla
          </button>
        </form>
      )}
      {loading && <p>Caricamento...</p>}
      {error && <p style={{ color: "red" }}>Errore: {error}</p>}
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        style={{ minWidth: 200 }}
      >
        <option value="">-- Seleziona etichetta --</option>
        {labels.map((label) => (
          <option key={label.id} value={label.id}>
            {label.name}
          </option>
        ))}
      </select>
      {selected && (
        <div style={{ marginTop: 16 }}>
          <b>Etichetta selezionata:</b> {labels.find(l => l.id === selected)?.name}
          <div style={{ marginTop: 8 }}>
            <button onClick={() => setEditLabel(labels.find(l => l.id === selected) || null)} style={{ marginRight: 8 }}>
              Modifica
            </button>
            <button onClick={() => handleDeleteLabel(selected)} disabled={deleting} style={{ color: 'red' }}>
              {deleting ? "Cancello..." : "Cancella"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
