
import React from 'react';

interface MatchmakingOverlayProps {
  regionName?: string;
  onCancel?: () => void;
  status?: string;
}

export const MatchmakingOverlay: React.FC<MatchmakingOverlayProps> = ({ 
  regionName = 'Global', 
  onCancel,
  status = 'matching'
}) => {
  const isConnecting = status === 'connecting';
  const isError = status === 'error';
  const isReconnecting = status === 'reconnecting' || status === 'signaling_offline';

  const getStatusText = () => {
    switch(status) {
      case 'generating_id': return 'Core Booting';
      case 'connecting': return 'Handshake Link';
      case 'error': return 'Permission Denied';
      case 'reconnecting':
      case 'signaling_offline': return 'Signal Disrupted';
      default: return 'Scanning Lobby';
    }
  };

  const getStatusDesc = () => {
    switch(status) {
      case 'generating_id': return 'Initializing secure identity and peer core...';
      case 'connecting': return 'Synchronizing media streams with your match...';
      case 'error': return 'Please enable Camera and Microphone access to continue.';
      case 'reconnecting':
      case 'signaling_offline': return 'Connection lost. Automatically re-routing through a healthy relay...';
      default: return `Hunting for a partner in the ${regionName} lobby.`;
    }
  };

  return (
    <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black/95 backdrop-blur-3xl px-6 transition-all duration-500 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] transition-all duration-1000 ${
          isError ? 'bg-red-500/10' : isConnecting ? 'bg-indigo-500/10' : isReconnecting ? 'bg-amber-500/10' : 'bg-red-500/10'
        }`}></div>
      </div>

      <div className="relative">
        <div className="relative w-40 h-40 md:w-56 md:h-56 flex items-center justify-center">
            <div className="absolute inset-0 border-[1px] border-zinc-800 rounded-full"></div>
            <div className={`absolute inset-0 border-t-2 rounded-full animate-spin ${
              isError ? 'border-red-600' : isConnecting ? 'border-indigo-400' : (isReconnecting ? 'border-amber-500' : 'border-red-500')
            }`} style={{ animationDuration: '0.8s' }}></div>
            
            <div className={`relative w-28 h-28 md:w-36 md:h-36 rounded-[48px] flex items-center justify-center shadow-2xl transition-all duration-700 ${
              isError ? 'bg-red-950/40 border border-red-500/30' :
              isConnecting ? 'bg-indigo-950/40 border border-indigo-400/30' : 
              (isReconnecting ? 'bg-amber-950/40 border border-amber-500/40' : 'bg-zinc-900 border border-white/5')
            }`}>
               {isError ? (
                 <svg className="w-10 h-10 md:w-16 md:h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
               ) : isReconnecting ? (
                 <svg className="w-10 h-10 md:w-16 md:h-16 text-amber-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/></svg>
               ) : (
                 <svg className={`w-10 h-10 md:w-16 md:h-16 transition-colors ${isConnecting ? 'text-indigo-400' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                 </svg>
               )}
            </div>
        </div>
      </div>
      
      <div className="mt-12 text-center space-y-4 max-w-sm">
        <h3 className="text-3xl md:text-4xl font-outfit font-bold tracking-tight text-white uppercase italic">
          {getStatusText()}
        </h3>
        <p className={`text-sm font-medium tracking-wide leading-relaxed px-4 ${
          isError ? 'text-red-400' : isConnecting ? 'text-indigo-400' : (isReconnecting ? 'text-amber-400/80' : 'text-zinc-500')
        }`}>
          {getStatusDesc()}
        </p>
      </div>

      <div className="mt-16 flex flex-col items-center gap-8">
          <div className="flex gap-3">
            <div className="px-5 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isError ? 'bg-red-600' : 'bg-red-500'} animate-pulse`}></span>
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">{regionName}</span>
            </div>
            <div className="px-5 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isReconnecting ? 'bg-amber-500 animate-ping' : 'bg-green-500'}`}></span>
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                  {isReconnecting ? 'Self-Healing' : 'P2P Link Active'}
                </span>
            </div>
          </div>

          {onCancel && (
            <button 
              onClick={onCancel}
              className="px-12 py-5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-2xl text-[12px] font-bold uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-all active:scale-95 shadow-xl"
            >
              {isError ? 'Go Back' : 'Cancel Match'}
            </button>
          )}
      </div>
    </div>
  );
};
