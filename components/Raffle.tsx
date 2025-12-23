
import React, { useState, useEffect } from 'react';
import { TEAM_MEMBERS } from '../constants';
import { RotateCw, Bed, Shuffle, Star, Sparkles, Coins, Trophy, Zap, ArrowDownCircle, Crown, Ghost, Wand2, Car, Users, Compass } from 'lucide-react';

type RaffleTab = 'wheel' | 'beds' | 'cars';
type GachaStatus = 'waiting-coin' | 'ready-to-crank' | 'cranking' | 'capsule-out' | 'opening' | 'finished';

const RAFFLE_MEMBERS = ['Sean', 'Wilson', 'Ben', 'Ethan', 'Oedi', 'William', 'Alvin', 'Sophia', 'Daisy', 'Nica'];

const UPPER_TITLES = ['🛸 未來感頂艙', '🌈 彩虹夢境位', '☁️ 雲端景觀首選', '🎨 藝術家上舖', '🌟 璀璨星空位'];
const LOWER_TITLES = ['🍦 甜心下舖', '📖 寧靜閱讀區', '🛌 懶人極致舒適', '🍫 巧克力醇厚位', '🦄 獨角獸窩窩'];

const BED_COLORS: Record<string, string> = {
  'U1': 'from-blue-400 to-indigo-500',
  'U2': 'from-purple-400 to-pink-500',
  'U3': 'from-yellow-400 to-orange-500',
  'U4': 'from-pink-400 to-rose-500',
  'U5': 'from-cyan-400 to-blue-500',
  'L1': 'from-green-400 to-emerald-500',
  'L2': 'from-amber-400 to-yellow-600',
  'L3': 'from-indigo-400 to-purple-600',
  'L4': 'from-orange-400 to-red-500',
  'L5': 'from-fuchsia-400 to-purple-500'
};

interface BedResult {
  bedId: string;
  member: string;
  title: string;
}

