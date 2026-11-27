import React, { useState } from 'react';
import { ExpenseItem, BudgetConfig, CategoryType, PaymentMethodType, AIInsight } from '../types';
import { formatCurrency, formatDateLabel, getTodayDateStr } from '../utils/storage';
import { CATEGORIES, LOGO_FRONT_URL } from '../utils/constants';
import { soundEngine } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface DashboardOverviewProps {
  expenses: ExpenseItem[];
  budgetConfig: BudgetConfig;
  selectedMonthYear: string;
  onAddExpense: (expense: Omit<ExpenseItem, 'id' | 'createdAt'>) => void;
  onDeleteExpense: (id: string) => void;
  onViewAllClick: () => void;
  onOpenReceiptScanner: () => void;
  aiInsight: AIInsight | null;
  isLoadingInsight: boolean;
  onRefreshInsight: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  expenses,
  budgetConfig,
  selectedMonthYear,
  onAddExpense,
  onDeleteExpense,
  onViewAllClick,
  onOpenReceiptScanner,
  aiInsight,
  isLoadingInsight,
  onRefreshInsight,
}) => {
  // Quick Add State
  const [quickAmount, setQuickAmount] = useState('');
  const [quickMerchant, setQuickMerchant] = useState('');
  const [quickCategory, setQuickCategory] = useState<CategoryType>('Food & Dining');
  const [quickPaymentMethod, setQuickPaymentMethod] = useState<PaymentMethodType>('UPI');
  const [searchQuery, setSearchQuery] = useState('');
  const [chartMode, setChartMode] = useState<'weekly' | 'monthly'>('weekly');

  // Filter expenses for selected month
  const monthExpenses = expenses.filter((e) => e.date.startsWith(selectedMonthYear));

  // Compute Aggregates
  const totalSpent = monthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalBudget = budgetConfig.totalBudget;
  const remaining = totalBudget - totalSpent;
  const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Today's Spend
  const todayStr = getTodayDateStr();
  const todayExpenses = expenses.filter((e) => e.date === todayStr);
  const todaySpend = todayExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Status checks
  const isOverBudget = totalBudget > 0 ? remaining < 0 : totalSpent > 0;
  const isWarningBudget = totalBudget > 0 && percentUsed >= (budgetConfig.warningThresholdPercent || 80);
  const isLowBalance = totalBudget > 0 && remaining <= (budgetConfig.lowBalanceThreshold || 5000) && remaining > 0;

  // Chart data for weekly (last 7 days) and monthly (weeks)
  const weeklyChartData = React.useMemo(() => {
    const data: Array<{ label: string; spent: number; budget: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayAmt = expenses
        .filter((e) => e.date === dStr)
        .reduce((acc, curr) => acc + curr.amount, 0);
      data.push({
        label: dayLabel,
        spent: dayAmt,
        budget: Math.round(budgetConfig.totalBudget / 30),
      });
    }
    return data;
  }, [expenses, budgetConfig]);

  const monthlyChartData = React.useMemo(() => {
    const buckets = [
      { label: 'Week 1', spent: 0, budget: Math.round(budgetConfig.totalBudget * 0.25) },
      { label: 'Week 2', spent: 0, budget: Math.round(budgetConfig.totalBudget * 0.25) },
      { label: 'Week 3', spent: 0, budget: Math.round(budgetConfig.totalBudget * 0.25) },
      { label: 'Week 4', spent: 0, budget: Math.round(budgetConfig.totalBudget * 0.25) },
    ];
    monthExpenses.forEach((e) => {
      const day = parseInt(e.date.split('-')[2], 10) || 1;
      if (day <= 7) buckets[0].spent += e.amount;
      else if (day <= 14) buckets[1].spent += e.amount;
      else if (day <= 21) buckets[2].spent += e.amount;
      else buckets[3].spent += e.amount;
    });
    return buckets;
  }, [monthExpenses, budgetConfig]);

  // Handle Quick Add Submit
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(quickAmount);
    if (isNaN(amt) || amt <= 0) return;

    soundEngine.playCoinSound();
    onAddExpense({
      amount: amt,
      merchant: quickMerchant.trim() || `${quickCategory} Expense`,
      category: quickCategory,
      paymentMethod: quickPaymentMethod,
      date: getTodayDateStr(),
      source: 'quick_add',
      notes: 'Quick recorded transaction',
    });

    if (remaining - amt > 0 && percentUsed < 80) {
      try {
        confetti({
          particleCount: 25,
          spread: 50,
          origin: { y: 0.8 },
          colors: ['#2563EB', '#10B981', '#38BDF8'],
        });
      } catch (err) {}
    }

    setQuickAmount('');
    setQuickMerchant('');
  };

  // Filter recent transactions
  const filteredRecent = monthExpenses
    .filter(
      (item) =>
        item.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .slice(0, 6);

  // Category badge styles mapping for High Density look
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Food & Dining':
        return 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200/60 dark:border-orange-800/50';
      case 'Groceries':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50';
      case 'Shopping':
        return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/50';
      case 'Transportation':
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50';
      case 'Entertainment':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/50';
      case 'Bills & Utilities':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full max-w-7xl mx-auto">
      {/* Top 3 Schematic Stat Cards (Monthly Budget | Spent | Left) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Monthly Budget */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-bold uppercase tracking-wider">
              Monthly Budget
            </span>
            <span className="material-symbols-outlined text-[18px] text-[#64748B] dark:text-[#94A3B8]">
              account_balance_wallet
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight font-mono">
            {formatCurrency(totalBudget)}
          </div>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1.5 flex items-center gap-1 font-medium">
            <span>Allocated monthly limit</span>
          </p>
        </div>

        {/* Card 2: Spent */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-bold uppercase tracking-wider">
              Spent
            </span>
            <span className="material-symbols-outlined text-[18px] text-[#64748B] dark:text-[#94A3B8]">
              payments
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight font-mono">
            {formatCurrency(totalSpent)}
          </div>
          <div className="flex items-center justify-between mt-1.5 text-xs font-semibold">
            <span className={percentUsed >= 80 ? 'text-[#EF4444]' : 'text-[#64748B] dark:text-[#94A3B8]'}>
              {percentUsed.toFixed(1)}% of budget utilized
            </span>
            <span className="text-[#64748B] dark:text-[#94A3B8] font-mono text-[11px]">
              {monthExpenses.length} entries
            </span>
          </div>
        </div>

        {/* Card 3: Left / Remaining (with Emerald / Amber / Red Status Dot) */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-bold uppercase tracking-wider">
              Left
            </span>
            {/* Status indicator badge (Good: Emerald, Warning: Amber, Danger: Red) */}
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                isOverBudget
                  ? 'bg-red-100 dark:bg-red-950/60 text-[#EF4444]'
                  : isWarningBudget
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-[#F59E0B]'
                  : 'bg-[#D1FAE5] dark:bg-emerald-950/60 text-[#10B981]'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isOverBudget
                    ? 'bg-[#EF4444]'
                    : isWarningBudget
                    ? 'bg-[#F59E0B]'
                    : 'bg-[#10B981]'
                }`}
              ></span>
              <span>{isOverBudget ? 'Danger' : isWarningBudget ? 'Warning' : 'Good'}</span>
            </span>
          </div>
          <div
            className={`text-3xl font-extrabold tracking-tight font-mono ${
              isOverBudget
                ? 'text-[#EF4444]'
                : isWarningBudget
                ? 'text-[#F59E0B]'
                : 'text-[#10B981]'
            }`}
          >
            {formatCurrency(remaining)}
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 mt-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget
                  ? 'bg-[#EF4444]'
                  : isWarningBudget
                  ? 'bg-[#F59E0B]'
                  : 'bg-[#10B981]'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, percentUsed))}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Left 8-cols + Right 4-cols */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Expense Graph (Schematic Component) */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] rounded-xl p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#10B981] text-[18px]">
                    bar_chart
                  </span>
                  Expense Graph
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  {chartMode === 'weekly'
                    ? 'Last 7 days spending vs daily budget target'
                    : 'Weekly breakdown across selected month'}
                </p>
              </div>

              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setChartMode('weekly')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    chartMode === 'weekly'
                      ? 'bg-white dark:bg-[#0F172A] text-[#10B981] shadow-2xs font-bold'
                      : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-white'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setChartMode('monthly')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    chartMode === 'monthly'
                      ? 'bg-white dark:bg-[#0F172A] text-[#10B981] shadow-2xs font-bold'
                      : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-white'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartMode === 'weekly' ? weeklyChartData : monthlyChartData}
                  margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1', opacity: 0.5 }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val)), '']}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      color: '#F8FAFC',
                      borderRadius: '8px',
                      fontSize: '12px',
                      padding: '8px 12px',
                    }}
                  />
                  <Bar dataKey="spent" name="Spent" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={36} />
                  <Bar dataKey="budget" name="Target Cap" fill="#94A3B8" radius={[4, 4, 0, 0]} opacity={0.35} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Transactions High-Density Table */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
            <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 bg-slate-50/40 dark:bg-slate-900/20">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Recent Transactions
                </h3>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm">
                  {monthExpenses.length} Total
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[14px]">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md py-1 pl-6 pr-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 w-28 sm:w-36"
                  />
                </div>
                <button
                  onClick={onViewAllClick}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold whitespace-nowrap"
                >
                  View All
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="py-2.5 px-3.5">Description</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3.5 text-right">Amount</th>
                    <th className="py-2.5 px-2.5 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {filteredRecent.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                        No transactions recorded for this period.
                      </td>
                    </tr>
                  ) : (
                    filteredRecent.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                      >
                        <td className="py-2.5 px-3.5 font-semibold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-[140px] sm:max-w-[200px]">{item.merchant}</span>
                            {item.source === 'receipt_scan' && (
                              <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[9px] font-mono px-1 py-0.2 rounded-xs">
                                OCR
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md inline-block ${getCategoryBadgeClass(
                              item.category
                            )}`}
                          >
                            {item.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                          {formatDateLabel(item.date)}
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-bold text-slate-900 dark:text-white font-mono">
                          -{formatCurrency(item.amount)}
                        </td>
                        <td className="py-2.5 px-2.5 text-center">
                          <button
                            onClick={() => onDeleteExpense(item.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-0.5 rounded-sm transition-opacity"
                            title="Delete transaction"
                          >
                            <span className="material-symbols-outlined text-[15px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Quick Log Expense Card (Deep Navy with Emerald Accents) */}
          <div className="bg-[#0F172A] text-white rounded-xl p-5 shadow-xs border border-slate-800">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#10B981] text-[18px]">bolt</span>
                Quick Log Expense
              </h3>
              <span className="text-[10px] font-mono font-bold bg-emerald-950 text-[#10B981] border border-emerald-800 px-2 py-0.5 rounded-md">
                Instant
              </span>
            </div>

            <form onSubmit={handleQuickAdd} className="flex flex-col gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                  Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={quickAmount}
                    onChange={(e) => setQuickAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-xs font-semibold text-white placeholder-slate-500 rounded-lg py-2 pl-7 pr-3 focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                  Description / Merchant
                </label>
                <input
                  type="text"
                  placeholder="e.g. Swiggy, Groceries, Fuel..."
                  value={quickMerchant}
                  onChange={(e) => setQuickMerchant(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                    Category
                  </label>
                  <select
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value as CategoryType)}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.name} value={c.name} className="bg-[#0F172A] text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={quickPaymentMethod}
                    onChange={(e) => setQuickPaymentMethod(e.target.value as PaymentMethodType)}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                  >
                    <option value="UPI" className="bg-[#0F172A] text-white">UPI</option>
                    <option value="Card" className="bg-[#0F172A] text-white">Card</option>
                    <option value="Cash" className="bg-[#0F172A] text-white">Cash</option>
                    <option value="Net Banking" className="bg-[#0F172A] text-white">Net Banking</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#10B981] hover:bg-emerald-600 text-[#0F172A] font-extrabold rounded-lg py-2.5 mt-1 transition-all shadow-xs text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>Record Expense</span>
              </button>
            </form>
          </div>

          {/* Interactive PaisaMeter 3D Coin Card */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-amber-500 text-[18px]">
                  monetization_on
                </span>
                <h3 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  PaisaMeter 3D Coin
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 px-1.5 py-0.5 rounded-sm font-bold">
                Interactive
              </span>
            </div>

            <div className="flex items-center gap-3 my-1">
              {/* Mini Flip Coin */}
              <button
                onClick={() => soundEngine.playCoinSpinningRattleSound()}
                className="group relative cursor-pointer focus:outline-none shrink-0"
                title="Click to play realistic spinning coin sound"
              >
                <img
                  src={LOGO_FRONT_URL}
                  alt="Front Side Logo"
                  className="w-14 h-14 rounded-full object-contain border-2 border-amber-400 group-hover:scale-105 group-hover:rotate-12 transition-all shadow-xs"
                />
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold bg-[#0F172A] text-emerald-400 px-1.5 rounded-full whitespace-nowrap shadow-2xs border border-slate-700">
                  Front
                </span>
              </button>

              <div className="flex-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Spinning Coin Audio
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                  Plays realistic metallic coin spin, table wobble rattle & Euler settling sound!
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => soundEngine.playCoinSpinningRattleSound()}
                    className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 px-2.5 py-1 rounded-md border border-amber-300 dark:border-amber-800 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[13px]">volume_up</span>
                    Play Spin Sound
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* AI Receipt / Invoice Scanner Dropzone Card */}
          <div
            onClick={onOpenReceiptScanner}
            className="bg-white dark:bg-[#0F172A] border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#10B981] dark:hover:border-[#10B981] rounded-xl p-4 text-center cursor-pointer shadow-xs transition-all group flex flex-col items-center justify-center gap-2"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#10B981] flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[20px]">document_scanner</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Scan Receipt or PDF
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                AI extracts merchant, amount & items
              </p>
            </div>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold px-2.5 py-1 rounded-md group-hover:bg-[#10B981] group-hover:text-slate-900 transition-colors">
              Upload & Scan
            </span>
          </div>

          {/* Alerts & Insights Mini Feed */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] rounded-xl p-4 shadow-xs flex flex-col gap-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className="material-symbols-outlined text-amber-500 text-[16px]">
                  notifications_active
                </span>
                Alerts & Reminders
              </h3>
              {aiInsight && (
                <button
                  onClick={onRefreshInsight}
                  disabled={isLoadingInsight}
                  className="text-[10px] text-[#10B981] hover:underline font-semibold"
                >
                  {isLoadingInsight ? 'Updating...' : 'Refresh'}
                </button>
              )}
            </div>

            {/* Alert items */}
            <div className="flex flex-col gap-2 text-xs">
              {todayExpenses.length === 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-2.5 text-amber-800 dark:text-amber-300 text-[11px] flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[15px] shrink-0 text-amber-500 mt-0.5">
                    schedule
                  </span>
                  <div>
                    <p className="font-bold">Daily Reminder</p>
                    <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
                      No expenses logged today yet. Track today's spends!
                    </p>
                  </div>
                </div>
              )}

              {isOverBudget && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-2 text-red-800 dark:text-red-300 text-[11px] flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[14px] shrink-0 text-red-500 mt-0.5">
                    error
                  </span>
                  <span>Exceeded budget by {formatCurrency(Math.abs(remaining))}!</span>
                </div>
              )}

              {isWarningBudget && !isOverBudget && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-2 text-amber-800 dark:text-amber-300 text-[11px] flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[14px] shrink-0 text-amber-500 mt-0.5">
                    warning
                  </span>
                  <span>{percentUsed.toFixed(0)}% of monthly budget reached.</span>
                </div>
              )}

              {!isOverBudget && !isWarningBudget && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-lg p-2 text-emerald-800 dark:text-emerald-300 text-[11px] flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[14px] shrink-0 text-[#10B981] mt-0.5">
                    check_circle
                  </span>
                  <span>Budget is healthy. {formatCurrency(remaining)} remaining this month.</span>
                </div>
              )}

              {aiInsight && aiInsight.tips.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-slate-700 dark:text-slate-300 text-[11px] flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[14px] shrink-0 text-[#10B981] mt-0.5">
                    psychology
                  </span>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">AI Tip</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {aiInsight.tips[0]}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
