'use client';

import { useEffect, useState } from 'react';
import { planConfigApi } from '@/lib/api';
import { PlanConfigResponse, SubscriptionPlan, UpsertPlanConfigRequest } from '@/types';

const PLANS: SubscriptionPlan[] = ['Basic', 'Standard', 'Premium'];

const planMeta: Record<SubscriptionPlan, { color: string; badge: string }> = {
  Basic:    { color: 'border-gray-300',  badge: 'bg-gray-100 text-gray-700' },
  Standard: { color: 'border-blue-400',  badge: 'bg-blue-100 text-blue-700' },
  Premium:  { color: 'border-purple-500', badge: 'bg-purple-100 text-purple-700' },
};

const empty = (plan: SubscriptionPlan): UpsertPlanConfigRequest => ({
  planType: plan,
  maxRooms: null,
  monthlyPrice: 0,
  yearlyPrice: 0,
  description: '',
});

function PlanCard({
  plan,
  config,
  onSave,
}: {
  plan: SubscriptionPlan;
  config: PlanConfigResponse | undefined;
  onSave: (data: UpsertPlanConfigRequest) => Promise<void>;
}) {
  const [editing, setEditing] = useState(!config);
  const [form, setForm] = useState<UpsertPlanConfigRequest>(
    config
      ? {
          planType: config.planType,
          maxRooms: config.maxRooms,
          monthlyPrice: config.monthlyPrice,
          yearlyPrice: config.yearlyPrice,
          description: config.description,
        }
      : empty(plan)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // sync if config loads later
  useEffect(() => {
    if (config) {
      setForm({
        planType: config.planType,
        maxRooms: config.maxRooms,
        monthlyPrice: config.monthlyPrice,
        yearlyPrice: config.yearlyPrice,
        description: config.description,
      });
    }
  }, [config]);

  const meta = planMeta[plan];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSave(form);
      setEditing(false);
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`rounded-xl border-2 ${meta.color} bg-white shadow-sm overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${meta.badge}`}>{plan}</span>
          {config ? (
            <span className="text-xs text-green-600 font-medium">Configured</span>
          ) : (
            <span className="text-xs text-amber-500 font-medium">Not configured</span>
          )}
        </div>
        {config && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
          >
            Edit
          </button>
        )}
      </div>

      {/* View mode */}
      {config && !editing && (
        <div className="px-6 py-5 space-y-3">
          <p className="text-sm text-gray-600">{config.description || <span className="italic text-gray-400">No description</span>}</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <div className="text-lg font-extrabold text-gray-800">${config.monthlyPrice}</div>
              <div className="text-xs text-gray-500 mt-0.5">/ month</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <div className="text-lg font-extrabold text-gray-800">${config.yearlyPrice}</div>
              <div className="text-xs text-gray-500 mt-0.5">/ year</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <div className="text-lg font-extrabold text-gray-800">
                {config.maxRooms ?? <span className="text-green-600">∞</span>}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">max rooms</div>
            </div>
          </div>
        </div>
      )}

      {/* Edit / create form */}
      {editing && (
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
            <textarea
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              rows={2}
              placeholder="Describe what this plan includes..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Monthly Price ($)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.monthlyPrice}
                onChange={(e) => setForm({ ...form, monthlyPrice: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Yearly Price ($)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.yearlyPrice}
                onChange={(e) => setForm({ ...form, yearlyPrice: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Max Rooms{' '}
              <span className="font-normal text-gray-400">(leave empty for unlimited)</span>
            </label>
            <input
              type="number"
              min={1}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Unlimited"
              value={form.maxRooms ?? ''}
              onChange={(e) =>
                setForm({ ...form, maxRooms: e.target.value === '' ? null : parseInt(e.target.value) })
              }
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition"
            >
              {saving ? 'Saving…' : config ? 'Update Plan' : 'Create Plan'}
            </button>
            {config && (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

export default function SubscriptionPlansPage() {
  const [configs, setConfigs] = useState<PlanConfigResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    planConfigApi.getAll().then(setConfigs).finally(() => setLoading(false));
  }, []);

  async function handleSave(data: UpsertPlanConfigRequest) {
    const result = await planConfigApi.upsert(data);
    setConfigs((prev) => {
      const exists = prev.some((c) => c.planType === result.planType);
      return exists
        ? prev.map((c) => (c.planType === result.planType ? result : c))
        : [...prev, result];
    });
  }

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
        <h1 className="text-2xl font-extrabold text-gray-900">Subscription Plans</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure the terms, pricing, and room limits for each subscription tier.
        </p>
      </div>

      {/* Summary strip */}
      <div className="mb-6 flex gap-3">
        {PLANS.map((p) => {
          const c = configs.find((x) => x.planType === p);
          return (
            <div key={p} className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium ${planMeta[p].badge}`}>
              <span className={`h-2 w-2 rounded-full ${c ? 'bg-green-400' : 'bg-gray-300'}`} />
              {p} {c ? '✓' : '— not set'}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan}
            plan={plan}
            config={configs.find((c) => c.planType === plan)}
            onSave={handleSave}
          />
        ))}
      </div>
    </div>
  );
}
