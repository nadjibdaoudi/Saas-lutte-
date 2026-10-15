import React, { useState } from 'react';
import { Bot, Sparkles, Send, Dumbbell, Scale, Activity, Loader2, RefreshCw, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  analyzeWrestlerPerformance,
  generateWeightManagementAdvice,
  generateCustomTrainingDrills
} from '../../lib/ai/geminiService';

interface WrestlingAiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WrestlingAiAssistantModal: React.FC<WrestlingAiAssistantModalProps> = ({
  isOpen,
  onClose
}) => {
  const { language } = useAuth();
  const { athletes } = useData();

  const [activePromptType, setActivePromptType] = useState<'performance' | 'weight' | 'drills'>('performance');
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(athletes[0]?.id || '');
  const [drillFocus, setDrillFocus] = useState<'par_terre' | 'standing_throws' | 'clinch_pummeling' | 'conditioning'>('par_terre');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentAthlete = athletes.find(a => a.id === selectedAthleteId) || athletes[0];

  const handleRunAiAnalysis = async () => {
    setIsLoading(true);
    setAiResponse(null);

    try {
      if (activePromptType === 'performance' && currentAthlete) {
        const res = await analyzeWrestlerPerformance({
          wrestlerName: `${currentAthlete.firstName} ${currentAthlete.lastName}`,
          weightCategory: currentAthlete.weightCategory,
          style: currentAthlete.wrestlingStyle,
          recentMatchesCount: 8,
          winRate: 75,
          strengths: currentAthlete.gripPreference || 'High underhook & souplesse throw',
          weaknesses: currentAthlete.notes || 'Par terre gut wrench defense'
        }, language);
        setAiResponse(res);
      } else if (activePromptType === 'weight' && currentAthlete) {
        const res = await generateWeightManagementAdvice({
          wrestlerName: `${currentAthlete.firstName} ${currentAthlete.lastName}`,
          currentWeightKg: currentAthlete.currentWeightKg,
          targetWeightKg: currentAthlete.targetWeightKg,
          daysUntilWeighIn: 14,
          hydrationUSG: 1.015
        }, language);
        setAiResponse(res);
      } else if (activePromptType === 'drills') {
        const res = await generateCustomTrainingDrills({
          focusArea: drillFocus,
          experienceLevel: currentAthlete?.experienceLevel || 'Elite',
          durationMinutes: 45
        }, language);
        setAiResponse(res);
      }
    } catch (err) {
      console.error('AI execution error:', err);
      setAiResponse('AI Service encountered an error. Please check your network or try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white flex items-center space-x-1.5 rtl:space-x-reverse">
                <span>{language === 'ar' ? 'مساعد الذكاء الاصطناعي للمصارعة' : 'AI Wrestling Assistant'}</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h2>
              <p className="text-[10px] text-slate-400">Powered by Google Gemini 2.5 Flash</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prompt Modes Selector */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex gap-2">
          <button
            onClick={() => setActivePromptType('performance')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 rtl:space-x-reverse ${
              activePromptType === 'performance'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'تحليل النزالات' : 'Match Analysis'}</span>
          </button>

          <button
            onClick={() => setActivePromptType('weight')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 rtl:space-x-reverse ${
              activePromptType === 'weight'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'إدارة الوزن' : 'Weight Cut'}</span>
          </button>

          <button
            onClick={() => setActivePromptType('drills')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 rtl:space-x-reverse ${
              activePromptType === 'drills'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'تمارين مخصصة' : 'Custom Drills'}</span>
          </button>
        </div>

        {/* Prompt Input Form */}
        <div className="p-4 border-b border-slate-800 space-y-3 text-xs bg-slate-950/40">
          {activePromptType !== 'drills' ? (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'ar' ? 'اختر المصارع للتحليل' : 'Select Athlete'}
              </label>
              <select
                value={selectedAthleteId}
                onChange={e => setSelectedAthleteId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 focus:outline-none"
              >
                {athletes.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.firstName} {a.lastName} ({a.weightCategory})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'ar' ? 'تركيز التمرين المطلوب' : 'Drill Focus Area'}
              </label>
              <select
                value={drillFocus}
                onChange={e => setDrillFocus(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="par_terre">Par Terre Offense & Defense (القتال الأرضي)</option>
                <option value="standing_throws">Standing Throws & Souplesse (الرميات)</option>
                <option value="clinch_pummeling">Clinch & Underhook Control (الالتحام)</option>
                <option value="conditioning">Anaerobic Match Conditioning (اللياقة)</option>
              </select>
            </div>
          )}

          <button
            onClick={handleRunAiAnalysis}
            disabled={isLoading}
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2 rtl:space-x-reverse"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-300" />
            )}
            <span>
              {isLoading
                ? (language === 'ar' ? 'جاري تحليل البيانات...' : 'Analyzing with Gemini...')
                : (language === 'ar' ? 'توليد التحليل والتوصيات' : 'Generate AI Recommendations')}
            </span>
          </button>
        </div>

        {/* AI Output Box */}
        <div className="flex-1 overflow-y-auto p-5 text-xs text-slate-200 leading-relaxed bg-slate-900/60 whitespace-pre-wrap">
          {aiResponse ? (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-orange-400 font-bold mb-2">
                <Bot className="w-4 h-4" />
                <span>{language === 'ar' ? 'استجابة مساعد المصارعة الذكي' : 'Gemini AI Analysis'}</span>
              </div>
              <p className="text-slate-200 font-sans text-xs leading-relaxed">{aiResponse}</p>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-12 text-center text-slate-500 space-y-2">
              <Bot className="w-8 h-8 text-slate-700" />
              <p>{language === 'ar' ? 'اضغط على زر التوليد البدء في تحليل البيانات الفنية والتكتيكية' : 'Click Generate AI Recommendations to produce smart insights'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
