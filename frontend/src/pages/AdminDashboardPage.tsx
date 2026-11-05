import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck,
  Users,
  Sparkles,
  TrendingUp,
  Search,
  PlusCircle,
  Award,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Filter,
} from 'lucide-react';
import { adminApi } from '../services/admin';
import { AdminUserListItem } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { useToast } from '../context/ToastContext';

export const AdminDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { error, success } = useToast();

  const [search, setSearch] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('all');
  const [page, setPage] = useState(1);

  // Modal states
  const [activeUserForCredits, setActiveUserForCredits] = useState<AdminUserListItem | null>(null);
  const [bonusAmount, setBonusAmount] = useState<number>(25);
  const [customLimit, setCustomLimit] = useState<string>('');

  const [activeUserForPlan, setActiveUserForPlan] = useState<AdminUserListItem | null>(null);
  const [targetPlan, setTargetPlan] = useState<string>('growth');

  // Queries
  const { data: metrics, isLoading: isMetricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ['adminMetrics'],
    queryFn: () => adminApi.getMetrics(),
  });

  const { data: usersData, isLoading: isUsersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['adminUsers', search, selectedPlan, page],
    queryFn: () => adminApi.getUsers({ search, plan: selectedPlan, page, page_size: 15 }),
  });

  // Handle Grant Credits
  const handleGrantCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUserForCredits) return;

    try {
      const payload: { bonus_credits: number; custom_monthly_limit?: number } = {
        bonus_credits: Number(bonusAmount) || 0,
      };
      if (customLimit.trim()) {
        payload.custom_monthly_limit = Number(customLimit);
      }

      await adminApi.grantCredits(activeUserForCredits.id, payload);
      success(`Granted ${bonusAmount} bonus credits to ${activeUserForCredits.email}!`);
      setActiveUserForCredits(null);
      setCustomLimit('');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
    } catch (err: any) {
      error(err.message || 'Failed to update user credits.');
    }
  };

  // Handle Update Plan
  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUserForPlan) return;

    try {
      await adminApi.updatePlan(activeUserForPlan.id, targetPlan);
      success(`Updated ${activeUserForPlan.email} to ${targetPlan.toUpperCase()} plan.`);
      setActiveUserForPlan(null);
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
    } catch (err: any) {
      error(err.message || 'Failed to update plan.');
    }
  };

  // Handle Toggle User Status
  const handleToggleStatus = async (user: AdminUserListItem) => {
    try {
      await adminApi.updateStatus(user.id, !user.is_active);
      success(`User account ${!user.is_active ? 'activated' : 'deactivated'}.`);
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    } catch (err: any) {
      error(err.message || 'Failed to update status.');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#E5DFD3] pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#DCEBE3] text-[#1F7A5C] rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1F7A5C]">
              Platform Owner Console
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#2B2B2B] mt-1">
            Credit Management & User Monitoring
          </h1>
          <p className="text-xs text-[#7A7468] mt-1 font-sans">
            Monitor subscriber activity, grant credit allowances, and configure studio tiers in real-time.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshCw className={`w-3.5 h-3.5 ${isMetricsLoading ? 'animate-spin' : ''}`} />}
          onClick={() => {
            refetchMetrics();
            refetchUsers();
          }}
        >
          Refresh All Data
        </Button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Users */}
        <div className="bg-white border border-[#E5DFD3] rounded-3xl p-5 shadow-soft">
          <div className="flex items-center justify-between text-[#7A7468]">
            <span className="text-xs font-semibold uppercase tracking-wider">Registered Accounts</span>
            <Users className="w-4 h-4 text-[#1F7A5C]" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-serif font-bold text-[#2B2B2B]">
              {metrics?.total_users ?? 0}
            </span>
            <span className="text-xs text-[#1F7A5C] ml-2 font-medium">
              ({metrics?.active_users ?? 0} active)
            </span>
          </div>
          <p className="text-[11px] text-[#7A7468] mt-1">Total business accounts registered</p>
        </div>

        {/* Total Businesses */}
        <div className="bg-white border border-[#E5DFD3] rounded-3xl p-5 shadow-soft">
          <div className="flex items-center justify-between text-[#7A7468]">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Studios</span>
            <Award className="w-4 h-4 text-[#EE6A4B]" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-serif font-bold text-[#2B2B2B]">
              {metrics?.total_businesses ?? 0}
            </span>
          </div>
          <p className="text-[11px] text-[#7A7468] mt-1">Businesses with completed profiles</p>
        </div>

        {/* Month Generations */}
        <div className="bg-white border border-[#E5DFD3] rounded-3xl p-5 shadow-soft">
          <div className="flex items-center justify-between text-[#7A7468]">
            <span className="text-xs font-semibold uppercase tracking-wider">Replies This Month</span>
            <Sparkles className="w-4 h-4 text-[#1F7A5C]" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-serif font-bold text-[#2B2B2B]">
              {metrics?.total_generations_month ?? 0}
            </span>
            <span className="text-xs text-[#7A7468] ml-2">credits consumed</span>
          </div>
          <p className="text-[11px] text-[#7A7468] mt-1">
            Total all-time: <strong>{metrics?.total_generations_all_time ?? 0}</strong>
          </p>
        </div>

        {/* Plan Breakdown */}
        <div className="bg-white border border-[#E5DFD3] rounded-3xl p-5 shadow-soft">
          <div className="flex items-center justify-between text-[#7A7468]">
            <span className="text-xs font-semibold uppercase tracking-wider">Plan Distribution</span>
            <TrendingUp className="w-4 h-4 text-[#2B2B2B]" />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-[#E5DFD3] font-semibold text-[#2B2B2B]">
              Free: {metrics?.plan_distribution?.free ?? 0}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#DCEBE3] font-semibold text-[#1F7A5C]">
              Growth: {metrics?.plan_distribution?.growth ?? 0}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#FEEAE4] font-semibold text-[#EE6A4B]">
              Pro: {metrics?.plan_distribution?.pro ?? 0}
            </span>
          </div>
          <p className="text-[11px] text-[#7A7468] mt-2">Active tier breakdown</p>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 sm:p-8 shadow-soft space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#2B2B2B]">User Accounts & Credit Balances</h2>
            <p className="text-xs text-[#7A7468]">
              Inspect usage meters, grant bonus credits, and adjust subscriber tier levels.
            </p>
          </div>

          {/* Search & Plan Filter */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-[#7A7468] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search email or business..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E5DFD3] rounded-xl focus:outline-none focus:border-[#1F7A5C]"
              />
            </div>

            <select
              value={selectedPlan}
              onChange={(e) => {
                setSelectedPlan(e.target.value);
                setPage(1);
              }}
              className="text-xs py-1.5 px-3 bg-[#FAF8F5] border border-[#E5DFD3] rounded-xl focus:outline-none text-[#2B2B2B]"
            >
              <option value="all">All Plans</option>
              <option value="free">Free Starter</option>
              <option value="growth">Growth</option>
              <option value="pro">Pro Studio</option>
            </select>
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5DFD3] text-[#7A7468] font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">User & Email</th>
                <th className="py-3 px-3">Business Studio</th>
                <th className="py-3 px-3">Plan Tier</th>
                <th className="py-3 px-3">Monthly Usage & Allowance</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DFD3]">
              {isUsersLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#7A7468]">
                    Loading user records...
                  </td>
                </tr>
              ) : (usersData?.items || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#7A7468]">
                    No accounts found matching your query.
                  </td>
                </tr>
              ) : (
                usersData?.items.map((u) => {
                  const totalAllowance = u.monthly_limit + u.bonus_credits;
                  const percentage = Math.min(100, Math.round((u.used_month / totalAllowance) * 100));

                  return (
                    <tr key={u.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[#2B2B2B] flex items-center gap-1.5">
                          <span>{u.email}</span>
                          {u.is_admin && (
                            <span className="text-[10px] bg-[#DCEBE3] text-[#1F7A5C] px-1.5 py-0.5 rounded font-bold">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#7A7468]">
                          Joined {new Date(u.created_at).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {u.business_name ? (
                          <div>
                            <div className="font-medium text-[#2B2B2B]">{u.business_name}</div>
                            <div className="text-[11px] text-[#7A7468]">{u.category}</div>
                          </div>
                        ) : (
                          <span className="text-[#7A7468] italic text-[11px]">No profile yet</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                            u.plan === 'pro'
                              ? 'bg-[#FEEAE4] text-[#EE6A4B] border border-[#F9DBAF]'
                              : u.plan === 'growth'
                              ? 'bg-[#DCEBE3] text-[#1F7A5C] border border-[#BEE0D0]'
                              : 'bg-[#FAF8F5] text-[#2B2B2B] border border-[#E5DFD3]'
                          }`}
                        >
                          {u.plan}
                        </span>
                        {u.bonus_credits > 0 && (
                          <span className="block text-[10px] text-[#1F7A5C] font-semibold mt-0.5">
                            +{u.bonus_credits} bonus credits
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 min-w-[160px]">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-semibold text-[#2B2B2B]">
                            {u.used_month} / {totalAllowance}
                          </span>
                          <span className="text-[#1F7A5C] font-semibold">
                            {u.remaining} left
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#E5DFD3] rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              percentage > 85 ? 'bg-[#EE6A4B]' : 'bg-[#1F7A5C]'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            u.is_active
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-red-50 text-red-700 hover:bg-red-100'
                          }`}
                        >
                          {u.is_active ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-red-600" /> Deactivated
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-3 text-right space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<PlusCircle className="w-3 h-3 text-[#1F7A5C]" />}
                          onClick={() => setActiveUserForCredits(u)}
                        >
                          + Credits
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setActiveUserForPlan(u);
                            setTargetPlan(u.plan);
                          }}
                        >
                          Tier
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {(usersData?.total_pages || 1) > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-[#E5DFD3] text-xs">
            <span className="text-[#7A7468]">
              Showing page {page} of {usersData?.total_pages} ({usersData?.total} total accounts)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= (usersData?.total_pages || 1)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Grant Credits Modal */}
      {activeUserForCredits && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-soft space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1F7A5C]">
                Credit Grant Studio
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#2B2B2B] mt-1">
                Grant Allowance Credits
              </h3>
              <p className="text-xs text-[#7A7468] mt-1">
                Adding credits to <strong className="text-[#2B2B2B]">{activeUserForCredits.email}</strong>. Bonus credits never expire and stack on top of the monthly tier.
              </p>
            </div>

            <form onSubmit={handleGrantCredits} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2B2B2B] mb-1.5">
                  Bonus Credits to Add
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[10, 25, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setBonusAmount(amt)}
                      className={`py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                        bonusAmount === amt
                          ? 'bg-[#1F7A5C] text-white border-[#1F7A5C]'
                          : 'bg-[#FAF8F5] text-[#2B2B2B] border-[#E5DFD3] hover:border-[#1F7A5C]'
                      }`}
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
                <Input
                  type="number"
                  min="0"
                  max="5000"
                  value={bonusAmount}
                  onChange={(e) => setBonusAmount(Number(e.target.value))}
                  helperText="Custom bonus quantity to deposit directly into user balance"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B2B2B] mb-1.5">
                  Custom Monthly Limit Override (Optional)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 200 (Leave blank to keep plan default)"
                  value={customLimit}
                  onChange={(e) => setCustomLimit(e.target.value)}
                  helperText="Overrides the plan limit every month for VIP users"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5DFD3]">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setActiveUserForCredits(null);
                    setCustomLimit('');
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Confirm Credit Deposit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Plan Modal */}
      {activeUserForPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-soft space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#EE6A4B]">
                Plan Administration
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#2B2B2B] mt-1">
                Change Subscriber Tier
              </h3>
              <p className="text-xs text-[#7A7468] mt-1">
                Adjusting tier for <strong className="text-[#2B2B2B]">{activeUserForPlan.email}</strong>.
              </p>
            </div>

            <form onSubmit={handleUpdatePlan} className="space-y-4">
              <div className="space-y-2">
                {[
                  { id: 'free', name: 'Free Starter', desc: '10 generations / month', badge: 'Free' },
                  { id: 'growth', name: 'Growth Studio', desc: '100 generations / month', badge: 'Standard' },
                  { id: 'pro', name: 'Pro Studio Unlimited', desc: '500 generations / month', badge: 'Enterprise' },
                ].map((tier) => (
                  <label
                    key={tier.id}
                    className={`flex items-start justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      targetPlan === tier.id
                        ? 'border-[#1F7A5C] bg-[#DCEBE3]/30 shadow-2xs'
                        : 'border-[#E5DFD3] bg-[#FAF8F5] hover:border-[#1F7A5C]/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="plan_choice"
                        value={tier.id}
                        checked={targetPlan === tier.id}
                        onChange={() => setTargetPlan(tier.id)}
                        className="text-[#1F7A5C] focus:ring-[#1F7A5C]"
                      />
                      <div>
                        <div className="font-semibold text-xs text-[#2B2B2B]">{tier.name}</div>
                        <div className="text-[11px] text-[#7A7468]">{tier.desc}</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-white border border-[#E5DFD3] text-[#2B2B2B]">
                      {tier.badge}
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5DFD3]">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setActiveUserForPlan(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Tier Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
