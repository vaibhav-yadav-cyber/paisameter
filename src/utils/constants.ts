import { CategoryType, PaymentMethodType } from '../types';

export const CATEGORIES: Array<{
  name: CategoryType;
  icon: string;
  color: string;
  bgColor: string;
  textColor: string;
}> = [
  {
    name: 'Food & Dining',
    icon: 'restaurant',
    color: '#F59E0B', // Amber
    bgColor: 'bg-amber-100 dark:bg-amber-950/40',
    textColor: 'text-amber-700 dark:text-amber-400',
  },
  {
    name: 'Groceries',
    icon: 'shopping_cart',
    color: '#10B981', // Emerald
    bgColor: 'bg-emerald-100 dark:bg-emerald-950/40',
    textColor: 'text-emerald-700 dark:text-emerald-400',
  },
  {
    name: 'Transport',
    icon: 'directions_car',
    color: '#3B82F6', // Blue
    bgColor: 'bg-blue-100 dark:bg-blue-950/40',
    textColor: 'text-blue-700 dark:text-blue-400',
  },
  {
    name: 'Shopping',
    icon: 'shopping_bag',
    color: '#EC4899', // Pink
    bgColor: 'bg-pink-100 dark:bg-pink-950/40',
    textColor: 'text-pink-700 dark:text-pink-400',
  },
  {
    name: 'Bills & Utilities',
    icon: 'receipt_long',
    color: '#8B5CF6', // Purple
    bgColor: 'bg-purple-100 dark:bg-purple-950/40',
    textColor: 'text-purple-700 dark:text-purple-400',
  },
  {
    name: 'Entertainment',
    icon: 'movie',
    color: '#F97316', // Orange
    bgColor: 'bg-orange-100 dark:bg-orange-950/40',
    textColor: 'text-orange-700 dark:text-orange-400',
  },
  {
    name: 'Healthcare',
    icon: 'medical_services',
    color: '#EF4444', // Red
    bgColor: 'bg-red-100 dark:bg-red-950/40',
    textColor: 'text-red-700 dark:text-red-400',
  },
  {
    name: 'Education',
    icon: 'school',
    color: '#06B6D4', // Cyan
    bgColor: 'bg-cyan-100 dark:bg-cyan-950/40',
    textColor: 'text-cyan-700 dark:text-cyan-400',
  },
  {
    name: 'Investment & Savings',
    icon: 'trending_up',
    color: '#059669', // Dark Emerald
    bgColor: 'bg-emerald-100 dark:bg-emerald-950/40',
    textColor: 'text-emerald-800 dark:text-emerald-300',
  },
  {
    name: 'Others',
    icon: 'more_horiz',
    color: '#64748B', // Slate
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    textColor: 'text-slate-700 dark:text-slate-300',
  },
];

export const PAYMENT_METHODS: Array<{ name: PaymentMethodType; icon: string }> = [
  { name: 'UPI', icon: 'account_balance_wallet' },
  { name: 'Card', icon: 'credit_card' },
  { name: 'Cash', icon: 'payments' },
  { name: 'Net Banking', icon: 'account_balance' },
  { name: 'Wallet', icon: 'wallet' },
];

export const LOGO_FRONT_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC8rwYa_7qOJKgXUAIYwcfCqi3lgphUe0jsM5shYC-vFdRvT1LZNqtg5H_VRariweXfklJLVwKokn9HtXZ6pK2VoIGTO6BZlf55B1nBVdW8Tmrtzp0hWjPAxySOCb59BgYqoqE15AvQ8Rig0eGHfGZfMT0KQ0fL0ozjxVCD50ez04QYC65MDexpbqEmoW_YTwEGPgqjupRArtTB5MzW8RyVXyBtA7qyI0nk4KEjqbmHTJWHqi5f2g81FCMX04NxSiAXAA';

export const LOGO_BACK_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDkJXVZBqv6wSsKIkZTQPj298e7kkUMDSj-gfrouvahlbsPv4X_sKBeKb6K8L53osrMQ93c9aEfgNGhLU_douQjiB__eRV5Z2RvIiBPaYzM5umCr3F4pQnCRRbLsgwtD54xKDW51GTYVfW6E0Sp3VZoFVWLVujjajjiWHSmIgMeWV30MGQKuAqQe2amXdiz5ZRrqFwteKGFpUiuhQsI6f6L6zSLL6AXgfn3bsXmLnJ3TOsDfK9RSKZF3CAQRmJOhIGCxA';

export { INITIAL_EXPENSES as DEFAULT_EXPENSES } from './storage';

