import React, { useState } from 'react';
import { 
  ArrowLeft, Activity, Award, Scale, 
  CalendarCheck, HeartPulse, Trophy, FileText, 
  TrendingUp, CheckCircle2, AlertTriangle, Edit3, 
  Plus, ExternalLink, ShieldCheck, Dumbbell 
} from 'lucide-react';
import { 
  ResponsiveContainer, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar, 
  LineChart, Line, XAxis, YAxis, Tooltip, AreaChart, Area 
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Athlete } from '../../types';

interface AthleteDetailViewProps {
  athleteId: string;
  onBack: () => void;
  onOpenEdit: (athlete: Athlete) => void;
  onOpenAssessmentModal: (athleteId: string) => void;
  onOpenReport: (athleteId: string) => void;
}

export const AthleteDetailView: React.FC<AthleteDetailViewProps> = ({
  athleteId,
  onBack,
  onOpenEdit,
  onOpenAssessmentModal,
  onOpenReport
}) => {
  const { user } = useAuth();
  const { athletes, tests, testResults, wrestlingAssessments, weightRecords, injuries, matches } = useData();

  const [activeTab, setActiveTab] = useState<'overview' | 'tests' | 'wrestling' | 'weight' | 'matches' | 'injuries'>('overview');

  const athlete = athletes.find(a => a.id === athleteId);
  if (!athlete) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>Athlete profile not found.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs">
          Return to roster
        </button>
      </div>
    );
  }

  // Calculate age from DOB
  const birthYear = new Date(athlete.dateOfBirth).getFullYear();
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;

  // Filter athlete records
  const athleteResults = testResults.filter(r => r.athleteId === athleteId);
  const athleteAssessments = wrestlingAssessments.filter(a => a.athleteId === athleteId);
  const latestAssessment = athleteAssessments.sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime())[0];
  const athleteWeights = weightRecords.filter(w => w.athleteId === athleteId).sort((a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime());
  const athleteInjuries = injuries.filter(i => i.athleteId === athleteId);
  const athleteMatches = matches.filter(m => m.athleteId === athleteId);

  // Radar Data: 6 Key Dimensions
  const radarData = [
    { subject: 'Speed / 30m', score: 92 },
    { subject: 'Explosive Power', score: 95 },
    { subject: 'Grip & Strength', score: 96 },
    { subject: 'Anaerobic Shuttle', score: 91 },
    { subject: 'Par Terre Offense', score: latestAssessment ? Math.round(latestAssessment.groundParTerreOffense * 10) : 94 },
    { subject: 'Clinch / Pummeling', score: latestAssessment ? Math.round(latestAssessment.clinchUnderhook * 10) : 96 },
    { subject: 'Passivity Tactics', score: latestAssessment ? Math.round(latestAssessment.passivityManagement * 10) : 95 },
    { subject: 'Takedown Defense', score: latestAssessment ? Math.round(latestAssessment.takedownDefense * 10) : 92 },
  ];

  // Weight Trend Data
  const weightTrendData = athleteWeights.map(w => ({
    date: w.recordDate,
    weight: w.weightKg,
    target: w.targetWeightKg
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-400 hover:text-white transition text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>Back to Squad Roster</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onOpenReport(athlete.id)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold border border-slate-700 transition"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Full Report</span>
          </button>

          {user?.role !== 'athlete' && (
            <>
              <button
                onClick={() => onOpenAssessmentModal(athlete.id)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-bold border border-amber-500/40 transition"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Evaluate Wrestling Rubric</span>
              </button>

              <button
                onClick={() => onOpenEdit(athlete)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-black transition shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Avatar + Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <img
                src={athlete.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
                alt={athlete.firstName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-slate-800 shadow-xl"
              />
              <span className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-md shadow">
                {athlete.nationality}
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {athlete.firstName} {athlete.lastName}
                </h1>
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono">
                  {athlete.weightCategory}
                </span>
                <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-xs font-semibold capitalize">
                  {athlete.ageCategory.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-slate-300 font-medium mb-3">
                {athlete.teamName} • Coach: {athlete.coachName || 'Ghilas Benamara'} • License: {athlete.licenseNumber || 'FFL-2026-9921'}
              </p>

              {/* Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 text-[10px] block">Age / Height</span>
                  <span className="text-slate-200 font-bold">{age} yrs • {athlete.heightCm} cm</span>
                </div>
                <div className="bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 text-[10px] block">Current Wt</span>
                  <span className="text-amber-400 font-bold font-mono">{athlete.currentWeightKg} kg</span>
                </div>
                <div className="bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 text-[10px] block">Stance / Side</span>
                  <span className="text-slate-200 font-bold capitalize">{athlete.dominantSide}</span>
                </div>
                <div className="bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 text-[10px] block">Attendance</span>
                  <span className="text-emerald-400 font-bold font-mono">{athlete.attendanceRate || 98}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Composite Performance Score Ring */}
          <div className="flex items-center space-x-4 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
            <div className="text-center pr-3 border-r border-slate-800 rtl:border-l rtl:border-r-0">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                WrestleLab Index
              </span>
              <div className="text-3xl font-black text-amber-400 font-mono">
                {athlete.performanceScore || 94}
                <span className="text-xs text-slate-500 font-normal">/100</span>
              </div>
              <span className="inline-block mt-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Tier 1 Elite
              </span>
            </div>

            <div className="space-y-1.5 text-xs min-w-[120px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Physical:</span>
                <span className="font-bold text-cyan-400 font-mono">{athlete.physicalScore || 92}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Wrestling:</span>
                <span className="font-bold text-amber-400 font-mono">{athlete.wrestlingScore || 96}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Trend:</span>
                <span className="font-bold text-emerald-400 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" /> +3.5%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-1 border-b border-slate-800 text-xs overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Overview & Radar', icon: Activity },
          { id: 'tests', label: `Testing History (${athleteResults.length})`, icon: Dumbbell },
          { id: 'wrestling', label: 'Greco Technical Rubrics', icon: Award },
          { id: 'weight', label: `Weight History (${athleteWeights.length})`, icon: Scale },
          { id: 'matches', label: `Competition Matches (${athleteMatches.length})`, icon: Trophy },
          { id: 'injuries', label: `Medical Status (${athleteInjuries.length})`, icon: HeartPulse },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center space-x-2 px-4 py-2.5 rounded-t-xl font-bold transition whitespace-nowrap
                ${isActive 
                  ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-500 border-x border-slate-800' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'}
              `}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Radar Chart */}
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-1">
              <Activity className="w-4 h-4 text-amber-500" />
              <span>Comprehensive Athlete Profile Radar</span>
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Normalized score across physical performance benchmarks and Greco-Roman specific technical evaluations
            </p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                  <PolarRadiusAxis domain={[0, 100]} stroke="#475569" fontSize={10} />
                  <Radar name="Performance" dataKey="score" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Coach Tactical Notes & Highlights */}
          <div className="space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Coach Evaluation Summary</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {athlete.notes || 'World-class Greco-Roman wrestler with high-amplitude throwing capability and relentless pace in clinch pummeling.'}
              </p>

              {latestAssessment && (
                <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 text-xs">
                  <div>
                    <span className="text-emerald-400 font-bold text-[11px] block">Key Strengths:</span>
                    <p className="text-slate-300 text-[11px]">{latestAssessment.strengths}</p>
                  </div>
                  <div>
                    <span className="text-amber-400 font-bold text-[11px] block">Target Improvement Area:</span>
                    <p className="text-slate-300 text-[11px]">{latestAssessment.areasForImprovement}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Specs */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm text-xs space-y-2.5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Greco-Roman Specifications
              </h3>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Grip Preference:</span>
                <span className="font-semibold text-slate-200">{athlete.gripPreference}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Experience Tier:</span>
                <span className="font-semibold text-slate-200">{athlete.experienceLevel}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Emergency Contact:</span>
                <span className="font-semibold text-slate-200">{athlete.emergencyContactName} ({athlete.emergencyContactPhone})</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Testing History Tab */}
      {activeTab === 'tests' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Physical Testing Battery History</h3>
              <p className="text-[11px] text-slate-400">Recorded test trials, score normalization, and personal best tracking</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Test Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Raw Result</th>
                  <th className="p-3.5">Score (0-100)</th>
                  <th className="p-3.5">Previous Trial</th>
                  <th className="p-3.5">Improvement %</th>
                  <th className="p-3.5">Session / Date</th>
                  <th className="p-3.5">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {athleteResults.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      No physical tests recorded yet for this athlete.
                    </td>
                  </tr>
                ) : (
                  athleteResults.map(res => (
                    <tr key={res.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-3.5 font-bold text-white flex items-center space-x-2">
                        <span>{res.testName}</span>
                        {res.isPersonalBest && (
                          <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                            PB
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-400 capitalize">{res.testCategory}</td>
                      <td className="p-3.5 font-mono text-cyan-400 font-bold text-sm">
                        {res.rawValue} {res.unit}
                      </td>
                      <td className="p-3.5">
                        <span className="font-mono font-black text-amber-400">
                          {res.calculatedScore}/100
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400 font-mono">
                        {res.previousValue ? `${res.previousValue} ${res.unit}` : '—'}
                      </td>
                      <td className="p-3.5">
                        {res.improvementPercentage !== undefined ? (
                          <span className={`font-mono font-bold ${res.improvementPercentage >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {res.improvementPercentage >= 0 ? `+${res.improvementPercentage}%` : `${res.improvementPercentage}%`}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="p-3.5 text-slate-400">
                        {res.sessionName || 'Standard Assessment'} ({res.recordedDate})
                      </td>
                      <td className="p-3.5 text-slate-400 italic">{res.notes || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Wrestling Rubrics Tab */}
      {activeTab === 'wrestling' && (
        <div className="space-y-4">
          {athleteAssessments.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
              <Award className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <h3 className="text-sm font-bold text-slate-300">No Wrestling Rubric Assessment Found</h3>
              <p className="text-xs text-slate-500 mt-1">
                Evaluate technical, defensive, tactical, and behavioral Greco-Roman ratings for this athlete.
              </p>
              <button
                onClick={() => onOpenAssessmentModal(athlete.id)}
                className="mt-4 px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl"
              >
                Start Evaluation
              </button>
            </div>
          ) : (
            athleteAssessments.map(assess => (
              <div key={assess.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Official Greco-Roman Technical Assessment ({assess.assessmentDate})
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Evaluator: <strong className="text-slate-200">{assess.evaluatorName || 'Head Coach'}</strong>
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-slate-400">Overall Technical Index:</span>
                    <span className="text-lg font-black text-amber-400 font-mono bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
                      {assess.overallWrestlingScore}/100
                    </span>
                  </div>
                </div>

                {/* Rubric Breakdown Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  {/* Category 1: Technical Offense */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="font-bold text-amber-400 uppercase text-[10px] tracking-wider">1. Standing & Throws</h4>
                    <div className="flex justify-between"><span>Takedowns & Snaps:</span><strong className="text-white">{assess.takedownTechnique}/10</strong></div>
                    <div className="flex justify-between"><span>Throws & Souplesse:</span><strong className="text-white">{assess.throwingTechnique}/10</strong></div>
                    <div className="flex justify-between"><span>Clinch / Pummeling:</span><strong className="text-white">{assess.clinchUnderhook}/10</strong></div>
                    <div className="flex justify-between"><span>Par Terre Gut Wrench:</span><strong className="text-white">{assess.groundParTerreOffense}/10</strong></div>
                  </div>

                  {/* Category 2: Defensive Rigor */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="font-bold text-cyan-400 uppercase text-[10px] tracking-wider">2. Defense & Posture</h4>
                    <div className="flex justify-between"><span>Takedown Defense:</span><strong className="text-white">{assess.takedownDefense}/10</strong></div>
                    <div className="flex justify-between"><span>Par Terre Defense Base:</span><strong className="text-white">{assess.groundParTerreDefense}/10</strong></div>
                    <div className="flex justify-between"><span>Pummeling Defense:</span><strong className="text-white">{assess.clinchPummelingDefense}/10</strong></div>
                    <div className="flex justify-between"><span>Balance & Recovery:</span><strong className="text-white">{assess.balanceRecovery}/10</strong></div>
                  </div>

                  {/* Category 3: Tactics & UWW Rules */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="font-bold text-emerald-400 uppercase text-[10px] tracking-wider">3. Match Tactics & Zone</h4>
                    <div className="flex justify-between"><span>Passivity Management:</span><strong className="text-white">{assess.passivityManagement}/10</strong></div>
                    <div className="flex justify-between"><span>Mat Zone Control:</span><strong className="text-white">{assess.matZoneControl}/10</strong></div>
                    <div className="flex justify-between"><span>Decision Making:</span><strong className="text-white">{assess.decisionMaking}/10</strong></div>
                    <div className="flex justify-between"><span>Tempo Strategy:</span><strong className="text-white">{assess.periodTempoStrategy}/10</strong></div>
                  </div>

                  {/* Category 4: Mental Grit */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="font-bold text-purple-400 uppercase text-[10px] tracking-wider">4. Mental & Behavior</h4>
                    <div className="flex justify-between"><span>Discipline & Focus:</span><strong className="text-white">{assess.discipline}/10</strong></div>
                    <div className="flex justify-between"><span>Grit & Toughness:</span><strong className="text-white">{assess.gritMentalToughness}/10</strong></div>
                    <div className="flex justify-between"><span>Coachability:</span><strong className="text-white">{assess.coachability}/10</strong></div>
                    <div className="flex justify-between"><span>Competition Focus:</span><strong className="text-white">{assess.competitionFocus}/10</strong></div>
                  </div>
                </div>

                {/* Feedback notes */}
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                  <p><strong className="text-emerald-400">Strengths:</strong> <span className="text-slate-300">{assess.strengths}</span></p>
                  <p><strong className="text-amber-400">Areas for Improvement:</strong> <span className="text-slate-300">{assess.areasForImprovement}</span></p>
                  <p><strong className="text-slate-400">Coach Feedback:</strong> <span className="text-slate-300">{assess.coachFeedback}</span></p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Weight History Tab */}
      {activeTab === 'weight' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-1">Weight Tracking & Target Progression</h3>
            <p className="text-[11px] text-slate-400 mb-4">Official target category: <strong className="text-amber-400">{athlete.weightCategory}</strong></p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightTrendData}>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="weight" stroke="#f59e0b" strokeWidth={2.5} name="Recorded Weight (kg)" />
                  <Line type="monotone" dataKey="target" stroke="#22d3ee" strokeDasharray="5 5" name="Target Weight (kg)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Matches Tab */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          {athleteMatches.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
              No tournament matches recorded for this athlete yet.
            </div>
          ) : (
            athleteMatches.map(match => (
              <div key={match.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${match.isWin ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'}`}>
                      {match.isWin ? 'WIN' : 'LOSS'} • {(match.result || 'DEC').toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{match.competitionName}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    vs {match.opponentName} ({match.opponentCountry})
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Score: <strong className="text-amber-400 font-mono">{match.athleteScore} - {match.opponentScore}</strong> ({match.roundName})
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 italic">{match.coachTacticalNotes}</p>
                </div>

                <div className="text-right text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Greco Actions</div>
                  <div className="text-slate-200 font-medium">Throws: {match.throwsExecuted} • Gut Wrench: {match.gutWrenchExecuted}</div>
                  <div className="text-slate-400 text-[10px] mt-0.5">Passivity: {match.passivityCallsReceived} received / {match.passivityCallsOpponent} opponent</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Injuries Tab */}
      {activeTab === 'injuries' && (
        <div className="space-y-4">
          {athleteInjuries.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
              <p>No active injuries or medical restrictions recorded.</p>
            </div>
          ) : (
            athleteInjuries.map(inj => (
              <div key={inj.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 font-bold rounded text-xs">
                      {inj.bodyArea}
                    </span>
                    <h3 className="font-bold text-white text-sm">{inj.injuryName}</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Occurred: {inj.occurredDate}</span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                  <p><strong className="text-rose-400">Current Restrictions:</strong> <span className="text-slate-300">{inj.restrictions}</span></p>
                  <p><strong className="text-slate-400">Target Mat Clearance:</strong> <span className="text-amber-400 font-semibold">{inj.returnToMatDate || 'Pending evaluation'}</span></p>
                  <p><strong className="text-slate-400">Medical Notes:</strong> <span className="text-slate-300">{inj.medicalStaffNotes}</span></p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
