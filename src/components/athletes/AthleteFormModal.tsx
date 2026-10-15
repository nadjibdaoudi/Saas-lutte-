import React, { useState, useEffect } from 'react';
import { X, User, Save, Scale, Dumbbell } from 'lucide-react';
import { Athlete, AgeCategory, DominantSide } from '../../types';
import { useData } from '../../context/DataContext';

interface AthleteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  athleteToEdit?: Athlete | null;
}

export const AthleteFormModal: React.FC<AthleteFormModalProps> = ({
  isOpen,
  onClose,
  athleteToEdit
}) => {
  const { teams, addAthlete, updateAthlete } = useData();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('2000-01-01');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [nationality, setNationality] = useState('FRA');
  const [photoUrl, setPhotoUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [heightCm, setHeightCm] = useState(175);
  const [currentWeightKg, setCurrentWeightKg] = useState(72.0);
  const [targetWeightKg, setTargetWeightKg] = useState(72.0);
  const [weightCategory, setWeightCategory] = useState('72 kg');
  const [ageCategory, setAgeCategory] = useState<AgeCategory>('senior');
  const [teamId, setTeamId] = useState('');
  const [dominantSide, setDominantSide] = useState<DominantSide>('right');
  const [gripPreference, setGripPreference] = useState('Underhook & Body Lock');
  const [experienceLevel, setExperienceLevel] = useState('Senior National Elite');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [notes, setNotes] = useState('');

  const weightCategories = ['55 kg', '60 kg', '63 kg', '67 kg', '72 kg', '77 kg', '82 kg', '87 kg', '97 kg', '130 kg'];

  useEffect(() => {
    if (athleteToEdit) {
      setFirstName(athleteToEdit.firstName);
      setLastName(athleteToEdit.lastName);
      setDateOfBirth(athleteToEdit.dateOfBirth);
      setGender(athleteToEdit.gender);
      setNationality(athleteToEdit.nationality);
      setPhotoUrl(athleteToEdit.photoUrl || '');
      setPhone(athleteToEdit.phone || '');
      setEmail(athleteToEdit.email || '');
      setEmergencyContactName(athleteToEdit.emergencyContactName || '');
      setEmergencyContactPhone(athleteToEdit.emergencyContactPhone || '');
      setHeightCm(athleteToEdit.heightCm);
      setCurrentWeightKg(athleteToEdit.currentWeightKg);
      setTargetWeightKg(athleteToEdit.targetWeightKg);
      setWeightCategory(athleteToEdit.weightCategory);
      setAgeCategory(athleteToEdit.ageCategory);
      setTeamId(athleteToEdit.teamId || '');
      setDominantSide(athleteToEdit.dominantSide);
      setGripPreference(athleteToEdit.gripPreference);
      setExperienceLevel(athleteToEdit.experienceLevel);
      setLicenseNumber(athleteToEdit.licenseNumber || '');
      setNotes(athleteToEdit.notes || '');
    } else {
      setFirstName('');
      setLastName('');
      setDateOfBirth('2001-05-15');
      setGender('male');
      setNationality('FRA');
      setPhotoUrl('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200');
      setPhone('');
      setEmail('');
      setEmergencyContactName('');
      setEmergencyContactPhone('');
      setHeightCm(178);
      setCurrentWeightKg(72.5);
      setTargetWeightKg(72.0);
      setWeightCategory('72 kg');
      setAgeCategory('senior');
      setTeamId(teams[0]?.id || '');
      setDominantSide('right');
      setGripPreference('Underhook & Body Lock');
      setExperienceLevel('National Elite');
      setLicenseNumber(`FFL-${Math.floor(1000 + Math.random() * 9000)}`);
      setNotes('');
    }
  }, [athleteToEdit, isOpen, teams]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const team = teams.find(t => t.id === teamId);

    const athleteData = {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      nationality,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      phone,
      email,
      emergencyContactName,
      emergencyContactPhone,
      heightCm: Number(heightCm),
      currentWeightKg: Number(currentWeightKg),
      targetWeightKg: Number(targetWeightKg),
      weightCategory,
      ageCategory,
      teamId,
      teamName: team?.name || 'Greco Squad',
      wrestlingStyle: 'greco_roman' as const,
      dominantSide,
      gripPreference,
      experienceLevel,
      licenseNumber,
      joinDate: athleteToEdit?.joinDate || new Date().toISOString().split('T')[0],
      status: athleteToEdit?.status || 'active',
      notes
    };

    if (athleteToEdit) {
      updateAthlete(athleteToEdit.id, athleteData);
    } else {
      addAthlete(athleteData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {athleteToEdit ? 'Edit Greco-Roman Athlete' : 'Add New Greco-Roman Wrestler'}
              </h3>
              <p className="text-[11px] text-slate-400">Roster registration, physical specifications & UWW categories</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Row 1: Names & Country */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">First Name *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="e.g. Ibrahim"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="e.g. Ghanem"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nationality (IOC Code)</label>
              <input
                type="text"
                value={nationality}
                onChange={e => setNationality((e.target.value || '').toUpperCase())}
                placeholder="e.g. FRA"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2: DOB, Gender, Squad Team */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Date of Birth *</label>
              <input
                type="date"
                required
                value={dateOfBirth}
                onChange={e => setDateOfBirth(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Age Category</label>
              <select
                value={ageCategory}
                onChange={e => setAgeCategory(e.target.value as AgeCategory)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none capitalize"
              >
                <option value="u15">U15 Minime</option>
                <option value="u17_cadet">U17 Cadet</option>
                <option value="u20_junior">U20 Junior</option>
                <option value="u23">U23 Espoir</option>
                <option value="senior">Senior National</option>
                <option value="veterans">Masters / Veterans</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Squad / Team</label>
              <select
                value={teamId}
                onChange={e => setTeamId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              >
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Official Greco Weight Class & Current / Target Wt */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div>
              <label className="block text-amber-400 font-semibold mb-1">Weight Category *</label>
              <select
                value={weightCategory}
                onChange={e => setWeightCategory(e.target.value)}
                className="w-full bg-slate-800 border border-amber-500/40 rounded-lg px-3 py-2 text-amber-400 font-bold focus:outline-none"
              >
                {weightCategories.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Current Weight (kg) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={currentWeightKg}
                onChange={e => setCurrentWeightKg(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={targetWeightKg}
                onChange={e => setTargetWeightKg(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Height (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={e => setHeightCm(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* Row 4: Wrestling Specifics (Dominant Stance, Grip Preference, License) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Dominant Stance / Side</label>
              <select
                value={dominantSide}
                onChange={e => setDominantSide(e.target.value as DominantSide)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none capitalize"
              >
                <option value="right">Right Lead</option>
                <option value="left">Left Lead</option>
                <option value="ambidextrous">Ambidextrous</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Preferred Grip Style</label>
              <input
                type="text"
                value={gripPreference}
                onChange={e => setGripPreference(e.target.value)}
                placeholder="e.g. Underhook & Body Lock"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">License / Passport #</label>
              <input
                type="text"
                value={licenseNumber}
                onChange={e => setLicenseNumber(e.target.value)}
                placeholder="FFL-2026-XXXX"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* Row 5: Emergency Contact & Photo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Emergency Contact Name</label>
              <input
                type="text"
                value={emergencyContactName}
                onChange={e => setEmergencyContactName(e.target.value)}
                placeholder="Name & Relationship"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Emergency Phone</label>
              <input
                type="text"
                value={emergencyContactPhone}
                onChange={e => setEmergencyContactPhone(e.target.value)}
                placeholder="+33 6..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Photo URL</label>
              <input
                type="text"
                value={photoUrl}
                onChange={e => setPhotoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Row 6: Coach Notes */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Coach Notes & Tactical Profile</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Key technical notes, throw preferences, and physical priorities..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow-md flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{athleteToEdit ? 'Save Updates' : 'Register Wrestler'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
