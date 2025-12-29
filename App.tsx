import React, { useState, useEffect, useRef } from 'react';
import { TabType } from './types';
import Checklist from './components/Checklist';
import Itinerary from './components/Itinerary';
import Booking from './components/Booking';
import Wallet from './components/Wallet';
import Mission from './components/Mission';
import Raffle from './components/Raffle';
import Game from './components/Game';
import Achievement from './components/Achievement';
import { TEAM_MEMBERS, PRIDE_COLORS, MEMBER_PHOTOS, TRIP_START_DATE } from './constants';
import { getOmikuji } from './services/gemini';
import { db } from './services/firebase';
import { doc, onSnapshot, updateDoc, setDoc, getDoc, deleteField } from "firebase/firestore";
import { Sparkles, Loader2, X, Heart, Trophy, Settings, UserCircle, Camera, Fingerprint, Lock, Unlock, ShieldAlert, KeyRound, Plane, Check, ShieldCheck, Trash2, Image as ImageIcon, Megaphone, BellRing, History, RotateCcw, AlertCircle, ArrowLeft, Key, Wand2, Star, Award, ToggleRight, ToggleLeft, PartyPopper, TowerControl as Tower, Clock } from 'lucide-react';

const TEAM_TITLES: Record<string, string> = {
  'Sean': '首席領航員 ✈️', 'Ben': '和牛鑑定師 🥩', 'Oedi': '時尚急先鋒 💅', 'Wilson': '酒精管理員 🥂',
  'Ethan': '美照攝影師 📸', 'William': '血拼戰神 🛍️', 'Alvin': '迷路小隊長 🗺️', 'Sophia': '微笑外交官 ✨',
  'Daisy': '甜點巡邏隊 🍰', 'Jennifer': '情報分析官 🔍', 'Sebrina': '採買總指揮 🛒', 'Nica': '最萌吉祥物 🦄'
};

const STATUS_OPTIONS = ['🛒 採買中', '🍜 吃飯中', '💤 補眠中', '🚶 走路中', '📸 拍美照', '🚃 搭車中', '🛍️ 爆買中', '🚫 不顯示'];

const MEMBER_COLORS = [
  '#FF8A8A', '#FFB347', '#FBC02D', '#81C784', '#4DD0E1', '#7986CB', '#9575CD', '#F06292', '#F48FB1', '#FF7043', '#BA68C8', '#4FC3F2'
];

const macaronColors = ['#FF8A8A', '#FFB347', '#FBC02D', '#D4E157', '#66BB6A', '#4DD0E1', '#5C6BC0', '#9575CD', '#F06292', '#FF7043'];

const MemberBadge: React.FC<{ name: string; size?: string; className?: string; isLocked?: boolean; customPhoto?: string; isSelected?: boolean }> = ({ name, size = "w-11 h-11", className = "", isLocked = false, customPhoto, isSelected = true }) => {
  const index = TEAM_MEMBERS.indexOf(name);
  const bgColor = PRIDE_COLORS[index !== -1 ? index % PRIDE_COLORS.length : 0];
  const photoUrl = customPhoto || MEMBER_PHOTOS[name];

  return (
    <div className={`relative flex-shrink-0 aspect-square rounded-full transition-all duration-300 ${size} ${className} ${!isSelected ? 'grayscale opacity-40' : ''}`}>
      {photoUrl ? (
        <div className="w-full h-full rounded-full border-[2.5px] border-white shadow-sm overflow-hidden bg-white">
          <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className={`w-full h-full rounded-full border-[2.5px] border-white shadow-sm flex items-center justify-center text-white font-black uppercase text-[11px] ${bgColor}`}>
          {name[0]}
        </div>
      )}
      {isLocked && (
        <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-1 shadow-md border border-gray-100 flex items-center justify-center z-10">
          <Lock size={9} className="text-amber-500" fill="currentColor" />
        </div>
      )}
    </div>
  );
};

