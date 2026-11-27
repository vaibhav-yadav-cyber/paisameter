import React, { useState, useMemo } from 'react';
import { ExpenseItem, BudgetConfig, TimeRangeTab, CategoryType } from '../types';
import { CATEGORIES, PAYMENT_METHODS } from '../utils/constants';
import { formatCurrency, formatDateLabel } from '../utils/storage';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';

interface ReportsViewProps {
  expenses: ExpenseItem[];
  budgetConfig: BudgetConfig;
  selectedMonthYear: string;
  onDeleteExpense: (id: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  expenses,
  budgetConfig,
  selectedMonthYear,
  onDeleteExpense,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRangeTab>('monthly');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter expenses by timeframe
  const filteredByTime = useMemo(() => {
    const today = new Date();
    const [sYear, sMonth] = selectedMonthYear.split('-').map(Number);

    if (timeRange === 'daily') {
      // Last 14 days
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 14);
      return expenses.filter((e) => new Date(e.date) >= cutoff);
    } else if (timeRange === 'weekly') {
      // Last 8 weeks
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 56);
      return expenses.filter((e) => new Date(e.date) >= cutoff);
    } else if (timeRange === 'monthly') {
      // Selected Month
      return expenses.filter((e) => e.date.startsWith(selectedMonthYear));
    } else {
      // Selected Year (all months in selected year)
      return expenses.filter((e) => e.date.startsWith(`${sYear}-`));
    }
  }, [expenses, timeRange, selectedMonthYear]);

  // Apply category & payment filter
  const displayedExpenses = useMemo(() => {
    return filteredByTime.filter((e) => {
      const matchCat =
        selectedCategoryFilter === 'all' || e.category === selectedCategoryFilter;
      const matchPay =
        selectedPaymentFilter === 'all' || e.paymentMethod === selectedPaymentFilter;
      const matchSearch =
        searchQuery.trim() === '' ||
        e.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchPay && matchSearch;
    });
  }, [filteredByTime, selectedCategoryFilter, selectedPaymentFilter, searchQuery]);

  // Total Spent in Current View
  const totalViewSpent = displayedExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  // 1. Time Series Chart Data (Bar & Line trend)
  const timeSeriesData = useMemo(() => {
    if (timeRange === 'daily') {
      // Group by day for last 14 days
      const map: Record<string, number> = {};
      for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const str = d.toISOString().split('T')[0];
        map[str] = 0;
      }
      displayedExpenses.forEach((e) => {
        if (map[e.date] !== undefined) {
          map[e.date] += e.amount;
        }
      });
      return Object.entries(map).map(([date, amt]) => ({
        label: formatDateLabel(date),
        spent: amt,
        budget: Math.round(budgetConfig.totalBudget / 30),
      }));
    } else if (timeRange === 'weekly') {
      // Group by last 8 weeks
      const weeks: Record<string, number> = {};
      for (let w = 7; w >= 0; w--) {
        weeks[`Week -${w}`] = 0;
      }
      displayedExpenses.forEach((e) => {
        const diffDays = Math.floor(
          (Date.now() - new Date(e.date).getTime()) / (1000 * 3600 * 24)
        );
        const wIdx = Math.min(7, Math.max(0, Math.floor(diffDays / 7)));
        weeks[`Week -${wIdx}`] += e.amount;
      });
      return Object.entries(weeks).map(([lbl, amt]) => ({
        label: lbl === 'Week -0' ? 'This Week' : lbl,
        spent: amt,
        budget: Math.round(budgetConfig.totalBudget / 4),
      }));
    } else if (timeRange === 'monthly') {
      // Group by week or 5-day intervals in the selected month
      const daysInMonth = 30;
      const buckets = [
        { label: 'Day 1-7', spent: 0, budget: Math.round(budgetConfig.totalBudget * 0.25) },
        { label: 'Day 8-14', spent: 0, budget: Math.round(budgetConfig.totalBudget * 0.25) },
        { label: 'Day 15-21', spent: 0, budget: Math.round(budgetConfig.totalBudget * 0.25) },
        { label: 'Day 22-End', spent: 0, budget: Math.round(budgetConfig.totalBudget * 0.25) },
      ];
      displayedExpenses.forEach((e) => {
        const day = parseInt(e.date.split('-')[2], 10);
        if (day <= 7) buckets[0].spent += e.amount;
        else if (day <= 14) buckets[1].spent += e.amount;
        else if (day <= 21) buckets[2].spent += e.amount;
        else buckets[3].spent += e.amount;
      });
      return buckets;
    } else {
      // Yearly: 12 Months
      const [sYear] = selectedMonthYear.split('-').map(Number);
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];
      const monthBuckets = months.map((m, idx) => ({
        label: m,
        spent: 0,
        budget: budgetConfig.totalBudget,
      }));
      displayedExpenses.forEach((e) => {
        const mIdx = parseInt(e.date.split('-')[1], 10) - 1;
        if (monthBuckets[mIdx]) {
          monthBuckets[mIdx].spent += e.amount;
        }
      });
      return monthBuckets;
    }
  }, [displayedExpenses, timeRange, budgetConfig, selectedMonthYear]);

  // 2. Category Pie Chart Data
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    displayedExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });

    return Object.entries(map)
      .map(([cat, amt]) => {
        const catInfo = CATEGORIES.find((c) => c.name === cat) || CATEGORIES[0];
        return {
          name: cat,
          value: amt,
          color: catInfo.color,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [displayedExpenses]);

  // 3. Payment Method Distribution
  const paymentData = useMemo(() => {
    const map: Record<string, number> = {};
    displayedExpenses.forEach((e) => {
      map[e.paymentMethod] = (map[e.paymentMethod] || 0) + e.amount;
    });
    return Object.entries(map).map(([method, amt]) => ({
      name: method,
      value: amt,
    }));
  }, [displayedExpenses]);

  // Budget vs Spent Comparison (Doughnut Chart data)
  const budgetComparisonData = [
    { name: 'Spent', value: totalViewSpent, color: '#10B981' },
    {
      name: 'Remaining',
      value: Math.max(0, budgetConfig.totalBudget - totalViewSpent),
      color: '#E2E8F0',
    },
  ];

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Merchant', 'Category', 'Amount (INR)', 'Payment Method', 'Notes', 'Source'];
    const rows = displayedExpenses.map((e) => [
      e.date,
      `"${e.merchant.replace(/"/g, '""')}"`,
      e.category,
      e.amount,
      e.paymentMethod,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
      e.source,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PaisaMeter_Expenses_${selectedMonthYear}_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-7xl mx-auto pb-12 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[24px]">
              bar_chart
            </span>
            Reports & Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Spending patterns, category breakdowns, and long-term budget health
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          Export CSV Report
        </button>
      </div>

      {/* Time Range Switcher Tabs (Daily, Weekly, Monthly, Yearly) */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
          {(['daily', 'weekly', 'monthly', 'yearly'] as TimeRangeTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setTimeRange(tab)}
              className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all ${
                timeRange === tab
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Total Spent ({timeRange}):
          </span>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400 font-mono">
            {formatCurrency(totalViewSpent)}
          </span>
        </div>
      </div>

      {/* Primary Graphs Row: Bar Comparison & Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Spending vs Budget Trend Graph (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Spending Trend & Budget Allocation
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Visualizing actual expense vs baseline budget allocation
              </p>
            </div>
            <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-sm font-bold">
              {timeRange.toUpperCase()}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSeriesData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => `₹${val}`} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    color: '#fff',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                <Bar dataKey="spent" name="Expenses" fill="#2563eb" radius={[3, 3, 0, 0]} maxBarSize={28} />
                <Bar dataKey="budget" name="Budget Cap" fill="#cbd5e1" radius={[3, 3, 0, 0]} opacity={0.4} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut / Pie Chart (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Category Distribution
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Where your money is allocated
            </p>
          </div>

          {categoryData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-slate-400">
              No transactions recorded in this range.
            </div>
          ) : (
            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val)), 'Spent']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      color: '#fff',
                      borderRadius: '6px',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Mini Legend List */}
          <div className="space-y-1 max-h-28 overflow-y-auto pr-1 text-[11px]">
            {categoryData.slice(0, 5).map((cat, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                  <span className="truncate max-w-[120px]">{cat.name}</span>
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatCurrency(cat.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Row: Transaction Ledger */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-slate-50/40 dark:bg-slate-900/20">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              All Transaction Records ({displayedExpenses.length})
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Filter by category, search by merchant, or delete entries
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Search */}
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md py-1 px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-32"
            />

            {/* Category filter */}
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md py-1 px-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Payment method filter */}
            <select
              value={selectedPaymentFilter}
              onChange={(e) => setSelectedPaymentFilter(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md py-1 px-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Modes</option>
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm.name} value={pm.name}>
                  {pm.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="py-2.5 px-4">Merchant / Description</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-4 text-right">Amount</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {displayedExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400 text-xs">
                    No transactions match your current filters.
                  </td>
                </tr>
              ) : (
                displayedExpenses.map((e) => {
                  const catObj =
                    CATEGORIES.find((c) => c.name === e.category) || CATEGORIES[0];
                  return (
                    <tr
                      key={e.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center ${catObj.bgColor} ${catObj.textColor}`}
                          >
                            <span className="material-symbols-outlined text-[15px]">
                              {catObj.icon}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {e.merchant}
                            </p>
                            {e.notes && (
                              <p className="text-[10px] text-slate-400 truncate max-w-xs">
                                {e.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 font-medium text-slate-600 dark:text-slate-300">
                        {e.category}
                      </td>

                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                        {e.date}
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[10px] px-1.5 py-0.5 rounded-xs">
                          {e.paymentMethod}
                        </span>
                      </td>

                      <td className="py-2.5 px-4 text-right font-bold text-slate-900 dark:text-white font-mono">
                        -{formatCurrency(e.amount)}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => onDeleteExpense(e.id)}
                          className="text-slate-400 hover:text-red-500 p-1 rounded-md transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            delete
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
