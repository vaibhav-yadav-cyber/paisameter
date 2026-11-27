import { UserAccount, AuthSession, ExpenseItem, BudgetConfig, ReminderNotification } from '../types';
import { INITIAL_BUDGET, INITIAL_EXPENSES, getCurrentMonthStr } from './storage';

const ACCOUNTS_DB_KEY = 'paisameter_accounts_v2';
const ACTIVE_SESSION_KEY = 'paisameter_active_session_v2';
export const MAX_LOGIN_ATTEMPTS = 5;

// Default Seed Accounts
const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    id: 'usr-praveen-001',
    name: 'Praveen LP',
    email: 'praveenlp45@gmail.com',
    password: 'password123',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    authProvider: 'email',
    failedAttempts: 0,
    isLocked: false,
    createdAt: '2023-10-01T08:00:00.000Z',
    lastLoginAt: new Date().toISOString(),
    expenses: INITIAL_EXPENSES,
    budgetConfig: INITIAL_BUDGET,
    notifications: [
      {
        id: 'notif-welcome-1',
        title: 'Welcome to PaisaMeter!',
        message: 'Your automated expense tracking and smart financial insights are ready.',
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false,
      },
    ],
  },
  {
    id: 'usr-demo-002',
    name: 'Aarav Sharma',
    email: 'demo@paisameter.in',
    password: 'password123',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    authProvider: 'email',
    failedAttempts: 0,
    isLocked: false,
    createdAt: '2023-10-15T10:30:00.000Z',
    lastLoginAt: new Date().toISOString(),
    expenses: INITIAL_EXPENSES.slice(0, 4),
    budgetConfig: {
      monthYear: getCurrentMonthStr(),
      totalBudget: 40000,
      lowBalanceThreshold: 4000,
      warningThresholdPercent: 80,
    },
    notifications: [],
  },
];

/**
 * Load all user accounts from localStorage database
 */
export function getAllAccounts(): UserAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load accounts database', e);
  }
  // Initialize with seed accounts
  saveAllAccounts(DEFAULT_ACCOUNTS);
  return DEFAULT_ACCOUNTS;
}

export function saveAllAccounts(accounts: UserAccount[]): void {
  try {
    localStorage.setItem(ACCOUNTS_DB_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save accounts database', e);
  }
}

export function getAccountByEmail(email: string): UserAccount | undefined {
  const accounts = getAllAccounts();
  return accounts.find((a) => a.email.toLowerCase().trim() === email.toLowerCase().trim());
}

export function getAccountById(id: string): UserAccount | undefined {
  const accounts = getAllAccounts();
  return accounts.find((a) => a.id === id);
}

export function saveAccount(account: UserAccount): void {
  const accounts = getAllAccounts();
  const index = accounts.findIndex((a) => a.id === account.id || a.email.toLowerCase() === account.email.toLowerCase());
  if (index >= 0) {
    accounts[index] = account;
  } else {
    accounts.push(account);
  }
  saveAllAccounts(accounts);
}

/**
 * Active Session Management
 */
export function getActiveSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (raw) {
      const session = JSON.parse(raw);
      // Verify account still exists
      if (session && session.userId && getAccountById(session.userId)) {
        return session;
      }
    }
  } catch (e) {
    console.error('Failed to load active session', e);
  }
  return null;
}

