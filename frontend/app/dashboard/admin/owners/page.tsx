'use client';

import { useEffect, useState } from 'react';
import { userApi } from '@/lib/api';
import { UserResponse, CreateOwnerRequest } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { AxiosError } from 'axios';

export default function OwnersPage() {
  const [owners, setOwners] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add owner modal
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function loadOwners() {
    try {
      const data = await userApi.getOwners();
      setOwners(data);
    } catch {
      setError('Failed to load owners.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadOwners(); }, []);

  function openAdd() {
    setName(''); setEmail(''); setPassword('');
    setAddError(''); setAddSuccess('');
    setAddOpen(true);
  }

  async function handleAdd() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setAddError('All fields are required.'); return;
    }
    setAddError(''); setAddLoading(true);
    try {
      await userApi.createOwner({ name, email, password } as CreateOwnerRequest);
      setAddSuccess('Hotel owner created successfully.');
      loadOwners();
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      setAddError(e.response?.data?.message ?? 'Failed to create owner.');
    } finally {
      setAddLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await userApi.deleteOwner(deleteTarget.id);
      setDeleteTarget(null);
      loadOwners();
    } catch {
      setError('Failed to delete owner.');
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Hotel Owners</h1>
          <p className="mt-1 text-sm text-gray-500">{owners.length} registered owners</p>
        </div>
        <Button onClick={openAdd}>+ Add Owner</Button>
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {owners.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No hotel owners found.</td></tr>
            )}
            {owners.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">
                      {o.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-800">{o.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{o.email}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                    Hotel Owner
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setDeleteTarget(o)}
                    className="text-xs font-medium text-red-500 hover:text-red-700 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Owner Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Hotel Owner">
        {addSuccess ? (
          <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-6 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="font-semibold text-green-800">{addSuccess}</p>
            <Button className="mt-4 w-full" onClick={() => setAddOpen(false)}>Done</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {addError && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{addError}</div>}
            <Input label="Full Name" type="text" placeholder="e.g. John Smith" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Email Address" type="email" placeholder="owner@hotel.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Password" type="password" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <p className="text-xs text-gray-400">The owner will be able to log in and manage their assigned hotel.</p>
            <Button onClick={handleAdd} loading={addLoading} className="w-full">Create Owner Account</Button>
          </div>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Owner">
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete <span className="font-bold text-gray-900">{deleteTarget?.name}</span>?
          Their account and access will be permanently removed.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <button
            onClick={handleDelete}
            disabled={deleteLoading}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {deleteLoading ? 'Deleting…' : 'Delete Owner'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
