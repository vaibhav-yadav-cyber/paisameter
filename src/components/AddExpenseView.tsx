import React, { useState } from 'react';
import { ExpenseItem, BudgetConfig, CategoryType, PaymentMethodType } from '../types';
import { CATEGORIES, PAYMENT_METHODS } from '../utils/constants';
import { soundEngine } from '../utils/audio';
import { formatCurrency, getTodayDateStr } from '../utils/storage';
import confetti from 'canvas-confetti';

interface AddExpenseViewProps {
  budgetConfig: BudgetConfig;
  currentExpenses: ExpenseItem[];
  selectedMonthYear: string;
  onAddExpense: (expense: Omit<ExpenseItem, 'id' | 'createdAt'>) => void;
  onDone: () => void;
}

export const AddExpenseView: React.FC<AddExpenseViewProps> = ({
  budgetConfig,
  currentExpenses,
  selectedMonthYear,
  onAddExpense,
  onDone,
}) => {
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState<CategoryType>('Food & Dining');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('UPI');
  const [date, setDate] = useState(getTodayDateStr());
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<Array<{ name: string; price: number }>>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Month stats calculation
  const monthExpenses = currentExpenses.filter((e) => e.date.startsWith(selectedMonthYear));
  const currentSpent = monthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const parsedAmt = parseFloat(amount) || 0;
  const projectSpent = currentSpent + parsedAmt;
  const projectedRemaining = budgetConfig.totalBudget - projectSpent;
  const projectedPercent =
    budgetConfig.totalBudget > 0
      ? (projectSpent / budgetConfig.totalBudget) * 100
      : 0;

  // Add line item
  const handleAddLineItem = () => {
    if (!newItemName.trim()) return;
    const priceNum = parseFloat(newItemPrice) || 0;
    const updated = [...lineItems, { name: newItemName.trim(), price: priceNum }];
    setLineItems(updated);
    // If total amount is empty or matches sum, auto-sum it
    if (!amount || parseFloat(amount) === lineItems.reduce((a, b) => a + b.price, 0)) {
      const sum = updated.reduce((a, b) => a + b.price, 0);
      if (sum > 0) setAmount(sum.toString());
    }
    setNewItemName('');
    setNewItemPrice('');
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amtNum = parseFloat(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      setErrorMsg('Please enter a valid expense amount greater than 0.');
      return;
    }
    if (!merchant.trim()) {
      setErrorMsg('Please specify the merchant, store, or expense description.');
      return;
    }

    soundEngine.playCoinSound();

    onAddExpense({
      amount: amtNum,
      category,
      paymentMethod,
      date: date || getTodayDateStr(),
      merchant: merchant.trim(),
      notes: notes.trim() || undefined,
      source: 'manual',
      items: lineItems.length > 0 ? lineItems : undefined,
    });

    if (projectedRemaining >= 0 && projectedPercent < 80) {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10B981', '#34D399'],
        });
      } catch (e) {}
    }

    onDone();
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[24px]">
              add_circle
            </span>
            Add New Expense
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log your daily expense with details, category, and payment method
          </p>
        </div>
        <button
          onClick={onDone}
          className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-xl p-3 text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Expense Form (Spans 8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Amount input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                Amount (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xl font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2 pl-9 pr-3 text-slate-900 dark:text-white font-bold text-xl sm:text-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Merchant / Description */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                Merchant / Paid To / Store *
              </label>
              <input
                type="text"
                placeholder="e.g. Starbucks, Uber, Reliance Fresh, Petrol Pump..."
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            {/* Category Selector with Icons */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Expense Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.name;
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setCategory(cat.name)}
                      className={`flex items-center gap-1.5 p-2 rounded-lg border text-xs font-medium text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 shadow-2xs font-bold'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-[16px]"
                        style={{ color: cat.color }}
                      >
                        {cat.icon}
                      </span>
                      <span className="truncate text-[11px]">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date & Payment Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                  Date of Expense *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg py-1.5 px-3 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none cursor-pointer"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                  Payment Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodType)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg py-1.5 px-3 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm.name} value={pm.name}>
                      {pm.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes / Tag */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                Notes / Purpose (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Lunch with team, monthly groceries..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg py-1.5 px-3 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Optional Itemized Breakdown */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Itemized Line Items (Optional)
                </span>
                {lineItems.length > 0 && (
                  <span className="text-[10px] text-slate-500 font-mono">
                    Total: {formatCurrency(lineItems.reduce((a, b) => a + b.price, 0))}
                  </span>
                )}
              </div>

              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Item name (e.g. Milk 1L)"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md py-1 px-2.5 text-xs"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  className="w-20 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md py-1 px-2.5 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddLineItem}
                  className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 px-3 py-1 rounded-md text-xs font-semibold cursor-pointer"
                >
                  Add
                </button>
              </div>

              {lineItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded-md text-xs mb-1 border border-slate-100 dark:border-slate-800"
                >
                  <span>{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold">{formatCurrency(item.price)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLineItem(idx)}
                      className="text-slate-400 hover:text-red-500 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[13px]">close</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Action Button */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                className="w-full bg-[#10B981] hover:bg-emerald-600 text-[#0F172A] font-extrabold py-3 px-4 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>Save Expense Record</span>
              </button>
            </div>
          </form>
        </div>

        {/* Real-time Budget Impact Sidebar (Spans 4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#10B981] text-[16px]">
                analytics
              </span>
              Real-time Budget Impact
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 text-[11px]">
                <span className="text-slate-500">Monthly Budget:</span>
                <span className="font-bold font-mono">
                  {formatCurrency(budgetConfig.totalBudget)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 text-[11px]">
                <span className="text-slate-500">Already Spent:</span>
                <span className="font-bold font-mono text-slate-700 dark:text-slate-300">
                  {formatCurrency(currentSpent)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 text-[11px]">
                <span className="text-slate-500">This Expense:</span>
                <span className="font-bold font-mono text-[#10B981]">
                  +{formatCurrency(parsedAmt)}
                </span>
              </div>
              <div className="flex justify-between py-1 text-[11px]">
                <span className="text-slate-500">Projected Balance:</span>
                <span
                  className={`font-bold font-mono ${
                    projectedRemaining < 0
                      ? 'text-[#EF4444]'
                      : projectedPercent >= 80
                      ? 'text-[#F59E0B]'
                      : 'text-[#10B981]'
                  }`}
                >
                  {formatCurrency(projectedRemaining)}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-500">Budget Consumption</span>
                <span className="font-bold font-mono">{projectedPercent.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    projectedRemaining < 0
                      ? 'bg-[#EF4444]'
                      : projectedPercent >= 80
                      ? 'bg-[#F59E0B]'
                      : 'bg-[#10B981]'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, projectedPercent))}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/60 rounded-xl p-3.5 text-[11px] text-slate-700 dark:text-slate-300">
            <p className="font-bold mb-1 flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 text-xs">
              <span className="material-symbols-outlined text-[15px] text-[#10B981]">
                lightbulb
              </span>
              Smart Budget Tip
            </p>
            <p className="opacity-90 leading-relaxed">
              Recording every single spend right away provides continuous clarity and prevents surprise month-end deficits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
