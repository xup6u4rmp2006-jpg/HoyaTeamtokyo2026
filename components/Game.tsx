import React, { useState, useEffect } from 'react';
import { Sparkles, Beer, RotateCw, Wand2, GlassWater, Zap, Heart, Star, PartyPopper, AlertCircle, Loader2, X, Check, Trash2, RefreshCcw } from 'lucide-react';
import { db } from '../services/firebase';
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";

const GAME_CARDS = [
  // === 真心話 (Truth) - 100 題 ===
  { type: 'truth', content: '這趟旅程中，誰的哪個小細節讓你覺得「有他真好」？', rule: '不回答喝三口' },
  { type: 'truth', content: '分享一個你對在座某位成員「一見鍾情」或「很有好感」的瞬間。', rule: '不回答喝三口' },
  { type: 'truth', content: '如果明天只能帶一個人去逛 Donki 買爆，你會選誰？', rule: '不回答喝三口' },
  { type: 'truth', content: '說出在座一位團員最讓你崇拜的優點。', rule: '不回答喝三口' },
  { type: 'truth', content: '如果你可以擁有在座某人的一項人格特質，你最想要誰的什麼？', rule: '不回答喝三口' },
  { type: 'truth', content: '這趟旅行到目前為止，你最感謝現場哪一位成員？為什麼？', rule: '不回答喝三口' },
  { type: 'truth', content: '分享一個你對 Hoya 團隊最感性的真心告白。', rule: '大家乾杯' },
  { type: 'truth', content: '如果你要在東京鐵塔下拍婚紗照，你會選誰當攝影師？', rule: '不回答喝三口' },
  { type: 'truth', content: '現場誰的穿搭是你私心最喜歡、覺得最有品味的？', rule: '不回答喝三口' },
  { type: 'truth', content: '分享一段你最想刪除的「醉後黑歷史」。', rule: '不回答喝三口' },
  { type: 'truth', content: '你覺得誰是這群人裡最能保守秘密的「靈魂樹洞」？', rule: '不回答喝三口' },
  { type: 'truth', content: '如果你可以跟在座一位靈魂交換 24 小時，你想變誰？', rule: '不回答喝三口' },
  { type: 'truth', content: '說出三個你最喜歡 Hoya 團隊的原因。', rule: '不回答喝三口' },
  { type: 'truth', content: '你覺得誰最有可能是這趟旅程的「地下領隊」？', rule: '不回答喝三口' },
  { type: 'truth', content: '如果你要在新宿二丁目開一家 Bar，你想邀請誰當合夥人？', rule: '不回答喝三口' },
  { type: 'truth', content: '分享一個你最近夢到與團員有關的奇怪或有趣的夢。', rule: '不回答喝三口' },
  { type: 'truth', content: '你覺得現場誰最「悶騷」？請舉例說明。', rule: '不回答喝三口' },
  { type: 'truth', content: '如果預算無限，你想送現場哪位團員一個他在東京最想要的禮物？', rule: '不回答喝三口' },
  { type: 'truth', content: '這趟旅程中，誰的哪個舉動讓你覺得最「暖心」？', rule: '不回答喝三口' },
  { type: 'truth', content: '說出一個你對這趟東京旅行的一個「不切實際的小幻想」。', rule: '不回答喝三口' },
  { type: 'truth', content: '你覺得現場誰最容易讓你感到放鬆？為什麼？', rule: '不回答喝三口' },
  { type: 'truth', content: '分享一件你這輩子做過最讓你感到 Pride 的事情。', rule: '大家乾杯' },
  { type: 'truth', content: '如果要在東京拍偶像劇，你覺得誰最適合演男/女主角？', rule: '不回答喝三口' },
  { type: 'truth', content: '說出一個你在這趟旅行前，對某位成員的「美麗誤解」。', rule: '不回答喝三口' },
  { type: 'truth', content: '如果你中了一億日圓，你會帶全團去哪裡玩？', rule: '不回答喝三口' },
  { type: 'truth', content: '現場誰是你覺得最有「故事」的人？', rule: '不回答喝三口' },
  { type: 'truth', content: '如果你必須跟現場一位成員在荒島生活一年，你會選誰？', rule: '不回答喝三口' },
  { type: 'truth', content: '分享你人生中目前為止覺得最幸福的一個時刻。', rule: '不回答喝三口' },
  { type: 'truth', content: '你最喜歡自己身上的哪一個特質？', rule: '不回答喝三口' },
  { type: 'truth', content: '如果明天世界末日，你會想對在座的大家說什麼？', rule: '不回答喝五口' },
  { type: 'truth', content: '你覺得 Hoya 團隊最重要的「核心靈魂」是什麼？', rule: '不回答喝三口' },
  { type: 'truth', content: '說出在座一位成員讓你覺得「非常有魅力」的瞬間。', rule: '不回答喝三口' },
  { type: 'truth', content: '如果你可以回到過去，你會想改變哪一個決定？', rule: '不回答喝三口' },
  { type: 'truth', content: '分享一個你曾經因為「愛面子」而發生的趣事。', rule: '不回答喝三口' },
  { type: 'truth', content: '你覺得這群人裡面，誰最有可能在東京遇到浪漫豔遇？', rule: '不回答喝三口' },
  { type: 'truth', content: '說出你在團隊中最想扮演的角色（比如：保姆、搞笑擔當、金主）。', rule: '不回答喝三口' },
  { type: 'truth', content: '你對這趟旅行目前最滿意的地方是什麼？', rule: '不回答喝三口' },
  { type: 'truth', content: '分享一個你目前正在努力追求的目標。', rule: '不回答喝三口' },
  { type: 'truth', content: '在座誰的哪種才華是你最想偷過來的？', rule: '不回答喝三口' },
  { type: 'truth', content: '你覺得「好朋友」的定義是什麼？現場有人符合嗎？', rule: '不回答喝三口' },
  { type: 'truth', content: '分享一段你最難忘的「出櫃」經歷或心情（若願意分享）。', rule: '大家乾杯' },
  { type: 'truth', content: '你覺得誰是團隊裡的「情緒穩定器」？', rule: '不回答喝三口' },
  { type: 'truth', content: '說出你在座一位「不熟但想變熟」的人是誰？', rule: '不回答喝三口' },
  { type: 'truth', content: '如果你可以對十年前的自己說一句話，那會是什麼？', rule: '不回答喝三口' },
  { type: 'truth', content: '現場誰最符合你心目中的「理想型」氣質？', rule: '不回答喝三口' },
  { type: 'truth', content: '分享一個你做過最瘋狂的旅行決定。', rule: '不回答喝三口' },
  { type: 'truth', content: '你覺得這趟旅行結束後，大家最大的改變會是什麼？', rule: '不回答喝三口' },
  { type: 'truth', content: '說出一個你最想收到的讚美是什麼？', rule: '不回答喝三口' },
  { type: 'truth', content: '分享一個你曾經在職場或生活壓力大時的「舒壓秘密」。', rule: '不回答喝三口' },
  { type: 'truth', content: '在座誰是你覺得最「外剛內柔」的人？', rule: '不回答喝三口' },
  { type: 'truth', content: '如果你要在東京拍一部 VLOG，你最想拍誰的特輯？', rule: '不回答喝三口' },
  { type: 'truth', content: '說出一個你對在座某人一直想說但沒說出口的「謝謝」。', rule: '不回答喝三口' },
  { type: 'truth', content: '你覺得人生中最奢侈的享受是什麼？', rule: '不回答喝三口' },
  { type: 'truth', content: '分享一個你曾經「喜極而泣」的時刻。', rule: '不回答喝三口' },
  { type: 'truth', content: '如果可以選擇，你想在哪個城市定居？', rule: '不回答喝三口' },
  { type: 'truth', content: '在座誰最讓你覺得「深不可測」？', rule: '不回答喝三口' },
  { type: 'truth', content: '分享一個你最幼稚的愛好。', rule: '不回答喝三口' },
  { type: 'truth', content: '如果你要選一個人當你的「遺產繼承人」，你會選誰？（現場選）', rule: '不回答喝五口' },
  { type: 'truth', content: '說出你這輩子最難忘的一餐在哪裡？', rule: '不回答喝三口' },
  { type: 'truth', content: '你覺得這趟旅行中誰的「反差萌」最大？', rule: '不回答喝三口' },
  { type: 'truth', content: '分享一個你目前最大的遺憾。', rule: '不回答喝三口' },
  { type: 'truth', content: '說出在座一位成員曾經讓你感到「被溫暖到」的舉動。', rule: '不回答喝三口' },
  { type: 'truth', content: '如果你能預知未來，你想知道哪件事？', rule: '不回答喝三口' },
  { type: 'truth', content: '分享一個你對「家」的定義。', rule: '不回答喝三口' },
  { type: 'truth', content: '在座誰壓是你覺得最「有正義感」的人？', rule: '不回答喝三口' },
  { type: 'truth', content: '如果你必須跟現場一位成員組團出道，你們的團名是什麼？', rule: '不回答喝三口' },
  { type: 'truth', content: '說出一個你對 Hoya 團隊未來的期許。', rule: '大家乾杯' },
  { type: 'truth', content: '分享一個你曾經「大開眼界」的時刻。', rule: '不回答喝三口' },
  { type: 'truth', content: '在座誰讓你感到「非常有親和力」？', rule: '不回答喝三口' },
  { type: 'truth', content: '分享一個你最近最開心的發現。', rule: '不回答喝三口' },
  { type: 'truth', content: '如果你可以對全世界的人廣播一句話，你會說什麼？', rule: '不回答喝三口' },
  { type: 'truth', content: '說出一個你最不擅長處理的情緒是什麼？', rule: '不回答喝三口' },
  { type: 'truth', content: '分享一個你最欣賞的彩虹名人。', rule: '不回答喝三口' },
  { type: 'truth', content: '在座誰是你覺得「最值得信任」的旅行夥伴？', rule: '不回答喝三口' },
  { type: 'truth', content: '說出一個你對這群人的「第一印象」關鍵字。', rule: '不回答喝三口' },
  { type: 'truth', content: '如果你可以擁有一種超能力，你想選什麼？', rule: '不回答喝三口' },
  { type: 'truth', content: '分享一個你對「幸福旅行」的必備條件。', rule: '不回答喝三口' },
  { type: 'truth', content: '在座誰最容易看穿你的心事？', rule: '不回答喝三口' },
  { type: 'truth', content: '說出一個你覺得這趟旅行「不可或缺」的人。', rule: '不回答喝三口' },
  { type: 'truth', content: '分享一個你最引以為傲的個人習慣。', rule: '不回答喝三口' },
  { type: 'truth', content: '如果你可以在東京開一間主題旅館，是什麼主題？', rule: '不回答喝三口' },
  { type: 'truth', content: '在座誰的哪一點是你一直想學習的？', rule: '不回答喝三口' },
  { type: 'truth', content: '說出一個你目前最想感謝的人（現場以外也可以）。', rule: '不回答喝三口' },
  { type: 'truth', content: '分享一個你曾經「破繭而出」的故事。', rule: '不回答喝三口' },
  { type: 'truth', content: '你覺得 Hoya 團隊像哪一種動物？', rule: '不回答喝三口' },
  { type: 'truth', content: '說出一個你覺得「活著真好」的瞬間。', rule: '不回答喝三口' },
  { type: 'truth', content: '分享一個你最想和大家一起去挑戰的清單。', rule: '不回答喝三口' },
  { type: 'truth', content: '在座誰最像是你的「靈魂家人」？', rule: '不回答喝三口' },
  { type: 'truth', content: '說出一個你對「彩虹」這兩個字的私人情感。', rule: '大家乾杯' },
  { type: 'truth', content: '分享一個你曾經被「誤解」最深的經歷。', rule: '不回答喝三口' },
  { type: 'truth', content: '如果你能對未來的自己寄一封信，你會寫什麼？', rule: '不回答喝三口' },
  { type: 'truth', content: '在座誰的穿搭讓你覺得「很有勇氣」？', rule: '不回答喝三口' },
  { type: 'truth', content: '說出一個你這幾天最受不了的旅遊小毛病。', rule: '不回答喝三口' },
  { type: 'truth', content: '分享一個你對「完美的一天」的想像。', rule: '不回答喝三口' },
  { type: 'truth', content: '你覺得誰是這群人裡最「心靈手巧」的人？', rule: '不回答喝三口' },
  { type: 'truth', content: '如果可以選擇，你想和現場哪位成員交換一天的行程？', rule: '不回答喝三口' },
  { type: 'truth', content: '說出你覺得這趟旅程中「最反差」的一個時刻。', rule: '不回答喝三口' },
  { type: 'truth', content: '分享一個你對 Hoya 夥伴們的秘密誇獎。', rule: '大家乾杯' },
  { type: 'truth', content: '如果可以在東京定居，你會想住在哪一區？', rule: '不回答喝三口' },
  { type: 'truth', content: '最後一題真心話：請對大家說一句最誠實的祝福。', rule: '大家乾杯！' },

  // === 大挑戰 (Challenge) - 100 題 ===
  { type: 'challenge', content: '模仿現場某位團員的說話方式，直到被猜出來為止。', rule: '失敗喝三口' },
  { type: 'challenge', content: '選一位成員對視 30 秒，期間不准笑場。', rule: '笑了喝三口' },
  { type: 'challenge', content: '大聲喊出：「我是 Hoya 團隊最性感的人！」', rule: '不喊喝三口' },
  { type: 'challenge', content: '對著鏡頭擺出三個最「浮誇」的名模 Pose。', rule: '沒做喝三口' },
  { type: 'challenge', content: '讓左邊的人幫你畫一個「東京主題」的臉部裝飾，直到遊戲結束。', rule: '拒絕喝五口' },
  { type: 'challenge', content: '模仿一種東京街頭會看到的動物（如：柴犬、野貓、鴿子）。', rule: '不像喝三口' },
  { type: 'challenge', content: '用最肉麻的日文對右邊的人說一段土味情話。', rule: '不說喝三口' },
  { type: 'challenge', content: '發出一則限動內容為「東京我愛 Hoya，XX 是我的小可愛」，維持 1 小時。', rule: '不發喝五口' },
  { type: 'challenge', content: '連續做 5 個深蹲，並在每次蹲下時大喊「和牛！」', rule: '沒做喝三口' },
  { type: 'challenge', content: '展示手機裡最後一張「拍壞的照片」給所有人看。', rule: '拒絕喝三口' },
  { type: 'challenge', content: '跟右邊的人互換一件身上的配飾（如：戒指、耳環、眼鏡），直到下一輪。', rule: '不換喝三口' },
  { type: 'challenge', content: '現場表演大笑 10 秒鐘，中途不可以停下來。', rule: '停下喝三口' },
  { type: 'challenge', content: '用屁股寫出你的英文名字，讓大家猜。', rule: '猜不到喝三口' },
  { type: 'challenge', content: '讓現場每個人在你手臂上寫一個讚美你的詞（用指頭寫）。', rule: '沒做喝三口' },
  { type: 'challenge', content: '挑戰用非慣用手畫出富士山輪廓。', rule: '畫太醜喝三口' },
  { type: 'challenge', content: '模仿在座某位成員「喝醉後的樣子」。', rule: '不夠傳神喝三口' },
  { type: 'challenge', content: '壁咚現場一位成員，並對他進行 10 秒鐘的「靈魂凝視」。', rule: '沒做喝三口' },
  { type: 'challenge', content: '用最高音大喊「Hoya No.1！」', rule: '不喊喝三口' },
  { type: 'challenge', content: '蒙眼品嚐現場的一種飲料/零食並猜出品牌或口味。', rule: '猜錯喝三口' },
  { type: 'challenge', content: '選一位成員一起做「雙人愛心」合照，並設為頭像一小時。', rule: '拒絕喝五口' },
  { type: 'challenge', content: '表演一段 15 秒的「在二丁目酒吧熱舞」的樣子。', rule: '沒跳喝三口' },
  { type: 'challenge', content: '讓大家檢查你的最近 3 筆搜尋紀錄。', rule: '拒絕喝五口' },
  { type: 'challenge', content: '模仿一個日本動畫角色的經典台詞。', rule: '不像喝三口' },
  { type: 'challenge', content: '挑戰 10 秒鐘內說出 10 個東京的地名。', rule: '失敗喝三口' },
  { type: 'challenge', content: '選一個成員幫他按摩肩膀 1 分鐘。', rule: '不按喝三口' },
  { type: 'challenge', content: '現場展示一段你最拿手的「隱藏才藝」。', rule: '沒做喝三口' },
  { type: 'challenge', content: '用肩膀跟左邊的人「擊掌」。', rule: '沒做喝二口' },
  { type: 'challenge', content: '模仿「新宿 3D 巨貓」伸懶腰的動作。', rule: '不像喝二口' },
  { type: 'challenge', content: '對著全場的人送出一個超大聲的飛吻。', rule: '沒做喝三口' },
  { type: 'challenge', content: '扮演一位「傲嬌的東京店員」對大家進行點餐服務。', rule: '沒做喝三口' },
  { type: 'challenge', content: '讓右邊的人隨機撥打一個通訊錄好友，你要跟他說「我正在東京想你」。', rule: '不打喝五口' },
  { type: 'challenge', content: '模仿「歌舞伎町」看板上的男公關姿勢拍一張照。', rule: '不像喝三口' },
  { type: 'challenge', content: '原地旋轉 5 圈後，走直線 3 公尺。', rule: '走歪喝二口' },
  { type: 'challenge', content: '用日文腔調說一段台語。', rule: '不說喝三口' },
  { type: 'challenge', content: '挑戰用腳趾頭夾起一張衛生紙遞給旁邊的人。', rule: '失敗喝三口' },
  { type: 'challenge', content: '選一位成員，對他唱一首 30 秒的情歌。', rule: '不唱喝三口' },
  { type: 'challenge', content: '扮演一位「在東京地鐵迷路」的遊客，表現出慌張的樣子。', rule: '沒做喝二口' },
  { type: 'challenge', content: '模仿現場某位成員的「招牌表情」。', rule: '不像喝三口' },
  { type: 'challenge', content: '挑戰 30 秒不眨眼。', rule: '失敗喝二口' },
  { type: 'challenge', content: '跟在座隨機兩位成員組成偶像團體擺出「出道 Pose」。', rule: '沒做喝三口' },
  { type: 'challenge', content: '讓大家決定你的一個「搞笑稱號」，並在遊戲結束前都要這樣自稱。', rule: '拒絕喝三口' },
  { type: 'challenge', content: '模仿「自由女神」的姿勢維持 30 秒。', rule: '亂動喝三口' },
  { type: 'challenge', content: '對著鏡子對自己說 5 句誇獎的話。', rule: '沒說喝三口' },
  { type: 'challenge', content: '表演一個「在藥妝店搶購」的動作。', rule: '沒做喝二口' },
  { type: 'challenge', content: '現場找出一樣紅色的東西並戴在頭上。', rule: '找不到喝二口' },
  { type: 'challenge', content: '模仿「蠟筆小新」說話。', rule: '不像喝三口' },
  { type: 'challenge', content: '挑戰連續說三次「吃葡萄不吐葡萄皮」。', rule: '失敗喝三口' },
  { type: 'challenge', content: '跟在座的一位成員手牽手直到下一位抽到大挑戰。', rule: '拒絕喝五口' },
  { type: 'challenge', content: '模仿一位「在神社求到大凶」的人的表情。', rule: '不傳神喝三口' },
  { type: 'challenge', content: '用膝蓋畫一個大愛心給全團。', rule: '沒做喝二口' },
  { type: 'challenge', content: '表演一段「模仿章魚燒翻滾」的動作。', rule: '沒做喝三口' },
  { type: 'challenge', content: '讓左邊的人決定你接下來 5 分鐘內不能說什麼詞（如：東京、酒）。', rule: '說了喝一口' },
  { type: 'challenge', content: '模仿一個「在成田機場趕飛機」的人。', rule: '沒做喝二口' },
  { type: 'challenge', content: '挑戰用單手解開右邊的人的手機（若有密碼改為幫他拿酒）。', rule: '沒做喝二口' },
  { type: 'challenge', content: '模仿「酷斯拉」在新宿街頭橫行的樣子。', rule: '不像喝三口' },
  { type: 'challenge', content: '選一位成員，互相交換一張手機裡最醜的照片。', rule: '拒絕喝三口' },
  { type: 'challenge', content: '表演一段「在澀谷十字路口奔跑」的樣子。', rule: '沒做喝二口' },
  { type: 'challenge', content: '用腳寫出「Hoya」這四個字。', rule: '寫不出來喝三口' },
  { type: 'challenge', content: '模仿現場某位成員「發呆」的樣子。', rule: '不傳神喝二口' },
  { type: 'challenge', content: '挑戰在一分鐘內不准說「我、你、他」。', rule: '說了喝一口' },
  { type: 'challenge', content: '讓大家在你身上找一個「你不滿意的地方」並讚美它。', rule: '拒絕喝三口' },
  { type: 'challenge', content: '模仿一位「在居酒屋點餐點錯」的尷尬表情。', rule: '沒做喝二口' },
  { type: 'challenge', content: '選一個成員，對他做出一個「最有誠意的道歉」（無論之前有沒有發生事）。', rule: '沒做喝三口' },
  { type: 'challenge', content: '模仿「Hello Kitty」打招呼。', rule: '不夠可愛喝三口' },
  { type: 'challenge', content: '表演一段「第一次吃到極上和牛」的靈魂震撼。', rule: '沒做喝三口' },
  { type: 'challenge', content: '挑戰用非慣用手喝完半杯酒/飲料。', rule: '灑出來喝二口' },
  { type: 'challenge', content: '模仿現場某位團員「整理頭髮」的樣子。', rule: '不像喝二口' },
  { type: 'challenge', content: '扮演一位「在表參道被街拍」的名模，走 5 步台步。', rule: '沒做喝三口' },
  { type: 'challenge', content: '挑戰在 10 秒內說出 5 個日本的品牌。', rule: '失敗喝三口' },
  { type: 'challenge', content: '模仿「皮卡丘」放電的樣子。', rule: '沒做喝三口' },
  { type: 'challenge', content: '讓右邊的人幫你取一個「日文名字」。', rule: '沒做喝二口' },
  { type: 'challenge', content: '表演一個「在溫泉池水溫太高」的表情。', rule: '沒做喝二口' },
  { type: 'challenge', content: '挑戰用舌頭舔到自己的鼻子。', rule: '舔不到喝二口' },
  { type: 'challenge', content: '模仿現場某位成員「自拍」時的動作與表情。', rule: '不像喝三口' },
  { type: 'challenge', content: '扮演一位「在原宿吃可麗餅」的少女。', rule: '沒做喝三口' },
  { type: 'challenge', content: '挑戰 15 秒內數完 50 到 1 的倒數。', rule: '數錯喝三口' },
  { type: 'challenge', content: '跟在座一位成員進行 3 次「剪刀石頭布」，全輸的人喝。', rule: '輸了喝三口' },
  { type: 'challenge', content: '模仿一位「在秋葉原看到心愛周邊」的宅宅。', rule: '沒做喝三口' },
  { type: 'challenge', content: '挑戰用額頭跟對面的人「擊掌」。', rule: '沒做喝二口' },
  { type: 'challenge', content: '表演一個「在飛機上遇到亂流」的驚慌感。', rule: '沒做喝二口' },
  { type: 'challenge', content: '模仿現場某位成員「不耐煩」的樣子。', rule: '不像喝三口' },
  { type: 'challenge', content: '挑戰用日文說出自己的名字與興趣。', rule: '不會說喝三口' },
  { type: 'challenge', content: '讓大家在你手機殼後貼一張醜標籤（或寫字），維持到回台灣。', rule: '拒絕喝十口' },
  { type: 'challenge', content: '模仿一位「在二丁目遇到天菜」的反應。', rule: '沒做喝三口' },
  { type: 'challenge', content: '表演一個「在築地市場吃到超辣芥末」的臉。', rule: '沒做喝二口' },
  { type: 'challenge', content: '挑戰 30 秒內完成 10 個開合跳。', rule: '失敗喝三口' },
  { type: 'challenge', content: '模仿現場某位成員「滑手機」的神情。', rule: '不像喝二口' },
  { type: 'challenge', content: '挑戰用屁股寫出「Rainbow」。', rule: '寫不出來喝三口' },
  { type: 'challenge', content: '選一位成員，對他進行 30 秒的「吹捧大賽」。', rule: '沒做喝三口' },
  { type: 'challenge', content: '模仿一位「在日本便利商店結帳」的過程。', rule: '沒做喝二口' },
  { type: 'challenge', content: '表演一段「模仿招財貓」招手的樣子。', rule: '不傳神喝二口' },
  { type: 'challenge', content: '挑戰連續做出 5 個不同的搞怪表情。', rule: '失敗喝三口' },
  { type: 'challenge', content: '讓左邊的人幫你決定下一首你要唱的副歌。', rule: '沒做喝三口' },
  { type: 'challenge', content: '模仿一位「在明治神宮洗手」的人。', rule: '沒做喝二口' },
  { type: 'challenge', content: '挑戰 1 分鐘內不准露出牙齒說話。', rule: '露齒喝一口' },
  { type: 'challenge', content: '表演一個「在日本藥妝店找不到退稅櫃檯」的崩潰感。', rule: '沒做喝二口' },
  { type: 'challenge', content: '跟在座所有成員擊掌一次。', rule: '沒做喝三口' },
  { type: 'challenge', content: '模仿「貞子」爬出來的動作。', rule: '沒做喝三口' },
  { type: 'challenge', content: '挑戰用日文說「大家辛苦了」。', rule: '不會說喝二口' },
  { type: 'challenge', content: '最後一個挑戰：請對著全場大聲說「我愛 Hoya，我愛大家！」', rule: '大家乾杯！' },

  // === 我從來沒有 (Never) - 50 題 ===
  { type: 'never', content: '我從來沒有在國外坐地鐵坐反方向過。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在飯店房間偷吃過團員的零食。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有沒洗澡就睡著過。', rule: '有過的人喝二口' },
  { type: 'never', content: '我從來沒有忘記帶護照去機場過。', rule: '有過的人喝五口' },
  { type: 'never', content: '我從來沒有暗戀過現場的成員。', rule: '有過的人喝三口' },
  { type: 'never', content: '我從來沒有在網路上買過超過一萬元卻沒用的東西。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在日本超商買宵夜買到超過 3000 日圓。', rule: '有過的人喝二口' },
  { type: 'never', content: '我從來沒有在旅行中弄丟過房卡。', rule: '有過的人喝三口' },
  { type: 'never', content: '我從來沒有邊洗澡邊唱歌。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在酒精作用下打電話給前任。', rule: '有過的人喝五口' },
  { type: 'never', content: '我從來沒有在公眾場合跌倒過。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有試過一個人出國旅行。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在飛機上哭過。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有用過交友軟體。', rule: '有過的人喝二口' },
  { type: 'never', content: '我從來沒有忘記過任何一個團員的生日。', rule: '有過的人喝三口' },
  { type: 'never', content: '我從來沒有在捷運/地鐵上睡過頭坐到底站。', rule: '有過的人喝二口' },
  { type: 'never', content: '我從來沒有在日本買過成人雜誌或用品。', rule: '有過的人喝三口' },
  { type: 'never', content: '我從來沒有試過在國外豔遇。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在洗澡的時候偷偷哭過。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有沒刷牙就出門逛街。', rule: '有過的人喝二口' },
  { type: 'never', content: '我從來沒有在網路上跟人吵過架。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來同時跟兩個人約會。', rule: '有過的人喝五口' },
  { type: 'never', content: '我從來沒有在電影院看到睡著。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有因為看電視劇而大哭。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有忘記帶手機出門。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在旅行中弄丟過錢包。', rule: '有過的人喝五口' },
  { type: 'never', content: '我從來沒有吃過一整顆榴槤。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在捷運上遇到喜歡的名人。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有連續三天不洗澡。', rule: '有過的人喝三口' },
  { type: 'never', content: '我從來沒有在國外生病看醫生。', rule: '有過的人喝二口' },
  { type: 'never', content: '我從來沒有試過高空彈跳或跳傘。', rule: '有過的人喝二口' },
  { type: 'never', content: '我從來沒有在二丁目喝到斷片過。', rule: '有過的人喝五口' },
  { type: 'never', content: '我從來沒有在機場跑百米趕飛機。', rule: '有過的人喝三口' },
  { type: 'never', content: '我從來沒有試過在冬天吃冰。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在日本超商買到拿不動。', rule: '有過的人喝二口' },
  { type: 'never', content: '我從來沒有忘記關火就出門。', rule: '有過的人喝三口' },
  { type: 'never', content: '我從來沒有沒帶錢包就去付錢。', rule: '有過的人喝二口' },
  { type: 'never', content: '我從來沒有在飯店偷偷帶走不該帶的東西（如：毛巾）。', rule: '有過的人喝三口' },
  { type: 'never', content: '我從來沒有在飛機上遇到帥哥/美女空服員。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在二丁目的酒吧裡跳過舞。', rule: '有過的人喝二口' },
  { type: 'never', content: '我從來沒有在藥妝店逛到店家打烊。', rule: '有過的人喝二口' },
  { type: 'never', content: '我從來沒有沒洗頭就出國。', rule: '有過的人喝二口' },
  { type: 'never', content: '我從來沒有在旅行中跟團員吵過架。', rule: '有過的人喝三口' },
  { type: 'never', content: '我從來沒有在回國時行李超重。', rule: '有過的人喝二口' },
  { type: 'never', content: '我從來沒有在神社求過大吉。', rule: '有過的人喝二口' },
  { type: 'never', content: '我從來沒有在東京街頭迷路到想哭。', rule: '有過的人喝二口' },
  { type: 'never', content: '我從來沒有買過超過一萬元的名牌包。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在酒精作用下大聲唱歌。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有沒穿內褲出門。', rule: '有過的人喝五口' },
  { type: 'never', content: '我從來沒有在東京鐵塔下許過願。', rule: '有過的人喝二口' },

  // === 誰最容易 (Most) - 50 題 ===
  { type: 'most', content: '誰最容易在新宿二丁目迷路到天亮？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在居酒屋點餐點到破產？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在旅行中弄丟民宿房卡？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在回國時行李箱塞到炸掉？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在酒精作用下變成愛哭鬼？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易成為這趟旅程的「遲到王」？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在表參道被當成模特兒街拍？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在民宿裡負責煮宵夜給大家吃？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在飛機起飛前才衝進登機門？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在藥妝店逛到店家打烊還不出來？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易成為這趟旅行的「美照產出機」？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在築地市場吃到痛風發作？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在 TeamLab 撞到玻璃？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在神社抽到「大凶」？', rule: '被指最多的人喝三口' },
  { type: 'most', content: '誰最容易在居酒屋喝到一半去廁所睡著？', rule: '被指最多的人喝三口' },
  { type: 'most', content: '誰最容易在旅行中手機掉進水裡？', rule: '被指最多的人喝三口' },
  { type: 'most', content: '誰最容易在飛機上睡到流口水？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易成為團隊裡的「氣氛擔當」？', rule: '被指最多的人喝一口' },
  { type: 'most', content: '誰最容易在藥妝店幫全台灣的朋友代購？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在旅行中弄丟錢包？', rule: '被指最多的人喝五口' },
  { type: 'most', content: '誰最容易在回台灣後兩天都在調「旅遊時差」？', rule: '被指最多的人喝一口' },
  { type: 'most', content: '誰最容易在居酒屋點錯最獵奇的食物？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在東京街頭大聲講中文鬧笑話？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在神社拜拜的時候錢投不進箱子？', rule: '被指最多的人喝二口' },
  { type: 'most', content: '誰最容易在新宿二丁目酒吧被路人搭訕？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在旅行中買了最多沒用的廢物？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在民宿裡第一個睡著？', rule: '被指最多的人喝一口' },
  { type: 'most', content: '誰最容易在超市買完東西忘記拿走？', rule: '被指最多的人喝三口' },
  { type: 'most', content: '誰最容易在旅行中一直問「等一下要吃什麼」？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在飛機起飛前一秒還在買免稅品？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在神社求到籤後因為內容大哭？', rule: '被指最多的人喝三口' },
  { type: 'most', content: '誰最容易在旅行中穿錯衣服（太冷或太熱）？', rule: '被指最多的人喝一口' },
  { type: 'most', content: '誰最容易在居酒屋喝醉後開始亂稱讚人？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在新宿街頭跟丟團員？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在 TeamLab 裡面迷路走不出來？', rule: '被指最多的人喝二口' },
  { type: 'most', content: '誰最容易在成田機場行李磅秤前尖叫？', rule: '被指最多的人喝三口' },
  { type: 'most', content: '誰最容易在旅行中一直找廁所？', rule: '被指最多的人喝一口' },
  { type: 'most', content: '誰最容易在居酒屋喝醉後開始講英文？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在二丁目酒吧點了最貴的酒？', rule: '被指最多的人喝三口' },
  { type: 'most', content: '誰最容易在旅行中拍出大家最醜的照片？', rule: '被指最多的人喝三口' },
  { type: 'most', content: '誰最容易在民宿裡負責收垃圾？', rule: '被指最多的人喝一口' },
  { type: 'most', content: '誰最容易在旅行中忘記帶房號？', rule: '被指最多的人喝二口' },
  { type: 'most', content: '誰最容易在藥妝店為了退稅排隊到發脾氣？', rule: '被指最多的人喝二口' },
  { type: 'most', content: '誰最容易在神社洗手時把袖子弄濕？', rule: '被指最多的人喝一口' },
  { type: 'most', content: '誰最容易在二丁目的深夜還在吃拉麵？', rule: '被指最多的人喝二口' },
  { type: 'most', content: '誰最容易在旅行中第一個喊累？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在回國後兩天都還在發旅遊限動？', rule: '被指最多的人喝一口' },
  { type: 'most', content: '誰最容易在旅行中一直問「現在要去哪」？', rule: '被指最多的人喝二口' },
  { type: 'most', content: '誰最容易在二丁目被路人誤認為當地人？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '最後一個票選：誰是這趟旅行中「最愛大家的人」？', rule: '被指最多的人要對大家大告白！' },
];

const CARD_THEMES = {
  never: { bg: 'from-rose-400 to-pink-500', label: '我從來沒有...', icon: <Star size={20} /> },
  truth: { bg: 'from-purple-400 to-indigo-500', label: '真心話', icon: <Heart size={20} /> },
  most: { bg: 'from-cyan-400 to-blue-500', label: '誰最容易...', icon: <GlassWater size={20} /> },
  challenge: { bg: 'from-amber-400 to-orange-500', label: '大挑戰', icon: <Zap size={20} /> },
};

const Game: React.FC = () => {
  const [drawnIndices, setDrawnIndices] = useState<number[]>([]);
  const [drunkLevel, setDrunkLevel] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isShuffling, setIsShuffling] = useState(false);
  const [showQuestionsReset, setShowQuestionsReset] = useState(false);
  const [showDrunkReset, setShowDrunkReset] = useState(false);

  // 監聽 Firebase 遊戲資料
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "travelData", "game_v1"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDrawnIndices(data.drawnIndices || []);
        setDrunkLevel(data.drunkLevel || 0);
        setCurrentCardIndex(data.currentCardIndex ?? null);
      } else {
        const initialData = {
          drawnIndices: [],
          drunkLevel: 0,
          currentCardIndex: null
        };
        setDoc(doc(db, "travelData", "game_v1"), initialData);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const saveToFirebase = async (data: any) => {
    await updateDoc(doc(db, "travelData", "game_v1"), data);
  };

  const drawCard = () => {
    if (isShuffling || drawnIndices.length >= GAME_CARDS.length) return;

    setIsShuffling(true);
    setTimeout(async () => {
      const availableIndices = GAME_CARDS.map((_, i) => i).filter(i => !drawnIndices.includes(i));
      
      if (availableIndices.length === 0) {
        setIsShuffling(false);
        return;
      }

      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      await saveToFirebase({
        currentCardIndex: randomIndex,
        drawnIndices: [...drawnIndices, randomIndex]
      });
      setIsShuffling(false);
    }, 800);
  };

  const incrementDrunk = async () => {
    const newLevel = Math.min(100, drunkLevel + 10);
    await saveToFirebase({ drunkLevel: newLevel });
  };

  const confirmQuestionsReset = async () => {
    setLoading(true);
    await saveToFirebase({
      drawnIndices: [],
      currentCardIndex: null
    });
    setShowQuestionsReset(false);
    setLoading(false);
  };

  const confirmDrunkReset = async () => {
    setLoading(true);
    await saveToFirebase({
      drunkLevel: 0
    });
    setShowDrunkReset(false);
    setLoading(false);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 text-rose-300">
      <Loader2 className="animate-spin mb-4" size={48} />
      <p className="font-black animate-pulse uppercase tracking-widest text-xs">大冒險同步中...</p>
    </div>
  );

  const currentCard = currentCardIndex !== null ? GAME_CARDS[currentCardIndex] : null;
  const allCardsDrawn = drawnIndices.length >= GAME_CARDS.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="text-center">
        <h2 className="text-3xl font-black text-[#F06292] flex items-center justify-center gap-3 drop-shadow-sm italic">
          🥂 彩虹醉夢大冒險
        </h2>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] mt-2 italic">
          Hoya Team Party Game (Synced)
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-pink-50">
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col">
             <span className="text-xs font-black text-pink-400 uppercase tracking-widest">團隊醉意值 Drunk-O-Meter</span>
             <span className="text-[10px] text-gray-400 font-bold italic mt-0.5">已挑戰：{drawnIndices.length} / 300</span>
          </div>
          <span className="text-sm font-black text-pink-600">{drunkLevel}%</span>
        </div>
        <div className="w-full h-4 bg-pink-50 rounded-full overflow-hidden shadow-inner p-0.5">
          <div 
            className="h-full rainbow-bg rounded-full transition-all duration-700 ease-out relative"
            style={{ width: `${drunkLevel}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="relative h-[440px] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-pink-100/20 to-transparent rounded-[5rem] blur-3xl"></div>
        
        {isShuffling ? (
          <div className="w-[310px] h-[400px] rounded-[4.5rem] bg-white border-4 border-dashed border-pink-200 flex flex-col items-center justify-center gap-6 animate-pulse z-10 shadow-2xl">
            <RotateCw className="text-pink-300 animate-spin" size={60} />
            <span className="text-pink-300 font-black tracking-widest text-xs uppercase">正在尋找靈感任務...</span>
          </div>
        ) : allCardsDrawn ? (
          <div className="w-[310px] h-[400px] rounded-[4.5rem] bg-white border-4 border-dashed border-rose-200 flex flex-col items-center justify-center gap-6 z-10 shadow-2xl p-10 text-center">
            <AlertCircle size={64} className="text-rose-400" />
            <h3 className="text-2xl font-black text-gray-800">所有題目已抽完！</h3>
            <p className="text-sm font-bold text-gray-400">Hoya 團隊真是太厲害了，準備好再戰一輪嗎？</p>
            <button onClick={() => setShowQuestionsReset(true)} className="mt-4 px-8 py-3 bg-rose-500 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">
              重新開始抽題
            </button>
          </div>
        ) : currentCard ? (
          <div className={`w-[310px] h-[400px] rounded-[4.5rem] p-1.5 shadow-2xl z-10 animate-in zoom-in duration-300 bg-gradient-to-br ${CARD_THEMES[currentCard.type].bg}`}>
            <div className="w-full h-full bg-white rounded-[4.2rem] border-4 border-white flex flex-col p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 rainbow-bg opacity-30"></div>
              
              <div className="flex flex-col items-center gap-3 mt-4">
                 <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${CARD_THEMES[currentCard.type].bg} text-white flex items-center justify-center shadow-lg border-2 border-white/50`}>
                    {CARD_THEMES[currentCard.type].icon}
                 </div>
                 <div className="flex flex-col gap-1">
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                     {CARD_THEMES[currentCard.type].label}
                   </span>
                 </div>
              </div>

              <div className="flex-1 flex flex-col justify-center gap-6 px-2">
                <p className="text-lg font-black text-gray-800 leading-snug tracking-tight italic">
                  「{currentCard.content}」
                </p>
                <div className="p-3 bg-pink-50/50 rounded-2xl border border-pink-100/50">
                  <p className="text-[11px] font-black text-pink-600 uppercase tracking-widest leading-none">
                    罰則：{currentCard.rule}
                  </p>
                </div>
              </div>

              <div className="pb-4">
                 <button 
                   onClick={incrementDrunk}
                   className="px-6 py-2.5 rounded-full bg-pink-50 text-pink-500 text-[10px] font-black uppercase tracking-widest hover:bg-pink-100 transition-all flex items-center gap-2 mx-auto active:scale-95 shadow-sm"
                 >
                    <Beer size={14} /> 這題我喝！醉意+10
                 </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-[310px] h-[400px] rounded-[4.5rem] bg-white border-4 border-dashed border-gray-100 flex flex-col items-center justify-center gap-10 text-center p-12 shadow-inner">
            <div className="w-28 h-28 rounded-[2.5rem] bg-gray-50 flex items-center justify-center text-gray-200 border-2 border-gray-100">
               <Beer size={56} strokeWidth={1} />
            </div>
            <div className="space-y-3">
              <p className="text-lg font-black text-gray-400 italic leading-snug">
                準備好醉在東京了嗎？<br/>
                點擊抽牌按鈕開始！
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 px-2">
        <button 
          onClick={drawCard}
          disabled={isShuffling || allCardsDrawn}
          className={`w-full py-8 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white rounded-[3rem] font-black shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all text-xl border-b-[8px] border-black/10 hover:shadow-pink-200/50 ${allCardsDrawn ? 'opacity-50 grayscale' : ''}`}
        >
          {isShuffling ? <RotateCw className="animate-spin" /> : <><Wand2 size={24} /> 抽出驚喜任務 <Sparkles size={20} /></>}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setShowQuestionsReset(true)}
            className="py-4 bg-white border-2 border-pink-100 text-pink-400 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-90 shadow-sm"
          >
            <RefreshCcw size={14} /> 重置題目
          </button>
          <button 
            onClick={() => setShowDrunkReset(true)}
            className="py-4 bg-white border-2 border-rose-100 text-rose-500 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-90 shadow-sm"
          >
            <Beer size={14} /> 醉意歸零
          </button>
        </div>
        
        <button 
          className="w-full py-4 bg-pink-50 text-pink-600 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 shadow-sm"
        >
          <PartyPopper size={14} /> 團隊大冒險 ✨
        </button>
      </div>

      {/* 題目重置確認彈窗 */}
      {showQuestionsReset && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-8 w-full max-w-xs text-center space-y-6 animate-in zoom-in-95 duration-200 border-4 border-pink-50 shadow-2xl">
             <div className="w-20 h-20 bg-pink-50 text-pink-500 rounded-full mx-auto flex items-center justify-center shadow-inner">
                <Trash2 size={32} />
             </div>
             <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-800 italic">確定要重置題目？</h3>
                <p className="text-xs font-bold text-gray-400 leading-relaxed">
                  這將會清除所有已抽過的題目紀錄，<br/>讓你重新挑戰這 300 個任務。
                </p>
             </div>
             <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowQuestionsReset(false)} 
                  className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95"
                >
                  取消
                </button>
                <button 
                  onClick={confirmQuestionsReset} 
                  className="flex-[2] py-4 bg-pink-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 border-b-4 border-pink-700"
                >
                  <Check className="inline-block mr-1" size={14} /> 確定重置
                </button>
             </div>
          </div>
        </div>
      )}

      {/* 醉意歸零確認彈窗 */}
      {showDrunkReset && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-8 w-full max-w-xs text-center space-y-6 animate-in zoom-in-95 duration-200 border-4 border-rose-50 shadow-2xl">
             <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full mx-auto flex items-center justify-center shadow-inner">
                <Beer size={32} />
             </div>
             <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-800 italic">酒醒了嗎？</h3>
                <p className="text-xs font-bold text-gray-400 leading-relaxed">
                  這將會把目前的團隊醉意值歸零。<br/>準備好開始新的一輪狂歡嗎？
                </p>
             </div>
             <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowDrunkReset(false)} 
                  className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95"
                >
                  取消
                </button>
                <button 
                  onClick={confirmDrunkReset} 
                  className="flex-[2] py-4 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 border-b-4 border-rose-700"
                >
                  <Check className="inline-block mr-1" size={14} /> 醉意歸零
                </button>
             </div>
          </div>
        </div>
      )}

      <style>{`
        .rainbow-bg { background: linear-gradient(to right, #ffadad, #ffd6a5, #fdffb6, #caffbf, #9bf6ff, #a0c4ff, #bdb2ff, #ffc6ff); }
      `}</style>
    </div>
  );
};

export default Game;