import React from 'react';
import { soundEngine } from '../utils/audio';
import { LOGO_FRONT_URL } from '../utils/constants';
import { AuthSession } from '../types';

export type NavTab = 'dashboard' | 'add-expense' | 'receipt-scanner' | 'reports' | 'budget' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenCoinModal: () => void;
  onQuickAddClick: () => void;
  currentUser?: AuthSession | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCoinModal,
  onQuickAddClick,
  currentUser,
  onLogout,
}) => {
  const navItems: Array<{ id: NavTab; label: string; icon: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'add-expense', label: 'Add Expense', icon: 'add_circle' },
    { id: 'receipt-scanner', label: 'Receipt Scanner', icon: 'document_scanner' },
    { id: 'reports', label: 'Reports & Analytics', icon: 'bar_chart' },
    { id: 'budget', label: 'Budget Planner', icon: 'account_balance_wallet' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <nav className="hidden md:flex flex-col w-60 bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800 shadow-2xs h-screen fixed left-0 top-0 py-5 overflow-y-auto z-40">
      {/* Brand Header & Interactive Logo */}
      <div className="px-5 mb-6 flex items-center gap-3">
        <button
          onClick={() => {
            soundEngine.playCoinTossFearHungerSound();
            onOpenCoinModal();
          }}
          className="group relative cursor-pointer focus:outline-none transition-transform hover:scale-105 shrink-0"
          title="Click to flip 3D Coin & play sound"
        >
          <img
            src={LOGO_FRONT_URL}
            alt="PaisaMeter"
            className="w-10 h-10 rounded-xl object-contain border border-[#10B981]/30 bg-emerald-50/50 dark:bg-slate-900 p-0.5 shadow-2xs group-hover:border-[#10B981] transition-colors"
          />
        </button>
        <div className="overflow-hidden">
          <div className="flex items-center gap-1">
            <h1 className="text-base font-extrabold tracking-tight leading-none">
              <span className="text-[#0F172A] dark:text-[#F8FAFC]">Paisa</span>
              <span className="text-[#10B981]">Meter</span>
            </h1>
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
          </div>
          <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] truncate mt-0.5">
            Har Paise Ka Hisab
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 flex flex-col gap-1 px-3">
        <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold border-l-3 border-[#10B981] shadow-2xs'
                  : 'text-[#1E293B] dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[18px] ${
                  isActive ? 'text-[#10B981]' : 'text-[#64748B]'
                }`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Quick Add Action & User Card */}
      <div className="px-3 mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-2">
        <button
          onClick={onQuickAddClick}
          className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded-lg py-2 px-3 flex items-center justify-center gap-1.5 shadow-xs border border-slate-700 transition-all active:scale-98 text-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] text-[#10B981]">add_circle</span>
          <span>Log Expense</span>
        </button>

        {currentUser && (
          <div className="p-2 bg-slate-50 dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] font-bold text-xs flex items-center justify-center shrink-0">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  currentUser.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="truncate">
                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                  {currentUser.name}
                </p>
                <p className="text-[9px] text-slate-400 font-mono truncate">
                  {currentUser.email}
                </p>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1 text-slate-400 hover:text-red-500 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                title="Sign Out"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
