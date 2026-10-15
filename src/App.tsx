import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { MainDashboard } from './components/dashboard/MainDashboard';
import { AthletesList } from './components/athletes/AthletesList';
import { AthleteDetailView } from './components/athletes/AthleteDetailView';
import { AthleteFormModal } from './components/athletes/AthleteFormModal';
import { TestLibraryView } from './components/tests/TestLibraryView';
import { MatsideRapidEntryModal } from './components/tests/MatsideRapidEntryModal';
import { WrestlingAssessmentView } from './components/assessments/WrestlingAssessmentView';
import { WrestlingAssessmentModal } from './components/assessments/WrestlingAssessmentModal';
import { TrainingView } from './components/training/TrainingView';
import { AttendanceView } from './components/attendance/AttendanceView';
import { WeightManagementView } from './components/weight/WeightManagementView';
import { InjuryHealthView } from './components/injuries/InjuryHealthView';
import { CompetitionsView } from './components/competitions/CompetitionsView';
import { TeamsView } from './components/teams/TeamsView';
import { TeamAnalyticsView } from './components/analytics/TeamAnalyticsView';
import { PerformanceReportView } from './components/reports/PerformanceReportView';
import { SettingsView } from './components/settings/SettingsView';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { NotificationsModal } from './components/common/NotificationsModal';
import { AuditLogModal } from './components/common/AuditLogModal';
import { AuthView } from './components/auth/AuthView';
import { Athlete } from './types';
import { Menu } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, language } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
  const [isMatsideOpen, setIsMatsideOpen] = useState(false);
  const [matsideSessionId, setMatsideSessionId] = useState<string | undefined>(undefined);
  const [isAthleteFormOpen, setIsAthleteFormOpen] = useState(false);
  const [athleteToEdit, setAthleteToEdit] = useState<Athlete | null>(null);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [assessmentAthleteId, setAssessmentAthleteId] = useState<string | undefined>(undefined);
  const [reportAthleteId, setReportAthleteId] = useState<string | undefined>(undefined);

  // If unauthenticated, show Auth View
  if (!user) {
    return <AuthView />;
  }

  const handleNavigate = (tab: ActiveTab, entityId?: string) => {
    setActiveTab(tab);
    if (tab === 'athletes' && entityId) {
      setSelectedAthleteId(entityId);
    } else if (tab === 'athletes' && !entityId) {
      setSelectedAthleteId(null);
    }
  };

  const handleOpenEditAthlete = (athlete: Athlete) => {
    setAthleteToEdit(athlete);
    setIsAthleteFormOpen(true);
  };

  const handleOpenAddAthlete = () => {
    setAthleteToEdit(null);
    setIsAthleteFormOpen(true);
  };

  const handleOpenMatside = (sessionId?: string) => {
    setMatsideSessionId(sessionId);
    setIsMatsideOpen(true);
  };

  const handleOpenAssessment = (athleteId?: string) => {
    setAssessmentAthleteId(athleteId);
    setIsAssessmentModalOpen(true);
  };

  const handleOpenReport = (athleteId: string) => {
    setReportAthleteId(athleteId);
    setActiveTab('reports');
  };

  return (
    <div className={`min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans antialiased`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Top Navbar */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenQuickSession={() => handleOpenMatside()}
        onOpenAuditLog={() => setIsAuditLogOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'athletes') setSelectedAthleteId(null);
          }}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#0F172A] p-4 lg:p-8">
          {/* Mobile Sidebar Toggle Button */}
          <div className="lg:hidden mb-4 flex items-center justify-between">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 bg-[#1E293B] border border-slate-700 rounded-lg text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-orange-400 capitalize">
              {activeTab} Module
            </span>
          </div>

          {/* Views Routing */}
          {activeTab === 'dashboard' && (
            <MainDashboard
              onNavigate={handleNavigate}
              onOpenQuickSession={() => handleOpenMatside()}
            />
          )}

          {activeTab === 'athletes' && (
            selectedAthleteId ? (
              <AthleteDetailView
                athleteId={selectedAthleteId}
                onBack={() => setSelectedAthleteId(null)}
                onOpenEdit={handleOpenEditAthlete}
                onOpenAssessmentModal={handleOpenAssessment}
                onOpenReport={handleOpenReport}
              />
            ) : (
              <AthletesList
                onSelectAthlete={(id) => setSelectedAthleteId(id)}
                onOpenAddAthlete={handleOpenAddAthlete}
              />
            )
          )}

          {activeTab === 'teams' && (
            <TeamsView
              onSelectAthlete={(id) => {
                setSelectedAthleteId(id);
                setActiveTab('athletes');
              }}
            />
          )}

          {activeTab === 'tests' && (
            <TestLibraryView
              onOpenMatsideEntry={handleOpenMatside}
              onOpenNewSession={() => handleOpenMatside()}
            />
          )}

          {activeTab === 'assessments' && (
            <WrestlingAssessmentView
              onOpenAssessmentModal={handleOpenAssessment}
              onSelectAthlete={(id) => {
                setSelectedAthleteId(id);
                setActiveTab('athletes');
              }}
            />
          )}

          {activeTab === 'training' && <TrainingView />}

          {activeTab === 'attendance' && <AttendanceView />}

          {activeTab === 'weight' && <WeightManagementView />}

          {activeTab === 'injuries' && <InjuryHealthView />}

          {activeTab === 'competitions' && <CompetitionsView />}

          {activeTab === 'analytics' && <TeamAnalyticsView />}

          {activeTab === 'reports' && (
            <PerformanceReportView initialAthleteId={reportAthleteId} />
          )}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Sleek Bottom Bar */}
      <footer className="bg-[#1E293B] border-t border-slate-700 px-6 py-2.5 flex flex-wrap justify-between items-center text-[10px] uppercase tracking-wider font-semibold text-slate-400 z-20">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <span className="flex items-center space-x-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>UWW Rule Engine: Active</span>
          </span>
          <span>•</span>
          <span>Greco-Roman Mat OS v2.6</span>
        </div>
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <span>Synced with Cloud RLS</span>
          <span className="text-orange-400">High Performance Lab</span>
        </div>
      </footer>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <AuditLogModal
        isOpen={isAuditLogOpen}
        onClose={() => setIsAuditLogOpen(false)}
      />

      <MatsideRapidEntryModal
        isOpen={isMatsideOpen}
        onClose={() => setIsMatsideOpen(false)}
        initialSessionId={matsideSessionId}
      />

      <AthleteFormModal
        isOpen={isAthleteFormOpen}
        onClose={() => setIsAthleteFormOpen(false)}
        athleteToEdit={athleteToEdit}
      />

      <WrestlingAssessmentModal
        isOpen={isAssessmentModalOpen}
        onClose={() => setIsAssessmentModalOpen(false)}
        initialAthleteId={assessmentAthleteId}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
