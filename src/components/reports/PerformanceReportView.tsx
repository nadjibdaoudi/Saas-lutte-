import React, { useState } from 'react';
import { FileSpreadsheet, Printer, Download, Award, Activity, CheckCircle2, User } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

interface PerformanceReportViewProps {
  initialAthleteId?: string;
}

export const PerformanceReportView: React.FC<PerformanceReportViewProps> = ({ initialAthleteId }) => {
  const { organization } = useAuth();
  const { athletes, testResults, wrestlingAssessments, weightRecords } = useData();

  const [selectedAthleteId, setSelectedAthleteId] = useState(initialAthleteId || athletes[0]?.id || '');
  const currentAthlete = athletes.find(a => a.id === selectedAthleteId) || athletes[0];

  const athleteResults = testResults.filter(r => r.athleteId === currentAthlete?.id);
  const athleteAssessments = wrestlingAssessments.filter(a => a.athleteId === currentAthlete?.id);
  const latestAssessment = athleteAssessments[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header / Actions (Hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-500" />
            <span>Official Athlete Performance Dossier</span>
          </h1>
          <p className="text-xs text-slate-400">
            Generate and export official coaching dossiers, physical battery summaries, and technical ratings
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedAthleteId}
            onChange={e => setSelectedAthleteId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none"
          >
            {athletes.map(a => (
              <option key={a.id} value={a.id}>{a.firstName} {a.lastName} ({a.weightCategory})</option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF Export</span>
          </button>
        </div>
      </div>

      {/* Printable Report Dossier Card */}
      {currentAthlete && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl text-slate-100 space-y-6 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
          {/* Official Letterhead */}
          <div className="flex justify-between items-start border-b border-slate-800 pb-6 print:border-black">
            <div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                <span className="font-black text-lg text-amber-400 print:text-black tracking-tight">{organization.name}</span>
                <span className="text-xs bg-slate-800 print:bg-gray-200 text-slate-300 print:text-black px-2 py-0.5 rounded font-mono font-bold">
                  GRECO-ROMAN DOSSIER
                </span>
              </div>
              <p className="text-xs text-slate-400 print:text-gray-600">High-Performance Wrestling Management & Biometric System</p>
            </div>

            <div className="text-right text-xs">
              <p className="font-mono text-slate-300 print:text-black">Date: {new Date().toLocaleDateString()}</p>
              <p className="text-slate-400 print:text-gray-600">Report ID: WL-{currentAthlete?.id ? currentAthlete.id.substring(0, 8).toUpperCase() : '00000000'}</p>
            </div>
          </div>

          {/* Athlete Bio Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950/60 print:bg-gray-100 p-4 rounded-xl border border-slate-800 print:border-gray-300 text-xs">
            <div>
              <span className="text-slate-400 print:text-gray-500 text-[10px] block">Wrestler Name:</span>
              <strong className="text-white print:text-black text-sm">{currentAthlete.firstName} {currentAthlete.lastName}</strong>
            </div>
            <div>
              <span className="text-slate-400 print:text-gray-500 text-[10px] block">UWW Weight Category:</span>
              <strong className="text-amber-400 print:text-black text-sm">{currentAthlete.weightCategory}</strong>
            </div>
            <div>
              <span className="text-slate-400 print:text-gray-500 text-[10px] block">Current / Target Wt:</span>
              <strong className="text-white print:text-black font-mono">{currentAthlete.currentWeightKg} kg / {currentAthlete.targetWeightKg} kg</strong>
            </div>
            <div>
              <span className="text-slate-400 print:text-gray-500 text-[10px] block">Composite Score:</span>
              <strong className="text-emerald-400 print:text-black font-mono text-sm">{currentAthlete.performanceScore || 94}/100</strong>
            </div>
          </div>

          {/* Physical Battery Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-black">
              1. Physical Testing Batteries (Standardized Protocols)
            </h3>
            <table className="w-full text-left rtl:text-right text-xs border border-slate-800 print:border-gray-300">
              <thead className="bg-slate-950/80 print:bg-gray-200 text-slate-300 print:text-black font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2.5 border border-slate-800 print:border-gray-300">Test Protocol</th>
                  <th className="p-2.5 border border-slate-800 print:border-gray-300">Raw Value</th>
                  <th className="p-2.5 border border-slate-800 print:border-gray-300">Normalized Index</th>
                  <th className="p-2.5 border border-slate-800 print:border-gray-300">Trial Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                {athleteResults.map(res => (
                  <tr key={res.id}>
                    <td className="p-2.5 font-semibold text-white print:text-black border border-slate-800 print:border-gray-300">{res.testName}</td>
                    <td className="p-2.5 font-mono text-cyan-400 print:text-black border border-slate-800 print:border-gray-300">{res.rawValue} {res.unit}</td>
                    <td className="p-2.5 font-mono font-bold text-amber-400 print:text-black border border-slate-800 print:border-gray-300">{res.calculatedScore}/100</td>
                    <td className="p-2.5 text-slate-400 print:text-black border border-slate-800 print:border-gray-300">{res.recordedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Greco-Roman Technical Assessment Section */}
          {latestAssessment && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-black">
                2. Technical & Tactical Greco-Roman Evaluation (Score: {latestAssessment.overallWrestlingScore}/100)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-slate-950/40 print:bg-gray-50 p-4 rounded-xl border border-slate-800 print:border-gray-300">
                <div>
                  <span className="text-slate-400 print:text-gray-500 block text-[10px]">Throws & Souplesse:</span>
                  <strong className="text-white print:text-black">{latestAssessment.throwingTechnique}/10</strong>
                </div>
                <div>
                  <span className="text-slate-400 print:text-gray-500 block text-[10px]">Par Terre Offense (Gut Wrench):</span>
                  <strong className="text-white print:text-black">{latestAssessment.groundParTerreOffense}/10</strong>
                </div>
                <div>
                  <span className="text-slate-400 print:text-gray-500 block text-[10px]">Defense & Ground Base:</span>
                  <strong className="text-white print:text-black">{latestAssessment.groundParTerreDefense}/10</strong>
                </div>
                <div>
                  <span className="text-slate-400 print:text-gray-500 block text-[10px]">Passivity & Zone Tactics:</span>
                  <strong className="text-white print:text-black">{latestAssessment.passivityManagement}/10</strong>
                </div>
              </div>

              <div className="bg-slate-950/30 print:bg-gray-50 p-3 rounded-lg border border-slate-800 print:border-gray-300 text-xs space-y-1">
                <p><strong className="text-emerald-400 print:text-black">Technical Strengths:</strong> <span className="text-slate-300 print:text-gray-700">{latestAssessment.strengths}</span></p>
                <p><strong className="text-amber-400 print:text-black">Coach Strategic Directive:</strong> <span className="text-slate-300 print:text-gray-700">{latestAssessment.coachFeedback}</span></p>
              </div>
            </div>
          )}

          {/* Coach Signature Block */}
          <div className="pt-8 border-t border-slate-800 print:border-black flex justify-between items-end text-xs">
            <div>
              <p className="font-bold text-white print:text-black">Head Coach Signature</p>
              <div className="h-10 w-40 border-b border-slate-700 print:border-black mt-2"></div>
              <p className="text-[10px] text-slate-400 print:text-gray-600 mt-1">Ghilas Benamara, Greco-Roman Director</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 print:text-gray-600">Official Seal of WrestleLab OS</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
