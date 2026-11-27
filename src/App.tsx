/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ExpenseItem, BudgetConfig, ReminderNotification, AIInsight, AuthSession } from './types';
import {
  loadExpenses,
  saveExpenses,
  loadBudgetConfig,
  saveBudgetConfig,
  loadNotifications,
  saveNotifications,
  getTodayDateStr,
} from './utils/storage';
import {
  getActiveSession,
  getAccountById,
  clearActiveSession,
  syncUserExpenses,
  syncUserBudget,
  syncUserNotifications,
  setActiveSession,
  signInAsGuest,
} from './utils/authService';
import {
  isSupabaseConfigured,
  supabase,
  supabaseGetCurrentSession,
  supabaseSignOut,
  supabaseFetchExpenses,
  supabaseInsertExpense,
  supabaseDeleteExpense,
  supabaseFetchBudget,
  supabaseUpsertBudget,
  supabaseFetchNotifications,
  supabaseInsertNotification,
  supabaseMarkNotificationRead,
  supabaseClearAllNotifications,
} from './lib/supabase';
import { DEFAULT_EXPENSES } from './utils/constants';
import { soundEngine } from './utils/audio';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { ReceiptScanner } from './components/ReceiptScanner';
import { AddExpenseView } from './components/AddExpenseView';
import { ReportsView } from './components/ReportsView';
import { BudgetManager } from './components/BudgetManager';
import { SettingsView } from './components/SettingsView';
import { InteractiveCoinModal } from './components/InteractiveCoinModal';
import { AuthView } from './components/AuthView';

