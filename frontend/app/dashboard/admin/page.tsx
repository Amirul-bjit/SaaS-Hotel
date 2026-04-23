'use client';

import { useEffect, useState } from 'react';
import { hotelApi, bookingApi, subscriptionApi } from '@/lib/api';
import { HotelResponse, BookingResponse, SubscriptionResponse } from '@/types';

function StatCard({ label, value, color, sub }: { label: string; value: number | string; color: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className={`text-4xl font-extrabold ${color}`}>{value}</div>
      <div className="mt-1 text-sm font-semibold text-gray-600">{label}</div>
      {sub && <div className="mt-1 text-xs text-gray-400">{sub}</div>}
    </div>
  );
}

function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <div className="w-28 shrink-0 text-right text-xs font-medium text-gray-500 truncate">{d.label}</div>
          <div className="flex-1 rounded-full bg-gray-100 h-5 overflow-hidden">
            <div className={`h-full rounded-full transition-all ${d.color}`} style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
          <div className="w-8 text-xs font-bold text-gray-700">{d.value}</div>
        </div>
      ))}
    </div>
  );
}

function DonutStat({ pct, color, label }: { pct: number; color: string; label: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 45 45)" />
        <text x="45" y="50" textAnchor="middle" fontSize="14" fontWeight="700" fill="#111827">{pct}%</text>
      </svg>
      <span className="text-xs font-medium text-gray-500">{label}</span>
    </div>
  );
}

export default function AdminDashboard() {
  const [hotels, setHotels] = useState<HotelResponse[]>([]);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [subscriptions, setSubscriptions] = useState<Record<string, SubscriptionResponse>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [h, b] = await Promise.all([hotelApi.getAll(), bookingApi.getAll()]);
        setHotels(h);
        setBookings(b);
        const subMap: Record<string, SubscriptionResponse> = {};
        await Promise.all(h.map(async (hotel) => {
          try { subMap[hotel.id] = await subscriptionApi.get(hotel.id); } catch {}
        }));
        setSubscriptions(subMap);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalHotels = hotels.length;
  const totalBookings = bookings.length;
  const activeSubs = Object.keys(subscriptions).length;
  const confirmed = bookings.filter((b) => b.status === 'Confirmed').length;
  const cancelled = bookings.filter((b) => b.status === 'Cancelled').length;
  const pending = bookings.filter((b) => b.status === 'Pending').length;
  const planCounts = { Basic: 0, Standard: 0, Premium: 0 };
  Object.values(subscriptions).forEach((s) => {
    const p = s.planType as keyof typeof planCounts;
    if (p in planCounts) planCounts[p]++;
  });
  const confirmedPct = totalBookings ? Math.round((confirmed / totalBookings) * 100) : 0;
  const subCovPct = totalHotels ? Math.round((activeSubs / totalHotels) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Platform Overview</h1>
        <p className="mt-1 text-sm text-gray-500">Real-time statistics across the hotel network</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Hotels" value={totalHotels} color="text-blue-600" sub="Registered properties" />
        <StatCard label="Total Bookings" value={totalBookings} color="text-green-600" sub="All time" />
        <StatCard label="Active Subscriptions" value={activeSubs} color="text-purple-600" sub={`${subCovPct}% hotel coverage`} />
        <StatCard label="Confirmed Bookings" value={confirmed} color="text-emerald-600" sub={`${confirmedPct}% success rate`} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-800 mb-5">Booking Status Breakdown</h2>
          <BarChart data={[
            { label: 'Confirmed', value: confirmed, color: 'bg-emerald-500' },
            { label: 'Pending', value: pending, color: 'bg-amber-400' },
            { label: 'Cancelled', value: cancelled, color: 'bg-red-400' },
          ]} />
          <div className="mt-5 flex gap-6 border-t border-gray-100 pt-4">
            {[{ label: 'Confirmed', val: confirmed, dot: 'bg-emerald-500' }, { label: 'Pending', val: pending, dot: 'bg-amber-400' }, { label: 'Cancelled', val: cancelled, dot: 'bg-red-400' }].map((x) => (
              <div key={x.label} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className={`h-2.5 w-2.5 rounded-full ${x.dot}`} />{x.label}: <span className="font-bold text-gray-800">{x.val}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-800 mb-5">Subscription Plans</h2>
          <BarChart data={[
            { label: 'Basic', value: planCounts.Basic, color: 'bg-gray-400' },
            { label: 'Standard', value: planCounts.Standard, color: 'bg-blue-500' },
            { label: 'Premium', value: planCounts.Premium, color: 'bg-purple-500' },
          ]} />
          <div className="mt-5 flex gap-6 border-t border-gray-100 pt-4">
            {[{ label: 'Basic', val: planCounts.Basic, dot: 'bg-gray-400' }, { label: 'Standard', val: planCounts.Standard, dot: 'bg-blue-500' }, { label: 'Premium', val: planCounts.Premium, dot: 'bg-purple-500' }].map((x) => (
              <div key={x.label} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className={`h-2.5 w-2.5 rounded-full ${x.dot}`} />{x.label}: <span className="font-bold text-gray-800">{x.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-800 mb-6">Health Indicators</h2>
        <div className="flex flex-wrap gap-10 justify-around">
          <DonutStat pct={confirmedPct} color="#10b981" label="Booking Success Rate" />
          <DonutStat pct={subCovPct} color="#8b5cf6" label="Subscription Coverage" />
          <DonutStat pct={totalBookings ? Math.round((pending / totalBookings) * 100) : 0} color="#f59e0b" label="Pending Rate" />
          <DonutStat pct={totalBookings ? Math.round((cancelled / totalBookings) * 100) : 0} color="#ef4444" label="Cancellation Rate" />
        </div>
      </div>
    </div>
  );
}
