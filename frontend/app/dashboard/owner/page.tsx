'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { bookingApi, hotelApi, roomApi } from '@/lib/api';
import { BookingResponse, HotelResponse, RoomResponse } from '@/types';
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

export default function OwnerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [hotel, setHotel] = useState<HotelResponse | null>(null);
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'HOTEL_OWNER') { router.push('/access-denied'); return; }

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
        }
      } catch {
        setError('Failed to load dashboard data.');
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
          <p className="mt-3 text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Owner Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back, <span className="font-semibold text-gray-700">{user?.name}</span></p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
      )}

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-3xl font-extrabold text-blue-600">{rooms.length}</div>
          <div className="mt-1 text-sm font-medium text-gray-500">Total Rooms</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-3xl font-extrabold text-green-600">{bookings.filter(b => b.status === 'Confirmed').length}</div>
          <div className="mt-1 text-sm font-medium text-gray-500">Confirmed Bookings</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-3xl font-extrabold text-purple-600">{bookings.length}</div>
          <div className="mt-1 text-sm font-medium text-gray-500">Total Bookings</div>
        </div>
      </div>

      {/* Hotel info */}
      {hotel ? (
        <Card className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">My Hotel</div>
              <div className="mt-1 text-xl font-bold text-gray-900">{hotel.name}</div>
              <div className="mt-0.5 font-mono text-xs text-gray-400">{hotel.id}</div>
            </div>
            <Link href={`/hotels/${hotel.id}/rooms/new`}>
              <Button>+ Add Room</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="mb-6">
          <p className="mb-4 text-gray-600">You have no hotel yet.</p>
          <Link href="/hotels/new"><Button>Create Hotel</Button></Link>
        </Card>
      )}

      <Card className="mb-6" title={`Rooms (${rooms.length})`}>
        <Table<RoomResponse & Record<string, unknown>>
          columns={[
            { key: 'name', header: 'Room Name', render: (r) => <span className="font-semibold text-gray-800">{r.name}</span> },
            { key: 'price', header: 'Price / Night', render: (r) => <span className="font-bold text-blue-700">${r.price}</span> },
            { key: 'totalRooms', header: 'Total Rooms', render: (r) => <span className="font-semibold text-gray-700">{r.totalRooms}</span> },
          ]}
          data={rooms as unknown as (RoomResponse & Record<string, unknown>)[]}
          emptyMessage="No rooms added yet."
        />
      </Card>

      <Card title={`Bookings (${bookings.length})`}>
        <Table<BookingResponse & Record<string, unknown>>
          columns={[
            { key: 'id', header: 'Reference', render: (r) => <span className="font-mono font-bold text-gray-700">{r.id.slice(0, 8).toUpperCase()}</span> },
            { key: 'userId', header: 'Guest ID', render: (r) => <span className="font-mono text-xs text-gray-500">{r.userId.slice(0, 8)}...</span> },
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

