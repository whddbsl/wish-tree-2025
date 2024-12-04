"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { addDoc, collection, getDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import Image from 'next/image';

interface Message {
  content: string;
  sender: string;
  createdAt: Date;
  envelopeType: number;
}

const ENVELOPE_TYPES = [
  { id: 1, src: '/images/envelopes/envelope1.png', alt: '새해 봉투 1' },
  { id: 2, src: '/images/envelopes/envelope2.png', alt: '새해 봉투 2' },
  { id: 3, src: '/images/envelopes/envelope3.png', alt: '새해 봉투 3' },
  { id: 4, src: '/images/envelopes/envelope4.png', alt: '새해 봉투 4' },
  { id: 5, src: '/images/envelopes/envelope5.png', alt: '새해 봉투 5' },
  { id: 6, src: '/images/envelopes/envelope6.png', alt: '새해 봉투 6' },
];

function LoadingTree() {
  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white p-4">
      <div className="max-w-md mx-auto text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
        <p>로딩중...</p>
      </div>
    </div>
  );
}

export default function TreePage() {
  const params = useParams();
  const [ownerName, setOwnerName] = useState<string>('');
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedEnvelope, setSelectedEnvelope] = useState(1);

  useEffect(() => {
    const fetchTreeOwner = async () => {
      if (!params.id) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', params.id as string));
        if (userDoc.exists()) {
          setOwnerName(userDoc.data().displayName || '알 수 없는 사용자');
        }
      } catch (error) {
        console.error('Error fetching tree owner:', error);
      }
    };

    fetchTreeOwner();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!isAnonymous && !sender.trim()) {
      alert('보내는 사람을 입력해주세요.');
      return;
    }
    if (!message.trim()) {
      alert('메시지를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const decodedTreeOwnerId = decodeURIComponent(params.id).replace('%3A', ':');

      const messageData = {
        sender: isAnonymous ? '익명' : sender.trim(),
        content: message.trim(),
        treeOwnerId: decodedTreeOwnerId,
        createdAt: serverTimestamp(),
        isRead: false,
        isAnonymous: isAnonymous,
        envelopeType: selectedEnvelope
      };

      await addDoc(collection(db, 'messages'), messageData);

      setSubmitSuccess(true);
      setMessage('');
      setSender('');
      setIsAnonymous(false);
      
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('메시지 전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!params?.id) {
    return <LoadingTree />;
  }

  return (
    <div className="min-h-screen bg-[#FFF5E1] text-gray-800 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white/50 backdrop-blur-sm p-4 rounded-lg mb-6">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
            {ownerName ? `${ownerName}님의 새해 메시지 트리` : '새해 메시지 트리'}
          </h1>
          <p className="text-center text-gray-600 mb-6">
            따뜻한 새해 메시지를 남겨보세요
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white/50 backdrop-blur-sm p-4 rounded-lg">
              <h3 className="text-lg font-bold mb-3 text-gray-800">봉투 선택</h3>
              <div className="grid grid-cols-3 gap-3">
                {ENVELOPE_TYPES.map((envelope) => (
                  <div
                    key={envelope.id}
                    className={`relative cursor-pointer transition-transform hover:scale-105 ${
                      selectedEnvelope === envelope.id
                        ? 'ring-2 ring-[#FF4B4B] ring-offset-2 rounded-lg'
                        : ''
                    }`}
                    onClick={() => setSelectedEnvelope(envelope.id)}
                  >
                    <Image
                      src={envelope.src}
                      alt={envelope.alt}
                      width={100}
                      height={100}
                      className="rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-sm p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => {
                      setIsAnonymous(e.target.checked);
                      if (e.target.checked) {
                        setSender('');
                      }
                    }}
                    className="w-4 h-4 text-[#FF4B4B] rounded border-gray-300 focus:ring-[#FF4B4B]"
                  />
                  <label htmlFor="anonymous" className="text-sm text-gray-600">
                    익명으로 보내기
                  </label>
                </div>
                
                {!isAnonymous && (
                  <input
                    type="text"
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    placeholder="보내는 사람"
                    className="w-full p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FF4B4B] bg-white/70"
                    maxLength={20}
                  />
                )}
              </div>

              <div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="메시지를 입력하세요"
                  className="w-full h-32 p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FF4B4B] resize-none bg-white/70"
                  maxLength={1000}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#FF4B4B] hover:bg-[#FF6B6B] text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "메시지 보내는 중..." : "메시지 보내기"}
              </button>
            </div>
          </form>
        </div>

        {submitSuccess && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                메시지를 보냈어요!
              </h3>
              <p className="text-gray-600 mb-6">
                따뜻한 새해 메시지가 전달되었습니다.
              </p>
              <button
                onClick={() => setSubmitSuccess(false)}
                className="w-full bg-[#FF4B4B] text-white font-bold py-2 px-4 rounded-lg"
              >
                확인
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