const Raffle: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RaffleTab>('wheel');
  
  // 轉盤狀態
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  // 轉蛋機狀態
  const [gachaStatus, setGachaStatus] = useState<GachaStatus>('waiting-coin');
  const [preCalculatedBeds, setPreCalculatedBeds] = useState<BedResult[]>([]);
  const [results, setResults] = useState<BedResult[]>([]);
  const [capsuleColor, setCapsuleColor] = useState('#FFADAD');
  const [shakeMachine, setShakeMachine] = useState(false);
  
  // 車位狀態
  const [carResults, setCarResults] = useState<{ car4: string[], car6: string[] } | null>(null);
  const [isCarShuffling, setIsCarShuffling] = useState(false);

  // 互斥檢查算法：Nica 不得在 Ethan 的上下左右
  const checkConstraint = (mapping: BedResult[]) => {
    const grid: Record<string, string> = {};
    mapping.forEach(m => {
      grid[m.bedId] = m.member;
    });
    
    const layout = [
      ['U1', 'U2', 'U3', 'U4', 'U5'],
      ['L1', 'L2', 'L3', 'L4', 'L5']
    ];
    
    let nicaPos = { r: -1, c: -1 };
    let ethanPos = { r: -1, c: -1 };

    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 5; c++) {
        if (grid[layout[r][c]] === 'Nica') nicaPos = { r, c };
        if (grid[layout[r][c]] === 'Ethan') ethanPos = { r, c };
      }
    }

    const rowDiff = Math.abs(nicaPos.r - ethanPos.r);
    const colDiff = Math.abs(nicaPos.c - ethanPos.c);
    
    if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
      return false;
    }
    return true;
  };

  const generateValidMapping = () => {
    let valid = false;
    let finalMapping: BedResult[] = [];
    const baseBedIds = ['U1', 'U2', 'U3', 'U4', 'U5', 'L1', 'L2', 'L3', 'L4', 'L5'];

    while (!valid) {
      const shuffledMembers = [...RAFFLE_MEMBERS].sort(() => Math.random() - 0.5);
      const shuffledUpperTitles = [...UPPER_TITLES].sort(() => Math.random() - 0.5);
      const shuffledLowerTitles = [...LOWER_TITLES].sort(() => Math.random() - 0.5);
      const shuffledBedIds = [...baseBedIds].sort(() => Math.random() - 0.5);
      
      let uIdx = 0;
      let lIdx = 0;

      finalMapping = shuffledBedIds.map((id, index) => {
        const isUpper = id.startsWith('U');
        const title = isUpper ? shuffledUpperTitles[uIdx++] : shuffledLowerTitles[lIdx++];
        return {
          bedId: id,
          member: shuffledMembers[index],
          title: title
        };
      });
      valid = checkConstraint(finalMapping);
    }
    return finalMapping;
  };

  const shuffleCars = () => {
    setIsCarShuffling(true);
    setCarResults(null);
    setTimeout(() => {
      // 獲取其餘成員（扣除固定位置的 Sophia 與 Ben）
      const others = RAFFLE_MEMBERS.filter(m => m !== 'Sophia' && m !== 'Ben');
      const shuffledOthers = [...others].sort(() => Math.random() - 0.5);
      
      // 分配邏輯
      // 4人座：Sophia + 隨機3人
      const car4Pool = ['Sophia', ...shuffledOthers.slice(0, 3)];
      // 6人座：Ben + 隨機5人
      const car6Pool = ['Ben', ...shuffledOthers.slice(3)];

      // 再次打亂車內順序，增加驚喜感，且 Sophia 和 Ben 就不會總是在第一個
      setCarResults({
        car4: car4Pool.sort(() => Math.random() - 0.5),
        car6: car6Pool.sort(() => Math.random() - 0.5)
      });
      setIsCarShuffling(false);
    }, 1500);
  };

  const initGacha = () => {
    const mapping = generateValidMapping();
    setPreCalculatedBeds(mapping);
    setResults([]);
    setGachaStatus('waiting-coin');
  };

  const handleCrank = () => {
    if (gachaStatus !== 'ready-to-crank' || results.length >= 10) return;
    setGachaStatus('cranking');
    setShakeMachine(true);
    const colors = ['#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF'];
    setCapsuleColor(colors[Math.floor(Math.random() * colors.length)]);
    setTimeout(() => {
      setShakeMachine(false);
      setGachaStatus('capsule-out');
    }, 1800);
  };

  const openCapsule = () => {
    if (gachaStatus !== 'capsule-out') return;
    setGachaStatus('opening');
    setTimeout(() => {
      const nextResult = preCalculatedBeds[results.length];
      setResults(prev => [...prev, nextResult]);
      if (results.length + 1 >= 10) {
        setGachaStatus('finished');
      } else {
        setGachaStatus('waiting-coin');
      }
    }, 1000);
  };

  const insertCoin = () => {
    if (gachaStatus !== 'waiting-coin') return;
    setGachaStatus('ready-to-crank');
  };

  useEffect(() => {
    if (activeTab === 'beds' && preCalculatedBeds.length === 0) {
      initGacha();
    }
    if (activeTab === 'cars' && !carResults) {
      shuffleCars();
    }
  }, [activeTab]);

  const getRainbowColor = (index: number) => {
    const colors = ['#FF8A8A', '#FFB347', '#FBC02D', '#D4E157', '#66BB6A', '#4DD0E1', '#5C6BC0', '#9575CD', '#F06292', '#FF7043'];
    return colors[index % colors.length];
  };

  const getResultForBed = (bedId: string) => results.find(r => r.bedId === bedId);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Tab Switcher - 三格設計 */}
      <div className="flex bg-white/70 backdrop-blur-md p-1.5 rounded-[2.5rem] border border-blue-100 shadow-sm mx-auto w-full sticky top-24 z-50 overflow-x-auto scrollbar-hide">
        <button onClick={() => setActiveTab('wheel')} className={`flex-1 flex items-center justify-center gap-1.5 py-4 px-3 rounded-[2rem] font-black text-[10px] transition-all min-w-[90px] ${activeTab === 'wheel' ? 'bg-[#0077B6] text-white shadow-lg' : 'text-blue-300'}`}>
          <RotateCw size={14} /> 幸運轉盤
        </button>
        <button onClick={() => setActiveTab('beds')} className={`flex-1 flex items-center justify-center gap-1.5 py-4 px-3 rounded-[2rem] font-black text-[10px] transition-all min-w-[90px] ${activeTab === 'beds' ? 'bg-[#FF4D4D] text-white shadow-lg' : 'text-rose-300'}`}>
          <Bed size={14} /> 宿舍分配
        </button>
        <button onClick={() => setActiveTab('cars')} className={`flex-1 flex items-center justify-center gap-1.5 py-4 px-3 rounded-[2rem] font-black text-[10px] transition-all min-w-[90px] ${activeTab === 'cars' ? 'bg-[#4CAF50] text-white shadow-lg' : 'text-emerald-300'}`}>
          <Car size={14} /> 戰車分配
        </button>
      </div>

      {activeTab === 'wheel' && (
        <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
          <div className="text-center">
            <h2 className="text-4xl font-black text-[#00A8FF] flex items-center justify-center gap-3 drop-shadow-sm">🎡 幸運大轉盤</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] mt-2">Hoya Team Random Draw</p>
          </div>
          <div className="relative flex flex-col items-center py-12">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-40">
              <div className="relative w-12 h-16 bg-[#FF4D4D] clip-path-pointer shadow-lg border-t-4 border-[#FF6B6B] flex justify-center pt-2">
                 <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="w-[340px] h-[340px] rounded-full relative shadow-2xl transition-transform duration-[4000ms] cubic-bezier-out border-[12px] border-white overflow-hidden ring-4 ring-blue-50/50"
              style={{ transform: `rotate(${rotation}deg)`, background: `conic-gradient(${RAFFLE_MEMBERS.map((_, i) => `${getRainbowColor(i)} ${i * 36}deg ${(i + 1) * 36}deg`).join(', ')})` }}>
              {RAFFLE_MEMBERS.map((member, index) => {
                const angle = (index * 36) + (36 / 2);
                return (
                  <div key={index} className="absolute top-1/2 left-1/2 flex items-center justify-center"
                    style={{ transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-115px) rotate(90deg)`, width: '110px' }}>
                    <span className="text-white font-black text-[15px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] whitespace-nowrap">{member}</span>
                  </div>
                );
              })}
            </div>
            <button onClick={() => {
              if (isSpinning) return;
              setIsSpinning(true);
              const newRotation = rotation + 2880 + Math.floor(Math.random() * 360);
              setRotation(newRotation);
              setTimeout(() => {
                setIsSpinning(false);
                const pointerPositionOnWheel = (360 - (newRotation % 360)) % 360;
                const index = Math.floor(pointerPositionOnWheel / 36);
                setWinner(RAFFLE_MEMBERS[index]);
                setWinnerIndex(index);
                setShowWinnerModal(true);
              }, 4000);
            }} disabled={isSpinning} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-white shadow-2xl z-30 flex items-center justify-center active:scale-90 transition-all border-4 border-gray-50">
              <RotateCw size={40} className={`text-[#00A8FF] ${isSpinning ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {activeTab === 'beds' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-20">
          <div className="bg-white rounded-[3rem] p-8 shadow-2xl border-4 border-rose-50 overflow-hidden relative">
             <div className="absolute top-0 left-0 w-full h-2 rainbow-bg opacity-30"></div>
             <div className="flex justify-between items-center mb-10 relative z-10">
                <div>
                  <h3 className="font-black text-2xl text-gray-800 flex items-center gap-2 tracking-tight italic">
                    <Ghost className="text-rose-400 animate-bounce" size={24} /> 宿舍大風吹
                  </h3>
                </div>
                <div className="bg-rose-50 px-4 py-2 rounded-2xl border border-rose-100 flex items-center gap-2 shadow-inner">
                   <span className="text-xs font-black text-rose-500">{results.length} / 10</span>
                </div>
             </div>
             
             <div className="relative flex flex-col items-center py-4 mb-16">
                <div className={`w-64 h-56 bg-gradient-to-b from-blue-100/40 to-white/60 rounded-t-[4rem] border-x-8 border-t-8 border-gray-200 relative shadow-xl transition-transform ${shakeMachine ? 'animate-shake' : ''}`}>
                   <div className="absolute inset-0 p-4 flex flex-wrap gap-1.5 items-center justify-center content-center relative overflow-hidden">
                      {[...Array(12 - results.length)].map((_, i) => (
                        <div key={i} className={`w-8 h-8 rounded-full shadow-md border-t-2 border-white/50 ${shakeMachine ? 'animate-bounce-custom' : ''}`} 
                          style={{ backgroundColor: ['#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF'][i % 8], animationDelay: `${i * 0.05}s` }}></div>
                      ))}
                   </div>
                </div>
                <div className={`w-72 h-32 bg-[#FF4D4D] border-x-8 border-gray-200 flex items-center justify-between px-10 relative shadow-2xl z-20 ${shakeMachine ? 'animate-shake' : ''}`}>
                   <div className="flex flex-col items-center gap-2">
                      <div className="w-2 h-10 bg-red-900/20 rounded-full border-2 border-white/30 shadow-inner relative flex items-center justify-center">
                         {gachaStatus === 'waiting-coin' && (
                            <button onClick={insertCoin} className="absolute -left-10 w-12 h-12 rounded-full bg-yellow-400 border-4 border-white shadow-xl flex items-center justify-center animate-bounce hover:scale-110 active:scale-95 transition-all z-30">
                               <Coins className="text-gray-900" size={24} />
                            </button>
                         )}
                      </div>
                   </div>
                   <div className="flex flex-col items-center gap-2">
                      <button onClick={handleCrank} disabled={gachaStatus !== 'ready-to-crank'} className={`w-16 h-16 rounded-full bg-white border-4 border-gray-100 shadow-xl flex items-center justify-center transition-all ${gachaStatus === 'cranking' ? 'animate-spin' : 'hover:scale-105 hover:rotate-45'}`}>
                        <div className="w-10 h-2 bg-gray-200 rounded-full"></div>
                      </button>
                   </div>
                </div>
                <div className="w-64 h-24 bg-gradient-to-b from-[#e63946] to-[#c1121f] rounded-b-[2rem] border-x-8 border-b-8 border-gray-200 relative flex justify-center items-center overflow-visible">
                   <div className="w-20 h-14 bg-black/20 rounded-xl shadow-inner border-4 border-red-900/20 flex items-center justify-center relative">
                      <div className="absolute top-10 w-28 h-12 bg-gray-100/80 backdrop-blur rounded-b-2xl border-x-4 border-b-4 border-gray-200 shadow-2xl z-10"></div>
                   </div>
                   {gachaStatus === 'capsule-out' && (
                     <div onClick={openCapsule} className="absolute bottom-[-10px] w-14 h-14 rounded-full cursor-pointer animate-in zoom-in slide-in-from-top-10 duration-300 hover:scale-110 active:scale-95 z-40 flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.1)] border-4 border-white overflow-hidden" style={{ backgroundColor: capsuleColor }}>
                        <div className="w-full h-1 bg-black/10 absolute top-1/2 -translate-y-1/2"></div>
                        <Sparkles className="text-white/80 animate-pulse" size={16} />
                     </div>
                   )}
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                {['U1', 'U2', 'U3', 'U4', 'U5', 'L1', 'L2', 'L3', 'L4', 'L5'].map((id) => {
                  const res = getResultForBed(id);
                  return (
                    <div key={id} className="min-h-[160px]">
                      {res ? (
                        <div className={`relative w-full h-40 bg-gradient-to-br ${BED_COLORS[id]} rounded-[2rem] p-5 shadow-lg border-2 border-white/40 flex flex-col justify-between overflow-hidden animate-in zoom-in duration-500`}>
                           <span className="text-[8px] font-black text-white/70 bg-black/10 px-2 py-0.5 rounded-full w-fit">{id}</span>
                           <div>
                              <h5 className="text-lg font-black text-white truncate tracking-tight">{res.member}</h5>
                              <p className="text-[8px] font-bold text-white/90 mt-0.5 truncate">{res.title}</p>
                           </div>
                        </div>
                      ) : (
                        <div className="w-full h-40 rounded-[2rem] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center gap-2 bg-gray-50/30">
                           <Bed size={20} className="text-gray-200" />
                           <span className="text-[8px] font-black text-gray-200 uppercase">{id}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
             </div>
             {gachaStatus === 'finished' && (
                <button onClick={initGacha} className="w-full mt-10 py-5 bg-rose-500 text-white rounded-3xl font-black shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all">
                  <RotateCw size={18} /> 清空重抽
                </button>
             )}
          </div>
        </div>
      )}

      {activeTab === 'cars' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-20">
           <div className="bg-white rounded-[3.5rem] p-8 shadow-2xl border-4 border-emerald-50 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-emerald-100 opacity-50"></div>
             
             <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                  <h3 className="font-black text-2xl text-gray-800 flex items-center gap-3 tracking-tight italic">
                    <Car className="text-emerald-500" size={28} /> 戰車大分配
                  </h3>
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] mt-1">Car Seat Allocation</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                   <Compass size={24} className={isCarShuffling ? 'animate-spin' : ''} />
                </div>
             </div>

             {isCarShuffling ? (
                <div className="py-20 flex flex-col items-center justify-center gap-6">
                   <div className="relative">
                      <Car size={80} className="text-emerald-200 animate-bounce" />
                      <div className="absolute -bottom-2 w-20 h-2 bg-gray-100 rounded-full blur-md"></div>
                   </div>
                   <p className="text-emerald-400 font-black tracking-widest animate-pulse">正在啟動引擎...</p>
                </div>
             ) : carResults && (
                <div className="space-y-10">
                   {/* 小戰車 4人座 */}
                   <div className="space-y-4">
                      <div className="flex items-center gap-3 px-4">
                         <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                            <Users size={20} />
                         </div>
                         <div>
                            <h4 className="font-black text-gray-700 italic">小戰車 (4人座)</h4>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Compact Car · Sophia's Choice</p>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         {carResults.car4.map((name, i) => (
                            <div key={i} className={`bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 ${name === 'Sophia' ? 'ring-2 ring-emerald-400 ring-offset-2' : ''}`} style={{ animationDelay: `${i * 100}ms` }}>
                               <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-xs font-black text-emerald-600 shadow-sm">{i+1}</div>
                               <span className={`font-black ${name === 'Sophia' ? 'text-emerald-700' : 'text-gray-700'}`}>{name}</span>
                               {name === 'Sophia' && <Crown size={12} className="text-emerald-400 fill-emerald-100" />}
                            </div>
                         ))}
                      </div>
                   </div>

                   {/* 大戰車 6人座 */}
                   <div className="space-y-4">
                      <div className="flex items-center gap-3 px-4">
                         <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                            <Users size={20} />
                         </div>
                         <div>
                            <h4 className="font-black text-gray-700 italic">大戰車 (6人座)</h4>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Van / Sienta · Ben's Choice</p>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         {carResults.car6.map((name, i) => (
                            <div key={i} className={`bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 ${name === 'Ben' ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`} style={{ animationDelay: `${(i+4) * 100}ms` }}>
                               <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-xs font-black text-blue-600 shadow-sm">{i+1}</div>
                               <span className={`font-black ${name === 'Ben' ? 'text-blue-700' : 'text-gray-700'}`}>{name}</span>
                               {name === 'Ben' && <Crown size={12} className="text-blue-400 fill-blue-100" />}
                            </div>
                         ))}
                      </div>
                   </div>

                   <button onClick={shuffleCars} className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all text-base border-b-8 border-emerald-800">
                     <Shuffle size={20} /> 大風吹！重新分車
                   </button>
                </div>
             )}
           </div>
        </div>
      )}

      {/* 轉盤獲獎彈窗 */}
      {showWinnerModal && winner && winnerIndex !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowWinnerModal(false)}></div>
          <div className="w-full max-w-xs rounded-[3.5rem] shadow-2xl relative p-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-300 border-4 border-white" style={{ backgroundColor: getRainbowColor(winnerIndex) }}>
            <div className="text-7xl mb-6 animate-bounce">🏆</div>
            <h3 className="text-white font-black text-xs tracking-[0.4em] mb-4 uppercase">Tonight's Star</h3>
            <div className="text-5xl font-black mb-12 text-white drop-shadow-md">{winner}</div>
            <button onClick={() => setShowWinnerModal(false)} className="w-full py-5 bg-white rounded-[2rem] font-black shadow-lg text-lg active:scale-95 transition-all flex items-center justify-center gap-2" style={{ color: getRainbowColor(winnerIndex) }}>
              收下好運 <Sparkles size={20} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        .clip-path-pointer { clip-path: polygon(50% 100%, 0 0, 100% 0); }
        .cubic-bezier-out { transition-timing-function: cubic-bezier(0.1, 0, 0.1, 1); }
        
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        .animate-shake { animation: shake 0.4s infinite; }

        @keyframes bounce-custom {
          0%, 100% { transform: translateY(0) rotate(0); }
          25% { transform: translateY(-40px) rotate(15deg); }
          50% { transform: translateY(0) rotate(-15deg); }
          75% { transform: translateY(-20px) rotate(8deg); }
        }
        .animate-bounce-custom { animation: bounce-custom 0.4s infinite; }
      `}</style>
    </div>
  );
};

export default Raffle;
