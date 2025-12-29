import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, AlertCircle, Mic, MicOff } from 'lucide-react';
import { chatWithMedicalAssistant } from '../services/geminiService';
import { GenerateContentResponse } from '@google/genai';
import { useSpeechToText } from '../hooks/useSpeechToText';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hello. I am your Medical AI assistant. I can explain medications, interactions, and safety guidelines. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { start, stop, isListening } = useSpeechToText({
    onTranscript: (text) => setInput(prev => prev + text)
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    // Stop listening if sending
    if (isListening) stop();

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Format history for API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const streamResult = await chatWithMedicalAssistant(history, userMsg.text);
      
      let fullResponse = "";
      setMessages(prev => [...prev, { role: 'model', text: "" }]); // Placeholder

      for await (const chunk of streamResult) {
        const c = chunk as GenerateContentResponse;
        const text = c.text;
        if (text) {
          fullResponse += text;
          setMessages(prev => {
            const newArr = [...prev];
            newArr[newArr.length - 1] = { role: 'model', text: fullResponse };
            return newArr;
          });
        }
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'model', text: "I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      stop();
    } else {
      start();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto space-y-4 p-4 no-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`
              max-w-[80%] rounded-2xl p-4 flex items-start space-x-3
              ${msg.role === 'user' ? 'bg-emerald-600 text-white' : 'glass-panel text-gray-200'}
            `}>
              <div className="mt-1 shrink-0">
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} className="text-emerald-400" />}
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="glass-panel rounded-2xl p-4 flex items-center space-x-2">
                <Bot size={16} className="text-emerald-400" />
                <span className="animate-pulse text-xs text-gray-400">Thinking...</span>
             </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="flex items-center space-x-2 max-w-4xl mx-auto bg-white/5 rounded-full px-4 py-2 border border-white/10 focus-within:border-emerald-500/50 transition-colors">
          <button 
            onClick={toggleVoice}
            className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-gray-400 hover:text-white'}`}
            title={isListening ? "Stop Listening" : "Start Voice Input"}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? "Listening..." : "Ask about symptoms, dosages, or interactions..."}
            className="flex-1 bg-transparent border-none focus:outline-none text-white placeholder-gray-500 py-2"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2 bg-emerald-500 rounded-full text-black hover:bg-emerald-400 transition-colors disabled:opacity-50 shiny-btn"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="text-center mt-2">
            <p className="text-[10px] text-gray-600 flex items-center justify-center gap-1">
              <AlertCircle size={10} /> AI can make mistakes. Check important info.
            </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;