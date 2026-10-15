import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, Organization } from '../types';
import { initialOrganization } from '../data/seedData';
import { LanguageCode, translations, Translations } from '../lib/i18n';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  organization: Organization;
  isAuthenticated: boolean;
  isLoading: boolean;
  language: LanguageCode;
  t: Translations;
  setLanguage: (lang: LanguageCode) => void;
  switchRole: (role: UserRole) => void;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (email: string, pass: string, nameOrFirst: string, roleOrLast?: any, maybeRole?: any) => Promise<boolean>;
  loginWithOAuth: (provider: 'google' | 'apple' | 'azure') => Promise<void>;
  logout: () => void;
  updateOrganization: (org: Partial<Organization>) => void;
}

const defaultUser: UserProfile = {
  id: 'usr-coach-01',
  email: 'headcoach@wrestlelab.io',
  firstName: 'Olympic',
  lastName: 'Coach',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  preferredLanguage: 'en',
  role: 'coach',
  organizationId: initialOrganization.id,
  organizationName: initialOrganization.name,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('wrestlelab_user');
    return saved ? JSON.parse(saved) : defaultUser;
  });
  
  const [organization, setOrganization] = useState<Organization>(() => {
    const saved = localStorage.getItem('wrestlelab_org');
    return saved ? JSON.parse(saved) : initialOrganization;
  });

  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('wrestlelab_lang') as LanguageCode;
    return (saved === 'ar' || saved === 'en') ? saved : 'en';
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Set RTL for Arabic or LTR for English
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('wrestlelab_lang', language);
  }, [language]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('wrestlelab_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('wrestlelab_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('wrestlelab_org', JSON.stringify(organization));
  }, [organization]);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    if (user) {
      setUser({ ...user, preferredLanguage: lang });
    }
  };

  const switchRole = (role: UserRole) => {
    if (!user) return;
    let firstName = user.firstName;
    let lastName = user.lastName;
    let email = user.email;

    if (role === 'athlete') {
      firstName = 'Senior';
      lastName = 'Wrestler (Athlete View)';
      email = 'wrestler@wrestlelab.io';
    } else if (role === 'club_admin') {
      firstName = 'Club';
      lastName = 'Director';
      email = 'direction@wrestlelab.io';
    } else if (role === 'super_admin') {
      firstName = 'System';
      lastName = 'Admin';
      email = 'admin@wrestlelab.io';
    } else {
      firstName = 'Olympic';
      lastName = 'Coach';
      email = 'headcoach@wrestlelab.io';
    }

    setUser({
      ...user,
      firstName,
      lastName,
      email,
      role
    });
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email || email,
            firstName: data.user.user_metadata?.first_name || 'Coach',
            lastName: data.user.user_metadata?.last_name || 'User',
            role: (data.user.user_metadata?.role as UserRole) || 'coach',
            preferredLanguage: language,
            organizationId: organization.id,
            organizationName: organization.name
          });
          setIsLoading(false);
          return true;
        }
      }
      
      setUser({
        ...defaultUser,
        email: email || defaultUser.email,
      });
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setUser(defaultUser);
      setIsLoading(false);
      return true;
    }
  };

  const signup = async (email: string, pass: string, nameOrFirst: string, roleOrLast?: any, maybeRole?: any): Promise<boolean> => {
    setIsLoading(true);
    try {
      let firstName = 'Coach';
      let lastName = 'User';
      let role: UserRole = 'coach';

      if (maybeRole) {
        firstName = nameOrFirst || 'Coach';
        lastName = roleOrLast || 'User';
        role = maybeRole as UserRole;
      } else if (typeof roleOrLast === 'string' && ['super_admin', 'club_admin', 'coach', 'athlete'].includes(roleOrLast)) {
        const parts = (nameOrFirst || '').trim().split(/\s+/);
        firstName = parts[0] || 'Coach';
        lastName = parts.slice(1).join(' ') || 'User';
        role = roleOrLast as UserRole;
      } else {
        firstName = nameOrFirst || 'Coach';
        lastName = (typeof roleOrLast === 'string' ? roleOrLast : '') || 'User';
      }

      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: {
            data: { first_name: firstName, last_name: lastName, role }
          }
        });
        if (error) throw error;
        if (data.user) {
          setUser({
            id: data.user.id,
            email,
            firstName,
            lastName,
            role,
            preferredLanguage: language,
            organizationId: organization.id,
            organizationName: organization.name
          });
        }
      } else {
        setUser({
          id: `usr-${Date.now()}`,
          email,
          firstName,
          lastName,
          role,
          preferredLanguage: language,
          organizationId: organization.id,
          organizationName: organization.name
        });
      }
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Signup error:', err);
      setIsLoading(false);
      return false;
    }
  };

  const loginWithOAuth = async (provider: 'google' | 'apple' | 'azure') => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: window.location.origin
        }
      });
    } else {
      setUser({
        ...defaultUser,
        firstName: `${(provider || 'oauth').toUpperCase()} Coach`,
        email: `coach.${provider || 'oauth'}@wrestlelab.io`
      });
    }
  };

  const logout = () => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut();
    }
    setUser(null);
  };

  const updateOrganization = (orgUpdates: Partial<Organization>) => {
    setOrganization(prev => ({ ...prev, ...orgUpdates }));
  };

  const t = translations[language] || translations.en;

  return (
    <AuthContext.Provider value={{
      user,
      organization,
      isAuthenticated: Boolean(user),
      isLoading,
      language,
      t,
      setLanguage,
      switchRole,
      login,
      signup,
      loginWithOAuth,
      logout,
      updateOrganization
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
