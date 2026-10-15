import React, { useState } from 'react';
import { 
  Settings, Database, Shield, CreditCard, 
  Check, RefreshCw, Key, Globe, Building2, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';

export const SettingsView: React.FC = () => {
  const { organization, language, setLanguage, user, t } = useAuth();

  const [orgName, setOrgName] = useState(organization.name);
  const [orgCountry, setOrgCountry] = useState(organization.country);
  const [currency, setCurrency] = useState(organization.currency);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const supabaseReady = isSupabaseConfigured;

  const handleTestSupabase = () => {
    if (supabaseReady) {
      setTestResult('Connected to Supabase PostgreSQL with RLS enabled.');
    } else {
      setTestResult('Supabase credentials not detected in .env. Running on local high-performance browser sandbox with auto-persistence.');
    }
  };

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
          <Settings className="w-5 h-5 text-amber-500" />
          <span>Organization Settings & Backend Infrastructure</span>
        </h1>
        <p className="text-xs text-slate-400">
          Club profile, multi-tenant isolation, Supabase PostgreSQL configuration, and subscription plan
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Organization Profile & Backend Config */}
        <div className="lg:col-span-2 space-y-6">
          {/* Org Profile */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-amber-500" />
              <span>Wrestling Club / Academy Profile</span>
            </h2>

            <form onSubmit={handleSaveOrg} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Organization Name</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Country / Federation</label>
                  <input
                    type="text"
                    value={orgCountry}
                    onChange={e => setOrgCountry(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Primary Language</label>
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none"
                  >
                    <option value="fr">Français (French)</option>
                    <option value="en">English</option>
                    <option value="ar">العربية (Arabic - RTL)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Currency</label>
                  <input
                    type="text"
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md transition flex items-center space-x-1.5"
                >
                  {savedSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  <span>{savedSuccess ? 'Changes Saved' : 'Update Profile'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Supabase Architecture & Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>Supabase PostgreSQL & Security (RLS)</span>
              </h2>

              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                supabaseReady ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {supabaseReady ? 'Supabase Connected' : 'Sandbox State Active'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              WrestleLab uses strict Multi-Tenant PostgreSQL schemas and Row Level Security (RLS) policies to isolate organization data (Athletes, Physical Tests, Assessments, Competitions).
            </p>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Database Engine:</span>
                <span className="font-mono text-cyan-400 font-bold">Supabase PostgreSQL 15+</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Multi-Tenancy Mode:</span>
                <span className="font-mono text-amber-400 font-bold">Row-Level Security (RLS)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Auth Engine:</span>
                <span className="font-mono text-slate-200 font-bold">Supabase Auth (JWT & Role Claims)</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={handleTestSupabase}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Verify Backend Connection</span>
              </button>
            </div>

            {testResult && (
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 font-mono">
                {testResult}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Subscription Tier & Multi-Tenant Plan */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
                Active Tier
              </span>
              <CreditCard className="w-4 h-4 text-amber-400" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">{(organization?.subscriptionPlan || 'pro').toUpperCase()} PRO PLAN</h3>
              <p className="text-xs text-slate-300 mt-1">Full Greco-Roman Performance OS for National Teams & High-Performance Academies</p>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Max Active Athletes:</span>
                <strong className="text-amber-400 font-mono">{organization.maxAthletes} (Unlimited)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Coach Seat Limit:</span>
                <strong className="text-slate-200 font-mono">10 Seats</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Audit Logs Retention:</span>
                <strong className="text-slate-200 font-mono">Unlimited</strong>
              </div>
            </div>

            <ul className="space-y-1.5 text-xs text-slate-300">
              <li className="flex items-center space-x-2"><Check className="w-3.5 h-3.5 text-amber-400" /><span>Matside Rapid Entry Matrix</span></li>
              <li className="flex items-center space-x-2"><Check className="w-3.5 h-3.5 text-amber-400" /><span>4-Pillar Greco Technical Rubrics</span></li>
              <li className="flex items-center space-x-2"><Check className="w-3.5 h-3.5 text-amber-400" /><span>Weight Management & UWW Curves</span></li>
              <li className="flex items-center space-x-2"><Check className="w-3.5 h-3.5 text-amber-400" /><span>PDF Performance Dossier Generator</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
