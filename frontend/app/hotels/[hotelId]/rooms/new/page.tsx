'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { roomApi, roomTypeApi, subscriptionApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SubscriptionResponse, RoomResponse, RoomTypeResponse } from '@/types';
import { AxiosError } from 'axios';

export default function NewRoomPage() {
  const params = useParams();
  const hotelId = params.hotelId as string;
  const [roomTypeId, setRoomTypeId] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [existingRooms, setExistingRooms] = useState<RoomResponse[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [subLoading, setSubLoading] = useState(true);
  const [blockReason, setBlockReason] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  if (user && user.role !== 'HOTEL_OWNER' && user.role !== 'SUPER_ADMIN') {
    router.push('/access-denied');
    return null;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    async function fetchData() {
      try {
        const [sub, rooms, rts] = await Promise.all([
          subscriptionApi.get(hotelId),
          roomApi.getByHotel(hotelId),
          roomTypeApi.getByHotel(hotelId),
        ]);
        setSubscription(sub);
        setExistingRooms(rooms);
        setRoomTypes(rts);

        const isExpired = new Date(sub.expiryDate) < new Date();
        if (!sub.isActive) {
          setBlockReason('Your hotel subscription is inactive. Please reactivate your subscription to add rooms.');
        } else if (isExpired) {
          setBlockReason('Your hotel subscription has expired. Please renew your subscription to add rooms.');
        } else if (sub.planConfig?.maxRooms != null) {
          const currentTotal = rooms.length;
          if (currentTotal >= sub.planConfig.maxRooms) {
            setBlockReason(
              `You have reached the maximum room limit for your ${sub.planType} plan (${currentTotal}/${sub.planConfig.maxRooms} rooms). Upgrade your plan to add more rooms.`
            );
          }
        }

        if (rts.length === 0) {
          setBlockReason('No room types found. Please create a room type first before adding physical rooms.');
        }
      } catch {
        setSubscription(null);
        setBlockReason('Your hotel does not have a subscription. Please subscribe to a plan before adding rooms.');
      } finally {
        setSubLoading(false);
      }
    }
    fetchData();
  }, [hotelId]);

  const isBlocked = blockReason !== '';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await roomApi.create(hotelId, { roomTypeId, roomNumber });
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
          <p className="mt-1 text-sm text-gray-500">Add a physical room to your hotel</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {subLoading ? (
            <p className="text-center text-gray-500">Checking subscription status…</p>
          ) : isBlocked ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-5 text-center">
              <p className="text-lg font-semibold text-amber-800 mb-2">Room Creation Blocked</p>
              <p className="text-sm text-amber-700 mb-4">{blockReason}</p>
              <Link href="/hotels">
                <Button size="sm" variant="secondary">Back to Hotels</Button>
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
              )}
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                  <select
                    value={roomTypeId}
                    onChange={(e) => setRoomTypeId(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select a room type...</option>
                    {roomTypes.map((rt) => (
                      <option key={rt.id} value={rt.id}>
                        {rt.name} — ${rt.price}/night
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Room Number"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  required
                  placeholder="101"
                />
                <Button type="submit" loading={loading} size="lg" className="w-full">
                  Add Room
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
