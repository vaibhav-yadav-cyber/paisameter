import React, { useState } from 'react';
import { BudgetConfig, ExpenseItem, AuthSession } from '../types';
import { soundEngine } from '../utils/audio';
import { DEFAULT_EXPENSES } from '../utils/constants';

interface SettingsViewProps {
  budgetConfig: BudgetConfig;
  onUpdateBudgetConfig: (cfg: BudgetConfig) => void;
  expenses: ExpenseItem[];
  onResetSampleData: () => void;
  onImportData: (data: { expenses: ExpenseItem[]; budget: BudgetConfig }) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  theme: 'light' | 'dark' | 'system';
  onSetTheme: (t: 'light' | 'dark' | 'system') => void;
  currentUser?: AuthSession | null;
  onLogout?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  budgetConfig,
  onUpdateBudgetConfig,
  expenses,
  onResetSampleData,
  onImportData,
  soundEnabled,
  onToggleSound,
  theme,
  onSetTheme,
  currentUser,
  onLogout,
}) => {
  const [dailyReminder, setDailyReminder] = useState(
    budgetConfig.dailyReminderEnabled !== false
  );
  const [overuseAlert, setOveruseAlert] = useState(
    budgetConfig.overuseAlertEnabled !== false
  );
  const [lowBalanceAlert, setLowBalanceAlert] = useState(
    budgetConfig.lowBalanceAlertEnabled !== false
  );
  const [currencySymbol, setCurrencySymbol] = useState(
    budgetConfig.currencySymbol || '₹'
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playCoinSound();
    onUpdateBudgetConfig({
      ...budgetConfig,
      dailyReminderEnabled: dailyReminder,
      overuseAlertEnabled: overuseAlert,
      lowBalanceAlertEnabled: lowBalanceAlert,
      currencySymbol,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Export JSON
  const handleExportJSON = () => {
    const data = {
      expenses,
      budgetConfig,
      exportedAt: new Date().toISOString(),
      app: 'PaisaMeter',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PaisaMeter_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.expenses && parsed.budgetConfig) {
          onImportData({
            expenses: parsed.expenses,
            budget: parsed.budgetConfig,
          });
          soundEngine.playCoinSound();
          alert('Data imported successfully!');
        } else {
          alert('Invalid PaisaMeter backup file format.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-12 flex flex-col gap-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[24px]">
            settings
          </span>
          Settings & Smart Reminders
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure notifications, budget alerts, sound effects, and data backup
        </p>
      </div>

      {/* User Account & Authentication Status */}
      {currentUser && (
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#10B981] to-emerald-700 text-white font-extrabold text-base flex items-center justify-center shadow-md">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  currentUser.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {currentUser.name}
                  </h3>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      currentUser.authProvider === 'google'
                        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                    }`}
                  >
                    {currentUser.authProvider === 'google' ? 'Google Auth' : 'Verified Email'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  {currentUser.email}
                </p>
              </div>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="self-start sm:self-center px-3.5 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Sign Out Account</span>
              </button>
            )}
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl p-3 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 shadow-2xs">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>Preferences updated and saved!</span>
        </div>
      )}

      <form onSubmit={handleSavePreferences} className="flex flex-col gap-4">
        {/* Smart Reminders Section */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-amber-500 text-[18px]">
              notifications_active
            </span>
            Smart Reminders & Notifications
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3.5">
            Automated alerts to keep you financially disciplined and avoid overspending.
          </p>

          <div className="space-y-2.5">
            <label className="flex items-start justify-between p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200/80 dark:border-slate-800 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Daily Expense Tracking Reminder
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Sends an alert if no expenses have been recorded for the day.
                </p>
              </div>
              <input
                type="checkbox"
                checked={dailyReminder}
                onChange={(e) => setDailyReminder(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500 cursor-pointer mt-0.5"
              />
            </label>

            <label className="flex items-start justify-between p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200/80 dark:border-slate-800 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  80% Budget Overuse Warning
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Proactively alerts you when 80% or more of your monthly budget is spent.
                </p>
              </div>
              <input
                type="checkbox"
                checked={overuseAlert}
                onChange={(e) => setOveruseAlert(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500 cursor-pointer mt-0.5"
              />
            </label>

            <label className="flex items-start justify-between p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200/80 dark:border-slate-800 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Minimum Balance & Over-Budget Alert
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Instant red warning banner when remaining balance reaches danger zone or zero.
                </p>
              </div>
              <input
                type="checkbox"
                checked={lowBalanceAlert}
                onChange={(e) => setLowBalanceAlert(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500 cursor-pointer mt-0.5"
              />
            </label>
          </div>
        </div>

        {/* Display & Sound Settings */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-blue-600 text-[18px]">
              palette
            </span>
            Sound & Appearance
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                Audio Sound Effects
              </label>
              <button
                type="button"
                onClick={onToggleSound}
                className="w-full flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-500 text-[16px]">
                    {soundEnabled ? 'volume_up' : 'volume_off'}
                  </span>
                  <span>{soundEnabled ? 'Enabled (Coin Sounds)' : 'Muted'}</span>
                </span>
                <span className="text-blue-600 font-bold">Toggle</span>
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onSetTheme('light')}
                  className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                    theme === 'light'
                      ? 'border-blue-500 bg-blue-50 text-blue-800'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">light_mode</span>
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => onSetTheme('dark')}
                  className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                    theme === 'dark'
                      ? 'border-blue-500 bg-blue-950/40 text-blue-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">dark_mode</span>
                  Dark
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-5 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">save</span>
          <span>Save All Settings</span>
        </button>
      </form>

      {/* Data Backup & Restore */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-blue-500 text-[18px]">
            database
          </span>
          Data Management & Backup
        </h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
          Export your complete expense database as JSON or reset to default demo records.
        </p>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportJSON}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            Export JSON Backup
          </button>

          <label className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer">
            <span className="material-symbols-outlined text-[16px]">file_upload</span>
            Import Backup
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              if (
                window.confirm(
                  'Are you sure you want to reset your transactions to the sample demo data?'
                )
              ) {
                onResetSampleData();
              }
            }}
            className="text-red-600 hover:text-red-700 dark:text-red-400 font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 border border-red-200 dark:border-red-900/60 ml-auto cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            Reset Demo Data
          </button>
        </div>
      </div>
    </div>
  );
};
