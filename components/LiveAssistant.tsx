import React, { useState } from 'react';
import { Mic, MicOff, Radio, Volume2 } from 'lucide-react';
import { useLiveSession } from '../hooks/useLiveSession';

const LiveAssistant: React.FC = () => {
  const [transcripts, setTranscripts] = useState<{user: string, model: string}>({user: '', model: ''});
  
  const { connect, disconnect, isConnected, isSpeaking } = useLiveSession({
    onTranscript: (text, type) => {
      setTranscripts(prev => ({
        ...prev,
        [type]: text
      }));
    }
  });

  const toggleConnection = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto p-6 text-center space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">Live Consultation</h2>
        <p className="text-gray-400 text-sm">Real-time voice analysis with Gemini Live</p>
      </div>

      {/* Visualizer Circle */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Outer Glow Rings */}
        {isConnected && (
          <>
             <div className="absolute inset-0 border border-emerald-500/30 rounded-full animate-[ping_2s_linear_infinite]" />
             <div className="absolute inset-4 border border-emerald-500/40 rounded-full animate-[ping_2s_linear_infinite_0.5s]" />
          </>
        )}
        
        {/* Main Button Container */}
        <button
          onClick={toggleConnection}
          className={`
            shiny-btn w-32 h-32 rounded-full flex items-center justify-center z-10 transition-all duration-500
            ${isConnected 
              ? 'bg-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.5)] scale-110' 
              : 'bg-slate-800 hover:bg-slate-700 shadow-xl border border-white/10'}
          `}
        >
          {isConnected ? (
             isSpeaking ? <Volume2 size={40} className="text-black animate-pulse" /> : <Mic size={40} className="text-black" />
          ) : (
             <MicOff size={40} className="text-gray-400" />
          )}
        </button>
      </div>

      {/* Transcript Area */}
      <div className="w-full h-48 glass-panel rounded-2xl p-4 overflow-y-auto text-left relative">
         {!isConnected ? (
           <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">
             Tap the microphone to start talking
           </div>
         ) : (
           <div className="space-y-4">
             {transcripts.user && (
               <div className="text-right">
                 <p className="text-xs text-gray-500 mb-1">You</p>
                 <p className="text-emerald-100 text-sm">{transcripts.user}</p>
               </div>
             )}
             {transcripts.model && (
               <div className="text-left">
                 <p className="text-xs text-gray-500 mb-1">Medicinal AI</p>
                 <p className="text-white text-sm">{transcripts.model}</p>
               </div>
             )}
           </div>
         )}
      </div>
      
      <div className="flex items-center gap-2 text-xs text-emerald-500/50">
         <Radio size={12} className={isConnected ? "animate-pulse" : ""} />
         <span>{isConnected ? "SECURE CONNECTION ACTIVE" : "DISCONNECTED"}</span>
      </div>
    </div>
  );
};

export default LiveAssistant;