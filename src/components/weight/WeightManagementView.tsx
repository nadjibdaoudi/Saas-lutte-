import React, { useState } from 'react';
import { Scale, Plus, AlertTriangle, TrendingDown, TrendingUp, CheckCircle2, Save } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const WeightManagementView: React.FC = () => {
  const { athletes, weightRecords, recordWeight } = useData();

  const [selectedAthleteId, setSelectedAthleteId] = useState(athletes[0]?.id || '');
  const [newWeight, setNewWeight] = useState(72.4);
  const [weighInNotes, setWeighInNotes] = useState('Morning empty stomach weigh-in');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentAthlete = athletes.find(a => a.id === selectedAthleteId) || athletes[0];
  const athleteHistory = weightRecords
    .filter(w => w.athleteId === currentAthlete?.id)
    .sort((a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime());

  const chartData = athleteHistory.map(w => ({
    date: w.recordDate,
    weight: w.weightKg,
    target: w.targetWeightKg
  }));

  const handleLogWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAthlete) return;

    recordWeight({
      athleteId: currentAthlete.id,
      athleteName: `${currentAthlete.firstName} ${currentAthlete.lastName}`,
      recordDate: new Date().toISOString().split('T')[0],
      weightKg: Number(newWeight),
      targetWeightKg: currentAthlete.targetWeightKg,
      notes: weighInNotes
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <Scale className="w-5 h-5 text-amber-500" />
            <span>Weight Category Management & Weigh-Ins</span>
          </h1>
          <p className="text-xs text-slate-400">
            Official UWW weight cutting curves, safe hydration monitoring, and competition weigh-in readiness
          </p>
        </div>
      </div>

      {/* Squad Weigh-In Roster & Logger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Rapid Weigh-in Logger */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Scale className="w-4 h-4 text-amber-500" />
            <span>Log Athlete Weigh-In</span>
          </h2>

          <form onSubmit={handleLogWeight} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Select Wrestler *</label>
              <select
                value={selectedAthleteId}
                onChange={e => setSelectedAthleteId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none"
              >
                {athletes.map(a => (
                  <option key={a.id} value={a.id}>{a.firstName} {a.lastName} ({a.weightCategory})</option>
                ))}
              </select>
            </div>

            {currentAthlete && (
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Category:</span>
                  <strong className="text-amber-400">{currentAthlete.weightCategory}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Weight:</span>
                  <span className="font-mono text-slate-200 font-bold">{currentAthlete.targetWeightKg} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Last Recorded:</span>
                  <span className="font-mono text-cyan-400 font-bold">{currentAthlete.currentWeightKg} kg</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Measured Weight (kg) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={newWeight}
                onChange={e => setNewWeight(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold text-base focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Condition / Notes</label>
              <input
                type="text"
                value={weighInNotes}
                onChange={e => setWeighInNotes(e.target.value)}
                placeholder="e.g. Post-practice, pre-breakfast"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-1.5"
            >
              {savedSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'Recorded Successfully!' : 'Record Weigh-In'}</span>
            </button>
          </form>
        </div>

        {/* Right 2 Cols: Weight Progression Line Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">
                Weight Cut Progression: {currentAthlete?.firstName} {currentAthlete?.lastName}
              </h2>
              <p className="text-[11px] text-slate-400">Targeting {currentAthlete?.weightCategory} limit</p>
            </div>
            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg font-mono font-bold">
              {currentAthlete?.currentWeightKg} kg / {currentAthlete?.targetWeightKg} kg
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="weight" stroke="#f59e0b" strokeWidth={2.5} name="Recorded Weight (kg)" />
                <Line type="monotone" dataKey="target" stroke="#22d3ee" strokeDasharray="5 5" name="Target Weight (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* History List */}
          <div className="pt-3 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recent Log Entries</h3>
            <div className="space-y-1.5 text-xs max-h-36 overflow-y-auto">
              {athleteHistory.slice().reverse().map(rec => (
                <div key={rec.id} className="flex justify-between items-center bg-slate-800/40 px-3 py-2 rounded-lg text-slate-300">
                  <span className="font-mono text-slate-400 text-[11px]">{rec.recordDate}</span>
                  <span className="font-mono font-bold text-white">{rec.weightKg} kg</span>
                  <span className="text-slate-400 text-[11px] truncate max-w-[200px]">{rec.notes || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
