export type CategoryType =
  | 'Food & Dining'
  | 'Groceries'
  | 'Transport'
  | 'Shopping'
  | 'Bills & Utilities'
  | 'Entertainment'
  | 'Healthcare'
  | 'Education'
  | 'Investment & Savings'
  | 'Others';

export type PaymentMethodType = 'UPI' | 'Card' | 'Cash' | 'Net Banking' | 'Wallet';

export interface ExpenseItem {
  id: string;
  amount: number;
  category: CategoryType;
  date: string; // YYYY-MM-DD
  merchant: string;
  notes?: string;
  paymentMethod: PaymentMethodType;
  receiptUrl?: string;
  source: 'manual' | 'receipt_scan' | 'quick_add';
  items?: Array<{ name: string; price?: number; quantity?: number }>;
  createdAt: string;
}

export interface BudgetConfig {
  monthYear: string; // "2023-10"
  totalBudget: number;
  lowBalanceThreshold: number; // e.g. 2000
  warningThresholdPercent: number; // e.g. 80
  categoryBudgets?: Record<string, number>;
  dailyReminderEnabled?: boolean;
  overuseAlertEnabled?: boolean;
  lowBalanceAlertEnabled?: boolean;
  currencySymbol?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  currency: string;
  currencySymbol: string;
  isGuest: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  authProvider: 'email' | 'google';
  failedAttempts: number;
  isLocked: boolean;
  lockedAt?: string;
  createdAt: string;
  lastLoginAt: string;
  expenses: ExpenseItem[];
  budgetConfig: BudgetConfig;
  notifications: ReminderNotification[];
}

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  authProvider: 'email' | 'google';
  loggedInAt: string;
}

export interface ExtractedReceiptData {
  merchant: string;
  amount: number;
  date: string;
  category: CategoryType;
  paymentMethod: PaymentMethodType;
  notes?: string;
  items?: Array<{ name: string; price?: number; quantity?: number }>;
  confidence?: number;
}

export interface ReminderNotification {
  id: string;
  title: string;
  message: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface AIInsight {
  status: string;
  headline: string;
  tips: string[];
  projectedSpend: number;
  savingAdvice: string;
}

export type TimeRangeTab = 'daily' | 'weekly' | 'monthly' | 'yearly';
