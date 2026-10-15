import React, { useState } from 'react';
import { Shield, Key, Mail, Lock, User, Check, ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface AuthViewProps {
  onSuccess?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const { login, signup, switchRole, t } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('coach@wrestlelab.io');
  const [password, setPassword] = useState('password123');
  const [firstName, setFirstName] = useState('Ghilas');
  const [lastName, setLastName] = useState('Benamara');
  const [role, setRole] = useState<UserRole>('coach');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await signup(email, password, firstName, lastName, role);
      } else {
        await login(email, password);
      }
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoRole = (demoRole: UserRole) => {
    switchRole(demoRole);
    if (onSuccess) onSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-slate-100">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-8 space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-black text-slate-950 text-2xl mx-auto shadow-lg shadow-amber-500/20">
            WL
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">WrestleLab OS</h1>
          <p className="text-xs text-slate-400">Greco-Roman Wrestling High-Performance Platform</p>
        </div>

        {/* Demo Fast Logins */}
        <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block text-center">
            ⚡ 1-Click Instant Role Preview
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickDemoRole('coach')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold border border-slate-700 transition"
            >
              Head Coach
            </button>
            <button
              onClick={() => handleQuickDemoRole('club_admin')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold border border-slate-700 transition"
            >
              Club Director
            </button>
            <button
              onClick={() => handleQuickDemoRole('athlete')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold border border-slate-700 transition"
            >
              Athlete View
            </button>
            <button
              onClick={() => handleQuickDemoRole('super_admin')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold border border-slate-700 transition"
            >
              Super Admin
            </button>
          </div>
        </div>

        {/* Sign In / Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isSignUp && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 rtl:left-auto rtl:right-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 rtl:pl-3 rtl:pr-8 py-2 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 rtl:left-auto rtl:right-3" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 rtl:pl-3 rtl:pr-8 py-2 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 rounded-lg text-rose-300 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-amber-500/20 transition flex items-center justify-center space-x-1.5"
          >
            <span>{isSignUp ? 'Create WrestleLab Account' : 'Sign In with Supabase'}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-amber-400 hover:text-amber-300 font-semibold"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};
