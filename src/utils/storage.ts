import { ExpenseItem, BudgetConfig, UserProfile, ReminderNotification } from '../types';

const EXPENSES_KEY = 'paisameter_expenses_v1';
const BUDGET_KEY = 'paisameter_budget_v1';
const USER_KEY = 'paisameter_user_v1';
const NOTIFICATIONS_KEY = 'paisameter_notifications_v1';

export function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentMonthStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export const INITIAL_USER: UserProfile = {
  id: 'user_default',
  name: 'Praveen LP',
  email: 'praveenlp45@gmail.com',
  currency: 'INR',
  currencySymbol: '₹',
  isGuest: false,
  soundEnabled: true,
  notificationsEnabled: true,
  theme: 'light',
};

export const INITIAL_BUDGET: BudgetConfig = {
  monthYear: getCurrentMonthStr(),
  totalBudget: 50000,
  lowBalanceThreshold: 5000,
  warningThresholdPercent: 80,
};

export const INITIAL_EXPENSES: ExpenseItem[] = [
  {
    id: 'exp-1',
    amount: 340,
    category: 'Food & Dining',
    date: getTodayDateStr(),
    merchant: 'Starbucks',
    notes: 'Morning Hazelnut Cold Brew & Croissant',
    paymentMethod: 'UPI',
    source: 'manual',
    items: [
      { name: 'Hazelnut Cold Brew', price: 240, quantity: 1 },
      { name: 'Butter Croissant', price: 100, quantity: 1 },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-2',
    amount: 450,
    category: 'Transport',
    date: getTodayDateStr(),
    merchant: 'Uber Ride',
    notes: 'Cab to Tech Hub office',
    paymentMethod: 'Card',
    source: 'manual',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'exp-3',
    amount: 450,
    category: 'Food & Dining',
    date: getTodayDateStr(),
    merchant: 'Subway Bistro',
    notes: 'Lunch combo with teammates',
    paymentMethod: 'UPI',
    source: 'manual',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'exp-4',
    amount: 2100,
    category: 'Groceries',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    merchant: 'Amazon Fresh',
    notes: 'Monthly staples, organic olive oil & fruits',
    paymentMethod: 'Card',
    source: 'receipt_scan',
    items: [
      { name: 'Extra Virgin Olive Oil 1L', price: 850, quantity: 1 },
      { name: 'Organic Almonds 500g', price: 550, quantity: 1 },
      { name: 'Fresh Fruits & Veggies', price: 700, quantity: 1 },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'exp-5',
    amount: 1499,
    category: 'Entertainment',
    date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    merchant: 'BookMyShow',
    notes: 'Weekend IMAX Movie tickets for 2',
    paymentMethod: 'UPI',
    source: 'manual',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'exp-6',
    amount: 3200,
    category: 'Shopping',
    date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
    merchant: 'Zara',
    notes: 'Casual cotton linen shirt',
    paymentMethod: 'Card',
    source: 'receipt_scan',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'exp-7',
    amount: 2450,
    category: 'Bills & Utilities',
    date: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0],
    merchant: 'Airtel Broadband & Electricity',
    notes: 'Monthly Fiber internet & power bill',
    paymentMethod: 'Net Banking',
    source: 'manual',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'exp-8',
    amount: 11200,
    category: 'Food & Dining',
    date: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0],
    merchant: 'Fine Dine & Weekend Gatherings',
    notes: 'Family dinner celebration',
    paymentMethod: 'Card',
    source: 'manual',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'exp-9',
    amount: 13021,
    category: 'Investment & Savings',
    date: new Date(Date.now() - 86400000 * 14).toISOString().split('T')[0],
    merchant: 'SIP Equity Mutual Fund',
    notes: 'Monthly automated wealth accumulation SIP',
    paymentMethod: 'Net Banking',
    source: 'manual',
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
];

export function loadStoredExpenses(): ExpenseItem[] {
  try {
    const raw = localStorage.getItem(EXPENSES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load expenses from localStorage', e);
  }
  return INITIAL_EXPENSES;
}

export function saveStoredExpenses(expenses: ExpenseItem[]): void {
  try {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  } catch (e) {
    console.error('Failed to save expenses to localStorage', e);
  }
}

export function loadStoredBudget(): BudgetConfig {
  try {
    const raw = localStorage.getItem(BUDGET_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load budget from localStorage', e);
  }
  return INITIAL_BUDGET;
}

export function saveStoredBudget(budget: BudgetConfig): void {
  try {
    localStorage.setItem(BUDGET_KEY, JSON.stringify(budget));
  } catch (e) {
    console.error('Failed to save budget to localStorage', e);
  }
}

export function loadStoredUser(): UserProfile {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load user profile from localStorage', e);
  }
  return INITIAL_USER;
}

export function saveStoredUser(user: UserProfile): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save user profile to localStorage', e);
  }
}

export function loadStoredNotifications(): ReminderNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load notifications', e);
  }
  return [];
}

export function saveStoredNotifications(notifs: ReminderNotification[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
  } catch (e) {
    console.error('Failed to save notifications', e);
  }
}

export const loadExpenses = loadStoredExpenses;
export const saveExpenses = saveStoredExpenses;
export const loadBudgetConfig = loadStoredBudget;
export const saveBudgetConfig = saveStoredBudget;
export const loadNotifications = loadStoredNotifications;
export const saveNotifications = saveStoredNotifications;



export function formatCurrency(amount: number, symbol: string = '₹'): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  // Format with Indian numbering format (e.g. 15,240 or 1,50,000)
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(absAmount);

  return `${isNegative ? '-' : ''}${symbol}${formatted}`;
}

export function formatDateLabel(dateStr: string): string {
  if (!dateStr) return '';
  const today = getTodayDateStr();
  const d = new Date(dateStr + 'T00:00:00');

  if (dateStr === today) {
    return 'Today';
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dateStr === yesterday) {
    return 'Yesterday';
  }

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
