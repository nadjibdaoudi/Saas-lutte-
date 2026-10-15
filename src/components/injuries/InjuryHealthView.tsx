import React, { useState } from 'react';
import { HeartPulse, Plus, AlertTriangle, CheckCircle2, Calendar, Shield, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const InjuryHealthView: React.FC = () => {
  const { user } = useAuth();
  const { injuries, athletes, recordInjury, updateInjuryStatus } = useData();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedAthleteId, setSelectedAthleteId] = useState(athletes[0]?.id || '');
  const [injuryName, setInjuryName] = useState('Acromioclavicular (AC) Joint Sprain');
  const [bodyArea, setBodyArea] = useState('Shoulder / Neck');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('moderate');
  const [restrictions, setRestrictions] = useState('No live throwing sparring. Conditioning & footwork only.');
  const [returnDate, setReturnDate] = useState('2026-03-01');
  const [medicalNotes, setMedicalNotes] = useState('Physical therapy protocol 3x/week focusing on rotator cuff stabilization.');

  const handleAddInjury = (e: React.FormEvent) => {
    e.preventDefault();
    const athlete = athletes.find(a => a.id === selectedAthleteId);
    if (!athlete) return;

    recordInjury({
      athleteId: athlete.id,
      athleteName: `${athlete.firstName} ${athlete.lastName}`,
      injuryName,
      bodyArea,
      severity,
      occurredDate: new Date().toISOString().split('T')[0],
      returnToMatDate: returnDate,
      restrictions,
      medicalStaffNotes: medicalNotes,
      status: 'active'
    });

    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <HeartPulse className="w-5 h-5 text-rose-500" />
            <span>Wrestling Injuries & Return-to-Mat Protocols</span>
          </h1>
          <p className="text-xs text-slate-400">
            Medical clearance management, contact restrictions, and orthopedic status tracking
          </p>
        </div>

        {user?.role !== 'athlete' && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs rounded-xl transition shadow-md shadow-rose-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Log Injury / Medical Case</span>
          </button>
        )}
      </div>

      {/* Injuries List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {injuries.map(inj => (
          <div
            key={inj.id}
            className={`p-5 rounded-2xl border transition shadow-sm space-y-4 ${
              inj.status === 'active' 
                ? 'bg-rose-950/20 border-rose-800/60' 
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    inj.severity === 'severe' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-950'
                  }`}>
                    {inj.severity}
                  </span>
                  <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold">
                    {inj.bodyArea}
                  </span>
                </div>
                <h3 className="font-bold text-white text-sm">{inj.injuryName}</h3>
                <p className="text-xs text-slate-300 font-medium">Wrestler: <strong className="text-amber-400">{inj.athleteName}</strong></p>
              </div>

              <div className="text-right">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  inj.status === 'active' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {(inj.status || 'active').toUpperCase()}
                </span>
              </div>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <p><strong className="text-rose-400">Current Restrictions:</strong> <span className="text-slate-300">{inj.restrictions}</span></p>
              <p><strong className="text-slate-400">Target Mat Return:</strong> <span className="text-amber-400 font-mono font-bold">{inj.returnToMatDate || 'TBD'}</span></p>
              <p><strong className="text-slate-400">Medical Notes:</strong> <span className="text-slate-300">{inj.medicalStaffNotes}</span></p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400 font-mono text-[10px]">Occurred: {inj.occurredDate}</span>
              {inj.status === 'active' && user?.role !== 'athlete' && (
                <button
                  onClick={() => updateInjuryStatus(inj.id, 'cleared')}
                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition"
                >
                  Grant Mat Clearance
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Injury Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">Log Injury & Mat Restrictions</h3>
            
            <form onSubmit={handleAddInjury} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Athlete *</label>
                <select
                  value={selectedAthleteId}
                  onChange={e => setSelectedAthleteId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                >
                  {athletes.map(a => (
                    <option key={a.id} value={a.id}>{a.firstName} {a.lastName} ({a.weightCategory})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Injury Diagnosis *</label>
                <input
                  type="text"
                  required
                  value={injuryName}
                  onChange={e => setInjuryName(e.target.value)}
                  placeholder="e.g. Rib cartilage contusion"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Anatomical Area</label>
                  <select
                    value={bodyArea}
                    onChange={e => setBodyArea(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Shoulder / Neck">Shoulder / Neck</option>
                    <option value="Ribs / Intercostal">Ribs / Intercostal</option>
                    <option value="Knee / Meniscus">Knee / Meniscus</option>
                    <option value="Elbow / Wrist">Elbow / Wrist</option>
                    <option value="Lumbar Spine">Lumbar Spine</option>
                    <option value="Ankle / Foot">Ankle / Foot</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="mild">Mild (Modified drills)</option>
                    <option value="moderate">Moderate (No live wrestling)</option>
                    <option value="severe">Severe (Complete off mat)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mandatory Restrictions</label>
                <input
                  type="text"
                  value={restrictions}
                  onChange={e => setRestrictions(e.target.value)}
                  placeholder="e.g. No throwing, no par terre bottom"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Mat Return Date</label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={e => setReturnDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl"
                >
                  Record Medical Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
