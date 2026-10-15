import React, { useState } from 'react';
import { CalendarCheck, Check, X, Clock, AlertCircle, Users, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const AttendanceView: React.FC = () => {
  const { user } = useAuth();
  const { athletes, teams, recordAttendance } = useData();

  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionType, setSessionType] = useState('Mat Practice (Greco Throws & Par Terre)');
  const [attendanceState, setAttendanceState] = useState<{ [athleteId: string]: 'present' | 'absent' | 'excused' | 'late' }>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  const squadAthletes = athletes.filter(a => !selectedTeamId || a.teamId === selectedTeamId);

  const handleStatusChange = (athleteId: string, status: 'present' | 'absent' | 'excused' | 'late') => {
    setAttendanceState(prev => ({
      ...prev,
      [athleteId]: status
    }));
  };

  const handleMarkAllPresent = () => {
    const next: { [athleteId: string]: 'present' } = {};
    squadAthletes.forEach(a => {
      next[a.id] = 'present';
    });
    setAttendanceState(next);
  };

  const handleSaveAttendance = () => {
    squadAthletes.forEach(a => {
      const status = attendanceState[a.id] || 'present';
      recordAttendance({
        athleteId: a.id,
        athleteName: `${a.firstName} ${a.lastName}`,
        teamId: a.teamId || selectedTeamId,
        date: selectedDate,
        status,
        sessionName: sessionType
      });
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <CalendarCheck className="w-5 h-5 text-amber-500" />
            <span>Mat Attendance & Compliance</span>
          </h1>
          <p className="text-xs text-slate-400">
            Daily practice check-in, excused absence tracking, and athlete commitment analytics
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleMarkAllPresent}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            Mark All Present
          </button>

          <button
            onClick={handleSaveAttendance}
            className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md shadow-amber-500/20"
          >
            {savedSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'Attendance Logged!' : 'Save Attendance'}</span>
          </button>
        </div>
      </div>

      {/* Configuration Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="flex flex-wrap items-center gap-3 text-xs flex-1">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Squad / Team</label>
            <select
              value={selectedTeamId}
              onChange={e => setSelectedTeamId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 focus:outline-none"
            >
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Practice Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 font-mono focus:outline-none"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Practice Focus</label>
            <input
              type="text"
              value={sessionType}
              onChange={e => setSessionType(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Athletes Checklist */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Squad Mat Roll Call ({squadAthletes.length} Athletes)</h3>
          <span className="text-xs text-slate-400">Click status pill to toggle presence</span>
        </div>

        <div className="divide-y divide-slate-800">
          {squadAthletes.map(athlete => {
            const currentStatus = attendanceState[athlete.id] || 'present';

            return (
              <div
                key={athlete.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition"
              >
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <img
                    src={athlete.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={athlete.firstName}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-white text-xs">{athlete.firstName} {athlete.lastName}</h4>
                    <p className="text-[10px] text-slate-400">
                      {athlete.weightCategory} • Avg Attendance: <strong className="text-emerald-400">{athlete.attendanceRate || 98}%</strong>
                    </p>
                  </div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center space-x-1.5 text-xs">
                  <button
                    onClick={() => handleStatusChange(athlete.id, 'present')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1 ${
                      currentStatus === 'present' 
                        ? 'bg-emerald-500 text-slate-950 shadow-sm' 
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Present</span>
                  </button>

                  <button
                    onClick={() => handleStatusChange(athlete.id, 'late')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1 ${
                      currentStatus === 'late' 
                        ? 'bg-amber-500 text-slate-950 shadow-sm' 
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Late</span>
                  </button>

                  <button
                    onClick={() => handleStatusChange(athlete.id, 'excused')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1 ${
                      currentStatus === 'excused' 
                        ? 'bg-cyan-500 text-slate-950 shadow-sm' 
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Excused</span>
                  </button>

                  <button
                    onClick={() => handleStatusChange(athlete.id, 'absent')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1 ${
                      currentStatus === 'absent' 
                        ? 'bg-rose-500 text-white shadow-sm' 
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Absent</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
