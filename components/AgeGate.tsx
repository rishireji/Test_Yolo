
import React, { useState } from 'react';

interface AgeGateProps {
  onVerify: (isOfAge: boolean) => void;
}

export const AgeGate: React.FC<AgeGateProps> = ({ onVerify }) => {
  const [year, setYear] = useState('');
  const [error, setError] = useState('');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const currentYear = new Date().getFullYear();
    const birthYear = parseInt(year);

    if (!year || isNaN(birthYear) || birthYear < 1900 || birthYear > currentYear) {
      setError('Please enter a valid year of birth.');
      return;
    }

    if (currentYear - birthYear < 18) {
      setError('You must be 18 or older to access YOLO.');
      onVerify(false);
      return;
    }

    onVerify(true);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black p-4">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900 rounded-full blur-[160px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg bg-zinc-950 border border-zinc-800 p-8 md:p-12 rounded-[40px] shadow-2xl text-center">
        <div className="w-20 h-20 bg-red-600/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/20">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h1 className="text-3xl md:text-4xl font-outfit font-bold text-white mb-4 tracking-tight">Age Verification</h1>
        <p className="text-zinc-400 text-sm md:text-base mb-8 leading-relaxed">
          YOLO contains adult content and unfiltered interactions. 
          By entering, you certify that you are at least <span className="text-red-500 font-bold">18 years of age</span>.
        </p>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block text-left ml-1">What year were you born?</label>
            <input
              type="number"
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setError('');
              }}
              placeholder="e.g. 1995"
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500 text-white text-center text-2xl font-bold py-4 rounded-2xl outline-none transition-all placeholder:text-zinc-700"
              autoFocus
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-5 bg-white text-black hover:bg-zinc-200 font-bold rounded-2xl text-lg transition-all transform active:scale-95 shadow-xl"
          >
            Enter Platform
          </button>
        </form>

        <p className="mt-8 text-[10px] text-zinc-600 uppercase font-bold tracking-[0.2em] leading-loose">
          Privacy Notice: We do not store your date of birth. <br />
          We only store a temporary encrypted flag for this session.
        </p>
      </div>
    </div>
  );
};
