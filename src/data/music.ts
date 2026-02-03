import type { Instrument, MonthlyAnnouncement } from '@/lib/types';

export const instruments: Instrument[] = [
    {
        id: 'guitar',
        name: '吉他',
        nameEn: 'guitar',
        coverImage: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=1200',
        description: `
      <h2>吉他課程介紹</h2>
      <p>從古典到流行，從指彈到搖滾，吉他是最受歡迎的樂器之一。我們提供系統化的吉他教學，無論你是完全沒有基礎，還是想要精進技巧，都能找到適合的課程。</p>
      
      <h3>為什麼選擇學吉他？</h3>
      <ul>
        <li>適合各年齡層學習</li>
        <li>能演奏各種音樂風格</li>
        <li>培養音樂感和節奏感</li>
        <li>可獨奏也可伴奏</li>
      </ul>
    `,
        containsEquipment: false,
        rentalAvailable: true,
        rentalOffsetAllowed: true,
        levels: [
            {
                id: 'guitar-beginner',
                name: '初學者',
                packages: [
                    {
                        id: 'guitar-beginner-3',
                        name: '吉他入門體驗',
                        lessonCount: 3,
                        bonusLessons: 0,
                        validDuration: 3,
                        firstClassDate: new Date('2026-03-08T14:00:00+08:00'),
                        registrationStartDates: [
                            new Date('2026-03-08T14:00:00+08:00'),
                            new Date('2026-03-15T14:00:00+08:00'),
                        ],
                        formationRequired: false,
                        formationDecisionDays: 0,
                        refundPolicy: '開課前 7 天可全額退費，開課後不予退費。',
                        price: 3600,
                        status: 'published',
                        highlights: [
                            '三堂課快速入門',
                            '學會基本和弦',
                            '能彈唱簡單歌曲',
                        ],
                    },
                    {
                        id: 'guitar-beginner-6',
                        name: '吉他基礎套票',
                        lessonCount: 5,
                        bonusLessons: 1, // Buy 5 get 1 free
                        validDuration: 3,
                        firstClassDate: new Date('2026-03-08T14:00:00+08:00'),
                        registrationStartDates: [
                            new Date('2026-03-08T14:00:00+08:00'),
                            new Date('2026-03-15T14:00:00+08:00'),
                            new Date('2026-03-22T14:00:00+08:00'),
                        ],
                        formationRequired: false,
                        formationDecisionDays: 0,
                        refundPolicy: '開課前 7 天可全額退費，開課後已使用課程不予退費，未使用課程依比例退費。',
                        price: 6000, // Buy 5 get 1 = 6 lessons
                        status: 'published',
                        highlights: [
                            '買五送一超值優惠',
                            '三個月內使用完',
                            '可彈性安排上課時間',
                        ],
                    },
                ],
            },
            {
                id: 'guitar-intermediate',
                name: '進階',
                packages: [
                    {
                        id: 'guitar-intermediate-6',
                        name: '吉他進階技巧',
                        lessonCount: 5,
                        bonusLessons: 1,
                        validDuration: 3,
                        firstClassDate: new Date('2026-03-09T16:00:00+08:00'),
                        registrationStartDates: [
                            new Date('2026-03-09T16:00:00+08:00'),
                            new Date('2026-03-16T16:00:00+08:00'),
                        ],
                        formationRequired: false,
                        formationDecisionDays: 0,
                        refundPolicy: '開課前 7 天可全額退費，開課後已使用課程不予退費，未使用課程依比例退費。',
                        price: 7200,
                        status: 'published',
                        highlights: [
                            '進階技巧訓練',
                            '風格化演奏',
                            'Solo 技巧養成',
                        ],
                    },
                ],
            },
        ],
        faqs: [
            {
                question: '完全沒有音樂基礎可以學嗎？',
                answer: '當然可以！我們的初學者課程專為零基礎學員設計，會從最基本的持琴姿勢、指法開始教起。',
                category: '入門相關',
            },
            {
                question: '需要自己準備吉他嗎？',
                answer: '我們提供吉他租借服務（每月 500 元），租借費可折抵購琴。如果您想購買自己的吉他，老師也會提供選購建議。',
                category: '器材相關',
            },
            {
                question: '如果臨時有事無法上課怎麼辦？',
                answer: '請提前 24 小時通知，我們會協助您安排補課。未提前通知的缺課將視為已使用該堂課。',
                category: '請假相關',
            },
        ],
    },
    {
        id: 'drums',
        name: '爵士鼓',
        nameEn: 'drums',
        coverImage: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&q=80&w=1200',
        description: `
      <h2>爵士鼓課程介紹</h2>
      <p>爵士鼓是樂團的心臟，掌握節奏的靈魂。透過系統化的教學，你將學會各種節奏型態、過門技巧，以及如何在樂團中扮演好鼓手的角色。</p>
      
      <h3>課程特色：</h3>
      <ul>
        <li>專業隔音練習室</li>
        <li>提供完整爵士鼓組</li>
        <li>小班制教學</li>
        <li>從基礎到進階系統化課程</li>
      </ul>
    `,
        containsEquipment: true,
        equipmentDescription: '六堂課套票贈送專業鼓棒一組',
        rentalAvailable: false,
        rentalOffsetAllowed: false,
        levels: [
            {
                id: 'drums-beginner',
                name: '初學者',
                packages: [
                    {
                        id: 'drums-beginner-6',
                        name: '爵士鼓基礎套票',
                        lessonCount: 5,
                        bonusLessons: 1,
                        validDuration: 3,
                        firstClassDate: new Date('2026-03-10T19:00:00+08:00'),
                        registrationStartDates: [
                            new Date('2026-03-10T19:00:00+08:00'),
                            new Date('2026-03-17T19:00:00+08:00'),
                        ],
                        formationRequired: false,
                        formationDecisionDays: 0,
                        refundPolicy: '開課前 7 天可全額退費，開課後已使用課程不予退費，未使用課程依比例退費。',
                        price: 7200,
                        status: 'published',
                        includedEquipment: ['專業鼓棒一組', '練習節拍器'],
                        highlights: [
                            '買五送一',
                            '贈送鼓棒',
                            '專業練習室',
                        ],
                    },
                ],
            },
        ],
        faqs: [
            {
                question: '上課需要自備鼓棒嗎？',
                answer: '購買六堂課套票即贈送專業鼓棒一組！您也可以使用自己習慣的鼓棒。',
                category: '器材相關',
            },
            {
                question: '家裡沒有鼓可以練習怎麼辦？',
                answer: '我們建議購買練習板（約 1000-2000 元）在家練習基本功。教室也有提供額外租借時段，可預約練習。',
                category: '練習相關',
            },
        ],
    },
    {
        id: 'kalimba',
        name: '拇指琴',
        nameEn: 'kalimba',
        coverImage: 'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?auto=format&fit=crop&q=80&w=1200',
        description: `
      <h2>拇指琴課程介紹</h2>
      <p>拇指琴是一種來自非洲的樂器，聲音空靈療癒，容易入門。我們提供獨特的「做+彈」課程，讓你不只會彈，還能親手製作屬於自己的拇指琴！</p>
      
      <h3>課程特色：</h3>
      <ul>
        <li>三堂課學會製作拇指琴</li>
        <li>三堂課學會演奏技巧</li>
        <li>小班制教學（需滿 4 人開班）</li>
        <li>完成後擁有獨一無二的手作樂器</li>
      </ul>
    `,
        containsEquipment: true,
        equipmentDescription: '製作課程包含所有材料（木材、金屬片、調音工具等）',
        rentalAvailable: false,
        rentalOffsetAllowed: false,
        levels: [
            {
                id: 'kalimba-make',
                name: '製作課程',
                packages: [
                    {
                        id: 'kalimba-make-3',
                        name: '拇指琴製作工坊',
                        lessonCount: 3,
                        bonusLessons: 0,
                        validDuration: 3,
                        firstClassDate: new Date('2026-03-22T13:00:00+08:00'),
                        registrationStartDates: [
                            new Date('2026-03-22T13:00:00+08:00'),
                        ],
                        formationRequired: true, // 需要成班
                        formationDecisionDays: 3, // 開課前 3 天決定
                        refundPolicy: '如未達開班人數，將於開課前 3 天通知，並全額退費。開班後取消則不予退費。',
                        price: 4500,
                        status: 'published',
                        includedEquipment: [
                            '拇指琴本體材料包',
                            '調音工具',
                            '完成品外盒',
                        ],
                        highlights: [
                            '親手製作樂器',
                            '三堂課完成',
                            '所有材料包含',
                            '需滿 4 人開班',
                        ],
                    },
                ],
            },
            {
                id: 'kalimba-play',
                name: '演奏課程',
                packages: [
                    {
                        id: 'kalimba-play-3',
                        name: '拇指琴演奏入門',
                        lessonCount: 3,
                        bonusLessons: 0,
                        validDuration: 3,
                        firstClassDate: new Date('2026-04-05T13:00:00+08:00'),
                        registrationStartDates: [
                            new Date('2026-04-05T13:00:00+08:00'),
                        ],
                        formationRequired: true,
                        formationDecisionDays: 3,
                        refundPolicy: '如未達開班人數，將於開課前 3 天通知，並全額退費。開班後取消則不予退費。',
                        price: 2400,
                        status: 'published',
                        highlights: [
                            '學會基本演奏技巧',
                            '能彈奏 3-5 首歌曲',
                            '需滿 4 人開班',
                        ],
                    },
                ],
            },
        ],
        faqs: [
            {
                question: '沒有木工基礎可以參加製作課嗎？',
                answer: '可以！製作過程老師會一步步帶領，不需要任何木工經驗。我們會提供所有工具和材料。',
                category: '製作相關',
            },
            {
                question: '如果開課前未達人數會怎麼辦？',
                answer: '我們會在開課前 3 天確認是否成班。如未達開班人數（4 人），將主動聯繫您並全額退費，或協助您改報下一期。',
                category: '開班相關',
            },
            {
                question: '一定要先上製作課才能上演奏課嗎？',
                answer: '不一定！如果您已經有拇指琴，可以直接報名演奏課程。但我們建議先製作再學彈，會更有成就感。',
                category: '課程相關',
            },
        ],
    },
    {
        id: 'ukulele',
        name: '烏克麗麗',
        nameEn: 'ukulele',
        coverImage: 'https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&q=80&w=1200',
        description: `
      <h2>烏克麗麗課程介紹</h2>
      <p>烏克麗麗是最適合入門的彈唱樂器！輕巧好攜帶，和弦簡單易學，短時間就能自彈自唱。無論是輕快的夏威夷民謠或流行歌曲，都能輕鬆駕馭。</p>
      
      <h3>為什麼選擇烏克麗麗？</h3>
      <ul>
        <li>體積小、重量輕，方便攜帶</li>
        <li>弦較少，和弦簡單好按</li>
        <li>價格親民，入門門檻低</li>
        <li>音色清亮，適合彈唱</li>
      </ul>
    `,
        containsEquipment: false,
        rentalAvailable: true,
        rentalOffsetAllowed: false,
        levels: [
            {
                id: 'ukulele-beginner',
                name: '初學者',
                packages: [
                    {
                        id: 'ukulele-beginner-6',
                        name: '烏克麗麗入門套票',
                        lessonCount: 5,
                        bonusLessons: 1,
                        validDuration: 3,
                        firstClassDate: new Date('2026-03-12T18:30:00+08:00'),
                        registrationStartDates: [
                            new Date('2026-03-12T18:30:00+08:00'),
                            new Date('2026-03-19T18:30:00+08:00'),
                        ],
                        formationRequired: false,
                        formationDecisionDays: 0,
                        refundPolicy: '開課前 7 天可全額退費，開課後已使用課程不予退費，未使用課程依比例退費。',
                        price: 4200,
                        status: 'published',
                        highlights: [
                            '買五送一',
                            '六堂課學會彈唱',
                            '提供樂器租借',
                        ],
                    },
                ],
            },
        ],
        faqs: [
            {
                question: '烏克麗麗和吉他有什麼不同？',
                answer: '烏克麗麗只有 4 條弦（吉他有 6 條），體積較小，和弦較簡單。適合想要快速入門彈唱的朋友。',
                category: '基本認識',
            },
            {
                question: '可以租借烏克麗麗嗎？',
                answer: '可以！我們提供烏克麗麗租借（每月 300 元）。建議先租借 1-2 個月，確定有興趣後再購買自己的樂器。',
                category: '器材相關',
            },
        ],
    },
];

