
import React, { useState, useEffect } from 'react';
import { useSession } from '../context/SessionContext';
import { Region, REGION_LABELS } from '../types';

interface LandingPageProps {
  onStart: () => void;
}

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-zinc-800/50 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left hover:text-red-400 transition-colors group"
      >
        <span className="text-lg md:text-xl font-bold text-zinc-200 group-hover:text-inherit">{question}</span>
        <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-6' : 'max-h-0'}`}>
        <p className="text-zinc-400 leading-relaxed max-w-3xl">
          {answer}
        </p>
      </div>
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const { createSession, session, isLoading } = useSession();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region>('global');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStart = () => {
    if (acceptedTerms) {
      createSession(selectedRegion);
      onStart();
    }
  };

  const faqs = [
    {
      question: "Is this video chat truly anonymous and safe?",
      answer: "Yes. YOLO (You Only Live Once) is built on a security-first architecture. We use ephemeral session IDs and peer-to-peer WebRTC connections. No registration is required, meaning there is no link between your real identity and your chat session."
    },
    {
      question: "How does the AI moderation affect my privacy?",
      answer: "To keep the platform safe, our AI Safety Shield periodically checks video frames for vulgarity. These frames are sent anonymously without any user data, processed in real-time, and are not stored permanently or used for training. This is a critical safety measure to prevent abuse while protecting your identity."
    },
    {
      question: "Are my video or audio conversations stored?",
      answer: "Never. All media streams are end-to-end encrypted directly between you and your match. Our servers only facilitate the initial 'handshake'. We do not record, store, or have the technical capability to view your conversations."
    },
    {
      question: "Can other users track or identify me?",
      answer: "We implement robust IP masking and secure signaling to prevent IP leakage. Without a persistent profile or public metadata, other users have no way to track or identify you outside of what you voluntarily share on camera."
    },
    {
      question: "How do you protect users from vulgar or inappropriate content?",
      answer: "YOLO uses a high-performance AI Safety Shield. Our automated vision engine periodically analyzes local frames in real-time to detect nudity, vulgar acts, or violence. Violators are instantly banned from the platform."
    },
    {
      question: "Do I need to create an account to start chatting?",
      answer: "No account creation, email verification, or phone linking is required. We believe in instant access. Just agree to our terms of service, pick a region, and you are ready to match."
    }
  ];

  const scrollToFaq = () => {
    const faqSection = document.getElementById('faq-section');
    faqSection?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="relative w-full bg-black">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4 text-center overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-red-600 rounded-full blur-[140px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-orange-600 rounded-full blur-[140px] animate-pulse"></div>
        </div>

        <div className={`relative z-10 max-w-4xl w-full py-20 transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold tracking-widest uppercase animate-pulse">
            You Only Live Once
          </div>
          <h1 className="text-8xl md:text-[12rem] font-outfit font-bold mb-8 tracking-tighter bg-[linear-gradient(110deg,#fff,45%,#a1a1aa,55%,#fff)] bg-[length:200%_100%] animate-[shimmer_3s_infinite_linear] bg-clip-text text-transparent leading-none select-none glitch-text cursor-default">
            YOLO
          </h1>
          <p className="text-xl md:text-3xl text-zinc-400 mb-12 max-w-3xl mx-auto leading-tight font-medium tracking-tight">
            Unfiltered human connection at the speed of light. Witness the world, then vanish.
          </p>

          <div className={`max-w-md mx-auto bg-zinc-900/40 backdrop-blur-2xl border border-zinc-800/50 p-8 rounded-[32px] shadow-2xl space-y-6 transition-all duration-1000 delay-300 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Preferred Region</label>
              <div className="relative group">
                <select 
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value as Region)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-red-500 outline-none transition-all appearance-none cursor-pointer pr-10 hover:border-zinc-500"
                >
                  {Object.entries(REGION_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 group-hover:text-red-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 text-left group cursor-pointer" onClick={() => setAcceptedTerms(!acceptedTerms)}>
              <input 
                id="terms" 
                type="checkbox" 
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-red-600 focus:ring-red-500 transition-all cursor-pointer" 
              />
              <label htmlFor="terms" className="text-sm text-zinc-400 select-none cursor-pointer leading-tight group-hover:text-zinc-200 transition-colors">
                I agree to the <span className="text-red-400 underline font-bold">Community Guidelines</span> and understand that YOLO uses anonymous AI checks for safety.
              </label>
            </div>

            <button
              onClick={handleStart}
              disabled={!acceptedTerms}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all transform ${
                acceptedTerms
                  ? 'bg-red-600 text-white hover:bg-red-500 hover:scale-[1.02] shadow-[0_0_25px_rgba(220,38,38,0.4)] active:scale-95' 
                  : 'bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'
              }`}
            >
              {session ? 'Resume Session' : 'Start Matching'}
            </button>
            
            <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
              <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              Age Verified Session
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div 
          onClick={scrollToFaq}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 cursor-pointer flex flex-col items-center gap-2 animate-bounce opacity-40 hover:opacity-100 transition-opacity"
        >
          <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-zinc-400">Learn More</span>
          <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
        </div>
      </section>

      {/* Feature Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-32 grid md:grid-cols-3 gap-8">
        {[
          { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', title: 'Full Anonymity', desc: 'No registration, no emails, no phone numbers. Your identity is hidden. Once you disconnect, all session data is wiped.', color: 'red' },
          { icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: 'Hyper-Fast Engine', desc: 'Proprietary matchmaking logic connects you with peers across global zones in under 2 seconds.', color: 'orange' },
          { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: 'Safe & Private', desc: 'End-to-end encrypted video and text. Instant reporting and AI-powered vision moderation keep the community healthy.', color: 'zinc' }
        ].map((feat, idx) => (
          <div key={idx} className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-3xl hover:border-red-500/30 transition-all hover:-translate-y-2 group">
            <div className={`w-12 h-12 bg-${feat.color}-500/10 rounded-2xl flex items-center justify-center mb-6 text-${feat.color}-400 group-hover:scale-110 transition-transform`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feat.icon}/></svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">{feat.title}</h3>
            <p className="text-zinc-400 leading-relaxed text-sm">
              {feat.desc}
            </p>
          </div>
        ))}
      </section>

      {/* FAQ Section */}
      <section id="faq-section" className="relative z-10 max-w-4xl mx-auto px-6 pb-32 pt-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-outfit font-bold text-white mb-4">Frequently Asked Questions</h2>
          <div className="w-20 h-1 bg-red-600 mx-auto rounded-full"></div>
        </div>

        <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-[40px] p-8 md:p-12 backdrop-blur-sm shadow-inner">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>

        <div className="mt-20 text-center">
          <p className="text-zinc-500 text-sm">
            Still have questions? Contact our safety team at <span className="text-zinc-300 font-medium hover:text-red-400 transition-colors cursor-pointer">safety@yolo.chat</span>
          </p>
          <div className="mt-12 flex items-center justify-center gap-8 opacity-30 grayscale">
            <span className="text-xs font-bold tracking-[0.3em] uppercase">E2E Encrypted</span>
            <span className="text-xs font-bold tracking-[0.3em] uppercase">No Logs</span>
            <span className="text-xs font-bold tracking-[0.3em] uppercase">18+ Only</span>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="py-12 border-t border-zinc-900 text-center">
        <p className="text-zinc-700 text-xs font-bold uppercase tracking-[0.5em] animate-pulse">YOLO &copy; 2025 • Privacy First Matchmaking</p>
      </footer>
    </div>
  );
};
