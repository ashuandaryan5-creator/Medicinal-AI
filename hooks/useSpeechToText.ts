import { useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface UseSpeechToTextProps {
  onTranscript: (text: string) => void;
}

export const useSpeechToText = ({ onTranscript }: UseSpeechToTextProps) => {
  const [isListening, setIsListening] = useState(false);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

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

  const start = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {}, // Enable input transcription
          systemInstruction: "You are a transcriber. Listen to the user's input and transcribe it. Do not reply.",
        },
        callbacks: {
          onopen: () => {
            setIsListening(true);
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
          onmessage: (msg: LiveServerMessage) => {
            if (msg.serverContent?.inputTranscription?.text) {
               onTranscript(msg.serverContent.inputTranscription.text);
            }
          },
          onclose: () => setIsListening(false),
          onerror: (e) => {
            console.error("STT Error", e);
            setIsListening(false);
          }
        }
      });
    } catch (e) {
      console.error("Connection failed", e);
      setIsListening(false);
    }
  };

  const stop = () => {
     sessionPromiseRef.current?.then(session => session.close());
     
     if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
    }
    if (inputContextRef.current) {
        inputContextRef.current.close();
        inputContextRef.current = null;
    }
     setIsListening(false);
  };

  return { start, stop, isListening };
};