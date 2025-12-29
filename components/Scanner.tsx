import React, { useState, useRef } from 'react';
import { Camera, Zap, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { analyzeMedicineImage } from '../services/geminiService';
import { saveScanResult } from '../services/storageService';

const Scanner: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Strip prefix for API
        const data = base64.split(',')[1];
        setImage(data);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    try {
      const text = await analyzeMedicineImage(image);
      setResult(text);
      
      // Auto-save to history
      saveScanResult({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        imageData: image,
        analysisResult: text
      });
      
    } catch (e) {
      console.error(e);
      setResult("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden min-h-[80vh] flex flex-col items-center">
        {/* Background Image - Nature Theme */}
        <div className="absolute inset-0 z-0">
             <img 
                src="https://images.unsplash.com/photo-1473081556163-2a17de836d45?q=80&w=2574&auto=format&fit=crop" 
                alt="Nature Background" 
                className="w-full h-full object-cover opacity-40"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-3xl mx-auto p-4 md:p-8 flex flex-col gap-8">
            <div className="text-center space-y-2 pt-8">
                <h2 className="text-4xl font-bold text-white drop-shadow-md">
                Medicine Scanner
                </h2>
                <p className="text-emerald-100/70 text-sm font-medium">AI-Powered Identification & Intelligence</p>
            </div>

            {/* Input Area */}
            <div className="glass-panel backdrop-blur-xl bg-black/40 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[350px] border-dashed border-2 border-emerald-500/30 relative overflow-hidden group transition-all hover:border-emerald-500/60 shadow-2xl">
                {!image ? (
                <div className="text-center space-y-6 z-10">
                    <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto neon-glow-emerald border border-emerald-500/30">
                    <Camera className="w-10 h-10 text-emerald-400" />
                    </div>
                    <div className="space-y-3">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="shiny-btn px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold tracking-wide transition-all neon-glow-emerald shadow-lg"
                    >
                        Upload Photo
                    </button>
                    <p className="text-xs text-emerald-200/60">Supports bottles, strips, and prescriptions</p>
                    </div>
                    <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileUpload}
                    />
                </div>
                ) : (
                <div className="w-full h-full flex flex-col items-center relative z-10">
                    <img 
                    src={`data:image/jpeg;base64,${image}`} 
                    alt="Scanned Medicine" 
                    className="max-h-[350px] rounded-xl shadow-2xl border border-white/10 object-contain bg-black/50"
                    />
                    <button 
                    onClick={() => { setImage(null); setResult(null); }}
                    className="mt-6 text-sm text-emerald-300 hover:text-white hover:underline transition-colors"
                    >
                    Clear & Scan New
                    </button>
                </div>
                )}
            </div>

            {/* Analysis Controls */}
            {image && !result && (
                <div className="flex justify-center animate-in fade-in slide-in-from-bottom-4">
                <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="shiny-btn flex items-center space-x-3 bg-white text-black px-10 py-4 rounded-full font-bold shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform disabled:opacity-50"
                >
                    {isAnalyzing ? (
                    <>
                        <Activity className="w-6 h-6 animate-spin text-emerald-600" />
                        <span>Enhancing & Analyzing...</span>
                    </>
                    ) : (
                    <>
                        <Zap className="w-6 h-6 fill-black" />
                        <span>Analyze Medicine</span>
                    </>
                    )}
                </button>
                </div>
            )}

            {/* Results View */}
            {result && (
                <div className="glass-panel backdrop-blur-2xl bg-[#0a0a0a]/90 rounded-3xl p-8 space-y-6 animate-in fade-in zoom-in-95 border border-white/10 shadow-2xl mb-20">
                    <div className="flex items-center space-x-3 text-emerald-400 mb-6 border-b border-white/10 pb-6">
                        <CheckCircle className="w-7 h-7" />
                        <h3 className="text-2xl font-bold text-white">Analysis Complete</h3>
                    </div>
                    
                    <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-emerald-300 prose-strong:text-white text-base leading-relaxed prose-li:text-gray-300">
                        <ReactMarkdown>{result}</ReactMarkdown>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10 flex items-start space-x-4 bg-yellow-500/10 p-5 rounded-xl border border-yellow-500/20">
                        <AlertTriangle className="w-6 h-6 text-yellow-500 shrink-0 mt-1" />
                        <p className="text-sm text-yellow-200/90 leading-relaxed">
                            <strong>Medical Disclaimer:</strong> This analysis is generated by AI for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a certified medical professional or pharmacist before taking any medication.
                        </p>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default Scanner;