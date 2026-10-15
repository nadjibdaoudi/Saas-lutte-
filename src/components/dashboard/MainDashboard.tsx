import React from 'react';
import { 
  Users, Activity, CalendarCheck, Scale, 
  TrendingUp, AlertTriangle, Trophy, Dumbbell, 
  ArrowUpRight, ArrowDownRight, ChevronRight, Zap, 
  Award, CheckCircle2 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, BarChart, Bar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { ActiveTab } from '../layout/Sidebar';

interface MainDashboardProps {
  onNavigate: (tab: ActiveTab, entityId?: string) => void;
  onOpenQuickSession: () => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  onNavigate,
  onOpenQuickSession
}) => {
  const { user, t } = useAuth();
  const { 
    athletes, teams, tests, testSessions, testResults, 
    wrestlingAssessments, injuries, competitions, matches 
  } = useData();

  // Metrics
  const activeAthletes = athletes.filter(a => a.status === 'active');
  const injuredAthletes = athletes.filter(a => a.status === 'injured');
  const improvingAthletes = athletes.filter(a => a.trend === 'improving');
  const decliningAthletes = athletes.filter(a => a.trend === 'declining' || a.status === 'injured');
  
  const avgPhysicalScore = Math.round(
    athletes.reduce((acc, a) => acc + (a.physicalScore || 80), 0) / (athletes.length || 1)
  );
  const avgWrestlingScore = Math.round(
    athletes.reduce((acc, a) => acc + (a.wrestlingScore || 80), 0) / (athletes.length || 1)
  );
  const avgAttendance = Math.round(
    athletes.reduce((acc, a) => acc + (a.attendanceRate || 95), 0) / (athletes.length || 1)
  );

  const nextSession = testSessions.find(s => s.status === 'planned') || testSessions[0];
  const nextComp = competitions[0];

  // Performance Trend data (Macrocycle Testing Cycles)
  const performanceTrendData = [
    { cycle: 'Oct 2025 (Base)', physical: 78, technical: 79, teamAvg: 78.5 },
    { cycle: 'Nov 2025 (Load)', physical: 81, technical: 82, teamAvg: 81.5 },
    { cycle: 'Dec 2025 (Strength)', physical: 84, technical: 83, teamAvg: 83.5 },
    { cycle: 'Jan 2026 (Winter)', physical: 86, technical: 87, teamAvg: 86.5 },
    { cycle: 'Feb 2026 (Peak)', physical: 90, technical: 92, teamAvg: 91.0 },
  ];

  // Weight Category Distribution data
  const weightDistributionData = [
    { weight: '60 kg', count: athletes.filter(a => a.weightCategory === '60 kg').length },
    { weight: '67 kg', count: athletes.filter(a => a.weightCategory === '67 kg').length },
    { weight: '72 kg', count: athletes.filter(a => a.weightCategory === '72 kg').length },
    { weight: '77 kg', count: athletes.filter(a => a.weightCategory === '77 kg').length },
    { weight: '87 kg', count: athletes.filter(a => a.weightCategory === '87 kg').length },
    { weight: '97 kg', count: athletes.filter(a => a.weightCategory === '97 kg').length },
    { weight: '130 kg', count: athletes.filter(a => a.weightCategory === '130 kg').length },
  ];

  // Squad Wrestling Profile Radar (Greco-Roman key pillars)
  const squadRadarData = [
    { pillar: 'Takedowns & Snaps', score: 88 },
    { pillar: 'Throws & Souplesse', score: 92 },
    { pillar: 'Clinch / Pummeling', score: 94 },
    { pillar: 'Par Terre Offense', score: 91 },
    { pillar: 'Par Terre Defense', score: 86 },
    { pillar: 'Passivity Tactics', score: 90 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Coach Greeting & Matside Quick Action */}
      <div className="bg-[#1E293B] border border-slate-700 p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1.5">
            <span className="bg-orange-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded tracking-wider shadow-sm">
              Greco-Roman Mat OS
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Season 2026 Macrocycle Phase 3
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            Coach Command Center
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Real-time readiness for <strong className="text-orange-400">{athletes.length} Greco-Roman wrestlers</strong> across {teams.length} squads. European Championship preparation on schedule.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('tests')}
            className="px-4 py-2 bg-[#0F172A] hover:bg-slate-900 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition flex items-center space-x-2"
          >
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Test Library</span>
          </button>
          
          <button
            onClick={onOpenQuickSession}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs font-bold rounded-lg shadow-md shadow-orange-500/20 transition flex items-center space-x-2"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Matside Quick Entry</span>
          </button>
        </div>
      </div>

      {/* 6 Executive KPI Metrics Cards with Sleek Colored Left Accents */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Active Wrestlers */}
        <div 
          onClick={() => onNavigate('athletes')}
          className="bg-[#1E293B] border border-slate-700 hover:border-orange-500 border-l-4 border-l-orange-500 p-4 rounded-xl cursor-pointer transition group shadow-md"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t.activeAthletes}</span>
            <Users className="w-4 h-4 text-orange-500" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-white">{activeAthletes.length}</span>
            <span className="text-[10px] text-slate-400 font-semibold">/ {athletes.length}</span>
          </div>
          <p className="text-[10px] text-emerald-400 mt-1 flex items-center font-semibold">
            <CheckCircle2 className="w-3 h-3 mr-1" /> 100% Roster Fit
          </p>
        </div>

        {/* Avg Physical Score */}
        <div 
          onClick={() => onNavigate('tests')}
          className="bg-[#1E293B] border border-slate-700 hover:border-cyan-400 border-l-4 border-l-cyan-400 p-4 rounded-xl cursor-pointer transition group shadow-md"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t.avgPhysicalScore}</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-cyan-400">{avgPhysicalScore}</span>
            <span className="text-[10px] text-slate-400 font-semibold">/ 100</span>
          </div>
          <p className="text-[10px] text-emerald-400 mt-1 flex items-center font-semibold">
            <TrendingUp className="w-3 h-3 mr-1" /> +4.2% cycle
          </p>
        </div>

        {/* Avg Wrestling Technical Score */}
        <div 
          onClick={() => onNavigate('assessments')}
          className="bg-[#1E293B] border border-slate-700 hover:border-orange-400 border-l-4 border-l-orange-400 p-4 rounded-xl cursor-pointer transition group shadow-md"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t.avgWrestlingScore}</span>
            <Award className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-orange-400">{avgWrestlingScore}</span>
            <span className="text-[10px] text-slate-400 font-semibold">/ 100</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-semibold">
            Par Terre: 91
          </p>
        </div>

        {/* Attendance Rate */}
        <div 
          onClick={() => onNavigate('attendance')}
          className="bg-[#1E293B] border border-slate-700 hover:border-emerald-400 border-l-4 border-l-emerald-400 p-4 rounded-xl cursor-pointer transition group shadow-md"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t.attendanceRate}</span>
            <CalendarCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-emerald-400">{avgAttendance}%</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-semibold">
            Elite adherence
          </p>
        </div>

        {/* Progressing Athletes */}
        <div 
          onClick={() => onNavigate('athletes')}
          className="bg-[#1E293B] border border-slate-700 hover:border-emerald-500 border-l-4 border-l-emerald-500 p-4 rounded-xl cursor-pointer transition group shadow-md"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t.improvingAthletes}</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-emerald-400">{improvingAthletes.length}</span>
            <span className="text-[10px] text-slate-400 font-semibold">Athletes</span>
          </div>
          <p className="text-[10px] text-emerald-400 mt-1 font-semibold">
            New PBs recorded
          </p>
        </div>

        {/* Needs Attention / Restricted */}
        <div 
          onClick={() => onNavigate('injuries')}
          className="bg-[#1E293B] border border-slate-700 hover:border-rose-500 border-l-4 border-l-rose-500 p-4 rounded-xl cursor-pointer transition group shadow-md"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t.needsAttention}</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-rose-400">{injuredAthletes.length}</span>
            <span className="text-[10px] text-slate-400 font-semibold">Restricted</span>
          </div>
          <p className="text-[10px] text-rose-400 mt-1 font-semibold">
            1 shoulder rehab
          </p>
        </div>
      </div>

      {/* Main Grid: Performance Progression Curve & Greco Tactical Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Team Performance Trend (Area Chart) */}
        <div className="lg:col-span-2 bg-[#1E293B] border border-slate-700 rounded-xl p-5 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-700/80">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Activity className="w-4 h-4 text-orange-500" />
                <span>Squad Performance Progression (Macrocycle Trends)</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Composite of physical testing batteries and technical wrestling evaluations
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1.5 text-slate-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
                <span>Physical</span>
              </span>
              <span className="flex items-center space-x-1.5 text-slate-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
                <span>Technical</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceTrendData}>
                <defs>
                  <linearGradient id="colorPhysical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorTechnical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="cycle" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={[70, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="physical" stroke="#22d3ee" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPhysical)" name="Physical Index" />
                <Area type="monotone" dataKey="technical" stroke="#f97316" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTechnical)" name="Wrestling Technical" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Col: Greco-Roman Tactical Pillar Radar */}
        <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2 mb-1">
              <Award className="w-4 h-4 text-orange-500" />
              <span>Greco-Roman Mastery Pillars</span>
            </h2>
            <p className="text-[11px] text-slate-400 mb-2">
              National squad average rubric scores
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={squadRadarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="pillar" stroke="#94a3b8" fontSize={10} />
                <PolarRadiusAxis domain={[0, 100]} stroke="#475569" fontSize={9} />
                <Radar name="Squad Mastery" dataKey="score" stroke="#f97316" fill="#f97316" fillOpacity={0.45} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-slate-300 bg-[#0F172A] p-2.5 rounded-lg border border-slate-700 flex items-center justify-between font-medium">
            <span>Strongest: <strong className="text-orange-400">Clinch / Pummeling (94)</strong></span>
            <span>Focus: <strong className="text-cyan-400">Par Terre Def (86)</strong></span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Athlete Progress Triage & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Triage "Athletes Improving" vs "Needs Attention" */}
        <div className="lg:col-span-2 space-y-4">
          {/* Top Performers / Improving */}
          <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/80">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Athletes with Significant Progress (+PBs)</span>
              </h2>
              <button 
                onClick={() => onNavigate('athletes')}
                className="text-xs text-orange-400 hover:text-orange-300 font-bold flex items-center"
              >
                <span>View All Athletes</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 rtl:rotate-180" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {improvingAthletes.slice(0, 4).map(athlete => (
                <div
                  key={athlete.id}
                  onClick={() => onNavigate('athletes', athlete.id)}
                  className="bg-[#0F172A] hover:bg-slate-900 border border-slate-700 hover:border-orange-500 p-3.5 rounded-xl cursor-pointer transition flex items-center justify-between group shadow-sm"
                >
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <img
                      src={athlete.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                      alt={athlete.firstName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/40"
                    />
                    <div>
                      <p className="font-bold text-white group-hover:text-orange-400 text-xs">
                        {athlete.firstName} {athlete.lastName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {athlete.weightCategory} • {athlete.teamName}
                      </p>
                      <div className="flex items-center space-x-2 mt-1 text-[10px]">
                        <span className="text-cyan-400 font-semibold">Phys: <strong>{athlete.physicalScore}</strong></span>
                        <span className="text-slate-600">•</span>
                        <span className="text-orange-400 font-semibold">Wrest: <strong>{athlete.wrestlingScore}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px] rounded-full font-mono">
                      {athlete.performanceScore}/100
                    </span>
                    <p className="text-[9px] text-emerald-400 font-semibold mt-1">
                      +3.8% Overall
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attention & Injury Alerts */}
          <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-700/80">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Coach Watchlist: Medical Restrictions & Weight Thresholds</span>
              </h2>
              <button 
                onClick={() => onNavigate('injuries')}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold"
              >
                Medical Log
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {injuries.map(inj => (
                <div key={inj.id} className="p-3 bg-[#0F172A] border border-rose-900/60 rounded-xl flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 font-bold rounded-md text-[10px] border border-rose-500/30">
                        {inj.bodyArea}
                      </span>
                      <strong className="text-white text-xs">{inj.athleteName}</strong>
                    </div>
                    <p className="text-[11px] text-rose-200/90 mt-1 font-medium">{inj.injuryName}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Restriction: {inj.restrictions}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-300 font-mono">Return: {inj.returnToMatDate || 'TBD'}</span>
                    <button
                      onClick={() => onNavigate('injuries')}
                      className="block mt-1 text-[10px] bg-[#1E293B] hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-600 font-semibold"
                    >
                      Update Clearance
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Weight Category Roster & Upcoming Tournaments */}
        <div className="space-y-4">
          {/* Olympic Weight Categories Distribution */}
          <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-700/80">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Scale className="w-4 h-4 text-orange-500" />
                <span>Squad Weight Category Coverage</span>
              </h2>
              <button 
                onClick={() => onNavigate('weight')}
                className="text-xs text-orange-400 hover:text-orange-300 font-bold"
              >
                Log Weigh-in
              </button>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weightDistributionData}>
                  <XAxis dataKey="weight" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} allowDecimals={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} name="Wrestlers" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Next Tournament / Competition Card with Energetic Sleek Gradient */}
          {nextComp && (
            <div className="bg-gradient-to-br from-orange-600 to-orange-500 border border-orange-400/40 rounded-xl p-5 shadow-lg text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase bg-white/20 text-white px-2.5 py-0.5 rounded backdrop-blur-sm">
                  Target Tournament
                </span>
                <Trophy className="w-5 h-5 text-amber-200" />
              </div>
              <h3 className="font-extrabold text-white text-base mt-1">{nextComp.name}</h3>
              <p className="text-xs text-orange-100 mt-0.5">{nextComp.location}, {nextComp.country}</p>
              
              <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs">
                <div>
                  <p className="text-[10px] text-orange-100 font-semibold uppercase tracking-wider">Date Window</p>
                  <p className="font-bold text-white mt-0.5">{nextComp.startDate}</p>
                </div>
                <button
                  onClick={() => onNavigate('competitions', nextComp.id)}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-900 font-extrabold rounded-lg text-xs transition shadow-md"
                >
                  Manage Entries
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
