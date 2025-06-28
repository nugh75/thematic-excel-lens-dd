import React, { useEffect, useState } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function AdminUserPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Partial<User> & { password?: string }>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const token = localStorage.getItem('token');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore fetch utenti');
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // Debug: log token e fetch
    console.log('Token usato per fetch utenti:', token);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/api/users/${editingId}` : `${API_URL}/api/users`;
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore salvataggio');
      setForm({});
      setEditingId(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (user: User) => {
    setForm({ username: user.username, email: user.email, role: user.role });
    setEditingId(user.id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Eliminare utente?')) return;
    try {
      const res = await fetch(`${API_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore eliminazione');
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Gestione Utenti (Admin)</h2>
      {error && <div className="text-red-600 font-bold mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-2 mb-6">
        <input type="text" placeholder="Username" value={form.username || ''} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} className="border p-2 rounded w-full" required />
        <input type="email" placeholder="Email" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="border p-2 rounded w-full" required />
        <input type="password" placeholder="Password" value={form.password || ''} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="border p-2 rounded w-full" required={!editingId} />
        <select value={form.role || 'user'} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="border p-2 rounded w-full">
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{editingId ? 'Modifica' : 'Crea'} utente</button>
        {editingId && <button type="button" className="ml-2 px-4 py-2 rounded border" onClick={() => { setForm({}); setEditingId(null); }}>Annulla</button>}
      </form>
      {loading ? <div>Caricamento...</div> : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Username</th>
              <th className="p-2">Email</th>
              <th className="p-2">Ruolo</th>
              <th className="p-2">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.username}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2 space-x-2">
                  <button className="text-blue-600 underline" onClick={() => handleEdit(u)}>Modifica</button>
                  <button className="text-red-600 underline" onClick={() => handleDelete(u.id)}>Elimina</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
