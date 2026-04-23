'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api';
import { buildAuthUser } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AxiosError } from 'axios';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'HOTEL_OWNER'>('CUSTOMER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.register({ name, email, password, role });
      const authUser = buildAuthUser(data.token, data.name, data.email, data.role);
      login(authUser);
      const map: Record<string, string> = {
        SUPER_ADMIN: '/dashboard/admin',
        HOTEL_OWNER: '/dashboard/owner',
        CUSTOMER: '/dashboard/customer',
      };
      router.push(map[data.role] ?? '/');
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(axiosErr.response?.data?.message ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-4xl">🏨</span>
          <h1 className="mt-3 text-3xl font-extrabold text-gray-900">Create an account</h1>
          <p className="mt-1 text-sm text-gray-500">Start booking or managing hotels today</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {error && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
            />
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Account Type</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'CUSTOMER' | 'HOTEL_OWNER')}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="CUSTOMER">Customer — Browse &amp; book hotels</option>
                <option value="HOTEL_OWNER">Hotel Owner — Manage your property</option>
              </select>
            </div>
            <Button type="submit" loading={loading} size="lg" className="mt-1 w-full">
              Create Account
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

