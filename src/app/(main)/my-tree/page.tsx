"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import Image from "next/image";
import { IoCloseOutline } from "react-icons/io5";
import { useSwipeable } from "react-swipeable";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

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
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date("2025-01-01T00:00:00+09:00"); // 한국 시간 기준

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft(); // 초기 계산
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  // 숫자를 2자리로 포맷팅하는 함수
  const padNumber = (num: number) => {
    return num.toString().padStart(2, "0");
  };

  return (
    <div className="bg-white/50 backdrop-blur-sm p-4 rounded-lg mb-4 border border-[#FFD1D1]">
      <h2 className="text-xl font-bold mb-4 text-center text-gray-800">
        Happy New Year 2025
      </h2>
      <div className="flex justify-center space-x-4">
        <div className="text-center rounded-lg min-w-[60px]">
          <div className="text-3xl font-bold text-[#FF4B4B]">
            {padNumber(timeLeft.days)}
          </div>
          <div className="text-sm text-gray-600">일</div>
        </div>
        <div className="text-center rounded-lg min-w-[60px]">
          <div className="text-3xl font-bold text-[#FF4B4B]">
            {padNumber(timeLeft.hours)}
          </div>
          <div className="text-sm text-gray-600">시간</div>
        </div>
        <div className="text-center rounded-lg min-w-[60px]">
          <div className="text-3xl font-bold text-[#FF4B4B]">
            {padNumber(timeLeft.minutes)}
          </div>
          <div className="text-sm text-gray-600">분</div>
        </div>
        <div className="text-center rounded-lg min-w-[60px]">
          <div className="text-3xl font-bold text-[#FF4B4B]">
            {padNumber(timeLeft.seconds)}
          </div>
          <div className="text-sm text-gray-600">초</div>
        </div>
      </div>
    </div>
  );
}

export default function MyTreePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [userName, setUserName] = useState<string>(""); // 사용자 이름 상태 추가
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
        setCurrentPage((prev) => prev + 1);
      }
    },
    onSwipedRight: () => {
      if (currentPage > 0) {
        setCurrentPage((prev) => prev - 1);
      }
    },
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("현재 사용자:", user); // 디버깅용 로그
        setUserName(user.displayName || "");
      } else {
        console.log("로그인된 사용자 없음");
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const messagesQuery = query(
      collection(db, "messages"),
      where("treeOwnerId", "==", user.uid),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
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
      console.error("사용자가 로그인되어 있지 않습니다.");
      return;
    }

    const shareUrl = `${window.location.origin}/tree/${encodeURIComponent(
      user.uid
    )}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("URL이 클립보드에 복사되었습니다!");
    } catch (err) {
      console.error("URL 복사 실패:", err);
      prompt("아래 URL을 복사하세요:", shareUrl);
    }
  };

  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const canOpenMessages = () => {
    const now = new Date();
    const targetDate = new Date("2025-01-01T00:00:00+09:00"); // 한국 시간 기준
    return now >= targetDate;
  };

  const handleMessageClick = (messageId: string) => {
    if (!canOpenMessages()) {
      alert("2025년 1월 1일부터 메시지를 확인할 수 있어요!");
      return;
    }
    setSelectedMessageId(messageId);
  };

  return (
    <div className="min-h-screen bg-[#FFF5E1] p-4">
      <div className="max-w-md mx-auto space-y-6">
        <CountdownTimer />
        
        {/* 메시지 목록 */}
        <div className="bg-white/50 backdrop-blur-sm p-4 rounded-lg border border-[#FFD1D1]">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            받은 메시지 ({messages.length})
          </h2>
          
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF4B4B]"></div>
            </div>
          ) : messages.length > 0 ? (
            <>
              <div className="grid grid-cols-3 gap-4" {...handlers}>
                {currentMessages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => handleMessageClick(message.id)}
                    className={`relative cursor-pointer transition-transform hover:scale-105 ${
                      !canOpenMessages() ? 'opacity-70' : ''
                    }`}
                  >
                    <Image
                      src={`/images/envelopes/envelope${message.envelopeType}.png`}
                      alt="봉투"
                      width={120}
                      height={120}
                      className="w-full h-auto"
                    />
                    {!message.isRead && (
                      <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-4 gap-2">
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index)}
                      className={`w-2 h-2 rounded-full ${
                        currentPage === index ? "bg-[#FF4B4B]" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-600">
              아직 받은 메시지가 없습니다.
            </div>
          )}
        </div>

        {/* 메시지 상세 내용 모달 */}
        {selectedMessageId && canOpenMessages() && (
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
