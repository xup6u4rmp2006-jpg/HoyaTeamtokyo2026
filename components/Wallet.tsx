import React, { useState, useEffect, useRef } from 'react';
import { TEAM_MEMBERS, PRIDE_COLORS, MEMBER_PHOTOS } from '../constants';
import { Expense } from '../types';
import { Plus, Calculator, Trash2, Receipt, CreditCard, Loader2, User, Lock, Unlock, ShieldCheck, UserCheck, Wallet as WalletIcon, Settings2, Check, X, Users, CheckCircle2, TrendingDown, Landmark, PiggyBank, History, Coins, DollarSign, ShoppingCart, AlertCircle, ArrowLeft } from 'lucide-react';
import { db } from '../services/firebase';
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";

interface PersonalExpense { id: string; description: string; amount: number; date: any; }
interface FundExpense { id: string; description: string; amount: number; unit: 'JPY' | 'TWD'; date: any; }

const MemberBadge: React.FC<{ name: string; size?: string; className?: string; isLocked?: boolean; customPhoto?: string; isSelected?: boolean; showCheck?: boolean }> = ({ name, size = "w-10 h-10", className = "", isLocked = false, customPhoto, isSelected = true, showCheck = false }) => {
  const index = TEAM_MEMBERS.indexOf(name);
  const bgColor = PRIDE_COLORS[index !== -1 ? index % PRIDE_COLORS.length : 0];
  const photoUrl = customPhoto || MEMBER_PHOTOS[name];
  return (
    <div className={`relative flex-shrink-0 rounded-full transition-all duration-300 ${size} ${className} ${!isSelected ? 'grayscale opacity-40 scale-90' : 'scale-100'}`}>
      {photoUrl ? (
        <div className="w-full h-full rounded-full border-2 border-white shadow-sm overflow-hidden bg-white">
          <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className={`w-full h-full rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white font-black uppercase text-xs ${bgColor}`}>
          {name[0]}
        </div>
      )}
      {isLocked && <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-1 shadow-md border border-gray-100 flex items-center justify-center z-10"><Lock size={9} className="text-amber-500" fill="currentColor" /></div>}
      {showCheck && isSelected && (
        <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1 shadow-md border border-white z-20 animate-in zoom-in">
          <CheckCircle2 size={12} strokeWidth={3} />
        </div>
      )}
    </div>
  );
};

type WalletSubTab = 'accounting' | 'details' | 'personal' | 'fund';

const Wallet: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<WalletSubTab>('accounting');
  const [jpyAmount, setJpyAmount] = useState('1000');
  const [rate, setRate] = useState(0.21);
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [tempRate, setTempRate] = useState('0.21');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberProfiles, setMemberProfiles] = useState<Record<string, any>>({});
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [payer, setPayer] = useState(TEAM_MEMBERS[0]);
  const [participants, setParticipants] = useState<string[]>(TEAM_MEMBERS);
  const [selectedMember, setSelectedMember] = useState<string>(TEAM_MEMBERS[0]);
  const [personalExpenses, setPersonalExpenses] = useState<Record<string, PersonalExpense[]>>({});
  const [memberPins, setMemberPins] = useState<Record<string, string>>({});
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [newPersonalDesc, setNewPersonalDesc] = useState('');
  const [newPersonalAmount, setNewPersonalAmount] = useState('');

  // 刪除確認彈窗狀態
  const [confirmDelete, setConfirmDelete] = useState<{ id: string, type: 'common' | 'personal' | 'fund' } | null>(null);

  // 團隊公積金狀態
  const [fundBalanceJPY, setFundBalanceJPY] = useState(0);
  const [fundBalanceTWD, setFundBalanceTWD] = useState(0);
  const [fundExpenses, setFundExpenses] = useState<FundExpense[]>([]);
  const [isEditingFund, setIsEditingFund] = useState(false);
  const [tempFundJPY, setTempFundJPY] = useState('0');
  const [tempFundTWD, setTempFundTWD] = useState('0');
  const [newFundDesc, setNewFundDesc] = useState('');
  const [newFundAmount, setNewFundAmount] = useState('');
  const [newFundUnit, setNewFundUnit] = useState<'JPY' | 'TWD'>('JPY');

  useEffect(() => {
    onSnapshot(doc(db, "travelData", "wallet"), (docSnap) => {
      if (docSnap.exists()) { setExpenses(docSnap.data().expenses || []); } 
      else { setDoc(doc(db, "travelData", "wallet"), { expenses: [] }); }
    });
    onSnapshot(doc(db, "travelData", "wallet_settings"), (docSnap) => {
      if (docSnap.exists()) { setRate(docSnap.data().rate || 0.21); setTempRate((docSnap.data().rate || 0.21).toString()); } 
      else { setDoc(doc(db, "travelData", "wallet_settings"), { rate: 0.21 }); }
    });
    onSnapshot(doc(db, "travelData", "personal_wallets_v1"), (docSnap) => {
      if (docSnap.exists()) { const data = docSnap.data(); setPersonalExpenses(data.expenses || {}); setMemberPins(data.pins || {}); }
    });
    onSnapshot(doc(db, "travelData", "team_fund_manual_v2"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFundBalanceJPY(data.balanceJPY || 0);
        setFundBalanceTWD(data.balanceTWD || 0);
        setFundExpenses(data.expenses || []);
        if (!isEditingFund) {
           setTempFundJPY((data.balanceJPY || 0).toString());
           setTempFundTWD((data.balanceTWD || 0).toString());
        }
      } else {
        setDoc(doc(db, "travelData", "team_fund_manual_v2"), { balanceJPY: 0, balanceTWD: 0, expenses: [] });
      }
    });
    onSnapshot(doc(db, "travelData", "memberProfiles"), (docSnap) => { if (docSnap.exists()) setMemberProfiles(docSnap.data()); });
    setLoading(false);
  }, []);

  useEffect(() => {
    const verified = localStorage.getItem(`wallet_verified_${selectedMember}`);
    setIsUnlocked(verified === 'true' || !memberPins[selectedMember]);
    setPinInput(''); setPinError(false);
  }, [selectedMember, memberPins]);

  const updateRate = async () => {
    const r = parseFloat(tempRate); if (isNaN(r)) return;
    setRate(r); setIsEditingRate(false);
    await setDoc(doc(db, "travelData", "wallet_settings"), { rate: r });
  };

  const updateFundBalance = async () => {
    const jpy = parseFloat(tempFundJPY);
    const twd = parseFloat(tempFundTWD);
    if (isNaN(jpy) || isNaN(twd)) return;
    setFundBalanceJPY(jpy);
    setFundBalanceTWD(twd);
    setIsEditingFund(false);
    await updateDoc(doc(db, "travelData", "team_fund_manual_v2"), { balanceJPY: jpy, balanceTWD: twd });
  };

  const addFundExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFundDesc || !newFundAmount) return;
    const amountNum = parseFloat(newFundAmount);
    const newEntry: FundExpense = {
      id: Date.now().toString(),
      description: newFundDesc,
      amount: amountNum,
      unit: newFundUnit,
      date: new Date()
    };
    const updatedExpenses = [newEntry, ...fundExpenses];
    const updateData: any = { expenses: updatedExpenses };
    
    if (newFundUnit === 'JPY') {
      const newB = fundBalanceJPY - amountNum;
      setFundBalanceJPY(newB);
      updateData.balanceJPY = newB;
    } else {
      const newB = fundBalanceTWD - amountNum;
      setFundBalanceTWD(newB);
      updateData.balanceTWD = newB;
    }
    
    await updateDoc(doc(db, "travelData", "team_fund_manual_v2"), updateData);
    setNewFundDesc(''); setNewFundAmount('');
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    const { id, type } = confirmDelete;

    if (type === 'common') {
      const up = expenses.filter(e => e.id !== id);
      setExpenses(up);
      await updateDoc(doc(db, "travelData", "wallet"), { expenses: up });
    } else if (type === 'personal') {
      const currentItems = personalExpenses[selectedMember] || [];
      const up = currentItems.filter(e => e.id !== id);
      const all = { ...personalExpenses, [selectedMember]: up };
      setPersonalExpenses(all);
      await updateDoc(doc(db, "travelData", "personal_wallets_v1"), { expenses: all });
    } else if (type === 'fund') {
      const item = fundExpenses.find(e => e.id === id);
      if (!item) return;
      const updatedExpenses = fundExpenses.filter(e => e.id !== id);
      const updateData: any = { expenses: updatedExpenses };
      if (item.unit === 'JPY') {
        const newB = fundBalanceJPY + item.amount;
        setFundBalanceJPY(newB);
        updateData.balanceJPY = newB;
      } else {
        const newB = fundBalanceTWD + item.amount;
        setFundBalanceTWD(newB);
        updateData.balanceTWD = newB;
      }
      await updateDoc(doc(db, "travelData", "team_fund_manual_v2"), updateData);
    }
    setConfirmDelete(null);
  };

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!newDesc || !newAmount || participants.length === 0) return;
    const expense: Expense = { 
      id: Date.now().toString(), 
      description: newDesc, 
      amount: parseFloat(newAmount), 
      payer, 
      participants, 
      date: new Date() 
    };
    const updated = [expense, ...expenses]; 
    setExpenses(updated);
    await updateDoc(doc(db, "travelData", "wallet"), { expenses: updated });
    setNewDesc(''); setNewAmount(''); setParticipants(TEAM_MEMBERS); setActiveSubTab('details');
  };

  const toggleParticipant = (name: string) => {
    setParticipants(prev => 
      prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
    );
  };

  const addPersonalExpense = async (e: React.FormEvent) => {
    e.preventDefault(); if (!newPersonalDesc || !newPersonalAmount || !isUnlocked) return;
    const newEntry = { id: Date.now().toString(), description: newPersonalDesc, amount: parseFloat(newPersonalAmount), date: new Date() };
    const updated = { ...personalExpenses, [selectedMember]: [newEntry, ...(personalExpenses[selectedMember] || [])] };
    setPersonalExpenses(updated); await updateDoc(doc(db, "travelData", "personal_wallets_v1"), { expenses: updated });
    setNewPersonalDesc(''); setNewPersonalAmount('');
  };

  const balances = TEAM_MEMBERS.reduce((acc, name) => {
    let bal = 0;
    expenses.forEach(exp => {
      if (exp.payer === name) bal += exp.amount;
      if (exp.participants.includes(name)) bal -= exp.amount / exp.participants.length;
    });
    acc[name] = bal; return acc;
  }, {} as Record<string, number>);

  const currentPersonalItems = personalExpenses[selectedMember] || [];
  const personalTotalJpy = currentPersonalItems.reduce((sum, item) => sum + item.amount, 0);
  const personalTotalTwd = Math.round(personalTotalJpy * rate);

  if (loading) return <div className="flex flex-col items-center justify-center py-20 text-rose-300"><Loader2 className="animate-spin mb-4" size={48} /><p className="font-black animate-pulse">錢包同步中...</p></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-black text-rose-800 px-2 flex items-center gap-3 italic"><span className="p-2 rounded-xl bg-rose-100 text-xl">💰</span> 錢包</h2>

      <div className="flex items-center gap-2">
        <div className="flex-1 flex bg-white/50 backdrop-blur-sm p-1.5 rounded-[2rem] border border-rose-100/50 shadow-sm overflow-hidden">
          <button onClick={() => setActiveSubTab('accounting')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-1 rounded-[1.5rem] transition-all font-black text-[10px] uppercase tracking-tighter ${activeSubTab === 'accounting' ? 'bg-rose-800 text-white shadow-md' : 'text-rose-300'}`}><CreditCard size={12} /> 共同記帳</button>
          <button onClick={() => setActiveSubTab('details')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-1 rounded-[1.5rem] transition-all font-black text-[10px] uppercase tracking-tighter ${activeSubTab === 'details' ? 'bg-rose-800 text-white shadow-md' : 'text-rose-300'}`}><Receipt size={12} /> 結算明細</button>
          <button onClick={() => setActiveSubTab('personal')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-1 rounded-[1.5rem] transition-all font-black text-[10px] uppercase tracking-tighter ${activeSubTab === 'personal' ? 'bg-rose-500 text-white shadow-md' : 'text-rose-300'}`}><User size={12} /> 個人私帳</button>
        </div>
        <button 
          onClick={() => setActiveSubTab('fund')} 
          className={`w-12 h-12 flex items-center justify-center rounded-full transition-all shadow-lg active:scale-90 border-2 ${activeSubTab === 'fund' ? 'bg-orange-500 text-white border-orange-200' : 'bg-white text-orange-400 border-orange-50'}`}
        >
          <PiggyBank size={24} />
        </button>
      </div>

      {activeSubTab === 'accounting' && (
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-rose-50">
            <div className="flex justify-between items-center mb-6 px-1">
               <h3 className="text-lg font-black text-rose-800 flex items-center gap-3 italic">🧮 匯率換算</h3>
               {isEditingRate ? (
                 <div className="flex items-center gap-2 animate-in slide-in-from-right-4">
                    <input type="number" step="0.001" value={tempRate} onChange={e => setTempRate(e.target.value)} className="w-20 bg-rose-50 border border-rose-200 rounded-lg px-2 py-1 text-xs font-black text-rose-700 outline-none" />
                    <button onClick={updateRate} className="p-1.5 bg-green-500 text-white rounded-lg shadow-sm"><Check size={14} /></button>
                    <button onClick={() => {setIsEditingRate(false); setTempRate(rate.toString());}} className="p-1.5 bg-gray-100 text-gray-400 rounded-lg"><X size={14} /></button>
                 </div>
               ) : (
                 <button onClick={() => setIsEditingRate(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-400 rounded-full text-[10px] font-black border border-rose-100 hover:bg-rose-100 transition-all"><Settings2 size={12} /> 設定匯率 ({rate})</button>
               )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-[10px] text-rose-400 font-black mb-1.5 uppercase">JPY 日幣</label>
                <input type="number" value={jpyAmount} onChange={(e) => setJpyAmount(e.target.value)} className="w-full bg-rose-50/30 border-2 border-rose-100 rounded-2xl p-4 text-xl font-black text-gray-700 outline-none" />
              </div>
              <div className="text-rose-200 pt-6"><Calculator size={24} /></div>
              <div className="flex-1">
                <label className="block text-[10px] text-rose-400 font-black mb-1.5 uppercase">TWD 台幣</label>
                <div className="w-full bg-white border-2 border-rose-50 rounded-2xl p-4 text-xl font-black text-rose-800 shadow-inner flex items-center justify-center">
                  {Math.round(parseFloat(jpyAmount || '0') * rate)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-rose-50 overflow-hidden relative">
            <h3 className="text-lg font-black text-rose-800 mb-6 flex items-center gap-3 italic">✍️ 新增共同支出</h3>
            <form onSubmit={addExpense} className="space-y-8">
              <div className="space-y-4">
                <input placeholder="消費描述 (例如：一蘭拉麵、超市買水)..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-base font-black outline-none focus:border-rose-400 shadow-inner" />
                <div>
                   <label className="block text-[10px] text-gray-400 font-black mb-1.5 uppercase px-2">金額 (JPY)</label>
                   <input type="number" placeholder="輸入日幣金額" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-xl font-black outline-none focus:border-rose-400 shadow-inner" />
                </div>
              </div>

              <div className="space-y-3">
                 <label className="block text-[10px] text-rose-400 font-black uppercase tracking-widest px-2">是誰買單的？ (Payer)</label>
                 <div className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-1">
                    {TEAM_MEMBERS.map(name => (
                      <button key={name} type="button" onClick={() => setPayer(name)} className={`flex-shrink-0 flex flex-col items-center gap-2 transition-all ${payer === name ? 'scale-110' : 'opacity-50'}`}>
                        <MemberBadge name={name} size="w-14 h-14" isSelected={payer === name} customPhoto={memberProfiles[name]?.photo} className={payer === name ? 'ring-4 ring-rose-500 ring-offset-2' : ''} />
                        <span className={`text-[9px] font-black uppercase ${payer === name ? 'text-rose-600' : 'text-gray-400'}`}>{name}</span>
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-3">
                 <div className="flex justify-between items-center px-2">
                    <label className="block text-[10px] text-blue-400 font-black uppercase tracking-widest">哪些人分這筆錢？ (Split Between)</label>
                    <div className="flex gap-3">
                       <button type="button" onClick={() => setParticipants(TEAM_MEMBERS)} className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-rose-500 transition-colors">全選</button>
                       <span className="text-gray-200 text-xs">|</span>
                       <button type="button" onClick={() => setParticipants([])} className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-rose-500 transition-colors">清空</button>
                    </div>
                 </div>
                 <div className="grid grid-cols-3 gap-y-6 gap-x-4 bg-gray-50/50 p-6 rounded-[2.5rem] border border-gray-100 shadow-inner">
                    {TEAM_MEMBERS.map(name => (
                      <button key={name} type="button" onClick={() => toggleParticipant(name)} className="flex flex-col items-center gap-2 transition-all active:scale-90">
                        <MemberBadge 
                          name={name} 
                          size="w-16 h-16" 
                          isSelected={participants.includes(name)} 
                          showCheck
                          customPhoto={memberProfiles[name]?.photo} 
                        />
                        <span className={`text-[10px] font-black uppercase tracking-tighter truncate w-full text-center ${participants.includes(name) ? 'text-gray-800' : 'text-gray-300'}`}>{name}</span>
                      </button>
                    ))}
                 </div>
                 <p className="text-[9px] font-bold text-gray-400 text-center italic mt-2">
                   {participants.length === TEAM_MEMBERS.length ? '全員平分' : `共有 ${participants.length} 人參與分攤`}
                 </p>
              </div>

              <button className="w-full bg-rose-800 text-white font-black py-6 rounded-[2.5rem] shadow-xl flex items-center justify-center gap-3 active:scale-95 text-xl border-b-8 border-black/10 transition-all hover:-translate-y-1">
                <Plus size={28} strokeWidth={2.5} /> 確認新增支出
              </button>
            </form>
          </div>
        </div>
      )}

      {activeSubTab === 'details' && (
        <div className="space-y-6 pb-20">
          <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-rose-50 relative overflow-hidden">
            <h3 className="text-lg font-black text-rose-800 flex items-center gap-3 mb-6 italic">📊 結算狀態 (匯率: {rate})</h3>
            <div className="grid grid-cols-2 gap-4">
              {TEAM_MEMBERS.map(name => (
                <div key={name} className="flex flex-col p-4 rounded-3xl bg-rose-50/20 border border-rose-100/50 relative">
                  <div className="flex items-center gap-3 mb-2"><MemberBadge name={name} size="w-10 h-10" customPhoto={memberProfiles[name]?.photo} /><span className="text-[10px] font-black text-gray-500 uppercase tracking-widest truncate">{name}</span></div>
                  <div className="flex items-baseline gap-1"><span className={`text-lg font-black ${balances[name] >= 0 ? 'text-rose-600' : 'text-red-400'}`}>{balances[name] >= 0 ? `+${Math.round(balances[name])}` : Math.round(balances[name])}</span><span className="text-[10px] font-semibold text-gray-300">¥</span></div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-black text-rose-300 uppercase tracking-[0.3em] px-4 italic">共同消費明細</h3>
            {expenses.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[2.5rem] border border-rose-50 opacity-50 flex flex-col items-center gap-3">
                 <Receipt size={48} strokeWidth={1} />
                 <p className="text-xs font-bold">目前尚無任何記帳紀錄</p>
              </div>
            ) : (
              expenses.map(exp => (
                <div key={exp.id} className="bg-white p-5 rounded-[2rem] border border-rose-50 flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-4 truncate"><MemberBadge name={exp.payer} size="w-12 h-12" customPhoto={memberProfiles[exp.payer]?.photo} /><div className="truncate"><p className="font-black text-gray-700 text-sm truncate">{exp.description}</p><p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tighter"><span className="text-rose-400">{exp.payer}</span> · {exp.participants.length} 人分</p></div></div>
                  <div className="flex items-center gap-3"><div className="text-right"><span className="font-black text-rose-600 text-lg">{exp.amount}</span><span className="text-[10px] font-semibold text-rose-300 ml-1">¥</span></div><button onClick={() => setConfirmDelete({ id: exp.id, type: 'common' })} className="p-2 text-gray-200 hover:text-rose-400 transition-colors"><Trash2 size={18} /></button></div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'personal' && (
        <div className="space-y-8 pb-24 animate-in slide-in-from-right">
           <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] p-5 border border-rose-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 mb-2 px-2"><UserCheck size={16} className="text-rose-500" /><span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">個人私帳模式：</span></div>
            <div className="flex gap-6 overflow-x-auto scrollbar-hide py-4 px-2">
              {TEAM_MEMBERS.map((name) => (
                <button key={name} onClick={() => setSelectedMember(name)} className={`flex-shrink-0 flex flex-col items-center gap-2.5 transition-all duration-300 ${selectedMember === name ? 'scale-110' : 'opacity-40 grayscale'}`}>
                  <MemberBadge name={name} isLocked={!!memberPins[name]} size="w-12 h-12" customPhoto={memberProfiles[name]?.photo} className={selectedMember === name ? 'ring-[4px] ring-rose-400 ring-offset-[3px] ring-offset-white shadow-xl' : 'ring-2 ring-transparent'} />
                  <span className={`text-[10px] font-black uppercase tracking-tighter ${selectedMember === name ? 'text-rose-600' : 'text-gray-400'}`}>{name}</span>
                </button>
              ))}
            </div>
          </div>
          {!isUnlocked ? (
            <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-rose-50 flex flex-col items-center text-center gap-6 animate-in zoom-in">
               <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center text-rose-400 shadow-inner"><Lock size={40} /></div>
               <div className="space-y-2"><h3 className="text-xl font-black text-gray-800 italic">{selectedMember} 的私帳</h3><p className="text-xs font-bold text-gray-400">本記帳本受隱私保護，僅供本人查看。</p></div>
               <button onClick={() => setShowPinModal(true)} className="px-10 py-4 bg-rose-500 text-white rounded-full font-black text-sm uppercase shadow-lg active:scale-95 transition-all">解鎖個人記帳</button>
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-rose-50 relative overflow-hidden">
               <div className="flex justify-between items-end mb-8 px-1"><div><div className="flex items-center gap-2 mb-1"><h2 className="text-3xl font-black text-rose-500 italic">個人錢包</h2><Unlock size={18} className="text-rose-300" /></div><p className="text-[10px] font-bold text-rose-300 uppercase tracking-widest">{selectedMember} 的秘密帳本</p></div></div>
               
               <form onSubmit={addPersonalExpense} className="space-y-4 mb-6">
                <input placeholder="消費項目..." value={newPersonalDesc} onChange={(e) => setNewPersonalDesc(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-black outline-none focus:border-rose-400 shadow-inner" />
                <div className="flex gap-2 items-center">
                   <input type="number" placeholder="金額 (JPY)" value={newPersonalAmount} onChange={(e) => setNewPersonalAmount(e.target.value)} className="flex-1 min-w-0 bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-black outline-none focus:border-rose-400 shadow-inner" />
                   <button type="submit" className="w-14 h-14 bg-rose-500 text-white rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg active:scale-95 transition-all">
                     <Plus size={28} />
                   </button>
                </div>
              </form>

              <div className="bg-gradient-to-br from-rose-50 to-white p-5 rounded-[2.2rem] border-2 border-rose-100/50 shadow-inner mb-10 flex flex-col gap-4">
                 <div className="flex items-center gap-2 text-[10px] font-black text-rose-400 uppercase tracking-widest"><TrendingDown size={14} /> 個人消費總計</div>
                 <div className="flex items-center justify-around gap-2">
                    <div className="text-center">
                       <span className="block text-[8px] font-bold text-gray-400 uppercase">JPY 日幣</span>
                       <span className="text-2xl font-black text-rose-600">¥{personalTotalJpy.toLocaleString()}</span>
                    </div>
                    <div className="h-8 w-px bg-rose-100"></div>
                    <div className="text-center">
                       <span className="block text-[8px] font-bold text-gray-400 uppercase">TWD 台幣</span>
                       <span className="text-2xl font-black text-rose-800">NT${personalTotalTwd.toLocaleString()}</span>
                    </div>
                 </div>
              </div>

              <div className="space-y-3">
                 <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-4">個人消費明細</h3>
                 {currentPersonalItems.length === 0 ? (
                   <div className="text-center py-10 opacity-30 flex flex-col items-center gap-2">
                      <Landmark size={32} strokeWidth={1.5} />
                      <p className="text-[10px] font-bold italic">目前尚無個人消費紀錄</p>
                   </div>
                 ) : (
                   currentPersonalItems.map(exp => (
                    <div key={exp.id} className="bg-rose-50/20 p-5 rounded-[2rem] border border-rose-50 flex justify-between items-center group transition-all">
                       <div className="flex items-center gap-4 truncate"><div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-rose-400"><WalletIcon size={18} /></div><p className="font-black text-gray-700 text-sm truncate">{exp.description}</p></div>
                       <div className="flex items-center gap-3">
                          <div className="text-right">
                             <p className="font-black text-rose-600 text-base leading-none">{exp.amount.toLocaleString()}<span className="text-[9px] font-bold ml-0.5">¥</span></p>
                             <p className="text-[8px] font-black text-rose-300 mt-1 uppercase">NT${Math.round(exp.amount * rate).toLocaleString()}</p>
                          </div>
                          <button onClick={() => setConfirmDelete({ id: exp.id, type: 'personal' })} className="p-2 text-rose-100 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                       </div>
                    </div>
                   ))
                 )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'fund' && (
        <div className="space-y-6 pb-24 animate-in slide-in-from-right">
           <div className="bg-white rounded-[3rem] p-8 shadow-sm border-4 border-[#FFB74D]/20 relative overflow-hidden">
              <div className="flex justify-between items-start mb-8 px-1">
                 <div>
                    <h2 className="text-3xl font-black text-[#F57C00] italic flex items-center gap-2">團隊公積金 <PiggyBank size={24} /></h2>
                    <p className="text-[10px] font-bold text-[#FFA726] uppercase tracking-widest mt-1">Shared Team Fund Pool</p>
                 </div>
                 {isEditingFund ? (
                    <div className="flex items-center gap-2">
                       <div className="flex flex-col gap-2">
                          <div className="flex items-center bg-orange-50 border border-orange-200 rounded-xl overflow-hidden shadow-inner p-1">
                            <input type="number" value={tempFundJPY} onChange={e => setTempFundJPY(e.target.value)} placeholder="JPY" className="w-20 bg-transparent px-2 py-1 text-[10px] font-black text-orange-700 outline-none" />
                            <span className="inline-flex items-center justify-center bg-orange-100 text-orange-600 text-[7px] font-black px-1 py-0.5 rounded uppercase mr-1 h-3.5">JP</span>
                          </div>
                          <div className="flex items-center bg-orange-50 border border-orange-200 rounded-xl overflow-hidden shadow-inner p-1">
                            <input type="number" value={tempFundTWD} onChange={e => setTempFundTWD(e.target.value)} placeholder="TWD" className="w-20 bg-transparent px-2 py-1 text-[10px] font-black text-orange-700 outline-none" />
                            <span className="inline-flex items-center justify-center bg-gray-100 text-gray-500 text-[7px] font-black px-1 py-0.5 rounded uppercase mr-1 h-3.5">TW</span>
                          </div>
                       </div>
                       <div className="flex flex-col gap-2">
                          <button onClick={updateFundBalance} className="p-2 bg-green-500 text-white rounded-xl shadow-md"><Check size={16} /></button>
                          <button onClick={() => setIsEditingFund(false)} className="p-2 bg-gray-100 text-gray-400 rounded-xl"><X size={16} /></button>
                       </div>
                    </div>
                 ) : (
                    <button onClick={() => setIsEditingFund(true)} className="p-3 bg-orange-50 text-orange-500 rounded-2xl border border-orange-100 active:scale-90 shadow-sm"><Settings2 size={18} /></button>
                 )}
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-white p-7 rounded-[2.5rem] border-2 border-orange-100 shadow-inner mb-10">
                 <div className="flex flex-col gap-4">
                    <span className="text-[11px] font-black text-orange-400 uppercase tracking-widest flex items-center gap-2"><Coins size={14} /> 目前餘額</span>
                    <div className="flex flex-col gap-3">
                       <div className="flex items-center gap-3">
                          <span className="text-3xl font-black text-orange-600">¥{Math.round(fundBalanceJPY).toLocaleString()}</span>
                          <span className="inline-flex items-center justify-center bg-orange-100 text-orange-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase h-4">JP</span>
                       </div>
                       <div className="h-px w-full bg-orange-100/50"></div>
                       <div className="flex items-center gap-3">
                          <span className="text-2xl font-black text-orange-800/60 uppercase">NT${Math.round(fundBalanceTWD).toLocaleString()}</span>
                          <span className="inline-flex items-center justify-center bg-gray-100 text-gray-500 text-[8px] font-black px-1.5 py-0.5 rounded uppercase h-4">TW</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="space-y-4 mb-10">
                 <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] px-2 italic">📝 新增公積金支出</h3>
                 <form onSubmit={addFundExpense} className="space-y-3">
                    <input placeholder="支出說明 (例如：門票、共用零食)..." value={newFundDesc} onChange={(e) => setNewFundDesc(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-black outline-none focus:border-orange-400 shadow-inner" />
                    <div className="flex gap-2">
                       <div className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden focus-within:border-orange-400 transition-all shadow-inner relative">
                          <input type="number" placeholder="金額..." value={newFundAmount} onChange={(e) => setNewFundAmount(e.target.value)} className="w-full bg-transparent p-4 pr-24 text-sm font-black outline-none" />
                          <button type="button" onClick={() => setNewFundUnit(u => u === 'JPY' ? 'TWD' : 'JPY')} className="absolute right-0 top-0 bottom-0 px-4 bg-white border-l border-gray-100 text-[10px] font-black text-orange-500 uppercase flex items-center gap-1 active:bg-orange-50 transition-colors min-w-[85px] justify-center">
                             {newFundUnit === 'JPY' ? 'JP (¥)' : 'TW ($)'}
                          </button>
                       </div>
                       <button type="submit" className="w-14 h-14 bg-orange-500 text-white rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg active:scale-95 transition-all"><Plus size={28} /></button>
                    </div>
                 </form>
              </div>

              <div className="space-y-3">
                 <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-4 flex items-center gap-2"><History size={14} /> 公積金支出明細</h3>
                 {fundExpenses.length === 0 ? (
                    <div className="text-center py-10 opacity-30 flex flex-col items-center gap-2">
                       <Receipt size={32} strokeWidth={1.5} />
                       <p className="text-[10px] font-bold italic">目前尚無公積金支出</p>
                    </div>
                 ) : (
                    fundExpenses.map(exp => (
                       <div key={exp.id} className="bg-orange-50/20 p-5 rounded-[2rem] border border-orange-100/50 flex justify-between items-center group">
                          <div className="flex items-center gap-4 truncate">
                             <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-orange-400"><ShoppingCart size={18} /></div>
                             <div className="truncate">
                                <p className="font-black text-gray-700 text-sm truncate">{exp.description}</p>
                                <p className="text-[8px] font-bold text-gray-400 mt-0.5">{new Date(exp.date?.toDate?.() || exp.date).toLocaleString()}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-3">
                             <div className="text-right flex items-center gap-1">
                                <span className="font-black text-orange-600 text-base leading-none">-{exp.amount.toLocaleString()}</span>
                                <span className="inline-flex items-center justify-center bg-white/50 text-orange-400 text-[7px] font-black px-1 py-0.5 rounded uppercase border border-orange-100 h-4 min-w-[1.5rem]">
                                  {exp.unit === 'JPY' ? 'JP' : 'TW'}
                                </span>
                             </div>
                             <button onClick={() => setConfirmDelete({ id: exp.id, type: 'fund' })} className="p-2 text-orange-100 hover:text-orange-500 transition-colors"><Trash2 size={16} /></button>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>
        </div>
      )}

      {/* 刪除確認彈窗 (內置 UI 代替 window.confirm) */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xs rounded-[3rem] p-8 shadow-2xl border-4 border-rose-100 text-center space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full mx-auto flex items-center justify-center shadow-inner animate-bounce">
                 <AlertCircle size={32} />
              </div>
              <div className="space-y-2">
                 <h3 className="text-2xl font-black text-gray-800 italic tracking-tighter">確定要刪除嗎？</h3>
                 <p className="text-xs font-bold text-gray-400 leading-relaxed">
                   這筆帳目將會被永久移除，<br/>
                   對應的餘額也將同步更新。
                 </p>
              </div>
              <div className="flex flex-col gap-3 pt-2">
                 <button onClick={executeDelete} className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 border-b-4 border-rose-700">
                    確定刪除
                 </button>
                 <button onClick={() => setConfirmDelete(null)} className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95">
                    返回列表
                 </button>
              </div>
           </div>
        </div>
      )}

      {showPinModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-white animate-in fade-in">
           <div className={`bg-white w-full max-w-xs rounded-[3rem] p-8 shadow-2xl border-4 border-rose-100 transition-transform ${pinError ? 'animate-shake' : ''}`}>
              <div className="flex flex-col items-center text-center gap-5">
                 <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shadow-inner"><Lock size={32} /></div>
                 <div className="space-y-1"><h3 className="text-xl font-black text-gray-800 tracking-tight italic">解鎖私帳</h3><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedMember} 的身分驗證</p></div>
                 <form onSubmit={async (e) => {
                   e.preventDefault(); const correct = memberPins[selectedMember];
                   if (pinInput === correct) { localStorage.setItem(`wallet_verified_${selectedMember}`, 'true'); setIsUnlocked(true); setShowPinModal(false); setPinError(false); } 
                   else { setPinError(true); setTimeout(() => setPinError(false), 500); }
                 }} className="w-full space-y-5">
                    <input type="password" maxLength={4} inputMode="numeric" value={pinInput} onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))} placeholder="****" autoFocus className={`w-full bg-rose-50/30 border-2 rounded-2xl p-4 text-center text-3xl font-black outline-none transition-all tracking-[0.5em] ${pinError ? 'border-red-400 text-red-500' : 'border-rose-100 focus:border-rose-500 text-gray-700'}`} />
                    <div className="flex gap-3"><button type="button" onClick={() => setShowPinModal(false)} className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-[11px] uppercase shadow-lg active:scale-95">取消</button><button type="submit" disabled={pinInput.length !== 4} className="flex-[2] py-4 bg-rose-500 text-white rounded-2xl font-black text-[11px] uppercase shadow-lg active:scale-95">解鎖</button></div>
                 </form>
              </div>
           </div>
        </div>
      )}
      <style>{`
        .animate-shake { animation: shake 0.2s ease-in-out infinite; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        
        /* 移除數字輸入框的上下箭頭 */
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};

export default Wallet;