
import React, { useState } from 'react';
import { REPORT_REASONS } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reasonId: string) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [selectedReason, setSelectedReason] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-bold mb-2">Report User</h2>
        <p className="text-zinc-500 text-sm mb-6">Your safety is our priority. YOLO takes all reports seriously. This will end the connection.</p>
        
        <div className="space-y-3 mb-8">
          {REPORT_REASONS.map((reason) => (
            <button
              key={reason.id}
              onClick={() => setSelectedReason(reason.id)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                selectedReason === reason.id 
                  ? 'bg-red-500/10 border-red-500/50 text-red-500 shadow-[inset_0_0_10px_rgba(239,68,68,0.05)]' 
                  : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <span className="font-medium">{reason.label}</span>
              {selectedReason === reason.id && (
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold transition-colors text-zinc-400"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(selectedReason)}
            disabled={!selectedReason}
            className="flex-[2] py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white transition-all transform active:scale-95 shadow-lg shadow-red-600/20"
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
};
