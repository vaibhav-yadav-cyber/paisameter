import React, { useState, useRef, useEffect } from 'react';
import { soundEngine } from '../utils/audio';
import { LOGO_FRONT_URL } from '../utils/constants';
import { ReminderNotification, AuthSession } from '../types';
import { formatCurrency } from '../utils/storage';
import { NavTab } from './Sidebar';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  notifications: ReminderNotification[];
  onMarkNotificationRead: (id: string) => void;
  onClearAllNotifications: () => void;
  theme: 'light' | 'dark' | 'system';
  onToggleTheme: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenCoinModal: () => void;
  selectedMonthYear: string;
  onChangeMonthYear: (my: string) => void;
  totalBudget?: number;
  currentUser?: AuthSession | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  notifications,
  onMarkNotificationRead,
  onClearAllNotifications,
  theme,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  onOpenCoinModal,
  selectedMonthYear,
  onChangeMonthYear,
  totalBudget = 50000,
  currentUser,
  onLogout,
}) => {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      {/* Mobile Sticky Top Header */}
      <header className="flex md:hidden justify-between items-center w-full px-4 h-14 sticky top-0 z-40 bg-[#0F172A] text-white border-b border-slate-800">
        <div
          onClick={() => {
            soundEngine.playCoinTossFearHungerSound();
            onOpenCoinModal();
          }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <img
            src={LOGO_FRONT_URL}
            alt="PaisaMeter"
            className="w-8 h-8 rounded-lg object-contain border border-[#10B981]/40 bg-white p-0.5"
          />
          <div className="flex flex-col">
            <span className="text-sm font-extrabold tracking-tight">
              <span className="text-white">Paisa</span>
              <span className="text-[#10B981]">Meter</span>
            </span>
            <span className="text-[9px] text-[#94A3B8] font-medium leading-none">
              Har Paise Ka Hisab
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {soundEnabled ? 'volume_up' : 'volume_off'}
            </span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Toggle Light/Dark Theme"
          >
            <span className="material-symbols-outlined text-[18px]">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors relative"
            >
              <span className="material-symbols-outlined text-[20px] text-[#F59E0B]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-[#0F172A]"></span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Navy Header bar (matches schematic on Dashboard) */}
      <header className="hidden md:flex justify-between items-center w-full px-6 h-14 sticky top-0 z-30 bg-[#0F172A] text-white border-b border-slate-800 shrink-0 shadow-xs">
        {/* Left: Active Budget Summary & Period Selector */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Period:
            </span>
            <input
              type="month"
              value={selectedMonthYear}
              onChange={(e) => onChangeMonthYear(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs font-bold text-slate-100 px-2.5 py-1 rounded-md focus:ring-1 focus:ring-[#10B981] focus:outline-none cursor-pointer"
            />
          </div>

          <div className="hidden lg:flex items-center gap-2 border-l border-slate-700/80 pl-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Monthly Budget:
            </span>
            <span className="text-xs font-bold font-mono text-[#10B981] bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-md">
              {formatCurrency(totalBudget)} / month
            </span>
          </div>

          <div className="hidden xl:flex items-center gap-1.5 border-l border-slate-700/80 pl-4">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
              PaisaMeter Active
            </span>
          </div>
        </div>

        {/* Right utility controls & Profile */}
        <div className="flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
              soundEnabled
                ? 'bg-slate-800/90 border-slate-700 text-emerald-400'
                : 'bg-slate-900/60 border-slate-800 text-slate-400'
            }`}
            title="Toggle Sound Effects"
          >
            <span className="material-symbols-outlined text-[15px]">
              {soundEnabled ? 'volume_up' : 'volume_off'}
            </span>
            <span className="text-[11px] font-semibold">{soundEnabled ? 'Sound ON' : 'Muted'}</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors"
            title="Toggle Theme"
          >
            <span className="material-symbols-outlined text-[15px] text-[#F59E0B]">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
            <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
          </button>

          {/* Interactive Coin Trigger */}
          <button
            onClick={onOpenCoinModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer"
            title="Flip 3D Metallic Coin"
          >
            <span className="material-symbols-outlined text-[15px] text-amber-400">
              monetization_on
            </span>
            <span>3D Coin</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 p-1.5 rounded-md transition-colors flex items-center justify-center relative"
              title="Notifications & Smart Alerts"
            >
              <span className="material-symbols-outlined text-[18px] text-[#F59E0B]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] text-white text-[9px] font-mono font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Menu */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#0F172A] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden text-slate-900 dark:text-slate-100">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#F59E0B] text-[16px]">
                      notifications_active
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Smart Alerts & Reminders
                    </h4>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={onClearAllNotifications}
                      className="text-[10px] text-slate-500 hover:text-red-500 transition-colors font-semibold"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="p-5 text-center text-xs text-slate-400">
                      <span className="material-symbols-outlined text-2xl mb-1 text-emerald-500 block">
                        check_circle
                      </span>
                      No active alerts. All budget parameters healthy!
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => onMarkNotificationRead(n.id)}
                        className={`p-2.5 text-xs transition-colors cursor-pointer ${
                          !n.read
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span
                            className={`material-symbols-outlined text-[16px] shrink-0 mt-0.5 ${
                              n.type === 'danger'
                                ? 'text-[#EF4444]'
                                : n.type === 'warning'
                                ? 'text-[#F59E0B]'
                                : 'text-[#10B981]'
                            }`}
                          >
                            {n.type === 'danger'
                              ? 'error'
                              : n.type === 'warning'
                              ? 'warning'
                              : 'info'}
                          </span>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                              {n.title}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-tight">
                              {n.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Badge & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 pl-3 border-l border-slate-700/80 cursor-pointer group text-left"
              title="Account Menu"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#10B981] to-emerald-400 text-[#0F172A] font-black text-xs flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden shadow-xs">
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentUser?.name?.charAt(0).toUpperCase() || 'P'
                )}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-200 group-hover:text-white leading-none truncate max-w-[100px]">
                  {currentUser?.name || 'Praveen LP'}
                </span>
                <span className="text-[10px] text-emerald-400 font-medium leading-none mt-0.5">
                  {currentUser?.authProvider === 'google' ? 'Google Connected' : 'Online'}
                </span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-white">
                expand_more
              </span>
            </button>

            {/* User Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1E293B] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-scale-up">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700/80">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentUser?.name || 'Praveen LP'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                    {currentUser?.email || 'praveenlp45@gmail.com'}
                  </p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      setActiveTab('settings');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-slate-400">
                      manage_accounts
                    </span>
                    <span>Account Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      setActiveTab('budget');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#10B981]">
                      account_balance_wallet
                    </span>
                    <span>Budget Configuration</span>
                  </button>
                </div>

                {onLogout && (
                  <div className="pt-1 border-t border-slate-100 dark:border-slate-700/80">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 font-semibold cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">logout</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0F172A] border-t border-slate-200 dark:border-slate-800 flex justify-around items-center h-14 z-50 px-2 shadow-lg">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
          { id: 'add-expense', label: 'Add', icon: 'add_circle' },
          { id: 'receipt-scanner', label: 'Scan', icon: 'document_scanner' },
          { id: 'reports', label: 'Reports', icon: 'bar_chart' },
          { id: 'budget', label: 'Budget', icon: 'account_balance_wallet' },
        ].map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as NavTab)}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="text-[9px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
