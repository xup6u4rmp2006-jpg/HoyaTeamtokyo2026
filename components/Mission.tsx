
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Stamp, PhotoChallenge } from '../types';
import { Trophy, Camera, Sparkles, Loader2, CheckCircle2, Circle, RotateCw, Heart, Star, Wand2, Calendar } from 'lucide-react';
import { db } from '../services/firebase';
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { DAILY_PHOTO_CHALLENGES, PRIDE_COLORS, PRIDE_TEXT_COLORS, PRIDE_BORDER_COLORS } from '../constants';

const INITIAL_SPOT_STAMPS: Stamp[] = [
  { id: 'fuji', name: '富士山', icon: '🗻', unlocked: false },
  { id: 'shrine', name: '新倉山', icon: '⛩️', unlocked: false },
  { id: 'outlet', name: '御殿場', icon: '🛍️', unlocked: false },
  { id: 'meiji', name: '明治神宮', icon: '🌲', unlocked: false },
  { id: 'shibuya', name: '澀谷', icon: '🚶', unlocked: false },
  { id: 'enoshima', name: '江之島', icon: '🏝️', unlocked: false },
  { id: 'tsukiji', name: '築地市場', icon: '🍣', unlocked: false },
  { id: 'skytree', name: '晴空塔', icon: '🗼', unlocked: false },
];

const INITIAL_EXP_STAMPS: Stamp[] = [
  { id: 'wagyu', name: '和牛', icon: '🥩', unlocked: false },
  { id: 'gacha', name: '扭蛋', icon: '🎰', unlocked: false },
  { id: 'onsen', name: '溫泉', icon: '♨️', unlocked: false },
  { id: 'subway', name: '地鐵', icon: '🚇', unlocked: false },
  { id: 'teamlab', name: 'TeamLab', icon: '💡', unlocked: false },
  { id: 'ramen', name: '拉麵', icon: '🍜', unlocked: false },
  { id: 'izakaya', name: '居酒屋', icon: '🍻', unlocked: false },
  { id: 'crepe', name: '可麗餅', icon: '🥞', unlocked: false },
];

const MACARON_THEMES = [
  { bg: 'bg-[#FFADAD]/20', border: 'border-[#FFADAD]/50', text: 'text-[#FF7070]', iconBg: 'bg-[#FFADAD]/30', gradient: 'from-[#FFADAD]/30 to-[#FFD6A5]/30' },
  { bg: 'bg-[#9BF6FF]/20', border: 'border-[#9BF6FF]/50', text: 'text-[#00B4D8]', iconBg: 'bg-[#9BF6FF]/30', gradient: 'from-[#9BF6FF]/30 to-[#A0C4FF]/30' },
  { bg: 'bg-[#CAFFBF]/20', border: 'border-[#CAFFBF]/50', text: 'text-[#52B788]', iconBg: 'bg-[#CAFFBF]/30', gradient: 'from-[#CAFFBF]/30 to-[#94D2BD]/30' },
  { bg: 'bg-[#BDB2FF]/20', border: 'border-[#BDB2FF]/50', text: 'text-[#8E7DFF]', iconBg: 'bg-[#BDB2FF]/30', gradient: 'from-[#BDB2FF]/30 to-[#FFC6FF]/30' },
  { bg: 'bg-[#FDFFB6]/20', border: 'border-[#FDFFB6]/50', text: 'text-[#E9C46A]', iconBg: 'bg-[#FDFFB6]/30', gradient: 'from-[#FDFFB6]/30 to-[#FFE66D]/30' },
];