export function setActiveSession(session: AuthSession | null): void {
  try {
    if (session) {
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  } catch (e) {
    console.error('Failed to set active session', e);
  }
}

export function clearActiveSession(): void {
  setActiveSession(null);
}

/**
 * Step 1: Sign Up with Email Flow
 * Validates details -> Saves to database -> Returns session
 */
export function signUpWithEmail(
  name: string,
  email: string,
  password: string
): { success: boolean; error?: string; account?: UserAccount; session?: AuthSession } {
  const trimmedName = name.trim();
  const trimmedEmail = email.toLowerCase().trim();

  // 1. Validation
  if (!trimmedName) {
    return { success: false, error: 'Full name is required' };
  }
  if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return { success: false, error: 'Please enter a valid email address' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long' };
  }

  // 2. Check if user already exists
  const existing = getAccountByEmail(trimmedEmail);
  if (existing) {
    return { success: false, error: 'An account with this email already exists. Please log in.' };
  }

  // 3. Create new user account with clean slate (0 entries)
  const newAccount: UserAccount = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: trimmedName,
    email: trimmedEmail,
    password: password,
    authProvider: 'email',
    failedAttempts: 0,
    isLocked: false,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    expenses: [], // Brand new user has 0 entries / clean slate
    budgetConfig: {
      monthYear: getCurrentMonthStr(),
      totalBudget: 0, // 0 allocated monthly limit for new users
      lowBalanceThreshold: 0,
      warningThresholdPercent: 80,
    },
    notifications: [
      {
        id: `notif-welcome-${Date.now()}`,
        title: 'Account Created Successfully!',
        message: `Welcome aboard ${trimmedName}! Start logging your daily spends and tracking your monthly budget.`,
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false,
      },
    ],
  };

  saveAccount(newAccount);

  const session: AuthSession = {
    userId: newAccount.id,
    email: newAccount.email,
    name: newAccount.name,
    authProvider: 'email',
    loggedInAt: new Date().toISOString(),
  };

  setActiveSession(session);

  return { success: true, account: newAccount, session };
}

/**
 * Step 2: Login with Email & Password Flow
 * Checks credentials -> tracks failed attempts -> locks after 5 attempts
 */
export function loginWithEmail(
  email: string,
  password: string
): {
  success: boolean;
  error?: string;
  isLocked?: boolean;
  attempts?: number;
  remainingAttempts?: number;
  account?: UserAccount;
  session?: AuthSession;
} {
  const trimmedEmail = email.toLowerCase().trim();

  if (!trimmedEmail) {
    return { success: false, error: 'Please enter your email address' };
  }
  if (!password) {
    return { success: false, error: 'Please enter your password' };
  }

  const account = getAccountByEmail(trimmedEmail);

  if (!account) {
    return {
      success: false,
      error: 'No account found with this email. Please check the address or sign up.',
    };
  }

  // Check if account is locked
  if (account.isLocked) {
    return {
      success: false,
      isLocked: true,
      attempts: account.failedAttempts,
      error: 'Your account is locked due to 5 consecutive failed login attempts. Please reset your password to unlock.',
      account,
    };
  }

  // Check credentials
  if (account.password !== password) {
    const newAttempts = (account.failedAttempts || 0) + 1;
    const isNowLocked = newAttempts >= MAX_LOGIN_ATTEMPTS;

    const updatedAccount: UserAccount = {
      ...account,
      failedAttempts: newAttempts,
      isLocked: isNowLocked,
      lockedAt: isNowLocked ? new Date().toISOString() : undefined,
    };

    saveAccount(updatedAccount);

    if (isNowLocked) {
      return {
        success: false,
        isLocked: true,
        attempts: newAttempts,
        remainingAttempts: 0,
        error: 'Too many failed attempts! Account is now LOCKED for security.',
        account: updatedAccount,
      };
    }

    const remaining = MAX_LOGIN_ATTEMPTS - newAttempts;
    return {
      success: false,
      isLocked: false,
      attempts: newAttempts,
      remainingAttempts: remaining,
      error: `Invalid credentials. Attempt ${newAttempts} of ${MAX_LOGIN_ATTEMPTS} (${remaining} attempt${remaining === 1 ? '' : 's'} remaining).`,
      account: updatedAccount,
    };
  }

  // Login Success: Reset failed attempts counter & update timestamp
  const updatedAccount: UserAccount = {
    ...account,
    failedAttempts: 0,
    isLocked: false,
    lockedAt: undefined,
    lastLoginAt: new Date().toISOString(),
  };

  saveAccount(updatedAccount);

  const session: AuthSession = {
    userId: updatedAccount.id,
    email: updatedAccount.email,
    name: updatedAccount.name,
    avatarUrl: updatedAccount.avatarUrl,
    authProvider: updatedAccount.authProvider,
    loggedInAt: new Date().toISOString(),
  };

  setActiveSession(session);

  return { success: true, account: updatedAccount, session };
}

