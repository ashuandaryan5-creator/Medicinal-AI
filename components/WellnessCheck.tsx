import React, { useState } from 'react';
import { Smile, Frown, Meh, Sun, Moon, Send } from 'lucide-react';
import { analyzeWellness } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const WellnessCheck: React.FC = () => {
  const [mood, setMood] = useState<string>('');
  const [journal, setJournal] = useState('');
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReflect = async () => {
    if (!mood || !journal.trim()) return;
    setLoading(true);
    try {
      const text = await analyzeWellness(mood, journal);
      setAdvice(text);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const moods = [
    { icon: Sun, label: "Great", color: "text-yellow-400" },
    { icon: Smile, label: "Good", color: "text-green-400" },
    { icon: Meh, label: "Okay", color: "text-blue-400" },
    { icon: Frown, label: "Down", color: "text-indigo-400" },
    { icon: Moon, label: "Dark", color: "text-purple-400" },
  ];

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
          <Sun className="text-purple-400" />
          Wellness Core
        </h2>
        <p className="text-gray-400">Track your mood and receive AI guidance.</p>
      </div>

      {!advice ? (
        <div className="glass-panel p-8 rounded-3xl space-y-8">
          <div className="flex justify-between px-4">
            {moods.map((m) => (
              <button
                key={m.label}
                onClick={() => setMood(m.label)}
                className={`flex flex-col items-center gap-2 transition-all ${mood === m.label ? 'scale-125 opacity-100' : 'opacity-50 hover:opacity-80'}`}
              >
                <div className={`p-3 rounded-full bg-white/5 ${m.color}`}>
                  <m.icon size={28} />
                </div>
                <span className="text-xs">{m.label}</span>
              </button>
            ))}
          </div>

          <textarea
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            placeholder="How are you feeling today? Write your thoughts..."
            className="w-full h-32 bg-black/30 border border-white/10 rounded-xl p-4 text-white resize-none focus:border-purple-500/50 focus:outline-none"
          />

          <button
            onClick={handleReflect}
            disabled={!mood || !journal.trim() || loading}
            className="w-full shiny-btn bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-bold disabled:opacity-50"
          >
            {loading ? 'Reflecting...' : 'Reflect & Get Guidance'}
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="glass-panel p-8 rounded-3xl border-t-4 border-t-purple-500 bg-gradient-to-b from-purple-900/20 to-transparent">
             <div className="prose prose-invert max-w-none prose-p:text-purple-100 prose-headings:text-purple-300">
               <ReactMarkdown>{advice}</ReactMarkdown>
             </div>
          </div>
          <button 
            onClick={() => { setAdvice(null); setJournal(''); setMood(''); }}
            className="block mx-auto text-gray-400 hover:text-white underline"
          >
            New Entry
          </button>
        </div>
      )}
    </div>
  );
};

export default WellnessCheck;