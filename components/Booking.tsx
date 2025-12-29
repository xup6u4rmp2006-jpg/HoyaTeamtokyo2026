import React, { useState, useEffect } from 'react';
import { ITINERARY_DATA } from '../constants';
import { Plane, Home, Car, Ticket, MapPin, Navigation, CalendarDays, ArrowRight, Briefcase, Luggage, ExternalLink, Clock, Users, Info, Sparkles, Shirt, Lock, Unlock, Pencil, X, Check, Loader2, Plus, Trash2, AlertCircle } from 'lucide-react';
import { db } from '../services/firebase';
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { FlightInfo } from '../types';

type SubTabType = 'flight' | 'stay' | 'car' | 'ticket';

interface StayItem {
  id: string;
  title: string;
  description: string;
  address: string;
  link: string;
  images: string[];
  stayDates: { from: string; to: string };
  day: number;
}

interface TicketItem {
  id: string;
  title: string;
  description: string;
  category: string;
  attire: string[];
  link: string;
  image: string;
  day?: string;
  time?: string;
}

interface BookingProps {
  onModalToggle?: (isOpen: boolean) => void;
}

const DEFAULT_FLIGHTS: FlightInfo[] = [
  {
    id: 'outbound',
    typeLabel: '去程',
    flightNo: 'GK12',
    airline: '捷星航空',
    date: '2026/3/1 (日)',
    depTime: '02:30',
    depPort: '桃園 TPE',
    arrTime: '06:25',
    arrPort: '成田 NRT',
    carryOnWeight: '7 KG',
    checkedWeight: '20 KG',
    isNextDay: false
  },
  {
    id: 'inbound',
    typeLabel: '回程',
    flightNo: 'GK11',
    airline: '捷星航空',
    date: '2026/3/9 (一)',
    depTime: '22:25',
    depPort: '成田 NRT',
    arrTime: '01:30',
    arrPort: '桃園 TPE',
    carryOnWeight: '7 KG',
    checkedWeight: '30 KG',
    isNextDay: true
  }
];

