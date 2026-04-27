'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { roomTypeApi, roomApi, bookingApi } from '@/lib/api';
import { RoomTypeGlobalResponse, RoomResponse, BookingResponse, RoomFeatureDto } from '@/types';
import { Button } from '@/components/ui/Button';

const FEATURE_ICON_MAP: Record<string, string> = {
  wifi: '📶', pool: '🏊', waves: '🌊', snowflake: '❄️', car: '🅿️',
  coffee: '☕', dumbbell: '🏋️', sparkles: '✨', bell: '🛎️', wine: '🍷',
  sun: '🌅', utensils: '🍳',
};

const STATUS_STYLES: Record<string, string> = {
  Confirmed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  Cancelled: 'bg-red-50 text-red-700 ring-red-200',
};

function FeatureTag({ feature }: { feature: RoomFeatureDto }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-100">
      <span>{FEATURE_ICON_MAP[feature.icon] || '✦'}</span>
      {feature.name}
    </span>
  );
}

export default function RoomTypeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [roomType, setRoomType] = useState<RoomTypeGlobalResponse | null>(null);
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push(`/login?returnUrl=${encodeURIComponent(`/rooms/${id}`)}`);
      return;
    }

    async function load() {
      try {
        const rt = await roomTypeApi.getById(id);
        setRoomType(rt);

        // Load rooms and bookings for owner/admin
        if (user?.role === 'HOTEL_OWNER' || user?.role === 'SUPER_ADMIN') {
          const [allBookings] = await Promise.all([
            bookingApi.getAll(),
          ]);
          // If owner has hotel access, also load physical rooms
          if (user.hotelId) {
            try {
              const hotelRooms = await roomApi.getByRoomType(user.hotelId, id);
              setRooms(hotelRooms);
            } catch {
              // May not be this owner's hotel
            }
          }
          setBookings(allBookings.filter((b) => b.roomTypeId === id));
        }
      } catch {
        setError('Failed to load room type details.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, authLoading, id, router]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-gray-500">Loading room type details...</p>
        </div>
      </div>
    );
  }

  if (error || !roomType) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">{error || 'Room type not found.'}</p>
          <Button variant="secondary" className="mt-4" onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  // For customers, redirect to booking page
  if (user?.role === 'CUSTOMER') {
    router.push(`/booking/${id}`);
    return null;
  }

  const confirmedBookings = bookings.filter((b) => b.status === 'Confirmed');
  const pendingBookings = bookings.filter((b) => b.status === 'Pending');
  const cancelledBookings = bookings.filter((b) => b.status === 'Cancelled');

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
          Back
        </button>

        {/* Room Type Header */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-lg font-bold shrink-0">
                  {roomType.hotelName.charAt(0)}
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900">{roomType.name}</h1>
                  <p className="text-sm text-gray-500">{roomType.hotelName} &middot; {roomType.hotelLocation}</p>
                </div>
              </div>
              {roomType.description && (
                <p className="mt-3 text-sm text-gray-600">{roomType.description}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="text-3xl font-bold text-gray-900">${roomType.price}</div>
              <div className="text-xs text-gray-400 font-medium">per night</div>
            </div>
          </div>

          {/* Features */}
          {roomType.features && roomType.features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {roomType.features.map((f) => (
                <FeatureTag key={f.id} feature={f} />
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-center">
              <div className="text-2xl font-bold text-blue-700">{roomType.maxGuests}</div>
              <div className="text-xs font-medium text-blue-500">Max Guests</div>
            </div>
            <div className="rounded-xl bg-gray-50 p-3 text-center">
              <div className="text-2xl font-bold text-gray-700">{roomType.totalRooms}</div>
              <div className="text-xs font-medium text-gray-500">Total Rooms</div>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-center">
              <div className="text-2xl font-bold text-emerald-700">{roomType.availableRooms}</div>
              <div className="text-xs font-medium text-emerald-500">Available Now</div>
            </div>
            <div className="rounded-xl bg-indigo-50 p-3 text-center">
              <div className="text-2xl font-bold text-indigo-700">{confirmedBookings.length}</div>
              <div className="text-xs font-medium text-indigo-500">Active Bookings</div>
            </div>
          </div>
        </div>

        {/* Physical Rooms */}
        {rooms.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Physical Rooms ({rooms.length})</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {rooms.map((room) => (
                <div key={room.id} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-center">
                  <div className="text-sm font-bold text-gray-800">{room.roomNumber}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bookings */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Bookings ({bookings.length})</h2>
            {bookings.length > 0 && (
              <div className="flex gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 ring-1 ring-inset ring-emerald-200">
                  {confirmedBookings.length} confirmed
                </span>
                {pendingBookings.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-amber-700 ring-1 ring-inset ring-amber-200">
                    {pendingBookings.length} pending
                  </span>
                )}
                {cancelledBookings.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-red-700 ring-1 ring-inset ring-red-200">
                    {cancelledBookings.length} cancelled
                  </span>
                )}
              </div>
            )}
          </div>

          {bookings.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
              <svg className="mx-auto h-10 w-10 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
              <p className="text-sm font-medium text-gray-500">No bookings yet for this room type</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2.5 px-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Room</th>
                    <th className="text-left py-2.5 px-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Check-In</th>
                    <th className="text-left py-2.5 px-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Check-Out</th>
                    <th className="text-left py-2.5 px-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
                    <th className="text-left py-2.5 px-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Booking ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-3 font-medium text-gray-800">{b.roomNumber || '—'}</td>
                      <td className="py-3 px-3 text-gray-600">{b.checkIn}</td>
                      <td className="py-3 px-3 text-gray-600">{b.checkOut}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLES[b.status] || 'bg-gray-50 text-gray-600 ring-gray-200'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-gray-400">{b.id.slice(0, 8).toUpperCase()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
