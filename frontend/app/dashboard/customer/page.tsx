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

export default function CustomerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'CUSTOMER') { router.push('/access-denied'); return; }
    bookingApi.getAll()
      .then(setBookings)
      .catch(() => setError('Failed to load bookings.'))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

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
            { key: 'checkIn', header: 'Check-In', render: (r) => <span className="text-gray-800">{r.checkIn}</span> },
            { key: 'checkOut', header: 'Check-Out', render: (r) => <span className="text-gray-800">{r.checkOut}</span> },
            { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          ]}
          data={bookings as unknown as (BookingResponse & Record<string, unknown>)[]}
          emptyMessage="No bookings yet. Browse hotels to make your first booking."
        />
      </Card>
    </div>
  );
}