// Monthly announcements
export const monthlyAnnouncements: MonthlyAnnouncement[] = [
    {
        id: 'announcement-2026-03',
        month: '2026-03',
        instruments: ['guitar', 'drums', 'kalimba', 'ukulele'],
        schedule: [
            {
                date: new Date('2026-03-08T14:00:00+08:00'),
                time: '14:00-16:00',
                instructor: '王小明',
                type: '吉他初學班',
            },
            {
                date: new Date('2026-03-09T16:00:00+08:00'),
                time: '16:00-18:00',
                instructor: '李雅婷',
                type: '吉他進階班',
            },
            {
                date: new Date('2026-03-10T19:00:00+08:00'),
                time: '19:00-21:00',
                instructor: '張志豪',
                type: '爵士鼓初學班',
            },
            {
                date: new Date('2026-03-12T18:30:00+08:00'),
                time: '18:30-20:00',
                instructor: '陳美玲',
                type: '烏克麗麗入門',
            },
            {
                date: new Date('2026-03-15T14:00:00+08:00'),
                time: '14:00-16:00',
                instructor: '王小明',
                type: '吉他初學班',
            },
            {
                date: new Date('2026-03-22T13:00:00+08:00'),
                time: '13:00-16:00',
                instructor: '林建宏',
                type: '拇指琴製作工坊',
            },
        ],
        announcements: [
            '三月份新開班：吉他初學、爵士鼓、烏克麗麗',
            '拇指琴製作工坊開放報名（需滿 4 人開班）',
            '清明連假（4/4-4/5）暫停上課',
        ],
    },
];

