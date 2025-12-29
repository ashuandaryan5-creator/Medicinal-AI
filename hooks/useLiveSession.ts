import { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface UseLiveSessionProps {
  onTranscript: (text: string, type: 'user' | 'model') => void;
}

export const useLiveSession = ({ onTranscript }: UseLiveSessionProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  
  // Audio playback queue
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Encode PCM
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Create Blob for Input
  const createBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  // Decode Output
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const connect = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Setup Audio Contexts
      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      // Get Mic
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const config = {
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: "You are Medicinal AI's voice assistant. Helpful, calm, and professional.",
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
      };

      sessionPromiseRef.current = ai.live.connect({
        model: config.model,
        config: config.config,
        callbacks: {
          onopen: () => {
            console.log("Live Session Open");
            setIsConnected(true);
            
            // Start streaming input
            if (!inputContextRef.current || !streamRef.current) return;
            const source = inputContextRef.current.createMediaStreamSource(streamRef.current);
            const processor = inputContextRef.current.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const blob = createBlob(inputData);
              sessionPromiseRef.current?.then(session => {
                session.sendRealtimeInput({ media: blob });
              });
            };

            source.connect(processor);
            processor.connect(inputContextRef.current.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Transcription
            if (msg.serverContent?.inputTranscription?.text) {
               onTranscript(msg.serverContent.inputTranscription.text, 'user');
            }
            if (msg.serverContent?.outputTranscription?.text) {
               onTranscript(msg.serverContent.outputTranscription.text, 'model');
            }

            // Audio Output
            const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
               setIsSpeaking(true);
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
               
               const audioData = decode(base64Audio);
               const buffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);
               
               const source = audioContextRef.current.createBufferSource();
               source.buffer = buffer;
               source.connect(audioContextRef.current.destination);
               source.addEventListener('ended', () => {
                 sourcesRef.current.delete(source);
                 if (sourcesRef.current.size === 0) setIsSpeaking(false);
               });
               
               source.start(nextStartTimeRef.current);
               nextStartTimeRef.current += buffer.duration;
               sourcesRef.current.add(source);
            }

            // Interruptions
             if (msg.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => s.stop());
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
                setIsSpeaking(false);
             }
          },
          onclose: () => {
            console.log("Live Session Closed");
            setIsConnected(false);
          },
          onerror: (err) => {
            console.error("Live Session Error", err);
            setIsConnected(false);
          }
        }
      });

    } catch (e) {
      console.error("Connection failed", e);
      setIsConnected(false);
    }
  };

  const disconnect = () => {
    sessionPromiseRef.current?.then(session => session.close());
    
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
    }
    if (inputContextRef.current) inputContextRef.current.close();
    if (audioContextRef.current) audioContextRef.current.close();
    
    setIsConnected(false);
    setIsSpeaking(false);
  };

  return { connect, disconnect, isConnected, isSpeaking };
};
