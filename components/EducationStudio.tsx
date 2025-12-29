import React, { useState } from 'react';
import { Film, Image as ImageIcon, Loader2, Play, Download } from 'lucide-react';
import { generateEducationalVideo, generateMedicalDiagram } from '../services/geminiService';

const EducationStudio: React.FC = () => {
  const [mode, setMode] = useState<'video' | 'image'>('video');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const checkVeoAuth = async () => {
    // Both Veo models and gemini-3-pro-image-preview require users to select their own API key.
    if (mode === 'video' || mode === 'image') {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        const hasKey = await aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await aistudio.openSelectKey();
        }
      }
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      await checkVeoAuth();
      if (mode === 'video') {
        const uri = await generateEducationalVideo(prompt);
        setResult(uri);
      } else {
        const b64 = await generateMedicalDiagram(prompt);
        setResult(b64);
      }
    } catch (e) {
      console.error(e);
      alert("Generation failed. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-center space-x-4 mb-8">
        <button
          onClick={() => { setMode('video'); setResult(null); }}
          className={`shiny-btn px-6 py-2 rounded-full font-medium transition-all ${mode === 'video' ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'bg-white/5 text-gray-400'}`}
        >
          <div className="flex items-center gap-2"><Film size={18} /> Veo Video</div>
        </button>
        <button
          onClick={() => { setMode('image'); setResult(null); }}
          className={`shiny-btn px-6 py-2 rounded-full font-medium transition-all ${mode === 'image' ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'bg-white/5 text-gray-400'}`}
        >
          <div className="flex items-center gap-2"><ImageIcon size={18} /> Medical Diagram</div>
        </button>
      </div>

      <div className="glass-panel p-8 rounded-2xl flex flex-col items-center space-y-6">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`Describe the ${mode} content (e.g., "${mode === 'video' ? 'A 3D animation of how aspirin works in the bloodstream' : 'Anatomy of the human heart, detailed, neon style'}")`}
          className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors h-32 resize-none"
        />
        
        <div className="text-xs text-gray-500 w-full text-center">
          {mode === 'video' ? 'Powered by Veo 3.1 (Requires Paid Key)' : 'Powered by Gemini 3 Image Preview (Requires Paid Key)'}
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt}
          className="shiny-btn bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-purple-500/20 hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" size={16} />}
          <span>Generate {mode === 'video' ? 'Video' : 'Image'}</span>
        </button>
      </div>

      {result && (
        <div className="glass-panel p-4 rounded-2xl animate-in fade-in slide-in-from-bottom-8">
           {mode === 'video' ? (
             <video controls autoPlay loop className="w-full rounded-lg shadow-2xl border border-white/10" src={result} />
           ) : (
             <div className="relative group">
                <img src={result} alt="Generated" className="w-full rounded-lg shadow-2xl" />
                <a href={result} download="medical-diagram.jpg" className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80">
                  <Download size={20} />
                </a>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default EducationStudio;