import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../services/firebase';
import { doc, onSnapshot } from "firebase/firestore";
import { Trophy, Star, Map, Camera, Coins, Zap, Heart, Sparkles, Award, Target, Flame, Users, Gift, ShoppingCart, Landmark, TowerControl as Tower, Send, X, PartyPopper } from 'lucide-react';

interface TeamStats {
  stampsCount: number;
  photosCount: number;
  totalSpent: number;
  tripProgress: number;
  expensesCount: number;
  score: number;
  isWagyuUnlocked: boolean;
}

interface AchievementProps {
  onTriggerCelebration: () => void;
}

const macaronColors = ['#FF8A8A', '#FFB347', '#FBC02D', '#D4E157', '#66BB6A', '#4DD0E1', '#5C6BC0', '#9575CD', '#F06292', '#FF7043'];
const macaronRainbowGradient = "linear-gradient(45deg, #FF8A8A, #FFB347, #FBC02D, #D4E157, #66BB6A, #4DD0E1, #5C6BC0, #9575CD, #F06292, #FF7043)";

const Achievement: React.FC<AchievementProps> = ({ onTriggerCelebration }) => {
  const [stats, setStats] = useState<TeamStats>({ stampsCount: 0, photosCount: 0, totalSpent: 0, tripProgress: 0, expensesCount: 0, score: 0, isWagyuUnlocked: false });
  const [clickedWagyu, setClickedWagyu] = useState(false);
  const [isCelebrationEnabled, setIsCelebrationEnabled] = useState(false);
  
  const [tripStartDate, setTripStartDate] = useState('2026-03-01T05:00');
  const [tripEndDate, setTripEndDate] = useState('2026-03-09T20:00');

  useEffect(() => {
    const unsubMissions = onSnapshot(doc(db, "travelData", "missions"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const stamps = [...(data.spotStamps || []), ...(data.expStamps || [])];
        const unlockedStamps = stamps.filter(s => s.unlocked).length;
        const unlockedPhotos = (data.photos || []).filter((p: any) => p.unlocked).length;
        const wagyuStamp = (data.expStamps || []).find((s: any) => s.id === 'wagyu');
        const isWagyuUnlocked = wagyuStamp ? wagyuStamp.unlocked : false;

        setStats(prev => {
           const newScore = unlockedStamps * 10 + unlockedPhotos * 5;
           return { ...prev, stampsCount: unlockedStamps, photosCount: unlockedPhotos, score: newScore, isWagyuUnlocked };
        });
      }
    });

    const unsubWallet = onSnapshot(doc(db, "travelData", "wallet"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const expenses = data.expenses || [];
        const total = expenses.reduce((acc: number, exp: any) => acc + exp.amount, 0);
        setStats(prev => ({ ...prev, totalSpent: total, expensesCount: expenses.length }));
      }
    });

    const unsubConfig = onSnapshot(doc(db, "travelData", "config"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIsCelebrationEnabled(data.isCelebrationEnabled || false);
        if (data.tripStartDate) setTripStartDate(data.tripStartDate);
        if (data.tripEndDate) setTripEndDate(data.tripEndDate);
      }
    });

    return () => {
      unsubMissions();
      unsubWallet();
      unsubConfig();
    };
  }, []);

  // 動態計算旅程進度
  const progress = useMemo(() => {
    const start = new Date(tripStartDate).getTime();
    const end = new Date(tripEndDate).getTime();
    const now = Date.now();
    const p = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
    return Math.round(p);
  }, [tripStartDate, tripEndDate]);

  // 動態生成里程碑列表
  const MILESTONES = useMemo(() => [
    { 
      id: 'start', 
      title: '彩虹啟程', 
      icon: '✈️', 
      condition: (s: TeamStats) => Date.now() >= new Date(tripStartDate).getTime(), 
      desc: '踏上東京土地。', 
      req: `${tripStartDate.replace('T', ' ')}` 
    },
    { id: 'stamps5', title: '足跡收藏家', icon: '👣', condition: (s: TeamStats) => s.stampsCount >= 5, desc: '收集 5 個景點章。', req: '累計解鎖 5 個景點集章' },
    { id: 'photos20', title: '美照大師', icon: '📸', condition: (s: TeamStats) => s.photosCount >= 20, desc: '捕捉 20 個瞬間。', req: '完成 20 項美照挑戰' },
    { id: 'money100k', title: '爆買之神', icon: '💸', condition: (s: TeamStats) => s.totalSpent >= 100000, desc: '總支出破 10 萬。', req: '團隊公用錢包總額破 10 萬' },
    { id: 'wagyu', title: '和牛狂熱', icon: '🥩', condition: (s: TeamStats) => s.score >= 50 && s.isWagyuUnlocked, desc: '享受頂級盛宴，恭喜解鎖和牛燒肉！', req: '總成就分達到 50 點並解鎖和牛燒肉勳章' },
    { id: 'wallet_active', title: '分帳達人', icon: '💰', condition: (s: TeamStats) => s.expensesCount >= 10, desc: '帳目清清楚楚。', req: '公用錢包累計記帳 10 筆' },
    { id: 'photos50', title: '閃亮巨星', icon: '🌟', condition: (s: TeamStats) => s.photosCount >= 50, desc: '街頭就是伸展台。', req: '累計完成 50 項美照挑戰' },
    { id: 'stamps_all', title: '東京攻略王', icon: '🗾', condition: (s: TeamStats) => s.stampsCount >= 12, desc: '制霸推薦景點。', req: '累計解鎖 12 個景點集章' },
    { id: 'team_level_up', title: '默契滿分', icon: '🤝', condition: (s: TeamStats) => s.score >= 300, desc: '團隊靈魂合一。', req: '團隊總成就分達到 300 點' },
    { id: 'completed', title: '東京大圓滿', icon: '🌈', condition: (s: TeamStats) => Date.now() >= new Date(tripEndDate).getTime(), desc: '完成9天東京冒險', req: `${tripEndDate.replace('T', ' ')}` },
  ], [tripStartDate, tripEndDate]);

  const allUnlocked = MILESTONES.every(m => m.condition(stats));

  const getTeamRank = () => {
    if (stats.score >= 400) return { title: '傳奇彩虹冒險家', icon: '👑' };
    if (stats.score >= 250) return { title: '東京時尚巨星', icon: '🌟' };
    if (stats.score >= 100) return { title: '熱血旅遊達人', icon: '🔥' };
    return { title: '東京新手小可愛', icon: '🐣' };
  };

  const rank = getTeamRank();

  const handleMedalClick = (id: string) => {
    if (id === 'wagyu') {
      setClickedWagyu(true);
      setTimeout(() => setClickedWagyu(false), 1000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-32">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black italic flex items-center justify-center gap-3" style={{ color: macaronColors[8] }}>
          <Trophy className="text-yellow-400" size={32} /> 團隊成就系統
        </h2>
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.4em]">Hoya Collective Progress</p>
      </div>

      <div className="bg-white rounded-[3.5rem] p-8 shadow-2xl border-4 border-rose-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2" style={{ background: macaronRainbowGradient, opacity: 0.4 }}></div>
        <div className="flex flex-col items-center gap-6 relative z-10">
           <div className="w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-xl border-4 border-white" style={{ background: `linear-gradient(135deg, ${macaronColors[0]}, ${macaronColors[7]})` }}>
             {rank.icon}
           </div>
           <div className="text-center space-y-1">
             <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: macaronColors[0] }}>目前的團隊榮譽</span>
             <h3 className="text-2xl font-black text-gray-800 italic">{rank.title}</h3>
           </div>
           
           <div className="w-full space-y-4 pt-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">團隊進度里程碑</span>
                <span className="text-xs font-black" style={{ color: macaronColors[8] }}>{stats.score} 點成就</span>
              </div>
              <div className="h-4 bg-gray-50 rounded-full border border-gray-100 overflow-hidden p-0.5 shadow-inner">
                <div 
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, stats.score / 5)}%`, background: macaronRainbowGradient }}
                ></div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: <Map size={24} />, val: stats.stampsCount, label: '已集章', color: macaronColors[5] },
          { icon: <Camera size={24} />, val: stats.photosCount, label: '美照挑戰', color: macaronColors[7] },
          { icon: <Coins size={24} />, val: `¥${stats.totalSpent.toLocaleString()}`, label: '集體總支出', color: macaronColors[4] },
          { icon: <Flame size={24} />, val: `${progress}%`, label: '旅程進度', color: macaronColors[1] }
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-lg flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
              {item.icon}
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-gray-800 leading-none">{item.val}</p>
              <p className="text-[10px] font-bold text-gray-600 uppercase mt-1">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-rose-50 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
           <Sparkles size={100} />
        </div>
        <h3 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-2 italic">
          <Award style={{ color: macaronColors[8] }} /> 團隊榮譽勳章 (10)
        </h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-12">
          {MILESTONES.map((m, i) => {
            const isUnlocked = m.condition(stats);
            const isSpecialAnim = m.id === 'wagyu' && clickedWagyu;
            return (
              <div 
                key={m.id} 
                onClick={() => handleMedalClick(m.id)}
                className={`flex flex-col items-center text-center gap-3 transition-all cursor-pointer ${isUnlocked ? 'scale-100 opacity-100' : 'scale-90 opacity-30 grayscale'} ${isSpecialAnim ? 'animate-bounce' : ''}`}
              >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-xl relative border-4 border-white transition-all ${isUnlocked ? 'hover:scale-110 active:scale-95 animate-pulse-soft' : 'bg-gray-100'}`} style={isUnlocked ? { background: macaronRainbowGradient } : {}}>
                   {m.icon}
                   {isUnlocked && <div className="absolute -top-1 -right-1 bg-yellow-400 text-white rounded-full p-1 border-2 border-white animate-pulse"><Zap size={10} fill="currentColor" /></div>}
                </div>
                <div className="space-y-2 w-full">
                   <h4 className="text-[14px] font-black text-gray-800 uppercase tracking-tight leading-none">{m.title}</h4>
                   <p className="text-[13px] font-bold text-gray-600 leading-tight px-1">
                     {m.desc}
                   </p>
                   <div className="pt-2 mt-2 border-t border-rose-50/50 min-h-[20px]">
                      <p className={`text-[12px] font-black uppercase tracking-tighter ${isUnlocked ? 'text-rose-500' : 'text-gray-600'}`}>
                        {isUnlocked 
                          ? '✓ 已達成' 
                          : (['start', 'completed'].includes(m.id) ? '' : `解鎖：${m.req}`)
                        }
                      </p>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 全成就達成按鈕 */}
      {allUnlocked && isCelebrationEnabled && (
        <div className="flex flex-col items-center gap-4 py-12 animate-in zoom-in duration-1000 overflow-hidden w-full">
           <div className="relative group w-full max-w-[95%]">
              <div className="absolute -inset-2 bg-gradient-to-r from-rose-200 via-indigo-200 to-amber-200 rounded-[3.5rem] blur-xl opacity-40 group-hover:opacity-60 transition duration-1000"></div>
              <button 
                onClick={onTriggerCelebration}
                className="relative w-full py-8 bg-white rounded-[3rem] font-black italic flex items-center justify-center gap-4 transition-all active:scale-95 shadow-xl border-2 border-rose-50 overflow-hidden whitespace-nowrap"
              >
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-shine"></div>
                 <Sparkles className="text-yellow-500 animate-spin-slow flex-shrink-0" size={28} />
                 <span className="rainbow-text text-xl sm:text-2xl md:text-3xl tracking-tighter">榮耀時刻：解鎖團隊驚喜</span>
                 <PartyPopper className="text-rose-500 flex-shrink-0" size={28} />
              </button>
           </div>
           {/* 置中、同一行、極小字 */}
           <div className="w-full flex justify-center mt-2 px-4">
             <p className="text-[7px] font-black text-gray-400 uppercase tracking-[0.25em] flex items-center justify-center gap-1 animate-pulse whitespace-nowrap">
               Scroll down to the bottom and click to celebrate <Sparkles size={7} />
             </p>
           </div>
        </div>
      )}

      <div className="p-8 bg-rose-50/50 rounded-[2.5rem] border-2 border-dashed border-rose-100 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-3 flex items-center justify-center gap-2" style={{ color: macaronColors[0] }}>
          <Sparkles size={12} fill="currentColor" /> 每一小步都是我們的大回憶 <Sparkles size={12} fill="currentColor" />
        </p>
        <p className="text-[10px] font-bold text-gray-600 leading-relaxed italic">
          本系統即時同步全體團員的貢獻。快去勾選行李清單、完成美照挑戰或記錄支出來累積團隊成就點數吧！
        </p>
      </div>

      <style>{`
        @keyframes pulse-soft {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        .animate-pulse-soft {
          animation: pulse-soft 3s ease-in-out infinite;
        }
        @keyframes shine {
          100% { transform: translateX(100%); }
        }
        .animate-shine {
          animation: shine 2s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default Achievement;