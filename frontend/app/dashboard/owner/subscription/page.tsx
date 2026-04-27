'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { subscriptionApi } from '@/lib/api';
import { SubscriptionResponse } from '@/types';
import { Card } from '@/components/ui/Card';

export default function OwnerSubscriptionPage() {
  const { user, loading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading || !user?.hotelId) {
      if (!authLoading) setLoading(false);
      return;
    }

    async function load() {
      try {
        const sub = await subscriptionApi.get(user!.hotelId!);
        setSubscription(sub);
      } catch {
        setSubscription(null);
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

  const isExpired = subscription ? new Date(subscription.expiryDate) < new Date() : false;

  return (
    <div className="px-6 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Subscription</h1>
        <p className="mt-1 text-sm text-gray-500">Your current subscription plan details</p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
      )}

      {subscription ? (
        <>
          {(isExpired || !subscription.isActive) && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
              ⚠️ {isExpired ? 'Your subscription has expired.' : 'Your subscription is inactive.'} Contact the administrator to renew.
            </div>
          )}

          <Card>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Plan</div>
                <div className="mt-1">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${
                    subscription.planType === 'Premium' ? 'bg-purple-100 text-purple-700' :
                    subscription.planType === 'Standard' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {subscription.planType}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Status</div>
                <div className="mt-1">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${
                    subscription.isActive && !isExpired
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {!subscription.isActive ? 'Inactive' : isExpired ? 'Expired' : 'Active'}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Billing Cycle</div>
                <div className="mt-1 text-lg font-bold text-gray-900">{subscription.billingCycle}</div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Expiry Date</div>
                <div className={`mt-1 text-lg font-bold ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                  {new Date(subscription.expiryDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Start Date</div>
                <div className="mt-1 text-base text-gray-700">{new Date(subscription.startDate).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Last Payment</div>
                <div className="mt-1 text-base text-gray-700">
                  ${subscription.lastPaymentAmount}
                  {subscription.lastPaymentDate && (
                    <span className="text-xs text-gray-400 ml-2">
                      on {new Date(subscription.lastPaymentDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {subscription.planConfig && (
            <Card className="mt-6" title="Plan Features">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Max Rooms</div>
                  <div className="mt-1 text-lg font-bold text-gray-900">
                    {subscription.planConfig.maxRooms ?? 'Unlimited'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Monthly Price</div>
                  <div className="mt-1 text-lg font-bold text-gray-900">${subscription.planConfig.monthlyPrice}</div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Yearly Price</div>
                  <div className="mt-1 text-lg font-bold text-gray-900">${subscription.planConfig.yearlyPrice}</div>
                </div>
              </div>
              {subscription.planConfig.description && (
                <p className="mt-4 text-sm text-gray-600">{subscription.planConfig.description}</p>
              )}
            </Card>
          )}
        </>
      ) : (
        <Card>
          <div className="text-center py-8">
            <div className="text-5xl mb-4">💳</div>
            <p className="text-gray-600">No subscription found for your hotel.</p>
            <p className="mt-2 text-sm text-gray-400">Contact the platform administrator to set up a subscription.</p>
          </div>
        </Card>
      )}
    </div>
  );
}
