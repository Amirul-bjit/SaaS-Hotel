'use client';

import { useEffect, useState } from 'react';
import { bookingApi } from '@/lib/api';
import { BookingResponse } from '@/types';

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Confirmed: 'bg-green-100 text-green-800 border-green-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${colors[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'All' | 'Confirmed' | 'Pending' | 'Cancelled'>('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    bookingApi.getAll()
      .then(setBookings)
      .catch(() => setError('Failed to load bookings.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter((b) => {
    const matchStatus = filter === 'All' || b.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || b.id.toLowerCase().includes(q) || b.userId.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Bookings</h1>
        <p className="mt-1 text-sm text-gray-500">{bookings.length} total bookings across the platform</p>
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search by booking ID or user ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
        />
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-medium">
          {(['All', 'Confirmed', 'Pending', 'Cancelled'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 transition-colors ${filter === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400">{filtered.length} results</span>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Guest ID</th>
              <th className="px-4 py-3">Hotel ID</th>
              <th className="px-4 py-3">Room ID</th>
              <th className="px-4 py-3">Check-In</th>
              <th className="px-4 py-3">Check-Out</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No bookings found.</td></tr>
            )}
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-gray-700">{b.id.slice(0, 8).toUpperCase()}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{b.userId.slice(0, 8)}…</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{b.hotelId.slice(0, 8)}…</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{b.roomId.slice(0, 8)}…</td>
                <td className="px-4 py-3 text-gray-700">{b.checkIn}</td>
                <td className="px-4 py-3 text-gray-700">{b.checkOut}</td>
                <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
