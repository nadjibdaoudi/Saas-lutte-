import React, { useState } from 'react';
import { 
  Dumbbell, Plus, Calendar, Clock, Flame, 
  CheckCircle2, ChevronRight, UserCheck, Play 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { TrainingPlan, TrainingSession, TrainingExercise } from '../../types';

export const TrainingView: React.FC = () => {
  const { user } = useAuth();
  const { trainingPlans = [], trainingSessions = [], teams = [] } = useData();

  const [activePlanId, setActivePlanId] = useState(trainingPlans[0]?.id || '');
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);

  const currentPlan = trainingPlans.find(p => p.id === activePlanId) || trainingPlans[0];
  const currentSessions = trainingSessions.filter(s => s.planId === currentPlan?.id || s.trainingPlanId === currentPlan?.id);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <Dumbbell className="w-5 h-5 text-amber-500" />
            <span>Greco-Roman Training Management</span>
          </h1>
          <p className="text-xs text-slate-400">
            Macrocycle periodization, mat wrestling drills, strength circuits, and load monitoring (RPE)
          </p>
        </div>

        {user?.role !== 'athlete' && (
          <button
            onClick={() => setIsAddSessionOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Training Session</span>
          </button>
        )}
      </div>

      {/* Plan Selector & Macrocycle Overview */}
      {currentPlan ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                <span className="bg-amber-500/20 text-amber-400 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border border-amber-500/30">
                  {(currentPlan.macrocyclePhase || currentPlan.phase || 'Preparation').toUpperCase()} PHASE
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {currentPlan.startDate} to {currentPlan.endDate}
                </span>
              </div>
              <h2 className="text-lg font-black text-white">{currentPlan.title}</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">{currentPlan.description}</p>
            </div>

            <div className="flex items-center space-x-3 text-xs bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400 text-[10px] block">Target Focus:</span>
                <strong className="text-amber-400">{currentPlan.targetFocus || 'Technical & Tactical'}</strong>
              </div>
              <div className="h-6 w-px bg-slate-800"></div>
              <div>
                <span className="text-slate-400 text-[10px] block">Target Squad:</span>
                <strong className="text-cyan-400">{currentPlan.teamName || 'All Squads'}</strong>
              </div>
            </div>
          </div>

          {/* Microcycle Sessions Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Scheduled Microcycle Sessions ({currentSessions.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentSessions.map(session => (
                <div
                  key={session.id}
                  className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-3 hover:border-slate-600 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 font-bold rounded text-[10px] uppercase">
                          {(session.sessionType || session.category || 'Mat Specific').replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {session.scheduledDate || session.sessionDate || 'Scheduled'} {session.startTime ? `(${session.startTime})` : ''}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-sm">{session.title}</h4>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-rose-400 font-mono font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                        RPE {session.rpeTarget || session.intensityRpe || 8}/10
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300">{session.objectives || session.notes || ''}</p>

                  {/* Exercises List */}
                  {session.exercises && session.exercises.length > 0 && (
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1 text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Prescribed Drills & Sets</span>
                      {session.exercises.map((ex, idx) => (
                        <div key={idx} className="flex justify-between text-slate-300 py-0.5 border-b border-slate-800/40 last:border-none">
                          <span>• {ex.name}</span>
                          <span className="font-mono text-cyan-400 font-bold">
                            {ex.sets} × {ex.reps || 'N/A'} {ex.intensityRpe ? `(RPE ${ex.intensityRpe})` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{session.durationMinutes} min session</span>
                    </span>
                    <span className="text-emerald-400 font-semibold flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Ready for Mat
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
          No training plans active. Create a new plan to get started.
        </div>
      )}
    </div>
  );
};
