import { useState, useEffect, useRef, useCallback } from 'react';
import { Peer, DataConnection, MediaConnection } from 'peerjs';
import { Region, ReactionType } from '../types';
import { useSession } from '../context/SessionContext';

type WebRTCStatus = 'idle' | 'generating_id' | 'matching' | 'connecting' | 'connected' | 'disconnected' | 'error' | 'signaling_offline' | 'reconnecting';

/**
 * PIESOCKET DEMO CONFIGURATION
 * Using the provided public demo credentials.
 */
const SIGNALING_API_KEY = 'VCX6vjaGNoz9grHtfD2vshCwIr9p8f7p9M80jWq6';
const PIESOCKET_CLUSTER = 'demo.piesocket.com';

// Unique versioned channel names to avoid interference in shared demo space
const REGION_CHANNEL_MAP: Record<Region, string> = {
  'global': 'yolo_v25_global',
  'us-east': 'yolo_v25_na_east',
  'us-west': 'yolo_v25_na_west',
  'europe': 'yolo_v25_eu',
  'asia': 'yolo_v25_asia',
  'south-america': 'yolo_v25_sa',
  'africa': 'yolo_v25_africa',
  'oceania': 'yolo_v25_oc'
};

const ICE_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ],
};

export const useWebRTC = (
  region: Region, 
  onReactionReceived?: (type: ReactionType) => void,
  onMessageReceived?: (text: string) => void
) => {
  const { session } = useSession();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<WebRTCStatus>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const peerRef = useRef<Peer | null>(null);
  const callRef = useRef<MediaConnection | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const statusRef = useRef<WebRTCStatus>('idle');
  const heartbeatRef = useRef<number | null>(null);
  const isClosingRef = useRef(false);

  useEffect(() => { statusRef.current = status; }, [status]);

  const cleanup = useCallback(() => {
    if (callRef.current) {
      callRef.current.close();
      callRef.current = null;
    }
    if (connRef.current) {
      connRef.current.close();
      connRef.current = null;
    }
    setRemoteStream(null);
  }, []);

  /**
   * SIGNALING BROADCASTER
   * type: 'client-announce' (New peer joined) | 'client-ack' (I see you, I'm matching too)
   */
  const emitSignal = useCallback((type: string) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN && peerRef.current?.id) {
      const payload = JSON.stringify({
        type,
        id: peerRef.current.id,
        status: statusRef.current,
        timestamp: Date.now()
      });
      ws.send(payload);
    }
  }, []);

  const skip = useCallback(() => {
    cleanup();
    console.info("[YOLO] Finding next available peer...");
    if (statusRef.current !== 'error' && statusRef.current !== 'idle') {
      setStatus('matching');
    }
    // Proactively announce we are back in the lobby
    setTimeout(() => emitSignal('client-announce'), 100);
  }, [cleanup, emitSignal]);

  const setupCallHandlers = useCallback((call: MediaConnection) => {
    call.on('stream', (remote) => {
      console.info("[YOLO] P2P Media established.");
      setRemoteStream(remote);
      setStatus('connected');
    });
    call.on('close', skip);
    call.on('error', skip);
    callRef.current = call;
  }, [skip]);

  const setupDataHandlers = useCallback((conn: DataConnection) => {
    conn.on('data', (data: any) => {
      if (data.type === 'chat') onMessageReceived?.(data.text);
      if (data.type === 'reaction') onReactionReceived?.(data.value);
    });
    conn.on('close', skip);
    conn.on('error', skip);
    connRef.current = conn;
  }, [skip, onMessageReceived, onReactionReceived]);

  /**
   * INITIATE HANDSHAKE
   * Triggered by signal discovery.
   */
  const initiateCall = useCallback((remoteId: string, stream: MediaStream) => {
    if (statusRef.current !== 'matching') return;
    
    console.info(`[YOLO] Role: Caller. Signaling Target: ${remoteId}`);
    setStatus('connecting');

    const call = peerRef.current?.call(remoteId, stream);
    const conn = peerRef.current?.connect(remoteId, { reliable: true });

    if (call) setupCallHandlers(call);
    if (conn) setupDataHandlers(conn);

    // Watchdog to prevent hanging in connecting state
    setTimeout(() => {
      if (statusRef.current === 'connecting') {
        console.warn("[YOLO] Handshake timeout. Retrying...");
        skip();
      }
    }, 15000);
  }, [setupCallHandlers, setupDataHandlers, skip]);

  const connectSignaling = useCallback((myId: string, stream: MediaStream) => {
    if (isClosingRef.current) return;

    const channel = REGION_CHANNEL_MAP[region] || REGION_CHANNEL_MAP.global;
    const endpoint = `wss://${PIESOCKET_CLUSTER}/v3/${channel}?api_key=${SIGNALING_API_KEY}`;
    
    console.log(`[YOLO] Connecting to ${region} Lobby via PieSocket...`);
    const ws = new WebSocket(endpoint);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.info("[YOLO] Signaling Channel Connected.");
      if (statusRef.current === 'signaling_offline') setStatus('matching');
      
      // IMMEDIATE ANNOUNCEMENT
      emitSignal('client-announce');
      
      // Heartbeat to prevent socket closure and assist discovery
      if (heartbeatRef.current) window.clearInterval(heartbeatRef.current);
      heartbeatRef.current = window.setInterval(() => emitSignal('client-announce'), 5000);
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.id === myId) return; // ignore reflection

        // DISCOVERY LOGIC
        if ((msg.type === 'client-announce' || msg.type === 'client-ack') && msg.status === 'matching') {
          if (statusRef.current === 'matching') {
            
            // If someone just announced themselves, we acknowledge so they see us too
            if (msg.type === 'client-announce') {
              emitSignal('client-ack');
            }

            /**
             * POLITE PEER ARBITRATION
             * Lexicographical comparison of IDs ensures only ONE side initiates.
             */
            if (myId < msg.id) {
              initiateCall(msg.id, stream);
            } else {
              console.log("[YOLO] Waiting for offer from:", msg.id);
            }
          }
        }
      } catch (err) {}
    };

    ws.onclose = () => {
      if (isClosingRef.current) return;
      console.warn("[YOLO] Signaling Disconnected. Failover in 5s...");
      setStatus('signaling_offline');
      setTimeout(() => connectSignaling(myId, stream), 5000);
    };

    ws.onerror = () => ws.close();
  }, [region, emitSignal, initiateCall]);

  useEffect(() => {
    let mounted = true;
    const start = async () => {
      if (!session?.id) return;
      setStatus('generating_id');
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: { ideal: 1280 }, height: { ideal: 720 } }, 
          audio: true 
        });
        
        if (!mounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        setLocalStream(stream);

        const peer = new Peer(session.id, { 
          debug: 1, 
          config: ICE_CONFIG,
          secure: true
        });
        peerRef.current = peer;

        peer.on('open', (id) => {
          if (mounted) {
            console.info("[YOLO] PeerID Assigned:", id);
            setStatus('matching');
            connectSignaling(id, stream);
          }
        });

        peer.on('call', (call) => {
          console.log("[YOLO] Role: Callee. Answering incoming call...");
          if (statusRef.current === 'matching' || statusRef.current === 'connecting') {
            setStatus('connecting');
            call.answer(stream);
            setupCallHandlers(call);
          } else {
            call.close();
          }
        });

        peer.on('connection', (conn) => {
          console.info("[YOLO] Data Link Established.");
          setupDataHandlers(conn);
        });

        peer.on('error', (err) => {
          console.warn("[YOLO] PeerJS Warning:", err.type);
          if (['peer-unavailable', 'disconnected', 'network'].includes(err.type)) {
            skip();
          }
        });

      } catch (err) {
        if (mounted) {
          console.error("[YOLO] Permission Error:", err);
          setStatus('error');
        }
      }
    };

    start();

    return () => {
      mounted = false;
      isClosingRef.current = true;
      cleanup();
      if (peerRef.current) peerRef.current.destroy();
      if (wsRef.current) wsRef.current.close();
      if (heartbeatRef.current) window.clearInterval(heartbeatRef.current);
      if (localStream) localStream.getTracks().forEach(t => t.stop());
    };
  }, [session?.id, skip, connectSignaling, setupCallHandlers, setupDataHandlers, cleanup]);

  return {
    localStream, remoteStream, status, 
    sendMessage: (text: string) => {
      if (connRef.current?.open) connRef.current.send({ type: 'chat', text });
    },
    sendReaction: (value: ReactionType) => {
      if (connRef.current?.open) connRef.current.send({ type: 'reaction', value });
    },
    skip, isMuted, isVideoOff, 
    toggleMute: () => {
      if (localStream) {
        const track = localStream.getAudioTracks()[0];
        if (track) {
          track.enabled = isMuted;
          setIsMuted(!isMuted);
        }
      }
    },
    toggleVideo: () => {
      if (localStream) {
        const track = localStream.getVideoTracks()[0];
        if (track) {
          track.enabled = isVideoOff;
          setIsVideoOff(!isVideoOff);
        }
      }
    }
  };
};