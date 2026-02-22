
import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { ChatRoom } from './components/ChatRoom';
import { AgeGate } from './components/AgeGate';
import { SessionProvider, useSession } from './context/SessionContext';

const AppContent: React.FC = () => {
  const { session } = useSession();
  const [isStarted, setIsStarted] = useState(false);
  const [isAgeVerified, setIsAgeVerified] = useState<boolean | null>(null);

  // Check persistent storage for age verification
  useEffect(() => {
    const verified = localStorage.getItem('YOLO_AGE_VERIFIED');
    if (verified === 'true') {
      setIsAgeVerified(true);
    }
  }, []);

  const handleAgeVerify = (isOfAge: boolean) => {
    if (isOfAge) {
      setIsAgeVerified(true);
      localStorage.setItem('YOLO_AGE_VERIFIED', 'true');
    } else {
      setIsAgeVerified(false);
    }
  };

  if (session?.isModerated) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-red-600/10 border border-red-600/30 rounded-full flex items-center justify-center mb-8">
          <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <h1 className="text-4xl font-outfit font-bold text-white mb-4">Account Suspended</h1>
        <p className="text-zinc-400 max-w-md leading-relaxed">
          Your access to YOLO has been permanently revoked due to violations of our community safety guidelines. 
          Automated monitoring detected inappropriate or vulgar behavior in your video stream.
        </p>
        <div className="mt-8 text-[10px] text-zinc-600 uppercase font-bold tracking-[0.3em]">
          SESSION_ID: {session.id} • AI_COMPLIANCE_ENFORCED
        </div>
      </div>
    );
  }

  if (isAgeVerified === false) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <h1 className="text-3xl font-outfit font-bold text-white mb-4">Access Denied</h1>
        <p className="text-zinc-500 max-w-sm">You must be 18 years or older to use YOLO. Access to this platform has been restricted.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      {!isAgeVerified && <AgeGate onVerify={handleAgeVerify} />}
      
      {isAgeVerified && (
        <>
          {!isStarted ? (
            <LandingPage onStart={() => setIsStarted(true)} />
          ) : (
            <ChatRoom onExit={() => setIsStarted(false)} />
          )}
        </>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
};

export default App;
