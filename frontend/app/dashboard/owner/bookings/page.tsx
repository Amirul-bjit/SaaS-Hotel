'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { bookingApi } from '@/lib/api';
import { BookingResponse } from '@/types';
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

export default function OwnerBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading || !user) return;

    async function load() {
      try {
        const data = await bookingApi.getAll();
        setBookings(data);
      } catch {
        setError('Failed to load bookings.');
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

  const confirmed = bookings.filter(b => b.status === 'Confirmed').length;
  const pending = bookings.filter(b => b.status === 'Pending').length;
  const cancelled = bookings.filter(b => b.status === 'Cancelled').length;

  return (
    <div className="px-6 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Bookings</h1>
        <p className="mt-1 text-sm text-gray-500">{bookings.length} total bookings</p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-green-100 bg-green-50 p-4">
          <div className="text-2xl font-extrabold text-green-700">{confirmed}</div>
          <div className="text-sm font-medium text-green-600">Confirmed</div>
        </div>
        <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-4">
          <div className="text-2xl font-extrabold text-yellow-700">{pending}</div>
          <div className="text-sm font-medium text-yellow-600">Pending</div>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <div className="text-2xl font-extrabold text-red-700">{cancelled}</div>
          <div className="text-sm font-medium text-red-600">Cancelled</div>
        </div>
      </div>

      <Card>
        <Table<BookingResponse & Record<string, unknown>>
          columns={[
            { key: 'id', header: 'Reference', render: (r) => <span className="font-mono font-bold text-gray-700">{r.id.slice(0, 8).toUpperCase()}</span> },
            { key: 'userId', header: 'Guest ID', render: (r) => <span className="font-mono text-xs text-gray-500">{r.userId.slice(0, 8)}…</span> },
            { key: 'roomId', header: 'Room ID', render: (r) => <span className="font-mono text-xs text-gray-500">{r.roomId.slice(0, 8)}…</span> },
            { key: 'checkIn', header: 'Check-In', render: (r) => <span className="text-gray-800">{r.checkIn}</span> },
            { key: 'checkOut', header: 'Check-Out', render: (r) => <span className="text-gray-800">{r.checkOut}</span> },
            { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          ]}
          data={bookings as unknown as (BookingResponse & Record<string, unknown>)[]}
          emptyMessage="No bookings yet."
        />
      </Card>
    </div>
  );
}
