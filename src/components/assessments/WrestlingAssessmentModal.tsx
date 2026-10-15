import React, { useState } from 'react';
import { X, Award, Save, CheckCircle2, ChevronRight } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

interface WrestlingAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAthleteId?: string;
}

export const WrestlingAssessmentModal: React.FC<WrestlingAssessmentModalProps> = ({
  isOpen,
  onClose,
  initialAthleteId
}) => {
  const { user } = useAuth();
  const { athletes, saveWrestlingAssessment } = useData();

  const [athleteId, setAthleteId] = useState(initialAthleteId || athletes[0]?.id || '');
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split('T')[0]);

  // Pillar 1: Standing & Throwing (1 to 10)
  const [takedownTechnique, setTakedownTechnique] = useState(8.5);
  const [throwingTechnique, setThrowingTechnique] = useState(9.0);
  const [clinchUnderhook, setClinchUnderhook] = useState(9.0);
  const [groundParTerreOffense, setGroundParTerreOffense] = useState(9.0);

  // Pillar 2: Defense (1 to 10)
  const [takedownDefense, setTakedownDefense] = useState(8.5);
  const [groundParTerreDefense, setGroundParTerreDefense] = useState(8.0);
  const [clinchPummelingDefense, setClinchPummelingDefense] = useState(9.0);
  const [balanceRecovery, setBalanceRecovery] = useState(8.5);

  // Pillar 3: Tactics & Mat Zone (1 to 10)
  const [passivityManagement, setPassivityManagement] = useState(9.0);
  const [matZoneControl, setMatZoneControl] = useState(8.5);
  const [decisionMaking, setDecisionMaking] = useState(8.5);
  const [periodTempoStrategy, setPeriodTempoStrategy] = useState(9.0);

  // Pillar 4: Mental & Behavior (1 to 10)
  const [discipline, setDiscipline] = useState(9.5);
  const [gritMentalToughness, setGritMentalToughness] = useState(9.5);
  const [coachability, setCoachability] = useState(9.0);
  const [competitionFocus, setCompetitionFocus] = useState(9.0);

  // Qualitative notes
  const [strengths, setStrengths] = useState('Devastating head-and-arm throw and unstoppable gut-wrench rotation in par terre.');
  const [areasForImprovement, setAreasForImprovement] = useState('Maintain tighter elbow defense when opponent initiates double underhook.');
  const [coachFeedback, setCoachFeedback] = useState('Ready for championship contention. Prioritize first-minute pace to draw passivity calls.');

  if (!isOpen) return null;

  const currentAthlete = athletes.find(a => a.id === athleteId);

  // Calculate live composite (0-100)
  const allRatings = [
    takedownTechnique, throwingTechnique, clinchUnderhook, groundParTerreOffense,
    takedownDefense, groundParTerreDefense, clinchPummelingDefense, balanceRecovery,
    passivityManagement, matZoneControl, decisionMaking, periodTempoStrategy,
    discipline, gritMentalToughness, coachability, competitionFocus
  ];
  const liveComposite = Math.round((allRatings.reduce((a, b) => a + b, 0) / (allRatings.length * 10)) * 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAthlete) return;

    saveWrestlingAssessment({
      athleteId: currentAthlete.id,
      athleteName: `${currentAthlete.firstName} ${currentAthlete.lastName}`,
      evaluatorId: user?.id || 'coach-1',
      evaluatorName: `${user?.firstName || 'Head'} ${user?.lastName || 'Coach'}`,
      assessmentDate,
      takedownTechnique: Number(takedownTechnique),
      throwingTechnique: Number(throwingTechnique),
      clinchUnderhook: Number(clinchUnderhook),
      groundParTerreOffense: Number(groundParTerreOffense),
      takedownDefense: Number(takedownDefense),
      groundParTerreDefense: Number(groundParTerreDefense),
      clinchPummelingDefense: Number(clinchPummelingDefense),
      balanceRecovery: Number(balanceRecovery),
      passivityManagement: Number(passivityManagement),
      matZoneControl: Number(matZoneControl),
      decisionMaking: Number(decisionMaking),
      periodTempoStrategy: Number(periodTempoStrategy),
      discipline: Number(discipline),
      gritMentalToughness: Number(gritMentalToughness),
      coachability: Number(coachability),
      competitionFocus: Number(competitionFocus),
      overallWrestlingScore: liveComposite,
      strengths,
      areasForImprovement,
      coachFeedback
    });

    onClose();
  };

  const renderSlider = (label: string, value: number, setter: (v: number) => void) => (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-[11px]">
        <span className="text-slate-300 font-medium">{label}</span>
        <span className="font-mono font-bold text-amber-400">{value.toFixed(1)} / 10</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        step="0.5"
        value={value}
        onChange={e => setter(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Greco-Roman Technical Rubric Evaluation</h3>
              <p className="text-[11px] text-slate-400">Standardized scoring across Standing, Defense, Mat Zone & Grit</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Top Bar: Athlete & Date & Live Index */}
          <div className="flex flex-wrap gap-4 items-center justify-between bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Athlete *</label>
                <select
                  value={athleteId}
                  onChange={e => setAthleteId(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none"
                >
                  {athletes.map(a => (
                    <option key={a.id} value={a.id}>{a.firstName} {a.lastName} ({a.weightCategory})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Evaluation Date</label>
                <input
                  type="date"
                  value={assessmentDate}
                  onChange={e => setAssessmentDate(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium">Technical Index:</span>
              <span className="text-xl font-black text-amber-400 font-mono">{liveComposite}/100</span>
            </div>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Pillar 1: Standing & Upper-Body Throws */}
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 space-y-3">
              <h4 className="font-bold text-amber-400 uppercase text-[10px] tracking-wider border-b border-slate-700 pb-1.5">
                1. Standing & Upper-Body Offense
              </h4>
              {renderSlider('Takedowns & Snaps', takedownTechnique, setTakedownTechnique)}
              {renderSlider('Throws & High-Amplitude Souplesse', throwingTechnique, setThrowingTechnique)}
              {renderSlider('Clinch & Underhook Control', clinchUnderhook, setClinchUnderhook)}
              {renderSlider('Par Terre Gut Wrench / Turn', groundParTerreOffense, setGroundParTerreOffense)}
            </div>

            {/* Pillar 2: Defense & Ground Base */}
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 space-y-3">
              <h4 className="font-bold text-cyan-400 uppercase text-[10px] tracking-wider border-b border-slate-700 pb-1.5">
                2. Defensive Posture & Ground Base
              </h4>
              {renderSlider('Takedown Defense / Sprawl', takedownDefense, setTakedownDefense)}
              {renderSlider('Par Terre Base Defense (Flat Mat)', groundParTerreDefense, setGroundParTerreDefense)}
              {renderSlider('Clinch & Pummeling Defense', clinchPummelingDefense, setClinchPummelingDefense)}
              {renderSlider('Balance & Dynamic Recovery', balanceRecovery, setBalanceRecovery)}
            </div>

            {/* Pillar 3: Tactics, Passivity & Mat Zone */}
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 space-y-3">
              <h4 className="font-bold text-emerald-400 uppercase text-[10px] tracking-wider border-b border-slate-700 pb-1.5">
                3. UWW Match Tactics & Zone Control
              </h4>
              {renderSlider('Passivity Management & Pace', passivityManagement, setPassivityManagement)}
              {renderSlider('Mat Zone & Edge Management', matZoneControl, setMatZoneControl)}
              {renderSlider('Risk Assessment & Decisions', decisionMaking, setDecisionMaking)}
              {renderSlider('Period 1 & 2 Tempo Strategy', periodTempoStrategy, setPeriodTempoStrategy)}
            </div>

            {/* Pillar 4: Mental Grit & Coachability */}
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 space-y-3">
              <h4 className="font-bold text-purple-400 uppercase text-[10px] tracking-wider border-b border-slate-700 pb-1.5">
                4. Mental Grit & Behavioral Attributes
              </h4>
              {renderSlider('Daily Discipline & Preparation', discipline, setDiscipline)}
              {renderSlider('Grit & Mental Toughness under Fatigue', gritMentalToughness, setGritMentalToughness)}
              {renderSlider('Coachability & Instruction Retention', coachability, setCoachability)}
              {renderSlider('Competition Focus under Pressure', competitionFocus, setCompetitionFocus)}
            </div>
          </div>

          {/* Qualitative Coach Observations */}
          <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="block text-emerald-400 font-bold mb-1">Key Technical Strengths</label>
              <input
                type="text"
                value={strengths}
                onChange={e => setStrengths(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-amber-400 font-bold mb-1">Areas for Improvement</label>
              <input
                type="text"
                value={areasForImprovement}
                onChange={e => setAreasForImprovement(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Coach Strategy Feedback</label>
              <textarea
                rows={2}
                value={coachFeedback}
                onChange={e => setCoachFeedback(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Official Assessment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
