'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { bookingApi, roomApi } from '@/lib/api';
import { RoomGlobalResponse } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AxiosError } from 'axios';

function BookingForm() {
  const params = useParams();
  const roomId = params.roomId as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [room, setRoom] = useState<RoomGlobalResponse | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [roomLoading, setRoomLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    setRoomLoading(true);
    roomApi.getById(roomId)
      .then(setRoom)
      .catch(() => setRoom(null))
      .finally(() => setRoomLoading(false));
  }, [user, authLoading, roomId, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (checkIn >= checkOut) { setError('Check-out must be after check-in.'); return; }
    setLoading(true);
    try {
      const booking = await bookingApi.create({ roomId, checkIn, checkOut });
      setSuccess(`Booking confirmed! Reference: ${booking.id.slice(0, 8).toUpperCase()}`);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(axiosErr.response?.data?.message ?? 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || roomLoading) return <LoadingScreen />;

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Book a Room</h1>
          <p className="text-sm text-gray-500 mt-1">Fill in your dates to confirm</p>
        </div>
        {room && (
          <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
            <div className="text-base font-bold text-blue-900">{room.name}</div>
            <div className="text-sm text-blue-700 mt-0.5">🏨 {room.hotelName}</div>
            <div className="text-xs text-blue-500 mt-0.5">📍 {room.hotelLocation}</div>
            <div className="flex gap-3 mt-2">
              <span className="text-sm font-semibold text-blue-600">${room.price} / night</span>
              <span className="text-xs text-blue-400">· {room.totalRooms} rooms available</span>
              <span className="text-xs text-blue-400">· up to {room.maxGuests} guests</span>
            </div>
          </div>
        )}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}
          {success ? (
            <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-6 text-center">
              <div className="text-3xl mb-3">✅</div>
              <div className="text-base font-bold text-green-800">{success}</div>
              <p className="text-sm text-green-600 mt-1">Your room has been reserved.</p>
              <Button
                className="mt-5 w-full"
                onClick={() => router.push('/dashboard/customer')}
              >
                View My Bookings
              </Button>
              <Button
                className="mt-2 w-full"
                variant="secondary"
                onClick={() => router.push('/rooms')}
              >
                Browse More Rooms
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Input
                label="Check-In Date"
                type="date"
                min={today}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                required
              />
              <Input
                label="Check-Out Date"
                type="date"
                min={checkIn || today}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                required
              />
              {checkIn && checkOut && checkIn < checkOut && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  <span className="font-semibold">Duration:</span>{' '}
                  {Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)} night(s)
                  {room && (
                    <span className="ml-2 font-bold text-blue-700">
                      = ${(room.price * Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)).toFixed(2)}
                    </span>
                  )}
                </div>
              )}
              <Button type="submit" loading={loading} size="lg" className="w-full">
                Confirm Booking
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
        <p className="mt-3 text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <BookingForm />
    </Suspense>
  );
}

