import React, { useState, useRef, useEffect } from 'react';
import { ITINERARY_DATA, getIcon, PRIDE_COLORS, PRIDE_TEXT_COLORS, PRIDE_BORDER_COLORS } from '../constants';
import { MapPin, Calendar, Heart, CloudSun, Shirt, Plus, Pencil, Trash2, X, Check, Lock, Unlock, Loader2, AlertTriangle, Pin } from 'lucide-react';
import { db } from '../services/firebase';
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { DayPlan, ItineraryItem } from '../types';

interface ItineraryProps {
  onModalToggle?: (isOpen: boolean) => void;
}

const Itinerary: React.FC<ItineraryProps> = ({ onModalToggle }) => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [itineraryDays, setItineraryDays] = useState<DayPlan[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // 正在編輯的項目
  const [editingItem, setEditingItem] = useState<{ dayIdx: number, itemIdx: number | null, data: Partial<ItineraryItem> } | null>(null);
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // 通知 App 是否開啟全螢幕彈窗以隱藏導覽列
  useEffect(() => {
    const isAnyModalOpen = editingItem !== null || showPasswordModal;
    onModalToggle?.(isAnyModalOpen);
  }, [editingItem, showPasswordModal, onModalToggle]);

  // 監聽 Firebase 資料
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "travelData", "itinerary"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data().days || [];
        setItineraryDays(data);
      } else {
        setDoc(doc(db, "travelData", "itinerary"), { days: ITINERARY_DATA });
        setItineraryDays(ITINERARY_DATA);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firebase Sync Error:", error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const saveToFirebase = async (newDays: DayPlan[]) => {
    try {
      await updateDoc(doc(db, "travelData", "itinerary"), { days: newDays });
    } catch (e) {
      console.error("Firebase Update Failed:", e);
    }
  };

  const currentDayData = itineraryDays.find(d => d.day === selectedDay) || null;

  const handleEditToggle = () => {
    if (isEditMode) {
      setIsEditMode(false);
    } else {
      setShowPasswordModal(true);
      setPasswordInput('');
      setPasswordError(false);
    }
  };

  const verifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '1130') {
      setIsEditMode(true);
      setShowPasswordModal(false);
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 500);
    }
  };

  const handleAddDay = async () => {
    const newDayNum = itineraryDays.length > 0 ? Math.max(...itineraryDays.map(d => d.day)) + 1 : 1;
    const newDay: DayPlan = {
      day: newDayNum,
      date: `3/${newDayNum}`,
      title: '新的一天！',
      weather: { temp: '--', condition: '未知', icon: '❓' },
      clothing: '隨意穿搭',
      items: []
    };
    const updated = [...itineraryDays, newDay];
    setItineraryDays(updated);
    await saveToFirebase(updated);
    setSelectedDay(newDayNum);
  };

  const handleDeleteDay = async () => {
    if (!window.confirm(`⚠️ 確定要刪除 Hoya 第 ${selectedDay} 天的所有行程嗎？此動作無法復原！`)) return;
    const updated = itineraryDays.filter(d => d.day !== selectedDay);
    setItineraryDays(updated);
    await saveToFirebase(updated);
    if (updated.length > 0) {
      setSelectedDay(updated[0].day);
    }
  };

  const openEditModal = (dayIdx: number, itemIdx: number | null) => {
    const day = itineraryDays[dayIdx];
    if (!day) return;
    // Explicitly cast literal string to literal type to avoid type mismatch in setEditingItem
    const item = itemIdx !== null ? day.items[itemIdx] : {
      time: '09:00',
      title: '',
      type: 'spot' as const,
      description: '',
      link: '',
      isPinned: false,
      descColor: 'grey' as const
    };
    setEditingItem({ dayIdx, itemIdx, data: { ...item } });
  };

  const saveEdit = async () => {
    if (!editingItem) return;
    const { dayIdx, itemIdx, data } = editingItem;
    
    const updatedDays = itineraryDays.map((day, idx) => {
      if (idx !== dayIdx) return day;
      const newItems = [...day.items];
      if (itemIdx === null) {
        newItems.push(data as ItineraryItem);
      } else {
        newItems[itemIdx] = data as ItineraryItem;
      }
      // 排序邏輯：置頂優先，時間次之
      newItems.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return a.time.localeCompare(b.time);
      });
      return { ...day, items: newItems };
    });
    
    setItineraryDays(updatedDays);
    await saveToFirebase(updatedDays);
    setEditingItem(null);
  };

  const handleDeleteItem = async () => {
    if (!editingItem || editingItem.itemIdx === null) return;
    if (!window.confirm('🗑️ 確定要從行程中移除此項目嗎？')) return;
    
    const { dayIdx, itemIdx } = editingItem;
    const updatedDays = itineraryDays.map((day, dIdx) => {
      if (dIdx !== dayIdx) return day;
      return {
        ...day,
        items: day.items.filter((_, iIdx) => iIdx !== itemIdx)
      };
    });
    
    setItineraryDays(updatedDays);
    try {
      await saveToFirebase(updatedDays);
      setEditingItem(null);
    } catch (e) {
      alert('刪除失敗，請檢查網路連線');
    }
  };

  const getDayColor = (day: number) => PRIDE_COLORS[(day - 1) % PRIDE_COLORS.length];
  const getDayTextColor = (day: number) => PRIDE_TEXT_COLORS[(day - 1) % PRIDE_TEXT_COLORS.length];

  if (loading || (itineraryDays.length === 0 && !isEditMode)) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4 text-center">
      <Loader2 className="text-rose-300 animate-spin mx-auto" size={48} />
      <p className="text-rose-300 font-black animate-pulse tracking-widest uppercase text-xs">行程同步中 Syncing...</p>
    </div>
  );

  return (
    <div className="space-y-4 text-black pb-20">
      <div className="flex justify-between items-center px-4 mb-2">
        {isEditMode && (
          <button 
            onClick={handleDeleteDay}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 border border-red-100 rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-sm"
          >
            <Trash2 size={12} /> 刪除整天行程
          </button>
        )}
        <div className="flex-1"></div>
        <button 
          onClick={handleEditToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isEditMode ? 'bg-rose-500 text-white shadow-lg scale-105' : 'bg-white text-rose-400 border border-rose-100 shadow-sm'}`}
        >
          {isEditMode ? <Unlock size={14} className="animate-pulse" /> : <Lock size={14} />}
          {isEditMode ? '結束編輯' : '編輯行程表'}
        </button>
      </div>

      <div className="glass border-b border-white/50 mb-1 overflow-hidden py-4 -mx-5 px-5">
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-1 px-1">
          {itineraryDays.map((dayPlan) => {
            const isSelected = selectedDay === dayPlan.day;
            return (
              <button
                key={dayPlan.day}
                onClick={() => setSelectedDay(dayPlan.day)}
                className={`flex-shrink-0 aspect-square w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all duration-300 relative ${
                  isSelected 
                    ? `${getDayColor(dayPlan.day)} text-white shadow-lg scale-105 z-10 border-2 border-white` 
                    : `bg-white/80 ${getDayTextColor(dayPlan.day)} border border-gray-100 opacity-70`
                }`}
              >
                <span className={`text-[7px] font-black uppercase tracking-tighter leading-none ${isSelected ? 'text-white/80' : 'opacity-40'}`}>Hoya</span>
                <span className="text-lg font-black leading-none mt-0.5">{dayPlan.day}</span>
              </button>
            );
          })}
          {isEditMode && (
            <button onClick={handleAddDay} className="flex-shrink-0 aspect-square w-14 h-14 rounded-full border-2 border-dashed border-rose-200 flex items-center justify-center text-rose-300 hover:bg-rose-50 transition-all">
              <Plus size={24} />
            </button>
          )}
        </div>
      </div>

      {currentDayData ? (
        <div className="animate-in fade-in duration-500 mt-0">
          <div className="bg-white rounded-[3.5rem] shadow-2xl border border-white overflow-hidden relative">
            <div className="relative">
               <div className={`p-6 pb-12 ${getDayColor(selectedDay)} bg-opacity-15 relative overflow-hidden shadow-inner`}>
                  <div className="absolute top-0 right-0 p-4 opacity-[0.05] pointer-events-none">
                    <span className="text-8xl font-black leading-none uppercase select-none italic">Hoya {currentDayData.day}</span>
                  </div>
                  <div className="flex items-center gap-4 relative z-10">
                     <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center flex-shrink-0 border-2 border-white transform -rotate-3">
                        <Calendar className={getDayTextColor(selectedDay)} size={24} strokeWidth={2.5} />
                     </div>
                     <div className="space-y-1 flex-1">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black text-white ${getDayColor(selectedDay)} uppercase tracking-[0.2em]`}>
                           {currentDayData.date}
                        </span>
                        <h3 className="text-xl font-black text-gray-800 tracking-tight leading-tight italic">{currentDayData.title}</h3>
                     </div>
                  </div>
               </div>
               <div className="px-5 -mt-8 relative z-20">
                  <div className="bg-white/95 backdrop-blur-md rounded-[2.2rem] p-5 shadow-2xl border border-rose-50 flex flex-col gap-4">
                     <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${getDayColor(selectedDay)} bg-opacity-10 shadow-inner flex-shrink-0`}>
                          <CloudSun className={getDayTextColor(selectedDay)} size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">預估天氣</span>
                          <div className="flex items-center gap-1.5">
                             <span className="text-base font-black text-gray-700">{currentDayData.weather?.temp}</span>
                             <span className="text-lg">{currentDayData.weather?.icon}</span>
                             <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">{currentDayData.weather?.condition}</span>
                          </div>
                        </div>
                     </div>
                     <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-100 to-transparent"></div>
                     <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${getDayColor(selectedDay)} bg-opacity-10 shadow-inner flex-shrink-0`}>
                          <Shirt className={getDayTextColor(selectedDay)} size={20} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">穿搭指南</span>
                          <p className="text-[11px] font-bold text-gray-600 leading-relaxed">{currentDayData.clothing}</p>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="relative h-4 bg-white">
                  <div className={`absolute -top-4 left-0 w-full h-8 bg-white rounded-t-[2.5rem] border-t-2 border-white shadow-[0_-10px_20px_rgba(255,255,255,0.6)]`}></div>
               </div>
            </div>

            <div className="px-8 pb-12 pt-0 relative">
              <div className="relative border-l-[2px] border-dashed border-rose-100 ml-4 pl-8 space-y-8">
                {currentDayData.items.map((item, idx) => (
                  <div key={idx} className="relative group animate-in fade-in" onClick={() => isEditMode && openEditModal(itineraryDays.findIndex(d => d.day === selectedDay), idx)}>
                    <div className={`absolute -left-[54px] top-0 w-10 h-10 rounded-2xl bg-white border-2 border-rose-50 shadow-lg flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${item.isPinned ? 'ring-2 ring-rose-300 ring-offset-2' : ''}`}>
                      {getIcon(item.type)}
                    </div>
                    <div className="flex flex-col gap-2 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${getDayColor(selectedDay)} text-white shadow-md border-b-2 border-black/10`}>
                          {item.isPinned && <Pin size={10} className="fill-white rotate-45" />}
                          <span className="text-[9px] font-black tracking-widest">{item.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {item.color === 'red' && <AlertTriangle size={14} className="text-red-500 animate-pulse" />}
                          {isEditMode ? (
                            <div className="p-2 bg-rose-50 text-rose-400 rounded-xl border border-rose-100 shadow-sm animate-pulse">
                              <Pencil size={12} />
                            </div>
                          ) : item.link && (
                            <a href={item.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-rose-400 p-2 bg-rose-50 rounded-xl flex items-center gap-1 border border-rose-100/50 active:scale-90 transition-all shadow-sm">
                              <MapPin size={14} />
                              <span className="text-[9px] font-black tracking-tighter">導覽</span>
                            </a>
                          )}
                        </div>
                      </div>
                      <div className={`space-y-1 p-4 rounded-[1.8rem] border transition-all ${
                        item.color === 'red' 
                          ? 'bg-red-50 border-red-500 border-4 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse-slow' 
                          : item.isPinned 
                            ? 'bg-rose-50/20 border-rose-200 border-2 shadow-inner shadow-rose-100/50'
                            : (isEditMode ? 'bg-rose-50/30 border-rose-100 border-dashed' : 'bg-gray-50/30 border-gray-50/50')
                      }`}>
                        <h4 className={`text-base font-black leading-snug ${item.color === 'red' ? 'text-red-600 italic' : 'text-gray-800'}`}>{item.title}</h4>
                        {item.description && (
                          <p className={`text-[10px] font-black leading-relaxed italic pr-2 ${
                            item.color === 'red' || item.descColor === 'red' ? 'text-red-400' : 'text-gray-400'
                          }`}>
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isEditMode && (
                  <button onClick={() => openEditModal(itineraryDays.findIndex(d => d.day === selectedDay), null)} className="w-full flex items-center justify-center gap-2 py-5 bg-rose-50 border-2 border-dashed border-rose-200 rounded-[2rem] text-rose-400 font-black italic hover:bg-rose-100 transition-all text-sm shadow-inner">
                    <Plus size={20} /> 新增行程項目
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[3rem] shadow-inner border border-rose-50">
           <p className="text-rose-300 font-black text-sm italic">目前還沒有行程，快來編輯吧！</p>
        </div>
      )}

      {/* 密碼驗證彈窗 */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-white animate-in fade-in duration-300">
           <div className={`bg-white w-full max-w-xs rounded-[3rem] p-8 shadow-2xl border-4 border-rose-100 transition-transform ${passwordError ? 'animate-shake' : ''}`}>
              <div className="flex flex-col items-center text-center gap-5">
                 <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shadow-inner"><Lock size={32} /></div>
                 <h3 className="text-xl font-black text-gray-800 tracking-tight italic">管理員驗證</h3>
                 <form onSubmit={verifyPassword} className="w-full space-y-5">
                    <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="請輸入密碼..." autoFocus className={`w-full bg-rose-50/30 border-2 rounded-2xl p-4 text-center text-2xl font-black outline-none transition-all ${passwordError ? 'border-red-400 text-red-500' : 'border-rose-100 focus:border-rose-400 text-gray-700'}`} />
                    <div className="flex gap-3">
                       <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-[11px] uppercase tracking-widest">取消</button>
                       <button type="submit" className="flex-[2] py-4 bg-rose-500 text-white rounded-2xl font-black text-[11px] uppercase shadow-lg shadow-rose-200 active:scale-95">確認解鎖</button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}

      {/* 編輯項目 Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white animate-in slide-in-from-bottom duration-500 overflow-hidden">
          <div className="w-full h-full flex flex-col max-w-md mx-auto relative pt-14 px-7 pb-10 overflow-y-auto scrollbar-hide">
            <button 
              onClick={() => setEditingItem(null)} 
              className="fixed top-6 right-6 p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors z-[210]"
            >
              <X size={24} />
            </button>

            <div className="space-y-6">
              <div className="mb-2">
                <h3 className="text-3xl font-black text-gray-800 italic">{editingItem.itemIdx === null ? '✨ 新增行程' : '✏️ 編輯行程'}</h3>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Editing Mode</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-rose-300 uppercase tracking-widest px-1">時間 Time</label>
                  <input type="time" value={editingItem.data.time || ''} onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, time: e.target.value } })} className="w-full bg-rose-50/30 border-2 border-rose-100 rounded-2xl p-4 font-black text-gray-700 outline-none focus:border-rose-300 transition-all text-lg" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-rose-300 uppercase tracking-widest px-1">標題 Title</label>
                  <input type="text" value={editingItem.data.title || ''} onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })} placeholder="行程名稱..." className="w-full bg-rose-50/30 border-2 border-rose-100 rounded-2xl p-4 font-black text-gray-700 outline-none focus:border-rose-300 transition-all text-lg" />
                </div>
                
                <div className="flex gap-4 px-1">
                   <div className="flex-1 flex items-center gap-2 p-3 bg-rose-50/50 rounded-2xl border border-rose-100 cursor-pointer active:scale-95 transition-all" onClick={() => setEditingItem({ ...editingItem, data: { ...editingItem.data, isPinned: !editingItem.data.isPinned } })}>
                      <input type="checkbox" checked={editingItem.data.isPinned || false} readOnly className="w-5 h-5 rounded accent-rose-500" />
                      <label className="text-[11px] font-black text-rose-600 uppercase tracking-widest cursor-pointer flex items-center gap-1.5">
                        <Pin size={12} className={editingItem.data.isPinned ? 'fill-rose-500' : ''} /> 置頂行程
                      </label>
                   </div>
                   <div className="flex-1 flex items-center gap-2 p-3 bg-red-50/50 rounded-2xl border border-red-100 cursor-pointer active:scale-95 transition-all" onClick={() => setEditingItem({ ...editingItem, data: { ...editingItem.data, color: editingItem.data.color === 'red' ? '' : 'red' } })}>
                      <input type="checkbox" checked={editingItem.data.color === 'red'} readOnly className="w-5 h-5 rounded accent-red-500" />
                      <label className="text-[11px] font-black text-red-500 uppercase tracking-widest cursor-pointer">重要標記</label>
                   </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-rose-300 uppercase tracking-widest px-1">類型 Category</label>
                  <select value={editingItem.data.type || 'spot'} onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, type: e.target.value as any } })} className="w-full bg-rose-50/30 border-2 border-rose-100 rounded-2xl p-4 font-black text-gray-700 outline-none focus:border-rose-300 transition-all appearance-none text-lg">
                    <option value="spot">景點 Visit</option><option value="food">美食 Food</option><option value="transport">交通 Transit</option><option value="flight">航班 Flight</option>
                    <option value="stay">住宿 Stay</option><option value="shopping">購物 Shop</option><option value="onsen">溫泉 Onsen</option><option value="shrine">神社 Shrine</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-rose-300 uppercase tracking-widest">描述文字與顏色 Description</label>
                    <div className="flex gap-2">
                       <button 
                         onClick={() => setEditingItem({ ...editingItem, data: { ...editingItem.data, descColor: 'grey' } })}
                         className={`w-6 h-6 rounded-full border-2 ${editingItem.data.descColor === 'grey' || !editingItem.data.descColor ? 'border-rose-400 scale-110' : 'border-transparent'} bg-gray-400`}
                       ></button>
                       <button 
                         onClick={() => setEditingItem({ ...editingItem, data: { ...editingItem.data, descColor: 'red' } })}
                         className={`w-6 h-6 rounded-full border-2 ${editingItem.data.descColor === 'red' ? 'border-rose-400 scale-110' : 'border-transparent'} bg-red-500`}
                       ></button>
                    </div>
                  </div>
                  <textarea value={editingItem.data.description || ''} onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, description: e.target.value } })} placeholder="行程細節與備註..." className={`w-full h-32 bg-rose-50/30 border-2 border-rose-100 rounded-2xl p-4 font-bold outline-none focus:border-rose-300 transition-all resize-none text-lg ${editingItem.data.descColor === 'red' ? 'text-red-500' : 'text-gray-600'}`} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-rose-300 uppercase tracking-widest px-1">地圖連結 Map URL</label>
                  <input type="text" value={editingItem.data.link || ''} onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, link: e.target.value } })} placeholder="貼上 Google Maps 分享連結" className="w-full bg-rose-50/30 border-2 border-rose-100 rounded-2xl p-4 font-bold text-gray-600 outline-none focus:border-rose-300 transition-all text-sm" />
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-6">
                 <button onClick={saveEdit} className="w-full py-6 bg-rose-500 text-white rounded-[2rem] font-black shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all text-xl border-b-4 border-black/10">
                   <Check size={24} /> 儲存變更
                 </button>
                 
                 {editingItem.itemIdx !== null && (
                   <button 
                     onClick={handleDeleteItem} 
                     className="w-full py-5 bg-red-50 text-red-500 rounded-[2rem] font-black flex items-center justify-center gap-3 border-2 border-red-100 active:scale-95 transition-all text-lg"
                   >
                     <Trash2 size={22} /> 刪除此項行程
                   </button>
                 )}
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .animate-shake { animation: shake 0.2s ease-in-out infinite; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .animate-pulse-slow { animation: pulse-slow 2s infinite ease-in-out; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Itinerary;