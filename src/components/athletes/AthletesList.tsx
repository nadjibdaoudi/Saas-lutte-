import React, { useState } from 'react';
import { 
  Users, Search, Filter, Plus, TrendingUp, 
  ArrowUpRight, AlertTriangle, CheckCircle2, 
  ChevronRight, LayoutGrid, List, Dumbbell, Award, Scale 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Athlete } from '../../types';

interface AthletesListProps {
  onSelectAthlete: (athleteId: string) => void;
  onOpenAddAthlete: () => void;
}

export const AthletesList: React.FC<AthletesListProps> = ({
  onSelectAthlete,
  onOpenAddAthlete
}) => {
  const { t } = useAuth();
  const { athletes, teams } = useData();

  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedWeight, setSelectedWeight] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Greco-Roman official senior weights
  const weightCategories = ['60 kg', '67 kg', '72 kg', '77 kg', '82 kg', '87 kg', '97 kg', '130 kg'];

  const filteredAthletes = athletes.filter(athlete => {
    const fullName = `${athlete.firstName || ''} ${athlete.lastName || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase()) || 
      (athlete.weightCategory || '').toLowerCase().includes(search.toLowerCase()) ||
      (athlete.nationality || '').toLowerCase().includes(search.toLowerCase());

    const matchesTeam = selectedTeam === 'all' || athlete.teamId === selectedTeam;
    const matchesWeight = selectedWeight === 'all' || athlete.weightCategory === selectedWeight;
    const matchesStatus = selectedStatus === 'all' || athlete.status === selectedStatus;

    return matchesSearch && matchesTeam && matchesWeight && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <Users className="w-5 h-5 text-amber-500" />
            <span>{t.navAthletes} ({filteredAthletes.length})</span>
          </h1>
          <p className="text-xs text-slate-400">
            Official Greco-Roman squad roster, physical capacities, and technical ratings
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Toggle */}
          <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex items-center space-x-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenAddAthlete}
            className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-sm shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addAthlete}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-wrap gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 rtl:left-auto rtl:right-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search wrestler by name or country..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-8 pr-3 rtl:pl-3 rtl:pr-8 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Team Filter */}
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            aria-label="Filter by squad or team"
            className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
          >
            <option value="all">{t.allTeams}</option>
            {teams.map(tm => (
              <option key={tm.id} value={tm.id}>{tm.name}</option>
            ))}
          </select>

          {/* Weight Category Filter */}
          <select
            value={selectedWeight}
            onChange={(e) => setSelectedWeight(e.target.value)}
            aria-label="Filter by weight class"
            className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
          >
            <option value="all">{t.allWeights}</option>
            {weightCategories.map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label="Filter by athlete status"
            className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active (On Mat)</option>
            <option value="injured">Injured / Restricted</option>
            <option value="resting">Resting / Taper</option>
          </select>
        </div>
      </div>

      {/* Athlete Cards Grid */}
      {filteredAthletes.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <h3 className="text-sm font-bold text-slate-200">{t.noAthletes}</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">{t.noAthletesDesc}</p>
          <button
            onClick={onOpenAddAthlete}
            className="mt-4 px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition"
          >
            {t.addAthlete}
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAthletes.map(athlete => {
            const isInjured = athlete.status === 'injured';

            return (
              <div
                key={athlete.id}
                onClick={() => onSelectAthlete(athlete.id)}
                className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 rounded-2xl p-4 cursor-pointer transition group shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* Top row: Avatar, Name, Weight Badge, Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <img
                        src={athlete.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                        alt={athlete.firstName}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-700 group-hover:ring-amber-500/50 transition"
                      />
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h3 className="font-extrabold text-white text-sm group-hover:text-amber-400 transition">
                            {athlete.firstName} {athlete.lastName}
                          </h3>
                          <span className="text-[10px] font-bold text-slate-400">({athlete.nationality})</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium truncate max-w-[160px]">
                          {athlete.teamName}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-block bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-xs font-bold font-mono">
                        {athlete.weightCategory}
                      </span>
                    </div>
                  </div>

                  {/* Grip & Stance Attributes */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Grip Preference</span>
                      <span className="text-slate-300 font-medium truncate block">{athlete.gripPreference}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Current / Target Wt</span>
                      <span className="text-slate-300 font-semibold font-mono">
                        {athlete.currentWeightKg} kg <span className="text-slate-500">/ {athlete.targetWeightKg} kg</span>
                      </span>
                    </div>
                  </div>

                  {/* Performance Indicators */}
                  <div className="mt-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-cyan-400 block font-semibold">Physical Index</span>
                      <span className="font-black text-white text-sm">{athlete.physicalScore || 80}/100</span>
                    </div>
                    <div className="h-6 w-px bg-slate-800"></div>
                    <div>
                      <span className="text-[10px] text-amber-400 block font-semibold">Wrestling Rubric</span>
                      <span className="font-black text-white text-sm">{athlete.wrestlingScore || 80}/100</span>
                    </div>
                    <div className="h-6 w-px bg-slate-800"></div>
                    <div>
                      <span className="text-[10px] text-emerald-400 block font-semibold">Composite</span>
                      <span className="font-black text-emerald-400 text-sm">{athlete.performanceScore || 80}/100</span>
                    </div>
                  </div>
                </div>

                {/* Footer status / click prompt */}
                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                  {isInjured ? (
                    <span className="text-rose-400 flex items-center space-x-1 font-semibold text-[10px]">
                      <AlertTriangle className="w-3 h-3 mr-1" /> Medical Restriction
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center space-x-1 font-semibold text-[10px]">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Active on Mat
                    </span>
                  )}
                  <span className="text-slate-400 group-hover:text-amber-400 font-semibold flex items-center text-xs">
                    <span>View Profile</span>
                    <ChevronRight className="w-3 h-3 ml-1 rtl:rotate-180" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Athlete</th>
                  <th className="p-3.5">Squad / Team</th>
                  <th className="p-3.5">Weight Class</th>
                  <th className="p-3.5">Current Wt</th>
                  <th className="p-3.5">Physical Index</th>
                  <th className="p-3.5">Wrestling Rubric</th>
                  <th className="p-3.5">Composite Score</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredAthletes.map(athlete => (
                  <tr
                    key={athlete.id}
                    onClick={() => onSelectAthlete(athlete.id)}
                    className="hover:bg-slate-800/60 cursor-pointer transition"
                  >
                    <td className="p-3.5">
                      <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                        <img
                          src={athlete.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                          alt={athlete.firstName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-bold text-white hover:text-amber-400">{athlete.firstName} {athlete.lastName}</p>
                          <p className="text-[10px] text-slate-400">{athlete.nationality} • {athlete.dominantSide} stance</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-300">{athlete.teamName}</td>
                    <td className="p-3.5">
                      <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 font-bold font-mono">
                        {athlete.weightCategory}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-200">{athlete.currentWeightKg} kg</td>
                    <td className="p-3.5 font-mono text-cyan-400 font-bold">{athlete.physicalScore || 80}/100</td>
                    <td className="p-3.5 font-mono text-amber-400 font-bold">{athlete.wrestlingScore || 80}/100</td>
                    <td className="p-3.5 font-mono text-emerald-400 font-black">{athlete.performanceScore || 80}/100</td>
                    <td className="p-3.5">
                      {athlete.status === 'injured' ? (
                        <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded font-semibold text-[10px]">Injured</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-semibold text-[10px]">Active</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button className="text-amber-400 hover:text-amber-300 font-semibold text-xs">
                        Open &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
