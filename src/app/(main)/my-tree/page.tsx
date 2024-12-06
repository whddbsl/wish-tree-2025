'use client';

import { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { auth, db } from "@/lib/firebase/config";
import Image from 'next/image';
import { IoCloseOutline } from "react-icons/io5";
import { useSwipeable } from 'react-swipeable';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';

interface Message {
  id: string;
  content: string;
  sender: string;
  createdAt: Timestamp;
  isRead: boolean;
  envelopeType: number;
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const targetDate = new Date('2025-01-01T00:00:00+09:00'); // 한국 시간 기준

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft(); // 초기 계산
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  // 숫자를 2자리로 포맷팅하는 함수
  const padNumber = (num: number) => {
    return num.toString().padStart(2, '0');
  };

  return (
    <div className="bg-white/50 backdrop-blur-sm p-3 rounded-lg border border-[#FFD1D1]">
      <h2 className="text-lg font-bold mb-2 text-center text-gray-800">2025년 새해까지</h2>
      <div className="flex justify-center space-x-2">
        <div className="text-center bg-white/70 p-2 rounded-lg min-w-[50px]">
          <div className="text-2xl font-bold text-[#FF4B4B]">{padNumber(timeLeft.days)}</div>
          <div className="text-xs text-gray-600">일</div>
        </div>
        <div className="text-center bg-white/70 p-2 rounded-lg min-w-[50px]">
          <div className="text-2xl font-bold text-[#FF4B4B]">{padNumber(timeLeft.hours)}</div>
          <div className="text-xs text-gray-600">시간</div>
        </div>
        <div className="text-center bg-white/70 p-2 rounded-lg min-w-[50px]">
          <div className="text-2xl font-bold text-[#FF4B4B]">{padNumber(timeLeft.minutes)}</div>
          <div className="text-xs text-gray-600">분</div>
        </div>
        <div className="text-center bg-white/70 p-2 rounded-lg min-w-[50px]">
          <div className="text-2xl font-bold text-[#FF4B4B]">{padNumber(timeLeft.seconds)}</div>
          <div className="text-xs text-gray-600">초</div>
        </div>
      </div>
    </div>
  );
}

export default function MyTreePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [userName, setUserName] = useState<string>(''); // 사용자 이름 상태 추가
  const router = useRouter();
  
  const messagesPerPage = 9;
  const totalPages = Math.ceil(messages.length / messagesPerPage);

  const currentMessages = messages.slice(
    currentPage * messagesPerPage,
    (currentPage + 1) * messagesPerPage
  );

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentPage < totalPages - 1) {
        setCurrentPage(prev => prev + 1);
      }
    },
    onSwipedRight: () => {
      if (currentPage > 0) {
        setCurrentPage(prev => prev - 1);
      }
    },
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('현재 사용자:', user); // 디버깅용 로그
        setUserName(user.displayName || '');
      } else {
        console.log('로그인된 사용자 없음');
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const messagesQuery = query(
      collection(db, 'messages'),
      where('treeOwnerId', '==', user.uid),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      
      setMessages(newMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // URL 공유 기능
  const handleShare = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.error('사용자가 로그인되어 있지 않습니다.');
      return;
    }

    const shareUrl = `${window.location.origin}/tree/${encodeURIComponent(user.uid)}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('URL이 클립보드에 복사되었습니다!');
    } catch (err) {
      console.error('URL 복사 실패:', err);
      prompt('아래 URL을 복사하세요:', shareUrl);
    }
  };

  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen h-screen bg-[#FFF5E1] p-4 flex flex-col">
      <div className="flex-1 max-h-screen flex flex-col gap-4 overflow-hidden">
        {/* 카운트다운 타이머 - 높이 고정 */}
        <div className="flex-none">
          <CountdownTimer />
        </div>

        {/* 메시지 그리드 섹션 - 남은 공간 자동 조절 */}
        <div className="flex-1 min-h-0">
          <div className="h-full bg-white/50 backdrop-blur-sm p-4 rounded-lg border border-[#FFD1D1] overflow-hidden">
            <h2 className="text-xl font-bold mb-2 text-gray-800">받은 메시지</h2>
            <div 
              {...handlers} 
              className="h-[calc(100%-3rem)] grid grid-cols-3 gap-2 overflow-hidden"
            >
              {currentMessages.length > 0 ? (
                currentMessages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => handleMessageClick(message.id)}
                    className="relative aspect-square cursor-pointer transform transition-transform hover:scale-105"
                  >
                    <Image
                      src={`/images/envelopes/envelope${message.envelopeType}.png`}
                      alt="편지 봉투"
                      fill
                      className="object-contain"
                    />
                    {!message.isRead && (
                      <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full" />
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-3 flex items-center justify-center h-full text-gray-600">
                  아직 받은 메시지가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 공유 버튼 섹션 - 높이 고정 */}
        <div className="flex-none">
          <div className="bg-white/50 backdrop-blur-sm p-4 rounded-lg border border-[#FFD1D1]">
            <button
              onClick={handleShare}
              className="w-full bg-[#FF4B4B] hover:bg-[#FF6B6B] text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              공유 URL 복사하기
            </button>
          </div>
        </div>
      </div>

      {/* 모달은 그대로 유지 */}
      {selectedMessageId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div
            className="relative w-full max-w-md bg-[#FFF8E7] text-gray-800 p-8 rounded-lg"
            style={{
              backgroundImage: "url(/images/letter-noBackground.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* 닫기 버튼 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMessageId(null);
              }}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
            >
              <IoCloseOutline size={24} />
            </button>

            {/* 메시지 내용 */}
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-1">
                  {messages.find((m) => m.id === selectedMessageId)?.sender}
                  님의 메시지
                </h3>
                <p className="text-sm text-gray-600">
                  {formatDate(
                    messages.find((m) => m.id === selectedMessageId)
                      ?.createdAt
                  )}
                </p>
              </div>

              <div className="mt-6">
                <p className="whitespace-pre-wrap leading-relaxed">
                  {messages.find((m) => m.id === selectedMessageId)?.content}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 