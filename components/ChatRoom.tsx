
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, ChatMessage, REGION_LABELS, ReactionType, REACTION_EMOJIS } from '../types';
import { VideoFeed } from './VideoFeed';
import { Controls } from './Controls';
import { Sidebar } from './Sidebar';
import { MatchmakingOverlay } from './MatchmakingOverlay';
import { ReportModal } from './ReportModal';
import { useWebRTC } from '../hooks/useWebRTC';
import { useSession } from '../context/SessionContext';
import { useModeration } from '../hooks/useModeration';
import { useTranslation } from '../hooks/useTranslation';

interface ChatRoomProps {
  onExit: () => void;
}

interface FloatingReaction {
  id: string;
  type: ReactionType;
  x: number;
  rotation: number;
  isLocal: boolean;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ onExit }) => {
  const { session } = useSession();
  const { translateText } = useTranslation();
  const [appState, setAppState] = useState<AppState>(AppState.MATCHMAKING);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeReactions, setActiveReactions] = useState<FloatingReaction[]>([]);

  const handleReactionReceived = useCallback((type: ReactionType) => {
    const id = Math.random().toString(36).substring(7);
    const x = 10 + Math.random() * 80;
    const rotation = -30 + Math.random() * 60;
    setActiveReactions(prev => [...prev, { id, type, x, rotation, isLocal: false }]);
    
    setTimeout(() => {
      setActiveReactions(prev => prev.filter(r => r.id !== id));
    }, 2500);
  }, []);

  const handleMessageReceived = useCallback(async (text: string) => {
    const messageId = Math.random().toString(36).substring(7);
    const msg: ChatMessage = {
      id: messageId,
      senderId: 'stranger',
      text,
      timestamp: Date.now(),
      isTranslating: true
    };
    
    setMessages(prev => [...prev, msg]);

    const targetLang = session?.preferredLanguage || 'English';
    const translationResult = await translateText(text, targetLang);

    if (translationResult) {
      setMessages(prev => prev.map(m => m.id === messageId ? {
        ...m,
        translatedText: translationResult.translatedText,
        detectedLanguage: translationResult.detectedLanguage,
        isTranslating: false,
        isOriginalShown: translationResult.detectedLanguage.toLowerCase() === targetLang.toLowerCase()
      } : m));
    } else {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isTranslating: false } : m));
    }
  }, [session?.preferredLanguage, translateText]);

  const { 
    localStream, 
    remoteStream, 
    status, 
    sendMessage, 
    sendReaction,
    skip, 
    isMuted, 
    isVideoOff, 
    toggleMute, 
    toggleVideo 
  } = useWebRTC(session?.region || 'global', handleReactionReceived, handleMessageReceived);

  useModeration(localStream);

  useEffect(() => {
    switch (status) {
      case 'matching':
      case 'connecting':
      case 'generating_id':
      case 'signaling_offline':
        setAppState(AppState.MATCHMAKING);
        break;
      case 'connected':
        setAppState(AppState.CONNECTED);
        setMessages([{
          id: 'system-' + Date.now(),
          senderId: 'system',
          text: "You are now chatting with a random stranger. Say hi!",
          timestamp: Date.now()
        }]);
        break;
      case 'disconnected':
        setAppState(AppState.DISCONNECTED);
        break;
      case 'error':
        // Stay in matchmaking but the overlay handles the error display
        setAppState(AppState.MATCHMAKING);
        break;
    }
  }, [status]);

  const handleSendMessage = (text: string) => {
    const msg: ChatMessage = { id: Date.now().toString(), senderId: 'me', text, timestamp: Date.now() };
    setMessages(prev => [...prev, msg]);
    sendMessage(text);
  };

  const handleToggleTranslation = (messageId: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isOriginalShown: !m.isOriginalShown } : m));
  };

  const handleSendReaction = (type: ReactionType) => {
    if (appState !== AppState.CONNECTED) return;
    sendReaction(type);
    const id = Math.random().toString(36).substring(7);
    const x = 10 + Math.random() * 80;
    const rotation = -30 + Math.random() * 60;
    setActiveReactions(prev => [...prev, { id, type, x, rotation, isLocal: true }]);
    setTimeout(() => setActiveReactions(prev => prev.filter(r => r.id !== id)), 2500);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-black overflow-hidden relative">
      <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} onSubmit={() => skip()} />

      <div className="flex-1 flex flex-col relative h-[50vh] lg:h-full">
        <div className="flex-1 flex flex-col gap-3 p-3 h-full">
          <div className="flex-1 relative rounded-[32px] md:rounded-[40px] overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl">
            {appState === AppState.MATCHMAKING && (
              <MatchmakingOverlay 
                regionName={REGION_LABELS[session?.region || 'global']} 
                onCancel={onExit}
                status={status}
              />
            )}
            
            <VideoFeed stream={remoteStream} isRemote label="Stranger" />

            <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
              {activeReactions.filter(r => !r.isLocal).map(reaction => (
                <div key={reaction.id} className="absolute bottom-0 text-5xl md:text-8xl animate-[floatUpEnhanced_2.5s_ease-out_forwards]" style={{ left: `${reaction.x}%`, '--rotation': `${reaction.rotation}deg` } as any}>
                  {REACTION_EMOJIS[reaction.type]}
                </div>
              ))}
            </div>
            
            <div className="absolute bottom-4 left-4 w-32 md:w-64 aspect-video bg-zinc-950 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/10 z-30 group cursor-pointer">
              <VideoFeed stream={localStream} isRemote={false} label="You" isMuted={true} />
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                {activeReactions.filter(r => r.isLocal).map(reaction => (
                  <div key={reaction.id} className="absolute bottom-0 text-3xl md:text-5xl animate-[floatUpEnhanced_2.5s_ease-out_forwards]" style={{ left: `${reaction.x}%`, '--rotation': `${reaction.rotation}deg` } as any}>
                    {REACTION_EMOJIS[reaction.type]}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 pb-4 md:px-6 md:pb-6 bg-black">
          <Controls 
            appState={appState} 
            onNext={skip} 
            onExit={onExit}
            isMuted={isMuted}
            isVideoOff={isVideoOff}
            onToggleMute={toggleMute}
            onToggleVideo={toggleVideo}
            onReport={() => setIsReportModalOpen(true)}
            onSendReaction={handleSendReaction}
          />
        </div>
      </div>

      <Sidebar 
        messages={messages} 
        onSendMessage={handleSendMessage} 
        onToggleTranslation={handleToggleTranslation}
        isConnected={appState === AppState.CONNECTED}
        region={session?.region || 'global'}
      />
    </div>
  );
};
