import React, { useState } from 'react';
import { Camera, Stethoscope, Map, Mic, Home, ChevronRight, Clock, Activity, GitCompare, HeartPulse, LifeBuoy, Sun, Film } from 'lucide-react';
import Scanner from './components/Scanner';
import ChatInterface from './components/ChatInterface';
import HospitalFinder from './components/HospitalFinder';
import LiveAssistant from './components/LiveAssistant';
import HistoryView from './components/HistoryView';
import SymptomChecker from './components/SymptomChecker';
import InteractionChecker from './components/InteractionChecker';
import VitalsLogger from './components/VitalsLogger';
import FirstAidGuide from './components/FirstAidGuide';
import WellnessCheck from './components/WellnessCheck';
import EducationStudio from './components/EducationStudio';
import { AppView } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);

  const HomeDashboard = () => {
    const features = [
      {
        id: AppView.CHAT,
        title: 'AI Doctor',
        desc: 'Consult medical intelligence.',
        icon: Stethoscope,
        color: 'text-blue-400',
        bg: 'group-hover:bg-blue-500/10'
      },
      {
        id: AppView.SYMPTOMS,
        title: 'Symptom Triage',
        desc: 'Check urgency & causes.',
        icon: Activity,
        color: 'text-red-400',
        bg: 'group-hover:bg-red-500/10'
      },
      {
        id: AppView.INTERACTIONS,
        title: 'Interaction Check',
        desc: 'Drug safety analysis.',
        icon: GitCompare,
        color: 'text-amber-400',
        bg: 'group-hover:bg-amber-500/10'
      },
      {
        id: AppView.VITALS,
        title: 'Vitals Logger',
        desc: 'Log BP & Heart Rate.',
        icon: HeartPulse,
        color: 'text-rose-400',
        bg: 'group-hover:bg-rose-500/10'
      },
      {
        id: AppView.FIRST_AID,
        title: 'First Aid',
        desc: 'Emergency protocols.',
        icon: LifeBuoy,
        color: 'text-white',
        bg: 'group-hover:bg-white/10'
      },
      {
        id: AppView.WELLNESS,
        title: 'Wellness Core',
        desc: 'Mood & mental health.',
        icon: Sun,
        color: 'text-purple-400',
        bg: 'group-hover:bg-purple-500/10'
      },
      {
        id: AppView.EDUCATION,
        title: 'Edu Studio',
        desc: 'Visual learning & videos.',
        icon: Film,
        color: 'text-indigo-400',
        bg: 'group-hover:bg-indigo-500/10'
      },
      {
        id: AppView.LIVE,
        title: 'Live Consult',
        desc: 'Real-time voice mode.',
        icon: Mic,
        color: 'text-teal-400',
        bg: 'group-hover:bg-teal-500/10'
      },
      {
        id: AppView.MAPS,
        title: 'Nearby Care',
        desc: 'Hospitals & Clinics.',
        icon: Map,
        color: 'text-emerald-400',
        bg: 'group-hover:bg-emerald-500/10'
      },
      {
        id: AppView.HISTORY,
        title: 'History',
        desc: 'Scan timeline.',
        icon: Clock,
        color: 'text-cyan-400',
        bg: 'group-hover:bg-cyan-500/10'
      }
    ];
  
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-32 md:pb-24">
        <div className="text-center space-y-6 py-10 md:py-16">
           <h1 className="text-5xl md:text-8xl font-bold bg-gradient-to-b from-white via-gray-200 to-gray-600 bg-clip-text text-transparent tracking-tighter">
             Medicinal AI
           </h1>
           <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light">
             Your ultra-premium, AI-powered personal health companion.
           </p>
        </div>
  
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Primary Large Card for Scan */}
          <button 
            onClick={() => setView(AppView.SCAN)}
            className="col-span-2 md:col-span-2 lg:col-span-2 glass-panel p-8 rounded-[2rem] flex flex-col md:flex-row items-center md:items-start gap-8 hover:bg-white/5 transition-all group text-left relative overflow-hidden border border-white/5 hover:border-emerald-500/30"
          >
            <div className="p-6 rounded-full bg-emerald-500/10 neon-glow-emerald group-hover:scale-110 transition-transform duration-500 shrink-0">
              <Camera size={48} className="text-emerald-400" />
            </div>
            <div className="space-y-4 z-10 flex-1">
              <h3 className="text-3xl font-bold text-white group-hover:text-emerald-300 transition-colors">Smart Medicine Scan</h3>
              <p className="text-gray-400 group-hover:text-gray-300 text-lg leading-relaxed">
                Identify pills instantly with pixel-perfect accuracy.
              </p>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm pt-2 uppercase tracking-wider">
                <span>Start Scanning</span>
                <ChevronRight size={16} />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          </button>
  
          {/* Other Features */}
          {features.map((f) => (
            <button 
              key={f.id}
              onClick={() => setView(f.id)}
              className={`col-span-1 glass-panel p-6 rounded-[2rem] flex flex-col items-start gap-4 hover:bg-white/5 transition-all group text-left relative overflow-hidden border border-white/5`}
            >
               <div className={`p-3 rounded-2xl bg-white/5 ${f.color} ${f.bg} transition-colors group-hover:scale-110 duration-300`}>
                 <f.icon size={24} />
               </div>
               <div className="space-y-1 z-10">
                 <h3 className="text-lg font-bold text-gray-200 group-hover:text-white transition-colors">{f.title}</h3>
                 <p className="text-xs text-gray-500 group-hover:text-gray-400 leading-relaxed">{f.desc}</p>
               </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const NavButton = ({ v, icon: Icon, label }: { v: AppView; icon: any; label: string }) => (
    <button
      onClick={() => setView(v)}
      className={`flex flex-col items-center justify-center space-y-1 w-16 transition-all duration-300 group ${
        view === v ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'
      }`}
    >
      <div className={`p-1 rounded-xl transition-all ${view === v ? 'bg-emerald-500/10' : 'group-hover:bg-white/5'}`}>
        <Icon size={24} strokeWidth={view === v ? 2.5 : 2} className={view === v ? 'drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : ''} />
      </div>
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </button>
  );

  return (
    <div className="h-screen bg-[#050505] text-slate-200 overflow-hidden relative selection:bg-emerald-500/30 font-sans">
      {/* Abstract Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none animate-pulse delay-1000" />

      {/* Main Content Area - Scrollable */}
      <main className="h-full overflow-y-auto no-scrollbar relative z-10">
        <div className="min-h-full pb-24 md:pb-32">
          {view === AppView.HOME && <HomeDashboard />}
          
          <div className={`max-w-7xl mx-auto transition-all duration-500 ${view !== AppView.HOME ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 hidden'}`}>
             {view !== AppView.HOME && (
               <div className="p-4 pt-6">
                 <button onClick={() => setView(AppView.HOME)} className="mb-4 flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-medium">
                   <ChevronRight className="rotate-180" size={16} /> Back to Dashboard
                 </button>
                 {view === AppView.SCAN && <Scanner />}
                 {view === AppView.CHAT && <ChatInterface />}
                 {view === AppView.MAPS && <HospitalFinder />}
                 {view === AppView.LIVE && <LiveAssistant />}
                 {view === AppView.HISTORY && <HistoryView />}
                 {view === AppView.SYMPTOMS && <SymptomChecker />}
                 {view === AppView.INTERACTIONS && <InteractionChecker />}
                 {view === AppView.VITALS && <VitalsLogger />}
                 {view === AppView.FIRST_AID && <FirstAidGuide />}
                 {view === AppView.WELLNESS && <WellnessCheck />}
                 {view === AppView.EDUCATION && <EducationStudio />}
               </div>
             )}
          </div>
        </div>
      </main>

      {/* Navigation Bar - Responsive */}
      <nav className="fixed bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto glass-panel rounded-2xl md:rounded-full px-6 py-4 flex items-center justify-between md:gap-8 z-50 shadow-2xl border border-white/10 backdrop-blur-xl">
        <NavButton v={AppView.HOME} icon={Home} label="Home" />
        <div className="w-px h-8 bg-white/10 hidden md:block" />
        <NavButton v={AppView.SCAN} icon={Camera} label="Scan" />
        <NavButton v={AppView.CHAT} icon={Stethoscope} label="Doctor" />
        <NavButton v={AppView.SYMPTOMS} icon={Activity} label="Triage" />
        <NavButton v={AppView.HISTORY} icon={Clock} label="History" />
      </nav>
    </div>
  );
};

export default App;