"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { addDoc, collection, getDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import Image from 'next/image';
import Link from 'next/link';

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

    if (!sender.trim()) {
      alert('보내는 사람을 입력해주세요.');
      return;
    }
    if (!message.trim()) {
      alert('메시지를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (typeof params.id !== 'string') {
        throw new Error('Invalid tree owner ID');
      }

      const decodedTreeOwnerId = decodeURIComponent(params.id).replace('%3A', ':');

      const messageData = {
        sender: sender.trim(),
        content: message.trim(),
        treeOwnerId: decodedTreeOwnerId,
        createdAt: serverTimestamp(),
        isRead: false,
        envelopeType: selectedEnvelope,
      };

      await addDoc(collection(db, 'messages'), messageData);

      setSubmitSuccess(true);
      setMessage('');
      setSender('');
      
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
    <div className="min-h-screen bg-[#FFF5E1] p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex justify-end">
          <Link
            href="/login"
            className="bg-[#FF4B4B] hover:bg-[#FF6B6B] text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            복주머니 만들기
          </Link>
        </div>

        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-lg border border-[#FFD1D1]">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {ownerName ? `${ownerName}님의 새해 복주머니` : '새해 복주머니'}
          </h1>
          <p className="text-center text-gray-600 mb-6">
            따뜻한 새해 메시지를 남겨보세요
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                봉투 디자인 선택
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ENVELOPE_TYPES.map((envelope) => (
                  <div
                    key={envelope.id}
                    onClick={() => setSelectedEnvelope(envelope.id)}
                    className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden border-2 ${
                      selectedEnvelope === envelope.id
                        ? 'border-[#FF4B4B]'
                        : 'border-transparent'
                    }`}
                  >
                    <div className="w-full h-full relative">
                      <Image
                        src={envelope.src}
                        alt={envelope.alt}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 768px) 33vw, 25vw"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-sm p-4 rounded-lg">
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="보내는 사람"
                className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#FF4B4B] bg-white/70 text-gray-900 mb-2"
                maxLength={20}
              />

              <div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="메시지를 입력하세요"
                  className="w-full h-32 p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#FF4B4B] resize-none bg-white/70 text-gray-900"
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