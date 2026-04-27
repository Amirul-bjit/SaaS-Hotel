'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { bookingApi, hotelApi, roomApi, subscriptionApi } from '@/lib/api';
import { BookingResponse, HotelResponse, RoomResponse, SubscriptionResponse } from '@/types';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Confirmed: 'bg-green-100 text-green-800 border-green-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${colors[status] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
      {status}
    </span>
  );
}

export default function OwnerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [hotel, setHotel] = useState<HotelResponse | null>(null);
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading || !user) return;

    async function load() {
      try {
        const bookingsData = await bookingApi.getAll();
        setBookings(bookingsData);
        if (user!.hotelId) {
          const [hotelData, roomsData] = await Promise.all([
            hotelApi.getById(user!.hotelId),
            roomApi.getByHotel(user!.hotelId),
          ]);
          setHotel(hotelData);
          setRooms(roomsData);
          try {
            const sub = await subscriptionApi.get(user!.hotelId);
            setSubscription(sub);
          } catch { /* no subscription */ }
        }
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const totalRoomCount = rooms.length;
  const confirmedBookings = bookings.filter(b => b.status === 'Confirmed').length;
  const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
  const isExpired = subscription ? new Date(subscription.expiryDate) < new Date() : false;
  const isInGracePeriod = subscription?.isInGracePeriod ?? false;
  const isApproachingExpiry = subscription ? subscription.daysUntilExpiry <= 7 && subscription.daysUntilExpiry >= 0 : false;

  return (
    <div className="px-6 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, <span className="font-semibold text-gray-700">{user?.name}</span>
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
      )}

      {/* Subscription warning */}
      {subscription && (isExpired || !subscription.isActive || isInGracePeriod || isApproachingExpiry) && (
        <div className={`mb-6 rounded-lg border px-4 py-3 text-sm font-medium ${
          isInGracePeriod || (isExpired && !isInGracePeriod)
            ? 'border-red-200 bg-red-50 text-red-800'
            : 'border-amber-200 bg-amber-50 text-amber-800'
        }`}>
          {!subscription.isActive
            ? '⚠️ Your subscription is inactive. Some features may be restricted.'
            : isInGracePeriod
            ? `🚨 Your subscription has expired! ${7 + subscription.daysUntilExpiry} day(s) left in grace period before deactivation.`
            : isExpired
            ? '⚠️ Your subscription has expired and the grace period has ended.'
            : `⚠️ Your subscription expires in ${subscription.daysUntilExpiry} day(s). Renew soon to avoid service interruption.`}
        </div>
      )}

      {/* Stats grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-3xl font-extrabold text-blue-600">{hotel?.name ?? '—'}</div>
          <div className="mt-1 text-sm font-medium text-gray-500">Hotel</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-3xl font-extrabold text-indigo-600">{rooms.length}</div>
          <div className="mt-1 text-sm font-medium text-gray-500">
            Room Types
            {subscription?.planConfig?.maxRooms != null && (
              <span className="text-xs text-gray-400 ml-1">({totalRoomCount}/{subscription.planConfig.maxRooms} capacity)</span>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-3xl font-extrabold text-green-600">{confirmedBookings}</div>
          <div className="mt-1 text-sm font-medium text-gray-500">Confirmed Bookings</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-3xl font-extrabold text-yellow-600">{pendingBookings}</div>
          <div className="mt-1 text-sm font-medium text-gray-500">Pending Bookings</div>
        </div>
      </div>

      {/* Subscription info */}
      {subscription && (
        <Card className="mb-6" title="Subscription">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Plan</div>
              <div className="mt-1 text-lg font-bold text-gray-900">{subscription.planType}</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Billing</div>
              <div className="mt-1 text-lg font-bold text-gray-900">{subscription.billingCycle}</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Expires</div>
              <div className={`mt-1 text-lg font-bold ${isExpired ? 'text-red-600' : isApproachingExpiry ? 'text-amber-600' : 'text-gray-900'}`}>
                {new Date(subscription.expiryDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Recent bookings */}
      <Card title={`Recent Bookings (${bookings.length})`}>
        <Table<BookingResponse & Record<string, unknown>>
          columns={[
            { key: 'id', header: 'Reference', render: (r) => <span className="font-mono font-bold text-gray-700">{r.id.slice(0, 8).toUpperCase()}</span> },
            { key: 'checkIn', header: 'Check-In', render: (r) => <span className="text-gray-800">{r.checkIn}</span> },
            { key: 'checkOut', header: 'Check-Out', render: (r) => <span className="text-gray-800">{r.checkOut}</span> },
            { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          ]}
          data={(bookings.slice(0, 10)) as unknown as (BookingResponse & Record<string, unknown>)[]}
          emptyMessage="No bookings yet."
        />
      </Card>
    </div>
  );
}

