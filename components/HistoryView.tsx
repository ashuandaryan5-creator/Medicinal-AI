import React, { useState, useEffect } from 'react';
import { Search, Calendar, ChevronDown, ChevronUp, Pill, Trash2 } from 'lucide-react';
import { getScanHistory, clearHistory } from '../services/storageService';
import { HistoryItem } from '../types';
import ReactMarkdown from 'react-markdown';

const HistoryView: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setHistory(getScanHistory());
  }, []);

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all history?")) {
      clearHistory();
      setHistory([]);
    }
  };

  const filteredHistory = history.filter(item => 
    item.analysisResult.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to extract a title from markdown (looks for Brand Name)
  const getTitle = (text: string) => {
    const match = text.match(/\*\*Brand Name:\*\*\s*(.*)/i) || text.match(/Brand Name:\s*(.*)/i);
    return match ? match[1].trim() : "Unknown Medicine";
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Pill className="text-emerald-400" />
          Medicine History
        </h2>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search history..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          {history.length > 0 && (
            <button 
              onClick={handleClear}
              className="p-2 text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
              title="Clear History"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p>No medicines found.</p>
        </div>
      ) : (
        <div className="space-y-4 relative before:absolute before:left-8 before:top-4 before:bottom-4 before:w-px before:bg-white/10">
          {filteredHistory.map((item) => (
            <div key={item.id} className="relative pl-20">
              {/* Timeline Dot */}
              <div className="absolute left-[26px] top-6 w-3 h-3 rounded-full bg-emerald-500 border-4 border-[#050505] z-10" />
              
              <div 
                className={`glass-panel rounded-2xl overflow-hidden transition-all duration-300 ${expandedId === item.id ? 'bg-white/10 ring-1 ring-emerald-500/30' : 'hover:bg-white/5'}`}
              >
                <div 
                  className="p-4 flex items-start gap-4 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-black/50 border border-white/10">
                    <img src={`data:image/jpeg;base64,${item.imageData}`} alt="Thumbnail" className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Summary */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate">{getTitle(item.analysisResult)}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      <Calendar size={12} />
                      <span>{formatDate(item.timestamp)}</span>
                    </div>
                  </div>

                  <div className="text-gray-500">
                    {expandedId === item.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === item.id && (
                  <div className="px-4 pb-4 pt-0 border-t border-white/5 mt-2 animate-in slide-in-from-top-2">
                    <div className="prose prose-invert prose-sm max-w-none pt-4 prose-p:text-gray-300 prose-headings:text-emerald-300">
                      <ReactMarkdown>{item.analysisResult}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryView;