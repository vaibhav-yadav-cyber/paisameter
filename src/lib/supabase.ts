import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { ExpenseItem, BudgetConfig, ReminderNotification, AuthSession, CategoryType, PaymentMethodType } from '../types';

// Read public Supabase credentials (defaults to configured project djglkfaprzhbchqowncp)
const defaultSupabaseUrl = 'https://djglkfaprzhbchqowncp.supabase.co';
const defaultSupabaseKey = 'sb_publishable_gkmiffX9BwfEvlf-kB8PBw_6yP8x3dK';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || defaultSupabaseUrl;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || defaultSupabaseKey;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('placeholder')
);

// Create Supabase client singleton
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-anon-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * ============================================================================
 * SUPABASE AUTHENTICATION
 * ============================================================================
 */

export async function supabaseSignUp(email: string, password: string, name: string) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        name: name.trim(),
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
      },
    },
  });

  if (error) throw error;

  if (data.user) {
    try {
      // Upsert user profile if table exists
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name: name.trim(),
        email: data.user.email,
        avatar_url: data.user.user_metadata?.avatar_url,
        updated_at: new Date().toISOString(),
      });
    } catch (profileErr) {
      console.warn('Profile table upsert skipped or pending table creation:', profileErr);
    }
  }

  return data;
}

export async function supabaseSignIn(email: string, password: string) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) throw error;
  return data;
}

export async function supabaseSignInWithGoogle() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) throw error;
  return data;
}

export async function supabaseSignOut() {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Supabase sign out error:', error);
}

export async function supabaseResetPassword(email: string) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;
  return data;
}

export async function supabaseResendVerificationEmail(email: string) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email: email.trim().toLowerCase(),
    options: {
      emailRedirectTo: window.location.origin,
    },
  });

  if (error) throw error;
  return data;
}

export async function supabaseVerifyOtp(email: string, token: string) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanToken = token.trim();

  // Try signup token verification
  let res = await supabase.auth.verifyOtp({
    email: cleanEmail,
    token: cleanToken,
    type: 'signup',
  });

  // If signup type failed, try standard email OTP token
  if (res.error) {
    const emailRes = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'email',
    });
    if (!emailRes.error) {
      res = emailRes;
    }
  }

  if (res.error) throw res.error;
  return res.data;
}

export async function supabaseUpdatePassword(newPassword: string) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
  return data;
}

export async function supabaseGetCurrentSession(): Promise<AuthSession | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session || !session.user) return null;

    const user = session.user;
    return {
      userId: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      authProvider: user.app_metadata?.provider === 'google' ? 'google' : 'email',
      loggedInAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('Error fetching Supabase session:', err);
    return null;
  }
}

/**
 * ============================================================================
 * SUPABASE POSTGRESQL DATABASE - EXPENSES
 * ============================================================================
 */

export async function supabaseFetchExpenses(userId: string): Promise<ExpenseItem[]> {
  if (!isSupabaseConfigured || !userId) return [];

  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.warn('Supabase expenses query notice (using local data):', error.message || error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      amount: Number(row.amount),
      category: row.category as CategoryType,
      date: row.date,
      merchant: row.merchant,
      notes: row.notes || undefined,
      paymentMethod: row.payment_method as PaymentMethodType,
      receiptUrl: row.receipt_url || undefined,
      source: (row.source as any) || 'manual',
      items: row.items || undefined,
      createdAt: row.created_at,
    }));
  } catch (err: any) {
    console.warn('Network unreachable for Supabase expenses (fallback to local data):', err?.message || err);
    return [];
  }
}

