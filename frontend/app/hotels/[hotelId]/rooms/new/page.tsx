'use client';

import { useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { roomApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AxiosError } from 'axios';

export default function NewRoomPage() {
  const params = useParams();
  const hotelId = params.hotelId as string;
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [totalRooms, setTotalRooms] = useState('');
  const [maxGuests, setMaxGuests] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  if (user && user.role !== 'HOTEL_OWNER' && user.role !== 'SUPER_ADMIN') {
    router.push('/access-denied');
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await roomApi.create(hotelId, {
        name,
        price: parseFloat(price),
        totalRooms: parseInt(totalRooms, 10),
        maxGuests: parseInt(maxGuests, 10),
      });
      router.push('/hotels');
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(axiosErr.response?.data?.message ?? 'Failed to create room.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">🛏️ Add Room</h1>
          <p className="mt-1 text-sm text-gray-500">Define a new room type for your hotel</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Room Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Deluxe Suite"
            />
            <Input
              label="Price per Night ($)"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              placeholder="199.99"
            />
            <Input
              label="Total Rooms Available"
              type="number"
              min="1"
              value={totalRooms}
              onChange={(e) => setTotalRooms(e.target.value)}
              required
              placeholder="5"
            />
            <Input
              label="Max Guests per Room"
              type="number"
              min="1"
              value={maxGuests}
              onChange={(e) => setMaxGuests(e.target.value)}
              required
              placeholder="2"
            />
            <Button type="submit" loading={loading} size="lg" className="w-full">
              Add Room
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
