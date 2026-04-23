'use client';

import { useEffect, useState } from 'react';
import { hotelApi, subscriptionApi, userApi } from '@/lib/api';
import { HotelResponse, SubscriptionResponse, UserResponse, CreateHotelRequest } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { AxiosError } from 'axios';

function PlanBadge({ plan }: { plan: string }) {
  const colors: Record<string, string> = {
    Basic: 'bg-gray-100 text-gray-700 border-gray-200',
    Standard: 'bg-blue-100 text-blue-800 border-blue-200',
    Premium: 'bg-purple-100 text-purple-800 border-purple-200',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${colors[plan] ?? 'bg-gray-100 text-gray-700'}`}>
      {plan}
    </span>
  );
}

export default function HotelsPage() {
  const [hotels, setHotels] = useState<HotelResponse[]>([]);
  const [owners, setOwners] = useState<UserResponse[]>([]);
  const [subscriptions, setSubscriptions] = useState<Record<string, SubscriptionResponse>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add Hotel modal
  const [addOpen, setAddOpen] = useState(false);
  const [hotelName, setHotelName] = useState('');
  const [hotelLocation, setHotelLocation] = useState('');
  const [hotelOwnerId, setHotelOwnerId] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  // Subscription modal
  const [subModal, setSubModal] = useState<{ hotelId: string; hotelName: string } | null>(null);
  const [subPlan, setSubPlan] = useState<'Basic' | 'Standard' | 'Premium'>('Basic');
  const [subExpiry, setSubExpiry] = useState('');
  const [subLoading, setSubLoading] = useState(false);
  const [subError, setSubError] = useState('');
  const [subSuccess, setSubSuccess] = useState('');

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<HotelResponse | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function loadAll() {
    try {
      const [h, o] = await Promise.all([hotelApi.getAll(), userApi.getOwners()]);
      setHotels(h);
      setOwners(o);
      const subMap: Record<string, SubscriptionResponse> = {};
      await Promise.all(h.map(async (hotel) => {
        try { subMap[hotel.id] = await subscriptionApi.get(hotel.id); } catch {}
      }));
      setSubscriptions(subMap);
    } catch {
      setError('Failed to load hotels.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  function openAdd() {
    setHotelName(''); setHotelLocation(''); setHotelOwnerId('');
    setAddError(''); setAddSuccess('');
    setAddOpen(true);
  }

  async function handleAdd() {
    if (!hotelName.trim() || !hotelLocation.trim() || !hotelOwnerId) {
      setAddError('All fields are required.'); return;
    }
    setAddError(''); setAddLoading(true);
    try {
      await hotelApi.create({ name: hotelName, location: hotelLocation, ownerId: hotelOwnerId } as CreateHotelRequest);
      setAddSuccess('Hotel created successfully.');
      loadAll();
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      setAddError(e.response?.data?.message ?? 'Failed to create hotel.');
    } finally {
      setAddLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await hotelApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      loadAll();
    } catch {
      setError('Failed to delete hotel.');
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleCreateSubscription() {
    if (!subModal) return;
    setSubError(''); setSubLoading(true);
    try {
      const created = await subscriptionApi.create(subModal.hotelId, {
        planType: subPlan,
        expiryDate: new Date(subExpiry).toISOString(),
      });
      setSubscriptions((prev) => ({ ...prev, [subModal.hotelId]: created }));
      setSubSuccess(`${created.planType} plan activated.`);
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      setSubError(e.response?.data?.message ?? 'Failed to save subscription.');
    } finally {
      setSubLoading(false);
    }
  }

  const ownerName = (ownerId: string) => owners.find((o) => o.id === ownerId)?.name ?? ownerId.slice(0, 8) + '…';

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
          <h1 className="text-2xl font-extrabold text-gray-900">Hotels</h1>
          <p className="mt-1 text-sm text-gray-500">{hotels.length} registered properties</p>
        </div>
        <Button onClick={openAdd}>+ Add Hotel</Button>
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Subscription</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {hotels.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No hotels found.</td></tr>
            )}
            {hotels.map((h) => (
              <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-gray-800">{h.name}</td>
                <td className="px-4 py-3 text-gray-600">{h.location}</td>
                <td className="px-4 py-3 text-gray-600">{ownerName(h.ownerId)}</td>
                <td className="px-4 py-3">
                  {subscriptions[h.id]
                    ? <PlanBadge plan={subscriptions[h.id].planType} />
                    : <span className="text-xs text-gray-400">None</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => { setSubModal({ hotelId: h.id, hotelName: h.name }); setSubPlan('Basic'); setSubExpiry(''); setSubError(''); setSubSuccess(''); }}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Manage Plan
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => setDeleteTarget(h)}
                      className="text-xs font-medium text-red-500 hover:text-red-700 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Hotel Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Hotel">
        {addSuccess ? (
          <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-6 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="font-semibold text-green-800">{addSuccess}</p>
            <Button className="mt-4 w-full" onClick={() => setAddOpen(false)}>Done</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {addError && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{addError}</div>}
            <Input label="Hotel Name" type="text" placeholder="e.g. Grand Palace Hotel" value={hotelName} onChange={(e) => setHotelName(e.target.value)} required />
            <Input label="Location" type="text" placeholder="e.g. Paris, France" value={hotelLocation} onChange={(e) => setHotelLocation(e.target.value)} required />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Assign Owner <span className="text-red-500">*</span></label>
              <select value={hotelOwnerId} onChange={(e) => setHotelOwnerId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Select a hotel owner --</option>
                {owners.map((o) => <option key={o.id} value={o.id}>{o.name} ({o.email})</option>)}
              </select>
            </div>
            <Button onClick={handleAdd} loading={addLoading} className="w-full">Create Hotel</Button>
          </div>
        )}
      </Modal>

      {/* Subscription Modal */}
      <Modal open={!!subModal} onClose={() => setSubModal(null)} title={`Subscription — ${subModal?.hotelName}`}>
        {subSuccess ? (
          <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-6 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="font-semibold text-green-800">{subSuccess}</p>
            <Button className="mt-4 w-full" onClick={() => setSubModal(null)}>Done</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {subError && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{subError}</div>}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Plan</label>
              <select value={subPlan} onChange={(e) => setSubPlan(e.target.value as typeof subPlan)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Basic">Basic</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
              </select>
            </div>
            <Input label="Expiry Date" type="date" value={subExpiry} onChange={(e) => setSubExpiry(e.target.value)} required />
            <Button onClick={handleCreateSubscription} loading={subLoading} className="w-full">Save Subscription</Button>
          </div>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Hotel">
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete <span className="font-bold text-gray-900">{deleteTarget?.name}</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <button
            onClick={handleDelete}
            disabled={deleteLoading}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {deleteLoading ? 'Deleting…' : 'Delete Hotel'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
