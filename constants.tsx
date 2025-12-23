
import React from 'react';
import { Plane, Home, Car, Utensils, MapPin, Waves, ShoppingBag, Landmark, Train, Heart, Calendar } from 'lucide-react';
import { DayPlan } from './types';

export const TEAM_MEMBERS = [
  'Sean', 'Ben', 'Oedi', 'Wilson', 'Ethan', 'William', 'Alvin', 'Sophia', 'Daisy', 'Jennifer', 'Sebrina', 'Nica'
];

export const TRIP_START_DATE = new Date('2026-03-01T02:30:00');

export const getIcon = (type: string) => {
  switch (type) {
    case 'flight': return <Plane className="w-5 h-5 text-rose-500" />;
    case 'stay': return <Home className="w-5 h-5 text-orange-500" />;
    case 'transport': return <Train className="w-5 h-5 text-yellow-600" />;
    case 'car': return <Car className="w-5 h-5 text-emerald-500" />;
    case 'food': return <Utensils className="w-5 h-5 text-sky-500" />;
    case 'spot': return <MapPin className="w-5 h-5 text-indigo-500" />;
    case 'onsen': return <Waves className="w-5 h-5 text-violet-600" />;
    case 'shopping': return <ShoppingBag className="w-5 h-5 text-pink-500" />;
    case 'shrine': return <Landmark className="w-5 h-5 text-red-600" />;
    default: return <Heart className="w-5 h-5 text-rose-400" />;
  }
};

export const PRIDE_COLORS = [
  'bg-[#FF8A8A]', 'bg-[#FFB347]', 'bg-[#FBC02D]', 'bg-[#81C784]', 
  'bg-[#4DD0E1]', 'bg-[#7986CB]', 'bg-[#9575CD]', 'bg-[#F06292]', 'bg-[#F48FB1]'
];

export const PRIDE_TEXT_COLORS = [
  'text-[#D32F2F]', 'text-[#E65100]', 'text-[#F57F17]', 'text-[#2E7D32]', 
  'text-[#00838F]', 'text-[#283593]', 'text-[#4527A0]', 'text-[#C2185B]', 'text-[#AD1457]'
];

export const PRIDE_BORDER_COLORS = [
  'border-[#FF8A8A]', 'border-[#FFB347]', 'border-[#FBC02D]', 'border-[#81C784]', 
  'border-[#4DD0E1]', 'border-[#7986CB]', 'border-[#9575CD]', 'border-[#F06292]', 'border-[#F48FB1]'
];

