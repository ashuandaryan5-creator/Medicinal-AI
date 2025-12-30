export enum AppView {
  HOME = 'HOME',
  SCAN = 'SCAN',
  CHAT = 'CHAT',
  MAPS = 'MAPS',
  LIVE = 'LIVE',
  HISTORY = 'HISTORY',
  SYMPTOMS = 'SYMPTOMS',
  INTERACTIONS = 'INTERACTIONS',
  VITALS = 'VITALS',
  FIRST_AID = 'FIRST_AID',
  WELLNESS = 'WELLNESS',
  EDUCATION = 'EDUCATION'
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: number;
  isThinking?: boolean;
}

export interface MedicineDetails {
  name: string;
  genericName?: string;
  purpose: string;
  dosage: string;
  sideEffects: string[];
  warnings: string[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  imageData: string; // Base64
  analysisResult: string; // Markdown text
}

export interface ScanResult {
  image: string; // Base64
  details: MedicineDetails | null;
  rawAnalysis: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        content: string;
      }[]
    }
  }
}