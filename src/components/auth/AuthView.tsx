import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Shield, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface AuthViewProps {
  onSuccess?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const { login, signup, loginWithOAuth, switchRole, language, setLanguage, t } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('coach@wrestlelab.io');
  const [password, setPassword] = useState('password123');
  const [firstName, setFirstName] = useState('Olympic');
  const [lastName, setLastName] = useState('Coach');
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

  const handleGoogleOAuth = async () => {
    try {
      setLoading(true);
      await loginWithOAuth('google');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Google OAuth failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoRole = (demoRole: UserRole) => {
    switchRole(demoRole);
    if (onSuccess) onSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-slate-100" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Top Bar Language Selector */}
      <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 flex items-center space-x-2 rtl:space-x-reverse bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 rounded-lg font-bold transition ${language === 'en' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('ar')}
          className={`px-3 py-1 rounded-lg font-bold transition ${language === 'ar' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
        >
          العربية
        </button>
      </div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-black text-slate-950 text-2xl mx-auto shadow-lg shadow-amber-500/20">
            WL
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">WrestleLab OS</h1>
          <p className="text-xs text-slate-400">
            {language === 'ar' ? 'منظومة أداء وتدريب المصارعة الرومانية والحرة' : 'Greco-Roman & Freestyle Wrestling Platform'}
          </p>
        </div>

        {/* Google OAuth Button */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleOAuth}
            disabled={loading}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 rounded-xl font-bold text-xs text-white transition flex items-center justify-center space-x-2 rtl:space-x-reverse shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{language === 'ar' ? 'تسجيل الدخول باستخدام Google' : 'Sign in with Google'}</span>
          </button>

          <div className="flex items-center space-x-3 rtl:space-x-reverse text-[11px] text-slate-500">
            <div className="flex-1 h-px bg-slate-800" />
            <span>{language === 'ar' ? 'أو بالبريد الإلكتروني' : 'or with email'}</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>
        </div>

        {/* Demo Quick Logins */}
        <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block text-center">
            {language === 'ar' ? '⚡ تجربة سريعة بضغطة واحدة' : '⚡ 1-Click Instant Role Preview'}
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickDemoRole('coach')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold border border-slate-700 transition"
            >
              {language === 'ar' ? 'المدرب الرئيسي' : 'Head Coach'}
            </button>
            <button
              onClick={() => handleQuickDemoRole('club_admin')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold border border-slate-700 transition"
            >
              {language === 'ar' ? 'مدير النادي' : 'Club Director'}
            </button>
            <button
              onClick={() => handleQuickDemoRole('athlete')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold border border-slate-700 transition"
            >
              {language === 'ar' ? 'مصارع' : 'Wrestler View'}
            </button>
            <button
              onClick={() => handleQuickDemoRole('super_admin')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold border border-slate-700 transition"
            >
              {language === 'ar' ? 'مشرف عام' : 'Super Admin'}
            </button>
          </div>
        </div>

        {/* Sign In / Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {isSignUp && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'ar' ? 'الاسم الأول' : 'First Name'}
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'ar' ? 'اسم العائلة' : 'Last Name'}
                </label>
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
            <label className="block text-slate-300 font-semibold mb-1">
              {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
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
            <label className="block text-slate-300 font-semibold mb-1">
              {language === 'ar' ? 'كلمة المرور' : 'Password'}
            </label>
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
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-amber-500/20 transition flex items-center justify-center space-x-1.5 rtl:space-x-reverse"
          >
            <span>{isSignUp ? (language === 'ar' ? 'إنشاء حساب جديد' : 'Create Account') : (language === 'ar' ? 'تسجيل الدخول' : 'Sign In')}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-amber-400 hover:text-amber-300 font-semibold"
          >
            {isSignUp
              ? (language === 'ar' ? 'لديك حساب بالفعل؟ تسجيل الدخول' : 'Already have an account? Sign In')
              : (language === 'ar' ? 'ليس لديك حساب؟ إنشاء حساب' : "Don't have an account? Sign Up")}
          </button>
        </div>
      </div>
    </div>
  );
};
