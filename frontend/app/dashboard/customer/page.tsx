'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { bookingApi } from '@/lib/api';
import { BookingResponse } from '@/types';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Confirmed: 'bg-green-100 text-green-800 border-green-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    CheckedIn: 'bg-blue-100 text-blue-800 border-blue-200',
    CheckedOut: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    Completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    NoShow: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  const labels: Record<string, string> = {
    CheckedIn: 'Checked In',
    CheckedOut: 'Checked Out',
    NoShow: 'No Show',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${colors[status] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
      {labels[status] ?? status}
    </span>
  );
}

function getNights(checkIn: string, checkOut: string): number {
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  return Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function CustomerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<BookingResponse | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'CUSTOMER') { router.push('/access-denied'); return; }
    bookingApi.getAll()
      .then(setBookings)
      .catch(() => setError('Failed to load bookings.'))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  const handleCancel = async (booking: BookingResponse) => {
    setCancelling(true);
    try {
      const updated = await bookingApi.cancel(booking.id);
      setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
      setSelected(updated);
    } catch {
      setError('Failed to cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  const confirmed = bookings.filter(b => b.status === 'Confirmed').length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">My Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Welcome back, <span className="font-semibold text-gray-700">{user?.name}</span></p>
        </div>
        <div className="flex gap-3">
          <Link href="/rooms">
            <Button size="lg">🌍 Browse Rooms</Button>
          </Link>
          <Link href="/hotels">
            <Button size="lg" variant="secondary">🏨 Browse Hotels</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-3xl font-extrabold text-blue-600">{bookings.length}</div>
          <div className="mt-1 text-sm font-medium text-gray-500">Total Bookings</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-3xl font-extrabold text-green-600">{confirmed}</div>
          <div className="mt-1 text-sm font-medium text-gray-500">Confirmed</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-3xl font-extrabold text-yellow-600">{bookings.filter(b => b.status === 'Pending').length}</div>
          <div className="mt-1 text-sm font-medium text-gray-500">Pending</div>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
      )}

      <Card title="My Bookings">
        <Table<BookingResponse & Record<string, unknown>>
          columns={[
            { key: 'id', header: 'Reference', render: (r) => <span className="font-mono font-bold text-gray-700">{r.id.slice(0, 8).toUpperCase()}</span> },
            { key: 'hotelName', header: 'Hotel', render: (r) => (
              <div>
                <div className="font-medium text-gray-900">{r.hotelName || '—'}</div>
                {r.hotelLocation && <div className="text-xs text-gray-500">{r.hotelLocation}</div>}
              </div>
            )},
            { key: 'roomTypeName', header: 'Room Type', render: (r) => <span className="text-gray-800">{r.roomTypeName}</span> },
            { key: 'checkIn', header: 'Check-In', render: (r) => <span className="text-gray-800">{r.checkIn}</span> },
            { key: 'checkOut', header: 'Check-Out', render: (r) => <span className="text-gray-800">{r.checkOut}</span> },
            { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
            { key: 'actions' as keyof BookingResponse, header: '', render: (r) => (
              <button
                onClick={() => setSelected(r)}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
              >
                View
              </button>
            )},
          ]}
          data={bookings as unknown as (BookingResponse & Record<string, unknown>)[]}
          emptyMessage="No bookings yet. Browse hotels to make your first booking."
        />
      </Card>

      {/* Booking Details Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Booking Details">
        {selected && (() => {
          const nights = getNights(selected.checkIn, selected.checkOut);
          const total = nights * selected.pricePerNight;
          const canCancel = selected.status === 'Pending' || selected.status === 'Confirmed';

          return (
            <div className="space-y-5">
              {/* Hotel info */}
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Hotel</div>
                <div className="text-lg font-bold text-gray-900">{selected.hotelName || '—'}</div>
                {selected.hotelLocation && (
                  <div className="text-sm text-gray-500 mt-0.5">📍 {selected.hotelLocation}</div>
                )}
              </div>

              {/* Room info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Room Type</div>
                  <div className="font-semibold text-gray-900">{selected.roomTypeName}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Room Number</div>
                  <div className="font-semibold text-gray-900">{selected.roomNumber || '—'}</div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Check-In</div>
                  <div className="font-semibold text-gray-900">{formatDate(selected.checkIn)}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Check-Out</div>
                  <div className="font-semibold text-gray-900">{formatDate(selected.checkOut)}</div>
                </div>
              </div>

              {/* Cost breakdown */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>${selected.pricePerNight.toFixed(2)} × {nights} night{nights > 1 ? 's' : ''}</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-lg text-gray-900">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Status & Reference */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Status</div>
                  <StatusBadge status={selected.status} />
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Reference</div>
                  <span className="font-mono font-bold text-gray-700">{selected.id.slice(0, 8).toUpperCase()}</span>
                </div>
              </div>

              {/* Cancel button */}
              {canCancel && (
                <Button
                  variant="danger"
                  className="w-full"
                  onClick={() => handleCancel(selected)}
                  loading={cancelling}
                >
                  Cancel Booking
                </Button>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

