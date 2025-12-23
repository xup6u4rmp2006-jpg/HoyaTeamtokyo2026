
import React, { useState, useEffect } from 'react';
import { TabType } from './types';
import Checklist from './components/Checklist';
import Itinerary from './components/Itinerary';
import Booking from './components/Booking';
import Wallet from './components/Wallet';
import Mission from './components/Mission';
import Raffle from './components/Raffle';
import Game from './components/Game';
import { TRIP_START_DATE } from './constants';
import { getOmikuji } from './services/gemini';
import { Calendar as CalendarIcon, Wallet as WalletIcon, ClipboardList, Sparkles, Loader2, X, Ticket, Star, Heart, RotateCw, Trophy, Beer } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('itinerary');
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, mins: number, secs: number }>({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [fortune, setFortune] = useState<string | null>(null);
  const [isFortuneLoading, setIsFortuneLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = TRIP_START_DATE.getTime() - now.getTime();
      
      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          mins: Math.floor((diff / 1000 / 60) % 60),
          secs: Math.floor((diff / 1000) % 60)
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchFortune = async () => {
    setIsFortuneLoading(true);
    const result = await getOmikuji();
    setFortune(result);
    setIsFortuneLoading(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'wallet': return <Wallet />;
      case 'checklist': return <Checklist />;
      case 'booking': return <Booking />;
      case 'itinerary': return <Itinerary />;
      case 'mission': return <Mission />;
      case 'raffle': return <Raffle />;
      case 'game': return <Game />;
      default: return <Itinerary />;
    }
  };

  // 彩虹配色：紅、橙、黃、綠、藍、靛、紫
  const navItems = [
    { id: 'wallet', label: '錢包', icon: <WalletIcon size={18} />, color: '#FF8A8A', textColor: '#D32F2F' }, // 紅
    { id: 'checklist', label: '清單', icon: <ClipboardList size={18} />, color: '#FFB347', textColor: '#E65100' }, // 橙
    { id: 'booking', label: '預訂', icon: <Ticket size={18} />, color: '#FBC02D', textColor: '#F57F17' }, // 黃
    { id: 'itinerary', label: '行程', icon: <CalendarIcon size={18} />, color: '#81C784', textColor: '#2E7D32' }, // 綠
    { id: 'mission', label: '挑戰', icon: <Trophy size={18} />, color: '#4DD0E1', textColor: '#00838F' }, // 藍
    { id: 'raffle', label: '抽籤', icon: <RotateCw size={18} />, color: '#7986CB', textColor: '#283593' }, // 靛
    { id: 'game', label: '遊戲', icon: <Beer size={18} />, color: '#9575CD', textColor: '#4527A0' }, // 紫
  ];

  return (
    <div className="min-h-screen pb-32 max-w-md mx-auto relative overflow-x-hidden">
      <div className="h-2 w-full rainbow-bg fixed top-0 left-0 z-[60]" />

      <header className="p-6 text-center glass border-b border-white/20 shadow-xl sticky top-0 z-50 rounded-b-[3rem] overflow-visible">
        <div className="flex justify-between items-center mb-6 pt-2 px-2">
          <span className="text-4xl animate-bounce">🦄</span>
          
          <div className="relative inline-block group overflow-visible">
            <div className="absolute -inset-10 bg-gradient-to-r from-pink-200 via-white to-sky-200 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-all"></div>
            <div className="flex items-center relative gap-3 overflow-visible">
              <span className="text-6xl font-cute-title font-black rainbow-text select-none py-4 px-2 block leading-normal">
                HOYA
              </span>
              
              <div className="flex flex-col bg-white/80 backdrop-blur-sm px-2 py-1.5 rounded-2xl border border-rose-100 shadow-sm min-w-[65px] h-[54px] justify-center items-center">
                <span className="text-[10px] font-black text-rose-600 tracking-[0.1em] border-b border-rose-100/60 w-full text-center pb-0.5 mb-0.5 leading-none">
                  TOKYO
                </span>
                <span className="text-[10px] font-black text-rose-400 tracking-[0.25em] w-full text-center leading-none mt-0.5">
                  2026
                </span>
              </div>
            </div>
          </div>

          <span className="text-4xl animate-bounce" style={{ animationDelay: '0.3s' }}>🏳️‍🌈</span>
        </div>
        
        {activeTab === 'itinerary' && (
          <div className="bg-white/60 rounded-3xl p-5 inline-block w-full border border-white shadow-inner mb-4 animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full rainbow-bg"></div>
            <p className="text-sm text-rose-600 font-medium mb-3 uppercase tracking-[0.15em] flex items-center justify-center gap-2">
              <Heart size={12} fill="currentColor" /> 出發倒數計時 <Heart size={12} fill="currentColor" />
            </p>
            <div className="flex justify-center gap-4 text-gray-800 font-bold">
              <div className="flex flex-col">
                <span className="text-2xl leading-none">{timeLeft.days}</span>
                <span className="text-[9px] text-rose-400 mt-1 font-semibold">DAYS</span>
              </div>
              <span className="text-rose-200 text-xl font-light">|</span>
              <div className="flex flex-col">
                <span className="text-2xl leading-none">{timeLeft.hours}</span>
                <span className="text-[9px] text-rose-400 mt-1 font-semibold">HRS</span>
              </div>
              <span className="text-rose-200 text-xl font-light">|</span>
              <div className="flex flex-col">
                <span className="text-2xl leading-none">{timeLeft.mins}</span>
                <span className="text-[9px] text-rose-400 mt-1 font-semibold">MINS</span>
              </div>
              <span className="text-rose-200 text-xl font-light">|</span>
              <div className="flex flex-col">
                <span className="text-2xl leading-none">{timeLeft.secs.toString().padStart(2, '0')}</span>
                <span className="text-[9px] text-rose-400 mt-1 font-semibold">SECS</span>
              </div>
            </div>
          </div>
        )}

        <button 
          onClick={fetchFortune}
          disabled={isFortuneLoading}
          className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-rose-500 to-purple-500 hover:from-rose-600 hover:to-purple-600 text-white rounded-2xl font-bold transition-all shadow-lg active:scale-95 text-base border-b-4 border-black/10"
        >
          {isFortuneLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <Sparkles size={20} className="animate-pulse" /> 抽今日彩虹御神籤 (AI) ⛩️
            </>
          )}
        </button>

        {fortune && (
          <div className="mt-5 p-6 bg-white rounded-3xl shadow-2xl relative animate-in zoom-in-95 duration-300 border-2 border-rose-100">
            <button 
              onClick={() => setFortune(null)}
              className="absolute top-4 right-4 text-rose-300 hover:text-rose-500 transition-colors"
            >
              <X size={24} />
            </button>
            <div className="flex flex-col items-center">
              <div className="mb-4 text-3xl">✨🌈✨</div>
              <p className="text-gray-700 font-medium leading-relaxed text-base italic">
                "{fortune}"
              </p>
              <div className="mt-4 flex gap-1">
                 {[...Array(5)].map((_, i) => <Heart key={i} size={14} className="text-rose-400" fill="currentColor" />)}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="p-5 relative z-10">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {renderContent()}
        </div>
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-md bg-white/90 backdrop-blur-2xl border border-white rounded-[2.8rem] shadow-2xl z-50 p-1.5">
        <ul className="flex justify-between items-center h-16 px-1">
          {navItems.map((item) => (
            <li key={item.id} className="flex-1">
              <button
                onClick={() => setActiveTab(item.id as TabType)}
                className={`w-full h-full flex flex-col items-center justify-center gap-1 transition-all duration-300 rounded-[1.8rem] py-1 ${
                  activeTab === item.id 
                    ? 'scale-105 shadow-inner' 
                    : 'text-gray-400'
                }`}
                style={{ 
                  backgroundColor: activeTab === item.id ? `${item.color}33` : 'transparent', // 20% opacity for selected
                }}
              >
                <div className={`transition-all duration-300 ${
                  activeTab === item.id 
                    ? 'transform scale-110' 
                    : 'text-gray-300'
                }`}
                style={{ color: activeTab === item.id ? item.textColor : undefined }}
                >
                  {item.icon}
                </div>
                <span className={`text-[9px] font-black tracking-tighter ${
                  activeTab === item.id ? '' : 'text-gray-400'
                }`}
                style={{ color: activeTab === item.id ? item.textColor : undefined }}
                >
                  {item.label}
                </span>
                {activeTab === item.id && (
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse mt-0.5" style={{ backgroundColor: item.textColor }} />
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="text-center py-20 opacity-30 pointer-events-none space-y-2">
        <p className="text-sm font-semibold text-rose-400">Pride, Love & Hoya</p>
        <div className="flex justify-center gap-3 text-2xl">
           <span>🍭</span><span>🎀</span><span>🦄</span><span>✨</span>
        </div>
      </div>
    </div>
  );
};

export default App;
