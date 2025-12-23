
import React, { useState, useEffect } from 'react';
import { ChecklistItem } from '../types';
import { Plus, Trash2, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { db } from '../services/firebase';
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";

const INITIAL_ITEMS: string[] = [
  '護照', '現金（日幣/台幣）', '駕照譯本', '盥洗用品', '換洗衣物', '行動電源', '手機充電器', '個人藥品', '雨傘'
];

const Checklist: React.FC = () => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [memo, setMemo] = useState('');
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);

  // 監聽 Firebase 資料
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "travelData", "checklist"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setItems(data.items || []);
        setMemo(data.memo || '');
      } else {
        // 第一次使用，初始化資料
        const initItems = INITIAL_ITEMS.map((text, i) => ({ id: `init-${i}`, text, checked: false }));
        setDoc(doc(db, "travelData", "checklist"), { items: initItems, memo: '' });
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const saveToFirebase = async (newItems: ChecklistItem[], newMemo?: string) => {
    await updateDoc(doc(db, "travelData", "checklist"), { 
      items: newItems,
      memo: newMemo !== undefined ? newMemo : memo
    });
  };

  const toggleItem = (id: string) => {
    const updated = items.map(item => item.id === id ? { ...item, checked: !item.checked } : item);
    setItems(updated);
    saveToFirebase(updated);
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    const updated = [...items, { id: Date.now().toString(), text: newItem, checked: false }];
    setItems(updated);
    saveToFirebase(updated);
    setNewItem('');
  };

  const deleteItem = (id: string) => {
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
    saveToFirebase(updated);
  };

  const handleMemoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setMemo(val);
    // 延遲儲存以減少 API 調用
    const timeoutId = setTimeout(() => saveToFirebase(items, val), 1000);
    return () => clearTimeout(timeoutId);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-rose-300">
      <Loader2 className="animate-spin mb-4" size={48} />
      <p className="font-black animate-pulse">多人資料同步中...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-yellow-50">
        <h2 className="text-2xl font-bold text-amber-500 mb-6 flex items-center gap-3">
          <span className="p-2 rounded-xl bg-yellow-100 text-xl">🧳</span> 多人同步清單
        </h2>
        
        <form onSubmit={addItem} className="grid grid-cols-[1fr_48px] gap-3 mb-8 items-center">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="新增想帶的東西..."
            className="w-full px-6 py-4 bg-yellow-50/50 rounded-2xl border-2 border-yellow-100 focus:ring-2 focus:ring-yellow-200 outline-none transition-all text-base h-14 min-w-0 font-medium"
          />
          <button type="submit" className="w-12 h-14 bg-amber-400 text-white rounded-2xl flex items-center justify-center">
            <Plus size={24} strokeWidth={2.5} />
          </button>
        </form>

        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="grid grid-cols-[1fr_48px] gap-3 items-center group">
              <button
                onClick={() => toggleItem(item.id)}
                className={`flex items-center gap-5 p-5 rounded-2xl transition-all border-2 min-h-[56px] min-w-0 ${
                  item.checked ? 'bg-gray-50 text-gray-400 grayscale border-transparent' : 'bg-white border-yellow-50'
                }`}
              >
                <div className="flex-shrink-0">
                  {item.checked ? <CheckCircle2 className="text-green-300" size={24} /> : <Circle className="text-yellow-200" size={24} />}
                </div>
                <span className={`text-base font-semibold truncate ${item.checked ? 'line-through' : 'text-gray-700'}`}>{item.text}</span>
              </button>
              <button onClick={() => deleteItem(item.id)} className="w-12 h-14 flex items-center justify-center text-gray-200 hover:text-red-300">
                <Trash2 size={22} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-yellow-50 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1.5 rainbow-bg opacity-50" />
        <h2 className="text-2xl font-bold text-amber-500 mb-6 flex items-center gap-3">
          <span className="p-2 rounded-xl bg-yellow-100 text-xl">✍️</span> 共有備忘錄
        </h2>
        <textarea
          value={memo}
          onChange={handleMemoChange}
          placeholder="在這裡寫下大家的旅遊靈感..."
          className="w-full h-64 p-6 bg-yellow-50/30 rounded-2xl border-2 border-yellow-100 outline-none resize-none text-base leading-relaxed font-medium"
        />
      </div>
    </div>
  );
};

export default Checklist;
