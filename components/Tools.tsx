
import React, { useState } from 'react';
import { Utensils, Languages, Sparkles, Loader2, Heart, RotateCw, Wand2, Star, BookOpen, ExternalLink, Zap } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const FOOD_CATEGORIES = [
  { id: 'izakaya', name: '居酒屋', icon: '🏮' },
  { id: 'ramen', name: '拉麵', icon: '🍜' },
  { id: 'dessert', name: '甜點', icon: '🍰' },
  { id: 'bar', name: '二丁目酒吧', icon: '🏳️‍🌈' },
  { id: 'conv', name: '超商隱藏美食', icon: '🏪' },
];

const SURVIVAL_PHRASES = [
  { ja: '免税できますか？', romaji: 'Menzei dekimasu ka?', zh: '可以免稅嗎？', icon: '🛍️' },
  { ja: 'これ、おすすめは何ですか？', romaji: 'Kore, osusume wa nan desu ka?', zh: '這個推薦的是什麼？', icon: '✨' },
  { ja: 'ジェンダーニュートラルトイレはありますか？', romaji: 'Gender neutral toilet wa arimasu ka?', zh: '有性別友善廁所嗎？', icon: '🚻' },
  { ja: 'この近くに良いバーはありますか？', romaji: 'Kono chikaku ni yoi bar wa arimasu ka?', zh: '這附近有推薦的 Bar 嗎？', icon: '🍸' },
  { ja: '写真を撮ってもらえますか？', romaji: 'Shashin o totte morae masu ka?', zh: '能幫我拍張照嗎？', icon: '📸' },
  { ja: 'お会計をお願いします。', romaji: 'O-kaikei o onegaishimasu.', zh: '請結帳。', icon: '💸' },
];

const Tools: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'food' | 'language'>('food');
  const [foodResult, setFoodResult] = useState<string | null>(null);
  const [isFoodLoading, setIsFoodLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(FOOD_CATEGORIES[0]);

  const drawFood = async () => {
    setIsFoodLoading(true);
    setFoodResult(null);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `你是一個在東京新宿二丁目混跡多年的美食達人。請針對類別「${selectedCategory.name}」推薦一個具體的東京特色美食或店家。
        語氣要超級可愛、時尚、對同志友善。內容包含：1.推薦名稱 2.為什麼推薦（帶點幽默梗） 3.一兩句鼓勵團員去冒險的話。100字內，繁體中文。`,
      });
      setFoodResult(response.text);
    } catch (error) {
      setFoodResult("哎呀，AI 廚師忙不過來，再抽一次試試！");
    }
    setIsFoodLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex bg-white/50 backdrop-blur p-1.5 rounded-3xl border border-pink-100 shadow-sm">
        <button onClick={() => setActiveTool('food')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${activeTool === 'food' ? 'bg-[#F06292] text-white shadow-md' : 'text-gray-400'}`}>
          <Utensils size={16} /> 美食扭蛋
        </button>
        <button onClick={() => setActiveTool('language')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${activeTool === 'language' ? 'bg-[#AB47BC] text-white shadow-md' : 'text-gray-400'}`}>
          <Languages size={16} /> 生存日語
        </button>
      </div>

      {activeTool === 'food' ? (
        <div className="space-y-8">
          <div className="bg-white rounded-[3rem] p-8 shadow-2xl border-4 border-pink-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 rainbow-bg opacity-30"></div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-black text-gray-800 italic flex items-center justify-center gap-2">
                <RotateCw className="text-pink-400" size={24} /> AI 美食決策器
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-2">Tokyo Food Decision Maker</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {FOOD_CATEGORIES.map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${selectedCategory.id === cat.id ? 'bg-pink-50 border-pink-200 scale-105' : 'bg-white border-gray-50'}`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-[10px] font-black text-gray-600">{cat.name}</span>
                </button>
              ))}
            </div>

            <div className="relative min-h-[300px] flex items-center justify-center mb-6">
              {isFoodLoading ? (
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <Loader2 className="text-pink-300 animate-spin" size={60} />
                    <Sparkles className="absolute -top-2 -right-2 text-yellow-300 animate-pulse" size={24} />
                  </div>
                  <span className="text-pink-300 font-black tracking-widest text-xs uppercase">正在聯繫東京大廚...</span>
                </div>
              ) : foodResult ? (
                <div className="bg-gradient-to-br from-pink-50 to-white p-6 rounded-[2.5rem] border-2 border-pink-100 shadow-inner animate-in zoom-in duration-300 w-full">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-2xl">🍱</div>
                  </div>
                  <p className="text-gray-700 font-bold leading-relaxed italic text-center text-sm mb-4">
                    "{foodResult}"
                  </p>
                  <div className="flex justify-center gap-1">
                    {[...Array(5)].map((_, i) => <Heart key={i} size={10} className="text-pink-300 fill-pink-200" />)}
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4 opacity-30 py-10">
                   <div className="text-6xl">🎰</div>
                   <p className="text-xs font-black text-gray-400 uppercase tracking-widest">點擊按鈕開啟美味探險</p>
                </div>
              )}
            </div>

            <button 
              onClick={drawFood}
              disabled={isFoodLoading}
              className="w-full py-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-[2rem] font-black shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all text-lg border-b-8 border-rose-800/20"
            >
              <Wand2 size={24} /> 抽出今日必吃
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-[3rem] p-8 shadow-2xl border-4 border-purple-50">
            <h3 className="text-2xl font-black text-gray-800 italic mb-6 flex items-center gap-3">
               <BookOpen className="text-purple-400" size={24} /> 彩虹生存日語
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {SURVIVAL_PHRASES.map((phrase, i) => (
                <div key={i} className="bg-purple-50/30 p-5 rounded-[2rem] border border-purple-100/50 hover:bg-white transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl shrink-0">
                      {phrase.icon}
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-black text-purple-700 leading-tight">{phrase.ja}</p>
                      <p className="text-[10px] font-bold text-purple-300 italic">{phrase.romaji}</p>
                      <p className="text-sm font-black text-gray-700 pt-1 border-t border-purple-100 mt-2">{phrase.zh}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Languages size={100} />
             </div>
             <div className="relative z-10 space-y-2">
                <h4 className="text-lg font-black italic">Hoya 團隊專屬小撇步</h4>
                <p className="text-xs font-bold opacity-80 leading-relaxed">
                  在二丁目進店時，大方地微笑點頭說「Konnichiwa (你好)」或「Kombanwa (晚上好)」，就能感受到東京彩虹圈的熱情囉！
                </p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tools;