// Common FAQ for all music lessons
export const musicCommonFAQs = [
    {
        question: '課程有效期限是多久？',
        answer: '所有套票課程均為三個月有效期限，自首堂課日期起算。請務必在期限內使用完畢，逾期將無法補課或退費。',
        category: '課程政策',
    },
    {
        question: '可以請假嗎？如何補課？',
        answer: '請於上課前 24 小時告知，我們會協助您安排補課。未提前通知的缺課將視為已使用該堂課。補課須在有效期限內完成。',
        category: '請假與補課',
    },
    {
        question: '什麼是「成班制」課程？',
        answer: '部分課程（如拇指琴）需要達到最低開班人數才會開課。我們會在開課前 3 天確認是否成班，如未達人數將全額退費或協助改報其他時段。',
        category: '課程政策',
    },
    {
        question: '可以延長有效期限嗎？',
        answer: '原則上不接受延長。如遇特殊情況（如長期住院、出國等），請聯繫我們討論個案處理。',
        category: '課程政策',
    },
    {
        question: '租借樂器的費用可以折抵購買嗎？',
        answer: '吉他租借費可折抵購琴費用（限三個月內）。其他樂器請參考各課程說明。',
        category: '器材租借',
    },
    {
        question: '如果不滿意課程可以退費嗎？',
        answer: '開課前 7 天可全額退費。開課後，已使用的課程不予退費，未使用的課程可依比例退費（需扣除 10% 行政手續費）。',
        category: '退費政策',
    },
];
