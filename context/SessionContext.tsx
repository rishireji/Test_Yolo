
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession, Region } from '../types';

interface SessionContextType {
  session: UserSession | null;
  createSession: (region: Region) => void;
  updateSession: (updates: Partial<UserSession>) => void;
  clearSession: () => void;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const SESSION_KEY = 'YOLO_SESSION_V2';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 Hours

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize: Check for existing persistent session
  useEffect(() => {
    const savedSession = localStorage.getItem(SESSION_KEY);
    if (savedSession) {
      try {
        const parsed: UserSession = JSON.parse(savedSession);
        // Validate expiry
        if (Date.now() < parsed.expiresAt) {
          setSession(parsed);
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      } catch (e) {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const createSession = (region: Region) => {
    const expiresAt = Date.now() + SESSION_DURATION;
    const newSession: UserSession = {
      id: crypto.randomUUID?.() || Math.random().toString(36).substring(2) + Date.now().toString(36),
      token: `jwt_anon_${Math.random().toString(36).substring(2)}`,
      region,
      isModerated: false,
      expiresAt,
      preferredLanguage: 'English'
    };
    
    setSession(newSession);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
  };

  const updateSession = (updates: Partial<UserSession>) => {
    setSession(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearSession = () => {
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <SessionContext.Provider value={{ session, createSession, updateSession, clearSession, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within SessionProvider');
  return context;
};
