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

  return (
    <div className="bg-white/50 backdrop-blur-sm p-4 rounded-lg mb-6 border border-[#FFD1D1]">
      <h2 className="text-xl font-bold mb-4 text-center text-gray-800">2025년 새해까지</h2>
      <div className="flex justify-center space-x-4">
        <div className="text-center bg-white/70 p-3 rounded-lg min-w-[60px]">
          <div className="text-3xl font-bold text-[#FF4B4B]">{timeLeft.days}</div>
          <div className="text-sm text-gray-600">일</div>
        </div>
        <div className="text-center bg-white/70 p-3 rounded-lg min-w-[60px]">
          <div className="text-3xl font-bold text-[#FF4B4B]">{timeLeft.hours}</div>
          <div className="text-sm text-gray-600">시간</div>
        </div>
        <div className="text-center bg-white/70 p-3 rounded-lg min-w-[60px]">
          <div className="text-3xl font-bold text-[#FF4B4B]">{timeLeft.minutes}</div>
          <div className="text-sm text-gray-600">분</div>
        </div>
        <div className="text-center bg-white/70 p-3 rounded-lg min-w-[60px]">
          <div className="text-3xl font-bold text-[#FF4B4B]">{timeLeft.seconds}</div>
          <div className="text-sm text-gray-600">초</div>
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
      if (!user) {
        console.error('User is not logged in');
        router.push('/login'); // 로그인 페이지로 리다이렉트
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
      orderBy('createdAt', 'desc')
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
    <div className="min-h-screen bg-[#FFF5E1] text-gray-800 p-4">
      <div className="max-w-md mx-auto">
        {/* 카운트다운 타이머 추가 */}
        <CountdownTimer />

        {/* 메시지 현황 */}
        <div
          className="bg-white/50 backdrop-blur-sm p-4 rounded-lg mb-6 h-[58vh] border border-[#FFD1D1]"
          style={{
            backgroundImage: "url(/images/background.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/70 backdrop-blur-sm p-2 rounded-lg inline-block">
              <h2 className="text-xl font-bold text-[#FF4B4B]">받은 메시지</h2>
            </div>
            <div className="text-2xl font-bold text-[#FF4B4B]">
              {messages.length}개
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF4B4B] mx-auto"></div>
            </div>
          ) : messages.length > 0 ? (
            <>
              {/* 불꽃놀이 효과 */}
              <div className="fireworks-container absolute inset-0 pointer-events-none">
                <div
                  className="firework"
                  style={{ '--delay': '0s' } as React.CSSProperties}
                ></div>
                <div
                  className="firework"
                  style={{ '--delay': '0.5s' } as React.CSSProperties}
                ></div>
                <div
                  className="firework"
                  style={{ '--delay': '1s' } as React.CSSProperties}
                ></div>
              </div>

              {/* 기존 메시지 컨테이너 */}
              <div className="h-[50vh] relative">
                {messages.length > 0 ? (
                  <div {...handlers} className="relative h-full">
                    <div className="grid grid-cols-3 gap-x-3 gap-y-4 h-full place-items-center relative z-10">
                      {currentMessages.map((message, index) => (
                        <div 
                          key={message.id}
                          className={`
                            relative cursor-pointer 
                            flex flex-col items-center gap-1
                            transform hover:scale-105 transition-all
                            ${index % 2 === 0 ? 'animate-bounce-slow' : 'animate-bounce-slower'}
                          `}
                          onClick={() => setSelectedMessageId(message.id)}
                        >
                          <div className="relative">
                            <Image
                              src={`/images/envelopes/envelope${message.envelopeType || 1}.png`}
                              alt={`메시지 from ${message.sender}`}
                              width={65}
                              height={65}
                              className="rounded-2xl shadow-[0_0_15px_rgba(255,75,75,0.3)]"
                            />
                            <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#FF4B4B] rounded-full flex items-center justify-center text-white text-xs">
                              {currentPage * messagesPerPage + index + 1}
                            </div>
                          </div>
                          <span className="text-xs text-gray-700 font-medium text-center">
                            {message.sender}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* 페이지 인디케이터 - 메시지가 9개 이상일 때만 표시 */}
                    {totalPages > 1 && (
                      <div className="absolute -bottom-2 left-0 right-0 flex justify-center gap-2">
                        {Array.from({ length: totalPages }).map((_, index) => (
                          <div
                            key={index}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${
                              currentPage === index ? 'bg-[#FF4B4B]' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-600 relative z-10">
                    아직 받은 메시지가 없습니다.
                  </div>
                )}
              </div>

              {/* 불꽃놀이 애니메이션을 위한 스타일 */}
              <style jsx global>{`
                .fireworks-container {
                  overflow: hidden;
                }

                .firework {
                  position: absolute;
                  width: 4px;
                  height: 4px;
                  border-radius: 50%;
                  animation: firework-animation 2s infinite;
                  animation-delay: var(--delay);
                }

                .firework::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  border-radius: 50%;
                  transform-origin: center;
                  animation: firework-particles 2s infinite;
                  animation-delay: var(--delay);
                }

                @keyframes firework-animation {
                  0% {
                    transform: translate(50vw, 50vh);
                    background: #FF4B4B;
                  }
                  50% {
                    transform: translate(50vw, 20vh);
                    background: #FF4B4B;
                  }
                  100% {
                    transform: translate(50vw, 50vh);
                    background: transparent;
                  }
                }

                @keyframes firework-particles {
                  0% {
                    box-shadow:
                      0 0 0 0 #FFD1D1,
                      0 0 0 0 #FF8B8B,
                      0 0 0 0 #FF4B4B;
                  }
                  50% {
                    box-shadow:
                      100px -100px 0 0 #FFD1D1,
                      -100px -100px 0 0 #FF8B8B,
                      0 -100px 0 0 #FF4B4B,
                      100px 100px 0 0 #FFD1D1,
                      -100px 100px 0 0 #FF8B8B,
                      0 100px 0 0 #FF4B4B;
                  }
                  100% {
                    box-shadow:
                      200px -200px 0 -5px transparent,
                      -200px -200px 0 -5px transparent,
                      0 -200px 0 -5px transparent,
                      200px 200px 0 -5px transparent,
                      -200px 200px 0 -5px transparent,
                      0 200px 0 -5px transparent;
                  }
                }
              `}</style>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-600">
              아직 받은 메시지가 없습니다.
            </div>
          )}
        </div>

        {/* 메시지 상세 내용 모달 */}
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

        {/* URL 공유 버튼 */}
        <div className="bg-white/50 backdrop-blur-sm p-4 rounded-lg border border-[#FFD1D1]">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            내 트리 공유하기
          </h2>
          <button
            onClick={handleShare}
            className="w-full bg-[#FF4B4B] hover:bg-[#FF6B6B] text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            공유 URL 복사하기
          </button>
        </div>
      </div>
    </div>
  );
} 