// 9天行程 專屬挑戰 (生活化打散版)
export const DAILY_PHOTO_CHALLENGES: Record<number, { id: string, name: string, icon: string }[]> = {
  1: [
    { id: 'd1-1', name: '機場行李山大集合，誰的箱子最浮誇', icon: '🧳' },
    { id: 'd1-2', name: '租車後車廂「疊疊樂」塞爆現場', icon: '🚗' },
    { id: 'd1-3', name: '第一眼看到富士山的「尖叫反應」', icon: '😱' },
    { id: 'd1-4', name: '民宿音樂小屋前的全員大合照', icon: '🏡' },
    { id: 'd1-5', name: '超市採買，推車塞滿宵夜的榮耀', icon: '🛒' },
    { id: 'd1-6', name: '第一次吃日本便利商店飯糰的瞬間', icon: '🍙' },
    { id: 'd1-7', name: '研究免治馬桶按鈕的困惑表情', icon: '🚽' },
    { id: 'd1-8', name: '全員紅通通的泡湯後「牛奶乾杯」', icon: '🥛' },
    { id: 'd1-9', name: '找到一台「顏色最怪」的自動販賣機', icon: '🥤' },
    { id: 'd1-10', name: '在民宿累倒「沙發廢人化」的照片', icon: '💤' }
  ],
  2: [
    { id: 'd2-1', name: '新倉山 398 階梯後的「虛脫表情」', icon: '🏃' },
    { id: 'd2-2', name: '日川時計店，馬路上最時尚的街拍', icon: '⌚' },
    { id: 'd2-3', name: '忍野八海，全員「集體低頭看魚」照', icon: '🐟' },
    { id: 'd2-4', name: '纜車上升中與河口湖的全景合照', icon: '🚠' },
    { id: 'd2-5', name: '天上山公園，與狸貓雕像的親密互動', icon: '🍃' },
    { id: 'd2-6', name: '捕捉團員「在路邊看地圖」的背影', icon: '🗺️' },
    { id: 'd2-7', name: '今天吃到「最令人驚艷」的一口美食', icon: '😋' },
    { id: 'd2-8', name: '所有人把「當下腳下的鞋子」圍一圈拍', icon: '👟' },
    { id: 'd2-9', name: '發現日本路邊「長得最有趣」的招牌', icon: '🖼️' },
    { id: 'd2-10', name: '晚上在民宿「集體敷面膜」的驚悚照', icon: '🎭' }
  ],
  3: [
    { id: 'd3-1', name: '御殿場 Outlet，戰利品與戰友大合照', icon: '💳' },
    { id: 'd3-2', name: '在 Outlet 看到最後一眼的富士山', icon: '🗻' },
    { id: 'd3-3', name: '高速巴士上「捕捉最強睡相」大賽', icon: '🚌' },
    { id: 'd3-4', name: '池袋民宿初次進房的「滾床單」照', icon: '🛌' },
    { id: 'd3-5', name: '池袋路邊，模仿貓頭鷹石像的動作', icon: '🦉' },
    { id: 'd3-6', name: '展示今天「收到最長的一張收據」', icon: '🧾' },
    { id: 'd3-7', name: '池袋驚安殿堂「尋找最獵奇周邊」', icon: '🐧' },
    { id: 'd3-8', name: '拍下某團員「提著大包小包」的背影', icon: '🛍️' },
    { id: 'd3-9', name: '在民宿「研究如何開暖氣/電器」', icon: '💡' },
    { id: 'd3-10', name: '睡前大家圍在一起「清算硬幣」的畫面', icon: '🪙' }
  ],
  4: [
    { id: 'd4-1', name: '明治神宮大鳥居下的「同步鞠躬」', icon: '⛩️' },
    { id: 'd4-2', name: '原宿竹下通，吃可麗餅吃到滿嘴奶油', icon: '🧁' },
    { id: 'd4-3', name: '澀谷十字路口，綠燈時的「集體狂奔」', icon: '🏃' },
    { id: 'd4-4', name: '新宿 3D 巨貓下，模仿貓咪伸懶腰', icon: '🐈' },
    { id: 'd4-5', name: '肉緣燒肉晚餐，和牛油花的致命誘惑', icon: '🥩' },
    { id: 'd4-6', name: '表參道上，某團員被當成路人的街拍', icon: '🕶️' },
    { id: 'd4-7', name: '在新宿二丁目「尋找彩虹旗」的自拍', icon: '🏳️‍🌈' },
    { id: 'd4-8', name: '拍下今天喝到「第 N 杯咖啡/飲料」', icon: '☕' },
    { id: 'd4-9', name: '地鐵車廂內，大家「集體低頭滑手機」', icon: '📱' },
    { id: 'd4-10', name: '晚餐後大家「挺著肚子」的滿足感', icon: '🤰' }
  ],
  5: [
    { id: 'd5-1', name: '鐮倉高校前，捕捉「電車經過」的瞬間', icon: '🏀' },
    { id: 'd5-2', name: '錢洗弁財天神社，大家「瘋狂洗錢」的財迷照', icon: '💰' },
    { id: 'd5-3', name: '江之電窗邊，拍下最有氣質的「文青照」', icon: '🚋' },
    { id: 'd5-4', name: '江之島夕陽，全體成員的「影子剪影」', icon: '🌇' },
    { id: 'd5-5', name: '鐮倉海灘，全員「腳踏沙灘」的海味照', icon: '🐚' },
    { id: 'd5-6', name: '捕捉團員「被海風吹亂頭髮」的醜照', icon: '💨' },
    { id: 'd5-7', name: '在江之島老街「吃一口章魚仙貝」', icon: '🐙' },
    { id: 'd5-8', name: '找到一個「長得最奇特」的人手孔蓋', icon: '🎨' },
    { id: 'd5-9', name: '鐮倉車站前「迷路中」的集體臉色', icon: '🤔' },
    { id: 'd5-10', name: '今天「喝了多少水/茶」的空瓶大集合', icon: '🥤' }
  ],
  6: [
    { id: 'd6-1', name: '築地市場，大咬鮪魚或生蠔的「震驚照」', icon: '🍣' },
    { id: 'd6-2', name: 'TeamLab 鏡面空間，拍下「腳底反射」', icon: '🪞' },
    { id: 'd6-3', name: 'TeamLab 燈海中，某團員的「名模獨照」', icon: '✨' },
    { id: 'd6-4', name: '台場獨角獸鋼彈，模仿其「變身動作」', icon: '🤖' },
    { id: 'd6-5', name: '台場自由女神與彩虹大橋的「愛心包圍」', icon: '🗽' },
    { id: 'd6-6', name: '在 TeamLab「光腳走路」時的驚恐表情', icon: '👣' },
    { id: 'd6-7', name: '台場商場內，某人「逛累坐著放空」', icon: '🧘' },
    { id: 'd6-8', name: '捕捉台場路邊「最有型的路人」', icon: '🎩' },
    { id: 'd6-9', name: '今天「走了多少步」的健康 App 截圖', icon: '📈' },
    { id: 'd6-10', name: '晚上回家時，地鐵站內「累到不想說話」', icon: '😶' }
  ],
  7: [
    { id: 'd7-1', name: '分享今天你「最棒的發現」', icon: '🔍' },
    { id: 'd7-2', name: '新宿二丁目，在彩虹旗下的「狂歡合照」', icon: '🏳️‍🌈' },
    { id: 'd7-3', name: '今日「最 Pride」穿搭大賞特寫', icon: '🎀' },
    { id: 'd7-4', name: '找到一家最文青的東京巷弄咖啡廳', icon: '☕' },
    { id: 'd7-5', name: '深夜新宿街頭，最絢麗的霓虹燈背景', icon: '🌃' },
    { id: 'd7-6', name: '捕捉團員「在路邊滑手機導航」的樣子', icon: '📱' },
    { id: 'd7-7', name: '展示今天「個人買到最爽」的戰利品', icon: '🎁' },
    { id: 'd7-8', name: '挑戰一個「從沒吃過的」獵奇甜點', icon: '🧁' },
    { id: 'd7-9', name: '在便利商店找到「長得最像某位團員」的東西', icon: '🖼️' },
    { id: 'd7-10', name: '大家集合後「交換今日戰果」的激動樣', icon: '🤩' }
  ],
  8: [
    { id: 'd8-1', name: '淺草雷門，趁人潮空檔「全體飛躍」', icon: '🏮' },
    { id: 'd8-2', name: '淺草寺香爐，拚命「把煙往身上撥」祈福', icon: '💨' },
    { id: 'd8-3', name: '晴空塔下，大家「抬頭抬到脖子斷」照', icon: '🗼' },
    { id: 'd8-4', name: '阿美橫町，拍下某人「大殺價現場」', icon: '💰' },
    { id: 'd8-5', name: '上野公園，大家在噴水池前的藝術家照', icon: '⛲' },
    { id: 'd8-6', name: '展示今天「行李箱最後塞爆」的慘樣', icon: '📦' },
    { id: 'd8-7', name: '在藥妝店「掃貨最後一波」的推車照', icon: '🧾' },
    { id: 'd8-8', name: '拍下大家「在路邊吃炸肉餅」的幸福臉', icon: '🥯' },
    { id: 'd8-9', name: '研究「如何退稅」時認真又困惑的臉', icon: '辦理' },
    { id: 'd8-10', name: '睡前大家聚在一起「分配最後的零食」', icon: '🍕' }
  ],
  9: [
    { id: 'd9-1', name: '成田山表參道，全員拿著鰻魚飯鏟子', icon: '🍱' },
    { id: 'd9-2', name: '新勝寺，最後一張「平安祈願」的背影', icon: '🙏' },
    { id: 'd9-3', name: '成田機場報到，磅秤上「驚人的數字」', icon: '⚖️' },
    { id: 'd9-4', name: '機場免稅店，最後一秒「衝刺買香蕉」', icon: '🏃' },
    { id: 'd9-5', name: '登機門前，全體成員「相擁告別」合照', icon: '🤝' },
    { id: 'd9-6', name: '展示錢包裡「最後剩下的幾塊日幣」', icon: '🪙' },
    { id: 'd9-7', name: '全團員「一起看向窗外藍天」的感性照', icon: '☁️' },
    { id: 'd9-8', name: '捕捉團員「在候機室滑手機清相簿」', icon: '📷' },
    { id: 'd9-9', name: '登機後，每個人「戴上眼罩」的樣子', icon: '😴' },
    { id: 'd9-10', name: '飛機起飛那一刻，對東京說「掰掰」的自拍', icon: '✈️' }
  ]
};

