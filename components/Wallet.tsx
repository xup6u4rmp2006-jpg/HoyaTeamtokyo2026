
import React, { useState, useEffect } from 'react';
import { TEAM_MEMBERS } from '../constants';
import { Expense } from '../types';
import { Plus, Calculator, Trash2, Coins, Receipt, CreditCard, History, Loader2 } from 'lucide-react';
import { db } from '../services/firebase';
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";

type WalletSubTab = 'accounting' | 'details';

const Wallet: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<WalletSubTab>('accounting');
  const [jpyAmount, setJpyAmount] = useState('1000');
  const [rate] = useState(0.21);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [payer, setPayer] = useState(TEAM_MEMBERS[0]);
  const [participants, setParticipants] = useState<string[]>(TEAM_MEMBERS);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "travelData", "wallet"), (docSnap) => {
      if (docSnap.exists()) {
        setExpenses(docSnap.data().expenses || []);
      } else {
        setDoc(doc(db, "travelData", "wallet"), { expenses: [] });
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc || !newAmount) return;
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
    setNewDesc('');
    setNewAmount('');
    setActiveSubTab('details');
  };

  const deleteExpense = async (id: string) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    await updateDoc(doc(db, "travelData", "wallet"), { expenses: updated });
  };

  const toggleParticipant = (name: string) => {
    setParticipants(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const balances = TEAM_MEMBERS.reduce((acc, name) => {
    let balance = 0;
    expenses.forEach(exp => {
      if (exp.payer === name) balance += exp.amount;
      if (exp.participants.includes(name)) {
        balance -= exp.amount / exp.participants.length;
      }
    });
    acc[name] = balance;
    return acc;
  }, {} as Record<string, number>);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-rose-300">
      <Loader2 className="animate-spin mb-4" size={48} />
      <p className="font-black animate-pulse">多人錢包同步中...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-rose-800 px-2 flex items-center gap-3 mb-2">
        <span className="p-2 rounded-xl bg-rose-100 text-xl">💰</span> 多人同步錢包
      </h2>

      <div className="flex bg-white/50 backdrop-blur-sm p-1.5 rounded-3xl border border-rose-100/50 shadow-sm">
        <button onClick={() => setActiveSubTab('accounting')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-all font-bold text-sm ${activeSubTab === 'accounting' ? 'bg-rose-800 text-white shadow-md' : 'text-gray-400 hover:bg-white/80'}`}>
          <CreditCard size={18} /> 記帳
        </button>
        <button onClick={() => setActiveSubTab('details')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-all font-bold text-sm ${activeSubTab === 'details' ? 'bg-rose-800 text-white shadow-md' : 'text-gray-400 hover:bg-white/80'}`}>
          <Receipt size={18} /> 明細
        </button>
      </div>

      {activeSubTab === 'accounting' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-rose-50">
            <h3 className="text-lg font-bold text-rose-800 mb-6 flex items-center gap-3">🧮 匯率換算</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-[10px] text-rose-400 font-bold mb-1.5 uppercase">JPY 日幣</label>
                <input type="number" value={jpyAmount} onChange={(e) => setJpyAmount(e.target.value)} className="w-full bg-rose-50/30 border-2 border-rose-100 rounded-2xl p-4 text-xl font-bold text-gray-700" />
              </div>
              <div className="text-rose-200 pt-6"><Calculator size={24} /></div>
              <div className="flex-1">
                <label className="block text-[10px] text-rose-400 font-bold mb-1.5 uppercase">TWD 台幣</label>
                <div className="w-full bg-white border-2 border-rose-50 rounded-2xl p-4 text-xl font-bold text-rose-800 shadow-inner flex items-center justify-center">
                  {Math.round(parseFloat(jpyAmount || '0') * rate)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-rose-50">
            <h3 className="text-lg font-bold text-rose-800 mb-6 flex items-center gap-3">✍️ 新增共同支出</h3>
            <form onSubmit={addExpense} className="space-y-6">
              <input placeholder="例如：中餐、居酒屋、車票..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-base font-semibold" />
              <div className="flex gap-3">
                <div className="flex-1">
                  <input type="number" placeholder="金額 (JPY)" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-base font-bold" />
                </div>
                <select value={payer} onChange={(e) => setPayer(e.target.value)} className="w-1/3 bg-rose-50 border border-rose-100 rounded-2xl p-4 text-sm font-bold text-rose-800">
                  {TEAM_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-3">分攤人員 ({participants.length})</p>
                <div className="flex flex-wrap gap-2">
                  {TEAM_MEMBERS.map(m => (
                    <button key={m} type="button" onClick={() => toggleParticipant(m)} className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${participants.includes(m) ? 'bg-rose-800 text-white shadow-sm' : 'bg-rose-50 text-rose-300'}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <button className="w-full bg-rose-800 text-white font-bold py-5 rounded-3xl shadow-lg flex items-center justify-center gap-3 active:scale-95 text-lg">
                <Plus size={24} strokeWidth={2.5} /> 確認新增支出
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-rose-50">
            <h3 className="text-lg font-bold text-rose-800 mb-6 flex items-center gap-3">📊 結算狀態</h3>
            <div className="grid grid-cols-2 gap-3">
              {TEAM_MEMBERS.map(name => (
                <div key={name} className="flex flex-col p-4 rounded-2xl bg-rose-50/20 border border-rose-100/50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{name}</span>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-base font-bold ${balances[name] >= 0 ? 'text-rose-600' : 'text-red-400'}`}>
                        {balances[name] >= 0 ? `+${Math.round(balances[name])}` : Math.round(balances[name])}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-300">¥</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {expenses.map(exp => (
              <div key={exp.id} className="bg-white p-5 rounded-[2rem] border border-rose-50 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4 truncate">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 flex-shrink-0"><Coins size={20} /></div>
                  <div className="truncate">
                    <p className="font-bold text-gray-700 text-sm truncate">{exp.description}</p>
                    <p className="text-[10px] text-gray-400 font-semibold mt-1 uppercase">{exp.payer} 付 · {exp.participants.length} 人分</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-bold text-rose-600 text-lg">{exp.amount}</span>
                    <span className="text-[10px] font-semibold text-rose-300 ml-1">JPY</span>
                  </div>
                  <button onClick={() => deleteExpense(exp.id)} className="p-2 text-gray-200 hover:text-rose-400"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
