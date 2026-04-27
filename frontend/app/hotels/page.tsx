'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { hotelApi, roomApi, subscriptionApi } from '@/lib/api';
import { HotelPublicResponse, HotelResponse, RoomResponse, SubscriptionResponse } from '@/types';
import { Button } from '@/components/ui/Button';

type AnyHotel = HotelPublicResponse | HotelResponse;

function RoomCard({ room, hotelId }: { room: RoomResponse; hotelId: string }) {
  const { user } = useAuth();
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-1 min-w-0">
        <div className="font-bold text-gray-900 truncate">{room.name}</div>
        <div className="mt-1 text-2xl font-extrabold text-blue-600">
          ${room.price}<span className="text-sm font-medium text-gray-400"> / night</span>
        </div>
        <div className="mt-1 flex gap-3 text-xs text-gray-500">
          <span>🛏️ {room.totalRooms} rooms</span>
          {room.maxGuests > 0 && <span>👥 Up to {room.maxGuests} guests</span>}
        </div>
      </div>
      {user?.role === 'CUSTOMER' && (
        <Link href={`/booking/${room.id}`}>
          <Button className="mt-4 w-full" size="sm">Book Now</Button>
        </Link>
      )}
    </div>
  );
}

interface HotelCardProps {
  hotel: AnyHotel;
  showOwner: boolean;
  canAddRoom?: boolean;
  roomBlockReason?: string;
}

function HotelCard({ hotel, showOwner, canAddRoom, roomBlockReason }: HotelCardProps) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<RoomResponse[] | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);

  async function toggleRooms() {
    if (!expanded && rooms === null) {
      setLoadingRooms(true);
      try {
        setRooms(await roomApi.getByHotel(hotel.id));
      } catch {
        setRooms([]);
      } finally {
        setLoadingRooms(false);
      }
    }
    setExpanded((v) => !v);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-6 gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-gray-900 truncate">{hotel.name}</h3>
          {'location' in hotel && hotel.location && (
            <p className="mt-0.5 text-xs text-gray-500 flex items-center gap-1">
              <span>📍</span> {hotel.location}
            </p>
          )}
          {showOwner && 'ownerId' in hotel && (
            <p className="mt-0.5 font-mono text-xs text-gray-400">
              Owner: {(hotel as HotelResponse).ownerId}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {user?.role === 'HOTEL_OWNER' && (
            canAddRoom ? (
              <Link href={`/hotels/${hotel.id}/rooms/new`}>
                <Button size="sm" variant="secondary">+ Room</Button>
              </Link>
            ) : (
              <span title={roomBlockReason ?? 'Cannot add rooms'}>
                <Button size="sm" variant="secondary" disabled className="opacity-50 cursor-not-allowed">
                  + Room
                </Button>
              </span>
            )
          )}
          <button
            onClick={toggleRooms}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {loadingRooms ? 'Loading...' : expanded ? '▲ Hide Rooms' : '▼ View Rooms'}
          </button>
        </div>
      </div>
      {expanded && rooms !== null && (
        <div className="border-t border-gray-100 bg-gray-50 p-6">
          {rooms.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No rooms available yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} hotelId={hotel.id} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HotelsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [hotels, setHotels] = useState<AnyHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canAddRoom, setCanAddRoom] = useState(false);
  const [roomBlockReason, setRoomBlockReason] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }

    async function load() {
      try {
        let data: AnyHotel[];
        if (user!.role === 'SUPER_ADMIN') {
          data = await hotelApi.getAll();
        } else if (user!.role === 'HOTEL_OWNER' && user!.hotelId) {
          data = [await hotelApi.getById(user!.hotelId)];
        } else {
          data = await hotelApi.browse();
        }
        setHotels(data);

        // Check room creation eligibility for hotel owners
        if (user!.role === 'HOTEL_OWNER' && user!.hotelId) {
          try {
            const [sub, rooms] = await Promise.all([
              subscriptionApi.get(user!.hotelId),
              roomApi.getByHotel(user!.hotelId),
            ]);
            const isExpired = new Date(sub.expiryDate) < new Date();
            if (!sub.isActive) {
              setRoomBlockReason('Subscription is inactive');
            } else if (isExpired) {
              setRoomBlockReason('Subscription has expired');
            } else if (sub.planConfig?.maxRooms != null) {
              const currentTotal = rooms.reduce((sum, r) => sum + r.totalRooms, 0);
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
        }
      } catch {
        setError('Failed to load hotels.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Loading hotels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Hotels</h1>
          <p className="mt-1 text-sm text-gray-500">
            {hotels.length} hotel{hotels.length !== 1 ? 's' : ''} found
          </p>
        </div>
        {(user?.role === 'HOTEL_OWNER' || user?.role === 'SUPER_ADMIN') && (
          <Link href="/hotels/new">
            <Button>+ New Hotel</Button>
          </Link>
        )}
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {hotels.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center shadow-sm">
          <div className="text-5xl mb-4">🏨</div>
          <p className="text-gray-500 font-medium">No hotels available.</p>
          {user?.role === 'HOTEL_OWNER' && (
            <Link href="/hotels/new">
              <Button className="mt-4">Create Your First Hotel</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {hotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              showOwner={user?.role === 'SUPER_ADMIN'}
              canAddRoom={canAddRoom}
              roomBlockReason={roomBlockReason}
            />
          ))}
        </div>
      )}
    </div>
  );
}

