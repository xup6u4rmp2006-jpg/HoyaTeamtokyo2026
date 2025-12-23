
import React, { useState, useEffect } from 'react';
import { Sparkles, Beer, RotateCw, Wand2, GlassWater, Zap, Heart, Star, PartyPopper, AlertCircle } from 'lucide-react';

const GAME_CARDS = [
  // 真心話 (Truth) - 50 題
  { type: 'truth', content: '現場誰是你最想在新宿二丁目約會的人？', rule: '不回答喝三口' },
  { type: 'truth', content: '說出在座一位團員讓你覺得「受不了」的小缺點？', rule: '不回答喝三口' },
  { type: 'truth', content: '如果明天世界末日，你會想跟誰在東京度過最後一天？', rule: '不回答喝三口' },
  { type: 'truth', content: '分享一段你最想刪除的醉後黑歷史？', rule: '不回答喝三口' },
  { type: 'truth', content: '這趟旅行中，你覺得誰最有可能是「地下領隊」？', rule: '不回答喝三口' },
  { type: 'truth', content: '如果你可以交換靈魂一天，你想換成哪位團員？', rule: '不回答喝三口' },
  { type: 'truth', content: '說出在座一位團員最吸引你的地方。', rule: '不回答喝三口' },
  { type: 'truth', content: '在東京這幾天，你偷偷對誰動心過？', rule: '不回答喝三口' },
  { type: 'truth', content: '如果預算無限，你想送現場哪位團員什麼禮物？', rule: '不回答喝三口' },
  { type: 'truth', content: '說出一個你對這趟旅行最大的擔憂？', rule: '不回答喝三口' },
  { type: 'truth', content: '你曾經在酒精作用下做過最瘋狂的事是什麼？', rule: '不回答喝三口' },
  { type: 'truth', content: '分享一個在座團員不知道的關於你的秘密？', rule: '不回答喝三口' },
  { type: 'truth', content: '誰是你心中 Hoya 團隊的門面擔當？', rule: '不回答喝三口' },
  { type: 'truth', content: '這趟旅行到目前為止，你最感謝誰？', rule: '不回答喝三口' },
  { type: 'truth', content: '你覺得誰最有可能在東京遇到豔遇？', rule: '不回答喝三口' },
  { type: 'truth', content: '說出三個你最喜歡自己的地方。', rule: '不回答喝三口' },
  { type: 'truth', content: '如果你能改變這趟旅程的一件事，那會是什麼？', rule: '不回答喝三口' },
  { type: 'truth', content: '你最不擅長應付在座哪種類型的人？', rule: '不回答喝三口' },
  { type: 'truth', content: '分享一個你最近最開心的瞬間。', rule: '不回答喝三口' },
  { type: 'truth', content: '說出在座誰最符合你心目中的理想型？', rule: '不回答喝三口' },
  { type: 'truth', content: '你曾經對在座的某位成員說過謊嗎？是什麼？', rule: '不回答喝三口' },
  { type: 'truth', content: '現場哪位成員的穿搭風格是你最不理解的？', rule: '不回答喝三口' },
  { type: 'truth', content: '分享一次你最慘痛的失戀經歷。', rule: '不回答喝三口' },
  { type: 'truth', content: '你覺得誰是這趟旅行中的「雷隊友」？為什麼？', rule: '不回答喝三口' },
  { type: 'truth', content: '如果你可以刪除一位團員的手機相簿，你會選誰？', rule: '不回答喝三口' },
  { type: 'truth', content: '在座誰的睡相或打呼聲最讓你印象深刻？', rule: '不回答喝三口' },
  { type: 'truth', content: '你有曾經因為不想跟團員出去而裝病過嗎？', rule: '不回答喝三口' },
  { type: 'truth', content: '如果你必須跟現場一位成員結婚，你會選誰？', rule: '不回答喝三口' },
  { type: 'truth', content: '說出一個你對自己的身材最自卑的地方。', rule: '不回答喝三口' },
  { type: 'truth', content: '你覺得現場誰最愛「裝可愛」？', rule: '不回答喝三口' },
  { type: 'truth', content: '如果你發現你的伴侶出軌，你會原諒嗎？', rule: '不回答喝三口' },
  { type: 'truth', content: '在座誰最容易讓你感到有壓力？', rule: '不回答喝三口' },
  { type: 'truth', content: '分享一個你最尷尬的約會故事。', rule: '不回答喝三口' },
  { type: 'truth', content: '你曾經在洗澡的時候偷偷哭過嗎？為了什麼？', rule: '不回答喝三口' },
  { type: 'truth', content: '如果你中了一億日圓樂透，你會分給現場的人嗎？', rule: '不回答喝三口' },
  { type: 'truth', content: '你覺得現場誰最「悶騷」？', rule: '不回答喝三口' },
  { type: 'truth', content: '分享一個你對 Pride 的看法。', rule: '大家乾杯' },
  { type: 'truth', content: '你有曾經嫉妒過現場某位成員的成就嗎？', rule: '不回答喝三口' },
  { type: 'truth', content: '你覺得這趟旅行誰最愛發牢騷？', rule: '不回答喝三口' },
  { type: 'truth', content: '說出一個你最想改掉的個性特質。', rule: '不回答喝三口' },
  { type: 'truth', content: '如果可以踢掉一個團員這趟不要來，你會選誰？', rule: '不回答喝五口' },
  { type: 'truth', content: '在座誰是你覺得最聰明的人？', rule: '不回答喝三口' },
  { type: 'truth', content: '分享你人生中最自豪的一個瞬間。', rule: '不回答喝三口' },
  { type: 'truth', content: '你曾經有過一夜情嗎？最後一次是什麼時候？', rule: '不回答喝五口' },
  { type: 'truth', content: '在座誰的長相是你最羨慕的？', rule: '不回答喝三口' },
  { type: 'truth', content: '你覺得自己在這趟旅行中扮演什麼角色？', rule: '不回答喝三口' },
  { type: 'truth', content: '如果可以跟在座一位交換人生一星期，你選誰？', rule: '不回答喝三口' },
  { type: 'truth', content: '說出一個你對現場某位成員的初印象與現狀落差。', rule: '不回答喝三口' },
  { type: 'truth', content: '你曾經在工作場合哭過嗎？為了什麼？', rule: '不回答喝三口' },
  { type: 'truth', content: '分享一個你至今仍感到後悔的決定。', rule: '不回答喝三口' },

  // 大挑戰 (Challenge) - 50 題
  { type: 'challenge', content: '模仿現場某位團員的口頭禪，直到被猜出來。', rule: '失敗喝三口' },
  { type: 'challenge', content: '用最高音大喊「我是東京最辣的小可愛！」', rule: '沒做喝三口' },
  { type: 'challenge', content: '在座選一位成員，對他進行 30 秒的深情告白。', rule: '沒做喝三口' },
  { type: 'challenge', content: '展示手機裡最後一張非風景的照片給所有人看。', rule: '拒絕喝三口' },
  { type: 'challenge', content: '選一位成員一起做 10 個深蹲。', rule: '失敗喝三口' },
  { type: 'challenge', content: '閉著眼摸出兩位成員是誰。', rule: '猜錯喝三口' },
  { type: 'challenge', content: '發出一則限動，內容是：我愛 Hoya，並維持 1 小時。', rule: '沒發喝三口' },
  { type: 'challenge', content: '用膝蓋寫出你的名字，讓大家猜。', rule: '猜不到喝三口' },
  { type: 'challenge', content: '讓左邊的人幫你畫一個醜妝，直到下一輪遊戲。', rule: '沒做喝三口' },
  { type: 'challenge', content: '唱一段你最喜歡的日文歌或動漫歌。', rule: '沒唱喝三口' },
  { type: 'challenge', content: '選一個人互相咬對方的一根手指 10 秒。', rule: '沒做喝三口' },
  { type: 'challenge', content: '現場展示一段你最拿手的才藝。', rule: '沒做喝三口' },
  { type: 'challenge', content: '模仿一種動物的聲音，直到右邊的人滿意為止。', rule: '沒做喝三口' },
  { type: 'challenge', content: '對著鏡頭擺出三個最性感的動作。', rule: '沒做喝三口' },
  { type: 'challenge', content: '讓大家檢查你的最近搜尋紀錄。', rule: '拒絕喝三口' },
  { type: 'challenge', content: '蒙眼品嚐一杯混合飲料並猜出成分。', rule: '猜錯喝三口' },
  { type: 'challenge', content: '壁咚你左邊的人，並對他說一句騷話。', rule: '沒做喝三口' },
  { type: 'challenge', content: '連續做 5 個開合跳並喊出「Hoya No.1」。', rule: '沒做喝三口' },
  { type: 'challenge', content: '選一位成員，讓他幫你喝掉剩下的半杯酒。', rule: '如果對方拒絕你喝一杯' },
  { type: 'challenge', content: '模仿在座某位成員喝醉後的樣子。', rule: '沒做喝三口' },
  { type: 'challenge', content: '現場表演一段 15 秒的鋼管舞（空抓空氣）。', rule: '沒做喝三口' },
  { type: 'challenge', content: '跟右邊的人換衣服穿，直到這輪遊戲結束。', rule: '拒絕喝五口' },
  { type: 'challenge', content: '用舌頭舔到自己的鼻子。', rule: '舔不到喝一口' },
  { type: 'challenge', content: '讓現場每個人在你臉上畫一筆。', rule: '拒絕喝五口' },
  { type: 'challenge', content: '用屁股寫出「TOKYO」這幾個字。', rule: '沒做喝三口' },
  { type: 'challenge', content: '深情注視你左邊的人 30 秒不准笑。', rule: '笑了喝三口' },
  { type: 'challenge', content: '展示手機裡最久遠的一張照片。', rule: '拒絕喝三口' },
  { type: 'challenge', content: '表演一段你覺得最性感的走路方式。', rule: '沒做喝三口' },
  { type: 'challenge', content: '讓在座的一位成員對你進行公主抱。', rule: '沒做喝三口' },
  { type: 'challenge', content: '現場隨機打給一位朋友說「我現在在東京鐵塔下想你」。', rule: '沒做喝五口' },
  { type: 'challenge', content: '用腳趾頭夾住一個東西維持 10 秒。', rule: '沒做喝三口' },
  { type: 'challenge', content: '讓大家在你的手機殼上簽名（或寫一句話）。', rule: '拒絕喝三口' },
  { type: 'challenge', content: '跟現場所有人擊掌並說一句讚美的話。', rule: '沒做喝三口' },
  { type: 'challenge', content: '模仿在座一位成員「生氣時」的樣子。', rule: '沒做喝三口' },
  { type: 'challenge', content: '對著窗外大喊「我好快樂！」（需確保不擾民）。', rule: '沒做喝三口' },
  { type: 'challenge', content: '現場做 15 個伏地挺身。', rule: '沒做喝三口' },
  { type: 'challenge', content: '讓左邊的人幫你梳一個奇怪的髮型。', rule: '拒絕喝三口' },
  { type: 'challenge', content: '表演一段 10 秒鐘的無聲小品。', rule: '沒做喝三口' },
  { type: 'challenge', content: '選一個人互相對視，先眨眼的人喝。', rule: '輸了喝三口' },
  { type: 'challenge', content: '用你的非慣用手寫下一句鼓勵團隊的話。', rule: '沒做喝三口' },
  { type: 'challenge', content: '現場大笑 10 秒鐘，不能停。', rule: '沒做喝三口' },
  { type: 'challenge', content: '選一個成員幫他按摩肩膀 1 分鐘。', rule: '沒做喝三口' },
  { type: 'challenge', content: '讓右邊的人幫你選一個醜表情自拍並存檔。', rule: '拒絕喝五口' },
  { type: 'challenge', content: '背誦一段你記得的詩或歌詞，需充滿感情。', rule: '沒做喝三口' },
  { type: 'challenge', content: '表演你喝醉後走路不穩的樣子。', rule: '沒做喝三口' },
  { type: 'challenge', content: '選一個人一起合唱一首歌。', rule: '沒做喝三口' },
  { type: 'challenge', content: '用你的肩膀碰你的耳朵，持續 10 秒。', rule: '沒做喝二口' },
  { type: 'challenge', content: '在座成員選一個部位讓你親（手、臉、肩膀）。', rule: '拒絕喝五口' },
  { type: 'challenge', content: '現場表演一段走秀。', rule: '沒做喝三口' },
  { type: 'challenge', content: '跟在場的一位成員進行一場「空氣摔跤」。', rule: '沒做喝三口' },

  // 我從來沒有 (Never) - 50 題
  { type: 'never', content: '我從來沒有在二丁目喝到斷片過。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在東京地鐵坐反過。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有跟在座的人吵過架。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有沒洗澡就睡覺。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有暗戀過在座的人。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在機場跑百米趕飛機。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有偷看過別人的手機。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在日本超商買超過 3000 日圓。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有試過一個人出國旅行。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在酒精作用下打給前任。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有忘記帶護照去機場過。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有同時跟兩個人約會過。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有試過在國外豔遇。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在藥妝店逛到店家打烊。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有試過裸泳。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在飯店房間裡開過 Party。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在飛機上遇到過帥哥/正妹。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在路邊撿到過錢。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有忘記過任何團員的生日。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有沒洗頭就出門逛街。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在電影院看電影睡著過。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有用過交友軟體。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在旅行中弄丟過行李。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有被警察攔下來過。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在洗澡時唱歌。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有吃過一整顆完整的榴槤。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在公開場合跌倒過。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有忘記帶手機出門。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在網路上跟人吵架過。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有去過夜店。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有自己剪過頭髮。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在捷運上睡過頭。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有買過超過一萬元的奢侈品。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在演講或表演時忘詞。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在冬天穿短袖出門。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有連續三天不洗澡。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在國外生病看醫生。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有參加過路跑活動。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在捷運上遇到名人。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有玩過高空彈跳或跳傘。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在面試時撒謊。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在圖書館裡睡著過。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有試過吃蟲類食物。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在超市買東西忘記付錢（非故意）。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有弄丟過家裡鑰匙。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有自己一個人去看過電影。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在喝酒後哭著打給爸媽。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在旅行中跟當地人交過朋友。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有在便利商店買過過期食物。', rule: '有過的人喝一口' },
  { type: 'never', content: '我從來沒有弄丟過這趟旅行的西瓜卡。', rule: '有過的人喝一口' },

  // 誰最容易 (Most) - 50 題
  { type: 'most', content: '誰最容易在居酒屋點餐時點到破產？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在新宿二丁目迷路到天亮？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在旅行中弄丟房卡？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在回國時行李超重？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在酒精作用下變成愛哭鬼？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在表參道被當成時尚路人拍？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在飛機上睡到流口水？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在神社求到「大凶」？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在築地市場吃到痛風？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在澀谷十字路口跟丟團員？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在藥妝店買到手軟？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在旅行中突然消失？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在酒精作用下開始大跳舞？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在河口湖對著富士山許願？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在 TeamLab 撞到玻璃？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在東京鐵塔下求婚？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在居酒屋喝醉後亂親人？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易成為這趟旅程的「氣氛組長」？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在飛機起飛前一秒才趕到機場？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在超市買完東西忘記拿走？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在成田機場買到錯過登機？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在旅行中第一天就把現金花光？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在民宿裡第一個睡著？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在溫泉區鬧笑話？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在旅行中手機掉進水裡？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在藥妝店為了退稅排隊到生氣？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在旅行中穿錯衣服（太冷或太熱）？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在新宿二丁目酒吧被搭訕？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在民宿裡負責煮宵夜給大家吃？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在旅行中買了一堆廢物回台灣？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在成田山公園裡迷路？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在搭乘江之電時看著窗外流淚？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在錢洗弁財天把所有的錢都拿去洗？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在居酒屋喝到一半去廁所睡著？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在旅行中跟團員發生小爭執？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在回國後兩天都還在調「度假時差」？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在旅行中拍出大家最醜的照片？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在機場報到時找不到護照？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在居酒屋點餐時點錯東西？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在旅行中一直問「現在要去哪裡？」', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在成田山表參道買一整箱鰻魚飯？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在飛機上跟鄰座旅客聊起來？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在旅行中一直滑手機不看路？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在拍照時永遠只擺同一個姿勢？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在超市買了一堆日本限定版可樂？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在民宿裡把廁所佔用最久？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在旅行中突然想吃台灣珍奶？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在回程飛機上哭著說不想回家？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在旅行中一直把相機拿在手上隨時準備拍？', rule: '被指最多的人喝兩口' },
  { type: 'most', content: '誰最容易在居酒屋結束後帶大家去唱 KTV？', rule: '被指最多的人喝兩口' },
];

const CARD_THEMES = {
  never: { bg: 'from-rose-400 to-pink-500', label: '我從來沒有...', icon: <Star size={20} /> },
  truth: { bg: 'from-purple-400 to-indigo-500', label: '真心話', icon: <Heart size={20} /> },
  most: { bg: 'from-cyan-400 to-blue-500', label: '誰最容易...', icon: <GlassWater size={20} /> },
  challenge: { bg: 'from-amber-400 to-orange-500', label: '大挑戰', icon: <Zap size={20} /> },
};

const Game: React.FC = () => {
  const [currentCard, setCurrentCard] = useState<typeof GAME_CARDS[0] | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [drunkLevel, setDrunkLevel] = useState(0);
  
  const [drawnIndices, setDrawnIndices] = useState<number[]>([]);
  const [allCardsDrawn, setAllCardsDrawn] = useState(false);

  const drawCard = () => {
    if (isShuffling || allCardsDrawn) return;

    setIsShuffling(true);
    setTimeout(() => {
      const availableIndices = GAME_CARDS.map((_, i) => i).filter(i => !drawnIndices.includes(i));
      
      if (availableIndices.length === 0) {
        setAllCardsDrawn(true);
        setIsShuffling(false);
        return;
      }

      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      setCurrentCard(GAME_CARDS[randomIndex]);
      setDrawnIndices(prev => [...prev, randomIndex]);
      setIsShuffling(false);
    }, 800);
  };

  const incrementDrunk = () => {
    if (drunkLevel < 100) setDrunkLevel(prev => prev + 10);
  };

  const resetGame = () => {
    setDrunkLevel(0);
    setCurrentCard(null);
    setDrawnIndices([]);
    setAllCardsDrawn(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="text-center">
        <h2 className="text-3xl font-black text-[#F06292] flex items-center justify-center gap-3 drop-shadow-sm">
          🥂 彩虹醉夢大冒險
        </h2>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] mt-2 italic">
          Hoya Team Big Adventure
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-pink-50">
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col">
             <span className="text-xs font-black text-pink-400 uppercase tracking-widest">團隊醉意值 Drunk-O-Meter</span>
             <span className="text-[8px] text-gray-400 font-bold italic">已完成挑戰：{drawnIndices.length} 項</span>
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
        <div className="flex justify-between mt-2 text-[8px] font-black text-gray-300 uppercase tracking-widest">
           <span>Angel</span>
           <span>Tipsy</span>
           <span>Slumped</span>
        </div>
      </div>

      <div className="relative h-[440px] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-pink-100/20 to-transparent rounded-[5rem] blur-3xl"></div>
        
        {isShuffling ? (
          <div className="w-[310px] h-[420px] rounded-[4.5rem] bg-white border-4 border-dashed border-pink-200 flex flex-col items-center justify-center gap-6 animate-pulse z-10 shadow-2xl">
            <div className="relative">
              <RotateCw className="text-pink-300 animate-spin" size={60} />
              <div className="absolute inset-0 flex items-center justify-center">
                 <Sparkles className="text-pink-200 animate-bounce" size={24} />
              </div>
            </div>
            <span className="text-pink-300 font-black tracking-widest text-xs uppercase">正在尋找驚喜任務...</span>
          </div>
        ) : allCardsDrawn ? (
          <div className="w-[310px] h-[420px] rounded-[4.5rem] bg-white border-4 border-dashed border-rose-200 flex flex-col items-center justify-center gap-6 z-10 shadow-2xl p-10 text-center">
            <AlertCircle size={64} className="text-rose-400" />
            <h3 className="text-2xl font-black text-gray-800">全數挑戰完畢！</h3>
            <p className="text-sm font-bold text-gray-400">Hoya 團隊太猛了，所有題庫都被抽光了！</p>
            <button onClick={resetGame} className="px-8 py-3 bg-rose-500 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">
              重新洗牌
            </button>
          </div>
        ) : currentCard ? (
          <div className={`w-[310px] h-[420px] rounded-[4.5rem] p-1.5 shadow-2xl z-10 animate-in zoom-in duration-300 bg-gradient-to-br ${CARD_THEMES[currentCard.type].bg}`}>
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
                   <span className="text-[8px] font-bold text-gray-300 uppercase">驚喜編號 #{drawnIndices.length}</span>
                 </div>
              </div>

              <div className="flex-1 flex flex-col justify-center gap-6 px-2">
                <p className="text-xl font-black text-gray-800 leading-tight tracking-tight italic">
                  「{currentCard.content}」
                </p>
                <div className="space-y-2">
                  <div className="h-1 w-10 bg-pink-100 mx-auto rounded-full"></div>
                  <div className="p-3 bg-pink-50/50 rounded-2xl border border-pink-100/50">
                    <p className="text-[11px] font-black text-pink-600 uppercase tracking-widest leading-none">
                      罰則：{currentCard.rule}
                    </p>
                  </div>
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
          <div className="w-[310px] h-[420px] rounded-[4.5rem] bg-white border-4 border-dashed border-gray-100 flex flex-col items-center justify-center gap-10 text-center p-12 shadow-inner">
            <div className="w-28 h-28 rounded-[2.5rem] bg-gray-50 flex items-center justify-center text-gray-200 border-2 border-gray-100">
               <Beer size={56} strokeWidth={1} />
            </div>
            <div className="space-y-3">
              <p className="text-lg font-black text-gray-400 italic leading-snug">
                準備好醉在東京了嗎？<br/>
                點擊下方按鈕開始！
              </p>
              <div className="flex justify-center gap-1">
                 {[...Array(5)].map((_, i) => <Heart key={i} size={10} className="text-gray-100" fill="currentColor" />)}
              </div>
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
          {isShuffling ? <RotateCw className="animate-spin" /> : <><Wand2 size={24} /> 抽出驚喜 <Sparkles size={20} /></>}
        </button>

        <div className="flex gap-3">
          <button 
            onClick={resetGame}
            className="flex-1 py-4 bg-white border-2 border-pink-100 text-pink-400 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 shadow-sm"
          >
            <RotateCw size={14} /> 全部重來
          </button>
          <button 
            className="flex-1 py-4 bg-pink-50 text-pink-600 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 shadow-sm"
          >
            <PartyPopper size={14} /> 驚喜不間斷 ✨
          </button>
        </div>
      </div>

      <div className="p-8 bg-white/50 backdrop-blur rounded-[3rem] border-2 border-dashed border-pink-100 text-center">
         <p className="text-[9px] font-black text-pink-300 uppercase tracking-[0.4em] mb-3 flex items-center justify-center gap-2">
           <Zap size={10} fill="currentColor" /> 酒後不開車，平安回民宿 <Zap size={10} fill="currentColor" />
         </p>
         <p className="text-[8px] font-bold text-gray-300 leading-relaxed">
           本遊戲純屬 Hoya 團隊互動娛樂，已實作「不重複抽題」機制。請評估自身酒量，開心出遊最重要！
         </p>
      </div>
    </div>
  );
};

export default Game;
