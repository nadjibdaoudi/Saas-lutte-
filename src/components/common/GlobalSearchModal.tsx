import React, { useState, useEffect } from 'react';
import { Search, X, Users, Activity, Trophy, Dumbbell, ArrowRight } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { ActiveTab } from '../layout/Sidebar';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: ActiveTab, entityId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [query, setQuery] = useState('');
  const { athletes, tests, teams, competitions } = useData();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // toggle search
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredAthletes = query.trim() ? athletes.filter(a => 
    `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase().includes(query.toLowerCase()) ||
    (a.weightCategory || '').toLowerCase().includes(query.toLowerCase()) ||
    (a.nationality || '').toLowerCase().includes(query.toLowerCase())
  ) : [];

  const filteredTests = query.trim() ? tests.filter(t => 
    (t.name || '').toLowerCase().includes(query.toLowerCase()) ||
    (t.category || '').toLowerCase().includes(query.toLowerCase())
  ) : [];

  const filteredCompetitions = query.trim() ? competitions.filter(c => 
    (c.name || '').toLowerCase().includes(query.toLowerCase()) ||
    (c.location || '').toLowerCase().includes(query.toLowerCase())
  ) : [];

  const filteredTeams = query.trim() ? teams.filter(tm => 
    (tm.name || '').toLowerCase().includes(query.toLowerCase())
  ) : [];

  const hasResults = filteredAthletes.length > 0 || filteredTests.length > 0 || filteredCompetitions.length > 0 || filteredTeams.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Search Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-5 h-5 text-amber-500 mr-3 rtl:mr-0 rtl:ml-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search athletes by name/weight, physical tests, tournaments, teams..."
            autoFocus
            className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 focus:outline-none text-sm"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-white mr-2">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700 hover:text-white">
            ESC
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4 text-xs">
          {!query.trim() ? (
            <div className="py-8 text-center text-slate-500">
              <p className="font-medium">Type to search the entire wrestling performance database.</p>
              <p className="text-[11px] text-slate-400 mt-1">Try "Ibrahim", "72 kg", "Sprint", "Souplesse", or "Zagreb".</p>
            </div>
          ) : !hasResults ? (
            <div className="py-8 text-center text-slate-400">
              No matching athletes, tests, or tournaments found for "{query}".
            </div>
          ) : (
            <>
              {/* Athletes */}
              {filteredAthletes.length > 0 && (
                <div>
                  <div className="flex items-center space-x-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-2">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>Athletes ({filteredAthletes.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredAthletes.map(athlete => (
                      <div
                        key={athlete.id}
                        onClick={() => {
                          onNavigate('athletes', athlete.id);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 cursor-pointer transition group border border-slate-700/50"
                      >
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <img
                            src={athlete.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                            alt={athlete.firstName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold text-slate-200 group-hover:text-amber-400">
                              {athlete.firstName} {athlete.lastName}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {athlete.weightCategory} • {athlete.teamName} • Score: <span className="text-amber-400 font-bold">{athlete.performanceScore}/100</span>
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 rtl:rotate-180" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Physical Tests */}
              {filteredTests.length > 0 && (
                <div>
                  <div className="flex items-center space-x-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-2">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Physical Tests ({filteredTests.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredTests.map(test => (
                      <div
                        key={test.id}
                        onClick={() => {
                          onNavigate('tests', test.id);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 cursor-pointer transition group border border-slate-700/50"
                      >
                        <div>
                          <p className="font-semibold text-slate-200 group-hover:text-cyan-400">{test.name}</p>
                          <p className="text-[10px] text-slate-400 capitalize">{test.category} • Unit: {test.unit} • {test.performanceDirection.replace('_', ' ')}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 rtl:rotate-180" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Competitions */}
              {filteredCompetitions.length > 0 && (
                <div>
                  <div className="flex items-center space-x-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-2">
                    <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Tournaments ({filteredCompetitions.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredCompetitions.map(comp => (
                      <div
                        key={comp.id}
                        onClick={() => {
                          onNavigate('competitions', comp.id);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 cursor-pointer transition group border border-slate-700/50"
                      >
                        <div>
                          <p className="font-semibold text-slate-200 group-hover:text-yellow-400">{comp.name}</p>
                          <p className="text-[10px] text-slate-400">{comp.location}, {comp.country} • {comp.startDate}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-yellow-400 rtl:rotate-180" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
