
import { useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { useSession } from '../context/SessionContext';

const MODERATION_INTERVAL = 12000; // slightly longer to prevent rate limiting

export const useModeration = (stream: MediaStream | null) => {
  const { updateSession } = useSession();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stream) return;

    const video = document.createElement('video');
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        if (error.name !== 'AbortError') console.debug("[YOLO] Compliance video aborted");
      });
    }

    videoRef.current = video;
    const canvas = document.createElement('canvas');
    canvasRef.current = canvas;

    const checkCompliance = async () => {
      if (!videoRef.current || !canvasRef.current || videoRef.current.paused || videoRef.current.ended) return;

      const cvs = canvasRef.current;
      const v = videoRef.current;
      
      cvs.width = 320; 
      cvs.height = 180;
      const ctx = cvs.getContext('2d');
      if (!ctx) return;

      try {
        ctx.drawImage(v, 0, 0, cvs.width, cvs.height);
        const base64Data = cvs.toDataURL('image/jpeg', 0.5).split(',')[1];
        const apiKey = process.env.API_KEY || '';
        
        if (!apiKey) return;

        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: 'image/jpeg'
                }
              },
              {
                text: "Determine if this frame contains graphic nudity, sex acts, or violence. Respond in JSON."
              }
            ]
          },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                is_safe: { type: Type.BOOLEAN },
                reason: { type: Type.STRING }
              },
              required: ["is_safe", "reason"]
            }
          }
        });

        const textOutput = response.text || '{"is_safe": true}';
        const result = JSON.parse(textOutput);
        if (result.is_safe === false) {
          updateSession({ isModerated: true });
        }
      } catch (err) {
        // Silent fail for compliance checks to maintain UX
      }
    };

    intervalRef.current = window.setInterval(checkCompliance, MODERATION_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
    };
  }, [stream, updateSession]);
};
