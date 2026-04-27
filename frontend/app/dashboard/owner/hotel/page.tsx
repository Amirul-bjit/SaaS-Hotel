'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { hotelApi } from '@/lib/api';
import { HotelResponse } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function OwnerHotelPage() {
  const { user, loading: authLoading } = useAuth();
  const [hotel, setHotel] = useState<HotelResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading || !user) return;
    if (!user.hotelId) { setLoading(false); return; }

    async function load() {
      try {
        const data = await hotelApi.getById(user!.hotelId!);
        setHotel(data);
      } catch {
        setError('Failed to load hotel details.');
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

  return (
    <div className="px-6 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">My Hotel</h1>
        <p className="mt-1 text-sm text-gray-500">View and manage your hotel details</p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
      )}

      {hotel ? (
        <Card>
          <div className="space-y-5">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Hotel Name</div>
              <div className="mt-1 text-xl font-bold text-gray-900">{hotel.name}</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Location</div>
              <div className="mt-1 text-base text-gray-700 flex items-center gap-1">
                <span>📍</span> {hotel.location}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Hotel ID</div>
              <div className="mt-1 font-mono text-sm text-gray-500">{hotel.id}</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Owner ID</div>
              <div className="mt-1 font-mono text-sm text-gray-500">{hotel.ownerId}</div>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🏨</div>
            <p className="text-gray-600 mb-4">You haven't created a hotel yet.</p>
            <Link href="/hotels/new">
              <Button>Create Hotel</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
