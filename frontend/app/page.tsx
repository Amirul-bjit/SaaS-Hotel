'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function LandingPage() {
  const { user } = useAuth();

  function getDashboardLink() {
    if (!user) return '/login';
    const map: Record<string, string> = {
      SUPER_ADMIN: '/dashboard/admin',
      HOTEL_OWNER: '/dashboard/owner',
      CUSTOMER: '/dashboard/customer',
    };
    return map[user.role] ?? '/login';
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-24 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight">
            Hotel Booking Platform
          </h1>
          <p className="mb-8 text-xl text-blue-100">
            A modern SaaS platform for hotel owners and travelers. Manage hotels,
            rooms, and bookings — all in one place.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {user ? (
              <Link href={getDashboardLink()}>
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                    Get Started
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="border border-white text-white hover:bg-white/10"
                  >
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-800">
            Everything you need
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <div className="mb-3 text-3xl">🏨</div>
              <h3 className="mb-2 text-lg font-semibold text-gray-800">Hotel Management</h3>
              <p className="text-sm text-gray-500">
                Hotel owners can manage their property, add rooms, and track bookings.
              </p>
            </Card>
            <Card>
              <div className="mb-3 text-3xl">📅</div>
              <h3 className="mb-2 text-lg font-semibold text-gray-800">Easy Booking</h3>
              <p className="text-sm text-gray-500">
                Customers can browse rooms, select dates, and confirm bookings instantly.
              </p>
            </Card>
            <Card>
              <div className="mb-3 text-3xl">📊</div>
              <h3 className="mb-2 text-lg font-semibold text-gray-800">Admin Control</h3>
              <p className="text-sm text-gray-500">
                Super admins get full visibility across all hotels, users, and subscriptions.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Credentials */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-800">
            Demo Credentials
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { role: 'Super Admin', email: 'superadmin@hotelbooking.com', password: 'Admin@123', badge: 'bg-purple-100 text-purple-700' },
              { role: 'Hotel Owner', email: 'owner@hotelbooking.com', password: 'Owner@123', badge: 'bg-green-100 text-green-700' },
              { role: 'Hotel Owner 2', email: 'owner2@hotelbooking.com', password: 'Owner@123', badge: 'bg-green-100 text-green-700' },
              { role: 'Hotel Owner 3', email: 'owner3@hotelbooking.com', password: 'Owner@123', badge: 'bg-green-100 text-green-700' },
              { role: 'Customer', email: 'customer@hotelbooking.com', password: 'Customer@123', badge: 'bg-blue-100 text-blue-700' },
            ].map((cred) => (
              <Card key={cred.email} className="text-sm">
                <div className={`mb-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${cred.badge}`}>{cred.role}</div>
                <div className="text-gray-700 font-medium">{cred.email}</div>
                <div className="text-gray-400 text-xs mt-0.5">{cred.password}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Room Marketplace CTA */}
      <section className="bg-gradient-to-br from-indigo-50 to-blue-50 py-16 border-t border-indigo-100">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="text-4xl mb-4">🌍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Global Room Marketplace
          </h2>
          <p className="text-gray-500 mb-6">
            Browse all available rooms across every hotel. Filter by price, capacity, and location.
          </p>
          <Link href="/rooms">
            <Button size="lg">
              Explore Rooms
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

