'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { roomApi, subscriptionApi, roomTypeApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SubscriptionResponse, RoomResponse, RoomTypeResponse } from '@/types';
import { AxiosError } from 'axios';

export default function OwnerNewRoomPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [totalRooms, setTotalRooms] = useState('');
  const [maxGuests, setMaxGuests] = useState('');
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState('');
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [subLoading, setSubLoading] = useState(true);
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    if (authLoading || !user?.hotelId) {
      if (!authLoading) setSubLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const [sub, rooms, types] = await Promise.all([
          subscriptionApi.get(user!.hotelId!),
          roomApi.getByHotel(user!.hotelId!),
          roomTypeApi.getByHotel(user!.hotelId!),
        ]);
        setRoomTypes(types);

        const isExpired = new Date(sub.expiryDate) < new Date();
        if (!sub.isActive) {
          setBlockReason('Your hotel subscription is inactive. Please reactivate your subscription to add rooms.');
        } else if (isExpired) {
          setBlockReason('Your hotel subscription has expired. Please renew your subscription to add rooms.');
        } else if (sub.planConfig?.maxRooms != null) {
          const currentTotal = rooms.reduce((sum, r) => sum + r.totalRooms, 0);
          if (currentTotal >= sub.planConfig.maxRooms) {
            setBlockReason(
              `You have reached the maximum room limit for your ${sub.planType} plan (${currentTotal}/${sub.planConfig.maxRooms} rooms). Upgrade your plan to add more rooms.`
            );
          }
        }
      } catch {
        setBlockReason('Your hotel does not have a subscription. Please subscribe to a plan before adding rooms.');
      } finally {
        setSubLoading(false);
      }
    }
    fetchData();
  }, [user, authLoading]);

  const isBlocked = blockReason !== '';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user?.hotelId) return;
    setError('');
    setLoading(true);
    try {
      await roomApi.create(user.hotelId, {
        name,
        price: parseFloat(price),
        totalRooms: parseInt(totalRooms, 10),
        maxGuests: parseInt(maxGuests, 10),
        roomTypeId: selectedRoomTypeId || undefined,
      });
      router.push('/dashboard/owner/rooms');
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(axiosErr.response?.data?.message ?? 'Failed to create room.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-6 py-8 max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Add Room</h1>
        <p className="mt-1 text-sm text-gray-500">Define a new room type for your hotel</p>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        {subLoading ? (
          <p className="text-center text-gray-500">Checking subscription status…</p>
        ) : isBlocked ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-5 text-center">
            <p className="text-lg font-semibold text-amber-800 mb-2">Room Creation Blocked</p>
            <p className="text-sm text-amber-700 mb-4">{blockReason}</p>
            <Link href="/dashboard/owner/rooms">
              <Button size="sm" variant="secondary">Back to Rooms</Button>
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Input label="Room Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Deluxe Suite" />
              <Input label="Price per Night ($)" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="199.99" />
              <Input label="Total Rooms Available" type="number" min="1" value={totalRooms} onChange={(e) => setTotalRooms(e.target.value)} required placeholder="5" />
              <Input label="Max Guests per Room" type="number" min="1" value={maxGuests} onChange={(e) => setMaxGuests(e.target.value)} required placeholder="2" />
              {roomTypes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Type (optional)</label>
                  <select
                    value={selectedRoomTypeId}
                    onChange={(e) => setSelectedRoomTypeId(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">No room type</option>
                    {roomTypes.map((rt) => (
                      <option key={rt.id} value={rt.id}>{rt.name} — ${rt.basePrice}/night, up to {rt.maxGuests} guests</option>
                    ))}
                  </select>
                  {selectedRoomTypeId && (() => {
                    const rt = roomTypes.find((t) => t.id === selectedRoomTypeId);
                    if (!rt || rt.features.length === 0) return null;
                    return (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {rt.features.map((f) => (
                          <span key={f.id} className="inline-flex items-center rounded bg-purple-50 px-2 py-0.5 text-xs text-purple-700 ring-1 ring-purple-100">{f.name}</span>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
              <Button type="submit" loading={loading} size="lg" className="w-full">Add Room</Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
