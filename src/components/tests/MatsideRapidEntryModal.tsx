import React, { useState } from 'react';
import { 
  X, Zap, Save, CheckCircle2, Award, 
  ChevronDown, AlertCircle, ArrowUpRight 
} from 'lucide-react';
import { useData } from '../../context/DataContext';

interface MatsideRapidEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSessionId?: string;
}

export const MatsideRapidEntryModal: React.FC<MatsideRapidEntryModalProps> = ({
  isOpen,
  onClose,
  initialSessionId
}) => {
  const { athletes, tests, testSessions, testResults, recordTestResult, calculateTestScore } = useData();

  const [selectedSessionId, setSelectedSessionId] = useState(initialSessionId || testSessions[0]?.id || '');
  const [selectedTestId, setSelectedTestId] = useState(tests[0]?.id || '');
  const [entryValues, setEntryValues] = useState<{ [athleteId: string]: string }>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const currentSession = testSessions.find(s => s.id === selectedSessionId) || testSessions[0];
  const currentTest = tests.find(t => t.id === selectedTestId) || tests[0];

  // Squad athletes
  const squadAthletes = athletes.filter(a => !currentSession?.teamId || a.teamId === currentSession.teamId);

  const handleValueChange = (athleteId: string, val: string) => {
    setEntryValues(prev => ({
      ...prev,
      [athleteId]: val
    }));
  };

  const handleSaveAll = () => {
    if (!currentTest) return;

    Object.entries(entryValues).forEach(([athleteId, valStr]) => {
      const rawVal = parseFloat(String(valStr));
      if (!isNaN(rawVal)) {
        const athlete = athletes.find(a => a.id === athleteId);
        if (athlete) {
          const score = calculateTestScore(currentTest, rawVal);
          recordTestResult({
            testId: currentTest.id,
            testName: currentTest.name,
            testCategory: currentTest.category,
            athleteId: athlete.id,
            athleteName: `${athlete.firstName} ${athlete.lastName}`,
            sessionId: currentSession?.id,
            sessionName: currentSession?.name || 'Matside Quick Battery',
            recordedDate: new Date().toISOString().split('T')[0],
            rawValue: rawVal,
            unit: currentTest.unit,
            calculatedScore: score,
            notes: 'Recorded via Matside Rapid Matrix'
          });
        }
      }
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black text-white">Matside Rapid Matrix Entry</h3>
                <span className="bg-amber-500/20 text-amber-400 font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                  TABLET OPTIMIZED
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Instantly score entire squad during live testing batteries</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Bar: Session & Test Selector */}
        <div className="p-4 bg-slate-950/50 border-b border-slate-800 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 text-xs flex-1">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Testing Battery Session</label>
              <select
                value={selectedSessionId}
                onChange={e => setSelectedSessionId(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none"
              >
                {testSessions.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.sessionDate})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-amber-400 mb-1">Active Physical Test *</label>
              <select
                value={selectedTestId}
                onChange={e => setSelectedTestId(e.target.value)}
                className="bg-slate-800 border border-amber-500/50 text-amber-400 font-bold rounded-lg px-3 py-1.5 focus:outline-none"
              >
                {tests.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.unit}) - {t.category}</option>
                ))}
              </select>
            </div>
          </div>

          {currentTest && (
            <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-300">
              Direction: <strong className="text-amber-400 capitalize">{currentTest.performanceDirection.replace(/_/g, ' ')}</strong> • Unit: <strong className="text-cyan-400 font-mono">{currentTest.unit}</strong>
            </div>
          )}
        </div>

        {/* Wrestlers Entry Matrix Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {squadAthletes.map(athlete => {
              const currentVal = entryValues[athlete.id] || '';
              const rawNum = parseFloat(currentVal);
              const previewScore = !isNaN(rawNum) && currentTest ? calculateTestScore(currentTest, rawNum) : null;

              // Find previous PB or latest result
              const pastResults = testResults.filter(r => r.athleteId === athlete.id && r.testId === currentTest?.id);
              const latestPast = pastResults[pastResults.length - 1];

              return (
                <div
                  key={athlete.id}
                  className="bg-slate-800/60 border border-slate-700/70 hover:border-slate-600 rounded-xl p-3.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
                    <img
                      src={athlete.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={athlete.firstName}
                      className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-600"
                    />
                    <div className="truncate">
                      <p className="font-bold text-white text-xs truncate">
                        {athlete.firstName} {athlete.lastName}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {athlete.weightCategory} • Prev: <span className="font-mono text-slate-300">{latestPast ? `${latestPast.rawValue} ${latestPast.unit}` : 'N/A'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Input & Instant Score Badge */}
                  <div className="flex items-center space-x-2 rtl:space-x-reverse shrink-0">
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        value={currentVal}
                        onChange={e => handleValueChange(athlete.id, e.target.value)}
                        placeholder={`0.0`}
                        className="w-24 bg-slate-950 border border-slate-600 rounded-lg px-2.5 py-2 text-white font-mono font-bold text-sm text-center focus:border-amber-500 focus:outline-none"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-slate-500 font-mono pointer-events-none">
                        {currentTest?.unit}
                      </span>
                    </div>

                    <div className="w-14 text-center">
                      {previewScore !== null ? (
                        <div className="bg-amber-500/20 border border-amber-500/40 rounded-lg py-1 px-1 text-center">
                          <span className="text-[9px] text-amber-400 block font-bold">SCORE</span>
                          <span className="font-mono font-black text-amber-400 text-xs">{previewScore}</span>
                        </div>
                      ) : (
                        <div className="bg-slate-900 border border-slate-800 rounded-lg py-1 px-1 text-center text-slate-500 text-[10px]">
                          —
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {Object.keys(entryValues).filter(k => entryValues[k]).length} entries filled out
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              disabled={saveSuccess}
              className={`px-5 py-2 rounded-xl text-xs font-black transition flex items-center space-x-1.5 shadow-md ${
                saveSuccess 
                  ? 'bg-emerald-500 text-slate-950' 
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
              }`}
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved to Database!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Submit Batch Results</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
