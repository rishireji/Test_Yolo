
export type Region = 'global' | 'us-east' | 'us-west' | 'europe' | 'asia' | 'south-america' | 'africa' | 'oceania';

export type ReactionType = 'like' | 'laugh' | 'hug' | 'heart' | 'wow';

export interface UserSession {
  id: string;
  token: string;
  region: Region;
  isModerated: boolean;
  expiresAt: number;
  preferredLanguage: string;
}

export interface SignalingMessage {
  type: 'presence' | 'match_request' | 'match_accept' | 'offer' | 'answer' | 'candidate' | 'disconnect';
  senderId: string;
  targetId?: string;
  region?: Region;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  translatedText?: string;
  detectedLanguage?: string;
  isOriginalShown?: boolean;
  isTranslating?: boolean;
}

export enum AppState {
  IDLE = 'IDLE',
  MATCHMAKING = 'MATCHMAKING',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED'
}

export const REGION_LABELS: Record<Region, string> = {
  'global': 'Global Match',
  'us-east': 'North America (East)',
  'us-west': 'North America (West)',
  'europe': 'Europe',
  'asia': 'Asia Pacific',
  'south-america': 'South America',
  'africa': 'Africa',
  'oceania': 'Oceania'
};

export const REACTION_EMOJIS: Record<ReactionType, string> = {
  like: '👍',
  laugh: '😂',
  hug: '🫂',
  heart: '❤️',
  wow: '😮'
};

// Added missing REPORT_REASONS constant to fix compilation error in ReportModal.tsx
export const REPORT_REASONS = [
  { id: 'nudity', label: 'Nudity or Sexual Content' },
  { id: 'violence', label: 'Violence or Gore' },
  { id: 'harassment', label: 'Harassment or Bullying' },
  { id: 'hate', label: 'Hate Speech' },
  { id: 'spam', label: 'Spam or Scam' },
  { id: 'other', label: 'Other' }
];
