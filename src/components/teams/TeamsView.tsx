import React, { useState } from 'react';
import { UserCheck, Plus, Users, Award, ChevronRight, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface TeamsViewProps {
  onSelectAthlete: (athleteId: string) => void;
}

export const TeamsView: React.FC<TeamsViewProps> = ({ onSelectAthlete }) => {
  const { user } = useAuth();
  const { teams, athletes, addTeam } = useData();

  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [ageCategory, setAgeCategory] = useState<'senior' | 'u23' | 'u20_junior' | 'u17_cadet'>('senior');
  const [headCoach, setHeadCoach] = useState('Coach Benamara');
  const [description, setDescription] = useState('');

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    addTeam({
      name: teamName,
      ageCategory,
      headCoachName: headCoach,
      description
    });
    setIsAddTeamOpen(false);
    setTeamName('');
    setDescription('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-amber-500" />
            <span>Squads & Age Group Teams</span>
          </h1>
          <p className="text-xs text-slate-400">
            Senior National, U23 Espoir, and Cadet Greco-Roman squad rosters
          </p>
        </div>

        {user?.role !== 'athlete' && (
          <button
            onClick={() => setIsAddTeamOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Squad / Group</span>
          </button>
        )}
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teams.map(team => {
          const squadAthletes = athletes.filter(a => a.teamId === team.id);
          const avgScore = squadAthletes.length
            ? Math.round(squadAthletes.reduce((a, b) => a + (b.performanceScore || 80), 0) / squadAthletes.length)
            : 0;

          return (
            <div
              key={team.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                    {team.ageCategory.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    Avg Score: {avgScore}/100
                  </span>
                </div>

                <h3 className="font-extrabold text-white text-base mt-2">{team.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{team.description}</p>
                <p className="text-[11px] text-slate-300 font-medium mt-2">
                  Head Coach: <strong className="text-slate-100">{team.headCoachName}</strong>
                </p>

                {/* Squad Members List */}
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Roster ({squadAthletes.length} Wrestlers)
                  </span>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto">
                    {squadAthletes.map(a => (
                      <div
                        key={a.id}
                        onClick={() => onSelectAthlete(a.id)}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 cursor-pointer text-xs transition"
                      >
                        <div className="flex items-center space-x-2">
                          <img
                            src={a.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                            alt={a.firstName}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="font-semibold text-slate-200">{a.firstName} {a.lastName}</span>
                        </div>
                        <span className="font-mono text-amber-400 font-bold text-[10px]">{a.weightCategory}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Squad Modal */}
      {isAddTeamOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">Create Squad / Team Group</h3>
            
            <form onSubmit={handleAddTeam} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Squad Name *</label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  placeholder="e.g. U23 National Greco Squad"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Age Classification</label>
                <select
                  value={ageCategory}
                  onChange={e => setAgeCategory(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none capitalize"
                >
                  <option value="senior">Senior National</option>
                  <option value="u23">U23 Espoir</option>
                  <option value="u20_junior">U20 Junior</option>
                  <option value="u17_cadet">U17 Cadet</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Coach</label>
                <input
                  type="text"
                  value={headCoach}
                  onChange={e => setHeadCoach(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Squad Objective / Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Primary tournament targets..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddTeamOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl"
                >
                  Create Squad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