export default function App() {
  // Authentication & Session State
  const [currentUserSession, setCurrentUserSession] = useState<AuthSession | null>(() =>
    getActiveSession()
  );

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Core Data States (Isolated per User)
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const session = getActiveSession();
    if (session) {
      const account = getAccountById(session.userId);
      if (account && Array.isArray(account.expenses)) return account.expenses;
    }
    return loadExpenses();
  });

  const [budgetConfig, setBudgetConfig] = useState<BudgetConfig>(() => {
    const session = getActiveSession();
    if (session) {
      const account = getAccountById(session.userId);
      if (account && account.budgetConfig) return account.budgetConfig;
    }
    return loadBudgetConfig();
  });

  const [notifications, setNotifications] = useState<ReminderNotification[]>(() => {
    const session = getActiveSession();
    if (session) {
      const account = getAccountById(session.userId);
      if (account && Array.isArray(account.notifications)) return account.notifications;
    }
    return loadNotifications();
  });

  // Month-Year Filter state
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>(() => {
    const hasOct2023 = loadExpenses().some((e) => e.date.startsWith('2023-10'));
    if (hasOct2023) return '2023-10';
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    return `${now.getFullYear()}-${mm}`;
  });

  // UI States
  const [isCoinModalOpen, setIsCoinModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => soundEngine.isEnabled());
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');

  // AI Insights State
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  // Supabase Auth Listener on Mount
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Check active Supabase session
    supabaseGetCurrentSession().then((session) => {
      if (session) {
        setCurrentUserSession(session);
        setActiveSession(session);
      }
    });

    // Listen for Auth changes (login, logout, oauth callbacks)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const authUser = session.user;
        const current: AuthSession = {
          userId: authUser.id,
          email: authUser.email || '',
          name:
            authUser.user_metadata?.name ||
            authUser.user_metadata?.full_name ||
            authUser.email?.split('@')[0] ||
            'User',
          avatarUrl: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture,
          authProvider: authUser.app_metadata?.provider === 'google' ? 'google' : 'email',
          loggedInAt: new Date().toISOString(),
        };
        setCurrentUserSession(current);
        setActiveSession(current);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUserSession(null);
        clearActiveSession();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Reload user data from Supabase / Local Storage whenever current session changes
  useEffect(() => {
    if (!currentUserSession) return;

    let isMounted = true;

    async function loadUserData() {
      if (isSupabaseConfigured && currentUserSession) {
        try {
          const [fetchedExpenses, fetchedBudget, fetchedNotifs] = await Promise.all([
            supabaseFetchExpenses(currentUserSession.userId),
            supabaseFetchBudget(currentUserSession.userId, selectedMonthYear),
            supabaseFetchNotifications(currentUserSession.userId),
          ]);

          if (isMounted) {
            setExpenses(fetchedExpenses);
            if (fetchedBudget) setBudgetConfig(fetchedBudget);
            setNotifications(fetchedNotifs);
          }
          return;
        } catch (err) {
          console.warn('Failed to load directly from Supabase, fallback to local cache:', err);
        }
      }

      // Local fallback
      const account = getAccountById(currentUserSession.userId);
      if (account && isMounted) {
        if (Array.isArray(account.expenses)) setExpenses(account.expenses);
        if (account.budgetConfig) setBudgetConfig(account.budgetConfig);
        if (Array.isArray(account.notifications)) setNotifications(account.notifications);
      }
    }

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, [currentUserSession, selectedMonthYear]);

  // Handle Login Event from AuthView
  const handleLoginSuccess = (session: AuthSession) => {
    setCurrentUserSession(session);
    setActiveTab('dashboard');
  };

  // Handle Logout Event
  const handleLogout = async () => {
    soundEngine.playCoinSound();
    if (isSupabaseConfigured) {
      await supabaseSignOut();
    }
    clearActiveSession();
    setCurrentUserSession(null);
  };

  // Handle Guest Mode
  const handleGuestExplore = () => {
    const result = signInAsGuest();
    if (result.success && result.session) {
      setCurrentUserSession(result.session);
      setActiveTab('dashboard');
    }
  };

  // Sync Expenses to Local Storage and User Account
  useEffect(() => {
    saveExpenses(expenses);
    if (currentUserSession) {
      syncUserExpenses(currentUserSession.userId, expenses);
    }
  }, [expenses, currentUserSession]);

  // Sync Budget Config to Local Storage and User Account
  useEffect(() => {
    saveBudgetConfig(budgetConfig);
    if (currentUserSession) {
      syncUserBudget(currentUserSession.userId, budgetConfig);
    }
  }, [budgetConfig, currentUserSession]);

  // Sync Notifications
  useEffect(() => {
    saveNotifications(notifications);
    if (currentUserSession) {
      syncUserNotifications(currentUserSession.userId, notifications);
    }
  }, [notifications, currentUserSession]);

  // Sync Sound
  const handleToggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    soundEngine.setEnabled(newState);
    if (newState) {
      soundEngine.playCoinSound();
    }
  };

  // Sync Theme to HTML document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Generate Smart Notifications
  const refreshSmartAlerts = useCallback(() => {
    const monthExpenses = expenses.filter((e) => e.date.startsWith(selectedMonthYear));
    const totalSpent = monthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    const remaining = budgetConfig.totalBudget - totalSpent;
    const percentUsed =
      budgetConfig.totalBudget > 0
        ? (totalSpent / budgetConfig.totalBudget) * 100
        : 0;

    const newAlerts: ReminderNotification[] = [];
    const nowStr = new Date().toISOString();

    // 1. Over budget alert
    if (remaining < 0 && budgetConfig.lowBalanceAlertEnabled !== false) {
      newAlerts.push({
        id: `alert-overbudget-${selectedMonthYear}`,
        title: 'Budget Exceeded!',
        message: `You are over budget by ₹${Math.abs(remaining).toLocaleString('en-IN')}.`,
        type: 'danger',
        timestamp: nowStr,
        read: false,
      });
    }
    // 2. 80% overuse warning
    else if (
      percentUsed >= (budgetConfig.warningThresholdPercent || 80) &&
      budgetConfig.overuseAlertEnabled !== false
    ) {
      newAlerts.push({
        id: `alert-overuse-${selectedMonthYear}`,
        title: 'Budget Overuse Warning',
        message: `You have consumed ${percentUsed.toFixed(0)}% of your monthly limit.`,
        type: 'warning',
        timestamp: nowStr,
        read: false,
      });
    }
    // 3. Minimum Money / Low balance alert
    else if (
      remaining <= (budgetConfig.lowBalanceThreshold || 5000) &&
      remaining > 0 &&
      budgetConfig.lowBalanceAlertEnabled !== false
    ) {
      newAlerts.push({
        id: `alert-lowbalance-${selectedMonthYear}`,
        title: 'Low Balance Notice',
        message: `Only ₹${remaining.toLocaleString('en-IN')} remaining this month.`,
        type: 'warning',
        timestamp: nowStr,
        read: false,
      });
    }

    // 4. Daily reminder check
    const todayStr = getTodayDateStr();
    const todayCount = expenses.filter((e) => e.date === todayStr).length;
    if (todayCount === 0 && budgetConfig.dailyReminderEnabled !== false) {
      newAlerts.push({
        id: `alert-daily-${todayStr}`,
        title: 'Daily Expense Reminder',
        message: "Remember to log today's expenses to keep your streak intact.",
        type: 'info',
        timestamp: nowStr,
        read: false,
      });
    }

    setNotifications((prev) => {
      const existingIds = new Set(prev.map((n) => n.id));
      const additions = newAlerts.filter((n) => !existingIds.has(n.id));
      if (additions.length > 0 && isSupabaseConfigured && currentUserSession) {
        additions.forEach((notif) => {
          supabaseInsertNotification(currentUserSession.userId, notif);
        });
      }
      return [...additions, ...prev];
    });
  }, [expenses, budgetConfig, selectedMonthYear, currentUserSession]);

  useEffect(() => {
    refreshSmartAlerts();
  }, [refreshSmartAlerts]);

  // Generate Financial Insights client-side
  const fetchAiInsights = () => {
    setIsLoadingInsight(true);
    setTimeout(() => {
      const monthExpenses = expenses.filter((e) => e.date.startsWith(selectedMonthYear));
      const totalSpent = monthExpenses.reduce((acc, curr) => acc + curr.amount, 0);

      const categoryBreakdown: Record<string, number> = {};
      monthExpenses.forEach((e) => {
        categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + e.amount;
      });

      const topCat = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0];
      const topCatName = topCat ? topCat[0] : 'Food & Dining';
      const topCatAmount = topCat ? topCat[1] : 0;
      const budgetPct =
        budgetConfig.totalBudget > 0 ? Math.round((totalSpent / budgetConfig.totalBudget) * 100) : 0;

      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (budgetPct >= 90) status = 'critical';
      else if (budgetPct >= 75) status = 'warning';

      setAiInsight({
        status,
        headline: topCat
          ? `Watch your ${topCatName} spends (₹${topCatAmount.toLocaleString('en-IN')})`
          : 'Smart budget optimization',
        tips: [
          `Your highest spending category this month is ${topCatName}.`,
          'Allocating 20% directly to emergency savings upon income credit maintains safety buffers.',
          'Reviewing recurring subscription plans can yield an estimated ₹1,500 - ₹3,000 monthly surplus.',
        ],
        projectedSpend: Math.round(totalSpent * 1.15) || 35000,
        savingAdvice: 'Maintaining under 70% spend velocity by mid-month ensures a healthy reserve.',
      });
      setIsLoadingInsight(false);
    }, 250);
  };

  useEffect(() => {
    fetchAiInsights();
  }, [selectedMonthYear, expenses.length]);

  // Expense Handlers (Supabase PostgreSQL + State)
  const handleAddExpense = async (expenseData: Omit<ExpenseItem, 'id' | 'createdAt'>) => {
    const tempId = `exp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newItem: ExpenseItem = {
      ...expenseData,
      id: tempId,
      createdAt: new Date().toISOString(),
    };

    setExpenses((prev) => [newItem, ...prev]);

    if (isSupabaseConfigured && currentUserSession) {
      try {
        const saved = await supabaseInsertExpense(currentUserSession.userId, expenseData);
        setExpenses((prev) => prev.map((e) => (e.id === tempId ? saved : e)));
      } catch (err) {
        console.error('Supabase expense insertion error:', err);
      }
    }
  };

  const handleDeleteExpense = async (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));

    if (isSupabaseConfigured && currentUserSession) {
      try {
        await supabaseDeleteExpense(currentUserSession.userId, id);
      } catch (err) {
        console.error('Supabase expense delete error:', err);
      }
    }
  };

  // Budget Update Handler (Supabase PostgreSQL + State)
  const handleUpdateBudgetConfig = async (newConfig: BudgetConfig) => {
    setBudgetConfig(newConfig);

    if (isSupabaseConfigured && currentUserSession) {
      try {
        await supabaseUpsertBudget(currentUserSession.userId, newConfig);
      } catch (err) {
        console.error('Supabase budget update error:', err);
      }
    }
  };

  // Notification Handlers (Supabase PostgreSQL + State)
  const handleMarkNotificationRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    if (isSupabaseConfigured && currentUserSession) {
      await supabaseMarkNotificationRead(currentUserSession.userId, id);
    }
  };

  const handleClearAllNotifications = async () => {
    setNotifications([]);

    if (isSupabaseConfigured && currentUserSession) {
      await supabaseClearAllNotifications(currentUserSession.userId);
    }
  };

  // Data import / Reset
  const handleResetSampleData = () => {
    setExpenses(DEFAULT_EXPENSES);
    soundEngine.playCoinSound();
  };

  const handleImportData = (data: { expenses: ExpenseItem[]; budget: BudgetConfig }) => {
    setExpenses(data.expenses);
    setBudgetConfig(data.budget);
  };

  // If no active session, display AuthView
  if (!currentUserSession) {
    return (
      <AuthView
        onLoginSuccess={handleLoginSuccess}
        onExploreAsGuest={handleGuestExplore}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-[#1E293B] dark:text-[#F8FAFC] flex">
      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCoinModal={() => setIsCoinModalOpen(true)}
        onQuickAddClick={() => setActiveTab('add-expense')}
        currentUser={currentUserSession}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-60 min-h-screen">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onClearAllNotifications={handleClearAllNotifications}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onOpenCoinModal={() => setIsCoinModalOpen(true)}
          selectedMonthYear={selectedMonthYear}
          onChangeMonthYear={setSelectedMonthYear}
          totalBudget={budgetConfig.totalBudget}
          currentUser={currentUserSession}
          onLogout={handleLogout}
        />

        {/* View Routing */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-12">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              expenses={expenses}
              budgetConfig={budgetConfig}
              selectedMonthYear={selectedMonthYear}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
              onViewAllClick={() => setActiveTab('reports')}
              onOpenReceiptScanner={() => setActiveTab('receipt-scanner')}
              aiInsight={aiInsight}
              isLoadingInsight={isLoadingInsight}
              onRefreshInsight={fetchAiInsights}
            />
          )}

          {activeTab === 'add-expense' && (
            <AddExpenseView
              budgetConfig={budgetConfig}
              currentExpenses={expenses}
              selectedMonthYear={selectedMonthYear}
              onAddExpense={handleAddExpense}
              onDone={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'receipt-scanner' && (
            <ReceiptScanner
              currentUser={currentUserSession}
              onAddExpense={handleAddExpense}
              onDone={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              expenses={expenses}
              budgetConfig={budgetConfig}
              selectedMonthYear={selectedMonthYear}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {activeTab === 'budget' && (
            <BudgetManager
              budgetConfig={budgetConfig}
              onUpdateBudgetConfig={handleUpdateBudgetConfig}
              expenses={expenses}
              selectedMonthYear={selectedMonthYear}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              budgetConfig={budgetConfig}
              onUpdateBudgetConfig={handleUpdateBudgetConfig}
              expenses={expenses}
              onResetSampleData={handleResetSampleData}
              onImportData={handleImportData}
              soundEnabled={soundEnabled}
              onToggleSound={handleToggleSound}
              theme={theme}
              onSetTheme={setTheme}
              currentUser={currentUserSession}
              onLogout={handleLogout}
            />
          )}
        </main>
      </div>

      {/* Interactive 3D Coin Modal */}
      <InteractiveCoinModal
        isOpen={isCoinModalOpen}
        onClose={() => setIsCoinModalOpen(false)}
      />
    </div>
  );
}
