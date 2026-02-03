import type { Workshop } from '@/lib/types';

export const workshops: Workshop[] = [
  {
    id: 'ritmo-latino-2026-01-31',
    title: '拉丁音樂節｜Ritmo Latino!',
    subtitle: '探索拉丁音樂的熱情與節奏',
    coverImage: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=1200',
    galleryImages: [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1514525253361-b83f85f5e7c0?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1525431353712-42da0970de8d?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&q=80&w=800',
    ],
    description: `
      <h2>工作坊簡介</h2>
      <p>在這場充滿活力的工作坊中，您將深入了解拉丁音樂的豐富歷史和多樣風格。從古巴的 Son 到巴西的 Bossa Nova，我們將一起探索這些迷人的音樂形式。</p>
      
      <h3>您將學習到：</h3>
      <ul>
        <li>拉丁音樂的基本節奏型態（Clave, Montuno, Tumbao）</li>
        <li>不同拉丁音樂風格的特色（Salsa, Bossa Nova, Reggaeton）</li>
        <li>拉丁打擊樂器的基礎演奏技巧</li>
        <li>如何在自己的音樂創作中融入拉丁元素</li>
      </ul>
      
      <h3>適合對象：</h3>
      <p>無論您是音樂初學者或是有經驗的音樂人，只要對拉丁音樂充滿好奇，都歡迎參加！</p>
    `,
    instructor: {
      name: 'Carlos Rodriguez',
      bio: 'Carlos 是一位來自古巴的專業音樂人，擁有超過 15 年的拉丁音樂演出和教學經驗。他曾在世界各地的音樂節演出，並致力於推廣拉丁音樂文化。',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
    },
    schedule: {
      date: new Date('2026-01-31T14:00:00+08:00'),
      location: '城市實驗室 台北市大安區忠孝東路四段 123 號 3F',
      duration: '3 小時',
    },
    capacity: {
      total: 25,
      remaining: 12,
    },
    price: 1800,
    registrationDeadline: new Date('2026-01-29T23:59:59+08:00'),
    tags: ['拉丁音樂', '節奏訓練', '打擊樂', '文化探索'],
    status: 'published',
    policies: {
      attendanceRules: `
        <h3>上課須知</h3>
        <ul>
          <li>請於活動開始前 10 分鐘抵達，以便完成報到</li>
          <li>建議穿著輕便服裝，方便活動</li>
          <li>無需攜帶任何樂器，現場將提供所有器材</li>
          <li>歡迎攜帶筆記本記錄學習重點</li>
        </ul>
      `,
      refundPolicy: `
        <h3>取消與退費規則</h3>
        <ul>
          <li>活動前 7 天（含）取消：全額退費</li>
          <li>活動前 3-6 天取消：退費 50%</li>
          <li>活動前 2 天內取消：恕不退費</li>
          <li>如遇不可抗力因素（颱風、地震等），將全額退費或提供改期選擇</li>
        </ul>
        <p><strong>退費方式：</strong>將於申請後 7-10 個工作天退回原付款方式</p>
      `,
    },
    seo: {
      title: '拉丁音樂節工作坊 | Ritmo Latino | 城市實驗室',
      description: '探索拉丁音樂的熱情與節奏！由古巴專業音樂人 Carlos Rodriguez 帶領，學習 Salsa、Bossa Nova 等拉丁音樂風格，體驗打擊樂基礎演奏。',
    },
  },
  {
    id: 'electronic-music-production-2026-02-15',
    title: '電子音樂製作入門',
    subtitle: '從零開始創作你的第一首電子樂',
    coverImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=1200',
    galleryImages: [
      'https://images.unsplash.com/photo-1514328537411-7296cb33d631?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=800',
    ],
    description: `
      <h2>工作坊簡介</h2>
      <p>想要開始製作電子音樂，但不知道從何著手嗎？這個工作坊將帶你快速入門，了解電子音樂製作的核心概念和技術。</p>
      
      <h3>課程內容：</h3>
      <ul>
        <li>DAW（數位音訊工作站）介面介紹與基本操作</li>
        <li>鼓組節奏編排基礎</li>
        <li>合成器音色設計入門</li>
        <li>基本混音技巧</li>
        <li>完成一首簡單的電子樂曲</li>
      </ul>
      
      <h3>你需要準備：</h3>
      <p>自備筆記型電腦（建議預先安裝 Ableton Live Trial 或其他 DAW 試用版）</p>
    `,
    instructor: {
      name: '林子軒 (DJ Zixuan)',
      bio: '子軒是台灣知名的電子音樂製作人和 DJ，作品曾在多個音樂平台獲得推薦。他擅長 House、Techno 等風格，並熱衷於音樂教育，希望讓更多人能輕鬆進入電子音樂的世界。',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400',
    },
    schedule: {
      date: new Date('2026-02-15T13:00:00+08:00'),
      location: '城市實驗室 台北市大安區忠孝東路四段 123 號 3F',
      duration: '4 小時',
    },
    capacity: {
      total: 20,
      remaining: 8,
    },
    price: 2200,
    registrationDeadline: new Date('2026-02-13T23:59:59+08:00'),
    tags: ['電子音樂', '音樂製作', 'DAW', '合成器'],
    status: 'published',
    policies: {
      attendanceRules: `
        <h3>上課須知</h3>
        <ul>
          <li>請務必攜帶筆記型電腦（Mac 或 Windows 皆可）</li>
          <li>建議預先下載 Ableton Live Trial（30 天試用版）</li>
          <li>請攜帶耳機（有線耳機佳）</li>
          <li>現場提供電源插座和 WiFi</li>
          <li>建議攜帶筆記本記錄重點</li>
        </ul>
      `,
      refundPolicy: `
        <h3>取消與退費規則</h3>
        <ul>
          <li>活動前 7 天（含）取消：全額退費</li>
          <li>活動前 3-6 天取消：退費 50%</li>
          <li>活動前 2 天內取消：恕不退費</li>
          <li>如遇不可抗力因素，將全額退費或提供改期選擇</li>
        </ul>
        <p><strong>退費方式：</strong>將於申請後 7-10 個工作天退回原付款方式</p>
      `,
    },
    seo: {
      title: '電子音樂製作入門工作坊 | 城市實驗室',
      description: '從零開始學習電子音樂製作！了解 DAW 操作、鼓組編排、合成器設計等核心技術，由專業製作人 DJ Zixuan 親自指導。',
    },
  },
  {
    id: 'songwriting-workshop-2026-02-28',
    title: '歌曲創作工作坊',
    subtitle: '用音樂說出你的故事',
    coverImage: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=1200',
    galleryImages: [
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800',
    ],
    description: `
      <h2>工作坊簡介</h2>
      <p>每個人心中都有一首歌想要唱出來。這個工作坊將教你如何將靈感轉化為完整的歌曲，從旋律創作到歌詞撰寫，一步步完成你的音樂創作。</p>
      
      <h3>課程重點：</h3>
      <ul>
        <li>歌曲結構分析（Verse、Chorus、Bridge）</li>
        <li>旋律創作技巧與和弦進行</li>
        <li>歌詞撰寫方法與意境營造</li>
        <li>如何從生活中尋找創作靈感</li>
        <li>現場創作實作與分享</li>
      </ul>
    `,
    instructor: {
      name: '陳雅筑',
      bio: '雅筑是獨立音樂創作歌手，作品風格融合民謠與流行元素。她的歌曲多次入圍各大音樂獎項，並擁有豐富的歌曲創作教學經驗，善於引導學員發掘自己的音樂風格。',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    },
    schedule: {
      date: new Date('2026-02-28T14:00:00+08:00'),
      location: '城市實驗室 台北市大安區忠孝東路四段 123 號 3F',
      duration: '3.5 小時',
    },
    capacity: {
      total: 18,
      remaining: 15,
    },
    price: 1600,
    registrationDeadline: new Date('2026-02-26T23:59:59+08:00'),
    tags: ['歌曲創作', '詞曲創作', '音樂創作', '靈感激發'],
    status: 'published',
    policies: {
      attendanceRules: `
        <h3>上課須知</h3>
        <ul>
          <li>無需音樂基礎，歡迎所有對創作有興趣的朋友</li>
          <li>建議攜帶筆記本和筆</li>
          <li>如有樂器（吉他、烏克麗麗等）可攜帶，但非必要</li>
          <li>準備好開放的心態，享受創作的過程</li>
        </ul>
      `,
      refundPolicy: `
        <h3>取消與退費規則</h3>
        <ul>
          <li>活動前 7 天（含）取消：全額退費</li>
          <li>活動前 3-6 天取消：退費 50%</li>
          <li>活動前 2 天內取消：恕不退費</li>
          <li>如遇不可抗力因素，將全額退費或提供改期選擇</li>
        </ul>
        <p><strong>退費方式：</strong>將於申請後 7-10 個工作天退回原付款方式</p>
      `,
    },
    seo: {
      title: '歌曲創作工作坊 | 用音樂說故事 | 城市實驗室',
      description: '學習歌曲創作的核心技巧！從旋律、和弦到歌詞撰寫，由獨立音樂人陳雅筑帶領，發掘你的音樂創作潛能。',
    },
  },
];

