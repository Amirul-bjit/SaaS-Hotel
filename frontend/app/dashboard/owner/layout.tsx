'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { subscriptionApi } from '@/lib/api';
import { SubscriptionResponse } from '@/types';
import React, { useEffect, useState } from 'react';

const navItems = [
  { href: '/dashboard/owner', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/owner/hotel', label: 'My Hotel', icon: '🏨' },
  { href: '/dashboard/owner/room-types', label: 'Room Types', icon: '🏷️' },
  { href: '/dashboard/owner/rooms', label: 'Rooms', icon: '🛏️' },
  { href: '/dashboard/owner/bookings', label: 'Bookings', icon: '📋' },
  { href: '/dashboard/owner/subscription', label: 'Subscription', icon: '💳' },
];

function SubscriptionWarningBanner({ subscription }: { subscription: SubscriptionResponse }) {
  const isExpired = new Date(subscription.expiryDate) < new Date();

  if (!subscription.isActive) {
    return (
      <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
        ⚠️ Your subscription is inactive. Room creation and bookings are blocked. Contact the administrator to reactivate.
      </div>
    );
  }

  if (subscription.isInGracePeriod) {
    const daysLeft = 7 + subscription.daysUntilExpiry; // daysUntilExpiry is negative when expired
    return (
      <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
        🚨 Your subscription expired! You have <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong> left in the grace period before your hotel is deactivated.{' '}
        <Link href="/dashboard/owner/subscription" className="underline font-bold">Renew now</Link>
      </div>
    );
  }

  if (subscription.daysUntilExpiry <= 7 && subscription.daysUntilExpiry >= 0) {
    return (
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
        ⚠️ Your subscription expires in <strong>{subscription.daysUntilExpiry} day{subscription.daysUntilExpiry !== 1 ? 's' : ''}</strong>.{' '}
        <Link href="/dashboard/owner/subscription" className="underline font-bold">Renew now</Link> to avoid service interruption.
      </div>
    );
  }

  return null;
}

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);

  useEffect(() => {
    if (loading || !user?.hotelId) return;
    subscriptionApi.get(user.hotelId).then(setSubscription).catch(() => {});
  }, [user, loading]);

  if (!loading && (!user || user.role !== 'HOTEL_OWNER')) {
    router.push(user ? '/access-denied' : '/login');
    return null;
  }

  return (
    <div className="flex min-h-[calc(100vh-57px)]">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r border-gray-200 bg-white">
        <div className="px-5 py-6 border-b border-gray-100">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-400">Owner Portal</h2>
          {user && (
            <p className="mt-1 text-sm font-semibold text-gray-700 truncate">{user.name}</p>
          )}
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard/owner' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white flex justify-around px-1 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard/owner' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs font-medium rounded-lg transition-colors ${
                isActive ? 'text-blue-700' : 'text-gray-500'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="truncate max-w-[60px]">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 pb-20 md:pb-0">
        {subscription && <SubscriptionWarningBanner subscription={subscription} />}
        {children}
      </main>
    </div>
  );
}
