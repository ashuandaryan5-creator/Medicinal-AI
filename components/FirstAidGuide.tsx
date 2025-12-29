import React, { useState } from 'react';
import { LifeBuoy, Search, Zap } from 'lucide-react';
import { getFirstAidInstructions } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const FirstAidGuide: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const commonEmergencies = [
    "CPR (Adult)", "Choking", "Severe Bleeding", "Burn Treatment", "Seizure", "Allergic Reaction", "Heart Attack", "Stroke"
  ];

  const fetchInstructions = async (topic: string) => {
    setSelectedTopic(topic);
    setLoading(true);
    setInstructions(null);
    try {
      const text = await getFirstAidInstructions(topic);
      setInstructions(text);
    } catch (e) {
      setInstructions("Error retrieving instructions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
          <LifeBuoy className="text-white" />
          Emergency Protocol
        </h2>
        <p className="text-gray-400">Instant AI-generated first aid procedures.</p>
      </div>

      {!selectedTopic ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {commonEmergencies.map((topic) => (
            <button
              key={topic}
              onClick={() => fetchInstructions(topic)}
              className="glass-panel p-6 rounded-xl text-center hover:bg-white/10 transition-all border border-red-500/20 hover:border-red-500/60 group"
            >
              <Zap className="w-8 h-8 mx-auto mb-3 text-red-500 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-gray-200 group-hover:text-white">{topic}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <button onClick={() => setSelectedTopic(null)} className="text-sm text-gray-400 hover:text-white underline">
            &larr; Back to topics
          </button>
          <div className="glass-panel p-8 rounded-2xl border border-white/10 bg-black/40">
            <h3 className="text-2xl font-bold text-red-500 mb-6">{selectedTopic}</h3>
            {loading ? (
              <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div></div>
            ) : (
              <div className="prose prose-invert max-w-none prose-lg prose-p:text-gray-200 prose-li:text-white">
                <ReactMarkdown>{instructions || ''}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FirstAidGuide;