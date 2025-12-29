
import React, { useState, useEffect } from 'react';
import { getSpotGuide } from '../services/gemini';
import { ExternalLink, Sparkles, Loader2, Map as MapIcon } from 'lucide-react';

const SPOTS = [
  { name: '富士山', map: 'https://www.google.com/maps/search/Mount+Fuji' },
  { name: '明治神宮', map: 'https://www.google.com/maps/search/Meiji+Jingu' },
  { name: '鎌倉', map: 'https://www.google.com/maps/search/Kamakura' },
  { name: '淺草', map: 'https://www.google.com/maps/search/Asakusa' },
  { name: '成田市', map: 'https://www.google.com/maps/search/Narita+City' },
];

const Guide: React.FC = () => {
  const [guides, setGuides] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const fetchGuide = async (spot: string) => {
    if (guides[spot]) return;
    setLoading(prev => ({ ...prev, [spot]: true }));
    const info = await getSpotGuide(spot);
    setGuides(prev => ({ ...prev, [spot]: info }));
    setLoading(prev => ({ ...prev, [spot]: false }));
  };

  useEffect(() => {
    fetchGuide(SPOTS[0].name);
  }, []);

  return (
    <div className="space-y-6 pb-6">
      <h2 className="text-2xl font-black text-amber-500 px-2 flex items-center gap-3 mb-4">
        <span className="p-2 rounded-xl bg-yellow-100 text-xl">🗺️</span> 景點地圖與導覽
      </h2>
      
      {SPOTS.map((spot) => (
        <div key={spot.name} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-yellow-50 transition-all hover:shadow-md">
          <div className="p-7">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-black text-gray-700 flex items-center gap-3">
                {spot.name}
              </h3>
              <a 
                href={spot.map} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-black text-amber-600 bg-yellow-100/50 px-5 py-2.5 rounded-full hover:bg-yellow-100 transition-colors"
              >
                <MapIcon size={16} /> 地圖
              </a>
            </div>

            <div className="relative">
              {guides[spot.name] ? (
                <div className="bg-gradient-to-br from-yellow-50/50 to-orange-50/30 p-6 rounded-3xl border border-yellow-50">
                  <p className="text-base text-gray-600 leading-relaxed font-medium">
                    {guides[spot.name]}
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => fetchGuide(spot.name)}
                  disabled={loading[spot.name]}
                  className="w-full flex items-center justify-center gap-4 py-8 text-base font-black text-amber-500 bg-white rounded-3xl border-2 border-dashed border-yellow-200 hover:bg-yellow-50 transition-colors group"
                >
                  {loading[spot.name] ? (
                    <Loader2 className="animate-spin text-amber-400" size={32} />
                  ) : (
                    <>
                      <Sparkles className="text-yellow-400 group-hover:scale-125 transition-transform" size={24} />
                      探索 AI 導覽
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Guide;
