import React, { useState } from 'react';
import { Award, Plus, Search, Filter, ShieldCheck, ChevronRight, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface WrestlingAssessmentViewProps {
  onOpenAssessmentModal: (athleteId?: string) => void;
  onSelectAthlete: (athleteId: string) => void;
}

export const WrestlingAssessmentView: React.FC<WrestlingAssessmentViewProps> = ({
  onOpenAssessmentModal,
  onSelectAthlete
}) => {
  const { t, user } = useAuth();
  const { wrestlingAssessments, athletes } = useData();
  const [search, setSearch] = useState('');

  const filteredAssessments = wrestlingAssessments.filter(a => 
    (a.athleteName || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.strengths && a.strengths.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Greco-Roman Technical Assessments</span>
          </h1>
          <p className="text-xs text-slate-400">
            Standardized 4-pillar Greco-Roman rubric evaluations, technical indices, and tactical reports
          </p>
        </div>

        {user?.role !== 'athlete' && (
          <button
            onClick={() => onOpenAssessmentModal()}
            className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Technical Evaluation</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 rtl:left-auto rtl:right-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search evaluations by wrestler or strength..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 rtl:pl-3 rtl:pr-8 py-1.5 text-xs text-white focus:outline-none"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {filteredAssessments.length} assessments completed
        </span>
      </div>

      {/* Assessments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAssessments.map(assess => (
          <div
            key={assess.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 space-y-4 shadow-sm transition"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 
                    onClick={() => onSelectAthlete(assess.athleteId)}
                    className="font-bold text-white text-sm hover:text-amber-400 cursor-pointer"
                  >
                    {assess.athleteName}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Evaluator: <strong className="text-slate-300">{assess.evaluatorName || 'Coach'}</strong> • {assess.assessmentDate}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-lg font-black text-amber-400 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  {assess.overallWrestlingScore}/100
                </span>
              </div>
            </div>

            {/* Quick 4 Pillar Mini Scores */}
            <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block">Standing</span>
                <span className="font-bold text-amber-400 font-mono text-xs">{assess.throwingTechnique}/10</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block">Defense</span>
                <span className="font-bold text-cyan-400 font-mono text-xs">{assess.groundParTerreDefense}/10</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block">Tactics</span>
                <span className="font-bold text-emerald-400 font-mono text-xs">{assess.passivityManagement}/10</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block">Grit</span>
                <span className="font-bold text-purple-400 font-mono text-xs">{assess.gritMentalToughness}/10</span>
              </div>
            </div>

            {/* Coach observations */}
            <div className="text-xs space-y-1 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 text-slate-300">
              <p><strong className="text-emerald-400 font-semibold">Strengths:</strong> {assess.strengths}</p>
              <p><strong className="text-amber-400 font-semibold">Improvement:</strong> {assess.areasForImprovement}</p>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                onClick={() => onSelectAthlete(assess.athleteId)}
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center"
              >
                <span>View Full Athlete Dossier</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 rtl:rotate-180" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