export const ITINERARY_DATA: DayPlan[] = [
  {
    day: 1,
    date: '3/1（日）',
    title: '✈️飛向富士山的夢！',
    weather: { temp: '-1°C / 9°C', condition: '晴', icon: '☀️' },
    clothing: '河口湖體感極低！建議：發熱衣+厚毛衣+防風羽絨外套+發熱褲。',
    items: [
      { time: '02:30', title: '起飛 桃園國際機場 TPE', type: 'flight' },
      { time: '06:25', title: '抵達 成田國際機場 NRT', type: 'flight' },
      { time: '07:30', title: '機場接送前往河口湖', type: 'transport' },
      { 
        time: '10:00', 
        title: 'TOYOTA 租車取車', 
        type: 'car', 
        link: 'https://maps.app.goo.gl/nCN4jSMqjMfDgDoQ9?g_st=ic',
        address: 'TOYOTA租車 富士河口湖店',
        rentalDetails: {
          pickupTime: '3/1 10:30',
          dropoffTime: '3/3 10:30',
          dropoffAddress: 'TOYOTA租車 御殿場站前店',
          dropoffLink: 'https://maps.app.goo.gl/TnAM3fCZM2fKPJD76?g_st=ic',
          cars: [
            { name: 'SIENTA 等級 (6人座)', capacity: '6人', image: 'https://car-sys.tabirai.net/App_Supplier/img/car/682_1_O.jpg' },
            { name: 'NOAH / VOXY (8人座)', capacity: '8人', image: 'https://car-sys.tabirai.net/App_Supplier/img/car/597_1_O.jpg' }
          ]
        }
      },
      { 
        time: '10:30', 
        title: '音樂小屋民宿', 
        type: 'stay', 
        address: '7065-1 Funatsu 富士河口湖',
        link: 'https://maps.app.goo.gl/gWhB95As2PVnBVPj6?g_st=ic',
        image: 'https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/231139460.jpg?k=ed503798238fe59d6512808f1910f4359ca0c40f41bff18719e3819942eec717&o=&s=1024x',
        stayDates: { from: '3/1', to: '3/3' }
      },
      { time: '11:15', title: '求財神社-新屋山神社', type: 'shrine', link: 'https://reurl.cc/A3GxKQ' },
      { time: '12:00', title: '午餐：みず之風 MIZUNOKAZE', type: 'food', link: 'https://maps.app.goo.gl/vpZ7yXuXrL7P7yi7A?g_st=ipc' },
      { time: '13:30', title: '大石公園', type: 'spot' },
      { time: '14:00', title: '河口湖音樂盒之森美術館', type: 'spot', link: 'https://maps.app.goo.gl/WFnBwYa3jemG3Vps6?g_st=ipc' },
      { time: '16:00', title: 'Yaruyi泡湯&晚餐', type: 'onsen', link: 'https://maps.app.goo.gl/gyKpNUBdQJeW5bR6A?g_st=ic' },
      { time: '18:30', title: '超市採買必備物資', type: 'shopping', link: 'https://maps.app.goo.gl/DqCuQNVqUquKeTbw5?g_st=ic', description: '20:00打烊' }
    ]
  },
  {
    day: 2,
    date: '3/2（一）',
    title: '🗻富士山你好萌！',
    weather: { temp: '-2°C / 8°C', condition: '晴時多雲', icon: '🌤️' },
    clothing: '戶外跑點多且山區風強。建議：洋蔥式穿法，手套與暖暖包必備。',
    items: [
      { time: '09:30', title: '出門！！', type: 'spot', color: 'red' },
      { time: '10:00', title: '新倉山淺間神社', type: 'shrine', link: 'https://maps.app.goo.gl/egCTAs7vwHbuDPY68?g_st=ic' },
      { time: '11:30', title: '日川時計店 (天梯小鎮)', type: 'spot', link: 'https://maps.app.goo.gl/Ut1cXsRZso18YVod8?g_st=ic' },
      { time: '12:30', title: '忍野八海 (午餐)', type: 'food', link: 'https://maps.app.goo.gl/SJz4SqyfnPrrAxUt7?g_st=ic' },
      { time: '15:00', title: '天上山公園纜車', type: 'transport', link: 'https://maps.app.goo.gl/n8CM9jkZPevf37cH7?g_st=ic' },
      { time: '17:30', title: '超市採買', type: 'shopping', link: 'https://maps.app.goo.gl/DqCuQNVqUquKeTbw5?g_st=ic' },
      { time: '18:30', title: '音樂小屋火鍋趴!!', type: 'food', description: '團隊溫馨火鍋時光' }
    ]
  },
  {
    day: 3,
    date: '3/3（二）',
    title: '🛍️Outlets大作戰！',
    weather: { temp: '2°C / 12°C', condition: '晴', icon: '☀️' },
    clothing: 'Outlet 室內暖氣強，建議穿脫方便的長版外套，內穿薄長袖。',
    items: [
      { time: '09:00', title: '出門！！', type: 'spot', color: 'red' },
      { time: '10:00', title: 'Toyota 御殿場 還車', type: 'car', link: 'https://maps.app.goo.gl/TnAM3fCZM2fKPJD76?g_st=ic' },
      { time: '10:30', title: '御殿場 Outlet 瘋狂買買買', type: 'shopping', link: 'https://maps.app.goo.gl/9m56rcBweXUZuwmZ9?g_st=ic' },
      { time: '16:00', title: '搭乘高速巴士前往澀谷', type: 'transport' },
      { 
        time: '18:00', 
        title: '池袋民宿', 
        type: 'stay', 
        address: '東京都豊島区池袋駅周邊',
        image: 'https://pix8.agoda.net/hotelImages/11088278/0/d3a8f3fbe67dda0c29ab22a9cc7f01c0.jpg?ca=16&ce=1&s=1024x',
        stayDates: { from: '3/3', to: '3/9' }
      }
    ]
  },
  {
    day: 4,
    date: '3/4（三）',
    title: '🏙️東京戀愛地圖💕',
    weather: { temp: '5°C / 14°C', condition: '多雲', icon: '☁️' },
    clothing: '市區行走多。建議：輕便大衣或皮革外套，搭配帥氣穿搭方便街拍。',
    items: [
      { time: '10:00', title: '出門！！', type: 'spot', color: 'red' },
      { time: '10:30', title: '明治神宮參拜', type: 'shrine', link: 'https://maps.app.goo.gl/wwbB47KJkobaTQx96?g_st=ic' },
      { time: '11:30', title: '原宿涉谷逛街', type: 'shopping' },
      { time: '17:00', title: '新宿', type: 'spot' },
      { time: '19:30', title: '肉緣和牛燒肉晚餐', type: 'food', link: 'https://maps.app.goo.gl/aSTj7iV9rdFTjkRS6?g_st=ic' }
    ]
  },
  {
    day: 5,
    date: '3/5（四）',
    title: '🚋江之電の慢旅行',
    weather: { temp: '4°C / 11°C', condition: '晴時多雲', icon: '🌤️' },
    clothing: '海邊風大。建議：圍巾或擋風領口的衣服，穿著好穿脫的鞋子。',
    items: [
      { time: '09:00', title: '出門！！', type: 'spot', color: 'red' },
      { time: '10:30', title: '錢洗弁財天神社', type: 'shrine', link: 'https://maps.app.goo.gl/k4BcgXNTS134bRJf6?g_st=ic' },
      { time: '12:00', title: '小町通逛街 + 午餐', type: 'food', link: 'https://maps.app.goo.gl/bv1cpi5E5WJVcSan8?g_st=ic' },
      { time: '14:00', title: '鶴岡八幡宮參拜', type: 'shrine', link: 'https://maps.app.goo.gl/nYaXQJZSEXn4ivnMA?g_st=ic' },
      { time: '15:00', title: '長谷寺', type: 'shrine', link: 'https://maps.app.goo.gl/81f9YqmtnrUvdqqT7?g_st=ic' },
      { time: '16:00', title: '稻村崎海濱公園', type: 'spot', link: 'https://maps.app.goo.gl/9cNVYBvy4qQ36WXx7?g_st=ic' },
      { time: '17:00', title: '江之島看夕陽', type: 'spot' }
    ]
  },
  {
    day: 6,
    date: '3/6（五）',
    title: '💡光影與海風的約會！',
    weather: { temp: '6°C / 15°C', condition: '晴', icon: '☀️' },
    clothing: 'TeamLab 需光腳。建議：穿著好穿脫、褲管好捲起的褲子，避免連身裙。',
    items: [
      { time: '09:00', title: '出門！！', type: 'spot', color: 'red' },
      { time: '09:30', title: '築地市場早午餐', type: 'food', link: 'https://maps.app.goo.gl/dqFuQYPyEjnSAq6LA?g_st=ic' },
      { time: '13:30', title: 'TeamLab Planets', type: 'spot', link: 'https://maps.app.goo.gl/LFQ6Ggt4KaCmaHL87?g_st=ic' },
      { time: '16:00', title: '台場逛街看鋼彈', type: 'shopping' }
    ]
  },
  {
    day: 7,
    date: '3/7（六）',
    title: '🌈自由行動模式ON！',
    weather: { temp: '7°C / 16°C', condition: '多雲時晴', icon: '🌥️' },
    clothing: '隨興搭配。建議：穿一雙這幾天戰鬥力最強、最好走的運動鞋。',
    items: [
      { time: '00:00', title: '東京自由行動 Free Day', type: 'spot' }
    ]
  },
  {
    day: 8,
    date: '3/8（日）',
    title: '🏮東京的老靈魂',
    weather: { temp: '6°C / 13°C', condition: '陰偶雨', icon: '🌦️' },
    clothing: '可能微雨。建議：攜帶摺疊傘，穿防水材質的外套或大衣。',
    items: [
      { time: '10:00', title: '出門！！', type: 'spot', color: 'red' },
      { time: '11:00', title: '淺草寺 仲見世通逛街', type: 'shopping', link: 'https://maps.app.goo.gl/CeP9tj5oYvvFUPGC9?g_st=ic' },
      { time: '13:00', title: '晴空塔', type: 'spot', link: 'https://maps.app.goo.gl/FG7wwVU2mj4AQ7fE7?g_st=ic' },
      { time: '17:00', title: '阿美橫町', type: 'shopping', link: 'https://maps.app.goo.gl/Dam8fUHTLPbvUVQV6?g_st=ic' }
    ]
  },
  {
    day: 9,
    date: '3/9（一）',
    title: '🏯成田小鎮的溫柔時光',
    weather: { temp: '5°C / 14°C', condition: '晴', icon: '☀️' },
    clothing: '收尾行程。建議：輕鬆舒適穿搭，方便搭機與最後採買。',
    items: [
      { time: '08:45', title: '出門！！', type: 'spot', color: 'red' },
      { time: '09:15', title: '搭乘高速巴士往成田機場', type: 'transport' },
      { time: '11:00', title: '成田機場 T3 寄放行李', type: 'transport', description: '減輕負擔，輕鬆逛街' },
      { time: '12:00', title: '成田山表參道午餐', type: 'food', link: 'https://maps.app.goo.gl/gVnBung1Jq3ym29TA?g_st=ic' },
      { time: '14:00', title: '成田山新勝寺參拜', type: 'shrine', link: 'https://maps.app.goo.gl/cJV7X3e97i8hu2ddA?g_st=ic' },
      { time: '15:00', title: '永旺夢樂城補藥妝伴手禮', type: 'shopping', link: 'https://maps.app.goo.gl/7HeCg6qT8jGfZRE49', description: '17:50 需集合準備' },
      { time: '18:15', title: '搭接駁巴士到成田機場', type: 'transport' },
      { time: '22:25', title: '成田機場起飛', type: 'flight' }
    ]
  }
];
