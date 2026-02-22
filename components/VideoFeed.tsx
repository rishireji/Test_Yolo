
import React, { useEffect, useRef } from 'react';

interface VideoFeedProps {
  stream: MediaStream | null;
  isRemote: boolean;
  label: string;
  isMuted?: boolean;
}

export const VideoFeed: React.FC<VideoFeedProps> = ({ stream, isRemote, label, isMuted = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (stream) {
      video.srcObject = stream;
      // Manually handle the play promise to catch interruptions (AbortError)
      // which happen frequently when skipping rooms or switching feeds.
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          if (error.name !== 'AbortError') {
            console.warn(`[VideoFeed] Playback failed for ${label}:`, error);
          }
        });
      }
    } else {
      video.srcObject = null;
    }

    return () => {
      video.srcObject = null;
    };
  }, [stream, label]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-black">
      <video
        ref={videoRef}
        playsInline
        muted={isMuted}
        className={`w-full h-full object-cover transition-all duration-1000 transform ${stream ? 'opacity-100 scale-100 grayscale-0' : 'opacity-0 scale-110 grayscale blur-sm'}`}
      />
      
      {!stream && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 backdrop-blur-md scanline-effect">
           <div className="flex flex-col items-center relative z-10">
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-zinc-800"></div>
                <div className="absolute inset-0 rounded-full border-4 border-red-500 border-t-transparent animate-spin"></div>
              </div>
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-[0.2em] animate-pulse">Establishing Peer Link...</p>
           </div>
        </div>
      )}

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/10 m-4 pointer-events-none z-20"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/10 m-4 pointer-events-none z-20"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/10 m-4 pointer-events-none z-20"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/10 m-4 pointer-events-none z-20"></div>

      <div className="absolute top-4 left-4 z-30">
        <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-[10px] font-bold tracking-widest uppercase text-zinc-300 shadow-2xl">
          {label}
        </span>
      </div>
    </div>
  );
};