export async function supabaseInsertExpense(userId: string, expense: Omit<ExpenseItem, 'id' | 'createdAt'> & { id?: string }): Promise<ExpenseItem> {
  const newId = expense.id || `exp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const createdAt = new Date().toISOString();

  const fallbackItem: ExpenseItem = {
    ...expense,
    id: newId,
    createdAt,
  };

  if (!isSupabaseConfigured || !userId) {
    return fallbackItem;
  }

  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        id: newId,
        user_id: userId,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        merchant: expense.merchant,
        notes: expense.notes || null,
        payment_method: expense.paymentMethod,
        receipt_url: expense.receiptUrl || null,
        source: expense.source,
        items: expense.items || [],
        created_at: createdAt,
      })
      .select()
      .single();

    if (error) {
      console.warn('Supabase expense insert notice (saved locally):', error.message || error);
      return fallbackItem;
    }

    return {
      id: data.id,
      amount: Number(data.amount),
      category: data.category as CategoryType,
      date: data.date,
      merchant: data.merchant,
      notes: data.notes || undefined,
      paymentMethod: data.payment_method as PaymentMethodType,
      receiptUrl: data.receipt_url || undefined,
      source: data.source || 'manual',
      items: data.items || undefined,
      createdAt: data.created_at,
    };
  } catch (err: any) {
    console.warn('Network error on Supabase expense insert (stored locally):', err?.message || err);
    return fallbackItem;
  }
}

export async function supabaseDeleteExpense(userId: string, expenseId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !userId) return true;

  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId)
      .eq('user_id', userId);

    if (error) {
      console.warn('Supabase expense delete notice:', error.message || error);
    }
  } catch (err: any) {
    console.warn('Network error on Supabase expense delete:', err?.message || err);
  }
  return true;
}

export async function supabaseBulkInsertExpenses(userId: string, expenses: ExpenseItem[]): Promise<void> {
  if (!isSupabaseConfigured || !userId || expenses.length === 0) return;

  const rows = expenses.map((e) => ({
    id: e.id,
    user_id: userId,
    amount: e.amount,
    category: e.category,
    date: e.date,
    merchant: e.merchant,
    notes: e.notes || null,
    payment_method: e.paymentMethod,
    receipt_url: e.receiptUrl || null,
    source: e.source,
    items: e.items || [],
    created_at: e.createdAt || new Date().toISOString(),
  }));

  try {
    const { error } = await supabase.from('expenses').upsert(rows, { onConflict: 'id' });
    if (error) {
      console.warn('Supabase bulk expenses notice:', error.message || error);
    }
  } catch (err: any) {
    console.warn('Network error on Supabase bulk expense sync:', err?.message || err);
  }
}

/**
 * ============================================================================
 * SUPABASE POSTGRESQL DATABASE - BUDGETS
 * ============================================================================
 */

export async function supabaseFetchBudget(userId: string, monthYear: string): Promise<BudgetConfig | null> {
  if (!isSupabaseConfigured || !userId) return null;

  try {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('month_year', monthYear)
      .maybeSingle();

    if (error) {
      console.warn('Supabase budget query notice (using local budget):', error.message || error);
      return null;
    }

    if (!data) return null;

    return {
      monthYear: data.month_year,
      totalBudget: Number(data.total_budget),
      lowBalanceThreshold: Number(data.low_balance_threshold ?? 2000),
      warningThresholdPercent: Number(data.warning_threshold_percent ?? 80),
      categoryBudgets: data.category_budgets || {},
      dailyReminderEnabled: data.daily_reminder_enabled ?? true,
      overuseAlertEnabled: data.overuse_alert_enabled ?? true,
      lowBalanceAlertEnabled: data.low_balance_alert_enabled ?? true,
      currencySymbol: data.currency_symbol || '₹',
    };
  } catch (err: any) {
    console.warn('Network unreachable for Supabase budget (using local budget):', err?.message || err);
    return null;
  }
}

export async function supabaseUpsertBudget(userId: string, config: BudgetConfig): Promise<void> {
  if (!isSupabaseConfigured || !userId) return;

  try {
    const { error } = await supabase.from('budgets').upsert(
      {
        user_id: userId,
        month_year: config.monthYear,
        total_budget: config.totalBudget,
        low_balance_threshold: config.lowBalanceThreshold,
        warning_threshold_percent: config.warningThresholdPercent,
        category_budgets: config.categoryBudgets || {},
        daily_reminder_enabled: config.dailyReminderEnabled ?? true,
        overuse_alert_enabled: config.overuseAlertEnabled ?? true,
        low_balance_alert_enabled: config.lowBalanceAlertEnabled ?? true,
        currency_symbol: config.currencySymbol || '₹',
      },
      { onConflict: 'user_id,month_year' }
    );

    if (error) {
      console.warn('Supabase budget upsert notice (saved locally):', error.message || error);
    }
  } catch (err: any) {
    console.warn('Network error on Supabase budget upsert (saved locally):', err?.message || err);
  }
}

/**
 * ============================================================================
 * SUPABASE POSTGRESQL DATABASE - NOTIFICATIONS
 * ============================================================================
 */

export async function supabaseFetchNotifications(userId: string): Promise<ReminderNotification[]> {
  if (!isSupabaseConfigured || !userId) return [];

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.warn('Supabase notifications query notice (using local alerts):', error.message || error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      message: row.message,
      type: row.type as any,
      timestamp: row.timestamp,
      read: row.read,
      actionUrl: row.action_url || undefined,
    }));
  } catch (err: any) {
    console.warn('Network unreachable for Supabase notifications (using local alerts):', err?.message || err);
    return [];
  }
}

export async function supabaseInsertNotification(userId: string, notification: ReminderNotification): Promise<void> {
  if (!isSupabaseConfigured || !userId) return;

  try {
    const { error } = await supabase.from('notifications').insert({
      id: notification.id,
      user_id: userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      timestamp: notification.timestamp,
      read: notification.read,
      action_url: notification.actionUrl || null,
    });

    if (error) {
      console.warn('Supabase notification insert notice:', error.message || error);
    }
  } catch (err: any) {
    console.warn('Network error on Supabase notification insert:', err?.message || err);
  }
}

export async function supabaseMarkNotificationRead(userId: string, notificationId: string): Promise<void> {
  if (!isSupabaseConfigured || !userId) return;

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      console.warn('Supabase notification mark read notice:', error.message || error);
    }
  } catch (err: any) {
    console.warn('Network error on Supabase notification mark read:', err?.message || err);
  }
}

export async function supabaseClearAllNotifications(userId: string): Promise<void> {
  if (!isSupabaseConfigured || !userId) return;

  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.warn('Supabase notification clear notice:', error.message || error);
    }
  } catch (err: any) {
    console.warn('Network error on Supabase notification clear:', err?.message || err);
  }
}

/**
 * ============================================================================
 * SUPABASE STORAGE - RECEIPTS (Images & PDFs)
 * ============================================================================
 */

export async function supabaseUploadReceipt(
  userId: string,
  fileOrBlob: File | Blob | string,
  fileName: string,
  mimeType: string = 'image/jpeg'
): Promise<string> {
  if (!isSupabaseConfigured) {
    // If string is already data URL, return it
    if (typeof fileOrBlob === 'string') return fileOrBlob;
    return URL.createObjectURL(fileOrBlob);
  }

  let blobToUpload: Blob;

  if (typeof fileOrBlob === 'string') {
    // Base64 data URL convert to Blob
    if (fileOrBlob.startsWith('data:')) {
      const parts = fileOrBlob.split(',');
      const match = parts[0].match(/:(.*?);/);
      const contentType = match ? match[1] : mimeType;
      const byteCharacters = atob(parts[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      blobToUpload = new Blob([byteArray], { type: contentType });
    } else {
      return fileOrBlob;
    }
  } else {
    blobToUpload = fileOrBlob;
  }

  const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${userId}/${Date.now()}_${cleanName}`;

  try {
    // Upload to Supabase Storage 'receipts' bucket
    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(filePath, blobToUpload, {
        contentType: blobToUpload.type || mimeType,
        upsert: true,
      });

    if (error) {
      console.warn('Supabase Storage notice (using offline receipt):', error.message || error);
      if (typeof fileOrBlob === 'string') return fileOrBlob;
      return URL.createObjectURL(fileOrBlob);
    }

    if (!data?.path) {
      if (typeof fileOrBlob === 'string') return fileOrBlob;
      return URL.createObjectURL(fileOrBlob);
    }

    // Retrieve public URL
    const { data: publicUrlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (err: any) {
    console.warn('Network error on Supabase Storage upload (using local receipt):', err?.message || err);
    if (typeof fileOrBlob === 'string') return fileOrBlob;
    return URL.createObjectURL(fileOrBlob);
  }
}
