import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Region, REGION_LABELS } from '../types';
import { useSession } from '../context/SessionContext';

interface SidebarProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onToggleTranslation: (messageId: string) => void;
  isConnected: boolean;
  region: Region;
}

export const Sidebar: React.FC<SidebarProps> = ({ messages, onSendMessage, onToggleTranslation, isConnected, region }) => {
  const { session } = useSession();
  const [inputText, setInputText] = useState('');
  const [isStrangerTyping, setIsStrangerTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isStrangerTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && isConnected) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div className="flex flex-col w-full lg:w-[400px] bg-zinc-950/50 lg:border-l border-t lg:border-t-0 border-zinc-800/50 h-[50vh] lg:h-full backdrop-blur-3xl shadow-2xl relative z-30 transition-all duration-700">
      <div className="p-4 lg:p-6 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-950/80 sticky top-0 z-10">
        <div>
          <h2 className="font-outfit font-bold text-lg lg:text-xl text-white tracking-tight hover:text-red-500 transition-colors cursor-default text-shadow-glow">YOLO Chat</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-zinc-700'}`}></div>
            <span className="text-[9px] lg:text-[10px] text-zinc-500 uppercase font-bold tracking-[0.2em]">
              {isConnected ? 'P2P Link Secured' : 'Searching for peers...'}
            </span>
          </div>
        </div>
        <div className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg group hover:border-red-500/50 transition-all cursor-default flex items-center gap-2">
          <svg className="w-3 h-3 text-zinc-500 group-hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5h12M9 3v2m1 14h7M11 21l5-10 5 10"/>
          </svg>
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider group-hover:text-red-400">{session?.preferredLanguage}</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 lg:space-y-6 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 lg:px-10 animate-in fade-in duration-1000">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-zinc-900 rounded-[20px] lg:rounded-3xl flex items-center justify-center mb-4 lg:mb-6 border border-zinc-800 rotate-12 shadow-xl hover:rotate-0 transition-transform duration-500 shadow-red-900/5">
               <svg className="w-6 h-6 lg:w-8 lg:h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
               </svg>
            </div>
            <p className="text-zinc-300 text-xs lg:text-sm font-bold uppercase tracking-tight animate-pulse">Finding Peers...</p>
            <p className="text-zinc-500 text-[10px] lg:text-xs mt-2 italic leading-relaxed opacity-60">Connections are ephemeral. Witness the moment.</p>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div key={msg.id} className={`flex flex-col ${msg.senderId === 'me' ? 'items-end' : (msg.senderId === 'system' ? 'items-center' : 'items-start')} animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both`} style={{ animationDelay: `${idx * 50}ms` }}>
                {msg.senderId === 'system' ? (
                  <div className="bg-zinc-900/50 border border-zinc-800/50 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-center shadow-inner">
                    {msg.text}
                  </div>
                ) : (
                  <>
                    <div className={`relative max-w-[85%] px-4 py-2.5 lg:px-5 lg:py-3 rounded-[20px] lg:rounded-[24px] text-sm leading-relaxed shadow-lg transition-all group/msg ${
                      msg.senderId === 'me' 
                        ? 'bg-red-600 text-white rounded-tr-none shadow-red-600/10' 
                        : 'bg-zinc-800/80 text-zinc-100 rounded-tl-none border border-white/5'
                    }`}>
                      {msg.isTranslating ? (
                        <div className="flex items-center gap-2 py-1">
                          <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0s]"></div>
                          <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                          <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                          <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">AI Translating...</span>
                        </div>
                      ) : (
                        <>
                          {msg.isOriginalShown ? msg.text : (msg.translatedText || msg.text)}
                          
                          {msg.senderId === 'stranger' && msg.translatedText && (
                            <button 
                              onClick={() => onToggleTranslation(msg.id)}
                              className="absolute -right-10 top-0 p-2 bg-zinc-900/80 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-all opacity-0 group-hover/msg:opacity-100 shadow-xl border border-white/5"
                              title={msg.isOriginalShown ? "Show Translation" : "Show Original"}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                              </svg>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                    <div className={`flex items-center gap-2 mt-1.5 ${msg.senderId === 'me' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="text-[8px] lg:text-[9px] text-zinc-600 font-bold uppercase tracking-widest opacity-80">
                        {msg.senderId === 'me' ? 'You' : 'Stranger'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.senderId === 'stranger' && msg.detectedLanguage && (
                        <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[7px] font-bold text-zinc-500 uppercase tracking-widest">
                          {msg.detectedLanguage}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
            {isStrangerTyping && (
              <div className="flex flex-col items-start animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-zinc-800/40 px-5 py-3 rounded-[24px] rounded-tl-none border border-white/5 flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0s]"></div>
                  <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 lg:p-6 bg-zinc-950 border-t border-zinc-800/50 pb-8 lg:pb-6 relative z-10">
        <div className="relative group">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isConnected ? "Speak your mind..." : "Searching..."}
            disabled={!isConnected}
            className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-600 focus:border-red-500/50 rounded-2xl py-3.5 lg:py-4 pl-5 pr-14 text-sm transition-all outline-none disabled:opacity-40 disabled:cursor-not-allowed placeholder:text-zinc-600 text-white shadow-inner"
          />
          <button
            type="submit"
            disabled={!isConnected || !inputText.trim()}
            className={`absolute right-2.5 top-2.5 p-2 bg-red-600 text-white rounded-xl hover:bg-red-500 transition-all shadow-lg active:scale-90 ${
              (!isConnected || !inputText.trim()) ? 'opacity-30 cursor-not-allowed scale-95' : 'opacity-100 scale-100 hover:shadow-red-600/30'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};