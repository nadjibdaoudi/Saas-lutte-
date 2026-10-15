import React, { useState } from 'react';
import { Scale, AlertTriangle, TrendingDown, CheckCircle2, Save, Calculator, Droplets, Info, Flame, ShieldAlert, Sparkles } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { UWW_WEIGHT_CATEGORIES, calculateWeightCutPlan, WeightCutCalculationResult } from '../../lib/weightCalculator';

export const WeightManagementView: React.FC = () => {
  const { language } = useAuth();
  const { athletes, weightRecords, recordWeight } = useData();

  const [selectedAthleteId, setSelectedAthleteId] = useState(athletes[0]?.id || '');
  const [newWeight, setNewWeight] = useState(72.4);
  const [usg, setUsg] = useState<number>(1.015);
  const [weighInNotes, setWeighInNotes] = useState('Morning empty stomach weigh-in');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Calculator custom inputs
  const [calcCurrentWeight, setCalcCurrentWeight] = useState<number>(75.0);
  const [calcTargetCategory, setCalcTargetCategory] = useState<string>('77 kg');
  const [calcTargetWeight, setCalcTargetWeight] = useState<number>(77.0);
  const [calcTargetDate, setCalcTargetDate] = useState<string>(
    new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [calcStyle, setCalcStyle] = useState<'greco_roman' | 'freestyle' | 'female'>('greco_roman');

  const currentAthlete = athletes.find(a => a.id === selectedAthleteId) || athletes[0];
  const athleteHistory = weightRecords
    .filter(w => w.athleteId === currentAthlete?.id)
    .sort((a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime());

  const chartData = athleteHistory.map(w => ({
    date: w.recordDate,
    weight: w.weightKg,
    target: w.targetWeightKg
  }));

  // Perform weight cut calculation
  const calcResult: WeightCutCalculationResult = calculateWeightCutPlan(
    calcCurrentWeight,
    calcTargetWeight,
    calcTargetDate,
    usg
  );

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

  const handleSelectAthleteForCalc = (athleteId: string) => {
    setSelectedAthleteId(athleteId);
    const ath = athletes.find(a => a.id === athleteId);
    if (ath) {
      setCalcCurrentWeight(ath.currentWeightKg);
      setCalcTargetWeight(ath.targetWeightKg || ath.currentWeightKg);
      setCalcTargetCategory(ath.weightCategory);
      setNewWeight(ath.currentWeightKg);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center space-x-2 rtl:space-x-reverse">
            <Scale className="w-5 h-5 text-amber-500" />
            <span>
              {language === 'ar' ? 'حاسبة فئات الوزن وإدارة التخفيض الآمن' : 'Weight Class & Safe Weight Cut Calculator'}
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            {language === 'ar'
              ? 'تتبع معايير الاتحاد الدولي للمصارعة UWW، مراقبة حالة الإماهة والجفاف، وحساب معدل التخفيض الأسبوعي الآمن'
              : 'Official UWW weight cutting curves, safe hydration monitoring, and competition weigh-in readiness'}
          </p>
        </div>
      </div>

      {/* Feature 1 Section: Weight Cut & Weight Class Calculator Card */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
          <Calculator className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-black text-white">
            {language === 'ar' ? 'حاسبة التخفيض الذكية (UWW Weight Cut Calculator)' : 'Smart UWW Weight Cut & Safety Calculator'}
          </h2>
          <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/30">
            {language === 'ar' ? 'معايير UWW الرسمية' : 'UWW Standard'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form inputs */}
          <div className="space-y-3 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'ar' ? 'اختيار المصارع' : 'Select Wrestler'}
              </label>
              <select
                value={selectedAthleteId}
                onChange={e => handleSelectAthleteForCalc(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none"
              >
                {athletes.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.firstName} {a.lastName} ({a.weightCategory}) - {a.currentWeightKg} kg
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'ar' ? 'أسلوب المصارعة' : 'Style'}
                </label>
                <select
                  value={calcStyle}
                  onChange={e => setCalcStyle(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="greco_roman">Greco-Roman</option>
                  <option value="freestyle">Freestyle</option>
                  <option value="female">Women's Wrestling</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'ar' ? 'فئة الوزن المستهدفة' : 'Target Class'}
                </label>
                <select
                  value={calcTargetCategory}
                  onChange={e => {
                    setCalcTargetCategory(e.target.value);
                    const catObj = UWW_WEIGHT_CATEGORIES.find(c => c.categoryName === e.target.value);
                    if (catObj) setCalcTargetWeight(catObj.maxWeightKg);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
                >
                  {UWW_WEIGHT_CATEGORIES.filter(c => c.style === calcStyle).map(cat => (
                    <option key={cat.categoryName} value={cat.categoryName}>
                      {cat.categoryName} {cat.isOlympic ? '(Olympic)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'ar' ? 'الوزن الحالي (كجم)' : 'Current Weight (kg)'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={calcCurrentWeight}
                  onChange={e => setCalcCurrentWeight(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-amber-400 font-mono font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'ar' ? 'الوزن المستهدف (كجم)' : 'Target Weight (kg)'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={calcTargetWeight}
                  onChange={e => setCalcTargetWeight(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-cyan-400 font-mono font-bold focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'ar' ? 'تاريخ الوزن الرسمي' : 'Weigh-in Date'}
                </label>
                <input
                  type="date"
                  value={calcTargetDate}
                  onChange={e => setCalcTargetDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span>{language === 'ar' ? 'مؤشر الجفاف USG' : 'Hydration USG'}</span>
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="1.000"
                  max="1.040"
                  value={usg}
                  onChange={e => setUsg(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Calculator Results Display */}
          <div className="lg:col-span-2 space-y-4 flex flex-col justify-between">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  {language === 'ar' ? 'الوزن المتبقي' : 'Weight to Lose'}
                </span>
                <span className="text-base font-black text-amber-400 font-mono">
                  {calcResult.weightDifferenceKg > 0 ? `-${calcResult.weightDifferenceKg} kg` : '0 kg'}
                </span>
                <span className="text-[10px] text-slate-500 block">({calcResult.percentBodyWeightCut}%)</span>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  {language === 'ar' ? 'الوقت المتبقي' : 'Time Left'}
                </span>
                <span className="text-base font-black text-cyan-400 font-mono">
                  {calcResult.weeksRemaining} {language === 'ar' ? 'أسابيع' : 'Weeks'}
                </span>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  {language === 'ar' ? 'المعدل الأسبوعي' : 'Required Weekly'}
                </span>
                <span className={`text-base font-black font-mono ${
                  calcResult.requiredWeeklyRateKg > 0.75 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {calcResult.requiredWeeklyRateKg} kg/wk
                </span>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  {language === 'ar' ? 'مستوى الأمان' : 'Safety Score'}
                </span>
                <span className={`text-xs font-black uppercase inline-block px-2 py-0.5 rounded mt-1 ${
                  calcResult.riskLevel === 'safe'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : calcResult.riskLevel === 'moderate'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {calcResult.riskLevel.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Smart Recommendations Banner */}
            <div className={`p-4 rounded-xl border space-y-2 text-xs ${
              calcResult.riskLevel === 'safe'
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                : calcResult.riskLevel === 'moderate'
                ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
            }`}>
              <div className="flex items-center space-x-2 rtl:space-x-reverse font-bold text-sm">
                {calcResult.riskLevel === 'dangerous' ? (
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-400" />
                )}
                <span>
                  {language === 'ar'
                    ? 'التوصية الطبية والرياضية للتخفيض'
                    : 'Smart Medical & Athletic Recommendation'}
                </span>
              </div>

              <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
                {(language === 'ar' ? calcResult.recommendationsAr : language === 'fr' ? calcResult.recommendationsFr : calcResult.recommendationsEn).map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Squad Weigh-In Roster & Logger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Rapid Weigh-in Logger */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2 rtl:space-x-reverse">
            <Scale className="w-4 h-4 text-amber-500" />
            <span>{language === 'ar' ? 'تسجيل وزن المصارع' : 'Log Athlete Weigh-In'}</span>
          </h2>

          <form onSubmit={handleLogWeight} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'ar' ? 'المصارع المحدد' : 'Select Wrestler'} *
              </label>
              <select
                value={selectedAthleteId}
                onChange={e => handleSelectAthleteForCalc(e.target.value)}
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
                  <span className="text-slate-400">{language === 'ar' ? 'الفئة المستهدفة:' : 'Target Category:'}</span>
                  <strong className="text-amber-400">{currentAthlete.weightCategory}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{language === 'ar' ? 'الوزن المستهدف:' : 'Target Weight:'}</span>
                  <span className="font-mono text-slate-200 font-bold">{currentAthlete.targetWeightKg} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{language === 'ar' ? 'آخر وزن مسجل:' : 'Last Recorded:'}</span>
                  <span className="font-mono text-cyan-400 font-bold">{currentAthlete.currentWeightKg} kg</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'ar' ? 'الوزن المقاس (كجم)' : 'Measured Weight (kg)'} *
              </label>
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
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'ar' ? 'ملاحظات وحالة المصارع' : 'Condition / Notes'}
              </label>
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
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-1.5 rtl:space-x-reverse"
            >
              {savedSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? (language === 'ar' ? 'تم الحفظ بنجاح!' : 'Recorded Successfully!') : (language === 'ar' ? 'تسجيل الوزن' : 'Record Weigh-In')}</span>
            </button>
          </form>
        </div>

        {/* Right 2 Cols: Weight Progression Line Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">
                {language === 'ar' ? 'منحنى تتبع الوزن:' : 'Weight Cut Progression:'} {currentAthlete?.firstName} {currentAthlete?.lastName}
              </h2>
              <p className="text-[11px] text-slate-400">
                {language === 'ar' ? `استهداف سقف فئة ${currentAthlete?.weightCategory}` : `Targeting ${currentAthlete?.weightCategory} limit`}
              </p>
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
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {language === 'ar' ? 'سجل الأوزان الأخير' : 'Recent Log Entries'}
            </h3>
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
