'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { hotelApi, roomApi, roomTypeApi, subscriptionApi } from '@/lib/api';
import { HotelPublicResponse, HotelResponse, RoomTypeResponse } from '@/types';
import { Button } from '@/components/ui/Button';

type AnyHotel = HotelPublicResponse | HotelResponse;

function RoomTypeCard({ roomType }: { roomType: RoomTypeResponse }) {
  const { user } = useAuth();
  const router = useRouter();

  const isOwner = user?.role === 'HOTEL_OWNER';
  const isAdmin = user?.role === 'SUPER_ADMIN';

  function handleAction() {
    if (isOwner || isAdmin) {
      router.push(`/rooms/${roomType.id}`);
    } else if (!user) {
      router.push(`/login?returnUrl=${encodeURIComponent(`/booking/${roomType.id}`)}`);
    } else {
      router.push(`/booking/${roomType.id}`);
    }
  }

  return (
    <div className="group relative rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-gray-900 truncate">{roomType.name}</h4>
          {roomType.description && (
            <p className="mt-1 text-xs text-gray-500 line-clamp-2">{roomType.description}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-200">
              <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
              Up to {roomType.maxGuests}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-200">
              <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
              {roomType.totalRooms} rooms
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold text-gray-900">${roomType.price}</div>
          <div className="text-xs text-gray-400 font-medium">per night</div>
        </div>
      </div>
      {isOwner || isAdmin ? (
        <Button onClick={handleAction} variant="secondary" className="mt-4 w-full" size="sm">
          View Details
        </Button>
      ) : (
        <Button onClick={handleAction} className="mt-4 w-full" size="sm">
          {user ? 'Book Now' : 'Sign in to Book'}
        </Button>
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
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[] | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);

  async function toggleRooms() {
    if (!expanded && roomTypes === null) {
      setLoadingRooms(true);
      try {
        setRoomTypes(await roomTypeApi.getByHotel(hotel.id));
      } catch {
        setRoomTypes([]);
      } finally {
        setLoadingRooms(false);
      }
    }
    setExpanded((v) => !v);
  }

  return (
    <div className="group rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Hotel header with gradient accent */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
        <div className="flex items-center justify-between p-6 pt-7 gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-lg font-bold shadow-sm shrink-0">
                {hotel.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-gray-900 truncate">{hotel.name}</h3>
                {'location' in hotel && hotel.location && (
                  <p className="mt-0.5 text-sm text-gray-500 flex items-center gap-1">
                    <svg className="h-3.5 w-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0 1 15 0Z" /></svg>
                    <span className="truncate">{hotel.location}</span>
                  </p>
                )}
                {showOwner && 'ownerId' in hotel && (
                  <p className="mt-0.5 font-mono text-xs text-gray-400">
                    Owner: {(hotel as HotelResponse).ownerId.slice(0, 8)}...
                  </p>
                )}
              </div>
            </div>
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
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
            >
              {loadingRooms ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                  Loading...
                </>
              ) : (
                <>
                  <svg className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                  {expanded ? 'Hide Rooms' : 'View Rooms'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Room Types expansion */}
      {expanded && roomTypes !== null && (
        <div className="border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white p-6">
          {roomTypes.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
              </div>
              <p className="text-sm font-medium text-gray-500">No room types available yet</p>
              <p className="text-xs text-gray-400 mt-1">Check back later for availability</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {roomTypes.map((rt) => (
                <RoomTypeCard key={rt.id} roomType={rt} />
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
  const [hotels, setHotels] = useState<AnyHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canAddRoom, setCanAddRoom] = useState(false);
  const [roomBlockReason, setRoomBlockReason] = useState('');

  useEffect(() => {
    if (authLoading) return;

    async function load() {
      try {
        let data: AnyHotel[];
        if (user?.role === 'SUPER_ADMIN') {
          data = await hotelApi.getAll();
        } else if (user?.role === 'HOTEL_OWNER' && user?.hotelId) {
          data = [await hotelApi.getById(user.hotelId)];
        } else {
          // Public browsing (logged out or CUSTOMER)
          data = await hotelApi.browse();
        }
        setHotels(data);

        // Check room creation eligibility for hotel owners
        if (user?.role === 'HOTEL_OWNER' && user?.hotelId) {
          try {
            const [sub, rooms] = await Promise.all([
              subscriptionApi.get(user.hotelId),
              roomApi.getByHotel(user.hotelId),
            ]);
            const isExpired = new Date(sub.expiryDate) < new Date();
            if (!sub.isActive) {
              setRoomBlockReason('Subscription is inactive');
            } else if (isExpired) {
              setRoomBlockReason('Subscription has expired');
            } else if (sub.planConfig?.maxRooms != null) {
              const currentTotal = rooms.length;
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
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-gray-500">Discovering hotels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Explore Hotels</h1>
              <p className="mt-2 text-blue-200 max-w-lg">
                Discover top-rated hotels and browse their rooms. Find the perfect stay for your next trip.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {(user?.role === 'HOTEL_OWNER' || user?.role === 'SUPER_ADMIN') && (
                <Link href="/hotels/new">
                  <Button className="bg-white text-blue-700 hover:bg-blue-50 shadow-lg">+ New Hotel</Button>
                </Link>
              )}
              {!user && (
                <Link href="/rooms">
                  <Button className="bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm">
                    Browse All Room Types
                  </Button>
                </Link>
              )}
            </div>
          </div>
          <div className="mt-6 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5 backdrop-blur-sm">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" /></svg>
              <span className="font-medium">{hotels.length} hotel{hotels.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700 flex items-center gap-2">
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
            {error}
          </div>
        )}

        {hotels.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white py-20 text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" /></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800">No hotels available</h3>
            <p className="mt-1 text-sm text-gray-500">Check back soon for new listings.</p>
            {user?.role === 'HOTEL_OWNER' && (
              <Link href="/hotels/new">
                <Button className="mt-6">Create Your First Hotel</Button>
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
    </div>
  );
}
