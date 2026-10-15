import React from 'react';
import { BarChart3, TrendingUp, Activity, Award, Scale, Users } from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  AreaChart, Area, ScatterChart, Scatter, ZAxis 
} from 'recharts';
import { useData } from '../../context/DataContext';

export const TeamAnalyticsView: React.FC = () => {
  const { athletes, tests, testResults } = useData();

  // Benchmark comparison data across weight categories
  const categoryComparisonData = [
    { weight: '60 kg', physical: 91, technical: 92, composite: 91.5 },
    { weight: '67 kg', physical: 89, technical: 88, composite: 88.5 },
    { weight: '72 kg', physical: 94, technical: 95, composite: 94.5 },
    { weight: '77 kg', physical: 92, technical: 91, composite: 91.5 },
    { weight: '87 kg', physical: 90, technical: 89, composite: 89.5 },
    { weight: '97 kg', physical: 88, technical: 87, composite: 87.5 },
    { weight: '130 kg', physical: 86, technical: 89, composite: 87.5 },
  ];

  const capacityRadarData = [
    { capacity: 'Maximum Strength (1RM)', score: 92 },
    { capacity: 'Explosive Power (Jump)', score: 89 },
    { capacity: 'Speed / Sprint 30m', score: 93 },
    { capacity: 'Anaerobic Shuttle', score: 90 },
    { capacity: 'Isometric Grip', score: 96 },
    { capacity: 'Neck Bridge Endurance', score: 94 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-amber-500" />
            <span>Squad Performance Analytics & Benchmarks</span>
          </h1>
          <p className="text-xs text-slate-400">
            Multi-variable physical analytics, category comparative baselines, and Greco-Roman technical index distributions
          </p>
        </div>
      </div>

      {/* Grid: Benchmark Comparisons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance Indices */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Weight Category Performance Indices</span>
            </h2>
            <p className="text-[11px] text-slate-400">Comparing normalized physical vs technical scores per UWW weight class</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryComparisonData}>
                <XAxis dataKey="weight" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis domain={[70, 100]} stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="physical" fill="#22d3ee" radius={[4, 4, 0, 0]} name="Physical Index" />
                <Bar dataKey="technical" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Technical Rubric" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Physical Capacities Radar Benchmark */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Squad Physical Capacities Benchmark</span>
            </h2>
            <p className="text-[11px] text-slate-400">Composite physical battery scores against international elite standards</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={capacityRadarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="capacity" stroke="#94a3b8" fontSize={10} />
                <PolarRadiusAxis domain={[0, 100]} stroke="#475569" fontSize={9} />
                <Radar name="Squad Benchmark" dataKey="score" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.45} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
