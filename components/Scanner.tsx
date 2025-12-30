import React, { useState, useRef, useEffect } from 'react';
import { Camera, Zap, Activity, AlertTriangle, CheckCircle, Scan, Image as ImageIcon, X, Video, StopCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { analyzeMedicineImage, detectMedicineObjects } from '../services/geminiService';
import { saveScanResult } from '../services/storageService';

const Scanner: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Live Mode State
  const [isLive, setIsLive] = useState(false);
  const [detections, setDetections] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  // Live Scan Logic
  const startLiveScan = async () => {
    try {
      setIsLive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Prefer back camera
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (e) {
      console.error("Camera access denied", e);
      setIsLive(false);
      alert("Unable to access camera for live scan.");
    }
  };

  const stopLiveScan = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsLive(false);
    setDetections([]);
  };

  useEffect(() => {
    let interval: any;
    if (isLive) {
      // Detection loop: Capture frame every 1.5s
      interval = setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState !== 4) return;

        // Capture frame to canvas
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0);
          const base64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
          
          // Detect
          const items = await detectMedicineObjects(base64);
          setDetections(items);
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isLive]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Scanning animation effect for static image
  const [scanLinePos, setScanLinePos] = useState(0);
  useEffect(() => {
    if (image && !result && !isAnalyzing) {
       const interval = setInterval(() => {
         setScanLinePos(prev => (prev + 1) % 100);
       }, 20);
       return () => clearInterval(interval);
    }
  }, [image, result, isAnalyzing]);

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
                <h2 className="text-4xl font-bold text-white drop-shadow-md flex items-center justify-center gap-3">
                  <Scan className="text-emerald-400" size={32} />
                  Medicine Scanner
                </h2>
                <p className="text-emerald-100/70 text-sm font-medium">
                  {isLive ? 'Real-Time Detection Mode' : 'AI-Powered Identification & Intelligence'}
                </p>
            </div>

            {/* Main Content Area */}
            <div className={`glass-panel backdrop-blur-xl bg-black/40 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[400px] border-dashed border-2 ${image || isLive ? 'border-emerald-500/50' : 'border-emerald-500/30'} relative overflow-hidden group transition-all hover:border-emerald-500/60 shadow-2xl`}>
                
                {isLive ? (
                   // LIVE VIEW MODE
                   <div className="relative w-full h-full flex flex-col items-center">
                     <div className="relative w-full aspect-[3/4] md:aspect-video rounded-2xl overflow-hidden bg-black border border-emerald-500/30 shadow-2xl">
                        <video 
                          ref={videoRef}
                          autoPlay 
                          playsInline 
                          muted 
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Detection Overlays */}
                        {detections.map((d, i) => (
                           <div 
                             key={i}
                             className="absolute border-2 border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)] rounded-lg transition-all duration-300"
                             style={{
                               top: `${d.ymin * 100}%`,
                               left: `${d.xmin * 100}%`,
                               height: `${(d.ymax - d.ymin) * 100}%`,
                               width: `${(d.xmax - d.xmin) * 100}%`
                             }}
                           >
                              <div className="absolute -top-7 left-0 bg-emerald-500 text-black text-xs font-bold px-2 py-1 rounded-t-lg truncate max-w-full">
                                {d.name}
                              </div>
                           </div>
                        ))}
                        
                        {/* Scanning HUD */}
                        <div className="absolute inset-0 pointer-events-none border-[20px] border-transparent rounded-2xl">
                           <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-emerald-500/50 rounded-tl-lg" />
                           <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-emerald-500/50 rounded-tr-lg" />
                           <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-emerald-500/50 rounded-bl-lg" />
                           <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-emerald-500/50 rounded-br-lg" />
                        </div>
                     </div>
                     
                     <button 
                       onClick={stopLiveScan}
                       className="mt-6 flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 px-8 py-3 rounded-full border border-red-500/50 transition-all"
                     >
                       <StopCircle size={20} />
                       <span>Stop Scanning</span>
                     </button>
                   </div>

                ) : !image ? (
                // INPUT SELECTION MODE
                <div className="text-center space-y-8 z-10 w-full max-w-md">
                    <div className="w-32 h-32 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto neon-glow-emerald border border-emerald-500/30 relative">
                        <Scan className="w-16 h-16 text-emerald-400 absolute opacity-50 animate-pulse" />
                        <Camera className="w-10 h-10 text-white z-10" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 w-full">
                        <button 
                            onClick={() => cameraInputRef.current?.click()}
                            className="shiny-btn flex flex-col items-center justify-center gap-2 p-4 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 rounded-2xl transition-all group/btn"
                        >
                            <Camera className="w-6 h-6 text-emerald-400 group-hover/btn:scale-110 transition-transform" />
                            <span className="font-bold text-white text-xs">Photo</span>
                        </button>
                        <button 
                            onClick={startLiveScan}
                            className="shiny-btn flex flex-col items-center justify-center gap-2 p-4 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded-2xl transition-all group/btn"
                        >
                            <Video className="w-6 h-6 text-purple-400 group-hover/btn:scale-110 transition-transform" />
                            <span className="font-bold text-white text-xs">Live ID</span>
                        </button>
                        <button 
                            onClick={() => galleryInputRef.current?.click()}
                            className="shiny-btn flex flex-col items-center justify-center gap-2 p-4 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded-2xl transition-all group/btn"
                        >
                            <ImageIcon className="w-6 h-6 text-blue-400 group-hover/btn:scale-110 transition-transform" />
                            <span className="font-bold text-white text-xs">Upload</span>
                        </button>
                    </div>

                    <p className="text-xs text-emerald-200/60">Supports bottles, strips, and prescriptions</p>
                    
                    <input 
                        type="file" 
                        ref={cameraInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        capture="environment"
                        onChange={handleFileUpload}
                    />
                    <input 
                        type="file" 
                        ref={galleryInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileUpload}
                    />
                </div>
                ) : (
                // STATIC IMAGE ANALYSIS MODE
                <div className="w-full h-full flex flex-col items-center relative z-10">
                    <div className="relative rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black/50 max-h-[350px]">
                        <img 
                            src={`data:image/jpeg;base64,${image}`} 
                            alt="Scanned Medicine" 
                            className="max-h-[350px] object-contain"
                        />
                        
                        {/* Scanning Overlay Effect */}
                        {!result && !isAnalyzing && (
                            <div className="absolute inset-0 pointer-events-none">
                                <div 
                                    className="w-full h-1 bg-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.8)] absolute left-0"
                                    style={{ top: `${scanLinePos}%` }}
                                />
                                <div className="absolute inset-0 bg-emerald-500/5" />
                            </div>
                        )}
                        
                        {isAnalyzing && (
                             <div className="absolute inset-0 bg-black/60 flex items-center justify-center flex-col gap-4 backdrop-blur-sm">
                                <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                                <span className="text-emerald-400 font-bold animate-pulse">Processing...</span>
                             </div>
                        )}

                        <button 
                            onClick={() => { setImage(null); setResult(null); }}
                            className="absolute top-2 right-2 p-2 bg-black/60 rounded-full text-white hover:bg-red-500/80 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {!result && !isAnalyzing && (
                        <div className="mt-8">
                             <button
                                onClick={handleAnalyze}
                                className="shiny-btn flex items-center space-x-3 bg-emerald-500 hover:bg-emerald-400 text-black px-10 py-4 rounded-full font-bold shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105 transition-transform"
                            >
                                <Zap className="w-6 h-6 fill-black" />
                                <span>Identify Medicine</span>
                            </button>
                        </div>
                    )}
                </div>
                )}
            </div>

            {/* Results View (Static Only) */}
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
                    
                    <button 
                        onClick={() => { setImage(null); setResult(null); }}
                        className="w-full py-4 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                    >
                        Scan Another Medicine
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

export default Scanner;