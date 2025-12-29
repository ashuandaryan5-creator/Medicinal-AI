import React, { useState } from 'react';
import { Activity, AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import { analyzeSymptoms } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const SymptomChecker: React.FC = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const text = await analyzeSymptoms(input);
      setResult(text || "Unable to analyze symptoms.");
    } catch (e) {
      console.error(e);
      setResult("Error analyzing symptoms.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
          <Activity className="text-red-500" />
          Symptom Triage AI
        </h2>
        <p className="text-gray-400">Describe your symptoms for an instant AI assessment.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., I have a severe headache, sensitivity to light, and nausea since this morning..."
          className="w-full h-32 bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:border-red-500/50 focus:outline-none transition-colors resize-none"
        />
        <button
          onClick={handleCheck}
          disabled={loading || !input.trim()}
          className="w-full shiny-btn bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : <>Check Symptoms <ArrowRight size={18} /></>}
        </button>
      </div>

      {result && (
        <div className="glass-panel p-6 rounded-2xl animate-in slide-in-from-bottom-4 border-l-4 border-l-red-500">
           <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-red-300">
             <ReactMarkdown>{result}</ReactMarkdown>
           </div>
           <div className="mt-4 p-3 bg-red-900/20 rounded-lg flex items-center gap-3 text-red-200 text-xs">
             <ShieldAlert size={16} />
             <span>AI Triage is for informational purposes only. In a life-threatening emergency, call emergency services immediately.</span>
           </div>
        </div>
      )}
    </div>
  );
};

export default SymptomChecker;