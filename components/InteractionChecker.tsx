import React, { useState } from 'react';
import { GitCompare, Plus, X, AlertTriangle } from 'lucide-react';
import { checkInteractions } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const InteractionChecker: React.FC = () => {
  const [drugs, setDrugs] = useState<string[]>(['', '']);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const updateDrug = (index: number, value: string) => {
    const newDrugs = [...drugs];
    newDrugs[index] = value;
    setDrugs(newDrugs);
  };

  const addField = () => setDrugs([...drugs, '']);
  const removeField = (index: number) => setDrugs(drugs.filter((_, i) => i !== index));

  const handleCheck = async () => {
    const validDrugs = drugs.filter(d => d.trim());
    if (validDrugs.length < 2) return;
    setLoading(true);
    try {
      const text = await checkInteractions(validDrugs);
      setResult(text || "No interactions found.");
    } catch (e) {
      setResult("Error checking interactions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
          <GitCompare className="text-amber-500" />
          Drug Interactions
        </h2>
        <p className="text-gray-400">Check safety between multiple medications.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl space-y-4">
        {drugs.map((drug, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              type="text"
              value={drug}
              onChange={(e) => updateDrug(idx, e.target.value)}
              placeholder={`Medication ${idx + 1}`}
              className="flex-1 bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-amber-500/50 focus:outline-none"
            />
            {drugs.length > 2 && (
              <button onClick={() => removeField(idx)} className="p-3 text-red-400 hover:bg-white/5 rounded-lg">
                <X size={20} />
              </button>
            )}
          </div>
        ))}
        
        <div className="flex gap-4 pt-2">
          <button onClick={addField} className="flex-1 py-2 border border-white/10 rounded-lg text-gray-300 hover:bg-white/5 flex items-center justify-center gap-2">
            <Plus size={16} /> Add Medicine
          </button>
          <button 
            onClick={handleCheck} 
            disabled={loading || drugs.filter(d => d.trim()).length < 2}
            className="flex-1 shiny-btn bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Interactions'}
          </button>
        </div>
      </div>

      {result && (
        <div className="glass-panel p-6 rounded-2xl animate-in fade-in">
           <div className="prose prose-invert max-w-none prose-strong:text-amber-300">
             <ReactMarkdown>{result}</ReactMarkdown>
           </div>
        </div>
      )}
    </div>
  );
};

export default InteractionChecker;