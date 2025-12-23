
// @google/genai Coding Guidelines followed: Using React hooks correctly.
import React, { useState } from 'react';
import { ITINERARY_DATA } from '../constants';
import { Plane, Home, Car, Ticket, MapPin, Navigation, CalendarDays, ArrowRight, Briefcase, Luggage, Clock, Users, Sparkles, ExternalLink } from 'lucide-react';

type SubTabType = 'flight' | 'stay' | 'car' | 'ticket';

const Booking: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('flight');

  const stayBookings = ITINERARY_DATA.flatMap(day => 
    day.items.filter(item => item.type === 'stay').map(item => ({
      ...item,
      day: day.day,
      date: day.date
    }))
  );

  const carRental = ITINERARY_DATA.flatMap(day => 
    day.items.filter(item => item.type === 'car').map(item => ({
      ...item,
      day: day.day,
      date: day.date
    }))
  )[0]; // 假設主要租車資訊在 Day 1

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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-rose-500 px-2 flex items-center gap-3 mb-2">
        <span className="p-2 rounded-xl bg-rose-100 text-xl">🎫</span> 預訂與票券
      </h2>

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

      <div className="mt-4 min-h-[400px]">
        {activeSubTab === 'flight' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
            <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-rose-50 relative overflow-hidden">
              <h3 className="text-lg font-bold text-rose-800 mb-5 flex items-center gap-3 uppercase tracking-wide">
                <span className="p-2 rounded-xl bg-rose-100">✈️</span> 航班資訊
              </h3>
              <div className="space-y-6">
                {/* 去程航班 */}
                <div className="p-5 bg-rose-50/50 rounded-3xl border border-rose-100 relative">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-rose-800 uppercase tracking-widest">去程 GK12 · 捷星航空</span>
                      <span className="text-[10px] font-semibold text-gray-400">2026/3/1 (日)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col"><span className="text-2xl font-bold text-gray-700">02:30</span><span className="text-[10px] font-semibold text-gray-400">桃園 TPE</span></div>
                    <div className="flex-1 px-4 relative flex items-center justify-center">
                       <div className="w-full border-t-2 border-dashed border-rose-200 absolute top-1/2 -translate-y-1/2"></div>
                       <Plane size={18} className="text-rose-400 rotate-45 z-10 bg-rose-50 px-1" />
                    </div>
                    <div className="flex flex-col text-right"><span className="text-2xl font-bold text-gray-700">06:25</span><span className="text-[10px] font-semibold text-gray-400">成田 NRT</span></div>
                  </div>

                  {/* 去程行李資訊 */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-rose-100/50">
                    <div className="flex-1 flex items-center gap-2 bg-white/60 p-2.5 rounded-2xl border border-rose-100">
                      <Briefcase size={14} className="text-rose-400" />
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-gray-400 uppercase">手提 Carry-on</span>
                        <span className="text-xs font-bold text-rose-600">7 KG</span>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center gap-2 bg-white/60 p-2.5 rounded-2xl border border-rose-100">
                      <Luggage size={14} className="text-rose-400" />
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-gray-400 uppercase">托運 Checked</span>
                        <span className="text-xs font-bold text-rose-600">20 KG</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 回程航班 */}
                <div className="p-5 bg-rose-50/50 rounded-3xl border border-rose-100 relative">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-rose-800 uppercase tracking-widest">回程 GK11 · 捷星航空</span>
                      <span className="text-[10px] font-semibold text-gray-400">2026/3/9 (一)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col"><span className="text-2xl font-bold text-gray-700">22:25</span><span className="text-[10px] font-semibold text-gray-400">成田 NRT</span></div>
                    <div className="flex-1 px-4 relative flex items-center justify-center">
                       <div className="w-full border-t-2 border-dashed border-rose-200 absolute top-1/2 -translate-y-1/2"></div>
                       <Plane size={18} className="text-rose-400 rotate-45 z-10 bg-rose-50 px-1" />
                    </div>
                    <div className="flex flex-col text-right">
                      <div className="flex items-baseline justify-end gap-1"><span className="text-2xl font-bold text-gray-700">01:30</span><span className="text-[10px] bg-rose-200 text-rose-700 px-1 rounded font-bold">+1</span></div>
                      <span className="text-[10px] font-semibold text-gray-400">桃園 TPE</span>
                    </div>
                  </div>

                  {/* 回程行李資訊 (加重版) */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-rose-100/50">
                    <div className="flex-1 flex items-center gap-2 bg-white/60 p-2.5 rounded-2xl border border-rose-100">
                      <Briefcase size={14} className="text-rose-400" />
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-gray-400 uppercase">手提 Carry-on</span>
                        <span className="text-xs font-bold text-rose-600">7 KG</span>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center gap-2 bg-rose-100 p-2.5 rounded-2xl border border-rose-200 shadow-inner">
                      <Luggage size={14} className="text-rose-600 animate-pulse" />
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-gray-400 uppercase">托運 Checked (加量!)</span>
                        <span className="text-sm font-black text-rose-700">30 KG</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'stay' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8">
            {stayBookings.map((booking, index) => (
              <div key={index} className="bg-white rounded-[2.5rem] overflow-hidden shadow-lg border border-orange-100 relative group transition-all hover:shadow-2xl">
                {booking.image && (
                  <div className="h-56 w-full relative overflow-hidden">
                    <img src={booking.image} alt={booking.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                    <div className="absolute top-4 left-4">
                       <span className="px-4 py-2 bg-white/90 backdrop-blur shadow-sm rounded-full text-[10px] font-bold text-orange-600 uppercase tracking-widest">
                         住宿行程 Stay Sequence
                       </span>
                    </div>
                  </div>
                )}
                
                <div className="p-7 space-y-6">
                  <div className="flex flex-col gap-1">
                    <h4 className="text-2xl font-bold text-gray-800">{booking.title}</h4>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Day {booking.day} Check-in</span>
                    </div>
                  </div>

                  {/* 住宿日期特別標示區塊 */}
                  {booking.stayDates && (
                    <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-3xl border border-orange-100 shadow-inner">
                      <div className="p-3 bg-white rounded-2xl text-orange-600 shadow-sm">
                        <CalendarDays size={20} />
                      </div>
                      <div className="flex flex-1 items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-orange-400 uppercase tracking-widest">入住 Check-in</span>
                          <span className="text-lg font-black text-orange-700">{booking.stayDates.from}</span>
                        </div>
                        <div className="text-orange-200">
                          <ArrowRight size={20} />
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[9px] font-bold text-orange-400 uppercase tracking-widest">退房 Check-out</span>
                          <span className="text-lg font-black text-orange-700">{booking.stayDates.to}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {booking.description && (
                    <p className="text-sm font-semibold text-gray-500 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100 italic">
                      {booking.description}
                    </p>
                  )}

                  {booking.address && (
                    <div className="space-y-3">
                       <div className="flex items-start gap-4 p-5 bg-white rounded-3xl border-2 border-dashed border-orange-100 group-hover:border-orange-300 transition-colors">
                          <div className="p-3 bg-orange-100 rounded-2xl text-orange-600">
                             <MapPin size={24} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-orange-300 uppercase tracking-widest">地址 Address</span>
                            <p className="text-base font-bold text-gray-700 leading-snug">{booking.address}</p>
                          </div>
                       </div>
                       
                       {booking.link && (
                         <a 
                           href={booking.link} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="flex items-center justify-center gap-2 w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold transition-all shadow-md active:scale-95"
                         >
                           <Navigation size={18} /> 開啟 Google Maps 導覽
                         </a>
                       )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSubTab === 'car' && carRental?.rentalDetails && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-emerald-50 relative overflow-hidden">
              <h3 className="text-lg font-bold text-emerald-800 mb-5 flex items-center gap-3 uppercase tracking-wide">
                <span className="p-2 rounded-xl bg-emerald-100">🚗</span> 租車預約資訊
              </h3>
              
              <div className="space-y-6">
                {/* 取還車時間區塊 */}
                <div className="flex items-center gap-4 p-5 bg-emerald-50 rounded-[2rem] border border-emerald-100 shadow-inner">
                  <div className="p-3 bg-white rounded-2xl text-emerald-600 shadow-sm">
                    <Clock size={24} />
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">取車時段 Pickup</span>
                      <span className="text-base font-black text-emerald-800">{carRental.rentalDetails.pickupTime}</span>
                    </div>
                    <div className="text-emerald-200">
                      <ArrowRight size={20} />
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">還車時段 Dropoff</span>
                      <span className="text-base font-black text-emerald-800">{carRental.rentalDetails.dropoffTime}</span>
                    </div>
                  </div>
                </div>

                {/* 地點資訊 */}
                <div className="space-y-4">
                  <div className="p-5 bg-white rounded-3xl border border-emerald-100 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                        <MapPin size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">取車地點 Pickup Location</span>
                        <p className="text-sm font-bold text-gray-700">{carRental.address}</p>
                      </div>
                    </div>
                    {carRental.link && (
                      <a href={carRental.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm">
                        <Navigation size={14} /> 開啟導覽
                      </a>
                    )}
                  </div>

                  <div className="p-5 bg-white rounded-3xl border border-emerald-100 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                        <MapPin size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">還車地點 Dropoff Location</span>
                        <p className="text-sm font-bold text-gray-700">{carRental.rentalDetails.dropoffAddress}</p>
                      </div>
                    </div>
                    {carRental.rentalDetails.dropoffLink && (
                      <a href={carRental.rentalDetails.dropoffLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-2.5 bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200 shadow-sm">
                        <Navigation size={14} /> 開啟導覽
                      </a>
                    )}
                  </div>
                </div>

                {/* 車輛展示 */}
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest px-2">車輛資訊 Vehicle Details</span>
                  <div className="grid grid-cols-1 gap-4">
                    {carRental.rentalDetails.cars.map((car, i) => (
                      <div key={i} className="bg-emerald-50/30 rounded-[2rem] overflow-hidden border border-emerald-100 flex flex-col sm:flex-row">
                        <div className="w-full sm:w-1/3 h-32 relative">
                          <img src={car.image} alt={car.name} className="w-full h-full object-cover" />
                          <div className="absolute top-2 left-2 px-3 py-1 bg-white/90 rounded-full shadow-sm">
                            <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-1">
                              <Users size={10} /> {car.capacity}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-center">
                          <h5 className="font-bold text-gray-700 text-sm">{car.name}</h5>
                          <p className="text-[10px] text-emerald-500 font-bold uppercase mt-1">Toyota Rent a Car</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'ticket' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8">
            <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-lg border border-blue-100 relative group transition-all hover:shadow-2xl">
              <div className="h-56 w-full relative overflow-hidden">
                <img src="https://imagedelivery.net/b5EBo9Uo-OK6SM09ZTkEZQ/89JNH3JuCgHZcGbACeD2vU/width=3840,quality=80" alt="TeamLab Planets" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent"></div>
                <div className="absolute bottom-4 left-6">
                   <h4 className="text-2xl font-black text-white drop-shadow-md">TeamLab Planets TOKYO</h4>
                </div>
                <div className="absolute top-4 right-4">
                   <span className="px-4 py-2 bg-white/90 backdrop-blur shadow-sm rounded-full text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                     <span className="animate-pulse">✨</span> 沉浸式藝術體驗
                   </span>
                </div>
              </div>
              
              <div className="p-7 space-y-6">
                <div className="space-y-4">
                  <p className="text-sm font-bold text-gray-600 leading-relaxed bg-blue-50/50 p-5 rounded-3xl border border-blue-100">
                    TeamLab Planets 是位於東京豐洲的超人氣感官博物館。這是一個「進入水中的博物館」，團員們可以赤腳走入水中，與光影藝術作品融為一體。非常適合團隊一起拍出夢幻、閃耀且充滿未來感的彩虹美照！🌈✨
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-white rounded-2xl border border-blue-100 flex flex-col items-center justify-center text-center shadow-sm">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">展覽類別</span>
                      <span className="text-sm font-black text-gray-700">數位互動藝術</span>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-blue-100 flex flex-col items-center justify-center text-center shadow-sm">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">建議著裝</span>
                      <span className="text-sm font-black text-gray-700">短褲/捲起褲管</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <a 
                    href="https://www.teamlab.art/zh-hant/e/planets/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full py-5 bg-blue-800 hover:bg-blue-900 text-white rounded-[2rem] font-black transition-all shadow-lg active:scale-95 text-lg"
                  >
                    <ExternalLink size={20} /> 前往官網購票
                  </a>
                  <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">預訂場次為 Day 6 (3/6 五) 13:30</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;