const Booking: React.FC<BookingProps> = ({ onModalToggle }) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('flight');
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [loading, setLoading] = useState(true);

  // 資料狀態
  const [stays, setStays] = useState<StayItem[]>([]);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [flights, setFlights] = useState<FlightInfo[]>(DEFAULT_FLIGHTS);

  // 編輯彈窗狀態
  const [editingStay, setEditingStay] = useState<StayItem | null>(null);
  const [editingTicket, setEditingTicket] = useState<TicketItem | null>(null);
  const [editingFlight, setEditingFlight] = useState<FlightInfo | null>(null);

  // 通知外部 Modal 狀態，以隱藏導航列
  useEffect(() => {
    const isAnyModalOpen = showPasswordModal || editingStay !== null || editingTicket !== null || editingFlight !== null;
    onModalToggle?.(isAnyModalOpen);
  }, [showPasswordModal, editingStay, editingTicket, editingFlight, onModalToggle]);

  // 初始化與監聽 Firebase
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "travelData", "booking_info"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStays(data.stays || []);
        setFlights(data.flights || DEFAULT_FLIGHTS);
        if (data.ticket && !data.tickets) {
          setTickets([data.ticket]);
        } else {
          setTickets(data.tickets || []);
        }
      } else {
        // 初始化預設資料
        const defaultStays: StayItem[] = ITINERARY_DATA.flatMap(day => 
          day.items.filter(item => item.type === 'stay').map(item => ({
            id: `stay-${day.day}-${item.title}`,
            title: item.title,
            address: item.address || '',
            description: item.description || '',
            link: item.link || '',
            images: item.images || (item.image ? [item.image] : []),
            stayDates: item.stayDates || { from: '3/1', to: '3/2' },
            day: day.day
          }))
        );
        const defaultTickets: TicketItem[] = [{
          id: 't1',
          title: 'TeamLab Planets TOKYO',
          description: 'teamLab Planets是位於東京豐洲，由藝術團隊teamLab創作的四個巨大的作品空間和兩個花園組成的「進入水中的美術館」和「與花朵融為一體的庭園」。人與他人一起，全身心地沉浸在巨大的作品中，身體與作品之間的邊界便會模糊。',
          category: '沈浸式數位藝術、水上體驗、感官藝術',
          attire: [
            '✨ 建議穿著短褲或好捲起的褲管 (需涉水)',
            '✨ 避免連身裙 (部分展區為鏡面地板)',
            '✨ 需赤腳進入 (現場提供免費置物櫃)'
          ],
          link: 'https://www.teamlab.art/zh-hant/e/planets/',
          image: 'https://imagedelivery.net/b5EBo9Uo-OK6SM09ZTkEZQ/89JNH3JuCgHZcGbACeD2vU/width=3840,quality=80',
          day: 'Day 6',
          time: '13:30'
        }];
        
        setDoc(doc(db, "travelData", "booking_info"), { stays: defaultStays, tickets: defaultTickets, flights: DEFAULT_FLIGHTS });
        setStays(defaultStays);
        setTickets(defaultTickets);
        setFlights(DEFAULT_FLIGHTS);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const saveToFirebase = async (data: any) => {
    await updateDoc(doc(db, "travelData", "booking_info"), data);
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      setIsEditMode(false);
    } else {
      setShowPasswordModal(true);
      setPasswordInput('');
    }
  };

  const verifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '1130') {
      setIsEditMode(true);
      setShowPasswordModal(false);
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 500);
    }
  };

  const saveStayEdit = async () => {
    if (!editingStay) return;
    const newStays = stays.map(s => s.id === editingStay.id ? editingStay : s);
    setStays(newStays);
    await saveToFirebase({ stays: newStays });
    setEditingStay(null);
  };

  const saveTicketEdit = async () => {
    if (!editingTicket) return;
    let newTickets;
    if (tickets.find(t => t.id === editingTicket.id)) {
      newTickets = tickets.map(t => t.id === editingTicket.id ? editingTicket : t);
    } else {
      newTickets = [...tickets, editingTicket];
    }
    setTickets(newTickets);
    await saveToFirebase({ tickets: newTickets });
    setEditingTicket(null);
  };

  const saveFlightEdit = async () => {
    if (!editingFlight) return;
    const newFlights = flights.map(f => f.id === editingFlight.id ? editingFlight : f);
    setFlights(newFlights);
    await saveToFirebase({ flights: newFlights });
    setEditingFlight(null);
  };

  const deleteTicket = async (id: string) => {
    if (!window.confirm('確定要刪除這張門票嗎？')) return;
    const newTickets = tickets.filter(t => t.id !== id);
    setTickets(newTickets);
    await saveToFirebase({ tickets: newTickets });
  };

  const addNewTicket = () => {
    const newTicket: TicketItem = {
      id: Date.now().toString(),
      title: '',
      description: '',
      category: '',
      attire: ['✨ '],
      link: '',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=1000',
      day: 'Day X',
      time: '00:00'
    };
    setEditingTicket(newTicket);
  };

  const subNavItems = [
    { id: 'flight', label: '機票', icon: <Plane size={18} />, color: 'rose' },
    { id: 'stay', label: '住宿', icon: <Home size={18} />, color: 'orange' },
    { id: 'car', label: '租車', icon: <Car size={18} />, color: 'emerald' },
    { id: 'ticket', label: '門票', icon: <Ticket size={18} />, color: 'blue' },
  ];

  const getColorClass = (color: string, active: boolean) => {
    if (!active) return 'text-gray-400 hover:bg-white/80';
    switch (color) {
      case 'rose': return 'bg-rose-800 text-white shadow-md scale-105';
      case 'orange': return 'bg-orange-600 text-white shadow-md scale-105';
      case 'emerald': return 'bg-emerald-700 text-white shadow-md scale-105';
      case 'blue': return 'bg-blue-800 text-white shadow-md scale-105';
      default: return 'bg-gray-500 text-white shadow-md scale-105';
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-rose-300">
      <Loader2 className="animate-spin mb-4" size={48} />
      <p className="font-black animate-pulse uppercase tracking-widest text-xs">預訂資料同步中...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2 mb-2">
        <h2 className="text-2xl font-bold text-rose-500 flex items-center gap-3">
          <span className="p-2 rounded-xl bg-rose-100 text-xl">🎫</span> 預訂與票券
        </h2>
        <button 
          onClick={handleEditToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isEditMode ? 'bg-rose-500 text-white shadow-lg' : 'bg-white text-rose-400 border border-rose-100 shadow-sm'}`}
        >
          {isEditMode ? <Unlock size={14} className="animate-pulse" /> : <Lock size={14} />}
          {isEditMode ? '結束編輯' : '解鎖修改'}
        </button>
      </div>

      <div className="flex justify-between bg-white/50 backdrop-blur-sm p-1.5 rounded-3xl border border-rose-100/50 shadow-sm overflow-x-auto scrollbar-hide">
        {subNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSubTab(item.id as SubTabType)}
            className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl transition-all duration-300 min-w-[70px] ${getColorClass(item.color, activeSubTab === item.id)}`}
          >
            {item.icon}
            <span className="text-xs font-bold">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 min-h-[400px] pb-10">
        {activeSubTab === 'flight' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
            <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-rose-50 relative overflow-hidden">
              <h3 className="text-lg font-bold text-rose-800 mb-5 flex items-center gap-3 uppercase tracking-wide">
                <span className="p-2 rounded-xl bg-rose-100">✈️</span> 航班資訊
              </h3>
              <div className="space-y-6">
                {flights.map((f) => (
                  <div key={f.id} className="p-5 bg-rose-50/50 rounded-3xl border border-rose-100 relative group">
                    {isEditMode && (
                      <button 
                        onClick={() => setEditingFlight(f)}
                        className="absolute top-3 right-3 z-30 p-2.5 bg-white/90 backdrop-blur rounded-full shadow-lg text-rose-600 hover:scale-110 active:scale-95 transition-all border border-rose-100"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-rose-800 uppercase tracking-widest">{f.typeLabel} {f.flightNo} · {f.airline}</span>
                        <span className="text-[10px] font-semibold text-gray-400">{f.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex flex-col"><span className="text-2xl font-bold text-gray-700">{f.depTime}</span><span className="text-[10px] font-semibold text-gray-400">{f.depPort}</span></div>
                      <div className="flex-1 px-4 relative flex items-center justify-center">
                         <div className="w-full border-t-2 border-dashed border-rose-200 absolute top-1/2 -translate-y-1/2"></div>
                         <Plane size={18} className="text-rose-400 rotate-45 z-10 bg-rose-50 px-1" />
                      </div>
                      <div className="flex flex-col text-right">
                        <div className="flex items-baseline justify-end gap-1">
                          <span className="text-2xl font-bold text-gray-700">{f.arrTime}</span>
                          {f.isNextDay && <span className="text-[10px] bg-rose-200 text-rose-700 px-1 rounded font-bold">+1</span>}
                        </div>
                        <span className="text-[10px] font-semibold text-gray-400">{f.arrPort}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t border-rose-100/50">
                      <div className="flex-1 flex items-center gap-2 bg-white/60 p-2.5 rounded-2xl border border-rose-100">
                        <Briefcase size={14} className="text-rose-400" />
                        <div className="flex flex-col"><span className="text-[8px] font-bold text-gray-400 uppercase">手提 Carry-on</span><span className="text-xs font-bold text-rose-600">{f.carryOnWeight}</span></div>
                      </div>
                      <div className={`flex-1 flex items-center gap-2 ${f.id === 'inbound' ? 'bg-rose-600 shadow-md border-rose-700' : 'bg-white/60 border-rose-100'} p-2.5 rounded-2xl border`}>
                        <Luggage size={14} className={f.id === 'inbound' ? 'text-white' : 'text-rose-400'} />
                        <div className="flex flex-col">
                          <span className={`text-[8px] font-bold ${f.id === 'inbound' ? 'text-rose-100' : 'text-gray-400'} uppercase`}>託運 Checked</span>
                          <span className={`text-xs font-bold ${f.id === 'inbound' ? 'text-white' : 'text-rose-600'}`}>{f.checkedWeight}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'stay' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8">
            {stays.map((stay) => (
              <div key={stay.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-lg border border-orange-100 relative group transition-all hover:shadow-2xl">
                {isEditMode && (
                  <button 
                    onClick={() => setEditingStay(stay)}
                    className="absolute top-4 right-4 z-30 p-3 bg-white/90 backdrop-blur rounded-full shadow-lg text-orange-600 hover:scale-110 active:scale-95 transition-all border border-orange-100"
                  >
                    <Pencil size={18} />
                  </button>
                )}
                {stay.images && stay.images.length > 0 && (
                  <div className="h-56 w-full relative group/slider">
                    <div className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                      {stay.images.map((imgUrl, imgIdx) => (
                        <div key={imgIdx} className="flex-shrink-0 w-full h-full snap-start relative">
                          <img src={imgUrl} alt={`${stay.title} - ${imgIdx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <div className="absolute top-4 left-4 flex gap-2">
                       <span className="px-4 py-2 bg-white/90 backdrop-blur shadow-sm rounded-full text-[10px] font-bold text-orange-600 uppercase tracking-widest">
                         🏠 Day {stay.day}
                       </span>
                    </div>
                  </div>
                )}
                <div className="p-7 space-y-6">
                  <h4 className="text-2xl font-bold text-gray-800">{stay.title}</h4>
                  <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-3xl border border-orange-100 shadow-inner">
                    <div className="p-3 bg-white rounded-2xl text-orange-600 shadow-sm"><CalendarDays size={20} /></div>
                    <div className="flex flex-1 items-center justify-between">
                      <div className="flex flex-col"><span className="text-[9px] font-bold text-orange-400 uppercase tracking-widest">入住 Check-in</span><span className="text-lg font-black text-orange-700">{stay.stayDates.from}</span></div>
                      <div className="text-orange-200"><ArrowRight size={20} /></div>
                      <div className="flex flex-col text-right"><span className="text-[9px] font-bold text-orange-400 uppercase tracking-widest">退房 Check-out</span><span className="text-lg font-black text-orange-700">{stay.stayDates.to}</span></div>
                    </div>
                  </div>
                  {stay.description && <p className="text-sm font-semibold text-gray-500 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100 italic">{stay.description}</p>}
                  <div className="space-y-3">
                     <div className="flex items-start gap-4 p-5 bg-white rounded-3xl border-2 border-dashed border-orange-100">
                        <div className="p-3 bg-orange-100 rounded-2xl text-orange-600"><MapPin size={24} /></div>
                        <div className="flex flex-col gap-1"><span className="text-[10px] font-bold text-orange-300 uppercase tracking-widest">地址 Address</span><p className="text-base font-bold text-gray-700 leading-snug">{stay.address || '尚未填寫地址'}</p></div>
                     </div>
                     {stay.link && <a href={stay.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-4 bg-orange-600 text-white rounded-2xl font-bold transition-all shadow-md active:scale-95"><Navigation size={18} /> 開啟 Google Maps 導覽</a>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSubTab === 'car' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-emerald-50 relative overflow-hidden">
              <h3 className="text-lg font-bold text-emerald-800 mb-6 flex items-center gap-3 uppercase tracking-wide">
                <span className="p-2 rounded-xl bg-emerald-100">🚗</span> 租車預訂與地點
              </h3>
              
              <div className="space-y-6">
                {/* 時間資訊 */}
                <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="text-emerald-500" size={18} />
                    <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">租車時間 Rental Times</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/80 p-5 rounded-2xl border border-emerald-50 shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-gray-400">取車 Pickup</span>
                      <span className="text-base font-black text-emerald-700 italic">3/1 10:30</span>
                    </div>
                    <ArrowRight className="text-emerald-200" size={20} />
                    <div className="flex flex-col text-right">
                      <span className="text-[9px] font-bold text-gray-400">還車 Drop-off</span>
                      <span className="text-base font-black text-emerald-700 italic">3/3 10:30</span>
                    </div>
                  </div>
                </div>

                {/* 地點與導航 */}
                <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="text-emerald-500" size={18} />
                    <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">租還地點與導航 Locations</span>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white/80 p-5 rounded-2xl border border-emerald-50 shadow-sm flex flex-col gap-3">
                       <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] font-bold text-emerald-400 uppercase">取車點 Pickup Point</span>
                          <p className="text-sm font-black text-gray-700">TOYOTA租車 富士河口湖店</p>
                       </div>
                       <a href="https://maps.app.goo.gl/nCN4jSMqjMfDgDoQ9?g_st=ic" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black shadow-sm active:scale-95 transition-all">
                          <Navigation size={12} /> 開啟取車點導覽
                       </a>
                    </div>
                    <div className="bg-white/80 p-5 rounded-2xl border border-emerald-50 shadow-sm flex flex-col gap-3">
                       <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] font-bold text-emerald-400 uppercase">還車點 Drop-off Point</span>
                          <p className="text-sm font-black text-gray-700">TOYOTA租車 御殿場站前店</p>
                       </div>
                       <a href="https://maps.app.goo.gl/TnAM3fCZM2fKPJD76?g_st=ic" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black shadow-sm active:scale-95 transition-all">
                          <Navigation size={12} /> 開啟還車點導覽
                       </a>
                    </div>
                  </div>
                </div>

                {/* 戰車車款 */}
                <div className="space-y-4 px-2">
                  <div className="flex items-center gap-3">
                    <Users className="text-emerald-500" size={18} />
                    <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">預訂車款 Models</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-3 p-4 bg-white rounded-3xl border border-emerald-50 shadow-sm items-center text-center">
                      <div className="w-full h-24 rounded-2xl overflow-hidden bg-gray-50 border border-emerald-50">
                        <img src="https://car-sys.tabirai.net/App_Supplier/img/car/682_1_O.jpg" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-[12px] font-black text-gray-800 tracking-tight">SIENTA (6人座)</span>
                    </div>
                    <div className="flex flex-col gap-3 p-4 bg-white rounded-3xl border border-emerald-50 shadow-sm items-center text-center">
                      <div className="w-full h-24 rounded-2xl overflow-hidden bg-gray-50 border border-emerald-50">
                        <img src="https://car-sys.tabirai.net/App_Supplier/img/car/597_1_O.jpg" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-[12px] font-black text-gray-800 tracking-tight">NOAH / VOXY (8人座)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'ticket' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8">
            {isEditMode && (
              <button 
                onClick={addNewTicket}
                className="w-full py-5 bg-blue-50 border-2 border-dashed border-blue-200 rounded-[2rem] text-blue-600 font-black italic flex items-center justify-center gap-3 active:scale-95 transition-all shadow-sm"
              >
                <Plus size={24} /> 新增門票預訂
              </button>
            )}

            {tickets.length === 0 && !isEditMode && (
              <div className="text-center py-20 text-blue-200 opacity-50 flex flex-col items-center gap-4">
                 <Ticket size={64} strokeWidth={1} />
                 <p className="font-black italic">尚無門票資訊</p>
              </div>
            )}

            {tickets.map(ticket => (
              <div key={ticket.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-lg border border-blue-100 relative group transition-all hover:shadow-2xl">
                {isEditMode && (
                  <div className="absolute top-4 right-4 z-30 flex gap-2">
                    <button 
                      onClick={() => setEditingTicket(ticket)}
                      className="p-3 bg-white/90 backdrop-blur rounded-full shadow-lg text-blue-600 hover:scale-110 active:scale-95 transition-all border border-blue-100"
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => deleteTicket(ticket.id)}
                      className="p-3 bg-white/90 backdrop-blur rounded-full shadow-lg text-rose-500 hover:scale-110 active:scale-95 transition-all border border-rose-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
                <div className="h-56 w-full relative overflow-hidden">
                  <img src={ticket.image} alt={ticket.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-6 text-left">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">{ticket.day} | {ticket.time} 場次</span>
                      <h4 className="text-2xl font-black text-white drop-shadow-md leading-tight">{ticket.title || '新門票'}</h4>
                    </div>
                  </div>
                </div>
                
                <div className="p-7 space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-blue-600 font-black">
                      <Info size={18} />
                      <span className="text-sm uppercase tracking-widest">展覽內容介紹 Description</span>
                    </div>
                    <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 shadow-inner">
                      <p className="text-sm font-bold text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {ticket.description || '尚未填寫介紹'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-5 bg-white rounded-3xl border border-blue-100 shadow-sm space-y-2 text-left">
                      <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                        <Sparkles size={14} /> 活動類別 Category
                      </div>
                      <p className="text-sm font-black text-gray-700 pl-1">{ticket.category || '未設定'}</p>
                    </div>

                    <div className="p-5 bg-white rounded-3xl border border-blue-100 shadow-sm space-y-3 text-left">
                      <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                        <Shirt size={14} /> 建議穿著 Recommended Attire
                      </div>
                      <ul className="text-[11px] font-black text-blue-700 space-y-2">
                        {ticket.attire.map((a, i) => (
                          <li key={i} className="flex items-center gap-2 bg-blue-50/50 px-3 py-2 rounded-xl border border-blue-100/50">{a}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {ticket.link && (
                    <a href={ticket.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 w-full py-5 bg-blue-800 text-white rounded-[2rem] font-black transition-all shadow-lg active:scale-95 text-lg">
                      <ExternalLink size={20} /> 前往官網查看詳情
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 密碼驗證彈窗 */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-white/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className={`bg-white w-full max-w-xs rounded-[3rem] p-8 shadow-2xl border-4 border-rose-100 transition-transform ${passwordError ? 'animate-shake' : ''}`}>
              <div className="flex flex-col items-center text-center gap-5">
                 <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shadow-inner"><Lock size={32} /></div>
                 <h3 className="text-xl font-black text-gray-800 tracking-tight italic">管理員驗證</h3>
                 <form onSubmit={verifyPassword} className="w-full space-y-5">
                    <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="請輸入密碼..." autoFocus className={`w-full bg-rose-50/30 border-2 rounded-2xl p-4 text-center text-2xl font-black outline-none transition-all ${passwordError ? 'border-red-400 text-red-500' : 'border-rose-100 focus:border-rose-400 text-gray-700'}`} />
                    <div className="flex gap-3">
                       <button type="button" onClick={() => {setShowPasswordModal(false);}} className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-[11px] uppercase tracking-widest">取消</button>
                       <button type="submit" className="flex-[2] py-4 bg-rose-500 text-white rounded-2xl font-black text-[11px] uppercase shadow-lg">確認</button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}

      {/* 機票編輯彈窗 */}
      {editingFlight && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white animate-in slide-in-from-bottom duration-500 overflow-hidden">
          <div className="w-full h-full flex flex-col max-w-md mx-auto relative pt-14 px-7 pb-10 overflow-y-auto scrollbar-hide">
            <button onClick={() => setEditingFlight(null)} className="fixed top-6 right-6 p-2 bg-gray-100 text-gray-500 rounded-full z-[10000]"><X size={24} /></button>
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-gray-800 italic flex items-center gap-2"><Plane className="text-rose-500" /> 編輯機票資訊</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest px-1">航班編號</label>
                    <input type="text" value={editingFlight.flightNo} onChange={e => setEditingFlight({...editingFlight, flightNo: e.target.value})} className="w-full bg-rose-50/30 border-2 border-rose-100 rounded-2xl p-4 font-black text-gray-700 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest px-1">航空公司</label>
                    <input type="text" value={editingFlight.airline} onChange={e => setEditingFlight({...editingFlight, airline: e.target.value})} className="w-full bg-rose-50/30 border-2 border-rose-100 rounded-2xl p-4 font-black text-gray-700 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest px-1">日期日期</label>
                  <input type="text" value={editingFlight.date} onChange={e => setEditingFlight({...editingFlight, date: e.target.value})} className="w-full bg-rose-50/30 border-2 border-rose-100 rounded-2xl p-4 font-black text-gray-700 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                   <div className="space-y-4">
                      <div className="p-4 bg-rose-50/50 rounded-3xl border border-rose-100">
                        <label className="text-[9px] font-black text-rose-400 uppercase block mb-2">起飛 Dep</label>
                        <input type="text" value={editingFlight.depTime} onChange={e => setEditingFlight({...editingFlight, depTime: e.target.value})} placeholder="00:00" className="w-full bg-white border border-rose-100 rounded-xl p-2 text-center font-black text-gray-700 mb-2" />
                        <input type="text" value={editingFlight.depPort} onChange={e => setEditingFlight({...editingFlight, depPort: e.target.value})} placeholder="機場代碼" className="w-full bg-white border border-rose-100 rounded-xl p-2 text-center text-xs font-bold text-gray-400" />
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="p-4 bg-rose-50/50 rounded-3xl border border-rose-100">
                        <label className="text-[9px] font-black text-rose-400 uppercase block mb-2">抵達 Arr</label>
                        <input type="text" value={editingFlight.arrTime} onChange={e => setEditingFlight({...editingFlight, arrTime: e.target.value})} placeholder="00:00" className="w-full bg-white border border-rose-100 rounded-xl p-2 text-center font-black text-gray-700 mb-2" />
                        <input type="text" value={editingFlight.arrPort} onChange={e => setEditingFlight({...editingFlight, arrPort: e.target.value})} placeholder="機場代碼" className="w-full bg-white border border-rose-100 rounded-xl p-2 text-center text-xs font-bold text-gray-400" />
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <input type="checkbox" checked={editingFlight.isNextDay} onChange={e => setEditingFlight({...editingFlight, isNextDay: e.target.checked})} className="w-5 h-5 rounded accent-rose-500" id="nextDay" />
                  <label htmlFor="nextDay" className="text-sm font-black text-gray-600">抵達時間為隔日 (+1)</label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest px-1">手提重量</label>
                    <input type="text" value={editingFlight.carryOnWeight} onChange={e => setEditingFlight({...editingFlight, carryOnWeight: e.target.value})} className="w-full bg-rose-50/30 border-2 border-rose-100 rounded-2xl p-4 font-black text-gray-700 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest px-1">託運重量</label>
                    <input type="text" value={editingFlight.checkedWeight} onChange={e => setEditingFlight({...editingFlight, checkedWeight: e.target.value})} className="w-full bg-rose-50/30 border-2 border-rose-100 rounded-2xl p-4 font-black text-gray-700 outline-none" />
                  </div>
                </div>
              </div>
              <button onClick={saveFlightEdit} className="w-full py-5 bg-rose-700 text-white rounded-[2rem] font-black shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all mt-4">
                <Check size={24} /> 儲存機票資訊
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 住宿編輯彈窗 */}
      {editingStay && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white animate-in slide-in-from-bottom duration-500 overflow-hidden">
          <div className="w-full h-full flex flex-col max-w-md mx-auto relative pt-14 px-7 pb-10 overflow-y-auto scrollbar-hide">
            <button onClick={() => setEditingStay(null)} className="fixed top-6 right-6 p-2 bg-gray-100 text-gray-500 rounded-full z-[10000]"><X size={24} /></button>
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-gray-800 italic flex items-center gap-2"><Home className="text-orange-500" /> 編輯住宿資訊</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-orange-400 uppercase tracking-widest px-1">住宿名稱</label>
                  <input type="text" value={editingStay.title} onChange={e => setEditingStay({...editingStay, title: e.target.value})} className="w-full bg-orange-50/30 border-2 border-orange-100 rounded-2xl p-4 font-black text-gray-700 outline-none" />
                </div>
                <div className="flex gap-3">
                   <div className="flex-1">
                      <label className="text-[10px] font-black text-orange-400 uppercase tracking-widest px-1">入住</label>
                      <input type="text" value={editingStay.stayDates.from} onChange={e => setEditingStay({...editingStay, stayDates: {...editingStay.stayDates, from: e.target.value}})} className="w-full bg-orange-50/30 border-2 border-orange-100 rounded-2xl p-4 font-black text-gray-700 outline-none" />
                   </div>
                   <div className="flex-1">
                      <label className="text-[10px] font-black text-orange-400 uppercase tracking-widest px-1">退房</label>
                      <input type="text" value={editingStay.stayDates.to} onChange={e => setEditingStay({...editingStay, stayDates: {...editingStay.stayDates, to: e.target.value}})} className="w-full bg-orange-50/30 border-2 border-orange-100 rounded-2xl p-4 font-black text-gray-700 outline-none" />
                   </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-orange-400 uppercase tracking-widest px-1">地址</label>
                  <input type="text" value={editingStay.address} onChange={e => setEditingStay({...editingStay, address: e.target.value})} className="w-full bg-orange-50/30 border-2 border-orange-100 rounded-2xl p-4 font-black text-gray-700 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-orange-400 uppercase tracking-widest px-1">描述與備註</label>
                  <textarea value={editingStay.description} onChange={e => setEditingStay({...editingStay, description: e.target.value})} className="w-full h-32 bg-orange-50/30 border-2 border-orange-100 rounded-2xl p-4 font-bold text-gray-600 outline-none resize-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-orange-400 uppercase tracking-widest px-1">Google Maps 連結</label>
                  <input type="text" value={editingStay.link} onChange={e => setEditingStay({...editingStay, link: e.target.value})} className="w-full bg-orange-50/30 border-2 border-orange-100 rounded-2xl p-4 font-bold text-gray-500 outline-none" />
                </div>
              </div>
              <button onClick={saveStayEdit} className="w-full py-5 bg-orange-600 text-white rounded-[2rem] font-black shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                <Check size={24} /> 儲存變更
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 門票編輯彈窗 */}
      {editingTicket && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white animate-in slide-in-from-bottom duration-500 overflow-hidden">
          <div className="w-full h-full flex flex-col max-w-md mx-auto relative pt-14 px-7 pb-10 overflow-y-auto scrollbar-hide">
            <button onClick={() => setEditingTicket(null)} className="fixed top-6 right-6 p-2 bg-gray-100 text-gray-500 rounded-full z-[10000]"><X size={24} /></button>
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-gray-800 italic flex items-center gap-2"><Ticket className="text-blue-500" /> 編輯門票資訊</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest px-1">門票標題</label>
                  <input type="text" value={editingTicket.title} onChange={e => setEditingTicket({...editingTicket, title: e.target.value})} className="w-full bg-blue-50/30 border-2 border-blue-100 rounded-2xl p-4 font-black text-gray-700 outline-none" />
                </div>
                <div className="flex gap-3">
                   <div className="flex-1">
                      <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest px-1">天數 (Day X)</label>
                      <input type="text" value={editingTicket.day} onChange={e => setEditingTicket({...editingTicket, day: e.target.value})} className="w-full bg-blue-50/30 border-2 border-blue-100 rounded-2xl p-4 font-black text-gray-700 outline-none" />
                   </div>
                   <div className="flex-1">
                      <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest px-1">場次時間</label>
                      <input type="text" value={editingTicket.time} onChange={e => setEditingTicket({...editingTicket, time: e.target.value})} className="w-full bg-blue-50/30 border-2 border-blue-100 rounded-2xl p-4 font-black text-gray-700 outline-none" />
                   </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest px-1">活動類別</label>
                  <input type="text" value={editingTicket.category} onChange={e => setEditingTicket({...editingTicket, category: e.target.value})} className="w-full bg-blue-50/30 border-2 border-blue-100 rounded-2xl p-4 font-black text-gray-700 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest px-1">詳細內容</label>
                  <textarea value={editingTicket.description} onChange={e => setEditingTicket({...editingTicket, description: e.target.value})} className="w-full h-40 bg-blue-50/30 border-2 border-blue-100 rounded-2xl p-4 font-bold text-gray-600 outline-none resize-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest px-1">建議穿著 (一行一個)</label>
                  <textarea value={editingTicket.attire.join('\n')} onChange={e => setEditingTicket({...editingTicket, attire: e.target.value.split('\n')})} className="w-full h-32 bg-blue-50/30 border-2 border-blue-100 rounded-2xl p-4 font-bold text-gray-600 outline-none resize-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest px-1">官網連結</label>
                  <input type="text" value={editingTicket.link} onChange={e => setEditingTicket({...editingTicket, link: e.target.value})} className="w-full bg-blue-50/30 border-2 border-blue-100 rounded-2xl p-4 font-bold text-gray-500 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest px-1">圖片連結 URL</label>
                  <input type="text" value={editingTicket.image} onChange={e => setEditingTicket({...editingTicket, image: e.target.value})} className="w-full bg-blue-50/30 border-2 border-blue-100 rounded-2xl p-4 font-bold text-gray-500 outline-none" />
                </div>
              </div>
              <button onClick={saveTicketEdit} className="w-full py-5 bg-blue-800 text-white rounded-[2rem] font-black shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                <Check size={24} /> 儲存門票
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .animate-shake { animation: shake 0.2s ease-in-out infinite; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default Booking;