
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const OMIKUJI_SAMPLES = [
  "大吉！今日運勢如同澀谷十字路口般氣勢萬鈞！幸運色：傲嬌紅。",
  "閃耀中吉！在原宿穿上最自信的戰袍，你就是街頭焦點！幸運色：初戀橘。",
  "愛心小吉！在明治神宮許下的願望會被悄悄實現喔。幸運色：檸檬黃。",
  "超級大吉！今天在新宿二丁目會有意想不到的浪漫邂逅。幸運色：森林綠。",
  "和平中吉！與團員們乾杯的瞬間，所有的煩惱都煙消雲散。幸運色：蘇打藍。",
  "夢幻小吉！TeamLab 的光影會為你補滿粉紅泡泡。幸運色：迷幻紫。",
  "璀璨大吉！在晴空塔俯瞰東京，你的夢想比塔還高！幸運色：星空黑。",
  "幸運小吉！築地市場的壽司會讓你感動到流淚。幸運色：鮭魚粉。",
  "狂歡中吉！居酒屋的熱鬧氣氛是你最佳的能量補充站。幸運色：琥珀金。",
  "優雅大吉！漫步在表參道，連呼吸都像是在走伸展台。幸運色：珍珠白。",
  "大吉！富士山今天會為了你露臉，快去捕捉最美的瞬間吧。幸運色：彩虹色。",
  "熱情中吉！你的活力能感染所有人，帶領團隊嗨翻東京！幸運色：火焰紅。",
  "甜蜜小吉！可麗餅的甜度剛好抵銷今日的疲勞。幸運色：焦糖布丁色。",
  "自信大吉！你是 Hoya 團隊最亮的那顆星，勇敢展現自我！幸運色：皇室藍。",
  "悠閒中吉！江之島的海風會帶走所有焦慮，深呼吸一口氣吧。幸運色：海鹽綠。",
  "探險小吉！秋葉原的某個轉角藏著你尋找已久的寶物。幸運色：閃電黃。",
  "幸福大吉！與摯友共享美食的滋味，就是旅遊的真諦。幸運色：溫暖棕。",
  "閃耀小吉！隨機抽到的挑戰任務你絕對能完美達成。幸運色：亮片銀。",
  "開心中吉！今天的笑聲會比平常多出三倍。幸運色：櫻花粉。",
  "圓滿大吉！這趟旅程的每一刻都將成為你心中永恆的彩虹。幸運色：透明幻彩。"
];

export const getSpotGuide = async (spot: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `請介紹東京景點：${spot}。對象是同志旅遊團，請用輕鬆、可愛、有品味的風格介紹。包含必看重點與交通小撇步，約150字內，繁體中文。`,
    });
    return response.text;
  } catch (error) {
    return `目前暫無 ${spot} 的詳細資訊，建議參考官方網站。`;
  }
};

export const getOmikuji = async () => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `你是一個住在東京新宿二丁目的時尚彩虹巫女。請為 Hoya 團隊生成一個「今日彩虹御神籤」。
      如果你需要靈感，這是一些風格範例（請不要照抄，但可以參考其風格多樣性）：
      ${OMIKUJI_SAMPLES.join('\n')}
      
      生成的內容必須包含：
      1. 運勢等級（例如：大吉、閃耀中吉、愛心小吉）。
      2. 旅遊建議（要包含 Pride/同志友善/可愛/美食/購物的梗）。
      3. 幸運色。
      請使用極度可愛、充滿自信與祝福的口吻，約 100 字內，繁體中文。`,
    });
    return response.text;
  } catch (error) {
    // API 失敗時，從 20 個樣本中隨機挑選一個
    return OMIKUJI_SAMPLES[Math.floor(Math.random() * OMIKUJI_SAMPLES.length)];
  }
};
