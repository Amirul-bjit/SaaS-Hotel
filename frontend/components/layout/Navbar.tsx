'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  function getDashboardLink() {
    if (!user) return null;
    const map: Record<string, string> = {
      SUPER_ADMIN: '/dashboard/admin',
      HOTEL_OWNER: '/dashboard/owner',
      CUSTOMER: '/dashboard/customer',
    };
    return map[user.role] ?? null;
  }

  const dashboardLink = getDashboardLink();

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors ${
        pathname === href
          ? 'text-blue-600'
          : 'text-gray-600 hover:text-blue-600'
      }`}
    >
      {label}
    </Link>
  );

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'bg-purple-100 text-purple-700',
    HOTEL_OWNER: 'bg-green-100 text-green-700',
    CUSTOMER: 'bg-blue-100 text-blue-700',
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-xl font-extrabold text-blue-600 tracking-tight">
          <span className="text-2xl">🏨</span> HotelBooking
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {(user.role === 'CUSTOMER' || user.role === 'HOTEL_OWNER') && navLink('/hotels', 'Hotels')}
              {(user.role === 'CUSTOMER') && navLink('/rooms', 'Browse Rooms')}
              {dashboardLink && navLink(dashboardLink, 'Dashboard')}
              <div className="hidden sm:flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-200 px-3 py-1.5">
                <span className="text-sm font-semibold text-gray-800">{user.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${roleColors[user.role] ?? 'bg-gray-100 text-gray-600'}`}>
                  {user.role.replace('_', ' ')}
                </span>
              </div>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
