'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { hotelApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AxiosError } from 'axios';

export default function NewHotelPage() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  if (user && user.role !== 'HOTEL_OWNER' && user.role !== 'SUPER_ADMIN') {
    router.push('/access-denied');
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await hotelApi.create({ name, location });
      router.push('/hotels');
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(axiosErr.response?.data?.message ?? 'Failed to create hotel.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">🏨 Create Hotel</h1>
          <p className="mt-1 text-sm text-gray-500">Add your property to the platform</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Hotel Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Grand Horizon Hotel"
            />
            <Input
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              placeholder="New York, USA"
            />
            <Button type="submit" loading={loading} size="lg" className="w-full">
              Create Hotel
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
