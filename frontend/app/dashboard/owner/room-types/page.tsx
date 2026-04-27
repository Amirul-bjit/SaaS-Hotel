'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { roomTypeApi, roomFeatureApi } from '@/lib/api';
import { RoomTypeResponse, RoomFeatureDto } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AxiosError } from 'axios';

const FEATURE_ICON_MAP: Record<string, string> = {
  wifi: '📶', pool: '🏊', waves: '🌊', snowflake: '❄️', car: '🅿️',
  coffee: '☕', dumbbell: '🏋️', sparkles: '✨', bell: '🛎️', wine: '🍷',
  sun: '🌅', utensils: '🍳',
};

export default function OwnerRoomTypesPage() {
  const { user, loading: authLoading } = useAuth();
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [allFeatures, setAllFeatures] = useState<RoomFeatureDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formBasePrice, setFormBasePrice] = useState('');
  const [formMaxGuests, setFormMaxGuests] = useState('');
  const [formFeatureIds, setFormFeatureIds] = useState<string[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (authLoading || !user?.hotelId) {
      if (!authLoading) setLoading(false);
      return;
    }
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  async function loadData() {
    setLoading(true);
    try {
      const [types, features] = await Promise.all([
        roomTypeApi.getByHotel(user!.hotelId!),
        roomFeatureApi.getAll(),
      ]);
      setRoomTypes(types);
      setAllFeatures(features);
    } catch {
      setError('Failed to load room types.');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setFormName('');
    setFormDesc('');
    setFormBasePrice('');
    setFormMaxGuests('');
    setFormFeatureIds([]);
    setFormError('');
  }

  function startEdit(rt: RoomTypeResponse) {
    setEditingId(rt.id);
    setFormName(rt.name);
    setFormDesc(rt.description);
    setFormBasePrice(String(rt.basePrice));
    setFormMaxGuests(String(rt.maxGuests));
    setFormFeatureIds(rt.features.map((f) => f.id));
    setShowForm(true);
    setFormError('');
  }

  function toggleFeature(id: string) {
    setFormFeatureIds((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user?.hotelId) return;
    setFormLoading(true);
    setFormError('');
    try {
      const data = {
        name: formName,
        description: formDesc,
        basePrice: parseFloat(formBasePrice),
        maxGuests: parseInt(formMaxGuests, 10),
        featureIds: formFeatureIds,
      };
      if (editingId) {
        await roomTypeApi.update(user.hotelId, editingId, data);
      } else {
        await roomTypeApi.create(user.hotelId, data);
      }
      resetForm();
      await loadData();
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setFormError(axiosErr.response?.data?.message ?? 'Failed to save room type.');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!user?.hotelId || !confirm('Delete this room type?')) return;
    try {
      await roomTypeApi.delete(user.hotelId, id);
      await loadData();
    } catch {
      setError('Failed to delete room type.');
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!user?.hotelId) {
    return (
      <div className="px-6 py-8 max-w-4xl">
        <Card><div className="text-center py-8"><p className="text-gray-600">Create a hotel first before managing room types.</p></div></Card>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-5xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Room Types</h1>
          <p className="mt-1 text-sm text-gray-500">Define room categories with amenities for your hotel</p>
        </div>
        {!showForm && (
          <Button onClick={() => { resetForm(); setShowForm(true); }}>+ Add Room Type</Button>
        )}
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
      )}

      {showForm && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editingId ? 'Edit Room Type' : 'New Room Type'}</h2>
            {formError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input label="Name" value={formName} onChange={(e) => setFormName(e.target.value)} required placeholder="Ocean Pool Villa" />
              <Input label="Description" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Luxury villa with private pool" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Base Price ($)" type="number" min="0" step="0.01" value={formBasePrice} onChange={(e) => setFormBasePrice(e.target.value)} required placeholder="299.99" />
                <Input label="Max Guests" type="number" min="1" value={formMaxGuests} onChange={(e) => setFormMaxGuests(e.target.value)} required placeholder="4" />
              </div>
              {allFeatures.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                  <div className="flex flex-wrap gap-2">
                    {allFeatures.map((f) => {
                      const selected = formFeatureIds.includes(f.id);
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => toggleFeature(f.id)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all border ${
                            selected
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-300 hover:bg-indigo-50'
                          }`}
                        >
                          <span>{FEATURE_ICON_MAP[f.icon] || '✦'}</span>
                          {f.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <Button type="submit" loading={formLoading}>{editingId ? 'Update' : 'Create'}</Button>
                <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roomTypes.length === 0 && !showForm ? (
          <div className="col-span-full rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
            <p className="text-gray-500">No room types defined yet. Click &quot;+ Add Room Type&quot; to get started.</p>
          </div>
        ) : (
          roomTypes.map((rt) => (
            <Card key={rt.id}>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">{rt.name}</h3>
                    {rt.description && <p className="text-xs text-gray-500 mt-0.5">{rt.description}</p>}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">${rt.basePrice}</div>
                    <div className="text-xs text-gray-400">per night</div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mb-3">Up to {rt.maxGuests} guests</div>
                {rt.features.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {rt.features.map((f) => (
                      <span key={f.id} className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs text-purple-700 ring-1 ring-purple-100">
                        <span>{FEATURE_ICON_MAP[f.icon] || '✦'}</span>{f.name}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => startEdit(rt)}>Edit</Button>
                  <Button size="sm" variant="secondary" onClick={() => handleDelete(rt.id)} className="text-red-600 hover:text-red-700">Delete</Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
