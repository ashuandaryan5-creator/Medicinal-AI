import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Star, Phone } from 'lucide-react';
import { findNearbyMedicalConnect } from '../services/geminiService';
import { GroundingChunk } from '../types';

const HospitalFinder: React.FC = () => {
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<any[]>([]); // simplified type
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLoading(false);
        },
        (err) => {
          setError("Location access denied. Cannot find nearby hospitals.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation not supported.");
    }
  }, []);

  const handleSearch = async () => {
    if (!location) return;
    setLoading(true);
    try {
      const response = await findNearbyMedicalConnect(location.lat, location.lng);
      
      // Parse Maps Grounding
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[];
      const mapChunks = chunks?.filter(c => c.maps);
      
      if (mapChunks && mapChunks.length > 0) {
        setPlaces(mapChunks.map(c => c.maps));
      } else {
         // Fallback if no specific chunks, though the model usually generates text too.
         // We rely on the text description or just the chunks for links.
      }
    } catch (e) {
      console.error(e);
      setError("Failed to fetch hospital data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Nearby Care</h2>
        {location && (
          <button 
            onClick={handleSearch}
            disabled={loading}
            className="shiny-btn flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition-all neon-glow-blue text-white"
          >
            <Navigation size={16} />
            <span>Find Hospitals</span>
          </button>
        )}
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/20 text-red-400 rounded-xl">
          {error}
        </div>
      )}

      {!loading && !error && places.length === 0 && location && (
        <div className="text-center text-gray-500 mt-20">
          <MapPin size={48} className="mx-auto mb-4 opacity-50" />
          <p>Tap "Find Hospitals" to locate emergency care near you.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pb-20">
        {places.map((place, idx) => (
          <div key={idx} className="glass-panel p-4 rounded-xl hover:bg-white/10 transition-colors group relative">
            <h3 className="font-bold text-lg text-blue-200">{place.title}</h3>
            
            {/* Snippets / Reviews if available */}
            {place.placeAnswerSources?.reviewSnippets?.[0] && (
               <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                 "{place.placeAnswerSources.reviewSnippets[0].content}"
               </p>
            )}

            <div className="mt-4 flex items-center justify-between">
               <a 
                 href={place.uri} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-xs bg-white/10 hover:bg-blue-600/50 px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors"
               >
                 <MapPin size={12} />
                 View on Maps
               </a>
            </div>
            
            {/* Decorative Glow */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HospitalFinder;