const Mission: React.FC = () => {
  const [spotStamps, setSpotStamps] = useState<Stamp[]>([]);
  const [expStamps, setExpStamps] = useState<Stamp[]>([]);
  const [photos, setPhotos] = useState<PhotoChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [isChallengeSpinning, setIsChallengeSpinning] = useState(false);
  const [drawnChallenge, setDrawnChallenge] = useState<PhotoChallenge | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "travelData", "missions"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSpotStamps(data.spotStamps || INITIAL_SPOT_STAMPS);
        setExpStamps(data.expStamps || INITIAL_EXP_STAMPS);
        setPhotos(data.photos || []);
      } else {
        const allInitialPhotos = Object.values(DAILY_PHOTO_CHALLENGES).flat().map(p => ({ 
          id: p.id, name: p.name, icon: p.icon, unlocked: false 
        }));
        setDoc(doc(db, "travelData", "missions"), { 
          spotStamps: INITIAL_SPOT_STAMPS, 
          expStamps: INITIAL_EXP_STAMPS,
          photos: allInitialPhotos
        });
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const activeBtn = scrollRef.current?.querySelector(`[data-day="${selectedDay}"]`);
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [selectedDay]);

  const toggleStamp = async (type: 'spot' | 'exp' | 'photo', id: string) => {
    const docRef = doc(db, "travelData", "missions");
    
    if (type === 'spot') {
      const updated = spotStamps.map(s => s.id === id ? { ...s, unlocked: !s.unlocked } : s);
      setSpotStamps(updated);
      await updateDoc(docRef, { spotStamps: updated });
    } else if (type === 'exp') {
      const updated = expStamps.map(s => s.id === id ? { ...s, unlocked: !s.unlocked } : s);
      setExpStamps(updated);
      await updateDoc(docRef, { expStamps: updated });
    } else if (type === 'photo') {
      let updatedPhotos = [...photos];
      const index = updatedPhotos.findIndex(p => p.id === id);
      
      if (index !== -1) {
        updatedPhotos[index] = { ...updatedPhotos[index], unlocked: !updatedPhotos[index].unlocked };
      } else {
        const allBase = Object.values(DAILY_PHOTO_CHALLENGES).flat();
        const base = allBase.find(b => b.id === id);
        if (base) {
          updatedPhotos.push({ id: base.id, name: base.name, icon: base.icon, unlocked: true });
        }
      }
      
      setPhotos(updatedPhotos);
      await updateDoc(docRef, { photos: updatedPhotos });
    }
  };

  const drawChallenge = () => {
    if (isChallengeSpinning) return;
    setIsChallengeSpinning(true);
    setDrawnChallenge(null);
    setTimeout(() => {
      const dayChallenges = DAILY_PHOTO_CHALLENGES[selectedDay];
      const randomChallenge = dayChallenges[Math.floor(Math.random() * dayChallenges.length)];
      setDrawnChallenge(randomChallenge as any);
      setIsChallengeSpinning(false);
    }, 1200);
  };

  const isDrawnUnlocked = useMemo(() => {
    if (!drawnChallenge) return false;
    return photos.find(p => p.id === drawnChallenge.id)?.unlocked || false;
  }, [drawnChallenge, photos]);

  const currentDayChallenges = useMemo(() => {
    return DAILY_PHOTO_CHALLENGES[selectedDay].map(base => {
      const status = photos.find(p => p.id === base.id);
      return { ...base, unlocked: status?.unlocked || false };
    });
  }, [selectedDay, photos]);

  const dayUnlockedCount = currentDayChallenges.filter(p => p.unlocked).length;

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-rose-300">
      <Loader2 className="animate-spin mb-4" size={48} />
      <p className="font-black animate-pulse">多人挑戰同步中...</p>
    </div>
  );

  const unlockedStampsCount = spotStamps.filter(s=>s.unlocked).length + expStamps.filter(s=>s.unlocked).length;
  const getDayColor = (day: number) => PRIDE_COLORS[(day - 1) % PRIDE_COLORS.length];
  const getDayTextColor = (day: number) => PRIDE_TEXT_COLORS[(day - 1) % PRIDE_TEXT_COLORS.length];
  const getDayBorderColor = (day: number) => PRIDE_BORDER_COLORS[(day - 1) % PRIDE_BORDER_COLORS.length];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* 集章冊 */}
      <div className="bg-white rounded-[4rem] p-10 shadow-2xl border-4 border-rose-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full blur-[80px] -mr-32 -mt-32"></div>
        <div className="flex justify-between items-center mb-12 relative z-10">
          <h2 className="text-3xl font-black text-rose-400 flex items-center gap-3 italic tracking-tight">
             <Trophy size={32} className="text-yellow-400 animate-bounce" /> 集章冊
          </h2>
          <div className="bg-white/80 backdrop-blur shadow-inner px-6 py-2 rounded-full border border-rose-100 flex items-center gap-2">
            <Heart size={14} className="text-rose-400 fill-rose-400" />
            <span className="text-sm font-black text-rose-500">{unlockedStampsCount} / 16</span>
          </div>
        </div>
        <div className="space-y-14 relative z-10">
          <div className="space-y-6">
            <h4 className="text-[11px] font-black text-blue-300 uppercase tracking-[0.5em] flex items-center gap-3">Spot 足跡</h4>
            <div className="grid grid-cols-4 gap-5">
              {spotStamps.map((stamp, idx) => {
                const theme = MACARON_THEMES[idx % MACARON_THEMES.length];
                return (
                  <button key={stamp.id} onClick={() => toggleStamp('spot', stamp.id)} className="flex flex-col items-center gap-3 active:scale-90 transition-transform">
                    <div className={`w-18 h-18 rounded-[2rem] flex items-center justify-center text-4xl border-2 transition-all duration-500 ${stamp.unlocked ? `bg-gradient-to-br ${theme.bg.replace('20', '60')} border-white shadow-xl scale-110` : 'bg-gray-50 border-gray-100 opacity-20 grayscale'}`}>
                      {stamp.icon}
                    </div>
                    <span className={`text-[11px] font-black ${stamp.unlocked ? theme.text : 'text-gray-300'}`}>{stamp.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-6">
             <h4 className="text-[11px] font-black text-orange-300 uppercase tracking-[0.5em] flex items-center gap-3">Exp 體驗</h4>
            <div className="grid grid-cols-4 gap-5">
              {expStamps.map((stamp, idx) => {
                const theme = MACARON_THEMES[(idx + 2) % MACARON_THEMES.length];
                return (
                  <button key={stamp.id} onClick={() => toggleStamp('exp', stamp.id)} className="flex flex-col items-center gap-3 active:scale-90 transition-transform">
                    <div className={`w-18 h-18 rounded-[2rem] flex items-center justify-center text-4xl border-2 transition-all duration-500 ${stamp.unlocked ? `bg-gradient-to-br ${theme.bg.replace('20', '60')} border-white shadow-xl scale-110` : 'bg-gray-50 border-gray-100 opacity-20 grayscale'}`}>
                      {stamp.icon}
                    </div>
                    <span className={`text-[11px] font-black ${stamp.unlocked ? theme.text : 'text-gray-300'}`}>{stamp.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 日期導覽列 */}
      <div className="sticky top-20 z-40 -mx-5 px-5 py-4 glass border-b border-white/50 mb-4 overflow-hidden">
        <div className="flex items-center gap-2 mb-3 px-2">
           <Calendar size={14} className="text-rose-400" />
           <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">當日 10 個驚喜任務</span>
        </div>
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 px-2"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((day) => {
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                data-day={day}
                onClick={() => setSelectedDay(day)}
                className={`flex-shrink-0 w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
                  isSelected 
                    ? `${getDayColor(day)} text-white shadow-lg scale-110 border-2 border-white` 
                    : `bg-white/80 ${getDayTextColor(day)} border border-gray-100 opacity-70`
                }`}
              >
                <span className="text-xs font-black">D{day}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 抽卡區 */}
      <div className="bg-white rounded-[5rem] shadow-[0_30px_100px_rgba(255,173,173,0.15)] border-4 border-rose-50 relative overflow-hidden pb-16">
        <div className="absolute top-0 left-0 w-full h-4 rainbow-bg opacity-30"></div>
        <div className="p-10 text-center relative">
          <div className="mb-10">
            <div className={`inline-flex items-center gap-2 px-6 py-2 ${getDayColor(selectedDay)} bg-opacity-10 rounded-full mb-4`}>
               <Camera size={18} className={getDayTextColor(selectedDay)} />
               <span className={`text-[10px] font-black ${getDayTextColor(selectedDay)} uppercase tracking-widest`}>Day {selectedDay} Challenge</span>
            </div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight italic">隨機美照挑戰</h2>
          </div>

          <div className="flex justify-center mb-12 relative h-[420px]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-100/20 rounded-full blur-[60px]"></div>
            
            <div className={`w-[300px] h-[400px] rounded-[4.5rem] p-1.5 shadow-2xl relative overflow-hidden z-10 bg-gradient-to-br from-[#FFADAD] via-[#BDB2FF] to-[#9BF6FF]`}>
               <div className="w-full h-full bg-white rounded-[4rem] flex flex-col items-center justify-between p-8 text-center border-4 border-white relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-3 rainbow-bg opacity-20"></div>
                  
                  {isChallengeSpinning ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-10">
                      <Loader2 className="text-rose-200 animate-spin" size={80} strokeWidth={1} />
                      <span className="text-rose-300 font-black tracking-[0.3em] text-xs uppercase">正在尋找靈感...</span>
                    </div>
                  ) : drawnChallenge ? (
                    <div className="flex flex-col items-center justify-between h-full w-full animate-in fade-in duration-300">
                      <div className="pt-2 flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 ${isDrawnUnlocked ? 'bg-green-50 border-green-100' : 'bg-yellow-50 border-yellow-100'} rounded-2xl flex items-center justify-center border transition-colors`}>
                           {isDrawnUnlocked ? <CheckCircle2 className="text-green-500" size={20} /> : <Star className="text-yellow-400 fill-yellow-200" size={20} />}
                        </div>
                        <span className={`text-[9px] font-black ${isDrawnUnlocked ? 'text-green-500' : 'text-yellow-500'} uppercase tracking-[0.3em]`}>
                          {isDrawnUnlocked ? 'Mission Completed' : `Day ${selectedDay} Quest`}
                        </span>
                      </div>
                      
                      <div className="flex flex-col items-center gap-6 w-full">
                        <div className={`text-8xl leading-none transition-all duration-500 ${isDrawnUnlocked ? 'scale-110 grayscale-0' : 'grayscale-[0.5]'}`}>{drawnChallenge.icon}</div>
                        <div className="space-y-4 px-2">
                           <div className={`h-1 w-10 mx-auto rounded-full ${isDrawnUnlocked ? 'bg-green-100' : 'bg-rose-100'}`}></div>
                           <p className={`text-lg font-black leading-tight tracking-tight break-words transition-colors ${isDrawnUnlocked ? 'text-green-600 line-through' : 'text-gray-800 italic'}`}>
                            「{drawnChallenge.name}」
                           </p>
                        </div>
                      </div>

                      <div className="pb-4 w-full">
                         <div className="flex justify-center gap-1.5 mb-2">
                           {[...Array(5)].map((_, i) => <Heart key={i} size={10} className={`transition-colors ${isDrawnUnlocked ? 'text-green-200 fill-green-100' : 'text-rose-200 fill-rose-100'}`} />)}
                         </div>
                         <span className="text-[9px] font-black text-rose-200 tracking-[0.4em] uppercase">TOKYO PRIDE 2026</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-10">
                      <div className="w-28 h-28 rounded-[2.5rem] bg-gray-50 flex items-center justify-center text-gray-200 border-2 border-gray-100 shadow-inner">
                         <Camera size={56} strokeWidth={1} />
                      </div>
                      <span className="text-[11px] text-gray-400 font-black uppercase tracking-widest text-center">
                        準備好完成 Day {selectedDay}<br/>的驚喜挑戰了嗎？
                      </span>
                    </div>
                  )}
               </div>
            </div>
          </div>

          <div className="px-4 w-full max-w-[calc(100%-2rem)] mx-auto">
            <button 
              onClick={drawChallenge} 
              disabled={isChallengeSpinning}
              className={`w-full py-7 ${getDayColor(selectedDay)} text-white rounded-[3rem] font-black shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all text-xl border-b-[8px] border-black/10 hover:-translate-y-1 whitespace-nowrap`}
            >
              {isChallengeSpinning ? <RotateCw className="animate-spin" /> : <><Wand2 size={28} /> 抽出今日大挑戰 <Sparkles size={24} /></>}
            </button>
          </div>
        </div>

        <div className="p-10 pt-6">
          <div className="flex justify-between items-center mb-10 px-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-2xl font-black text-gray-800 italic">今日任務清單</h3>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">點擊項目可打勾完成或取消</p>
            </div>
            <div className={`px-5 py-2 ${getDayColor(selectedDay)} bg-opacity-10 rounded-full text-xs font-black ${getDayTextColor(selectedDay)} border ${getDayBorderColor(selectedDay)} border-opacity-30`}>
               {dayUnlockedCount} / 10
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-5">
            {currentDayChallenges.map((p, idx) => {
              const theme = MACARON_THEMES[idx % MACARON_THEMES.length];
              return (
                <button 
                  key={p.id} 
                  onClick={() => toggleStamp('photo', p.id)} 
                  className={`w-full flex items-center gap-6 p-6 rounded-[3rem] border-2 transition-all duration-300 active:scale-95 ${
                    p.unlocked ? 'bg-gray-50 border-gray-100 opacity-60' : `${theme.bg} ${theme.border} shadow-sm`
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-4xl shadow-sm border-2 border-white/80 bg-white/90 ${p.unlocked ? 'grayscale' : ''}`}>
                    {p.icon}
                  </div>
                  <span className={`flex-1 text-base font-black text-left leading-snug tracking-tight text-gray-800 transition-all ${p.unlocked ? 'line-through opacity-40' : ''}`}>
                    {p.name}
                  </span>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    p.unlocked ? 'bg-rose-500 border-white text-white shadow-md' : 'bg-white/80 border-white/60 text-gray-200'
                  }`}>
                    {p.unlocked ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mission;
