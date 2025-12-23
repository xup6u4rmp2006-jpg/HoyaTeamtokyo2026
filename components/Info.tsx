
import React from 'react';
import { Map, Phone, AlertTriangle, ShieldCheck } from 'lucide-react';

const Info: React.FC = () => {
  const emergencyContacts = [
    { title: '警察局', num: '110', icon: <ShieldCheck size={20} /> },
    { title: '救護車/消防', num: '119', icon: <AlertTriangle size={20} /> },
    { title: '駐日代表處', num: '+81-3-3280-7811', icon: <Phone size={20} /> },
  ];

  const tips = [
    { title: '🛁 泡溫泉禮儀', content: '先沖澡乾淨再下水，不可將毛巾浸入池中。有刺青者建議先確認場地規定。' },
    { title: '⛩️ 神社參拜禮儀', content: '進入鳥居前先鞠躬。賽錢後兩躬、兩拍手、一躬。切勿走在正中央。' },
    { title: '🚃 交通小技巧', content: '西瓜卡 (Suica) 可加入手機錢包感應。上下手扶梯在東京通常靠左。' },
    { title: '♻️ 垃圾分類', content: '日本街頭垃圾桶較少，建議隨身攜帶小塑膠袋，回到民宿再丟棄。' }
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Helpful Links - Compact */}
      <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-rose-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
           <span className="text-8xl">🗼</span>
        </div>
        <h2 className="font-black text-lg text-rose-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
          <span className="p-1.5 rounded-lg bg-rose-50 text-base">🔗</span> 常用連結
        </h2>
        <div className="space-y-3">
          <a 
            href="https://www.google.com/maps" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-rose-50/20 rounded-2xl hover:bg-rose-50 transition-all border border-rose-100 group shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm text-rose-400 group-hover:scale-110 transition-transform">
                  <Map size={24} />
              </div>
              <span className="text-base font-black text-gray-700">Google Maps</span>
            </div>
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-white px-4 py-1.5 rounded-full border border-rose-100 shadow-sm">Open</span>
          </a>
        </div>
      </div>

      {/* Emergency Contacts - Compact */}
      <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-rose-50">
        <h2 className="font-black text-lg text-rose-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
          <span className="p-1.5 rounded-lg bg-red-50 text-base">🚨</span> 緊急聯絡
        </h2>
        <div className="grid grid-cols-1 gap-3">
          {emergencyContacts.map(contact => (
            <div key={contact.title} className="flex items-center justify-between p-4 bg-red-50/10 rounded-2xl border border-red-100/30">
              <div className="flex items-center gap-3 text-red-400">
                {contact.icon}
                <span className="font-black text-sm tracking-tight">{contact.title}</span>
              </div>
              <a href={`tel:${contact.num}`} className="font-black text-base text-red-500 bg-white px-4 py-1.5 rounded-xl shadow-sm border border-red-50">{contact.num}</a>
            </div>
          ))}
        </div>
      </div>

      {/* Travel Tips with Rainbow Border */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border-2 rainbow-border relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <span className="text-9xl">🎎</span>
        </div>
        <h2 className="font-black text-rose-600 mb-6 flex items-center gap-3 uppercase tracking-widest text-base">
          <span className="p-2 rounded-xl bg-rose-50 text-xl">💡</span> 旅遊小提醒
        </h2>
        <div className="space-y-6 relative z-10">
          {tips.map(tip => (
            <div key={tip.title} className="space-y-2 group">
              <h4 className="text-base font-black text-rose-800 flex items-center gap-2 group-hover:translate-x-1 transition-transform">{tip.title}</h4>
              <p className="text-sm text-gray-600 font-bold leading-relaxed pl-4 border-l-4 border-rose-100">{tip.content}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-center py-8">
        <div className="flex justify-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-red-300" />
            <div className="w-1.5 h-1.5 rounded-full bg-orange-300" />
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-300" />
            <div className="w-1.5 h-1.5 rounded-full bg-green-300" />
            <div className="w-1.5 h-1.5 rounded-full bg-sky-300" />
            <div className="w-1.5 h-1.5 rounded-full bg-purple-300" />
        </div>
        <p className="text-[10px] text-rose-300/60 font-black tracking-widest uppercase">
          Made with ❤️ for Hoya Team
        </p>
      </div>
    </div>
  );
};

export default Info;
