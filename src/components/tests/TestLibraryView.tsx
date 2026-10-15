import React, { useState } from 'react';
import { 
  Activity, Plus, Search, Filter, Dumbbell, 
  Flame, Zap, Timer, ArrowUpDown, ChevronRight, 
  Calendar, CheckCircle2, Play 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { PhysicalTest, TestCategory, PerformanceDirection } from '../../types';

interface TestLibraryViewProps {
  onOpenMatsideEntry: (sessionId?: string) => void;
  onOpenNewSession: () => void;
}

export const TestLibraryView: React.FC<TestLibraryViewProps> = ({
  onOpenMatsideEntry,
  onOpenNewSession
}) => {
  const { t } = useAuth();
  const { tests, testSessions, testResults, addTest } = useData();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddTestOpen, setIsAddTestOpen] = useState(false);

  // New Test Form state
  const [newTestName, setNewTestName] = useState('');
  const [newTestCategory, setNewTestCategory] = useState<TestCategory>('strength');
  const [newTestUnit, setNewTestUnit] = useState('kg');
  const [newTestDirection, setNewTestDirection] = useState<PerformanceDirection>('higher_is_better');
  const [newTestDescription, setNewTestDescription] = useState('');
  const [newTestProtocol, setNewTestProtocol] = useState('');
  const [newTestMinVal, setNewTestMinVal] = useState(50);
  const [newTestMaxVal, setNewTestMaxVal] = useState(150);

  const filteredTests = tests.filter(test => {
    const matchesSearch = (test.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (test.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || test.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    addTest({
      name: newTestName,
      category: newTestCategory,
      unit: newTestUnit,
      performanceDirection: newTestDirection,
      description: newTestDescription,
      protocol: newTestProtocol,
      minValue: Number(newTestMinVal),
      maxValue: Number(newTestMaxVal),
      scoringMethod: 'normalized_linear'
    });
    setIsAddTestOpen(false);
    setNewTestName('');
    setNewTestDescription('');
    setNewTestProtocol('');
  };

  const getCategoryIcon = (category: TestCategory) => {
    switch (category) {
      case 'strength': return <Dumbbell className="w-4 h-4 text-cyan-400" />;
      case 'power': return <Zap className="w-4 h-4 text-amber-400" />;
      case 'speed': return <Timer className="w-4 h-4 text-yellow-400" />;
      case 'endurance': return <Flame className="w-4 h-4 text-rose-400" />;
      default: return <Activity className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <Activity className="w-5 h-5 text-amber-500" />
            <span>Physical Testing Engine & Library</span>
          </h1>
          <p className="text-xs text-slate-400">
            Standardized protocols, raw score normalization, and matside squad assessments
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenNewSession}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center space-x-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Schedule Testing Session</span>
          </button>

          <button
            onClick={() => onOpenMatsideEntry()}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition shadow-md shadow-amber-500/20 flex items-center space-x-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Matside Rapid Entry</span>
          </button>
        </div>
      </div>

      {/* Testing Sessions Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>Testing Battery Sessions ({testSessions.length})</span>
          </h2>
          <span className="text-xs text-slate-400">Directly enter or review squad battery results</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {testSessions.map(session => (
            <div
              key={session.id}
              className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between hover:border-amber-500/50 transition"
            >
              <div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${session.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                    {session.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{session.sessionDate}</span>
                </div>
                <h3 className="font-bold text-white text-sm">{session.name}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Squad: <strong className="text-slate-300">{session.teamName}</strong> • {session.location}
                </p>
              </div>

              <button
                onClick={() => onOpenMatsideEntry(session.id)}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition flex items-center space-x-1"
              >
                <span>Enter / Edit Matrix</span>
                <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Filter & Test Library Grid */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-4 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 rtl:left-auto rtl:right-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tests by name or description..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-8 pr-3 rtl:pl-3 rtl:pr-8 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none capitalize"
            >
              <option value="all">All Capacities</option>
              <option value="strength">Max Strength</option>
              <option value="power">Explosive Power</option>
              <option value="speed">Speed & Acceleration</option>
              <option value="endurance">Anaerobic & Aerobic</option>
              <option value="agility">Agility & Footwork</option>
              <option value="flexibility">Mobility & Bridge</option>
            </select>

            <button
              onClick={() => setIsAddTestOpen(true)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg border border-slate-700 font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Custom Test</span>
            </button>
          </div>
        </div>

        {/* Tests Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTests.map(test => {
            const recordedCount = testResults.filter(r => r.testId === test.id).length;

            return (
              <div
                key={test.id}
                className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-3 flex flex-col justify-between hover:border-slate-600 transition"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                        {getCategoryIcon(test.category)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-xs">{test.name}</h3>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">{test.category}</span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 bg-slate-900 text-amber-400 font-mono font-bold text-[10px] rounded border border-slate-800">
                      Unit: {test.unit}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                    {test.description}
                  </p>

                  <div className="mt-2 bg-slate-950/50 p-2 rounded-lg border border-slate-900 text-[10px] text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Direction:</span>
                      <span className="font-semibold text-slate-200 capitalize">{test.performanceDirection.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Norm Scale Range:</span>
                      <span className="font-mono text-cyan-400 font-bold">{test.minValue ?? '0'} - {test.maxValue ?? '100'} {test.unit}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    <strong className="text-slate-200">{recordedCount}</strong> athlete records
                  </span>
                  <span className="text-emerald-400 font-semibold text-[10px] flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> UWW Protocol
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Create Custom Test */}
      {isAddTestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">Create New Physical Test Protocol</h3>
            
            <form onSubmit={handleCreateTest} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Test Name *</label>
                <input
                  type="text"
                  required
                  value={newTestName}
                  onChange={e => setNewTestName(e.target.value)}
                  placeholder="e.g. Suplex Dummy Speed Throw 30s"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Capacity Category</label>
                  <select
                    value={newTestCategory}
                    onChange={e => setNewTestCategory(e.target.value as TestCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none capitalize"
                  >
                    <option value="strength">Strength</option>
                    <option value="power">Explosive Power</option>
                    <option value="speed">Speed</option>
                    <option value="endurance">Endurance</option>
                    <option value="agility">Agility</option>
                    <option value="flexibility">Flexibility</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Measurement Unit</label>
                  <input
                    type="text"
                    required
                    value={newTestUnit}
                    onChange={e => setNewTestUnit(e.target.value)}
                    placeholder="kg, sec, cm, reps, W"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Scoring Direction</label>
                  <select
                    value={newTestDirection}
                    onChange={e => setNewTestDirection(e.target.value as PerformanceDirection)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-white text-[11px] focus:outline-none"
                  >
                    <option value="higher_is_better">Higher is Better</option>
                    <option value="lower_is_better">Lower is Better (Time)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Min (Score 0)</label>
                  <input
                    type="number"
                    value={newTestMinVal}
                    onChange={e => setNewTestMinVal(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max (Score 100)</label>
                  <input
                    type="number"
                    value={newTestMaxVal}
                    onChange={e => setNewTestMaxVal(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={newTestDescription}
                  onChange={e => setNewTestDescription(e.target.value)}
                  placeholder="Measurement purpose..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddTestOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl"
                >
                  Save Protocol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
