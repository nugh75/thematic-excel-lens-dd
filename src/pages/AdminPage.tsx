import React from 'react';
import { useUser } from '../store/UserContext';
import AdminUserPanel from '../components/AdminUserPanel';

export default function AdminPage() {
  const { user } = useUser();
  if (!user || user.role !== 'admin') {
    return <div className="p-8 text-red-600">Accesso riservato agli admin.</div>;
  }
  return <AdminUserPanel />;
}