/**
 * Step 3: Google Authentication Flow
 * Seamlessly logs in or signs up with Google credentials
 */
export function signInWithGoogle(googleProfile?: {
  name: string;
  email: string;
  avatarUrl?: string;
}): { success: boolean; error?: string; account?: UserAccount; session?: AuthSession } {
  const profile = googleProfile || {
    name: 'Praveen LP',
    email: 'praveenlp45@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  };

  const trimmedEmail = profile.email.toLowerCase().trim();
  let account = getAccountByEmail(trimmedEmail);

  if (!account) {
    // Register as new Google user (starts with 0 entries / clean slate)
    account = {
      id: `usr-g-${Date.now()}`,
      name: profile.name,
      email: trimmedEmail,
      avatarUrl: profile.avatarUrl,
      authProvider: 'google',
      failedAttempts: 0,
      isLocked: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      expenses: [], // Clean slate with 0 entries
      budgetConfig: {
        monthYear: getCurrentMonthStr(),
        totalBudget: 0, // 0 allocated monthly limit for new users
        lowBalanceThreshold: 0,
        warningThresholdPercent: 80,
      },
      notifications: [
        {
          id: `notif-g-${Date.now()}`,
          title: 'Google Sign-In Connected',
          message: `Logged in securely with Google account ${trimmedEmail}`,
          type: 'success',
          timestamp: new Date().toISOString(),
          read: false,
        },
      ],
    };
  } else {
    // Existing user Google sign-in
    account = {
      ...account,
      failedAttempts: 0,
      isLocked: false,
      lastLoginAt: new Date().toISOString(),
      avatarUrl: profile.avatarUrl || account.avatarUrl,
    };
  }

  saveAccount(account);

  const session: AuthSession = {
    userId: account.id,
    email: account.email,
    name: account.name,
    avatarUrl: account.avatarUrl,
    authProvider: 'google',
    loggedInAt: new Date().toISOString(),
  };

  setActiveSession(session);

  return { success: true, account, session };
}

/**
 * Step 4: Unlock Account & Reset Password
 */
export function unlockAccount(
  email: string,
  newPassword?: string
): { success: boolean; error?: string; account?: UserAccount } {
  const account = getAccountByEmail(email);
  if (!account) {
    return { success: false, error: 'No account found with this email.' };
  }

  const updatedAccount: UserAccount = {
    ...account,
    isLocked: false,
    failedAttempts: 0,
    lockedAt: undefined,
    password: newPassword || account.password || 'password123',
  };

  saveAccount(updatedAccount);
  return { success: true, account: updatedAccount };
}

export function signInAsGuest(): { success: boolean; session: AuthSession } {
  let guestAccount = getAccountByEmail('guest@paisameter.in');
  if (!guestAccount) {
    guestAccount = {
      id: 'usr-guest-003',
      name: 'Guest Explorer',
      email: 'guest@paisameter.in',
      password: 'guest',
      authProvider: 'email',
      failedAttempts: 0,
      isLocked: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      expenses: INITIAL_EXPENSES,
      budgetConfig: INITIAL_BUDGET,
      notifications: [],
    };
    saveAccount(guestAccount);
  }

  const session: AuthSession = {
    userId: guestAccount.id,
    email: guestAccount.email,
    name: guestAccount.name,
    authProvider: 'email',
    loggedInAt: new Date().toISOString(),
  };

  setActiveSession(session);
  return { success: true, session };
}

/**
 * User Data Isolation Syncing Helpers
 */
export function syncUserExpenses(userId: string, expenses: ExpenseItem[]): void {
  const account = getAccountById(userId);
  if (account) {
    account.expenses = expenses;
    saveAccount(account);
  }
}

export function syncUserBudget(userId: string, budget: BudgetConfig): void {
  const account = getAccountById(userId);
  if (account) {
    account.budgetConfig = budget;
    saveAccount(account);
  }
}

export function syncUserNotifications(userId: string, notifications: ReminderNotification[]): void {
  const account = getAccountById(userId);
  if (account) {
    account.notifications = notifications;
    saveAccount(account);
  }
}
