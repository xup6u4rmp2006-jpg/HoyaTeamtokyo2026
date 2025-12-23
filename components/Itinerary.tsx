
import React, { useState, useRef, useEffect } from 'react';
import { ITINERARY_DATA, getIcon, PRIDE_COLORS, PRIDE_TEXT_COLORS, PRIDE_BORDER_COLORS } from '../constants';
import { MapPin, Calendar, Heart, CloudSun, Shirt } from 'lucide-react';

const Itinerary: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentDayData = ITINERARY_DATA.find(d => d.day === selectedDay) || ITINERARY_DATA[0];

  useEffect(() => {
    const activeBtn = scrollRef.current?.querySelector(`[data-day="${selectedDay}"]`);
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [selectedDay]);

  const getDayColor = (day: number) => PRIDE_COLORS[(day - 1) % PRIDE_COLORS.length];
  const getDayTextColor = (day: number) => PRIDE_TEXT_COLORS[(day - 1) % PRIDE_TEXT_COLORS.length];
  const getDayBorderColor = (day: number) => PRIDE_BORDER_COLORS[(day - 1) % PRIDE_BORDER_COLORS.length];

  return (
    <div className="space-y-6 text-black">
      {/* 日期導覽列 */}
      <div className="sticky top-20 z-40 -mx-5 px-5 py-6 glass border-b border-white/50 mb-4 overflow-hidden">
        <div 
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide pb-2 px-2"
        >
          {ITINERARY_DATA.map((dayPlan) => {
            const isSelected = selectedDay === dayPlan.day;
            const bgColorClass = getDayColor(dayPlan.day);
            const textClass = getDayTextColor(dayPlan.day);
            const borderClass = getDayBorderColor(dayPlan.day);

            return (
              <button
                key={dayPlan.day}
                data-day={dayPlan.day}
                onClick={() => setSelectedDay(dayPlan.day)}
                className={`flex-shrink-0 aspect-square w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all duration-500 relative ${
                  isSelected 
                    ? `${bgColorClass} text-white shadow-lg scale-110 z-10 border-4 border-white` 
                    : `bg-white/80 ${textClass} border-2 ${borderClass} border-opacity-40 shadow-sm opacity-70`
                }`}
              >
                <span className={`text-[10px] font-black uppercase tracking-tighter leading-none ${isSelected ? 'text-white/90' : 'opacity-60'}`}>
                  Hoya
                </span>
                <span className="text-xl font-black leading-none mt-0.5">
                  {dayPlan.day}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 行程主卡片 */}
      <div className="animate-in fade-in duration-500">
        <div className="bg-white rounded-[3.5rem] shadow-2xl border border-white overflow-hidden relative">
          
          {/* 設計升級：當日標題頭部區塊 */}
          <div className="relative">
             <div className={`p-8 pb-14 ${getDayColor(selectedDay)} bg-opacity-15 relative overflow-hidden shadow-inner`}>
                <div className="absolute top-0 right-0 p-4 opacity-[0.05] pointer-events-none">
                  <span className="text-[120px] font-black leading-none uppercase select-none italic">Hoya {currentDayData.day}</span>
                </div>
                <div className="flex items-center gap-6 relative z-10">
                   <div className="w-16 h-16 rounded-[1.8rem] bg-white shadow-xl flex items-center justify-center flex-shrink-0 border-2 border-white transform -rotate-3">
                      <Calendar className={getDayTextColor(selectedDay)} size={28} strokeWidth={2.5} />
                   </div>
                   <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                         <span className={`px-3 py-1 rounded-full text-[10px] font-black text-white ${getDayColor(selectedDay)} uppercase tracking-[0.2em]`}>
                           {currentDayData.date}
                         </span>
                      </div>
                      <h3 className="text-2xl font-black text-gray-800 tracking-tight leading-tight italic">
                        {currentDayData.title}
                      </h3>
                   </div>
                </div>
             </div>
             
             {/* 天氣與穿著建議小卡 - 加大空間版本 */}
             <div className="px-6 -mt-8 relative z-20">
                <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] p-6 shadow-2xl border border-rose-50 flex flex-col gap-6">
                   {/* 天氣區塊 */}
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getDayColor(selectedDay)} bg-opacity-10 shadow-inner flex-shrink-0`}>
                        <CloudSun className={getDayTextColor(selectedDay)} size={24} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-0.5">預估天氣 Forecast</span>
                        <div className="flex items-center gap-2">
                           <span className="text-lg font-black text-gray-700">{currentDayData.weather?.temp}</span>
                           <span className="text-xl">{currentDayData.weather?.icon}</span>
                           <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{currentDayData.weather?.condition}</span>
                        </div>
                      </div>
                   </div>

                   <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-100 to-transparent"></div>

                   {/* 穿衣區塊 */}
                   <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getDayColor(selectedDay)} bg-opacity-10 shadow-inner flex-shrink-0`}>
                        <Shirt className={getDayTextColor(selectedDay)} size={24} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-0.5">穿搭指南 Style Tips</span>
                        <p className="text-sm font-bold text-gray-600 leading-relaxed">
                          {currentDayData.clothing}
                        </p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="relative h-6 bg-white">
                <div className={`absolute -top-6 left-0 w-full h-12 bg-white rounded-t-[3rem] border-t-2 border-white shadow-[0_-15px_30px_rgba(255,255,255,0.8)]`}></div>
             </div>
          </div>

          {/* 具體行程內容 */}
          <div className="px-10 pb-16 pt-2 relative">
            <div className="relative border-l-[3px] border-dashed border-rose-100 ml-5 pl-10 space-y-8">
              {currentDayData.items.map((item, idx) => (
                <div key={idx} className="relative group animate-in fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="absolute -left-[68px] top-0 w-12 h-12 rounded-[1.25rem] bg-white border-[3px] border-rose-50 shadow-lg flex items-center justify-center z-10">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${getDayColor(selectedDay)} text-white shadow-md border-b-2 border-black/10`}>
                        <span className="text-[10px] font-black tracking-widest">{item.time}</span>
                      </div>
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-rose-400 p-2.5 bg-rose-50 rounded-2xl flex items-center gap-1.5 border border-rose-100/50 active:scale-90 transition-all shadow-sm">
                          <MapPin size={16} />
                          <span className="text-[10px] font-black tracking-tighter">導覽</span>
                        </a>
                      )}
                    </div>
                    <div className="space-y-1.5 bg-gray-50/30 p-4 rounded-[1.8rem] border border-gray-50/50">
                      <h4 className={`text-lg font-black leading-snug ${item.color === 'red' ? 'text-red-500' : 'text-gray-800'}`}>
                        {item.title}
                      </h4>
                      {item.description && <p className="text-[12px] font-bold text-gray-400 leading-relaxed italic pr-2">{item.description}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 p-10 bg-white rounded-[3.5rem] text-center border-2 border-dashed border-rose-100 shadow-sm">
           <p className="text-xs font-black rainbow-text uppercase tracking-[0.4em] mb-2">Love Wins 🌈</p>
           <p className="text-[9px] font-black text-rose-300 uppercase tracking-widest opacity-60 italic">Making Memories in Tokyo</p>
        </div>
      </div>
    </div>
  );
};

export default Itinerary;
