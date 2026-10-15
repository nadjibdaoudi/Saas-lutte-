import React from 'react';
import { 
  Search, Bell, Shield, User,
  Zap, LogOut, Bot, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { UserRole } from '../../types';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenQuickSession: () => void;
  onOpenAuditLog: () => void;
  onOpenAiAssistant?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenNotifications,
  onOpenQuickSession,
  onOpenAuditLog,
  onOpenAiAssistant
}) => {
  const { user, organization, language, setLanguage, switchRole, logout, t } = useAuth();
  const { notifications } = useData();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="h-16 bg-[#1E293B] border-b border-slate-700 text-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 shadow-md">
      {/* Left: Search Trigger & Club Badge */}
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        <div 
          className="hidden sm:flex items-center space-x-2 bg-[#0F172A]/90 hover:bg-[#0F172A] text-slate-300 px-3.5 py-1.5 rounded-lg border border-slate-700 cursor-pointer transition text-xs shadow-inner"
          onClick={onOpenSearch}
        >
          <Search className="w-4 h-4 text-orange-500" />
          <span>{t.search}</span>
          <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-400 font-mono border border-slate-700">⌘K</kbd>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/80">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-semibold text-slate-200 truncate max-w-[200px]">
            {organization.name}
          </span>
        </div>
      </div>

      {/* Right: AI Assistant, Quick Matside Action, Language (EN/AR), Notifications, Role Switcher, Profile */}
      <div className="flex items-center space-x-3 rtl:space-x-reverse">
        {/* AI Assistant Button */}
        {onOpenAiAssistant && (
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-md shadow-orange-500/20"
            title="Wrestling AI Assistant"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">AI Coach</span>
            <Sparkles className="w-3 h-3 text-amber-200" />
          </button>
        )}

        {/* Matside Quick Entry Button */}
        {user?.role !== 'athlete' && (
          <button
            onClick={onOpenQuickSession}
            className="flex items-center space-x-1.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs transition shadow-md shadow-orange-500/20"
            title="Matside Rapid Test Entry Matrix"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="hidden md:inline">{t.quickEntry}</span>
          </button>
        )}

        {/* Audit Log Trigger */}
        <button
          onClick={onOpenAuditLog}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition border border-transparent hover:border-slate-700"
          title="Audit Trail Logs"
        >
          <Shield className="w-4 h-4" />
        </button>

        {/* Language Switcher (EN & AR) */}
        <div className="flex items-center bg-[#0F172A] rounded-lg p-0.5 border border-slate-700 text-xs">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded font-semibold transition ${language === 'en' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('ar')}
            className={`px-2.5 py-1 rounded font-semibold transition ${language === 'ar' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            العربية
          </button>
        </div>

        {/* Notifications */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition border border-transparent hover:border-slate-700"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-[#1E293B]"></span>
          )}
        </button>

        {/* Role Selector */}
        <div className="hidden lg:flex items-center space-x-1.5 bg-[#0F172A] px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Role:</span>
          <select 
            value={user?.role || 'coach'} 
            onChange={(e) => switchRole(e.target.value as UserRole)}
            aria-label="Switch User Role"
            className="bg-transparent text-orange-400 font-bold focus:outline-none text-xs cursor-pointer"
          >
            <option value="coach" className="bg-[#1E293B] text-white">Head Coach</option>
            <option value="club_admin" className="bg-[#1E293B] text-white">Club Director</option>
            <option value="athlete" className="bg-[#1E293B] text-white">Wrestler View</option>
            <option value="super_admin" className="bg-[#1E293B] text-white">Super Admin</option>
          </select>
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-700 rtl:border-r rtl:border-l-0">
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover ring-2 ring-orange-500/50"
          />
          <div className="hidden md:block text-left rtl:text-right text-xs">
            <p className="font-bold text-white leading-tight">{user?.firstName} {user?.lastName}</p>
            <p className="text-[10px] text-orange-400 font-semibold uppercase tracking-wider">{user?.role?.replace('_', ' ')}</p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 rounded-lg transition"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
