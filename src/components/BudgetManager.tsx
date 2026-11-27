import React, { useState } from 'react';
import { BudgetConfig, ExpenseItem } from '../types';
import { CATEGORIES } from '../utils/constants';
import { formatCurrency } from '../utils/storage';
import { soundEngine } from '../utils/audio';

interface BudgetManagerProps {
  budgetConfig: BudgetConfig;
  onUpdateBudgetConfig: (config: BudgetConfig) => void;
  expenses: ExpenseItem[];
  selectedMonthYear: string;
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({
  budgetConfig,
  onUpdateBudgetConfig,
  expenses,
  selectedMonthYear,
}) => {
  const [totalBudget, setTotalBudget] = useState(budgetConfig.totalBudget.toString());
  const [warningThreshold, setWarningThreshold] = useState(
    (budgetConfig.warningThresholdPercent || 80).toString()
  );
  const [lowBalanceThreshold, setLowBalanceThreshold] = useState(
    (budgetConfig.lowBalanceThreshold || 5000).toString()
  );
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>(
    budgetConfig.categoryBudgets || {}
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Month stats
  const monthExpenses = expenses.filter((e) => e.date.startsWith(selectedMonthYear));
  const totalSpent = monthExpenses.reduce((a, b) => a + b.amount, 0);
  const remaining = parseFloat(totalBudget || '0') - totalSpent;
  const percentUsed =
    parseFloat(totalBudget || '0') > 0
      ? (totalSpent / parseFloat(totalBudget)) * 100
      : 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTotal = parseFloat(totalBudget);
    if (isNaN(parsedTotal) || parsedTotal < 0) return;

    soundEngine.playCoinSound();
    onUpdateBudgetConfig({
      ...budgetConfig,
      totalBudget: parsedTotal,
      warningThresholdPercent: parseFloat(warningThreshold) || 80,
      lowBalanceThreshold: parseFloat(lowBalanceThreshold) || 0,
      categoryBudgets,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCategoryBudgetChange = (catName: string, val: string) => {
    const num = parseFloat(val) || 0;
    setCategoryBudgets((prev) => ({
      ...prev,
      [catName]: num,
    }));
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-12 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[24px]">
            account_balance_wallet
          </span>
          Monthly Budget Planner
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Define master monthly spending limit, threshold alerts, and category caps
        </p>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl p-3 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 shadow-2xs">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span className="font-semibold">
            Budget parameters updated and calculations synchronized!
          </span>
        </div>
      )}

      {/* Main Budget Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                Total Monthly Budget (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  step="any"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-slate-900 dark:text-white font-bold text-xl sm:text-2xl focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                PaisaMeter automatically subtracts daily expenses and monitors remaining balance against this cap.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                  Warning Overuse Threshold (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="50"
                    max="99"
                    value={warningThreshold}
                    onChange={(e) => setWarningThreshold(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg py-1.5 px-2.5 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                    %
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Triggers notification once spending reaches this % of budget.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                  Minimum Money Alert Level (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={lowBalanceThreshold}
                    onChange={(e) => setLowBalanceThreshold(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg py-1.5 pl-6 pr-2.5 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Triggers low balance notification when remaining drops below this limit.
                </p>
              </div>
            </div>

            {/* Category Budgets Allocation */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                Category Spending Limits
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CATEGORIES.slice(0, 6).map((cat) => (
                  <div
                    key={cat.name}
                    className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200/70 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="material-symbols-outlined text-[15px]"
                        style={{ color: cat.color }}
                      >
                        {cat.icon}
                      </span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {cat.name}
                      </span>
                    </div>
                    <div className="w-24 relative">
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        placeholder="Limit"
                        value={categoryBudgets[cat.name] || ''}
                        onChange={(e) =>
                          handleCategoryBudgetChange(cat.name, e.target.value)
                        }
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md py-0.5 pl-4 pr-1.5 text-xs text-right font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="bg-[#10B981] hover:bg-emerald-600 text-[#0F172A] font-extrabold py-2.5 px-5 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer mt-1 self-start"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>Save Budget Parameters</span>
            </button>
          </form>
        </div>

        {/* Real-time Summary Card (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-[#0F172A] text-white border border-slate-800 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-[#10B981] bg-emerald-950/60 border border-emerald-900/60 px-2 py-0.5 rounded-sm uppercase font-bold">
                Live Parameter Status
              </span>
              <p className="text-[11px] text-slate-400 mt-3">Calculated Remaining Balance</p>
              <p
                className={`text-2xl font-bold font-mono tracking-tight mt-0.5 ${
                  remaining < 0 ? 'text-[#EF4444]' : 'text-[#10B981]'
                }`}
              >
                {formatCurrency(remaining)}
              </p>

              <div className="mt-4 space-y-2 text-xs border-t border-slate-800 pt-3">
                <div className="flex justify-between text-slate-400">
                  <span>Monthly Budget:</span>
                  <span className="font-mono text-white font-bold">
                    {formatCurrency(parseFloat(totalBudget || '0'))}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Spent this Month:</span>
                  <span className="font-mono text-slate-200">
                    {formatCurrency(totalSpent)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Usage Rate:</span>
                  <span className="font-mono text-emerald-300 font-bold">
                    {percentUsed.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-[#10B981] text-[14px]">
                  security
                </span>
                Protected by PaisaMeter Auto-Calculations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
