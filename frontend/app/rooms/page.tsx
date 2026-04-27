'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { roomTypeApi, roomFeatureApi, RoomTypeFilters } from '@/lib/api';
import { RoomTypeGlobalResponse, RoomFeatureDto } from '@/types';
import { Button } from '@/components/ui/Button';

const FEATURE_ICON_MAP: Record<string, string> = {
  wifi: '📶',
  pool: '🏊',
  waves: '🌊',
  snowflake: '❄️',
  car: '🅿️',
  coffee: '☕',
  dumbbell: '🏋️',
  sparkles: '✨',
  bell: '🛎️',
  wine: '🍷',
  sun: '🌅',
  utensils: '🍳',
};

function FeatureTag({ feature }: { feature: RoomFeatureDto }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-100">
      <span>{FEATURE_ICON_MAP[feature.icon] || '✦'}</span>
      {feature.name}
    </span>
  );
}

function RoomTypeCard({ roomType }: { roomType: RoomTypeGlobalResponse }) {
  const { user } = useAuth();
  const router = useRouter();

  const isOwner = user?.role === 'HOTEL_OWNER';
  const isAdmin = user?.role === 'SUPER_ADMIN';

  function handleAction() {
    if (isOwner || isAdmin) {
      router.push(`/rooms/${roomType.id}`);
    } else if (!user) {
      router.push(`/login?returnUrl=${encodeURIComponent(`/booking/${roomType.id}`)}`);
    } else {
      router.push(`/booking/${roomType.id}`);
    }
  }

  return (
    <div className="group flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-900 text-base truncate">{roomType.name}</h3>
            <div className="mt-1.5 flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" /></svg>
              <span className="text-xs text-gray-500 truncate">{roomType.hotelName}</span>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0 1 15 0Z" /></svg>
              <span className="text-xs text-gray-400 truncate">{roomType.hotelLocation}</span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-2xl font-bold text-gray-900">${roomType.price}</div>
            <div className="text-xs text-gray-400 font-medium">per night</div>
          </div>
        </div>

        {roomType.features && roomType.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {roomType.features.map((f) => (
              <FeatureTag key={f.id} feature={f} />
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-100">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
            Up to {roomType.maxGuests}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-100">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
            {roomType.availableRooms} available
          </span>
        </div>
      </div>
      <div className="px-5 pb-5">
        {isOwner || isAdmin ? (
          <Button onClick={handleAction} variant="secondary" className="w-full" size="sm">
            View Details
          </Button>
        ) : (
          <Button onClick={handleAction} className="w-full" size="sm">
            {user ? 'Book Now' : 'Sign in to Book'}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function RoomsPage() {
  const { loading: authLoading } = useAuth();
  const [roomTypes, setRoomTypes] = useState<RoomTypeGlobalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [allFeatures, setAllFeatures] = useState<RoomFeatureDto[]>([]);

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minGuests, setMinGuests] = useState('');
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([]);
  const [applied, setApplied] = useState<RoomTypeFilters>({});

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    roomFeatureApi.getAll().then(setAllFeatures).catch(() => {});
  }, []);

  useEffect(() => {
    if (authLoading) return;
    fetchRoomTypes({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  const fetchRoomTypes = useCallback(async (filters: RoomTypeFilters) => {
    setLoading(true);
    setError('');
    try {
      const data = await roomTypeApi.getAll(filters);
      setRoomTypes(data);
    } catch {
      setError('Failed to load room types. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  function toggleFeature(id: string) {
    setSelectedFeatureIds((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }

  function handleApplyFilters() {
    const filters: RoomTypeFilters = {};
    if (minPrice !== '') filters.minPrice = parseFloat(minPrice);
    if (maxPrice !== '') filters.maxPrice = parseFloat(maxPrice);
    if (minGuests !== '') filters.minGuests = parseInt(minGuests, 10);
    if (location.trim() !== '') filters.location = location.trim();
    if (selectedFeatureIds.length > 0) filters.featureIds = selectedFeatureIds;
    if (checkIn) filters.checkIn = checkIn;
    if (checkOut) filters.checkOut = checkOut;
    setApplied(filters);
    fetchRoomTypes(filters);
  }

  function handleClearFilters() {
    setMinPrice('');
    setMaxPrice('');
    setMinGuests('');
    setLocation('');
    setCheckIn('');
    setCheckOut('');
    setSelectedFeatureIds([]);
    setApplied({});
    fetchRoomTypes({});
  }

  const hasFilters = Object.keys(applied).length > 0;

  return (
    <div className="min-h-[calc(100vh-64px)]">
      <div className="bg-gradient-to-br from-indigo-600 via-blue-700 to-blue-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <h1 className="text-3xl font-extrabold tracking-tight">Room Type Marketplace</h1>
          <p className="mt-2 text-blue-200 max-w-xl">
            Browse all available room types across every hotel on the platform. Filter by price, capacity, location, dates, and amenities.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" /></svg>
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Filter Room Types</h2>
            {hasFilters && (
              <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                Active
              </span>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Min Price ($/night)</label>
              <input type="number" min="0" step="0.01" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Max Price ($/night)</label>
              <input type="number" min="0" step="0.01" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Any" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Min Guests</label>
              <input type="number" min="1" value={minGuests} onChange={(e) => setMinGuests(e.target.value)} placeholder="1" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. New York" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Check-In</label>
              <input type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Check-Out</label>
              <input type="date" min={checkIn || today} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
            </div>
          </div>

          {allFeatures.length > 0 && (
            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-600 mb-2">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {allFeatures.map((feature) => {
                  const selected = selectedFeatureIds.includes(feature.id);
                  return (
                    <button
                      key={feature.id}
                      type="button"
                      onClick={() => toggleFeature(feature.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all border ${
                        selected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-300 hover:bg-indigo-50'
                      }`}
                    >
                      <span>{FEATURE_ICON_MAP[feature.icon] || '✦'}</span>
                      {feature.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <Button onClick={handleApplyFilters} size="sm">Apply Filters</Button>
            {hasFilters && (
              <Button variant="secondary" size="sm" onClick={handleClearFilters}>Clear Filters</Button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700 flex items-center gap-2">
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
              <p className="mt-4 text-sm text-gray-500">Loading room types...</p>
            </div>
          </div>
        ) : roomTypes.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white py-20 text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800">No room types found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {hasFilters ? 'Try adjusting or clearing your filters.' : 'No room types are available right now.'}
            </p>
            {hasFilters && (
              <Button variant="secondary" size="sm" className="mt-4" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-700">{roomTypes.length}</span> room type{roomTypes.length !== 1 ? 's' : ''}
                {hasFilters ? ' matching your filters' : ''}
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {roomTypes.map((rt) => (
                <RoomTypeCard key={rt.id} roomType={rt} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
