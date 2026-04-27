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
    if (!user) {
      router.push(`/login?returnUrl=${encodeURIComponent(`/booking/${roomId}`)}`);
      return;
    }
    setRoomLoading(true);
    roomApi.getById(roomId)
      .then(setRoom)
      .catch(() => setRoom(null))
      .finally(() => setRoomLoading(false));
  }, [user, authLoading, roomId, router]);

  const nights = checkIn && checkOut && checkIn < checkOut
    ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)
    : 0;

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
      const message = axiosErr.response?.data?.message ?? 'Booking failed. Please try again.';
      const isSubscriptionError = message.toLowerCase().includes('subscription');
      setError(isSubscriptionError
        ? `⚠️ ${message}`
        : message);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || roomLoading) return <LoadingScreen />;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-lg px-4 py-12">
        {/* Back link */}
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
          Back to rooms
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Complete Your Booking</h1>
          <p className="text-sm text-gray-500 mt-1">Select your dates and confirm your reservation</p>
        </div>

        {/* Room info card */}
        {room && (
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-bold shrink-0">
                    {room.hotelName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-gray-900 truncate">{room.name}</h2>
                    <p className="text-xs text-gray-500 truncate">{room.hotelName}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0 1 15 0Z" /></svg>
                  {room.hotelLocation}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-200">
                    Up to {room.maxGuests} guests
                  </span>
                  <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                    {room.totalRooms} available
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl font-bold text-gray-900">${room.price}</div>
                <div className="text-xs text-gray-400 font-medium">per night</div>
              </div>
            </div>
          </div>
        )}

        {/* Booking form card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {error && (
            <div className={`mb-5 rounded-xl px-4 py-3 text-sm font-medium flex items-start gap-2 ${
              error.startsWith('⚠️')
                ? 'bg-amber-50 border border-amber-200 text-amber-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <svg className="h-5 w-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="text-center py-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">{success}</h3>
              <p className="text-sm text-gray-500 mt-1">Your room has been reserved successfully.</p>
              <div className="mt-6 flex flex-col gap-2">
                <Button className="w-full" onClick={() => router.push('/dashboard/customer')}>
                  View My Bookings
                </Button>
                <Button className="w-full" variant="secondary" onClick={() => router.push('/rooms')}>
                  Browse More Rooms
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Check-In"
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                />
                <Input
                  label="Check-Out"
                  type="date"
                  min={checkIn || today}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                />
              </div>

              {nights > 0 && room && (
                <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Stay Summary</div>
                      <div className="mt-1 text-sm text-gray-700">
                        {nights} night{nights !== 1 ? 's' : ''} &middot; ${room.price} / night
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        ${(room.price * nights).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400">total</div>
                    </div>
                  </div>
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
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
        <p className="mt-4 text-sm text-gray-500">Loading booking details...</p>
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

