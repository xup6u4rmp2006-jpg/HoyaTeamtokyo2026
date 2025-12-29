import React, { useState, useEffect, useRef } from 'react';
import { TEAM_MEMBERS, PRIDE_COLORS, MEMBER_PHOTOS } from '../constants';
import { Plus, Trash2, CheckCircle2, Circle, Loader2, Luggage, StickyNote, User, Lock, Unlock, ShieldCheck, X } from 'lucide-react';
import { db } from '../services/firebase';
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";

interface BaggageItem {
  id: string;
  text: string;
  checked: boolean;
}

const INITIAL_BAGGAGE: string[] = [
  '護照正本', '日幣/台幣現金', '駕照譯本', '行動電源', '充電線/頭', '牙刷/盥洗用品', '換洗衣物', '厚外套/羽絨', '雨傘/雨衣', '個人藥品', '隱形眼鏡/藥水', '太陽眼鏡'
];

const MemberBadge: React.FC<{ name: string; size?: string; className?: string; isLocked?: boolean; customPhoto?: string }> = ({ name, size = "w-11 h-11", className = "", isLocked = false, customPhoto }) => {
  const index = TEAM_MEMBERS.indexOf(name);
  const bgColor = PRIDE_COLORS[index !== -1 ? index % PRIDE_COLORS.length : 0];
  const photoUrl = customPhoto || MEMBER_PHOTOS[name];

  return (
    <div className={`relative flex-shrink-0 aspect-square rounded-full transition-all duration-300 ${size} ${className}`}>
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

const Checklist: React.FC = () => {
  const [selectedMember, setSelectedMember] = useState<string>(TEAM_MEMBERS[0]);
  const [allMemberBaggage, setAllMemberBaggage] = useState<Record<string, BaggageItem[]>>({});
  const [memberPins, setMemberPins] = useState<Record<string, string>>({});
  const [memberProfiles, setMemberProfiles] = useState<Record<string, any>>({});
  const [memo, setMemo] = useState('');
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubBaggage = onSnapshot(doc(db, "travelData", "baggage_v3"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAllMemberBaggage(data.memberBaggage || {});
        setMemberPins(data.memberPins || {});
        setMemo(data.memo || '');
      } else {
        const initialData: Record<string, BaggageItem[]> = {};
        TEAM_MEMBERS.forEach(m => {
          initialData[m] = INITIAL_BAGGAGE.map(text => ({
            id: Math.random().toString(36).substr(2, 9),
            text,
            checked: false
          }));
        });
        setDoc(doc(db, "travelData", "baggage_v3"), { 
          memberBaggage: initialData, 
          memberPins: {},
          memo: '' 
        });
        setAllMemberBaggage(initialData);
      }
      setLoading(false);
    });

    const unsubProfiles = onSnapshot(doc(db, "travelData", "memberProfiles"), (docSnap) => {
      if (docSnap.exists()) setMemberProfiles(docSnap.data());
    });

    return () => { unsubBaggage(); unsubProfiles(); };
  }, []);

  useEffect(() => {
    const verifiedMember = localStorage.getItem(`hoya_verified_${selectedMember}`);
    if (verifiedMember === 'true') {
      setIsUnlocked(true);
    } else {
      setIsUnlocked(!memberPins[selectedMember]);
    }
    setPinInput('');
    setPinError(false);
  }, [selectedMember, memberPins]);

  const saveToFirebase = async (data: any) => {
    await updateDoc(doc(db, "travelData", "baggage_v3"), data);
  };

  const handleMemberSelect = (name: string) => {
    setSelectedMember(name);
  };

  const verifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = memberPins[selectedMember];
    
    if (pinInput === correctPin) {
      localStorage.setItem(`hoya_verified_${selectedMember}`, 'true');
      setIsUnlocked(true);
      setShowPinModal(false);
      setPinError(false);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 500);
    }
  };

  const currentItems = allMemberBaggage[selectedMember] || [];

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim() || !isUnlocked) return;
    
    const newEntry: BaggageItem = { 
      id: Date.now().toString(), 
      text: newItem,
      checked: false 
    };
    
    const updatedMemberItems = [...currentItems, newEntry];
    const updatedAllBaggage = { ...allMemberBaggage, [selectedMember]: updatedMemberItems };
    
    setAllMemberBaggage(updatedAllBaggage);
    await saveToFirebase({ memberBaggage: updatedAllBaggage });
    setNewItem('');
  };

  const deleteItem = async (id: string) => {
    if (!isUnlocked) return;
    const updatedMemberItems = currentItems.filter(i => i.id !== id);
    const updatedAllBaggage = { ...allMemberBaggage, [selectedMember]: updatedMemberItems };
    setAllMemberBaggage(updatedAllBaggage);
    await saveToFirebase({ memberBaggage: updatedAllBaggage });
  };

  const toggleItemStatus = async (itemId: string) => {
    if (!isUnlocked) return;
    const updatedMemberItems = currentItems.map(item => 
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    const updatedAllBaggage = { ...allMemberBaggage, [selectedMember]: updatedMemberItems };
    setAllMemberBaggage(updatedAllBaggage);
    await saveToFirebase({ memberBaggage: updatedAllBaggage });
  };

  const handleMemoChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMemo = e.target.value;
    setMemo(newMemo);
    await saveToFirebase({ memo: newMemo });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-rose-300">
      <Loader2 className="animate-spin mb-4" size={48} />
      <p className="font-black animate-pulse uppercase tracking-widest text-xs">隱私傳輸中...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white/70 backdrop-blur-md rounded-[2.8rem] p-5 border border-amber-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 mb-2 px-2"><User size={16} className="text-amber-500" /><span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">請選擇你的名字：</span></div>
        <div ref={scrollRef} className="flex gap-6 overflow-x-auto scrollbar-hide py-4 px-2">
          {TEAM_MEMBERS.map((name) => {
            const isSelected = selectedMember === name;
            const hasPin = !!memberPins[name];
            return (
              <button key={name} onClick={() => handleMemberSelect(name)} className={`flex-shrink-0 flex flex-col items-center gap-2.5 transition-all duration-300 ${isSelected ? 'scale-110' : 'opacity-40 grayscale'}`}>
                <MemberBadge name={name} isLocked={hasPin} customPhoto={memberProfiles[name]?.photo} className={isSelected ? 'ring-[4px] ring-amber-400 ring-offset-[3px] ring-offset-white' : 'ring-2 ring-transparent'} />
                <span className={`text-[10px] font-black uppercase tracking-tighter ${isSelected ? 'text-amber-600' : 'text-gray-400'}`}>{name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {!isUnlocked ? (
        <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-amber-50 flex flex-col items-center text-center gap-6 animate-in zoom-in duration-300">
           <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center text-amber-400 shadow-inner"><Lock size={40} /></div>
           <div className="space-y-2">
             <h3 className="text-xl font-black text-gray-800 italic">{selectedMember} 的行李清單</h3>
             <p className="text-xs font-bold text-gray-400">本清單已受隱私保護，請解鎖後查看。</p>
             <p className="text-[9px] font-medium text-amber-400 mt-2">※ 若尚未設定密碼，請點擊左上角「設定」按鈕設定「彩虹身分證 PIN 碼」。</p>
           </div>
           <button onClick={() => { setShowPinModal(true); }} className="px-10 py-4 bg-amber-500 text-white rounded-full font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-all">輸入 PIN 碼解鎖</button>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] px-1 py-8 shadow-sm border border-amber-50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-amber-100 opacity-40"></div>
          
          <div className="flex justify-between items-end mb-8 px-4">
            <div>
              <div className="flex items-center gap-2 mb-1"><h2 className="text-3xl font-black text-amber-500 italic">行李清單</h2><Unlock size={18} className="text-amber-300" /></div>
              <p className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">{selectedMember} 的專屬清單</p>
            </div>
            <div className="bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 flex items-center gap-2"><span className="text-[10px] font-black text-amber-500">{currentItems.filter(i => i.checked).length} / {currentItems.length}</span></div>
          </div>
          
          <form onSubmit={addItem} className="flex gap-2 mb-8 items-center px-4">
            <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="新增項目..." className="flex-1 px-5 py-4 bg-yellow-50/30 rounded-2xl border-2 border-yellow-100 focus:border-amber-400 outline-none transition-all text-base font-bold shadow-inner min-w-0" />
            <button type="submit" className="w-14 h-14 flex-shrink-0 bg-amber-400 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all hover:bg-amber-500"><Plus size={28} strokeWidth={3} /></button>
          </form>

          {/* 強制雙欄顯示 */}
          <div className="grid grid-cols-2 gap-2 px-4">
            {currentItems.map(item => (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => toggleItemStatus(item.id)}
                  className={`w-full h-full flex items-center gap-2 px-3 py-4 rounded-[1.5rem] transition-all border-2 text-left min-h-[70px] relative overflow-hidden ${
                    item.checked 
                      ? 'bg-amber-50/40 text-amber-700 border-amber-200 scale-95 opacity-60' 
                      : 'bg-white border-yellow-50 shadow-md active:scale-[1.02] hover:border-amber-200'
                  }`}
                >
                  <div className="flex-shrink-0 z-10">
                    {item.checked ? <CheckCircle2 className="text-amber-500" size={18} /> : <Circle className="text-yellow-200" size={18} />}
                  </div>
                  <span className={`text-[14px] font-black leading-tight break-words z-10 flex-1 ${item.checked ? 'line-through opacity-50' : 'text-gray-700'}`}>
                    {item.text}
                  </span>
                </button>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }} 
                  className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-rose-400 text-white rounded-full flex items-center justify-center shadow-lg scale-0 group-hover:scale-100 transition-transform active:scale-125 z-20 border-2 border-white"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>
          
          {currentItems.length === 0 && (
            <div className="py-16 text-center text-amber-200 flex flex-col items-center gap-4 opacity-40"><Luggage size={64} strokeWidth={1} /><p className="text-sm font-black italic tracking-widest uppercase">List is empty.</p></div>
          )}
        </div>
      )}

      <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-rose-50 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 rainbow-bg opacity-30"></div>
        <div className="mb-6 px-1">
          <h2 className="text-2xl font-black text-rose-400 italic flex items-center gap-3">共有備忘錄</h2>
          <p className="text-[10px] font-bold text-rose-300 uppercase tracking-widest mt-0.5">全團同步共享筆記</p>
        </div>
        <div className="relative">
          <textarea value={memo} onChange={handleMemoChange} placeholder="在這裡寫下大家的旅遊靈感、集合地點或代購清單..." className="w-full h-48 p-7 bg-rose-50/20 rounded-[2.5rem] border-2 border-rose-100 focus:border-rose-400 outline-none resize-none text-sm leading-relaxed font-bold text-gray-600 shadow-inner" />
          <div className="absolute bottom-6 right-6 text-rose-200"><StickyNote size={24} /></div>
        </div>
      </div>
      
      <div className="p-8 bg-amber-50/50 rounded-[2.5rem] border border-amber-100 text-center mx-2">
        <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-2 flex items-center justify-center gap-2"><ShieldCheck size={14} /> 隱私保護中</p>
        <p className="text-[9px] font-bold text-amber-400/80 leading-relaxed italic px-4">個人清單與「彩虹身分證」PIN 碼綁定。設定一次即可同步解鎖所有隱私功能。</p>
      </div>

      {showPinModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-white animate-in fade-in duration-300">
           <div className={`bg-white w-full max-w-xs rounded-[3rem] p-8 shadow-2xl border-4 border-amber-100 transition-transform ${pinError ? 'animate-shake' : ''}`}>
              <div className="flex flex-col items-center text-center gap-5">
                 <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner"><Lock size={32} /></div>
                 <div className="space-y-1"><h3 className="text-xl font-black text-gray-800 tracking-tight italic">輸入解鎖碼</h3><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">正在驗證 {selectedMember} 的身分</p></div>
                 <form onSubmit={verifyPin} className="w-full space-y-5">
                    <input type="password" maxLength={4} inputMode="numeric" value={pinInput} onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))} placeholder="****" autoFocus className={`w-full bg-amber-50/30 border-2 rounded-2xl p-4 text-center text-3xl font-black outline-none transition-all tracking-[0.5em] ${pinError ? 'border-red-400 text-red-500' : 'border-amber-100 focus:border-amber-400 text-gray-700'}`} />
                    <div className="flex gap-3"><button type="button" onClick={() => setShowPinModal(false)} className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-[11px] uppercase tracking-widest">取消</button><button type="submit" disabled={pinInput.length !== 4} className="flex-[2] py-4 bg-amber-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-50">確認解鎖</button></div>
                 </form>
              </div>
           </div>
        </div>
      )}
      <style>{`.animate-shake { animation: shake 0.2s ease-in-out infinite; } @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } } .scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default Checklist;