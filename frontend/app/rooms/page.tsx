'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { roomApi, RoomFilters } from '@/lib/api';
import { RoomGlobalResponse } from '@/types';
import { Button } from '@/components/ui/Button';

function RoomCard({ room }: { room: RoomGlobalResponse }) {
  const { user } = useAuth();
  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 text-base truncate">{room.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <span>🏨</span>
              <span className="truncate">{room.hotelName}</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <span>📍</span>
              <span className="truncate">{room.hotelLocation}</span>
            </p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-xl font-extrabold text-blue-600">${room.price}</div>
            <div className="text-xs text-gray-400">/ night</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            👥 Up to {room.maxGuests} guests
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
            🛏️ {room.totalRooms} available
          </span>
        </div>
      </div>
      {user?.role === 'CUSTOMER' && (
        <div className="px-5 pb-5">
          <Link href={`/booking/${room.id}`}>
            <Button className="w-full" size="sm">
              Book Now
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function RoomsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<RoomGlobalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minGuests, setMinGuests] = useState('');
  const [location, setLocation] = useState('');
  const [applied, setApplied] = useState<RoomFilters>({});

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchRooms({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const fetchRooms = useCallback(async (filters: RoomFilters) => {
    setLoading(true);
    setError('');
    try {
      const data = await roomApi.getAll(filters);
      setRooms(data);
    } catch {
      setError('Failed to load rooms. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  function handleApplyFilters() {
    const filters: RoomFilters = {};
    if (minPrice !== '') filters.minPrice = parseFloat(minPrice);
    if (maxPrice !== '') filters.maxPrice = parseFloat(maxPrice);
    if (minGuests !== '') filters.minGuests = parseInt(minGuests, 10);
    if (location.trim() !== '') filters.location = location.trim();
    setApplied(filters);
    fetchRooms(filters);
  }

  function handleClearFilters() {
    setMinPrice('');
    setMaxPrice('');
    setMinGuests('');
    setLocation('');
    setApplied({});
    fetchRooms({});
  }

  const hasFilters = Object.keys(applied).length > 0;

  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">🌍 Global Room Marketplace</h1>
        <p className="mt-2 text-gray-500">
          Browse all available rooms across every hotel on the platform.
        </p>
      </div>

      {/* Filter Panel */}
      <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-gray-700 uppercase tracking-wide">
          Filter Rooms
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Min Price ($/night)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Max Price ($/night)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Any"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Min Guests
            </label>
            <input
              type="number"
              min="1"
              value={minGuests}
              onChange={(e) => setMinGuests(e.target.value)}
              placeholder="1"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. New York"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
            />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={handleApplyFilters} size="sm">
            Apply Filters
          </Button>
          {hasFilters && (
            <Button variant="secondary" size="sm" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}
          {hasFilters && (
            <span className="text-xs text-blue-600 font-medium">
              Filters active
            </span>
          )}
        </div>
      </div>

      {/* Results */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
            <p className="mt-4 text-sm text-gray-500">Loading rooms...</p>
          </div>
        </div>
      ) : rooms.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <div className="text-4xl mb-3">🛏️</div>
          <h3 className="text-lg font-bold text-gray-700">No rooms found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {hasFilters
              ? 'Try adjusting or clearing your filters.'
              : 'No rooms are available right now.'}
          </p>
          {hasFilters && (
            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-700">{rooms.length}</span> room
            {rooms.length !== 1 ? 's' : ''}
            {hasFilters ? ' matching your filters' : ''}
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
