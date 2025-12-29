import React, { useState } from 'react';
import { HeartPulse, Mic, Plus, Save } from 'lucide-react';
import { parseVitals } from '../services/geminiService';

interface Vital {
  type: string;
  value: string;
  unit: string;
  timestamp: number;
}

const VitalsLogger: React.FC = () => {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<Vital[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLog = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const jsonStr = await parseVitals(input);
      if (jsonStr) {
        // Strip markdown code blocks if present
        const cleanJson = jsonStr.replace(/```json|```/g, '').trim();
        const data = JSON.parse(cleanJson);
        const newLogs = data.map((d: any) => ({ ...d, timestamp: Date.now() }));
        setLogs(prev => [...newLogs, ...prev]);
        setInput('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
          <HeartPulse className="text-rose-500" />
          Vitals Logger
        </h2>
        <p className="text-gray-400">Log BP, Heart Rate, Glucose using natural language.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLog()}
          placeholder="e.g., 'My blood pressure is 120 over 80 and heart rate is 72'"
          className="flex-1 bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-rose-500/50 focus:outline-none"
        />
        <button 
          onClick={handleLog} 
          disabled={loading}
          className="shiny-btn bg-rose-600 hover:bg-rose-500 px-6 rounded-xl text-white font-bold disabled:opacity-50"
        >
          {loading ? 'Parsing...' : <Plus />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {logs.map((vital, idx) => (
          <div key={idx} className="glass-panel p-4 rounded-xl flex items-center justify-between border-l-4 border-l-rose-500 animate-in zoom-in-95">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">{vital.type}</p>
              <p className="text-2xl font-bold text-white">{vital.value} <span className="text-sm text-gray-500 font-normal">{vital.unit}</span></p>
            </div>
            <div className="text-xs text-gray-600">
              {new Date(vital.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-600">
            No vitals logged yet. Try typing above.
          </div>
        )}
      </div>
    </div>
  );
};

export default VitalsLogger;