// FAQ data for workshops
export const workshopFAQs = [
  {
    question: '我沒有任何音樂基礎，可以參加嗎？',
    answer: '當然可以！大部分工作坊都歡迎零基礎學員。每個工作坊的介紹頁面都會註明適合對象，請仔細閱讀。如果還有疑問，歡迎聯繫我們詢問。',
    category: '報名相關',
  },
  {
    question: '如何報名工作坊？',
    answer: '點選您有興趣的工作坊頁面，填寫報名表單並完成線上刷卡付款即可。付款成功後，您會立即收到確認信件。',
    category: '報名相關',
  },
  {
    question: '可以現場報名嗎？',
    answer: '為了確保活動品質和名額管理，我們建議提前線上報名。如果活動當天還有名額，可接受現場報名，但建議先來電確認。',
    category: '報名相關',
  },
  {
    question: '如果臨時有事無法參加怎麼辦？',
    answer: '請參考各工作坊的退費政策。通常活動前 7 天取消可全額退費，3-6 天取消退 50%，2 天內取消則無法退費。',
    category: '取消與退費',
  },
  {
    question: '可以轉讓名額給朋友嗎？',
    answer: '可以！請在活動前 3 天聯繫我們，提供新學員的姓名、電話和 Email，我們會協助您完成轉讓手續。',
    category: '取消與退費',
  },
  {
    question: '工作坊會提供證書嗎？',
    answer: '部分進階或系列工作坊會提供參與證明。單次工作坊主要著重在學習體驗，若您需要證書，請在報名時註明，我們會評估是否能提供。',
    category: '其他',
  },
  {
    question: '可以拍照或錄影嗎？',
    answer: '個人學習記錄的拍照通常是允許的，但為了尊重講師和其他學員，請勿錄影或直播。如有特殊需求，請事先徵詢工作人員同意。',
    category: '其他',
  },
];
