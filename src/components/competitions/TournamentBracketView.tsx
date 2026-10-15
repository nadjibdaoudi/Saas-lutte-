import React, { useState } from 'react';
import { Trophy, Award, User, CheckCircle2, Flame, Shield, ArrowRight, RefreshCw, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { generateSingleEliminationBracket, advanceWinnerInBracket, BracketMatchNode, GeneratedBracket, WrestlerParticipant } from '../../lib/bracketGenerator';

interface TournamentBracketViewProps {
  tournamentId: string;
  tournamentName: string;
  weightCategory: string;
}

export const TournamentBracketView: React.FC<TournamentBracketViewProps> = ({
  tournamentId,
  tournamentName,
  weightCategory
}) => {
  const { language } = useAuth();
  const { athletes } = useData();

  // Convert athletes in this weight category into bracket participants
  const poolAthletes = athletes.filter(a => a.weightCategory === weightCategory || athletes.length <= 8);
  const initialParticipants: WrestlerParticipant[] = (poolAthletes.length >= 2 ? poolAthletes : athletes).map((a, idx) => ({
    id: a.id,
    name: `${a.firstName} ${a.lastName}`,
    club: a.teamName || 'National Hub',
    country: a.nationality || 'FRA',
    seed: idx + 1,
    weightCategory: a.weightCategory
  }));

  const [bracket, setBracket] = useState<GeneratedBracket>(() =>
    generateSingleEliminationBracket(tournamentId, weightCategory, initialParticipants)
  );

  const [selectedMatch, setSelectedMatch] = useState<BracketMatchNode | null>(null);
  const [scoreP1, setScoreP1] = useState<number>(0);
  const [scoreP2, setScoreP2] = useState<number>(0);

  const handleRegenerateBracket = () => {
    const newBracket = generateSingleEliminationBracket(tournamentId, weightCategory, initialParticipants);
    setBracket(newBracket);
    setSelectedMatch(null);
  };

  const handleSelectMatchToScore = (match: BracketMatchNode) => {
    if (!match.wrestler1 || !match.wrestler2) return; // Need 2 wrestlers
    setSelectedMatch(match);
    setScoreP1(match.wrestler1Score || 0);
    setScoreP2(match.wrestler2Score || 0);
  };

  const handleSaveMatchScore = (winnerId: string) => {
    if (!selectedMatch) return;
    const updatedMatches = advanceWinnerInBracket(bracket.matches, selectedMatch.id, winnerId, scoreP1, scoreP2);

    // Rebuild rounds structure
    const updatedRounds = bracket.rounds.map(round => ({
      ...round,
      matches: round.matches.map(m => updatedMatches.find(um => um.id === m.id) || m)
    }));

    setBracket({
      ...bracket,
      matches: updatedMatches,
      rounds: updatedRounds
    });

    setSelectedMatch(null);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-black text-white">
              {language === 'ar' ? 'مولد شجرة البطولة الشجرية (Tournament Bracket)' : 'Dynamic Tournament Bracket Tree'}
            </h2>
            <span className="bg-amber-500/20 text-amber-400 text-[10px] font-mono font-black px-2 py-0.5 rounded border border-amber-500/30">
              {weightCategory}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {language === 'ar'
              ? 'توليد تلقائي لشجرة التصفيات الفردية، توزيع البذور، والتحديث التلقائي للفائزين'
              : 'Auto-seeded Single Elimination bracket generator with interactive score update and dynamic winner progression'}
          </p>
        </div>

        <button
          onClick={handleRegenerateBracket}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 rtl:space-x-reverse"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{language === 'ar' ? 'إعادة توليد الشجرة' : 'Regenerate Bracket'}</span>
        </button>
      </div>

      {/* Bracket Tree Visual Container */}
      <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-700">
        <div className="flex items-start space-x-8 min-w-[700px] rtl:space-x-reverse pt-2">
          {bracket.rounds.map((round, rIdx) => (
            <div key={round.roundNumber} className="flex-1 min-w-[200px] space-y-4">
              {/* Round Title */}
              <div className="text-center bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                <span className="text-xs font-black text-amber-400 block tracking-tight">
                  {round.roundName}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {round.matches.length} {round.matches.length === 1 ? 'Bout' : 'Bouts'}
                </span>
              </div>

              {/* Match Nodes Column */}
              <div className="space-y-6 flex flex-col justify-around min-h-[300px]">
                {round.matches.map((match) => {
                  const isCompleted = match.status === 'completed';
                  const isBye = match.status === 'bye';
                  const isSelected = selectedMatch?.id === match.id;

                  return (
                    <div
                      key={match.id}
                      onClick={() => handleSelectMatchToScore(match)}
                      className={`relative bg-slate-950/90 border rounded-xl p-3 transition shadow-sm ${
                        isSelected
                          ? 'border-amber-500 ring-2 ring-amber-500/30'
                          : isCompleted
                          ? 'border-emerald-500/50 bg-emerald-950/10'
                          : match.wrestler1 && match.wrestler2
                          ? 'border-slate-700 hover:border-slate-500 cursor-pointer'
                          : 'border-slate-800/80 opacity-70'
                      }`}
                    >
                      {/* Match Header Badge */}
                      <div className="flex justify-between items-center mb-2 text-[10px] font-mono text-slate-400">
                        <span>Match #{match.matchNumber}</span>
                        {isBye && (
                          <span className="bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded">BYE</span>
                        )}
                        {isCompleted && (
                          <span className="bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">
                            FINAL
                          </span>
                        )}
                      </div>

                      {/* Wrestler 1 */}
                      <div className={`p-2 rounded-lg flex justify-between items-center text-xs font-semibold mb-1.5 ${
                        match.winnerId === match.wrestler1?.id
                          ? 'bg-emerald-500/20 text-white font-bold border border-emerald-500/40'
                          : 'bg-slate-900 text-slate-300'
                      }`}>
                        <div className="flex items-center space-x-2 truncate rtl:space-x-reverse">
                          <span className="w-4 h-4 rounded bg-slate-800 text-slate-400 text-[10px] font-mono flex items-center justify-center font-bold">
                            {match.wrestler1?.seed || '—'}
                          </span>
                          <span className="truncate">{match.wrestler1?.name || (language === 'ar' ? 'في الانتظار' : 'TBD')}</span>
                        </div>
                        <span className="font-mono text-amber-400 font-bold ml-2">{match.wrestler1Score}</span>
                      </div>

                      {/* Wrestler 2 */}
                      <div className={`p-2 rounded-lg flex justify-between items-center text-xs font-semibold ${
                        match.winnerId === match.wrestler2?.id
                          ? 'bg-emerald-500/20 text-white font-bold border border-emerald-500/40'
                          : 'bg-slate-900 text-slate-300'
                      }`}>
                        <div className="flex items-center space-x-2 truncate rtl:space-x-reverse">
                          <span className="w-4 h-4 rounded bg-slate-800 text-slate-400 text-[10px] font-mono flex items-center justify-center font-bold">
                            {match.wrestler2?.seed || '—'}
                          </span>
                          <span className="truncate">{match.wrestler2?.name || (language === 'ar' ? 'في الانتظار' : 'TBD')}</span>
                        </div>
                        <span className="font-mono text-amber-400 font-bold ml-2">{match.wrestler2Score}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Match Scoring Modal/Drawer */}
      {selectedMatch && selectedMatch.wrestler1 && selectedMatch.wrestler2 && (
        <div className="bg-slate-950 border border-amber-500/50 rounded-xl p-5 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2 rtl:space-x-reverse">
                <Award className="w-4 h-4 text-amber-400" />
                <span>
                  {language === 'ar' ? 'تسجيل نتيجة النزال:' : 'Score Bout:'} {selectedMatch.roundName} (Match #{selectedMatch.matchNumber})
                </span>
              </h3>
            </div>
            <button
              onClick={() => setSelectedMatch(null)}
              className="text-slate-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Wrestler 1 Scoring Box */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-sm">{selectedMatch.wrestler1.name}</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                  {selectedMatch.wrestler1.club}
                </span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  {language === 'ar' ? 'النقاط الفنية (UWW Points)' : 'Technical Points'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={scoreP1}
                  onChange={e => setScoreP1(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-amber-400 font-mono font-bold text-base focus:outline-none"
                />
              </div>

              <button
                onClick={() => handleSaveMatchScore(selectedMatch.wrestler1!.id)}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition flex items-center justify-center space-x-1 rtl:space-x-reverse"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'ar' ? 'تأحديد كفائز بالمواجهة' : 'Declare Winner'}</span>
              </button>
            </div>

            {/* Wrestler 2 Scoring Box */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-sm">{selectedMatch.wrestler2.name}</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                  {selectedMatch.wrestler2.club}
                </span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  {language === 'ar' ? 'النقاط الفنية (UWW Points)' : 'Technical Points'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={scoreP2}
                  onChange={e => setScoreP2(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-amber-400 font-mono font-bold text-base focus:outline-none"
                />
              </div>

              <button
                onClick={() => handleSaveMatchScore(selectedMatch.wrestler2!.id)}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition flex items-center justify-center space-x-1 rtl:space-x-reverse"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'ar' ? 'تحديد كفائز بالمواجهة' : 'Declare Winner'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
