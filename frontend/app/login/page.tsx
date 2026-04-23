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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
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
      setError(axiosErr.response?.data?.message ?? 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-4xl">🏨</span>
          <h1 className="mt-3 text-3xl font-extrabold text-gray-900">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <span className="text-red-500 text-sm font-medium">{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <Button type="submit" loading={loading} size="lg" className="mt-1 w-full">
              Sign In
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Demo accounts</p>
          <div className="flex flex-col gap-1.5">
            {[
              { role: 'Super Admin', email: 'superadmin@hotelbooking.com', password: 'Admin@123', color: 'text-purple-700' },
              { role: 'Hotel Owner', email: 'owner@hotelbooking.com', password: 'Owner@123', color: 'text-green-700' },
              { role: 'Customer', email: 'customer@hotelbooking.com', password: 'Customer@123', color: 'text-blue-700' },
            ].map((c) => (
              <button
                key={c.role}
                type="button"
                onClick={() => { setEmail(c.email); setPassword(c.password); }}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-xs hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
              >
                <span className={`font-bold ${c.color}`}>{c.role}</span>
                <span className="text-gray-500 font-mono">{c.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