const MemberAvatar: React.FC<{ 
  name: string; index: number; size?: string; className?: string; currentStatus?: string; 
  customPhoto?: string; disablePop?: boolean; title?: string; onOpenStatusMenu: () => void 
}> = ({ name, index, size = "w-10 h-10", className = "", currentStatus = "🚫 不顯示", customPhoto, disablePop = false, title, onOpenStatusMenu }) => {
  const [isPopping, setIsPopping] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [isBursting, setIsBursting] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number; delay: number; color: string; scale: number }[]>([]);
  const longPressTimer = useRef<number | null>(null);
  const isLongPressActive = useRef(false);
  const bgColor = PRIDE_COLORS[index % PRIDE_COLORS.length];
  const memberColor = MEMBER_COLORS[index % MEMBER_COLORS.length];
  const photoUrl = customPhoto || MEMBER_PHOTOS[name];

  const handleStart = () => {
    isLongPressActive.current = false;
    longPressTimer.current = window.setTimeout(() => { 
      isLongPressActive.current = true; 
      onOpenStatusMenu(); 
    }, 600);
  };

  const handleEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (!isLongPressActive.current && !disablePop) {
      setShowTitle(true);
      setIsBursting(false);
      
      const colors = ['#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#BDB2FF', '#FFC6FF'];
      const newHearts = Array.from({ length: 12 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 40 + Math.random() * 65;
        return {
          id: Date.now() + i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          delay: Math.random() * 0.1,
          color: colors[Math.floor(Math.random() * colors.length)],
          scale: 0.5 + Math.random() * 1.2
        };
      });
      setHearts(newHearts);
      setIsPopping(true);

      setTimeout(() => setIsBursting(true), 900);
      setTimeout(() => {
        setIsPopping(false);
        setShowTitle(false);
        setIsBursting(false);
        setHearts([]);
      }, 1100);
    }
  };

  const displayEmoji = currentStatus?.split(' ')[0] || '🚫';
  const shouldShowStatus = displayEmoji !== '🚫';

  return (
    <div className={`flex flex-col items-center relative ${isPopping ? 'z-[1000]' : 'z-0'}`}>
      {showTitle && (
        <div 
          className={`absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/95 backdrop-blur px-3 py-1.5 rounded-2xl shadow-xl z-[1100] border-2 transition-all ${isBursting ? 'animate-bubble-burst' : 'animate-bubble-pop'}`}
          style={{ borderColor: memberColor }}
        >
          <span className="text-[10px] font-black italic tracking-tight" style={{ color: memberColor }}>
            {title || TEAM_TITLES[name]}
          </span>
          <div 
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 rotate-45"
            style={{ borderColor: memberColor }}
          ></div>
        </div>
      )}

      {hearts.map(h => (
        <div 
          key={h.id} 
          className="absolute pointer-events-none z-[1200] animate-heart-explode" 
          style={{ 
            '--tx': `${h.x}px`, 
            '--ty': `${h.y}px`, 
            animationDelay: `${h.delay}s`, 
            color: h.color,
            transform: `scale(${h.scale})`
          } as any}
        >
          <Heart size={16} fill="currentColor" strokeWidth={0} className="drop-shadow-sm" />
        </div>
      ))}

      <div 
        onMouseDown={handleStart} onMouseUp={handleEnd} onTouchStart={handleStart} onTouchEnd={handleEnd} 
        className={`relative group outline-none select-none touch-none transition-all duration-300 ${isPopping ? 'scale-110' : 'hover:scale-105 active:scale-95'}`}
      >
        <div className={`${size} rounded-full border-[3px] border-white shadow-md overflow-hidden flex-shrink-0 bg-white relative z-10`}>
          {photoUrl ? <img src={photoUrl} alt={name} className="w-full h-full object-cover pointer-events-none" /> : <div className={`w-full h-full flex items-center justify-center text-white font-black text-[11px] uppercase ${bgColor}`}>{name[0]}</div>}
        </div>
        {shouldShowStatus && !isPopping && (
          <div className="absolute -top-1 -right-1 bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-md border-2 border-rose-50 z-20 pointer-events-none">
            <span className="text-[12px] leading-none">{displayEmoji}</span>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes bubble-pop {
          0% { transform: translate(-50%, 10px) scale(0); opacity: 0; }
          60% { transform: translate(-50%, -2px) scale(1.15); opacity: 1; }
          100% { transform: translate(-50%, 0) scale(1); opacity: 1; }
        }
        .animate-bubble-pop { animation: bubble-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        
        @keyframes bubble-burst {
          0% { transform: translate(-50%, 0) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -5px) scale(1.4); opacity: 0; }
        }
        .animate-bubble-burst { animation: bubble-burst 0.2s ease-out forwards; }

        @keyframes heart-explode {
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          30% { opacity: 1; transform: translate(calc(var(--tx) * 0.3), calc(var(--ty) * 0.3)) scale(1.3); }
          100% { transform: translate(var(--tx), var(--ty)) scale(0.4); opacity: 0; }
        }
        .animate-heart-explode { animation: heart-explode 1.2s cubic-bezier(0.15, 0.85, 0.35, 1) forwards; }
      `}</style>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('itinerary');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [fortune, setFortune] = useState<string | null>(null);
  const [isFortuneLoading, setIsFortuneLoading] = useState(false);
  const [showFortuneModal, setShowFortuneModal] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [teamStatus, setTeamStatus] = useState<Record<string, string>>({});
  const [memberProfiles, setMemberProfiles] = useState<Record<string, any>>({});
  const [showSettings, setShowSettings] = useState(false);
  const [settingsStep, setSettingsStep] = useState<'select' | 'auth' | 'edit' | 'admin' | 'admin-auth'>('select');
  const [targetMember, setTargetMember] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editPhoto, setEditPhoto] = useState('');
  const [editPin, setEditPin] = useState('');
  const [adminPinInput, setAdminPinInput] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isAdminActionLoading, setIsAdminActionLoading] = useState<string | null>(null);
  const [isCelebrationEnabled, setIsCelebrationEnabled] = useState(false);
  const [showFullCelebration, setShowFullCelebration] = useState(false);
  
  // 動態時間設定：預設改為 2026/03/01 02:30 (早上二點三十分)
  const [dynamicTripStart, setDynamicTripStart] = useState('2026-03-01T02:30');
  const [dynamicTripEnd, setDynamicTripEnd] = useState('2026-03-09T20:00');

  const [statusMenuTarget, setStatusMenuTarget] = useState<string | null>(null);
  const [announcementText, setAnnouncementText] = useState('');
  const [activeAnnouncement, setActiveAnnouncement] = useState<{ id: string, text: string } | null>(null);
  const [announcementHistory, setAnnouncementHistory] = useState<any[]>([]);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const isDismissed = localStorage.getItem('hoya_trip_reminder_dismissed');
    if (isDismissed !== 'true') { setShowReminder(true); setIsOverlayOpen(true); }

    onSnapshot(doc(db, "travelData", "teamStatus"), (docSnap) => { if (docSnap.exists()) setTeamStatus(docSnap.data()); });
    onSnapshot(doc(db, "travelData", "memberProfiles"), (docSnap) => {
      if (docSnap.exists()) { setMemberProfiles(docSnap.data()); } 
      else {
        const init: Record<string, any> = {};
        TEAM_MEMBERS.forEach(m => init[m] = { title: TEAM_TITLES[m], photo: MEMBER_PHOTOS[m], isLocked: false, photoLocked: false });
        setDoc(doc(db, "travelData", "memberProfiles"), init);
        setMemberProfiles(init);
      }
    });

    onSnapshot(doc(db, "travelData", "announcement"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAnnouncementHistory(data.history || []);
        const dismissedId = localStorage.getItem('hoya_ann_dismissed_id');
        if (data.id && data.id !== dismissedId && data.text.trim()) {
          setActiveAnnouncement({ id: data.id, text: data.text });
          setShowAnnouncement(true);
          setIsOverlayOpen(true);
        } else { 
          setActiveAnnouncement(data.text ? { id: data.id, text: data.text } : null);
          setShowAnnouncement(false); 
        }
      }
    });

    onSnapshot(doc(db, "travelData", "config"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIsCelebrationEnabled(data.isCelebrationEnabled || false);
        if (data.tripStartDate) setDynamicTripStart(data.tripStartDate);
        if (data.tripEndDate) setDynamicTripEnd(data.tripEndDate);
      } else {
        setDoc(doc(db, "travelData", "config"), { 
          isCelebrationEnabled: false, 
          tripStartDate: '2026-03-01T02:30', 
          tripEndDate: '2026-03-09T20:00' 
        });
      }
    });

    const timer = setInterval(() => {
      const targetDate = new Date(dynamicTripStart).getTime();
      const diff = targetDate - new Date().getTime();
      if (diff <= 0) { 
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 }); 
      } 
      else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          mins: Math.floor((diff / 1000 / 60) % 60),
          secs: Math.floor((diff / 1000) % 60)
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [dynamicTripStart]);

  const handleDrawFortune = async () => {
    setIsFortuneLoading(true);
    setShowFortuneModal(true);
    setIsOverlayOpen(true);
    try {
      const res = await getOmikuji();
      setFortune(res);
    } catch (e) {
      setFortune("今日大吉！彩虹巫女能量爆棚中！🌈");
    } finally {
      setIsFortuneLoading(false);
    }
  };

  const updateConfig = async (key: string, value: any) => {
    setIsAdminActionLoading(key);
    try {
      await updateDoc(doc(db, "travelData", "config"), { [key]: value });
    } catch (e) { alert("更新設定失敗"); } finally { setIsAdminActionLoading(null); }
  };

  const toggleCelebration = () => updateConfig('isCelebrationEnabled', !isCelebrationEnabled);

  const closeFortuneModal = () => {
    setShowFortuneModal(false);
    setFortune(null);
    setIsOverlayOpen(false);
  };

  const handleAuth = async () => {
    const bDoc = await getDoc(doc(db, "travelData", "baggage_v3"));
    const wDoc = await getDoc(doc(db, "travelData", "personal_wallets_v1"));
    const correctPin = (bDoc.exists() ? bDoc.data().memberPins?.[targetMember] : null) || (wDoc.exists() ? wDoc.data().pins?.[targetMember] : null);
    if (!correctPin || pinInput === correctPin) {
      setEditTitle(memberProfiles[targetMember]?.title || '');
      setEditPhoto(memberProfiles[targetMember]?.photo || '');
      setEditPin(correctPin || '');
      setSettingsStep('edit'); setPinError(false);
    } else { setPinError(true); setTimeout(() => setPinError(false), 500); }
  };

  const handleAdminAuth = () => {
    if (adminPinInput === '1130') {
      setSettingsStep('admin'); setAdminPinInput(''); setPinError(false);
    } else { setPinError(true); setTimeout(() => setPinError(false), 500); }
  };

  const resetMemberPin = async (name: string) => {
    if (!window.confirm(`⚠️ 確定要重置 ${name} 的 PIN 碼嗎？`)) return;
    setIsAdminActionLoading(`${name}-pin`);
    try {
      await updateDoc(doc(db, "travelData", "baggage_v3"), { [`memberPins.${name}`]: deleteField() });
      await updateDoc(doc(db, "travelData", "personal_wallets_v1"), { [`pins.${name}`]: deleteField() });
      await updateDoc(doc(db, "travelData", "memberProfiles"), { [`${name}.isLocked`]: false });
      localStorage.removeItem(`hoya_verified_${name}`);
      localStorage.removeItem(`wallet_verified_${name}`);
      alert("密碼已成功清除！");
    } catch (e) { alert("重置失敗"); } finally { setIsAdminActionLoading(null); }
  };

  const unlockPhoto = async (name: string) => {
    if (!window.confirm(`📸 確定要幫 ${name} 解鎖照片限制嗎？`)) return;
    setIsAdminActionLoading(`${name}-photo`);
    try {
      await updateDoc(doc(db, "travelData", "memberProfiles"), { [`${name}.photoLocked`]: false });
      alert("已解除限制，現在可以重新上傳照片了！");
    } catch (e) { alert("操作失敗"); } finally { setIsAdminActionLoading(null); }
  };

  const publishAnnouncement = async (text: string = announcementText) => {
    if (!text.trim()) return;
    setIsPublishing(true);
    try {
      const newAnn = { text: text.trim(), id: Date.now().toString(), timestamp: Date.now() };
      const newHistory = [newAnn, ...announcementHistory.filter(h => h.text !== newAnn.text)].slice(0, 5);
      await setDoc(doc(db, "travelData", "announcement"), { 
        text: newAnn.text, 
        id: newAnn.id,
        history: newHistory
      });
      setAnnouncementText('');
      alert("全團公告已發布！");
    } catch (e) { alert("發布失敗"); } finally { setIsPublishing(false); }
  };

  const deleteHistoryItem = async (itemToDelete: any) => {
    if (!window.confirm("確定要刪除這則歷史公告嗎？")) return;
    try {
      const newHistory = announcementHistory.filter(h => h.id !== itemToDelete.id);
      await updateDoc(doc(db, "travelData", "announcement"), { 
        history: newHistory
      });
    } catch (e) { alert("刪除失敗"); }
  };

  const handleCancelAnnouncement = async () => {
    setIsPublishing(true);
    try {
      await updateDoc(doc(db, "travelData", "announcement"), { text: "", id: "" });
      setShowCancelConfirm(false);
    } catch (e) { alert("撤回失敗"); } finally { setIsPublishing(false); }
  };

  const updateStatus = async (status: string) => {
    if (!statusMenuTarget) return;
    try {
      await updateDoc(doc(db, "travelData", "teamStatus"), { [statusMenuTarget]: status });
      setStatusMenuTarget(null);
      setIsOverlayOpen(false);
    } catch (e) { alert("更新狀態失敗"); }
  };

  const saveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const cur = memberProfiles[targetMember];
      await updateDoc(doc(db, "travelData", "memberProfiles"), { [targetMember]: { ...cur, title: editTitle, photo: editPhoto, isLocked: true, photoLocked: cur?.photoLocked || editPhoto !== cur?.photo } });
      if (editPin) {
        const bRef = doc(db, "travelData", "baggage_v3");
        const wRef = doc(db, "travelData", "personal_wallets_v1");
        const bSnap = await getDoc(bRef); if(bSnap.exists()) await updateDoc(bRef, { [`memberPins.${targetMember}`]: editPin });
        const wSnap = await getDoc(wRef); if(wSnap.exists()) await updateDoc(wRef, { [`pins.${targetMember}`]: editPin });
      }
      setShowSettings(false); setSettingsStep('select'); setPinInput(''); setIsOverlayOpen(false);
    } catch (e) { alert("儲存失敗！"); } finally { setIsSavingProfile(false); }
  };

  const dismissAnnouncement = (perm: boolean) => {
    if (perm && activeAnnouncement) localStorage.setItem('hoya_ann_dismissed_id', activeAnnouncement.id);
    setShowAnnouncement(false); setIsOverlayOpen(showReminder);
  };

  const triggerFullCelebration = () => {
    setShowFullCelebration(true);
    setIsOverlayOpen(true);
    setShowSettings(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'wallet': return <Wallet />;
      case 'checklist': return <Checklist />;
      case 'booking': return <Booking onModalToggle={setIsOverlayOpen} />;
      case 'itinerary': return <Itinerary onModalToggle={setIsOverlayOpen} />;
      case 'mission': return <Mission />;
      case 'raffle': return <Raffle onModalToggle={setIsOverlayOpen} />;
      case 'game': return <Game />;
      case 'achievement': return <Achievement onTriggerCelebration={triggerFullCelebration} />;
      default: return <Itinerary onModalToggle={setIsOverlayOpen} />;
    }
  };

  return (
    <div className={`min-h-screen pb-32 max-w-md mx-auto relative overflow-x-hidden ${isOverlayOpen ? 'h-screen overflow-hidden' : ''}`}>
      <div className="h-2 w-full rainbow-bg absolute top-0 left-0 z-10" />

      {/* 全螢幕慶祝動畫：東京之巔 */}
      {showFullCelebration && (
        <div className="fixed inset-0 z-[6000] flex flex-col bg-black/90 backdrop-blur-2xl animate-in fade-in duration-700 overflow-y-auto scrollbar-hide">
           <button onClick={() => { setShowFullCelebration(false); setIsOverlayOpen(false); }} className="fixed top-6 right-6 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all z-[6100]"><X size={24} /></button>
           
           <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute animate-firework" 
                  style={{ 
                    left: `${Math.random() * 100}%`, 
                    top: `${Math.random() * 100}%`, 
                    animationDelay: `${Math.random() * 5}s`,
                    backgroundColor: macaronColors[i % macaronColors.length]
                  }}
                />
              ))}
              {[...Array(30)].map((_, i) => (
                <div 
                  key={`petal-${i}`} 
                  className="absolute animate-fall-sakura text-2xl" 
                  style={{ 
                    left: `${Math.random() * 100}%`, 
                    animationDuration: `${5 + Math.random() * 5}s`,
                    animationDelay: `${Math.random() * 5}s`
                  }}
                >
                  {i % 2 === 0 ? '🌸' : '❤️'}
                </div>
              ))}
           </div>

           <div className="flex-1 flex flex-col items-center justify-center gap-8 md:gap-12 p-8 py-16 relative z-50">
              <div className="relative w-32 h-32 md:w-48 md:h-48 animate-bounce-slow flex-shrink-0">
                 <div className="absolute inset-0 bg-white/20 rounded-full blur-[60px] animate-pulse"></div>
                 <div className="relative w-full h-full bg-gradient-to-t from-red-600 to-rose-400 rounded-full flex items-center justify-center border-4 border-white shadow-[0_0_50px_rgba(255,255,255,0.5)]">
                    <Tower className="text-white drop-shadow-xl w-[60%] h-[60%]" />
                 </div>
                 <div className="absolute -top-4 -right-4 w-12 h-12 md:w-16 md:h-16 bg-yellow-400 rounded-full flex items-center justify-center text-xl md:text-3xl shadow-lg border-4 border-white rotate-12 animate-wiggle">🗼</div>
              </div>

              <div className="text-center space-y-6 w-full max-w-xs md:max-w-md">
                <div className="flex flex-col items-center">
                   <span className="text-white/60 font-black uppercase tracking-[0.4em] text-[10px] mb-1">Adventure Completed</span>
                   <h1 className="text-4xl md:text-6xl font-black italic rainbow-text drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] leading-tight px-4 py-1">HOYA TEAM</h1>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-6 py-4 md:px-10 md:py-5 rounded-[2.5rem] md:rounded-[3rem] border border-white/20 shadow-2xl">
                   <h2 className="text-xl md:text-3xl font-black text-white italic tracking-tighter">「制霸東京 2026」</h2>
                </div>
                <p className="text-white/80 font-bold tracking-widest text-[11px] md:text-sm">謝謝你們，讓彩虹在東京綻放！🌈✨</p>
              </div>

              <button 
                onClick={() => { setShowFullCelebration(false); setIsOverlayOpen(false); }}
                className="px-10 py-4 md:px-12 md:py-5 bg-white text-rose-600 rounded-full font-black text-lg md:text-xl uppercase tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-110 active:scale-95 transition-all flex-shrink-0"
              >
                慶祝這份榮耀
              </button>
           </div>
        </div>
      )}

      {statusMenuTarget && (
        <div className="fixed inset-0 z-[5500] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl border-4 border-white relative overflow-hidden animate-in zoom-in-95">
            <button onClick={() => { setStatusMenuTarget(null); setIsOverlayOpen(false); }} className="absolute top-4 right-4 p-1.5 bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 transition-colors"><X size={18} /></button>
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shadow-inner">
                <Sparkles size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-gray-800 italic">{statusMenuTarget}，正在做什麼？</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">點擊選擇當前狀態</p>
              </div>
              <div className="w-full grid grid-cols-4 gap-2.5 py-4">
                {STATUS_OPTIONS.map(status => {
                  const parts = status.split(' ');
                  return (
                    <button 
                      key={status} 
                      onClick={() => updateStatus(status)} 
                      className="flex flex-col items-center justify-center aspect-square bg-gray-50 hover:bg-rose-50 border border-gray-100 rounded-2xl text-[10px] font-black text-gray-700 transition-all active:scale-95 shadow-sm p-1 gap-1"
                    >
                      <span className="text-xl leading-none">{parts[0]}</span>
                      <span className="scale-90 whitespace-nowrap">{parts[1]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {!isOverlayOpen && (
        <div className="fixed bottom-28 left-4 z-[200]">
           <button 
             onClick={() => setActiveTab('achievement')}
             className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_5px_15px_rgba(255,215,0,0.4)] active:scale-90 border-2 border-white ${activeTab === 'achievement' ? 'scale-110 ring-4 ring-yellow-200' : ''}`}
             style={{ background: 'linear-gradient(135deg, #FFD600, #FFAB00)' }}
           >
              <Trophy size={18} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]" strokeWidth={3} />
              <div className={`absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm transition-opacity ${activeTab === 'achievement' ? 'opacity-100' : 'opacity-0'}`}>
                <Star size={10} className="fill-yellow-500 text-yellow-500" />
              </div>
           </button>
        </div>
      )}

      {showAnnouncement && activeAnnouncement && (
        <div className="fixed inset-0 z-[5500] flex items-center justify-center p-6 bg-black/70 backdrop-blur-lg animate-in fade-in duration-500">
           <div className="bg-white w-full max-w-sm rounded-[3.5rem] p-1 shadow-2xl border-4 border-white relative overflow-hidden animate-in zoom-in-95">
              <div className="absolute top-0 left-0 w-full h-3 bg-amber-400 opacity-60"></div>
              <div className="p-8 text-center space-y-8">
                 <div className="relative">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-amber-50 flex items-center justify-center text-amber-500 mx-auto shadow-inner animate-pulse"><Megaphone size={48} /></div>
                    <div className="absolute -top-1 -right-4 bg-red-500 text-white p-2 rounded-full shadow-lg border-2 border-white rotate-12 animate-bounce"><BellRing size={24} /></div>
                 </div>
                 <div className="space-y-4">
                    <h3 className="text-3xl font-black text-gray-800 italic tracking-tighter">管理員重要公告</h3>
                    <div className="bg-amber-50/50 p-6 rounded-[2.5rem] border-2 border-dashed border-amber-500 shadow-inner">
                       <p className="text-xl font-black text-amber-900 leading-relaxed italic">{activeAnnouncement.text}</p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <button onClick={() => dismissAnnouncement(false)} className="w-full py-5 bg-amber-500 text-white rounded-[2rem] font-black shadow-xl active:scale-95 transition-all text-xl border-b-8 border-amber-800/30">我知道了</button>
                    <button onClick={() => dismissAnnouncement(true)} className="w-full py-3 text-gray-300 font-bold text-[10px] uppercase tracking-[0.3em]">不再顯示此公告</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {showFortuneModal && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-500">
           <div className="bg-white w-full max-w-sm rounded-[3.5rem] p-1 shadow-2xl border-4 border-white relative overflow-hidden animate-in zoom-in-95">
              <div className="absolute top-0 left-0 w-full h-4 rainbow-bg opacity-40"></div>
              <div className="p-8 text-center space-y-8">
                 {isFortuneLoading ? (
                   <div className="space-y-10 py-10">
                      <div className="relative mx-auto w-24 h-24">
                        <Loader2 size={96} className="text-rose-400 animate-spin" />
                        <Sparkles size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-400 animate-pulse" />
                      </div>
                      <p className="text-rose-400 font-black italic tracking-widest animate-pulse">彩虹巫女祈福中...</p>
                   </div>
                 ) : (
                   <div className="space-y-8 animate-in fade-in duration-700">
                      <div className="w-20 h-20 rounded-[2rem] bg-rose-50 flex items-center justify-center text-rose-500 mx-auto shadow-inner"><Star size={40} className="fill-current animate-spin-slow" /></div>
                      <div className="space-y-4">
                         <h3 className="text-3xl font-black text-gray-800 italic tracking-tighter">今日彩虹御神籤</h3>
                         <div className="bg-gradient-to-br from-rose-50 to-amber-50 p-7 rounded-[2.5rem] border-2 border-dashed border-rose-300 shadow-inner">
                            <p className="text-lg font-black text-rose-900 leading-relaxed italic">{fortune}</p>
                         </div>
                      </div>
                      <button onClick={closeFortuneModal} className="w-full py-5 bg-rose-500 text-white rounded-[2rem] font-black shadow-xl active:scale-95 transition-all text-xl border-b-8 border-rose-800/30">收下好運氣</button>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {showReminder && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in">
           <div className="bg-white w-full max-w-sm rounded-[3.5rem] p-1 shadow-2xl border-4 border-white relative overflow-hidden animate-in zoom-in-95">
              <div className="absolute top-0 left-0 w-full h-3 rainbow-bg opacity-40"></div>
              <div className="p-8 text-center space-y-8">
                 <div className="w-24 h-24 rounded-[2.5rem] bg-rose-50 flex items-center justify-center text-rose-500 mx-auto shadow-inner animate-bounce"><Plane size={48} /></div>
                 <div className="space-y-4">
                    <h3 className="text-3xl font-black text-gray-800 italic tracking-tighter">Hoya 團隊集合！</h3>
                    <div className="bg-rose-50/50 p-6 rounded-[2.5rem] border-2 border-dashed border-rose-500 shadow-inner">
                       <p className="text-2xl font-black text-red-600 leading-tight italic">2/28 22:30<br/><span className="text-xl">桃園機場第一航廈集合</span></p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <button onClick={() => {setShowReminder(false); setIsOverlayOpen(showAnnouncement);}} className="w-full py-5 bg-rose-500 text-white rounded-[2rem] font-black shadow-xl active:scale-95 transition-all text-xl border-b-8 border-rose-800/30">收到！</button>
                    <button onClick={() => {localStorage.setItem('hoya_trip_reminder_dismissed', 'true'); setShowReminder(false); setIsOverlayOpen(showAnnouncement);}} className="w-full py-3 text-gray-300 font-bold text-[10px] uppercase tracking-[0.3em]">不要再出現</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {!isOverlayOpen && (
        <header className="pt-10 pb-6 px-4 text-center relative z-10">
          <div className="flex items-center justify-center gap-5 mb-10 px-2">
             <button onClick={() => { setShowSettings(true); setIsOverlayOpen(true); }} className="p-2.5 bg-white rounded-full shadow-lg text-rose-400 border border-rose-50 active:scale-90 transition-all flex-shrink-0">
                <Settings size={22} />
             </button>
             <div className="flex items-center gap-3">
                <h1 className="text-6xl font-cute-title font-black rainbow-text leading-none tracking-tighter drop-shadow-sm px-2 py-1">HOYA</h1>
                <div className="flex flex-col items-start pt-1">
                   <span className="text-2xl font-cute-title font-black text-rose-300 italic leading-none">Tokyo</span>
                   <span className="text-xl font-cute-title font-black text-rose-200 italic leading-none -mt-1">2026</span>
                </div>
             </div>
             <span className="text-4xl animate-bounce flex-shrink-0">🌈</span>
          </div>

          <div className="grid grid-cols-6 gap-y-6 gap-x-2 mb-8 px-2 py-1 relative">
            {TEAM_MEMBERS.map((name, idx) => (
              <div key={name} className="flex flex-col items-center gap-1.5 relative">
                <MemberAvatar 
                  name={name} 
                  index={idx} 
                  size="w-14 h-14" 
                  className="cursor-pointer" 
                  currentStatus={teamStatus[name]} 
                  customPhoto={memberProfiles[name]?.photo} 
                  title={memberProfiles[name]?.title}
                  onOpenStatusMenu={() => { setStatusMenuTarget(name); setIsOverlayOpen(true); }} 
                />
                <span className="text-[9px] font-black uppercase tracking-tighter text-gray-400 bg-gray-50/80 px-1.5 py-0.5 rounded-full">{name}</span>
              </div>
            ))}
          </div>

          {activeTab === 'itinerary' && (
            <div className="space-y-4 mb-6">
              <div className="bg-white/80 rounded-[3rem] p-5 inline-block w-full border-2 border-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full rainbow-bg opacity-30"></div>
                <p className="text-[12px] text-rose-600 font-black mb-2 uppercase tracking-[0.3em] flex items-center justify-center gap-2"><Heart size={12} fill="currentColor" /> 出發倒數計時 <Heart size={12} fill="currentColor" /></p>
                <div className="flex justify-center items-start gap-1 text-gray-800 font-black py-2">
                  <div className="flex flex-col items-center min-w-[3.8rem]">
                    <span className="text-4xl leading-none">{timeLeft.days}</span>
                    <span className="text-[10px] text-rose-400 mt-1.5 uppercase tracking-widest font-black">Days</span>
                  </div>
                  <span className="text-2xl text-rose-200 mt-1">:</span>
                  <div className="flex flex-col items-center min-w-[3.8rem]">
                    <span className="text-4xl leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-[10px] text-rose-400 mt-1.5 uppercase tracking-widest font-black">Hrs</span>
                  </div>
                  <span className="text-2xl text-rose-200 mt-1">:</span>
                  <div className="flex flex-col items-center min-w-[3.8rem]">
                    <span className="text-4xl leading-none">{String(timeLeft.mins).padStart(2, '0')}</span>
                    <span className="text-[10px] text-rose-400 mt-1.5 uppercase tracking-widest font-black">Mins</span>
                  </div>
                  <span className="text-2xl text-rose-200 mt-1">:</span>
                  <div className="flex flex-col items-center min-w-[3.8rem]">
                    <span className="text-4xl leading-none">{String(timeLeft.secs).padStart(2, '0')}</span>
                    <span className="text-[10px] text-rose-400 mt-1.5 uppercase tracking-widest font-black">Secs</span>
                  </div>
                </div>
              </div>
              
              <button onClick={handleDrawFortune} className="w-full py-5 bg-gradient-to-r from-rose-400 via-amber-400 to-rose-400 bg-[length:200%_100%] animate-gradient-x text-white rounded-[2.5rem] font-black shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-all border-b-8 border-rose-800/20">
                <Wand2 size={24} className="animate-bounce" />
                <span className="text-base tracking-widest">每日彩虹御神籤</span>
                <Sparkles size={22} className="animate-pulse" />
              </button>
            </div>
          )}
        </header>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-6 bg-white animate-in slide-in-from-bottom duration-500 overflow-hidden">
           <div className="w-full h-full flex flex-col max-w-md mx-auto relative pt-14 px-7 pb-10 overflow-y-auto scrollbar-hide">
              <button onClick={() => { setShowSettings(false); setSettingsStep('select'); setIsOverlayOpen(false); }} className="fixed top-6 right-6 p-2 bg-gray-100 text-gray-400 rounded-full z-[4100] hover:bg-gray-200 transition-colors"><X size={24} /></button>
              <div className="space-y-6">
                <h3 className="text-3xl font-black text-gray-800 italic flex items-center gap-3"><Fingerprint className="text-rose-400" size={32} /> 彩虹身分證</h3>
                {settingsStep === 'select' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-3 gap-4 py-4">
                      {TEAM_MEMBERS.map((name, idx) => (
                        <button key={name} onClick={() => { setTargetMember(name); setSettingsStep('auth'); setPinInput(''); }} className="flex flex-col items-center gap-2 p-3 rounded-[2rem] border-2 bg-white border-rose-50 shadow-md active:scale-95 hover:border-rose-200 transition-all">
                          <MemberBadge name={name} isSelected={true} size="w-12 h-12" customPhoto={memberProfiles[name]?.photo} />
                          <span className="text-[10px] font-black text-gray-700 uppercase">{name}</span>
                        </button>
                      ))}
                    </div>
                    <div className="pt-6 border-t border-rose-50 flex flex-col items-center">
                       <button onClick={() => setSettingsStep('admin-auth')} className="flex items-center gap-2 px-8 py-3 bg-amber-400 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95"><ShieldAlert size={14} /> 管理員控制中心</button>
                    </div>
                  </div>
                )}
                {settingsStep === 'admin-auth' && (
                   <div className="flex flex-col items-center gap-8 py-10 animate-in zoom-in">
                      <div className="w-24 h-24 rounded-[2.5rem] bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner"><KeyRound size={48} /></div>
                      <h4 className="text-3xl font-black text-gray-800 italic text-center">控制中心驗證</h4>
                      <input type="password" maxLength={4} value={adminPinInput} autoFocus onChange={(e) => setAdminPinInput(e.target.value.replace(/\D/g, ''))} placeholder="••••" className={`w-full bg-amber-50 border-4 rounded-3xl p-6 text-center text-5xl font-black outline-none tracking-[0.5em] shadow-inner ${pinError ? 'border-red-400 text-red-500 animate-shake' : 'border-amber-100 focus:border-amber-400'}`} />
                      <div className="flex gap-4 w-full">
                         <button onClick={() => setSettingsStep('select')} className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-3xl font-black text-xs uppercase active:scale-95">返回</button>
                         <button onClick={handleAdminAuth} className="flex-[2] py-5 bg-amber-500 text-white rounded-3xl font-black text-xs uppercase shadow-xl active:scale-95 border-b-4 border-amber-700">進入中心</button>
                      </div>
                   </div>
                )}
                {settingsStep === 'admin' && (
                  <div className="space-y-8 animate-in slide-in-from-right pb-20">
                    <div className="flex items-center justify-between bg-amber-50 p-4 rounded-3xl border border-amber-100">
                       <h4 className="text-xl font-black text-amber-600 italic flex items-center gap-2"><ShieldCheck size={24} /> 管理控制台</h4>
                       <button onClick={() => setSettingsStep('select')} className="text-[10px] font-black text-amber-500 bg-white px-3 py-1.5 rounded-full border border-amber-200 shadow-sm uppercase tracking-widest">返回</button>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-amber-50 rounded-[2.5rem] p-6 border-2 border-amber-200 shadow-inner space-y-4">
                         <div className="flex items-center gap-2 text-amber-700 font-black italic"><Megaphone size={18} /><span>全團同步公告發布</span></div>
                         
                         {activeAnnouncement && activeAnnouncement.text && (
                           <div className="bg-white p-4 rounded-2xl border-2 border-amber-400 shadow-md animate-in slide-in-from-top duration-300">
                              <div className="flex justify-between items-start mb-2">
                                 <span className="text-[9px] font-black text-amber-500 uppercase bg-amber-50 px-2 py-0.5 rounded-full">當前公告 Active</span>
                                 <button onClick={() => setShowCancelConfirm(true)} className="text-[9px] font-black text-red-500 flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"><Trash2 size={10} /> 撤回公告</button>
                              </div>
                              <p className="text-sm font-bold text-gray-700 leading-relaxed italic">"{activeAnnouncement.text}"</p>
                           </div>
                         )}

                         <textarea value={announcementText} onChange={(e) => setAnnouncementText(e.target.value)} placeholder="輸入新公告內容..." className="w-full h-24 bg-white border-2 border-amber-100 rounded-2xl p-4 text-sm font-bold text-gray-700 outline-none focus:border-amber-400 resize-none shadow-sm" />
                         <button onClick={() => publishAnnouncement()} disabled={isPublishing || !announcementText.trim()} className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 transition-all">{isPublishing ? <Loader2 className="animate-spin" /> : <><BellRing size={16} /> 發布並彈窗</>}</button>
                      </div>

                      {showCancelConfirm && (
                        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                           <div className="bg-white w-full max-w-xs rounded-[3rem] p-8 shadow-2xl border-4 border-amber-100 text-center space-y-6 animate-in zoom-in-95 duration-200">
                              <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full mx-auto flex items-center justify-center shadow-inner animate-bounce">
                                 <AlertCircle size={32} />
                              </div>
                              <div className="space-y-2">
                                 <h3 className="text-2xl font-black text-gray-800 italic tracking-tighter">確定要撤回？</h3>
                                 <p className="text-xs font-bold text-gray-400 leading-relaxed">這將立即讓所有團員手機上的<br/>「重要公告彈窗」消失。</p>
                              </div>
                              <div className="flex flex-col gap-3 pt-2">
                                 <button onClick={handleCancelAnnouncement} disabled={isPublishing} className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 border-b-4 border-amber-700 flex items-center justify-center gap-2">
                                    {isPublishing ? <Loader2 className="animate-spin" size={14} /> : <><Trash2 size={14} /> 確定撤回</>}
                                 </button>
                                 <button onClick={() => setShowCancelConfirm(false)} className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 flex items-center justify-center gap-2">
                                    <ArrowLeft size={14} /> 我再想想
                                 </button>
                              </div>
                           </div>
                        </div>
                      )}

                      <div className="space-y-3">
                         <h5 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] px-2 flex items-center gap-2"><History size={12} /> 過去發布過的公告 (最近5則)</h5>
                         <div className="space-y-2">
                            {announcementHistory.length === 0 ? (
                              <div className="text-center py-6 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                 <p className="text-[10px] font-bold text-gray-400">目前尚無歷史紀錄</p>
                              </div>
                            ) : (
                              announcementHistory.map((item, idx) => (
                                <div key={item.id || idx} className="bg-white p-4 rounded-3xl border border-amber-50 shadow-sm flex flex-col gap-3 group transition-all hover:border-amber-200">
                                   <p className="text-xs font-bold text-gray-600 leading-relaxed">{item.text}</p>
                                   <div className="flex justify-between items-center border-t border-gray-50 pt-2">
                                      <span className="text-[8px] font-bold text-gray-300">{new Date(item.timestamp).toLocaleString()}</span>
                                      <div className="flex gap-2">
                                         <button onClick={() => deleteHistoryItem(item)} className="p-2 text-gray-300 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                                         <button onClick={() => publishAnnouncement(item.text)} className="flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all"><RotateCcw size={10} /> 再次發布</button>
                                      </div>
                                   </div>
                                </div>
                              ))
                            )}
                         </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                       <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] px-2">團員帳號管理</p>
                       {TEAM_MEMBERS.map((name, idx) => {
                         const profile = memberProfiles[name];
                         const pinSet = profile?.isLocked === true;
                         const photoSet = profile?.photoLocked === true;
                         
                         return (
                           <div key={name} className="bg-white p-4 rounded-[2.5rem] border border-amber-50 shadow-md flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <MemberAvatar name={name} index={idx} size="w-10 h-10" customPhoto={profile?.photo} onOpenStatusMenu={()=>{}} disablePop />
                                <div className="flex flex-col">
                                  <span className="text-base font-black text-gray-700">{name}</span>
                                  <div className="flex gap-1.5 mt-1">
                                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black border uppercase tracking-tighter ${pinSet ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                      <Key size={8} /> {pinSet ? 'PIN 已設' : '未設 PIN'}
                                    </div>
                                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black border uppercase tracking-tighter ${photoSet ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-500 border-blue-100'}`}>
                                      <ImageIcon size={8} /> {photoSet ? '照片鎖定' : '未鎖定'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                 <button onClick={() => unlockPhoto(name)} disabled={isAdminActionLoading === `${name}-photo`} className="p-3 bg-blue-50 text-blue-500 rounded-2xl border border-blue-100 active:scale-90 transition-all shadow-sm">
                                   {isAdminActionLoading === `${name}-photo` ? <Loader2 className="animate-spin" size={16} /> : <Unlock size={16} />}
                                 </button>
                                 <button onClick={() => resetMemberPin(name)} disabled={isAdminActionLoading === `${name}-pin`} className="p-3 bg-red-50 text-red-500 rounded-2xl border border-red-100 active:scale-90 transition-all shadow-sm">
                                   {isAdminActionLoading === `${name}-pin` ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                 </button>
                              </div>
                           </div>
                         );
                       })}
                    </div>

                    {/* 系統全域設定區：移動至最底部 */}
                    <div className="space-y-6 pt-10 border-t border-amber-50 pb-20">
                      <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] px-2">成就系統控制區</p>
                      
                      {/* 時間控制項 */}
                      <div className="bg-white rounded-[2.5rem] p-6 border-2 border-rose-100 shadow-lg space-y-6">
                         <div className="space-y-4">
                            <div className="flex flex-col gap-1">
                               <div className="flex items-center gap-2 text-rose-500 font-black text-xs uppercase italic">
                                  <Clock size={14} /> 彩虹啟程時間
                               </div>
                               <input 
                                 type="datetime-local" 
                                 value={dynamicTripStart} 
                                 onChange={(e) => updateConfig('tripStartDate', e.target.value)} 
                                 className="w-full bg-rose-50 border border-rose-100 rounded-2xl p-4 text-sm font-black text-gray-700 outline-none focus:border-rose-400"
                               />
                               <p className="text-[9px] text-gray-400 italic px-1">影響「彩虹啟程」勳章點亮與首頁倒數。</p>
                            </div>
                            <div className="flex flex-col gap-1">
                               <div className="flex items-center gap-2 text-rose-500 font-black text-xs uppercase italic">
                                  <Clock size={14} /> 東京大圓滿時間
                               </div>
                               <input 
                                 type="datetime-local" 
                                 value={dynamicTripEnd} 
                                 onChange={(e) => updateConfig('tripEndDate', e.target.value)} 
                                 className="w-full bg-rose-50 border border-rose-100 rounded-2xl p-4 text-sm font-black text-gray-700 outline-none focus:border-rose-400"
                               />
                               <p className="text-[9px] text-gray-400 italic px-1">影響「東京大圓滿」勳章點亮與進度條計算。</p>
                            </div>
                         </div>
                      </div>

                      {/* 預覽慶祝動畫按鈕 */}
                      <button 
                         onClick={triggerFullCelebration}
                         className="w-full py-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-[2rem] font-black italic flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all border-b-8 border-indigo-900/30"
                      >
                         <PartyPopper size={24} className="animate-bounce" />
                         <span className="text-lg tracking-tighter">🎆 立即預覽全成就動畫</span>
                      </button>

                      {/* 正式開關 */}
                      <div className="bg-white rounded-[2.5rem] p-6 border-2 border-rose-100 shadow-lg space-y-4">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-rose-600 font-black italic">
                               <Sparkles size={18} />
                               <span>正式成就慶祝按鈕開關</span>
                            </div>
                            <button 
                               onClick={toggleCelebration}
                               disabled={isAdminActionLoading === 'isCelebrationEnabled'}
                               className={`p-1 rounded-full transition-all duration-300 ${isCelebrationEnabled ? 'bg-rose-500' : 'bg-gray-200'}`}
                            >
                               {isCelebrationEnabled ? <ToggleRight size={32} className="text-white" /> : <ToggleLeft size={32} className="text-gray-400" />}
                            </button>
                         </div>
                         <p className="text-[10px] font-bold text-gray-400 leading-relaxed italic border-t border-rose-50 pt-2">
                           開啟後，當團隊達成 10 個勳章時，系統底部會出現「解鎖驚喜」按鈕。
                         </p>
                      </div>
                    </div>
                  </div>
                )}
                {settingsStep === 'auth' && (
                   <div className="flex flex-col items-center gap-8 py-10">
                      <Lock size={48} className="text-rose-400" />
                      <h4 className="text-2xl font-black text-gray-800 italic">{targetMember}，是你嗎？</h4>
                      <input type="password" maxLength={4} value={pinInput} autoFocus onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))} placeholder="••••" className={`w-full bg-gray-50 border-2 rounded-3xl p-5 text-center text-4xl font-black outline-none tracking-[0.5em] ${pinError ? 'border-red-400 text-red-500 animate-shake' : 'border-rose-100'}`} />
                      <div className="flex gap-4 w-full">
                         <button onClick={() => setSettingsStep('select')} className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-xs active:scale-95">返回</button>
                         <button onClick={handleAuth} disabled={pinInput.length !== 4} className="flex-[2] py-4 bg-rose-500 text-white rounded-2xl font-black text-xs shadow-lg active:scale-95">驗證</button>
                      </div>
                   </div>
                )}
                {settingsStep === 'edit' && (
                  <div className="space-y-10 pb-10">
                    <div className="flex flex-col items-center gap-6">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full border-4 border-rose-100 overflow-hidden bg-gray-50 shadow-2xl">
                          {editPhoto ? <img src={editPhoto} className="w-full h-full object-cover" /> : <UserCircle size={64} className="text-gray-300" />}
                        </div>
                        <button 
                          onClick={() => fileInputRef.current?.click()} 
                          className="absolute bottom-0 right-0 w-12 h-12 bg-rose-500 text-white rounded-full border-[3px] border-white flex items-center justify-center shadow-xl active:scale-90 transition-all hover:bg-rose-600"
                        >
                          <Camera size={20} />
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => {
                          const file = e.target.files?.[0]; if (!file) return;
                          const reader = new FileReader(); reader.onload = (ev) => {
                            const img = new Image(); img.onload = () => {
                              const canvas = document.createElement('canvas'); const MAX = 400; let w = img.width, h = img.height;
                              if (w > h) { if (w > MAX) { h *= MAX/w; w = MAX; } } else { if (h > MAX) { w *= MAX/h; h = MAX; } }
                              canvas.width = w; canvas.height = h; const ctx = canvas.getContext('2d'); ctx?.drawImage(img, 0, 0, w, h);
                              setEditPhoto(canvas.toDataURL('image/jpeg', 0.8));
                            }; img.src = ev.target?.result as string;
                          }; reader.readAsDataURL(file);
                        }} className="hidden" />
                      </div>
                    </div>
                    <div className="space-y-6">
                       <div><label className="text-[10px] font-black text-rose-300 uppercase tracking-widest px-1">稱號 Title</label><input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-black text-gray-700 outline-none focus:border-rose-300 transition-all" /></div>
                       <div><label className="text-[10px] font-black text-rose-300 uppercase tracking-widest px-1">安全碼 PIN</label><input type="password" maxLength={4} value={editPin} onChange={(e) => setEditPin(e.target.value.replace(/\D/g, ''))} className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-black text-gray-700 tracking-[0.5em] text-center outline-none focus:border-rose-300 transition-all" /></div>
                       <button onClick={saveProfile} disabled={isSavingProfile} className="w-full py-6 bg-rose-500 text-white rounded-3xl font-black shadow-xl active:scale-95 flex items-center justify-center">{isSavingProfile ? <Loader2 className="animate-spin" /> : '儲存同步'}</button>
                    </div>
                  </div>
                )}
              </div>
           </div>
        </div>
      )}

      <main className="p-5 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">{renderContent()}</main>

      {!isOverlayOpen && (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[96%] max-md bg-white/90 backdrop-blur-2xl border border-white rounded-[2.8rem] shadow-2xl z-[5000] p-1.5 animate-in slide-in-from-bottom-10 duration-500">
          <ul className="flex justify-between items-center h-16 px-1 overflow-x-auto scrollbar-hide">
            {[ 
              { id: 'wallet', label: '錢包', icon: '💰', color: '#FF8A8A' }, 
              { id: 'checklist', label: '行李', icon: '🧳', color: '#FFB347' }, 
              { id: 'booking', label: '預訂', icon: '🎫', color: '#FBC02D' }, 
              { id: 'itinerary', label: '行程', icon: '📅', color: '#81C784' }, 
              { id: 'mission', label: '挑戰', icon: '🏆', color: '#4DD0E1' }, 
              { id: 'raffle', label: '抽籤', icon: '✨', color: '#7986CB' }, 
              { id: 'game', label: '遊戲', icon: '🥂', color: '#F06292' }
            ].map((item) => (
              <li key={item.id} className="flex-1 min-w-[50px]">
                <button onClick={() => setActiveTab(item.id as TabType)} className={`w-full h-full flex flex-col items-center justify-center gap-0.5 transition-all duration-300 rounded-[1.8rem] py-1 ${activeTab === item.id ? 'scale-105 shadow-inner bg-opacity-20' : 'text-gray-400'}`} style={{ backgroundColor: activeTab === item.id ? `${item.color}33` : 'transparent' }}>
                  <div className="text-xl leading-none">{item.icon}</div>
                  <span className={`text-[8px] font-black tracking-tighter ${activeTab === item.id ? 'text-gray-800' : 'text-gray-400'}`}>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <style>{`
        .animate-shake { animation: shake 0.2s ease-in-out infinite; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x { animation: gradient-x 3s linear infinite; }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes firework {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(40); opacity: 0; }
        }
        .animate-firework {
          width: 4px; height: 4px; border-radius: 50%;
          animation: firework 2s ease-out infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-30px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(12deg) scale(1); }
          50% { transform: rotate(-12deg) scale(1.2); }
        }
        .animate-wiggle {
          animation: wiggle 1s ease-in-out infinite;
        }
        @keyframes fall-sakura {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        .animate-fall-sakura {
          animation: fall-sakura linear infinite;
        }
      `}</style>
    </div>
  );
};

export default App;