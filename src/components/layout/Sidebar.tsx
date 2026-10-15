import React from 'react';
import { 
  LayoutDashboard, Users, UserCheck, Activity, 
  Award, Dumbbell, CalendarCheck, Scale, 
  HeartPulse, Trophy, BarChart3, FileSpreadsheet, 
  Settings, ChevronRight 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export type ActiveTab = 
  | 'dashboard'
  | 'athletes'
  | 'teams'
  | 'tests'
  | 'assessments'
  | 'training'
  | 'attendance'
  | 'weight'
  | 'injuries'
  | 'competitions'
  | 'analytics'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile
}) => {
  const { user, t } = useAuth();
  const { athletes, injuries, competitions, testSessions } = useData();

  const activeAthletesCount = athletes.filter(a => a.status === 'active').length;
  const activeInjuriesCount = injuries.filter(i => i.status === 'active').length;

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: t.navDashboard, icon: LayoutDashboard },
    { id: 'athletes' as ActiveTab, label: t.navAthletes, icon: Users, badge: activeAthletesCount },
    { id: 'teams' as ActiveTab, label: t.navTeams, icon: UserCheck },
    { id: 'tests' as ActiveTab, label: t.navTests, icon: Activity, badge: testSessions.length },
    { id: 'assessments' as ActiveTab, label: t.navAssessments, icon: Award },
    { id: 'training' as ActiveTab, label: t.navTraining, icon: Dumbbell },
    { id: 'attendance' as ActiveTab, label: t.navAttendance, icon: CalendarCheck },
    { id: 'weight' as ActiveTab, label: t.navWeight, icon: Scale },
    { id: 'injuries' as ActiveTab, label: t.navInjuries, icon: HeartPulse, badge: activeInjuriesCount > 0 ? activeInjuriesCount : undefined, badgeColor: 'bg-rose-500' },
    { id: 'competitions' as ActiveTab, label: t.navCompetitions, icon: Trophy },
    { id: 'analytics' as ActiveTab, label: t.navAnalytics, icon: BarChart3 },
    { id: 'reports' as ActiveTab, label: t.navReports, icon: FileSpreadsheet },
    { id: 'settings' as ActiveTab, label: t.navSettings, icon: Settings },
  ];

  // Filter items if user is strictly in Athlete view
  const visibleItems = user?.role === 'athlete'
    ? navItems.filter(item => ['dashboard', 'athletes', 'tests', 'assessments', 'training', 'attendance', 'weight', 'competitions', 'reports'].includes(item.id))
    : navItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:static top-0 bottom-0 left-0 z-50
        w-64 bg-[#0F172A] text-slate-300 border-r border-slate-700
        flex flex-col transition-transform duration-200 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-700 bg-[#1E293B]">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center font-black text-white text-base shadow-md shadow-orange-500/30">
              WL
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-white text-base tracking-tight">Wrestle<span className="text-orange-500">Lab</span></span>
                <span className="text-[9px] bg-orange-500/10 text-orange-400 font-bold px-1.5 py-0.2 rounded border border-orange-500/30">GRECO</span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Performance OS</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Coaching Modules
          </div>

          {visibleItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold
                  transition-all duration-150 group
                  ${isActive 
                    ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-[#1E293B] border border-transparent hover:border-slate-700'}
                `}
              >
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center space-x-1">
                  {item.badge !== undefined && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold leading-none ${
                      isActive 
                        ? 'bg-[#0F172A] text-orange-400' 
                        : (item.badgeColor || 'bg-slate-800 text-slate-300 border border-slate-700')
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white rtl:rotate-180" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info: UWW Rulebook & Matside status */}
        <div className="p-4 border-t border-slate-700 bg-[#0F172A] text-xs">
          <div className="bg-[#1E293B] p-3 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between text-[11px] mb-1 font-bold text-slate-200">
              <span>UWW Ruleset</span>
              <span className="text-orange-400 font-mono">8pt Diff (VSU)</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Greco-Roman rubrics: Par Terre, Passivity, Souplesse, Pummeling.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
