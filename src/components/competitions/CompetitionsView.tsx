import React, { useState } from 'react';
import { Trophy, Plus, MapPin, Calendar, CheckCircle2, ChevronRight, Award, Flame } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Competition, MatchRecord } from '../../types';

export const CompetitionsView: React.FC = () => {
  const { user } = useAuth();
  const { competitions, matches, athletes } = useData();

  const [selectedCompId, setSelectedCompId] = useState(competitions[0]?.id || '');
  const currentComp = competitions.find(c => c.id === selectedCompId) || competitions[0];
  const compMatches = matches.filter(m => m.competitionId === currentComp?.id);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>Tournaments & Match Performance Analysis</span>
          </h1>
          <p className="text-xs text-slate-400">
            UWW Grand Prix, Continental Championships, bout logs, and Greco-Roman technical scoring
          </p>
        </div>
      </div>

      {/* Competitions Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {competitions.map(comp => {
          const isSelected = comp.id === selectedCompId;
          const matchCount = matches.filter(m => m.competitionId === comp.id).length;

          return (
            <div
              key={comp.id}
              onClick={() => setSelectedCompId(comp.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition shadow-sm ${
                isSelected 
                  ? 'bg-slate-900 border-amber-500/80 ring-1 ring-amber-500/40' 
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className="bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-amber-500/30">
                    {(comp.tier || comp.competitionType || 'International').toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{comp.startDate}</span>
                </div>

                <span className="text-xs text-slate-300 font-mono font-bold">
                  {matchCount} Bouts Logged
                </span>
              </div>

              <h3 className="text-base font-black text-white">{comp.name}</h3>
              <p className="text-xs text-slate-300 flex items-center space-x-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>{comp.location}, {comp.country}</span>
              </p>
            </div>
          );
        })}
      </div>

      {/* Selected Tournament Matches List */}
      {currentComp && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-black text-white">
                Bouts Breakdown: {currentComp.name}
              </h2>
              <p className="text-[11px] text-slate-400">Official technical points, passivity cautions, and outcome analysis</p>
            </div>
          </div>

          <div className="space-y-3">
            {compMatches.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No individual matches recorded yet for this tournament.
              </div>
            ) : (
              compMatches.map(match => (
                <div
                  key={match.id}
                  className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-600 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        match.isWin ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                      }`}>
                        {match.isWin ? 'WIN' : 'LOSS'} • {(match.result || 'DEC').toUpperCase()}
                      </span>
                      <span className="text-xs font-bold text-amber-400">{match.weightCategory}</span>
                      <span className="text-xs text-slate-400 font-mono">({match.roundName})</span>
                    </div>

                    <div className="flex items-baseline space-x-3 text-sm">
                      <strong className="text-white">{match.athleteName}</strong>
                      <span className="text-slate-400 text-xs">vs</span>
                      <span className="text-slate-300 font-medium">{match.opponentName} ({match.opponentCountry})</span>
                    </div>

                    <p className="text-[11px] text-slate-400 italic">{match.coachTacticalNotes}</p>
                  </div>

                  {/* Bout Score Box & Greco Actions */}
                  <div className="flex items-center space-x-4 bg-slate-950/70 p-3 rounded-xl border border-slate-800 shrink-0">
                    <div className="text-center px-3 border-r border-slate-800">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Final Score</span>
                      <span className="text-lg font-black text-amber-400 font-mono">
                        {match.athleteScore} - {match.opponentScore}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-300 space-y-0.5">
                      <div>Throws: <strong className="text-cyan-400">{match.throwsExecuted}</strong></div>
                      <div>Gut Wrench: <strong className="text-amber-400">{match.gutWrenchExecuted}</strong></div>
                      <div>Passivity: <strong className="text-slate-400">{match.passivityCallsReceived} received</strong></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
