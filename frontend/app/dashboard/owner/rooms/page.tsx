'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { roomApi, subscriptionApi } from '@/lib/api';
import { RoomResponse, SubscriptionResponse } from '@/types';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';

export default function OwnerRoomsPage() {
  const { user, loading: authLoading } = useAuth();
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canAddRoom, setCanAddRoom] = useState(false);
  const [roomBlockReason, setRoomBlockReason] = useState('');

  useEffect(() => {
    if (authLoading || !user || !user.hotelId) {
      if (!authLoading) setLoading(false);
      return;
    }

    async function load() {
      try {
        const roomsData = await roomApi.getByHotel(user!.hotelId!);
        setRooms(roomsData);

        try {
          const sub = await subscriptionApi.get(user!.hotelId!);
          setSubscription(sub);

          const isExpired = new Date(sub.expiryDate) < new Date();
          if (!sub.isActive) {
            setRoomBlockReason('Subscription is inactive');
          } else if (isExpired) {
            setRoomBlockReason('Subscription has expired');
          } else if (sub.planConfig?.maxRooms != null) {
            const currentTotal = roomsData.reduce((sum, r) => sum + r.totalRooms, 0);
            if (currentTotal >= sub.planConfig.maxRooms) {
              setRoomBlockReason(`Room limit reached (${currentTotal}/${sub.planConfig.maxRooms})`);
            } else {
              setCanAddRoom(true);
            }
          } else {
            setCanAddRoom(true);
          }
        } catch {
          setRoomBlockReason('No subscription found');
        }
      } catch {
        setError('Failed to load rooms.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
      </div>
    );
  }

  if (!user?.hotelId) {
    return (
      <div className="px-6 py-8 max-w-4xl">
        <Card>
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🛏️</div>
            <p className="text-gray-600 mb-4">Create a hotel first before managing rooms.</p>
            <Link href="/hotels/new"><Button>Create Hotel</Button></Link>
          </div>
        </Card>
      </div>
    );
  }

  const totalRoomCount = rooms.reduce((sum, r) => sum + r.totalRooms, 0);

  return (
    <div className="px-6 py-8 max-w-5xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Rooms</h1>
          <p className="mt-1 text-sm text-gray-500">
            {rooms.length} room type{rooms.length !== 1 ? 's' : ''} · {totalRoomCount} total rooms
            {subscription?.planConfig?.maxRooms != null && (
              <span className="text-gray-400"> / {subscription.planConfig.maxRooms} max</span>
            )}
          </p>
        </div>
        {canAddRoom ? (
          <Link href={`/dashboard/owner/rooms/new`}>
            <Button>+ Add Room</Button>
          </Link>
        ) : (
          <span title={roomBlockReason}>
            <Button disabled className="opacity-50 cursor-not-allowed">+ Add Room</Button>
          </span>
        )}
      </div>

      {roomBlockReason && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          ⚠️ {roomBlockReason}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
      )}

      <Card>
        <Table<RoomResponse & Record<string, unknown>>
          columns={[
            { key: 'name', header: 'Room Name', render: (r) => <span className="font-semibold text-gray-800">{r.name}</span> },
            { key: 'price', header: 'Price / Night', render: (r) => <span className="font-bold text-blue-700">${r.price}</span> },
            { key: 'totalRooms', header: 'Total Rooms', render: (r) => <span className="font-semibold text-gray-700">{r.totalRooms}</span> },
            { key: 'maxGuests', header: 'Max Guests', render: (r) => <span className="text-gray-600">{r.maxGuests}</span> },
          ]}
          data={rooms as unknown as (RoomResponse & Record<string, unknown>)[]}
          emptyMessage="No rooms added yet. Click '+ Add Room' to get started."
        />
      </Card>
    </div>
  );
}
